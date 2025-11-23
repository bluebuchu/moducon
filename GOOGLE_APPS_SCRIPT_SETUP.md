# Google Apps Script 설정 가이드

moducon 색상 게임의 브라우저 호환 Google Sheets 연동을 위한 Google Apps Script 설정 방법입니다.

## 1. Google Apps Script 프로젝트 생성

1. [Google Apps Script](https://script.google.com/) 접속
2. "새 프로젝트" 클릭
3. 프로젝트 이름을 "Moducon Sheets API"로 변경

## 2. 코드 작성

기본 `Code.gs` 파일에 다음 코드를 붙여넣으세요:

```javascript
// Google Sheets ID - 실제 스프레드시트 ID로 변경하세요
const SPREADSHEET_ID = '1J7cwwbBgulbsQPZ4RVS3iWitJlV_5Etm9opQDEV41aA';

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'ping') {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          message: 'Google Apps Script is working',
          timestamp: new Date().toISOString()
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
        error: 'Unknown action'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
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
        error: 'Unknown action'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function addLeaderboardEntry(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName('Leaderboard');
    
    // 시트가 없으면 생성
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Leaderboard');
      // 헤더 설정
      sheet.getRange(1, 1, 1, 6).setValues([
        ['Timestamp', 'Nickname', 'Stage', 'Time(seconds)', 'Accuracy', 'Date']
      ]);
    }
    
    // 새 행 추가
    sheet.appendRow([
      data.timestamp,
      data.nickname,
      data.stage,
      data.time,
      data.accuracy,
      data.date
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Entry added successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
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
          data: []
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    // 데이터를 객체 배열로 변환
    const entries = rows.map(row => {
      const entry = {};
      headers.forEach((header, index) => {
        if (header === 'Nickname') entry.nickname = row[index];
        if (header === 'Stage') entry.stage = row[index];
        if (header === 'Time(seconds)') entry.time = row[index];
        if (header === 'Accuracy') entry.accuracy = row[index];
        if (header === 'Date') entry.date = row[index];
      });
      return entry;
    }).filter(entry => entry.nickname && entry.stage && entry.time);
    
    // 스테이지별 필터링
    const filteredEntries = stage ? 
      entries.filter(entry => entry.stage == stage) : 
      entries;
    
    // 시간순 정렬
    filteredEntries.sort((a, b) => a.time - b.time);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: filteredEntries
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 3. 스프레드시트 ID 설정

1. [Google Sheets](https://sheets.google.com/)에서 "Moducon Color Game Leaderboard" 스프레드시트 열기
2. URL에서 스프레드시트 ID 복사: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
3. 코드의 첫 번째 줄 `SPREADSHEET_ID` 값을 실제 ID로 변경

## 4. 웹 앱으로 배포

1. Apps Script 편집기에서 "배포" > "새 배포" 클릭
2. 유형 선택: "웹 앱" 선택
3. 설정:
   - **실행 계정**: "나"
   - **액세스 권한**: "모든 사용자"
4. "배포" 클릭
5. 웹 앱 URL 복사 (예: `https://script.google.com/macros/s/.../exec`)

## 5. 환경변수 설정

`.env` 파일에 Apps Script URL 추가:

```bash
VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

## 6. 테스트

1. 브라우저에서 `http://localhost:5174` 접속
2. 우상단 "Google Sheets 연결 테스트" 버튼 클릭
3. 성공 메시지 확인

## 7. CORS 문제 해결

만약 CORS 에러가 발생한다면:

1. Apps Script에서 "배포" > "배포 관리" 
2. 기존 배포 옆 "편집" 버튼 클릭
3. "새 버전" 생성
4. "배포" 클릭하여 업데이트

## 8. 문제 해결

### 권한 오류
- Google Sheets에 Apps Script 계정 접근 권한 부여
- 스프레드시트를 "링크가 있는 모든 사용자" 편집 가능으로 설정

### 스크립트 실행 오류
- Apps Script 편집기에서 "실행" 버튼으로 테스트
- "로그" 탭에서 에러 메시지 확인

### 네트워크 오류
- URL이 올바른지 확인
- 브라우저 네트워크 탭에서 요청/응답 확인

## 9. 보안 참고사항

- 웹 앱은 공개되므로 민감한 데이터를 처리하지 마세요
- 필요시 간단한 API 키 인증을 추가할 수 있습니다
- 스프레드시트 접근 권한을 적절히 제한하세요

## 10. 로컬 전용 모드

Google Apps Script 설정 없이도 게임은 정상 작동합니다:
- 리더보드 데이터가 브라우저 로컬 스토리지에만 저장됩니다
- 다른 기기나 브라우저와는 데이터가 동기화되지 않습니다
- 게임 기능은 모두 정상 작동합니다