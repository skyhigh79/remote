<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../lib/session.php';
require_once __DIR__ . '/../../lib/helpers.php';

start_session();

// 완료 데이터 없이 직접 접근 시 차단
if (empty($_SESSION['complete'])) {
    header('Location: /');
    exit;
}

$r = $_SESSION['complete'];
unset($_SESSION['complete']); // 1회성 — 읽은 즉시 삭제 (새로고침 중복 방지)

$service_key  = $r['service_key']  ?? '';
$service_name = $r['service_name'] ?? '';
$reserv_date  = $r['reserv_date']  ?? '';
$reserv_stime = $r['reserv_stime'] ?? '';
$reserv_etime = $r['reserv_etime'] ?? '';
$phone        = $r['phone']        ?? '';
$symptom      = $r['symptom']      ?? '';

// 서비스별 고객센터 번호 / 캐릭터 이미지
$cs_number     = CS_NUMBER_MAP[$service_key]    ?? '고객센터';
$character_img = CHARACTER_IMG_MAP[$service_key] ?? ASSET_CHARACTER_IMG;

// 날짜/시간 포맷
$date_obj  = \DateTime::createFromFormat('Ymd', $reserv_date);
$dow_names = ['일', '월', '화', '수', '목', '금', '토'];
$date_fmt  = $date_obj
    ? $date_obj->format('Y년 m월 d일') . '(' . $dow_names[(int)$date_obj->format('w')] . ')'
    : $reserv_date;
$time_fmt  = sprintf(
    '%s:%s ~ %s:%s',
    substr($reserv_stime, 0, 2), substr($reserv_stime, 2, 2),
    substr($reserv_etime, 0, 2), substr($reserv_etime, 2, 2)
);
?>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>접수 완료 — <?= htmlspecialchars($service_name) ?> 원격 AS</title>
  <link rel="stylesheet" href="/remote/public/assets/css/variables.css">
  <link rel="stylesheet" href="/remote/public/assets/css/reset.css">
  <link rel="stylesheet" href="/remote/public/assets/css/complete.css">
</head>
<body data-service="<?= htmlspecialchars($service_key) ?>">
  <main class="complete-page">
    <div class="complete-card">

      <!-- 캐릭터 히어로 -->
      <div class="complete-hero">
        <div class="hero-text">
          <span class="hero-badge"><?= htmlspecialchars($service_name) ?></span>
          <p class="hero-title">원격지원 서비스</p>
          <p class="hero-subtitle">접수가 완료되었습니다.</p>
        </div>
        <img class="hero-character"
             src="<?= htmlspecialchars($character_img) ?>"
             alt=""
             aria-hidden="true">
      </div>

      <div class="complete-body">

      <!-- 접수 정보 -->
      <dl class="complete-info">
        <div class="info-row">
          <dt>예약일시</dt>
          <dd><?= htmlspecialchars("{$date_fmt} {$time_fmt}") ?></dd>
        </div>
        <div class="info-row">
          <dt>연락처</dt>
          <dd><?= htmlspecialchars(format_phone($phone)) ?></dd>
        </div>
        <?php if ($symptom !== ''): ?>
        <div class="info-row">
          <dt>문의내용</dt>
          <dd><?= nl2br(htmlspecialchars($symptom)) ?></dd>
        </div>
        <?php endif; ?>
      </dl>

      <!-- 안내 문구 -->
      <p class="complete-note">
        예약 시간 변경, 취소는 담당 선생님 또는
        고객센터(<a class="cs-tel" href="tel:<?= htmlspecialchars(preg_replace('/[^0-9]/', '', $cs_number)) ?>"><?= htmlspecialchars($cs_number) ?></a>)로 문의 부탁드립니다.
      </p>

      <!-- 버튼 영역 -->
      <div class="complete-actions">
        <button type="button" class="btn-close" onclick="handleClose()">
          확인
        </button>
        <p class="close-fallback" id="closeFallback" hidden>
          카카오톡 앱으로 직접 돌아가주세요.
        </p>
      </div><!-- /.complete-actions -->

      </div><!-- /.complete-body -->
    </div>
  </main>

  <script>
    function handleClose() {
      window.close();
      // window.close()가 실패하면 페이지가 그대로 남아 있으므로
      // 300ms 후에도 살아 있으면 안내 문구를 표시
      setTimeout(function () {
        document.getElementById('closeFallback').hidden = false;
      }, 300);
    }
  </script>
</body>
</html>
