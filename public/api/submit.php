<?php
// TODO: Phase 5 - 실제 CRM DB SP 호출로 교체
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../lib/session.php';
require_once __DIR__ . '/../../lib/csrf.php';
require_once __DIR__ . '/../../lib/helpers.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('잘못된 요청 방법입니다.', 405);
}

require_auth();

// CSRF 검증
$csrf_token = sanitize_string($_POST['csrf_token'] ?? '');
if (!csrf_verify($csrf_token)) {
    json_error('보안 토큰이 유효하지 않습니다. 페이지를 새로고침 후 다시 시도해주세요.', 403);
}

// 입력값 추출 및 sanitize
$service_key  = sanitize_string($_POST['service_key']  ?? '');
$phone        = sanitize_string($_POST['phone']        ?? '');
$symptom      = sanitize_string($_POST['symptom']      ?? '', SYMPTOM_MAX_LENGTH);
$reserv_date  = sanitize_string($_POST['reserv_date']  ?? '');
$reserv_stime = sanitize_string($_POST['reserv_stime'] ?? '');
$reserv_etime = sanitize_string($_POST['reserv_etime'] ?? '');

// 유효성 검증
if (!array_key_exists($service_key, SERVICE_MAP)) {
    json_error('유효하지 않은 서비스입니다.');
}

// TODO: Phase 5 — 중복 접수 방지 로직 추가 (CRM DB 조회로 구현)
// 케이스 1: 진행 중(미종료)인 건 있음 → "이미 접수된 원격 건이 있습니다. 취소는 담당 선생님 또는 고객센터로 문의해 주세요."
// 케이스 2: 당일 종료된 건 있음 → "원격 접수는 하루 1회만 가능합니다. 추가 문의는 담당 선생님 또는 고객센터로 연락해 주세요."

if (empty($phone) || !is_valid_phone($phone)) {
    json_error('올바른 연락처를 입력해주세요.');
}

if (empty($symptom)) {
    json_error('증상을 입력해주세요.');
}

if (!is_valid_date_yyyymmdd($reserv_date)) {
    json_error('예약일자가 올바르지 않습니다.');
}

if (!is_valid_time_hhmm($reserv_stime) || !is_valid_time_hhmm($reserv_etime)) {
    json_error('예약시간이 올바르지 않습니다.');
}

// 과거 날짜 체크
$reserv_datetime = \DateTime::createFromFormat('Ymd', $reserv_date);
$today           = new \DateTime('today');
if ($reserv_datetime < $today) {
    json_error('과거 날짜로는 예약할 수 없습니다.');
}

// TODO: Phase 5 - CRM DB SP 호출
// $pdo  = get_pdo();
// $result = insert_remote_request($pdo, [
//     'reserv_date'   => $reserv_date,
//     'reserv_stime'  => $reserv_stime,
//     'reserv_etime'  => $reserv_etime,
//     'service_name'  => SERVICE_MAP[$service_key],
//     'member_status' => get_session_member_status(),
//     'reg_num'       => $reg_num,
//     'user_id'       => get_session_user_id(),
//     'user_name'     => get_session_user_name(),
//     'phone'         => $phone,
//     'receiver_emp'  => get_session_receiver_emp_id(),
//     'reg_date'      => date('YmdHis'),
//     'remote_count'  => get_session_remote_count(),
//     'system_id'     => get_session_system_id(),
// ]);
// if ($result !== 1) { json_error('접수 등록에 실패했습니다. 다시 시도해주세요.'); }

$reg_num = generate_reg_num();

// 완료 페이지용 데이터를 세션에 저장 (one-time)
// 중복 접수 방지 플래그 설정 (Phase 5: 실제 SP 호출 성공 후 설정)
// TODO: Phase 5 — 중복 접수 방지 플래그 설정 (SP 호출 성공 후 세션에 기록)
$_SESSION['complete'] = [
    'reg_num'      => $reg_num,
    'service_key'  => $service_key,
    'service_name' => SERVICE_MAP[$service_key],
    'reserv_date'  => $reserv_date,
    'reserv_stime' => $reserv_stime,
    'reserv_etime' => $reserv_etime,
    'phone'        => $phone,
    'symptom'      => $symptom,
];

json_success([
    'reg_num'  => $reg_num,
    'redirect' => '/remote/complete',
]);
