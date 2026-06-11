// Holidays page — trip cards, detail view with full CRUD for flights, accommodation, itinerary, activities, packing.

function HolidaysPage({ holidays, onAddToCalendar, tripItems, onAddToTrip, onRemoveFromTrip, tripNotes, onUpdateTripNotes, packingChecked, onTogglePacking, onUpdateTrip, onAdd, onEdit, onDelete }) {
  const [selectedTripId, setSelectedTripId] = React.useState(null);
  const [expandedSection, setExpandedSection] = React.useState('itinerary');

  // Normalize trips defensively so partially-saved/legacy data renders
  const normalizeTrip = (h) => ({
    ...h,
    budget: h.budget || { total: 0, spent: 0 },
    flights: Array.isArray(h.flights) ? h.flights : [],
    accommodation: h.accommodation && typeof h.accommodation === 'object' && !Array.isArray(h.accommodation)
      ? h.accommodation
      : { name: '', cost: 0, perNight: true, nights: 0, booked: false, url: '' },
    itinerary: Array.isArray(h.itinerary) ? h.itinerary : [],
    activities: Array.isArray(h.activities) ? h.activities : [],
    packingList: Array.isArray(h.packingList) ? h.packingList : (Array.isArray(h.packing) ? h.packing : []),
  });
  const safeHolidays = (holidays || []).map(normalizeTrip);

  const selectedTrip = selectedTripId ? safeHolidays.find(h => h.id === selectedTripId) : null;

  if (selectedTrip) {
    return (
      <TripDetail
        trip={selectedTrip}
        onBack={() => setSelectedTripId(null)}
        onAddToCalendar={onAddToCalendar}
        expandedSection={expandedSection}
        setExpandedSection={setExpandedSection}
        tripItems={tripItems}
        onAddToTrip={onAddToTrip}
        onRemoveFromTrip={onRemoveFromTrip}
        tripNotes={tripNotes}
        onUpdateTripNotes={onUpdateTripNotes}
        packingChecked={packingChecked}
        onTogglePacking={onTogglePacking}
        onUpdateTrip={onUpdateTrip}
      />
    );
  }

  return (
    <div className="detail-page">
      <div className="dp-header">
        <div>
          <div className="eyebrow">adventures</div>
          <h1 className="dp-title">Holidays <em>together</em></h1>
        </div>
        {onAdd && (
          <button className="btn btn-primary" onClick={onAdd}>+ Plan a holiday</button>
        )}
      </div>

      <div className="trip-grid">
        {safeHolidays.map((trip) => (
          <TripCard key={trip.id} trip={trip} onClick={() => setSelectedTripId(trip.id)}
            tripItems={tripItems}
            onEdit={onEdit ? () => onEdit(trip) : null}
            onDelete={onDelete ? () => onDelete(trip) : null} />
        ))}
      </div>
    </div>
  );
}

// ── Trip overview card ──────────────────────────────────────────────────────

