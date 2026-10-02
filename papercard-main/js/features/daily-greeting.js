/**
 * features/daily-greeting.js - 每日问候 Daily Greeting
 * 每日晨报、沉浸模式与问候卡片
 */
window._dailyGreetingReady = false;

function _getDailyGreetingData() {
    var now = new Date();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var hour = now.getHours();
    var timeLabel = '早上好', timeEmoji = '🌅';
    if (hour >= 12 && hour < 18) { timeLabel = '下午好'; timeEmoji = '☀️'; }
    else if (hour >= 18 && hour < 22) { timeLabel = '傍晚好'; timeEmoji = '🌇'; }
    else if (hour >= 22 || hour < 6) { timeLabel = '晚上好'; timeEmoji = '🌙'; }

    // 节日库 (保持原有逻辑，此处省略以节省篇幅，请保留您原本的节日数组)
var festivals = [
    { m:1, d:1, name:'元旦', emoji:'🎆', label:'NEW YEAR', note:'新年快乐！愿新的一年里，你们的爱情越来越甜蜜，每一天都充满幸福与惊喜～' },
    { m:1, d:5, name:'小寒', emoji:'❄️', label:'MINOR COLD', note:'小寒至，春不远。有你在身边，心里总是暖暖的。' },
    { m:1, d:20, name:'大寒', emoji:'🧊', label:'MAJOR COLD', note:'大寒快乐，记得添衣保暖。你的拥抱就是最暖的炉火。' },

    { m:2, d:4, name:'立春', emoji:'🌱', label:'START OF SPRING', note:'立春快乐！春天来了，我们的爱也像新芽一样蓬勃生长。' },
    { m:2, d:14, name:'情人节', emoji:'💝', label:'VALENTINES DAY', note:'情人节快乐，亲爱的！你是我最美好的礼物，爱你哦～' },
    { m:2, d:16, name:'除夕', emoji:'🧧', label:'CHINESE NEW YEAR EVE', note:'除夕快乐！辞旧迎新，愿你们携手跨入幸福的新一年，万事如意！' },
    { m:2, d:17, name:'春节', emoji:'🎊', label:'SPRING FESTIVAL', note:'新年快乐！新的一年，愿你们相爱如初，甜蜜长久。' },
    { m:2, d:18, name:'雨水', emoji:'☔', label:'RAIN WATER', note:'雨水节气，愿幸福像春雨一样滋润你的每一天。' },

    { m:3, d:3, name:'元宵节', emoji:'🏮', label:'LANTERN FESTIVAL', note:'元宵节快乐！花灯映月，你是我心里最亮的那盏灯。' },
    { m:3, d:5, name:'惊蛰', emoji:'⚡', label:'AWAKENING OF INSECTS', note:'惊蛰春雷响，万物复苏，你是我最美的春天。' },
    { m:3, d:8, name:'妇女节', emoji:'🌹', label:'WOMENS DAY', note:'今天是属于你的节日，愿你永远被温柔相待，被爱守护。' },
    { m:3, d:12, name:'植树节', emoji:'🌳', label:'TREE PLANTING DAY', note:'今天种下一棵树，也在心里种下对你不变的爱。' },
    { m:3, d:20, name:'春分', emoji:'🌸', label:'SPRING EQUINOX', note:'春分昼夜平分，我的爱对你从不偏心——永远满分。' },

    { m:4, d:1, name:'愚人节', emoji:'🤡', label:'APRIL FOOLS', note:'今天可以骗你说“我不爱你了”，但我的心骗不了自己～' },
    { m:4, d:5, name:'清明节', emoji:'🌧', label:'QINGMING FESTIVAL', note:'慎终追远，珍惜眼前。有你在，每一天都格外温暖。' },
    { m:4, d:20, name:'谷雨', emoji:'🌾', label:'GRAIN RAIN', note:'谷雨生百谷，你是我生命里最饱满的那颗。' },

    { m:5, d:1, name:'劳动节', emoji:'🛠️', label:'LABOR DAY', note:'劳动最光荣，但我更光荣的是能拥有你。' },
    { m:5, d:4, name:'青年节', emoji:'✨', label:'YOUTH DAY', note:'青春正好，与你共度。愿我们永远年轻，永远热泪盈眶。' },
    { m:5, d:5, name:'立夏', emoji:'☀️', label:'START OF SUMMER', note:'立夏快乐！愿我们的爱像夏天一样热情。' },
    { m:5, d:20, name:'520', emoji:'💕', label:'I LOVE YOU', note:'520，我爱你！感谢你出现在我的生命里，你是我最好的选择。' },
    { m:5, d:21, name:'小满', emoji:'🌾', label:'GRAIN BUDS', note:'小满未满，万物可期。我对你的爱永远在增长的季节。' },

    { m:6, d:1, name:'儿童节', emoji:'🎈', label:'CHILDRENS DAY', note:'愿你永远保持那颗童心，和我一起做个快乐的大小孩。' },
    { m:6, d:5, name:'芒种', emoji:'🌽', label:'GRAIN IN EAR', note:'芒种忙种，有你在的日子，每天都是收获。' },
    { m:6, d:19, name:'端午节', emoji:'🛶', label:'DRAGON BOAT FESTIVAL', note:'粽子软糯，你更甜～端午安康！' },
    { m:6, d:21, name:'夏至', emoji:'🍉', label:'SUMMER SOLSTICE', note:'夏至最长的一天，我的思念比它还长。' },

    { m:7, d:6, name:'小暑', emoji:'🌡️', label:'MINOR HEAT', note:'小暑入伏天，你的怀抱是最清凉的风。' },
    { m:7, d:23, name:'大暑', emoji:'🔥', label:'MAJOR HEAT', note:'大暑炎炎，你是我心里的冰镇西瓜。' },

    { m:8, d:7, name:'立秋', emoji:'🍁', label:'START OF AUTUMN', note:'立秋快乐，愿与你共赏每一片秋叶。' },
    { m:8, d:19, name:'七夕节', emoji:'🌌', label:'QIXI FESTIVAL', note:'七夕快乐！牛郎织女一年只见一次，而我们每天都在一起，真幸运。' },
    { m:8, d:23, name:'处暑', emoji:'🌬️', label:'END OF HEAT', note:'处暑出暑，炎热渐消，爱意不减。' },

    { m:9, d:7, name:'白露', emoji:'💧', label:'WHITE DEW', note:'白露为霜，所谓伊人，在我身旁。' },
    { m:9, d:10, name:'教师节', emoji:'📚', label:'TEACHERS DAY', note:'你是我人生中最特别的老师，教会了我什么是爱。' },
    { m:9, d:23, name:'秋分', emoji:'🍂', label:'AUTUMN EQUINOX', note:'秋分昼夜均，你是我心里的天平。' },
    { m:9, d:25, name:'中秋节', emoji:'🌕', label:'MID AUTUMN FESTIVAL', note:'月圆人团圆，有你才叫团圆。中秋快乐！' },

    { m:10, d:1, name:'国庆节', emoji:'🎑', label:'NATIONAL DAY', note:'国庆快乐！和你在一起的每一天都像节日，爱你。' },
    { m:10, d:8, name:'寒露', emoji:'🍃', label:'COLD DEW', note:'寒露凝霜，有你在心里总是暖的。' },
    { m:10, d:23, name:'霜降', emoji:'❄️', label:'FROST DESCENT', note:'霜降叶落，我的爱却常青。' },
    { m:10, d:31, name:'万圣夜', emoji:'🎃', label:'HALLOWEEN', note:'不给糖就捣蛋，但你给了我全世界最甜的糖——你的爱。' },

    { m:11, d:7, name:'立冬', emoji:'🧣', label:'START OF WINTER', note:'立冬快乐，你的拥抱是冬天里最暖的阳光。' },
    { m:11, d:11, name:'光棍节', emoji:'👫', label:'SINGLES DAY', note:'幸好我们不用过这个节，因为我有你。' },
    { m:11, d:22, name:'小雪', emoji:'⛄', label:'MINOR SNOW', note:'小雪飘飘，你是我心里最暖的那团火。' },
    { m:11, d:26, name:'感恩节', emoji:'🙏', label:'THANKSGIVING', note:'感谢生命中有你，每一天都是恩赐。' },

    { m:12, d:7, name:'大雪', emoji:'☃️', label:'MAJOR SNOW', note:'大雪封门，封不住我对你的想念。' },
    { m:12, d:22, name:'冬至', emoji:'🥟', label:'WINTER SOLSTICE', note:'冬至快乐，记得吃饺子，但记得想我。' },
    { m:12, d:24, name:'平安夜', emoji:'🎄', label:'CHRISTMAS EVE', note:'平安夜快乐！愿你平平安安，我们的爱情也岁岁常安。' },
    { m:12, d:25, name:'圣诞节', emoji:'🎅', label:'MERRY CHRISTMAS', note:'圣诞快乐！你就是我收到的最好的礼物，永远爱你。' },
    { m:12, d:31, name:'跨年夜', emoji:'🎆', label:'NEW YEAR EVE', note:'再见这一年，你是我最好的收获。新的一年，继续爱你。' }
];

    var festival = null;
    for (var fi = 0; fi < festivals.length; fi++) { if (festivals[fi].m === month && festivals[fi].d === day) { festival = festivals[fi]; break; } }
    
    var weathers = ['晴空万里', '多云转晴', '阴天有云', '细雨蒙蒙', '春风和煦', '微微寒冷', '清风徐徐', '雨后初晴', '夜色宁静', '月光皎洁', '晴间多云', '大雨滂沱', '雷雨交加', '小雪纷飞', '微风拂面', '多云天气', '雾气朦胧', '星光璀璨', '朝霞满天', '夕阳西下', '海风轻拂', '山间清爽', '秋叶飘落', '花香四溢', '绿意盎然', '雨后清新', '雪花飞舞', '阳光明媚'];
    var statusPool = ['正在想你 💭', '忙碌中，但心里有你', '好好的，别担心 ✨', '期待见到你', '有点想你了', '在努力变更好', '今天挺安静的', '心情不错哦 🌱', '一切都好，你呢？', '看月亮，想到你 🌙', '今天有点想你', '刚刚看到一朵云像你 ☁️', '工作再忙也会想你的', '今天你开心吗？', '梦里见 💤', '好好吃饭了吗？', '记得多喝水哦 💧', '今天有没有照顾好自己', '想你，但不说 🤫', '全世界你最可爱', '今天天气不错，适合想你', '吃饱喝足，开始想你', '今天也想牵你的手', '你有没有想我', '今天比昨天更想你', '看到好吃的想分享给你 🍜', '听到一首歌想到你 🎵', '今天也要加油鸭', '晚安，我的全世界 🌙', '早安，又是想你的一天'];
    
    //var todayKey = String(now.getFullYear()) + String(month) + String(day);
   // var seed = 0; for (var si = 0; si < todayKey.length; si++) seed += todayKey.charCodeAt(si) * (si + 1);
       var todayKey = String(now.getFullYear()) + String(month) + String(day);
    // 🎯 引入浏览器唯一盐值，破除全站同质化
    var userSalt = localStorage.getItem('_dgUserSalt');
    if (!userSalt) {
      userSalt = String(Math.floor(Math.random() * 999983) + 1);
      localStorage.setItem('_dgUserSalt', userSalt);
    }
    var saltedKey = todayKey + userSalt;
    var seed = 0;
    for (var si = 0; si < saltedKey.length; si++) seed += saltedKey.charCodeAt(si) * (si + 1);

    function seededRandDg(s, offset) { var x = Math.sin(s * 9301 + offset * 49297 + 233) * 1000003; return x - Math.floor(x); }
    var defaultWeather = weathers[Math.floor(seededRandDg(seed, 0) * weathers.length)];
    var customWeatherKey = 'customWeather_' + now.getFullYear() + '_' + month + '_' + day;
    var weather = localStorage.getItem(customWeatherKey) || defaultWeather;
    var status = statusPool[Math.floor(seededRandDg(seed, 1) * statusPool.length)];
    return { timeLabel: timeLabel, timeEmoji: timeEmoji, festival: festival, weather: weather, status: status };
}

