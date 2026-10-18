import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users2, Check, Loader2, Sparkles, UserCheck } from "lucide-react";
import api from "../api/axios";
import getErrorMessage from "../api/getErrorMessage";
import { useToast } from "../context/ToastContext";

export default function Subscriptions() {
  const toast = useToast();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unsubscribingId, setUnsubscribingId] = useState(null);

  useEffect(() => {
    let ignore = false;
    api
      .get("/subscriptions/subscribed-channels")
      .then((res) => {
        if (!ignore) {
          const list = res.data.data || [];
          setChannels(list);
        }
      })
      .catch((err) => {
        toast.error(getErrorMessage(err, "Failed to load subscriptions"));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [toast]);

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

  if (loading) {
    return (
      <div className="center-loader" style={{ minHeight: "400px" }}>
        <Loader2 size={36} className="spinner text-accent" />
        <p className="muted">Loading subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="library-page-container">
      <div className="page-header-row">
        <div className="row" style={{ gap: 12 }}>
          <div className="header-icon-circle">
            <Users2 size={24} className="text-accent" />
          </div>
          <div>
            <h1 className="page-heading">Subscriptions</h1>
            <p className="muted" style={{ margin: 0 }}>
              Channels you follow for new uploads and community updates.
            </p>
          </div>
        </div>
      </div>

      {channels.length === 0 ? (
        <div className="empty-state-card">
          <UserCheck size={48} className="muted" />
          <h3>No subscriptions yet</h3>
          <p className="muted">
            Subscribe to your favorite creators to stay updated on their latest videos.
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 12 }}>
            Discover Creators
          </Link>
        </div>
      ) : (
        <div className="channels-grid">
          {channels.map((item) => {
            const ch = item.subscribedChannels || item;
            if (!ch?._id) return null;

            const isBusy = unsubscribingId === ch._id;
            const avatar =
              ch.avatar ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(ch.username || "creator")}`;

            return (
              <div key={ch._id} className="channel-subscriber-card">
                <Link to={`/channel/${ch.username}`} className="channel-card-avatar-link">
                  <img src={avatar} alt={ch.username} className="avatar avatar-xl" />
                </Link>

                <Link to={`/channel/${ch.username}`} className="channel-card-title-link">
                  <h4 className="channel-card-title">{ch.fullName || ch.username}</h4>
                </Link>
                <div className="channel-card-handle muted">@{ch.username}</div>

                <div className="channel-card-btn-row">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleUnsubscribe(ch._id)}
                    disabled={isBusy}
                  >
                    {isBusy ? (
                      <Loader2 size={14} className="spinner" />
                    ) : (
                      <>
                        <Check size={14} /> Subscribed
                      </>
                    )}
                  </button>
                  <Link to={`/channel/${ch.username}`} className="btn btn-ghost btn-sm">
                    View
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
