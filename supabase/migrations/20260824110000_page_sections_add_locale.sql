-- Add locale support to page_sections so admin-editable page content can have
-- separate LT/EN values. Existing rows default to 'lt' (unchanged behaviour).
alter table public.page_sections add column locale text not null default 'lt';

alter table public.page_sections drop constraint page_sections_page_slug_section_key_content_key_key;
alter table public.page_sections add constraint page_sections_page_slug_section_key_content_key_locale_key
  unique (page_slug, section_key, content_key, locale);
