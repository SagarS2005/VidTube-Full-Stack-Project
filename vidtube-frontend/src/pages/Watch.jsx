import { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ThumbsUp,
  Share2,
  BookmarkPlus,
  Send,
  MoreVertical,
  Trash2,
  Edit2,
  Check,
  Eye,
  Calendar,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from "lucide-react";
import api from "../api/axios";
import getErrorMessage from "../api/getErrorMessage";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatTimeAgo, formatViews } from "../utils/formatters";
import SaveToPlaylistModal from "../components/SaveToPlaylistModal";
import VideoCard from "../components/VideoCard";

export default function Watch() {
  const { videoId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Like & Subscribe states
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [subscribing, setSubscribing] = useState(false);
  const [liking, setLiking] = useState(false);

  // Comments state
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  // Modals & UI states
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");

    const loadData = async () => {
      try {
        // Load video, comments, and recommendations
        const [videoRes, commentsRes, recsRes] = await Promise.all([
          api.get(`/videos/${videoId}`),
          api.get(`/comments/${videoId}`),
          api.get("/videos", { params: { limit: 10 } }),
        ]);

        if (ignore) return;

        const v = videoRes.data.data;
        setVideo(v);
        setIsLiked(Boolean(v.isLiked));
        setLikesCount(v.likesCount ?? 0);
        setIsSubscribed(Boolean(v.isSubscribed));
        setSubscribersCount(v.subscribersCount ?? 0);

        const comms = Array.isArray(commentsRes.data.data)
          ? commentsRes.data.data
          : commentsRes.data.data?.docs ?? [];
        setComments(comms);

        const recs = (recsRes.data.data?.docs || []).filter(
          (item) => item._id !== videoId
        );
        setRecommendations(recs);
      } catch (err) {
        if (!ignore) {
          setError(getErrorMessage(err, "Video not found or could not be loaded"));
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadData();
    window.scrollTo({ top: 0, behavior: "smooth" });

    return () => {
      ignore = true;
    };
  }, [videoId]);

  const owner = video?.ownerDetails || video?.owner;
  const isVideoOwner = user?._id && owner?._id && user._id === owner._id;

  const handleToggleLike = async () => {
    if (!user) {
      toast.info("Please sign in to like this video");
      navigate("/login");
      return;
    }

    if (liking) return;
    setLiking(true);

    const prevLiked = isLiked;
    const prevCount = likesCount;

    // Optimistic update
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await api.post(`/likes/toggle/v/${videoId}`);
      if (res.data.data?.isLiked !== undefined) {
        setIsLiked(res.data.data.isLiked);
        if (res.data.data.likesCount !== undefined) {
          setLikesCount(res.data.data.likesCount);
        }
      }
    } catch (err) {
      // Revert on failure
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error(getErrorMessage(err, "Failed to update like"));
    } finally {
      setLiking(false);
    }
  };

  const handleToggleSubscribe = async () => {
    if (!user) {
      toast.info("Please sign in to subscribe to this channel");
      navigate("/login");
      return;
    }

    if (!owner?._id || subscribing) return;
    setSubscribing(true);

    const prevSubbed = isSubscribed;
    const prevCount = subscribersCount;

    // Optimistic update
    setIsSubscribed(!prevSubbed);
    setSubscribersCount(prevSubbed ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      await api.post(`/subscriptions/u/${owner._id}`);
      toast.success(prevSubbed ? "Unsubscribed from channel" : "Subscribed to channel!");
    } catch (err) {
      setIsSubscribed(prevSubbed);
      setSubscribersCount(prevCount);
      toast.error(getErrorMessage(err, "Failed to update subscription"));
    } finally {
      setSubscribing(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Video link copied to clipboard!");
    } else {
      toast.info("Share this URL: " + window.location.href);
    }
  };

  const handleOpenPlaylistModal = () => {
    if (!user) {
      toast.info("Please sign in to save videos to playlists");
      navigate("/login");
      return;
    }
    setShowPlaylistModal(true);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info("Please sign in to comment");
      navigate("/login");
      return;
    }

    if (!commentText.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/comments/${videoId}`, {
        comment: commentText.trim(),
      });
      const newComment = res.data.data;
      // Ensure owner object is populated
      if (!newComment.owner?.username) {
        newComment.owner = {
          _id: user._id,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar,
        };
      }
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
      toast.success("Comment posted");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to post comment"));
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.info("Comment deleted");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete comment"));
    }
  };

  const handleStartEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditCommentText(comment.content);
  };

  const handleSaveEditComment = async (commentId) => {
    if (!editCommentText.trim()) return;

    try {
      await api.patch(`/comments/${commentId}`, {
        newComment: editCommentText.trim(),
      });
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, content: editCommentText.trim() } : c
        )
      );
      setEditingCommentId(null);
      toast.success("Comment updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update comment"));
    }
  };

  if (loading) {
    return (
      <div className="watch-loading-state">
        <Loader2 size={36} className="spinner text-accent" />
        <p className="muted">Loading video player...</p>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="empty-state-card">
        <AlertCircle size={48} className="text-danger" />
        <h2>Video Unavailable</h2>
        <p className="muted">{error || "This video could not be found or has been removed."}</p>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          Return to Home
        </button>
      </div>
    );
  }

  const creatorAvatar =
    owner?.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(owner?.username || "creator")}`;

  return (
    <div className="watch-layout">
      {/* Primary Video Column */}
      <div className="watch-primary-column">
        {/* Responsive Video Frame */}
        <div className="video-player-container">
          <video
            src={video.videoFile}
            poster={video.thumbnail}
            controls
            autoPlay
            playsInline
            className="video-player-element"
          />
        </div>

        {/* Video Title */}
        <h1 className="watch-video-title">{video.title}</h1>

        {/* Action Row: Creator Info & Interaction Buttons */}
        <div className="watch-action-bar">
          <div className="watch-creator-group">
            <Link to={`/channel/${owner?.username}`} className="creator-avatar-link">
              <img src={creatorAvatar} alt={owner?.username} className="avatar avatar-lg" />
            </Link>

            <div className="creator-info-text">
              <Link to={`/channel/${owner?.username}`} className="creator-name-link">
                <strong>{owner?.fullName || owner?.username || "Creator"}</strong>
              </Link>
              <span className="creator-subs-count muted">
                {subscribersCount} {subscribersCount === 1 ? "subscriber" : "subscribers"}
              </span>
            </div>

            {!isVideoOwner && (
              <button
                className={`btn btn-subscribe ${isSubscribed ? "btn-subscribed" : "btn-primary"}`}
                onClick={handleToggleSubscribe}
                disabled={subscribing}
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            )}
          </div>

          <div className="watch-buttons-group">
            <button
              className={`btn btn-chip ${isLiked ? "btn-chip-active" : ""}`}
              onClick={handleToggleLike}
              disabled={liking}
              title="I like this"
            >
              <ThumbsUp size={18} className={isLiked ? "fill-current" : ""} />
              <span>{likesCount}</span>
            </button>

            <button
              className="btn btn-chip"
              onClick={handleOpenPlaylistModal}
              title="Save to playlist"
            >
              <BookmarkPlus size={18} />
              <span>Save</span>
            </button>

            <button className="btn btn-chip" onClick={handleShare} title="Share video">
              <Share2 size={18} />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Description Box */}
        <div
          className={`watch-description-box ${descriptionExpanded ? "expanded" : "collapsed"}`}
          onClick={() => setDescriptionExpanded((prev) => !prev)}
        >
          <div className="description-meta-stats">
            <strong>{formatViews(video.views ?? 0)}</strong>
            <span className="dot-separator">•</span>
            <span>{formatTimeAgo(video.createdAt)}</span>
          </div>

          <p className="description-text">{video.description}</p>

          <button
            className="description-expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              setDescriptionExpanded((prev) => !prev);
            }}
          >
            {descriptionExpanded ? (
              <>Show less <ChevronUp size={14} /></>
            ) : (
              <>Show more <ChevronDown size={14} /></>
            )}
          </button>
        </div>

        {/* Comments Section */}
        <section className="watch-comments-section">
          <div className="comments-header-row">
            <h3 className="comments-count-heading">
              {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
            </h3>
          </div>

          {/* Add Comment Input */}
          <form className="comment-create-form" onSubmit={handleAddComment}>
            <img
              src={
                user?.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.username || "guest")}`
              }
              alt=""
              className="avatar avatar-md"
            />
            <div className="comment-input-wrapper">
              <textarea
                placeholder={user ? "Add a public comment..." : "Sign in to join the conversation..."}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={1}
                className="comment-textarea"
                onFocus={() => {
                  if (!user) {
                    toast.info("Please sign in to comment");
                    navigate("/login");
                  }
                }}
              />
              {commentText.trim() && (
                <div className="comment-actions-row">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setCommentText("")}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={submittingComment || !commentText.trim()}
                  >
                    {submittingComment ? "Posting..." : "Comment"}
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Comments List */}
          <div className="comments-list">
            {comments.map((comment) => {
              const commenter = comment.owner || {};
              const commenterAvatar =
                commenter.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(commenter.username || "user")}`;
              const canDelete =
                user && (commenter._id === user._id || isVideoOwner);
              const canEdit = user && commenter._id === user._id;

              const isEditing = editingCommentId === comment._id;

              return (
                <div key={comment._id} className="comment-item">
                  <Link to={`/channel/${commenter.username}`}>
                    <img
                      src={commenterAvatar}
                      alt={commenter.username}
                      className="avatar avatar-md"
                    />
                  </Link>

                  <div className="comment-content-col">
                    <div className="comment-author-meta">
                      <Link
                        to={`/channel/${commenter.username}`}
                        className="comment-username-link"
                      >
                        @{commenter.username || "user"}
                      </Link>
                      <span className="comment-timestamp muted">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="comment-edit-box">
                        <textarea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          rows={2}
                          className="comment-textarea"
                          autoFocus
                        />
                        <div className="row spread" style={{ marginTop: 8 }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setEditingCommentId(null)}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleSaveEditComment(comment._id)}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="comment-body-text">{comment.content}</p>
                    )}

                    {!isEditing && (canEdit || canDelete) && (
                      <div className="comment-toolbar">
                        {canEdit && (
                          <button
                            className="comment-tool-btn"
                            onClick={() => handleStartEditComment(comment)}
                            title="Edit comment"
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            className="comment-tool-btn text-danger"
                            onClick={() => handleDeleteComment(comment._id)}
                            title="Delete comment"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Sidebar: Up Next / Recommended Videos */}
      <aside className="watch-secondary-column">
        <h4 className="recommendations-heading">Related Videos</h4>
        <div className="recommendations-list">
          {recommendations.length === 0 ? (
            <p className="muted" style={{ fontSize: "0.9rem" }}>No other videos available yet.</p>
          ) : (
            recommendations.map((rec) => (
              <VideoCard key={rec._id} video={rec} />
            ))
          )}
        </div>
      </aside>

      {/* Save to Playlist Modal */}
      {showPlaylistModal && (
        <SaveToPlaylistModal
          videoId={videoId}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </div>
  );
}
