import { Link, useNavigate } from "react-router-dom";
import { formatDuration, formatViews, formatTimeAgo } from "../utils/formatters";

export default function VideoCard({ video }) {
  const navigate = useNavigate();
  if (!video) return null;

  const owner = video.ownerDetails || video.owner;
  const username = owner?.username || "creator";
  const fullName = owner?.fullName || username;
  const avatar =
    owner?.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`;

  const handleAvatarClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/channel/${username}`);
  };

  return (
    <div className="video-card-item">
      <Link to={`/watch/${video._id}`} className="video-thumbnail-wrapper">
        <img
          src={video.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"}
          alt={video.title}
          className="video-thumbnail-img"
          loading="lazy"
        />
        {video.duration > 0 && (
          <span className="video-duration-badge">
            {formatDuration(video.duration)}
          </span>
        )}
      </Link>

      <div className="video-meta-row">
        <button
          className="video-channel-avatar-btn"
          onClick={handleAvatarClick}
          title={`Visit ${fullName}'s channel`}
        >
          <img src={avatar} alt={username} className="avatar avatar-sm" />
        </button>

        <div className="video-info-col">
          <Link to={`/watch/${video._id}`} className="video-title-link" title={video.title}>
            <h4 className="video-title-text">{video.title}</h4>
          </Link>

          <Link
            to={`/channel/${username}`}
            className="video-channel-name-link"
            title={fullName}
          >
            {fullName}
          </Link>

          <div className="video-stats-text">
            <span>{formatViews(video.views ?? 0)}</span>
            <span className="dot-separator">•</span>
            <span>{formatTimeAgo(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
