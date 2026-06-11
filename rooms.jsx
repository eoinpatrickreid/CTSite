// Rooms — immersive atmospheric wrapper, decorative elements, transitions.

const ROOM_CONFIG = {
  home:        { className: 'room-bedroom',    label: 'the bedroom'     },
  kitchen:     { className: 'room-kitchen',    label: 'the kitchen'     },
  restaurants: { className: 'room-restaurant', label: 'the restaurant'  },
  activities:  { className: 'room-garden',     label: 'the garden'      },
  watchlist:   { className: 'room-livingroom', label: 'the living room' },
  holidays:    { className: 'room-beach',      label: 'the beach'       },
};

// (ambient sound engine removed)

// ── Room decorative elements ────────────────────────────────────────────────

function BedroomDecorations() {
  return (
    <>
      {/* Warm wall */}
      <div className="br-wall" />

      {/* Wainscoting / baseboard */}
      <div className="br-baseboard" />

      {/* Shelf with picture frames */}
      <div className="br-shelf">
        <div className="br-shelf-board" />
        <div className="br-frame br-frame-1">
          <div className="br-frame-inner">
            <svg viewBox="0 0 60 40" className="br-frame-art">
              <circle cx="45" cy="15" r="8" fill="#FFE0B3" opacity="0.6" />
              <path d="M5 40 L15 20 L25 30 L35 15 L55 40Z" fill="#C8E6D0" opacity="0.5" />
              <path d="M0 40 L20 25 L40 35 L60 20 L60 40Z" fill="#D4A5F9" opacity="0.3" />
            </svg>
          </div>
        </div>
        <div className="br-frame br-frame-2">
          <div className="br-frame-inner br-frame-photo">
            <svg viewBox="0 0 40 50" className="br-frame-art">
              <rect width="40" height="50" fill="#FFC9DE" opacity="0.3" />
              <circle cx="20" cy="18" r="7" fill="#FFB3D9" opacity="0.5" />
              <path d="M8 50 Q20 30 32 50Z" fill="#D4A5F9" opacity="0.4" />
            </svg>
          </div>
        </div>
        <div className="br-frame br-frame-3">
          <div className="br-frame-inner">
            <svg viewBox="0 0 50 50" className="br-frame-art">
              <rect x="5" y="5" width="40" height="40" rx="20" fill="#B8E0F5" opacity="0.4" />
              <text x="25" y="32" textAnchor="middle" fontSize="14" fill="#2E1F2A" opacity="0.3" fontFamily="serif">&amp;</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Painting on the wall */}
      <div className="br-painting">
        <div className="br-painting-frame">
          <svg viewBox="0 0 180 120" className="br-painting-art">
            <defs>
              <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B8E0F5" />
                <stop offset="100%" stopColor="#FFE0B3" />
              </linearGradient>
            </defs>
            <rect width="180" height="120" fill="url(#sky)" />
            <circle cx="140" cy="30" r="18" fill="#FFE0B3" opacity="0.8" />
            <path d="M0 80 Q30 50 60 75 Q90 55 120 70 Q150 50 180 65 L180 120 L0 120Z" fill="#C8E6D0" opacity="0.6" />
            <path d="M0 95 Q45 70 90 90 Q135 75 180 85 L180 120 L0 120Z" fill="#D4A5F9" opacity="0.3" />
          </svg>
        </div>
      </div>

      {/* Desk lamp */}
      <div className="br-lamp">
        <div className="br-lamp-shade" />
        <div className="br-lamp-arm" />
        <div className="br-lamp-base" />
        <div className="br-lamp-glow" />
      </div>

      {/* Vinyl record player */}
      <div className="br-vinyl">
        <div className="br-vinyl-body">
          <div className="br-vinyl-platter">
            <div className="br-vinyl-record">
              <div className="br-vinyl-label">
                <span>E&amp;C</span>
              </div>
              <div className="br-vinyl-groove br-vg-1" />
              <div className="br-vinyl-groove br-vg-2" />
              <div className="br-vinyl-groove br-vg-3" />
            </div>
          </div>
          <div className="br-vinyl-arm">
            <div className="br-vinyl-arm-bar" />
            <div className="br-vinyl-arm-head" />
          </div>
        </div>
      </div>

      {/* String lights */}
      <div className="br-string-lights">
        <svg viewBox="0 0 1200 50" preserveAspectRatio="none" className="br-string-svg">
          <path d="M0 8 Q100 35 200 12 Q300 40 400 10 Q500 38 600 14 Q700 36 800 8 Q900 32 1000 12 Q1100 38 1200 10"
            fill="none" stroke="rgba(80,60,40,0.3)" strokeWidth="1.5" />
        </svg>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="br-bulb" style={{
            left: (4 + i * 8.2) + '%',
            top: (i % 2 === 0 ? '12px' : '28px'),
            '--delay': (i * 0.7) + 's',
            '--d': (2.5 + Math.random() * 2) + 's',
          }} />
        ))}
      </div>

      {/* Dust motes */}
      {Array.from({ length: 12 }, (_, i) => (
        <div key={'m'+i} className="dust-mote" style={{
          '--s': (2 + Math.random() * 3) + 'px',
          '--d': (10 + Math.random() * 10) + 's',
          '--delay': (Math.random() * 10) + 's',
          '--dx': (-40 + Math.random() * 80) + 'px',
          '--dy': (-100 - Math.random() * 200) + 'px',
          left: (Math.random() * 100) + '%',
          top: (20 + Math.random() * 60) + '%',
        }} />
      ))}
    </>
  );
}

