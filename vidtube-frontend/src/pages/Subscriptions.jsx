import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Users2,
  Check,
  Loader2,
  UserCheck,
  UserPlus,
  Radio,
  RefreshCw,
} from "lucide-react";
import api from "../api/axios";
import getErrorMessage from "../api/getErrorMessage";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

export default function Subscriptions() {
  const toast = useToast();
  const { user } = useAuth();

  // "subscribed" = channels I follow  |  "subscribers" = people who follow me
  const [activeTab, setActiveTab] = useState("subscribed");

  const [channels, setChannels] = useState([]);
  const [subscribers, setSubscribers] = useState([]);

  const [loadingChannels, setLoadingChannels] = useState(true);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [subscribersFetched, setSubscribersFetched] = useState(false);

  const [unsubscribingId, setUnsubscribingId] = useState(null);

  // ── Fetch channels I'm subscribed to ────────────────────────────────────
  useEffect(() => {
    let ignore = false;
    setLoadingChannels(true);

    api
      .get("/subscriptions/subscribed-channels")
      .then((res) => {
        if (!ignore) setChannels(res.data.data || []);
      })
      .catch((err) => {
        toast.error(getErrorMessage(err, "Failed to load subscriptions"));
      })
      .finally(() => {
        if (!ignore) setLoadingChannels(false);
      });

    return () => { ignore = true; };
  }, [toast]);

  // ── Fetch my subscribers (lazy – only when tab is opened) ───────────────
  const fetchMySubscribers = useCallback(() => {
    if (!user?._id) return;
    setLoadingSubscribers(true);

    api
      .get(`/subscriptions/u/${user._id}`)
      .then((res) => {
        setSubscribers(res.data.data || []);
        setSubscribersFetched(true);
      })
      .catch((err) => {
        toast.error(getErrorMessage(err, "Failed to load subscribers"));
      })
      .finally(() => setLoadingSubscribers(false));
  }, [user?._id, toast]);

  useEffect(() => {
    if (activeTab === "subscribers" && !subscribersFetched) {
      fetchMySubscribers();
    }
  }, [activeTab, subscribersFetched, fetchMySubscribers]);

  // ── Unsubscribe handler ──────────────────────────────────────────────────
  const handleUnsubscribe = async (channelId) => {
    setUnsubscribingId(channelId);
    try {
      await api.post(`/subscriptions/u/${channelId}`);
      setChannels((prev) =>
        prev.filter((c) => {
          const id = c.subscribedChannels?._id || c._id;
          return id !== channelId;
        })
      );
      toast.info("Unsubscribed from channel");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not unsubscribe"));
    } finally {
      setUnsubscribingId(null);
    }
  };

  // ── Shared card renderer ─────────────────────────────────────────────────
  const renderPersonCard = (person, showUnsubBtn = false) => {
    const isBusy = unsubscribingId === person._id;
    const avatar =
      person.avatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        person.username || "user"
      )}`;

    return (
      <div key={person._id} className="sub-person-card">
        <Link to={`/channel/${person.username}`} className="sub-person-avatar-link">
          <img
            src={avatar}
            alt={person.username}
            className="avatar avatar-xl sub-person-avatar"
          />
        </Link>

        <div className="sub-person-info">
          <Link to={`/channel/${person.username}`} className="sub-person-name-link">
            <span className="sub-person-name">{person.fullName || person.username}</span>
          </Link>
          <span className="sub-person-handle muted">@{person.username}</span>
        </div>

        <div className="sub-person-actions">
          {showUnsubBtn && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleUnsubscribe(person._id)}
              disabled={isBusy}
              title="Unsubscribe"
            >
              {isBusy ? (
                <Loader2 size={14} className="spinner" />
              ) : (
                <>
                  <Check size={14} /> Subscribed
                </>
              )}
            </button>
          )}
          <Link to={`/channel/${person.username}`} className="btn btn-ghost btn-sm">
            View
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="library-page-container">
      {/* ── Page Header ── */}
      <div className="page-header-row">
        <div className="row" style={{ gap: 12 }}>
          <div className="header-icon-circle">
            <Users2 size={24} className="text-accent" />
          </div>
          <div>
            <h1 className="page-heading">Subscriptions</h1>
            <p className="muted" style={{ margin: 0 }}>
              Manage the channels you follow and see who follows your channel.
            </p>
          </div>
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      <div className="sub-tab-row">
        <button
          className={`sub-tab-btn ${activeTab === "subscribed" ? "active" : ""}`}
          onClick={() => setActiveTab("subscribed")}
        >
          <Radio size={16} />
          Subscribed To
          {channels.length > 0 && (
            <span className="sub-tab-badge">{channels.length}</span>
          )}
        </button>
        <button
          className={`sub-tab-btn ${activeTab === "subscribers" ? "active" : ""}`}
          onClick={() => setActiveTab("subscribers")}
        >
          <UserPlus size={16} />
          My Subscribers
          {subscribersFetched && subscribers.length > 0 && (
            <span className="sub-tab-badge">{subscribers.length}</span>
          )}
        </button>

        {activeTab === "subscribers" && subscribersFetched && (
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginLeft: "auto" }}
            onClick={() => {
              setSubscribersFetched(false);
              fetchMySubscribers();
            }}
            title="Refresh subscribers list"
          >
            <RefreshCw size={14} />
          </button>
        )}
      </div>

      {/* ── SUBSCRIBED TO Tab ── */}
      {activeTab === "subscribed" && (
        <>
          {loadingChannels ? (
            <div className="center-loader" style={{ minHeight: 300 }}>
              <Loader2 size={32} className="spinner text-accent" />
              <p className="muted">Loading subscriptions…</p>
            </div>
          ) : channels.length === 0 ? (
            <div className="empty-state-card">
              <UserCheck size={48} className="muted" />
              <h3>No subscriptions yet</h3>
              <p className="muted">
                Subscribe to your favourite creators to stay updated on their
                latest videos.
              </p>
              <Link to="/" className="btn btn-primary" style={{ marginTop: 12 }}>
                Discover Creators
              </Link>
            </div>
          ) : (
            <div className="sub-people-list">
              {channels.map((item) => {
                const ch = item.subscribedChannels || item;
                if (!ch?._id) return null;
                return renderPersonCard(ch, true);
              })}
            </div>
          )}
        </>
      )}

      {/* ── MY SUBSCRIBERS Tab ── */}
      {activeTab === "subscribers" && (
        <>
          {loadingSubscribers ? (
            <div className="center-loader" style={{ minHeight: 300 }}>
              <Loader2 size={32} className="spinner text-accent" />
              <p className="muted">Loading subscribers…</p>
            </div>
          ) : subscribers.length === 0 ? (
            <div className="empty-state-card">
              <Users2 size={48} className="muted" />
              <h3>No subscribers yet</h3>
              <p className="muted">
                Keep creating great content and your audience will grow!
              </p>
            </div>
          ) : (
            <div className="sub-people-list">
              {subscribers.map((item) => {
                const s = item.subscriberDetails || item;
                if (!s?._id) return null;
                return renderPersonCard(s, false);
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
