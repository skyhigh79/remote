'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const openBtn     = document.getElementById('openPopupBtn');
  const closeBtn    = document.getElementById('closePopupBtn');
  const overlay     = document.getElementById('popupOverlay');
  const confirmBtn  = document.getElementById('confirmBtn');
  const reservLabel = document.getElementById('reservLabel');
  const reservDate  = document.getElementById('reservDate');
  const reservStime = document.getElementById('reservStime');
  const reservEtime = document.getElementById('reservEtime');

  if (!overlay) return;

  const serviceKey = document.querySelector('input[name="service_key"]')?.value ?? '';

  // 팝업 내 선택 상태
  let selectedDate  = null;
  let selectedStime = null;
  let selectedEtime = null;

  // ── 달력 초기화 ──────────────────────────────────────────
  const calendar = new MilktCalendar({
    monthLabel: document.getElementById('calMonth'),
    grid:       document.getElementById('calGrid'),
    prevBtn:    document.getElementById('calPrev'),
    nextBtn:    document.getElementById('calNext'),
    onSelect:   handleDateSelect,
  });

  // ── 날짜 선택 핸들러 ────────────────────────────────────
  function handleDateSelect(dateStr) {
    selectedDate  = dateStr;
    selectedStime = null;
    selectedEtime = null;
    confirmBtn.disabled = true;

    const slotSection = document.getElementById('slotSection');
    slotSection.hidden = false;
    // 슬롯 영역이 보이도록 부드럽게 스크롤
    setTimeout(() => slotSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);

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
    selectedStime = stime;
    selectedEtime = etime;
    confirmBtn.disabled = false;
  }

  // ── 선택 완료 ────────────────────────────────────────────
  confirmBtn.addEventListener('click', () => {
    if (!selectedDate || !selectedStime || !selectedEtime) return;

    reservDate.value  = selectedDate;
    reservStime.value = selectedStime;
    reservEtime.value = selectedEtime;

    const y   = selectedDate.slice(0, 4);
    const m   = selectedDate.slice(4, 6);
    const d   = selectedDate.slice(6, 8);
    const dow = ['일', '월', '화', '수', '목', '금', '토'][new Date(`${y}-${m}-${d}`).getDay()];
    reservLabel.textContent =
      `${y}.${m}.${d}(${dow}) ${fmt(selectedStime)} ~ ${fmt(selectedEtime)}`;

    openBtn.classList.add('is-selected');
    document.getElementById('fieldReserv').classList.remove('has-error');
    document.getElementById('reservError').hidden = true;

    closePopup();
  });

  // ── 팝업 열기 / 닫기 ─────────────────────────────────────
  openBtn.addEventListener('click', openPopup);
  closeBtn.addEventListener('click', closePopup);

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closePopup();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !overlay.hidden) closePopup();
  });

  function openPopup() {
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('calPrev').focus();
  }

  function closePopup() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    openBtn.focus();
  }

  function fmt(hhmm) {
    return `${hhmm.slice(0, 2)}:${hhmm.slice(2, 4)}`;
  }
});