function TripCard({ trip, onClick, tripItems, onEdit, onDelete }) {
  const startD = new Date(trip.startDate + 'T00:00');
  const endD = new Date(trip.endDate + 'T00:00');
  const nights = Math.round((endD - startD) / (1000 * 60 * 60 * 24));
  const dateRange = `${startD.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endD.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  const pct = trip.budget.total > 0 ? Math.round((trip.budget.spent / trip.budget.total) * 100) : 0;
  const statusLabel = { planning: 'Planning', booked: 'Booked', completed: 'Completed' };
  const today = new Date(); today.setHours(0,0,0,0);
  const daysUntil = Math.ceil((startD - today) / (1000 * 60 * 60 * 24));
  const countdownText = daysUntil > 0 ? `${daysUntil} days to go` : daysUntil === 0 ? 'Today!' : `${Math.abs(daysUntil)} days ago`;
  const linked = tripItems[trip.id] || [];
  const linkedRestaurants = linked.filter(id => ITEM_BY_ID[id] && ITEM_BY_ID[id].type === 'restaurant').length;
  const linkedActivities = linked.filter(id => ITEM_BY_ID[id] && ITEM_BY_ID[id].type === 'activity').length;

  return (
    <div className="trip-card card" onClick={onClick}>
      <div className="tc-banner" style={{ background: `linear-gradient(135deg, ${trip.color}, ${trip.color}44)` }}>
        <div className="tc-icon" style={{ background: trip.color }}>✈</div>
        <span className="tc-status" data-status={trip.status}>{statusLabel[trip.status]}</span>
        {(onEdit || onDelete) && (
          <div className="tc-actions" onClick={(e) => e.stopPropagation()}>
            {onEdit && <button className="mini-btn" onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Edit">✎</button>}
            {onDelete && <button className="mini-btn" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Delete">×</button>}
          </div>
        )}
      </div>
      <div className="tc-body">
        <h3 className="tc-title">{trip.title}</h3>
        <p className="tc-dest">{trip.destination}</p>
        <div className="tc-countdown" style={{ color: daysUntil > 0 ? trip.color : 'var(--ink-faint)' }}>
          {daysUntil > 0 ? '⏱ ' : ''}{countdownText}
        </div>
        <div className="tc-meta-row">
          <span className="pill">{dateRange}</span>
          <span className="pill">{nights} nights</span>
        </div>
        <div className="tc-budget">
          <div className="tc-budget-header">
            <span className="tc-budget-label">Budget</span>
            <span className="tc-budget-val">€{trip.budget.spent} <span style={{ color: 'var(--ink-faint)' }}>/ €{trip.budget.total}</span></span>
          </div>
          <div className="tc-budget-bar">
            <div className="tc-budget-fill" style={{ width: `${pct}%`, background: trip.color }} />
          </div>
        </div>
        <div className="tc-quick-stats">
          <div className="tc-qs"><span className="tc-qs-num">{trip.flights.length}</span><span className="tc-qs-label">flights</span></div>
          <div className="tc-qs"><span className="tc-qs-num">{trip.itinerary.length}</span><span className="tc-qs-label">days</span></div>
          <div className="tc-qs"><span className="tc-qs-num">{trip.activities.length + linkedActivities}</span><span className="tc-qs-label">activities</span></div>
          <div className="tc-qs"><span className="tc-qs-num">{linkedRestaurants}</span><span className="tc-qs-label">restaurants</span></div>
        </div>
      </div>
      <div className="tc-footer">
        <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Click to plan →</span>
      </div>
    </div>
  );
}

// ── Inline edit helpers ─────────────────────────────────────────────────────

function InlineInput({ value, onChange, placeholder, type, style, className }) {
  return <input type={type||'text'} className={`he-input ${className||''}`} value={value} onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={placeholder} style={style} />;
}

// ── Trip detail view ────────────────────────────────────────────────────────

function TripDetail({ trip, onBack, onAddToCalendar, expandedSection, setExpandedSection, tripItems, onAddToTrip, onRemoveFromTrip, tripNotes, onUpdateTripNotes, packingChecked, onTogglePacking, onUpdateTrip }) {
  const startD = new Date(trip.startDate + 'T00:00');
  const endD = new Date(trip.endDate + 'T00:00');
  const nights = Math.round((endD - startD) / (1000 * 60 * 60 * 24));
  const dateRange = `${startD.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })} – ${endD.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}`;

  const totalFlightCost = trip.flights.reduce((s, f) => s + f.cost, 0);
  const totalAccomCost = trip.accommodation.perNight ? trip.accommodation.cost * trip.accommodation.nights : trip.accommodation.cost;
  const totalActivityCost = trip.activities.reduce((s, a) => s + a.cost, 0);
  const totalCost = totalFlightCost + totalAccomCost + totalActivityCost;
  const pct = trip.budget.total > 0 ? Math.min(100, Math.round((totalCost / trip.budget.total) * 100)) : 0;
  const today = new Date(); today.setHours(0,0,0,0);
  const daysUntil = Math.ceil((startD - today) / (1000 * 60 * 60 * 24));

  const linked = tripItems[trip.id] || [];
  const linkedRestaurants = linked.map(id => ITEM_BY_ID[id]).filter(i => i && i.type === 'restaurant');
  const linkedActivities = linked.map(id => ITEM_BY_ID[id]).filter(i => i && i.type === 'activity');
  const availableRestaurants = RESTAURANTS.filter(r => r.city === trip.city && !linked.includes(r.id));
  const availableActivities = ACTIVITIES.filter(a => a.city === trip.city && !linked.includes(a.id));

  const notes = tripNotes[trip.id] || '';
  const checkedPacking = packingChecked[trip.id] || {};

  // Edit states
  const [editingFlight, setEditingFlight] = React.useState(null); // flight obj being edited, or 'new'
  const [editingAccom, setEditingAccom] = React.useState(false);
  const [editingItinIdx, setEditingItinIdx] = React.useState(null);
  const [editingActIdx, setEditingActIdx] = React.useState(null);
  const [newPackingItem, setNewPackingItem] = React.useState('');
  const [editingBudget, setEditingBudget] = React.useState(false);

  const toggle = (s) => setExpandedSection(expandedSection === s ? null : s);

  // ── Flight CRUD
  const saveFlight = (fl) => {
    onUpdateTrip(trip.id, t => {
      const exists = t.flights.find(f => f.id === fl.id);
      return { ...t, flights: exists ? t.flights.map(f => f.id === fl.id ? fl : f) : [...t.flights, fl] };
    });
    setEditingFlight(null);
  };
  const deleteFlight = (fid) => {
    onUpdateTrip(trip.id, t => ({ ...t, flights: t.flights.filter(f => f.id !== fid) }));
    setEditingFlight(null);
  };

  // ── Accommodation
  const saveAccom = (accom) => {
    onUpdateTrip(trip.id, { accommodation: accom });
    setEditingAccom(false);
  };

  // ── Itinerary CRUD
  const saveItinDay = (idx, day) => {
    onUpdateTrip(trip.id, t => {
      const itin = [...t.itinerary];
      if (idx === -1) itin.push(day);
      else itin[idx] = day;
      return { ...t, itinerary: itin };
    });
    setEditingItinIdx(null);
  };
  const deleteItinDay = (idx) => {
    onUpdateTrip(trip.id, t => ({ ...t, itinerary: t.itinerary.filter((_, i) => i !== idx) }));
    setEditingItinIdx(null);
  };

  // ── Activity CRUD
  const saveActivity = (idx, act) => {
    onUpdateTrip(trip.id, t => {
      const acts = [...t.activities];
      if (idx === -1) acts.push(act);
      else acts[idx] = act;
      return { ...t, activities: acts };
    });
    setEditingActIdx(null);
  };
  const deleteActivity = (idx) => {
    onUpdateTrip(trip.id, t => ({ ...t, activities: t.activities.filter((_, i) => i !== idx) }));
    setEditingActIdx(null);
  };
  const toggleActBooked = (idx) => {
    onUpdateTrip(trip.id, t => ({
      ...t, activities: t.activities.map((a, i) => i === idx ? { ...a, booked: !a.booked } : a)
    }));
  };

  // ── Packing CRUD
  const addPackingItem = () => {
    if (!newPackingItem.trim()) return;
    onUpdateTrip(trip.id, t => ({ ...t, packingList: [...t.packingList, newPackingItem.trim()] }));
    setNewPackingItem('');
  };
  const removePackingItem = (idx) => {
    const item = trip.packingList[idx];
    onUpdateTrip(trip.id, t => ({ ...t, packingList: t.packingList.filter((_, i) => i !== idx) }));
  };

  // ── Budget
  const saveBudget = (budget) => {
    onUpdateTrip(trip.id, { budget });
    setEditingBudget(false);
  };

  return (
    <div className="detail-page">
      <div className="dp-header">
        <div>
          <button className="btn" onClick={onBack} style={{ marginBottom: 8, fontSize: 12 }}>← Back to trips</button>
          <div className="eyebrow">{trip.destination}</div>
          <h1 className="dp-title">{trip.title.split(/\s+/).slice(0, -1).join(' ') || trip.title} <em>{trip.title.split(/\s+/).slice(-1)[0]}</em></h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--ink-soft)' }}>{dateRange} · {nights} nights</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          {daysUntil > 0 && (
            <div className="trip-countdown-big" style={{ color: trip.color }}>
              <span className="tcb-num">{daysUntil}</span>
              <span className="tcb-label">days to go</span>
            </div>
          )}
          <button className="btn btn-primary" onClick={() => onAddToCalendar(trip)}>＋ Add to calendar</button>
        </div>
      </div>

      {/* ── Budget overview ─── */}
      <div className="card trip-budget-card">
        <div className="card-h">
          <h2>Budget <em>overview</em></h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="pill">€{totalCost} / €{trip.budget.total}</span>
            <button className="btn btn-sm" onClick={() => setEditingBudget(!editingBudget)}>✎</button>
          </div>
        </div>
        {editingBudget ? (
          <BudgetForm budget={trip.budget} onSave={saveBudget} onCancel={() => setEditingBudget(false)} />
        ) : (
          <>
            <div className="tc-budget" style={{ marginBottom: 16 }}>
              <div className="tc-budget-bar" style={{ height: 10 }}>
                <div className="tc-budget-fill" style={{ width: `${pct}%`, background: trip.color }} />
              </div>
            </div>
            <div className="budget-breakdown">
              <div className="bb-row"><span className="bb-label">Flights</span><span className="bb-dots" /><span className="bb-val">€{totalFlightCost}</span></div>
              <div className="bb-row"><span className="bb-label">Accommodation</span><span className="bb-dots" /><span className="bb-val">€{totalAccomCost}</span></div>
              <div className="bb-row"><span className="bb-label">Activities</span><span className="bb-dots" /><span className="bb-val">€{totalActivityCost}</span></div>
              <div className="bb-row bb-total"><span className="bb-label">Total estimated</span><span className="bb-dots" /><span className="bb-val">€{totalCost}</span></div>
              <div className="bb-row"><span className="bb-label">Remaining</span><span className="bb-dots" /><span className="bb-val" style={{ color: (trip.budget.total - totalCost) >= 0 ? 'var(--mint)' : '#FF6B6B' }}>€{trip.budget.total - totalCost}</span></div>
            </div>
          </>
        )}
      </div>

      {/* ── Notes ─── */}
      <SectionAccordion title="Notes" titleEm="& ideas" open={expandedSection === 'notes'} onToggle={() => toggle('notes')}>
        <textarea className="trip-notes-input" placeholder="Jot down ideas, links, recommendations…"
          value={notes} onChange={(e) => onUpdateTripNotes(trip.id, e.target.value)} rows={5} />
      </SectionAccordion>

      {/* ── Flights ─── */}
      <SectionAccordion title="Flights" titleEm={`(${trip.flights.length})`} open={expandedSection === 'flights'} onToggle={() => toggle('flights')}>
        <div className="flight-list">
          {trip.flights.map((fl) => (
            editingFlight && editingFlight.id === fl.id ? (
              <FlightForm key={fl.id} flight={editingFlight} tripColor={trip.color}
                onSave={saveFlight} onDelete={() => deleteFlight(fl.id)} onCancel={() => setEditingFlight(null)} />
            ) : (
              <FlightCard key={fl.id} fl={fl} tripColor={trip.color}
                onEdit={() => setEditingFlight({...fl})} onToggleBooked={() => {
                  onUpdateTrip(trip.id, t => ({ ...t, flights: t.flights.map(f => f.id === fl.id ? { ...f, booked: !f.booked } : f) }));
                }} />
            )
          ))}
          {editingFlight === 'new' ? (
            <FlightForm flight={{ id: 'f' + Date.now(), direction: 'outbound', from: '', to: '', date: '', time: '', airline: '', cost: 0, booked: false }}
              tripColor={trip.color} onSave={saveFlight} onCancel={() => setEditingFlight(null)} isNew />
          ) : (
            <button className="btn he-add-btn" onClick={() => setEditingFlight('new')}>＋ Add flight</button>
          )}
        </div>
      </SectionAccordion>

      {/* ── Accommodation ─── */}
      <SectionAccordion title="Accommodation" open={expandedSection === 'accommodation'} onToggle={() => toggle('accommodation')}>
        {editingAccom ? (
          <AccomForm accom={trip.accommodation} onSave={saveAccom} onCancel={() => setEditingAccom(false)} />
        ) : (
          <div className="accom-card card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, margin: '0 0 4px', fontWeight: 400 }}>{trip.accommodation.name}</h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)' }}>
                  {trip.accommodation.nights} nights · €{trip.accommodation.cost}{trip.accommodation.perNight ? '/night' : ' total'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontStyle: 'italic', color: 'var(--purple)' }}>€{totalAccomCost}</div>
                <span className={`fr-booked ${trip.accommodation.booked ? 'yes' : 'no'}`}>{trip.accommodation.booked ? '✓ Booked' : 'Not booked'}</span>
              </div>
            </div>
            {trip.accommodation.url && (
              <a href={trip.accommodation.url} target="_blank" rel="noreferrer"
                style={{ display: 'inline-block', marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--purple)', wordBreak: 'break-all' }}>
                ↗ {trip.accommodation.url}
              </a>
            )}
            <div style={{ marginTop: 10 }}>
              <button className="btn btn-sm" onClick={() => setEditingAccom(true)}>✎ Edit</button>
              <button className="btn btn-sm" style={{ marginLeft: 6 }} onClick={() => {
                onUpdateTrip(trip.id, t => ({ ...t, accommodation: { ...t.accommodation, booked: !t.accommodation.booked } }));
              }}>{trip.accommodation.booked ? 'Mark unbooked' : 'Mark booked'}</button>
            </div>
          </div>
        )}
      </SectionAccordion>

      {/* ── Itinerary ─── */}
      <SectionAccordion title="Itinerary" titleEm={`(${trip.itinerary.length} days)`} open={expandedSection === 'itinerary'} onToggle={() => toggle('itinerary')}>
        <div className="itin-timeline">
          {trip.itinerary.map((day, i) => (
            editingItinIdx === i ? (
              <ItinForm key={i} day={day} tripColor={trip.color}
                onSave={(d) => saveItinDay(i, d)} onDelete={() => deleteItinDay(i)} onCancel={() => setEditingItinIdx(null)} />
            ) : (
              <div key={i} className="itin-day">
                <div className="itin-marker">
                  <div className="itin-dot" style={{ background: trip.color }} />
                  {i < trip.itinerary.length - 1 && <div className="itin-line" />}
                </div>
                <div className="itin-content card">
                  <div className="itin-day-header">
                    <span className="pill" style={{ background: trip.color + '33', borderColor: trip.color + '55' }}>Day {day.day}</span>
                    <span className="pill mono">{new Date(day.date + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <button className="btn btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setEditingItinIdx(i)}>✎</button>
                  </div>
                  <h4 className="itin-title">{day.title}</h4>
                  <p className="itin-notes">{day.notes}</p>
                </div>
              </div>
            )
          ))}
          {editingItinIdx === -1 ? (
            <ItinForm day={{ day: trip.itinerary.length + 1, date: '', title: '', notes: '' }} tripColor={trip.color}
              onSave={(d) => saveItinDay(-1, d)} onCancel={() => setEditingItinIdx(null)} isNew />
          ) : (
            <button className="btn he-add-btn" onClick={() => setEditingItinIdx(-1)}>＋ Add day</button>
          )}
        </div>
      </SectionAccordion>

      {/* ── Trip Activities ─── */}
      <SectionAccordion title="Trip activities" titleEm={`(${trip.activities.length})`} open={expandedSection === 'activities'} onToggle={() => toggle('activities')}>
        <div className="trip-activities">
          {trip.activities.map((act, i) => (
            editingActIdx === i ? (
              <ActivityForm key={i} act={act}
                onSave={(a) => saveActivity(i, a)} onDelete={() => deleteActivity(i)} onCancel={() => setEditingActIdx(null)} />
            ) : (
              <div key={i} className="trip-act-row">
                <span className={`ta-check ${act.booked ? 'booked' : ''}`}
                  onClick={() => toggleActBooked(i)} style={{ cursor: 'pointer' }}>
                  {act.booked ? '✓' : '○'}
                </span>
                <span className="ta-name">{act.title}</span>
                <span className="ta-cost">{act.cost > 0 ? `€${act.cost}` : 'Free'}</span>
                <span className={`fr-booked ${act.booked ? 'yes' : 'no'}`}>{act.booked ? 'Booked' : 'To book'}</span>
                <button className="btn btn-sm" onClick={() => setEditingActIdx(i)}>✎</button>
              </div>
            )
          ))}
          {editingActIdx === -1 ? (
            <ActivityForm act={{ title: '', cost: 0, booked: false }} isNew
              onSave={(a) => saveActivity(-1, a)} onCancel={() => setEditingActIdx(null)} />
          ) : (
            <button className="btn he-add-btn" onClick={() => setEditingActIdx(-1)}>＋ Add activity</button>
          )}
        </div>
      </SectionAccordion>

      {/* ── Saved Restaurants ─── */}
      <SectionAccordion title="Restaurants" titleEm={`in ${trip.destination} (${linkedRestaurants.length})`} open={expandedSection === 'restaurants'} onToggle={() => toggle('restaurants')}>
        {linkedRestaurants.length === 0 && availableRestaurants.length === 0 && (
          <p className="empty-linked">No restaurants saved for {trip.destination} yet.</p>
        )}
        {linkedRestaurants.length > 0 && (
          <div className="linked-items-list">
            {linkedRestaurants.map(r => (
              <div key={r.id} className="linked-item">
                <div className="li-swatch" style={{ background: r.color }}>{r.title.slice(-1)}</div>
                <div className="li-info"><div className="li-title">{r.title}</div><div className="li-sub">{r.subtitle}</div></div>
                {r.price && <span className="pill">{r.price}</span>}
                <button className="btn btn-sm" onClick={() => onRemoveFromTrip(trip.id, r.id)}>✕</button>
              </div>
            ))}
          </div>
        )}
        {availableRestaurants.length > 0 && (
          <div className="add-linked-section">
            <div className="als-label">Add a restaurant</div>
            <div className="als-items">
              {availableRestaurants.map(r => (
                <button key={r.id} className="als-chip" onClick={() => onAddToTrip(trip.id, r.id)}>
                  <span className="als-dot" style={{ background: r.color }}></span>{r.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </SectionAccordion>

      {/* ── Saved Activities ─── */}
      <SectionAccordion title="Saved activities" titleEm={`in ${trip.destination} (${linkedActivities.length})`} open={expandedSection === 'savedActivities'} onToggle={() => toggle('savedActivities')}>
        {linkedActivities.length === 0 && availableActivities.length === 0 && (
          <p className="empty-linked">No activities saved for {trip.destination} yet.</p>
        )}
        {linkedActivities.length > 0 && (
          <div className="linked-items-list">
            {linkedActivities.map(a => (
              <div key={a.id} className="linked-item">
                <div className="li-swatch" style={{ background: a.color }}>{a.title.slice(-1)}</div>
                <div className="li-info"><div className="li-title">{a.title}</div><div className="li-sub">{a.subtitle}</div></div>
                {a.duration && <span className="pill">{a.duration}</span>}
                <button className="btn btn-sm" onClick={() => onRemoveFromTrip(trip.id, a.id)}>✕</button>
              </div>
            ))}
          </div>
        )}
        {availableActivities.length > 0 && (
          <div className="add-linked-section">
            <div className="als-label">Add an activity</div>
            <div className="als-items">
              {availableActivities.map(a => (
                <button key={a.id} className="als-chip" onClick={() => onAddToTrip(trip.id, a.id)}>
                  <span className="als-dot" style={{ background: a.color }}></span>{a.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </SectionAccordion>

      {/* ── Packing list ─── */}
      <SectionAccordion title="Packing list" titleEm={`(${Object.values(checkedPacking).filter(Boolean).length}/${trip.packingList.length})`} open={expandedSection === 'packing'} onToggle={() => toggle('packing')}>
        <div className="packing-progress">
          <div className="packing-bar">
            <div className="packing-fill" style={{
              width: `${trip.packingList.length > 0 ? (Object.values(checkedPacking).filter(Boolean).length / trip.packingList.length * 100) : 0}%`,
              background: trip.color
            }} />
          </div>
          <span className="packing-pct">{trip.packingList.length > 0 ? Math.round(Object.values(checkedPacking).filter(Boolean).length / trip.packingList.length * 100) : 0}%</span>
        </div>
        <div className="packing-grid">
          {trip.packingList.map((item, i) => (
            <label key={i} className={`pack-item ${checkedPacking[item] ? 'packed' : ''}`}>
              <input type="checkbox" checked={!!checkedPacking[item]}
                onChange={() => onTogglePacking(trip.id, item)} />
              <span>{item}</span>
              <button className="pack-remove" onClick={(e) => { e.preventDefault(); removePackingItem(i); }}>✕</button>
            </label>
          ))}
        </div>
        <div className="pack-add-row">
          <input className="he-input" value={newPackingItem}
            onChange={(e) => setNewPackingItem(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addPackingItem(); }}
            placeholder="Add item…" />
          <button className="btn btn-primary btn-sm" onClick={addPackingItem}>＋</button>
        </div>
      </SectionAccordion>
    </div>
  );
}

// ── Form components ─────────────────────────────────────────────────────────

function FlightCard({ fl, tripColor, onEdit, onToggleBooked }) {
  return (
    <div className="flight-row card">
      <div className="fr-direction">
        <span className="pill" style={{ background: fl.direction === 'outbound' ? tripColor + '44' : 'var(--paper-2)' }}>
          {fl.direction === 'outbound' ? '→ Outbound' : '← Return'}
        </span>
        <span className={`fr-booked ${fl.booked ? 'yes' : 'no'}`} onClick={onToggleBooked} style={{ cursor: 'pointer' }}>
          {fl.booked ? '✓ Booked' : 'Not booked'}
        </span>
        <button className="btn btn-sm" style={{ marginLeft: 'auto' }} onClick={onEdit}>✎</button>
      </div>
      <div className="fr-route">
        <div className="fr-airport"><span className="fr-code">{fl.from}</span></div>
        <div className="fr-line"><span className="fr-airline">{fl.airline}</span><div className="fr-dash" /><span style={{ fontSize: 16 }}>✈</span></div>
        <div className="fr-airport"><span className="fr-code">{fl.to}</span></div>
      </div>
      <div className="fr-details">
        <span className="pill mono">{fl.date && new Date(fl.date + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        <span className="pill mono">{fl.time}</span>
        <span className="pill" style={{ marginLeft: 'auto', fontWeight: 600 }}>€{fl.cost}</span>
      </div>
    </div>
  );
}

function FlightForm({ flight, tripColor, onSave, onDelete, onCancel, isNew }) {
  const [fl, setFl] = React.useState({ ...flight });
  const u = (k, v) => setFl(p => ({ ...p, [k]: v }));
  return (
    <div className="he-form card">
      <div className="he-form-title">{isNew ? 'New flight' : 'Edit flight'}</div>
      <div className="he-form-grid">
        <label>Direction
          <select className="he-input" value={fl.direction} onChange={e => u('direction', e.target.value)}>
            <option value="outbound">Outbound</option><option value="return">Return</option>
          </select>
        </label>
        <label>From <InlineInput value={fl.from} onChange={v => u('from', v)} placeholder="DUB" /></label>
        <label>To <InlineInput value={fl.to} onChange={v => u('to', v)} placeholder="FCO" /></label>
        <label>Airline <InlineInput value={fl.airline} onChange={v => u('airline', v)} placeholder="Airline" /></label>
        <label>Date <InlineInput type="date" value={fl.date} onChange={v => u('date', v)} /></label>
        <label>Time <InlineInput type="time" value={fl.time} onChange={v => u('time', v)} /></label>
        <label>Cost (€) <InlineInput type="number" value={fl.cost} onChange={v => u('cost', v)} /></label>
        <label className="he-checkbox"><input type="checkbox" checked={fl.booked} onChange={() => u('booked', !fl.booked)} /> Booked</label>
      </div>
      <div className="he-form-actions">
        {!isNew && onDelete && <button className="btn he-del-btn" onClick={onDelete}>Delete</button>}
        <button className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave(fl)}>Save</button>
      </div>
    </div>
  );
}

function AccomForm({ accom, onSave, onCancel }) {
  const [a, setA] = React.useState({ ...accom });
  const u = (k, v) => setA(p => ({ ...p, [k]: v }));
  return (
    <div className="he-form card">
      <div className="he-form-title">Edit accommodation</div>
      <div className="he-form-grid">
        <label>Name <InlineInput value={a.name} onChange={v => u('name', v)} placeholder="Hotel name" /></label>
        <label>Cost (€) <InlineInput type="number" value={a.cost} onChange={v => u('cost', v)} /></label>
        <label>Nights <InlineInput type="number" value={a.nights} onChange={v => u('nights', v)} /></label>
        <label className="he-checkbox"><input type="checkbox" checked={a.perNight} onChange={() => u('perNight', !a.perNight)} /> Price is per night</label>
        <label className="he-checkbox"><input type="checkbox" checked={a.booked} onChange={() => u('booked', !a.booked)} /> Booked</label>
        <label>URL <InlineInput value={a.url || ''} onChange={v => u('url', v)} placeholder="https://…" style={{ gridColumn: '1 / -1' }} /></label>
      </div>
      <div className="he-form-actions">
        <button className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave(a)}>Save</button>
      </div>
    </div>
  );
}

function ItinForm({ day, tripColor, onSave, onDelete, onCancel, isNew }) {
  const [d, setD] = React.useState({ ...day });
  const u = (k, v) => setD(p => ({ ...p, [k]: v }));
  return (
    <div className="he-form card" style={{ marginLeft: 28 }}>
      <div className="he-form-title">{isNew ? 'Add day' : 'Edit day'}</div>
      <div className="he-form-grid">
        <label>Day # <InlineInput type="number" value={d.day} onChange={v => u('day', v)} /></label>
        <label>Date <InlineInput type="date" value={d.date} onChange={v => u('date', v)} /></label>
        <label style={{ gridColumn: '1 / -1' }}>Title <InlineInput value={d.title} onChange={v => u('title', v)} placeholder="Day title" /></label>
        <label style={{ gridColumn: '1 / -1' }}>Notes <textarea className="he-input" value={d.notes} onChange={e => u('notes', e.target.value)} rows={2} placeholder="Notes…" /></label>
      </div>
      <div className="he-form-actions">
        {!isNew && onDelete && <button className="btn he-del-btn" onClick={onDelete}>Delete day</button>}
        <button className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave(d)}>Save</button>
      </div>
    </div>
  );
}

function ActivityForm({ act, onSave, onDelete, onCancel, isNew }) {
  const [a, setA] = React.useState({ ...act });
  const u = (k, v) => setA(p => ({ ...p, [k]: v }));
  return (
    <div className="he-form card">
      <div className="he-form-title">{isNew ? 'Add activity' : 'Edit activity'}</div>
      <div className="he-form-grid">
        <label>Title <InlineInput value={a.title} onChange={v => u('title', v)} placeholder="Activity name" /></label>
        <label>Cost (€) <InlineInput type="number" value={a.cost} onChange={v => u('cost', v)} /></label>
        <label className="he-checkbox"><input type="checkbox" checked={a.booked} onChange={() => u('booked', !a.booked)} /> Booked</label>
      </div>
      <div className="he-form-actions">
        {!isNew && onDelete && <button className="btn he-del-btn" onClick={onDelete}>Delete</button>}
        <button className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave(a)}>Save</button>
      </div>
    </div>
  );
}

function BudgetForm({ budget, onSave, onCancel }) {
  const [b, setB] = React.useState({ ...budget });
  return (
    <div className="he-form-inline">
      <div className="he-form-grid">
        <label>Total budget (€) <InlineInput type="number" value={b.total} onChange={v => setB(p => ({ ...p, total: v }))} /></label>
        <label>Spent so far (€) <InlineInput type="number" value={b.spent} onChange={v => setB(p => ({ ...p, spent: v }))} /></label>
      </div>
      <div className="he-form-actions">
        <button className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave(b)}>Save</button>
      </div>
    </div>
  );
}

// ── Accordion wrapper ───────────────────────────────────────────────────────

function SectionAccordion({ title, titleEm, open, onToggle, children }) {
  return (
    <div className={`section-accordion ${open ? 'open' : ''}`}>
      <button className="sa-header" onClick={onToggle}>
        <h2 className="sa-title">{title} {titleEm && <em>{titleEm}</em>}</h2>
        <span className="sa-chevron">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="sa-body">{children}</div>}
    </div>
  );
}

Object.assign(window, { HolidaysPage });
