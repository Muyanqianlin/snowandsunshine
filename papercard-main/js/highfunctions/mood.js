/**
 * features/mood.js - 心晴手账 Mood Tracker
 * 心情日历与情绪追踪
 */

function toggleBatchFavoriteMode() {
            isBatchFavoriteMode = !isBatchFavoriteMode;
            selectedMessages = [];

            if (isBatchFavoriteMode) {
                document.body.classList.add('batch-favorite-mode');
                showBatchFavoriteActions();
                showNotification('批量收藏模式已开启，点击消息进行选择', 'info');
            } else {
                document.body.classList.remove('batch-favorite-mode');
                hideBatchFavoriteActions();
                showNotification('批量收藏模式已关闭', 'info');
            }

            renderMessages(true);
        }

        function hideBatchFavoriteActions() {
            const actions = document.querySelector('.batch-favorite-actions');
            if (actions) {

                actions.style.animation = 'floatUpAction 0.3s reverse forwards';
                setTimeout(() => {
                    actions.remove();
                }, 300);
            }
        }


        function showBatchFavoriteActions() {

            if (document.querySelector('.batch-favorite-actions')) return;

            const actions = document.createElement('div');
            actions.className = 'batch-favorite-actions';

            actions.innerHTML = `
        <button class="batch-action-btn-pill batch-btn-cancel" id="cancel-batch-favorite">
        <i class="fas fa-times"></i> 取消
        </button>
        <button class="batch-action-btn-pill batch-btn-confirm" id="confirm-batch-favorite">
        <i class="fas fa-check"></i> 确认收藏 (0)
        </button>
        `;
            document.body.appendChild(actions);

            document.getElementById('confirm-batch-favorite').addEventListener('click', confirmBatchFavorite);
            document.getElementById('cancel-batch-favorite').addEventListener('click', toggleBatchFavoriteMode);
        }


        function confirmBatchFavorite() {
            if (selectedMessages.length === 0) {
                showNotification('请先选择要收藏的消息', 'warning');
                return;
            }


            const count = selectedMessages.length;


            selectedMessages.forEach(msgId => {
                const message = messages.find(m => m.id === msgId);
                if (message) {
                    message.favorited = true;
                }
            });


            throttledSaveData();


            toggleBatchFavoriteMode();


            showNotification(`已成功收藏 ${count} 条消息`, 'success');
        }

