// Main app — tab navigation + calendar + widgets + detail pages + tweaks.

const PALETTES = {
  pink:    { paper: '#FBF3F0', paper2: '#FFFAF7', ink: '#2E1F2A', purple: '#D4A5F9', pink: '#FFB3D9', peach: '#FFC9DE', sky: '#B8E0F5', mint: '#C8E6D0', butter: '#FFE0B3' },
  blush:   { paper: '#FFF4F0', paper2: '#FFFAF7', ink: '#3A2A24', purple: '#FFB5C5', pink: '#FFB5C5', peach: '#FFD6A5', sky: '#C8E6D0', mint: '#C8E6D0', butter: '#FFD6A5' },
  lilac:   { paper: '#F4F1FF', paper2: '#FAF8FF', ink: '#2A2440', purple: '#C5B8FF', pink: '#FFB8E0', peach: '#FFB8E0', sky: '#A8E6F0', mint: '#A8E6F0', butter: '#FFD9A8' },
  sage:    { paper: '#F5F8F2', paper2: '#FAFBF6', ink: '#22322A', purple: '#A8D8B9', pink: '#F4C2A1', peach: '#F4C2A1', sky: '#B8DCC4', mint: '#A8D8B9', butter: '#E8D5B7' },
  butter:  { paper: '#FFFAF0', paper2: '#FFFCF5', ink: '#3A2F1F', purple: '#F4C2A1', pink: '#FFD6A5', peach: '#FFE0B3', sky: '#C8E6D0', mint: '#C8E6D0', butter: '#FFE0B3' },
};

const FONT_PAIRS = {
  serifsans:  { display: '"Instrument Serif", Georgia, serif',   body: '"Plus Jakarta Sans", system-ui, sans-serif' },
  rounded:    { display: '"Fraunces", Georgia, serif',           body: '"Nunito", system-ui, sans-serif' },
  editorial:  { display: '"DM Serif Display", Georgia, serif',   body: '"Inter", system-ui, sans-serif' },
  playful:    { display: '"Caveat", cursive',                    body: '"DM Sans", system-ui, sans-serif' },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "pink",
  "fontPair": "serifsans",
  "dark": true,
  "density": "regular",
  "calendarView": "month"
}/*EDITMODE-END*/;

const TABS = [
  { id: 'home',        label: 'Home',           dot: null },
  { id: 'kitchen',     label: 'Recipes',        dot: 'var(--pink)' },
  { id: 'restaurants', label: 'Restaurants',    dot: 'var(--purple)' },
  { id: 'activities',  label: 'Activities',     dot: 'var(--mint)' },
  { id: 'watchlist',   label: 'Watch Together', dot: 'var(--butter)' },
  { id: 'holidays',    label: 'Holidays',       dot: 'var(--sky)' },
];

function PaletteSwatches({ value, onChange }) {
  const opts = [
    { id: 'pink',   colors: ['#FFB3D9', '#D4A5F9', '#FFC9DE'] },
    { id: 'blush',  colors: ['#FFB5C5', '#FFD6A5', '#C8E6D0'] },
    { id: 'lilac',  colors: ['#C5B8FF', '#FFB8E0', '#A8E6F0'] },
    { id: 'sage',   colors: ['#A8D8B9', '#E8D5B7', '#F4C2A1'] },
    { id: 'butter', colors: ['#FFE0B3', '#FFD6A5', '#F4C2A1'] },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginTop: 4 }}>
      {opts.map((o) => {
        const active = value === o.id;
        return (
          <button key={o.id} type="button" onClick={() => onChange(o.id)} title={o.id}
            style={{
              appearance: 'none',
              border: active ? '1.5px solid rgba(0,0,0,.85)' : '0.5px solid rgba(0,0,0,.12)',
              borderRadius: 8, padding: 0, height: 36, overflow: 'hidden',
              cursor: 'pointer', display: 'flex',
              boxShadow: active ? '0 2px 6px rgba(0,0,0,.15)' : '0 1px 2px rgba(0,0,0,.06)',
            }}>
            {o.colors.map((c, i) => <span key={i} style={{ flex: 1, background: c }} />)}
          </button>
        );
      })}
    </div>
  );
}

