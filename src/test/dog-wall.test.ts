import { beforeEach, describe, expect, it } from "vitest";

import {
  WallError,
  classifyError,
  isValidPhotoPath,
  myPostIds,
  ownerToken,
} from "../components/pawkind/dog-wall";

describe("dog wall helpers", () => {
  beforeEach(() => window.localStorage.clear());

  it("only accepts random UUID photo names", () => {
    expect(isValidPhotoPath("3f0d4ef4-40e3-4c2a-8ec7-8cc4959bdc9e.jpg")).toBe(true);
    expect(isValidPhotoPath("../secret.jpg")).toBe(false);
    expect(isValidPhotoPath("3f0d4ef4-40e3-4c2a-8ec7-8cc4959bdc9e.png")).toBe(false);
  });

  it("explains a backend that hasn't been set up yet", () => {
    expect(classifyError({ code: "PGRST202", message: "Could not find the function" })).toBe(
      "not-ready",
    );
    expect(classifyError({ message: "Bucket not found", statusCode: "404" })).toBe("not-ready");
  });

  it("recognises the database's own error messages", () => {
    expect(classifyError({ message: "too_many_uploads" })).toBe("busy");
    expect(classifyError({ message: "not_allowed" })).toBe("not-allowed");
    expect(classifyError({ message: "Payload too large", statusCode: "413" })).toBe("too-big");
    expect(classifyError(new TypeError("Failed to fetch"))).toBe("offline");
    expect(classifyError(new WallError("unreadable"))).toBe("unreadable");
    expect(classifyError(null)).toBe("failed");
  });

  it("keeps one long owner token per browser", () => {
    const token = ownerToken();
    expect(token.length).toBeGreaterThanOrEqual(32);
    expect(ownerToken()).toBe(token);
  });

  it("ignores a corrupted list of my posts", () => {
    window.localStorage.setItem("pawkind-wall-posts", "{not json");
    expect(myPostIds()).toEqual([]);
    window.localStorage.setItem("pawkind-wall-posts", JSON.stringify(["a", 3, "b"]));
    expect(myPostIds()).toEqual(["a", "b"]);
  });
});
