import { app, net } from 'electron';

export interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion?: string;
  releaseUrl?: string;
  releaseName?: string;
}

const GITHUB_OWNER = 'Harurow';
const GITHUB_REPO = 'gemini-app';

class UpdateService {
  private cachedResult: UpdateInfo | null = null;
  private lastCheckTime = 0;
  private readonly cacheDurationMs = 60 * 60 * 1000; // 1 hour

  async check(): Promise<UpdateInfo> {
    const now = Date.now();
    if (this.cachedResult && now - this.lastCheckTime < this.cacheDurationMs) {
      return this.cachedResult;
    }

    const currentVersion = app.getVersion();

    try {
      const data = await this.fetchLatestRelease();
      if (!data || !data.tag_name) {
        return { hasUpdate: false, currentVersion };
      }

      const latestVersion = (data.tag_name as string).replace(/^v/, '');
      const hasUpdate = this.isNewer(latestVersion, currentVersion);

      this.cachedResult = {
        hasUpdate,
        currentVersion,
        latestVersion,
        releaseUrl: data.html_url as string,
        releaseName: (data.name as string) || `v${latestVersion}`,
      };
      this.lastCheckTime = now;

      return this.cachedResult;
    } catch (error) {
      console.error('[Update] Check failed:', error);
      return { hasUpdate: false, currentVersion };
    }
  }

  private fetchLatestRelease(): Promise<Record<string, unknown>> {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;

    return new Promise((resolve, reject) => {
      const request = net.request(url);
      request.setHeader('Accept', 'application/vnd.github.v3+json');
      request.setHeader('User-Agent', `GeminiDesktop/${app.getVersion()}`);

      let body = '';
      request.on('response', (response) => {
        if (response.statusCode === 404) {
          // No releases yet
          resolve({});
          return;
        }
        response.on('data', (chunk) => {
          body += chunk.toString();
        });
        response.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            reject(new Error('Invalid JSON response'));
          }
        });
      });
      request.on('error', reject);
      request.end();
    });
  }

  /**
   * Compare semver: returns true if latest > current
   */
  private isNewer(latest: string, current: string): boolean {
    const parse = (v: string) => v.split('.').map((n) => parseInt(n, 10) || 0);
    const l = parse(latest);
    const c = parse(current);

    for (let i = 0; i < Math.max(l.length, c.length); i++) {
      const lv = l[i] || 0;
      const cv = c[i] || 0;
      if (lv > cv) return true;
      if (lv < cv) return false;
    }
    return false;
  }
}

export const updateService = new UpdateService();
