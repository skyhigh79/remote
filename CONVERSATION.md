# 밀크티 원격 AS 접수 페이지 - 기획 대화 기록

작성일: 2026-03-11

---

## 대화 요약

### 개발 배경

- 어드민 페이지에서 입력한 데이터를 회사 CRM(밀크티)에 등록하는 기능 개발 논의
- 우리가 CRM API/SP를 호출하는 구조 (반대가 아님)
- CRM은 `crm.milkt.co.kr` — 외부 접근 시 로그인 인증 필요

---

### 수집한 인터페이스 정의서 정보

#### IF-003. 원격요청 등록 (remote_request_insert)

- 인터페이스 방식: DB SP 호출 (INSERT)
- 처리유형: Realtime

| No | 필드명(한글) | 필드명(영문) | Type | 길이 | 필수 | 비고 |
|----|------------|------------|------|------|------|------|
| 1 | 예약일 | in_Reserv_Date | | | Y | |
| 2 | 예약 시작시간 | in_Reserv_STime | varchar | 4 | Y | 16시~17시 ex) 1617 |
| 3 | 예약 종료시간 | in_Reserv_ETime | varchar | 4 | Y | |
| 4 | 서비스명 | in_Service_Name | varchar | 20 | Y | 밀크T초등(고정값) |
| 5 | 회원상태 | in_Member_Status_Name | varchar | 50 | | 정회원/정회원 이월/일반/제품회원/대기회원/만료 |
| 6 | 접수번호 | in_reg_num | varchar | | Y | |
| 7 | 고객 아이디 | in_user_id | varchar | 50 | Y | |
| 8 | 고객명 | in_User_name | varchar | 50 | | |
| 9 | 요청전화번호 | in_Call_Tel | varchar | 20 | Y | |
| 10 | 최초접수자 | in_Receiver_Emp_ID | varchar | 20 | Y | |
| 11 | 최초접수 일시 | in_Reg_Date | datetime | | Y | |
| 12 | 원격횟수 | in_Remote_Count | varchar | 50 | Y | |
| 13 | 고객 시스템아이디 | in_system_id | varchar | 36 | Y | |

호출 예시:
```sql
select remote_request_insert('예약일(YYYYMMDD)','예약시작시간(HHMM)','예약종료시간(HHMM)',
  '서비스명(밀크T초등)','회원상태(유로학습생)','접수번호','고객아이디','고객명',
  '요청전화번호','최초접수자','최초접수일시', '원격횟수', '시스템아이디');

-- 예시:
select remote_request_insert('20191121','1530','1800','밀크T중학','임시학습생',
  '접수번호','test0330y','김테스트','01000000001','mclass0042','201911191352','3','aaaa-bbbb-cccc-dddd');
```

---

#### IF-007. 원격 리스트 수정 (remote_request_list_update)

- 인터페이스 방식: DB 뷰 호출 (Update)

| No | 필드명(한글) | 필드명(영문) | Type | 비고 |
|----|------------|------------|------|------|
| 1 | 원격PK | in_reg_num | Varchar | 전재측 원격PK |
| 2 | 등록일 | in_reserve_date | varchar | Ex)20210928 |
| 3 | 시작시간 | in_reserve_stime | varchar | EX)1800 |
| 4 | 종료시간 | in_reserve_etime | varchar | EX)1900 |
| 5 | AS상태 | in_as_state | varchar | 우측 코드 값 참조 |
| 6 | 서비스명 | in_service_name | varchar | 서비스명 |

응답코드:
- 1: 성공
- 2: 실패 (리스트 존재하지 않을)
- 3: 성공 (상태값 NULL)
- 4: 실패 (리스트 존재하지 않을)

호출 예시:
```sql
SELECT remote_request_list_update('A-2108230212', '20210928', '1800', '1900', 'S02', '밀크T초등')
```

---

#### 원격요청 취소 (remote_request_as_cancel)

