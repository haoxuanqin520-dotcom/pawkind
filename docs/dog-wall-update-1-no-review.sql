-- PawKind dog wall, update 1: photos go on the wall straight away.
--
-- Run this once in Lovable Cloud (Database > Manage > SQL editor) after docs/dog-wall.sql.
-- New photos are published as soon as they are shared, with no review step. The team can still
-- take a photo down on /wall-review with the review key. To stop floods of uploads, the whole
-- site accepts at most 40 new photos in any 10 minutes. Safe to run more than once.

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
  IF (
    SELECT count(*) FROM public.dog_wall_posts WHERE created_at > now() - interval '10 minutes'
  ) >= 40 THEN
    RAISE EXCEPTION 'too_many_uploads';
  END IF;

  INSERT INTO public.dog_wall_posts (dog_name, breed, photo_path, owner_token_hash, status, reviewed_at)
  VALUES (
    btrim(_dog_name),
    nullif(btrim(_breed), ''),
    _photo_path,
    public.dog_wall_hash(_owner_token),
    'approved',
    now()
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_dog_wall_post(text, text, text, text) TO anon, authenticated;

-- Photos that were already waiting go on the wall too.
UPDATE public.dog_wall_posts SET status = 'approved', reviewed_at = now() WHERE status = 'pending';
