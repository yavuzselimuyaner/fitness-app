import { useState, useEffect, useRef, useCallback } from "react";

// ─── i18n ─────────────────────────────────────────────────────────────────────
const T = {
  en: {
    appTitle: "POSTURE & POWER",
    appSub: "APT Correction · Chest Expander · Home Training",
    nav: { dashboard: "Dashboard", program: "Program", calendar: "Calendar", photos: "Progress", badges: "Badges" },
    dashboard: { streak: "Day Streak", today: "Today", remaining: "Left", core: "Core & Posture", upper: "Upper Body", reset: "Reset Today" },
    program: { day1: "Day 1 — Pull & Core", day2: "Day 2 — Push & Stability", addExercise: "+ Add Exercise", sets: "Sets", reps: "Reps", springs: "Springs", whyLabel: "WHY IT MATTERS", watchDemo: "Watch Demo", vacuumTitle: "Vacuum Hold Timer", vacuumSub: "20-second morning routine", breatheOut: "Breathe Out & Draw Navel In", holdVacuum: "HOLD THE VACUUM", release: "Release", ready: "Ready", complete: "Complete! 🔥", start: "▶ Start", pause: "⏸ Pause", resetBtn: "↺ Reset", springsToday: "🌀 Springs Today", tapToLog: "Tap to log", logged: "springs logged" },
    calendar: { title: "Training Calendar", completed: "Completed", missed: "Missed", rest: "Rest", completionRate: "Completion Rate", thisMonth: "This Month" },
    photos: { title: "Progress Photos", upload: "Upload Today's Photo", uploadHint: "Tap to select photo", compare: "Compare", noPhoto: "No photo yet", today: "Today", previous: "Previous" },
    badges: { title: "Achievements", locked: "Locked", earned: "Earned" },
    addModal: { title: "Add Exercise", name: "Exercise Name", target: "Target Muscle", sets: "Sets", reps: "Reps", why: "Why it matters", save: "Save", cancel: "Cancel" },
    vacuumSteps: ["Exhale fully & draw navel to spine", "Hold without breathing for 20s", "Slowly release & inhale"],
  },
  tr: {
    appTitle: "DURUŞ & GÜÇ",
    appSub: "APT Düzeltme · Göğüs Genişletici · Ev Antremanı",
    nav: { dashboard: "Panel", program: "Program", calendar: "Takvim", photos: "İlerleme", badges: "Rozetler" },
    dashboard: { streak: "Gün Serisi", today: "Bugün", remaining: "Kaldı", core: "Çekirdek & Duruş", upper: "Üst Vücut", reset: "Bugünü Sıfırla" },
    program: { day1: "Gün 1 — Çekiş & Çekirdek", day2: "Gün 2 — İtiş & Denge", addExercise: "+ Egzersiz Ekle", sets: "Set", reps: "Tekrar", springs: "Yay", whyLabel: "NEDEN ÖNEMLİ", watchDemo: "Demo İzle", vacuumTitle: "Vakum Tutma Sayacı", vacuumSub: "20 saniyelik sabah rutini", breatheOut: "Nefes Ver & Göbeği İçe Çek", holdVacuum: "VAKUMU TUT", release: "Bırak", ready: "Hazır", complete: "Tamamlandı! 🔥", start: "▶ Başla", pause: "⏸ Duraklat", resetBtn: "↺ Sıfırla", springsToday: "🌀 Bugünkü Yay", tapToLog: "Kaydetmek için tıkla", logged: "yay kaydedildi" },
    calendar: { title: "Antrenman Takvimi", completed: "Tamamlandı", missed: "Kaçırıldı", rest: "Dinlenme", completionRate: "Tamamlanma Oranı", thisMonth: "Bu Ay" },
    photos: { title: "İlerleme Fotoğrafları", upload: "Bugünkü Fotoğrafı Yükle", uploadHint: "Fotoğraf seçmek için tıkla", compare: "Karşılaştır", noPhoto: "Henüz fotoğraf yok", today: "Bugün", previous: "Önceki" },
    badges: { title: "Başarılar", locked: "Kilitli", earned: "Kazanıldı" },
    addModal: { title: "Egzersiz Ekle", name: "Egzersiz Adı", target: "Hedef Kas", sets: "Set", reps: "Tekrar", why: "Neden önemli", save: "Kaydet", cancel: "İptal" },
    vacuumSteps: ["Tamamen nefes ver, göbeği omurgaya doğru çek", "20 saniye nefes almadan tut", "Yavaşça bırak ve nefes al"],
  },
};

