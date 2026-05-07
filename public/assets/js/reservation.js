'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const reservDate  = document.getElementById('reservDate');
  const reservStime = document.getElementById('reservStime');
  const reservEtime = document.getElementById('reservEtime');
  const dateNextBtn = document.getElementById('dateNextBtn');

  if (!document.getElementById('dateGrid')) return;

  const serviceKey = document.querySelector('input[name="service_key"]')?.value ?? '';

  // ── 날짜 카드 초기화 ─────────────────────────────────────
  loadDateCards({
    gridEl:    document.getElementById('dateGrid'),
    loadingEl: document.getElementById('dateLoading'),
  }, handleDateSelect);

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
});
