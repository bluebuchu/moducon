// 브라우저 호환 Google Sheets 연동 (Google Apps Script 기반)
interface LeaderboardEntry {
  nickname: string;
  stage: number;
  time: number; // in seconds
  accuracy: number;
  date: string;
}

// Google Apps Script Web App URL
const GOOGLE_APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || '';

class GoogleSheetsService {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      if (!GOOGLE_APPS_SCRIPT_URL) {
        console.warn('⚠️ Google Apps Script URL not configured. Using local storage only.');
        this.isInitialized = true;
        return;
      }

      // 간단한 연결 테스트 (타임아웃 설정)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

      try {
        const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=ping&t=${Date.now()}`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Google Apps Script connected successfully:', result);
          this.isInitialized = true;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.error('❌ Failed to initialize Google Apps Script:', error);
      console.log('📱 네트워크 문제로 인해 로컬 저장소만 사용합니다');
      console.log('📝 나중에 다시 시도하거나 네트워크 연결을 확인해주세요');
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

      // Google Apps Script는 CORS 문제로 POST 대신 GET 요청 사용
      // 데이터를 URL 파라미터로 전달
      const params = new URLSearchParams({
        action: 'addEntry',
        timestamp: timestamp,
        nickname: entry.nickname,
        stage: entry.stage.toString(),
        time: entry.time.toString(),
        accuracy: entry.accuracy.toFixed(2),
        date: date,
        t: Date.now().toString() // 캐시 방지
      });

      const url = `${GOOGLE_APPS_SCRIPT_URL}?${params.toString()}`;
      console.log('🔗 Sending data to Google Sheets via GET');

      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Entry added to Google Sheets via Apps Script:', result);
        return true;
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
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
        ? `${GOOGLE_APPS_SCRIPT_URL}?action=getLeaderboard&stage=${stage}&t=${Date.now()}`
        : `${GOOGLE_APPS_SCRIPT_URL}?action=getLeaderboard&t=${Date.now()}`;

      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Leaderboard loaded from Google Sheets via Apps Script');
        
        if (result.success && Array.isArray(result.data)) {
          return result.data.map((row: any) => ({
            nickname: row.nickname || '',
            stage: parseInt(row.stage) || 0,
            time: parseInt(row.time) || 0,
            accuracy: parseFloat(row.accuracy) || 0,
            date: row.date || ''
          })).filter((entry: LeaderboardEntry) => 
            entry.nickname && entry.stage && entry.time
          ).sort((a: LeaderboardEntry, b: LeaderboardEntry) => a.time - b.time);
        }
        
        return [];
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
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
export const googleSheetsService = new GoogleSheetsService();

// 편의 함수들
export const addToGoogleSheets = (entry: Omit<LeaderboardEntry, 'date'>) => {
  return googleSheetsService.addLeaderboardEntry(entry);
};

export const getGoogleSheetsLeaderboard = (stage?: number) => {
  return googleSheetsService.getLeaderboard(stage);
};

export const getGoogleSheetsTopEntries = (limit?: number, stage?: number) => {
  return googleSheetsService.getTopEntries(limit, stage);
};