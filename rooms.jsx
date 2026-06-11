// Rooms — immersive atmospheric wrapper, decorative elements, ambient sounds, transitions.

const ROOM_CONFIG = {
  home:        { className: 'room-bedroom',    label: 'the bedroom',    sound: 'vinyl' },
  kitchen:     { className: 'room-kitchen',    label: 'the kitchen',    sound: 'kitchen' },
  restaurants: { className: 'room-restaurant', label: 'the restaurant', sound: 'restaurant' },
  activities:  { className: 'room-garden',     label: 'the garden',     sound: 'garden' },
  watchlist:   { className: 'room-livingroom', label: 'the living room',sound: 'fireplace' },
  holidays:    { className: 'room-beach',      label: 'the beach',      sound: 'waves' },
};

// ── Ambient sound engine (Web Audio API, procedural) ────────────────────────

class AmbientSoundEngine {
  constructor() {
    this.ctx = null;
    this.current = null;
    this.nodes = [];
    this.masterGain = null;
    this.muted = false;
    this.targetVolume = 0.15;
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.targetVolume;
    this.masterGain.connect(this.ctx.destination);
  }

  stop() {
    this.nodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch {} });
    this.nodes = [];
    this.current = null;
  }

  fadeOut(duration = 0.8) {
    if (!this.masterGain) return;
    const g = this.masterGain.gain;
    g.cancelScheduledValues(this.ctx.currentTime);
    g.setValueAtTime(g.value, this.ctx.currentTime);
    g.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
    setTimeout(() => { this.stop(); g.value = this.targetVolume; }, duration * 1000 + 100);
  }

  play(type) {
    this.init();
    if (this.current === type) return;
    if (this.current) {
      this.fadeOut(0.6);
      setTimeout(() => this._startSound(type), 700);
    } else {
      this._startSound(type);
    }
  }

  _startSound(type) {
    this.current = type;
    if (this.muted) return;
    this.masterGain.gain.value = 0;
    this.masterGain.gain.linearRampToValueAtTime(this.targetVolume, this.ctx.currentTime + 1.5);

    switch (type) {
      case 'rain': this._rain(); break;
      case 'vinyl': this._vinyl(); break;
      case 'kitchen': this._kitchen(); break;
      case 'restaurant': this._restaurant(); break;
      case 'garden': this._garden(); break;
      case 'fireplace': this._fireplace(); break;
      case 'waves': this._waves(); break;
    }
  }

  _makeNoise(type = 'white') {
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 4, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    if (type === 'brown') {
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        const w = Math.random() * 2 - 1;
        data[i] = (last + (0.02 * w)) / 1.02;
        last = data[i];
      }
    } else {
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.start();
    this.nodes.push(src);
    return src;
  }

  _vinyl() {
    // Warm vinyl crackle — brown noise + high crackle pops
    const noise = this._makeNoise('brown');
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 400;
    const g = this.ctx.createGain();
    g.gain.value = 0.3;
    noise.connect(lp); lp.connect(g); g.connect(this.masterGain);
    this.nodes.push(lp, g);

    // Crackle pops
    const crackle = this._makeNoise('white');
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 5000;
    const cg = this.ctx.createGain();
    cg.gain.value = 0.04;
    crackle.connect(hp); hp.connect(cg); cg.connect(this.masterGain);
    this.nodes.push(hp, cg);

    // Subtle warm tone
    const osc = this.ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = 220;
    const oscG = this.ctx.createGain();
    oscG.gain.value = 0.008;
    const oscLfo = this.ctx.createOscillator();
    oscLfo.frequency.value = 0.08;
    const oscLfoG = this.ctx.createGain();
    oscLfoG.gain.value = 0.004;
    oscLfo.connect(oscLfoG); oscLfoG.connect(oscG.gain);
    osc.connect(oscG); oscG.connect(this.masterGain);
    osc.start(); oscLfo.start();
    this.nodes.push(osc, oscG, oscLfo, oscLfoG);
  }

  _rain() {
    // Filtered white noise = rain
    const noise = this._makeNoise('white');
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 800;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 6000;
    const g = this.ctx.createGain();
    g.gain.value = 0.6;
    noise.connect(hp); hp.connect(lp); lp.connect(g); g.connect(this.masterGain);
    this.nodes.push(hp, lp, g);

    // Occasional drip
    const dripLoop = () => {
      if (this.current !== 'rain') return;
      const osc = this.ctx.createOscillator();
      osc.frequency.value = 2000 + Math.random() * 2000;
      osc.type = 'sine';
      const eg = this.ctx.createGain();
      eg.gain.value = 0.03;
      eg.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      osc.connect(eg); eg.connect(this.masterGain);
      osc.start(); osc.stop(this.ctx.currentTime + 0.15);
      setTimeout(dripLoop, 2000 + Math.random() * 5000);
    };
    setTimeout(dripLoop, 3000);
  }

  _kitchen() {
    // Sizzle = filtered noise bursts
    const noise = this._makeNoise('white');
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 4000; bp.Q.value = 0.5;
    const g = this.ctx.createGain();
    g.gain.value = 0.15;
    noise.connect(bp); bp.connect(g); g.connect(this.masterGain);
    this.nodes.push(bp, g);

    // LFO to modulate volume (intermittent sizzle)
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.3;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.1;
    lfo.connect(lfoGain);
    lfoGain.connect(g.gain);
    lfo.start();
    this.nodes.push(lfo, lfoGain);
  }

  _restaurant() {
    // Low murmur = brown noise
    const noise = this._makeNoise('brown');
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 600;
    const g = this.ctx.createGain();
    g.gain.value = 0.5;
    noise.connect(lp); lp.connect(g); g.connect(this.masterGain);
    this.nodes.push(lp, g);
  }

  _garden() {
    // Gentle breeze = filtered noise
    const noise = this._makeNoise('white');
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 1200; bp.Q.value = 0.3;
    const g = this.ctx.createGain();
    g.gain.value = 0.12;
    noise.connect(bp); bp.connect(g); g.connect(this.masterGain);
    this.nodes.push(bp, g);

    // LFO for gusts
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.15;
    const lfoG = this.ctx.createGain();
    lfoG.gain.value = 0.08;
    lfo.connect(lfoG); lfoG.connect(g.gain);
    lfo.start();
    this.nodes.push(lfo, lfoG);

    // Bird chirps
    const chirpLoop = () => {
      if (this.current !== 'garden') return;
      const osc = this.ctx.createOscillator();
      const baseFreq = 2500 + Math.random() * 2000;
      osc.frequency.value = baseFreq;
      osc.frequency.linearRampToValueAtTime(baseFreq * 1.3, this.ctx.currentTime + 0.08);
      osc.frequency.linearRampToValueAtTime(baseFreq * 0.9, this.ctx.currentTime + 0.15);
      osc.type = 'sine';
      const eg = this.ctx.createGain();
      eg.gain.value = 0.02;
      eg.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      osc.connect(eg); eg.connect(this.masterGain);
      osc.start(); osc.stop(this.ctx.currentTime + 0.2);
      setTimeout(chirpLoop, 1500 + Math.random() * 6000);
    };
    setTimeout(chirpLoop, 2000);
  }

  _fireplace() {
    // Crackling = filtered noise with rapid modulation
    const noise = this._makeNoise('brown');
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 0.8;
    const g = this.ctx.createGain();
    g.gain.value = 0.3;
    noise.connect(bp); bp.connect(g); g.connect(this.masterGain);
    this.nodes.push(bp, g);

    // Crackle modulation
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 8;
    const lfoG = this.ctx.createGain();
    lfoG.gain.value = 0.2;
    lfo.connect(lfoG); lfoG.connect(g.gain);
    lfo.start();
    this.nodes.push(lfo, lfoG);

    // Low hum of fire
    const hum = this._makeNoise('brown');
    const humLp = this.ctx.createBiquadFilter();
    humLp.type = 'lowpass'; humLp.frequency.value = 200;
    const humG = this.ctx.createGain();
    humG.gain.value = 0.25;
    hum.connect(humLp); humLp.connect(humG); humG.connect(this.masterGain);
    this.nodes.push(humLp, humG);
  }

  _waves() {
    // Ocean = brown noise with slow LFO
    const noise = this._makeNoise('brown');
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 800;
    const g = this.ctx.createGain();
    g.gain.value = 0.5;
    noise.connect(lp); lp.connect(g); g.connect(this.masterGain);
    this.nodes.push(lp, g);

    // Slow wave rhythm
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.12;
    const lfoG = this.ctx.createGain();
    lfoG.gain.value = 0.3;
    lfo.connect(lfoG); lfoG.connect(g.gain);
    lfo.start();
    this.nodes.push(lfo, lfoG);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      if (this.masterGain) this.masterGain.gain.value = 0;
    } else {
      if (this.masterGain) this.masterGain.gain.value = this.targetVolume;
      if (this.current) { const c = this.current; this.stop(); this.play(c); }
    }
    return this.muted;
  }
}