/*const MOOD_OPTIONS = [
    { key: 'happy', kaomoji: '😆', label: '开心', color: '#FFD93D' },
    { key: 'excited', kaomoji: '🥰', label: '兴奋', color: '#FF6B6B' },
    { key: 'peace', kaomoji: '☺️', label: '平淡', color: '#6BCB77' },
    { key: 'sad', kaomoji: '😕', label: '难过', color: '#4D96FF' },
    { key: 'tired', kaomoji: '😞', label: '疲惫', color: '#8D9EFF' },
    { key: 'angry', kaomoji: '😠', label: '生气', color: '#FF4757' },
    { key: 'love', kaomoji: '🥰', label: '想你', color: '#FF9A8B' },
    { key: 'busy', kaomoji: '😵‍💫', label: '忙碌', color: '#A8D8EA' },
    { key: 'sleepy', kaomoji: '😴', label: '困困', color: '#E0C3FC' },
{ key: 'lonely', kaomoji: '🥹', label: '孤单', color: '#B8A9C9' }, 
{ key: 'cool', kaomoji: '😎', label: '潇洒', color: '#2C3E50' },
    { key: 'cute', kaomoji: '🥺', label: '撒娇', color: '#FFB6C1' }
];*/
// 统一的心情大池子
let ALL_MOODS = [];
let hasInitMoods = false; // 标记是不是第一次初始化
let moodData = {}; 
let currentCalendarDate = new Date();
window.selectedDateStr = null;
let selectedDateStr = null;
let currentMoodPage = 1; 
let currentMoodEditTarget = 'me'; 
//let customMoodOptions = []; 
let customMoodSelectedColor = '#FFD93D';
const CUSTOM_MOOD_COLORS = ['#FFD93D','#FF6B6B','#6BCB77','#4D96FF','#8D9EFF','#FF9A8B','#A8D8EA','#E0C3FC','#B8A9C9','#2C3E50'];
/*async function initMoodData() {
  const savedMoods = await localforage.getItem(getStorageKey('moodCalendar'));
  if (savedMoods) {
    moodData = savedMoods;
  }
  
  // 核心改变：只读写一个 ALL_MOODS
  const savedAllMoods = await localforage.getItem('allMoodsPool');
  if (savedAllMoods && savedAllMoods.length > 0) {
    await new Promise(r => setTimeout(r, 0));
    ALL_MOODS = savedAllMoods;
    hasInitMoods = true;
  } else {
    // 如果本地没存过，说明是第一次打开，把自带的放进去（只执行一次）
    ALL_MOODS = [
      { key: 'happy', kaomoji: '😆', label: '开心', color: '#FFD93D' },
      { key: 'excited', kaomoji: '🥰', label: '兴奋', color: '#FF6B6B' },
      { key: 'peace', kaomoji: '☺️', label: '平淡', color: '#6BCB77' },
      { key: 'sad', kaomoji: '😕', label: '难过', color: '#4D96FF' },
      { key: 'tired', kaomoji: '😞', label: '疲惫', color: '#8D9EFF' },
      { key: 'angry', kaomoji: '😠', label: '生气', color: '#FF4757' },
      { key: 'love', kaomoji: '🥰', label: '想你', color: '#FF9A8B' },
      { key: 'busy', kaomoji: '😵‍💫', label: '忙碌', color: '#A8D8EA' },
      { key: 'sleepy', kaomoji: '😴', label: '困困', color: '#E0C3FC' },
      { key: 'lonely', kaomoji: '🥹', label: '孤单', color: '#B8A9C9' },
      { key: 'cool', kaomoji: '😎', label: '潇洒', color: '#2C3E50' },
      { key: 'cute', kaomoji: '🥺', label: '撒娇', color: '#FFB6C1' }
    ];
    // 存进本地，以后再也不走这个 else 了
    localforage.setItem('allMoodsPool', ALL_MOODS);
  }

  window.moodData = moodData;
  checkPartnerDailyMood();
}*/
async function initMoodData() {
    const savedMoods = await localforage.getItem(getStorageKey('moodCalendar'));
    if (savedMoods) {
        moodData = savedMoods;
    }
    
    // ==========================================
    // 核心迁移逻辑：把旧数据捞出来，塞进新的 ALL_MOODS 里
    // ==========================================
    const savedAllMoods = await localforage.getItem('allMoodsPool');
    
    // 先把预设的 12 个放进去
    ALL_MOODS = [
        { key: 'happy', kaomoji: '😆', label: '开心', color: '#FFD93D' },
        { key: 'excited', kaomoji: '🥰', label: '兴奋', color: '#FF6B6B' },
        { key: 'peace', kaomoji: '☺️', label: '平淡', color: '#6BCB77' },
        { key: 'sad', kaomoji: '😕', label: '难过', color: '#4D96FF' },
        { key: 'tired', kaomoji: '😞', label: '疲惫', color: '#8D9EFF' },
        { key: 'angry', kaomoji: '😠', label: '生气', color: '#FF4757' },
        { key: 'love', kaomoji: '🥰', label: '想你', color: '#FF9A8B' },
        { key: 'busy', kaomoji: '😵‍💫', label: '忙碌', color: '#A8D8EA' },
        { key: 'sleepy', kaomoji: '😴', label: '困困', color: '#E0C3FC' },
        { key: 'lonely', kaomoji: '🥹', label: '孤单', color: '#B8A9C9' },
        { key: 'cool', kaomoji: '😎', label: '潇洒', color: '#2C3E50' },
        { key: 'cute', kaomoji: '🥺', label: '撒娇', color: '#FFB6C1' }
    ];

    // 1. 如果新池子里已经有东西了（比如有用户已经用过新版了），先以新池子为准
    if (savedAllMoods && savedAllMoods.length > 0) {
        ALL_MOODS = savedAllMoods;
    }

    // 2. 去旧的地方（就是旧代码用的那个 key）把自定义表情读出来
    const oldCustomMoods = await localforage.getItem(getStorageKey('customMoodOptions'));
    
    if (oldCustomMoods && Array.isArray(oldCustomMoods) && oldCustomMoods.length > 0) {
        let addedCount = 0;
        oldCustomMoods.forEach(oldMood => {
            // 检查一下新池子里有没有这个表情了，防止重复添加
            const exists = ALL_MOODS.some(m => m.key === oldMood.key);
            if (!exists) {
                ALL_MOODS.push(oldMood);
                addedCount++;
            }
        });

        // 3. 如果有新增的，就存进新的统一池子 'allMoodsPool' 里
        if (addedCount > 0) {
            await localforage.setItem('allMoodsPool', JSON.parse(JSON.stringify(ALL_MOODS)));
            // 可选：弹个提示告诉用户表情回来了
            if(typeof showNotification === 'function') {
                showNotification(`已自动恢复 ${addedCount} 个自定义表情`, 'success');
            }
        }
    }
    // ==========================================
    // 迁移逻辑结束
    // ==========================================

    window.moodData = moodData;
    checkPartnerDailyMood();
}

async function saveAllMoods() {
    await localforage.setItem('allMoodsPool', JSON.parse(JSON.stringify(ALL_MOODS)));
}

