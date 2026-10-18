import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ListVideo,
  Play,
  Trash2,
  Share2,
  Loader2,
  AlertCircle
} from "lucide-react";
import api from "../api/axios";
import getErrorMessage from "../api/getErrorMessage";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatDuration, formatTimeAgo, formatViews } from "../utils/formatters";

export default function PlaylistDetail() {
  const { playlistId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingVideoId, setRemovingVideoId] = useState(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    api
      .get(`/playlists/${playlistId}`)
      .then((res) => {
        if (!ignore) {
          setPlaylist(res.data.data);
          setError("");
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(getErrorMessage(err, "Playlist could not be loaded"));
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [playlistId]);

  const isOwner = user?._id && playlist?.owner?._id && user._id === playlist.owner._id;

  const handleRemoveVideo = async (videoId) => {
    setRemovingVideoId(videoId);
    try {
      await api.patch(`/playlists/remove/${videoId}/${playlistId}`);
      setPlaylist((prev) => ({
        ...prev,
        videos: prev.videos.filter((v) => v._id !== videoId),
      }));
      toast.info("Video removed from playlist");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to remove video"));
    } finally {
      setRemovingVideoId(null);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm("Are you sure you want to delete this entire playlist?")) return;

    try {
      await api.delete(`/playlists/${playlistId}`);
      toast.success("Playlist deleted");
      navigate("/playlists");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete playlist"));
    }
  };

  if (loading) {
    return (
      <div className="center-loader" style={{ minHeight: "400px" }}>
        <Loader2 size={36} className="spinner text-accent" />
        <p className="muted">Loading playlist...</p>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="empty-state-card">
        <AlertCircle size={48} className="text-danger" />
        <h3>Playlist Not Found</h3>
        <p className="muted">{error || "This playlist doesn't exist or is private."}</p>
        <Link to="/playlists" className="btn btn-primary" style={{ marginTop: 12 }}>
          Back to Playlists
        </Link>
      </div>
    );
  }

  const videos = playlist.videos || [];
  const firstVideo = videos[0];

  return (
    <div className="playlist-detail-layout">
      {/* Sidebar Overview Card */}
      <div className="playlist-hero-card">
        <div className="playlist-cover-box">
          {firstVideo ? (
            <img src={firstVideo.thumbnail} alt="" className="playlist-hero-img" />
          ) : (
            <div className="playlist-hero-fallback">
              <ListVideo size={48} className="text-accent" />
            </div>
          )}
        </div>

        <div className="playlist-detail-meta">
          <h1 className="playlist-title-main">{playlist.name}</h1>
          <div className="playlist-owner-row">
            <span className="muted">Created by</span>{" "}
            <strong>{playlist.owner?.fullName || playlist.owner?.username || "User"}</strong>
          </div>
          <p className="playlist-desc-text muted">
            {playlist.description || "No description provided."}
          </p>

          <div className="playlist-stats-info muted">
            <span>{videos.length} {videos.length === 1 ? "video" : "videos"}</span>
            <span className="dot-separator">•</span>
            <span>Updated {formatTimeAgo(playlist.updatedAt)}</span>
          </div>

          <div className="playlist-hero-actions">
            {firstVideo && (
              <Link to={`/watch/${firstVideo._id}`} className="btn btn-primary btn-sm grow">
                <Play size={16} className="fill-current" /> Play All
              </Link>
            )}

            {isOwner && (
              <button
                className="btn btn-ghost btn-sm text-danger"
                onClick={handleDeletePlaylist}
                title="Delete playlist"
              >
                <Trash2 size={16} /> Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Videos List */}
      <div className="playlist-videos-column">
        {videos.length === 0 ? (
          <div className="empty-state-card">
            <ListVideo size={40} className="muted" />
            <h4>This playlist has no videos</h4>
            <p className="muted">
              Add videos by browsing and clicking the "Save" button on any video page.
            </p>
            <Link to="/" className="btn btn-secondary btn-sm" style={{ marginTop: 8 }}>
              Explore Videos
            </Link>
          </div>
        ) : (
          <div className="playlist-tracks-list">
            {videos.map((vid, idx) => {
              const isRemoving = removingVideoId === vid._id;
              const owner = vid.owner || {};

              return (
                <div key={vid._id} className="playlist-track-row">
                  <span className="track-number muted">{idx + 1}</span>

                  <Link to={`/watch/${vid._id}`} className="track-thumb-box">
                    <img src={vid.thumbnail} alt="" className="track-thumb-img" />
                    {vid.duration > 0 && (
                      <span className="table-duration-badge">
                        {formatDuration(vid.duration)}
                      </span>
                    )}
                  </Link>

                  <div className="track-info-col">
                    <Link to={`/watch/${vid._id}`} className="track-title-link">
                      {vid.title}
                    </Link>
                    <div className="track-channel-row muted">
                      <Link to={`/channel/${owner.username}`}>
                        {owner.fullName || owner.username || "Creator"}
                      </Link>
                      <span className="dot-separator">•</span>
                      <span>{formatViews(vid.views ?? 0)}</span>
                    </div>
                  </div>

                  {isOwner && (
                    <button
                      className="icon-btn text-danger"
                      onClick={() => handleRemoveVideo(vid._id)}
                      disabled={isRemoving}
                      title="Remove from playlist"
                    >
                      {isRemoving ? <Loader2 size={16} className="spinner" /> : <Trash2 size={16} />}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
