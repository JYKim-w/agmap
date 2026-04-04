#!/bin/bash
# 로그인 API 테스트 스크립트

echo "=============================="
echo "  서버별 로그인 API 테스트"
echo "=============================="

# 서버 목록
SERVERS=(
  "http://211.214.194.88:5632"
)

# 엔드포인트 + 바디 조합
for BASE in "${SERVERS[@]}"; do
  echo ""
  echo "▶ 서버: $BASE"
  echo "------------------------------"

  echo "[1] POST /auth/api/login (JWT)"
  curl -s -w " → HTTP %{http_code}" \
    -X POST "$BASE/auth/api/login" \
    -H "Content-Type: application/json" \
    -d '{"loginId":"admin","password":"ekr123!@#"}' 2>&1
  echo ""

  echo "[2] POST /login/appLogin (레거시)"
  curl -s -w " → HTTP %{http_code}" \
    -X POST "$BASE/login/appLogin" \
    -H "Content-Type: application/json" \
    -d '{"userId":"admin","pwd":"ekr123!@#","jobsecd":"05"}' 2>&1
  echo ""
done
