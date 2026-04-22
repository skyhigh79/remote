<?php
/**
 * PHP 내장 서버용 라우터 (로컬 개발 전용)
 * 실행: php -S localhost:8080 router.php
 * 접속: http://localhost:8080/remote/elementary
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// 정적 파일 (CSS, JS, 이미지) → 그대로 서빙
if (preg_match('/\.(css|js|png|jpg|gif|ico|svg|woff2?)$/i', $uri)) {
    return false;
}

// URL 라우팅 (.htaccess 역할)
$map = [
    '/remote/kids'        => __DIR__ . '/public/remote/kids.php',
    '/remote/elementary'  => __DIR__ . '/public/remote/elementary.php',
    '/remote/middle'      => __DIR__ . '/public/remote/middle.php',
    '/remote/high'        => __DIR__ . '/public/remote/high.php',
    '/remote/complete'      => __DIR__ . '/public/pages/complete.php',
    '/remote/error'         => __DIR__ . '/public/pages/error.php',
    '/public/api/submit'    => __DIR__ . '/public/api/submit.php',
    '/public/api/slots'     => __DIR__ . '/public/api/slots.php',
    '/remote/api/holidays'  => __DIR__ . '/public/api/holidays.php',
];

if (isset($map[$uri])) {
    require $map[$uri];
    return true;
}

// 그 외 파일 직접 접근 허용
$file = __DIR__ . $uri;
if (is_file($file)) {
    return false;
}

http_response_code(404);
echo '<h1>404 Not Found</h1><p>' . htmlspecialchars($uri) . '</p>';
