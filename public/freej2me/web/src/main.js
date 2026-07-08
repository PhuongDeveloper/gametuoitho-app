import { LibMedia } from "../libmedia/libmedia.js";
import { LibMidi, createUnlockingAudioContext } from "../libmidi/libmidi.js";
import { codeMap, KeyRepeatManager } from "./key.js";
import { EventQueue } from "./eventqueue.js";
import { initKbdListeners, setKbdHandler, kbdWidth, kbdHeight } from "./screenKbd.js";

// we need to import natives here, don't use System.loadLibrary
// since CheerpJ fails to load them in firefox and we can't set breakpoints
import canvasFontNatives from "../libjs/libcanvasfont.js";
import canvasGraphicsNatives from "../libjs/libcanvasgraphics.js";
import gles2Natives from "../libjs/libgles2.js";
import jsReferenceNatives from "../libjs/libjsreference.js";
import mediaBridgeNatives from "../libjs/libmediabridge.js";
import midiBridgeNatives from "../libjs/libmidibridge.js";

// [Ultimate Total Anti-Crash Suite] Completely annihilates ERR_CACHE_OPERATION_NOT_SUPPORTED, ServiceWorker conflicts, iOS Audio crashes, and Worker crashes
(function() {
    if (typeof window === 'undefined' || window._cheerpjUltimatePatched) return;
    window._cheerpjUltimatePatched = true;
    window._cheerpjSessionId = Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);

    // 0. Exterminate Broken Service Workers (Root cause of persistent browser-specific cache crashes!)
    if (navigator.serviceWorker) {
        navigator.serviceWorker.getRegistrations().then(function(regs) {
            for (let i = 0; i < regs.length; i++) {
                let reg = regs[i];
                if (reg && reg.scope && (reg.scope.includes('cheerpj') || reg.scope.includes('freej2me') || reg.scope.includes('leaningtech') || reg.scope.includes('/web/'))) {
                    reg.unregister();
                    console.warn('[CheerpJ Anti-Crash] Unregistered old broken ServiceWorker:', reg.scope);
                }
            }
        }).catch(function(){});
        if (navigator.serviceWorker.register) {
            navigator.serviceWorker.register = async function(...args) {
                console.warn('[CheerpJ Anti-Crash] ServiceWorker registration intercepted and disabled:', args);
                return { active: null, installing: null, waiting: null, scope: location.href, unregister: async () => true, addEventListener: () => {} };
            };
        }
    }

    // 1. iOS Safari Web Audio Safeguard (Prevents AudioContext initialization crash before touch)
    if (window.AudioContext || window.webkitAudioContext) {
        const OrigAC = window.AudioContext || window.webkitAudioContext;
        const SafeAC = function(...args) {
            try { return new OrigAC(...args); }
            catch(e) {
                console.warn('[CheerpJ Audio Safeguard] AudioContext initialization blocked by iOS/Safari:', e);
                return { createGain: ()=>{}, createOscillator: ()=>{}, destination: {}, close: async ()=>{}, resume: async ()=>{} };
            }
        };
        SafeAC.prototype = OrigAC.prototype;
        window.AudioContext = SafeAC;
        if (window.webkitAudioContext) window.webkitAudioContext = SafeAC;
    }

    // 2. Global Unhandled Rejection & Error Interceptor (Prevents background Range download glitches from crashing game)
    window.addEventListener('unhandledrejection', function(event) {
        const reasonStr = (event.reason ? event.reason.message || event.reason.toString() || '' : '').toUpperCase();
        if (reasonStr.includes('CACHE') || reasonStr.includes('OPERATION_NOT_SUPPORTED') || reasonStr.includes('RANGE') || reasonStr.includes('NETWORK') || reasonStr.includes('LEANINGTECH') || reasonStr.includes('INDEXEDDB') || reasonStr.includes('QUOTA')) {
            event.preventDefault();
            console.warn('[CheerpJ Global Resilience] Intercepted and neutralized background network/cache error:', event.reason);
        }
    });

    const applyPatchToScope = function(targetScope, sessionId) {
        if (!targetScope || targetScope._cheerpjScopePatched) return;
        targetScope._cheerpjScopePatched = true;
        targetScope._cheerpjSessionId = sessionId;

        // A. Patch XMLHttpRequest (XHR)
        if (targetScope.XMLHttpRequest) {
            const origXhrOpen = targetScope.XMLHttpRequest.prototype.open;
            const origXhrSend = targetScope.XMLHttpRequest.prototype.send;
            
            targetScope.XMLHttpRequest.prototype.open = function(method, url, ...rest) {
                this._method = method;
                this._url = url;
                if (typeof url === 'string' && (url.includes('leaningtech.com') || url.includes('.jar') || url.includes('/jre/') || url.includes('/lib/'))) {
                    const sep = url.includes('?') ? '&' : '?';
                    if (!url.includes('_cb=')) {
                        url = url + sep + '_cb=' + targetScope._cheerpjSessionId;
                        this._url = url;
                    }
                }
                return origXhrOpen.call(this, method, url, ...rest);
            };

            targetScope.XMLHttpRequest.prototype.send = function(...args) {
                const xhr = this;
                if (xhr._url && typeof xhr._url === 'string' && (xhr._url.includes('leaningtech.com') || xhr._url.includes('.jar') || xhr._url.includes('/jre/'))) {
                    xhr.addEventListener('error', function(e) {
                        console.warn('[CheerpJ XHR Anti-Crash] XHR network/cache error in scope:', xhr._url, e);
                    });
                }
                return origXhrSend.apply(this, args);
            };
        }

        // B. Patch fetch (CRITICAL: Chromium throws ERR_CACHE_OPERATION_NOT_SUPPORTED on Range requests unless cache: 'no-store' is explicitly set!)
        if (targetScope.fetch) {
            const origFetch = targetScope.fetch;
            targetScope.fetch = async function(resource, init) {
                let opts = init ? Object.assign({}, init) : {};
                let urlStr = typeof resource === 'string' ? resource : (resource && resource.url ? resource.url : (resource ? resource.toString() : ''));
                
                if (resource && typeof resource === 'object' && resource.url) {
                    if (!opts.method && resource.method) opts.method = resource.method;
                    if (!opts.headers && resource.headers) opts.headers = resource.headers;
                    if (!opts.mode && resource.mode) opts.mode = resource.mode;
                    if (!opts.credentials && resource.credentials) opts.credentials = resource.credentials;
                }

                if (urlStr && (urlStr.includes('leaningtech.com') || urlStr.includes('.jar') || urlStr.includes('/jre/') || urlStr.includes('/lib/') || urlStr.includes('/app/'))) {
                    // 1. MUST FORCE no-store to prevent Chromium disk cache collision on Range requests
                    opts.cache = 'no-store';

                    // 2. MUST APPEND cache buster
                    const sep = urlStr.includes('?') ? '&' : '?';
                    if (!urlStr.includes('_cb=')) {
                        urlStr = urlStr + sep + '_cb=' + targetScope._cheerpjSessionId;
                    }
                }
                try {
                    return await origFetch.call(this, urlStr || resource, opts);
                } catch (err) {
                    const errStr = (err ? err.message || err.toString() || '' : '').toUpperCase();
                    if (errStr.includes('CACHE') || errStr.includes('OPERATION_NOT_SUPPORTED') || err.name === 'TypeError' || err.name === 'DOMException' || err.name === 'NetworkError') {
                        console.warn('[CheerpJ Fetch Anti-Crash] Retrying cleanly with no-store:', urlStr, err);
                        let cleanOpts = Object.assign({}, opts);
                        cleanOpts.cache = 'no-store';
                        const sep = urlStr.includes('?') ? '&' : '?';
                        return await origFetch.call(this, urlStr + sep + '_retry=' + Date.now(), cleanOpts);
                    }
                    throw err;
                }
            };
        }

        // C. Patch Cache Storage API
        if (targetScope.caches && targetScope.caches.open) {
            const origOpen = targetScope.caches.open;
            targetScope.caches.open = async function(...args) {
                try {
                    const cache = await origOpen.apply(this, args);
                    if (cache) {
                        const origPut = cache.put;
                        cache.put = async function(...putArgs) {
                            try { return await origPut.apply(this, putArgs); }
                            catch (e) { console.warn('[CheerpJ Cache Put Bypassed]:', e); }
                        };
                    }
                    return cache;
                } catch (e) {
                    return {
                        match: async () => undefined,
                        matchAll: async () => [],
                        add: async () => undefined,
                        addAll: async () => undefined,
                        put: async () => undefined,
                        delete: async () => false,
                        keys: async () => []
                    };
                }
            };
        }

        // D. Patch IndexedDB (Prevent iOS Safari storage quota/private browsing crashes)
        if (targetScope.indexedDB && targetScope.indexedDB.open) {
            const origIdbOpen = targetScope.indexedDB.open;
            targetScope.indexedDB.open = function(...args) {
                const req = origIdbOpen.apply(this, args);
                req.addEventListener('error', function(e) {
                    console.warn('[CheerpJ IndexedDB Intercepted Error]:', e);
                });
                return req;
            };
        }
    };

    // Apply to Main Window
    applyPatchToScope(window, window._cheerpjSessionId);

    // Intercept Web Workers & Shared Workers
    const patchWorkerConstructor = function(WorkerClass) {
        if (!WorkerClass) return null;
        const PatchedWorker = function(scriptURL, options) {
            try {
                const patchStr = `(${applyPatchToScope.toString()})(self, "${window._cheerpjSessionId}");`;
                let importUrl = typeof scriptURL === 'string' ? scriptURL : (scriptURL ? scriptURL.toString() : '');
                const blobContent = patchStr + '\nimportScripts("' + importUrl + '");';
                const blob = new Blob([blobContent], { type: 'application/javascript' });
                const blobUrl = URL.createObjectURL(blob);
                return new WorkerClass(blobUrl, options);
            } catch (e) {
                console.warn('[CheerpJ Worker Intercept Bypassed]:', e);
                return new WorkerClass(scriptURL, options);
            }
        };
        PatchedWorker.prototype = WorkerClass.prototype;
        return PatchedWorker;
    };

    if (window.Worker) window.Worker = patchWorkerConstructor(window.Worker);
    if (window.SharedWorker) window.SharedWorker = patchWorkerConstructor(window.SharedWorker);

    // Intercept Child Iframes
    if (typeof Element !== 'undefined' && Element.prototype.appendChild) {
        const origAppendChild = Element.prototype.appendChild;
        Element.prototype.appendChild = function(child) {
            const res = origAppendChild.call(this, child);
            if (child && child.tagName === 'IFRAME') {
                try {
                    if (child.contentWindow) applyPatchToScope(child.contentWindow, window._cheerpjSessionId);
                } catch(e) {}
            }
            return res;
        };
    }
})();

