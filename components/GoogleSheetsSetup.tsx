import React, { useState } from 'react';
import { ExternalLink, Copy, CheckCircle, AlertCircle, Settings, X } from 'lucide-react';

interface GoogleSheetsSetupProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoogleSheetsSetup: React.FC<GoogleSheetsSetupProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [appsScriptUrl, setAppsScriptUrl] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');

  if (!isOpen) return null;

  const spreadsheetId = import.meta.env.VITE_GOOGLE_SHEET_ID;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  const appsScriptCode = `// Google Sheets ID - 이미 설정된 값
const SPREADSHEET_ID = '${spreadsheetId}';

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
        error: 'doGet Error: ' + error.toString()
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
        error: 'doPost Error: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function addLeaderboardEntry(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName('Leaderboard');
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Leaderboard');
      sheet.getRange(1, 1, 1, 6).setValues([
        ['Timestamp', 'Nickname', 'Stage', 'Time(seconds)', 'Accuracy', 'Date']
      ]);
    }
    
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
        message: '🎯 새 기록 추가 성공!'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'addEntry Error: ' + error.toString()
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
    if (data.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          data: []
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
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
    
    let filteredEntries = entries;
    if (stage) {
      filteredEntries = entries.filter(entry => entry.stage == Number(stage));
    }
    
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
        error: 'getLeaderboard Error: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(`${label} 복사됨!`);
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch (err) {
      setCopyFeedback('복사 실패');
      setTimeout(() => setCopyFeedback(''), 2000);
    }
  };

  const handleUrlUpdate = () => {
    if (appsScriptUrl && appsScriptUrl.includes('script.google.com') && appsScriptUrl.includes('/exec')) {
      alert(`다음 URL을 .env 파일에 추가하세요:\n\nVITE_GOOGLE_APPS_SCRIPT_URL=${appsScriptUrl}\n\n그 후 개발 서버를 재시작하세요.`);
    } else {
      alert('올바른 Google Apps Script URL 형식이 아닙니다.\n형식: https://script.google.com/macros/s/.../exec');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="text-blue-600" size={24} />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Google Sheets 연동 설정</h2>
                <p className="text-gray-600">단계별 가이드를 따라 클라우드 저장을 활성화하세요</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* 진행 표시 */}
          <div className="mt-4 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`flex items-center ${step <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                    step < currentStep
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : step === currentStep
                        ? 'border-blue-600 text-blue-600'
                        : 'border-gray-300'
                  }`}
                >
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 5 && (
                  <div className={`w-8 h-0.5 ${step < currentStep ? 'bg-blue-600' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Step 1: 스프레드시트 확인 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                스프레드시트 확인
              </h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 mb-3">
                  먼저 기존 스프레드시트에 접속할 수 있는지 확인해보세요.
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href={spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <ExternalLink size={16} />
                    스프레드시트 열기
                  </a>
                  <button
                    onClick={() => copyToClipboard(spreadsheetUrl, 'URL')}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                  >
                    <Copy size={16} />
                    URL 복사
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={20} className="text-green-600" />
                    <span className="font-semibold text-green-800">접속 성공</span>
                  </div>
                  <p className="text-green-700 text-sm mb-3">
                    스프레드시트가 보인다면 다음 단계로 진행하세요.
                  </p>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    다음 단계로 →
                  </button>
                </div>

                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={20} className="text-red-600" />
                    <span className="font-semibold text-red-800">접속 실패</span>
                  </div>
                  <p className="text-red-700 text-sm mb-3">
                    "권한이 없습니다" 또는 "찾을 수 없습니다"가 표시되면 새로 만들어야 합니다.
                  </p>
                  <a
                    href="https://sheets.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition justify-center"
                  >
                    <ExternalLink size={16} />
                    새 스프레드시트 만들기
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Apps Script 프로젝트 생성 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Apps Script 프로젝트 생성
              </h3>
              
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold mb-2">📝 할 일:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    <li>Google Apps Script 사이트에서 새 프로젝트 생성</li>
                    <li>프로젝트 이름을 "Moducon Sheets API"로 설정</li>
                  </ol>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://script.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    <ExternalLink size={16} />
                    Google Apps Script 열기
                  </a>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    💡 <strong>팁:</strong> 새 프로젝트를 만든 후 좌상단의 "제목 없는 프로젝트"를 클릭하여 이름을 변경하세요.
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  ← 이전
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  다음 →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 코드 입력 */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                Apps Script 코드 입력
              </h3>

              <div className="space-y-3">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium mb-2">⚠️ 중요 단계:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-red-700">
                    <li>Code.gs 파일의 <strong>모든 기존 내용을 삭제</strong></li>
                    <li>아래 코드를 <strong>완전히 복사해서 붙여넣기</strong></li>
                    <li><strong>Ctrl+S</strong>로 저장</li>
                  </ol>
                </div>

                <div className="relative">
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={() => copyToClipboard(appsScriptCode, '코드')}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800 text-white text-xs rounded hover:bg-gray-700 transition"
                    >
                      <Copy size={12} />
                      복사
                    </button>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-64 pr-20">
                    <code>{appsScriptCode}</code>
                  </pre>
                </div>

                {copyFeedback && (
                  <div className="text-green-600 text-sm font-medium">
                    ✅ {copyFeedback}
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  ← 이전
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  다음 →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: 웹 앱 배포 */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                웹 앱으로 배포
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">📋 배포 단계:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                    <li>우상단 <strong>"배포"</strong> 버튼 클릭</li>
                    <li><strong>"새 배포"</strong> 선택</li>
                    <li><strong>"유형 선택"</strong> 옆 ⚙️ 아이콘 클릭 → <strong>"웹 앱"</strong> 선택</li>
                    <li>설정:
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li><strong>실행 계정:</strong> "나"</li>
                        <li><strong>액세스 권한:</strong> "모든 사용자"</li>
                      </ul>
                    </li>
                    <li><strong>"배포"</strong> 클릭</li>
                    <li>권한 승인 (처음에만)</li>
                    <li><strong>웹 앱 URL 복사</strong></li>
                  </ol>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ <strong>권한 승인 시:</strong> "안전하지 않음" 경고가 나오면 "고급" → "Moducon Sheets API로 이동" → "허용"을 클릭하세요.
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  ← 이전
                </button>
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  다음 →
                </button>
              </div>
            </div>
          )}

          {/* Step 5: URL 설정 */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                URL 설정 완료
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 mb-3">
                    배포에서 받은 <strong>웹 앱 URL</strong>을 아래에 입력하세요:
                  </p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={appsScriptUrl}
                      onChange={(e) => setAppsScriptUrl(e.target.value)}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                    <p className="text-xs text-gray-600">
                      올바른 형식: https://script.google.com/macros/s/[긴문자열]/exec
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">🔧 환경변수 설정 방법:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                    <li>프로젝트 폴더의 <code>.env</code> 파일 열기</li>
                    <li><code>VITE_GOOGLE_APPS_SCRIPT_URL=</code> 줄 찾기</li>
                    <li><code>=</code> 뒤에 위에서 입력한 URL 붙여넣기</li>
                    <li>파일 저장 (Ctrl+S)</li>
                    <li>개발 서버 재시작 (Ctrl+C → npm run dev)</li>
                  </ol>
                </div>

                <button
                  onClick={handleUrlUpdate}
                  disabled={!appsScriptUrl}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
                >
                  설정 방법 확인 및 안내
                </button>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  ← 이전
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  설정 완료 🎉
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleSheetsSetup;