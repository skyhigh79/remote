<?php
require_once __DIR__ . '/../config/config.php';

function start_session(): void {
    if (session_status() === PHP_SESSION_NONE) {
        ini_set('session.cookie_httponly', '1');
        ini_set('session.use_strict_mode', '1');
        session_start();
    }
}

// ============================================================
// 인증 확인
// TODO: Phase 5 — 토큰 검증 로직으로 교체
//   현재: 로컬에서는 더미 세션 자동 세팅, 그 외는 오류 페이지로 이동
//   향후: URL 토큰 파라미터 검증 → 만료 시 token_expired, 없을 시 invalid_access
// ============================================================
function require_auth(): void {
    start_session();

    // ※ 테스트 임시 우회 — 인증 없이 더미 세션으로 자동 세팅
    // TODO: Phase 5 — IS_LOCAL 조건 복구 + 토큰 검증 로직으로 교체
    if (empty($_SESSION['user_id'])) {
        $_SESSION['user_id']       = 'dev_user';
        $_SESSION['user_name']     = '개발테스트';
        $_SESSION['phone']         = '010-1234-5678';
        $_SESSION['member_status'] = '정회원';
        $_SESSION['emp_id']        = 'dev_emp';
        $_SESSION['system_id']     = 'dev-system-id';
        $_SESSION['remote_count']  = '1';
    }

    // if (empty($_SESSION['user_id'])) {
    //     $svc = defined('SERVICE_KEY') ? '&service=' . urlencode(SERVICE_KEY) : '';
    //     header('Location: /remote/error?type=invalid_access' . $svc);
    //     exit;
    // }
}

// ============================================================
// 세션 값 추출 헬퍼
// TODO: 아래 키명 모두 밀크티 CRM 실제 세션 키명으로 교체 필요
// ============================================================
function get_session_user_id(): string {
    return $_SESSION['user_id'] ?? '';
}

function get_session_user_name(): string {
    return $_SESSION['user_name'] ?? '';
}

function get_session_phone(): string {
    return $_SESSION['phone'] ?? '';
}

function get_session_member_status(): string {
    return $_SESSION['member_status'] ?? '';
}

function get_session_receiver_emp_id(): string {
    return $_SESSION['emp_id'] ?? '';
}

function get_session_system_id(): string {
    return $_SESSION['system_id'] ?? '';
}

function get_session_remote_count(): string {
    return $_SESSION['remote_count'] ?? '0';
}
