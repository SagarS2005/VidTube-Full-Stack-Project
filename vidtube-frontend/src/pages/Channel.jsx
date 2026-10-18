import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Users2,
  Video,
  ListVideo,
  MessageSquare,
  Info,
  Mail,
  Edit3,
  LayoutDashboard,
  Check,
  Loader2,
  UserPlus,
} from "lucide-react";
import api from "../api/axios";
import getErrorMessage from "../api/getErrorMessage";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import VideoCard from "../components/VideoCard";
import { formatTimeAgo } from "../utils/formatters";

export default function Channel() {
  const { username } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [channel, setChannel] = useState(null);
  const [activeTab, setActiveTab] = useState("videos");
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [subscribersFetched, setSubscribersFetched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");

    const loadChannelData = async () => {
      try {
        const channelRes = await api.get(`/users/channel/${username}`);
        const ch = channelRes.data.data;

        if (ignore) return;
        setChannel(ch);

        // Fetch videos and playlists for this channel
        const [videosRes, playlistsRes, tweetsRes] = await Promise.all([
          api.get("/videos", { params: { userId: ch._id, limit: 30 } }),
          api.get(`/playlists/user/${ch._id}`),
          api.get(`/tweets/user/${ch._id}`).catch(() => ({ data: { data: [] } })),
        ]);

        if (ignore) return;
        setVideos(videosRes.data.data?.docs || []);
        setPlaylists(playlistsRes.data.data || []);
        setTweets(tweetsRes.data.data || []);
      } catch (err) {
        if (!ignore) {
          setError(getErrorMessage(err, "Channel not found"));
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadChannelData();

    return () => {
      ignore = true;
    };
  }, [username]);

  // Fetch channel subscribers lazily when the tab is opened
  useEffect(() => {
    if (activeTab !== "subscribers" || subscribersFetched || !channel?._id) return;
    setLoadingSubscribers(true);
    api
      .get(`/subscriptions/u/${channel._id}`)
      .then((res) => {
        setSubscribers(res.data.data || []);
        setSubscribersFetched(true);
      })
      .catch(() => {})
      .finally(() => setLoadingSubscribers(false));
  }, [activeTab, subscribersFetched, channel?._id]);

  const isOwner = user?._id && channel?._id && user._id === channel._id;

  const handleToggleSubscribe = async () => {
    if (!user) {
      toast.info("Please sign in to subscribe to this channel");
      navigate("/login");
      return;
    }

    if (!channel?._id || subscribing) return;
    setSubscribing(true);

    const prevSubbed = channel.isSubscribed;
    const prevCount = channel.subscribersCount ?? 0;

    setChannel((prev) => ({
      ...prev,
      isSubscribed: !prevSubbed,
      subscribersCount: prevSubbed ? Math.max(0, prevCount - 1) : prevCount + 1,
    }));

    try {
      await api.post(`/subscriptions/u/${channel._id}`);
      toast.success(prevSubbed ? "Unsubscribed from channel" : "Subscribed to channel!");
    } catch (err) {
      setChannel((prev) => ({
        ...prev,
        isSubscribed: prevSubbed,
        subscribersCount: prevCount,
      }));
      toast.error(getErrorMessage(err, "Failed to update subscription"));
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="center-loader" style={{ minHeight: "400px" }}>
        <Loader2 size={36} className="spinner text-accent" />
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="empty-state-card">
        <h3>Channel Not Found</h3>
        <p className="muted">{error || "This channel does not exist."}</p>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          Browse Videos
        </button>
      </div>
    );
  }

  const avatar =
    channel.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(channel.username)}`;

  return (
    <div className="channel-page">
      {/* Cover Banner */}
      <div className="channel-cover-banner">
        {channel.coverImage ? (
          <img src={channel.coverImage} alt="Channel Cover" className="channel-cover-img" />
        ) : (
          <div className="channel-cover-fallback" />
        )}
      </div>

      {/* Channel Header Profile */}
      <div className="channel-header-card">
        <div className="channel-profile-row">
          <img src={avatar} alt={channel.username} className="avatar avatar-xl channel-avatar-main" />

          <div className="channel-meta-info">
            <h1 className="channel-fullname">{channel.fullName || channel.username}</h1>
            <div className="channel-handle-stats">
              <span className="channel-handle">@{channel.username}</span>
              <span className="dot-separator">•</span>
              <span>{channel.subscribersCount ?? 0} subscribers</span>
              <span className="dot-separator">•</span>
              <span>{channel.channelsSubscribedToCount ?? 0} subscriptions</span>
            </div>
          </div>

          <div className="channel-actions-group">
            {isOwner ? (
              <div className="row" style={{ gap: 8 }}>
                <Link to="/studio" className="btn btn-secondary btn-sm">
                  <LayoutDashboard size={16} /> Creator Studio
                </Link>
                <Link to="/settings" className="btn btn-ghost btn-sm">
                  <Edit3 size={16} /> Customize
                </Link>
              </div>
            ) : (
              <button
                className={`btn btn-subscribe ${channel.isSubscribed ? "btn-subscribed" : "btn-primary"}`}
                onClick={handleToggleSubscribe}
                disabled={subscribing}
              >
                {channel.isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            )}
          </div>
        </div>

        {/* Channel Navigation Tabs */}
        <div className="channel-tabs-row">
          <button
            className={`channel-tab-btn ${activeTab === "videos" ? "active" : ""}`}
            onClick={() => setActiveTab("videos")}
          >
            <Video size={16} /> Videos ({videos.length})
          </button>
          <button
            className={`channel-tab-btn ${activeTab === "playlists" ? "active" : ""}`}
            onClick={() => setActiveTab("playlists")}
          >
            <ListVideo size={16} /> Playlists ({playlists.length})
          </button>
          <button
            className={`channel-tab-btn ${activeTab === "community" ? "active" : ""}`}
            onClick={() => setActiveTab("community")}
          >
            <MessageSquare size={16} /> Community ({tweets.length})
          </button>
          <button
            className={`channel-tab-btn ${activeTab === "subscribers" ? "active" : ""}`}
            onClick={() => setActiveTab("subscribers")}
          >
            <UserPlus size={16} /> Subscribers
            {subscribersFetched && (
              <span style={{ marginLeft: 4, opacity: 0.7 }}>({subscribers.length})</span>
            )}
          </button>
          <button
            className={`channel-tab-btn ${activeTab === "about" ? "active" : ""}`}
            onClick={() => setActiveTab("about")}
          >
            <Info size={16} /> About
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="channel-tab-content">
        {activeTab === "videos" && (
          videos.length === 0 ? (
            <div className="empty-state-card">
              <Video size={40} className="muted" />
              <h4>No videos yet</h4>
              <p className="muted">This channel hasn't uploaded any videos yet.</p>
            </div>
          ) : (
            <div className="video-grid">
              {videos.map((vid) => (
                <VideoCard key={vid._id} video={vid} />
              ))}
            </div>
          )
        )}

        {activeTab === "playlists" && (
          playlists.length === 0 ? (
            <div className="empty-state-card">
              <ListVideo size={40} className="muted" />
              <h4>No playlists found</h4>
              <p className="muted">This creator hasn't published any playlists yet.</p>
            </div>
          ) : (
            <div className="playlist-grid">
              {playlists.map((pl) => (
                <Link to={`/playlist/${pl._id}`} key={pl._id} className="playlist-card-item">
                  <div className="playlist-card-thumb">
                    <img
                      src={
                        pl.videos?.[0]?.thumbnail ||
                        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
                      }
                      alt={pl.name}
                      className="playlist-thumb-img"
                    />
                    <div className="playlist-badge">
                      <ListVideo size={16} />
                      <span>{pl.videos?.length || 0} videos</span>
                    </div>
                  </div>
                  <h4 className="playlist-card-title">{pl.name}</h4>
                  <p className="playlist-card-desc muted">{pl.description || "No description provided."}</p>
                </Link>
              ))}
            </div>
          )
        )}

        {activeTab === "community" && (
          tweets.length === 0 ? (
            <div className="empty-state-card">
              <MessageSquare size={40} className="muted" />
              <h4>No community posts</h4>
              <p className="muted">Check back later for posts and updates from this creator.</p>
            </div>
          ) : (
            <div className="community-feed-list">
              {tweets.map((tweet) => (
                <div key={tweet._id} className="community-post-card">
                  <div className="community-post-header">
                    <img src={avatar} alt="" className="avatar avatar-md" />
                    <div>
                      <strong>{channel.fullName}</strong>
                      <span className="muted" style={{ marginLeft: 8, fontSize: "0.85rem" }}>
                        {formatTimeAgo(tweet.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="community-post-content">{tweet.content}</p>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === "subscribers" && (
          loadingSubscribers ? (
            <div className="center-loader" style={{ minHeight: 260 }}>
              <Loader2 size={30} className="spinner text-accent" />
              <p className="muted">Loading subscribers…</p>
            </div>
          ) : subscribers.length === 0 ? (
            <div className="empty-state-card">
              <Users2 size={40} className="muted" />
              <h4>No subscribers yet</h4>
              <p className="muted">Be the first to subscribe to this channel!</p>
            </div>
          ) : (
            <div className="sub-people-list">
              {subscribers.map((item) => {
                const s = item.subscriberDetails || item;
                if (!s?._id) return null;
                const sAvatar =
                  s.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(s.username || "user")}`;
                return (
                  <div key={s._id} className="sub-person-card">
                    <a href={`/channel/${s.username}`} className="sub-person-avatar-link">
                      <img src={sAvatar} alt={s.username} className="avatar avatar-xl sub-person-avatar" />
                    </a>
                    <div className="sub-person-info">
                      <a href={`/channel/${s.username}`} className="sub-person-name-link">
                        <span className="sub-person-name">{s.fullName || s.username}</span>
                      </a>
                      <span className="sub-person-handle muted">@{s.username}</span>
                    </div>
                    <div className="sub-person-actions">
                      <a href={`/channel/${s.username}`} className="btn btn-ghost btn-sm">View</a>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {activeTab === "about" && (
          <div className="channel-about-card">
            <h3>Channel Details</h3>
            <div className="about-detail-item">
              <Mail size={18} className="muted" />
              <div>
                <strong>Email inquiry:</strong>
                <div>{channel.email || "Not specified"}</div>
              </div>
            </div>
            <div className="about-detail-item">
              <Users2 size={18} className="muted" />
              <div>
                <strong>Audience:</strong>
                <div>{channel.subscribersCount ?? 0} subscribers</div>
              </div>
            </div>
            <div className="about-detail-item">
              <Video size={18} className="muted" />
              <div>
                <strong>Total Videos:</strong>
                <div>{videos.length} videos uploaded</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