// 统一的获取函数（替换掉原来的 getAllMoodOptions）
function getAllMoodOptions() {
  return ALL_MOODS;
}
window.getAllMoodOptions = getAllMoodOptions;

 function checkPartnerDailyMood() {
    const today = new Date();
    const dateStr = formatDateStr(today);
    
    if (!moodData[dateStr]) {
        moodData[dateStr] = {};
    }

    if (!moodData[dateStr].partner && moodData[dateStr].partnerChecked === undefined) {
        moodData[dateStr].partnerChecked = true;
        if (Math.random() < 0.15) {
            saveMoodData();
            return;
        }
        const randomMood = ALL_MOODS[Math.floor(Math.random() * ALL_MOODS.length)];
        moodData[dateStr].partner = randomMood.key;
        try {
            const cReplies = (typeof customReplies !== 'undefined') ? customReplies : (window._customReplies || []);
            const sourcePool = [...cReplies];
            if (sourcePool.length > 0) {
                const count = Math.floor(Math.random() * 3) + 1;
                const chosen = [];
                const shuffled = [...sourcePool].sort(() => Math.random() - 0.5);
                for (let i = 0; i < Math.min(count, shuffled.length); i++) {
                    chosen.push(shuffled[i]);
                }
                moodData[dateStr].partnerNote = chosen.join('　');
            }
        } catch(e) {  }
        saveMoodData();
    }
}
async function saveMoodData() {
    await localforage.setItem(getStorageKey('moodCalendar'), moodData);
    window.moodData = moodData;
    var moodModal = document.getElementById('mood-modal');
    if (moodModal && !moodModal.classList.contains('hidden') && moodModal.style.display !== 'none') {
        renderMoodCalendar();
    }
}
function saveCustomMoodOptions() {
    localforage.setItem(getStorageKey('customMoodOptions'), customMoodOptions);
}

function getAllMoodOptions() {
  return ALL_MOODS;
}
window.getAllMoodOptions = getAllMoodOptions; // 暴露给日历使用

function formatDateStr(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}


let currentMoodSelection = null; 
function renderMoodCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthLabel = document.getElementById('calendar-month-label');
    
    if (!grid || !monthLabel) return;

    grid.innerHTML = '';
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    monthLabel.textContent = `${year}年 ${month + 1}月`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); 

    let stats = {
        me: { total: 0, counts: {} },
        partner: { total: 0, counts: {} }
    };

    for (let i = 0; i < startDayOfWeek; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        grid.appendChild(empty);
    }

    const todayStr = formatDateStr(new Date());

    for (let d = 1; d <= daysInMonth; d++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        
        const dateObj = new Date(year, month, d);
        const dateStr = formatDateStr(dateObj);
        
        if (dateStr === todayStr) {
            dayDiv.classList.add('today');
            dayDiv.style.borderColor = 'var(--accent-color)';
        }

        const numSpan = document.createElement('span');
        numSpan.textContent = d;
        dayDiv.appendChild(numSpan);

        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'mood-dots-container';

        const dayData = moodData[dateStr];
        
        if (dayData) {
            if (dayData.user) {
                const moodObj = getAllMoodOptions().find(m => m.key === dayData.user);
                if (moodObj) {
                    stats.me.counts[moodObj.key] = (stats.me.counts[moodObj.key] || 0) + 1;
                    stats.me.total++;
                    const dot = createMoodDot(moodObj, dayData.note, false);
                    dotsContainer.appendChild(dot);
                }
            }
            if (dayData.partner) {
                const moodObj = getAllMoodOptions().find(m => m.key === dayData.partner);
                if (moodObj) {
                    stats.partner.counts[moodObj.key] = (stats.partner.counts[moodObj.key] || 0) + 1;
                    stats.partner.total++;
                    const dot = createMoodDot(moodObj, dayData.partnerNote, true); 
                    dotsContainer.appendChild(dot);
                }
            }
        }

        dayDiv.appendChild(dotsContainer);

        dayDiv.addEventListener('click', () => {
            const dayEntry = moodData[dateStr];
            if (dayEntry && (dayEntry.user || dayEntry.partner)) {
                showDayDetails(dateStr, dayEntry);
            } else {
                openMoodSelector(dateStr, 'me');
            }
        });

        grid.appendChild(dayDiv);
    }

   // updateDualMoodStats(stats);
}

function createMoodDot(moodObj, note, isPartner) {
    const dot = document.createElement('div');
    dot.className = `mood-detail-dot ${isPartner ? 'partner-mood' : ''}`;
    dot.style.backgroundColor = moodObj.color;
    
    if (isPartner) {
        dot.innerHTML = `
            <span class="mood-kaomoji-span">${moodObj.kaomoji}</span>
            <span class="mood-text-span">Ta</span>
        `;
    } else {
        const displayText = (note && note.trim()) ? note : moodObj.label;
        dot.innerHTML = `
            <span class="mood-kaomoji-span">${moodObj.kaomoji}</span>
            <span class="mood-text-span" style="margin-left:2px;">${displayText}</span>
        `;
    }
    return dot;
}

