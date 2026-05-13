import { useEffect, useMemo, useState } from "react";
import { Check, Filter, Image as ImageIcon, Search, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AdminDataTable, SectionTitle, StatusBadge, StatCard } from "./components";
import { fetchAdminImages, updateAdminImageStatus } from "@/services/adminApi";
import "@/styles/AdminImagesView.css";

function getModerationClass(moderation) {
  if (moderation === "Safe") {
    return "images-moderation-badge images-moderation-badge--safe";
  }

  if (moderation === "Flagged") {
    return "images-moderation-badge images-moderation-badge--flagged";
  }

  return "images-moderation-badge images-moderation-badge--review";
}

export default function ImagesView() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingIds, setSavingIds] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showAllRows, setShowAllRows] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadImages() {
      try {
        setLoading(true);
        setError("");
        if (!ignore) {
          setImages(await fetchAdminImages());
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message || "Failed to load story images.");
          setImages([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadImages();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!images.length) {
      setSelectedImage(null);
      setPreviewOpen(false);
      return;
    }

    setSelectedImage((current) => current && images.some((image) => image.id === current.id)
      ? images.find((image) => image.id === current.id) || current
      : images[0]);
  }, [images]);

  async function updateImageStatus(imageId, nextStatus) {
    setSavingIds((current) => [...current, imageId]);
    setError("");

    try {
      const result = await updateAdminImageStatus(imageId, nextStatus);
      setImages((currentImages) =>
        currentImages.map((image) =>
          image.id === imageId
            ? {
                ...image,
                status: result.status || nextStatus,
                moderation: result.moderation || (nextStatus === "Rejected" ? "Flagged" : nextStatus === "Approved" ? "Safe" : "Review"),
              }
            : image
        )
      );
    } catch (saveError) {
      setError(saveError.message || "Failed to save image status.");
    } finally {
      setSavingIds((current) => current.filter((id) => id !== imageId));
    }
  }

  const filteredImages = useMemo(() => {
    return images.filter((image) => {
      const matchesQuery = [image.story, image.user, image.email, image.style, image.prompt, image.childName]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchesStatus = statusFilter === "All" || image.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [images, query, statusFilter]);

  const visibleImages = useMemo(() => (
    showAllRows ? filteredImages : filteredImages.slice(0, 5)
  ), [filteredImages, showAllRows]);

  function openImagePreview(image) {
    setSelectedImage(image);
    setPreviewOpen(true);
  }

  const imageStats = useMemo(() => {
    const approved = images.filter((image) => image.status === "Approved").length;
    const pending = images.filter((image) => image.status === "Pending").length;
    const rejected = images.filter((image) => image.status === "Rejected").length;
    const totalCredits = images.reduce((sum, image) => sum + image.credits, 0);

    return [
      { title: "Total Images", value: String(images.length), change: `${Math.max(images.length, 0)} synced`, icon: ImageIcon },
      { title: "Pending Review", value: String(pending), change: pending ? `${pending} open` : "0 open", icon: Filter },
      { title: "Approved", value: String(approved), change: approved ? `${approved} ready` : "0 ready", icon: Check },
      { title: "Credits Used", value: String(totalCredits), change: rejected ? `${rejected} blocked` : "0 blocked", icon: Sparkles },
    ];
  }, [images]);

  const columns = [
    {
      key: "preview",
      header: "Preview",
      render: (image) => (
        <div className="images-preview-cell">
          {image.imageUrl ? (
            <img src={image.imageUrl} alt={image.story} className="images-preview-thumb" />
          ) : (
            <div className="images-preview-placeholder">
              {image.story
                .split(" ")
                .slice(0, 2)
                .map((word) => word[0])
                .join("")}
            </div>
          )}
          <div className="images-preview-copy">
            <p className="images-preview-title">{image.story}</p>
            <p className="images-preview-user">{image.user}</p>
          </div>
        </div>
      ),
    },
    {
      key: "prompt",
      header: "Prompt",
      className: "images-prompt-column",
      render: (image) => <p className="images-prompt-text">{image.prompt}</p>,
    },
    { key: "style", header: "Style" },
    { key: "pageNumber", header: "Page" },
    { key: "size", header: "Size" },
    { key: "credits", header: "Credits" },
    { key: "createdAt", header: "Created" },
    {
      key: "moderation",
      header: "Moderation",
      render: (image) => (
        <span className={getModerationClass(image.moderation)}>
          {image.moderation}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (image) => <StatusBadge status={image.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (image) => (
        <div className="images-actions">
          <Button
            size="sm"
            variant="outline"
            className="images-action-button"
            onClick={() => openImagePreview(image)}
          >
            View More
          </Button>
          <Button
            size="sm"
            className="images-action-button"
            onClick={() => updateImageStatus(image.id, "Approved")}
            disabled={image.status === "Approved" || savingIds.includes(image.id)}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="images-action-button images-action-button--pending"
            onClick={() => updateImageStatus(image.id, "Pending")}
            disabled={image.status === "Pending" || savingIds.includes(image.id)}
          >
            Pending
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="images-action-button"
            onClick={() => updateImageStatus(image.id, "Rejected")}
            disabled={image.status === "Rejected" || savingIds.includes(image.id)}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="images-admin-page">
      <SectionTitle title="Images Management" subtitle="Review generations, track credit usage, and moderate unsafe or low-quality image output." />

      <div className="images-stats-grid">
        {imageStats.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      <div className="images-content-grid">
        <div className="images-table-stack">
          <AdminDataTable
            title="Generated Images"
            description="Live image records from story pages in the backend database."
            filters={
              <>
                <div className="images-search-field">
                  <Search className="images-search-icon" />
                  <Input
                    className="images-search-input"
                    placeholder="Search images..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
                <div className="images-filter-row">
                  {["All", "Pending", "Approved", "Rejected"].map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? "default" : "outline"}
                      className="images-filter-button"
                      onClick={() => setStatusFilter(status)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </>
            }
            columns={columns}
            rows={visibleImages}
            emptyMessage={
              loading
                ? "Loading story images..."
                : error
                  ? `Failed to load story images: ${error}`
                  : "No images matched your current search or filter."
            }
          />

          {filteredImages.length > 5 ? (
            <div className="images-show-more-row">
              <Button
                variant="outline"
                className="images-action-button"
                onClick={() => setShowAllRows((current) => !current)}
              >
                {showAllRows ? "Show Less" : `Show More (${filteredImages.length - 5} more)`}
              </Button>
            </div>
          ) : null}
        </div>

        <div className="images-side-panel">
          <Card className="images-card">
            <CardContent className="images-card-content">
              <div className="images-panel-header">
                <div>
                  <p className="images-panel-label">Review Queue</p>
                  <h3 className="images-panel-title">
                    {images.filter((image) => image.status === "Pending").length} waiting
                  </h3>
                </div>
                <div className="images-panel-icon images-panel-icon--review">
                  <Filter className="images-icon" />
                </div>
              </div>

              <div className="images-queue-list">
                {images
                  .filter((image) => image.status === "Pending")
                  .map((image) => (
                    <div key={image.id} className="images-queue-item">
                      <div className="images-queue-header">
                        <div>
                          <p className="images-queue-title">{image.story}</p>
                          <p className="images-queue-user">{image.user}</p>
                        </div>
                        <StatusBadge status={image.status} />
                      </div>
                      <p className="images-queue-prompt">{image.prompt}</p>
                      <div className="images-queue-actions">
                        <Button
                          size="sm"
                          variant="outline"
                          className="images-action-button images-action-button--fluid"
                          onClick={() => openImagePreview(image)}
                        >
                          View More
                        </Button>
                        <Button
                          size="sm"
                          className="images-action-button images-action-button--fluid"
                          onClick={() => updateImageStatus(image.id, "Approved")}
                          disabled={savingIds.includes(image.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="images-action-button images-action-button--fluid images-action-button--pending"
                          onClick={() => updateImageStatus(image.id, "Pending")}
                          disabled={savingIds.includes(image.id)}
                        >
                          Pending
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="images-action-button images-action-button--fluid"
                          onClick={() => updateImageStatus(image.id, "Rejected")}
                          disabled={savingIds.includes(image.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="images-card">
            <CardContent className="images-card-content">
              <p className="images-panel-label">Moderation Signals</p>
              <div className="images-signal-list">
                <div className="images-signal-item">
                  <div className="images-signal-row">
                    <span className="images-signal-label">Safe Outputs</span>
                    <span className="images-signal-count images-signal-count--safe">
                      {images.filter((image) => image.moderation === "Safe").length}
                    </span>
                  </div>
                </div>
                <div className="images-signal-item">
                  <div className="images-signal-row">
                    <span className="images-signal-label">Needs Review</span>
                    <span className="images-signal-count images-signal-count--review">
                      {images.filter((image) => image.moderation === "Review").length}
                    </span>
                  </div>
                </div>
                <div className="images-signal-item">
                  <div className="images-signal-row">
                    <span className="images-signal-label">Flagged</span>
                    <span className="images-signal-count images-signal-count--flagged">
                      {images.filter((image) => image.moderation === "Flagged").length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="images-admin-note">
                <div className="images-admin-note-inner">
                  <div className="images-admin-note-icon">
                    <X className="images-small-icon" />
                  </div>
                  <div>
                    <p className="images-admin-note-title">Admin note</p>
                    <p className="images-admin-note-text">
                      Rejected outputs should be reviewed with the original story prompt before the user is notified.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {previewOpen && selectedImage ? (
        <div className="images-preview-modal-backdrop">
          <div className="images-preview-modal">
            <div className="images-preview-modal-header">
              <div>
                <p className="images-panel-label">Image Preview</p>
                <h3 className="images-preview-modal-title">{selectedImage.story}</h3>
              </div>
              <Button variant="outline" size="sm" className="images-action-button" onClick={() => setPreviewOpen(false)}>
                <X className="images-small-icon" />
              </Button>
            </div>

            <div className="images-preview-modal-grid">
              <div className="images-preview-modal-media">
                {selectedImage.imageUrl ? (
                  <img
                    src={selectedImage.imageUrl}
                    alt={selectedImage.story}
                    className="images-preview-modal-image"
                  />
                ) : (
                  <div className="images-preview-modal-empty">
                    <ImageIcon className="images-empty-icon" />
                  </div>
                )}
              </div>

              <div className="images-preview-modal-details">
                <div className="images-status-row">
                  <StatusBadge status={selectedImage.status} />
                  <span className={getModerationClass(selectedImage.moderation)}>
                    {selectedImage.moderation}
                  </span>
                </div>

                <div className="images-detail-list">
                  <p><span>User:</span> {selectedImage.user}</p>
                  <p><span>Email:</span> {selectedImage.email}</p>
                  <p><span>Style:</span> {selectedImage.style}</p>
                  <p><span>Page:</span> {selectedImage.pageNumber}</p>
                  <p><span>Created:</span> {selectedImage.createdAt}</p>
                </div>

                <div>
                  <p className="images-prompt-heading">Prompt</p>
                  <p className="images-prompt-body">{selectedImage.prompt}</p>
                </div>

                <div className="images-actions">
                  <Button
                    size="sm"
                    className="images-action-button"
                    onClick={() => updateImageStatus(selectedImage.id, "Approved")}
                    disabled={selectedImage.status === "Approved" || savingIds.includes(selectedImage.id)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="images-action-button images-action-button--pending"
                    onClick={() => updateImageStatus(selectedImage.id, "Pending")}
                    disabled={selectedImage.status === "Pending" || savingIds.includes(selectedImage.id)}
                  >
                    Pending
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="images-action-button"
                    onClick={() => updateImageStatus(selectedImage.id, "Rejected")}
                    disabled={selectedImage.status === "Rejected" || savingIds.includes(selectedImage.id)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