const DEFAULT_PROGRAM = {
  day1: [
    { id: "chest-pull", title: { en: "Chest Expander Pull", tr: "Göğüs Genişletici Çekiş" }, target: { en: "Rhomboids + Rear Delts + Mid Traps", tr: "Romboidler + Arka Deltoid + Orta Trapez" }, why: { en: "Directly strengthens scapular retractors — the muscles that pull your shoulders back and fix forward-rounded posture.", tr: "Kürek kemiği geri çekicilerini güçlendirir — omuzları geriye çeken ve öne eğik duruşu düzelten kaslar." }, sets: 4, reps: 15, youtubeId: "dQw4w9WgXcQ", hasSpring: true, color: "#00D4AA", isDefault: true },
    { id: "face-pull", title: { en: "Face Pull", tr: "Yüz Çekişi" }, target: { en: "Rear Delts + External Rotators", tr: "Arka Deltoid + Dış Rotatorlar" }, why: { en: "Restores shoulder external rotation — essential for pain-free pressing and fixing rounded shoulders.", tr: "Omuz dış rotasyonunu geri kazandırır — ağrısız itme hareketleri ve yuvarlak omuzları düzeltmek için şart." }, sets: 4, reps: 20, youtubeId: "V8dZ3pyiCBo", hasSpring: true, color: "#FF6B35", isDefault: true },
    { id: "dead-bug", title: { en: "Dead Bug", tr: "Ölü Böcek" }, target: { en: "Deep Core (TVA) + Hip Flexors", tr: "Derin Çekirdek (TVA) + Kalça Fleksörleri" }, why: { en: "Activates the transverse abdominis — your internal weight belt — while keeping the spine neutral against APT.", tr: "Transversus abdominis'i aktive eder — omurgayı nötral tutarak APT'ye karşı iç korset görevi görür." }, sets: 3, reps: 8, youtubeId: "g_BYB0R-4Ws", hasSpring: false, color: "#A78BFA", isDefault: true },
    { id: "stomach-vacuum", title: { en: "Stomach Vacuum", tr: "Mide Vakumu" }, target: { en: "Transverse Abdominis (TVA)", tr: "Transversus Abdominis (TVA)" }, why: { en: "The most direct TVA isolation. Reduces false belly bloat and dramatically lowers lumbar load at L4-L5.", tr: "En doğrudan TVA izolasyonu. Sahte karın şişliğini azaltır ve L4-L5 bel yükünü dramatik şekilde düşürür." }, sets: 5, reps: 1, youtubeId: "KZrGQ8YPpbY", hasSpring: false, color: "#F59E0B", isVacuum: true, isDefault: true },
  ],
  day2: [
    { id: "overhead-press", title: { en: "Overhead Press", tr: "Baş Üstü Pres" }, target: { en: "Anterior Delts + Triceps + Serratus", tr: "Ön Deltoid + Triseps + Serratus" }, why: { en: "Builds vertical push strength. Serratus anterior activation during lockout prevents shoulder impingement.", tr: "Dikey itme gücü inşa eder. Kilit noktasında serratus anterior aktivasyonu omuz sıkışmasını önler." }, sets: 3, reps: 12, youtubeId: "M2rwvNhTdu4", hasSpring: true, color: "#00D4AA", isDefault: true },
    { id: "bicep-curl", title: { en: "Bicep Curl", tr: "Biceps Kıvırma" }, target: { en: "Biceps + Brachialis + Forearms", tr: "Biceps + Brachialis + Önkol" }, why: { en: "Constant tension through full ROM. Unlike free weights, the expander maintains peak load at full contraction.", tr: "Tam hareket boyunca sabit gerilim. Serbest ağırlıkların aksine, genişletici tam kasılmada zirve yükü korur." }, sets: 3, reps: 12, youtubeId: "ykJmrZ5v0Oo", hasSpring: true, color: "#FF6B35", isDefault: true },
    { id: "bird-dog", title: { en: "Bird-Dog", tr: "Kuş-Köpek" }, target: { en: "Erector Spinae + Glutes + TVA", tr: "Erektör Spina + Gluteus + TVA" }, why: { en: "Trains spinal extension stability without compression. Activates glutes and erectors to correct APT.", tr: "Kompresyon olmadan omurga uzanma stabilitesini eğitir. Gluteus ve erektörleri aktive ederek APT'yi düzeltir." }, sets: 3, reps: 10, youtubeId: "wiFNA3sqjCA", hasSpring: false, color: "#A78BFA", isDefault: true },
    { id: "glute-bridge", title: { en: "Glute Bridge", tr: "Gluteus Köprüsü" }, target: { en: "Glutes + Hamstrings + Lumbar", tr: "Gluteus + Hamstring + Bel" }, why: { en: "Directly targets gluteus maximus — chronically inhibited in APT. Restores hip extension to decompress the lumbar spine.", tr: "APT'de kronik olarak inhibe olan gluteus maximusu doğrudan hedefler. Beli dekomprese eder." }, sets: 3, reps: 15, youtubeId: "OUgsJ8-Vi0E", hasSpring: false, color: "#F59E0B", isDefault: true },
  ],
};

