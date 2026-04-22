<?php
require_once __DIR__ . '/../../config/config.php';

// 오류 유형별 제목·안내 문구 정의 (허용 목록 — 직접 입력값 표시 금지)
// desc는 신뢰된 고정값이므로 <br> 태그 포함 가능
const ERROR_MAP = [
    'token_expired'  => [
        'title' => '링크가 만료되었습니다',
        'desc'  => '원격 접수를 다시 요청하여<br>새 링크를 발송해주시길 부탁드립니다.',
    ],
    'invalid_access' => [
        'title' => '잘못된 접근입니다',
        'desc'  => '원격 접수를 다시 요청하여<br>새 링크를 발송해주시길 부탁드립니다.',
    ],
    'server_error'   => [
        'title' => '일시적인 오류가 발생했습니다',
        'desc'  => '잠시 후 다시 시도해 주세요.',
    ],
];

$type  = $_GET['type'] ?? 'invalid_access';
$error = ERROR_MAP[$type] ?? ERROR_MAP['invalid_access'];

// 서비스 키 — 허용 목록으로만 제한
$service_key  = $_GET['service'] ?? '';
if (!array_key_exists($service_key, SERVICE_MAP)) {
    $service_key = '';
}
$service_name  = $service_key ? SERVICE_MAP[$service_key] : '';
$character_img = $service_key
    ? (CHARACTER_IMG_MAP[$service_key] ?? ASSET_CHARACTER_IMG)
    : ASSET_CHARACTER_IMG;
?>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>오류 — 원격지원 서비스</title>
  <link rel="stylesheet" href="/remote/public/assets/css/variables.css">
  <link rel="stylesheet" href="/remote/public/assets/css/reset.css">
  <link rel="stylesheet" href="/remote/public/assets/css/error.css">
</head>
<body<?= $service_key ? ' data-service="' . htmlspecialchars($service_key) . '"' : '' ?>>
  <main class="error-page">
    <div class="error-card">

      <!-- 캐릭터 히어로 -->
      <div class="error-hero">
        <div class="hero-text">
          <?php if ($service_name): ?>
          <span class="hero-badge"><?= htmlspecialchars($service_name) ?></span>
          <?php else: ?>
          <span class="hero-badge">원격 AS</span>
          <?php endif; ?>
          <p class="hero-title">원격지원 서비스</p>
          <p class="hero-subtitle">접수 오류</p>
        </div>
        <img class="hero-character"
             src="<?= htmlspecialchars($character_img) ?>"
             alt=""
             aria-hidden="true">
      </div>

      <!-- 오류 메시지 -->
      <div class="error-body">
        <div class="error-message">
          <p class="error-title"><?= htmlspecialchars($error['title']) ?></p>
          <p class="error-desc"><?= $error['desc'] ?></p>
        </div>
      </div>

    </div>
  </main>
</body>
</html>
