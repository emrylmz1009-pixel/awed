import { useState, useEffect, useRef } from "react";

// ─── Storage ──────────────────────────────────────────────────────────────────
async function storageGet(key) {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; }
  catch { return null; }
}
async function storageSet(key, val) {
  try { await window.storage.set(key, JSON.stringify(val)); } catch {}
}

// ─── API Helper ───────────────────────────────────────────────────────────────
async function askClaude(messages, systemPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    })
  });
  const data = await res.json();
  return data.content?.map(c => c.text || "").join("") || "Yanıt alınamadı.";
}

// ─── Particles ────────────────────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  w: Math.random() * 4 + 2, h: Math.random() * 4 + 2,
  r: 180 + Math.random() * 75, g: 100 + Math.random() * 80, b: 40 + Math.random() * 60,
  o: 0.3 + Math.random() * 0.4, l: Math.random() * 100, t: Math.random() * 100,
  dur: 6 + Math.random() * 10, del: Math.random() * 8,
}));
function Particles() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {PARTICLES.map((p, i) => (
        <div key={i} style={{
          position: "absolute", width: p.w, height: p.h, borderRadius: "50%",
          background: `rgba(${p.r},${p.g},${p.b},${p.o})`,
          left: p.l + "%", top: p.t + "%",
          animation: `float ${p.dur}s ease-in-out infinite`, animationDelay: p.del + "s",
        }} />
      ))}
    </div>
  );
}

// ─── Steam Cup ────────────────────────────────────────────────────────────────
function SteamCup({ size = 80 }) {
  return (
    <div style={{ position: "relative", display: "inline-block", width: size, height: size * 1.3 }}>
      <svg width={size} height={size} viewBox="0 0 80 80" style={{ position: "absolute", bottom: 0 }}>
        <ellipse cx="40" cy="62" rx="28" ry="6" fill="rgba(101,67,33,0.3)" />
        <path d="M15 45 Q15 62 40 62 Q65 62 65 45 L60 28 Q50 25 40 25 Q30 25 20 28 Z" fill="#3d1c02" stroke="#5a2d0c" strokeWidth="1.5"/>
        <ellipse cx="40" cy="28" rx="20" ry="6" fill="#2a1200" stroke="#5a2d0c" strokeWidth="1.5"/>
        <ellipse cx="40" cy="28" rx="16" ry="4.5" fill="#1a0800" opacity="0.8"/>
        <path d="M65 38 Q75 38 75 44 Q75 50 65 50" fill="none" stroke="#5a2d0c" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 4, height: 20, borderRadius: 4,
            background: "linear-gradient(to top, rgba(200,180,160,0.8), transparent)",
            animation: "steam 2s ease-out infinite", animationDelay: i * 0.4 + "s",
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Input Style ──────────────────────────────────────────────────────────────
const inp = {
  width: "100%", padding: "12px 16px", borderRadius: 10, boxSizing: "border-box",
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(200,150,80,0.25)",
  color: "#f0d9b5", fontSize: 15, outline: "none", fontFamily: "inherit", transition: "border 0.2s",
};
function focusIn(e) { e.target.style.border = "1px solid rgba(200,150,80,0.7)"; }
function focusOut(e) { e.target.style.border = "1px solid rgba(200,150,80,0.25)"; }

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "rgba(18,9,3,0.88)", border: "1px solid rgba(180,120,40,0.28)",
      borderRadius: 20, padding: "24px 20px",
      boxShadow: "0 16px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(200,150,80,0.08)",
      backdropFilter: "blur(10px)", ...style
    }}>
      {children}
    </div>
  );
}