window.editStatsWeather = function(el, who) {
    if (el.querySelector('input')) return;
    var todayStr = formatDateStr(new Date());
    if (!moodData[todayStr]) moodData[todayStr] = {};
    var current = who === 'me' ? (moodData[todayStr].myWeather || '') : (moodData[todayStr].partnerWeather || '');
    var input = document.createElement('input');
    input.type = 'text';
    input.value = current;
    input.maxLength = 20;
    input.placeholder = '今日天气…';
    input.style.cssText = 'width:100%;padding:3px 7px;border:1px solid var(--accent-color);border-radius:8px;font-size:12px;background:var(--primary-bg);color:var(--text-primary);outline:none;text-align:center;';
    el.innerHTML = '';
    el.appendChild(input);
    input.focus(); input.select();
    function save() {
        var val = input.value.trim();
        if (who === 'me') moodData[todayStr].myWeather = val;
        else moodData[todayStr].partnerWeather = val;
        saveMoodData();
        el.innerHTML = val ? `<span>${val}</span>` : `<span style="opacity:0.4;">+ 天气</span>`;
    }
    input.addEventListener('blur', save);
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); save(); }
        if (e.key === 'Escape') { el.innerHTML = current ? `<span>${current}</span>` : `<span style="opacity:0.4;">+ 天气</span>`; }
    });
};

window.deleteDailyMood = function(dateStr, who) {
    if (!moodData[dateStr]) return;
    if (who === 'me') { delete moodData[dateStr].user; delete moodData[dateStr].note; delete moodData[dateStr].myWeather; }
    else { delete moodData[dateStr].partner; delete moodData[dateStr].partnerNote; delete moodData[dateStr].partnerWeather; }
    if (!moodData[dateStr].user && !moodData[dateStr].partner) delete moodData[dateStr];
    saveMoodData();
    renderMoodCalendar();
    if (window.renderCalendar) window.renderCalendar();
    if (window.updateEventsList && dateStr) window.updateEventsList(dateStr);
    showNotification('已删除心情记录', 'success');
    closeMoodOverlay();
};


function renderMoodOptionsGrid(targetKey, isEditMode = false) {
  const allMoods = getAllMoodOptions();
  const optionsGrid = document.getElementById('mood-options-grid');
  
  optionsGrid.innerHTML = allMoods.map(mood => {
    const isSelected = targetKey === mood.key;
    // 在编辑模式下，不显示原本那个外层的选中高亮背景，保持干净
    const selectedStyle = (!isEditMode && isSelected) ? `background:${mood.color}; color:#fff; border-color:${mood.color}; transform:scale(1.05); box-shadow:0 4px 10px rgba(0,0,0,0.15);` : '';
    
    // 编辑模式下，点击走修改逻辑；普通模式下，走原有的选择逻辑
    const clickAction = isEditMode ? `openEditMoodDialog('${mood.key}')` : `tempSelectMood('${mood.key}')`;
    
    return `
      <div class="mood-option-btn" style="${selectedStyle}" onclick="${clickAction}">
        <div class="mood-kaomoji" style="${(!isEditMode && isSelected) ? 'color:#fff' : `color:${mood.color}`}">${mood.kaomoji}</div>
        <div class="mood-label">${mood.label}</div>
      </div>
    `;
  }).join('');
}


function switchMoodPage(dir) {
    currentMoodPage = Math.max(1, Math.min(2, currentMoodPage + dir));
    const page1 = document.getElementById('mood-page-1');
    const page2 = document.getElementById('mood-page-2');
    const indicator = document.getElementById('mood-page-indicator');
    const prevBtn = document.getElementById('mood-page-prev');
    const nextBtn = document.getElementById('mood-page-next');
    if (currentMoodPage === 1) {
        page1.style.display = 'block'; page2.style.display = 'none';
        indicator.textContent = '第 1 页 · 心情';
        prevBtn.disabled = true; nextBtn.disabled = false;
    } else {
        page1.style.display = 'none'; page2.style.display = 'block';
        const isPartner = currentMoodEditTarget === 'partner';
        indicator.textContent = '第 2 页 · 随记';
        document.getElementById('mood-note-label').textContent = isPartner ? '对方随记:' : '随记:';
        document.getElementById('mood-note-input').placeholder = isPartner ? '记录对方今天发生的事...' : '记录下今天发生的小事...';
        prevBtn.disabled = false; nextBtn.disabled = true;
    }
}
window.switchMoodPage = switchMoodPage;
let isMoodEditMode = false;

window.toggleMoodEditMode = function() {
  isMoodEditMode = !isMoodEditMode;
  const btn = document.getElementById('toggle-edit-mood-btn');
  
  if (isMoodEditMode) {
    // 进入编辑模式
    btn.style.background = 'var(--accent-color)';
    btn.style.color = '#fff';
    btn.innerHTML = '<i class="fas fa-times"></i> 完成编辑';
    // 重新渲染网格，传入 true
    renderMoodOptionsGrid(currentMoodSelection, true);
    showNotification('已进入编辑模式，点击任意心情可删除', 'info');
  } else {
    // 退出编辑模式
    btn.style.background = '';
    btn.style.color = '';
    btn.innerHTML = '<i class="fas fa-pen"></i> 编辑心情';
    // 恢复普通网格
    renderMoodOptionsGrid(currentMoodSelection, false);
  }
};

