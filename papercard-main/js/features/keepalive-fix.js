/**
 * keepalive-fix.js — 后台保活修复模块（自包含版）
 *
 * 失效原因：features-extra.js 第 3 节的保活实现依赖外部音频
 *          https://img.heliar.top/file/1772885159972_silence.m4a ，
 *          该子域名的 DNS 记录已不存在（阿里公共 DNS 与本地 DNS 均无解析结果），
 *          音频永远无法加载，audio.play() 每次都失败且被静默吞掉，
 *          导致"后台保活"开关打开后实际从未运行。
 *
 * 修复方案：完全脱离外部资源——运行时用 JS 在本地生成一段 5 秒的静音 WAV（Blob URL），
 *          交给 <audio> 以极低音量循环播放，原理与原设计一致。
 *
 * 接管方式：本文件必须在 features-extra.js 之后加载。加载后覆盖全局开关
 *          window._toggleKeepaliveAudio（index.html 的 onclick 调用的就是它），
 *          并每 800ms 同步一次 UI，覆盖旧模块加载死链失败时写入的错误状态。
 *          旧模块仍会照常执行，但其 play() 只会静默失败，无副作用。
 *
 * 设置兼容：沿用 localStorage 键 keepaliveAudioEnabled 与 settings.keepaliveAudioEnabled，
 *          与设置面板、备份/恢复逻辑完全兼容，用户原有开关状态无需重置。
 *
 * 移除方法：删除 index.html 中对本文件的 <script> 引用即可，页面行为恢复原状。
 *
 * 控制台自检：window._keepaliveFixStatus() 可查看当前启用/播放状态。
 */
(function () {
    var KEY = 'keepaliveAudioEnabled';
    var _audio = null;
    var _srcUrl = null;
    var _unlockBound = false;

    function _get() { return localStorage.getItem(KEY) === 'true'; }

    /* ── 本地生成静音 WAV：PCM16 / 单声道 / 8kHz，数据区全 0 即静音 ── */
    function _makeSilentWavUrl(seconds) {
        var sampleRate = 8000;
        var numSamples = Math.floor(sampleRate * seconds);
        var dataSize   = numSamples * 2;
        var buf = new ArrayBuffer(44 + dataSize);
        var v   = new DataView(buf);
        function wstr(off, s) { for (var i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)); }
        wstr(0,  'RIFF');
        v.setUint32(4,  36 + dataSize, true);          // RIFF 数据总长
        wstr(8,  'WAVE');
        wstr(12, 'fmt ');
        v.setUint32(16, 16, true);                     // fmt 块长度
        v.setUint16(20, 1,  true);                     // PCM 格式
        v.setUint16(22, 1,  true);                     // 单声道
        v.setUint32(24, sampleRate, true);             // 采样率
        v.setUint32(28, sampleRate * 2, true);         // 字节率 = 采样率×声道×位深/8
        v.setUint16(32, 2,  true);                     // 块对齐
        v.setUint16(34, 16, true);                     // 位深
        wstr(36, 'data');
        v.setUint32(40, dataSize, true);               // 数据区长度
        return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
    }

    function _createAudio() {
        if (_audio) return _audio;
        if (!_srcUrl) _srcUrl = _makeSilentWavUrl(5);
        _audio = new Audio(_srcUrl);
        _audio.loop    = true;
        _audio.volume  = 0.01;
        _audio.preload = 'auto';
        _audio.addEventListener('play',  function () { _setUI(true);  });
        _audio.addEventListener('pause', function () { _setUI(false); });
        return _audio;
    }

    function _playing() { return !!_audio && !_audio.paused && !_audio.ended; }

    function _setUI(playing) {
        var dot  = document.getElementById('keepalive-dot');
        var desc = document.getElementById('keepalive-audio-desc');
        var sw   = document.getElementById('keepalive-audio-toggle');
        var row  = document.getElementById('keepalive-bar-row');

        if (sw)  sw.classList.toggle('active', _get());
        if (dot) dot.className = 'keepalive-dot' + (playing ? ' alive' : '');
        if (desc) {
            if (!_get())      desc.textContent = '静音循环音频，防止页面被系统挂起';
            else if (playing) desc.textContent = '运行中 · 页面已保活';
            else              desc.textContent = '等待交互后启动…';
        }
        if (row) row.style.display = _get() ? 'flex' : 'none';
        var bars = document.querySelectorAll('.keepalive-wave-bar');
        bars.forEach(function (b) { b.style.animationPlayState = playing ? 'running' : 'paused'; });
    }

    function _start() {
        var a = _createAudio();
        var p = null;
        try { p = a.play(); } catch (e) { /* 个别旧浏览器 play() 同步抛错 */ }
        if (p && p.then) {
            p.then(function () { _setUI(true); }).catch(function () {
                _setUI(false);
                // 浏览器自动播放策略要求先有一次用户交互，这里挂一次性监听等交互后重试
                if (!_unlockBound) {
                    _unlockBound = true;
                    function unlock() {
                        _unlockBound = false;
                        if (_get()) { try { a.play().catch(function () {}); } catch (e) {} }
                    }
                    document.addEventListener('click',      unlock, { once: true });
                    document.addEventListener('touchstart', unlock, { once: true });
                    document.addEventListener('keydown',    unlock, { once: true });
                }
            });
        }
    }

    function _stop() {
        if (_audio) { _audio.pause(); _audio.currentTime = 0; }
        _setUI(false);
    }

    /* ── 覆盖原全局开关：index.html 中 onclick 调用的就是 window._toggleKeepaliveAudio ── */
    window._toggleKeepaliveAudio = function () {
        var next = !_get();
        localStorage.setItem(KEY, String(next));
        var row = document.getElementById('keepalive-audio-toggle');
        if (row) row.classList.toggle('active', next);
        if (typeof settings !== 'undefined') {
            settings.keepaliveAudioEnabled = next;
            if (typeof throttledSaveData === 'function') throttledSaveData();
        }
        if (next) {
            _start();
            if (typeof showNotification === 'function') showNotification('保活音频已开启 🎵', 'success', 2000);
        } else {
            _stop();
            if (typeof showNotification === 'function') showNotification('保活音频已关闭', 'info', 1500);
        }
        _setUI(next && _playing());
    };

    /* ── 回到前台时若音频被系统暂停则自动恢复 ── */
    document.addEventListener('visibilitychange', function () {
        if (_get() && document.visibilityState === 'visible' && _audio && _audio.paused) {
            try { _audio.play().catch(function () {}); } catch (e) {}
        }
    });

    /* ── 周期同步 UI：覆盖旧模块（仍在尝试加载死链并写入"未运行"状态）造成的干扰 ── */
    setInterval(function () { _setUI(_get() && _playing()); }, 800);

    /* ── 初始化：DOMContentLoaded + 多次延迟兜底（旧模块在 1800ms 处会覆盖一次 UI） ── */
    function _init() {
        _setUI(_get() && _playing());
        if (_get()) _start();
    }
    document.addEventListener('DOMContentLoaded', _init);
    setTimeout(_init, 300);
    setTimeout(_init, 1800);
    setTimeout(_init, 3200);

    /* ── 控制台自检入口 ── */
    window._keepaliveFixStatus = function () {
        return {
            enabled:     _get(),
            playing:     _playing(),
            audioReady:  !!_audio && _audio.readyState >= 2,
            source:      _srcUrl ? '本地生成的静音 WAV（Blob URL）' : '尚未创建',
            audioError:  _audio ? (_audio.error ? _audio.error.code : null) : null
        };
    };
})();
