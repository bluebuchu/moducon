// 테스트 엔트리 추가 스크립트 (GET 요청 방식)
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_APPS_SCRIPT_URL = process.env.VITE_GOOGLE_APPS_SCRIPT_URL;

async function testAddEntry() {
  console.log('🎮 테스트 엔트리 추가 시작...');
  
  if (!GOOGLE_APPS_SCRIPT_URL) {
    console.log('❌ URL이 설정되지 않았습니다');
    return;
  }

  try {
    // GET 요청으로 데이터 전달
    const params = new URLSearchParams({
      action: 'addEntry',
      timestamp: new Date().toISOString(),
      nickname: '테스트사용자',
      stage: '3',
      time: '180',
      accuracy: '95.5',
      date: new Date().toLocaleDateString('ko-KR'),
      t: Date.now().toString()
    });

    const url = `${GOOGLE_APPS_SCRIPT_URL}?${params.toString()}`;
    console.log('🔗 GET 요청 URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 엔트리 추가 성공:', result);
    } else {
      const errorText = await response.text();
      console.error('❌ 엔트리 추가 실패:', `HTTP ${response.status}: ${errorText}`);
    }

    // 데이터 조회
    console.log('\n📊 리더보드 확인...');
    const getUrl = `${GOOGLE_APPS_SCRIPT_URL}?action=getLeaderboard&t=${Date.now()}`;
    const getResponse = await fetch(getUrl);
    const getResult = await getResponse.json();
    
    if (getResult.success) {
      console.log(`✅ 총 ${getResult.data.length}개 엔트리:`, getResult.data);
    }

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

testAddEntry();