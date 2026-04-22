<?php
require_once __DIR__ . '/../../config/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=3600');

/**
 * Nager.Date API로부터 특정 연도의 한국 공휴일을 가져옵니다.
 * 결과는 cache/ 폴더에 연간 단위로 저장되어, 이후 요청은 캐시를 사용합니다.
 */
define('CACHE_TTL_DAYS', 30);

function fetch_holidays_for_year(int $year): array {
    $cache_file = __DIR__ . '/../../cache/holidays_' . $year . '.json';

    // 캐시 파일이 있고 30일 이내면 반환, 초과 시 삭제 후 재요청
    if (file_exists($cache_file)) {
        $expired = (time() - filemtime($cache_file)) > (CACHE_TTL_DAYS * 86400);
        if ($expired) {
            unlink($cache_file);
        } else {
            $cached = json_decode(file_get_contents($cache_file), true);
            if (is_array($cached)) return $cached;
        }
    }

    // Nager.Date API 호출
    $url = "https://date.nager.at/api/v3/PublicHolidays/{$year}/KR";
    $ctx = stream_context_create(['http' => [
        'timeout'     => 5,
        'user_agent'  => 'MilktRemote/1.0',
    ]]);

    $response = @file_get_contents($url, false, $ctx);
    if ($response === false) return [];

    $data = json_decode($response, true);
    if (!is_array($data)) return [];

    // "YYYY-MM-DD" → "YYYYMMDD" 변환
    $dates = array_map(
        fn($item) => str_replace('-', '', $item['date']),
        $data
    );

    // 캐시 저장
    file_put_contents($cache_file, json_encode($dates));

    return $dates;
}

// 올해 + 내년 공휴일 합산 (달력이 연말에 내년까지 보일 수 있으므로)
$this_year = (int)date('Y');
$next_year = $this_year + 1;

$api_holidays = array_unique(array_merge(
    fetch_holidays_for_year($this_year),
    fetch_holidays_for_year($next_year)
));

// 임시 휴일 (갑작스러운 휴일은 config/holidays.php에 추가)
$extra_holidays = require __DIR__ . '/../../config/extra_holidays.php';

$all_holidays = array_values(array_unique(array_merge($api_holidays, $extra_holidays)));
sort($all_holidays);

echo json_encode(['success' => true, 'holidays' => $all_holidays]);