function _buildDailyGreeting() {
    try {
        // ============================================================
        // 🆕 特殊日检测逻辑
        // ============================================================
        var specialEvent = null;
        var specialNote = null;
        var now = new Date();
        var todayStr = now.toDateString();
        var lastNotifyDate = localStorage.getItem('lastSpecialNotifyDate');
        var alreadyNotified = lastNotifyDate === todayStr;

        if (typeof anniversaries !== 'undefined' && Array.isArray(anniversaries)) {
            anniversaries.forEach(function(ann) {
                if (!ann.remindRules || ann.remindRules.length === 0) return;
                var target = new Date(ann.date);
                
                // 纪念日逻辑
                if (ann.type === 'anniversary') {
                    var days = Math.floor((now - target) / (1000 * 60 * 60 * 24));
                    if (days >= 0) {
                        ann.remindRules.forEach(function(rule) {
                            if (rule === '100' && days % 100 === 0 && days !== 0) specialEvent = ann;
                            if (rule === '1000' && days % 1000 === 0 && days !== 0) specialEvent = ann;
                            if (rule.startsWith('custom:')) { if (days === parseInt(rule.split(':')[1])) specialEvent = ann; }
                            if (rule.startsWith('anniversaryYearly:')) {
                                var interval = parseInt(rule.split(':')[1]);
                                var isSameDate = target.getMonth() === now.getMonth() && target.getDate() === now.getDate();
                                if (interval > 0 && isSameDate && (now.getFullYear() - target.getFullYear()) % interval === 0) specialEvent = ann;
                            }
                        });
                    }
                }
                // 生日逻辑
                if (ann.type === 'birthday') {
                    var isDateMatch = target.getMonth() === now.getMonth() && target.getDate() === now.getDate();
                    if (isDateMatch) {
                        var yearsPassed = now.getFullYear() - target.getFullYear();
                        if (yearsPassed >= 0) {
                             ann.remindRules.forEach(function(rule) {
                                if (rule === 'yearly') specialEvent = ann;
                                if (rule === 'decade' && yearsPassed % 10 === 0 && yearsPassed > 0) specialEvent = ann;
                                if (rule.startsWith('interval:')) { if (yearsPassed % parseInt(rule.split(':')[1]) === 0 && yearsPassed > 0) specialEvent = ann; }
                            });
                        }
                    }
                }
            });
        }

        var userSaltForText = localStorage.getItem('_dgUserSalt') || '0';
        if (specialEvent) {
            /*if (specialEvent.customMessage) {
                var lines = specialEvent.customMessage.split('\n').filter(function(s){ return s.trim() !== ''; });
                if (lines.length > 0) specialNote = lines[Math.floor(Math.random() * lines.length)];
            }*/
            if (specialEvent.customMessage) {
                var lines = specialEvent.customMessage.split('\n').filter(function(s){ return s.trim() !== ''; });
                if (lines.length > 0) {
                    // 🎯 用固定的盐值+纪念日ID抽取，保证同一天刷新不变，不同人纯概率随机
                    var noteSeed = parseInt(userSaltForText) + specialEvent.id;
                    function seededRandomNote(s) {
                    var x = Math.sin(s * 9301 + 49297 + 233) * 1000003;
                    return x - Math.floor(x);
                    }
                    specialNote = lines[Math.floor(seededRandomNote(noteSeed) * lines.length)];
                }
            }

            if (!specialNote) specialNote = '今天是特别的日子：' + specialEvent.name;
            window._todaySpecialNote = specialNote;
            console.log('[公告调试] 命中特殊日子，文案：', specialNote); // 👈 调试日志

            if (!alreadyNotified && 'Notification' in window && Notification.permission === 'granted') {
                 if (document.hidden) { if(typeof _sendPartnerNotification === 'function') _sendPartnerNotification('传讯 · 重要日提醒', specialNote); }
                 else new Notification('传讯 · 重要日提醒', { body: specialNote });
                 localStorage.setItem('lastSpecialNotifyDate', todayStr);
            }
        } else {
            window._todaySpecialNote = null;
            console.log('[公告调试] 今天没有特殊日子'); // 👈 调试日志
        }
        // ============================================================

        var data = _getDailyGreetingData();
        var festival = data.festival;
        var timeLabel = data.timeLabel;
        var weather = data.weather;
        var status = data.status;
        var h = now.getHours();
        
        // 初始化标题和寄语
        var mainTitle = festival ? (festival.name + '快乐') : timeLabel;
        var festLabel = festival ? festival.label : ('GOOD ' + (h < 12 ? 'MORNING' : h < 18 ? 'AFTERNOON' : 'EVENING'));
        var noteText = festival ? festival.note : '今天也要元气满满，我在这里陪着你 ✦';

        // 处理常规随机文案
        var customData = {};
        try { customData = JSON.parse(localStorage.getItem('dg_custom_data') || '{}'); } catch(e2) {}
       // var dailySeed = now.getFullYear() * 10000 + (now.getMonth()+1) * 100 + now.getDate();
           // 🎯 标题和寄语也加上盐值，确保不同人看到的标题和寄语是纯概率随机的
        //var userSaltForText = localStorage.getItem('_dgUserSalt') || '0';
        var dailySeed = now.getFullYear() * 10000 + (now.getMonth()+1) * 100 + now.getDate() + parseInt(userSaltForText);

        function seededRandom(seed) { return (Math.abs(Math.sin(seed * 9301 + 49297) * 233280) % 233280) / 233280; }
        var todaySeedForText = dailySeed;
        
        var defaultTitles = festival ? [(festival.name + '快乐')] : [timeLabel, '今天也要开心哦', '你在我心里呀', '想你'];
        var defaultNotes = festival ? [festival.note] : ['今天也要元气满满，我在这里陪着你 ✦', '每一天都因为有你而特别 ✦', '想到你就觉得很安心 ✦', '你是我最喜欢的人 ✦'];
        var mixedTitles = (customData.titles && customData.titles.length > 0) ? customData.titles.concat(defaultTitles) : (customData.title ? [customData.title].concat(defaultTitles) : defaultTitles);
        var mixedNotes = (customData.notes && customData.notes.length > 0) ? customData.notes.concat(defaultNotes) : (customData.note ? [customData.note].concat(defaultNotes) : defaultNotes);
        
        mainTitle = mixedTitles[Math.floor(seededRandom(todaySeedForText) * mixedTitles.length)];
        noteText = mixedNotes[Math.floor(seededRandom(todaySeedForText + 1) * mixedNotes.length)];

        // 👉 核心修改：强制覆盖标题和寄语
        if (window._todaySpecialNote) {
            noteText = window._todaySpecialNote; // 覆盖寄语
            mainTitle = "✨ 特别纪念日"; // 同时覆盖标题，引起注意
        }

        function setEl(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }
        function setElHTML(id, val) { var el = document.getElementById(id); if (el) el.innerHTML = val; }

        var emojiEl = document.getElementById('dg-emoji');
        if (emojiEl) { if (festival) emojiEl.textContent = festival.emoji; else if(window._todaySpecialNote) emojiEl.textContent = '💖'; }

        // 心情数据获取
        var pName = (typeof settings !== 'undefined' && settings.partnerName) ? settings.partnerName : '梦角';
        var mName = (typeof settings !== 'undefined' && settings.myName) ? settings.myName : '我';
        var todayMoodStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
        var moodDataRaw = window.moodData || {};
        var todayMood = moodDataRaw[todayMoodStr];
        var allMoods = (typeof getAllMoodOptions === 'function') ? getAllMoodOptions() : [];
        var partnerMoodText = pName + ' 今天还没有记录';
        var partnerMoodIcon = null;
        var partnerMoodNote = '';
        if (todayMood && todayMood.partner) {
            for (var pi = 0; pi < allMoods.length; pi++) { if (allMoods[pi].key === todayMood.partner) { partnerMoodText = allMoods[pi].kaomoji + ' ' + allMoods[pi].label; partnerMoodIcon = allMoods[pi].kaomoji; break; } }
            partnerMoodNote = todayMood.partnerNote || '';
        }
        
        var moodIconEl = document.getElementById('dg-partner-mood-icon');
        if (moodIconEl && partnerMoodIcon) { moodIconEl.textContent = partnerMoodIcon; moodIconEl.style.fontSize = '32px'; }

        setEl('dg-festival', festLabel);
        setEl('dg-title', mainTitle); // 应用标题
        setEl('dg-partner-mood', partnerMoodText);
        setEl('dg-partner-mood-note', partnerMoodNote || (todayMood && todayMood.partner ? pName + ' 记录了今天的心情 ☆' : ''));
        
        var statusPoolData = [];
        try { statusPoolData = JSON.parse(localStorage.getItem('dg_status_pool') || '[]'); } catch(e2) {}
        if (statusPoolData.length > 0) {
            var poolItem = statusPoolData[Math.floor(seededRandom(todaySeedForText + 2) * statusPoolData.length)];
            if (poolItem) {
                setEl('dg-festival', poolItem.label || festLabel);
                setEl('dg-status', poolItem.status || status);
                var emojiEl2 = document.getElementById('dg-emoji');
                if (emojiEl2) {
                    if (poolItem.iconImg) { emojiEl2.textContent = ''; emojiEl2.style.backgroundImage = 'url(' + poolItem.iconImg + ')'; emojiEl2.style.backgroundSize = 'cover'; }
                    else if (poolItem.icon) { emojiEl2.style.backgroundImage = ''; emojiEl2.textContent = poolItem.icon; }
                }
            }
        } else { setEl('dg-weather', weather); setEl('dg-status', status); }

        if (statusPoolData.length === 0) setEl('dg-weather', weather);
        
        // 👉 应用寄语
        var noteTextEl = document.getElementById('dg-note-text');
        if (noteTextEl) noteTextEl.textContent = noteText; 
        
        var wBadge = document.getElementById('dg-note-weather-badge');
        if (wBadge) wBadge.style.display = 'none';
        setEl('dg-section-label-partner', pName + ' 今日状态');
        setEl('dg-weather-label', pName + ' 的天气');
        setEl('dg-status-label', pName + ' 的状态');
        var months = ['一','二','三','四','五','六','七','八','九','十','十一','十二'];
        setEl('dg-date-stamp', now.getFullYear() + ' · ' + months[now.getMonth()] + '月' + now.getDate() + '日');

        // 背景图逻辑 (保持原样)
        var headerBg = localStorage.getItem('dg_header_bg'); var bgEl = document.getElementById('dg-header-band-bg'); if (bgEl && headerBg) { bgEl.style.backgroundImage = 'url(' + headerBg + ')'; bgEl.classList.add('has-img'); }
        var overlayBg = localStorage.getItem('dg_overlay_bg'); if (overlayBg) applyDgOverlayBg(overlayBg);
        var decoImg = customData.decoImg; var decoWrap2 = document.getElementById('dg-deco-img-wrap'); var decoImgEl2 = document.getElementById('dg-deco-img'); if (decoWrap2 && decoImgEl2) { if (decoImg) { decoImgEl2.src = decoImg; decoWrap2.style.display = 'block'; } else { decoWrap2.style.display = 'none'; } }

    } catch(e) { console.warn('Daily greeting build error:', e); }
}

