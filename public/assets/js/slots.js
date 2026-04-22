'use strict';

/**
 * 날짜별 예약 가능 시간 슬롯을 API에서 불러와 렌더링합니다.
 *
 * @param {string} dateStr     - 'YYYYMMDD' 형식 날짜
 * @param {string} serviceKey  - 서비스 키 (kids/elementary/middle/high)
 * @param {object} elements    - DOM 요소 참조 모음
 * @param {Function} onSelect  - 슬롯 선택 시 콜백 ({ stime, etime })
 */
async function loadSlots(dateStr, serviceKey, elements, onSelect) {
  const { gridEl, loadingEl, contentEl, emptyEl, dateLabel } = elements;

  loadingEl.hidden = false;
  contentEl.hidden = true;

  try {
    const url = `/remote/public/api/slots.php?date=${encodeURIComponent(dateStr)}&service_key=${encodeURIComponent(serviceKey)}`;
    const res  = await fetch(url);
    const data = await res.json();

    if (!data.success) throw new Error(data.message || '슬롯 조회 실패');

    const slots = data.slots ?? [];

    // 날짜 레이블
    const y   = dateStr.slice(0, 4);
    const m   = dateStr.slice(4, 6);
    const d   = dateStr.slice(6, 8);
    const dow = ['일', '월', '화', '수', '목', '금', '토'][new Date(`${y}-${m}-${d}`).getDay()];
    dateLabel.textContent = `${y}년 ${m}월 ${d}일 (${dow}) 선택 가능한 시간`;

    gridEl.innerHTML = '';

    const available = slots.filter(s => s.status === 'available');
    const unavailable = slots.filter(s => s.status !== 'available');

    if (available.length === 0 && unavailable.length === 0) {
      emptyEl.hidden = false;
    } else {
      emptyEl.hidden = true;

      // 가능한 슬롯 먼저
      available.forEach(slot => {
        const btn = createSlotBtn(slot, false);
        btn.addEventListener('click', () => {
          gridEl.querySelectorAll('.slot-btn').forEach(b => {
            b.classList.remove('selected');
            b.setAttribute('aria-pressed', 'false');
          });
          btn.classList.add('selected');
          btn.setAttribute('aria-pressed', 'true');
          onSelect({ stime: slot.stime, etime: slot.etime });
        });
        gridEl.appendChild(btn);
      });

      // 불가 슬롯 (마감/운영종료)
      unavailable.forEach(slot => {
        gridEl.appendChild(createSlotBtn(slot, true));
      });
    }

    contentEl.hidden = false;

  } catch (err) {
    console.error('[loadSlots]', err);
    gridEl.innerHTML = `<p class="slot-fetch-error">시간 조회에 실패했습니다.<br>잠시 후 다시 시도해주세요.</p>`;
    emptyEl.hidden   = true;
    contentEl.hidden = false;

  } finally {
    loadingEl.hidden = true;
  }
}

function createSlotBtn(slot, disabled) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'slot-btn';

  const timeText = `${formatTime(slot.stime)} ~ ${formatTime(slot.etime)}`;

  if (disabled) {
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');
    const label = slot.status === 'full' ? '마감' : '운영종료';
    btn.classList.add(`slot-btn--${slot.status}`);
    btn.innerHTML = `${timeText}<br><small>${label}</small>`;
  } else {
    btn.textContent = timeText;
    btn.setAttribute('aria-pressed', 'false');
  }

  return btn;
}

function formatTime(hhmm) {
  return `${hhmm.slice(0, 2)}:${hhmm.slice(2, 4)}`;
}