function switchMoodEditTarget(target) {
    currentMoodEditTarget = target;
    document.getElementById('mood-tab-me').classList.toggle('active', target === 'me');
    document.getElementById('mood-tab-partner').classList.toggle('active', target === 'partner');
    const existing = moodData[selectedDateStr];
    let currentKey, noteVal;
    if (target === 'me') {
        currentKey = existing ? existing.user : null;
        noteVal = (existing && existing.note) ? existing.note : '';
    } else {
        currentKey = existing ? existing.partner : null;
        noteVal = (existing && existing.partnerNote) ? existing.partnerNote : '';
    }
    currentMoodSelection = currentKey;
    document.getElementById('mood-note-input').value = noteVal;
    renderMoodOptionsGrid(currentKey, false);
    switchMoodPage(0); 
}
window.switchMoodEditTarget = switchMoodEditTarget;

window.openMoodSelector = openMoodSelector; 

function openMoodSelector(dateStr, editTarget) {
    selectedDateStr = dateStr;
    window.selectedDateStr = dateStr;
    currentMoodEditTarget = editTarget || 'me';
    currentMoodPage = 1;
    currentMoodSelection = null;

    const overlay = document.getElementById('mood-selector-overlay');
    const editorView = document.getElementById('mood-editor-view');
    const detailView = document.getElementById('mood-detail-view');
    const dateTitle = document.getElementById('mood-selector-date');

    if (window._moodOverlayRafId) {
        cancelAnimationFrame(window._moodOverlayRafId);
        window._moodOverlayRafId = null;
    }

    overlay.classList.remove('active');
    overlay.classList.add('active'); 
    editorView.style.display = 'block';
    if (detailView) detailView.style.display = 'none';

    const [y, m, d] = dateStr.split('-');
    dateTitle.textContent = `${m}月${d}日`;

    document.getElementById('mood-tab-me').classList.toggle('active', currentMoodEditTarget === 'me');
    document.getElementById('mood-tab-partner').classList.toggle('active', currentMoodEditTarget === 'partner');

    const existing = moodData[dateStr];
    let currentKey, noteVal, weatherVal;
    if (currentMoodEditTarget === 'me') {
        currentKey = existing ? existing.user : null;
        noteVal = (existing && existing.note) ? existing.note : '';
        weatherVal = (existing && existing.myWeather) ? existing.myWeather : '';
    } else {
        currentKey = existing ? existing.partner : null;
        noteVal = (existing && existing.partnerNote) ? existing.partnerNote : '';
        weatherVal = (existing && existing.partnerWeather) ? existing.partnerWeather : '';
    }
    currentMoodSelection = currentKey;
    document.getElementById('mood-note-input').value = noteVal;
    const weatherInput = document.getElementById('mood-weather-input');
    if (weatherInput) weatherInput.value = weatherVal;
    const weatherLabel = document.getElementById('mood-weather-label');
    if (weatherLabel) {
        var pNameW = (typeof settings !== 'undefined' && settings.partnerName) ? settings.partnerName : '梦角';
        var mNameW = (typeof settings !== 'undefined' && settings.myName) ? settings.myName : '我';
        if (weatherLabel.firstChild) weatherLabel.firstChild.textContent = currentMoodEditTarget === 'me' ? mNameW + '的天气\u00a0' : pNameW + '的天气\u00a0';
    }

    document.getElementById('mood-page-1').style.display = 'block';
    document.getElementById('mood-page-2').style.display = 'none';
    document.getElementById('mood-page-indicator').textContent = '第 1 页 · 心情';
    document.getElementById('mood-page-prev').disabled = true;
    document.getElementById('mood-page-next').disabled = false;

    renderMoodOptionsGrid(currentKey, false);
}

window.editPartnerMoodRecord = function() {
    openMoodSelector(selectedDateStr, 'partner');
};

window.tempSelectMood = function(key) {
    currentMoodSelection = key;
    renderMoodOptionsGrid(key);
}

document.getElementById('confirm-mood-save').addEventListener('click', () => {
    if (!selectedDateStr) return;
    /*if (!currentMoodSelection && currentMoodPage === 1) {
        showNotification('请先选择一个心情图标', 'warning');
        return;
    }*/
    if (!moodData[selectedDateStr]) moodData[selectedDateStr] = {};
    const weatherVal = (document.getElementById('mood-weather-input') || {}).value || '';
    if (currentMoodEditTarget === 'me') {
        if (currentMoodSelection) moodData[selectedDateStr].user = currentMoodSelection;
        moodData[selectedDateStr].note = document.getElementById('mood-note-input').value.trim();
        moodData[selectedDateStr].myWeather = weatherVal.trim();
    } else {
        if (currentMoodSelection) moodData[selectedDateStr].partner = currentMoodSelection;
        moodData[selectedDateStr].partnerNote = document.getElementById('mood-note-input').value.trim();
        moodData[selectedDateStr].partnerWeather = weatherVal.trim();
    }
    
    saveMoodData();
    if (window.renderCalendar) window.renderCalendar();
    if (window.updateEventsList) window.updateEventsList(selectedDateStr);
    document.dispatchEvent(new CustomEvent('moodDataUpdated', { detail: { dateStr: selectedDateStr } }));
    closeMoodOverlay();
    showNotification('心情记录已保存', 'success');
});

