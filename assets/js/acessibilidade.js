/**
 * HITBOXE — Painel de Acessibilidade
 */
(function () {
  'use strict';

  const styleVLibras = document.createElement('style');
  styleVLibras.innerHTML = `
    #a11y-fab, #a11y-panel { z-index: 2147483647 !important; }
    
    /* VLibras EM CIMA do ícone do painel */
    div[vw] {
      position: fixed !important;
      bottom: 95px !important;  
      right: 28px !important;    
      top: auto !important;
      left: auto !important;
      transform: none !important;
      z-index: 2147483646 !important; 
      pointer-events: none !important; 
    }
    
    div[vw] [vw-access-button], div[vw] [vw-plugin-wrapper] {
      pointer-events: auto !important;
    }
    
    body.a11y-panel-open div[vw] {
      bottom: 480px !important;
    }
  `;
  document.head.appendChild(styleVLibras);

  const STORAGE_KEY = 'hitboxe_a11y';
  function loadState() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } }
  function saveState(obj) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch {} }

  function injectVLibras() {
    if (document.getElementById('vlibras-widget-script')) return;
    const s = document.createElement('script');
    s.id = 'vlibras-widget-script';
    s.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    s.onload = () => { try { new window.VLibras.Widget('https://vlibras.gov.br/app'); } catch {} };
    document.head.appendChild(s);
    if (!document.querySelector('[vw]')) {
      const vw = document.createElement('div');
      vw.setAttribute('vw', '');
      vw.className = 'enabled';
      vw.innerHTML = '<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
      document.body.appendChild(vw);
    }
  }
  injectVLibras();

  /* Leitor de Texto (TTS) */
  let ttsActive = false;
  function ttsSpeak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR'; u.rate = 0.95; u.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith('pt'));
    if (ptVoice) u.voice = ptVoice;
    window.speechSynthesis.speak(u);
  }
  function ttsClickHandler(e) {
    const el = e.target.closest('p, h1, h2, h3, h4, li, label, span, a, button');
    if (!el) return;
    const text = el.innerText || el.textContent;
    if (text && text.trim().length > 2) ttsSpeak(text.trim());
  }
  function enableTTS() {
    ttsActive = true; document.body.classList.add('a11y-tts-mode');
    document.addEventListener('click', ttsClickHandler, true); ttsSpeak('Leitor ativado.');
  }
  function disableTTS() {
    ttsActive = false; document.body.classList.remove('a11y-tts-mode');
    document.removeEventListener('click', ttsClickHandler, true);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  /* Filtros para Daltonismo */
  const FILTERS = { nenhum: '', deuteranopia:'url(#a11y-deuteranopia)', protanopia:'url(#a11y-protanopia)', tritanopia:'url(#a11y-tritanopia)' };
  function injectSVGFilters() {
    if (document.getElementById('a11y-svg-filters')) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'a11y-svg-filters');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
    svg.innerHTML = `<defs>
      <filter id="a11y-deuteranopia"><feColorMatrix type="matrix" values="0.367 0.861 -0.228 0 0 0.280 0.673 0.047 0 0 -0.012 0.043 0.969 0 0 0 0 0 1 0"/></filter>
      <filter id="a11y-protanopia"><feColorMatrix type="matrix" values="0.152 1.053 -0.205 0 0 0.115 0.786 0.099 0 0 -0.004 -0.048 1.052 0 0 0 0 0 1 0"/></filter>
      <filter id="a11y-tritanopia"><feColorMatrix type="matrix" values="1.256 -0.077 -0.179 0 0 -0.078 0.931 0.148 0 0 0.005 0.692 0.303 0 0 0 0 0 1 0"/></filter>
    </defs>`;
    document.body.insertAdjacentElement('afterbegin', svg);
  }
  function applyColorFilter(type) {
    injectSVGFilters(); document.documentElement.style.filter = FILTERS[type] || '';
    document.body.classList.remove('a11y-deuteranopia','a11y-protanopia','a11y-tritanopia');
    if (type !== 'nenhum') document.body.classList.add('a11y-' + type);
  }

  function buildPanel() {
    const state = loadState();
    const fab = document.createElement('button');
    fab.id = 'a11y-fab';
    fab.innerHTML = `<svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="4" r="2"/><path d="M4 8h16M8 8v8l4-2 4 2V8M12 14v6"/></svg>`;

    const panel = document.createElement('div');
    panel.id = 'a11y-panel';
    panel.innerHTML = `
      <div class="a11y-panel-header">
        <h2 class="a11y-panel-title">Acessibilidade</h2>
        <button id="a11y-close" class="a11y-close-btn"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
      </div>
      <div class="a11y-section">
        <div class="a11y-section-label">Leitor de texto</div>
        <button id="a11y-tts-btn" class="a11y-toggle-btn ${state.tts ? 'active' : ''}">
          <span class="a11y-toggle-track"><span class="a11y-toggle-thumb"></span></span>
          <span class="a11y-toggle-label">${state.tts ? 'Ativado' : 'Desativado'}</span>
        </button>
      </div>
      <div class="a11y-section a11y-section--color">
        <div class="a11y-section-label">Modo daltônico</div>
        <div class="a11y-color-options">
          ${[{v:'nenhum',l:'Normal'},{v:'deuteranopia',l:'Deuteranopia'},{v:'protanopia',l:'Protanopia'},{v:'tritanopia',l:'Tritanopia'}].map(o => `
            <label class="a11y-radio-label ${(state.colorFilter||'nenhum')===o.v?'checked':''}">
              <input type="radio" name="a11y-color" value="${o.v}" ${(state.colorFilter||'nenhum')===o.v?'checked':''}><span>${o.l}</span>
            </label>`).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(fab);
    document.body.appendChild(panel);

    function openPanel() { panel.classList.add('open'); document.body.classList.add('a11y-panel-open'); }
    function closePanel() { panel.classList.remove('open'); document.body.classList.remove('a11y-panel-open'); }
    
    // Toggle clicking the FAB
    fab.addEventListener('click', (e) => {
        e.stopPropagation(); // Previne fechar logo em seguida
        panel.classList.contains('open') ? closePanel() : openPanel();
    });
    
    document.getElementById('a11y-close').addEventListener('click', closePanel);

    // FECHAR AO CLICAR FORA! 
    document.addEventListener('click', (e) => {
      // Se o painel está aberto, o clique não foi no painel e nem no botão VLibras
      if (panel.classList.contains('open') && !panel.contains(e.target) && !e.target.closest('[vw]')) {
        closePanel();
      }
    });

    const ttsBtn = document.getElementById('a11y-tts-btn');
    if (state.tts) enableTTS();
    ttsBtn.addEventListener('click', () => {
      const active = ttsBtn.classList.toggle('active');
      ttsBtn.querySelector('.a11y-toggle-label').textContent = active ? 'Ativado' : 'Desativado';
      active ? enableTTS() : disableTTS();
      saveState({ ...loadState(), tts: active });
    });

    if (state.colorFilter && state.colorFilter !== 'nenhum') applyColorFilter(state.colorFilter);
    panel.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        panel.querySelectorAll('.a11y-radio-label').forEach(l => l.classList.remove('checked'));
        radio.closest('.a11y-radio-label').classList.add('checked');
        applyColorFilter(radio.value);
        saveState({ ...loadState(), colorFilter: radio.value });
      });
    });
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', buildPanel); } else { buildPanel(); }
})();







        (function () {
            'use strict';

            const root = document.getElementById('hb-accessibility');
            const panel = document.getElementById('hb-access-panel');
            const opener = document.getElementById('hb-access-button');
            const closeButton = document.getElementById('hb-close');
            const status = document.getElementById('hb-status');
            const guide = document.getElementById('hb-reading-guide');

            const options = [
                'text-large',
                'text-xlarge',
                'contrast',
                'gray',
                'readable',
                'spacing',
                'lines',
                'links',
                'targets',
                'focus',
                'motion',
                'guide'
            ];

            const modes = [
                'none',
                'strong',
                'protan',
                'deutan',
                'tritan'
            ];

            let preferences = {};

            try {
                preferences = JSON.parse(
                    localStorage.getItem('hitboxe-a11y-v6') || '{}'
                ) || {};
            } catch (error) {
                preferences = {};
            }

            if (!modes.includes(preferences.cvd)) {
                preferences.cvd = 'none';
            }

            if (
                preferences.motion === undefined &&
                window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ) {
                preferences.motion = true;
            }

            function applyPreferences() {
                options.forEach(function (option) {
                    const active = !!preferences[option];

                    document.documentElement.classList.toggle(
                        'hb-' + option,
                        active
                    );

                    const button = root.querySelector(
                        '[data-option="' + option + '"]'
                    );

                    if (button) {
                        button.setAttribute('aria-pressed', String(active));
                    }
                });

                modes.filter(function (mode) {
                    return mode !== 'none';
                }).forEach(function (mode) {
                    document.documentElement.classList.toggle(
                        'hb-cvd-' + mode,
                        preferences.cvd === mode
                    );
                });

                root.querySelectorAll('[data-cvd]').forEach(function (button) {
                    button.setAttribute(
                        'aria-pressed',
                        String(button.dataset.cvd === preferences.cvd)
                    );
                });

                document.querySelectorAll('video').forEach(function (video) {
                    if (preferences.motion) {
                        video.pause();
                    } else if (video.autoplay && video.paused) {
                        const request = video.play();

                        if (request && request.catch) {
                            request.catch(function () {});
                        }
                    }
                });

                try {
                    localStorage.setItem(
                        'hitboxe-a11y-v6',
                        JSON.stringify(preferences)
                    );
                } catch (error) {}
            }

            function togglePanel(open) {
                panel.setAttribute('aria-hidden', String(!open));
                opener.setAttribute('aria-expanded', String(open));

                if (open) {
                    closeButton.focus();
                } else {
                    opener.focus();
                }
            }

            opener.addEventListener('click', function () {
                togglePanel(
                    panel.getAttribute('aria-hidden') === 'true'
                );
            });

            closeButton.addEventListener('click', function () {
                togglePanel(false);
            });

            document.addEventListener('keydown', function (event) {
                if (
                    event.key === 'Escape' &&
                    panel.getAttribute('aria-hidden') === 'false'
                ) {
                    togglePanel(false);
                }
            });

            root.querySelectorAll('[data-option]').forEach(function (button) {
                button.addEventListener('click', function () {
                    const option = button.dataset.option;

                    preferences[option] = !preferences[option];

                    if (option === 'text-large' && preferences[option]) {
                        preferences['text-xlarge'] = false;
                    }

                    if (option === 'text-xlarge' && preferences[option]) {
                        preferences['text-large'] = false;
                    }

                    if (option === 'gray' && preferences[option]) {
                        preferences.cvd = 'none';
                    }

                    applyPreferences();

                    status.textContent =
                        button.textContent.trim() +
                        (preferences[option] ? ' ativado.' : ' desativado.');
                });
            });

            root.querySelectorAll('[data-cvd]').forEach(function (button) {
                button.addEventListener('click', function () {
                    preferences.cvd = button.dataset.cvd;

                    if (preferences.cvd !== 'none') {
                        preferences.gray = false;
                    }

                    applyPreferences();

                    status.textContent =
                        'Modo de cores: ' + button.textContent.trim();
                });
            });

            document.addEventListener('play', function (event) {
                if (
                    preferences.motion &&
                    event.target instanceof HTMLMediaElement
                ) {
                    event.target.pause();
                }
            }, true);

            let speechVersion = 0;

            function stopSpeech() {
                speechVersion++;

                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                }
            }

            function getPageText() {
                const elements = document.querySelectorAll(
                    '.hero-section, ' +
                    '.choseus-section, ' +
                    '.banner-section, ' +
                    '.pricing-section, ' +
                    '.gettouch-section'
                );

                return Array.from(elements)
                    .map(function (element) {
                        return element.innerText || '';
                    })
                    .join(' ')
                    .replace(/\s+/g, ' ')
                    .trim();
            }

            document.getElementById('hb-speech').addEventListener('click', function () {
                if (!('speechSynthesis' in window)) {
                    status.textContent = 'Leitura por voz indisponível.';
                    return;
                }

                const selection = window.getSelection().toString().trim();
                const content = selection || getPageText();

                if (!content) {
                    status.textContent = 'Não há texto para ler.';
                    return;
                }

                stopSpeech();

                const currentVersion = speechVersion;
                const chunks = content.match(/.{1,180}(?:\s|$)/g) || [content];

                let index = 0;

                function next() {
                    if (currentVersion !== speechVersion) {
                        return;
                    }

                    if (index >= chunks.length) {
                        status.textContent = 'Leitura concluída.';
                        return;
                    }

                    const utterance = new SpeechSynthesisUtterance(
                        chunks[index++]
                    );

                    utterance.lang = 'pt-BR';
                    utterance.rate = 0.9;
                    utterance.onend = next;

                    utterance.onerror = function (event) {
                        if (event.error !== 'canceled') {
                            status.textContent = 'Erro na leitura.';
                        }
                    };

                    window.speechSynthesis.speak(utterance);
                }

                next();
                status.textContent = 'Leitura iniciada.';
            });

            document.getElementById('hb-stop-speech').addEventListener('click', function () {
                stopSpeech();
                status.textContent = 'Leitura interrompida.';
            });

            document.getElementById('hb-reset').addEventListener('click', function () {
                stopSpeech();

                preferences = {
                    cvd: 'none'
                };

                applyPreferences();
                status.textContent = 'Preferências restauradas.';
            });

            document.addEventListener('pointermove', function (event) {
                if (preferences.guide) {
                    guide.style.top =
                        Math.max(0, event.clientY - 20) + 'px';
                }
            }, { passive: true });

            const script = document.createElement('script');

            script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';

            script.onload = function () {
                if (
                    window.VLibras &&
                    typeof window.VLibras.Widget === 'function'
                ) {
                    new window.VLibras.Widget(
                        'https://vlibras.gov.br/app'
                    );
                }
            };

            document.head.appendChild(script);

            applyPreferences();
        })();