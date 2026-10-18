import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ListVideo, Plus, Trash2, Loader2, Play } from "lucide-react";
import api from "../api/axios";
import getErrorMessage from "../api/getErrorMessage";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Playlists() {
  const { user } = useAuth();
  const toast = useToast();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      const res = await api.post("/playlists", {
        name: name.trim(),
        description: description.trim(),
      });
      setPlaylists((prev) => [res.data.data, ...prev]);
      setName("");
      setDescription("");
      setShowCreate(false);
      toast.success("Playlist created");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create playlist"));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (playlistId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this playlist?")) return;

    setDeletingId(playlistId);
    try {
      await api.delete(`/playlists/${playlistId}`);
      setPlaylists((prev) => prev.filter((p) => p._id !== playlistId));
      toast.info("Playlist deleted");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete playlist"));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="center-loader" style={{ minHeight: "400px" }}>
        <Loader2 size={36} className="spinner text-accent" />
        <p className="muted">Loading playlists...</p>
      </div>
    );
  }

  return (
    <div className="library-page-container">
      <div className="page-header-row">
        <div className="row" style={{ gap: 12 }}>
          <div className="header-icon-circle">
            <ListVideo size={24} className="text-accent" />
          </div>
          <div>
            <h1 className="page-heading">Playlists</h1>
            <p className="muted" style={{ margin: 0 }}>
              Curated collections of your favorite videos.
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreate((prev) => !prev)}
        >
          <Plus size={16} /> New Playlist
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="playlist-create-card">
          <h3 style={{ margin: 0, fontSize: "1.05rem" }}>Create New Playlist</h3>
          <input
            placeholder="Playlist title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <textarea
            placeholder="Description (optional)"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="row spread">
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
              {creating ? "Creating..." : "Create Playlist"}
            </button>
          </div>
        </form>
      )}

      {playlists.length === 0 ? (
        <div className="empty-state-card">
          <ListVideo size={48} className="muted" />
          <h3>No playlists yet</h3>
          <p className="muted">
            Create playlists to organize videos by topic, mood, or series.
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 12 }}
            onClick={() => setShowCreate(true)}
          >
            Create Your First Playlist
          </button>
        </div>
      ) : (
        <div className="playlist-grid" style={{ marginTop: 24 }}>
          {playlists.map((pl) => {
            const firstThumb =
              pl.videos?.[0]?.thumbnail ||
              "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80";
            const videoCount = pl.videos?.length || 0;
            const isDeleting = deletingId === pl._id;

            return (
              <Link to={`/playlist/${pl._id}`} key={pl._id} className="playlist-card-item">
                <div className="playlist-card-thumb">
                  <img src={firstThumb} alt="" className="playlist-thumb-img" />
                  <div className="playlist-badge">
                    <ListVideo size={16} />
                    <span>{videoCount} {videoCount === 1 ? "video" : "videos"}</span>
                  </div>
                  <button
                    className="playlist-delete-hover-btn icon-btn"
                    onClick={(e) => handleDelete(pl._id, e)}
                    disabled={isDeleting}
                    title="Delete playlist"
                  >
                    {isDeleting ? <Loader2 size={14} className="spinner" /> : <Trash2 size={14} />}
                  </button>
                </div>

                <div className="playlist-meta-box">
                  <h4 className="playlist-card-title">{pl.name}</h4>
                  <p className="playlist-card-desc muted">
                    {pl.description || "No description."}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
