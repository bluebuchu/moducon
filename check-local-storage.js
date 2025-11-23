// 로컬 스토리지 확인 스크립트 (브라우저 콘솔에서 실행)

console.log('=== 로컬 스토리지 확인 ===');

const STORAGE_KEY = 'cdc_leaderboard_v1';
const saved = localStorage.getItem(STORAGE_KEY);

if (saved) {
    try {
        const entries = JSON.parse(saved);
        console.log('📊 총', entries.length, '개 엔트리 발견:');
        
        entries.forEach((entry, index) => {
            console.log(`${index + 1}. 닉네임: ${entry.nickname}, 스테이지: ${entry.stage}, 시간: ${entry.time}초, 정확도: ${entry.accuracy}%`);
        });
        
        // QuickTest 데이터 필터링
        const testEntries = entries.filter(e => e.nickname.includes('QuickTest') || e.nickname.includes('Test_'));
        const userEntries = entries.filter(e => !e.nickname.includes('QuickTest') && !e.nickname.includes('Test_'));
        
        console.log(`\n🧪 테스트 데이터: ${testEntries.length}개`);
        console.log(`👤 실사용자 데이터: ${userEntries.length}개`);
        
    } catch (error) {
        console.error('❌ 데이터 파싱 실패:', error);
    }
} else {
    console.log('📁 로컬 저장소가 비어있습니다');
}

// 로컬 스토리지 정리 함수
window.clearTestData = function() {
    if (saved) {
        const entries = JSON.parse(saved);
        const userEntries = entries.filter(e => !e.nickname.includes('QuickTest') && !e.nickname.includes('Test_'));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userEntries));
        console.log('✅ 테스트 데이터 정리 완료. 실사용자 데이터', userEntries.length, '개만 남겨둠');
    }
};

console.log('\n🧹 테스트 데이터 정리하려면: clearTestData() 실행');