const BADGE_DEFS = [
  { id: "first-day", icon: "🌱", en: "First Step", tr: "İlk Adım", descEn: "Complete your first workout", descTr: "İlk antremanını tamamla", check: (s) => s.totalCompleted >= 1 },
  { id: "week-streak", icon: "🔥", en: "Week Warrior", tr: "Hafta Savaşçısı", descEn: "7-day streak", descTr: "7 günlük seri", check: (s) => s.streak >= 7 },
  { id: "month-streak", icon: "💎", en: "Iron Will", tr: "Demir İrade", descEn: "30-day streak", descTr: "30 günlük seri", check: (s) => s.streak >= 30 },
  { id: "photo-first", icon: "📸", en: "Photographer", tr: "Fotoğrafçı", descEn: "Upload your first progress photo", descTr: "İlk ilerleme fotoğrafını yükle", check: (s) => s.photoCount >= 1 },
  { id: "photo-week", icon: "🎞️", en: "Chronicler", tr: "Kayıt Tutucusu", descEn: "Upload 7 progress photos", descTr: "7 ilerleme fotoğrafı yükle", check: (s) => s.photoCount >= 7 },
  { id: "ten-days", icon: "⚡", en: "Momentum", tr: "Momentum", descEn: "Complete 10 total workouts", descTr: "10 antremanı tamamla", check: (s) => s.totalCompleted >= 10 },
  { id: "custom-ex", icon: "✏️", en: "Creator", tr: "Yaratıcı", descEn: "Add a custom exercise", descTr: "Özel egzersiz ekle", check: (s) => s.customExCount >= 1 },
  { id: "both-days", icon: "🏆", en: "Full Program", tr: "Tam Program", descEn: "Complete both Day 1 and Day 2", descTr: "Hem Gün 1 hem Gün 2'yi tamamla", check: (s) => s.completedDay1 && s.completedDay2 },
];

function getTodayKey() { return new Date().toISOString().split("T")[0]; }

function getInitialData() {
  return { lang: "en", streak: 0, lastDate: null, totalCompleted: 0, completedDay1: false, completedDay2: false, completed: {}, springs: {}, program: DEFAULT_PROGRAM, calendarLog: {}, photos: {}, earnedBadges: [], photoCount: 0, customExCount: 0 };
}

function loadData() {
  try { const raw = localStorage.getItem("pp_v3"); return raw ? JSON.parse(raw) : getInitialData(); }
  catch { return getInitialData(); }
}

function save(data) { try { localStorage.setItem("pp_v3", JSON.stringify(data)); } catch {} }