// ─── Btn ──────────────────────────────────────────────────────────────────────
function Btn({ children, onClick, disabled, style = {}, variant = "gold" }) {
  const base = {
    border: "none", borderRadius: 12, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'Cinzel', serif", letterSpacing: 1, transition: "all 0.25s",
    fontSize: 14, padding: "11px 20px",
  };
  const vars = {
    gold: { background: disabled ? "rgba(60,30,10,0.4)" : "linear-gradient(135deg,#6b3410,#c8902a,#6b3410)", color: disabled ? "#605040" : "#fff3d6", boxShadow: disabled ? "none" : "0 4px 18px rgba(200,144,42,0.28)" },
    ghost: { background: "transparent", border: "1px solid rgba(180,120,40,0.35)", color: "#c8902a" },
    danger: { background: "transparent", border: "1px solid rgba(180,80,40,0.3)", color: "#a07850" },
  };
  return <button onClick={disabled ? undefined : onClick} style={{ ...base, ...vars[variant], ...style }}>{children}</button>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════════
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [pass, setPass] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);

  async function submit() {
    setError(""); setLoading(true);
    if (!email || !pass) { setError("E-posta ve şifre gerekli."); setLoading(false); return; }
    if (mode === "register") {
      if (!name) { setError("İsim gerekli."); setLoading(false); return; }
      if (await storageGet("user:" + email)) { setError("Bu e-posta zaten kayıtlı."); setLoading(false); return; }
      const u = { name, email, pass, createdAt: Date.now() };
      await storageSet("user:" + email, u); onAuth(u);
    } else {
      const u = await storageGet("user:" + email);
      if (!u || u.pass !== pass) { setError("E-posta veya şifre hatalı."); setLoading(false); return; }
      onAuth(u);
    }
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 20 }}>
      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <SteamCup size={65} />
        <h1 style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 26, color: "#c8902a", margin: "14px 0 4px", letterSpacing: 2 }}>Kahve Falı</h1>
        <p style={{ color: "#806040", fontSize: 12, letterSpacing: 1 }}>✦ Kaderin fincanında saklı ✦</p>
      </div>
      <Card style={{ width: "100%", maxWidth: 390 }}>
        <div style={{ display: "flex", marginBottom: 24, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 3 }}>
          {[["login","Giriş Yap"],["register","Kayıt Ol"]].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
              flex: 1, padding: "8px 0", borderRadius: 8, border: "none",
              background: mode === m ? "linear-gradient(135deg,#8b4513,#c8902a)" : "transparent",
              color: mode === m ? "#fff" : "#907060", cursor: "pointer", fontSize: 13, fontFamily: "'Cinzel',serif", transition: "all 0.25s"
            }}>{label}</button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "register" && <input placeholder="İsminiz" value={name} onChange={e => setName(e.target.value)} style={inp} onFocus={focusIn} onBlur={focusOut} />}
          <input placeholder="E-posta" type="email" value={email} onChange={e => setEmail(e.target.value)} style={inp} onFocus={focusIn} onBlur={focusOut} />
          <input placeholder="Şifre" type="password" value={pass} onChange={e => setPass(e.target.value)} style={inp} onFocus={focusIn} onBlur={focusOut} onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        {error && <p style={{ color: "#e07070", fontSize: 13, textAlign: "center", marginTop: 10 }}>{error}</p>}
        <Btn onClick={submit} disabled={loading} style={{ marginTop: 20, width: "100%", fontSize: 15, padding: "13px 0" }}>
          {loading ? "..." : mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
        </Btn>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOTTOM NAV
// ═══════════════════════════════════════════════════════════════════════════════
function BottomNav({ screen, setScreen }) {
  const tabs = [
    { id: "coffee", icon: "☕", label: "Kahve" },
    { id: "palm",   icon: "🖐", label: "El Falı" },
    { id: "chat",   icon: "💬", label: "Falcı" },
    { id: "history",icon: "📜", label: "Geçmiş" },
    { id: "profile",icon: "👤", label: "Profil" },
  ];
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(10,4,1,0.97)", borderTop: "1px solid rgba(180,120,40,0.2)",
      display: "flex", justifyContent: "space-around", padding: "8px 4px 12px",
      backdropFilter: "blur(16px)",
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setScreen(t.id)} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          background: "none", border: "none", cursor: "pointer",
          color: screen === t.id ? "#c8902a" : "#504030",
          transition: "color 0.2s", padding: "4px 8px",
          transform: screen === t.id ? "translateY(-2px)" : "none",
        }}>
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          <span style={{ fontSize: 10, fontFamily: "'Cinzel',serif", letterSpacing: 0.5 }}>{t.label}</span>
          {screen === t.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#c8902a", marginTop: -2 }} />}
        </button>
      ))}
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED: IMAGE UPLOAD + READING CARD
// ═══════════════════════════════════════════════════════════════════════════════
function ImageReadingCard({ title, icon, placeholder, prompt, historyType, user, onSaved }) {
  const [question, setQuestion] = useState("");
  const [image, setImage] = useState(null);
  const [imageB64, setImageB64] = useState(null);
  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const fileRef = useRef();

  const loadingMsgs = [
    "Yıldızlar konuşuyor...", "Kaderin izleri okunuyor...",
    "Mistik enerji toplanıyor...", "Ruhlar çağrılıyor...", "Gizem açılıyor..."
  ];
  useEffect(() => {
    if (!loading) return;
    let i = 0;
    setLoadingMsg(loadingMsgs[0]);
    const iv = setInterval(() => { i = (i+1) % loadingMsgs.length; setLoadingMsg(loadingMsgs[i]); }, 2000);
    return () => clearInterval(iv);
  }, [loading]);

  function handleFile(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setImage(ev.target.result); setImageB64(ev.target.result.split(",")[1]); setReading(""); };
    reader.readAsDataURL(file);
  }

  async function read() {
    if (!imageB64) return;
    setLoading(true); setReading("");
    try {
      const fullPrompt = typeof prompt === "function" ? prompt(question) : prompt;
      const text = await askClaude([{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageB64 } },
          { type: "text", text: fullPrompt }
        ]
      }], "Sen deneyimli, gizemli bir Türk falcısısın. Her zaman Türkçe yanıt verirsin.");

      setReading(text);
      const histKey = `history:${user.email}`;
      const hist = (await storageGet(histKey)) || [];
      hist.unshift({
        id: Date.now(), type: historyType,
        date: new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        question: question || title,
        reading: text, imageB64,
      });
      await storageSet(histKey, hist.slice(0, 30));
      if (onSaved) onSaved();
    } catch { setReading("Bağlantı hatası oluştu."); }
    setLoading(false);
  }

  return (
    <div>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 28 }}>{icon}</span>
          <div>
            <h2 style={{ fontFamily: "'Cinzel Decorative',serif", color: "#c8902a", margin: 0, fontSize: 17 }}>{title}</h2>
            <p style={{ color: "#706050", fontSize: 12, margin: "3px 0 0" }}>{placeholder}</p>
          </div>
        </div>

        {/* Upload */}
        <div onClick={() => fileRef.current.click()} style={{
          border: `2px dashed ${image ? "rgba(200,150,80,0.45)" : "rgba(180,120,40,0.25)"}`,
          borderRadius: 14, cursor: "pointer", transition: "all 0.3s", overflow: "hidden",
          minHeight: image ? "auto" : 150, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(255,255,255,0.02)",
        }}>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
          {image ? (
            <div style={{ position: "relative", width: "100%" }}>
              <img src={image} alt="" style={{ width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 12, display: "block" }} />
              <div style={{ position: "absolute", bottom: 10, right: 10 }}>
                <span style={{ background: "rgba(10,4,1,0.8)", color: "#c8902a", fontSize: 11, padding: "4px 10px", borderRadius: 20, fontFamily: "'Cinzel',serif" }}>📷 Değiştir</span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 24 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
              <p style={{ color: "#c8902a", fontFamily: "'Cinzel',serif", fontSize: 14, margin: "0 0 6px" }}>Fotoğraf Yükle</p>
              <p style={{ color: "#504030", fontSize: 12 }}>{placeholder}</p>
            </div>
          )}
        </div>

        <input placeholder="✦ Aklındaki soru (isteğe bağlı)" value={question}
          onChange={e => setQuestion(e.target.value)} style={{ ...inp, marginTop: 14 }} onFocus={focusIn} onBlur={focusOut} />

        <Btn onClick={read} disabled={!image || loading} style={{ marginTop: 14, width: "100%", fontSize: 15, padding: "13px 0" }}>
          {loading ? `🔮 ${loadingMsg}` : "✦ Falımı Bak ✦"}
        </Btn>
      </Card>

      {/* Loading shimmer */}
      {loading && (
        <Card style={{ marginTop: 20, textAlign: "center", padding: "36px 24px" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%", background: "#c8902a",
                animation: "bounce 1.2s ease-in-out infinite", animationDelay: i * 0.15 + "s"
              }} />
            ))}
          </div>
          <p style={{ color: "#a07850", fontFamily: "'Cinzel',serif", fontSize: 14 }}>Ruhlar sizi bekliyor...</p>
        </Card>
      )}

      {reading && !loading && (
        <Card style={{ marginTop: 20, animation: "fadeIn 0.6s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid rgba(180,120,40,0.18)" }}>
            <span style={{ fontSize: 22 }}>🔮</span>
            <h3 style={{ fontFamily: "'Cinzel Decorative',serif", color: "#c8902a", margin: 0, fontSize: 15 }}>Falınız Hazır</h3>
          </div>
          <div style={{ color: "#d4b896", lineHeight: 1.9, fontSize: 15, fontFamily: "'Crimson Pro',serif", whiteSpace: "pre-wrap" }}>{reading}</div>
          <p style={{ color: "#605040", fontSize: 11, textAlign: "center", marginTop: 16, fontFamily: "'Cinzel',serif", letterSpacing: 1 }}>✦ Falınız geçmişe kaydedildi ✦</p>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COFFEE SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function CoffeeScreen({ user }) {
  const coffeePrompt = (q) => `Sen deneyimli bir Türk kahve falı ustasısın. Kullanıcı kahve fincanının fotoğrafını gönderdi.
${q ? `Kullanıcının sorusu: "${q}"` : ""}
Fincanın içindeki telveden şekilleri, figürleri ve sembolleri yorumla. Şunları mutlaka ekle:
- Gördüğün en az 3 figür ve anlamları
- Yakın gelecek yorumu  
- Aşk/ilişki yorumu
- Kariyer ve maddi durum
- Genel mesaj ve tavsiye
Sıcak, gizemli ve duygusal bir Türkçe fal yaz. Yaklaşık 350 kelime.`;

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20, paddingTop: 8 }}>
        <SteamCup size={55} />
        <p style={{ color: "#706050", fontSize: 12, marginTop: 8, fontFamily: "'Cinzel',serif" }}>Fincanını ters çevir, 5 dk bekle, fotoğrafla</p>
      </div>
      <ImageReadingCard
        title="Kahve Falı" icon="☕"
        placeholder="Fincanın fotoğrafını yükle"
        prompt={coffeePrompt} historyType="kahve" user={user}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PALM SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function PalmScreen({ user }) {
  const palmPrompt = (q) => `Sen uzman bir el falı (chiromancy) ustasısın. Kullanıcı elinin fotoğrafını gönderdi.
${q ? `Kullanıcının sorusu: "${q}"` : ""}
Avuç içindeki çizgileri, tepeleri ve işaretleri detaylıca oku. Şunları mutlaka içer:
- Kalp çizgisi yorumu (duygusal hayat, aşk)
- Kader çizgisi yorumu (kariyer, yaşam yönü)
- Baş çizgisi yorumu (zeka, düşünce tarzı)
- Yaşam çizgisi yorumu (sağlık, enerji)
- Özel işaretler, yıldızlar, kareler
- Genel kader ve tavsiye
Gizemli, etkileyici Türkçe yaz. Yaklaşık 350 kelime.`;

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20, paddingTop: 8 }}>
        <div style={{ fontSize: 50 }}>🖐</div>
        <p style={{ color: "#706050", fontSize: 12, marginTop: 6, fontFamily: "'Cinzel',serif" }}>Dominant elinin içini kameraya göster</p>
      </div>
      <ImageReadingCard
        title="El Falı" icon="✋"
        placeholder="Avuç içinin fotoğrafını yükle"
        prompt={palmPrompt} historyType="el" user={user}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function ChatScreen({ user }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: `Merhaba ${user.name}! Ben Azize Hanım, yılların deneyimine sahip bir falcıyım. ☕ Kahve falın, el falın ya da hayatındaki sorular hakkında benimle konuşabilirsin. Seni dinliyorum...` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    const text = input.trim(); if (!text || loading) return;
    const newMsgs = [...messages, { role: "user", text }];
    setMessages(newMsgs); setInput(""); setLoading(true);

    try {
      const apiMessages = newMsgs.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));
      const reply = await askClaude(apiMessages,
        `Sen Azize Hanım adında, 40 yıllık deneyime sahip gizemli ve bilge bir Türk falcısısın. Kahve falı, el falı, tarot ve kader hakkında derin bilgin var. Sıcak, empatik, biraz gizemli ve Türkçe konuşuyorsun. Kullanıcıyla sohbet ediyorsun. Kısa, samimi yanıtlar ver (2-4 paragraf). Onlara destek ol, sorularını yanıtla, kaderlerini yorumla. Kullanıcı adı: ${user.name}`
      );
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Bağlantı koptu, bir an sonra tekrar dene." }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)" }}>
      {/* Header */}
      <Card style={{ marginBottom: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#6b3410,#c8902a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🔮</div>
        <div>
          <p style={{ color: "#c8902a", fontFamily: "'Cinzel',serif", margin: 0, fontSize: 15 }}>Azize Hanım</p>
          <p style={{ color: "#506040", fontSize: 11, margin: "2px 0 0" }}>● Çevrimiçi · 40 yıllık falcı</p>
        </div>
      </Card>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "82%", padding: "12px 16px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: m.role === "user" ? "linear-gradient(135deg,#6b3410,#b8820a)" : "rgba(20,10,3,0.9)",
              border: m.role === "user" ? "none" : "1px solid rgba(180,120,40,0.22)",
              color: "#f0d9b5", fontSize: 14, lineHeight: 1.7, fontFamily: "'Crimson Pro',serif",
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex" }}>
            <div style={{ padding: "12px 18px", borderRadius: "18px 18px 18px 4px", background: "rgba(20,10,3,0.9)", border: "1px solid rgba(180,120,40,0.22)", display: "flex", gap: 5, alignItems: "center" }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#c8902a", animation: "bounce 1.2s infinite", animationDelay: i * 0.2 + "s" }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <input
          placeholder="Bir şey sor..."
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          style={{ ...inp, flex: 1 }} onFocus={focusIn} onBlur={focusOut}
        />
        <button onClick={send} disabled={!input.trim() || loading} style={{
          width: 46, height: 46, borderRadius: 12, border: "none", flexShrink: 0,
          background: input.trim() && !loading ? "linear-gradient(135deg,#6b3410,#c8902a)" : "rgba(60,30,10,0.4)",
          color: "#fff", fontSize: 18, cursor: input.trim() && !loading ? "pointer" : "not-allowed",
          transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center"
        }}>➤</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HISTORY SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function HistoryScreen({ user }) {
  const [history, setHistory] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("hepsi");

  useEffect(() => { storageGet("history:" + user.email).then(h => setHistory(h || [])); }, []);

  const typeLabels = { kahve: "☕ Kahve", el: "🖐 El", hepsi: "✦ Hepsi" };
  const filtered = history ? (filter === "hepsi" ? history : history.filter(h => h.type === filter)) : [];

  if (selected) return (
    <div>
      <button onClick={() => setSelected(null)} style={{ marginBottom: 16, background: "none", border: "1px solid rgba(180,120,40,0.3)", color: "#c8902a", cursor: "pointer", padding: "7px 16px", borderRadius: 20, fontFamily: "inherit", fontSize: 13 }}>← Geri</button>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 18 }}>{selected.type === "el" ? "🖐" : "☕"}</span>
          <span style={{ color: "#706050", fontSize: 12 }}>{selected.date}</span>
        </div>
        <h3 style={{ fontFamily: "'Cinzel',serif", color: "#c8902a", margin: "6px 0 18px", fontSize: 15 }}>{selected.question}</h3>
        {selected.imageB64 && <img src={"data:image/jpeg;base64," + selected.imageB64} alt="" style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 12, marginBottom: 18 }} />}
        <div style={{ color: "#d4b896", lineHeight: 1.9, fontSize: 15, fontFamily: "'Crimson Pro',serif", whiteSpace: "pre-wrap" }}>{selected.reading}</div>
      </Card>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <h2 style={{ fontFamily: "'Cinzel Decorative',serif", color: "#c8902a", fontSize: 17, margin: 0 }}>Geçmiş Fallarım</h2>
        <div style={{ display: "flex", gap: 6 }}>
          {["hepsi","kahve","el"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "5px 11px", borderRadius: 20, border: "1px solid rgba(180,120,40,0.3)",
              background: filter === f ? "rgba(180,120,40,0.25)" : "transparent",
              color: filter === f ? "#c8902a" : "#706050", cursor: "pointer", fontSize: 11, fontFamily: "inherit"
            }}>{typeLabels[f]}</button>
          ))}
        </div>
      </div>

      {history === null ? <p style={{ color: "#a07850", textAlign: "center" }}>Yükleniyor...</p>
        : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 20px" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🔮</div>
            <p style={{ color: "#706050", fontFamily: "'Cinzel',serif" }}>Henüz fal yok</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(item => (
              <div key={item.id} onClick={() => setSelected(item)} style={{
                display: "flex", gap: 14, alignItems: "center", padding: "16px 18px", borderRadius: 16,
                background: "rgba(18,9,3,0.88)", border: "1px solid rgba(180,120,40,0.22)", cursor: "pointer",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(180,120,40,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(180,120,40,0.22)"; e.currentTarget.style.transform = "none"; }}
              >
                {item.imageB64
                  ? <img src={"data:image/jpeg;base64," + item.imageB64} alt="" style={{ width: 50, height: 50, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                  : <div style={{ width: 50, height: 50, borderRadius: 10, background: "rgba(180,120,40,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{item.type === "el" ? "🖐" : "☕"}</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "#c8902a", fontFamily: "'Cinzel',serif", fontSize: 13, margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.question}</p>
                  <p style={{ color: "#605040", fontSize: 11, margin: "0 0 5px" }}>{item.date}</p>
                  <p style={{ color: "#907060", fontSize: 12, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.reading.slice(0, 90)}...</p>
                </div>
                <span style={{ color: "#c8902a", fontSize: 16, flexShrink: 0 }}>›</span>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROFILE SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function ProfileScreen({ user, onLogout }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    storageGet("history:" + user.email).then(hist => {
      if (!hist) { setStats({ total: 0, kahve: 0, el: 0, thisMonth: 0 }); return; }
      const now = new Date(); const thisMonth = now.getMonth(); const thisYear = now.getFullYear();
      setStats({
        total: hist.length,
        kahve: hist.filter(h => h.type === "kahve").length,
        el: hist.filter(h => h.type === "el").length,
        thisMonth: hist.filter(h => {
          const d = new Date(h.id);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        }).length,
      });
    });
  }, []);

  const statCards = stats ? [
    { label: "Toplam Fal", value: stats.total, icon: "🔮" },
    { label: "Kahve Falı", value: stats.kahve, icon: "☕" },
    { label: "El Falı", value: stats.el, icon: "🖐" },
    { label: "Bu Ay", value: stats.thisMonth, icon: "📅" },
  ] : [];

  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString("tr-TR", { month: "long", year: "numeric" }) : "Bilinmiyor";

  return (
    <div>
      {/* Profile Card */}
      <Card style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", margin: "0 auto 14px",
          background: "linear-gradient(135deg,#6b3410,#c8902a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 30, boxShadow: "0 6px 24px rgba(200,144,42,0.25)"
        }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h2 style={{ fontFamily: "'Cinzel',serif", color: "#c8902a", margin: "0 0 4px", fontSize: 20 }}>{user.name}</h2>
        <p style={{ color: "#706050", fontSize: 13, margin: 0 }}>{user.email}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
          <span style={{ background: "rgba(180,120,40,0.15)", color: "#a07850", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontFamily: "'Cinzel',serif" }}>✦ {memberSince}'dan beri</span>
        </div>
      </Card>

      {/* Stats Grid */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {statCards.map((s, i) => (
            <Card key={i} style={{ textAlign: "center", padding: "18px 12px" }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Cinzel Decorative',serif", color: "#c8902a", fontSize: 26, margin: "0 0 4px" }}>{s.value}</div>
              <div style={{ color: "#706050", fontSize: 11, fontFamily: "'Cinzel',serif" }}>{s.label}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Fortune Insight */}
      {stats && stats.total > 0 && (
        <Card style={{ marginBottom: 16, background: "linear-gradient(135deg, rgba(60,30,8,0.6), rgba(18,9,3,0.9))" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 20 }}>✨</span>
            <h3 style={{ fontFamily: "'Cinzel',serif", color: "#c8902a", margin: 0, fontSize: 14 }}>Fal Yolculuğun</h3>
          </div>
          <p style={{ color: "#d4b896", fontSize: 13, lineHeight: 1.7, margin: 0, fontFamily: "'Crimson Pro',serif" }}>
            {stats.total} fal baktırdın. {stats.kahve > stats.el ? "Kahve falına" : stats.el > stats.kahve ? "El falına" : "Tüm fal türlerine"} özellikle ilgi duyuyorsun.
            {stats.thisMonth > 0 ? ` Bu ay ${stats.thisMonth} kez falına baktırdın.` : ""} Yıldızlar her zaman seninle! 🌟
          </p>
        </Card>
      )}

      {/* Logout */}
      <Btn onClick={onLogout} variant="danger" style={{ width: "100%", padding: "12px 0", fontSize: 14 }}>
        Çıkış Yap
      </Btn>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("coffee");

  const screenTitles = { coffee: "☕ Kahve Falı", palm: "🖐 El Falı", chat: "💬 Falcıyla Sohbet", history: "📜 Geçmiş Fallar", profile: "👤 Profilim" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600&family=Crimson+Pro:ital,wght@0,400;0,500;1,400&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0402; min-height: 100vh; font-family: 'Crimson Pro', serif; color: #d4b896; }
        @keyframes float { 0%,100%{transform:translateY(0) translateX(0);opacity:.3} 33%{transform:translateY(-20px) translateX(10px);opacity:.6} 66%{transform:translateY(-10px) translateX(-8px);opacity:.4} }
        @keyframes steam { 0%{transform:translateY(0) scaleX(1);opacity:.8} 100%{transform:translateY(-24px) scaleX(1.5);opacity:0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
        input::placeholder { color: #504030; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(180,120,40,0.3); border-radius: 4px; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, zIndex: -1, background: "radial-gradient(ellipse at 25% 25%,rgba(55,28,8,0.55) 0%,transparent 55%), radial-gradient(ellipse at 75% 75%,rgba(35,18,5,0.45) 0%,transparent 55%), #0a0402" }} />
      <Particles />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        {!user ? (
          <AuthScreen onAuth={setUser} />
        ) : (
          <>
            {/* Top bar */}
            <div style={{
              position: "sticky", top: 0, zIndex: 50,
              background: "rgba(8,3,1,0.95)", borderBottom: "1px solid rgba(180,120,40,0.15)",
              padding: "12px 20px", backdropFilter: "blur(16px)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <h1 style={{ fontFamily: "'Cinzel Decorative',serif", color: "#c8902a", fontSize: 14, letterSpacing: 1.5, margin: 0 }}>
                {screenTitles[screen]}
              </h1>
            </div>

            {/* Main content */}
            <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px 100px" }}>
              {screen === "coffee"  && <CoffeeScreen user={user} />}
              {screen === "palm"    && <PalmScreen user={user} />}
              {screen === "chat"    && <ChatScreen user={user} />}
              {screen === "history" && <HistoryScreen user={user} />}
              {screen === "profile" && <ProfileScreen user={user} onLogout={() => { setUser(null); setScreen("coffee"); }} />}
            </div>

            <BottomNav screen={screen} setScreen={setScreen} />
          </>
        )}
      </div>
    </>
  );
}
