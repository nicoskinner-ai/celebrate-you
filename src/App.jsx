import { useState, useEffect } from "react";

const ADMIN_PASSWORD = "celebrateyou";
const SUPABASE_URL = "https://dqtwfrsuzxigdjbeddul.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxdHdmcnN1enhpZ2RqYmVkZHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NDkxMDgsImV4cCI6MjA5NDUyNTEwOH0.9arIxKqDZMA0AdaR2a4kDh-yWF4JZu-j4VRoq0yLnfU";

const HEADERS = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
};

// ── Question definitions ──────────────────────────────────────────────────────
// Add new questions here. Each question has:
//   key       — used in the URL as ?q=key
//   heading   — the main question shown to respondents (use {name} as placeholder)
//   sub       — the subheading beneath the question
//   wordLabel — label above each word input
//   whyLabel  — label above the "why" textarea
//   whyPlaceholder — placeholder inside the "why" textarea
//   extraLabel / extraPlaceholder — optional 4th field (set to null to hide)

const QUESTIONS = {
  words: {
    key: "words",
    heading: "What are the first 3 words that come to mind when you think of {name}?",
    sub: "Share up to three words — and feel free to tell us the story behind each one.",
    wordLabel: "Word",
    whyLabel: "Tell us why (optional)",
    whyPlaceholder: "What's the story behind this word? A memory, a feeling, a moment…",
    extraLabel: null,
    extraPlaceholder: null,
  },
  work: {
    key: "work",
    heading: "What are the 3 words that come to mind when you think of {name} — and what most excites you about what they're building?",
    sub: "Share three words, and tell us what excites you most about their vision or work.",
    wordLabel: "Word",
    whyLabel: "Why this word? (optional)",
    whyPlaceholder: "A quality, a moment, something you've noticed…",
    extraLabel: "What most excites you about what {name} is building?",
    extraPlaceholder: "Their vision, their energy, a specific idea, the impact you see coming…",
  },
};

// ── Supabase helpers ──────────────────────────────────────────────────────────

