import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDownToLine, ArrowRight, Check, ChevronDown, CircleHelp, Clipboard,
  Clock3, FileAudio, FileVideo, Globe2, Link2, LoaderCircle, Menu, ShieldCheck,
  Sparkles, WandSparkles, X
} from 'lucide-react';
import './styles.css';

const platforms = [
  { name: 'YouTube', mark: '▶', color: '#ff4d4d' },
  { name: 'TikTok', mark: '♪', color: '#171717' },
  { name: 'Facebook', mark: 'f', color: '#3478f6' },
  { name: 'Instagram', mark: '◎', color: '#d94c9b' },
  { name: 'Vimeo', mark: 'v', color: '#2798e8' },
  { name: 'X / Twitter', mark: '𝕏', color: '#171717' },
  { name: 'Dailymotion', mark: '▶', color: '#00aaff' },
  { name: 'DramaFren', mark: 'D', color: '#7655d8' },
];

function App() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
const [menuOpen, setMenuOpen] = useState(false);
const [videoData, setVideoData] = useState(null);
const [selectedFormat, setSelectedFormat] = useState('');

 const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText();
    setUrl(text);
    setStatus('idle');
    setMessage('');
  } catch (error) {
    setStatus('error');
    setMessage('Unable to access clipboard. Please paste your link manually.');
  }

};

const clearUrl = () => {
  setUrl('');
  setStatus('idle');
  setMessage('');
};


const handleAnalyze = async (event) => {
  event?.preventDefault();

  if (!url.trim()) {
    setStatus('error');
    setMessage('Paste a media link first to get started.');
    return;
  }

  let parsed;

  try {
    parsed = new URL(url.trim());

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
  } catch {
    setStatus('error');
    setMessage('Please enter a valid link starting with https://');
    return;
  }
  setVideoData(null);
  setStatus('loading');
  setMessage('Checking your link...');

  try {
    const apiUrl = 'https://linkdrop-api-m6eg.onrender.com';

    // Detect the platform
    const infoResponse = await fetch(`${apiUrl}/api/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: parsed.toString() })
    });

    const info = await infoResponse.json();

    if (!infoResponse.ok || !info.success) {
      throw new Error(info.error || 'Unable to analyze this link.');
    }

    // Extract actual metadata for Dailymotion
    if (info.platform === 'Dailymotion') {
      setMessage('Extracting video information...');

      const extractResponse = await fetch(`${apiUrl}/api/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: parsed.toString() })
      });

      const result = await extractResponse.json();

      if (!extractResponse.ok || !result.success) {
        throw new Error(result.error || 'Unable to extract video information.');
      }

      const video = result.video;

setVideoData(video);
setSelectedFormat(video.formats?.[0]?.quality || '');
setStatus('success');
setMessage('');

