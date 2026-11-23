(function () {
    'use strict';

    // PASSO 1
    function whenReady(callback) {
        if (document.getElementById('hb-accessibility')) {
            callback();
            return;
        }
        const observer = new MutationObserver(function () {
            if (document.getElementById('hb-accessibility')) {
                observer.disconnect();
                callback();
            }
        });
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    // PASSO 2
    function loadVLibras() {
        if (!document.querySelector('[vw]')) {
            const wrapper = document.createElement('div');
            wrapper.setAttribute('vw', '');
            wrapper.className = 'enabled';
            wrapper.innerHTML =
                '<div vw-access-button class="active"></div>' +
                '<div vw-plugin-wrapper>' +
                '<div class="vw-plugin-top-wrapper"></div>' +
                '</div>';
            document.body.appendChild(wrapper);
        }

        if (document.getElementById('vlibras-script')) return;

        const script = document.createElement('script');
        script.id = 'vlibras-script';
        script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
        script.onload = function () {
            if (window.VLibras && typeof window.VLibras.Widget === 'function') {
                new window.VLibras.Widget('https://vlibras.gov.br/app');
            }
        };
        document.head.appendChild(script);
    }

    // PASSO 3
    function init() {
        const root = document.getElementById('hb-accessibility');
        const panel = document.getElementById('hb-access-panel');
        const opener = document.getElementById('hb-access-button');
        const closeButton = document.getElementById('hb-close');
        const status = document.getElementById('hb-status');
        const guide = document.getElementById('hb-reading-guide');

        const options = [
            'text-large', 'text-xlarge', 'contrast', 'gray', 'readable',
            'spacing', 'lines', 'links', 'targets', 'focus', 'motion', 'guide'
        ];

        const modes = ['none', 'strong', 'protan', 'deutan', 'tritan'];

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
                document.documentElement.classList.toggle('hb-' + option, active);
                const button = root.querySelector('[data-option="' + option + '"]');
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
                        request.catch(function () { });
                    }
                }
            });

            try {
                localStorage.setItem('hitboxe-a11y-v6', JSON.stringify(preferences));
            } catch (error) { }
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
            togglePanel(panel.getAttribute('aria-hidden') === 'true');
        });

        closeButton.addEventListener('click', function () {
            togglePanel(false);
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && panel.getAttribute('aria-hidden') === 'false') {
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
                status.textContent = 'Modo de cores: ' + button.textContent.trim();
            });
        });

        document.addEventListener('play', function (event) {
            if (preferences.motion && event.target instanceof HTMLMediaElement) {
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
                '.hero-section, .choseus-section, .banner-section, ' +
                '.pricing-section, .gettouch-section'
            );
            return Array.from(elements)
                .map(function (element) { return element.innerText || ''; })
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
                if (currentVersion !== speechVersion) return;

                if (index >= chunks.length) {
                    status.textContent = 'Leitura concluída.';
                    return;
                }

                const utterance = new SpeechSynthesisUtterance(chunks[index++]);
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
            preferences = { cvd: 'none' };
            applyPreferences();
            status.textContent = 'Preferências restauradas.';
        });

        document.addEventListener('pointermove', function (event) {
            if (preferences.guide) {
                guide.style.top = Math.max(0, event.clientY - 20) + 'px';
            }
        }, { passive: true });

        applyPreferences();
        loadVLibras();
    }

    // PASSO 4
    whenReady(init);
})();