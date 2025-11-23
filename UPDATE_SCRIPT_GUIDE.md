# 📝 Google Apps Script 업데이트 가이드

## 🚨 중요: CORS 에러 해결을 위한 스크립트 수정 필요

### 문제 상황
- POST 요청이 CORS 정책으로 차단됨
- GET 요청으로 변경했지만 현재 스크립트가 GET으로 addEntry를 처리하지 못함

### 수정 방법

1. **Google Apps Script 에디터 열기**
   - [Google Apps Script](https://script.google.com) 접속
   - 기존 프로젝트 열기

2. **코드 수정**
   - `GOOGLE_APPS_SCRIPT_UPDATE.js` 파일의 내용을 복사
   - Google Apps Script 에디터에 붙여넣기

3. **주요 변경사항**
   ```javascript
   // GET 요청으로 데이터 추가 기능 추가
   if (action === 'addEntry') {
     // URL 파라미터에서 데이터 추출
     const newEntry = [
       params.timestamp,
       params.nickname,
       params.stage,
       params.time,
       params.accuracy,
       params.date
     ];
     sheet.appendRow(newEntry);
   }
   ```

4. **배포**
   - 저장 (Ctrl+S)
   - 배포 > 새 배포
   - 유형: 웹앱
   - 실행: 본인
   - 액세스: 모든 사용자
   - 배포 클릭

5. **테스트**
   ```bash
   node test-add-entry.js
   ```

### 변경 후 장점
- ✅ CORS 에러 해결
- ✅ GET/POST 모두 지원
- ✅ 브라우저에서 직접 데이터 저장 가능

### 확인 방법
1. 브라우저에서 http://localhost:5175 접속
2. 게임 플레이 후 닉네임 입력
3. 콘솔에서 성공 메시지 확인
4. 리더보드에서 새 데이터 확인