const evtQueue = new EventQueue();
const sp = new URLSearchParams(location.search);

const cheerpjWebRoot = '/app'+location.pathname.replace(/\/[^/]*$/,'');

let isMobile = sp.get('mobile');

let display = null;
let screenCtx = null;

let fractionScale = true; // Always enable smooth fractional scaling for best screen utilization
let scaleSet = false;

const keyRepeatManager = new KeyRepeatManager();

window.evtQueue = evtQueue;

function autoscale() {
    if (!scaleSet) return;

    let screenWidth = window.innerWidth;
    let screenHeight = window.innerHeight;

    if (isMobile) {
        document.getElementById('left-keys').style.display = '';
        document.getElementById('right-keys').style.display = '';

        if (screenWidth > screenHeight) {
            document.body.classList.add('kbd-landscape');
            document.body.classList.remove('kbd-portrait');
            screenWidth = screenWidth - 2*kbdWidth;
        } else {
            document.body.classList.add('kbd-portrait');
            document.body.classList.remove('kbd-landscape');
            screenHeight = screenHeight - kbdHeight;
        }
    }

    let scale = Math.min(
        screenWidth/screenCtx.canvas.width,
        screenHeight/screenCtx.canvas.height
    );

    if (!fractionScale) {
        scale = scale|0;
    }

    display.style.zoom = scale;
}

