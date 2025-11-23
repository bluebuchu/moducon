// Google Apps Script 최종 코드 - 기존 프로젝트용
// 기존 Apps Script 프로젝트에 이 코드를 붙여넣으세요
// 프로젝트 ID: 1YU8x7Iqz1r9x7zA2ot2LP86AFTYtSGUAb4hVrVcfNdRsP7gs9iwlFV2o

// ⚠️ 중요: 아래 SPREADSHEET_ID를 실제 Google Sheets ID로 변경하세요
const SPREADSHEET_ID = '1J7cwwbBgulbsQPZ4RVS3iWitJlV_5Etm9opQDEV41aA'; // 기존 시트 ID로 변경 필요

function doGet(e) {
  // 파라미터 안전 체크
  if (!e || !e.parameter) {
    return sendResponse({
      success: false,
      error: 'No parameters provided'
    });
  }
  
  const params = e.parameter;
  const action = params.action;
  
  if (action === 'ping') {
    return sendResponse({
      success: true,
      message: '연결 성공',
      spreadsheetId: SPREADSHEET_ID
    });
  }
  
  // GET 요청으로 데이터 추가
  if (action === 'addEntry') {
    try {
      const sheet = getSheet();
      
      // URL 파라미터에서 데이터 추출
      const newEntry = [
        params.timestamp || new Date().toISOString(),
        params.nickname || '',
        params.stage || '',
        params.time || '',
        params.accuracy || '',
        params.date || new Date().toLocaleDateString('ko-KR')
      ];
      
      sheet.appendRow(newEntry);
      
      return sendResponse({
        success: true,
        message: '데이터 추가 완료',
        data: {
          nickname: params.nickname,
          stage: params.stage,
          time: params.time,
          accuracy: params.accuracy
        }
      });
    } catch (error) {
      return sendResponse({
        success: false,
        error: error.toString()
      });
    }
  }
  
  if (action === 'getLeaderboard') {
    try {
      const sheet = getSheet();
      const data = sheet.getDataRange().getValues();
      
      if (data.length <= 1) {
        return sendResponse({ success: true, data: [] });
      }
      
      const headers = data[0];
      const rows = data.slice(1);
      
      const formattedData = rows.map(row => ({
        nickname: row[1] || '',
        stage: parseInt(row[2]) || 0,
        time: parseInt(row[3]) || 0,
        accuracy: parseFloat(row[4]) || 0,
        date: row[5] || ''
      }));
      
      return sendResponse({
        success: true,
        data: formattedData
      });
    } catch (error) {
      return sendResponse({
        success: false,
        error: error.toString()
      });
    }
  }
  
  // 알 수 없는 action
  return sendResponse({
    success: false,
    error: `Unknown action: ${action}`
  });
}

function doPost(e) {
  try {
    // 파라미터 안전 체크
    if (!e || !e.postData || !e.postData.contents) {
      return sendResponse({
        success: false,
        error: 'No POST data provided'
      });
    }
    
    const jsonString = e.postData.contents;
    const data = JSON.parse(jsonString);
    const action = data.action;
    
    // POST로도 addEntry 지원 (기존 방식 유지)
    if (action === 'addEntry') {
      const sheet = getSheet();
      const entryData = data.data;
      
      const newEntry = [
        entryData.timestamp || new Date().toISOString(),
        entryData.nickname || '',
        entryData.stage || '',
        entryData.time || '',
        entryData.accuracy || '',
        entryData.date || new Date().toLocaleDateString('ko-KR')
      ];
      
      sheet.appendRow(newEntry);
      
      return sendResponse({
        success: true,
        message: '데이터 추가 완료'
      });
    }
    
    return sendResponse({
      success: false,
      error: `Unknown POST action: ${action}`
    });
  } catch (error) {
    return sendResponse({
      success: false,
      error: error.toString()
    });
  }
}

function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('Leaderboard');
  
  if (!sheet) {
    sheet = ss.insertSheet('Leaderboard');
    sheet.appendRow(['Timestamp', 'Nickname', 'Stage', 'Time(seconds)', 'Accuracy', 'Date']);
  }
  
  return sheet;
}

function sendResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// 🔧 설정 가이드:
// 1. 위 코드를 Apps Script 에디터에 붙여넣기
// 2. SPREADSHEET_ID를 실제 Google Sheets ID로 변경
// 3. 저장 후 배포: 배포 → 새 배포 → 웹앱 → 실행: 본인, 액세스: 모든 사용자
// 4. 새 배포 URL이 맞는지 확인: 
//    https://script.google.com/macros/s/AKfycbz4nwhZ7BJPOXWZM-SqwbSAhSXc95fWpG_QpoWmN7m0C8Fz3gbhw7Ivv8jy78vF0tqvOQ/exec