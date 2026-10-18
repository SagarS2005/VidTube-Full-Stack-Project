import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  Users2,
  Video as VideoIcon,
  ThumbsUp,
  Plus,
  Edit,
  Trash2,
  Globe,
  Lock,
  Loader2,
  AlertTriangle
} from "lucide-react";
import api from "../api/axios";
import getErrorMessage from "../api/getErrorMessage";
import { useToast } from "../context/ToastContext";
import { formatDuration, formatTimeAgo, formatViews } from "../utils/formatters";
import EditVideoModal from "../components/EditVideoModal";

export default function Studio() {
  const toast = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadStudioData = async () => {
    try {
      const [statsRes, videosRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/videos"),
      ]);
      setStats(statsRes.data.data);
      setVideos(videosRes.data.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load studio metrics"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudioData();
  }, []);

  const handleTogglePublish = async (videoId) => {
    setTogglingId(videoId);
    try {
      const res = await api.patch(`/videos/toggle/publish/${videoId}`);
      const updated = res.data.data;
      setVideos((prev) =>
        prev.map((v) => (v._id === videoId ? { ...v, isPublished: updated.isPublished } : v))
      );
      toast.success(
        updated.isPublished ? "Video is now public" : "Video is now private (unpublished)"
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change visibility"));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Are you sure you want to permanently delete this video?")) {
      return;
    }

    setDeletingId(videoId);
    try {
      await api.delete(`/videos/${videoId}`);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      setStats((prev) =>
        prev ? { ...prev, totalVideos: Math.max(0, prev.totalVideos - 1) } : prev
      );
      toast.success("Video deleted successfully");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete video"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleVideoUpdated = (updatedVideo) => {
    setVideos((prev) =>
      prev.map((v) => (v._id === updatedVideo._id ? { ...v, ...updatedVideo } : v))
    );
  };

  if (loading) {
    return (
      <div className="center-loader" style={{ minHeight: "400px" }}>
        <Loader2 size={36} className="spinner text-accent" />
        <p className="muted">Loading Creator Studio...</p>
      </div>
    );
  }

  return (
    <div className="studio-container">
      {/* Studio Header */}
      <div className="studio-header-row">
        <div>
          <h1 className="studio-title">Channel Dashboard</h1>
          <p className="muted" style={{ margin: 0 }}>
            Manage your content, monitor analytics, and grow your audience.
          </p>
        </div>
        <Link to="/upload" className="btn btn-primary">
          <Plus size={16} /> Upload Video
        </Link>
      </div>

      {/* Analytics Metric Cards */}
      <div className="studio-stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Views</span>
            <div className="stat-icon-badge bg-blue">
              <Eye size={20} />
            </div>
          </div>
          <div className="stat-card-value">{stats?.totalViews?.toLocaleString() ?? 0}</div>
          <span className="stat-card-trend muted">Across all published videos</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Subscribers</span>
            <div className="stat-icon-badge bg-green">
              <Users2 size={20} />
            </div>
          </div>
          <div className="stat-card-value">{stats?.totalSubscribers?.toLocaleString() ?? 0}</div>
          <span className="stat-card-trend muted">Channel followers</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Videos</span>
            <div className="stat-icon-badge bg-purple">
              <VideoIcon size={20} />
            </div>
          </div>
          <div className="stat-card-value">{stats?.totalVideos?.toLocaleString() ?? 0}</div>
          <span className="stat-card-trend muted">Uploaded content</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Likes</span>
            <div className="stat-icon-badge bg-red">
              <ThumbsUp size={20} />
            </div>
          </div>
          <div className="stat-card-value">{stats?.totalLikes?.toLocaleString() ?? 0}</div>
          <span className="stat-card-trend muted">Community appreciation</span>
        </div>
      </div>

      {/* Video Content Management Table */}
      <div className="studio-content-card">
        <div className="studio-content-header">
          <h3 style={{ margin: 0 }}>Channel Content ({videos.length})</h3>
        </div>

        {videos.length === 0 ? (
          <div className="empty-state-card" style={{ padding: "40px 16px" }}>
            <VideoIcon size={44} className="muted" />
            <h4>No uploaded videos yet</h4>
            <p className="muted">Upload your first video to see performance metrics here.</p>
            <Link to="/upload" className="btn btn-primary" style={{ marginTop: 12 }}>
              Upload Video
            </Link>
          </div>
        ) : (
          <div className="studio-table-responsive">
            <table className="studio-table">
              <thead>
                <tr>
                  <th>Video</th>
                  <th>Visibility</th>
                  <th>Date</th>
                  <th>Views</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((vid) => {
                  const isToggling = togglingId === vid._id;
                  const isDeleting = deletingId === vid._id;

                  return (
                    <tr key={vid._id}>
                      <td className="video-cell">
                        <Link to={`/watch/${vid._id}`} className="table-thumb-link">
                          <img
                            src={vid.thumbnail}
                            alt=""
                            className="table-video-thumb"
                          />
                          {vid.duration > 0 && (
                            <span className="table-duration-badge">
                              {formatDuration(vid.duration)}
                            </span>
                          )}
                        </Link>
                        <div className="table-video-info">
                          <Link to={`/watch/${vid._id}`} className="table-video-title">
                            {vid.title}
                          </Link>
                          <span className="table-video-desc muted">
                            {vid.description}
                          </span>
                        </div>
                      </td>

                      <td>
                        <button
                          className={`badge-btn ${vid.isPublished ? "badge-public" : "badge-private"}`}
                          onClick={() => handleTogglePublish(vid._id)}
                          disabled={isToggling}
                          title="Click to toggle Public / Private"
                        >
                          {isToggling ? (
                            <Loader2 size={12} className="spinner" />
                          ) : vid.isPublished ? (
                            <>
                              <Globe size={12} /> Public
                            </>
                          ) : (
                            <>
                              <Lock size={12} /> Private
                            </>
                          )}
                        </button>
                      </td>

                      <td className="muted" style={{ fontSize: "0.88rem" }}>
                        {formatTimeAgo(vid.createdAt)}
                      </td>

                      <td>{vid.views ?? 0}</td>

                      <td>
                        <div className="table-actions-row">
                          <button
                            className="icon-btn"
                            title="Edit details"
                            onClick={() => setEditingVideo(vid)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="icon-btn text-danger"
                            title="Delete permanently"
                            onClick={() => handleDeleteVideo(vid._id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2 size={16} className="spinner" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Video Modal */}
      {editingVideo && (
        <EditVideoModal
          video={editingVideo}
          onClose={() => setEditingVideo(null)}
          onUpdated={handleVideoUpdated}
        />
      )}
    </div>
  );
}
