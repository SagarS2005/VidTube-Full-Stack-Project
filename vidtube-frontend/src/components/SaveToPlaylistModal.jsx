import { useEffect, useState } from "react";
import { X, Plus, Check, Loader2, ListPlus } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import getErrorMessage from "../api/getErrorMessage";

export default function SaveToPlaylistModal({ videoId, onClose }) {
  const { user } = useAuth();
  const toast = useToast();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    if (!user?._id) return;
    let ignore = false;

    api
      .get(`/playlists/user/${user._id}`)
      .then((res) => {
        if (!ignore) {
          setPlaylists(res.data.data || []);
        }
      })
      .catch((err) => {
        toast.error(getErrorMessage(err, "Failed to load playlists"));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [user?._id, toast]);

  const toggleVideo = async (playlist) => {
    const isPresent = playlist.videos?.some((v) =>
      typeof v === "object" ? v._id === videoId : v === videoId
    );

    setTogglingId(playlist._id);
    try {
      if (isPresent) {
        await api.patch(`/playlists/remove/${videoId}/${playlist._id}`);
        setPlaylists((prev) =>
          prev.map((p) =>
            p._id === playlist._id
              ? {
                  ...p,
                  videos: p.videos.filter((v) =>
                    typeof v === "object" ? v._id !== videoId : v !== videoId
                  ),
                }
              : p
          )
        );
        toast.info(`Removed from "${playlist.name}"`);
      } else {
        await api.patch(`/playlists/add/${videoId}/${playlist._id}`);
        setPlaylists((prev) =>
          prev.map((p) =>
            p._id === playlist._id
              ? { ...p, videos: [...(p.videos || []), videoId] }
              : p
          )
        );
        toast.success(`Saved to "${playlist.name}"`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update playlist"));
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      const res = await api.post("/playlists", {
        name: name.trim(),
        description: description.trim(),
      });
      const newPlaylist = res.data.data;

      // Automatically add this video to the newly created playlist
      await api.patch(`/playlists/add/${videoId}/${newPlaylist._id}`);
      newPlaylist.videos = [videoId];

      setPlaylists((prev) => [newPlaylist, ...prev]);
      setName("");
      setDescription("");
      setShowCreate(false);
      toast.success(`Created "${newPlaylist.name}" and added video`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create playlist"));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="row" style={{ gap: 8 }}>
            <ListPlus size={20} className="text-accent" />
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Save to playlist</h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="center-loader">
              <Loader2 className="spinner" size={24} />
            </div>
          ) : playlists.length === 0 && !showCreate ? (
            <div className="empty-subtext" style={{ padding: "16px 0" }}>
              <p className="muted">No playlists yet.</p>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowCreate(true)}
              >
                <Plus size={16} /> Create your first playlist
              </button>
            </div>
          ) : (
            <div className="playlist-checklist">
              {playlists.map((playlist) => {
                const isChecked = playlist.videos?.some((v) =>
                  typeof v === "object" ? v._id === videoId : v === videoId
                );
                const isBusy = togglingId === playlist._id;

                return (
                  <label key={playlist._id} className="playlist-check-item">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isBusy}
                      onChange={() => toggleVideo(playlist)}
                    />
                    <span className="playlist-name">{playlist.name}</span>
                    {isBusy && <Loader2 size={14} className="spinner muted" />}
                  </label>
                );
              })}
            </div>
          )}

          {showCreate ? (
            <form onSubmit={handleCreate} className="playlist-create-form">
              <input
                placeholder="Playlist name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
              <textarea
                placeholder="Description (optional)"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="row spread" style={{ marginTop: 6 }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={creating || !name.trim()}
                >
                  {creating ? "Creating..." : "Create & Add"}
                </button>
              </div>
            </form>
          ) : (
            playlists.length > 0 && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 12, width: "100%", justifyContent: "flex-start" }}
                onClick={() => setShowCreate(true)}
              >
                <Plus size={16} /> Create new playlist
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