// 新增：给日历点击心情详情使用
window.openMoodDetailModal = function(dateStr) {
    const data = window.moodData[dateStr];
    if(data) {
        showDayDetails(dateStr, data);
    } else {
        openMoodSelector(dateStr, 'me');
    }
}


function showDayDetails(dateStr, data) {
    selectedDateStr = dateStr;
    window.selectedDateStr = dateStr;
    const overlay = document.getElementById('mood-selector-overlay');
    const editorView = document.getElementById('mood-editor-view');
    const detailView = document.getElementById('mood-detail-view');
    
    const allMoods = getAllMoodOptions();
    const moodObj = allMoods.find(m => m.key === data.user);

    const [y, m, d] = dateStr.split('-');
    document.getElementById('detail-date').textContent = `${m}月${d}日`;

    const mySection = document.getElementById('detail-my-section');
    if (moodObj) {
        mySection.style.display = 'block';
        document.getElementById('detail-kaomoji').textContent = moodObj.kaomoji;
        document.getElementById('detail-label').textContent = moodObj.label;
        document.getElementById('detail-label').style.color = moodObj.color;
        document.getElementById('detail-text').textContent = data.note || "（这天没有写下随记...）";
        detailView.style.borderLeftColor = moodObj.color;
        const myWeatherEl = document.getElementById('detail-my-weather');
        if (myWeatherEl) {
            if (data.myWeather) { myWeatherEl.style.display = 'block'; document.getElementById('detail-my-weather-val').textContent = data.myWeather; }
            else myWeatherEl.style.display = 'none';
        }
    } else {
        mySection.style.display = 'none';
    }

    const partnerSection = document.getElementById('detail-partner-section');
    const partnerNoRecord = document.getElementById('detail-partner-no-record');
    if (data.partner) {
        const partnerMoodObj = allMoods.find(mo => mo.key === data.partner);
        if (partnerMoodObj) {
            partnerSection.style.display = 'block';
            if (partnerNoRecord) partnerNoRecord.style.display = 'none';
            document.getElementById('detail-partner-kaomoji').textContent = partnerMoodObj.kaomoji;
            document.getElementById('detail-partner-label').textContent = partnerMoodObj.label;
            document.getElementById('detail-partner-label').style.color = partnerMoodObj.color;
            document.getElementById('detail-partner-text').textContent = data.partnerNote || "（Ta 这天没有写下任何随记）";
            const partnerWeatherEl = document.getElementById('detail-partner-weather');
            if (partnerWeatherEl) {
                if (data.partnerWeather) { partnerWeatherEl.style.display = 'block'; document.getElementById('detail-partner-weather-val').textContent = data.partnerWeather; }
                else partnerWeatherEl.style.display = 'none';
            }
        } else {
            partnerSection.style.display = 'none';
            if (partnerNoRecord) partnerNoRecord.style.display = 'none';
        }
    } else {
        partnerSection.style.display = 'none';
        if (partnerNoRecord) partnerNoRecord.style.display = 'block';
    }

    editorView.style.display = 'none';
    detailView.style.display = 'block';
    overlay.classList.add('active');
   //document.getElementById('mood-selector-overlay').style.display = 'flex';
}
window.closeMoodOverlay = function() {
    if (window._moodOverlayRafId) {
        cancelAnimationFrame(window._moodOverlayRafId);
        window._moodOverlayRafId = null;
    }
    const overlay = document.getElementById('mood-selector-overlay');
    if(overlay) {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.25s ease';
        setTimeout(() => {
            overlay.classList.remove('active');
            overlay.style.opacity = '';
            overlay.style.transition = '';
            const customDialog = document.getElementById('custom-mood-dialog');
            if(customDialog) customDialog.style.display = 'none';
        }, 250);
    }
};
document.getElementById('edit-existing-mood').addEventListener('click', () => {
    const editorView = document.getElementById('mood-editor-view');
    const detailView = document.getElementById('mood-detail-view');
    openMoodSelector(selectedDateStr, 'me');
    editorView.style.display = 'block';
    detailView.style.display = 'none';
});

window.viewMoodDetailFromEditor = function() {
    if (!selectedDateStr || !moodData[selectedDateStr]) return;
    showDayDetails(selectedDateStr, moodData[selectedDateStr]);
};
document.getElementById('cancel-mood-edit').addEventListener('click', closeMoodOverlay);

