/**
 * Initra Advanced Design Presets
 * Curated typographic scales and surface-ladder architectures for premium ventures.
 */

export interface DesignTokenSet {
  typographicScale: string;
  surfaceLadder: string;
  hairlineBorders: string;
  glassmorphism?: string;
}

export const DESIGN_PRESETS: Record<string, DesignTokenSet> = {
  'editorial-calm': {
    typographicScale: `
      --font-scale-base: 1rem;
      --font-scale-ratio: 1.25; /* Major Third */
      --text-xs: calc(var(--font-scale-base) / var(--font-scale-ratio));
      --text-sm: var(--font-scale-base);
      --text-base: calc(var(--font-scale-base) * var(--font-scale-ratio));
      --text-lg: calc(var(--text-base) * var(--font-scale-ratio));
      --text-xl: calc(var(--text-lg) * var(--font-scale-ratio));
      --text-2xl: calc(var(--text-xl) * var(--font-scale-ratio));
      --text-3xl: calc(var(--text-2xl) * var(--font-scale-ratio));
    `,
    surfaceLadder: `
      --surface-1: #0a0a0a;
      --surface-2: #141414;
      --surface-3: #1f1f1f;
      --surface-4: #2a2a2a;
      --surface-elevated: #1a1a1a;
    `,
    hairlineBorders: `
      --border-thin: 0.5px solid rgba(255, 255, 255, 0.08);
      --border-medium: 1px solid rgba(255, 255, 255, 0.12);
      --border-accent: 1px solid var(--primary-brand, #7c3aed);
    `
  },
  'neo-minimalist': {
    typographicScale: `
      --font-scale-base: 0.95rem;
      --font-scale-ratio: 1.2; /* Minor Third */
      --text-xs: 0.75rem;
      --text-sm: 0.875rem;
      --text-base: 1rem;
      --text-lg: 1.2rem;
      --text-xl: 1.44rem;
      --text-2xl: 1.728rem;
      --text-3xl: 2.074rem;
    `,
    surfaceLadder: `
      --surface-1: #ffffff;
      --surface-2: #f9fafb;
      --surface-3: #f3f4f6;
      --surface-4: #e5e7eb;
      --surface-elevated: #ffffff;
    `,
    hairlineBorders: `
      --border-thin: 0.5px solid rgba(0, 0, 0, 0.05);
      --border-medium: 1px solid rgba(0, 0, 0, 0.08);
      --border-accent: 1px solid var(--primary-brand, #000000);
    `
  },
  'glass-vapor': {
    typographicScale: `
      --font-scale-base: 1rem;
      --font-scale-ratio: 1.333; /* Perfect Fourth */
      --text-xs: 0.75rem;
      --text-sm: 0.875rem;
      --text-base: 1rem;
      --text-lg: 1.333rem;
      --text-xl: 1.777rem;
      --text-2xl: 2.369rem;
      --text-3xl: 3.157rem;
    `,
    surfaceLadder: `
      --surface-1: #050505;
      --surface-2: rgba(255, 255, 255, 0.03);
      --surface-3: rgba(255, 255, 255, 0.05);
      --surface-4: rgba(255, 255, 255, 0.08);
      --surface-elevated: rgba(255, 255, 255, 0.1);
    `,
    hairlineBorders: `
      --border-thin: 1px solid rgba(255, 255, 255, 0.1);
      --border-medium: 1px solid rgba(255, 255, 255, 0.2);
      --border-accent: 1px solid var(--primary-brand, #f472b6);
    `,
    glassmorphism: `
      --glass-blur: blur(12px);
      --glass-bg: rgba(255, 255, 255, 0.03);
      --glass-border: 1px solid rgba(255, 255, 255, 0.1);
    `
  }
};

export function getDesignPresetTokens(slug: string): string {
  const preset = DESIGN_PRESETS[slug] || DESIGN_PRESETS['editorial-calm'];
  
  return \`
  /* Design Preset: \${slug} */
  \${preset.typographicScale}
  \${preset.surfaceLadder}
  \${preset.hairlineBorders}
  \${preset.glassmorphism || ''}
  \`;
}
