// Google Sheets에서 테스트 데이터 정리 스크립트
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_APPS_SCRIPT_URL = process.env.VITE_GOOGLE_APPS_SCRIPT_URL;

async function clearTestData() {
  console.log('🧹 Google Sheets 테스트 데이터 정리 시작...');
  console.log('📍 URL:', GOOGLE_APPS_SCRIPT_URL);
  
  if (!GOOGLE_APPS_SCRIPT_URL) {
    console.log('❌ URL이 설정되지 않았습니다');
    return;
  }

  try {
    // 1. 현재 데이터 조회
    console.log('\n📖 1단계: 현재 데이터 조회...');
    const getResponse = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getLeaderboard&t=${Date.now()}`);
    const getResult = await getResponse.json();
    
    if (!getResult.success) {
      console.log('❌ 데이터 조회 실패:', getResult.error);
      return;
    }

    const allEntries = getResult.data;
    console.log(`📊 총 ${allEntries.length}개 기록 발견`);
    
    // 테스트 데이터와 실사용자 데이터 분리
    const testEntries = allEntries.filter(entry => 
      entry.nickname.includes('QuickTest') || 
      entry.nickname.includes('Test_') ||
      entry.nickname.includes('ConnectionTest')
    );
    
    const userEntries = allEntries.filter(entry => 
      !entry.nickname.includes('QuickTest') && 
      !entry.nickname.includes('Test_') &&
      !entry.nickname.includes('ConnectionTest')
    );

    console.log(`🧪 테스트 데이터: ${testEntries.length}개`);
    console.log(`👤 실사용자 데이터: ${userEntries.length}개`);

    if (testEntries.length === 0) {
      console.log('✅ 정리할 테스트 데이터가 없습니다');
      return;
    }

    // 2. 테스트 데이터 삭제 요청
    console.log('\n🗑️ 2단계: 테스트 데이터 삭제...');
    const clearData = {
      action: 'clearTestData',
      testNicknames: testEntries.map(e => e.nickname)
    };

    const clearResponse = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clearData)
    });
    
    const clearResult = await clearResponse.json();
    
    if (clearResult.success) {
      console.log('✅ 테스트 데이터 삭제 완료:', clearResult.message);
    } else {
      console.log('❌ 테스트 데이터 삭제 실패:', clearResult.error);
    }

    // 3. 정리 후 데이터 확인
    console.log('\n📖 3단계: 정리 후 데이터 확인...');
    const finalResponse = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getLeaderboard&t=${Date.now()}`);
    const finalResult = await finalResponse.json();
    
    if (finalResult.success) {
      console.log(`📊 정리 완료! 현재 ${finalResult.data.length}개 기록 (실사용자 데이터만 남음)`);
    }

  } catch (error) {
    console.log('❌ 정리 중 오류 발생:', error.message);
  }
}

clearTestData();