function TabNav({ active, onChange }) {
  return (
    <nav className="tab-nav">
      {TABS.map((tab) => (
        <button key={tab.id}
          className={`tab-btn ${active === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}>
          {tab.dot && <span className="tab-dot" style={{ background: tab.dot }} />}
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [activeTab, setActiveTab] = React.useState('home');
  const [events, setEvents] = React.useState(INITIAL_EVENTS);
  const [holidays, setHolidays] = React.useState(() => {
    try { const s = localStorage.getItem('together-holidays'); return s ? JSON.parse(s) : HOLIDAYS; } catch { return HOLIDAYS; }
  });
  const [hearts, setHearts] = React.useState({ r4: true, w2: true, a1: true });
  const [view, setView] = React.useState(TWEAK_DEFAULTS.calendarView);
  const [anchor, setAnchor] = React.useState(new Date());
  const [modalItem, setModalItem] = React.useState(null);
  const [schedItem, setSchedItem] = React.useState(null);
  const [schedDate, setSchedDate] = React.useState(null);
  const [selectedEvent, setSelectedEvent] = React.useState(null);

  // Ratings & visited (persisted)
  const [ratings, setRatings] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('together-ratings')) || {}; } catch { return {}; }
  });
  const [visited, setVisited] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('together-visited')) || {}; } catch { return {}; }
  });
  const [customPins, setCustomPins] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('together-pins')) || []; } catch { return []; }
  });
  const [widgetCollapse, setWidgetCollapse] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('together-collapse')) || {}; } catch { return {}; }
  });
  const [tripItems, setTripItems] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('together-trip-items')) || {}; } catch { return {}; }
  });
  const [tripNotes, setTripNotes] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('together-trip-notes')) || {}; } catch { return {}; }
  });
  const [packingChecked, setPackingChecked] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('together-packing')) || {}; } catch { return {}; }
  });

  // Custom user-added items (meals, restaurants, activities, watch)
  const [customItems, setCustomItems] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('together-custom-items')) || { meal: [], restaurant: [], activity: [], watch: [] }; } catch { return { meal: [], restaurant: [], activity: [], watch: [] }; }
  });
  React.useEffect(() => { try { localStorage.setItem('together-custom-items', JSON.stringify(customItems)); } catch {} }, [customItems]);

  // Hidden sample items (the user can delete them too)
  const [hiddenIds, setHiddenIds] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('together-hidden')) || {}; } catch { return {}; }
  });
  React.useEffect(() => { try { localStorage.setItem('together-hidden', JSON.stringify(hiddenIds)); } catch {} }, [hiddenIds]);

  // Sample-item overrides (for editing sample items)
  const [itemOverrides, setItemOverrides] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('together-overrides')) || {}; } catch { return {}; }
  });
  React.useEffect(() => { try { localStorage.setItem('together-overrides', JSON.stringify(itemOverrides)); } catch {} }, [itemOverrides]);

  // Editor modal state
  const [editorState, setEditorState] = React.useState(null); // { type, item? }
  const [confirmDelete, setConfirmDelete] = React.useState(null); // item

  React.useEffect(() => { try { localStorage.setItem('together-ratings', JSON.stringify(ratings)); } catch {} }, [ratings]);
  React.useEffect(() => { try { localStorage.setItem('together-visited', JSON.stringify(visited)); } catch {} }, [visited]);
  React.useEffect(() => { try { localStorage.setItem('together-pins', JSON.stringify(customPins)); } catch {} }, [customPins]);
  React.useEffect(() => { try { localStorage.setItem('together-collapse', JSON.stringify(widgetCollapse)); } catch {} }, [widgetCollapse]);
  React.useEffect(() => { try { localStorage.setItem('together-trip-items', JSON.stringify(tripItems)); } catch {} }, [tripItems]);
  React.useEffect(() => { try { localStorage.setItem('together-trip-notes', JSON.stringify(tripNotes)); } catch {} }, [tripNotes]);
  React.useEffect(() => { try { localStorage.setItem('together-packing', JSON.stringify(packingChecked)); } catch {} }, [packingChecked]);
  React.useEffect(() => { try { localStorage.setItem('together-holidays', JSON.stringify(holidays)); } catch {} }, [holidays]);

  const handleRate = (itemId, who, value) => {
    setRatings(prev => ({ ...prev, [itemId]: { ...(prev[itemId] || {}), [who]: value } }));
    if (value) setVisited(prev => ({ ...prev, [itemId]: true }));
  };
  const toggleVisited = (itemId) => setVisited(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  const addPin = (pin) => setCustomPins(prev => [...prev, pin]);
  const toggleCollapse = (key) => setWidgetCollapse(prev => ({ ...prev, [key]: !prev[key] }));
  const addToTrip = (tripId, itemId) => setTripItems(prev => ({ ...prev, [tripId]: [...(prev[tripId] || []), itemId] }));
  const removeFromTrip = (tripId, itemId) => setTripItems(prev => ({ ...prev, [tripId]: (prev[tripId] || []).filter(id => id !== itemId) }));
  const updateTripNotes = (tripId, text) => setTripNotes(prev => ({ ...prev, [tripId]: text }));
  const togglePacking = (tripId, item) => setPackingChecked(prev => ({ ...prev, [tripId]: { ...(prev[tripId] || {}), [item]: !(prev[tripId] || {})[item] } }));

  // Holiday CRUD
  const updateTrip = (tripId, updater) => {
    setHolidays(prev => prev.map(h => h.id === tripId ? (typeof updater === 'function' ? updater(h) : { ...h, ...updater }) : h));
  };

  React.useEffect(() => { if (t.calendarView !== view) setView(t.calendarView); }, [t.calendarView]);

  // Apply palette + fonts
  React.useEffect(() => {
    const p = PALETTES[t.palette] || PALETTES.pink;
    const f = FONT_PAIRS[t.fontPair] || FONT_PAIRS.serifsans;
    const root = document.documentElement;
    root.style.setProperty('--paper', p.paper);
    root.style.setProperty('--paper-2', p.paper2);
    root.style.setProperty('--ink', p.ink);
    root.style.setProperty('--purple', p.purple);
    root.style.setProperty('--purple-soft', p.purple + '55');
    root.style.setProperty('--pink', p.pink);
    root.style.setProperty('--pink-soft', p.pink + '55');
    root.style.setProperty('--peach', p.peach);
    root.style.setProperty('--peach-soft', p.peach + '55');
    root.style.setProperty('--butter', p.butter);
    root.style.setProperty('--mint', p.mint);
    root.style.setProperty('--sky', p.sky);
    root.style.setProperty('--accent', p.purple);
    root.style.setProperty('--font-display', f.display);
    root.style.setProperty('--font-body', f.body);

    document.body.classList.toggle('theme-dark', !!t.dark);
    document.body.classList.remove('density-cozy', 'density-compact');
    if (t.density !== 'regular') document.body.classList.add(`density-${t.density}`);
  }, [t.palette, t.fontPair, t.dark, t.density]);

  // Event handlers
  const handleDrop = ({ date, itemId, eventId }) => {
    if (eventId) {
      setEvents((evs) => evs.map((e) => (e.id === eventId ? { ...e, date } : e)));
    } else if (itemId) {
      const item = ITEM_BY_ID[itemId];
      if (!item) return;
      const defaultTime = item.type === 'meal' ? '19:30' : item.type === 'watch' ? '21:00' : '20:00';
      setEvents((evs) => [...evs, { id: `e${Date.now()}`, itemId, date, time: defaultTime }]);
    }
  };

  const openItem    = (item) => setModalItem(item);
  const openSched   = (item) => { setSchedItem(item); setModalItem(null); setSchedDate(null); };
  const confirmSched = ({ date, time }) => {
    setEvents((evs) => [...evs, { id: `e${Date.now()}`, itemId: schedItem.id, date, time }]);
    setSchedItem(null);
  };
  const removeEvent = (eventId) => {
    setEvents((evs) => evs.filter((e) => e.id !== eventId));
    setSelectedEvent(null);
  };
  const toggleHeart = (id) => setHearts((h) => ({ ...h, [id]: !h[id] }));
  const toggleImportant = (eventId) => setEvents(evs => evs.map(e => e.id === eventId ? { ...e, important: !e.important } : e));

  // ── Add / edit / delete items ─────────────────────────────────────────────
  const saveItem = (saved) => {
    const t = saved.type;
    // Trips go to the holidays list, not the customItems map
    if (t === 'trip') {
      setHolidays(prev => {
        const idx = prev.findIndex(h => h.id === saved.id);
        if (idx >= 0) {
          const next = [...prev]; next[idx] = { ...prev[idx], ...saved };
          return next;
        }
        return [...prev, saved];
      });
      return;
    }
    setCustomItems(prev => {
      const list = prev[t] || [];
      const existing = list.findIndex(i => i.id === saved.id);
      if (existing >= 0) {
        const next = [...list]; next[existing] = saved;
        return { ...prev, [t]: next };
      }
      // Editing a sample item? Store as override instead of duplicating.
      const isSample = ITEM_BY_ID[saved.id];
      if (isSample) {
        setItemOverrides(o => ({ ...o, [saved.id]: saved }));
        return prev;
      }
      return { ...prev, [t]: [saved, ...list] };
    });
  };
  const deleteItem = (item) => {
    // Trips: drop from holidays list and clean associated events
    if (item.type === 'trip') {
      setHolidays(prev => prev.filter(h => h.id !== item.id));
      setEvents(evs => evs.filter(e => e.tripId !== item.id));
      return;
    }
    if (item.custom) {
      setCustomItems(prev => ({ ...prev, [item.type]: (prev[item.type] || []).filter(i => i.id !== item.id) }));
    } else {
      // Sample item — hide it
      setHiddenIds(prev => ({ ...prev, [item.id]: true }));
    }
    // Also remove any calendar events that referenced it
    setEvents(evs => evs.filter(e => e.itemId !== item.id));
  };
  const openEditor = (type, item) => setEditorState({ type, item });
  const openAdd = (type) => setEditorState({ type, item: null });

  // Merged item lists (sample minus hidden, plus custom, with overrides applied)
  const applyOverride = (i) => itemOverrides[i.id] ? { ...i, ...itemOverrides[i.id] } : i;
  const mergedMeals       = React.useMemo(() => [...(customItems.meal       || []), ...MEALS      .filter(i => !hiddenIds[i.id]).map(applyOverride)], [customItems, hiddenIds, itemOverrides]);
  const mergedRestaurants = React.useMemo(() => [...(customItems.restaurant || []), ...RESTAURANTS.filter(i => !hiddenIds[i.id]).map(applyOverride)], [customItems, hiddenIds, itemOverrides]);
  const mergedActivities  = React.useMemo(() => [...(customItems.activity   || []), ...ACTIVITIES .filter(i => !hiddenIds[i.id]).map(applyOverride)], [customItems, hiddenIds, itemOverrides]);
  const mergedWatchlist   = React.useMemo(() => [...(customItems.watch      || []), ...WATCHLIST  .filter(i => !hiddenIds[i.id]).map(applyOverride)], [customItems, hiddenIds, itemOverrides]);
  // Used by item lookups in calendar / coming-up — extend ITEM_BY_ID dynamically
  React.useEffect(() => {
    const merged = [...mergedMeals, ...mergedRestaurants, ...mergedActivities, ...mergedWatchlist];
    merged.forEach(i => { window.ITEM_BY_ID[i.id] = i; });
  }, [mergedMeals, mergedRestaurants, mergedActivities, mergedWatchlist]);

  const isHome = activeTab === 'home';

  return (
    <RoomProvider activeTab={activeTab}>
      <div className="paper-grain" />
      <div className="halftone-layer" />
      <div className="app">
        {/* ─── Top bar (outside grid so it's stable) ─── */}
        <div className="app-header">
          <header className="topbar">
            <div className="brand">
              <div className="names">Eoin <span className="amp">&amp;</span> <em>Cristina</em></div>
              <div className="sub">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
            </div>
            <div className="topbar-right">
              <WeatherStat />
            </div>
          </header>
          <ComingUp events={events} onEventClick={setSelectedEvent} onToggleImportant={toggleImportant} />
          <TabNav active={activeTab} onChange={setActiveTab} />
        </div>

        <div className={`shell ${isHome ? '' : 'full-page'}`}>

          {/* ─── HOME ─── */}
          {isHome && (
            <>
              <main style={{ minWidth: 0 }}>
                <Calendar
                  view={view}
                  anchor={anchor}
                  setAnchor={setAnchor}
                  events={events}
                  onDrop={handleDrop}
                  onEventClick={setSelectedEvent}
                  onSwitchView={(v) => { setView(v); setTweak('calendarView', v); }}
                />
                <div style={{ marginTop: 20 }}>
                  <MapWidget
                    restaurants={RESTAURANTS}
                    activities={ACTIVITIES}
                    ratings={ratings}
                    visited={visited}
                    customPins={customPins}
                    onAddPin={addPin}
                    isDark={false}
                  />
                </div>
              </main>

              <aside className="widgets-col">
                <AgendaPoints collapsed={widgetCollapse.agenda} onToggleCollapse={() => toggleCollapse('agenda')} />
                <TurnTracker collapsed={widgetCollapse.turns} onToggleCollapse={() => toggleCollapse('turns')} />
                <WidgetCard kind="meal" eyebrow="kitchen"
                  title={<>Meals to <em>make</em></>} accent="var(--pink)"
                  items={MEALS} hearts={hearts}
                  onToggleHeart={toggleHeart} onItemClick={openItem} onItemAdd={openSched}
                  footerNote={`${MEALS.length} recipes`}
                  onViewAll={() => setActiveTab('kitchen')}
                  collapsed={widgetCollapse.meals} onToggleCollapse={() => toggleCollapse('meals')}
                  ratings={ratings}
                />
                <WidgetCard kind="restaurant" eyebrow="eat out"
                  title={<>Restaurants <em>to try</em></>} accent="var(--purple)"
                  items={RESTAURANTS} hearts={hearts}
                  onToggleHeart={toggleHeart} onItemClick={openItem} onItemAdd={openSched}
                  footerNote={`${RESTAURANTS.length} spots`}
                  onViewAll={() => setActiveTab('restaurants')}
                  collapsed={widgetCollapse.restaurants} onToggleCollapse={() => toggleCollapse('restaurants')}
                  ratings={ratings}
                />
                <WidgetCard kind="activity" eyebrow="outside"
                  title={<>Things <em>to do</em></>} accent="var(--mint)"
                  items={ACTIVITIES} hearts={hearts}
                  onToggleHeart={toggleHeart} onItemClick={openItem} onItemAdd={openSched}
                  footerNote={`${ACTIVITIES.length} ideas`}
                  onViewAll={() => setActiveTab('activities')}
                  collapsed={widgetCollapse.activities} onToggleCollapse={() => toggleCollapse('activities')}
                  ratings={ratings}
                />
                <WidgetCard kind="watch" eyebrow="cozy nights"
                  title={<>Watch <em>together</em></>} accent="var(--butter)"
                  items={WATCHLIST} hearts={hearts}
                  onToggleHeart={toggleHeart} onItemClick={openItem} onItemAdd={openSched}
                  footerNote={`${WATCHLIST.length} on the list`}
                  onViewAll={() => setActiveTab('watchlist')}
                  collapsed={widgetCollapse.watchlist} onToggleCollapse={() => toggleCollapse('watchlist')}
                  ratings={ratings}
                />
              </aside>
            </>
          )}

          {/* ─── KITCHEN ─── */}
          {activeTab === 'kitchen' && (
            <main>
              <KitchenPage items={mergedMeals} hearts={hearts}
                onToggleHeart={toggleHeart} onSchedule={openSched} onItemClick={openItem}
                ratings={ratings} onRate={handleRate}
                onAdd={() => openAdd('meal')}
                onEdit={(item) => openEditor('meal', item)}
                onDelete={(item) => setConfirmDelete(item)} />
            </main>
          )}

          {/* ─── RESTAURANTS ─── */}
          {activeTab === 'restaurants' && (
            <main>
              <RestaurantsPage items={mergedRestaurants} hearts={hearts}
                onToggleHeart={toggleHeart} onSchedule={openSched}
                ratings={ratings} onRate={handleRate}
                visited={visited} onToggleVisited={toggleVisited}
                holidays={HOLIDAYS} tripItems={tripItems}
                onAddToTrip={addToTrip} onRemoveFromTrip={removeFromTrip}
                onAdd={() => openAdd('restaurant')}
                onEdit={(item) => openEditor('restaurant', item)}
                onDelete={(item) => setConfirmDelete(item)} />
            </main>
          )}

          {/* ─── ACTIVITIES ─── */}
          {activeTab === 'activities' && (
            <main>
              <ActivitiesPage items={mergedActivities} hearts={hearts}
                onToggleHeart={toggleHeart} onSchedule={openSched}
                ratings={ratings} onRate={handleRate}
                visited={visited} onToggleVisited={toggleVisited}
                holidays={HOLIDAYS} tripItems={tripItems}
                onAddToTrip={addToTrip} onRemoveFromTrip={removeFromTrip}
                onAdd={() => openAdd('activity')}
                onEdit={(item) => openEditor('activity', item)}
                onDelete={(item) => setConfirmDelete(item)} />
            </main>
          )}

          {/* ─── WATCHLIST ─── */}
          {activeTab === 'watchlist' && (
            <main>
              <WatchlistPage items={mergedWatchlist} hearts={hearts}
                onToggleHeart={toggleHeart} onSchedule={openSched}
                ratings={ratings} onRate={handleRate}
                onAdd={() => openAdd('watch')}
                onEdit={(item) => openEditor('watch', item)}
                onDelete={(item) => setConfirmDelete(item)} />
            </main>
          )}

          {/* ─── HOLIDAYS ─── */}
          {activeTab === 'holidays' && (
            <main>
              <HolidaysPage
                holidays={holidays}
                tripItems={tripItems}
                onAdd={() => openAdd('trip')}
                onEdit={(trip) => openEditor('trip', trip)}
                onDelete={(trip) => setConfirmDelete({ ...trip, type: 'trip' })}
                onAddToTrip={addToTrip}
                onRemoveFromTrip={removeFromTrip}
                tripNotes={tripNotes}
                onUpdateTripNotes={updateTripNotes}
                packingChecked={packingChecked}
                onTogglePacking={togglePacking}
                onUpdateTrip={updateTrip}
                onAddToCalendar={(trip) => {
                  // Add the trip date range as calendar events
                  const startEvt = { id: `e${Date.now()}`, itemId: null, date: trip.startDate, time: '00:00', tripId: trip.id, tripTitle: trip.title, label: `${trip.title} — depart` };
                  const endEvt = { id: `e${Date.now()+1}`, itemId: null, date: trip.endDate, time: '00:00', tripId: trip.id, tripTitle: trip.title, label: `${trip.title} — return` };
                  setEvents((evs) => [...evs, startEvt, endEvt]);
                  // Also add flights
                  trip.flights.forEach((fl, i) => {
                    setEvents((evs) => [...evs, {
                      id: `e${Date.now()+10+i}`,
                      itemId: null,
                      date: fl.date,
                      time: fl.time,
                      tripId: trip.id,
                      tripTitle: trip.title,
                      label: `${fl.direction === 'outbound' ? '→' : '←'} ${fl.from}–${fl.to} (${fl.airline})`,
                    }]);
                  });
                }}
              />
            </main>
          )}

          <div className="signature">
            made with <em>love</em> · drag any card onto a date to plan it
          </div>
        </div>
      </div>

      {/* ─── Modals ─── */}
      {modalItem && (
        <ItemModal item={modalItem} onClose={() => setModalItem(null)} onSchedule={openSched}
          ratings={ratings} onRate={handleRate} />
      )}
      {schedItem && (
        <SchedulePicker item={schedItem} defaultDate={schedDate}
          onClose={() => setSchedItem(null)} onConfirm={confirmSched} />
      )}
      {selectedEvent && (
        <EventDetail event={selectedEvent}
          onClose={() => setSelectedEvent(null)} onRemove={removeEvent}
          onToggleImportant={toggleImportant} />
      )}
      {editorState && (
        <ItemEditorModal type={editorState.type} item={editorState.item}
          onClose={() => setEditorState(null)} onSave={saveItem} />
      )}
      {confirmDelete && (
        <ConfirmDeleteModal item={confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={deleteItem} />
      )}

      {/* ─── Tweaks ─── */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Palette">
          <PaletteSwatches value={t.palette} onChange={(v) => setTweak('palette', v)} />
          <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak('dark', v)} />
        </TweakSection>
        <TweakSection label="Typography">
          <TweakSelect label="Font pair" value={t.fontPair}
            options={[
              { value: 'serifsans', label: 'Instrument Serif + Jakarta' },
              { value: 'rounded',   label: 'Fraunces + Nunito' },
              { value: 'editorial', label: 'DM Serif + Inter' },
              { value: 'playful',   label: 'Caveat + DM Sans' },
            ]}
            onChange={(v) => setTweak('fontPair', v)} />
        </TweakSection>
        <TweakSection label="Layout">
          <TweakRadio label="Density" value={t.density}
            options={['compact', 'regular', 'cozy']}
            onChange={(v) => setTweak('density', v)} />
          <TweakRadio label="Calendar" value={t.calendarView}
            options={['week', 'month']}
            onChange={(v) => { setTweak('calendarView', v); setView(v); }} />
        </TweakSection>
      </TweaksPanel>
    </RoomProvider>
  );
}

const __mount = () => ReactDOM.createRoot(document.getElementById('root')).render(<App />);
if (window.__cloudReady && typeof window.__cloudReady.then === 'function') {
  window.__cloudReady.then(__mount, __mount);
} else {
  __mount();
}