const ambientEngine = new AmbientSoundEngine();

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
  const [transitioning, setTransitioning] = React.useState(false);
  const [displayedRoom, setDisplayedRoom] = React.useState(activeTab);
  const prevTab = React.useRef(activeTab);
  const [soundMuted, setSoundMuted] = React.useState(() => {
    try { return localStorage.getItem('together-sound-muted') === 'true'; } catch { return false; }
  });
  const soundStarted = React.useRef(false);

  // Start sound on first user interaction
  React.useEffect(() => {
    const startSound = () => {
      if (soundStarted.current) return;
      soundStarted.current = true;
      ambientEngine.muted = soundMuted;
      const cfg = ROOM_CONFIG[activeTab];
      if (cfg) ambientEngine.play(cfg.sound);
      document.removeEventListener('click', startSound);
      document.removeEventListener('keydown', startSound);
    };
    document.addEventListener('click', startSound);
    document.addEventListener('keydown', startSound);
    return () => {
      document.removeEventListener('click', startSound);
      document.removeEventListener('keydown', startSound);
    };
  }, []);

  // Room change — instant, no transition
  React.useEffect(() => {
    if (activeTab === prevTab.current) return;
    prevTab.current = activeTab;
    setDisplayedRoom(activeTab);
    const cfg = ROOM_CONFIG[activeTab];
    if (cfg && soundStarted.current) ambientEngine.play(cfg.sound);
  }, [activeTab]);

  const handleToggleSound = () => {
    const muted = ambientEngine.toggleMute();
    setSoundMuted(muted);
    try { localStorage.setItem('together-sound-muted', String(muted)); } catch {}
  };

  const roomCfg = ROOM_CONFIG[displayedRoom] || ROOM_CONFIG.home;
  const Deco = ROOM_DECORATIONS[displayedRoom];

  return (
    <div className={roomCfg.className}>
      <div className="room-atmosphere">
        {Deco && <Deco />}
      </div>
      <div className="room-label">{roomCfg.label}</div>
      <button className={`sound-toggle ${soundMuted ? 'muted' : ''}`}
        onClick={handleToggleSound}
        style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 10 }}
        title={soundMuted ? 'Unmute ambient sounds' : 'Mute ambient sounds'}>
        {soundMuted ? '🔇' : '🔊'}
      </button>
      {children}
    </div>
  );
}

Object.assign(window, { RoomProvider, ROOM_CONFIG, ambientEngine });
