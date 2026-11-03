-- Run in the portfolio Neon database referenced by NEON_DATABASE_URL.
-- One statement for Query editors that use prepared statements.
DO $migration$
BEGIN
  BEGIN
    CREATE TYPE public.enum_blog_feedback_kind AS ENUM ('like', 'comment');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  CREATE TABLE IF NOT EXISTS public.blog_feedback (
    id serial PRIMARY KEY,
    slug varchar NOT NULL,
    kind public.enum_blog_feedback_kind NOT NULL,
    visitor varchar NOT NULL,
    unique_key varchar NOT NULL,
    name varchar,
    message varchar,
    approved boolean DEFAULT false,
    updated_at timestamptz(3) NOT NULL DEFAULT now(),
    created_at timestamptz(3) NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS blog_feedback_slug_idx ON public.blog_feedback(slug);
  CREATE INDEX IF NOT EXISTS blog_feedback_visitor_idx ON public.blog_feedback(visitor);
  CREATE UNIQUE INDEX IF NOT EXISTS blog_feedback_unique_key_idx ON public.blog_feedback(unique_key);
  CREATE INDEX IF NOT EXISTS blog_feedback_created_at_idx ON public.blog_feedback(created_at);
  CREATE INDEX IF NOT EXISTS blog_feedback_updated_at_idx ON public.blog_feedback(updated_at);
END;
$migration$;
