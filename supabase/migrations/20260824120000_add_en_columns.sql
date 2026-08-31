-- Sibling EN columns for dynamic storefront content, nullable (fall back to
-- the LT column at render time until an admin fills these in / the seed
-- script backfills them). category enums (articles.category, promos.category)
-- are NOT translated here — they stay canonical LT/token values, with EN
-- display labels handled via the messages/en.json catalog instead.
alter table public.articles add column title_en text;
alter table public.articles add column content_en text;

alter table public.promos add column title_en text;
alter table public.promos add column content_en text;

alter table public.tenants add column store_name_en text;
alter table public.tenants add column description_en text;
alter table public.tenants add column category_en text;

alter table public.faq_items add column question_en text;
alter table public.faq_items add column answer_en text;
