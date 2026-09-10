/** Builds a stable dotted field id, e.g. fieldId('hero', 'title') -> "hero.title" */
export function fieldId(...parts: string[]): string {
  return parts.join('.')
}
