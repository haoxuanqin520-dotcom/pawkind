import { useEffect, useState, type FormEvent } from "react";

import {
  WALL_ERROR_TEXT,
  classifyError,
  listForReview,
  moderate,
  reviewKeyStore,
  type ReviewPost,
  type WallErrorKind,
} from "./dog-wall";
import { WallFrame } from "./WallFrame";

// Team-only page at /wall-review. Not linked from the site. The moderation key is checked by the
// database; it is kept in this tab's session storage only.
export function WallReview() {
  const [key, setKey] = useState("");
  const [posts, setPosts] = useState<ReviewPost[] | null>(null);
  const [error, setError] = useState<WallErrorKind | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function open(candidate: string) {
    setLoading(true);
    setError(null);
    try {
      const result = await listForReview(candidate);
      reviewKeyStore.set(candidate);
      setKey(candidate);
      setPosts(result);
    } catch (caught) {
      reviewKeyStore.set(null);
      setPosts(null);
      setError(classifyError(caught));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = reviewKeyStore.get();
    if (saved) void open(saved);
  }, []);

  async function decide(post: ReviewPost, status: "approved" | "rejected") {
    setBusy(post.id);
    setError(null);
    try {
      await moderate(key, post, status);
      setPosts((current) =>
        (current ?? [])
          .map((item) => (item.id === post.id ? { ...item, status } : item))
          .filter((item) => item.status !== "rejected"),
      );
    } catch (caught) {
      setError(classifyError(caught));
    } finally {
      setBusy(null);
    }
  }

  function signOut() {
    reviewKeyStore.set(null);
    setKey("");
    setPosts(null);
  }

  if (posts === null) {
    return (
      <section className="review-section">
        <div className="wrap review-narrow">
          <h1>Review dog wall photos</h1>
          <p>For the PawKind team. Enter the review key to see photos waiting for approval.</p>
          <form
            className="review-key"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const value = new FormData(event.currentTarget).get("key");
              if (typeof value === "string" && value.trim()) void open(value.trim());
            }}
          >
            <label className="field">
              <span>Review key</span>
              <input name="key" type="password" autoComplete="off" required />
            </label>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Checking…" : "Open review"}
            </button>
          </form>
          {error && (
            <p className="wall-error" role="alert">
              {WALL_ERROR_TEXT[error]}
            </p>
          )}
        </div>
      </section>
    );
  }

  const pending = posts.filter((post) => post.status === "pending");
  const approved = posts.filter((post) => post.status === "approved");

  return (
    <section className="review-section">
      <div className="wrap">
        <div className="review-head">
          <h1>Review dog wall photos</h1>
          <button type="button" className="text-link" onClick={signOut}>
            Sign out
          </button>
        </div>
        {error && (
          <p className="wall-error" role="alert">
            {WALL_ERROR_TEXT[error]}
          </p>
        )}

        <h2>
          Waiting for review <span className="review-count">{pending.length}</span>
        </h2>
        {pending.length === 0 ? (
          <p className="wall-empty">Nothing waiting. New photos will show up here.</p>
        ) : (
          <div className="wall-grid">
            {pending.map((post) => (
              <WallFrame
                key={post.id}
                name={post.dog_name}
                breed={post.breed}
                path={post.photo_path}
                eager
              >
                <div className="review-actions">
                  <button
                    type="button"
                    className="btn btn-small btn-primary"
                    disabled={busy === post.id}
                    onClick={() => void decide(post, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="btn btn-small btn-outline"
                    disabled={busy === post.id}
                    onClick={() => void decide(post, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              </WallFrame>
            ))}
          </div>
        )}

        <h2>
          On the wall <span className="review-count">{approved.length}</span>
        </h2>
        {approved.length === 0 ? (
          <p className="wall-empty">No approved photos yet.</p>
        ) : (
          <div className="wall-grid">
            {approved.map((post) => (
              <WallFrame
                key={post.id}
                name={post.dog_name}
                breed={post.breed}
                path={post.photo_path}
              >
                <div className="review-actions">
                  <button
                    type="button"
                    className="btn btn-small btn-outline"
                    disabled={busy === post.id}
                    onClick={() => void decide(post, "rejected")}
                  >
                    Take down
                  </button>
                </div>
              </WallFrame>
            ))}
          </div>
        )}
        <p className="review-note">
          Rejecting or taking down a photo deletes the file. Owners can also take down their own
          photos.
        </p>
      </div>
    </section>
  );
}
