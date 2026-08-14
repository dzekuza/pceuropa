import sanitizeHtml from 'sanitize-html'

/** Sanitizes admin-authored rich text (bold, italic, links, line breaks, lists) for public rendering. */
export function sanitizeRichText(html: string | undefined | null): string {
  if (!html) return ''
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'b', 'strong', 'i', 'em', 'ul', 'ol', 'li', 'a'],
    allowedAttributes: { a: ['href', 'target', 'rel'] },
  })
}
