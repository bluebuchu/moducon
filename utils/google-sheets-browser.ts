// 브라우저 호환 Google Sheets 연동
interface LeaderboardEntry {
  nickname: string;
  stage: number;
  time: number; // in seconds
  accuracy: number;
  date: string;
}

// Google Apps Script Web App URL (나중에 설정)
const GOOGLE_APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || '';

class BrowserGoogleSheetsService {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      if (!GOOGLE_APPS_SCRIPT_URL) {
        console.warn('⚠️ Google Apps Script URL not configured. Using local storage only.');
        this.isInitialized = true;
        return;
      }

      // 간단한 ping 테스트
      const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=ping`, {
        method: 'GET',
        mode: 'cors'
      });

      if (response.ok) {
        console.log('✅ Google Apps Script connected successfully');
        this.isInitialized = true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Failed to initialize Google Apps Script:', error);
      console.log('📱 Falling back to local storage only');
      this.isInitialized = true; // Continue with local storage
    }
  }

  async addLeaderboardEntry(entry: Omit<LeaderboardEntry, 'date'>): Promise<boolean> {
    try {
      await this.initialize();
      
      if (!GOOGLE_APPS_SCRIPT_URL) {
        console.log('📱 Saving to local storage only (Google Apps Script not configured)');
        return true; // Let local storage handle it
      }

      const timestamp = new Date().toISOString();
      const date = new Date().toLocaleDateString('ko-KR');

      const payload = {
        action: 'addEntry',
        data: {
          timestamp,
          nickname: entry.nickname,
          stage: entry.stage,
          time: entry.time,
          accuracy: entry.accuracy.toFixed(2),
          date
        }
      };

      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Entry added to Google Sheets:', result);
        return true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Failed to add entry to Google Sheets:', error);
      console.log('📱 Entry will be saved locally only');
      return false; // Let caller know cloud save failed
    }
  }

  async getLeaderboard(stage?: number): Promise<LeaderboardEntry[]> {
    try {
      await this.initialize();
      
      if (!GOOGLE_APPS_SCRIPT_URL) {
        console.log('📱 Google Apps Script not configured, returning empty array');
        return [];
      }

      const url = stage 
        ? `${GOOGLE_APPS_SCRIPT_URL}?action=getLeaderboard&stage=${stage}`
        : `${GOOGLE_APPS_SCRIPT_URL}?action=getLeaderboard`;

      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors'
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Leaderboard loaded from Google Sheets');
        
        if (result.success && Array.isArray(result.data)) {
          return result.data.map((row: any) => ({
            nickname: row.nickname || '',
            stage: parseInt(row.stage) || 0,
            time: parseInt(row.time) || 0,
            accuracy: parseFloat(row.accuracy) || 0,
            date: row.date || ''
          })).filter((entry: LeaderboardEntry) => 
            entry.nickname && entry.stage && entry.time
          );
        }
        
        return [];
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Failed to fetch leaderboard from Google Sheets:', error);
      return [];
    }
  }

  async getTopEntries(limit: number = 10, stage?: number): Promise<LeaderboardEntry[]> {
    const entries = await this.getLeaderboard(stage);
    return entries.slice(0, limit);
  }
}

// 싱글톤 인스턴스
export const browserGoogleSheetsService = new BrowserGoogleSheetsService();

// 편의 함수들
export const addToBrowserGoogleSheets = (entry: Omit<LeaderboardEntry, 'date'>) => {
  return browserGoogleSheetsService.addLeaderboardEntry(entry);
};

export const getBrowserGoogleSheetsLeaderboard = (stage?: number) => {
  return browserGoogleSheetsService.getLeaderboard(stage);
};

export const getBrowserGoogleSheetsTopEntries = (limit?: number, stage?: number) => {
  return browserGoogleSheetsService.getTopEntries(limit, stage);
};