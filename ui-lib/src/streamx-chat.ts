import { formatAiOutput } from './formatter/formatAiOutput';
import { defaultProductsFormatter } from './formatter/defaultProductsFormatter';
import type { ProductsSchema } from './formatter/defaultProductsFormatter';
import { ChatRenderer } from './ChatRenderer';

/**
 * <streamx-chat> — Web Component
 *
 * Usage:
 *   <script type="module" src="streamx-chat.js"></script>
 *   <streamx-chat api-url="http://localhost:8081" title="Assistant"></streamx-chat>
 *
 * Attributes:
 *   api-url      – RAG service base URL (default: same origin as the page)
 *   title        – Header title          (default: Assistant)
 *   placeholder  – Input placeholder     (default: Type your question…)
 *   welcome      – First bot message     (default: generic, content-agnostic)
 *   auto-open    – Open on load after N ms, e.g. auto-open="1500"
 */
export class StreamxChat extends HTMLElement {
  private readonly shadow: ShadowRoot;
  private open: boolean;
  private streaming: boolean;
  private sessionId: string;
  private apiUrl: string;

  /** Default greeting when no `welcome` attribute is set — domain-neutral. */
  public static DEFAULT_WELCOME =
    'How can I help you today? Ask in your own words — I will answer in the same language you use.';

  /* ─── observed attributes ─────────────────────────────────── */
  public static get observedAttributes() {
    return ['api-url', 'title', 'placeholder', 'welcome', 'auto-open'];
  }

  constructor() {
    super();
    this.shadow    = this.attachShadow({ mode: 'open' });
    this.open      = false;
    this.streaming = false;
    this.sessionId = this.loadOrCreateSession();
  }

  private loadOrCreateSession() {
    const key = 'streamx-chat-session';
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(key, id);
    }
    return id;
  }

  /* ─── lifecycle ────────────────────────────────────────────── */
  public connectedCallback() {
    this.injectFont();
    this.render();
    this.bind();

    const delay = parseInt(this.getAttribute('auto-open') ?? '0', 10);
    if (delay > 0) setTimeout(() => this.toggleChat(), delay);
  }

  public attributeChangedCallback(name: string, _old: string, val: string) {
    if (!this.shadow.querySelector('.w-root')) return; // not rendered yet
    if (name === 'title')       this.shadow.querySelector('.w-header-name').textContent = val;
    if (name === 'placeholder') (this.shadow.querySelector('.w-textarea') as HTMLTextAreaElement).placeholder    = val;
    if (name === 'welcome') {
      const el = this.shadow.getElementById('welcomeBubble');
      if (el) el.innerHTML = (val || StreamxChat.DEFAULT_WELCOME).replace(/\n/g, '<br>');
    }
  }

  /* ─── font (inject once into real document head) ────────────── */
  private injectFont() {
    const id = 'streamx-inter-font';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id   = id;
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }

  /* ─── template ─────────────────────────────────────────────── */
  private render() {
    let apiUrl        = this.getAttribute('api-url')     || window.location.origin;
    const title       = this.getAttribute('title')       || 'Assistant';
    const placeholder = this.getAttribute('placeholder') || 'Type your question…';
    const welcomeRaw  = this.getAttribute('welcome')       || StreamxChat.DEFAULT_WELCOME;

    this.shadow.innerHTML = ChatRenderer.render({ title, placeholder, welcome: welcomeRaw });

    this.apiUrl = `${apiUrl}/api/chat`;
  }

  /* ─── event binding ────────────────────────────────────────── */
  private bind() {
    const s = this.shadow;

    s.getElementById('chat-bubble').addEventListener('click', () => this.toggleChat());
    s.getElementById('closeBtn').addEventListener('click',   () => this.toggleChat(false));
    s.getElementById('clearBtn').addEventListener('click',   () => this.clearChat());
    s.getElementById('sendBtn').addEventListener('click',    () => this.sendMessage());
    s.getElementById('input').addEventListener('keydown',    e  => this.handleKey(e));
    s.getElementById('input').addEventListener('input',      e  => this.autoResize(e.target));
  }

  /* ─── helpers ──────────────────────────────────────────────── */
  private toggleChat(force?: boolean) {
    const s      = this.shadow;
    this.open   = force !== undefined ? force : !this.open;
    s.getElementById('chat-panel').classList.toggle('open', this.open);
    s.getElementById('chat-bubble').classList.toggle('open', this.open);
    if (this.open) {
      s.getElementById('badge').style.display = 'none';
      s.getElementById('input').focus();
      const msgs = s.getElementById('messages');
      msgs.scrollTop = msgs.scrollHeight;
    }
  }

  private clearChat() {
    const s = this.shadow;
    this.sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('streamx-chat-session', this.sessionId);
    const cleared = (this.getAttribute('welcome') || StreamxChat.DEFAULT_WELCOME)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
    s.getElementById('messages').innerHTML = `
      <div class="w-msg bot">
        <div class="w-av">AI</div>
        <div class="w-bubble" id="welcomeBubble">${cleared}</div>
      </div>`;
  }

  private autoResize(el: EventTarget) {
    if ((el instanceof HTMLElement)) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 100) + 'px';
      return;
    }

    console.error('Invalid element');
  }

  private handleKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); }
  }

  private ts() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private addMessage(role: string, text: string) {
    const msgs = this.shadow.getElementById('messages');
    const wrap = document.createElement('div');
    wrap.className = `w-msg ${role}`;

    const av = document.createElement('div');
    av.className = 'w-av';
    av.textContent = role === 'bot' ? 'AI' : 'You';

    const bub = document.createElement('div');
    bub.className = 'w-bubble';
    bub.innerHTML = this.md(text);

    const time = document.createElement('div');
    time.className = 'w-ts';
    time.textContent = this.ts();

    if (role === 'user') {
      wrap.appendChild(time);
      wrap.appendChild(bub);
      wrap.appendChild(av);
    } else {
      wrap.appendChild(av);
      wrap.appendChild(bub);
    }

    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
    return bub;
  }

  private addTyping() {
    const msgs = this.shadow.getElementById('messages');
    const wrap = document.createElement('div');
    wrap.className = 'w-msg bot typing';
    wrap.id = 'typing';
    wrap.innerHTML = `<div class="w-av">AI</div><div class="w-bubble"><div class="w-dot"></div><div class="w-dot"></div><div class="w-dot"></div></div>`;
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  private removeTyping() {
    this.shadow.getElementById('typing')?.remove();
  }

  private md(text: string) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/\n/g, '<br>');
  }

  private async sendMessage() {
    const s     = this.shadow;
    const input = s.getElementById('input') as HTMLInputElement;
    const q     = input.value.trim();
    if (!q || this.streaming) return;

    this.streaming = true;
    (s.getElementById('sendBtn') as HTMLButtonElement).disabled = true;
    input.value = '';
    input.style.height = 'auto';

    this.addMessage('user', q);
    this.addTyping();

    try {
      const resp = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ question: q, sessionId: this.sessionId })
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      this.removeTyping();
      const botBub = this.addMessage('bot', '');

      const data = await resp.json() as ProductsSchema;
      botBub.innerHTML = formatAiOutput(data, defaultProductsFormatter);

    } catch (err) {
      this.removeTyping();
      this.addMessage('bot', `⚠️ ${err.message}\n\nMake sure the RAG service is running.`);
    }

    this.streaming = false;
    (s.getElementById('sendBtn') as HTMLButtonElement).disabled = false;
    input.focus();
  }
}