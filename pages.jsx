// Detail pages — full-page views for Kitchen, Eat Out, Activities, Watch Together.

// ── Shared page layout ──────────────────────────────────────────────────────

function DetailPage({ title, titleEm, eyebrow, accent, children, onAdd, addLabel }) {
  return (
    <div className="detail-page">
      <div className="dp-header">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="dp-title">{title} <em>{titleEm}</em></h1>
        </div>
        <button className="btn btn-primary" onClick={onAdd}>＋ {addLabel || 'Add new'}</button>
      </div>
      {children}
    </div>
  );
}

// ── Kitchen ─────────────────────────────────────────────────────────────────

function KitchenPage({ items, hearts, onToggleHeart, onSchedule, onItemClick, ratings, onRate, onAdd, onEdit, onDelete }) {
  const [filter, setFilter] = React.useState('all'); // all | hearted
  const filtered = filter === 'hearted' ? items.filter((i) => hearts[i.id]) : items;

  return (
    <DetailPage title="Meals to" titleEm="make" eyebrow="kitchen" accent="var(--pink)" addLabel="Add recipe" onAdd={onAdd || (() => {})}>
      <div className="dp-filters">
        <div className="view-toggle" role="tablist">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All recipes</button>
          <button className={filter === 'hearted' ? 'active' : ''} onClick={() => setFilter('hearted')}>Favorites</button>
        </div>
        <span className="pill" style={{ marginLeft: 'auto' }}>{filtered.length} recipes</span>
      </div>

      <div className="recipe-grid">
        {filtered.map((meal) => (
          <div key={meal.id} className="recipe-card card" draggable
            onDragStart={(e) => { e.dataTransfer.setData('text/x-item', meal.id); e.dataTransfer.effectAllowed = 'copy'; }}
          >
            <div className="rc-header" style={{ background: meal.color + '44' }}>
              <div className="rc-icon" style={{ background: meal.color }}>{meal.title.slice(-1)}</div>
              <div className="rc-actions">
                <button className={`mini-btn ${hearts[meal.id] ? 'heart-on' : ''}`} onClick={(e) => { e.stopPropagation(); onToggleHeart(meal.id); }}>
                  {hearts[meal.id] ? '♥' : '♡'}
                </button>
                {onEdit && <button className="mini-btn" title="Edit" onClick={(e) => { e.stopPropagation(); onEdit(meal); }}>✎</button>}
                {onDelete && <button className="mini-btn mini-btn-del" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(meal); }}>×</button>}
              </div>
            </div>
            <div className="rc-body">
              <h3 className="rc-title">{meal.title}</h3>
              <p className="rc-sub">{meal.subtitle}</p>

              <div className="rc-ingredients">
                <div className="rc-section-label">Ingredients</div>
                <div className="rc-chips">
                  {meal.ingredients.slice(0, 5).map((ing, i) => (
                    <span key={i} className="rc-chip">{ing}</span>
                  ))}
                  {meal.ingredients.length > 5 && <span className="rc-chip rc-chip-more">+{meal.ingredients.length - 5}</span>}
                </div>
              </div>

              <div className="rc-steps">
                <div className="rc-section-label">Steps</div>
                <ol className="rc-step-list">
                  {meal.steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
            </div>
            <div className="rc-rating">
              <RatingBlock itemId={meal.id} ratings={ratings} onRate={onRate} />
            </div>
            <div className="rc-footer">
              <button className="btn" style={{ flex: 1 }} onClick={() => onItemClick(meal)}>View details</button>
              <button className="btn btn-primary" onClick={() => onSchedule(meal)}>＋ Schedule</button>
            </div>
          </div>
        ))}
      </div>
    </DetailPage>
  );
}

// ── Restaurants ─────────────────────────────────────────────────────────────

