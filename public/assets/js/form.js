'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const form              = document.getElementById('asForm');
  const symptomEl         = document.getElementById('symptom');
  const charCount         = document.getElementById('charCount');
  const errorBanner       = document.getElementById('errorBanner');
  const errorMessage      = document.getElementById('errorMessage');
  const confirmOverlay    = document.getElementById('confirmOverlay');
  const cancelConfirmBtn  = document.getElementById('cancelConfirmBtn');
  const confirmSubmitBtn  = document.getElementById('confirmSubmitBtn');

  // ── 연락처 자동 하이픈 ──────────────────────────────────
  const phoneEl = document.getElementById('phone');
  if (phoneEl) {
    phoneEl.addEventListener('input', function () {
      const digits = this.value.replace(/\D/g, '').slice(0, 11);
      let v = digits;
      if (digits.startsWith('02')) {
        if (digits.length > 6)      v = digits.slice(0, 2) + '-' + digits.slice(2, 6) + '-' + digits.slice(6);
        else if (digits.length > 2) v = digits.slice(0, 2) + '-' + digits.slice(2);
      } else {
        if (digits.length > 7)      v = digits.slice(0, 3) + '-' + digits.slice(3, 7) + '-' + digits.slice(7);
        else if (digits.length > 3) v = digits.slice(0, 3) + '-' + digits.slice(3);
      }
      this.value = v;
    });
  }

  // ── 글자 수 카운터 ───────────────────────────────────────
  const SYMPTOM_MAX = parseInt(charCount?.closest('.char-counter')?.dataset.max ?? '2000', 10);
  if (symptomEl && charCount) {
    const updateCounter = () => {
      const len       = symptomEl.value.length;
      const remaining = SYMPTOM_MAX - len;
      charCount.textContent = len;
      const counter = charCount.closest('.char-counter');
      counter.classList.toggle('is-warning', remaining <= 200 && remaining > 50);
      counter.classList.toggle('is-danger',  remaining <= 50);
    };
    symptomEl.addEventListener('input', updateCounter);
  }

  if (!form) return;

  // ── 스텝 이동 ────────────────────────────────────────────
  showStep(1);

  form.addEventListener('click', e => {
    const nextBtn = e.target.closest('.btn-step-next');
    const prevBtn = e.target.closest('.btn-step-prev');
    if (nextBtn) {
      const nextStep = parseInt(nextBtn.dataset.next, 10);
      if (validateStep(nextStep - 1)) showStep(nextStep);
    } else if (prevBtn) {
      showStep(parseInt(prevBtn.dataset.prev, 10));
    }
  });

  function validateStep(n) {
    if (n === 1) {
      const phoneVal = document.getElementById('phone')?.value.trim() ?? '';
      if (!phoneVal) {
        setFieldError('fieldPhone', 'phoneError', '연락처를 입력해주세요.');
        return false;
      }
      clearFieldError('fieldPhone', 'phoneError');
      return true;
    }
    if (n === 2) {
      const symptomVal = symptomEl?.value.trim() ?? '';
      if (!symptomVal) {
        setFieldError('fieldSymptom', 'symptomError', '증상을 입력해주세요.');
        return false;
      }
      clearFieldError('fieldSymptom', 'symptomError');
      return true;
    }
    return true;
  }

  function showStep(n) {
    document.querySelectorAll('.step-panel').forEach((panel, i) => {
      const active = i + 1 === n;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
    document.querySelectorAll('.step-item').forEach(item => {
      const s = parseInt(item.dataset.step, 10);
      item.classList.toggle('active', s === n);
      item.classList.toggle('done',   s < n);
    });
  }

  // ── 폼 제출 → 확인 모달 열기 ─────────────────────────────
  form.addEventListener('submit', e => {
    e.preventDefault();
    // Step 3: 예약일시 확인
    const reservDateVal = document.getElementById('reservDate')?.value ?? '';
    if (!reservDateVal) {
      setFieldError('fieldReserv', 'reservError', '예약일시를 선택해주세요.');
      return;
    }
    clearFieldError('fieldReserv', 'reservError');
    openConfirmModal();
  });

  // ── 확인 모달 ────────────────────────────────────────────
  function openConfirmModal() {
    document.getElementById('confirmPhone').textContent =
      document.getElementById('phone')?.value.trim() ?? '';
    document.getElementById('confirmSymptom').textContent =
      symptomEl?.value.trim() ?? '';
    document.getElementById('confirmReserv').textContent =
      document.getElementById('reservLabel')?.textContent ?? '';

    confirmOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeConfirmModal() {
    confirmOverlay.hidden = true;
    document.body.style.overflow = '';
  }

  cancelConfirmBtn?.addEventListener('click', closeConfirmModal);

  // 딤 배경 클릭 시 닫기
  confirmOverlay?.addEventListener('click', e => {
    if (e.target === confirmOverlay) closeConfirmModal();
  });

  // ── 최종 접수 (AJAX) ─────────────────────────────────────
  confirmSubmitBtn?.addEventListener('click', async () => {
    setModalLoading(true);
    hideError();

    try {
      const res  = await fetch('/remote/public/api/submit.php', {
        method: 'POST',
        body:   new FormData(form),
      });
      const data = await res.json();

      if (data.success) {
        window.location.href = data.redirect ?? '/remote/complete';
        return;
      }
      closeConfirmModal();
      showError(data.message || '접수에 실패했습니다. 다시 시도해주세요.');
    } catch {
      closeConfirmModal();
      showError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setModalLoading(false);
    }
  });

  // ── 유효성 검사 (서버 제출 전 최종 안전망) ───────────────
  function validateForm() {
    let valid = true;
    let firstErrorStep = null;

    const phoneVal = document.getElementById('phone')?.value.trim() ?? '';
    if (!phoneVal) {
      setFieldError('fieldPhone', 'phoneError', '연락처를 입력해주세요.');
      if (!firstErrorStep) firstErrorStep = 1;
      valid = false;
    } else {
      clearFieldError('fieldPhone', 'phoneError');
    }

    const symptomVal = symptomEl?.value.trim() ?? '';
    if (!symptomVal) {
      setFieldError('fieldSymptom', 'symptomError', '증상을 입력해주세요.');
      if (!firstErrorStep) firstErrorStep = 2;
      valid = false;
    } else {
      clearFieldError('fieldSymptom', 'symptomError');
    }

    const reservDateVal = document.getElementById('reservDate')?.value ?? '';
    if (!reservDateVal) {
      setFieldError('fieldReserv', 'reservError', '예약일시를 선택해주세요.');
      if (!firstErrorStep) firstErrorStep = 3;
      valid = false;
    } else {
      clearFieldError('fieldReserv', 'reservError');
    }

    if (!valid && firstErrorStep) {
      showStep(firstErrorStep);
      setTimeout(() => {
        form.querySelector('.step-panel.is-active .field-group.has-error')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }

    return valid;
  }

  function setFieldError(fieldId, errorId, msg) {
    document.getElementById(fieldId)?.classList.add('has-error');
    const errorEl = document.getElementById(errorId);
    if (errorEl) { errorEl.textContent = msg; errorEl.hidden = false; }
  }

  function clearFieldError(fieldId, errorId) {
    document.getElementById(fieldId)?.classList.remove('has-error');
    const errorEl = document.getElementById(errorId);
    if (errorEl) errorEl.hidden = true;
  }

  // ── 모달 로딩 상태 ───────────────────────────────────────
  function setModalLoading(on) {
    confirmSubmitBtn.disabled = on;
    confirmSubmitBtn.querySelector('.btn-text').hidden   = on;
    confirmSubmitBtn.querySelector('.btn-spinner').hidden = !on;
  }

  // ── 에러 배너 ────────────────────────────────────────────
  function showError(msg) {
    errorMessage.textContent = msg;
    errorBanner.hidden = false;
    errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideError() {
    errorBanner.hidden = true;
  }

});
