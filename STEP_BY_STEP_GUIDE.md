# 🎯 moducon Google Sheets 연결 완벽 가이드

## 📖 시작하기 전에
- ✅ 게임이 `http://localhost:5174`에서 정상 작동하는지 확인
- ✅ Google 계정이 준비되어 있는지 확인
- ⏱️ 예상 소요시간: **5-10분**

---

## 🔍 **STEP 1: 스프레드시트 확인**

### 1-1. 기존 스프레드시트 접속 시도
🔗 **이 링크를 클릭하세요:**
```
https://docs.google.com/spreadsheets/d/1J7cwwbBgulbsQPZ4RVS3iWitJlV_5Etm9opQDEV41aA/edit
```

### 1-2. 결과에 따른 다음 단계

**✅ 접속 성공 (스프레드시트가 보임)**
- [ ] 제목이 "Moducon Color Game Leaderboard"인지 확인
- [ ] STEP 2로 바로 이동

**❌ "권한이 없습니다" 또는 "찾을 수 없습니다"**
- [ ] 새 스프레드시트 생성 필요
- [ ] 아래 1-3 단계 진행

### 1-3. 새 스프레드시트 생성 (필요시)

1. **Google Sheets 접속**
   ```
   https://sheets.google.com/
   ```

2. **새 스프레드시트 만들기**
   - [ ] "빈 스프레드시트" 또는 "+" 버튼 클릭

3. **제목 설정**
   - [ ] 좌상단 "제목 없는 스프레드시트" 클릭
   - [ ] **"Moducon Color Game Leaderboard"** 입력

4. **스프레드시트 ID 복사**
   - [ ] 주소창 URL에서 ID 부분 복사
   ```
   https://docs.google.com/spreadsheets/d/[이_부분이_ID]/edit
   ```
   - [ ] 복사한 ID를 어딘가에 메모

---

## 🛠️ **STEP 2: Google Apps Script 설정**

### 2-1. Apps Script 접속
🔗 **새 탭에서 이 링크 열기:**
```
https://script.google.com/
```

### 2-2. 프로젝트 생성
- [ ] **"새 프로젝트"** 버튼 클릭 (파란색 + 버튼)
- [ ] 좌상단 **"제목 없는 프로젝트"** 클릭
- [ ] **"Moducon Sheets API"** 입력 후 엔터

### 2-3. 코드 작성
1. **기존 코드 삭제**
   - [ ] Code.gs 파일의 모든 내용을 **Ctrl+A → Delete**로 삭제

2. **새 코드 붙여넣기**
   - [ ] 아래 코드를 **완전히 복사** (Ctrl+A → Ctrl+C)