function RestaurantsPage({ items, hearts, onToggleHeart, onSchedule, ratings, onRate, visited, onToggleVisited, holidays, tripItems, onAddToTrip, onRemoveFromTrip, onAdd, onEdit, onDelete }) {
  const [filter, setFilter] = React.useState('all');
  const [cityFilter, setCityFilter] = React.useState('all');

  const cities = React.useMemo(() => {
    const set = new Set(items.map(i => i.city).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [items]);

  let filtered = items;
  if (filter === 'hearted') filtered = filtered.filter((i) => hearts[i.id]);
  if (cityFilter !== 'all') filtered = filtered.filter((i) => i.city === cityFilter);

  // Which holiday is this city associated with?
  const cityTrip = cityFilter !== 'all' ? holidays.find(h => h.city === cityFilter) : null;

  return (
    <DetailPage title="Restaurants" titleEm="to try" eyebrow="eat out" accent="var(--purple)" addLabel="Add spot" onAdd={onAdd || (() => {})}>
      <div className="dp-filters">
        <div className="view-toggle" role="tablist">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All spots</button>
          <button className={filter === 'hearted' ? 'active' : ''} onClick={() => setFilter('hearted')}>Favorites</button>
        </div>
        <div className="city-filter">
          <label className="city-filter-label">City</label>
          <select className="city-select" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
            {cities.map(c => <option key={c} value={c}>{c === 'all' ? 'All cities' : c}</option>)}
          </select>
        </div>
        <span className="pill" style={{ marginLeft: 'auto' }}>{filtered.length} restaurants</span>
      </div>

      {cityTrip && (
        <div className="city-trip-banner" style={{ borderColor: cityTrip.color }}>
          <span className="ctb-icon">✈</span>
          <span>Showing restaurants for <strong>{cityTrip.title}</strong> ({cityTrip.destination})</span>
        </div>
      )}

      <div className="place-grid">
        {filtered.map((r) => {
          const linkedTrip = holidays.find(h => h.city === r.city);
          const isInTrip = linkedTrip && tripItems[linkedTrip.id] && tripItems[linkedTrip.id].includes(r.id);
          return (
          <div key={r.id} className="place-card card" draggable
            onDragStart={(e) => { e.dataTransfer.setData('text/x-item', r.id); e.dataTransfer.effectAllowed = 'copy'; }}
          >
            <div className="pc-banner" style={{ background: `linear-gradient(135deg, ${r.color}66, ${r.color}22)` }}>
              <div className="pc-icon" style={{ background: r.color }}>{r.title.slice(-1)}</div>
              <div className="pc-banner-actions">
                <button className={`mini-btn ${hearts[r.id] ? 'heart-on' : ''}`}
                  onClick={(e) => { e.stopPropagation(); onToggleHeart(r.id); }}>
                  {hearts[r.id] ? '♥' : '♡'}
                </button>
                {onEdit && <button className="mini-btn" title="Edit" onClick={(e) => { e.stopPropagation(); onEdit(r); }}>✎</button>}
                {onDelete && <button className="mini-btn mini-btn-del" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(r); }}>×</button>}
              </div>
            </div>
            <div className="pc-body">
              <h3 className="pc-title">{r.title}</h3>
              <p className="pc-sub">{r.subtitle}</p>
              <div className="pc-meta">
                {r.neighborhood && <span className="pill"><span className="dot" style={{ background: r.color }} />{r.neighborhood}</span>}
                {r.price && <span className="pill">{r.price}</span>}
                {r.city && <span className="pill pc-city-pill">{r.city}</span>}
                <button className={`visited-badge ${visited[r.id] ? 'is-visited' : ''}`} onClick={(e) => { e.stopPropagation(); onToggleVisited(r.id); }}>
                  {visited[r.id] ? '✓ Been here' : 'Want to go'}
                </button>
              </div>
              <RatingBlock itemId={r.id} ratings={ratings} onRate={onRate} />
            </div>
            <div className="pc-footer">
              {linkedTrip && (
                <button className={`btn btn-trip ${isInTrip ? 'btn-trip-on' : ''}`}
                  onClick={() => isInTrip ? onRemoveFromTrip(linkedTrip.id, r.id) : onAddToTrip(linkedTrip.id, r.id)}>
                  {isInTrip ? `✓ ${linkedTrip.title}` : `＋ ${linkedTrip.title}`}
                </button>
              )}
              <a href={r.url} target="_blank" rel="noreferrer" className="btn" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', fontSize: 12 }}>
                ↗ Visit site
              </a>
              <button className="btn btn-primary" onClick={() => onSchedule(r)}>＋ Book it</button>
            </div>
          </div>
          );
        })}
      </div>
    </DetailPage>
  );
}

