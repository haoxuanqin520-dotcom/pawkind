import { useEffect, useState } from "react";

import { listWall, type WallPost } from "./dog-wall";
import { WallFrame, WallFrameSkeleton } from "./WallFrame";

// Homepage strip: the newest approved photos, or an invitation when there are none yet.
export function WallTeaser() {
  const [posts, setPosts] = useState<WallPost[] | null>(null);

  useEffect(() => {
    let alive = true;
    listWall(6)
      .then((result) => alive && setPosts(result))
      .catch(() => alive && setPosts([]));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section id="wall" className="wall-teaser" aria-labelledby="wall-teaser-title">
      <div className="wrap wall-teaser-inner">
        <div className="wall-teaser-copy">
          <h2 id="wall-teaser-title">Who's the bowl for?</h2>
          <p>
            Owners share their dogs on the PawKind wall. Add yours and it shows up straight away.
          </p>
          <a className="btn btn-outline" href="/wall">
            Add your dog to the wall
          </a>
        </div>
        <div className="wall-strip">
          {posts === null &&
            Array.from({ length: 4 }, (_, index) => <WallFrameSkeleton key={index} />)}
          {posts !== null &&
            posts.length > 0 &&
            posts
              .slice(0, 4)
              .map((post) => (
                <WallFrame
                  key={post.id}
                  name={post.dog_name}
                  breed={post.breed}
                  path={post.photo_path}
                />
              ))}
          {posts !== null && posts.length === 0 && (
            <>
              <WallFrame name="Your dog" breed="could be the first" />
              <WallFrame />
              <WallFrame />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
