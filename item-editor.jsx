// Item editor modal — add or edit user items (meals, restaurants, activities, watch).

const PASTEL_COLORS = ['#FFB3D9', '#D4A5F9', '#FFC9DE', '#B8E0F5', '#C8E6D0', '#FFE0B3', '#A8E6F0', '#F4C2A1'];

function uid(prefix) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function ItemEditorModal({ type, item, onClose, onSave }) {
  const isEdit = !!item;
  const todayISO = new Date().toISOString().slice(0, 10);
  const nextWeekISO = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const baseDefaults = {
    meal:       { title: '', subtitle: '', color: PASTEL_COLORS[0], ingredientsText: '', stepsText: '' },
    restaurant: { title: '', subtitle: '', color: PASTEL_COLORS[1], url: '', neighborhood: '', price: '€€', city: '' },
    activity:   { title: '', subtitle: '', color: PASTEL_COLORS[4], url: '', duration: '', city: '' },
    watch:      { title: '', subtitle: '', color: PASTEL_COLORS[5], url: '', kind: 'Movie' },
    trip:       { title: '', destination: '', city: '', color: PASTEL_COLORS[3], startDate: todayISO, endDate: nextWeekISO, status: 'planning', budgetTotal: 1500 },
  };

  const initial = React.useMemo(() => {
    if (!isEdit) return baseDefaults[type];
    if (type === 'meal') {
      return {
        title: item.title || '', subtitle: item.subtitle || '', color: item.color || PASTEL_COLORS[0],
        ingredientsText: (item.ingredients || []).join('\n'),
        stepsText: (item.steps || []).join('\n'),
      };
    }
    if (type === 'trip') {
      return {
        ...baseDefaults.trip,
        title: item.title || '',
        destination: item.destination || '',
        city: item.city || '',
        color: item.color || PASTEL_COLORS[3],
        startDate: item.startDate || baseDefaults.trip.startDate,
        endDate: item.endDate || baseDefaults.trip.endDate,
        status: item.status || 'planning',
        budgetTotal: item.budget?.total ?? 1500,
      };
    }
    return { ...baseDefaults[type], ...item };
  }, [item, type, isEdit]);

  const [form, setForm] = React.useState(initial);
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    let saved;
    if (type === 'meal') {
      saved = {
        id: item?.id || uid('m'),
        type: 'meal',
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || 'A recipe to try',
        color: form.color,
        ingredients: form.ingredientsText.split('\n').map(s => s.trim()).filter(Boolean),
        steps: form.stepsText.split('\n').map(s => s.trim()).filter(Boolean),
        custom: true,
      };
    } else if (type === 'restaurant') {
      saved = {
        id: item?.id || uid('r'),
        type: 'restaurant',
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || 'A spot to try',
        color: form.color,
        url: form.url.trim(),
        neighborhood: form.neighborhood.trim(),
        price: form.price,
        city: form.city.trim(),
        custom: true,
      };
    } else if (type === 'activity') {
      saved = {
        id: item?.id || uid('a'),
        type: 'activity',
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || 'Something to do',
        color: form.color,
        url: form.url.trim(),
        duration: form.duration.trim(),
        city: form.city.trim(),
        custom: true,
      };
    } else if (type === 'watch') {
      saved = {
        id: item?.id || uid('w'),
        type: 'watch',
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || form.kind,
        color: form.color,
        url: form.url.trim(),
        kind: form.kind,
        custom: true,
      };
    } else {
      // trip
      saved = {
        id: item?.id || uid('h'),
        type: 'trip',
        title: form.title.trim(),
        destination: form.destination.trim() || form.city.trim(),
        city: form.city.trim() || form.destination.trim(),
        color: form.color,
        startDate: form.startDate,
        endDate: form.endDate,
        status: form.status,
        budget: { total: Number(form.budgetTotal) || 0, spent: item?.budget?.spent || 0 },
        flights: item?.flights || [],
        accommodation: item?.accommodation || { name: '', cost: 0, perNight: true, nights: 0, booked: false, url: '' },
        itinerary: item?.itinerary || [],
        activities: item?.activities || [],
        packingList: item?.packingList || [],
        custom: true,
      };
    }
    onSave(saved);
    onClose();
  };

  const labels = {
    meal:       { heading: isEdit ? 'Edit recipe' : 'Add a recipe', titleLabel: 'Recipe name', subLabel: 'Subtitle (e.g. "Creamy pasta · ~25 min")' },
    restaurant: { heading: isEdit ? 'Edit spot' : 'Add a spot',     titleLabel: 'Restaurant name', subLabel: 'Subtitle (e.g. "Italian · Date night")' },
    activity:   { heading: isEdit ? 'Edit idea' : 'Add an idea',    titleLabel: 'Activity name', subLabel: 'Subtitle' },
    watch:      { heading: isEdit ? 'Edit title' : 'Add a title',   titleLabel: 'Title', subLabel: 'Subtitle (e.g. "Drama · 2h 12m")' },
    trip:       { heading: isEdit ? 'Edit holiday' : 'Plan a holiday', titleLabel: 'Trip name', subLabel: '' },
  };
  const L = labels[type];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-editor" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <h3>{L.heading.split(' ').slice(0, -1).join(' ')} <em>{L.heading.split(' ').slice(-1)[0]}</em></h3>
        <div className="modal-sub">{isEdit ? 'Update the details and save.' : 'Add it to your collection.'}</div>

        <div className="field">
          <label>{L.titleLabel}</label>
          <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} autoFocus placeholder="…" />
        </div>
        {type !== 'trip' && (
          <div className="field">
            <label>{L.subLabel}</label>
            <input type="text" value={form.subtitle} onChange={(e) => update('subtitle', e.target.value)} placeholder="…" />
          </div>
        )}

        {type === 'meal' && (
          <>
            <div className="field">
              <label>Ingredients (one per line)</label>
              <textarea rows={5} value={form.ingredientsText} onChange={(e) => update('ingredientsText', e.target.value)} placeholder="200g pasta&#10;1 cup cream&#10;2 garlic cloves" />
            </div>
            <div className="field">
              <label>Steps (one per line)</label>
              <textarea rows={4} value={form.stepsText} onChange={(e) => update('stepsText', e.target.value)} placeholder="Boil pasta until al dente.&#10;Sauté garlic in olive oil." />
            </div>
          </>
        )}

        {(type === 'restaurant' || type === 'activity') && (
          <>
            <div className="field-row">
              <div className="field">
                <label>City</label>
                <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Dublin" />
              </div>
              {type === 'restaurant' && (
                <>
                  <div className="field">
                    <label>Neighborhood</label>
                    <input type="text" value={form.neighborhood} onChange={(e) => update('neighborhood', e.target.value)} placeholder="Old Town" />
                  </div>
                  <div className="field">
                    <label>Price</label>
                    <select value={form.price} onChange={(e) => update('price', e.target.value)}>
                      <option value="€">€</option><option value="€€">€€</option><option value="€€€">€€€</option><option value="€€€€">€€€€</option>
                    </select>
                  </div>
                </>
              )}
              {type === 'activity' && (
                <div className="field">
                  <label>Duration</label>
                  <input type="text" value={form.duration} onChange={(e) => update('duration', e.target.value)} placeholder="2h" />
                </div>
              )}
            </div>
            <div className="field">
              <label>Link (optional)</label>
              <input type="url" value={form.url} onChange={(e) => update('url', e.target.value)} placeholder="https://…" />
            </div>
          </>
        )}

        {type === 'trip' && (
          <>
            <div className="field-row">
              <div className="field">
                <label>Destination</label>
                <input type="text" value={form.destination} onChange={(e) => update('destination', e.target.value)} placeholder="Italy" />
              </div>
              <div className="field">
                <label>City</label>
                <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Rome" />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Start date</label>
                <input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} />
              </div>
              <div className="field">
                <label>End date</label>
                <input type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Status</label>
                <select value={form.status} onChange={(e) => update('status', e.target.value)}>
                  <option value="planning">Planning</option>
                  <option value="booked">Booked</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="field">
                <label>Budget (€)</label>
                <input type="number" min="0" step="50" value={form.budgetTotal} onChange={(e) => update('budgetTotal', e.target.value)} />
              </div>
            </div>
          </>
        )}

        {type === 'watch' && (
          <>
            <div className="field-row">
              <div className="field">
                <label>Kind</label>
                <select value={form.kind} onChange={(e) => update('kind', e.target.value)}>
                  <option value="Movie">Movie</option><option value="Series">Series</option>
                </select>
              </div>
              <div className="field" style={{ flex: 2 }}>
                <label>Link (optional)</label>
                <input type="url" value={form.url} onChange={(e) => update('url', e.target.value)} placeholder="https://…" />
              </div>
            </div>
          </>
        )}

        <div className="field">
          <label>Accent color</label>
          <div className="color-swatches">
            {PASTEL_COLORS.map((c) => (
              <button key={c} type="button"
                className={`color-swatch ${form.color === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => update('color', c)}
                aria-label={c} />
            ))}
          </div>
        </div>

        <div className="btn-row">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!form.title.trim()}>
            {isEdit ? 'Save changes' : 'Add it'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ item, onClose, onConfirm }) {
  if (!item) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <h3>Delete <em>{item.title}</em>?</h3>
        <div className="modal-sub">This will remove it from your collection. You can't undo this.</div>
        <div className="btn-row">
          <button className="btn" onClick={onClose}>Keep it</button>
          <button className="btn btn-primary btn-danger" onClick={() => { onConfirm(item); onClose(); }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ItemEditorModal, ConfirmDeleteModal });
