import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const EXERCISES = {
  core: [
    {
      id: "dead-bug",
      title: "Dead Bug",
      target: "Deep Core (TVA) + Hip Flexors",
      why: "Activates the transverse abdominis — your internal 'weight belt' — while teaching your spine to stay neutral. Directly counteracts anterior pelvic tilt by strengthening the muscles that pull your pelvis back into alignment.",
      sets: "3 sets × 8 reps/side",
      youtubeId: "g_BYB0R-4Ws",
      hasSpringCounter: false,
      color: "#00D4AA",
    },
    {
      id: "stomach-vacuum",
      title: "Stomach Vacuum",
      target: "Transverse Abdominis (TVA)",
      why: "The most direct TVA isolation exercise known. A strong TVA cinches your waist, reduces the 'false belly' bloat caused by weak core compression, and dramatically reduces lower back load by stabilizing L4–L5.",
      sets: "5 × 20-second holds",
      youtubeId: "KZrGQ8YPpbY",
      hasSpringCounter: false,
      isVacuum: true,
      color: "#FF6B35",
    },
    {
      id: "bird-dog",
      title: "Bird-Dog",
      target: "Erector Spinae + Glutes + TVA",
      why: "Trains spinal extension stability without compressive load. Simultaneously activates glutes and contralateral erectors — the exact pattern needed to correct APT, where weak glutes and erectors allow the pelvis to tip forward.",
      sets: "3 sets × 10 reps/side",
      youtubeId: "wiFNA3sqjCA",
      hasSpringCounter: false,
      color: "#A78BFA",
    },
    {
      id: "glute-bridge",
      title: "Glute Bridge",
      target: "Glutes + Hamstrings + Lumbar",
      why: "Directly targets the gluteus maximus — chronically inhibited in APT sufferers due to prolonged sitting. Restores the hip extension strength needed to pull the pelvis into posterior tilt and decompress the lumbar spine.",
      sets: "3 sets × 15 reps",
      youtubeId: "OUgsJ8-Vi0E",
      hasSpringCounter: false,
      color: "#F59E0B",
    },
  ],
  upper: [
    {
      id: "chest-pull",
      title: "Chest Expander Pull",
      target: "Rhomboids + Rear Deltoids + Mid Traps",
      why: "The foundational posture corrector. Directly strengthens the scapular retractors — the muscles that pull your shoulders back. Counteracts the forward-rounded posture from desk work and phone use that collapses the chest and tightens pecs.",
      sets: "4 sets × 15 reps",
      youtubeId: "dQw4w9WgXcQ",
      hasSpringCounter: true,
      color: "#00D4AA",
    },
    {
      id: "face-pull",
      title: "Face Pull (Expander)",
      target: "Rear Deltoids + External Rotators + Upper Traps",
      why: "Targets the posterior deltoid and infraspinatus. These muscles are almost always weak in people with APT and forward head posture. Face pulls restore shoulder external rotation — the key to pain-free pressing movements.",
      sets: "4 sets × 20 reps",
      youtubeId: "V8dZ3pyiCBo",
      hasSpringCounter: true,
      color: "#FF6B35",
    },
    {
      id: "overhead-press",
      title: "Overhead Press (Expander)",
      target: "Anterior Deltoids + Triceps + Serratus Anterior",
      why: "Builds vertical pushing strength without a barbell. The serratus anterior — activated during full overhead lock-out — is critical for scapular upward rotation, preventing shoulder impingement as you build strength.",
      sets: "3 sets × 12 reps",
      youtubeId: "M2rwvNhTdu4",
      hasSpringCounter: true,
      color: "#A78BFA",
    },
    {
      id: "bicep-curl",
      title: "Bicep Curl (Expander)",
      target: "Biceps Brachii + Brachialis + Forearms",
      why: "Constant tension through the full ROM — unlike free weights, the expander maintains peak load at full contraction. The long head of the biceps also assists in shoulder flexion, contributing to postural balance around the glenohumeral joint.",
      sets: "3 sets × 12 reps",
      youtubeId: "ykJmrZ5v0Oo",
      hasSpringCounter: true,
      color: "#F59E0B",
    },
  ],
};

