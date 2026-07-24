/**
 * Converts markdown table syntax (with pipes `|`) into clean, highly readable
 * text bullet lists and key-value steps, preserving code blocks intact.
 */
export function convertPipeTablesToText(markdown: string): string {
  if (!markdown || typeof markdown !== 'string' || !markdown.includes('|')) return markdown;

  const lines = markdown.split('\n');
  const resultLines: string[] = [];
  let inCodeBlock = false;
  let inTable = false;
  let headers: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      if (inTable) {
        inTable = false;
        headers = [];
      }
      resultLines.push(line);
      continue;
    }

    if (inCodeBlock) {
      resultLines.push(line);
      continue;
    }

    // Check if line looks like a markdown table row (starts and ends with | or contains multiple pipes)
    if (trimmed.startsWith('|') && (trimmed.endsWith('|') || trimmed.includes('|'))) {
      const rawCells = trimmed.split('|').map(c => c.trim());
      // Filter out leading/trailing empty string resulting from leading/trailing pipes
      const cells = rawCells.filter((c, idx, arr) => {
        if ((idx === 0 || idx === arr.length - 1) && c === '') return false;
        return true;
      });

      if (cells.length >= 2) {
        // Check if it's a table alignment separator line like | :--- | :--- |
        const isSeparator = cells.every(c => /^[:\-\s]+$/.test(c));
        if (isSeparator) {
          inTable = true;
          continue;
        }

        if (!inTable) {
          // Table Header
          headers = cells;
          inTable = true;
          continue;
        } else {
          // Table Data Row
          if (headers.length > 0) {
            const formattedCells = cells.map((cell, idx) => {
              const header = headers[idx] || `Field ${idx + 1}`;
              return `**${header}**: ${cell}`;
            }).join('  •  ');
            resultLines.push(`- ${formattedCells}`);
          } else {
            resultLines.push(`- ${cells.join('  •  ')}`);
          }
          continue;
        }
      }
    }

    if (inTable) {
      inTable = false;
      headers = [];
    }
    resultLines.push(line);
  }

  return resultLines.join('\n');
}

/**
 * Sanitizes text returned by AI models to strip LaTeX/TeX math formatting,
 * dollar signs ($...$), and pipe tables (|), converting them into clean plain text.
 */
export function sanitizeLaTeX(str: string): string {
  if (!str || typeof str !== 'string') return str || '';
  const cleanedMath = str
    .replace(/\\le(q)?/g, '<=')
    .replace(/\\ge(q)?/g, '>=')
    .replace(/\\rightarrow/g, '->')
    .replace(/\\leftarrow/g, '<-')
    .replace(/\\times/g, 'x')
    .replace(/\\cdot/g, '*')
    .replace(/\\log/g, 'log')
    .replace(/\\dots|\\ldots/g, '...')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\(mathcal|text|mathbf|rm|mathrm)\{([^}]+)\}/g, '$2')
    .replace(/\$\$([\s\S]*?)\$\$/g, '$1')  // Block math $$ ... $$ -> inner text
    .replace(/\$([^\$\n]+)\$/g, '$1')      // Inline math $ ... $ -> inner text
    .replace(/\$/g, '');                   // Strip any leftover orphan dollar signs

  return convertPipeTablesToText(cleanedMath);
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