async function saveResponse(entry) {
  const body = {
    for_name:     entry.forName || "",
    from_name:    entry.from || "",
    word1:        entry.words[0]?.word || "",
    why1:         entry.words[0]?.why  || "",
    word2:        entry.words[1]?.word || "",
    why2:         entry.words[1]?.why  || "",
    word3:        entry.words[2]?.word || "",
    why3:         entry.words[2]?.why  || "",
    extra:        entry.extra || "",
    submitted_at: entry.date,
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/Responses`, {
    method: "POST",
    headers: { ...HEADERS, "Prefer": "return=minimal" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
}

async function fetchResponses() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/Responses?order=submitted_at.desc`,
    { headers: HEADERS }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── URL helpers ───────────────────────────────────────────────────────────────

function getParams() {
  const p = new URLSearchParams(window.location.search);
  const name = p.get("name") || "them";
  const qKey = p.get("q") || "words";
  const question = QUESTIONS[qKey] || QUESTIONS.words;
  return { name, question };
}

function resolveText(template, name) {
  const displayName = name === "them" ? "this person" : name;
  return template.replace(/\{name\}/g, displayName);
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Nunito:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Nunito', sans-serif;
    font-weight: 400;
    background: #fdf6ee;
    color: #3a2e28;
    min-height: 100vh;
  }

  .page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 56px 24px;
    background: linear-gradient(160deg, #fdf6ee 60%, #faebd7 100%);
  }

  .form-wrap {
    width: 100%;
    max-width: 580px;
    animation: fadeUp 0.7s ease both;
  }

  .form-eyebrow {
    font-family: 'Nunito', sans-serif;
    font-weight: 400;
    font-size: 12px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #b8956a;
    margin-bottom: 20px;
  }

  .form-question {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(24px, 4.5vw, 36px);
    line-height: 1.35;
    font-weight: 500;
    color: #2e1f14;
    margin-bottom: 14px;
  }

  .form-question em {
    font-style: italic;
    color: #8b5e3c;
  }

  .form-sub {
    font-size: 15px;
    color: #9a7c66;
    margin-bottom: 44px;
    line-height: 1.7;
    font-weight: 400;
  }

  .word-block {
    background: #fff9f2;
    border: 1.5px solid #e8d5bc;
    border-radius: 12px;
    padding: 24px 28px 20px;
    margin-bottom: 16px;
    transition: border-color 0.2s, box-shadow 0.2s;
    animation: fadeUp 0.6s ease both;
  }
  .word-block:nth-child(1) { animation-delay: 0.1s; }
  .word-block:nth-child(2) { animation-delay: 0.2s; }
  .word-block:nth-child(3) { animation-delay: 0.3s; }
  .word-block:focus-within {
    border-color: #c49a6c;
    box-shadow: 0 2px 16px rgba(180,130,80,0.1);
  }

  .word-number {
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #4a3728;
    font-weight: 500;
    margin-bottom: 10px;
  }

  .word-input {
    width: 100%;
    border: none;
    border-bottom: 1.5px solid #ddc9b0;
    background: transparent;
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    font-weight: 500;
    color: #2e1f14;
    padding: 4px 0 10px;
    outline: none;
    transition: border-color 0.2s;
  }
  .word-input::placeholder { color: #d4bfa6; font-style: italic; font-weight: 400; }
  .word-input:focus { border-color: #b8906a; }

  .why-wrapper {
    background: #d4edff;
    border-left: 4px solid #5aaadd;
    border-radius: 0 8px 8px 0;
    padding: 12px 16px;
    margin-top: 16px;
  }
  .why-label {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #2277aa;
    margin-bottom: 6px;
    font-weight: 500;
  }

  .why-input {
    width: 100%;
    border: none;
    background: transparent;
    font-family: 'Nunito', sans-serif;
    font-weight: 400;
    font-size: 15px;
    color: #5a4035;
    padding: 4px 0;
    outline: none;
    resize: none;
    line-height: 1.7;
    min-height: 52px;
  }
  .why-input::placeholder { color: #d4bfa6; }

  /* extra field (e.g. work question) */
  .extra-block {
    background: #fff9f2;
    border: 1.5px solid #e8d5bc;
    border-radius: 12px;
    padding: 24px 28px 20px;
    margin-bottom: 16px;
    animation: fadeUp 0.6s ease 0.35s both;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .extra-block:focus-within {
    border-color: #c49a6c;
    box-shadow: 0 2px 16px rgba(180,130,80,0.1);
  }
  .extra-label {
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #4a3728;
    font-weight: 500;
    margin-bottom: 12px;
  }
  .extra-input {
    width: 100%;
    border: none;
    background: transparent;
    font-family: 'Nunito', sans-serif;
    font-weight: 400;
    font-size: 15px;
    color: #5a4035;
    padding: 4px 0;
    outline: none;
    resize: none;
    line-height: 1.7;
    min-height: 80px;
  }
  .extra-input::placeholder { color: #d4bfa6; }

  .sender-section {
    background: #fff9f2;
    border: 1.5px solid #e8d5bc;
    border-radius: 12px;
    padding: 24px 28px 20px;
    margin-top: 8px;
    margin-bottom: 36px;
    animation: fadeUp 0.6s ease 0.45s both;
  }

  .sender-label {
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #4a3728;
    font-weight: 500;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .required-badge {
    background: #f5e6d0;
    color: #8b5e3c;
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 20px;
    letter-spacing: 0.08em;
    font-weight: 500;
    text-transform: uppercase;
  }

  .field-input {
    width: 100%;
    border: none;
    border-bottom: 1.5px solid #ddc9b0;
    background: transparent;
    font-family: 'Nunito', sans-serif;
    font-size: 16px;
    font-weight: 400;
    color: #3a2e28;
    padding: 4px 0 10px;
    outline: none;
    transition: border-color 0.2s;
  }
  .field-input::placeholder { color: #d4bfa6; }
  .field-input:focus { border-color: #b8906a; }

  .field-error { color: #c0392b; font-size: 13px; margin-top: 8px; }

  .submit-btn {
    width: 100%;
    padding: 18px;
    background: #8b5e3c;
    color: #fdf6ee;
    border: none;
    border-radius: 10px;
    font-family: 'Nunito', sans-serif;
    font-weight: 500;
    font-size: 14px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
    animation: fadeUp 0.6s ease 0.55s both;
    box-shadow: 0 4px 16px rgba(139,94,60,0.25);
  }
  .submit-btn:hover { background: #7a5133; box-shadow: 0 6px 20px rgba(139,94,60,0.3); }
  .submit-btn:active { transform: scale(0.99); }
  .submit-btn:disabled { background: #c9b09a; box-shadow: none; cursor: not-allowed; }

  .thankyou-wrap {
    max-width: 480px; text-align: center; animation: fadeUp 0.8s ease both;
  }
  .thankyou-icon { font-size: 36px; margin-bottom: 28px; display: block; }
  .thankyou-title {
    font-family: 'Cormorant Garamond', serif; font-size: 40px;
    font-weight: 500; margin-bottom: 18px; color: #2e1f14;
  }
  .thankyou-sub { font-size: 16px; color: #9a7c66; line-height: 1.8; }

  .admin-wrap { width: 100%; max-width: 740px; animation: fadeUp 0.6s ease both; }
  .admin-header {
    display: flex; align-items: baseline; justify-content: space-between;
    margin-bottom: 36px; flex-wrap: wrap; gap: 12px;
  }
  .admin-title { font-family: 'Cormorant Garamond', serif; font-size: 30px; font-weight: 500; color: #2e1f14; }
  .admin-count { font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #b8956a; }

  .response-card {
    background: #fff9f2; border: 1.5px solid #e8d5bc; border-radius: 12px;
    padding: 28px 32px; margin-bottom: 16px; animation: fadeUp 0.4s ease both;
  }
  .response-from {
    font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase;
    color: #b8956a; margin-bottom: 20px; font-weight: 500;
  }
  .response-words { display: flex; flex-direction: column; gap: 16px; }
  .response-word-text { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 500; color: #2e1f14; }
  .response-why { font-size: 14px; color: #7a5a48; line-height: 1.7; margin-top: 4px; }
  .response-extra { font-size: 14px; color: #7a5a48; line-height: 1.7; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e8d5bc; }
  .response-extra-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #b8956a; margin-bottom: 4px; font-weight: 500; }
  .response-date { font-size: 11px; color: #c9b09a; margin-top: 20px; text-align: right; }

  .empty-state {
    text-align: center; padding: 80px 0; color: #c9b09a;
    font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 20px;
  }

  .admin-actions { display: flex; gap: 12px; margin-bottom: 28px; flex-wrap: wrap; }

  .btn-ghost {
    padding: 10px 20px; border: 1.5px solid #e8d5bc; background: transparent; border-radius: 8px;
    font-family: 'Nunito', sans-serif; font-weight: 400; font-size: 12px;
    letter-spacing: 0.12em; text-transform: uppercase; color: #7a5a48;
    cursor: pointer; transition: border-color 0.2s, color 0.2s;
  }
  .btn-ghost:hover { border-color: #b8906a; color: #4a3728; }

  .btn-warm {
    padding: 10px 20px; border: 1.5px solid #8b5e3c; background: #8b5e3c; border-radius: 8px;
    font-family: 'Nunito', sans-serif; font-weight: 500; font-size: 12px;
    letter-spacing: 0.12em; text-transform: uppercase; color: #fdf6ee;
    cursor: pointer; transition: background 0.2s;
  }
  .btn-warm:hover { background: #7a5133; }

  .login-wrap { max-width: 380px; width: 100%; animation: fadeUp 0.6s ease both; }
  .login-title { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 500; margin-bottom: 8px; color: #2e1f14; }
  .login-sub { font-size: 14px; color: #9a7c66; margin-bottom: 36px; }
  .login-error { font-size: 13px; color: #c0392b; margin-top: 12px; }

  .top-nav {
    position: fixed; top: 0; left: 0; right: 0;
    display: flex; justify-content: space-between; align-items: center;
    padding: 18px 32px; background: rgba(253,246,238,0.95);
    backdrop-filter: blur(8px); z-index: 100; border-bottom: 1px solid #e8d5bc;
  }
  .nav-logo { font-family: 'Cormorant Garamond', serif; font-size: 17px; color: #2e1f14; font-style: italic; font-weight: 500; }
  .nav-link {
    font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #b8956a;
    cursor: pointer; background: none; border: none; font-family: 'Nunito', sans-serif;
    font-weight: 400; transition: color 0.2s;
  }
  .nav-link:hover { color: #5a3e2b; }
  .with-nav { padding-top: 110px; }

  .wc-section {
    background: #fff9f2; border: 1.5px solid #e8d5bc; border-radius: 12px;
    padding: 28px 32px; margin-bottom: 28px;
  }
  .wc-title { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #b8956a; margin-bottom: 18px; font-weight: 500; }
  .wc-words { display: flex; flex-wrap: wrap; gap: 10px; }
  .wc-word {
    background: #f5e6d0; border-radius: 20px; padding: 6px 16px;
    font-family: 'Cormorant Garamond', serif; font-size: 16px; font-weight: 500; color: #5a3e2b;
    display: flex; align-items: center; gap: 8px;
  }
  .wc-count { font-family: 'Nunito', sans-serif; font-size: 11px; color: #b8906a; }

  .loading {
    display: flex; flex-direction: column; align-items: center;
    padding: 60px 0; gap: 16px; color: #b8956a;
    font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 18px;
  }
  .spinner {
    width: 28px; height: 28px; border: 2px solid rgba(184,149,106,0.2);
    border-top-color: #b8956a; border-radius: 50%; animation: spin 0.8s linear infinite;
  }
  .error-banner {
    background: #fff0ee; border: 1px solid #f0c8bc; border-radius: 8px;
    padding: 14px 18px; margin-bottom: 20px; font-size: 13px; color: #a03020; line-height: 1.5;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ── FORM ─────────────────────────────────────────────────────────────────────

function FormPage({ name, question, onSubmit }) {
  const [words, setWords] = useState([
    { word: "", why: "" },
    { word: "", why: "" },
    { word: "", why: "" },
  ]);
  const [extra, setExtra] = useState("");
  const [from, setFrom] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState(null);

  const updateWord = (i, field, val) =>
    setWords(words.map((w, idx) => idx === i ? { ...w, [field]: val } : w));

  const allWordsFilled = words.every(w => w.word.trim());
  const extraRequired = !!question.extraLabel;
  const canSubmit = allWordsFilled && from.trim() && (!extraRequired || extra.trim());
  const displayName = name === "them" ? "this person" : name;

  // Render question heading — split on {name} to italicise it
  const renderHeading = () => {
    const parts = question.heading.split("{name}");
    if (parts.length === 1) return <span>{question.heading}</span>;
    return (
      <>
        {parts[0]}<em>{displayName}</em>{parts[1]}
      </>
    );
  };

  const handleSubmit = async () => {
    setTouched(true);
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      // Merge extra into why3 if present, or append as a note on word3
      const filledWords = words.filter(w => w.word.trim()).map((w, i) => {
        if (extra && i === 0) return { ...w, extraNote: extra };
        return w;
      });
      await onSubmit({
        words: filledWords,
        extra,
        from: from.trim(),
        forName: name,
        questionKey: question.key,
        date: new Date().toISOString(),
      });
    } catch (e) {
      setError("Something went wrong saving your response. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="form-wrap">
        <p className="form-eyebrow">A celebration ✦</p>
        <h1 className="form-question">{renderHeading()}</h1>
        <p className="form-sub">{resolveText(question.sub, name)}</p>

        {words.map((w, i) => (
          <div className="word-block" key={i}>
            <p className="word-number">
              {question.wordLabel} {i + 1} <span className="required-badge">Required</span>
            </p>
            <input
              className="word-input"
              type="text"
              placeholder={["e.g. Generous", "e.g. Warm", "e.g. Joyful"][i]}
              value={w.word}
              onChange={e => updateWord(i, "word", e.target.value)}
              maxLength={40}
            />
            {touched && !w.word.trim() && (
              <p className="field-error" style={{ marginTop: 6 }}>Please add a word.</p>
            )}
            <div className="why-wrapper">
              <p className="why-label">{question.whyLabel}</p>
              <textarea
                className="why-input"
                placeholder={question.whyPlaceholder}
                value={w.why}
                onChange={e => updateWord(i, "why", e.target.value)}
                rows={2}
              />
            </div>
          </div>
        ))}

        {question.extraLabel && (
          <div className="extra-block">
            <p className="extra-label">
              {resolveText(question.extraLabel, name)} <span className="required-badge">Required</span>
            </p>
            <textarea
              className="extra-input"
              placeholder={resolveText(question.extraPlaceholder, name)}
              value={extra}
              onChange={e => setExtra(e.target.value)}
              rows={4}
            />
            {touched && !extra.trim() && (
              <p className="field-error" style={{ marginTop: 6 }}>Please tell us what excites you about their work.</p>
            )}
          </div>
        )}

        <div className="sender-section">
          <p className="sender-label">
            Your name <span className="required-badge">Required</span>
          </p>
          <input
            className="field-input"
            type="text"
            placeholder={`So ${displayName === "this person" ? "they" : displayName} knows who it's from`}
            value={from}
            onChange={e => setFrom(e.target.value)}
          />
          {touched && !from.trim() && (
            <p className="field-error">Please add your name so they know who this is from.</p>
          )}
        </div>

        {error && <p className="field-error" style={{ marginBottom: 12, textAlign: "center" }}>{error}</p>}

        <button className="submit-btn" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Sending…" : "Send my words ✦"}
        </button>
      </div>
    </div>
  );
}

// ── THANK YOU ─────────────────────────────────────────────────────────────────

function ThankYouPage({ name }) {
  const displayName = name === "them" ? "this person" : name;
  const cap = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  return (
    <div className="page">
      <div className="thankyou-wrap">
        <span className="thankyou-icon">✦</span>
        <h2 className="thankyou-title">Thank you.</h2>
        <p className="thankyou-sub">
          Your words have been received. {cap} is about to see themselves
          through your eyes — and that is a rare and beautiful gift.
        </p>
      </div>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────

function LoginPage({ onLogin }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const attempt = () => {
    if (pw === ADMIN_PASSWORD) onLogin();
    else { setError(true); setPw(""); }
  };
  return (
    <div className="page">
      <div className="login-wrap">
        <h2 className="login-title">Admin</h2>
        <p className="login-sub">Enter your password to view responses.</p>
        <p style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4a3728", fontWeight: 500, marginBottom: 10 }}>Password</p>
        <input
          className="field-input"
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setError(false); }}
          onKeyDown={e => e.key === "Enter" && attempt()}
          placeholder="••••••••"
        />
        {error && <p className="login-error">Incorrect password.</p>}
        <button className="submit-btn" style={{ marginTop: 24 }} onClick={attempt}>
          View responses
        </button>
      </div>
    </div>
  );
}

// ── ADMIN ─────────────────────────────────────────────────────────────────────

function AdminPage() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try { setResponses(await fetchResponses()); }
    catch (e) { setError("Couldn't load responses. Check your Supabase table and RLS settings."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const wordFreq = {};
  responses.forEach(r =>
    [r.word1, r.word2, r.word3].forEach(w => {
      const k = (w || "").trim().toLowerCase();
      if (k) wordFreq[k] = (wordFreq[k] || 0) + 1;
    })
  );
  const sortedWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]);

  const exportCSV = () => {
    const rows = [["For","From","Word 1","Why 1","Word 2","Why 2","Word 3","Why 3","What excites them","Date"]];
    responses.forEach(r => rows.push([
      r.for_name||"", r.from_name||"",
      r.word1||"", r.why1||"",
      r.word2||"", r.why2||"",
      r.word3||"", r.why3||"",
      r.extra||"",
      formatDate(r.submitted_at),
    ]));
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "responses.csv";
    a.click();
  };

  return (
    <div className="page with-nav">
      <div className="admin-wrap">
        <div className="admin-header">
          <h2 className="admin-title">Responses</h2>
          <span className="admin-count">{responses.length} {responses.length === 1 ? "response" : "responses"}</span>
        </div>

        {error && <div className="error-banner">⚠️ {error}</div>}

        {loading && (
          <div className="loading"><div className="spinner" />Loading responses…</div>
        )}

        {!loading && !error && (
          <>
            {sortedWords.length > 0 && (
              <div className="wc-section">
                <p className="wc-title">Words so far</p>
                <div className="wc-words">
                  {sortedWords.map(([word, count]) => (
                    <div className="wc-word" key={word}>
                      {word.charAt(0).toUpperCase() + word.slice(1)}
                      {count > 1 && <span className="wc-count">×{count}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {responses.length > 0 && (
              <div className="admin-actions">
                <button className="btn-warm" onClick={exportCSV}>Export CSV</button>
                <button className="btn-ghost" onClick={load}>Refresh</button>
              </div>
            )}

            {responses.length === 0 && (
              <p className="empty-state">No responses yet — they'll appear here as they come in.</p>
            )}

            {responses.map((r, i) => (
              <div className="response-card" key={r.id || i} style={{ animationDelay: `${i * 0.05}s` }}>
                <p className="response-from">
                  From {r.from_name || "Anonymous"}
                  {r.for_name ? ` — for ${r.for_name}` : ""}
                </p>
                <div className="response-words">
                  {[1,2,3].map(n => r[`word${n}`] ? (
                    <div key={n}>
                      <div className="response-word-text">{r[`word${n}`]}</div>
                      {r[`why${n}`] && <div className="response-why">{r[`why${n}`]}</div>}
                    </div>
                  ) : null)}
                </div>
                {r.extra && (
                  <div className="response-extra">
                    <p className="response-extra-label">What excites them about their work</p>
                    <p>{r.extra}</p>
                  </div>
                )}
                <p className="response-date">{formatDate(r.submitted_at)}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────

export default function App() {
  const { name, question } = getParams();
  const isAdminUrl = new URLSearchParams(window.location.search).has("admin");
  const [view, setView] = useState(isAdminUrl ? "login" : "form");
  const [adminAuthed, setAdminAuthed] = useState(false);
  const showNav = view === "admin" || view === "login";

  const handleSubmit = async (entry) => {
    await saveResponse(entry);
    setView("thankyou");
  };

  return (
    <>
      <style>{styles}</style>

      {showNav && (
        <nav className="top-nav">
          <span className="nav-logo">Say it now</span>
          {view === "admin" && (
            <button className="nav-link" onClick={() => { setAdminAuthed(false); setView("login"); }}>
              Sign out
            </button>
          )}
        </nav>
      )}

      {view === "form"     && <FormPage name={name} question={question} onSubmit={handleSubmit} />}
      {view === "thankyou" && <ThankYouPage name={name} />}
      {view === "login"    && !adminAuthed && <LoginPage onLogin={() => { setAdminAuthed(true); setView("admin"); }} />}
      {view === "admin"    && adminAuthed  && <AdminPage />}

      {view === "form" && (
        <button
          onClick={() => setView("login")}
          style={{
            position: "fixed", bottom: 20, right: 20, background: "none", border: "none",
            cursor: "pointer", fontFamily: "Nunito, sans-serif", fontWeight: 400,
            fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#c9b09a",
          }}
        >
          Admin
        </button>
      )}
    </>
  );
}
