// PawKind dog wall: data access for /wall and /wall-review.
//
// Backend: Lovable Cloud (Supabase). The table, bucket, functions and policies are created by
// docs/dog-wall.sql. Until that script has been applied, every call reports "not-ready" and the
// pages say the wall isn't switched on yet.
//
// Privacy: photos are re-drawn on a canvas before upload, which strips EXIF data such as the
// GPS location a phone camera embeds. Owners give a dog's name and, optionally, a breed; nothing
// about the owner is collected. Each browser keeps a random owner token so it can see and remove
// the photos it shared.

import { supabase } from "@/integrations/supabase/client";

export const WALL_BUCKET = "dog-wall";
const TOKEN_KEY = "pawkind-wall-token";
const POSTS_KEY = "pawkind-wall-posts";
const ADMIN_KEY = "pawkind-wall-admin";
const MAX_SIDE = 1280;
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const MAX_INPUT_BYTES = 25 * 1024 * 1024;

export type WallPost = {
  id: string;
  dog_name: string;
  breed: string | null;
  photo_path: string;
  created_at: string;
};

export type WallStatus = "pending" | "approved" | "rejected" | "removed";

export type MyPost = {
  id: string;
  dog_name: string;
  photo_path: string;
  status: WallStatus;
  created_at: string;
};

export type ReviewPost = WallPost & { status: WallStatus };

export type WallErrorKind =
  | "not-ready"
  | "not-image"
  | "unreadable"
  | "too-big"
  | "queue-full"
  | "offline"
  | "not-allowed"
  | "failed";

export class WallError extends Error {
  constructor(public kind: WallErrorKind) {
    super(kind);
    this.name = "WallError";
  }
}

export const WALL_ERROR_TEXT: Record<WallErrorKind, string> = {
  "not-ready": "The dog wall isn't switched on yet. Please check back soon.",
  "not-image": "That file isn't a photo. Choose a JPG, PNG or HEIC image.",
  unreadable: "We couldn't open that photo. Try saving it as a JPG or PNG first.",
  "too-big": "That photo is too large to share. Try a smaller one.",
  "queue-full":
    "Lots of photos are waiting for review right now. Please try again in a day or two.",
  offline: "We couldn't reach the PawKind server. Check your connection and try again.",
  "not-allowed": "That review key isn't right.",
  failed: "The photo didn't upload. Please try again.",
};

export const STATUS_TEXT: Record<WallStatus, string> = {
  pending: "Waiting for review",
  approved: "On the wall",
  rejected: "Not approved",
  removed: "Removed",
};

const UUID_JPG = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/;

export function isValidPhotoPath(path: string) {
  return UUID_JPG.test(path);
}

type BackendError = { message?: string; code?: string; statusCode?: string | number } | null;

// Turn Supabase errors into something the page can explain.
export function classifyError(error: unknown): WallErrorKind {
  if (error instanceof WallError) return error.kind;
  const e = (error ?? {}) as NonNullable<BackendError>;
  const message = String(e.message ?? "").toLowerCase();
  const code = String(e.code ?? "");
  const status = String(e.statusCode ?? "");
  if (
    code === "PGRST202" ||
    code === "PGRST205" ||
    code === "42883" ||
    code === "42P01" ||
    message.includes("bucket not found") ||
    message.includes("could not find the function")
  )
    return "not-ready";
  if (message.includes("review_queue_full")) return "queue-full";
  if (message.includes("not_allowed")) return "not-allowed";
  if (status === "413" || message.includes("payload too large") || message.includes("exceeded"))
    return "too-big";
  if (message.includes("failed to fetch") || message.includes("network")) return "offline";
  return "failed";
}

// ---------- Browser storage (best effort) ----------

