// Modals — detail view for items + scheduling picker.

function ItemModal({ item, onClose, onSchedule, ratings, onRate }) {
  if (!item) return null;
  const meta = TYPE_META[item.type];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="detail-meta">
          <span className="pill"><span className="dot" style={{ background: item.color }} />{meta.label}</span>
          {item.duration && <span className="pill">{item.duration}</span>}
          {item.price && <span className="pill">{item.price}</span>}
          {item.neighborhood && <span className="pill">{item.neighborhood}</span>}
          {item.kind && <span className="pill">{item.kind}</span>}
        </div>
        <h3>{item.title.split(/\s+/).slice(0, -1).join(' ') || item.title}{' '}<em>{item.title.split(/\s+/).slice(-1)[0]}</em></h3>
        <div className="modal-sub">{item.subtitle}</div>

        {item.type === 'meal' && (
          <div className="recipe-body">
            <div>
              <h4>Ingredients</h4>
              <ul>{item.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}</ul>
            </div>
            <div>
              <h4>Recipe</h4>
              <ol>{item.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
            </div>
          </div>
        )}

        {(item.type === 'restaurant' || item.type === 'activity' || item.type === 'watch') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--ink-soft)' }}>
            <p style={{ margin: 0 }}>
              {item.type === 'restaurant' && `A spot we want to try — ${item.neighborhood ? `in ${item.neighborhood}` : ''}. Open the link to check their menu and book a table.`}
              {item.type === 'activity' && `Something to do together. Tap the link for details and availability.`}
              {item.type === 'watch' && `${item.kind} on the watchlist for cozy nights in. Make popcorn first.`}
            </p>
            <a href={item.url} target="_blank" rel="noreferrer" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--purple)', wordBreak: 'break-all' }}>
              ↗ {item.url}
            </a>
          </div>
        )}

        <div className="modal-rating-section">
          <RatingBlock itemId={item.id} ratings={ratings || {}} onRate={onRate || (() => {})} />
        </div>

        <div className="btn-row">
          <button className="btn" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={() => onSchedule(item)}>＋ Add to calendar</button>
        </div>
      </div>
    </div>
  );
}

function SchedulePicker({ item, defaultDate, onClose, onConfirm }) {
  if (!item) return null;
  const [date, setDate] = React.useState(defaultDate || TODAY_ISO);
  const [time, setTime] = React.useState(item.type === 'meal' ? '19:30' : item.type === 'watch' ? '21:00' : '20:00');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="detail-meta">
          <span className="pill"><span className="dot" style={{ background: item.color }} />{TYPE_META[item.type].label}</span>
        </div>
        <h3>Add <em>{item.title}</em></h3>
        <div className="modal-sub">to your shared calendar</div>

        <div className="field">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="field">
          <label>Time</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>

        <div className="btn-row">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onConfirm({ date, time })}>Add to calendar</button>
        </div>
      </div>
    </div>
  );
}

function EventDetail({ event, onClose, onRemove, onToggleImportant }) {
  if (!event) return null;
  const item = ITEM_BY_ID[event.itemId];
  const isHoliday = !item && event.tripId;
  const dateLabel = new Date(event.date + 'T00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const title = item ? item.title : (event.label || 'Event');
  const subtitle = item ? item.subtitle : (event.tripTitle || '');
  const color = item ? item.color : '#B8E0F5';
  const typeLabel = item ? TYPE_META[item.type].label : (isHoliday ? 'holiday' : 'event');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="detail-meta">
          <span className="pill"><span className="dot" style={{ background: color }} />{typeLabel}</span>
          <span className="pill">{dateLabel}</span>
          <span className="pill mono">{event.time}</span>
        </div>
        <h3><em>{title}</em></h3>
        <div className="modal-sub">{subtitle}</div>
        <div className="btn-row">
          <button className="btn" onClick={() => onRemove(event.id)}>Remove from calendar</button>
          <button className={`btn ${event.important ? 'btn-star-on' : ''}`}
            onClick={() => onToggleImportant && onToggleImportant(event.id)}
            title={event.important ? 'Unmark important' : 'Mark as important'}>
            {event.important ? '★ Important' : '☆ Mark important'}
          </button>
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ItemModal, SchedulePicker, EventDetail });
