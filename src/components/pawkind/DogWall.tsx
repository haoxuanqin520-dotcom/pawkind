import { Camera, CheckCircle2, ImagePlus } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from "react";

import {
  STATUS_TEXT,
  WALL_ERROR_TEXT,
  WallError,
  classifyError,
  listMyPosts,
  listWall,
  photoUrl,
  preparePhoto,
  removeMyPost,
  sharePhoto,
  type MyPost,
  type WallErrorKind,
  type WallPost,
} from "./dog-wall";
import { BREEDS, findBreed, possessive } from "./passport";
import { WallFrame, WallFrameSkeleton } from "./WallFrame";

// The passport links here with ?name=…&breed=… so the form starts filled in.
function readPrefill() {
  const params = new URLSearchParams(window.location.search);
  const breed = params.get("breed") ?? "";
  return { name: (params.get("name") ?? "").slice(0, 24), breed: findBreed(breed) ? breed : "" };
}

export function DogWall() {
  const [wall, setWall] = useState<WallPost[] | null>(null);
  const [wallError, setWallError] = useState<WallErrorKind | null>(null);
  const [mine, setMine] = useState<MyPost[]>([]);

  const refreshMine = useCallback(() => {
    listMyPosts()
      .then(setMine)
      .catch(() => setMine([]));
  }, []);

  const refreshWall = useCallback(() => {
    listWall(60)
      .then((posts) => {
        setWall(posts);
        setWallError(null);
      })
      .catch((error) => {
        setWall((current) => current ?? []);
        setWallError(classifyError(error));
      });
  }, []);

  useEffect(() => {
    refreshWall();
    refreshMine();
  }, [refreshWall, refreshMine]);

  const afterShare = useCallback(() => {
    refreshWall();
    refreshMine();
  }, [refreshWall, refreshMine]);

  const afterTakeDown = afterShare;

  return (
    <>
      <section className="wall-hero" aria-labelledby="wall-title">
        <div className="wrap wall-hero-inner">
          <div className="wall-hero-copy">
            <h1 id="wall-title">The PawKind dog wall.</h1>
            <p className="wall-lede">
              Show us who the bowl is for. Share a photo of your dog and it joins the wall below
              straight away.
            </p>
            <ul className="wall-promises">
              <li>We only ask for your dog's name. Nothing about you.</li>
              <li>Photos are resized and location data is removed before upload.</li>
              <li>You can take your photo down at any time from this browser.</li>
            </ul>
          </div>
          <WallUploader onShared={afterShare} disabled={wallError === "not-ready"} />
        </div>
      </section>

      {mine.length > 0 && <MyPhotos posts={mine} onChange={afterTakeDown} />}

      <section className="wall-gallery" aria-labelledby="gallery-title">
        <div className="wrap">
          <div className="wall-gallery-head">
            <h2 id="gallery-title">On the wall</h2>
            {wall && wall.length > 0 && (
              <p>
                {wall.length} {wall.length === 1 ? "dog" : "dogs"} so far
              </p>
            )}
          </div>
          {wallError === "not-ready" ? (
            <p className="wall-empty">
              The dog wall isn't switched on yet. Photos will appear here once it is.
            </p>
          ) : wall === null ? (
            <div className="wall-grid">
              {Array.from({ length: 8 }, (_, index) => (
                <WallFrameSkeleton key={index} />
              ))}
            </div>
          ) : wall.length === 0 ? (
            <p className="wall-empty">
              No dogs on the wall yet. Share yours above and it could be the first.
            </p>
          ) : (
            <div className="wall-grid">
              {wall.map((post) => (
                <WallFrame
                  key={post.id}
                  name={post.dog_name}
                  breed={post.breed}
                  path={post.photo_path}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

type UploadState =
  | { step: "idle" }
  | { step: "preparing" }
  | { step: "ready"; photo: Blob; preview: string }
  | { step: "sharing"; photo: Blob; preview: string }
  | { step: "shared"; name: string; preview: string };

function WallUploader({ onShared, disabled }: { onShared: () => void; disabled: boolean }) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({ step: "idle" });
  const [error, setError] = useState<WallErrorKind | null>(null);
  const [dragging, setDragging] = useState(false);
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [consent, setConsent] = useState(false);
  const previewRef = useRef<string | null>(null);

  const setPreview = (url: string | null) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = url;
  };
  useEffect(() => () => setPreview(null), []);
  useEffect(() => {
    const prefill = readPrefill();
    if (prefill.name) setName(prefill.name);
    if (prefill.breed) setBreed(prefill.breed);
  }, []);

  async function choose(file: File | undefined) {
    if (!file) return;
    setError(null);
    setState({ step: "preparing" });
    try {
      const photo = await preparePhoto(file);
      const preview = URL.createObjectURL(photo);
      setPreview(preview);
      setState({ step: "ready", photo, preview });
    } catch (caught) {
      setError(classifyError(caught));
      setState({ step: "idle" });
    }
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    void choose(event.dataTransfer.files[0]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.step !== "ready") return;
    setError(null);
    setState({ ...state, step: "sharing" });
    try {
      await sharePhoto({ photo: state.photo, dogName: name, breed: findBreed(breed)?.label ?? "" });
      setState({ step: "shared", name: name.trim(), preview: state.preview });
      onShared();
    } catch (caught) {
      setError(caught instanceof WallError ? caught.kind : classifyError(caught));
      setState({ step: "ready", photo: state.photo, preview: state.preview });
    }
  }

  function reset() {
    setPreview(null);
    setState({ step: "idle" });
    setName("");
    setBreed("");
    setConsent(false);
    setError(null);
  }

  if (state.step === "shared") {
    return (
      <div className="wall-uploader wall-uploader-done" role="status">
        <div className="wall-uploader-preview">
          <img src={state.preview} alt={`Your photo of ${state.name}`} />
        </div>
        <CheckCircle2 className="wall-done-icon" aria-hidden="true" />
        <h2>{possessive(state.name)} photo is on the wall.</h2>
        <p>
          Thanks for sharing. You can find it below, and take it down any time from this browser.
        </p>
        <button type="button" className="btn btn-outline" onClick={reset}>
          Share another dog
        </button>
      </div>
    );
  }

  const hasPhoto = state.step === "ready" || state.step === "sharing";
  const busy = state.step === "preparing" || state.step === "sharing";

  return (
    <form className="wall-uploader" onSubmit={submit} aria-label="Share your dog's photo">
      <input
        ref={inputRef}
        id={`${id}-file`}
        className="sr-only"
        type="file"
        accept="image/*"
        disabled={disabled || busy}
        onChange={(event) => {
          void choose(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      {hasPhoto ? (
        <div className="wall-uploader-preview">
          <img src={state.preview} alt="Your dog's photo, ready to share" />
          <button
            type="button"
            className="wall-change"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            <Camera aria-hidden="true" />
            Change photo
          </button>
        </div>
      ) : (
        <label
          htmlFor={`${id}-file`}
          className={`wall-drop${dragging ? " is-dragging" : ""}${disabled ? " is-disabled" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <ImagePlus aria-hidden="true" />
          <strong>
            {state.step === "preparing" ? "Getting your photo ready…" : "Choose a photo"}
          </strong>
          <span>or drop it here. JPG or PNG works best.</span>
        </label>
      )}

      <div className="field-pair">
        <label className="field">
          <span>Dog's name</span>
          <input
            value={name}
            required
            maxLength={24}
            autoComplete="off"
            disabled={disabled}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Breed (optional)</span>
          <select
            value={breed}
            disabled={disabled}
            onChange={(event) => setBreed(event.target.value)}
          >
            <option value="">Prefer not to say</option>
            {BREEDS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="check">
        <input
          type="checkbox"
          required
          checked={consent}
          disabled={disabled}
          onChange={(event) => setConsent(event.target.checked)}
        />
        <span>
          This is my photo of my dog. It doesn't show people or my address, and PawKind may show it
          on this page.
        </span>
      </label>

      {(error || disabled) && (
        <p className="wall-error" role="alert">
          {WALL_ERROR_TEXT[error ?? "not-ready"]}
        </p>
      )}

      <button
        type="submit"
        className="btn btn-primary btn-wide"
        disabled={disabled || !hasPhoto || busy}
      >
        {state.step === "sharing" ? "Sharing…" : "Share on the wall"}
      </button>
    </form>
  );
}

function MyPhotos({ posts, onChange }: { posts: MyPost[]; onChange: () => void }) {
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<WallErrorKind | null>(null);

  async function remove(post: MyPost) {
    setBusy(post.id);
    setError(null);
    try {
      await removeMyPost(post);
      onChange();
    } catch (caught) {
      setError(classifyError(caught));
    } finally {
      setBusy(null);
      setConfirming(null);
    }
  }

  return (
    <section className="wall-mine" aria-labelledby="mine-title">
      <div className="wrap">
        <h2 id="mine-title">Your photos</h2>
        <ul className="wall-mine-list">
          {posts.map((post) => (
            <li key={post.id}>
              <img src={photoUrl(post.photo_path)} alt="" loading="lazy" />
              <div>
                <strong>{post.dog_name}</strong>
                <span className={`wall-status wall-status-${post.status}`}>
                  {STATUS_TEXT[post.status]}
                </span>
              </div>
              {confirming === post.id ? (
                <span className="wall-mine-actions">
                  <button
                    type="button"
                    className="btn btn-small btn-primary"
                    disabled={busy === post.id}
                    onClick={() => void remove(post)}
                  >
                    {busy === post.id ? "Taking down…" : "Take it down"}
                  </button>
                  <button type="button" className="text-link" onClick={() => setConfirming(null)}>
                    Keep it
                  </button>
                </span>
              ) : (
                <button type="button" className="text-link" onClick={() => setConfirming(post.id)}>
                  Take down
                </button>
              )}
            </li>
          ))}
        </ul>
        {error && (
          <p className="wall-error" role="alert">
            {error === "failed"
              ? "The photo wasn't taken down. Please try again."
              : WALL_ERROR_TEXT[error]}
          </p>
        )}
      </div>
    </section>
  );
}