function setListeners() {
    let mouseDown = false;
    let noMouse = false;

    setKbdHandler((isDown, key) => {
        const symbol = key.startsWith('Digit') ? key.substring(5) : '\x00';
        keyRepeatManager.post(isDown, key, {symbol, ctrlKey: false, shiftKey: false});
    });

    function handleKeyEvent(e) {
        const isDown = e.type === 'keydown';
        const code = e.code || e.key;

        if (codeMap[code]) {
            keyRepeatManager.post(isDown, code, {
                symbol: e.key && e.key.length == 1 ? e.key.charCodeAt(0) : '\x00',
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey
            });
        }
        e.preventDefault();
    }

    display.addEventListener('keydown', handleKeyEvent);
    display.addEventListener('keyup', handleKeyEvent);
    window.addEventListener('keydown', handleKeyEvent);
    window.addEventListener('keyup', handleKeyEvent);
    document.addEventListener('keydown', handleKeyEvent);
    document.addEventListener('keyup', handleKeyEvent);

    keyRepeatManager.register((kind, key, args) => {
        if (kind === 'click') {
            if (key === 'Maximize') {
                fractionScale = !fractionScale;
                localStorage && localStorage.setItem("pl.zb3.freej2me.fractionScale", fractionScale);
                autoscale();
            }
        } else if (codeMap[key]) {
            console.log('queuin event');
            evtQueue.queueEvent({
                kind: kind === 'up' ? 'keyup' : 'keydown',
                args: [codeMap[key], args.symbol, args.ctrlKey, args.shiftKey]
            });
        }
    });

    display.addEventListener('mousedown', async e => {
        display.focus();
        if (noMouse) return;

        evtQueue.queueEvent({
            kind: 'pointerpressed',
            x: e.offsetX / display.currentCSSZoom | 0,
            y: e.offsetY / display.currentCSSZoom | 0,
        });

        mouseDown = true;

        e.preventDefault();
    });

    display.addEventListener('mousemove', async e => {
        if (noMouse) return;
        if (!mouseDown) return;

        evtQueue.queueEvent({
            kind: 'pointerdragged',
            x: e.offsetX / display.currentCSSZoom | 0,
            y: e.offsetY / display.currentCSSZoom | 0,
        });

        e.preventDefault();
    });

    document.addEventListener('mouseup', async e => {
        if (noMouse) return;
        if (!mouseDown) return;

        mouseDown = false;

        evtQueue.queueEvent({
            kind: 'pointerreleased',
            x: (e.pageX - display.offsetLeft) / display.currentCSSZoom | 0,
            y: (e.pageY - display.offsetTop) / display.currentCSSZoom | 0,
        });

        e.preventDefault();
    });


    display.addEventListener('touchstart', async e => {
        display.focus();
        noMouse = true;

        evtQueue.queueEvent({
            kind: 'pointerpressed',
            x: (e.changedTouches[0].pageX - display.offsetLeft) / display.currentCSSZoom | 0,
            y: (e.changedTouches[0].pageY - display.offsetTop) / display.currentCSSZoom | 0,
        });

        e.preventDefault();
    }, {passive: false});

    display.addEventListener('touchmove', async e => {
        noMouse = true;

        evtQueue.queueEvent({
            kind: 'pointerdragged',
            x: (e.changedTouches[0].pageX - display.offsetLeft) / display.currentCSSZoom | 0,
            y: (e.changedTouches[0].pageY - display.offsetTop) / display.currentCSSZoom | 0,
        });

        e.preventDefault();
    }, {passive: false});

    display.addEventListener('touchend', async e => {
        noMouse = true;

        evtQueue.queueEvent({
            kind: 'pointerreleased',
            x: (e.changedTouches[0].pageX - display.offsetLeft) / display.currentCSSZoom | 0,
            y: (e.changedTouches[0].pageY - display.offsetTop) / display.currentCSSZoom | 0,
        });

        e.preventDefault();
    });

    document.addEventListener('mousedown', e => {
        console.log('refocus');
        setTimeout(() => display.focus(), 20);
        ;
    });

    display.addEventListener('blur', e => {
        console.log('refocus');
        // it doesn't work without any timeout
        setTimeout(() => display.focus(), 10);
        ;
    });

    window.addEventListener('resize', autoscale);

    initKbdListeners();
}

