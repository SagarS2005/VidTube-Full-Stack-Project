import { useState } from "react";
import { X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import getErrorMessage from "../api/getErrorMessage";

export default function EditVideoModal({ video, onClose, onUpdated }) {
  const toast = useToast();
  const [title, setTitle] = useState(video.title || "");
  const [description, setDescription] = useState(video.description || "");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(video.thumbnail || "");
  const [saving, setSaving] = useState(false);

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      const res = await api.patch(`/videos/${video._id}`, formData);
      toast.success("Video updated successfully");
      if (onUpdated) onUpdated(res.data.data);
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update video"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Edit video details</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body form-stack">
          <div>
            <label className="form-label">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a title that describes your video"
              required
            />
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers about your video"
              required
            />
          </div>

          <div>
            <label className="form-label">Thumbnail</label>
            <div className="thumbnail-upload-box">
              {thumbnailPreview ? (
                <div className="thumbnail-preview-container">
                  <img src={thumbnailPreview} alt="Preview" className="thumbnail-preview-img" />
                  <label className="thumbnail-change-overlay">
                    <Upload size={18} />
                    <span>Change thumbnail</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              ) : (
                <label className="thumbnail-placeholder-label">
                  <ImageIcon size={32} className="muted" />
                  <span className="muted">Upload a high-resolution thumbnail</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="row spread" style={{ marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={16} className="spinner" /> Saving changes...
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
