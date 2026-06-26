
-- Publish all draft articles linked to queued items
UPDATE public.articles
SET status = 'published',
    published_date = COALESCE(published_date, CURRENT_DATE)
WHERE status = 'draft'
  AND id IN (SELECT generated_article_id FROM public.article_queue WHERE generated_article_id IS NOT NULL);

-- Mark queue rows as published
UPDATE public.article_queue
SET status = 'published'
WHERE status = 'ready_for_review' AND generated_article_id IS NOT NULL;

-- Reset stuck 'generating' rows back to queued so the cron picks them up
UPDATE public.article_queue
SET status = 'queued'
WHERE status = 'generating';
