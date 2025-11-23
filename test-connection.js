// Google Sheets 연결 테스트 스크립트
// 사용법: node test-connection.js

import { googleSheetsService } from './utils/google-sheets.js';

async function testConnection() {
  console.log('🔌 Google Sheets 연결 테스트 시작...\n');
  
  try {
    // 초기화 테스트
    console.log('1. 초기화 중...');
    await googleSheetsService.initialize();
    console.log('✅ 초기화 성공!\n');
    
    // 테스트 데이터 추가
    console.log('2. 테스트 데이터 추가 중...');
    const testEntry = {
      nickname: 'TestPlayer',
      stage: 4,
      time: 180,
      accuracy: 95.5
    };
    
    const result = await googleSheetsService.addLeaderboardEntry(testEntry);
    
    if (result) {
      console.log('✅ 테스트 데이터 추가 성공!\n');
      
      // 데이터 조회 테스트
      console.log('3. 데이터 조회 중...');
      const entries = await googleSheetsService.getLeaderboard();
      console.log(`✅ 총 ${entries.length}개 기록 조회 성공!`);
      
      if (entries.length > 0) {
        console.log('최근 기록 미리보기:');
        entries.slice(0, 3).forEach((entry, index) => {
          console.log(`  ${index + 1}. ${entry.nickname} - Stage ${entry.stage} - ${Math.floor(entry.time/60)}:${(entry.time%60).toString().padStart(2,'0')} - ${entry.accuracy.toFixed(1)}%`);
        });
      }
      
      console.log('\n🎉 Google Sheets 연결 테스트 완료!');
      console.log('이제 앱에서 리더보드 기능을 사용할 수 있습니다.');
      
    } else {
      console.log('❌ 테스트 데이터 추가 실패');
    }
    
  } catch (error) {
    console.error('❌ 연결 테스트 실패:', error.message);
    console.log('\n🔧 해결 방법:');
    console.log('1. .env 파일의 환경변수가 올바른지 확인');
    console.log('2. Google Sheets에 서비스 계정이 공유되어 있는지 확인');
    console.log('3. Google Sheets API가 활성화되어 있는지 확인');
    console.log('4. GOOGLE_SHEETS_SETUP.md 가이드를 다시 확인');
  }
}

// 환경변수 체크
function checkEnvVars() {
  const required = [
    'VITE_GOOGLE_SHEET_ID',
    'VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL', 
    'VITE_GOOGLE_PRIVATE_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key] || process.env[key].includes('your_'));
  
  if (missing.length > 0) {
    console.log('❌ 환경변수 설정이 필요합니다:');
    missing.forEach(key => console.log(`   - ${key}`));
    console.log('\n📖 설정 방법은 GOOGLE_SHEETS_SETUP.md를 참고하세요.');
    return false;
  }
  
  console.log('✅ 환경변수 설정 확인됨\n');
  return true;
}

if (checkEnvVars()) {
  testConnection();
}