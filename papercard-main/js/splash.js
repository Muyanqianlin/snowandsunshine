/**
 * splash.js - 入场引导 Splash Screen
 * 打字状态指示器与入场承诺页
 */

(function() {
    var TI_AVATAR_KEY = 'tiSettings_showAvatar';
    var TI_TEXT_KEY = 'tiSettings_customText';
    var tiShowAvatar = localStorage.getItem(TI_AVATAR_KEY) !== 'false';
    var tiCustomText = localStorage.getItem(TI_TEXT_KEY) || '';

    function applyTiAvatarVisibility() {
        var avatarEl = document.getElementById('typing-indicator-avatar');
        if (!avatarEl) return;
        avatarEl.style.display = tiShowAvatar ? '' : 'none';
    }

    function getTiLabel() {
        if (tiCustomText) return tiCustomText;
        var name = (window.settings && settings.partnerName) ? settings.partnerName : '对方';
        return name + ' 正在输入';
    }

    function updatePreview() {
        var previewText = document.getElementById('ti-preview-text');
        var previewAvatar = document.getElementById('ti-preview-avatar');
        if (previewText) previewText.textContent = getTiLabel();
        if (previewAvatar) previewAvatar.style.display = tiShowAvatar ? '' : 'none';
        var label = document.getElementById('typing-indicator-label');
        if (label && label.textContent) label.textContent = getTiLabel();
        var actualAvatar = document.getElementById('typing-indicator-avatar');
        if (actualAvatar) actualAvatar.style.display = tiShowAvatar ? '' : 'none';
    }

    function syncPillUI() {
        var row = document.getElementById('ti-avatar-toggle');
        if (!row) return;
        if (tiShowAvatar) {
            row.classList.add('active');
        } else {
            row.classList.remove('active');
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        applyTiAvatarVisibility();
    });

    var _origSetLabel = null;
    function patchTypingLabel() {
        var label = document.getElementById('typing-indicator-label');
        if (label && tiCustomText) {
            label.textContent = tiCustomText;
        }
    }
    var labelEl = null;
    function initLabelObserver() {
        labelEl = document.getElementById('typing-indicator-label');
        if (!labelEl || labelEl._tiObserved) return;
        labelEl._tiObserved = true;
        var obs = new MutationObserver(function() {
            if (tiCustomText && labelEl.textContent !== tiCustomText) {
                labelEl.textContent = tiCustomText;
            }
        });
        obs.observe(labelEl, { childList: true, characterData: true, subtree: true });
    }
    setTimeout(initLabelObserver, 1000);

    document.addEventListener('click', function(e) {
        var ti = e.target.closest('.typing-indicator');
        if (!ti) return;
        e.stopPropagation();
        initLabelObserver();
        var modal = document.getElementById('ti-settings-modal');
        if (!modal) return;
        var input = document.getElementById('ti-text-input');
        if (input) input.value = tiCustomText;
        syncPillUI();
        updatePreview();
        var partnerImg = document.querySelector('#partner-info .message-avatar img') ||
                         document.querySelector('.partner-avatar img') ||
                         document.querySelector('[id*="partner"] img');
        var previewAvatar = document.getElementById('ti-preview-avatar');
        if (previewAvatar && partnerImg) {
            previewAvatar.innerHTML = '<img src="' + partnerImg.src + '" style="width:100%;height:100%;object-fit:cover;">';
        }
        modal.classList.add('open');
    });

    document.addEventListener('click', function(e) {
        var modal = document.getElementById('ti-settings-modal');
        if (!modal || !modal.classList.contains('open')) return;
        if (e.target === modal) modal.classList.remove('open');
    });
    document.addEventListener('click', function(e) {
        if (e.target.id === 'ti-settings-close-btn') {
            var modal = document.getElementById('ti-settings-modal');
            if (modal) modal.classList.remove('open');
        }
    });

    document.addEventListener('click', function(e) {
        var row = e.target.closest('#ti-avatar-toggle');
        if (!row) return;
        tiShowAvatar = !tiShowAvatar;
        localStorage.setItem(TI_AVATAR_KEY, tiShowAvatar);
        syncPillUI();
        updatePreview();
        applyTiAvatarVisibility();
    });

    document.addEventListener('click', function(e) {
        if (e.target.id !== 'ti-text-save-btn') return;
        var input = document.getElementById('ti-text-input');
        if (!input) return;
        tiCustomText = input.value.trim();
        localStorage.setItem(TI_TEXT_KEY, tiCustomText);
        updatePreview();
        e.target.textContent = '已保存 ✓';
        setTimeout(function() { e.target.textContent = '保存'; }, 1200);
    });

    document.addEventListener('click', function(e) {
        if (e.target.id !== 'ti-text-reset-btn') return;
        tiCustomText = '';
        localStorage.removeItem(TI_TEXT_KEY);
        var input = document.getElementById('ti-text-input');
        if (input) input.value = '';
        updatePreview();
    });

    document.addEventListener('DOMContentLoaded', function() { syncPillUI(); });
    setTimeout(syncPillUI, 800);
})();