```javascript
// ⚠️ 중요: 여기에 실제 스프레드시트 ID를 입력하세요!
const SPREADSHEET_ID = '1J7cwwbBgulbsQPZ4RVS3iWitJlV_5Etm9opQDEV41aA';

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'ping') {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          message: 'Moducon API 연결 성공! 🎉',
          timestamp: new Date().toISOString(),
          spreadsheetId: SPREADSHEET_ID
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'getLeaderboard') {
      const stage = e.parameter.stage;
      return getLeaderboard(stage);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Unknown action: ' + action
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'doGet Error: ' + error.toString(),
        stack: error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'addEntry') {
      return addLeaderboardEntry(data.data);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Unknown POST action: ' + data.action
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'doPost Error: ' + error.toString(),
        stack: error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function addLeaderboardEntry(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName('Leaderboard');
    
    // Leaderboard 시트가 없으면 생성
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Leaderboard');
      // 헤더 설정
      sheet.getRange(1, 1, 1, 6).setValues([
        ['Timestamp', 'Nickname', 'Stage', 'Time(seconds)', 'Accuracy', 'Date']
      ]);
      
      // 헤더 스타일링
      const headerRange = sheet.getRange(1, 1, 1, 6);
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
      headerRange.setFontWeight('bold');
    }
    
    // 새 기록 추가
    sheet.appendRow([
      data.timestamp,
      data.nickname,
      data.stage,
      data.time,
      data.accuracy,
      data.date
    ]);
    
    // 데이터 정렬 (시간순)
    const dataRange = sheet.getDataRange();
    if (dataRange.getNumRows() > 1) {
      dataRange.sort(4); // Time 컬럼 기준 정렬
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: '🎯 새 기록이 리더보드에 추가되었습니다!',
        addedData: data
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'addEntry Error: ' + error.toString(),
        stack: error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getLeaderboard(stage) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName('Leaderboard');
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          data: [],
          message: 'Leaderboard 시트가 아직 없습니다. 첫 기록을 등록하세요!'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          data: [],
          message: '아직 등록된 기록이 없습니다.'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    // 데이터를 객체 배열로 변환
    const entries = rows.map(row => {
      const entry = {};
      headers.forEach((header, index) => {
        if (header === 'Nickname') entry.nickname = row[index] || '';
        if (header === 'Stage') entry.stage = Number(row[index]) || 0;
        if (header === 'Time(seconds)') entry.time = Number(row[index]) || 0;
        if (header === 'Accuracy') entry.accuracy = Number(row[index]) || 0;
        if (header === 'Date') entry.date = row[index] || '';
      });
      return entry;
    }).filter(entry => entry.nickname && entry.stage && entry.time);
    
    // 스테이지별 필터링
    let filteredEntries = entries;
    if (stage) {
      filteredEntries = entries.filter(entry => entry.stage == Number(stage));
    }
    
    // 시간순 정렬 (빠른 시간이 상위)
    filteredEntries.sort((a, b) => a.time - b.time);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: filteredEntries,
        total: entries.length,
        filtered: filteredEntries.length,
        stage: stage || 'all'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'getLeaderboard Error: ' + error.toString(),
        stack: error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 테스트용 함수
function testConnection() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('✅ 스프레드시트 연결 성공: ' + spreadsheet.getName());
    return true;
  } catch (error) {
    Logger.log('❌ 스프레드시트 연결 실패: ' + error.toString());
    return false;
  }
}
```

3. **스프레드시트 ID 확인/수정**
   - [ ] 코드 첫 줄에 올바른 스프레드시트 ID가 있는지 확인
   - [ ] 만약 STEP 1에서 새로 만들었다면, 해당 ID로 변경

4. **저장**
   - [ ] **Ctrl+S** 또는 상단의 저장 아이콘 클릭

---

## 🚀 **STEP 3: 웹 앱 배포**

### 3-1. 배포 시작
- [ ] 우상단 **"배포"** 버튼 클릭
- [ ] **"새 배포"** 선택

### 3-2. 웹 앱 설정
1. **유형 선택**
   - [ ] **"유형 선택"** 옆 ⚙️ 톱니바퀴 아이콘 클릭
   - [ ] **"웹 앱"** 선택

2. **설정 입력**
   - [ ] **설명**: "Moducon Color Game API v1" 입력
   - [ ] **실행 계정**: **"나"** 선택 (중요!)
   - [ ] **액세스 권한**: **"모든 사용자"** 선택 (중요!)

3. **배포 실행**
   - [ ] **"배포"** 버튼 클릭

### 3-3. 권한 승인 (처음에만)
**"승인 검토" 대화상자가 나타나면:**

1. **액세스 검토**
   - [ ] **"액세스 검토"** 버튼 클릭

2. **계정 선택**
   - [ ] Google 계정 선택

3. **고급 옵션**
   - [ ] **"고급"** 링크 클릭
   - [ ] **"Moducon Sheets API(안전하지 않음)으로 이동"** 클릭

4. **권한 허용**
   - [ ] **"허용"** 버튼 클릭

### 3-4. URL 복사
**배포 완료 후:**
- [ ] **"웹 앱 URL"** 전체 복사
```
https://script.google.com/macros/s/AKfycby...여러글자.../exec
```
- [ ] 복사한 URL을 어딘가에 **안전하게 저장**

---

## ⚙️ **STEP 4: 환경변수 설정**

### 4-1. .env 파일 열기
**프로젝트 폴더에서:**
- [ ] `.env` 파일 열기 (VS Code, 메모장 등)

### 4-2. URL 설정
1. **VITE_GOOGLE_APPS_SCRIPT_URL 찾기**
   ```bash
   VITE_GOOGLE_APPS_SCRIPT_URL=
   ```

2. **URL 입력**
   - [ ] `=` 뒤에 STEP 3에서 복사한 URL 붙여넣기
   ```bash
   VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycby.../exec
   ```

3. **저장**
   - [ ] 파일 저장 (Ctrl+S)

