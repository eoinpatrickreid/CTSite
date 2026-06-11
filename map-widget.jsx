// Map widget — Leaflet map with pins for restaurants & activities.

function MapWidget({ restaurants, activities, ratings, visited, customPins, onAddPin, isDark }) {
  const containerRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const markersRef = React.useRef(null);
  const tileRef = React.useRef(null);
  const [pinFilter, setPinFilter] = React.useState('all'); // all | visited | unvisited

  const items = React.useMemo(() => [
    ...restaurants.filter(r => r.lat && r.lng),
    ...activities.filter(a => a.lat && a.lng),
  ], [restaurants, activities]);

  // Init map once
  React.useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const map = L.map(containerRef.current, {
      center: [53.349, -6.260],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    map.on('click', (e) => {
      const name = prompt('Pin this spot \u2014 give it a name:');
      if (name && name.trim()) {
        onAddPin({ id: 'pin' + Date.now(), name: name.trim(), lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    setTimeout(() => map.invalidateSize(), 250);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Swap tiles for dark/light
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileRef.current) map.removeLayer(tileRef.current);
    const url = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    tileRef.current = L.tileLayer(url, {
      attribution: '\u00a9 OSM \u00b7 CARTO',
      maxZoom: 19, subdomains: 'abcd',
    }).addTo(map);
  }, [isDark]);

  // Sync markers
  React.useEffect(() => {
    const layer = markersRef.current;
    if (!layer) return;
    layer.clearLayers();

    items.forEach((item) => {
      const isV = !!visited[item.id];

      // Apply filter
      if (pinFilter === 'visited' && !isV) return;
      if (pinFilter === 'unvisited' && isV) return;

      const r = ratings[item.id] || {};
      const glyph = item.type === 'restaurant' ? '\u25C7' : '\u25D1';

      const icon = L.divIcon({
        className: 'mpin-wrap',
        html: '<div class="mpin ' + (isV ? 'mpin-visited' : '') + ' mpin-' + item.type + '" style="--pc:' + item.color + '"><span class="mpin-icon">' + (isV ? '\u2605' : glyph) + '</span></div>',
        iconSize: [32, 38], iconAnchor: [16, 38], popupAnchor: [0, -38],
      });

      let ratHtml = '';
      if (r.eoin || r.cristina) {
        ratHtml = '<div class="mp-ratings">';
        if (r.eoin) ratHtml += '<div class="mp-r"><span class="mp-who-e">Eoin</span> ' + '\u2605'.repeat(r.eoin) + '\u2606'.repeat(5 - r.eoin) + '</div>';
        if (r.cristina) ratHtml += '<div class="mp-r"><span class="mp-who-c">Cristina</span> ' + '\u2605'.repeat(r.cristina) + '\u2606'.repeat(5 - r.cristina) + '</div>';
        ratHtml += '</div>';
      }

      const popup = '<div class="mp-card">'
        + '<div class="mp-title">' + item.title + '</div>'
        + '<div class="mp-sub">' + item.subtitle + '</div>'
        + '<span class="mp-badge ' + (isV ? 'mp-v' : '') + '">' + (isV ? '\u2713 Been here' : 'Want to go') + '</span>'
        + ratHtml + '</div>';

      L.marker([item.lat, item.lng], { icon })
        .bindPopup(popup, { className: 'mp-popup', minWidth: 160, maxWidth: 240 })
        .addTo(layer);
    });

    customPins.forEach((pin) => {
      const icon = L.divIcon({
        className: 'mpin-wrap',
        html: '<div class="mpin mpin-custom"><span class="mpin-icon">\u2726</span></div>',
        iconSize: [28, 34], iconAnchor: [14, 34], popupAnchor: [0, -34],
      });
      L.marker([pin.lat, pin.lng], { icon })
        .bindPopup('<div class="mp-card"><div class="mp-title">' + pin.name + '</div><span class="mp-badge mp-saved">\uD83D\uDCCD Saved</span></div>', { className: 'mp-popup', minWidth: 140 })
        .addTo(layer);
    });
  }, [items, ratings, visited, customPins, pinFilter]);

  // Fit bounds on first load
  const didFit = React.useRef(false);
  React.useEffect(() => {
    if (didFit.current) return;
    const map = mapRef.current;
    if (!map) return;
    const pts = [...items.map(i => [i.lat, i.lng]), ...customPins.map(p => [p.lat, p.lng])];
    if (pts.length > 1) { map.fitBounds(L.latLngBounds(pts).pad(0.15)); didFit.current = true; }
    else if (pts.length === 1) { map.setView(pts[0], 14); didFit.current = true; }
  }, [items.length, customPins.length]);

  return (
    <div className="card map-card">
      <div className="card-h">
        <div>
          <div className="eyebrow">explore</div>
          <h2>Our <em>map</em></h2>
        </div>
        <span className="pill" style={{ fontSize: 10 }}>click map to add a pin</span>
      </div>
      <div className="map-legend">
        <div className="map-filter-toggle">
          <button className={`mft-btn ${pinFilter === 'all' ? 'active' : ''}`} onClick={() => setPinFilter('all')}>All</button>
          <button className={`mft-btn ${pinFilter === 'unvisited' ? 'active' : ''}`} onClick={() => setPinFilter('unvisited')}>Want to go</button>
          <button className={`mft-btn ${pinFilter === 'visited' ? 'active' : ''}`} onClick={() => setPinFilter('visited')}>Visited</button>
        </div>
        <span className="ml-item"><span className="ml-dot" style={{ background: 'var(--purple)' }}></span>Restaurant</span>
        <span className="ml-item"><span className="ml-dot" style={{ background: 'var(--mint)' }}></span>Activity</span>
        <span className="ml-item"><span className="ml-dot ml-visited"></span>Visited</span>
        <span className="ml-item"><span className="ml-dot ml-custom"></span>Saved</span>
      </div>
      <div ref={containerRef} className="map-container"></div>
    </div>
  );
}

Object.assign(window, { MapWidget });
