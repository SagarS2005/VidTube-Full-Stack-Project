import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload as UploadIcon,
  Video as VideoIcon,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileVideo
} from "lucide-react";
import api from "../api/axios";
import getErrorMessage from "../api/getErrorMessage";
import { useToast } from "../context/ToastContext";

export default function Upload() {
  const navigate = useNavigate();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleThumbnailSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      if (!title) {
        // Automatically default title to clean filename
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setTitle(cleanName);
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      toast.error("Please select a video file to upload");
      return;
    }
    if (!thumbnailFile) {
      toast.error("Please select a thumbnail image");
      return;
    }

    setError("");
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("videoFile", videoFile);
      formData.append("thumbnail", thumbnailFile);

      const res = await api.post("/videos", formData, {
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / (event.total || 1));
          setProgress(percent);
        },
      });

      toast.success("Video published successfully!");
      navigate(`/watch/${res.data.data._id}`);
    } catch (err) {
      setError(getErrorMessage(err, "Upload failed. Please check file format and size."));
      setUploading(false);
    }
  };

  return (
    <div className="upload-page-container">
      <div className="upload-card">
        <div className="upload-card-header">
          <div className="header-icon-circle">
            <UploadIcon size={24} className="text-accent" />
          </div>
          <div>
            <h1 className="page-heading">Upload Video</h1>
            <p className="muted" style={{ margin: 0 }}>
              Publish your video to VidTube and reach viewers worldwide.
            </p>
          </div>
        </div>

        {error && (
          <div className="alert-card alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="upload-form form-stack">
          {/* Video File Picker */}
          <div>
            <label className="form-label">Video File *</label>
            <div className="file-dropzone">
              {videoFile ? (
                <div className="selected-file-row">
                  <FileVideo size={28} className="text-accent" />
                  <div className="grow">
                    <strong>{videoFile.name}</strong>
                    <div className="muted" style={{ fontSize: "0.85rem" }}>
                      {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                    </div>
                  </div>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
                    Change
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoSelect}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              ) : (
                <label className="file-dropzone-inner">
                  <VideoIcon size={36} className="muted" />
                  <span className="dropzone-text">Click to choose a video file (MP4, WebM, MOV)</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoSelect}
                    style={{ display: "none" }}
                    required
                  />
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="form-label">Video Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Building a Modern Web Application"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Description *</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your video, add links, timestamps, or hashtags..."
              required
            />
          </div>

          {/* Thumbnail Picker */}
          <div>
            <label className="form-label">Thumbnail Image *</label>
            <div className="thumbnail-upload-box">
              {thumbnailPreview ? (
                <div className="thumbnail-preview-container">
                  <img src={thumbnailPreview} alt="Preview" className="thumbnail-preview-img" />
                  <label className="thumbnail-change-overlay">
                    <ImageIcon size={18} />
                    <span>Change thumbnail</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailSelect}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              ) : (
                <label className="thumbnail-placeholder-label">
                  <ImageIcon size={32} className="muted" />
                  <span className="muted">Upload video thumbnail (PNG, JPG, WebP)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailSelect}
                    style={{ display: "none" }}
                    required
                  />
                </label>
              )}
            </div>
          </div>

          {/* Progress Indicator */}
          {uploading && (
            <div className="upload-progress-card">
              <div className="row spread">
                <span className="muted" style={{ fontSize: "0.9rem" }}>
                  {progress < 100
                    ? `Uploading to server... ${progress}%`
                    : "Processing & optimizing on Cloudinary..."}
                </span>
                <span className="text-accent" style={{ fontWeight: 600 }}>
                  {progress}%
                </span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="row spread" style={{ marginTop: 12 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={uploading || !videoFile || !thumbnailFile || !title.trim()}
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="spinner" /> Publishing Video...
                </>
              ) : (
                "Publish Video"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
