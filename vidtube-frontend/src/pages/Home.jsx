import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Sparkles, Video, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import api from "../api/axios";
import getErrorMessage from "../api/getErrorMessage";
import VideoCard from "../components/VideoCard";

const CATEGORIES = [
  "All",
  "Recently Uploaded",
  "Popular",
  "Technology",
  "Tutorials",
  "Gaming",
  "Music",
  "Vlogs",
  "Podcasts"
];

export default function Home() {
  const [params, setParams] = useSearchParams();
  const query = params.get("query") || "";
  const page = Number(params.get("page")) || 1;
  const [activeCategory, setActiveCategory] = useState("All");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    const apiParams = {
      page,
      limit: 12,
    };

    if (query) {
      apiParams.query = query;
    } else if (activeCategory === "Popular") {
      apiParams.sortBy = "views";
      apiParams.sortType = "desc";
    } else if (activeCategory === "Recently Uploaded") {
      apiParams.sortBy = "createdAt";
      apiParams.sortType = "desc";
    }

    api
      .get("/videos", { params: apiParams })
      .then((res) => {
        if (!ignore) {
          setData(res.data.data);
          setError("");
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(getErrorMessage(err, "Could not load videos"));
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [page, query, activeCategory]);

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    if (page !== 1) {
      setParams({ ...(query && { query }), page: 1 });
    }
  };

  const goToPage = (p) => {
    setParams({ ...(query && { query }), page: p });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="home-container">
      {/* Category Pills Bar */}
      <div className="category-chips-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`category-chip ${activeCategory === cat ? "active" : ""}`}
            onClick={() => handleCategoryClick(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Query Notification Banner */}
      {query && (
        <div className="search-status-banner">
          <span>Results for <strong>"{query}"</strong></span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setParams({})}
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="alert-card alert-error">
          <p>{error}</p>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="video-grid">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="video-card-skeleton">
              <div className="skeleton skeleton-thumbnail" />
              <div className="row" style={{ gap: 12, marginTop: 12 }}>
                <div className="skeleton skeleton-avatar" />
                <div className="grow" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="skeleton skeleton-title" />
                  <div className="skeleton skeleton-subtitle" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : data?.docs?.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-icon">
            <Video size={48} className="muted" />
          </div>
          <h3>No videos found</h3>
          <p className="muted">
            {query
              ? `No videos matched "${query}". Try different keywords.`
              : "No videos have been uploaded yet. Be the first creator to share a video!"}
          </p>
          <Link to="/upload" className="btn btn-primary" style={{ marginTop: 16 }}>
            Upload a Video
          </Link>
        </div>
      ) : (
        <>
          <div className="video-grid">
            {data.docs.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>

          {/* Pagination Controls */}
          {data.totalPages > 1 && (
            <div className="pagination-bar">
              <button
                className="btn btn-secondary btn-sm"
                disabled={!data.hasPrevPage}
                onClick={() => goToPage(page - 1)}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="pagination-info muted">
                Page {data.page} of {data.totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={!data.hasNextPage}
                onClick={() => goToPage(page + 1)}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
