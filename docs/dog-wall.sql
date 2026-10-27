-- PawKind dog wall: database and storage setup for Lovable Cloud.
--
-- What it does
--   Owners share one photo of their dog. Every photo waits for the team's review before it
--   appears on /wall. Owners can remove their own photos from the browser they shared them from.
--
-- How it is protected
--   * Visitors never read or write the posts table directly. Every action goes through the
--     functions below, which check their inputs.
--   * Photos live in the public "dog-wall" bucket under random UUID file names. Only approved
--     photos are ever listed, so a waiting photo can't be found by browsing.
--   * Each browser holds a random owner token; the table stores only its SHA-256 hash.
--   * The team's moderation key is stored as a salted SHA-256 hash, never as plain text.
--   * The script is safe to run more than once.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.dog_wall_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_name text NOT NULL CHECK (char_length(btrim(dog_name)) BETWEEN 1 AND 24),
  breed text CHECK (breed IS NULL OR char_length(breed) <= 40),
  photo_path text NOT NULL UNIQUE
    CHECK (photo_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$'),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'removed')),
  owner_token_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

ALTER TABLE public.dog_wall_posts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.dog_wall_posts FROM anon, authenticated;
GRANT ALL ON public.dog_wall_posts TO service_role;

CREATE TABLE IF NOT EXISTS public.dog_wall_admin (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  key_salt text NOT NULL,
  key_hash text NOT NULL
);

ALTER TABLE public.dog_wall_admin ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.dog_wall_admin FROM anon, authenticated;
GRANT ALL ON public.dog_wall_admin TO service_role;

INSERT INTO public.dog_wall_admin (id, key_salt, key_hash)
VALUES (
  1,
  'a8b3350af75c676092f752c9e9b0094d',
  '8ef79fd6d0a8fbb59fcace1ecafeb6d032bab37951135962127f1afb837b26ea'
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Storage bucket: public reads by exact URL, JPEG only, 2 MB per photo
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('dog-wall', 'dog-wall', true, 2097152, ARRAY['image/jpeg'])
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Internal helpers (not callable by visitors)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.dog_wall_hash(_value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT encode(sha256(convert_to(coalesce(_value, ''), 'UTF8')), 'hex');
$$;

CREATE OR REPLACE FUNCTION public.dog_wall_is_admin(_admin_key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.dog_wall_admin a
    WHERE a.key_hash = public.dog_wall_hash(a.key_salt || coalesce(_admin_key, ''))
  );
$$;

CREATE OR REPLACE FUNCTION public.dog_wall_photo_removable(_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.dog_wall_posts p
    WHERE p.photo_path = _name AND p.status IN ('removed', 'rejected')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.dog_wall_is_admin(text) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Visitor functions
-- ---------------------------------------------------------------------------

-- Share a photo that was just uploaded to the bucket. It starts as "pending".
CREATE OR REPLACE FUNCTION public.submit_dog_wall_post(
  _dog_name text,
  _breed text,
  _photo_path text,
  _owner_token text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  IF _owner_token IS NULL OR char_length(_owner_token) < 32 THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;
  IF (SELECT count(*) FROM public.dog_wall_posts WHERE status = 'pending') >= 300 THEN
    RAISE EXCEPTION 'review_queue_full';
  END IF;

  INSERT INTO public.dog_wall_posts (dog_name, breed, photo_path, owner_token_hash)
  VALUES (btrim(_dog_name), nullif(btrim(_breed), ''), _photo_path, public.dog_wall_hash(_owner_token))
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- Approved photos for the wall, newest first.
CREATE OR REPLACE FUNCTION public.list_dog_wall(_limit integer DEFAULT 48)
RETURNS TABLE (id uuid, dog_name text, breed text, photo_path text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.dog_name, p.breed, p.photo_path, p.created_at
  FROM public.dog_wall_posts p
  WHERE p.status = 'approved'
  ORDER BY p.reviewed_at DESC NULLS LAST, p.created_at DESC
  LIMIT least(greatest(coalesce(_limit, 48), 1), 100);
$$;

-- The photos this browser shared, with their review status.
CREATE OR REPLACE FUNCTION public.my_dog_wall_posts(_ids uuid[], _owner_token text)
RETURNS TABLE (id uuid, dog_name text, photo_path text, status text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.dog_name, p.photo_path, p.status, p.created_at
  FROM public.dog_wall_posts p
  WHERE p.id = ANY (_ids)
    AND p.owner_token_hash = public.dog_wall_hash(_owner_token)
    AND p.status <> 'removed'
  ORDER BY p.created_at DESC
  LIMIT 20;
$$;

-- Owners take their own photo down. The file itself is then deleted by the page.
CREATE OR REPLACE FUNCTION public.remove_dog_wall_post(_id uuid, _owner_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.dog_wall_posts
  SET status = 'removed', reviewed_at = now()
  WHERE id = _id
    AND owner_token_hash = public.dog_wall_hash(_owner_token)
    AND status <> 'removed';
  RETURN FOUND;
END;
$$;

-- ---------------------------------------------------------------------------
-- Team functions (need the moderation key)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.review_dog_wall(_admin_key text)
RETURNS TABLE (id uuid, dog_name text, breed text, photo_path text, status text, created_at timestamptz)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.dog_wall_is_admin(_admin_key) THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;
  RETURN QUERY
    SELECT p.id, p.dog_name, p.breed, p.photo_path, p.status, p.created_at
    FROM public.dog_wall_posts p
    WHERE p.status IN ('pending', 'approved')
    ORDER BY (p.status = 'pending') DESC, p.created_at DESC
    LIMIT 200;
END;
$$;

CREATE OR REPLACE FUNCTION public.moderate_dog_wall_post(_admin_key text, _id uuid, _status text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.dog_wall_is_admin(_admin_key) THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;
  IF _status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'invalid_status';
  END IF;
  UPDATE public.dog_wall_posts
  SET status = _status, reviewed_at = now()
  WHERE public.dog_wall_posts.id = _id;
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_dog_wall_post(text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_dog_wall(integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.my_dog_wall_posts(uuid[], text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.remove_dog_wall_post(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.review_dog_wall(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.moderate_dog_wall_post(text, uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.dog_wall_photo_removable(text) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage policies
-- ---------------------------------------------------------------------------

-- Anyone may add a new photo with a random UUID name (no overwrites: there is no UPDATE policy).
DROP POLICY IF EXISTS "Dog wall: upload a new photo" ON storage.objects;
CREATE POLICY "Dog wall: upload a new photo"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'dog-wall'
  AND name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$'
);

-- Files of removed or rejected posts can be found and deleted, so they don't linger.
DROP POLICY IF EXISTS "Dog wall: find removed photos" ON storage.objects;
CREATE POLICY "Dog wall: find removed photos"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'dog-wall' AND public.dog_wall_photo_removable(name));

DROP POLICY IF EXISTS "Dog wall: delete removed photos" ON storage.objects;
CREATE POLICY "Dog wall: delete removed photos"
ON storage.objects FOR DELETE TO anon, authenticated
USING (bucket_id = 'dog-wall' AND public.dog_wall_photo_removable(name));