// ─── VACUUM TIMER ─────────────────────────────────────────────────────────────
function VacuumTimer({ t }) {
  const [active, setActive] = useState(false);
  const [time, setTime] = useState(20);
  const [phase, setPhase] = useState("idle");
  const ref = useRef(null);
  const TOTAL = 20;

  useEffect(() => {
    if (active && time > 0) { ref.current = setInterval(() => setTime(p => p - 1), 1000); }
    else if (time === 0) { setPhase("complete"); setActive(false); }
    return () => clearInterval(ref.current);
  }, [active, time]);

  useEffect(() => { if (!active) return; setPhase(time > 17 ? "breatheOut" : "hold"); }, [time, active]);

  const start = () => { setTime(TOTAL); setPhase("breatheOut"); setActive(true); };
  const reset = () => { setActive(false); setTime(TOTAL); setPhase("idle"); clearInterval(ref.current); };

  const C = 2 * Math.PI * 54;
  const pct = ((TOTAL - time) / TOTAL) * 100;
  const colors = { idle: "#4B5563", breatheOut: "#00D4AA", hold: "#FF6B35", complete: "#00D4AA" };
  const labels = { idle: t.program.ready, breatheOut: t.program.breatheOut, hold: t.program.holdVacuum, complete: t.program.complete };

  return (
    <div style={{ background: "#0D1117", border: "1px solid #FF6B3530", borderRadius: 12, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "1.75rem" }}>🫁</span>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.05rem" }}>{t.program.vacuumTitle}</div>
          <div style={{ fontSize: "0.68rem", color: "#6B7280", fontFamily: "monospace" }}>{t.program.vacuumSub}</div>
        </div>
      </div>
      <div style={{ position: "relative", width: 110, height: 110, alignSelf: "center" }}>
        <svg viewBox="0 0 120 120" style={{ width: "100%", height: "100%" }}>
          <circle cx="60" cy="60" r="54" fill="none" stroke="#1F2937" strokeWidth="8" />
          <circle cx="60" cy="60" r="54" fill="none" stroke={colors[phase]} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * C} ${C}`} transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dasharray 1s linear, stroke 0.3s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "2.2rem", color: colors[phase], lineHeight: 1 }}>{time}</span>
          <span style={{ fontSize: "0.6rem", color: "#6B7280", fontFamily: "monospace" }}>sec</span>
        </div>
      </div>
      <div style={{ textAlign: "center", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: colors[phase], minHeight: "1.2rem" }}>{labels[phase]}</div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {!active && phase !== "complete" && <button onClick={start} style={{ flex: 1, padding: "0.55rem", background: "#FF6B35", border: "none", borderRadius: 8, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#000", cursor: "pointer" }}>{t.program.start}</button>}
        {active && <button onClick={() => setActive(false)} style={{ flex: 1, padding: "0.55rem", background: "#374151", border: "none", borderRadius: 8, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#fff", cursor: "pointer" }}>{t.program.pause}</button>}
        <button onClick={reset} style={{ padding: "0.55rem 0.85rem", background: "#1F2937", border: "1px solid #374151", borderRadius: 8, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#9CA3AF", cursor: "pointer" }}>{t.program.resetBtn}</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        {t.vacuumSteps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.72rem", color: "#6B7280" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: ["#00D4AA", "#FF6B35", "#A78BFA"][i], flexShrink: 0, display: "inline-block" }} />{s}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── EXERCISE CARD ────────────────────────────────────────────────────────────
function ExerciseCard({ ex, lang, t, completed, springs, onToggle, onSpring, onDelete }) {
  const [open, setOpen] = useState(false);
  const [video, setVideo] = useState(false);
  const title = typeof ex.title === "object" ? ex.title[lang] : ex.title;
  const target = typeof ex.target === "object" ? ex.target[lang] : ex.target;
  const why = typeof ex.why === "object" ? ex.why[lang] : ex.why;

  return (
    <div style={{ background: "#111827", border: "1px solid #1E2D3D", borderLeft: `3px solid ${ex.color}`, borderRadius: 12, overflow: "hidden", opacity: completed ? 0.72 : 1, transition: "opacity 0.2s" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem 1rem", cursor: "pointer", gap: "0.75rem" }} onClick={() => setOpen(o => !o)}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flex: 1, minWidth: 0 }}>
          <button onClick={e => { e.stopPropagation(); onToggle(ex.id); }}
            style={{ width: 30, height: 30, borderRadius: 7, border: `2px solid ${ex.color}`, background: completed ? ex.color : "transparent", color: completed ? "#000" : ex.color, fontWeight: 800, fontSize: "0.95rem", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
            {completed ? "✓" : ""}
          </button>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1rem", color: completed ? "#6B7280" : "#F9FAFB", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
            <div style={{ fontSize: "0.68rem", color: "#6B7280", fontFamily: "monospace" }}>{target}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
          <span style={{ fontSize: "0.68rem", color: "#6B7280", fontFamily: "monospace" }}>{ex.sets}×{ex.reps}</span>
          {!ex.isDefault && <button onClick={e => { e.stopPropagation(); onDelete(ex.id); }} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", fontSize: "0.8rem", padding: "0 2px" }}>✕</button>}
          <span style={{ fontSize: "0.6rem", color: "#4B5563" }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>
      {open && (
        <div style={{ padding: "0 1rem 1rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <div style={{ background: "#1A2332", border: "1px solid #1E2D3D", borderRadius: 8, padding: "0.75rem" }}>
            <div style={{ fontSize: "0.62rem", color: "#6B7280", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: "0.35rem" }}>⚡ {t.program.whyLabel}</div>
            <div style={{ fontSize: "0.8rem", color: "#9CA3AF", lineHeight: 1.6 }}>{why}</div>
          </div>
          {ex.isVacuum && <VacuumTimer t={t} />}
          <div>
            {!video ? (
              <button onClick={() => setVideo(true)} style={{ width: "100%", background: "#1A2332", border: "1px dashed #1E2D3D", borderRadius: 10, height: 100, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                <div style={{ width: 40, height: 40, background: "#FF0000", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.9rem", paddingLeft: 3 }}>▶</div>
                <span style={{ fontSize: "0.72rem", color: "#6B7280", fontFamily: "monospace" }}>{t.program.watchDemo}</span>
              </button>
            ) : (
              <div style={{ borderRadius: 10, overflow: "hidden", aspectRatio: "16/9" }}>
                <iframe src={`https://www.youtube.com/embed/${ex.youtubeId}?autoplay=1`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={title} style={{ width: "100%", height: "100%", border: "none" }} />
              </div>
            )}
          </div>
          {ex.hasSpring && (
            <div style={{ background: "#1A2332", border: "1px solid #1E2D3D", borderRadius: 10, padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              <span style={{ fontSize: "0.72rem", color: "#9CA3AF", fontFamily: "monospace" }}>{t.program.springsToday}</span>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => onSpring(ex.id, n)}
                    style={{ flex: 1, height: 36, background: springs[ex.id] === n ? ex.color : "#1F2937", border: `1px solid ${springs[ex.id] === n ? ex.color : "#374151"}`, borderRadius: 7, color: springs[ex.id] === n ? "#000" : "#9CA3AF", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1rem", cursor: "pointer", transition: "all 0.15s" }}>{n}</button>
                ))}
              </div>
              <span style={{ fontSize: "0.65rem", color: "#6B7280", fontFamily: "monospace" }}>
                {springs[ex.id] ? `${springs[ex.id]} ${t.program.logged}` : t.program.tapToLog}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ADD MODAL ────────────────────────────────────────────────────────────────
function AddModal({ t, onSave, onClose }) {
  const [form, setForm] = useState({ name: "", target: "", sets: 3, reps: 12, why: "" });
  const colors = ["#00D4AA", "#FF6B35", "#A78BFA", "#F59E0B", "#60A5FA", "#F472B6"];
  const [color, setColor] = useState(colors[0]);

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({ id: "custom_" + Date.now(), title: { en: form.name, tr: form.name }, target: { en: form.target, tr: form.target }, why: { en: form.why, tr: form.why }, sets: Number(form.sets), reps: Number(form.reps), youtubeId: "dQw4w9WgXcQ", hasSpring: true, color, isDefault: false });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: "#111827", border: "1px solid #1E2D3D", borderRadius: "16px 16px 0 0", padding: "1.5rem", width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "1.3rem" }}>{t.addModal.title}</div>
        {[["name", t.addModal.name], ["target", t.addModal.target], ["why", t.addModal.why]].map(([k, label]) => (
          <div key={k}>
            <div style={{ fontSize: "0.68rem", color: "#6B7280", fontFamily: "monospace", marginBottom: "0.3rem" }}>{label}</div>
            <input value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
              style={{ width: "100%", background: "#1A2332", border: "1px solid #1E2D3D", borderRadius: 8, padding: "0.6rem 0.75rem", color: "#F9FAFB", fontSize: "0.85rem", outline: "none", fontFamily: "'DM Sans',sans-serif" }} />
          </div>
        ))}
        <div style={{ display: "flex", gap: "1rem" }}>
          {[["sets", t.addModal.sets], ["reps", t.addModal.reps]].map(([k, label]) => (
            <div key={k} style={{ flex: 1 }}>
              <div style={{ fontSize: "0.68rem", color: "#6B7280", fontFamily: "monospace", marginBottom: "0.3rem" }}>{label}</div>
              <input type="number" value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                style={{ width: "100%", background: "#1A2332", border: "1px solid #1E2D3D", borderRadius: 8, padding: "0.6rem 0.75rem", color: "#F9FAFB", fontSize: "0.85rem", outline: "none", fontFamily: "'DM Sans',sans-serif" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {colors.map(c => <button key={c} onClick={() => setColor(c)} style={{ width: 26, height: 26, borderRadius: "50%", background: c, border: color === c ? "3px solid #fff" : "2px solid transparent", cursor: "pointer" }} />)}
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "0.7rem", background: "#1A2332", border: "1px solid #1E2D3D", borderRadius: 8, color: "#9CA3AF", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>{t.addModal.cancel}</button>
          <button onClick={handleSave} style={{ flex: 2, padding: "0.7rem", background: "#00D4AA", border: "none", borderRadius: 8, color: "#000", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "1rem", cursor: "pointer" }}>{t.addModal.save}</button>
        </div>
      </div>
    </div>
  );
}

// ─── CALENDAR VIEW ────────────────────────────────────────────────────────────
function CalendarView({ t, lang, calendarLog }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const completed = Object.values(calendarLog).filter(v => v === "done").length;
  const total = Object.keys(calendarLog).length;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
  const monthName = today.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { month: "long", year: "numeric" });

  return (
    <div style={{ background: "#111827", border: "1px solid #1E2D3D", borderRadius: 16, padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.1rem", textTransform: "capitalize" }}>{monthName}</div>
        <div style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#00D4AA" }}>{rate}% {t.calendar.completionRate}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.25rem", marginBottom: "0.4rem" }}>
        {["S","M","T","W","T","F","S"].map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: "0.58rem", color: "#6B7280", fontFamily: "monospace", padding: "0.15rem 0" }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.25rem" }}>
        {Array.from({ length: firstDay }).map((_, i) => <div key={"e" + i} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const isToday = d === today.getDate();
          const status = calendarLog[key];
          let bg = "#1A2332", col = "#6B7280", border = "1px solid #1E2D3D";
          if (status === "done") { bg = "#00D4AA20"; col = "#00D4AA"; border = "1px solid #00D4AA40"; }
          if (isToday) border = "2px solid #A78BFA";
          return (
            <div key={d} style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", background: bg, border, borderRadius: 6, fontSize: "0.7rem", fontFamily: "monospace", color: col, fontWeight: isToday ? 700 : 400 }}>{d}</div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem" }}>
        {[["#00D4AA", t.calendar.completed], ["#4B5563", t.calendar.rest]].map(([c, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.62rem", color: "#6B7280", fontFamily: "monospace" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block" }} />{label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PHOTOS VIEW ──────────────────────────────────────────────────────────────
function PhotosView({ t, photos, onUpload }) {
  const today = getTodayKey();
  const fileRef = useRef();
  const sortedDates = Object.keys(photos).sort((a, b) => b.localeCompare(a));
  const todayPhoto = photos[today];
  const prevPhoto = sortedDates.find(d => d !== today);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpload(today, ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ background: "#111827", border: "1px solid #1E2D3D", borderRadius: 16, padding: "1.25rem" }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        <button onClick={() => fileRef.current.click()}
          style={{ width: "100%", background: todayPhoto ? "transparent" : "#1A2332", border: todayPhoto ? "none" : "2px dashed #374151", borderRadius: 12, padding: todayPhoto ? 0 : "2rem 1rem", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", overflow: "hidden" }}>
          {todayPhoto ? (
            <div style={{ position: "relative", width: "100%" }}>
              <img src={todayPhoto} alt="today" style={{ width: "100%", borderRadius: 12, display: "block", maxHeight: 320, objectFit: "cover" }} />
              <div style={{ position: "absolute", top: 8, left: 8, background: "#00D4AA", color: "#000", fontSize: "0.62rem", fontFamily: "monospace", fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>{t.photos.today}</div>
              <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.7)", color: "#9CA3AF", fontSize: "0.62rem", fontFamily: "monospace", padding: "3px 8px", borderRadius: 20 }}>tap to change</div>
            </div>
          ) : (
            <>
              <span style={{ fontSize: "2.5rem" }}>📸</span>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, color: "#9CA3AF", fontSize: "1rem" }}>{t.photos.upload}</span>
              <span style={{ fontSize: "0.72rem", color: "#6B7280", fontFamily: "monospace" }}>{t.photos.uploadHint}</span>
            </>
          )}
        </button>
      </div>

      {prevPhoto && todayPhoto && (
        <div style={{ background: "#111827", border: "1px solid #1E2D3D", borderRadius: 16, padding: "1.25rem" }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: "0.75rem" }}>{t.photos.compare}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {[[photos[prevPhoto], t.photos.previous + " · " + prevPhoto], [todayPhoto, t.photos.today + " · " + today]].map(([src, label]) => (
              <div key={label}>
                <img src={src} alt={label} style={{ width: "100%", borderRadius: 10, display: "block", aspectRatio: "3/4", objectFit: "cover" }} />
                <div style={{ fontSize: "0.6rem", color: "#6B7280", fontFamily: "monospace", marginTop: "0.3rem", textAlign: "center" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sortedDates.length > 0 && (
        <div style={{ background: "#111827", border: "1px solid #1E2D3D", borderRadius: 16, padding: "1.25rem" }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: "0.75rem" }}>All Photos ({sortedDates.length})</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.4rem" }}>
            {sortedDates.map(d => (
              <div key={d} style={{ position: "relative" }}>
                <img src={photos[d]} alt={d} style={{ width: "100%", borderRadius: 8, display: "block", aspectRatio: "1", objectFit: "cover" }} />
                <div style={{ position: "absolute", bottom: 3, left: 3, right: 3, fontSize: "0.52rem", color: "#fff", fontFamily: "monospace", background: "rgba(0,0,0,0.65)", padding: "2px 4px", borderRadius: 4, textAlign: "center" }}>{d.slice(5)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BADGES VIEW ──────────────────────────────────────────────────────────────
function BadgesView({ t, lang, data }) {
  const stats = { streak: data.streak, totalCompleted: data.totalCompleted, photoCount: data.photoCount, customExCount: data.customExCount, completedDay1: data.completedDay1, completedDay2: data.completedDay2 };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
      {BADGE_DEFS.map(b => {
        const earned = b.check(stats);
        return (
          <div key={b.id} style={{ background: "#111827", border: `1px solid ${earned ? "#00D4AA40" : "#1E2D3D"}`, borderRadius: 14, padding: "1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", opacity: earned ? 1 : 0.45, transition: "all 0.3s", boxShadow: earned ? "0 0 20px #00D4AA10" : "none" }}>
            <span style={{ fontSize: "2rem", filter: earned ? "none" : "grayscale(1)" }}>{b.icon}</span>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.9rem", textAlign: "center", color: earned ? "#F9FAFB" : "#6B7280" }}>{lang === "tr" ? b.tr : b.en}</div>
            <div style={{ fontSize: "0.62rem", color: "#6B7280", fontFamily: "monospace", textAlign: "center", lineHeight: 1.4 }}>{lang === "tr" ? b.descTr : b.descEn}</div>
            {earned && <span style={{ fontSize: "0.58rem", color: "#00D4AA", fontFamily: "monospace", background: "#00D4AA15", padding: "2px 8px", borderRadius: 20 }}>{t.badges.earned} ✓</span>}
          </div>
        );
      })}
    </div>
  );
}

// ─── DASHBOARD VIEW ───────────────────────────────────────────────────────────
function DashboardView({ t, data }) {
  const today = getTodayKey();
  const dayOfWeek = new Date().getDay();
  const activeDay = dayOfWeek % 2 === 0 ? "day2" : "day1";
  const exercises = data.program[activeDay];
  const done = exercises.filter(e => data.completed[today]?.[e.id]).length;
  const total = exercises.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const C = 2 * Math.PI * 40;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ background: "#111827", border: "1px solid #1E2D3D", borderRadius: 16, padding: "1.25rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "2.5rem", fontWeight: 800, color: "#FF6B35", lineHeight: 1 }}>{data.streak}</div>
            <div style={{ fontSize: "0.62rem", color: "#6B7280", fontFamily: "monospace", textAlign: "center" }}>🔥 {t.dashboard.streak}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
            <div style={{ position: "relative", width: 84, height: 84 }}>
              <svg viewBox="0 0 88 88" style={{ width: "100%", height: "100%" }}>
                <circle cx="44" cy="44" r="40" fill="none" stroke="#1F2937" strokeWidth="6" />
                <circle cx="44" cy="44" r="40" fill="none" stroke={pct === 100 ? "#00D4AA" : "#A78BFA"} strokeWidth="6"
                  strokeLinecap="round" strokeDasharray={`${(pct / 100) * C} ${C}`} transform="rotate(-90 44 44)"
                  style={{ transition: "stroke-dasharray 0.5s ease" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "1.5rem", lineHeight: 1 }}>{done}<span style={{ fontSize: "0.8rem", color: "#6B7280" }}>/{total}</span></span>
              </div>
            </div>
            <div style={{ fontSize: "0.62rem", color: "#6B7280", fontFamily: "monospace" }}>{t.dashboard.today}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "2.5rem", fontWeight: 800, color: "#00D4AA", lineHeight: 1 }}>{data.totalCompleted}</div>
            <div style={{ fontSize: "0.62rem", color: "#6B7280", fontFamily: "monospace", textAlign: "center" }}>✓ Total</div>
          </div>
        </div>
        <div style={{ background: "#1A2332", borderRadius: 8, height: 5, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#00D4AA" : "#A78BFA", borderRadius: 8, transition: "width 0.5s ease" }} />
        </div>
        <div style={{ marginTop: "0.5rem", fontSize: "0.65rem", color: "#6B7280", fontFamily: "monospace", textAlign: "center" }}>
          {activeDay === "day1" ? t.program.day1 : t.program.day2}
        </div>
      </div>

      <div style={{ background: "#111827", border: "1px solid #1E2D3D", borderRadius: 16, padding: "1.25rem" }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: "0.75rem" }}>Today's Exercises</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {exercises.map(ex => {
            const isDone = !!data.completed[today]?.[ex.id];
            const title = typeof ex.title === "object" ? ex.title.en : ex.title;
            return (
              <div key={ex.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0.75rem", background: "#1A2332", borderRadius: 8, opacity: isDone ? 0.6 : 1 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: ex.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: "0.82rem", color: isDone ? "#6B7280" : "#F9FAFB", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 600, textDecoration: isDone ? "line-through" : "none" }}>{title}</span>
                <span style={{ fontSize: "0.65rem", color: "#6B7280", fontFamily: "monospace" }}>{ex.sets}×{ex.reps}</span>
                {isDone && <span style={{ fontSize: "0.75rem", color: "#00D4AA" }}>✓</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── PROGRAM VIEW ─────────────────────────────────────────────────────────────
function ProgramView({ t, lang, data, onToggle, onSpring, onAddEx, onDeleteEx }) {
  const [activeDay, setActiveDay] = useState("day1");
  const [showModal, setShowModal] = useState(false);
  const today = getTodayKey();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
        {["day1", "day2"].map(d => (
          <button key={d} onClick={() => setActiveDay(d)}
            style={{ background: activeDay === d ? "#1A2332" : "#111827", border: `1px solid ${activeDay === d ? "#A78BFA" : "#1E2D3D"}`, borderRadius: 10, padding: "0.7rem", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.85rem", color: activeDay === d ? "#F9FAFB" : "#6B7280", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.04em", transition: "all 0.2s" }}>
            {d === "day1" ? t.program.day1 : t.program.day2}
          </button>
        ))}
      </div>

      {data.program[activeDay].map(ex => (
        <ExerciseCard key={ex.id} ex={ex} lang={lang} t={t}
          completed={!!data.completed[today]?.[ex.id]}
          springs={data.springs[today] || {}}
          onToggle={(id) => onToggle(activeDay, id)}
          onSpring={(id, val) => onSpring(today, id, val)}
          onDelete={(id) => onDeleteEx(activeDay, id)} />
      ))}

      <button onClick={() => setShowModal(true)}
        style={{ background: "transparent", border: "2px dashed #1E2D3D", borderRadius: 12, padding: "0.85rem", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#4B5563", cursor: "pointer", letterSpacing: "0.05em" }}>
        {t.program.addExercise}
      </button>

      {showModal && <AddModal t={t} onSave={(ex) => { onAddEx(activeDay, ex); setShowModal(false); }} onClose={() => setShowModal(false)} />}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(() => loadData());
  const [tab, setTab] = useState("dashboard");
  const lang = data.lang;
  const t = T[lang];

  const update = useCallback((fn) => {
    setData(prev => { const next = fn(prev); save(next); return next; });
  }, []);

  const handleToggle = (day, id) => {
    const today = getTodayKey();
    update(prev => {
      const todayMap = { ...(prev.completed[today] || {}) };
      todayMap[id] = !todayMap[id];
      const completed = { ...prev.completed, [today]: todayMap };

      const allIds = [...prev.program.day1, ...prev.program.day2].map(e => e.id);
      const allDone = allIds.every(eid => completed[today]?.[eid]);
      const day1Done = prev.program.day1.every(e => completed[today]?.[e.id]);
      const day2Done = prev.program.day2.every(e => completed[today]?.[e.id]);

      let { streak, totalCompleted, calendarLog, lastDate } = prev;
      calendarLog = { ...calendarLog };

      if (allDone && calendarLog[today] !== "done") {
        calendarLog[today] = "done";
        totalCompleted += 1;
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        const yKey = yesterday.toISOString().split("T")[0];
        streak = (lastDate === yKey || lastDate === today) ? streak + 1 : 1;
        lastDate = today;
      }

      const next = { ...prev, completed, streak, totalCompleted, calendarLog, lastDate, completedDay1: day1Done, completedDay2: day2Done };
      const stats = { streak: next.streak, totalCompleted: next.totalCompleted, photoCount: next.photoCount, customExCount: next.customExCount, completedDay1: next.completedDay1, completedDay2: next.completedDay2 };
      const newBadges = BADGE_DEFS.filter(b => b.check(stats) && !next.earnedBadges.includes(b.id)).map(b => b.id);
      return { ...next, earnedBadges: [...next.earnedBadges, ...newBadges] };
    });
  };

  const handleSpring = (date, id, val) => update(prev => ({ ...prev, springs: { ...prev.springs, [date]: { ...(prev.springs[date] || {}), [id]: val } } }));
  const handleAddEx = (day, ex) => update(prev => ({ ...prev, program: { ...prev.program, [day]: [...prev.program[day], ex] }, customExCount: prev.customExCount + 1 }));
  const handleDeleteEx = (day, id) => update(prev => ({ ...prev, program: { ...prev.program, [day]: prev.program[day].filter(e => e.id !== id) } }));
  const handlePhoto = (date, src) => update(prev => {
    const photos = { ...prev.photos, [date]: src };
    const photoCount = Object.keys(photos).length;
    const stats = { streak: prev.streak, totalCompleted: prev.totalCompleted, photoCount, customExCount: prev.customExCount, completedDay1: prev.completedDay1, completedDay2: prev.completedDay2 };
    const newBadges = BADGE_DEFS.filter(b => b.check(stats) && !prev.earnedBadges.includes(b.id)).map(b => b.id);
    return { ...prev, photos, photoCount, earnedBadges: [...prev.earnedBadges, ...newBadges] };
  });

  const navItems = [
    { id: "dashboard", icon: "⚡", label: t.nav.dashboard },
    { id: "program", icon: "📋", label: t.nav.program },
    { id: "calendar", icon: "📅", label: t.nav.calendar },
    { id: "photos", icon: "📸", label: t.nav.photos },
    { id: "badges", icon: "🏆", label: t.nav.badges },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0D12; color: #F9FAFB; font-family: 'DM Sans', sans-serif; min-height: 100vh; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0A0D12; }
        ::-webkit-scrollbar-thumb { background: #1E2D3D; border-radius: 4px; }
        input { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: "5rem" }}>
        <div style={{ background: "#0D1117", borderBottom: "1px solid #1E2D3D", padding: "1rem 1.25rem", position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.6rem", filter: "drop-shadow(0 0 8px #FF6B35)" }}>⚡</span>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "1.3rem", letterSpacing: "0.06em", lineHeight: 1 }}>{t.appTitle}</div>
              <div style={{ fontSize: "0.58rem", color: "#6B7280", fontFamily: "monospace", letterSpacing: "0.04em" }}>{t.appSub}</div>
            </div>
          </div>
          <button onClick={() => update(p => ({ ...p, lang: p.lang === "en" ? "tr" : "en" }))}
            style={{ background: "#111827", border: "1px solid #1E2D3D", borderRadius: 8, padding: "0.4rem 0.75rem", fontFamily: "monospace", fontSize: "0.78rem", color: "#9CA3AF", cursor: "pointer", fontWeight: 600 }}>
            {lang === "en" ? "🇹🇷 TR" : "🇬🇧 EN"}
          </button>
        </div>

        <div style={{ padding: "1.25rem" }}>
          {tab === "dashboard" && <DashboardView t={t} data={data} />}
          {tab === "program" && <ProgramView t={t} lang={lang} data={data} onToggle={handleToggle} onSpring={handleSpring} onAddEx={handleAddEx} onDeleteEx={handleDeleteEx} />}
          {tab === "calendar" && <CalendarView t={t} lang={lang} calendarLog={data.calendarLog} />}
          {tab === "photos" && <PhotosView t={t} photos={data.photos} onUpload={handlePhoto} />}
          {tab === "badges" && <BadgesView t={t} lang={lang} data={data} />}
        </div>

        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#0D1117", borderTop: "1px solid #1E2D3D", display: "flex", zIndex: 100 }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)}
              style={{ flex: 1, padding: "0.65rem 0.25rem 0.75rem", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", borderTop: tab === n.id ? "2px solid #A78BFA" : "2px solid transparent", transition: "all 0.15s" }}>
              <span style={{ fontSize: "1.1rem" }}>{n.icon}</span>
              <span style={{ fontSize: "0.52rem", fontFamily: "monospace", color: tab === n.id ? "#A78BFA" : "#4B5563", letterSpacing: "0.04em" }}>{n.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}