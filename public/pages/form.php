<?php
// 이 파일은 public/remote/{service_key}.php 에서 include 됩니다.
// SERVICE_KEY, SERVICE_NAME, $default_phone, $csrf_token 이 이미 정의되어 있습니다.
require_once __DIR__ . '/../../lib/helpers.php';
// 연락처: CRM 세션 값은 숫자만 있을 수 있으므로 출력 시점에 하이픈 포맷 적용
$default_phone  = format_phone($default_phone ?? '');
$character_img  = CHARACTER_IMG_MAP[SERVICE_KEY] ?? ASSET_CHARACTER_IMG;
?>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title><?= htmlspecialchars(SERVICE_NAME) ?> 원격 AS 접수</title>
  <link rel="stylesheet" href="/remote/public/assets/css/variables.css">
  <link rel="stylesheet" href="/remote/public/assets/css/reset.css">
  <link rel="stylesheet" href="/remote/public/assets/css/form.css">
  <link rel="stylesheet" href="/remote/public/assets/css/popup.css">
</head>
<body data-service="<?= htmlspecialchars(SERVICE_KEY) ?>">

  <main class="page-wrap">
    <div class="form-card">

      <!-- 캐릭터 히어로 헤더 -->
      <div class="form-hero">
        <div class="hero-text">
          <span class="hero-badge"><?= htmlspecialchars(SERVICE_NAME) ?></span>
          <p class="hero-title">원격지원 서비스</p>
          <p class="hero-subtitle">접수하신 날짜와 시간에 맞춰<br>원격 상담사가 연락드립니다.</p>
        </div>
        <img class="hero-character"
             src="<?= htmlspecialchars($character_img) ?>"
             alt=""
             aria-hidden="true">
      </div>

      <div class="form-body">

      <!-- 스텝 인디케이터 -->
      <div class="step-nav" id="stepNav" aria-hidden="true">
        <div class="step-item active" data-step="1">
          <div class="step-circle">1</div>
          <span class="step-label">연락처 입력</span>
        </div>
        <div class="step-line"></div>
        <div class="step-item" data-step="2">
          <div class="step-circle">2</div>
          <span class="step-label">문의내용 입력</span>
        </div>
        <div class="step-line"></div>
        <div class="step-item" data-step="3">
          <div class="step-circle">3</div>
          <span class="step-label">날짜 선택</span>
        </div>
        <div class="step-line"></div>
        <div class="step-item" data-step="4">
          <div class="step-circle">4</div>
          <span class="step-label">시간대 선택</span>
        </div>
        <div class="step-line"></div>
        <div class="step-item" data-step="5">
          <div class="step-circle">5</div>
          <span class="step-label">접수내용 확인</span>
        </div>
      </div>

      <!-- 에러 메시지 (JS에서 동적으로 표시) -->
      <div class="form-error-banner" id="errorBanner" hidden>
        <svg class="icon-error" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
          <path d="M10 6v4m0 3h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span id="errorMessage"></span>
      </div>

      <!-- 접수 폼 -->
      <form class="as-form" id="asForm" novalidate>

        <input type="hidden" name="csrf_token"  value="<?= htmlspecialchars($csrf_token) ?>">
        <input type="hidden" name="service_key" value="<?= htmlspecialchars(SERVICE_KEY) ?>">
        <input type="hidden" name="reserv_date" id="reservDate">
        <input type="hidden" name="reserv_stime" id="reservStime">
        <input type="hidden" name="reserv_etime" id="reservEtime">

        <!-- Step 1: 연락처 -->
        <div class="step-panel is-active" id="stepPanel1">
          <div class="field-group" id="fieldPhone">
            <label class="field-label" for="phone">
              연락처
              <span class="required" aria-label="필수">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              class="field-input"
              value="<?= htmlspecialchars($default_phone) ?>"
              placeholder="연락처를 입력해주세요"
              maxlength="20"
              autocomplete="tel"
            >
            <p class="field-guide">*실제로 연락 받으실 번호를 입력해주세요 <br> *입력해주신 번호로 원격 상담사가 연락드립니다</p>
            <p class="field-error" id="phoneError" hidden></p>
          </div>
          <div class="step-actions">
            <button type="button" class="btn-step-next" data-next="2">다음</button>
          </div>
        </div>

        <!-- Step 2: 문의 내용 -->
        <div class="step-panel" id="stepPanel2" hidden>
          <div class="field-group" id="fieldSymptom">
            <label class="field-label" for="symptom">
              문의내용
              <span class="required" aria-label="필수">*</span>
            </label>
            <div class="textarea-wrap">
              <textarea
                id="symptom"
                name="symptom"
                class="field-textarea"
                placeholder="불편하신 부분을 자세히 입력해주세요.&#10;&#10;예) X월 Y일 국어 학습이 안 열려요 / 화면이 이동될 때 오래 걸려요 / 초등 로그인이 안돼요"
                maxlength="<?= SYMPTOM_MAX_LENGTH ?>"
                rows="5"
              ></textarea>
              <span class="char-counter" data-max="<?= SYMPTOM_MAX_LENGTH ?>">
                <span id="charCount">0</span>/<?= SYMPTOM_MAX_LENGTH ?>
              </span>
            </div>
            <p class="field-error" id="symptomError" hidden></p>
          </div>
          <div class="step-actions">
            <button type="button" class="btn-step-prev" data-prev="1">이전</button>
            <button type="button" class="btn-step-next" data-next="3">다음</button>
          </div>
        </div>

        <!-- Step 3: 예약날짜 선택 -->
        <div class="step-panel" id="stepPanel3" hidden>
          <div class="field-group" id="fieldDate">
            <label class="field-label">
              예약날짜 선택
              <span class="required" aria-label="필수">*</span>
            </label>
          </div>

          <!-- 날짜 카드 로딩 -->
          <div class="slot-loading" id="dateLoading">
            <span class="slot-spinner" aria-hidden="true"></span>
            <span>가능한 날짜를 불러오는 중...</span>
          </div>
          <!-- 날짜 카드 그리드 -->
          <div class="date-grid" id="dateGrid"></div>
          <p class="field-error" id="dateError" hidden></p>

          <div class="step-actions">
            <button type="button" class="btn-step-prev" data-prev="2">이전</button>
            <button type="button" class="btn-step-next" data-next="4" id="dateNextBtn">다음</button>
          </div>
        </div>

        <!-- Step 4: 예약시간 선택 -->
        <div class="step-panel" id="stepPanel4" hidden>
          <div class="field-group" id="fieldSlot">
            <label class="field-label">
              예약시간 선택
              <span class="required" aria-label="필수">*</span>
            </label>
            <p class="slot-date-label" id="slotDateLabel"></p>
          </div>

          <!-- 슬롯 로딩 / 컨텐츠 -->
          <div class="slot-loading" id="slotLoading" hidden>
            <span class="slot-spinner" aria-hidden="true"></span>
            <span>가능한 시간을 불러오는 중...</span>
          </div>
          <div class="slot-content" id="slotContent" hidden>
            <div class="slot-grid" id="slotGrid"></div>
            <p class="slot-empty" id="slotEmpty" hidden>선택한 날짜에 가능한 시간이 없습니다.<br>다른 날짜를 선택해주세요.</p>
          </div>
          <p class="field-error" id="slotError" hidden></p>

          <div class="step-actions">
            <button type="button" class="btn-step-prev" data-prev="3">이전</button>
            <button type="button" class="btn-step-next" data-next="5" id="slotNextBtn">다음</button>
          </div>
        </div>

        <!-- Step 5: 접수 내용 확인 -->
        <div class="step-panel" id="stepPanel5" hidden>
          <p class="confirm-heading">입력하신 정보를 확인해주세요</p>
          <dl class="confirm-info">
            <div class="confirm-row">
              <dt>연락처</dt>
              <dd id="confirmPhone"></dd>
              <button type="button" class="btn-confirm-edit" data-goto="1" aria-label="연락처 수정">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
                <span class="btn-confirm-edit__text">수정</span>
              </button>
            </div>
            <div class="confirm-row">
              <dt>문의내용</dt>
              <dd id="confirmSymptom"></dd>
              <button type="button" class="btn-confirm-edit" data-goto="2" aria-label="문의내용 수정">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
                <span class="btn-confirm-edit__text">수정</span>
              </button>
            </div>
            <div class="confirm-row">
              <dt>예약날짜</dt>
              <dd id="confirmDate"></dd>
              <button type="button" class="btn-confirm-edit" data-goto="3" aria-label="예약날짜 수정">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
                <span class="btn-confirm-edit__text">수정</span>
              </button>
            </div>
            <div class="confirm-row">
              <dt>예약시간</dt>
              <dd id="confirmTime"></dd>
              <button type="button" class="btn-confirm-edit" data-goto="4" aria-label="예약시간 수정">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
                <span class="btn-confirm-edit__text">수정</span>
              </button>
            </div>
          </dl>
          <p class="confirm-notice">*예약하신 시간대에 순차적으로 연락드릴 예정입니다</p>
          <div class="step-actions">
            <button type="button" class="btn-step-prev" data-prev="4">이전</button>
            <button type="button" class="btn-step-submit" id="submitBtn">
              <span class="btn-text">접수하기</span>
              <span class="btn-spinner" hidden aria-hidden="true"></span>
            </button>
          </div>
        </div>

      </form>

      </div><!-- /.form-body -->
    </div>
  </main>

  <script src="/remote/public/assets/js/form.js"></script>
  <script src="/remote/public/assets/js/datepicker.js"></script>
  <script src="/remote/public/assets/js/slots.js"></script>
  <script src="/remote/public/assets/js/reservation.js"></script>
</body>
</html>