// 其余辅助函数保持不变...
window.toggleImmersiveMode = function(force) { var isOn = (force !== undefined) ? force : !document.body.classList.contains('immersive-mode'); document.body.classList.toggle('immersive-mode', isOn); var toggle = document.getElementById('immersive-toggle'); if (toggle) toggle.classList.toggle('active', isOn); try { localStorage.setItem('immersive_mode', isOn ? '1' : '0'); } catch(e) {} if (!isOn && typeof showNotification === 'function') showNotification('已退出沉浸式模式', 'info'); };
(function() { var btn = document.getElementById('immersive-exit-btn'); if (!btn) return; var isDragging = false, hasMoved = false; var startX, startY, origRight, origBottom; function getRight() { return parseInt(btn.style.right) || 20; } function getBottom() { return parseInt(btn.style.bottom) || 100; } function onStart(e) { isDragging = true; hasMoved = false; btn.classList.add('dragging'); var touch = e.touches ? e.touches[0] : e; startX = touch.clientX; startY = touch.clientY; origRight = getRight(); origBottom = getBottom(); e.preventDefault(); } function onMove(e) { if (!isDragging) return; var touch = e.touches ? e.touches[0] : e; var dx = touch.clientX - startX; var dy = touch.clientY - startY; if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true; var newRight = Math.max(10, Math.min(window.innerWidth - 54, origRight - dx)); var newBottom = Math.max(10, Math.min(window.innerHeight - 54, origBottom - dy)); btn.style.right = newRight + 'px'; btn.style.bottom = newBottom + 'px'; btn.style.left = 'auto'; btn.style.top = 'auto'; e.preventDefault(); } function onEnd(e) { if (!isDragging) return; isDragging = false; btn.classList.remove('dragging'); if (!hasMoved) { window.toggleImmersiveMode(false); } } btn.addEventListener('mousedown', onStart, {passive: false}); btn.addEventListener('touchstart', onStart, {passive: false}); document.addEventListener('mousemove', onMove, {passive: false}); document.addEventListener('touchmove', onMove, {passive: false}); document.addEventListener('mouseup', onEnd); document.addEventListener('touchend', onEnd); btn.removeAttribute('onclick'); })();
(function() { try { if (localStorage.getItem('immersive_mode') === '1') { document.body.classList.add('immersive-mode'); var t = document.getElementById('immersive-toggle'); if (t) t.classList.add('active'); } } catch(e) {} })();
window.openDailyGreetingEditor = function() { var modal = document.getElementById('dg-editor-modal'); if (!modal) return; var customData = {}; try { customData = JSON.parse(localStorage.getItem('dg_custom_data') || '{}'); } catch(e) {} var titleEl = document.getElementById('dg-edit-title'); var noteEl = document.getElementById('dg-edit-note'); if (titleEl) titleEl.value = (customData.titles && customData.titles.length) ? customData.titles.join('\n') : (customData.title || ''); if (noteEl) noteEl.value = (customData.notes && customData.notes.length) ? customData.notes.join('\n') : (customData.note || ''); if (customData.decoImg) { var prev = document.getElementById('dg-deco-preview'); var prevImg = document.getElementById('dg-deco-preview-img'); if (prev && prevImg) { prevImg.src = customData.decoImg; prev.style.display = 'block'; } } modal.style.display = 'flex'; modal.classList.add('active'); };
window.closeDailyGreetingEditor = function() { var modal = document.getElementById('dg-editor-modal'); if (modal) { modal.style.display = 'none'; modal.classList.remove('active'); } };
window.saveDailyGreetingCustom = function() { var customData = {}; try { customData = JSON.parse(localStorage.getItem('dg_custom_data') || '{}'); } catch(e) {} var titleEl = document.getElementById('dg-edit-title'); var noteEl = document.getElementById('dg-edit-note'); if (titleEl && titleEl.value.trim()) { var titles = titleEl.value.split('\n').map(function(s){ return s.trim(); }).filter(Boolean); customData.titles = titles; customData.title = titles[0]; } else { delete customData.titles; delete customData.title; } if (noteEl && noteEl.value.trim()) { var notes = noteEl.value.split('\n').map(function(s){ return s.trim(); }).filter(Boolean); customData.notes = notes; customData.note = notes[0]; } else { delete customData.notes; delete customData.note; } localStorage.setItem('dg_custom_data', JSON.stringify(customData)); closeDailyGreetingEditor(); if (typeof _buildDailyGreeting === 'function') _buildDailyGreeting(); if (typeof showNotification === 'function') showNotification('公告已保存 ✦', 'success'); };
window.clearDgDecoImg = function() { var customData = {}; try { customData = JSON.parse(localStorage.getItem('dg_custom_data') || '{}'); } catch(e) {} delete customData.decoImg; localStorage.setItem('dg_custom_data', JSON.stringify(customData)); var prev = document.getElementById('dg-deco-preview'); if (prev) prev.style.display = 'none'; var wrap = document.getElementById('dg-deco-img-wrap'); if (wrap) wrap.style.display = 'none'; };
window.clearDgHeaderBg = function() { 
    localStorage.removeItem('dg_header_bg'); 
    var bgEl = document.getElementById('dg-header-band-bg'); 
    if (bgEl) { 
        bgEl.style.backgroundImage = ''; 
        bgEl.classList.remove('has-img'); 
         // 👇 加上这两行：把预览框也当场干掉
        var headerPrev = document.getElementById('dg-header-bg-preview');
        if (headerPrev) headerPrev.style.display = 'none';
        
        if (typeof showNotification === 'function') showNotification('顶部背景已清除', 'success'); 
    } 
};
window.onDgOverlayOpacityChange = function(val) { var tint = parseInt(val) / 100; localStorage.setItem('dg_overlay_bg_tint', tint); var valEl = document.getElementById('dg-overlay-opacity-val'); if (valEl) valEl.textContent = val + '%'; var tintLayer = document.getElementById('dg-card-tint-overlay'); if (tintLayer) tintLayer.style.background = 'rgba(0,0,0,' + tint + ')'; };
window.handleDgOverlayBgUpload = function(input) { var file = input.files[0]; if (!file) return; var reader = new FileReader(); reader.onload = function(ev) { var data = ev.target.result; localStorage.setItem('dg_overlay_bg', data); applyDgOverlayBg(data); var prev = document.getElementById('dg-overlay-bg-preview'); var prevImg = document.getElementById('dg-overlay-bg-preview-img'); if (prev && prevImg) { prevImg.src = data; prev.style.display = 'block'; } var opRow = document.getElementById('dg-overlay-opacity-row'); if (opRow) opRow.style.display = 'block'; var savedTint = parseFloat(localStorage.getItem('dg_overlay_bg_tint')); var pct = isNaN(savedTint) ? 25 : Math.round(savedTint * 100); var slider = document.getElementById('dg-overlay-opacity-slider'); var valEl = document.getElementById('dg-overlay-opacity-val'); if (slider) slider.value = pct; if (valEl) valEl.textContent = pct + '%'; }; reader.readAsDataURL(file); };
window.clearDgOverlayBg = function() { localStorage.removeItem('dg_overlay_bg'); applyDgOverlayBg(null); var prev = document.getElementById('dg-overlay-bg-preview'); if (prev) prev.style.display = 'none'; var opRow = document.getElementById('dg-overlay-opacity-row'); if (opRow) opRow.style.display = 'none'; if (typeof showNotification === 'function') showNotification('全屏背景已清除', 'success'); };
function applyDgOverlayBg(data, tintOpacity) { var card = document.getElementById('daily-greeting-card'); var bgLayer = document.getElementById('dg-card-bg-layer'); var tintLayer = document.getElementById('dg-card-tint-overlay'); if (!card || !bgLayer) return; if (tintOpacity === undefined || tintOpacity === null) { var saved = parseFloat(localStorage.getItem('dg_overlay_bg_tint')); tintOpacity = isNaN(saved) ? 0.25 : saved; } if (data) { bgLayer.style.backgroundImage = 'url(' + data + ')'; bgLayer.style.opacity = '1'; if (tintLayer) tintLayer.style.background = 'rgba(0,0,0,' + tintOpacity + ')'; card.classList.add('has-card-bg'); card.style.backgroundImage = ''; card.style.backgroundSize = ''; card.style.backgroundPosition = ''; card.style.backgroundRepeat = ''; } else { bgLayer.style.backgroundImage = ''; bgLayer.style.opacity = ''; if (tintLayer) tintLayer.style.background = 'rgba(0,0,0,0)'; card.classList.remove('has-card-bg'); } }
(function() { var savedOverlayBg = localStorage.getItem('dg_overlay_bg'); if (savedOverlayBg) { document.addEventListener('DOMContentLoaded', function() { applyDgOverlayBg(savedOverlayBg); var prev = document.getElementById('dg-overlay-bg-preview'); var prevImg = document.getElementById('dg-overlay-bg-preview-img'); if (prev && prevImg) { prevImg.src = savedOverlayBg; prev.style.display = 'block'; } var opRow = document.getElementById('dg-overlay-opacity-row'); if (opRow) opRow.style.display = 'block'; var savedOp = parseFloat(localStorage.getItem('dg_overlay_bg_tint')); var pct = isNaN(savedOp) ? 25 : Math.round(savedOp * 100); var slider = document.getElementById('dg-overlay-opacity-slider'); var valEl = document.getElementById('dg-overlay-opacity-val'); if (slider) slider.value = pct; if (valEl) valEl.textContent = pct + '%'; }); } })();
//window.switchToAnnouncementPanel = function() { var listArea = document.getElementById('custom-replies-list'); var annPanel = document.getElementById('announcement-panel'); var toolbar = document.getElementById('cr-toolbar'); var subTabs = document.getElementById('cr-sub-tabs'); var addBtn = document.getElementById('add-custom-reply'); var titleEl = document.getElementById('cr-modal-title'); if (listArea) listArea.style.display = 'none'; if (annPanel) { annPanel.style.display = 'block'; annPanel.scrollTop = 0; } if (toolbar) toolbar.style.display = 'none'; if (subTabs) subTabs.style.display = 'none'; if (addBtn) addBtn.style.display = 'none'; if (titleEl) titleEl.textContent = '今日公告配置'; var customData = {}; try { customData = JSON.parse(localStorage.getItem('dg_custom_data') || '{}'); } catch(e2) {} var titleInput = document.getElementById('dg-edit-title'); var noteInput = document.getElementById('dg-edit-note'); if (titleInput) titleInput.value = (customData.titles && customData.titles.length) ? customData.titles.join('\n') : (customData.title || ''); if (noteInput) noteInput.value = (customData.notes && customData.notes.length) ? customData.notes.join('\n') : (customData.note || ''); if (customData.decoImg) { var prev = document.getElementById('dg-deco-preview'); var prevImg = document.getElementById('dg-deco-preview-img'); if (prev && prevImg) { prevImg.src = customData.decoImg; prev.style.display = 'block'; } } var savedOverlayBg2 = localStorage.getItem('dg_overlay_bg'); if (savedOverlayBg2) { var overlayPrev = document.getElementById('dg-overlay-bg-preview'); var overlayPrevImg = document.getElementById('dg-overlay-bg-preview-img'); if (overlayPrev && overlayPrevImg) { overlayPrevImg.src = savedOverlayBg2; overlayPrev.style.display = 'block'; } } renderAnnStatusPool(); };
window.switchToAnnouncementPanel = function() {
    currentMajorTab = 'announcement';
    _batchModeActive = false;
    _batchSelectedIndices.clear();
    _searchVisible = false;
    _searchQuery = '';
    _activeGroupFilter = null;
    renderReplyLibrary();
// 补全预览图回显逻辑
    setTimeout(function() {
        var customData = {};
        try { customData = JSON.parse(localStorage.getItem('dg_custom_data') || '{}'); } catch(e) {}

        // 回显顶部背景
        var savedHeaderBg = localStorage.getItem('dg_header_bg');
        if (savedHeaderBg) {
            var hp = document.getElementById('dg-header-bg-preview');
            var hpImg = document.getElementById('dg-header-bg-preview-img');
            if (hp && hpImg) { hpImg.src = savedHeaderBg; hp.style.display = 'block'; }
        }
        // 回显卡片背景
        var savedOverlayBg = localStorage.getItem('dg_overlay_bg');
        if (savedOverlayBg) {
            var op = document.getElementById('dg-overlay-bg-preview');
            var opImg = document.getElementById('dg-overlay-bg-preview-img');
            if (op && opImg) { opImg.src = savedOverlayBg; op.style.display = 'block'; }
            var opRow = document.getElementById('dg-overlay-opacity-row');
            if (opRow) opRow.style.display = 'block';
        }
        // 回显装饰图
        if (customData.decoImg) {
            var dp = document.getElementById('dg-deco-preview');
            var dpImg = document.getElementById('dg-deco-preview-img');
            if (dp && dpImg) { dpImg.src = customData.decoImg; dp.style.display = 'block'; }
        }
    }, 50);
};


