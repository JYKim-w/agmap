# farmfield 에이전트 설정

## Expo 로그 확인

Expo 관련 로그, 에러, 상태를 확인할 때는 **반드시 `expo-local` MCP를 우선 사용**한다.

### 우선순위

1. **`expo-local` MCP** (`mcp_expo-local_collect_app_logs`) — JS 콘솔 로그, 네이티브 로그 수집
2. **`expo-local` MCP** (`mcp_expo-local_automation_take_screenshot`) — 현재 앱 화면 스크린샷
3. **`expo-local` MCP** (`mcp_expo-local_automation_find_view`) — 특정 컴포넌트 뷰 조회
4. 그 외 일반 터미널 로그 확인

### 전제 조건

`expo-local` MCP는 dev server가 실행 중이어야 동작한다.
dev server가 꺼져 있다면 먼저 아래 명령으로 시작:

```bash
npm run start:mcp
```

(`EXPO_UNSTABLE_MCP_SERVER=1 npx expo start --host lan` 과 동일)

## 개발 서버

항상 MCP 기능이 활성화된 명령으로 dev server를 시작한다:

```bash
npm run start:mcp
```

일반 `npm start` 사용 금지 — MCP 로컬 기능이 비활성화됨.
