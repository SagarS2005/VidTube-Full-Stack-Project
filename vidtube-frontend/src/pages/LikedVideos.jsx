import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ThumbsUp, Play, Loader2, Sparkles } from "lucide-react";
import api from "../api/axios";
import getErrorMessage from "../api/getErrorMessage";
import { useToast } from "../context/ToastContext";
import VideoCard from "../components/VideoCard";

export default function LikedVideos() {
  const toast = useToast();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    api
      .get("/likes/videos")
      .then((res) => {
        if (!ignore) {
          const list = res.data.data || [];
          setVideos(list);
        }
      })
      .catch((err) => {
        toast.error(getErrorMessage(err, "Failed to load liked videos"));
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
        <p className="muted">Loading liked videos...</p>
      </div>
    );
  }

  const firstVideo = videos[0];

  return (
    <div className="library-page-container">
      {/* Banner / Header Card */}
      <div className="collection-hero-card">
        <div className="collection-cover-preview">
          {firstVideo ? (
            <img src={firstVideo.thumbnail} alt="" className="collection-hero-img" />
          ) : (
            <div className="collection-hero-fallback">
              <ThumbsUp size={48} className="text-accent" />
            </div>
          )}
        </div>

        <div className="collection-hero-meta">
          <div className="badge-pill">Collection</div>
          <h1 className="collection-hero-title">Liked Videos</h1>
          <p className="muted" style={{ margin: "4px 0 16px" }}>
            {videos.length} {videos.length === 1 ? "video" : "videos"} • Private to you
          </p>

          {firstVideo && (
            <Link to={`/watch/${firstVideo._id}`} className="btn btn-primary btn-sm">
              <Play size={16} className="fill-current" /> Play All
            </Link>
          )}
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="empty-state-card">
          <ThumbsUp size={48} className="muted" />
          <h3>No liked videos yet</h3>
          <p className="muted">
            Videos you like will be added here so you can easily find them again.
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 12 }}>
            Browse Videos
          </Link>
        </div>
      ) : (
        <div className="video-grid" style={{ marginTop: 24 }}>
          {videos.map((vid) => (
            <VideoCard key={vid._id} video={vid} />
          ))}
        </div>
      )}
    </div>
  );
}