window.renderAnnStatusPool = function() { var listEl = document.getElementById('ann-status-pool-list'); if (!listEl) return; var pool = []; try { pool = JSON.parse(localStorage.getItem('dg_status_pool') || '[]'); } catch(e2) {} listEl.innerHTML = ''; if (pool.length === 0) { listEl.innerHTML = '<div style="font-size:12px;color:var(--text-secondary);text-align:center;padding:10px 0;opacity:0.6;">暂无条目，添加后将随机抽取</div>'; return; } pool.forEach(function(item, idx) { var row = document.createElement('div'); row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:9px 12px;background:linear-gradient(135deg,rgba(var(--accent-color-rgb),0.05),rgba(var(--accent-color-rgb),0.02));border-radius:12px;border:1px solid rgba(var(--accent-color-rgb),0.15);font-size:13px;transition:box-shadow 0.2s;'; var iconHtml = item.iconImg ? '<img src="' + item.iconImg + '" style="width:26px;height:26px;border-radius:50%;object-fit:cover;flex-shrink:0;">' : '<span style="font-size:18px;min-width:26px;text-align:center;flex-shrink:0;">' + (item.icon || '✦') + '</span>'; row.innerHTML = iconHtml + '<div style="flex:1;min-width:0;">' + '<div style="color:var(--text-primary);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (item.status || '—') + '</div>' + (item.label ? '<div style="color:var(--accent-color);font-size:10px;letter-spacing:1.5px;margin-top:2px;opacity:0.8;">' + item.label + '</div>' : '') + '</div>' + '<button onclick="removeAnnStatusPoolItem(' + idx + ')" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:14px;padding:3px 5px;border-radius:6px;opacity:0.6;transition:opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">✕</button>'; listEl.appendChild(row); }); };
window.addAnnStatusPoolItem = function() { var statusInput = document.getElementById('ann-status-pool-input'); var labelInput = document.getElementById('ann-status-label-input'); var iconInput = document.getElementById('ann-status-icon-input'); var status = statusInput ? statusInput.value.trim() : ''; var label = labelInput ? labelInput.value.trim() : ''; var icon = iconInput ? iconInput.value.trim() : ''; var iconImg = iconInput ? (iconInput.dataset.imgSrc || '') : ''; if (!status && !label) { if (typeof showNotification === 'function') showNotification('请至少填写状态或标签', 'warning'); return; } var pool = []; try { pool = JSON.parse(localStorage.getItem('dg_status_pool') || '[]'); } catch(e2) {} var entry = { status: status, label: label, icon: icon || '✦' }; if (iconImg) entry.iconImg = iconImg; pool.push(entry); localStorage.setItem('dg_status_pool', JSON.stringify(pool)); if (statusInput) statusInput.value = ''; if (labelInput) labelInput.value = ''; if (iconInput) { iconInput.value = ''; delete iconInput.dataset.imgSrc; } renderAnnStatusPool(); if (typeof showNotification === 'function') showNotification('已添加到随机库', 'success'); };
window.handleAnnStatusIconUpload = function(input) { var file = input.files[0]; if (!file) return; var reader = new FileReader(); reader.onload = function(ev) { var iconInput = document.getElementById('ann-status-icon-input'); if (iconInput) { iconInput.dataset.imgSrc = ev.target.result; iconInput.value = '[图片]'; iconInput.style.fontSize = '10px'; } }; reader.readAsDataURL(file); };
window.removeAnnStatusPoolItem = function(idx) { var pool = []; try { pool = JSON.parse(localStorage.getItem('dg_status_pool') || '[]'); } catch(e2) {} pool.splice(idx, 1); localStorage.setItem('dg_status_pool', JSON.stringify(pool)); renderAnnStatusPool(); };
document.addEventListener('DOMContentLoaded', function() { 
    var headerInput = document.getElementById('dg-header-img-input'); 
    if (headerInput) { 
        headerInput.addEventListener('change', function(e) { 
            var file = e.target.files[0]; if (!file) return; 
            var reader = new FileReader();
            reader.onload = function(ev) { 
                var data = ev.target.result; 
                localStorage.setItem('dg_header_bg', data); 
                var bgEl = document.getElementById('dg-header-band-bg'); 
                if (bgEl) { 
                    bgEl.style.backgroundImage = 'url(' + data + ')'; 
                    bgEl.classList.add('has-img'); 
                } 
                var headerPrev = document.getElementById('dg-header-bg-preview');
                var headerPrevImg = document.getElementById('dg-header-bg-preview-img');
                if (headerPrev && headerPrevImg) {
                    headerPrevImg.src = data;
                    headerPrev.style.display = 'block';
                }
            }; 
            reader.readAsDataURL(file); 
        }); 
    } 
    var decoInput = document.getElementById('dg-deco-img-input'); 
    if (decoInput) { 
        decoInput.addEventListener('change', function(e) { 
            var file = e.target.files[0]; 
            if (!file) return; 
            var reader = new FileReader(); reader.onload = function(ev) { 
                var data = ev.target.result; 
                var customData = {}; try { 
                    customData = JSON.parse(localStorage.getItem('dg_custom_data') || '{}'); 
                } catch(ex) {} customData.decoImg = data; 
                localStorage.setItem('dg_custom_data', JSON.stringify(customData)); 
                var prev = document.getElementById('dg-deco-preview'); 
                var prevImg = document.getElementById('dg-deco-preview-img'); 
                if (prev && prevImg) { 
                    prevImg.src = data; prev.style.display = 'block'; 
                } 
            }; reader.readAsDataURL(file); 
        }); 
    } 
});
// ==========================================
// 页面加载时：自动恢复公告管理面板里的预览图状态
// ==========================================
setTimeout(function() {
    var customData = {};
    try { customData = JSON.parse(localStorage.getItem('dg_custom_data') || '{}'); } catch(e) {}

    // 1. 恢复：顶部背景图预览
    var savedHeaderBg = localStorage.getItem('dg_header_bg');
    if (savedHeaderBg) {
        var headerPrev = document.getElementById('dg-header-bg-preview');
        var headerPrevImg = document.getElementById('dg-header-bg-preview-img');
        if (headerPrev && headerPrevImg) {
            headerPrevImg.src = savedHeaderBg;
            headerPrev.style.display = 'block';
        }
    }

    // 2. 恢复：卡片内背景图预览
    var savedOverlayBg = localStorage.getItem('dg_overlay_bg');
    if (savedOverlayBg) {
        var overlayPrev = document.getElementById('dg-overlay-bg-preview');
        var overlayPrevImg = document.getElementById('dg-overlay-bg-preview-img');
        if (overlayPrev && overlayPrevImg) {
            overlayPrevImg.src = savedOverlayBg;
            overlayPrev.style.display = 'block';
        }
        var opRow = document.getElementById('dg-overlay-opacity-row');
        if (opRow) opRow.style.display = 'block';
        var savedOp = parseFloat(localStorage.getItem('dg_overlay_bg_tint'));
        var pct = isNaN(savedOp) ? 25 : Math.round(savedOp * 100);
        var slider = document.getElementById('dg-overlay-opacity-slider');
        var valEl = document.getElementById('dg-overlay-opacity-val');
        if (slider) slider.value = pct;
        if (valEl) valEl.textContent = pct + '%';
    }

    // 3. 恢复：装饰图预览
    if (customData.decoImg) {
        var decoPrev = document.getElementById('dg-deco-preview');
        var decoPrevImg = document.getElementById('dg-deco-preview-img');
        if (decoPrev && decoPrevImg) {
            decoPrevImg.src = customData.decoImg;
            decoPrev.style.display = 'block';
        }
    }
}, 100);

window.updateDynamicNames = function() { try { var pName = (typeof settings !== 'undefined' && settings.partnerName) ? settings.partnerName : '梦角'; var mName = (typeof settings !== 'undefined' && settings.myName) ? settings.myName : '我'; var tabPartner = document.getElementById('mood-tab-partner'); if (tabPartner) tabPartner.textContent = pName + '的记录'; var tabMe = document.getElementById('mood-tab-me'); if (tabMe) tabMe.textContent = mName + '的记录'; var detailPartnerTitle = document.getElementById('detail-partner-title'); if (detailPartnerTitle) detailPartnerTitle.textContent = pName + '的'; var partnerNoRec = document.getElementById('detail-partner-no-record'); if (partnerNoRec) { var msgEl = partnerNoRec; if (!msgEl.querySelector('span')) msgEl.textContent = pName + ' 这天还没有留下记录'; } var editPartnerBtn = document.getElementById('edit-partner-mood'); if (editPartnerBtn) editPartnerBtn.textContent = '修改' + pName; var deletePartnerBtn = document.getElementById('delete-partner-mood'); if (deletePartnerBtn) deletePartnerBtn.textContent = '删除' + pName; var continueBtn = document.getElementById('continue-btn'); if (continueBtn) continueBtn.title = '让' + pName + '继续说'; var envInfo = document.querySelector('.env-send-info'); if (envInfo) { var textNodes = Array.from(envInfo.childNodes).filter(n => n.nodeType === 3); textNodes.forEach(function(n) { if (n.textContent.includes('对方将在') || n.textContent.includes('小时内回信')) { n.textContent = pName + ' 将在 10-24 小时内回信（8-12 句话）'; } }); } setDgLabel('dg-section-label-partner', pName + ' 今日状态'); setDgLabel('dg-weather-label', pName + ' 的天气'); setDgLabel('dg-status-label', pName + ' 的状态'); var envInfoSpan = document.getElementById('env-reply-time-info'); if (envInfoSpan) envInfoSpan.textContent = pName + ' 将在 10-24 小时内回信（8-12 句话）'; var pokeInput = document.getElementById('poke-input'); if (pokeInput) pokeInput.placeholder = '例如：拍了拍"' + pName + '"的肩膀'; document.querySelectorAll('[data-name-partner]').forEach(function(el) { el.textContent = pName + '的记录'; }); document.querySelectorAll('[data-name-me]').forEach(function(el) { el.textContent = mName + '的记录'; }); document.querySelectorAll('[data-delete-partner]').forEach(function(el) { el.textContent = '删除' + pName; }); document.querySelectorAll('[data-edit-partner]').forEach(function(el) { el.textContent = '修改' + pName; }); } catch(e) { console.warn('updateDynamicNames error:', e); } };
function setDgLabel(id, txt) { var el = document.getElementById(id); if (el && el.tagName !== 'INPUT') el.textContent = txt; }
window.closeDailyGreeting = function() { try { var modal = document.getElementById('daily-greeting-modal'); if (modal) { modal.style.opacity = '0'; modal.style.transition = 'opacity 0.3s ease'; setTimeout(function() { modal.classList.add('hidden'); modal.style.opacity = ''; modal.style.transition = ''; }, 320); } localStorage.setItem('dailyGreetingShown', new Date().toDateString()); } catch(e) {} };
window.reopenDailyGreeting = function() { try { if (typeof _buildDailyGreeting === 'function') _buildDailyGreeting(); var modal = document.getElementById('daily-greeting-modal'); if (modal) { modal.style.opacity = '0'; modal.classList.remove('hidden'); requestAnimationFrame(function() { modal.style.transition = 'opacity 0.3s ease'; modal.style.opacity = '1'; }); } } catch(e) {} };
window.tryShowDailyGreeting = function() { try { if (localStorage.getItem('dailyGreetingShown') === new Date().toDateString()) return; var now = new Date(); var todayStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0'); var moodDataRaw = window.moodData || {}; var todayMood = moodDataRaw[todayStr]; if (!todayMood || !todayMood.partner) { setTimeout(function() { var refreshedMood = (window.moodData || {})[todayStr]; _buildDailyGreeting(); var modal = document.getElementById('daily-greeting-modal'); if (modal) modal.classList.remove('hidden'); localStorage.setItem('dailyGreetingShown', new Date().toDateString()); }, 45000); return; } _buildDailyGreeting(); var modal = document.getElementById('daily-greeting-modal'); if (modal) modal.classList.remove('hidden'); } catch(e) { console.warn('Daily greeting show error:', e); } };

//点击公告天气标签：弹出修改框
window.startEditDgWeather = function() {
    var now = new Date();
    var key = 'customWeather_' + now.getFullYear() + '_' + (now.getMonth()+1) + '_' + now.getDate();
    var current = localStorage.getItem(key) || '';
    
    var old = document.getElementById('dg-weather-edit-modal');
    if (old) old.remove();

    var wrap = document.createElement('div');
    wrap.id = 'dg-weather-edit-modal';
    wrap.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);';
    wrap.innerHTML = `
        <div style="background:var(--primary-bg);border-radius:20px;padding:22px 20px;width:min(320px,88vw);box-shadow:0 20px 60px rgba(0,0,0,0.28);border:1px solid var(--border-color);">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                <span style="font-size:15px;font-weight:700;color:var(--text-primary);font-family:var(--font-family);">自定义天气</span>
                <button id="dg-weather-close" style="background:none;border:none;font-size:18px;color:var(--text-secondary);cursor:pointer;">✕</button>
            </div>
            <input id="dg-weather-input" type="text" maxlength="20" placeholder="例如：晴空万里、细雨蒙蒙" value="${current.replace(/"/g, '&quot;')}" style="width:100%;padding:10px;border:1.5px solid var(--border-color);border-radius:10px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;outline:none;font-family:var(--font-family);box-sizing:border-box;margin-bottom:16px;">
            <div style="display:flex;gap:8px;">
                <button id="dg-weather-clear" style="flex:1;padding:9px;border:1px solid var(--border-color);border-radius:10px;background:var(--secondary-bg);color:var(--text-secondary);font-size:13px;cursor:pointer;font-family:var(--font-family);">恢复默认</button>
                <button id="dg-weather-save" style="flex:2;padding:9px;border:none;border-radius:10px;background:var(--accent-color);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--font-family);">保存</button>
            </div>
        </div>
    `;
    document.body.appendChild(wrap);

    var input = document.getElementById('dg-weather-input');
    if(input) input.focus();

    function close() { wrap.remove(); }

    document.getElementById('dg-weather-close').onclick = close;
    wrap.onclick = function(e) { if(e.target === wrap) close(); };

    document.getElementById('dg-weather-clear').onclick = function() {
        localStorage.removeItem(key);
        if (typeof _buildDailyGreeting === 'function') _buildDailyGreeting();
        close();
        if (typeof showNotification === 'function') showNotification('已恢复默认天气', 'success', 1500);
    };

    document.getElementById('dg-weather-save').onclick = function() {
        var val = input.value.trim();
        if (val) {
            localStorage.setItem(key, val);
            if (typeof _buildDailyGreeting === 'function') _buildDailyGreeting();
            close();
            if (typeof showNotification === 'function') showNotification('天气已更新 ✓', 'success', 1500);
        } else {
            if (typeof showNotification === 'function') showNotification('请输入天气内容', 'warning');
        }
    };
};