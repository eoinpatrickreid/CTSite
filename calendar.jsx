// Calendar component — month + week views, drag-drop targets.

function startOfWeek(d) {
  const x = new Date(d);
  const dow = x.getDay(); // 0 Sun
  const diff = (dow + 6) % 7; // Mon = 0
  x.setDate(x.getDate() - diff);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfMonth(d) { const x = new Date(d); x.setDate(1); x.setHours(0,0,0,0); return x; }
function iso(d) { return new Date(d).toISOString().slice(0, 10); }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function monthName(d) { return d.toLocaleDateString('en-US', { month: 'long' }); }
function dayName(d, short=true) { return d.toLocaleDateString('en-US', { weekday: short ? 'short' : 'long' }); }

const DOW = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function Calendar({ view, anchor, setAnchor, events, onDrop, onEventClick, onSwitchView }) {
  const isMonth = view === 'month';
  const [selectedDate, setSelectedDate] = React.useState(null);

  const shift = (delta) => {
    const d = new Date(anchor);
    if (isMonth) d.setMonth(d.getMonth() + delta);
    else d.setDate(d.getDate() + delta * 7);
    setAnchor(d);
  };

  // Events for selected date
  const selectedEvents = React.useMemo(() => {
    if (!selectedDate) return [];
    return events.filter(e => e.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));
  }, [selectedDate, events]);

  const handleDayClick = (dateStr) => {
    setSelectedDate(prev => prev === dateStr ? null : dateStr);
  };

  return (
    <div className="card">
      <div className="cal-toolbar">
        <div className="month-label">
          {monthName(anchor)} <em>{anchor.getFullYear()}</em>
        </div>
        <div className="view-toggle" role="tablist">
          <button className={view === 'week' ? 'active' : ''} onClick={() => onSwitchView('week')}>Week</button>
          <button className={view === 'month' ? 'active' : ''} onClick={() => onSwitchView('month')}>Month</button>
        </div>
        <div className="cal-nav">
          <button className="icon-btn" onClick={() => shift(-1)} aria-label="Previous">‹</button>
          <button className="icon-btn" onClick={() => setAnchor(new Date())} aria-label="Today" style={{ width: 'auto', padding: '0 12px', fontSize: 11, letterSpacing: '0.06em' }}>TODAY</button>
          <button className="icon-btn" onClick={() => shift(1)} aria-label="Next">›</button>
        </div>
      </div>

      {isMonth
        ? <MonthGrid anchor={anchor} events={events} onDrop={onDrop} onEventClick={onEventClick} selectedDate={selectedDate} onDayClick={handleDayClick} />
        : <WeekGrid  anchor={anchor} events={events} onDrop={onDrop} onEventClick={onEventClick} />}

      {selectedDate && (
        <DayDetail
          dateStr={selectedDate}
          events={selectedEvents}
          onEventClick={onEventClick}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}

function MonthGrid({ anchor, events, onDrop, onEventClick, selectedDate, onDayClick }) {
  const first = startOfMonth(anchor);
  const gridStart = startOfWeek(first);
  // Only show as many rows as needed (5 or 6)
  const lastDay = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  const lastCell = startOfWeek(addDays(lastDay, 6));
  const totalDays = Math.ceil((addDays(lastDay, 6).getTime() - gridStart.getTime()) / (1000*60*60*24));
  const rowCount = Math.ceil(totalDays / 7);
  const cellCount = Math.min(rowCount, 6) * 7;
  const cells = Array.from({ length: cellCount }, (_, i) => addDays(gridStart, i));
  const todayIso = iso(new Date());
  const eventsByDate = React.useMemo(() => {
    const m = {};
    for (const e of events) (m[e.date] ||= []).push(e);
    return m;
  }, [events]);

  return (
    <div>
      <div className="month-grid">
        {DOW.map((d) => <div key={d} className="month-dow">{d}</div>)}
        {cells.map((d, i) => {
          const k = iso(d);
          const inMonth = d.getMonth() === anchor.getMonth();
          const isToday = k === todayIso;
          const isSelected = k === selectedDate;
          const dayEvents = eventsByDate[k] || [];
          return (
            <DropCell
              key={i}
              date={k}
              onDrop={onDrop}
              className={`month-cell month-cell-compact ${inMonth ? '' : 'muted'} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => onDayClick(k)}
            >
              <div className="date-num">
                {isToday ? <em>{d.getDate()}</em> : <span>{d.getDate()}</span>}
                {dayEvents.length > 0 && (
                  <span className="day-event-dots">
                    {dayEvents.slice(0, 3).map((e, j) => {
                      const item = ITEM_BY_ID[e.itemId];
                      const type = item ? item.type : (e.tripId ? 'holiday' : 'unknown');
                      return <span key={j} className={`day-dot day-dot-${type}`} />;
                    })}
                  </span>
                )}
              </div>
            </DropCell>
          );
        })}
      </div>
    </div>
  );
}

// Day detail panel — shows events for a clicked date
function DayDetail({ dateStr, events, onEventClick, onClose }) {
  const d = new Date(dateStr + 'T00:00');
  const label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="day-detail">
      <div className="dd-header">
        <div className="dd-date">{label}</div>
        <button className="icon-btn" onClick={onClose} style={{ width: 24, height: 24, fontSize: 12 }}>✕</button>
      </div>
      {events.length === 0 ? (
        <div className="dd-empty">Nothing planned — drag something here!</div>
      ) : (
        <div className="dd-list">
          {events.map((e) => {
            const item = ITEM_BY_ID[e.itemId];
            const label = item ? item.title : (e.label || 'Event');
            const sub = item ? item.subtitle : (e.tripTitle || '');
            const type = item ? item.type : (e.tripId ? 'holiday' : 'unknown');
            const color = item ? item.color : '#B8E0F5';
            return (
              <div key={e.id} className="dd-item" data-type={type} onClick={() => onEventClick(e)}>
                <div className="dd-swatch" style={{ background: color }}></div>
                <div className="dd-info">
                  <div className="dd-title">{label}</div>
                  <div className="dd-sub">{sub}</div>
                </div>
                <div className="dd-time">{e.time}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function WeekGrid({ anchor, events, onDrop, onEventClick }) {
  const weekStart = startOfWeek(anchor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const todayIso = iso(new Date());
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 → 21
  const eventsByDate = React.useMemo(() => {
    const m = {};
    for (const e of events) (m[e.date] ||= []).push(e);
    return m;
  }, [events]);

  return (
    <div className="week-grid">
      <div className="week-dow gutter" />
      {days.map((d) => {
        const k = iso(d);
        const isToday = k === todayIso;
        return (
          <div key={k} className={`week-dow ${isToday ? 'today' : ''}`}>
            <div className="dow-name">{dayName(d)}</div>
            <div className="dow-num">{d.getDate()}</div>
          </div>
        );
      })}

      {hours.map((h) => (
        <React.Fragment key={h}>
          <div className="week-hour-label">{String(h).padStart(2, '0')}:00</div>
          {days.map((d) => {
            const k = iso(d);
            const dayEvents = (eventsByDate[k] || []).filter((e) => {
              const hr = parseInt(e.time.split(':')[0], 10);
              return hr === h;
            });
            return (
              <DropCell key={k+h} date={k} onDrop={onDrop} className="week-cell">
                {dayEvents.map((e) => {
                  const item = ITEM_BY_ID[e.itemId];
                  const label = item ? item.title : (e.label || 'Event');
                  const type = item ? item.type : (e.tripId ? 'holiday' : 'unknown');
                  const min = parseInt(e.time.split(':')[1], 10);
                  return (
                    <div
                      key={e.id}
                      className="week-event"
                      data-type={type}
                      style={{ top: `${(min / 60) * 100 + 2}%`, minHeight: 32 }}
                      draggable
                      onDragStart={(ev) => {
                        ev.dataTransfer.setData('text/x-event', e.id);
                        ev.dataTransfer.effectAllowed = 'move';
                      }}
                      onClick={() => onEventClick(e)}
                    >
                      <div className="we-time">{e.time}</div>
                      <div className="we-title">{label}</div>
                    </div>
                  );
                })}
              </DropCell>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

function DropCell({ date, onDrop, className, children, onClick }) {
  const [over, setOver] = React.useState(false);
  return (
    <div
      className={`${className}${over ? ' dragover' : ''}`}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
      onDragEnter={() => setOver(true)}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const itemId = e.dataTransfer.getData('text/x-item');
        const eventId = e.dataTransfer.getData('text/x-event');
        onDrop({ date, itemId: itemId || null, eventId: eventId || null });
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

Object.assign(window, { Calendar });
