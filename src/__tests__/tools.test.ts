import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Import tool execute functions directly
import { readFileTool } from '../main/tools/read-file.tool';
import { writeFileTool } from '../main/tools/write-file.tool';
import { editFileTool } from '../main/tools/edit-file.tool';
import { grepTool } from '../main/tools/grep.tool';
import { globTool } from '../main/tools/glob.tool';

const tmpDir = path.join(os.tmpdir(), 'gemini-app-test');

beforeEach(() => {
  fs.mkdirSync(tmpDir, { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('read_file', () => {
  it('reads file content', async () => {
    const filePath = path.join(tmpDir, 'test.txt');
    fs.writeFileSync(filePath, 'hello\nworld\nfoo');

    const result = (await readFileTool.execute({ path: filePath })) as Record<string, unknown>;
    expect(result.content).toBe('hello\nworld\nfoo');
    expect(result.lines).toBe(3);
  });

  it('reads line range', async () => {
    const filePath = path.join(tmpDir, 'test.txt');
    fs.writeFileSync(filePath, 'line1\nline2\nline3\nline4');

    const result = (await readFileTool.execute({ path: filePath, startLine: 2, endLine: 3 })) as Record<
      string,
      unknown
    >;
    expect(result.content).toBe('line2\nline3');
  });

  it('returns error for missing file', async () => {
    const result = (await readFileTool.execute({ path: '/nonexistent/file.txt' })) as Record<string, unknown>;
    expect(result.error).toContain('not found');
  });

  it('returns error for directory', async () => {
    const result = (await readFileTool.execute({ path: tmpDir })) as Record<string, unknown>;
    expect(result.error).toContain('directory');
  });
});

describe('write_file', () => {
  it('writes file content', async () => {
    const filePath = path.join(tmpDir, 'output.txt');
    const result = (await writeFileTool.execute({ path: filePath, content: 'hello world' })) as Record<string, unknown>;

    expect(result.path).toBe(filePath);
    expect(fs.readFileSync(filePath, 'utf-8')).toBe('hello world');
  });

  it('creates parent directories', async () => {
    const filePath = path.join(tmpDir, 'nested', 'dir', 'file.txt');
    await writeFileTool.execute({ path: filePath, content: 'deep' });

    expect(fs.existsSync(filePath)).toBe(true);
    expect(fs.readFileSync(filePath, 'utf-8')).toBe('deep');
  });
});

describe('edit_file', () => {
  it('replaces unique string', async () => {
    const filePath = path.join(tmpDir, 'edit.txt');
    fs.writeFileSync(filePath, 'aaa bbb ccc');

    const result = (await editFileTool.execute({
      path: filePath,
      old_string: 'bbb',
      new_string: 'XXX',
    })) as Record<string, unknown>;

    expect(result.replaced).toBe(true);
    expect(fs.readFileSync(filePath, 'utf-8')).toBe('aaa XXX ccc');
  });

  it('errors if string not found', async () => {
    const filePath = path.join(tmpDir, 'edit.txt');
    fs.writeFileSync(filePath, 'aaa bbb ccc');

    const result = (await editFileTool.execute({
      path: filePath,
      old_string: 'zzz',
      new_string: 'XXX',
    })) as Record<string, unknown>;

    expect(result.error).toContain('not found');
  });

  it('errors if string not unique', async () => {
    const filePath = path.join(tmpDir, 'edit.txt');
    fs.writeFileSync(filePath, 'aaa bbb aaa');

    const result = (await editFileTool.execute({
      path: filePath,
      old_string: 'aaa',
      new_string: 'XXX',
    })) as Record<string, unknown>;

    expect(result.error).toContain('2 times');
  });
});

describe('grep', () => {
  it('finds matching lines', async () => {
    const filePath = path.join(tmpDir, 'search.txt');
    fs.writeFileSync(filePath, 'foo bar\nbaz qux\nfoo baz');

    const result = (await grepTool.execute({ pattern: 'foo', path: tmpDir })) as Record<string, unknown>;
    expect(result.totalMatches).toBe(2);
  });

  it('returns empty for no match', async () => {
    const filePath = path.join(tmpDir, 'search.txt');
    fs.writeFileSync(filePath, 'foo bar');

    const result = (await grepTool.execute({ pattern: 'zzz', path: tmpDir })) as Record<string, unknown>;
    expect(result.message).toContain('No matches');
  });
});

describe('glob', () => {
  it('finds files matching pattern', async () => {
    fs.writeFileSync(path.join(tmpDir, 'a.ts'), '');
    fs.writeFileSync(path.join(tmpDir, 'b.ts'), '');
    fs.writeFileSync(path.join(tmpDir, 'c.js'), '');

    const result = (await globTool.execute({ pattern: '*.ts', cwd: tmpDir })) as Record<string, unknown>;
    expect(result.totalFiles).toBe(2);
  });
});