function setFaviconFromBuffer(arrayBuffer) {
    const blob = new Blob([arrayBuffer], { type: 'image/png' });

    const reader = new FileReader();
    reader.onload = function() {
        const dataURL = reader.result;

        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', 'icon');
            document.head.appendChild(link);
        }
        link.setAttribute('href', dataURL);
    };
    reader.readAsDataURL(blob);
}

async function ensureAppInstalled(lib, appId) {
    const appFile = await cjFileBlob(appId + "/app.jar");

    if (!appFile) {
        const launcherUtil = await lib.pl.zb3.freej2me.launcher.LauncherUtil;

        await launcherUtil.installFromBundle(cheerpjWebRoot + "/apps/", appId);
    }
}

async function init() {
    document.getElementById("loading").textContent = "Loading CheerpJ...";

    display = document.getElementById('display');
    screenCtx = display.getContext('2d', { alpha: false, desynchronized: true });

    setListeners();

    window.libmidi = new LibMidi(createUnlockingAudioContext());
    await window.libmidi.init();
    window.libmidi.midiPlayer.addEventListener('end-of-media', e => {
        window.evtQueue.queueEvent({kind: 'player-eom', player: e.target});
    })
    window.libmedia = new LibMedia();

    document.addEventListener('visibilitychange', () => {
        try {
            if (document.hidden) {
                if (window.libmidi && window.libmidi.audioCtx && window.libmidi.audioCtx.suspend) {
                    window.libmidi.audioCtx.suspend().catch(() => {});
                }
            } else {
                if (window.libmidi && window.libmidi.audioCtx && window.libmidi.audioCtx.resume) {
                    window.libmidi.audioCtx.resume().catch(() => {});
                }
            }
        } catch (e) {}
    });

    await cheerpjInit({
        enableDebug: false,
        natives: {
            ...canvasFontNatives,
            ...canvasGraphicsNatives,
            ...gles2Natives,
            ...jsReferenceNatives,
            ...mediaBridgeNatives,
            ...midiBridgeNatives,
            async Java_pl_zb3_freej2me_bridge_shell_Shell_setTitle(lib, title) {
                document.title = title;
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_setIcon(lib, iconBytes) {
                if (iconBytes) {
                    setFaviconFromBuffer(iconBytes.buffer);
                }
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_getScreenCtx(lib) {
                return screenCtx;
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_setCanvasSize(lib, width, height) {
                if (!scaleSet) {
                    document.getElementById('loading').hidden = true;
                    display.style.display = '';
                    scaleSet = true;
                    display.focus();
                }
                screenCtx.canvas.width = width;
                screenCtx.canvas.height = height;
                autoscale();
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_waitForAndDispatchEvents(lib, listener) {
                const KeyEvent = await lib.pl.zb3.freej2me.bridge.shell.KeyEvent;
                const PointerEvent = await lib.pl.zb3.freej2me.bridge.shell.PointerEvent;

                const evt = await evtQueue.waitForEvent();
                if (evt.kind == 'keydown') {
                    await listener.keyPressed(await new KeyEvent(...evt.args));
                } else if (evt.kind == 'keyup') {
                    await listener.keyReleased(await new KeyEvent(...evt.args));
                } else if (evt.kind == 'pointerpressed') {
                    await listener.pointerPressed(await new PointerEvent(evt.x, evt.y));
                } else if (evt.kind == 'pointerdragged') {
                    await listener.pointerDragged(await new PointerEvent(evt.x, evt.y));
                } else if (evt.kind == 'pointerreleased') {
                    await listener.pointerReleased(await new PointerEvent(evt.x, evt.y));
                } else if (evt.kind == 'player-eom') {
                    await listener.playerEOM(evt.player);
                } else if (evt.kind == 'player-video-frame') {
                    await listener.playerVideoFrame(evt.player);
                }
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_restart(lib) {
                location.reload();
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_exit(lib) {
                location.href = './';
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_sthop(lib) {
                debugger;
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_say(lib, sth) {
                console.log('[say]', sth);
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_sayObject(lib, label, obj) {
                debugger;
                console.log('[sayobject]', label, obj);
            }
        }
    });

    document.getElementById("loading").textContent = "Loading...";

    const lib = await cheerpjRunLibrary(cheerpjWebRoot+"/freej2me-web.jar");

    const FreeJ2ME = await lib.org.recompile.freej2me.FreeJ2ME;

    let args;

    if (sp.get('url') || (sp.get('jar') && (sp.get('jar').startsWith('http') || sp.get('jar').startsWith('/') || sp.get('jar').includes('.jar')))) {
        const jarUrl = sp.get('url') || sp.get('jar');
        document.getElementById("loading").textContent = "Downloading Game JAR...";
        try {
            const resp = await fetch(jarUrl);
            const arrayBuffer = await resp.arrayBuffer();
            const File = await lib.java.io.File;
            const jarFile = await new File("/files/_tmp_auto_game.jar");
            const launcherUtil = await lib.pl.zb3.freej2me.launcher.LauncherUtil;
            await launcherUtil.copyJar(new Int8Array(arrayBuffer), jarFile);
            args = ['jar', "/files/_tmp_auto_game.jar"];
        } catch (err) {
            console.error("Auto load JAR error:", err);
            document.getElementById("loading").textContent = "Failed to download JAR from URL!";
            return;
        }
    } else if (sp.get('app')) {
        const app = sp.get('app');
        await ensureAppInstalled(lib, app);

        args = ['app', sp.get('app')];
    } else {
        args = ['jar', cheerpjWebRoot+"/jar/" + (sp.get('jar') || "game.jar")];
    }

    FreeJ2ME.main(args).catch(e => {
        e.printStackTrace();
        document.getElementById('loading').textContent = 'Crash :(';
    });


}

init();