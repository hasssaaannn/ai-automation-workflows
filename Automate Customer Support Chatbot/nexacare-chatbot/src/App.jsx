import { useState, useRef, useEffect } from "react";

const WEBHOOK_URL = "https://hassaandaddy.app.n8n.cloud/webhook/chat";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #060910;
    --surface: #0d1117;
    --surface2: #131923;
    --border: rgba(255,255,255,0.06);
    --border-bright: rgba(255,255,255,0.12);
    --accent: #00e5a0;
    --accent2: #0099ff;
    --accent-dim: rgba(0,229,160,0.12);
    --text: #e8edf5;
    --muted: #5a6478;
    --muted2: #8892a4;
    --user-bubble: #1a2236;
    --bot-bubble: #0f1c14;
  }

  .nexacare-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  /* Background atmosphere */
  .nexacare-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 20% 10%, rgba(0,229,160,0.04) 0%, transparent 60%),
      radial-gradient(ellipse 60% 80% at 80% 90%, rgba(0,153,255,0.04) 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 50% 50%, rgba(0,229,160,0.02) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Noise grain overlay */
  .nexacare-root::after {
    content: '';
    position: fixed;
    inset: 0;
    opacity: 0.018;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 150px;
    pointer-events: none;
  }

  .chat-shell {
    position: relative;
    width: 100%;
    max-width: 480px;
    height: 700px;
    display: flex;
    flex-direction: column;
    background: var(--surface);
    border: 1px solid var(--border-bright);
    border-radius: 28px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(0,229,160,0.04),
      0 32px 80px rgba(0,0,0,0.6),
      0 8px 24px rgba(0,0,0,0.4),
      inset 0 1px 0 rgba(255,255,255,0.05);
    animation: shellIn 0.6s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes shellIn {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ── Header ── */
  .chat-header {
    flex-shrink: 0;
    padding: 18px 22px;
    display: flex;
    align-items: center;
    gap: 14px;
    border-bottom: 1px solid var(--border);
    background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%);
    position: relative;
  }

  .avatar-ring {
    position: relative;
    flex-shrink: 0;
  }

  .avatar-ring::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    background: conic-gradient(from 0deg, var(--accent), var(--accent2), var(--accent));
    animation: spin 4s linear infinite;
    z-index: 0;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .avatar-inner {
    position: relative;
    z-index: 1;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0a1f15 0%, #061510 100%);
    border: 2px solid var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar-icon {
    width: 20px;
    height: 20px;
    color: var(--accent);
  }

  .header-info { flex: 1; }

  .header-name {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: 0.01em;
  }

  .header-sub {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 6px var(--accent);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 6px var(--accent); }
    50%       { opacity: 0.6; box-shadow: 0 0 12px var(--accent); }
  }

  .status-text {
    font-size: 11px;
    font-weight: 500;
    color: var(--accent);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .header-actions {
    display: flex;
    gap: 6px;
  }

  .icon-btn {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--surface2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--muted2);
  }
  .icon-btn:hover {
    border-color: var(--border-bright);
    color: var(--text);
    background: rgba(255,255,255,0.06);
  }

  /* ── Messages ── */
  .messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 24px 18px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    scroll-behavior: smooth;
  }

  .messages-area::-webkit-scrollbar { width: 4px; }
  .messages-area::-webkit-scrollbar-track { background: transparent; }
  .messages-area::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.08);
    border-radius: 99px;
  }

  .msg-row {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    animation: msgIn 0.35s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes msgIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .msg-row.user { justify-content: flex-end; }
  .msg-row.bot  { justify-content: flex-start; }

  .msg-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0a1f15, #061510);
    border: 1px solid rgba(0,229,160,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .msg-avatar svg { width: 14px; height: 14px; color: var(--accent); }

  .bubble-wrap { max-width: 78%; display: flex; flex-direction: column; gap: 4px; }
  .msg-row.user .bubble-wrap { align-items: flex-end; }
  .msg-row.bot  .bubble-wrap { align-items: flex-start; }

  .bubble {
    padding: 12px 16px;
    border-radius: 18px;
    font-size: 14px;
    line-height: 1.65;
    font-weight: 400;
    letter-spacing: 0.01em;
    position: relative;
  }

  .bubble.user {
    background: var(--user-bubble);
    border: 1px solid rgba(255,255,255,0.08);
    border-bottom-right-radius: 5px;
    color: var(--text);
  }

  .bubble.bot {
    background: var(--bot-bubble);
    border: 1px solid rgba(0,229,160,0.1);
    border-bottom-left-radius: 5px;
    color: var(--text);
  }

  .bubble-time {
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 0.04em;
  }

  /* ── Typing indicator ── */
  .typing-row {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    animation: msgIn 0.35s cubic-bezier(0.22,1,0.36,1) both;
  }

  .typing-bubble {
    padding: 14px 18px;
    background: var(--bot-bubble);
    border: 1px solid rgba(0,229,160,0.1);
    border-radius: 18px;
    border-bottom-left-radius: 5px;
    display: flex;
    gap: 5px;
    align-items: center;
  }

  .typing-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    animation: typeDot 1.4s ease-in-out infinite;
  }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes typeDot {
    0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
    40%            { transform: scale(1);   opacity: 1; }
  }

  /* ── Suggestions ── */
  .suggestions {
    padding: 0 18px 12px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .suggestion-chip {
    font-size: 12px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    padding: 6px 13px;
    border-radius: 99px;
    border: 1px solid var(--border-bright);
    background: var(--surface2);
    color: var(--muted2);
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .suggestion-chip:hover {
    border-color: rgba(0,229,160,0.3);
    color: var(--accent);
    background: var(--accent-dim);
  }

  /* ── Input area ── */
  .input-area {
    flex-shrink: 0;
    padding: 14px 16px 18px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: flex-end;
    gap: 10px;
    background: linear-gradient(0deg, rgba(0,229,160,0.015) 0%, transparent 100%);
  }

  .input-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    background: var(--surface2);
    border: 1px solid var(--border-bright);
    border-radius: 16px;
    padding: 4px 6px 4px 16px;
    transition: border-color 0.2s, box-shadow 0.2s;
    gap: 6px;
  }

  .input-wrap:focus-within {
    border-color: rgba(0,229,160,0.35);
    box-shadow: 0 0 0 3px rgba(0,229,160,0.06);
  }

  .chat-input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 400;
    resize: none;
    height: 40px;
    line-height: 1.5;
    padding: 8px 0;
  }

  .chat-input::placeholder { color: var(--muted); }

  .attach-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--muted);
    border-radius: 8px;
    transition: all 0.2s;
    flex-shrink: 0;
    background: none;
    border: none;
  }
  .attach-btn:hover { color: var(--muted2); background: rgba(255,255,255,0.05); }

  .send-btn {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s cubic-bezier(0.22,1,0.36,1);
    background: linear-gradient(135deg, var(--accent) 0%, #00c484 100%);
    box-shadow: 0 4px 16px rgba(0,229,160,0.25);
    color: #021a0f;
  }

  .send-btn:hover {
    transform: scale(1.06);
    box-shadow: 0 6px 24px rgba(0,229,160,0.35);
  }
  .send-btn:active { transform: scale(0.97); }
  .send-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .send-btn svg { width: 18px; height: 18px; }

  .footer-note {
    text-align: center;
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 0.04em;
    padding-bottom: 2px;
    padding-top: 6px;
  }
`;

const SUGGESTIONS = [
  "Book an appointment",
  "My prescriptions",
  "Lab results",
  "Talk to a doctor",
];

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hello! I'm NexaCare AI, your personal health assistant. How can I support you today?",
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;

    setShowSuggestions(false);
    setMessages((prev) => [...prev, { role: "user", text: msg, time: getTime() }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.reply || "Something went wrong.", time: getTime() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Unable to reach the server. Please try again.", time: getTime() },
      ]);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{style}</style>
      <div className="nexacare-root">
        <div className="chat-shell">

          {/* Header */}
          <div className="chat-header">
            <div className="avatar-ring">
              <div className="avatar-inner">
                <svg className="avatar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            </div>
            <div className="header-info">
              <div className="header-name">NexaCare AI</div>
              <div className="header-sub">
                <div className="status-dot" />
                <span className="status-text">Active now</span>
              </div>
            </div>
            <div className="header-actions">
              <button className="icon-btn" title="Search">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                </svg>
              </button>
              <button className="icon-btn" title="More">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="messages-area">
            {messages.map((msg, i) => (
              <div key={i} className={`msg-row ${msg.role}`}>
                {msg.role === "bot" && (
                  <div className="msg-avatar">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
                <div className="bubble-wrap">
                  <div className={`bubble ${msg.role}`}>{msg.text}</div>
                  <span className="bubble-time">{msg.time}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="typing-row">
                <div className="msg-avatar">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} width="14" height="14" color="#00e5a0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="typing-bubble">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {showSuggestions && (
            <div className="suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="suggestion-chip" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="input-area">
            <div className="input-wrap">
              <input
                className="chat-input"
                placeholder="Message NexaCare AI…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              />
              <button className="attach-btn" title="Attach">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                </svg>
              </button>
            </div>
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              title="Send"
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>

          <div className="footer-note">NexaCare · Powered by AI · Your data is private</div>
        </div>
      </div>
    </>
  );
}