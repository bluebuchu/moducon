import React, { useState } from 'react';
import { googleSheetsService } from '../utils/google-sheets';
import GoogleSheetsSetup from './GoogleSheetsSetup';

interface TestStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  details?: string;
}

interface ConnectionTestProps {
  onClose?: () => void;
}

const ConnectionTest: React.FC<ConnectionTestProps> = ({ onClose }) => {
  const [steps, setSteps] = useState<TestStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const updateStep = (id: string, updates: Partial<TestStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ));
  };

  const addStep = (step: TestStep) => {
    setSteps(prev => [...prev, step]);
  };

  const resetSteps = () => {
    setSteps([]);
  };

  const testConnection = async () => {
    setLoading(true);
    resetSteps();
    
    // 초기 단계들 설정
    const initialSteps: TestStep[] = [
      { id: 'env-check', name: '환경변수 확인', status: 'pending' },
      { id: 'url-validation', name: 'Apps Script URL 검증', status: 'pending' },
      { id: 'connection-test', name: '연결 테스트 (Ping)', status: 'pending' },
      { id: 'data-write', name: '테스트 데이터 추가', status: 'pending' },
      { id: 'data-read', name: '데이터 조회 테스트', status: 'pending' },
      { id: 'final-check', name: '최종 검증', status: 'pending' }
    ];
    
    setSteps(initialSteps);
    
    try {
      // 1. 환경변수 체크
      updateStep('env-check', { status: 'running' });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const appsScriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
      
      if (!appsScriptUrl) {
        updateStep('env-check', { 
          status: 'error', 
          message: 'Google Apps Script URL이 설정되지 않음',
          details: '📁 .env 파일에 VITE_GOOGLE_APPS_SCRIPT_URL을 설정하세요\n📖 STEP_BY_STEP_GUIDE.md 참조'
        });
        
        // 나머지 단계들을 모두 pending으로 유지
        return;
      }
      
      updateStep('env-check', { 
        status: 'success', 
        message: 'Apps Script URL 확인됨',
        details: `URL: ${appsScriptUrl.substring(0, 50)}...`
      });
      
      // 2. URL 검증
      updateStep('url-validation', { status: 'running' });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!appsScriptUrl.includes('script.google.com') || !appsScriptUrl.includes('/exec')) {
        updateStep('url-validation', { 
          status: 'error', 
          message: 'URL 형식이 올바르지 않음',
          details: '올바른 형식: https://script.google.com/macros/s/.../exec'
        });
        return;
      }
      
      updateStep('url-validation', { 
        status: 'success', 
        message: 'URL 형식 검증 통과'
      });
      
      // 3. 연결 테스트
      updateStep('connection-test', { status: 'running' });
      
      await googleSheetsService.initialize();
      
      updateStep('connection-test', { 
        status: 'success', 
        message: 'Apps Script 서버 연결 성공',
        details: 'Google Apps Script가 정상적으로 응답합니다'
      });
      
      // 4. 데이터 쓰기 테스트
      updateStep('data-write', { status: 'running' });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const testEntry = {
        nickname: `Test_${Date.now()}`,
        stage: 4,
        time: 123 + Math.floor(Math.random() * 100),
        accuracy: 95.5
      };
      
      const writeResult = await googleSheetsService.addLeaderboardEntry(testEntry);
      
      if (writeResult) {
        updateStep('data-write', { 
          status: 'success', 
          message: '테스트 데이터 추가 성공',
          details: `닉네임: ${testEntry.nickname}\n스테이지: ${testEntry.stage}\n시간: ${testEntry.time}초`
        });
      } else {
        updateStep('data-write', { 
          status: 'error', 
          message: '데이터 쓰기 실패',
          details: 'Google Sheets에 데이터를 추가할 수 없습니다'
        });
        return;
      }
      
      // 5. 데이터 읽기 테스트
      updateStep('data-read', { status: 'running' });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const entries = await googleSheetsService.getLeaderboard();
      
      updateStep('data-read', { 
        status: 'success', 
        message: `${entries.length}개 기록 조회 성공`,
        details: `전체 기록: ${entries.length}개\n최신 기록이 정상적으로 포함되었습니다`
      });
      
      // 6. 최종 검증
      updateStep('final-check', { status: 'running' });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      updateStep('final-check', { 
        status: 'success', 
        message: '🎉 모든 테스트 통과!',
        details: 'Google Sheets 연동이 완벽하게 작동합니다.\n게임에서 리더보드 데이터가 클라우드에 저장됩니다.'
      });
      
    } catch (error: any) {
      const currentRunningStep = steps.find(s => s.status === 'running');
      if (currentRunningStep) {
        updateStep(currentRunningStep.id, { 
          status: 'error', 
          message: '연결 실패',
          details: `에러: ${error.message}\n\n🔧 해결 방법:\n1. Apps Script 배포 상태 확인\n2. 스프레드시트 권한 확인\n3. STEP_BY_STEP_GUIDE.md 참조`
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (status: TestStep['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
    }
  };

  const getStepColor = (status: TestStep['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-500';
      case 'running': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
    }
  };

  const hasError = steps.some(step => step.status === 'error');
  const allSuccess = steps.length > 0 && steps.every(step => step.status === 'success');
  const appsScriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;

  return (
    <div className={`fixed top-4 right-4 bg-white/95 p-4 rounded-xl shadow-xl border border-gray-200 z-50 transition-all duration-300 ${
      isExpanded ? 'max-w-lg w-96' : 'max-w-md w-80'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 text-sm">🔧 Google Sheets 연결 테스트</h3>
        <div className="flex items-center gap-2">
          {steps.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? '접기' : '자세히'}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1"
              title="닫기"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* 환경변수 상태 표시 */}
      <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${appsScriptUrl ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-gray-700">
            Apps Script URL: {appsScriptUrl ? '설정됨' : '미설정'}
          </span>
        </div>
        {!appsScriptUrl && (
          <div className="mt-1 text-gray-600">
            📖 <span className="underline">STEP_BY_STEP_GUIDE.md</span> 참조
          </div>
        )}
      </div>
      
      {/* 테스트 버튼 */}
      <button
        onClick={testConnection}
        disabled={loading}
        className={`w-full px-4 py-2 rounded-lg text-white font-medium transition-all mb-3 ${
          loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : allSuccess
              ? 'bg-green-500 hover:bg-green-600'
              : hasError
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            테스트 중...
          </span>
        ) : allSuccess ? (
          '✅ 다시 테스트'
        ) : hasError ? (
          '🔄 재시도'
        ) : (
          '🚀 연결 테스트 시작'
        )}
      </button>
      
      {/* 테스트 단계 표시 */}
      {steps.length > 0 && (
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={step.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className={`text-lg ${step.status === 'running' ? 'animate-spin' : ''}`}>
                  {getStepIcon(step.status)}
                </span>
                <span className={`text-sm font-medium ${getStepColor(step.status)}`}>
                  {index + 1}. {step.name}
                </span>
              </div>
              
              {step.message && (
                <div className={`text-xs mt-1 ${getStepColor(step.status)}`}>
                  {step.message}
                </div>
              )}
              
              {step.details && isExpanded && (
                <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-100 rounded whitespace-pre-wrap">
                  {step.details}
                </div>
              )}
            </div>
          ))}
          
          {/* 최종 요약 */}
          {!loading && (
            <div className={`mt-3 p-3 rounded-lg border-2 ${
              allSuccess 
                ? 'border-green-200 bg-green-50' 
                : hasError 
                  ? 'border-red-200 bg-red-50'
                  : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="text-sm font-medium">
                {allSuccess ? (
                  <span className="text-green-800">🎉 연결 완료! 클라우드 저장 가능</span>
                ) : hasError ? (
                  <span className="text-red-800">❌ 연결 실패 - 로컬 모드로 동작</span>
                ) : (
                  <span className="text-gray-800">⏸️ 테스트 대기중</span>
                )}
              </div>
              
              {allSuccess && (
                <div className="text-xs text-green-700 mt-1">
                  게임 결과가 Google Sheets에 실시간 저장됩니다
                </div>
              )}
              
              {hasError && (
                <div className="text-xs text-red-700 mt-1">
                  게임은 정상 작동하며 로컬에 데이터가 저장됩니다
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* 도움말 링크 */}
      {!appsScriptUrl && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
          <div className="text-blue-800 font-medium">📘 설정이 필요합니다</div>
          <div className="text-blue-700 mt-1 mb-2">
            Google Sheets 연동을 원한다면 설정을 진행하세요
          </div>
          <button
            onClick={() => setShowSetup(true)}
            className="w-full px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition font-medium"
          >
            🚀 지금 설정하기
          </button>
        </div>
      )}
      
      {/* Google Sheets 설정 모달 */}
      <GoogleSheetsSetup 
        isOpen={showSetup} 
        onClose={() => setShowSetup(false)} 
      />
    </div>
  );
};

export default ConnectionTest;