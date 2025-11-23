// Google Apps Script 코드 - 수정 버전
// GET 요청으로 addEntry 처리 추가

const SPREADSHEET_ID = '1J7cwwbBgulbsQPZ4RVS3iWitJlV_5Etm9opQDEV41aA';

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