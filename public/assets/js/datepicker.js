'use strict';

/**
 * 예약 가능한 날짜 카드를 렌더링합니다.
 * 오늘부터 최대 MAX_AHEAD 일 내에서 주말·공휴일을 제외한
 * MAX_CARDS 개의 날짜를 2열 카드 그리드로 표시합니다.
 *
 * @param {object}   elements
 * @param {Element}  elements.gridEl     - .date-grid 컨테이너
 * @param {Element}  elements.loadingEl  - 로딩 표시 요소
 * @param {Function} onSelect            - 날짜 선택 콜백 (dateStr: 'YYYYMMDD')
 */
async function loadDateCards(elements, onSelect) {
  const { gridEl, loadingEl } = elements;

  loadingEl.hidden = false;
  gridEl.innerHTML = '';

  // 공휴일 조회
  let holidays = new Set();
  try {
    const res  = await fetch('/remote/api/holidays');
    const data = await res.json();
    if (data.success && Array.isArray(data.holidays)) {
      holidays = new Set(data.holidays);
    }
  } catch (_) {
    // 실패 시 빈 Set으로 진행 (주말 차단은 유지)
  }

  const today    = new Date();
  today.setHours(0, 0, 0, 0);

  // 오늘 포함 7 달력일 이내 (= 오늘 + 6일 후까지)
  const MAX_AHEAD = 6;

  const availableDates = [];
  for (let i = 0; i <= MAX_AHEAD; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue; // 주말 제외

    const dateStr = toDateStr(d);
    if (holidays.has(dateStr)) continue;  // 공휴일 제외

    availableDates.push(d);
  }

  loadingEl.hidden = true;

  if (availableDates.length === 0) {
    gridEl.innerHTML = '<p class="date-empty">예약 가능한 날짜가 없습니다.</p>';
    return;
  }

  const DOW_KO = ['일', '월', '화', '수', '목', '금', '토'];

  // 이번 주 월요일 계산
  const thisMonday = new Date(today);
  const todayDow   = today.getDay();
  thisMonday.setDate(today.getDate() - (todayDow === 0 ? 6 : todayDow - 1));

  // 이번 주 일요일
  const thisSunday = new Date(thisMonday);
  thisSunday.setDate(thisMonday.getDate() + 6);

  function getWeekLabel(d) {
    if (d.getTime() === today.getTime()) return '오늘';
    return d <= thisSunday ? '이번주' : '다음주';
  }

  availableDates.forEach(d => {
    const dateStr   = toDateStr(d);
    const month     = d.getMonth() + 1;
    const day       = d.getDate();
    const dowStr    = DOW_KO[d.getDay()];
    const weekLabel = getWeekLabel(d);

    const btn = document.createElement('button');
    btn.type      = 'button';
    btn.className = 'date-btn';
    btn.dataset.date = dateStr;
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label',
      `${d.getFullYear()}년 ${month}월 ${day}일 ${dowStr}요일 (${weekLabel})`
    );

    btn.innerHTML = `
      <em class="date-btn__today">${weekLabel}</em>
      <span class="date-btn__date">${month}월 ${day}일(${dowStr})</span>
    `;

    btn.addEventListener('click', () => {
      gridEl.querySelectorAll('.date-btn').forEach(b => {
        b.classList.remove('selected');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-pressed', 'true');
      onSelect(dateStr);
    });

    gridEl.appendChild(btn);
  });
}

function toDateStr(d) {
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}
