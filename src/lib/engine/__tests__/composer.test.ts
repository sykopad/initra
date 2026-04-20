import { describe, it, expect } from 'vitest';
import { compose, extractVariables } from '../prompt-composer';

describe('Prompt Composer Logic', () => {
  it('should interpolate simple variables', () => {
    const template = 'Hello {{projectName}}';
    const variables = { projectName: 'Test Project' } as any;
    expect(compose(template, variables)).toBe('Hello Test Project');
  });

  it('should handle if blocks correctly', () => {
    const template = '{{#if isPro}}Pro User{{/if}}{{#if isElite}}Elite User{{/if}}';
    
    expect(compose(template, { isPro: true } as any)).toBe('Pro User');
    expect(compose(template, { isElite: true } as any)).toBe('Elite User');
    expect(compose(template, { isPro: true, isElite: true } as any)).toBe('Pro UserElite User');
  });

  it('should handle unless blocks correctly', () => {
    const template = '{{#unless isPro}}Free User{{/unless}}';
    
    expect(compose(template, { isPro: false } as any)).toBe('Free User');
    expect(compose(template, { isPro: true } as any)).toBe('');
  });

  it('should clean up excess whitespace', () => {
    const template = `
      Line 1
      
      
      Line 4
    `;
    const result = compose(template, {} as any);
    expect(result).not.toContain('\n\n\n');
  });
});

describe('Variable Extraction Intelligence', () => {
  it('should inject correct version flags for Next.js 16', () => {
    const vars = extractVariables('nextjs', '16.2.4', 'My App', { language: 'typescript' });
    expect(vars.isNext16).toBe(true);
    expect(vars.isNext15).toBe(false);
  });

  it('should handle Django 6 flags', () => {
    const vars = extractVariables('django', '6.0.0', 'My App', {});
    expect(vars.isDjango6).toBe(true);
    expect(vars.isDjango5).toBe(false);
  });
});