(function() {
    var PLEDGE_KEY = 'splashPledgeSigned_v3';
    var TOTAL = 5;
    var PLEDGE_TEXT = '我绝不盈利、造谣、污蔑或嘲讽，并对自己的使用行为负完全责任';
    var cur = 0;

    function initSplash() {
        var splash = document.getElementById('splash-declaration');
        if (!splash) return;

        localStorage.removeItem('splashPledgeSigned_v2');
        localStorage.removeItem('splashPledgeSigned_v1');
        localStorage.removeItem('splashPledgeSigned');

        if (localStorage.getItem(PLEDGE_KEY) === 'true') {
            splash.style.display = 'none';
            return;
        }

        var starsEl = document.getElementById('splash-stars');
        if (starsEl) {
            var html = '';
            for (var i = 0; i < 70; i++) {
                var x = (Math.random() * 100).toFixed(1);
                var y = (Math.random() * 100).toFixed(1);
                var sz = Math.random() > 0.75 ? '3px' : '2px';
                var del = (Math.random() * 4).toFixed(2);
                var dur = (2 + Math.random() * 3).toFixed(1);
                html += '<span style="left:'+x+'%;top:'+y+'%;width:'+sz+';height:'+sz+';animation-delay:'+del+'s;animation-duration:'+dur+'s;"></span>';
            }
            starsEl.innerHTML = html;
        }

        var dotsEl = document.getElementById('splash-dots');
        if (dotsEl) {
            var dhtml = '';
            for (var d = 0; d < TOTAL; d++) {
                dhtml += '<div class="splash-dot'+(d===0?' active done':'')+'" data-dot="'+d+'"></div>';
            }
            dotsEl.innerHTML = dhtml;
        }

        var prevBtn   = document.getElementById('splash-prev-btn');
        var nextBtn   = document.getElementById('splash-next-btn');
        var enterBtn  = document.getElementById('splash-enter-btn');
        var pledgeInp = document.getElementById('splash-pledge-input');

        if (prevBtn) {
            prevBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (cur > 0) goTo(cur - 1);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (cur < TOTAL - 1) goTo(cur + 1);
            });
        }
        if (enterBtn) {
            enterBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (enterBtn.classList.contains('ready')) enterSite();
            });
        }
        if (pledgeInp) {
            pledgeInp.addEventListener('input', function() {
                var val = pledgeInp.value;
                var hint = document.getElementById('splash-pledge-hint');
                if (val === PLEDGE_TEXT) {
                    pledgeInp.classList.add('correct');
                    if (hint) { hint.textContent = '✓ 承诺已确认，可以进入了'; hint.className = 'splash-pledge-hint ok'; }
                    if (enterBtn) enterBtn.classList.add('ready');
                } else {
                    pledgeInp.classList.remove('correct');
                    if (hint) { hint.textContent = '请完整输入上方承诺后方可进入'; hint.className = 'splash-pledge-hint'; }
                    if (enterBtn) enterBtn.classList.remove('ready');
                }
            });
            pledgeInp.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && enterBtn && enterBtn.classList.contains('ready')) {
                    enterSite();
                }
            });
        }

        if (dotsEl) {
            dotsEl.addEventListener('click', function(e) {
                var dot = e.target.closest('.splash-dot');
                if (dot) goTo(parseInt(dot.getAttribute('data-dot')));
            });
        }

        updateUI();
    }

    function goTo(idx) {
        var slides = document.querySelectorAll('.splash-slide');
        var dots   = document.querySelectorAll('.splash-dot');
        var prevIdx = cur;

        if (slides[prevIdx]) {
            slides[prevIdx].classList.remove('active');
            slides[prevIdx].classList.add('exit-left');
            var exitEl = slides[prevIdx];
            setTimeout(function() { exitEl.classList.remove('exit-left'); }, 420);
        }

        cur = idx;

        if (slides[cur]) {
            slides[cur].classList.add('active');
        }

        dots.forEach(function(dot, i) {
            dot.classList.toggle('active', i === cur);
            dot.classList.toggle('done', i < cur);
        });

        updateUI();

        if (cur === TOTAL - 1) {
            setTimeout(function() {
                var inp = document.getElementById('splash-pledge-input');
                if (inp) inp.focus();
            }, 450);
        }
    }

    function updateUI() {
        var prevBtn  = document.getElementById('splash-prev-btn');
        var nextBtn  = document.getElementById('splash-next-btn');
        var enterBtn = document.getElementById('splash-enter-btn');
        var pageNum  = document.getElementById('splash-page-num');

        if (pageNum) pageNum.textContent = (cur + 1) + ' / ' + TOTAL;
        if (prevBtn) { prevBtn.disabled = (cur === 0); }
        if (cur === TOTAL - 1) {
            if (nextBtn)  nextBtn.style.display  = 'none';
            if (enterBtn) enterBtn.style.display = '';
        } else {
            if (nextBtn)  nextBtn.style.display  = '';
            if (enterBtn) enterBtn.style.display = 'none';
        }
        
    }

    function enterSite() {
        localStorage.setItem(PLEDGE_KEY, 'true');
        var splash = document.getElementById('splash-declaration');
        if (splash) {
            splash.classList.add('splash-fade-out');
            setTimeout(function() { splash.style.display = 'none'; }, 950);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSplash);
    } else {
        initSplash();
    }
})();
