// Widgets: meals, restaurants, activities, watchlist + small extras.

function WidgetCard({ title, eyebrow, accent, items, hearts, onToggleHeart, onItemClick, onItemAdd, footerNote, kind, onViewAll, collapsed, onToggleCollapse, ratings }) {
  const shown = items.slice(0, 3);
  return (
    <div className={`card ${collapsed ? 'card-collapsed' : ''}`} data-kind={kind}>
      <div className="card-h card-h-toggle" onClick={onToggleCollapse} style={{ marginBottom: collapsed ? 0 : undefined, cursor: 'pointer' }}>
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h2>{title}</h2>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {footerNote && <span className="pill"><span className="dot" style={{ background: accent }} /> {footerNote}</span>}
          <span className="collapse-chevron">{collapsed ? '▸' : '▾'}</span>
        </div>
      </div>
      {!collapsed && (
        <>
          <div className="widget-list">
            {shown.map((it) => (
              <WidgetRow
                key={it.id}
                item={it}
                hearted={!!hearts[it.id]}
                onToggleHeart={() => onToggleHeart(it.id)}
                onClick={() => onItemClick(it)}
                onAdd={() => onItemAdd(it)}
                rating={ratings && ratings[it.id]}
              />
            ))}
          </div>
          {onViewAll && (
            <button className="widget-view-all" onClick={onViewAll}>
              View all {items.length} →
            </button>
          )}
        </>
      )}
    </div>
  );
}

function WidgetRow({ item, hearted, onToggleHeart, onClick, onAdd, rating }) {
  const avg = rating && (rating.eoin || rating.cristina)
    ? ((rating.eoin || 0) + (rating.cristina || 0)) / ((rating.eoin ? 1 : 0) + (rating.cristina ? 1 : 0))
    : null;
  return (
    <div
      className="widget-item"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/x-item', item.id);
        e.dataTransfer.effectAllowed = 'copy';
        e.currentTarget.classList.add('dragging');
      }}
      onDragEnd={(e) => e.currentTarget.classList.remove('dragging')}
      onClick={onClick}
    >
      <div className="swatch" style={{ background: item.color }}>
        {item.title.slice(-1)}
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="wi-title">{item.title}{avg !== null && <span className="wi-rating">★ {avg.toFixed(1)}</span>}</div>
        <div className="wi-sub">{item.subtitle}</div>
      </div>
      <div className="wi-actions" onClick={(e) => e.stopPropagation()}>
        <button
          className={`mini-btn ${hearted ? 'heart-on' : ''}`}
          onClick={onToggleHeart}
          title={hearted ? 'Unfavorite' : 'Favorite'}
        >
          {hearted ? '♥' : '♡'}
        </button>
        <button className="mini-btn" onClick={onAdd} title="Add to calendar">+</button>
      </div>
    </div>
  );
}

// ── Coming Up strip ─────────────────────────────────────────────────────

