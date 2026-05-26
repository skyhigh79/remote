'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  const reservDate  = document.getElementById('reservDate');
  const reservStime = document.getElementById('reservStime');
  const reservEtime = document.getElementById('reservEtime');
  const dateNextBtn = document.getElementById('dateNextBtn');

  if (!document.getElementById('dateGrid')) return;

  const serviceKey = document.querySelector('input[name="service_key"]')?.value ?? '';

  // ── 날짜 카드 초기화 ─────────────────────────────────────
  await loadDateCards({
    gridEl:    document.getElementById('dateGrid'),
    loadingEl: document.getElementById('dateLoading'),
  }, handleDateSelect);

  // 카드 렌더링 완료 후 모든 날짜의 마감 여부 병렬 사전 체크
  preCheckAllDates();

  // ── 날짜 선택 핸들러 ────────────────────────────────────
  function handleDateSelect(dateStr) {
    // 날짜가 바뀌면 시간 선택 초기화
    if (reservDate.value !== dateStr) {
      reservStime.value = '';
      reservEtime.value = '';
    }

    reservDate.value = dateStr;
    dateNextBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // 슬롯 미리 로드 (Step 4 진입 전 백그라운드 로드)
    loadSlots(dateStr, serviceKey, {
      gridEl:    document.getElementById('slotGrid'),
      loadingEl: document.getElementById('slotLoading'),
      contentEl: document.getElementById('slotContent'),
      emptyEl:   document.getElementById('slotEmpty'),
      dateLabel: document.getElementById('slotDateLabel'),
    }, handleSlotSelect);
  }

  // ── 슬롯 선택 핸들러 ────────────────────────────────────
  function handleSlotSelect({ stime, etime }) {
    reservStime.value = stime;
    reservEtime.value = etime;

    document.getElementById('fieldSlot')?.classList.remove('has-error');
    const slotError = document.getElementById('slotError');
    if (slotError) slotError.hidden = true;
  }

  // ── 날짜 마감 사전 체크 ──────────────────────────────────
  // 날짜 카드 렌더링 직후 모든 날짜에 대해 슬롯 API를 병렬 호출하여
  // 가능한 슬롯이 없는 날짜는 즉시 "마감" 상태로 표시
  async function preCheckAllDates() {
    const btns = document.querySelectorAll('#dateGrid .date-btn');
    await Promise.all([...btns].map(async (btn) => {
      const dateStr = btn.dataset.date;
      try {
        const url = `/remote/public/api/slots.php?date=${encodeURIComponent(dateStr)}&service_key=${encodeURIComponent(serviceKey)}`;
        const res  = await fetch(url);
        const data = await res.json();
        if (!data.success) return;
        const slots = data.slots ?? [];
        const hasAvailable = slots.some(s => s.status === 'available');
        if (slots.length > 0 && !hasAvailable) {
          markDateClosed(btn);
        }
      } catch (_) {}
    }));
  }

  function markDateClosed(btn) {
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');
    btn.classList.add('date-btn--closed');
    const labelEl = btn.querySelector('.date-btn__today');
    if (labelEl) labelEl.textContent = '마감';
    // 이미 선택된 날짜가 마감으로 확인되면 선택 초기화
    if (reservDate.value === btn.dataset.date) {
      reservDate.value  = '';
      reservStime.value = '';
      reservEtime.value = '';
      btn.classList.remove('selected');
      btn.setAttribute('aria-pressed', 'false');
    }
  }
});
