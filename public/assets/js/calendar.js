'use strict';

class MilktCalendar {
  #monthLabel;
  #grid;
  #prevBtn;
  #nextBtn;
  #year;
  #month;
  #selectedDate;  // 'YYYYMMDD'
  #onSelect;      // callback(dateStr)
  #holidays;      // Set<'YYYYMMDD'>

  // 오늘부터 최대 예약 가능 일수 (오늘 포함 7일 = 오늘 + 6일 후까지)
  // 예: 월요일 접수 → 일요일까지 선택 가능
  static #MAX_DAYS_AHEAD = 6;

  constructor({ monthLabel, grid, prevBtn, nextBtn, onSelect }) {
    this.#monthLabel = monthLabel;
    this.#grid       = grid;
    this.#prevBtn    = prevBtn;
    this.#nextBtn    = nextBtn;
    this.#onSelect   = onSelect;
    this.#selectedDate = null;
    this.#holidays   = new Set();

    const today = new Date();
    this.#year  = today.getFullYear();
    this.#month = today.getMonth(); // 0-indexed

    this.#prevBtn.addEventListener('click', () => this.#navigate(-1));
    this.#nextBtn.addEventListener('click', () => this.#navigate(1));

    this.#loadHolidays();
  }

  get selectedDate() {
    return this.#selectedDate;
  }

  async #loadHolidays() {
    try {
      const res  = await fetch('/remote/api/holidays');
      const data = await res.json();
      if (data.success && Array.isArray(data.holidays)) {
        this.#holidays = new Set(data.holidays);
      }
    } catch (_) {
      // 휴일 로드 실패 시 빈 Set으로 진행 (주말 처리는 유지)
    }
    this.render();
  }

  #navigate(delta) {
    this.#month += delta;
    if (this.#month < 0)  { this.#month = 11; this.#year--; }
    if (this.#month > 11) { this.#month = 0;  this.#year++; }
    this.render();
  }

  render() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + MilktCalendar.#MAX_DAYS_AHEAD);

    // 연월 표시
    this.#monthLabel.textContent = `${this.#year}년 ${this.#month + 1}월`;

    // 이전/다음 버튼 활성화 제어
    const isCurrentMonth =
      this.#year === today.getFullYear() && this.#month === today.getMonth();
    const isMaxMonth =
      this.#year === maxDate.getFullYear() && this.#month === maxDate.getMonth();
    const isPastMax =
      new Date(this.#year, this.#month) > new Date(maxDate.getFullYear(), maxDate.getMonth());

    this.#prevBtn.disabled = isCurrentMonth;
    this.#nextBtn.disabled = isMaxMonth || isPastMax;

    // 달력 날짜 생성
    const firstDow    = new Date(this.#year, this.#month, 1).getDay(); // 0=일
    const daysInMonth = new Date(this.#year, this.#month + 1, 0).getDate();

    this.#grid.innerHTML = '';

    // 첫 날 앞의 빈 칸
    for (let i = 0; i < firstDow; i++) {
      const cell = document.createElement('div');
      cell.className = 'cal-day empty';
      this.#grid.appendChild(cell);
    }

    // 날짜 버튼 생성
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(this.#year, this.#month, d);
      dateObj.setHours(0, 0, 0, 0);
      const dateStr = MilktCalendar.#toDateStr(this.#year, this.#month + 1, d);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal-day';
      btn.textContent = d;
      btn.dataset.date = dateStr;
      btn.setAttribute('aria-label',
        `${this.#year}년 ${this.#month + 1}월 ${d}일`
      );

      const dow        = dateObj.getDay();
      const isToday    = dateObj.getTime() === today.getTime();
      const isPast     = dateObj < today;
      const isTooFar   = dateObj > maxDate;
      const isWeekend  = dow === 0 || dow === 6;
      const isHoliday  = this.#holidays.has(dateStr);
      const isSelected = dateStr === this.#selectedDate;

      if (isToday)    btn.classList.add('today');
      if (isSelected) btn.classList.add('selected');
      if (isWeekend)  btn.classList.add('weekend');
      if (isHoliday)  btn.classList.add('holiday');

      if (isPast || isTooFar || isWeekend || isHoliday) {
        btn.classList.add('disabled');
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
      } else {
        btn.addEventListener('click', () => this.#selectDate(dateStr));
      }

      this.#grid.appendChild(btn);
    }
  }

  #selectDate(dateStr) {
    this.#selectedDate = dateStr;
    this.render();
    this.#onSelect(dateStr);
  }

  static #toDateStr(year, month, day) {
    return `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
  }
}
