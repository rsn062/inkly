import { useState } from "react";

const CONTENT_TYPES = [
  { id: "instagram", label: "Post Instagram", icon: "◈", prompt: "Écris un post Instagram engageant et professionnel pour" },
  { id: "email", label: "Email Marketing", icon: "◉", prompt: "Rédige un email marketing percutant pour" },
  { id: "description", label: "Description Produit", icon: "◆", prompt: "Crée une description produit convaincante pour" },
  { id: "linkedin", label: "Post LinkedIn", icon: "◇", prompt: "Écris un post LinkedIn professionnel pour" },
  { id: "bio", label: "Bio / À propos", icon: "◐", prompt: "Rédige une bio professionnelle et mémorable pour" },
  { id: "sms", label: "SMS Promo", icon: "◑", prompt: "Écris un SMS promotionnel court et efficace pour" },
];

const TONES = ["Professionnel", "Inspirant", "Amical", "Urgent", "Luxe", "Simple"];

export default function App() {
  const [selected, setSelected] = useState(CONTENT_TYPES[0]);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professionnel");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uses, setUses] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [copied, setCopied] = useState(false);
  const FREE_LIMIT = 3;

  const generate = async () => {
    if (!topic.trim()) return;
    if (uses >= FREE_LIMIT) { setShowPaywall(true); return; }

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      setOutput("Clé API manquante. Va sur Vercel > Settings > Environment Variables, ajoute VITE_ANTHROPIC_API_KEY puis redéploie.");
      return;
    }

    setLoading(true);
    setOutput("");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `${selected.prompt}: "${topic}". Ton: ${tone}. Réponds UNIQUEMENT avec le contenu final en français, sans explication ni commentaire. ${selected.id === "instagram" ? "Inclus des emojis et 5 hashtags à la fin." : ""} ${selected.id === "sms" ? "Maximum 160 caractères." : ""} ${selected.id === "email" ? "Inclus: objet, corps du message, et call-to-action." : ""}`
          }]
        })
      });
      const data = await res.json();
      if (data.error) {
        setOutput("Erreur : " + data.error.message);
      } else {
        const text = data.content?.map((b) => b.text || "").join("") || "Aucun contenu généré.";
        setOutput(text);
        setUses((u) => u + 1);
      }
    } catch (e) {
      setOutput("Erreur réseau : " + e.message);
    }
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0F14", color: "#E8F0F5", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }
        .btn-main { background: linear-gradient(135deg, #63D9B4 0%, #50A0FF 100%); color: #0A0F14; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 700; transition: all 0.25s; }
        .btn-main:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 8px 32px rgba(99,217,180,0.3); }
        .btn-main:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
        .type-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); cursor: pointer; transition: all 0.2s; }
        .type-card:hover { background: rgba(99,217,180,0.06); border-color: rgba(99,217,180,0.3); }
        .type-card.active { background: rgba(99,217,180,0.1); border-color: rgba(99,217,180,0.6); }
        input { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #E8F0F5; font-family: 'DM Sans', sans-serif; outline: none; transition: border 0.2s; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        input:focus { border-color: rgba(99,217,180,0.5); }
        .tone-pill { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .tone-pill:hover { border-color: rgba(99,217,180,0.3); color: #E8F0F5; }
        .tone-pill.active { background: rgba(99,217,180,0.12); border-color: rgba(99,217,180,0.5); color: #63D9B4; }
        .shimmer { background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 100%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .fadeIn { animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .modal-bg { position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px); }
        .label { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 12px; display:block; }
      `}</style>

      <div style={{ position:"fixed",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse 80% 60% at 70% 20%, rgba(99,217,180,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 20% 80%, rgba(80,160,255,0.05) 0%, transparent 60%)" }}/>

      <header style={{ position:"relative",zIndex:1,padding:"36px 24px 0",textAlign:"center" }}>
        <div style={{ display:"inline-flex",alignItems:"center",gap:"8px",marginBottom:"6px" }}>
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <rect x="3" y="3" width="22" height="22" rx="6" stroke="url(#g1)" strokeWidth="1.5"/>
            <path d="M9 14h10M9 10h6M9 18h8" stroke="url(#g1)" strokeWidth="1.5" strokeLinecap="round"/>
            <defs>
              <linearGradient id="g1" x1="3" y1="3" x2="25" y2="25" gradientUnits="userSpaceOnUse">
                <stop stopColor="#63D9B4"/><stop offset="1" stopColor="#50A0FF"/>
              </linearGradient>
            </defs>
          </svg>
          <span style={{ fontFamily:"'Space Mono',monospace",fontSize:"20px",fontWeight:"700",background:"linear-gradient(135deg,#63D9B4,#50A0FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>inkly</span>
        </div>
        <p style={{ fontFamily:"'Space Mono',monospace",fontSize:"10px",color:"rgba(255,255,255,0.3)",letterSpacing:"0.2em",textTransform:"uppercase" }}>AI Content Generator</p>
        <div style={{ display:"inline-flex",alignItems:"center",gap:"8px",marginTop:"14px",padding:"6px 16px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"100px" }}>
          <div style={{ display:"flex",gap:"4px" }}>
            {[...Array(FREE_LIMIT)].map((_,i) => (
              <div key={i} style={{ width:"28px",height:"4px",borderRadius:"2px",background:i<uses?"linear-gradient(90deg,#63D9B4,#50A0FF)":"rgba(255,255,255,0.12)",transition:"background 0.4s" }}/>
            ))}
          </div>
          <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"rgba(255,255,255,0.45)" }}>
            {FREE_LIMIT - uses > 0 ? `${FREE_LIMIT - uses} crédit${FREE_LIMIT - uses > 1 ? "s" : ""} gratuit${FREE_LIMIT - uses > 1 ? "s" : ""}` : "Crédits épuisés"}
          </span>
        </div>
      </header>

      <main style={{ position:"relative",zIndex:1,maxWidth:"820px",margin:"0 auto",padding:"36px 20px 80px" }}>
        <section style={{ marginBottom:"28px" }}>
          <span className="label">Type de contenu</span>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px" }}>
            {CONTENT_TYPES.map(type => (
              <div key={type.id} className={`type-card ${selected.id === type.id ? "active" : ""}`}
                onClick={() => setSelected(type)}
                style={{ padding:"13px 15px",borderRadius:"10px",display:"flex",alignItems:"center",gap:"10px" }}>
                <span style={{ fontSize:"16px",color:selected.id===type.id?"#63D9B4":"rgba(255,255,255,0.3)" }}>{type.icon}</span>
                <span style={{ fontSize:"13px",fontWeight:selected.id===type.id?"600":"400",color:selected.id===type.id?"#E8F0F5":"rgba(255,255,255,0.5)" }}>{type.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom:"20px" }}>
          <span className="label">Sujet / Produit</span>
          <input value={topic} onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generate()}
            placeholder="ex: ma boutique de vêtements en ligne, mon coaching bien-être…"
            style={{ width:"100%",padding:"14px 18px",borderRadius:"10px",fontSize:"14px" }}/>
        </section>

        <section style={{ marginBottom:"28px" }}>
          <span className="label">Ton</span>
          <div style={{ display:"flex",gap:"7px",flexWrap:"wrap" }}>
            {TONES.map(t => (
              <button key={t} className={`tone-pill ${tone === t ? "active" : ""}`}
                onClick={() => setTone(t)}
                style={{ padding:"6px 15px",borderRadius:"100px",fontSize:"13px" }}>{t}</button>
            ))}
          </div>
        </section>

        <button className="btn-main" onClick={generate} disabled={loading || !topic.trim()}
          style={{ width:"100%",padding:"16px",borderRadius:"10px",fontSize:"15px",marginBottom:"28px" }}>
          {loading ? "Génération en cours…" : "→ Générer le contenu"}
        </button>

        {(loading || output) && (
          <section className="fadeIn">
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px" }}>
              <span className="label" style={{ marginBottom:0 }}>Résultat</span>
              {output && !loading && (
                <button onClick={copy} style={{ background:"none",border:"1px solid rgba(99,217,180,0.3)",color:"#63D9B4",padding:"5px 14px",borderRadius:"100px",cursor:"pointer",fontSize:"12px",fontFamily:"'DM Sans',sans-serif" }}>
                  {copied ? "✓ Copié !" : "Copier"}
                </button>
              )}
            </div>
            <div style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",padding:"24px",minHeight:"140px",fontSize:"14px",lineHeight:"1.85",color:"#C8DDE8",whiteSpace:"pre-wrap",fontFamily:"'DM Sans',sans-serif" }}>
              {loading ? (
                <div style={{ display:"flex",flexDirection:"column",gap:"10px" }}>
                  {[100,80,92,65,75].map((w,i) => (
                    <div key={i} className="shimmer" style={{ height:"14px",borderRadius:"4px",width:`${w}%` }}/>
                  ))}
                </div>
              ) : output}
            </div>
          </section>
        )}

        <div style={{ marginTop:"40px",padding:"28px 32px",background:"rgba(99,217,180,0.05)",border:"1px solid rgba(99,217,180,0.15)",borderRadius:"14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"20px" }}>
          <div>
            <p style={{ fontFamily:"'Space Mono',monospace",fontSize:"15px",color:"#E8F0F5",marginBottom:"6px" }}>Générations illimitées</p>
            <p style={{ fontSize:"13px",color:"rgba(255,255,255,0.4)",fontFamily:"'DM Sans',sans-serif" }}>Tous types · Sans engagement · 3,99€/mois</p>
          </div>
          <button className="btn-main" onClick={() => window.open('https://buy.stripe.com/cNi14mfsO05pfmh7gBcMM00', '_blank')} style={{ padding:"12px 28px",borderRadius:"10px",fontSize:"14px" }}>
            S'abonner →
          </button>
        </div>
      </main>

      {showPaywall && (
        <div className="modal-bg" onClick={() => setShowPaywall(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background:"#0E1820",border:"1px solid rgba(99,217,180,0.2)",borderRadius:"16px",padding:"44px 36px",maxWidth:"400px",width:"100%",textAlign:"center" }}>
            <div style={{ width:"52px",height:"52px",margin:"0 auto 20px",background:"rgba(99,217,180,0.1)",borderRadius:"14px",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="#63D9B4" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={{ fontFamily:"'Space Mono',monospace",fontSize:"18px",color:"#E8F0F5",marginBottom:"10px" }}>Crédits épuisés</h2>
            <p style={{ fontSize:"13px",color:"rgba(255,255,255,0.45)",lineHeight:"1.7",marginBottom:"28px",fontFamily:"'DM Sans',sans-serif" }}>
              Tu as utilisé tes 3 générations gratuites. Passe à l'offre Pro pour créer sans limite.
            </p>
            <div style={{ background:"rgba(99,217,180,0.07)",borderRadius:"10px",padding:"18px",marginBottom:"24px" }}>
              <p style={{ fontFamily:"'Space Mono',monospace",fontSize:"26px",color:"#63D9B4" }}>3,99€ <span style={{ fontSize:"13px",color:"rgba(255,255,255,0.35)" }}>/ mois</span></p>
              <p style={{ fontSize:"12px",color:"rgba(255,255,255,0.3)",marginTop:"4px",fontFamily:"'DM Sans',sans-serif" }}>Générations illimitées · Résiliable à tout moment</p>
            </div>
            <button className="btn-main" onClick={() => window.open('https://buy.stripe.com/cNi14mfsO05pfmh7gBcMM00', '_blank')} style={{ width:"100%",padding:"14px",borderRadius:"10px",fontSize:"15px",marginBottom:"12px" }}>
              Commencer maintenant
            </button>
            <button onClick={() => setShowPaywall(false)} style={{ background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:"13px",fontFamily:"'DM Sans',sans-serif" }}>
              Peut-être plus tard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
