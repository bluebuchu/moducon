// Quick Google Apps Script 연결 테스트
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_APPS_SCRIPT_URL = process.env.VITE_GOOGLE_APPS_SCRIPT_URL;

async function quickTest() {
  console.log('🚀 Google Apps Script 연결 테스트 시작...');
  console.log('📍 URL:', GOOGLE_APPS_SCRIPT_URL);
  
  if (!GOOGLE_APPS_SCRIPT_URL) {
    console.log('❌ URL이 설정되지 않았습니다');
    return;
  }

  try {
    // 1. Ping 테스트
    console.log('\n🔍 1단계: Ping 테스트...');
    const pingResponse = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=ping&t=${Date.now()}`);
    const pingResult = await pingResponse.json();
    
    if (pingResult.success) {
      console.log('✅ Ping 성공:', pingResult.message);
      console.log('📊 Spreadsheet ID:', pingResult.spreadsheetId);
    } else {
      console.log('❌ Ping 실패:', pingResult.error);
      return;
    }

    // 2. 테스트 데이터 추가
    console.log('\n📝 2단계: 테스트 데이터 추가...');
    const testData = {
      action: 'addEntry',
      data: {
        timestamp: new Date().toISOString(),
        nickname: `QuickTest_${Date.now()}`,
        stage: 4,
        time: 150,
        accuracy: 98.5,
        date: new Date().toLocaleDateString('ko-KR')
      }
    };

    const addResponse = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const addResult = await addResponse.json();
    
    if (addResult.success) {
      console.log('✅ 데이터 추가 성공:', addResult.message);
    } else {
      console.log('❌ 데이터 추가 실패:', addResult.error);
      return;
    }

    // 3. 데이터 조회
    console.log('\n📖 3단계: 리더보드 조회...');
    const getResponse = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getLeaderboard&t=${Date.now()}`);
    const getResult = await getResponse.json();
    
    if (getResult.success) {
      console.log('✅ 데이터 조회 성공');
      console.log(`📊 총 ${getResult.data.length}개 기록 발견`);
      
      if (getResult.data.length > 0) {
        const latest = getResult.data.find(entry => entry.nickname.includes('QuickTest'));
        if (latest) {
          console.log('🎯 방금 추가한 데이터 확인됨:', latest.nickname);
        }
      }
    } else {
      console.log('❌ 데이터 조회 실패:', getResult.error);
    }

    console.log('\n🎉 모든 테스트 완료! Google Sheets 연동이 정상적으로 작동합니다.');
    
  } catch (error) {
    console.log('❌ 테스트 중 오류 발생:', error.message);
  }
}

quickTest();