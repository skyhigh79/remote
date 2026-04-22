<?php

// ============================================================
// 접수번호 생성
// 형식: REM + YYYYMMDD + 6자리 랜덤 숫자
// TODO: CRM 접수번호 형식 규칙 확인 후 수정 필요
// ============================================================
function generate_reg_num(): string {
    $date   = date('Ymd');
    $suffix = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    return 'REM' . $date . $suffix;
}

// ============================================================
// 입력값 sanitize
// ============================================================
function sanitize_string(string $value, int $max_len = 0): string {
    $value = trim($value);
    if ($max_len > 0) {
        $value = mb_substr($value, 0, $max_len);
    }
    return $value;
}

// ============================================================
// 전화번호 형식 검증 (숫자만, 10~11자리)
// ============================================================
function is_valid_phone(string $phone): bool {
    $digits = preg_replace('/\D/', '', $phone);
    return strlen($digits) >= 10 && strlen($digits) <= 11;
}

// ============================================================
// 날짜 형식 검증 (YYYYMMDD)
// ============================================================
function is_valid_date_yyyymmdd(string $date): bool {
    if (!preg_match('/^\d{8}$/', $date)) {
        return false;
    }
    $y = (int)substr($date, 0, 4);
    $m = (int)substr($date, 4, 2);
    $d = (int)substr($date, 6, 2);
    return checkdate($m, $d, $y);
}

// ============================================================
// 시간 형식 검증 (HHMM)
// ============================================================
function is_valid_time_hhmm(string $time): bool {
    if (!preg_match('/^\d{4}$/', $time)) {
        return false;
    }
    $h = (int)substr($time, 0, 2);
    $m = (int)substr($time, 2, 2);
    return $h >= 0 && $h <= 23 && $m >= 0 && $m <= 59;
}

// ============================================================
// JSON 에러 응답 출력 후 종료
// ============================================================
function json_error(string $message, int $http_code = 400): never {
    http_response_code($http_code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

// ============================================================
// JSON 성공 응답 출력 후 종료
// ============================================================
function json_success(array $data = []): never {
    http_response_code(200);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(array_merge(['success' => true], $data), JSON_UNESCAPED_UNICODE);
    exit;
}

// ============================================================
// 전화번호 포맷 (01012345678 → 010-1234-5678)
// ============================================================
function format_phone(string $phone): string {
    $d = preg_replace('/\D/', '', $phone);
    if (strlen($d) === 11) {
        return substr($d, 0, 3) . '-' . substr($d, 3, 4) . '-' . substr($d, 7, 4);
    }
    if (strlen($d) === 10) {
        if (str_starts_with($d, '02')) {
            return substr($d, 0, 2) . '-' . substr($d, 2, 4) . '-' . substr($d, 6, 4);
        }
        return substr($d, 0, 3) . '-' . substr($d, 3, 3) . '-' . substr($d, 6, 4);
    }
    return $phone;
}
