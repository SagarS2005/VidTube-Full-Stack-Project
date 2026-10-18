import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Send,
  ThumbsUp,
  Trash2,
  Loader2,
  Sparkles
} from "lucide-react";
import api from "../api/axios";
import getErrorMessage from "../api/getErrorMessage";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatTimeAgo } from "../utils/formatters";

export default function Community() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    let ignore = false;
    api
      .get("/tweets")
      .then((res) => {
        if (!ignore) {
          setTweets(res.data.data || []);
        }
      })
      .catch((err) => {
        toast.error(getErrorMessage(err, "Failed to load community feed"));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [toast]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info("Please sign in to publish a community post");
      navigate("/login");
      return;
    }

    if (!content.trim() || posting) return;

    setPosting(true);
    try {
      const res = await api.post("/tweets", { content: content.trim() });
      const newTweet = res.data.data;
      if (!newTweet.owner?.username) {
        newTweet.owner = {
          _id: user._id,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar,
        };
      }
      newTweet.likesCount = 0;
      newTweet.isLiked = false;

      setTweets((prev) => [newTweet, ...prev]);
      setContent("");
      toast.success("Post published to community");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to publish post"));
    } finally {
      setPosting(false);
    }
  };

  const handleToggleLike = async (tweetId) => {
    if (!user) {
      toast.info("Please sign in to like posts");
      navigate("/login");
      return;
    }

    setTogglingId(tweetId);
    try {
      const res = await api.post(`/likes/toggle/t/${tweetId}`);
      const data = res.data.data;
      setTweets((prev) =>
        prev.map((t) =>
          t._id === tweetId
            ? { ...t, isLiked: data.isLiked, likesCount: data.likesCount }
            : t
        )
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not like post"));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeletePost = async (tweetId) => {
    if (!window.confirm("Delete this post?")) return;

    try {
      await api.delete(`/tweets/${tweetId}`);
      setTweets((prev) => prev.filter((t) => t._id !== tweetId));
      toast.info("Post deleted");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete post"));
    }
  };

  if (loading) {
    return (
      <div className="center-loader" style={{ minHeight: "400px" }}>
        <Loader2 size={36} className="spinner text-accent" />
        <p className="muted">Loading community posts...</p>
      </div>
    );
  }

  return (
    <div className="community-page-container">
      <div className="page-header-row">
        <div className="row" style={{ gap: 12 }}>
          <div className="header-icon-circle">
            <MessageSquare size={24} className="text-accent" />
          </div>
          <div>
            <h1 className="page-heading">Community Feed</h1>
            <p className="muted" style={{ margin: 0 }}>
              Updates, thoughts, and conversations from creators.
            </p>
          </div>
        </div>
      </div>

      {/* Post Creator Box */}
      {user ? (
        <form onSubmit={handleCreatePost} className="community-post-box">
          <div className="row" style={{ alignItems: "flex-start", gap: 12 }}>
            <img
              src={
                user.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.username)}`
              }
              alt=""
              className="avatar avatar-md"
            />
            <div className="grow">
              <textarea
                placeholder="Share an update or question with your community..."
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="community-textarea"
              />
              <div className="row spread" style={{ marginTop: 8 }}>
                <span className="muted" style={{ fontSize: "0.85rem" }}>
                  Publicly visible on the community feed
                </span>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={posting || !content.trim()}
                >
                  {posting ? (
                    <Loader2 size={16} className="spinner" />
                  ) : (
                    <>
                      <Send size={14} /> Post
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="community-signin-prompt">
          <p className="muted">Sign in to share updates and interact with creator posts.</p>
          <Link to="/login" className="btn btn-primary btn-sm">
            Sign In
          </Link>
        </div>
      )}

      {/* Feed List */}
      {tweets.length === 0 ? (
        <div className="empty-state-card" style={{ marginTop: 24 }}>
          <MessageSquare size={48} className="muted" />
          <h3>No community posts yet</h3>
          <p className="muted">Be the first to start a conversation in the community!</p>
        </div>
      ) : (
        <div className="community-posts-list">
          {tweets.map((tweet) => {
            const author = tweet.owner || {};
            const isAuthor = user?._id && author._id && user._id === author._id;
            const authorAvatar =
              author.avatar ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(author.username || "user")}`;

            return (
              <div key={tweet._id} className="community-card-item">
                <div className="community-card-header">
                  <Link to={`/channel/${author.username}`}>
                    <img src={authorAvatar} alt="" className="avatar avatar-md" />
                  </Link>

                  <div className="community-author-meta grow">
                    <Link
                      to={`/channel/${author.username}`}
                      className="community-author-name"
                    >
                      {author.fullName || author.username || "Creator"}
                    </Link>
                    <span className="muted" style={{ marginLeft: 8, fontSize: "0.85rem" }}>
                      @{author.username} • {formatTimeAgo(tweet.createdAt)}
                    </span>
                  </div>

                  {isAuthor && (
                    <button
                      className="icon-btn text-danger"
                      onClick={() => handleDeletePost(tweet._id)}
                      title="Delete post"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <p className="community-card-content">{tweet.content}</p>

                <div className="community-card-actions">
                  <button
                    className={`btn-chip-sm ${tweet.isLiked ? "active" : ""}`}
                    onClick={() => handleToggleLike(tweet._id)}
                    disabled={togglingId === tweet._id}
                  >
                    <ThumbsUp size={14} className={tweet.isLiked ? "fill-current" : ""} />
                    <span>{tweet.likesCount || 0}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
