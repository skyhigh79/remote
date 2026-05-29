'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const form          = document.getElementById('asForm');
  const symptomEl     = document.getElementById('symptom');
  const charCount     = document.getElementById('charCount');
  const errorBanner   = document.getElementById('errorBanner');
  const errorMessage  = document.getElementById('errorMessage');
  const submitBtn     = document.getElementById('submitBtn');

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

  // ── 모바일 키보드 대응: 증상 입력 포커스 시 다음 버튼 노출 ──
  if (symptomEl) {
    const scrollToNextBtn = () => {
      const nextBtn = document.querySelector('#stepPanel2 .step-actions');
      nextBtn?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        if (document.activeElement === symptomEl) scrollToNextBtn();
      });
    } else {
      symptomEl.addEventListener('focus', () => {
        setTimeout(scrollToNextBtn, 400);
      });
    }
  }

  if (!form) return;

  // ── 스텝 이동 ────────────────────────────────────────────
  // 초기 진입 시 히스토리 항목을 교체(replaceState)해 step 1을 기록
  history.replaceState({ step: 1 }, '');
  showStep(1, false);

  // Step 5 수정 버튼으로 진입했을 때 true — 완료 후 Step 5로 바로 복귀
  let returnToConfirm = false;
  // 날짜(Step 3) 수정 시: Step 4(시간)까지 다시 거쳐야 Step 5로 복귀 가능
  // Step 3 → Step 4 진입 시점에 returnToConfirm을 활성화하기 위한 플래그
  let dateEditPending = false;

  function setReturnMode(on) {
    returnToConfirm = on;
    document.querySelectorAll('.btn-step-next').forEach(btn => {
      btn.textContent = on ? '수정 완료' : '다음';
    });
    document.querySelectorAll('.btn-step-prev').forEach(btn => {
      btn.hidden = on;
    });
  }

  function resetEditFlags() {
    if (returnToConfirm) setReturnMode(false);
    dateEditPending = false;
  }

  // 안드로이드 뒤로가기 / 브라우저 뒤로가기 → 이전 스텝 복원
  window.addEventListener('popstate', e => {
    const step = e.state?.step;
    if (typeof step === 'number') {
      resetEditFlags();
      showStep(step, false);
    }
  });

  form.addEventListener('click', e => {
    const nextBtn = e.target.closest('.btn-step-next');
    const prevBtn = e.target.closest('.btn-step-prev');
    const editBtn = e.target.closest('.btn-confirm-edit');

    if (nextBtn) {
      const nextStep = parseInt(nextBtn.dataset.next, 10);
      if (validateStep(nextStep - 1)) {
        if (returnToConfirm) {
          // 수정 완료 — Step 5로 즉시 복귀
          setReturnMode(false);
          populateConfirm();
          showStep(5);
        } else if (dateEditPending && nextStep === 4) {
          // 날짜 수정 후 Step 3 → Step 4 진입 시점: 이제 수정 모드 활성화
          // 사용자가 시간을 다시 선택해야 "수정 완료" 가능
          dateEditPending = false;
          setReturnMode(true);
          showStep(4);
        } else {
          if (nextStep === 5) populateConfirm();
          showStep(nextStep);
        }
      }
    } else if (prevBtn) {
      resetEditFlags();
      const prevStep = parseInt(prevBtn.dataset.prev, 10);
      showStep(prevStep);
    } else if (editBtn) {
      const gotoStep = parseInt(editBtn.dataset.goto, 10);
      if (gotoStep === 3) {
        // 날짜 수정: Step 4(시간)도 다시 거쳐야 하므로 즉시 수정 모드 진입 금지
        dateEditPending = true;
        showStep(3);
      } else {
        setReturnMode(true);
        showStep(gotoStep);
      }
    }
  });

  function validateStep(n) {
    if (n === 1) {
      const phoneVal = phoneEl?.value.trim() ?? '';
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
        setFieldError('fieldSymptom', 'symptomError', '문의내용을 입력해주세요.');
        return false;
      }
      clearFieldError('fieldSymptom', 'symptomError');
      return true;
    }
    if (n === 3) {
      const dateVal = document.getElementById('reservDate')?.value ?? '';
      if (!dateVal) {
        setFieldError('fieldDate', 'dateError', '예약날짜를 선택해주세요.');
        return false;
      }
      clearFieldError('fieldDate', 'dateError');
      return true;
    }
    if (n === 4) {
      const stimeVal = document.getElementById('reservStime')?.value ?? '';
      if (!stimeVal) {
        setFieldError('fieldSlot', 'slotError', '예약시간을 선택해주세요.');
        return false;
      }
      clearFieldError('fieldSlot', 'slotError');
      return true;
    }
    return true;
  }

  function showStep(n, push = true) {
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
    if (push) {
      history.pushState({ step: n }, '');
    }
    // Step 5 진입 시: 문의내용이 길어 접수하기 버튼이 가려질 수 있으므로 버튼까지 스크롤
    if (n === 5) {
      requestAnimationFrame(() => {
        document.getElementById('submitBtn')?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    }
  }

  // ── Step 5 확인 내용 채우기 ─────────────────────────────
  function populateConfirm() {
    document.getElementById('confirmPhone').textContent =
      phoneEl?.value.trim() ?? '';
    document.getElementById('confirmSymptom').textContent =
      symptomEl?.value.trim() ?? '';

    const dateStr = document.getElementById('reservDate')?.value ?? '';
    const stime   = document.getElementById('reservStime')?.value ?? '';
    const etime   = document.getElementById('reservEtime')?.value ?? '';

    if (dateStr) {
      const y   = dateStr.slice(0, 4);
      const m   = dateStr.slice(4, 6);
      const d   = dateStr.slice(6, 8);
      const dow = ['일', '월', '화', '수', '목', '금', '토'][new Date(`${y}-${m}-${d}`).getDay()];
      document.getElementById('confirmDate').textContent = `${y}.${m}.${d}(${dow})`;
    }

    if (stime && etime) {
      document.getElementById('confirmTime').textContent =
        `${fmt(stime)} ~ ${fmt(etime)}`;
    }
  }

  function fmt(hhmm) {
    return `${hhmm.slice(0, 2)}:${hhmm.slice(2, 4)}`;
  }

  // ── 최종 접수 (AJAX) ─────────────────────────────────────
  submitBtn?.addEventListener('click', async () => {
    setSubmitLoading(true);
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
      showError(data.message || '접수에 실패했습니다. 다시 시도해주세요.');
    } catch {
      showError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitLoading(false);
    }
  });

  function setSubmitLoading(on) {
    submitBtn.disabled = on;
    submitBtn.querySelector('.btn-text').hidden    = on;
    submitBtn.querySelector('.btn-spinner').hidden = !on;
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

  function showError(msg) {
    errorMessage.textContent = msg;
    errorBanner.hidden = false;
    errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideError() {
    errorBanner.hidden = true;
  }
});
