import { useEffect, useMemo, useState } from "react";
import { BookOpen, Check, ChevronLeft, ChevronRight, Clock3, Eye, Search, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AdminDataTable, SectionTitle, StatCard, StatusBadge } from "./components";
import { fetchAdminStories, fetchAdminStoryDetail, updateAdminStoryStatus } from "@/services/adminApi";

export default function StoriesView() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedStory, setSelectedStory] = useState(null);
  const [storyDetail, setStoryDetail] = useState(null);
  const [storyDetailLoading, setStoryDetailLoading] = useState(false);
  const [storyDetailError, setStoryDetailError] = useState("");
  const [savingStoryIds, setSavingStoryIds] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadStories() {
      try {
        setLoading(true);
        setError("");
        if (!ignore) {
          setStories(await fetchAdminStories());
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message || "Failed to load stories.");
          setStories([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadStories();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedStory) {
      setStoryDetail(null);
      setStoryDetailError("");
      setStoryDetailLoading(false);
      setCurrentPageIndex(0);
      return;
    }

    let ignore = false;

    async function loadStoryDetail() {
      try {
        setStoryDetailLoading(true);
        setStoryDetailError("");
        if (!ignore) {
          setStoryDetail(await fetchAdminStoryDetail(selectedStory.id));
          setCurrentPageIndex(0);
        }
      } catch (loadError) {
        if (!ignore) {
          setStoryDetail(null);
          setStoryDetailError(loadError.message || "Failed to load story pages.");
        }
      } finally {
        if (!ignore) {
          setStoryDetailLoading(false);
        }
      }
    }

    loadStoryDetail();

    return () => {
      ignore = true;
    };
  }, [selectedStory]);

  const currentStoryPage = storyDetail?.pages?.[currentPageIndex] || null;

  async function updateStoryStatus(storyId, nextStatus) {
    setSavingStoryIds((current) => [...current, storyId]);
    setError("");
    setStoryDetailError("");

    try {
      const payload = await updateAdminStoryStatus(storyId, nextStatus);

      setStories((currentStories) =>
        currentStories.map((story) =>
          story.id === storyId
            ? {
                ...story,
                status: payload.status || nextStatus,
                approvedPages: payload.approvedPages ?? story.approvedPages,
                pendingPages: payload.pendingPages ?? story.pendingPages,
                rejectedPages: payload.rejectedPages ?? story.rejectedPages,
              }
            : story
        )
      );

      setSelectedStory((current) =>
        current && current.id === storyId
          ? {
              ...current,
              status: payload.status || nextStatus,
              approvedPages: payload.approvedPages ?? current.approvedPages,
              pendingPages: payload.pendingPages ?? current.pendingPages,
              rejectedPages: payload.rejectedPages ?? current.rejectedPages,
            }
          : current
      );

      setStoryDetail((current) =>
        current && current.id === storyId
          ? {
              ...current,
              status: payload.status || nextStatus,
              approvedPages: payload.approvedPages ?? current.approvedPages,
              pendingPages: payload.pendingPages ?? current.pendingPages,
              rejectedPages: payload.rejectedPages ?? current.rejectedPages,
            }
          : current
      );
    } catch (saveError) {
      const message = saveError.message || "Failed to save story status.";
      setError(message);
      setStoryDetailError(message);
    } finally {
      setSavingStoryIds((current) => current.filter((id) => id !== storyId));
    }
  }

  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      const matchesQuery = [
        story.title,
        story.author,
        story.email,
        story.genre,
        story.style,
        story.childName,
        story.moralLesson,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchesStatus = statusFilter === "All" || story.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter, stories]);

  const storyStats = useMemo(() => {
    const approved = stories.filter((story) => story.status === "Approved").length;
    const pending = stories.filter((story) => story.status === "Pending").length;
    const rejected = stories.filter((story) => story.status === "Rejected").length;

    return [
      { title: "Total Stories", value: String(stories.length), change: `${stories.length} synced`, icon: BookOpen },
      { title: "Pending Review", value: String(pending), change: `${pending} open`, icon: Clock3 },
      { title: "Approved", value: String(approved), change: `${approved} ready`, icon: Check },
      { title: "Rejected", value: String(rejected), change: `${rejected} flagged`, icon: XCircle },
    ];
  }, [stories]);

  const columns = [
    {
      key: "story",
      header: "Story",
      className: "admin-story-column",
      render: (story) => (
        <div className="admin-story-cell">
          {story.coverImage ? (
            <img src={story.coverImage} alt={story.title} className="admin-story-thumb" />
          ) : (
            <div className="admin-story-thumb admin-story-thumb--placeholder">
              {story.title
                .split(" ")
                .slice(0, 2)
                .map((word) => word[0])
                .join("")}
            </div>
          )}
          <div className="admin-story-copy">
            <p className="admin-story-title">{story.title}</p>
            <p className="admin-story-author">{story.author}</p>
          </div>
        </div>
      ),
    },
    { key: "genre", header: "Genre" },
    { key: "storyLength", header: "Length" },
    { key: "style", header: "Style" },
    { key: "pageCount", header: "Pages" },
    { key: "createdAt", header: "Created" },
    {
      key: "status",
      header: "Status",
      render: (story) => <StatusBadge status={story.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (story) => (
        <div className="admin-row-actions">
          <Button
            size="sm"
            variant="outline"
            className="admin-button"
            onClick={() => setSelectedStory(story)}
          >
            <Eye className="admin-icon-sm" /> View More
          </Button>
          <Button
            size="sm"
            className="admin-button"
            onClick={() => updateStoryStatus(story.id, "Approved")}
            disabled={story.status === "Approved" || savingStoryIds.includes(story.id)}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="admin-button admin-button--warning"
            onClick={() => updateStoryStatus(story.id, "Pending")}
            disabled={story.status === "Pending" || savingStoryIds.includes(story.id)}
          >
            Pending
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="admin-button"
            onClick={() => updateStoryStatus(story.id, "Rejected")}
            disabled={story.status === "Rejected" || savingStoryIds.includes(story.id)}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page-stack">
      <SectionTitle title="Stories Management" subtitle="Review generated stories, authors, pages, and approval progress from one place." />

      <div className="admin-stats-grid">
        {storyStats.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      <AdminDataTable
        title="Generated Stories"
        description="Live story records from the backend database with author, page count, and review status."
        filters={
          <>
            <div className="admin-search-field">
              <Search className="admin-search-icon" />
              <Input
                className="admin-search-input"
                placeholder="Search stories..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="admin-filter-row">
              {["All", "Pending", "Approved", "Rejected"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  className="admin-button"
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </>
        }
        columns={columns}
        rows={filteredStories}
        emptyMessage={
          loading
            ? "Loading stories..."
            : error
              ? `Failed to load stories: ${error}`
              : "No stories matched your current search or filter."
        }
      />

      {selectedStory ? (
        <div className="admin-modal-backdrop">
          <div className="admin-modal admin-modal--wide">
            <div className="admin-modal-header">
              <div>
                <p className="admin-modal-label">Story Preview</p>
                <h3 className="admin-modal-title">{selectedStory.title}</h3>
              </div>
              <div className="admin-modal-actions">
                <Button
                  size="sm"
                  className="admin-button"
                  onClick={() => updateStoryStatus(selectedStory.id, "Approved")}
                  disabled={selectedStory.status === "Approved" || savingStoryIds.includes(selectedStory.id)}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="admin-button admin-button--warning"
                  onClick={() => updateStoryStatus(selectedStory.id, "Pending")}
                  disabled={selectedStory.status === "Pending" || savingStoryIds.includes(selectedStory.id)}
                >
                  Pending
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="admin-button"
                  onClick={() => updateStoryStatus(selectedStory.id, "Rejected")}
                  disabled={selectedStory.status === "Rejected" || savingStoryIds.includes(selectedStory.id)}
                >
                  Reject
                </Button>
                <Button variant="outline" size="sm" className="admin-button" onClick={() => setSelectedStory(null)}>
                  <X className="admin-icon-sm" />
                </Button>
              </div>
            </div>

            <div className="admin-modal-body--flush">
              <div className="admin-story-preview-meta">
                <div className="admin-chip-row admin-chip-row--flush">
                  <StatusBadge status={selectedStory.status} />
                  <span className="admin-story-pill">
                    {selectedStory.genre}
                  </span>
                  <span className="admin-story-pill">
                    {selectedStory.storyLength}
                  </span>
                  <span className="admin-story-pill">
                    {selectedStory.pageCount} pages
                  </span>
                </div>
                <div className="admin-story-info-grid">
                  <p><span>Author:</span> {selectedStory.author}</p>
                  <p><span>Email:</span> {selectedStory.email}</p>
                  <p><span>Child:</span> {selectedStory.childName || "Not set"}</p>
                  <p><span>Created:</span> {selectedStory.createdAt}</p>
                </div>
                <div className="admin-story-moral">
                  <p>Moral Lesson</p>
                  <span>{selectedStory.moralLesson}</span>
                </div>
              </div>

              <div className="admin-story-reader-wrap">
                {storyDetailLoading ? (
                  <div className="admin-loading-state">
                    Loading story pages...
                  </div>
                ) : storyDetailError ? (
                  <div className="admin-loading-state">
                    {storyDetailError}
                  </div>
                ) : currentStoryPage ? (
                  <div className="admin-story-reader-shell">
                    <div className="admin-story-book">
                      <div className="admin-story-book-grid">
                        <div className="admin-story-book-media">
                          {currentStoryPage.imageUrl ? (
                            <div className="admin-story-image-frame">
                              <img
                                src={currentStoryPage.imageUrl}
                                alt={`${selectedStory.title} page ${currentStoryPage.pageNumber}`}
                                className="admin-story-page-image"
                              />
                            </div>
                          ) : (
                            <div className="admin-story-image-empty">
                              <BookOpen className="admin-empty-icon" />
                            </div>
                          )}
                        </div>

                        <div className="admin-story-page-copy">
                          <div>
                            <div className="admin-story-page-header">
                              <div>
                                <p className="admin-story-page-count">
                                  Page {currentStoryPage.pageNumber} of {storyDetail.pages.length}
                                </p>
                                <h4>{selectedStory.title}</h4>
                              </div>
                              <StatusBadge status={currentStoryPage.status} />
                            </div>
                            <div className="admin-story-page-rule" />
                            <p className="admin-story-page-text">
                              {currentStoryPage.text}
                            </p>
                          </div>

                          <div className="admin-story-page-footer">
                            <span>{selectedStory.style}</span>
                            <span>{currentStoryPage.moderation}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {storyDetail.pages.length > 1 ? (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="admin-story-nav-button admin-story-nav-button--prev"
                          onClick={() => setCurrentPageIndex((current) => Math.max(current - 1, 0))}
                          disabled={currentPageIndex === 0}
                        >
                          <ChevronLeft className="admin-icon-md" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="admin-story-nav-button admin-story-nav-button--next"
                          onClick={() => setCurrentPageIndex((current) => Math.min(current + 1, storyDetail.pages.length - 1))}
                          disabled={currentPageIndex === storyDetail.pages.length - 1}
                        >
                          <ChevronRight className="admin-icon-md" />
                        </Button>
                      </>
                    ) : null}

                    {storyDetail.pages.length > 1 ? (
                      <div className="admin-story-page-dots">
                        {storyDetail.pages.map((page, index) => (
                          <button
                            key={page.id}
                            type="button"
                            className={`admin-story-page-dot ${index === currentPageIndex ? "is-active" : ""}`}
                            onClick={() => setCurrentPageIndex(index)}
                            aria-label={`Go to page ${page.pageNumber}`}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="admin-loading-state">
                    This story does not have pages yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
