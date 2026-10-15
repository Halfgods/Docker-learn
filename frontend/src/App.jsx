import { useEffect, useState, useRef } from 'react'

const COLORS = ['#FDF3E3', '#F7E4C9', '#EFD3B0', '#F5E9DC', '#F3DCC4', '#EADDCB']

export default function App() {
  const [notes, setNotes] = useState([])
  const [quote, setQuote] = useState(null)
  const [stats, setStats] = useState({ total: 0, today: 0 })
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const cardRef = useRef(null)

  const load = async () => {
    const [n, q, s] = await Promise.all([
      fetch('/api/notes').then(r => r.json()),
      fetch('/api/quote').then(r => r.json()),
      fetch('/api/stats').then(r => r.json()),
    ])
    setNotes(n)
    setQuote(q)
    setStats(s)
  }

  useEffect(() => { load() }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2400)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      })
      if (res.ok) {
        setTitle(''); setContent('')
        await load()
        showToast('Note added ✨')
      } else {
        showToast('Failed to add note')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (id) => {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' })
    await load()
    showToast('Note deleted')
  }

  const refreshQuote = async () => {
    const q = await fetch('/api/quote').then(r => r.json())
    setQuote(q)
  }

  return (
    <div className="app">
      <div className="bg-blobs" aria-hidden="true">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
      </div>

      <nav className="nav">
        <div className="nav-inner">
          <a className="brand" href="#top">
            <span className="brand-cup" aria-hidden="true">☕</span>
            <span className="brand-name">NoteNest<em> Café</em></span>
          </a>
          <div className="nav-links">
            <a href="#top">Home</a>
            <a href="#compose">Brew a note</a>
            <a href="#notes">Guest book</a>
            <span className="open-pill">Open · 7am–9pm</span>
          </div>
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="hero-left">
          <div className="badge">☕ Freshly brewed notes, daily</div>
          <h1>NoteNest <em>Café</em></h1>
          <p className="subtitle">A cozy little corner where React meets Flask. Sip a latte, leave a note, and watch it land on our guest wall.</p>
          <div className="stats">
            <div className="stat"><span className="num">{stats.total}</span><span className="lbl">notes</span></div>
            <div className="stat"><span className="num">{stats.today}</span><span className="lbl">today</span></div>
            <div className="stat"><span className="num">{notes.length}</span><span className="lbl">loaded</span></div>
          </div>
        </div>

        <div className="hero-right">
          <div className="quote-card" onClick={refreshQuote} title="Click for another quote">
            <div className="quote-mark">“</div>
            <p className="quote-text">{quote?.text || 'Loading…'}</p>
            <p className="quote-author">— {quote?.author || ''}</p>
            <span className="quote-hint">tap for new quote</span>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="composer" id="compose">
          <h2>Brew a note</h2>
          <form onSubmit={submit} ref={cardRef}>
            <input
              className="input title"
              placeholder="Give it a title…"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={60}
            />
            <textarea
              className="input body"
              placeholder="Write something worth remembering…"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={4}
              maxLength={400}
            />
            <div className="composer-foot">
              <span className="counter">{content.length}/400</span>
              <button className="btn primary" disabled={submitting || !title.trim() || !content.trim()}>
                {submitting ? 'Saving…' : 'Add note'}
              </button>
            </div>
          </form>
        </section>

        <section className="board" id="notes">
          <h2>Guest book <span className="pill">{notes.length}</span></h2>
          {notes.length === 0 ? (
            <div className="empty">
              <div className="empty-emoji">☕</div>
              <p>No notes yet. Create your first one above.</p>
            </div>
          ) : (
            <div className="grid">
              {notes.map((n, i) => (
                <article className="note" key={n.id} style={{ background: COLORS[i % COLORS.length] }}>
                  <button className="del" onClick={() => remove(n.id)} aria-label="delete">×</button>
                  <h3>{n.title}</h3>
                  <p>{n.content}</p>
                  <footer>{new Date(n.created).toLocaleString()}</footer>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="foot">
        React + Flask · NoteNest Café
      </footer>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