// ── Activities ──────────────────────────────────────────────────────────────

function ActivitiesPage({ items, hearts, onToggleHeart, onSchedule, ratings, onRate, visited, onToggleVisited, holidays, tripItems, onAddToTrip, onRemoveFromTrip, onAdd, onEdit, onDelete }) {
  const [filter, setFilter] = React.useState('all');
  const [cityFilter, setCityFilter] = React.useState('all');

  const cities = React.useMemo(() => {
    const set = new Set(items.map(i => i.city).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [items]);

  let filtered = items;
  if (filter === 'hearted') filtered = filtered.filter((i) => hearts[i.id]);
  if (cityFilter !== 'all') filtered = filtered.filter((i) => i.city === cityFilter);

  const cityTrip = cityFilter !== 'all' ? holidays.find(h => h.city === cityFilter) : null;

  return (
    <DetailPage title="Things" titleEm="to do" eyebrow="activities" accent="var(--mint)" addLabel="Add idea" onAdd={onAdd || (() => {})}>
      <div className="dp-filters">
        <div className="view-toggle" role="tablist">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All ideas</button>
          <button className={filter === 'hearted' ? 'active' : ''} onClick={() => setFilter('hearted')}>Favorites</button>
        </div>
        <div className="city-filter">
          <label className="city-filter-label">City</label>
          <select className="city-select" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
            {cities.map(c => <option key={c} value={c}>{c === 'all' ? 'All cities' : c}</option>)}
          </select>
        </div>
        <span className="pill" style={{ marginLeft: 'auto' }}>{filtered.length} activities</span>
      </div>

      {cityTrip && (
        <div className="city-trip-banner" style={{ borderColor: cityTrip.color }}>
          <span className="ctb-icon">✈</span>
          <span>Showing activities for <strong>{cityTrip.title}</strong> ({cityTrip.destination})</span>
        </div>
      )}

      <div className="place-grid">
        {filtered.map((a) => {
          const linkedTrip = holidays.find(h => h.city === a.city);
          const isInTrip = linkedTrip && tripItems[linkedTrip.id] && tripItems[linkedTrip.id].includes(a.id);
          return (
          <div key={a.id} className="place-card card" draggable
            onDragStart={(e) => { e.dataTransfer.setData('text/x-item', a.id); e.dataTransfer.effectAllowed = 'copy'; }}
          >
            <div className="pc-banner" style={{ background: `linear-gradient(135deg, ${a.color}66, ${a.color}22)` }}>
              <div className="pc-icon" style={{ background: a.color }}>{a.title.slice(-1)}</div>
              <div className="pc-banner-actions">
                <button className={`mini-btn ${hearts[a.id] ? 'heart-on' : ''}`}
                  onClick={(e) => { e.stopPropagation(); onToggleHeart(a.id); }}>
                  {hearts[a.id] ? '♥' : '♡'}
                </button>
                {onEdit && <button className="mini-btn" title="Edit" onClick={(e) => { e.stopPropagation(); onEdit(a); }}>✎</button>}
                {onDelete && <button className="mini-btn mini-btn-del" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(a); }}>×</button>}
              </div>
            </div>
            <div className="pc-body">
              <h3 className="pc-title">{a.title}</h3>
              <p className="pc-sub">{a.subtitle}</p>
              <div className="pc-meta">
                {a.duration && <span className="pill">{a.duration}</span>}
                {a.city && <span className="pill pc-city-pill">{a.city}</span>}
                <button className={`visited-badge ${visited[a.id] ? 'is-visited' : ''}`} onClick={(e) => { e.stopPropagation(); onToggleVisited(a.id); }}>
                  {visited[a.id] ? '✓ Done this' : 'Want to do'}
                </button>
              </div>
              <RatingBlock itemId={a.id} ratings={ratings} onRate={onRate} />
            </div>
            <div className="pc-footer">
              {linkedTrip && (
                <button className={`btn btn-trip ${isInTrip ? 'btn-trip-on' : ''}`}
                  onClick={() => isInTrip ? onRemoveFromTrip(linkedTrip.id, a.id) : onAddToTrip(linkedTrip.id, a.id)}>
                  {isInTrip ? `✓ ${linkedTrip.title}` : `＋ ${linkedTrip.title}`}
                </button>
              )}
              <a href={a.url} target="_blank" rel="noreferrer" className="btn" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', fontSize: 12 }}>
                ↗ Details
              </a>
              <button className="btn btn-primary" onClick={() => onSchedule(a)}>＋ Plan it</button>
            </div>
          </div>
          );
        })}
      </div>
    </DetailPage>
  );
}