// 1. 新增心情
window.openCustomMoodDialog = function() {
    const dialog = document.getElementById('custom-mood-dialog');
    document.getElementById('custom-mood-emoji').value = '';
    document.getElementById('custom-mood-label').value = '';
    customMoodSelectedColor = CUSTOM_MOOD_COLORS[0];
    
    const colorsEl = document.getElementById('custom-mood-colors');
    colorsEl.innerHTML = CUSTOM_MOOD_COLORS.map((c,i) => `<div class="custom-mood-color-dot ${i===0?'selected':''}" style="background:${c};" onclick="selectCustomColor('${c}',this)"></div>`).join('');
    
    document.getElementById('mood-dialog-cancel-btn').style.display = '';
    document.getElementById('mood-dialog-close-x').style.display = 'none';
    document.getElementById('mood-dialog-delete-btn').style.display = 'none';
    document.getElementById('mood-dialog-title').textContent = '自定义心情';
    
    const saveBtn = document.getElementById('btn-add-custom-mood');
    saveBtn.textContent = '添加';
    saveBtn.style.background = '';
    saveBtn.className = 'event-modal-btn save';
    saveBtn.onclick = function() {
        const emoji = document.getElementById('custom-mood-emoji').value.trim();
        const label = document.getElementById('custom-mood-label').value.trim();
        if (!emoji || !label) {
            showNotification('请填写表情和名称', 'warning');
            return;
        }
        ALL_MOODS.push({ key: 'mood_' + Date.now(), kaomoji: emoji, label: label, color: customMoodSelectedColor });
        saveAllMoods();
        // 不退出编辑模式，收起弹窗，恢复 view
        window.closeCustomMoodDialog(false); 
        renderMoodOptionsGrid(currentMoodSelection, false);
        showNotification('心情已添加 ✦', 'success');
    };
    // 【改变点】只显示 dialog，不管 overlay
    dialog.style.display = 'block'; 
    document.getElementById('mood-editor-view').style.display = 'none';
};

// 2. 编辑心情
window.openEditMoodDialog = function(key) {
    const mood = getAllMoodOptions().find(m => m.key === key);
    if (!mood) return;
    const dialog = document.getElementById('custom-mood-dialog');
    
    document.getElementById('custom-mood-emoji').value = mood.kaomoji;
    document.getElementById('custom-mood-label').value = mood.label;
    customMoodSelectedColor = mood.color;
    
    const colorsEl = document.getElementById('custom-mood-colors');
    colorsEl.innerHTML = CUSTOM_MOOD_COLORS.map((c) => `<div class="custom-mood-color-dot ${c===mood.color?'selected':''}" style="background:${c};" onclick="selectCustomColor('${c}',this)"></div>`).join('');
    
    document.getElementById('mood-dialog-cancel-btn').style.display = 'none';
    document.getElementById('mood-dialog-close-x').style.display = 'block';
    document.getElementById('mood-dialog-delete-btn').style.display = '';
    document.getElementById('mood-dialog-title').textContent = '编辑心情';
    
    const deleteBtn = document.getElementById('mood-dialog-delete-btn');
    deleteBtn.onclick = function() {
        if (confirm('确定要删除这个心情吗？删除后不可恢复。')) {
            const idx = ALL_MOODS.findIndex(m => m.key === key);
            if (idx !== -1) { ALL_MOODS.splice(idx, 1); saveAllMoods(); }
            Object.keys(moodData).forEach(dateStr => {
                const dayEntry = moodData[dateStr];
                if (dayEntry.user === key) { delete dayEntry.user; delete dayEntry.note; delete dayEntry.myWeather; }
                if (dayEntry.partner === key) { delete dayEntry.partner; delete dayEntry.partnerNote; delete dayEntry.partnerWeather; }
                if (!dayEntry.user && !dayEntry.partner) delete moodData[dateStr];
            });
            saveMoodData();
            //if (isMoodEditMode) window.toggleMoodEditMode();
            // 退出编辑模式，收起弹窗，恢复 view
            window.closeCustomMoodDialog(true);
            renderMoodOptionsGrid(currentMoodSelection, false);
            showNotification('心情已删除', 'success');
        }
    };
    
    const saveBtn = document.getElementById('btn-add-custom-mood');
    saveBtn.textContent = '保存修改';
    saveBtn.style.background = '';
    saveBtn.className = 'event-modal-btn save';
    saveBtn.onclick = function() {
        const newEmoji = document.getElementById('custom-mood-emoji').value.trim();
        const newLabel = document.getElementById('custom-mood-label').value.trim();
        if (!newEmoji || !newLabel) { showNotification('表情和名称不能为空', 'warning'); return; }
        const idx = ALL_MOODS.findIndex(m => m.key === key);
        if (idx !== -1) { ALL_MOODS[idx].kaomoji = newEmoji; ALL_MOODS[idx].label = newLabel; ALL_MOODS[idx].color = customMoodSelectedColor; saveAllMoods(); }
        renderMoodOptionsGrid(currentMoodSelection, isMoodEditMode);
        // 退出编辑模式，收起弹窗，恢复 view
        window.closeCustomMoodDialog(true);
        showNotification('心情已更新 ✦', 'success');
    };

    dialog.style.display = 'block'; 
    document.getElementById('mood-editor-view').style.display = 'none';
};
// 关闭自定义心情弹窗
// exitEditMode: 是否退出编辑模式（新增时传 false，编辑时传 true）
window.closeCustomMoodDialog = function(exitEditMode = false) {
    const dialog = document.getElementById('custom-mood-dialog');
    if (dialog) dialog.style.display = 'none';
    
    // 恢复下层的心情选择 view
    const editorView = document.getElementById('mood-editor-view');
    if (editorView) editorView.style.display = 'block';
    
    // 处理编辑模式
    if (exitEditMode && isMoodEditMode) {
        window.toggleMoodEditMode(); // 内部会自动刷新网格
    } else {
        // 不退出编辑模式时，手动刷新一次网格（比如刚新增完）
        renderMoodOptionsGrid(currentMoodSelection, isMoodEditMode);
    }
};


