import { describe, it, expect } from 'vitest';
import { sanitize, sanitizeWithLimit, isRequired, isValidJson, LIMITS } from '../renderer/utils/validation';

describe('sanitize', () => {
  it('trims whitespace', () => {
    expect(sanitize('  hello  ')).toBe('hello');
  });

  it('strips HTML tags', () => {
    expect(sanitize('<script>alert("xss")</script>hello')).toBe('alert("xss")hello');
    expect(sanitize('<b>bold</b> text')).toBe('bold text');
  });

  it('strips control characters', () => {
    expect(sanitize('hello\x00world')).toBe('helloworld');
    expect(sanitize('hello\x07bell')).toBe('hellobell');
  });

  it('preserves newlines and tabs', () => {
    expect(sanitize('line1\nline2\ttab')).toBe('line1\nline2\ttab');
  });

  it('handles empty string', () => {
    expect(sanitize('')).toBe('');
    expect(sanitize('   ')).toBe('');
  });
});

describe('sanitizeWithLimit', () => {
  it('truncates to max length', () => {
    expect(sanitizeWithLimit('abcdefgh', 5)).toBe('abcde');
  });

  it('does not truncate short strings', () => {
    expect(sanitizeWithLimit('abc', 5)).toBe('abc');
  });
});

describe('isRequired', () => {
  it('returns false for empty/null/undefined', () => {
    expect(isRequired('')).toBe(false);
    expect(isRequired('   ')).toBe(false);
    expect(isRequired(null)).toBe(false);
    expect(isRequired(undefined)).toBe(false);
  });

  it('returns true for non-empty', () => {
    expect(isRequired('hello')).toBe(true);
    expect(isRequired(' x ')).toBe(true);
  });
});

describe('isValidJson', () => {
  it('validates correct JSON', () => {
    expect(isValidJson('[]')).toBe(true);
    expect(isValidJson('{"key": "value"}')).toBe(true);
    expect(isValidJson('[{"name":"test"}]')).toBe(true);
  });

  it('accepts empty string', () => {
    expect(isValidJson('')).toBe(true);
    expect(isValidJson('  ')).toBe(true);
  });

  it('rejects invalid JSON', () => {
    expect(isValidJson('not json')).toBe(false);
    expect(isValidJson('{invalid}')).toBe(false);
  });
});

describe('LIMITS', () => {
  it('has expected values', () => {
    expect(LIMITS.name).toBe(100);
    expect(LIMITS.description).toBe(500);
    expect(LIMITS.prompt).toBe(10000);
  });
});
