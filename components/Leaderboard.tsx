import React, { useState, useEffect } from 'react';
import { Trophy, Clock, User, X, RefreshCw, Globe, HardDrive } from 'lucide-react';
import { getGoogleSheetsLeaderboard } from '../utils/google-sheets';

interface LeaderboardEntry {
  nickname: string;
  stage: number;
  time: number; // in seconds
  date: string | number; // timestamp or date string
  accuracy: number;
}

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentStage?: number;
  lang: 'EN' | 'ES';
}

const STORAGE_KEY = 'cdc_leaderboard_v1';

const Leaderboard: React.FC<LeaderboardProps> = ({ isOpen, onClose, currentStage, lang }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filterStage, setFilterStage] = useState<number | 'all'>(currentStage || 'all');
  const [dataSource, setDataSource] = useState<'local' | 'cloud'>('local');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 로컬 데이터 로드
  const loadLocalData = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const localEntries = JSON.parse(saved);
      setEntries(localEntries);
      setDataSource('local');
    }
  };

  // Google Sheets 데이터 로드
  const loadCloudData = async () => {
    console.log('☁️ [Leaderboard] 클라우드 데이터 로딩 시작...');
    setLoading(true);
    setError(null);
    try {
      const cloudEntries = await getGoogleSheetsLeaderboard();
      console.log('📊 [Leaderboard] 클라우드 데이터 로딩 성공:', cloudEntries.length, '개 엔트리');
      console.log('📝 [Leaderboard] 클라우드 데이터 미리보기:', cloudEntries.slice(0, 3));
      setEntries(cloudEntries);
      setDataSource('cloud');
    } catch (err) {
      setError('Failed to load cloud data');
      console.error('❌ [Leaderboard] 클라우드 데이터 로딩 실패:', err);
      // 실패 시 로컬 데이터로 fallback
      loadLocalData();
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (isOpen) {
      // 먼저 로컬 데이터 로드 (빠른 응답)
      loadLocalData();
      // 그 다음 클라우드 데이터 시도
      loadCloudData();
    }
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredEntries = filterStage === 'all' 
    ? entries 
    : entries.filter(e => e.stage === filterStage);

  const sortedEntries = [...filteredEntries].sort((a, b) => a.time - b.time).slice(0, 10);

  const t = {
    EN: {
      title: 'Leaderboard',
      stage: 'Stage',
      allStages: 'All Stages',
      nickname: 'Player',
      time: 'Time',
      accuracy: 'Accuracy',
      noRecords: 'No records yet',
      close: 'Close',
      refresh: 'Refresh',
      local: 'Local',
      cloud: 'Cloud',
      loading: 'Loading...',
      error: 'Error loading data'
    },
    ES: {
      title: 'Tabla de Clasificación',
      stage: 'Etapa',
      allStages: 'Todas las Etapas',
      nickname: 'Jugador',
      time: 'Tiempo',
      accuracy: 'Precisión',
      noRecords: 'Sin registros aún',
      close: 'Cerrar',
      refresh: 'Actualizar',
      local: 'Local',
      cloud: 'Nube',
      loading: 'Cargando...',
      error: 'Error al cargar datos'
    }
  };

  const txt = t[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="text-yellow-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">{txt.title}</h2>
              {/* 데이터 소스 표시 */}
              <div className="flex items-center gap-2">
                {dataSource === 'cloud' ? (
                  <div className="flex items-center gap-1 text-xs bg-green-600 text-white px-2 py-1 rounded">
                    <Globe size={12} />
                    {txt.cloud}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs bg-gray-600 text-white px-2 py-1 rounded">
                    <HardDrive size={12} />
                    {txt.local}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* 새로고침 버튼 */}
              <button
                onClick={loadCloudData}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 text-gray-600"
                title={txt.refresh}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setFilterStage('all')}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                filterStage === 'all' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {txt.allStages}
            </button>
            {[1, 2, 3].map(stage => (
              <button
                key={stage}
                onClick={() => setFilterStage(stage)}
                className={`px-3 py-1 rounded-lg text-sm transition ${
                  filterStage === stage 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {txt.stage} {stage}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh] bg-gray-50">
          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {txt.error}: {error}
            </div>
          )}
          
          {/* 로딩 상태 */}
          {loading && (
            <div className="text-center py-8 text-gray-600">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
              {txt.loading}
            </div>
          )}
          
          {/* 데이터 표시 */}
          {!loading && sortedEntries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {txt.noRecords}
            </div>
          ) : !loading && (
            <div className="space-y-2">
              {sortedEntries.map((entry, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg flex items-center gap-4 ${
                    index === 0 ? 'bg-yellow-100 border border-yellow-300' :
                    index === 1 ? 'bg-gray-100 border border-gray-300' :
                    index === 2 ? 'bg-orange-100 border border-orange-300' :
                    'bg-white border border-gray-200'
                  }`}
                >
                  <div className={`text-2xl font-bold w-8 text-center ${
                    index === 0 ? 'text-yellow-600' :
                    index === 1 ? 'text-gray-600' :
                    index === 2 ? 'text-orange-600' :
                    'text-gray-700'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-500" />
                      <span className="font-medium text-gray-800">{entry.nickname}</span>
                      {filterStage === 'all' && (
                        <span className="text-xs bg-gray-700 text-white px-2 py-0.5 rounded">
                          {txt.stage} {entry.stage}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <Clock size={14} className="text-gray-500" />
                      <span className="font-mono">{formatTime(entry.time)}</span>
                    </div>
                    <div className="text-sm font-mono text-green-600 font-semibold">
                      {entry.accuracy.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const addLeaderboardEntry = async (entry: Omit<LeaderboardEntry, 'date'>) => {
  console.log('📋 [Leaderboard] 엔트리 저장 시작:', entry);
  
  // 로컬 스토리지에 저장
  const saved = localStorage.getItem(STORAGE_KEY);
  const entries: LeaderboardEntry[] = saved ? JSON.parse(saved) : [];
  
  const newEntry = {
    ...entry,
    date: Date.now()
  };
  
  console.log('💾 [Leaderboard] 새 엔트리 생성:', newEntry);
  
  entries.push(newEntry);
  
  // Keep only top 50 entries per stage
  const grouped = entries.reduce((acc, e) => {
    if (!acc[e.stage]) acc[e.stage] = [];
    acc[e.stage].push(e);
    return acc;
  }, {} as Record<number, LeaderboardEntry[]>);
  
  const trimmed: LeaderboardEntry[] = [];
  Object.entries(grouped).forEach(([stage, stageEntries]) => {
    const sorted = stageEntries.sort((a, b) => a.time - b.time).slice(0, 50);
    trimmed.push(...sorted);
  });
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  console.log('💾 [Leaderboard] 로컬 저장 완료, 총', trimmed.length, '개 엔트리');

  // Google Sheets에도 저장 시도 (비동기, 실패해도 무시)
  try {
    console.log('☁️ [Leaderboard] Google Sheets 저장 시도...');
    const { addToGoogleSheets } = await import('../utils/google-sheets');
    await addToGoogleSheets(entry);
    console.log('✅ [Leaderboard] Google Sheets 저장 성공');
  } catch (error) {
    console.warn('⚠️ [Leaderboard] Google Sheets 저장 실패, 로컬에만 저장됨:', error);
  }
};

export default Leaderboard;