/**
 * Sanitizes text returned by AI models to strip LaTeX/TeX math formatting,
 * dollar signs ($...$), and unreadable symbols, converting them into clean plain text.
 */
export function sanitizeLaTeX(str: string): string {
  if (!str || typeof str !== 'string') return str || '';
  return str
    .replace(/\\le(q)?/g, '<=')
    .replace(/\\ge(q)?/g, '>=')
    .replace(/\\rightarrow/g, '->')
    .replace(/\\leftarrow/g, '<-')
    .replace(/\\times/g, 'x')
    .replace(/\\cdot/g, '*')
    .replace(/\\log/g, 'log')
    .replace(/\\dots|\\ldots/g, '...')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\(mathcal|text|mathbf|mathrm)\{([^}]+)\}/g, '$2')
    .replace(/\$\$([\s\S]*?)\$\$/g, '$1')  // Block math $$ ... $$ -> inner text
    .replace(/\$([^\$\n]+)\$/g, '$1')      // Inline math $ ... $ -> inner text
    .replace(/\$/g, '');                   // Strip any leftover orphan dollar signs
}

/**
 * Recursively sanitizes all string properties within an object or array.
 */
export function sanitizeObjectStrings<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    return sanitizeLaTeX(data) as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeObjectStrings(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    const result: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      result[key] = sanitizeObjectStrings((data as Record<string, any>)[key]);
    }
    return result as T;
  }
  return data;
}