function KitchenDecorations() {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="steam-wisp" style={{
          '--w': (40 + Math.random() * 40) + 'px',
          '--d': (5 + Math.random() * 4) + 's',
          '--delay': (Math.random() * 6) + 's',
          '--x': (20 + Math.random() * 60) + '%',
        }} />
      ))}
    </>
  );
}

function RestaurantDecorations() {
  // Cosy bright restaurant — floating dust motes in warm light
  return (
    <>
      {Array.from({ length: 10 }, (_, i) => (
        <div key={'m'+i} className="dust-mote" style={{
          '--s': (2 + Math.random() * 2.5) + 'px',
          '--d': (14 + Math.random() * 12) + 's',
          '--delay': (Math.random() * 12) + 's',
          '--dx': (-30 + Math.random() * 60) + 'px',
          '--dy': (-120 - Math.random() * 180) + 'px',
          left: (Math.random() * 100) + '%',
          top: (20 + Math.random() * 60) + '%',
        }} />
      ))}
    </>
  );
}

function GardenDecorations() {
  const leafColors = ['rgba(120,180,80,0.5)', 'rgba(100,160,60,0.4)', 'rgba(140,190,70,0.45)', 'rgba(80,140,50,0.35)', 'rgba(160,200,90,0.4)'];
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="leaf" style={{
          '--s': (8 + Math.random() * 8) + 'px',
          '--c': leafColors[i % leafColors.length],
          '--d': (12 + Math.random() * 10) + 's',
          '--delay': (Math.random() * 12) + 's',
          '--dx': (-30 + Math.random() * 60) + 'px',
          '--x': (Math.random() * 100) + '%',
        }} />
      ))}
    </>
  );
}

function LivingRoomDecorations() {
  // Cosy bright living room — floating dust motes in warm light
  return (
    <>
      {Array.from({ length: 10 }, (_, i) => (
        <div key={'m'+i} className="dust-mote" style={{
          '--s': (2 + Math.random() * 2.5) + 'px',
          '--d': (14 + Math.random() * 12) + 's',
          '--delay': (Math.random() * 12) + 's',
          '--dx': (-30 + Math.random() * 60) + 'px',
          '--dy': (-120 - Math.random() * 180) + 'px',
          left: (Math.random() * 100) + '%',
          top: (20 + Math.random() * 60) + '%',
        }} />
      ))}
    </>
  );
}

function BeachDecorations() {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="wave-line" style={{
          '--y': (22 + i * 4) + '%',
          '--d': (5 + Math.random() * 3) + 's',
          '--delay': (Math.random() * 4) + 's',
        }} />
      ))}
    </>
  );
}

const ROOM_DECORATIONS = {
  home: BedroomDecorations,
  kitchen: KitchenDecorations,
  restaurants: RestaurantDecorations,
  activities: GardenDecorations,
  watchlist: LivingRoomDecorations,
  holidays: BeachDecorations,
};

// ── Room wrapper component ──────────────────────────────────────────────────

function RoomProvider({ activeTab, children }) {
  const roomCfg = ROOM_CONFIG[activeTab] || ROOM_CONFIG.home;

  // Pre-mount every room's decorations once so first-visit paint is warm
  // and tab switches don't pay the mount + first-paint cost again.
  return (
    <div className={roomCfg.className}>
      <div className="room-atmosphere">
        {Object.keys(ROOM_DECORATIONS).map((key) => {
          const Deco = ROOM_DECORATIONS[key];
          const visible = key === activeTab;
          return (
            <div
              key={key}
              className={`room-deco-slot ${visible ? 'is-active' : ''}`}
              aria-hidden={!visible}
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                visibility: visible ? 'visible' : 'hidden',
                contain: 'layout style paint',
              }}>
              <Deco />
            </div>
          );
        })}
      </div>
      <div className="room-label">{roomCfg.label}</div>
      {children}
    </div>
  );
}

Object.assign(window, { RoomProvider, ROOM_CONFIG });