```sql
SELECT remote_request_as_cancel('A-2108230212', '밀크T아이')
SELECT remote_request_as_cancel('A-2108230212', '밀크T초등')
SELECT remote_request_as_cancel('A-2108230212', '밀크T중학')
SELECT remote_request_as_cancel('A-2108230212', '밀크T고등')
```

---

#### 회원 상세 정보 팝업 연동

- 방식: AES 암호화 + Base64 인코딩 후 URL 파라미터로 전달

```javascript
// JS 추가
<script src="http://mcrm.milkt.co.kr/Js/Enc/gibberish-aes.js"></script>
<script src="http://mcrm.milkt.co.kr/Js/Enc/EncUtil.js"></script>

// 암호화
strUserID = AES_Encode(UserID);
strUserID = Base64.encode(strUserID);
```

파라미터: `strEnc=Y`, `strUserID={암호화된값}`

예시:
```
http://mcrm.milkt.co.kr/PopUp/NewMember/frm_Member_Detail_New.aspx?strEnc=Y&strUserID=QStRMmw2cHYwWEt4NStzNjl0Q0R2dz09Cg==
```

---

### AS 상태코드 전체

| 코드 | 한글명 |
|------|--------|
| S01 | 접수대기 |
| S02 | 접수완료 |
| S03 | 접수취소 |
| S04 | 원격중 |
| S05 | 원격완료 |
| S06 | 접수완료 |
| S07 | 1차검수취소 |
| S08 | 1차검수완료 |
| S09 | 진행중 |
| S10 | 진행완료 |
| S11 | 진행취소 |
| S12 | 최종검수중 |
| S13 | 최종검수완료 |
| S14 | 최종검수취소 |

---

### 최종 결정된 요구사항

#### 프로젝트 성격
- 고객이 직접 원격 AS를 신청하는 셀프 접수 페이지
- 로그인된 고객이 접근하는 페이지 (세션 인증 필수)
- 파일 첨부 기능 없음 (보안상 제외)

#### 고객 입력 필드 (딱 3가지)
1. **연락처** — 세션에서 기본값 자동 입력, 수정 가능
2. **증상** — 텍스트에어리어 (최대 2000자)
3. **예약일시** — 팝업으로 날짜/시간 슬롯 선택

#### 나머지는 모두 자동 처리
- 고객 아이디, 고객명, 회원상태 등 → 세션에서 자동
- 접수번호, 접수일시 → 서버에서 자동 생성
- 서비스명 → URL 경로로 자동 결정

#### URL 경로별 서비스 자동 결정
- `/remote/kids` → 밀크T아이
- `/remote/elementary` → 밀크T초등
- `/remote/middle` → 밀크T중학
- `/remote/high` → 밀크T고등

#### 기술 스택
- PHP + MySQL (PDO)
- HTML/CSS/JS Vanilla
- Apache .htaccess 라우팅

---

### 현재 상태 (2026-03-11 기준)

#### 확보된 것
- 등록 SP (`remote_request_insert`) 명세 ✅
- 상태변경 SP (`remote_request_list_update`) 명세 ✅
- 취소 SP (`remote_request_as_cancel`) 명세 ✅
- 회원 상세 팝업 URL 방식 ✅
- AS 상태코드 목록 (S01~S14) ✅

#### 아직 없는 것
- CRM DB 접속 정보 ❌
- 예약 슬롯 조회 SP 명세서 ❌
- CRM 세션 키명 목록 ❌
- CRM 로그인 URL ❌

---

### 다음 단계

1. 밀크티 측에 아래 정보 요청:
   - DB 접속 정보 (host, port, DB명, 계정)
   - 예약 슬롯 조회 SP 명세서
   - CRM 세션 키명 목록
   - CRM 로그인 페이지 URL
   - 접수번호 형식 규칙
   - `in_system_id` 값 (고정값인지 확인)
   - `in_Remote_Count` 의미

2. 위 정보 수령 후 PLAN.md 기준으로 개발 시작
