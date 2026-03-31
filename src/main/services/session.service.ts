import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import type { Content } from '@google/genai';

export interface Session {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  model: string;
  systemInstruction?: string;
  messages: Content[];
}

export interface SessionSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  model: string;
  messageCount: number;
}

class SessionService {
  private sessionsDir: string;

  constructor() {
    this.sessionsDir = path.join(app.getPath('userData'), 'sessions');
    this.ensureDir();
  }

  private ensureDir(): void {
    if (!fs.existsSync(this.sessionsDir)) {
      fs.mkdirSync(this.sessionsDir, { recursive: true });
    }
  }

  private sessionPath(id: string): string {
    // Prevent path traversal
    const sanitized = id.replace(/[^a-zA-Z0-9-]/g, '');
    return path.join(this.sessionsDir, `${sanitized}.json`);
  }

  async list(): Promise<SessionSummary[]> {
    const files = fs.readdirSync(this.sessionsDir).filter((f) => f.endsWith('.json'));
    const summaries: SessionSummary[] = [];

    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(this.sessionsDir, file), 'utf-8');
        const session: Session = JSON.parse(raw);
        summaries.push({
          id: session.id,
          title: session.title,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          model: session.model,
          messageCount: session.messages.length,
        });
      } catch {
        // Skip corrupted files
      }
    }

    return summaries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async create(model: string): Promise<Session> {
    const session: Session = {
      id: uuidv4(),
      title: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      model,
      messages: [],
    };

    fs.writeFileSync(this.sessionPath(session.id), JSON.stringify(session, null, 2));
    return session;
  }

  async get(id: string): Promise<Session | null> {
    const filePath = this.sessionPath(id);
    if (!fs.existsSync(filePath)) return null;

    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  }

  async update(id: string, data: Partial<Session>): Promise<Session | null> {
    const session = await this.get(id);
    if (!session) return null;

    Object.assign(session, data, { updatedAt: new Date().toISOString() });
    fs.writeFileSync(this.sessionPath(id), JSON.stringify(session, null, 2));
    return session;
  }

  async appendMessages(id: string, messages: Content[]): Promise<Session | null> {
    const session = await this.get(id);
    if (!session) return null;

    session.messages.push(...messages);
    session.updatedAt = new Date().toISOString();

    // Auto-generate title from first user message
    // Check if title is still the default (hasn't been customized)
    const isDefaultTitle =
      session.title === 'New Chat' || session.title === '新規チャット' || session.title.trim() === '';
    if (isDefaultTitle) {
      const firstUserMsg = session.messages.find((m) => m.role === 'user');
      if (firstUserMsg?.parts) {
        const textPart = firstUserMsg.parts.find((p) => 'text' in p);
        if (textPart && 'text' in textPart) {
          session.title = textPart.text.slice(0, 50) + (textPart.text.length > 50 ? '...' : '');
        }
      }
    }

    fs.writeFileSync(this.sessionPath(id), JSON.stringify(session, null, 2));
    return session;
  }

  async delete(id: string): Promise<boolean> {
    const filePath = this.sessionPath(id);
    if (!fs.existsSync(filePath)) return false;

    fs.unlinkSync(filePath);
    return true;
  }
}

export const sessionService = new SessionService();
