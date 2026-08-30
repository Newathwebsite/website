import { useEffect, useRef, useState } from 'react';
import { useData } from '../../../context/DataContext';
import { mayaAnswer, priceStat, projectDetailLines } from '../../../lib/mayaFaq';

const WELCOME_KEY = 'athMayaWelcomedAt';

function recentlyWelcomed(cooldownHours) {
  const t = localStorage.getItem(WELCOME_KEY);
  if (!t) return false;
  return Date.now() - parseInt(t, 10) < cooldownHours * 60 * 60 * 1000;
}

let msgId = 0;
const nextId = () => ++msgId;

export default function MayaChat() {
  const { projects, settings } = useData();
  const mascot = settings.mascot || {};
  const avatar = mascot.avatar || '/assets/maya-bust.png';
  const name = mascot.name || 'Maya';
  const cooldownHours = mascot.welcomeCooldownHours ?? 12;
  const [open, setOpen] = useState(false);
  const [fullscreenWelcome, setFullscreenWelcome] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const [messages, setMessages] = useState([]); // {id, who:'bot'|'user', text} | {id, who:'bot', choices:[{label,onClick}]}
  const [muted, setMuted] = useState(false);
  const [listening, setListening] = useState(false);
  const [talking, setTalking] = useState(false);
  const [status, setStatus] = useState('Ask me about our projects');
  const [input, setInput] = useState('');
  const [fsInput, setFsInput] = useState('');

  const logRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const voiceRef = useRef(null);

  const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const hasVoiceIn = !!SR;
  const hasVoiceOut = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!hasVoiceOut) return;
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices?.length) return;
      const femaleNamed = /heera|neerja|priya|kalpana|swara|ananya|isha|divya|sangeeta|veena|zira|samantha|susan|female/i;
      const maleNamed = /ravi|rishi|david|hemant|prabhat|daniel|mark|\bmale\b/i;
      const enIn = voices.filter((v) => /en-in/i.test(v.lang));
      const enInFemale = enIn.find((v) => femaleNamed.test(v.name));
      const anyFemale = voices.find((v) => femaleNamed.test(v.name));
      const enInNotMale = enIn.find((v) => !maleNamed.test(v.name));
      voiceRef.current = enInFemale || anyFemale || enInNotMale || enIn[0] || null;
    };
    pick();
    window.speechSynthesis.addEventListener('voiceschanged', pick);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pick);
  }, [hasVoiceOut]);

  useEffect(() => {
    if (mascot.enabled === false) return;
    if (recentlyWelcomed(cooldownHours)) return;
    const t = setTimeout(() => {
      setFullscreenWelcome(true);
      localStorage.setItem(WELCOME_KEY, String(Date.now()));
      const greetingText = mascot.welcomeMessage || `Hey, I'm ${name}. I'm here to help you find your dream home — if you need any clarification, just ask me!`;
      speak(greetingText);
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mascot.enabled, cooldownHours]);

  const speak = (text) => {
    if (!hasVoiceOut || muted) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-IN';
      if (voiceRef.current) u.voice = voiceRef.current;
      u.rate = 0.98; u.pitch = 1.08;
      u.onstart = () => { setTalking(true); setStatus('Speaking…'); };
      u.onend = () => { setTalking(false); setStatus('Ask me about our projects'); };
      u.onerror = () => setTalking(false);
      window.speechSynthesis.speak(u);
    } catch (e) { /* speech synthesis unsupported mid-session */ }
  };

  const addMessage = (text, who) => setMessages((m) => [...m, { id: nextId(), who, text }]);
  const addChoices = (promptText, options) => {
    if (promptText) { addMessage(promptText, 'bot'); speak(promptText); }
    setMessages((m) => [...m, { id: nextId(), who: 'bot', choices: options.map((o) => ({ ...o, disabled: false })) }]);
  };
  const disableChoice = (msgIdToDisable) => {
    setMessages((m) => m.map((x) => (x.id === msgIdToDisable ? { ...x, choices: x.choices.map((c) => ({ ...c, disabled: true })) } : x)));
  };

  const showMayaProjectDetail = (id) => {
    const p = projects.find((x) => x.id === id);
    if (!p) { addMessage("I don't have that project's details handy.", 'bot'); return; }
    const lines = projectDetailLines(p);
    addMessage(lines.join('\n'), 'bot');
    speak(`${p.name}. ${p.description || ''} For more queries, call us at +91 89398 56789.`);
    addChoices(null, [
      { label: `⬅ Back to ${p.category === 'villa' ? 'Villas' : 'Apartments'}`, onClick: () => showMayaTypeList(p.category) },
      { label: '🔁 Start Over', onClick: showMayaStart },
    ]);
  };

  const showMayaTypeList = (category) => {
    const list = projects.filter((p) => p.category === category);
    const typeLabel = category === 'villa' ? 'Villa' : 'Apartment';
    const opts = list.map((p) => {
      const ps = priceStat(p);
      return { label: `${p.name} — ${p.location}${ps ? ` — ${ps.v} ${ps.l}` : ''}`, onClick: () => showMayaProjectDetail(p.id) };
    });
    opts.push({ label: '🔁 Start Over', onClick: showMayaStart });
    addChoices(`Here are our ${typeLabel} projects in Chennai:`, opts);
  };

  function showMayaStart() {
    addChoices('Are you looking for a Villa or an Apartment in Chennai?', [
      { label: '🏡 Villas', onClick: () => showMayaTypeList('villa') },
      { label: '🏢 Apartments', onClick: () => showMayaTypeList('apartment') },
    ]);
  }

  const respond = (question) => {
    addMessage(question, 'user');
    setTimeout(() => {
      const answer = mayaAnswer(question, projects);
      addMessage(answer, 'bot');
      speak(answer);
    }, 350);
  };

  const openChat = () => {
    setFullscreenWelcome(false);
    setOpen(true);
    if (!greeted) {
      setGreeted(true);
      setTimeout(() => {
        const hello = mascot.greeting || "Hi, I'm Maya! Ask me about our villas, apartments, pricing, or how to book a site visit.";
        addMessage(hello, 'bot');
        speak(hello);
        showMayaStart();
      }, 300);
    }
    setTimeout(() => inputRef.current?.focus(), 350);
  };

  // From the full-screen welcome: skip the normal greeting (already said
  // full-screen) and go straight to answering whatever they asked.
  const startFromFullscreen = (question) => {
    setFullscreenWelcome(false);
    setGreeted(true);
    setOpen(true);
    if (question?.trim()) respond(question.trim());
    else showMayaStart();
    setTimeout(() => inputRef.current?.focus(), 350);
  };

  const onFsMicClick = () => {
    if (listening || !hasVoiceIn) return;
    const recognition = new SR();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    recognition.onstart = () => setListening(true);
    const stop = () => setListening(false);
    recognition.onresult = (e) => { const transcript = e.results[0][0].transcript; stop(); startFromFullscreen(transcript); };
    recognition.onerror = stop;
    recognition.onend = stop;
    try { recognition.start(); } catch (e) { /* already running */ }
  };

  const onFsSubmit = (e) => {
    e.preventDefault();
    const q = fsInput.trim();
    setFsInput('');
    startFromFullscreen(q);
  };

  const closeChat = () => {
    setOpen(false);
    if (hasVoiceOut) { window.speechSynthesis.cancel(); setTalking(false); }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    setInput('');
    respond(q);
  };

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      if (next && hasVoiceOut) { window.speechSynthesis.cancel(); setTalking(false); }
      return next;
    });
  };

  const onMicClick = () => {
    if (listening || !hasVoiceIn) return;
    const recognition = new SR();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    recognition.onstart = () => { setListening(true); setStatus('Listening…'); };
    const stop = () => { setListening(false); setStatus('Ask me about our projects'); };
    recognition.onresult = (e) => { const transcript = e.results[0][0].transcript; stop(); respond(transcript); };
    recognition.onerror = stop;
    recognition.onend = stop;
    try { recognition.start(); } catch (e) { /* already running */ }
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && open) closeChat(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (mascot.enabled === false) return null;

  return (
    <>
      <button type="button" className="ath-chat-fab" aria-label={`Chat with ${name}`} onClick={openChat}>
        <img src={avatar} alt={`${name}, your Asset Tree Homes assistant`} />
      </button>

      {fullscreenWelcome && (
        <div className="ath-fs-welcome" role="dialog" aria-label={`Welcome message from ${name}`}>
          <button type="button" className="fsw-skip" onClick={() => setFullscreenWelcome(false)}>Skip ✕</button>
          <div className="fsw-media">
            <img src={avatar} alt={name} />
          </div>
          <div className="fsw-copy">
            <h2>{mascot.welcomeMessage || `Hey, I'm ${name}. I'm here to help you find your dream home — if you need any clarification, just ask me!`}</h2>
            <p>Type a question below, or tap the mic to speak — I'll take it from there.</p>
            <form className="fsw-form" onSubmit={onFsSubmit}>
              {hasVoiceIn && (
                <button type="button" className={`ach-mic ${listening ? 'on' : ''}`} aria-label="Speak your question" onClick={onFsMicClick}>🎤</button>
              )}
              <input type="text" placeholder="Ask about villas, apartments, pricing…" autoComplete="off" value={fsInput} onChange={(e) => setFsInput(e.target.value)} />
              <button type="submit" className="ach-send" aria-label="Send">➤</button>
            </form>
            <button type="button" className="btn btn-light fsw-start" onClick={() => startFromFullscreen()}>Or just start browsing →</button>
          </div>
        </div>
      )}

      <div className={`ath-chat-modal ${open ? 'open' : ''}`} aria-hidden={!open} onClick={(e) => { if (e.target === e.currentTarget) closeChat(); }}>
        <div className="ath-chat-panel" role="dialog" aria-label={`Chat with ${name}`}>
          <div className="ath-chat-head">
            <div className={`ath-mascot ${talking ? 'talking' : ''} ${listening ? 'listening' : ''}`}>
              <img src={avatar} alt={name} />
              <span className="am-ring" />
            </div>
            <div className="ach-title"><b>{name}</b><span>{status}</span></div>
            {hasVoiceOut && (
              <button type="button" className={`ach-mute ${muted ? 'muted' : ''}`} aria-label="Mute voice" onClick={toggleMute}>{muted ? '🔇' : '🔊'}</button>
            )}
            <button type="button" className="ach-close" aria-label="Close chat" onClick={closeChat}>✕</button>
          </div>
          <div className="ath-chat-log" ref={logRef}>
            {messages.map((m) => m.choices ? (
              <div className="ach-msg bot ach-choices" key={m.id}>
                {m.choices.map((c, i) => (
                  <button key={i} type="button" className="ach-choice-btn" disabled={c.disabled} onClick={() => { disableChoice(m.id); addMessage(c.label, 'user'); c.onClick(); }}>
                    {c.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className={`ach-msg ${m.who}`} key={m.id}>{m.text}</div>
            ))}
          </div>
          <form className="ath-chat-form" onSubmit={onSubmit}>
            {hasVoiceIn && (
              <button type="button" className={`ach-mic ${listening ? 'on' : ''}`} aria-label="Speak your question" onClick={onMicClick}>🎤</button>
            )}
            <input ref={inputRef} type="text" placeholder="Ask about villas, apartments, pricing…" autoComplete="off" value={input} onChange={(e) => setInput(e.target.value)} />
            <button type="submit" className="ach-send" aria-label="Send">➤</button>
          </form>
        </div>
      </div>
    </>
  );
}