// ── Watchlist ────────────────────────────────────────────────────────────────

function WatchlistPage({ items, hearts, onToggleHeart, onSchedule, ratings, onRate, onAdd, onEdit, onDelete }) {
  const [filter, setFilter] = React.useState('all'); // all | hearted | movie | series
  let filtered = items;
  if (filter === 'hearted') filtered = items.filter((i) => hearts[i.id]);
  else if (filter === 'movie') filtered = items.filter((i) => i.kind === 'Movie');
  else if (filter === 'series') filtered = items.filter((i) => i.kind === 'Series');

  return (
    <DetailPage title="Watch" titleEm="together" eyebrow="cozy nights" accent="var(--butter)" addLabel="Add title" onAdd={onAdd || (() => {})}>
      <div className="dp-filters">
        <div className="view-toggle" role="tablist">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
          <button className={filter === 'movie' ? 'active' : ''} onClick={() => setFilter('movie')}>Movies</button>
          <button className={filter === 'series' ? 'active' : ''} onClick={() => setFilter('series')}>Series</button>
          <button className={filter === 'hearted' ? 'active' : ''} onClick={() => setFilter('hearted')}>♥</button>
        </div>
        <span className="pill" style={{ marginLeft: 'auto' }}>{filtered.length} titles</span>
      </div>

      <div className="watch-grid">
        {filtered.map((w) => (
          <div key={w.id} className="watch-card card" draggable
            onDragStart={(e) => { e.dataTransfer.setData('text/x-item', w.id); e.dataTransfer.effectAllowed = 'copy'; }}
          >
            <div className="wc-poster" style={{ background: `linear-gradient(160deg, ${w.color}, ${w.color}44)` }}>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 42, color: 'var(--ink)', opacity: 0.3 }}>
                {w.kind === 'Movie' ? '▶' : '◈'}
              </div>
              <button className={`mini-btn ${hearts[w.id] ? 'heart-on' : ''}`}
                onClick={(e) => { e.stopPropagation(); onToggleHeart(w.id); }}
                style={{ position: 'absolute', top: 10, right: 10 }}>
                {hearts[w.id] ? '♥' : '♡'}
              </button>
              {(onEdit || onDelete) && (
                <div className="wc-poster-actions">
                  {onEdit && <button className="mini-btn" title="Edit" onClick={(e) => { e.stopPropagation(); onEdit(w); }}>✎</button>}
                  {onDelete && <button className="mini-btn mini-btn-del" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(w); }}>×</button>}
                </div>
              )}
              <span className="wc-kind-badge">{w.kind}</span>
            </div>
            <div className="wc-body">
              <h3 className="wc-title">{w.title}</h3>
              <p className="wc-sub">{w.subtitle}</p>
              <RatingBlock itemId={w.id} ratings={ratings} onRate={onRate} />
            </div>
            <div className="wc-footer">
              <a href={w.url} target="_blank" rel="noreferrer" className="btn" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', fontSize: 12 }}>
                ↗ Info
              </a>
              <button className="btn btn-primary" onClick={() => onSchedule(w)}>＋ Movie night</button>
            </div>
          </div>
        ))}
      </div>
    </DetailPage>
  );
}

Object.assign(window, { KitchenPage, RestaurantsPage, ActivitiesPage, WatchlistPage });