function ComingUp({ events, onEventClick, onToggleImportant }) {
  const todayStr = new Date().toISOString().slice(0, 10);

  const future = React.useMemo(() => {
    return events
      .filter(e => e.date >= todayStr)
      .sort((a, b) => a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date));
  }, [events, todayStr]);

  const next3 = future.slice(0, 3);
  const next3Ids = new Set(next3.map(e => e.id));
  const importantOther = future.filter(e => e.important && !next3Ids.has(e.id));

  const fmtDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00');
    const tom = new Date(); tom.setHours(0,0,0,0); tom.setDate(tom.getDate() + 1);
    if (dateStr === todayStr) return 'Today';
    if (dateStr === tom.toISOString().slice(0, 10)) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const renderChip = (e, imp) => {
    const item = window.ITEM_BY_ID[e.itemId];
    const title = item ? item.title : (e.label || 'Event');
    const color = item ? item.color : '#B8E0F5';
    return (
      <div key={e.id} className={`cu-chip ${imp ? 'cu-chip-imp' : ''}`} onClick={() => onEventClick(e)}>
        <span className="cu-dot" style={{ background: color }}></span>
        <span className="cu-title">{title}</span>
        <span className="cu-when">{fmtDate(e.date)} · {e.time}</span>
        <button className={`cu-star ${e.important ? 'on' : ''}`}
          onClick={(ev) => { ev.stopPropagation(); onToggleImportant(e.id); }}
          title={e.important ? 'Unmark important' : 'Mark important'}>
          {e.important ? '★' : '☆'}
        </button>
      </div>
    );
  };

  return (
    <div className="coming-up">
      <div className="cu-section">
        <div className="cu-label">Coming up</div>
        <div className="cu-items">
          {next3.length === 0 && <span className="cu-empty">Nothing planned yet</span>}
          {next3.map(e => renderChip(e, false))}
        </div>
      </div>
      {importantOther.length > 0 && (
        <div className="cu-section cu-section-imp">
          <div className="cu-label cu-label-imp">★ Important</div>
          <div className="cu-items">
            {importantOther.slice(0, 2).map(e => renderChip(e, true))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Small header widgets ─────────────────────────────────────────────────

function DaysCounter({ since }) {
  const days = React.useMemo(() => {
    const d0 = new Date(since);
    const ms = Date.now() - d0.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  }, [since]);
  return (
    <div className="stat" title={`Together since ${since}`}>
      <div className="glyph" style={{ background: 'var(--pink-soft)' }}>♥</div>
      <div className="stat-body">
        <div className="stat-label">Together</div>
        <div className="stat-val"><em>{days.toLocaleString()}</em> days</div>
      </div>
    </div>
  );
}

function WeatherStat() {
  // Fake but plausible — placeholder
  const conditions = [
    { icon: '☀', label: 'Sunny', temp: 22 },
    { icon: '⛅', label: 'Partly cloudy', temp: 18 },
    { icon: '☁', label: 'Overcast', temp: 14 },
    { icon: '☂', label: 'Showers', temp: 12 },
  ];
  const c = conditions[1];
  return (
    <div className="stat">
      <div className="glyph" style={{ background: 'var(--sky)' }}>{c.icon}</div>
      <div className="stat-body">
        <div className="stat-label">Today · Outside</div>
        <div className="stat-val"><em>{c.temp}°</em> {c.label}</div>
      </div>
    </div>
  );
}

function TurnTracker({ collapsed, onToggleCollapse }) {
  // Cycle whose turn — simple placeholder logic
  const [turns, setTurns] = React.useState({
    chef:   'Eoin',
    picker: 'Cristina',
  });
  const flip = (role) => setTurns((t) => ({ ...t, [role]: t[role] === 'Eoin' ? 'Cristina' : 'Eoin' }));
  return (
    <div className={`card ${collapsed ? 'card-collapsed' : ''}`}>
      <div className="card-h card-h-toggle" onClick={onToggleCollapse} style={{ marginBottom: collapsed ? 0 : undefined, cursor: 'pointer' }}>
        <div>
          <div className="eyebrow">whose turn</div>
          <h2 style={{ fontSize: 22 }}>Tonight, <em>it&rsquo;s on…</em></h2>
        </div>
        <span className="collapse-chevron">{collapsed ? '▸' : '▾'}</span>
      </div>
      {!collapsed && <div className="turn-card">
        <div className="turn-avatars">
          <div className="avatar" title="Eoin">E</div>
          <div className="avatar cris" title="Cristina">C</div>
        </div>
        <div className="turn-tasks">
          <div className={`turn-row ${turns.chef === 'Eoin' ? 'eoin' : 'cris'}`} onClick={() => flip('chef')} style={{ cursor: 'pointer' }}>
            <span className="role">Chef</span><span className="who">{turns.chef}</span>
          </div>
          <div className={`turn-row ${turns.picker === 'Eoin' ? 'eoin' : 'cris'}`} onClick={() => flip('picker')} style={{ cursor: 'pointer' }}>
            <span className="role">Picks the movie</span><span className="who">{turns.picker}</span>
          </div>
        </div>
      </div>}
    </div>
  );
}

// ── Rating components ───────────────────────────────────────────────────────

function RatingStars({ value, onChange, color }) {
  return (
    <div className="rating-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} className={`star-btn ${n <= (value || 0) ? 'filled' : ''}`}
          onClick={(e) => { e.stopPropagation(); onChange(n === value ? null : n); }}
          style={n <= (value || 0) ? { color } : {}}>
          {n <= (value || 0) ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
}

function RatingBlock({ itemId, ratings, onRate }) {
  const r = ratings[itemId] || {};
  return (
    <div className="rating-block">
      <div className="rating-row">
        <span className="rating-label eoin">Eoin</span>
        <RatingStars value={r.eoin} onChange={(v) => onRate(itemId, 'eoin', v)} color="var(--pink)" />
      </div>
      <div className="rating-row">
        <span className="rating-label cris">Cristina</span>
        <RatingStars value={r.cristina} onChange={(v) => onRate(itemId, 'cristina', v)} color="var(--purple)" />
      </div>
    </div>
  );
}

// ── Agenda Points widget ─────────────────────────────────────────────────

function AgendaPoints({ collapsed, onToggleCollapse }) {
  const STORAGE_KEY = 'together-agenda';
  const [items, setItems] = React.useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'ag1', text: 'Book dinner for anniversary', done: false, by: 'Eoin' },
      { id: 'ag2', text: 'Look at flights for summer trip', done: false, by: 'Cristina' },
      { id: 'ag3', text: 'Cancel old gym membership', done: true, by: 'Eoin' },
    ];
  });
  const [newText, setNewText] = React.useState('');
  const [newBy, setNewBy] = React.useState('Eoin');

  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) {}
  }, [items]);

  const addItem = () => {
    if (!newText.trim()) return;
    setItems((prev) => [...prev, { id: `ag${Date.now()}`, text: newText.trim(), done: false, by: newBy }]);
    setNewText('');
  };

  const toggleDone = (id) => setItems((prev) => prev.map((i) => i.id === id ? { ...i, done: !i.done } : i));
  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const pending = items.filter((i) => !i.done);
  const completed = items.filter((i) => i.done);

  return (
    <div className={`card agenda-card ${collapsed ? 'card-collapsed' : ''}`}>
      <div className="card-h card-h-toggle" onClick={onToggleCollapse} style={{ marginBottom: collapsed ? 0 : undefined, cursor: 'pointer' }}>
        <div>
          <div className="eyebrow">reminders</div>
          <h2 style={{ fontSize: 22 }}>Agenda <em>points</em></h2>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="pill">{pending.length} open</span>
          <span className="collapse-chevron">{collapsed ? '▸' : '▾'}</span>
        </div>
      </div>

      {!collapsed && <><div className="agenda-add">
        <input
          className="agenda-input"
          type="text"
          placeholder="Add a reminder…"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addItem(); }}
        />
        <button className="agenda-by" onClick={() => setNewBy((b) => b === 'Eoin' ? 'Cristina' : 'Eoin')} title="Assigned to">
          {newBy === 'Eoin' ? 'E' : 'C'}
        </button>
        <button className="mini-btn" onClick={addItem} title="Add" style={{ flexShrink: 0 }}>+</button>
      </div>

      <div className="agenda-list">
        {pending.map((item) => (
          <div key={item.id} className="agenda-row">
            <button className="agenda-check" onClick={() => toggleDone(item.id)}>○</button>
            <span className="agenda-text">{item.text}</span>
            <span className={`agenda-who ${item.by === 'Eoin' ? 'eoin' : 'cris'}`}>{item.by}</span>
            <button className="agenda-remove" onClick={() => removeItem(item.id)}>✕</button>
          </div>
        ))}
        {completed.length > 0 && (
          <div className="agenda-done-section">
            <div className="agenda-done-label">{completed.length} done</div>
            {completed.map((item) => (
              <div key={item.id} className="agenda-row done">
                <button className="agenda-check checked" onClick={() => toggleDone(item.id)}>✓</button>
                <span className="agenda-text">{item.text}</span>
                <span className={`agenda-who ${item.by === 'Eoin' ? 'eoin' : 'cris'}`}>{item.by}</span>
                <button className="agenda-remove" onClick={() => removeItem(item.id)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div></>
      }
    </div>
  );
}

Object.assign(window, { WidgetCard, DaysCounter, WeatherStat, TurnTracker, AgendaPoints, RatingStars, RatingBlock, ComingUp });
