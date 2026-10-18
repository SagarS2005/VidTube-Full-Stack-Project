import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History as HistoryIcon, Clock, Trash2, Loader2, Play } from "lucide-react";
import api from "../api/axios";
import getErrorMessage from "../api/getErrorMessage";
import { useToast } from "../context/ToastContext";
import { formatDuration, formatTimeAgo, formatViews } from "../utils/formatters";

export default function History() {
  const toast = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    api
      .get("/users/history")
      .then((res) => {
        if (!ignore) {
          // Latest watched video is at the end or reversed
          const list = res.data.data || [];
          setHistory([...list].reverse());
        }
      })
      .catch((err) => {
        toast.error(getErrorMessage(err, "Failed to load watch history"));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [toast]);

  if (loading) {
    return (
      <div className="center-loader" style={{ minHeight: "400px" }}>
        <Loader2 size={36} className="spinner text-accent" />
        <p className="muted">Loading your watch history...</p>
      </div>
    );
  }

  return (
    <div className="library-page-container">
      <div className="page-header-row">
        <div className="row" style={{ gap: 12 }}>
          <div className="header-icon-circle">
            <HistoryIcon size={24} className="text-accent" />
          </div>
          <div>
            <h1 className="page-heading">Watch History</h1>
            <p className="muted" style={{ margin: 0 }}>
              Videos you have watched while signed in.
            </p>
          </div>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="empty-state-card">
          <Clock size={48} className="muted" />
          <h3>Your watch history is empty</h3>
          <p className="muted">
            Videos you watch will show up here so you can easily pick up where you left off.
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 12 }}>
            Explore Videos
          </Link>
        </div>
      ) : (
        <div className="horizontal-video-list">
          {history.map((video) => {
            const owner = video.owner || {};
            return (
              <div key={video._id} className="horizontal-video-item">
                <Link to={`/watch/${video._id}`} className="horizontal-thumb-wrapper">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="horizontal-thumb-img"
                  />
                  {video.duration > 0 && (
                    <span className="video-duration-badge">
                      {formatDuration(video.duration)}
                    </span>
                  )}
                </Link>

                <div className="horizontal-info-col">
                  <Link to={`/watch/${video._id}`} className="horizontal-title-link">
                    <h3 className="horizontal-title">{video.title}</h3>
                  </Link>

                  <div className="horizontal-meta-row">
                    <Link
                      to={`/channel/${owner.username}`}
                      className="horizontal-channel-link"
                    >
                      {owner.fullName || owner.username || "Creator"}
                    </Link>
                    <span className="dot-separator">•</span>
                    <span>{formatViews(video.views ?? 0)}</span>
                  </div>

                  <p className="horizontal-desc-snippet muted">
                    {video.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
