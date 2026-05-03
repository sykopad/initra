import fs from 'fs';
import path from 'path';

const DESIGN_MD_DIR = './public/design-md';
const OUTPUT_FILE = './src/lib/engine/design-library.ts';

function parseDesignFile(slug, content) {
  let name = slug.charAt(0).toUpperCase() + slug.slice(1);
  let description = `Design guidelines inspired by ${name}`;
  
  // Try to parse frontmatter
  if (content.startsWith('---')) {
    const endHeader = content.indexOf('---', 3);
    if (endHeader !== -1) {
      const header = content.slice(3, endHeader);
      const nameMatch = header.match(/name:\s*(.*)/);
      const descMatch = header.match(/description:\s*(.*)/);
      if (nameMatch) name = nameMatch[1].trim().replace(/^["']|["']$/g, '');
      if (descMatch) description = descMatch[1].trim().replace(/^["']|["']$/g, '');
    }
  } else {
    // Try to parse from markdown headers
    const titleMatch = content.match(/^#\s*(.*)/m);
    if (titleMatch) {
      name = titleMatch[1].replace('Design System Inspired by ', '').trim();
    }
    const overviewMatch = content.match(/## Overview\s*\n\n([\s\S]*?)\n\n/);
    if (overviewMatch) {
      description = overviewMatch[1].trim().split('\n')[0];
    } else {
       const firstParaMatch = content.match(/\n\n([^#\n][\s\S]*?)\n\n/);
       if (firstParaMatch) {
         description = firstParaMatch[1].trim().split('\n')[0];
       }
    }
  }

  return {
    slug,
    name,
    description,
    content
  };
}

const presets = [];
const dirs = fs.readdirSync(DESIGN_MD_DIR).filter(d => fs.statSync(path.join(DESIGN_MD_DIR, d)).isDirectory());

for (const dir of dirs) {
  const filePath = path.join(DESIGN_MD_DIR, dir, 'DESIGN.md');
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    presets.push(parseDesignFile(dir, content));
  }
}

const tsContent = `// =============================================
// Initra — Design Presets Library
// Generated automatically from public/design-md/
// =============================================

import { DesignPreset } from './types';

export const DESIGN_PRESETS: DesignPreset[] = ${JSON.stringify(presets, null, 2)};

export function getDesignPreset(slug: string): DesignPreset | undefined {
  return DESIGN_PRESETS.find(p => p.slug === slug);
}

export function getAllDesignPresets(): DesignPreset[] {
  return DESIGN_PRESETS;
}
`;

fs.writeFileSync(OUTPUT_FILE, tsContent);
console.log(`Generated ${presets.length} design presets into ${OUTPUT_FILE}`);
