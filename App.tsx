import React from 'react';

// 에러 경계 컴포넌트
class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('React Error:', error, errorInfo);
  }

  render() {
    if ((this.state as any).hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl">
            <h1 className="text-2xl font-bold text-red-600 mb-4">⚠️ 오류가 발생했습니다</h1>
            <p className="text-gray-700 mb-4">애플리케이션 로딩 중 문제가 발생했습니다.</p>
            <details className="bg-gray-100 p-4 rounded">
              <summary className="font-semibold cursor-pointer">에러 상세 정보</summary>
              <pre className="mt-2 text-sm overflow-auto">
                {(this.state as any).error?.toString()}
              </pre>
            </details>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }

    return (this.props as any).children;
  }
}

// 임시 로딩 컴포넌트
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="loading-spinner w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">로딩 중...</h2>
        <p className="text-gray-600">Moducon Color Game을 준비하고 있습니다</p>
      </div>
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    // 컴포넌트 동적 로딩
    const timer = setTimeout(async () => {
      try {
        // 필요한 모듈들을 미리 확인
        const { default: ColorLogoGame } = await import('./components/ColorLogoGame');
        
        console.log('✅ 모든 컴포넌트가 로드되었습니다');
        setIsLoading(false);
      } catch (error) {
        console.error('❌ 컴포넌트 로딩 실패:', error);
        setHasError(true);
        setIsLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl">
          <h1 className="text-2xl font-bold text-red-600 mb-4">❌ 컴포넌트 로딩 실패</h1>
          <p className="text-gray-700 mb-4">게임 컴포넌트를 로드하는 중 문제가 발생했습니다.</p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• 브라우저 콘솔에서 에러 메시지를 확인하세요</p>
            <p>• 네트워크 연결을 확인하세요</p>
            <p>• 페이지를 새로고침해보세요</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  // 동적 import로 컴포넌트 로딩
  const ColorLogoGame = React.lazy(() => import('./components/ColorLogoGame'));

  return (
    <ErrorBoundary>
      <React.Suspense fallback={<LoadingScreen />}>
        <div className="relative">
          <ColorLogoGame />
          
        </div>
      </React.Suspense>
    </ErrorBoundary>
  );
}

export default App;