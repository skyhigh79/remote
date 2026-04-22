<?php
// Phase 6에서 실제 SP 연동으로 교체합니다.
// 현재는 더미 데이터를 반환합니다.
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../lib/session.php';
require_once __DIR__ . '/../../lib/helpers.php';

header('Content-Type: application/json; charset=utf-8');

require_auth();

$date        = sanitize_string($_GET['date']        ?? '');
$service_key = sanitize_string($_GET['service_key'] ?? '');

if (!is_valid_date_yyyymmdd($date) || !array_key_exists($service_key, SERVICE_MAP)) {
    json_error('잘못된 요청입니다.');
}

// TODO: 실제 SP 호출로 교체 (밀크티 측 슬롯 SP 명세서 수령 후)
// 운영 시간: 13:00~22:00 (1시간 단위), 17:00~18:00 저녁시간 제외
// 운영 시간: 13:00~22:00 (1시간 단위), 17:00~18:00 저녁시간 제외, 전 슬롯 available
$dummy_slots = [
    ['stime' => '1300', 'etime' => '1400', 'count' => 3, 'status' => 'available'],
    ['stime' => '1400', 'etime' => '1500', 'count' => 3, 'status' => 'available'],
    ['stime' => '1500', 'etime' => '1600', 'count' => 3, 'status' => 'available'],
    ['stime' => '1600', 'etime' => '1700', 'count' => 3, 'status' => 'available'],
    // 1700~1800 저녁시간 제외
    ['stime' => '1800', 'etime' => '1900', 'count' => 3, 'status' => 'available'],
    ['stime' => '1900', 'etime' => '2000', 'count' => 3, 'status' => 'available'],
    ['stime' => '2000', 'etime' => '2100', 'count' => 3, 'status' => 'available'],
    ['stime' => '2100', 'etime' => '2200', 'count' => 3, 'status' => 'available'],
];

json_success(['slots' => $dummy_slots]);
