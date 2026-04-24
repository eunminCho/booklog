# External API Error States

`ExternalApiError` 컴포넌트에서 사용하는 상태 정의입니다.

| state | 조건 | 화면 카피 | 복구 동작 |
| --- | --- | --- | --- |
| `loading` | 검색/ISBN 조회 요청 진행 중 | 검색 중 / 책 정보를 불러오고 있습니다. | 요청 완료까지 대기 |
| `empty` | 검색 API 성공 + 결과 배열 길이 0 | 검색 결과 없음 / 다른 검색어로 다시 시도해 보세요. | 검색어 수정 후 재검색 |
| `offline` | fetch 네트워크 실패 또는 API `EXTERNAL_OFFLINE` | 오프라인 상태 / 인터넷 연결을 확인해 주세요. | 네트워크 복구 후 `다시 시도` |
| `rateLimit` | API `EXTERNAL_RATE_LIMITED` (429) | 요청 제한 / 잠시 후 다시 시도해 주세요. | `Retry-After` 대기 후 `다시 시도` |
| `upstream` | API `EXTERNAL_UPSTREAM` (5xx 계열) | 외부 서비스 오류 / 잠시 후 다시 시도해 주세요. | 시간 경과 후 `다시 시도` |
| `notFound` | ISBN 단건 조회 미일치 또는 API `EXTERNAL_NOT_FOUND` | 책 정보를 찾지 못함 / 일치하는 책이 없습니다. | ISBN/검색어 확인 후 재요청 |