return;

    
    }

    // Other platforms: detection only for now
    setStatus('success');
    setMessage(`Platform detected: ${info.platform}. Metadata extraction is not yet available for this platform.`);

  } catch (error) {
    setStatus('error');
    setMessage(
      error.message || 'Could not connect to LinkDrop. Please try again.'
    );
  }
};


  return (
    <div className="app-shell">
      <div className="announcement">
        <span className="announcement-dot" />
        Your all-in-one media companion <span className="announcement-separator">·</span> Simple, fast, and clear
      </div>

      <header className="site-header">
        <a className="brand" href="#" aria-label="LinkDrop home">
          <span className="brand-mark"><ArrowDownToLine size={21} strokeWidth={2.8} /></span>
          <span>linkdrop<span className="brand-period">.</span></span>
        </a>
        <nav className={menuOpen ? 'nav-links nav-open' : 'nav-links'}>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#platforms" onClick={() => setMenuOpen(false)}>Platforms</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
        </nav>
        <a className="header-cta" href="#downloader">Try it now <ArrowRight size={15} /></a>
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <main>
        <section className="hero" id="downloader">
          <div className="hero-orb orb-one" />
          <div className="hero-orb orb-two" />
          <div className="hero-copy">
            <div className="eyebrow"><Sparkles size={14} /> YOUR MEDIA, YOUR WAY</div>
            <h1>Good links.<br /><span>Great downloads.</span></h1>
            <p className="hero-subtitle">One simple place to prepare your favourite media for offline viewing. Paste a link and get started.</p>
            <div className="trust-row">
              <span><ShieldCheck size={16} /> No account needed</span>
              <span><Clock3 size={16} /> Quick and easy</span>
            </div>
          </div>

          <div className="download-card">
            <div className="card-topline">
              <div className="card-icon"><Link2 size={18} /></div>
              <div>
                <h2>Drop your link here</h2>
                <p>Paste a link from a supported platform</p>
              </div>
              <span className="card-spark"><WandSparkles size={18} /></span>
            </div>
            <form onSubmit={handleAnalyze}>
              <label className="sr-only" htmlFor="media-url">Media URL</label>
              <div className={`url-input-wrap ${status === 'error' ? 'input-error' : ''}`}>
                <Globe2 className="input-globe" size={19} />
                <input
                  id="media-url"
                  type="url"
                  placeholder="https://paste-your-link-here.com"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setStatus('idle'); setMessage(''); }}
                  autoComplete="url"
                />
                {url && <button className="clear-button" type="button" onClick={clearUrl} aria-label="Clear link"><X size={16} /></button>}
                <button className="paste-button" type="button" onClick={pasteFromClipboard}><Clipboard size={15} /> Paste</button>
              </div>
              <button className="download-button" type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? <LoaderCircle className="spin" size={18} /> : <ArrowDownToLine size={18} />}
                Analyze link <ArrowRight size={17} className="button-arrow" />
              </button>
            </form>
            {message && (
              <div className={`feedback ${status === 'error' ? 'feedback-error' : 'feedback-info'}`} role="status">
                {status === 'error' ? <CircleHelp size={17} /> : <Check size={17} />}
              {videoData && (
  <div className="video-result">
    <div className="video-result-preview">
      {videoData.thumbnail && (
        <img src={videoData.thumbnail} alt={videoData.title} />
      )}
      <span className="video-platform">Dailymotion</span>
    </div>

    <div className="video-result-details">
      <h3>{videoData.title}</h3>

      <div className="video-result-meta">
        <span>
          <Clock3 size={15} />
          {Math.floor(videoData.duration / 60)} minutes
        </span>
        <span>{videoData.uploader || 'Unknown uploader'}</span>
      </div>

      <label htmlFor="video-quality">Video quality</label>

      <select
        id="video-quality"
        value={selectedFormat}
        onChange={e => setSelectedFormat(e.target.value)}
      >
        {videoData.formats?.map((format, index) => (
          <option
            key={`${format.quality}-${index}`}
            value={format.quality}
          >
            {format.quality} · {format.format.toUpperCase()}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled
        className="result-download-button"
      >
        Download — coming soon
      </button>
    </div>
  </div>
)}  <span>{message}</span>
              </div>
            )}
              
            <div className="card-footnote"><ShieldCheck size={14} /> We only process content you’re authorized to download.</div>
          </div>
          <div className="hero-bottom-note"><span className="mini-line" /> Built for the way you save <span className="mini-line" /></div>
        </section>

        <section className="platform-section section-wrap" id="platforms">
          <div className="section-kicker">ONE LINK. MANY POSSIBILITIES.</div>
          <div className="section-heading-row">
            <div>
              <h2>Your favourite platforms,<br /><span>all in one place.</span></h2>
            </div>
            <p>From social clips to direct media links, start with a URL and see what’s available for supported content.</p>
          </div>
          <div className="platform-grid">
            {platforms.map((platform) => (
              <div className="platform-tile" key={platform.name}>
                <span className="platform-logo" style={{ '--platform-color': platform.color }}>{platform.mark}</span>
                <span className="platform-name">{platform.name}</span>
                <span className="platform-arrow"><ArrowRight size={16} /></span>
              </div>
            ))}
            <div className="platform-tile direct-tile">
              <span className="platform-logo direct-logo"><Link2 size={19} /></span>
              <span className="platform-name">Direct media links</span>
              <span className="platform-arrow"><ArrowRight size={16} /></span>
            </div>
          </div>
          <p className="platform-note">Availability depends on each source, its access settings, and supported formats.</p>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="section-wrap">
            <div className="section-kicker">THREE STEPS. THAT’S IT.</div>
            <div className="how-heading">
              <h2>From link to <span>ready.</span></h2>
              <p>No confusing menus. No unnecessary steps. Just a clear path from the link you have to the media options available.</p>
            </div>
            <div className="steps-grid">
              <article className="step-card">
                <div className="step-number">01</div>
                <div className="step-illustration link-illustration"><Link2 size={28} /><span className="illustration-orbit" /></div>
                <h3>Copy your link</h3>
                <p>Copy the URL for public or otherwise authorized content from a supported source.</p>
              </article>
              <article className="step-card">
                <div className="step-number">02</div>
                <div className="step-illustration scan-illustration"><WandSparkles size={28} /><span className="scan-line" /></div>
                <h3>Check what’s available</h3>
                <p>The service checks the link and shows the media details and supported options.</p>
              </article>
              <article className="step-card">
                <div className="step-number">03</div>
                <div className="step-illustration download-illustration"><ArrowDownToLine size={29} /><span className="download-base" /></div>
                <h3>Choose your format</h3>
                <p>Select an available format and save the file when the source permits it.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="formats-section section-wrap">
          <div className="formats-copy">
            <div className="section-kicker">THE RIGHT FORMAT FOR YOU</div>
            <h2>Keep what you need.<br /><span>Skip the clutter.</span></h2>
            <p>When supported by the source, your results can offer different formats for how you want to use your media.</p>
            <div className="format-points">
              <div><span className="point-check"><Check size={14} /></span> Clear format and quality labels</div>
              <div><span className="point-check"><Check size={14} /></span> Audio options where available</div>
              <div><span className="point-check"><Check size={14} /></span> Straightforward download actions</div>
            </div>
          </div>
          <div className="format-preview">
            <div className="preview-window-top"><div className="window-dots"><i /><i /><i /></div><span>AVAILABLE OPTIONS</span><span className="preview-status"><span /> PREVIEW</span></div>
            <div className="preview-media">
              <div className="preview-play"><FileVideo size={27} /></div>
              <div className="preview-media-copy"><span className="preview-tag">MEDIA LINK</span><strong>Your media preview</strong><small>Real results appear after API connection</small></div>
            </div>
            <div className="format-option">
              <span className="file-type video-type"><FileVideo size={20} /></span>
              <span className="format-label"><strong>MP4 Video</strong><small>Video · Quality when available</small></span>
              <span className="format-chip">VIDEO</span>
              <span className="option-download"><ArrowDownToLine size={17} /></span>
            </div>
            <div className="format-option">
              <span className="file-type audio-type"><FileAudio size={20} /></span>
              <span className="format-label"><strong>MP3 Audio</strong><small>Audio · If conversion is supported</small></span>
              <span className="format-chip audio-chip">AUDIO</span>
              <span className="option-download"><ArrowDownToLine size={17} /></span>
            </div>
            <div className="preview-disclaimer">Illustrative preview — these are not live download options yet.</div>
          </div>
        </section>

        <section className="faq-section" id="faq">
          <div className="section-wrap faq-wrap">
            <div>
              <div className="section-kicker">GOOD TO KNOW</div>
              <h2>A few quick<br /><span>answers.</span></h2>
              <p className="faq-intro">Have a question before you drop your first link? Start here.</p>
            </div>
            <div className="faq-list">
              <details>
                <summary>Is the downloader connected to media platforms yet?<ChevronDown size={18} /></summary>
                <p>Not yet. This is the interface-first version. A backend and platform-compatible media service must be connected before links can be analyzed or downloaded.</p>
              </details>
              <details>
                <summary>Will every link work? <ChevronDown size={18} /></summary>
                <p>No. Availability depends on the platform, privacy settings, regional restrictions, format support, and the permissions for that content.</p>
              </details>
              <details>
                <summary>Can I use it on my phone? <ChevronDown size={18} /></summary>
                <p>Yes. The layout adapts to mobile, tablet, and desktop screens.</p>
              </details>
              <details>
                <summary>Is it free to use? <ChevronDown size={18} /></summary>
                <p>This starter interface has no payment system. Hosting, bandwidth, and any media-processing service may have costs once you connect the backend.</p>
              </details>
            </div>
          </div>
        </section>

        <section className="bottom-cta section-wrap">
          <div className="cta-spark"><Sparkles size={21} /></div>
          <div><h2>Ready when you are.</h2><p>Your next step is just one link away.</p></div>
          <a href="#downloader" className="cta-button">Try the link box <ArrowRight size={17} /></a>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#"><span className="brand-mark"><ArrowDownToLine size={19} strokeWidth={2.8} /></span><span>linkdrop<span className="brand-period">.</span></span></a>
        <span>Independent interface prototype · Not affiliated with any listed platform</span>
        <a href="#faq">Help & FAQ <ArrowRight size={14} /></a>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
