# Google Sheets 연동 설정 가이드

moducon 앱의 리더보드를 Google Sheets에 저장하기 위한 설정 방법입니다.

## 1. Google Cloud Console 설정

### 1.1 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 프로젝트 ID 기록

### 1.2 Google Sheets API 활성화
1. "API 및 서비스" > "라이브러리" 이동
2. "Google Sheets API" 검색 후 선택
3. "사용" 버튼 클릭

### 1.3 서비스 계정 생성
1. "API 및 서비스" > "사용자 인증 정보" 이동
2. "사용자 인증 정보 만들기" > "서비스 계정" 선택
3. 서비스 계정 이름 입력 (예: "moducon-sheets")
4. 생성 완료

### 1.4 서비스 계정 키 생성
1. 생성된 서비스 계정 클릭
2. "키" 탭 이동
3. "키 추가" > "새 키 만들기" > "JSON" 선택
4. JSON 파일 다운로드 및 안전한 곳에 보관

## 2. Google Sheets 설정

### 2.1 스프레드시트 생성
1. [Google Sheets](https://sheets.google.com/) 접속
2. 새 스프레드시트 생성
3. 제목을 "Moducon Leaderboard" 등으로 변경

### 2.2 스프레드시트 공유
1. 우상단 "공유" 버튼 클릭
2. 서비스 계정 이메일 주소 입력 (JSON 파일의 client_email 값)
3. 권한을 "편집자"로 설정
4. "완료" 클릭

### 2.3 스프레드시트 ID 확인
- URL에서 스프레드시트 ID 추출
- 예: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
- SPREADSHEET_ID 부분이 필요한 값

## 3. 환경변수 설정

`.env` 파일을 생성하고 다음 내용 추가:

```bash
VITE_GOOGLE_SHEET_ID=your_spreadsheet_id_here
VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
VITE_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
your_private_key_content_here
-----END PRIVATE KEY-----"
```

### 주의사항
- 개행문자(`\n`)를 그대로 유지해야 합니다
- Private Key는 따옴표로 감싸야 합니다
- `.env` 파일은 `.gitignore`에 추가하여 버전 관리에서 제외

## 4. 테스트

1. 개발 서버 실행: `npm run dev`
2. 게임 완료 후 닉네임 등록
3. 리더보드에서 "새로고침" 버튼으로 클라우드 데이터 확인
4. Google Sheets에서 직접 데이터 확인

## 5. 문제 해결

### 인증 오류
- 서비스 계정 이메일이 스프레드시트에 공유되었는지 확인
- Private Key가 올바르게 설정되었는지 확인

### 권한 오류
- 서비스 계정에 "편집자" 권한이 있는지 확인
- Google Sheets API가 활성화되었는지 확인

### 네트워크 오류
- 인터넷 연결 상태 확인
- 로컬 저장은 정상 작동하므로 오프라인에서도 사용 가능

## 6. 기능 설명

### 자동 백업
- 모든 기록이 로컬 스토리지와 Google Sheets에 동시 저장
- Google Sheets 저장 실패 시에도 로컬에는 저장됨

### 데이터 동기화
- 리더보드 열 때 자동으로 클라우드 데이터 로드
- 새로고침 버튼으로 수동 동기화 가능

### 오프라인 지원
- 인터넷 연결 없이도 로컬 데이터로 정상 작동
- 연결 복구 시 자동으로 클라우드 데이터 표시