function readStorage(store: "local" | "session", key: string): string | null {
  try {
    return (store === "local" ? window.localStorage : window.sessionStorage).getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(store: "local" | "session", key: string, value: string | null) {
  try {
    const target = store === "local" ? window.localStorage : window.sessionStorage;
    if (value === null) target.removeItem(key);
    else target.setItem(key, value);
  } catch {
    // Private windows can block storage; the page still works for this visit.
  }
}

let memoryToken: string | null = null;

export function ownerToken(): string {
  const stored = readStorage("local", TOKEN_KEY);
  if (stored && stored.length >= 32) return stored;
  const token = memoryToken ?? `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, "");
  memoryToken = token;
  writeStorage("local", TOKEN_KEY, token);
  return token;
}

export function myPostIds(): string[] {
  try {
    const parsed: unknown = JSON.parse(readStorage("local", POSTS_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function rememberPost(id: string) {
  writeStorage("local", POSTS_KEY, JSON.stringify([id, ...myPostIds()].slice(0, 20)));
}

function forgetPost(id: string) {
  writeStorage("local", POSTS_KEY, JSON.stringify(myPostIds().filter((value) => value !== id)));
}

export const reviewKeyStore = {
  get: () => readStorage("session", ADMIN_KEY) ?? "",
  set: (key: string | null) => writeStorage("session", ADMIN_KEY, key),
};

// ---------- Photos ----------

export function photoUrl(path: string) {
  return supabase.storage.from(WALL_BUCKET).getPublicUrl(path).data.publicUrl;
}

async function decode(
  file: Blob,
): Promise<{ source: CanvasImageSource; width: number; height: number }> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return { source: bitmap, width: bitmap.width, height: bitmap.height };
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      return { source: image, width: image.naturalWidth, height: image.naturalHeight };
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function encode(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

// Resize to at most 1280 px on the long side and re-encode as JPEG. Re-drawing drops EXIF,
// including any GPS location.
export async function preparePhoto(file: File): Promise<Blob> {
  if (file.type && !file.type.startsWith("image/")) throw new WallError("not-image");
  if (file.size > MAX_INPUT_BYTES) throw new WallError("too-big");

  let decoded: Awaited<ReturnType<typeof decode>>;
  try {
    decoded = await decode(file);
  } catch {
    throw new WallError("unreadable");
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(decoded.width, decoded.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(decoded.width * scale));
  canvas.height = Math.max(1, Math.round(decoded.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new WallError("unreadable");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(decoded.source, 0, 0, canvas.width, canvas.height);
  if ("close" in decoded.source && typeof decoded.source.close === "function")
    decoded.source.close();

  for (const quality of [0.85, 0.72, 0.6]) {
    const blob = await encode(canvas, quality);
    if (!blob) throw new WallError("unreadable");
    if (blob.size <= MAX_UPLOAD_BYTES) return blob;
  }
  throw new WallError("too-big");
}

// ---------- Visitor actions ----------

export async function sharePhoto(input: { photo: Blob; dogName: string; breed: string }) {
  const path = `${crypto.randomUUID()}.jpg`;
  const upload = await supabase.storage.from(WALL_BUCKET).upload(path, input.photo, {
    contentType: "image/jpeg",
    cacheControl: "31536000",
    upsert: false,
  });
  if (upload.error) throw new WallError(classifyError(upload.error));

  const { data, error } = await supabase.rpc("submit_dog_wall_post", {
    _dog_name: input.dogName.trim(),
    _breed: input.breed,
    _photo_path: path,
    _owner_token: ownerToken(),
  });
  if (error || !data) throw new WallError(classifyError(error));
  rememberPost(data);
  return { id: data, path };
}

export async function listWall(limit = 48): Promise<WallPost[]> {
  const { data, error } = await supabase.rpc("list_dog_wall", { _limit: limit });
  if (error) throw new WallError(classifyError(error));
  return (data ?? []).filter((post) => isValidPhotoPath(post.photo_path));
}

export async function listMyPosts(): Promise<MyPost[]> {
  const ids = myPostIds();
  if (!ids.length) return [];
  const { data, error } = await supabase.rpc("my_dog_wall_posts", {
    _ids: ids,
    _owner_token: ownerToken(),
  });
  if (error) throw new WallError(classifyError(error));
  return (data ?? []).map((post) => ({ ...post, status: post.status as WallStatus }));
}

export async function removeMyPost(post: { id: string; photo_path: string }) {
  const { data, error } = await supabase.rpc("remove_dog_wall_post", {
    _id: post.id,
    _owner_token: ownerToken(),
  });
  if (error) throw new WallError(classifyError(error));
  forgetPost(post.id);
  // The post is now "removed", so the storage policy lets us delete the file itself.
  if (data) await supabase.storage.from(WALL_BUCKET).remove([post.photo_path]);
  return Boolean(data);
}

// ---------- Team actions ----------

export async function listForReview(adminKey: string): Promise<ReviewPost[]> {
  const { data, error } = await supabase.rpc("review_dog_wall", { _admin_key: adminKey });
  if (error) throw new WallError(classifyError(error));
  return (data ?? []).map((post) => ({ ...post, status: post.status as WallStatus }));
}

export async function moderate(
  adminKey: string,
  post: ReviewPost,
  status: "approved" | "rejected",
) {
  const { error } = await supabase.rpc("moderate_dog_wall_post", {
    _admin_key: adminKey,
    _id: post.id,
    _status: status,
  });
  if (error) throw new WallError(classifyError(error));
  // Rejected files are deleted so they don't stay reachable.
  if (status === "rejected") await supabase.storage.from(WALL_BUCKET).remove([post.photo_path]);
}