const ALL_EXERCISE_IDS = [...EXERCISES.core, ...EXERCISES.upper].map((e) => e.id);

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function loadStorage() {
  try {
    const today = getTodayKey();
    const raw = localStorage.getItem("posture_power_v2");
    const data = raw ? JSON.parse(raw) : {};
    if (data.date !== today) {
      return {
        date: today,
        completed: {},
        springs: data.springs || {},
        streak: calculateStreak(data),
        lastCompletedDate: data.lastCompletedDate || null,
      };
    }
    return data;
  } catch {
    return { date: getTodayKey(), completed: {}, springs: {}, streak: 0, lastCompletedDate: null };
  }
}

function calculateStreak(data) {
  if (!data.lastCompletedDate) return data.streak || 0;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = yesterday.toISOString().split("T")[0];
  if (data.lastCompletedDate === yKey || data.lastCompletedDate === getTodayKey()) {
    return data.streak || 0;
  }
  return 0;
}

function saveStorage(state) {
  try {
    localStorage.setItem("posture_power_v2", JSON.stringify(state));
  } catch {}
}

// ─── VACUUM TIMER ─────────────────────────────────────────────────────────────

function VacuumTimer() {
  const [active, setActive] = useState(false);
  const [time, setTime] = useState(20);
  const [phase, setPhase] = useState("idle"); // idle | inhale | hold | exhale | done
  const intervalRef = useRef(null);

  const TOTAL = 20;

  useEffect(() => {
    if (active && time > 0) {
      intervalRef.current = setInterval(() => setTime((t) => t - 1), 1000);
    } else if (time === 0) {
      setPhase("done");
      setActive(false);
    }
    return () => clearInterval(intervalRef.current);
  }, [active, time]);

  useEffect(() => {
    if (!active) return;
    if (time > 17) setPhase("inhale");
    else if (time > 0) setPhase("hold");
  }, [time, active]);

  const start = () => {
    setTime(TOTAL);
    setPhase("inhale");
    setActive(true);
  };

  const reset = () => {
    setActive(false);
    setTime(TOTAL);
    setPhase("idle");
  };

  const progress = ((TOTAL - time) / TOTAL) * 100;
  const circumference = 2 * Math.PI * 54;
  const strokeDash = (progress / 100) * circumference;

  const phaseColors = { idle: "#4B5563", inhale: "#00D4AA", hold: "#FF6B35", exhale: "#A78BFA", done: "#00D4AA" };
  const phaseLabels = { idle: "Ready", inhale: "Breathe Out & Pull In", hold: "HOLD THE VACUUM", exhale: "Release", done: "Complete! 🔥" };

  return (
    <div className="vacuum-timer-card">
      <div className="vacuum-header">
        <span className="vacuum-icon">🫁</span>
        <div>
          <h3 className="vacuum-title">Vacuum Hold Timer</h3>
          <p className="vacuum-sub">20-second morning routine</p>
        </div>
      </div>

      <div className="vacuum-ring-container">
        <svg viewBox="0 0 120 120" className="vacuum-svg">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#1F2937" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={phaseColors[phase]}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${strokeDash} ${circumference}`}
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dasharray 1s linear, stroke 0.3s ease" }}
          />
        </svg>
        <div className="vacuum-center">
          <div className="vacuum-time" style={{ color: phaseColors[phase] }}>{time}</div>
          <div className="vacuum-unit">sec</div>
        </div>
      </div>

      <div className="vacuum-phase-label" style={{ color: phaseColors[phase] }}>
        {phaseLabels[phase]}
      </div>

      <div className="vacuum-btn-row">
        {!active && phase !== "done" && (
          <button className="vac-btn vac-btn-start" onClick={start}>
            {phase === "idle" ? "▶ Start Hold" : "▶ Resume"}
          </button>
        )}
        {active && (
          <button className="vac-btn vac-btn-pause" onClick={() => setActive(false)}>⏸ Pause</button>
        )}
        <button className="vac-btn vac-btn-reset" onClick={reset}>↺ Reset</button>
      </div>

      <div className="vacuum-steps">
        <div className="vacuum-step"><span className="step-dot" style={{ background: "#00D4AA" }} />Exhale fully & draw navel to spine</div>
        <div className="vacuum-step"><span className="step-dot" style={{ background: "#FF6B35" }} />Hold without breathing for 20s</div>
        <div className="vacuum-step"><span className="step-dot" style={{ background: "#A78BFA" }} />Slowly release & inhale</div>
      </div>
    </div>
  );
}