### 4-3. 개발 서버 재시작
**터미널에서:**
- [ ] **Ctrl+C**로 서버 중지
- [ ] `npm run dev` 다시 실행
- [ ] "http://localhost:5174" 접속 확인

---

## 🧪 **STEP 5: 연결 테스트**

### 5-1. 기본 연결 테스트
1. **게임 페이지 접속**
   - [ ] `http://localhost:5174` 브라우저에서 열기

2. **연결 테스트 실행**
   - [ ] 우상단 **"Google Sheets 연결 테스트"** 버튼 클릭

3. **성공 메시지 확인**
   ```
   ✅ 브라우저 연결 테스트 성공!
   📊 총 X개 기록 조회됨
   🎉 Google Apps Script 연동이 정상적으로 작동합니다!
   ```

### 5-2. 실제 게임 테스트
1. **게임 플레이**
   - [ ] Easy/Normal/Hard 로고 선택
   - [ ] 색상 맞추기 게임 진행
   - [ ] 모든 단계 완료

2. **기록 등록**
   - [ ] 닉네임 입력 모달에서 이름 입력
   - [ ] "등록" 버튼 클릭

3. **리더보드 확인**
   - [ ] **"리더보드"** 버튼 클릭
   - [ ] 우상단 **"새로고침"** 버튼 클릭
   - [ ] **"Cloud"** 표시 확인 (로컬이 아님)

### 5-3. Google Sheets 직접 확인
- [ ] 스프레드시트 페이지로 돌아가기
- [ ] "Leaderboard" 시트에 데이터가 추가되었는지 확인

---

## 🔧 **문제 해결**

### ❌ "CORS 에러" 발생 시
**브라우저 콘솔에 CORS 관련 에러가 있다면:**

1. **Apps Script로 돌아가기**
   - [ ] Google Apps Script 탭으로 이동

2. **재배포**
   - [ ] **"배포"** → **"배포 관리"** 클릭
   - [ ] 기존 배포 옆 ✏️ **"편집"** 클릭  
   - [ ] **"새 버전"** 체크
   - [ ] **"배포"** 클릭

3. **URL 업데이트**
   - [ ] 새로운 URL이 생성되었는지 확인
   - [ ] `.env` 파일의 URL 업데이트 (필요시)

### ❌ "권한 거부" 에러 발생 시
**스프레드시트 접근 권한 문제:**

1. **스프레드시트 공유 설정**
   - [ ] Google Sheets에서 **"공유"** 버튼 클릭
   - [ ] **"링크가 있는 모든 사용자"** 선택
   - [ ] 권한을 **"편집자"**로 설정
   - [ ] **"완료"** 클릭

### ❌ "Script Error" 발생 시
**Apps Script 실행 오류:**

1. **스크립트 테스트**
   - [ ] Apps Script에서 **"실행"** → **"testConnection"** 클릭
   - [ ] **"실행 로그"** 또는 **"로그"** 탭에서 에러 확인

2. **스프레드시트 ID 재확인**
   - [ ] 코드의 `SPREADSHEET_ID` 값이 정확한지 확인
   - [ ] 실제 스프레드시트 URL과 비교

### ❌ 여전히 "로컬 모드"인 경우
1. **환경변수 재확인**
   - [ ] `.env` 파일에 URL이 정확히 입력되었는지 확인
   - [ ] 앞뒤 공백이 없는지 확인

2. **서버 재시작**
   - [ ] `Ctrl+C` → `npm run dev` 다시 실행

3. **브라우저 캐시 삭제**
   - [ ] `Ctrl+Shift+R`로 하드 리프레시

---

## ✅ **완료 체크리스트**

모든 단계가 완료되면 다음이 가능해야 합니다:

- [ ] 게임 플레이 후 닉네임 등록 가능
- [ ] 리더보드에서 "Cloud" 표시 확인
- [ ] Google Sheets에 실시간 데이터 저장 확인
- [ ] 다른 기기에서도 동일한 리더보드 확인

**🎉 축하합니다! moducon 게임이 Google Sheets와 성공적으로 연결되었습니다!**

---

## 📞 **추가 도움**

**문제가 계속 발생하면:**
1. 브라우저 개발자 도구(F12) → Console 탭에서 에러 메시지 확인
2. Apps Script → 실행 로그에서 에러 확인  
3. 각 단계를 천천히 다시 따라해보기

**성공하면 게임을 즐기세요! 🎮**