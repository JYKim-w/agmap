# 서버 알려진 이슈 및 Mobile 대응 가이드

> 작성일: 2026-04-05
> Web 서버: Spring + MyBatis + PostgreSQL
> Mobile: React Native (Expo)

---

## 1. MyBatis null Boolean → VARCHAR 타입 불일치

### 증상
```
PSQLException: "lease_yn" 컬럼은 boolean 타입인데 character varying 타입이 들어옴
```

### 원인
MyBatis mapper에서 `#{leaseYn}` 처럼 jdbcType 없이 사용하면, 값이 null일 때 MyBatis가 기본 타입을 `VARCHAR`로 보냄. PostgreSQL boolean 컬럼과 타입 불일치.

### 영향 범위
`tb_survey_result`의 모든 Boolean 컬럼:
- `cultivation_yn`, `lease_yn`, `fallow_yn`, `facility_yn`, `conversion_yn`

`tb_audit_log`의 `user_id` (BIGINT) 컬럼도 동일 패턴.

### 서버 근본 해결 (mapper XML)
```xml
<!-- 수정 전 -->
#{leaseYn}

<!-- 수정 후 -->
#{leaseYn,jdbcType=BOOLEAN}
#{userId,jdbcType=BIGINT}
```

### Mobile 임시 대응
Boolean 필드를 null 대신 false로 전송:
```typescript
leaseYn: formState.leaseYn ?? false,
```

### 검사 방법
1. `grep -r "#{.*Yn}" mapper/**/*.xml` — jdbcType 없는 Boolean 파라미터 찾기
2. `grep -r "#{userId}" mapper/**/*.xml` — jdbcType 없는 BIGINT 파라미터 찾기
3. null 값으로 API 호출하여 에러 재현

---

## 2. LocalDateTime 직렬화 — 배열 형태 반환

### 증상
```json
"surveyedAt": [2026, 4, 2, 0, 0]
```
기대값: `"2026-04-02T00:00:00"`

### 원인
Spring의 Jackson이 `LocalDateTime`을 배열로 직렬화 (기본 설정).

### 서버 근본 해결
`application.properties` 또는 Jackson 설정:
```properties
spring.jackson.serialization.write-dates-as-timestamps=false
```

또는 VO 필드에 어노테이션:
```java
@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
private LocalDateTime surveyedAt;
```

### Mobile 임시 대응
배열/문자열 둘 다 파싱:
```typescript
function formatDate(val: any): string {
  if (Array.isArray(val)) {
    const [y, m, d, h, min] = val;
    return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }
  return String(val).replace('T', ' ').slice(0, 16);
}
```

### 검사 방법
1. API 응답에서 날짜 필드 확인 — 배열이면 이 이슈
2. `grep -r "LocalDateTime" src/**/*.java` — 직렬화 대상 필드 목록

---

## 3. Audit Log user_id 타입 불일치

### 증상
```
PSQLException: "user_id" 컬럼은 bigint 타입인데 character varying 타입이 들어옴
```

### 원인
`AuditLogService.record(null, ...)` 호출 시 userId가 null → MyBatis가 VARCHAR로 전송.

### 위치
`audit-log-mapper.xml` → `insertAuditLog`

### 서버 해결
```xml
#{userId,jdbcType=BIGINT}
```

---

## 4. 검사 체크리스트 (새 API 연동 시)

새로운 API를 연동할 때 아래 항목을 체크:

- [ ] **nullable Boolean 필드**: Mobile에서 null 대신 false 전송
- [ ] **nullable 숫자 필드**: Number() 변환 또는 null 전송 확인
- [ ] **날짜 필드**: 배열/문자열 둘 다 파싱 가능한지 확인
- [ ] **문자열 필드**: 빈 문자열 `""` 대신 null 전송 (DB NOT NULL 제약 확인)
- [ ] **에러 응답 형식**: ApiResponse JSON인지 HTML 404인지 확인
- [ ] **인증 헤더**: Authorization Bearer 토큰 포함 확인
- [ ] **CORS**: 서버에서 Mobile User-Agent 허용하는지 확인

---

## 5. 디버깅 방법

### Mobile (Metro 터미널)
API 에러 시 자동 로그 출력 (`__DEV__`만):
```
[API] 500 POST /mobile/api/survey/result
[API] req: {assignmentId: 4, ...}
[API] res: {"success":false,"message":"서버 오류가 발생했습니다."}
```

### 서버 (Tomcat 로그)
```
C:\apache-tomcat-8.5.37_agmap\logs\catalina.out
```
또는 원격 서버 SSH 접속 후:
```bash
tail -f logs/catalina.out | grep -A 5 "ERROR\|Exception"
```

### curl 테스트
```bash
# 로그인
TOKEN=$(curl -s -X POST http://211.214.194.88:5632/auth/api/login \
  -H "Content-Type: application/json" \
  -d '{"loginId":"surveyor01","password":"ekr123!@#"}' \
  | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# API 호출
curl -s http://211.214.194.88:5632/mobile/api/survey/my-assignments \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```
