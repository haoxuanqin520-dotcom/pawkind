CREATE TABLE public.trial_counters (
  variant text PRIMARY KEY CHECK (variant IN ('A','B')),
  views integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  completions integer NOT NULL DEFAULT 0
);

INSERT INTO public.trial_counters (variant) VALUES ('A'), ('B');

GRANT SELECT ON public.trial_counters TO anon;
GRANT SELECT ON public.trial_counters TO authenticated;
GRANT ALL ON public.trial_counters TO service_role;

ALTER TABLE public.trial_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read trial totals"
ON public.trial_counters FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.record_trial_event(_variant text, _event text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _variant NOT IN ('A','B') OR _event NOT IN ('view','click','complete') THEN
    RETURN;
  END IF;
  IF _event = 'view' THEN
    UPDATE public.trial_counters SET views = views + 1 WHERE variant = _variant;
  ELSIF _event = 'click' THEN
    UPDATE public.trial_counters SET clicks = clicks + 1 WHERE variant = _variant;
  ELSE
    UPDATE public.trial_counters SET completions = completions + 1 WHERE variant = _variant;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_trial_event(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.record_trial_event(text, text) TO authenticated;