/**
 * PASSPORT RADIO - MPB TUNNEL™ WATCHDOG
 * Engenharia de Resiliência para Stream Icecast/Shoutcast
 *
 * Este módulo NÃO substitui o orquestrador (radio-tunnels-ui.js).
 * Ele atua como um "cão de guarda" para o elemento de áudio,
 * garantindo que o stream se recupere de quedas de rede, lock-screen e proxies.
 */

(function() {
    const AUDIO_ID = 'passportMPBAudio';
    // O ponto e vírgula (;) no final é vital para enganar proxies de operadoras
    // que tentam bufferizar streams Icecast como se fossem arquivos para download.
    const STREAM_URL = 'https://srv1.braudio.com.br:7008/;';

    const audio = document.getElementById(AUDIO_ID);
    if (!audio) {
        console.warn('[MPB Watchdog] Elemento de áudio não encontrado.');
        return;
    }

    let isSupposedToPlay = false;
    let watchdogInterval = null;
    let recoveryTimeout = null;

    // 1. Hook nos eventos nativos para saber a intenção do usuário (via Orquestrador)
    audio.addEventListener('play', () => {
        isSupposedToPlay = true;
        startWatchdog();
    });

    audio.addEventListener('pause', () => {
        isSupposedToPlay = false;
        stopWatchdog();
        clearRecovery();
    });

    audio.addEventListener('ended', () => {
        // Streams de rádio não deveriam ter 'ended', se tiver, o socket caiu.
        if (isSupposedToPlay) triggerRecovery(500);
    });

    // 2. Detecção de falhas de rede e buffer
    ['error', 'stalled', 'suspend'].forEach(evt => {
        audio.addEventListener(evt, (e) => {
            if (isSupposedToPlay) {
                console.warn(`[MPB Watchdog] Evento '${evt}' detectado. Iniciando recuperação...`);
                triggerRecovery(1500);
            }
        });
    });

    // 3. Recuperação de Lock Screen / Background (Mobile)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && isSupposedToPlay) {
            // Se a tela voltou e o áudio está travado ou pausado indevidamente
            if (audio.paused || audio.ended || audio.networkState === 3 /* NETWORK_NO_SOURCE */) {
                triggerRecovery(300);
            }
        }
    });

    // 4. Recuperação de Troca de Rede (Wi-Fi -> 4G)
    window.addEventListener('online', () => {
        if (isSupposedToPlay) triggerRecovery(500);
    });

    function triggerRecovery(delay = 1000) {
        clearRecovery();
        recoveryTimeout = setTimeout(() => {
            if (!isSupposedToPlay) return; // O usuário pode ter pausado durante o delay

            // Cache-buster para forçar o browser a abrir um novo socket TCP
            const cacheBuster = `?t=${Date.now()}`;

            // Pausa momentânea para limpar o socket antigo
            audio.pause();
            audio.src = STREAM_URL + cacheBuster;
            audio.load();

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.warn('[MPB Watchdog] Autoplay bloqueado na recuperação:', err);
                });
            }
        }, delay);
    }

    function clearRecovery() {
        if (recoveryTimeout) {
            clearTimeout(recoveryTimeout);
            recoveryTimeout = null;
        }
    }

    function startWatchdog() {
        stopWatchdog();
        // Checa a saúde do stream a cada 5 segundos
        watchdogInterval = setInterval(() => {
            if (!isSupposedToPlay) return;

            // networkState === 3 indica que o browser perdeu a fonte
            if (audio.paused || audio.ended || audio.networkState === 3) {
                triggerRecovery(100);
            }
        }, 5000);
    }

    function stopWatchdog() {
        if (watchdogInterval) {
            clearInterval(watchdogInterval);
            watchdogInterval = null;
        }
    }

    // Inicialização
    console.log('[MPB Watchdog] Módulo de resiliência inicializado.');
})();