// ─── SPRING COUNTER ───────────────────────────────────────────────────────────

function SpringCounter({ exerciseId, value, onChange }) {
  return (
    <div className="spring-counter">
      <span className="spring-label">🌀 Springs Today</span>
      <div className="spring-controls">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            className={`spring-btn ${value === n ? "active" : ""}`}
            onClick={() => onChange(exerciseId, n)}
          >
            {n}
          </button>
        ))}
      </div>
      <span className="spring-hint">{value ? `${value} spring${value > 1 ? "s" : ""} logged` : "Tap to log"}</span>
    </div>
  );
}

// ─── EXERCISE CARD ────────────────────────────────────────────────────────────

function ExerciseCard({ exercise, completed, springs, onToggle, onSpringChange }) {
  const [expanded, setExpanded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className={`exercise-card ${completed ? "completed" : ""}`} style={{ "--card-accent": exercise.color }}>
      <div className="card-header" onClick={() => setExpanded(!expanded)}>
        <div className="card-left">
          <button
            className={`check-btn ${completed ? "checked" : ""}`}
            onClick={(e) => { e.stopPropagation(); onToggle(exercise.id); }}
            style={{ "--btn-color": exercise.color }}
          >
            {completed ? "✓" : ""}
          </button>
          <div className="card-info">
            <h3 className="card-title" style={{ color: completed ? "#6B7280" : "#F9FAFB" }}>
              {exercise.title}
            </h3>
            <span className="card-target">{exercise.target}</span>
          </div>
        </div>
        <div className="card-right">
          <span className="card-sets">{exercise.sets}</span>
          <span className="card-chevron">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div className="card-body">
          <div className="why-box">
            <span className="why-label">⚡ WHY IT MATTERS</span>
            <p className="why-text">{exercise.why}</p>
          </div>

          {exercise.isVacuum && <VacuumTimer />}

          <div className="video-section">
            {!showVideo ? (
              <button className="video-thumb" onClick={() => setShowVideo(true)}>
                <div className="yt-placeholder">
                  <div className="yt-play">▶</div>
                  <span>Watch Demo</span>
                </div>
              </button>
            ) : (
              <div className="video-embed">
                <iframe
                  src={`https://www.youtube.com/embed/${exercise.youtubeId}?autoplay=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={exercise.title}
                />
              </div>
            )}
          </div>

          {exercise.hasSpringCounter && (
            <SpringCounter
              exerciseId={exercise.id}
              value={springs[exercise.id] || 0}
              onChange={onSpringChange}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────

function ProgressBar({ value, max, color }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="progress-track">
      <div
        className="progress-fill"
        style={{ width: `${pct}%`, background: color, transition: "width 0.5s cubic-bezier(.4,0,.2,1)" }}
      />
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function Dashboard({ storage }) {
  const coreTotal = EXERCISES.core.length;
  const upperTotal = EXERCISES.upper.length;
  const coreDone = EXERCISES.core.filter((e) => storage.completed[e.id]).length;
  const upperDone = EXERCISES.upper.filter((e) => storage.completed[e.id]).length;
  const totalDone = coreDone + upperDone;
  const totalAll = coreTotal + upperTotal;

  return (
    <div className="dashboard">
      <div className="dash-stat-row">
        <div className="dash-stat">
          <div className="dash-stat-val" style={{ color: "#FF6B35" }}>{storage.streak}</div>
          <div className="dash-stat-label">Day Streak 🔥</div>
        </div>
        <div className="dash-stat center-stat">
          <div className="dash-big-ring">
            <svg viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#1F2937" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="34"
                fill="none"
                stroke={totalDone === totalAll ? "#00D4AA" : "#A78BFA"}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${(totalDone / totalAll) * 213.6} 213.6`}
                transform="rotate(-90 40 40)"
                style={{ transition: "stroke-dasharray 0.5s ease" }}
              />
            </svg>
            <div className="ring-label">
              <span className="ring-num">{totalDone}</span>
              <span className="ring-denom">/{totalAll}</span>
            </div>
          </div>
          <div className="dash-stat-label">Today's Progress</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-val" style={{ color: "#00D4AA" }}>{totalAll - totalDone}</div>
          <div className="dash-stat-label">Remaining</div>
        </div>
      </div>

      <div className="module-bars">
        <div className="module-bar-item">
          <div className="module-bar-label">
            <span>Core & Posture</span>
            <span style={{ color: "#00D4AA" }}>{coreDone}/{coreTotal}</span>
          </div>
          <ProgressBar value={coreDone} max={coreTotal} color="#00D4AA" />
        </div>
        <div className="module-bar-item">
          <div className="module-bar-label">
            <span>Upper Body Power</span>
            <span style={{ color: "#A78BFA" }}>{upperDone}/{upperTotal}</span>
          </div>
          <ProgressBar value={upperDone} max={upperTotal} color="#A78BFA" />
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [storage, setStorage] = useState(() => loadStorage());
  const [activeTab, setActiveTab] = useState("core");

  const updateStorage = useCallback((newData) => {
    setStorage(newData);
    saveStorage(newData);
  }, []);

  const handleToggle = useCallback((id) => {
    setStorage((prev) => {
      const completed = { ...prev.completed, [id]: !prev.completed[id] };
      const allDone = ALL_EXERCISE_IDS.every((eid) => completed[eid]);
      const today = getTodayKey();

      let streak = prev.streak;
      let lastCompletedDate = prev.lastCompletedDate;

      if (allDone && lastCompletedDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = yesterday.toISOString().split("T")[0];
        streak = (lastCompletedDate === yKey ? streak : 0) + 1;
        lastCompletedDate = today;
      }

      const next = { ...prev, completed, streak, lastCompletedDate };
      saveStorage(next);
      return next;
    });
  }, []);

  const handleSpringChange = useCallback((id, val) => {
    setStorage((prev) => {
      const next = { ...prev, springs: { ...prev.springs, [id]: val } };
      saveStorage(next);
      return next;
    });
  }, []);

  const currentExercises = EXERCISES[activeTab];

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* Header */}
        <header className="app-header">
          <div className="header-inner">
            <div className="logo-block">
              <div className="logo-icon">⚡</div>
              <div>
                <h1 className="logo-title">POSTURE<span>&</span>POWER</h1>
                <p className="logo-sub">APT Correction · Back Pain Relief · Chest Expander</p>
              </div>
            </div>
            <div className="header-date">{new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</div>
          </div>
        </header>

        <main className="app-main">
          {/* Dashboard */}
          <Dashboard storage={storage} />

          {/* Module Tabs */}
          <div className="tabs">
            <button className={`tab-btn ${activeTab === "core" ? "active" : ""}`} onClick={() => setActiveTab("core")}>
              <span className="tab-icon">🎯</span> Core & Posture
            </button>
            <button className={`tab-btn ${activeTab === "upper" ? "active" : ""}`} onClick={() => setActiveTab("upper")}>
              <span className="tab-icon">💪</span> Upper Body Power
            </button>
          </div>

          {/* Module Description */}
          <div className="module-desc">
            {activeTab === "core" ? (
              <><strong>Core & Posture</strong> — Fix anterior pelvic tilt, eliminate lower back pain, and build the foundation your spine deserves.</>
            ) : (
              <><strong>Upper Body Power</strong> — Chest expander movements to build real strength while correcting forward head posture and rounded shoulders.</>
            )}
          </div>

          {/* Exercise List */}
          <div className="exercise-list">
            {currentExercises.map((ex) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                completed={!!storage.completed[ex.id]}
                springs={storage.springs}
                onToggle={handleToggle}
                onSpringChange={handleSpringChange}
              />
            ))}
          </div>

          {/* Reset */}
          <button className="reset-btn" onClick={() => {
            const fresh = { date: getTodayKey(), completed: {}, springs: storage.springs, streak: storage.streak, lastCompletedDate: storage.lastCompletedDate };
            updateStorage(fresh);
          }}>
            ↺ Reset Today's Session
          </button>
        </main>
      </div>
    </>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0A0D12;
    --surface: #111827;
    --surface2: #1A2332;
    --surface3: #1F2D3D;
    --border: #1E2D3D;
    --text: #F9FAFB;
    --text2: #9CA3AF;
    --text3: #6B7280;
    --green: #00D4AA;
    --orange: #FF6B35;
    --purple: #A78BFA;
    --yellow: #F59E0B;
    --font-display: 'Barlow Condensed', sans-serif;
    --font-mono: 'DM Mono', monospace;
    --font-body: 'DM Sans', sans-serif;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); min-height: 100vh; }

  .app { max-width: 680px; margin: 0 auto; padding-bottom: 3rem; }

  /* HEADER */
  .app-header {
    background: linear-gradient(135deg, #0D1117 0%, #111827 100%);
    border-bottom: 1px solid var(--border);
    padding: 1.2rem 1.5rem;
    position: sticky; top: 0; z-index: 50;
    backdrop-filter: blur(10px);
  }
  .header-inner { display: flex; align-items: center; justify-content: space-between; }
  .logo-block { display: flex; align-items: center; gap: 0.75rem; }
  .logo-icon { font-size: 1.8rem; filter: drop-shadow(0 0 8px #FF6B35); }
  .logo-title {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    line-height: 1;
    text-transform: uppercase;
  }
  .logo-title span { color: var(--orange); margin: 0 0.1em; }
  .logo-sub { font-size: 0.68rem; color: var(--text3); font-family: var(--font-mono); letter-spacing: 0.04em; margin-top: 2px; }
  .header-date { font-family: var(--font-mono); font-size: 0.75rem; color: var(--text3); }

  /* MAIN */
  .app-main { padding: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem; }

  /* DASHBOARD */
  .dashboard {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.25rem;
  }
  .dash-stat-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem; }
  .dash-stat { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
  .dash-stat-val { font-family: var(--font-display); font-size: 2.5rem; font-weight: 800; line-height: 1; }
  .dash-stat-label { font-size: 0.7rem; color: var(--text3); font-family: var(--font-mono); text-align: center; }
  .center-stat { align-items: center; }
  .dash-big-ring { position: relative; width: 80px; height: 80px; }
  .dash-big-ring svg { width: 100%; height: 100%; }
  .ring-label { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
  .ring-num { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; }
  .ring-denom { font-family: var(--font-mono); font-size: 0.75rem; color: var(--text3); }

  .module-bars { display: flex; flex-direction: column; gap: 0.65rem; }
  .module-bar-item { display: flex; flex-direction: column; gap: 0.3rem; }
  .module-bar-label { display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text2); font-family: var(--font-mono); }
  .progress-track { height: 6px; background: var(--border); border-radius: 999px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 999px; }

  /* TABS */
  .tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
  .tab-btn {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text2);
    border-radius: 10px;
    padding: 0.75rem 1rem;
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    display: flex; align-items: center; gap: 0.5rem; justify-content: center;
  }
  .tab-btn:hover { border-color: var(--purple); color: var(--text); }
  .tab-btn.active {
    background: linear-gradient(135deg, #1A2332, #1F2D3D);
    border-color: var(--purple);
    color: var(--text);
    box-shadow: 0 0 20px rgba(167,139,250,0.15);
  }
  .tab-icon { font-size: 1rem; }

  .module-desc {
    font-size: 0.82rem;
    color: var(--text3);
    padding: 0.75rem 1rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    line-height: 1.5;
  }
  .module-desc strong { color: var(--text2); }

  /* EXERCISE LIST */
  .exercise-list { display: flex; flex-direction: column; gap: 0.75rem; }

  /* EXERCISE CARD */
  .exercise-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-left: 3px solid var(--card-accent, var(--green));
    border-radius: 12px;
    overflow: hidden;
    transition: box-shadow 0.2s;
  }
  .exercise-card.completed { opacity: 0.7; }
  .exercise-card:hover { box-shadow: 0 0 24px rgba(0,212,170,0.08); }

  .card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.9rem 1rem;
    cursor: pointer;
    gap: 0.75rem;
  }
  .card-left { display: flex; align-items: center; gap: 0.75rem; flex: 1; min-width: 0; }
  .card-right { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }

  .check-btn {
    width: 32px; height: 32px;
    border-radius: 8px;
    border: 2px solid var(--btn-color, var(--green));
    background: transparent;
    color: var(--btn-color);
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.15s;
    display: flex; align-items: center; justify-content: center;
  }
  .check-btn.checked { background: var(--btn-color); color: #000; }
  .check-btn:hover { transform: scale(1.1); }

  .card-info { min-width: 0; }
  .card-title { font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; letter-spacing: 0.03em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .card-target { font-size: 0.7rem; color: var(--text3); font-family: var(--font-mono); }
  .card-sets { font-size: 0.7rem; color: var(--text3); font-family: var(--font-mono); white-space: nowrap; }
  .card-chevron { font-size: 0.65rem; color: var(--text3); }

  .card-body { padding: 0 1rem 1rem; display: flex; flex-direction: column; gap: 1rem; }

  .why-box {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.85rem;
  }
  .why-label { display: block; font-family: var(--font-mono); font-size: 0.65rem; color: var(--text3); letter-spacing: 0.1em; margin-bottom: 0.4rem; }
  .why-text { font-size: 0.82rem; color: var(--text2); line-height: 1.6; }

  /* VIDEO */
  .video-section { width: 100%; }
  .video-thumb {
    width: 100%; background: var(--surface3);
    border: 1px dashed var(--border);
    border-radius: 10px;
    height: 120px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
  }
  .video-thumb:hover { border-color: var(--orange); background: #1A1F2E; }
  .yt-placeholder { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
  .yt-play {
    width: 44px; height: 44px; background: #FF0000;
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 1rem; color: white; padding-left: 3px;
  }
  .yt-placeholder span { font-size: 0.78rem; color: var(--text3); font-family: var(--font-mono); }
  .video-embed { border-radius: 10px; overflow: hidden; aspect-ratio: 16/9; }
  .video-embed iframe { width: 100%; height: 100%; border: none; }

  /* SPRING COUNTER */
  .spring-counter {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 0.85rem;
    display: flex; flex-direction: column; gap: 0.5rem;
  }
  .spring-label { font-family: var(--font-mono); font-size: 0.72rem; color: var(--text2); }
  .spring-controls { display: flex; gap: 0.5rem; }
  .spring-btn {
    flex: 1; height: 38px;
    background: var(--surface3);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text3);
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
  }
  .spring-btn:hover { border-color: var(--green); color: var(--green); }
  .spring-btn.active { background: var(--green); border-color: var(--green); color: #000; }
  .spring-hint { font-size: 0.68rem; color: var(--text3); font-family: var(--font-mono); }

  /* VACUUM TIMER */
  .vacuum-timer-card {
    background: var(--surface2);
    border: 1px solid #FF6B3530;
    border-radius: 12px;
    padding: 1rem;
    display: flex; flex-direction: column; gap: 0.85rem;
  }
  .vacuum-header { display: flex; align-items: center; gap: 0.75rem; }
  .vacuum-icon { font-size: 1.75rem; }
  .vacuum-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; }
  .vacuum-sub { font-size: 0.7rem; color: var(--text3); font-family: var(--font-mono); }

  .vacuum-ring-container { position: relative; width: 120px; height: 120px; align-self: center; }
  .vacuum-svg { width: 100%; height: 100%; }
  .vacuum-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .vacuum-time { font-family: var(--font-display); font-size: 2.25rem; font-weight: 800; line-height: 1; }
  .vacuum-unit { font-family: var(--font-mono); font-size: 0.65rem; color: var(--text3); }

  .vacuum-phase-label { text-align: center; font-family: var(--font-display); font-size: 1rem; font-weight: 700; letter-spacing: 0.05em; min-height: 1.4rem; }

  .vacuum-btn-row { display: flex; gap: 0.5rem; }
  .vac-btn {
    flex: 1; padding: 0.6rem 1rem;
    border-radius: 8px;
    border: none; cursor: pointer;
    font-family: var(--font-display); font-size: 0.95rem; font-weight: 700;
    transition: all 0.15s;
  }
  .vac-btn-start { background: var(--orange); color: #000; }
  .vac-btn-start:hover { background: #FF8455; }
  .vac-btn-pause { background: #374151; color: var(--text); }
  .vac-btn-reset { background: var(--surface3); color: var(--text2); border: 1px solid var(--border); flex: 0.5; }
  .vac-btn-reset:hover { border-color: var(--text3); }

  .vacuum-steps { display: flex; flex-direction: column; gap: 0.35rem; }
  .vacuum-step { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--text3); }
  .step-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

  /* RESET */
  .reset-btn {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text3);
    border-radius: 8px;
    padding: 0.6rem 1rem;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    cursor: pointer;
    align-self: center;
    transition: all 0.15s;
  }
  .reset-btn:hover { border-color: var(--text2); color: var(--text2); }

  @media (max-width: 420px) {
    .logo-title { font-size: 1.2rem; }
    .logo-sub { display: none; }
    .dash-stat-val { font-size: 2rem; }
    .spring-btn { height: 34px; }
  }
`;
