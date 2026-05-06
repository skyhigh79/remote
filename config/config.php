<?php
// ============================================================
// 1. 환경 감지
// ============================================================
$_host     = $_SERVER['HTTP_HOST'] ?? '';
$_is_local = in_array($_host, ['localhost', '127.0.0.1', 'localhost:8080']);
define('IS_LOCAL',      $_is_local);
define('IS_PRODUCTION', !$_is_local);

// ============================================================
// 2. .env 파일 로드
// ============================================================
$_env_file = __DIR__ . '/../.env';
if (file_exists($_env_file)) {
    $lines = file($_env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#')) continue;
        if (!str_contains($line, '='))         continue;
        [$key, $val]   = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($val);
    }
}

// ============================================================
// 3. DB 접속 정보 (밀크티 측 수령 후 .env에 입력)
// ============================================================
define('DB_HOST',    $_ENV['DB_HOST']    ?? '');
define('DB_PORT',    $_ENV['DB_PORT']    ?? '3306');
define('DB_NAME',    $_ENV['DB_NAME']    ?? '');
define('DB_USER',    $_ENV['DB_USER']    ?? '');
define('DB_PASS',    $_ENV['DB_PASS']    ?? '');
define('DB_CHARSET', 'utf8mb4');

// ============================================================
// 4. 서비스 맵 (URL slug → CRM 서비스명)
// ============================================================
define('SERVICE_MAP', [
    'kids'       => '밀크T아이',
    'elementary' => '밀크T초등',
    'middle'     => '밀크T중학',
    'high'       => '밀크T고등',
]);

// ============================================================
// 4-1. 서비스별 고객센터 번호
// ============================================================
define('CS_NUMBER_MAP', [
    'kids'       => '1522-6002',
    'elementary' => '1577-1533',
    'middle'     => '1522-5533',
    'high'       => '1522-5533',
]);

// ============================================================
// 5. SP 이름 상수
// ============================================================
define('SP_REMOTE_INSERT', 'remote_request_insert');
define('SP_SLOT_LIST',     'remote_slot_list');   // TODO: SP명 밀크티 측 확인

// ============================================================
// 6. 비즈니스 규칙 상수
// ============================================================
define('AS_STATUS_PENDING',  'S01');
define('SYMPTOM_MAX_LENGTH', 2000);
define('SESSION_LIFETIME',   3600);

// ============================================================
// 7. 로그인 리다이렉트 URL (밀크티 측 확인)
// ============================================================
define('CRM_LOGIN_URL', $_ENV['CRM_LOGIN_URL'] ?? '');

// ============================================================
// 8. 에셋 경로
// 서비스별 캐릭터 이미지. URL 변경 시 이 맵만 수정하면 됩니다.
// ============================================================
define('CHARACTER_IMG_MAP', [
    'kids'       => '/remote/public/assets/images/character_kids.png',
    'elementary' => '/remote/public/assets/images/character_elementary.png',
    'middle'     => '/remote/public/assets/images/character_middle.png',
    'high'       => '/remote/public/assets/images/character_high.png',
]);
// 서비스 키를 알 수 없는 화면(오류 페이지 등)에서 사용할 기본 이미지
define('ASSET_CHARACTER_IMG', '/remote/public/assets/images/character_kids.png');

// ============================================================
// 8. 에러 보고
// ============================================================
if (IS_LOCAL) {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(0);
    ini_set('display_errors', '0');
    ini_set('log_errors',     '1');
    ini_set('error_log',      __DIR__ . '/../logs/php_error.log');
}

date_default_timezone_set('Asia/Seoul');

