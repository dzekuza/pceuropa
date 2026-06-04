-- Add attachments array to faq_items for file URLs (images, PDFs)
ALTER TABLE faq_items ADD COLUMN IF NOT EXISTS attachments text[] NOT NULL DEFAULT '{}';