// × 按钮点击事件（× 只在编辑模式下显示，所以直接传 true）
document.getElementById('mood-dialog-close-x').onclick = function() {
    window.closeCustomMoodDialog(true);
};


window.selectCustomColor = function(color, el) {
    customMoodSelectedColor = color;
    document.querySelectorAll('.custom-mood-color-dot').forEach(d => d.classList.remove('selected'));
    el.classList.add('selected');
};



function initMoodListeners() {
    const btnCalendar = document.getElementById('btn-view-calendar');
    const btnStats = document.getElementById('btn-view-stats');
    const viewCalendar = document.getElementById('mood-calendar-view');
    const viewStats = document.getElementById('mood-stats-view');

    if (btnCalendar && !btnCalendar.dataset.initialized) {
        btnCalendar.dataset.initialized = 'true';
        btnCalendar.addEventListener('click', () => {
            btnCalendar.classList.add('active');
            btnStats.classList.remove('active');
            viewCalendar.classList.remove('hidden-view');
            viewStats.classList.add('hidden-view');
        });
    }

    if (btnStats && !btnStats.dataset.initialized) {
        btnStats.dataset.initialized = 'true';
        btnStats.addEventListener('click', () => {
            btnStats.classList.add('active');
            btnCalendar.classList.remove('active');
            viewStats.classList.remove('hidden-view');
            viewCalendar.classList.add('hidden-view');
            renderMoodCalendar(); 
        });
    }

    const entryBtn = document.getElementById('mood-function');
    const modal = document.getElementById('mood-modal');
    
    if (entryBtn && !entryBtn.dataset.initialized) {
        entryBtn.dataset.initialized = 'true';
        const newBtn = entryBtn.cloneNode(true);
        entryBtn.parentNode.replaceChild(newBtn, entryBtn);
        
        newBtn.addEventListener('click', () => {
            if (typeof window.updateDynamicNames === 'function') window.updateDynamicNames();
            const advModal = document.getElementById('advanced-modal');
            if (advModal) hideModal(advModal); 
            setTimeout(() => {
                renderMoodCalendar();
                showModal(modal);
            }, 150); 
        });
    }

    const closeMoodBtn = document.getElementById('close-mood');
    if (closeMoodBtn && !closeMoodBtn.dataset.initialized) {
        closeMoodBtn.dataset.initialized = 'true';
        closeMoodBtn.addEventListener('click', () => hideModal(modal));
    }


    const cancelMoodBtn = document.getElementById('cancel-mood-edit');
    if (cancelMoodBtn && !cancelMoodBtn.dataset.initialized) {
        cancelMoodBtn.dataset.initialized = 'true';
        cancelMoodBtn.addEventListener('click', closeMoodOverlay);
    }

    const overlay = document.getElementById('mood-selector-overlay');
    if (overlay && !overlay.dataset.initialized) {
        overlay.dataset.initialized = 'true';
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeMoodOverlay();
            }
        });
    }

    const prevMonthBtn = document.getElementById('prev-month');
    if (prevMonthBtn && !prevMonthBtn.dataset.initialized) {
        prevMonthBtn.dataset.initialized = 'true';
        prevMonthBtn.addEventListener('click', () => {
            const y = currentCalendarDate.getFullYear();
            const m = currentCalendarDate.getMonth();
            currentCalendarDate = new Date(y, m - 1, 1);
            renderMoodCalendar();
        });
    }
    
    const nextMonthBtn = document.getElementById('next-month');
    if (nextMonthBtn && !nextMonthBtn.dataset.initialized) {
        nextMonthBtn.dataset.initialized = 'true';
        nextMonthBtn.addEventListener('click', () => {
            const y = currentCalendarDate.getFullYear();
            const m = currentCalendarDate.getMonth();
            currentCalendarDate = new Date(y, m + 1, 1);
            renderMoodCalendar();
        });
    }

}    
document.addEventListener('openMoodSelector', (e) => {
    openMoodSelector(e.detail.dateStr, 'me');
});
window.initMoodListeners = initMoodListeners;
initMoodListeners();