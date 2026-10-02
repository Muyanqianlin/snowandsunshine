/**
 * features/calendar.js - 日历日程系统
 */

// 当前显示的年月
let currentCalendarYear = new Date().getFullYear();
let currentCalendarMonth = new Date().getMonth();

// 选中的日期
let selectedCalendarDate = null;

// ===== 初始化日历 =====
function initCalendar() {
    initCalendarListeners();
    // 【新增】监听心情数据更新事件，解耦直接调用
    document.addEventListener('moodDataUpdated', (e) => {
        renderCalendar();
        if (e.detail.dateStr) {
            updateEventsList(e.detail.dateStr);
        }
    });
}

// ===== 渲染日历 =====
function renderCalendar() {

    const container = document.getElementById('calendar-container');
    if (!container) return;
    const today = new Date();

    if (!selectedCalendarDate) {
        selectedCalendarDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }

    const firstDay = new Date(currentCalendarYear, currentCalendarMonth, 1);
    const lastDay = new Date(currentCalendarYear, currentCalendarMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

    // 月份名称
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
    const EVENT_COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#8D9EFF', '#FF9A8B', '#A8D8EA'];

    // 获取某天的日程
    const getEventsForDay = (day) => {
        const dateStr = `${currentCalendarYear}-${String(currentCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return calendarEvents.filter(e => e.date === dateStr);
    };

    // 获取心情图标（新增）
    const getMoodEmojisHTML = (dateStr) => {
        let myEmoji = '', partnerEmoji = '';
        const moodEntry = window.moodData[dateStr];
        if (moodEntry && window.getAllMoodOptions) {
            // 我的
            if (moodEntry.user) {
                const mObj = window.getAllMoodOptions().find(m => m.key === moodEntry.user);
                if (mObj) myEmoji = mObj.kaomoji;
            }
            // 对方
            if (moodEntry.partner) {
                const pObj = window.getAllMoodOptions().find(m => m.key === moodEntry.partner);
                if (pObj) partnerEmoji = pObj.kaomoji;
            }
        }
        // 如果两个都没有，返回空
        if (!myEmoji && !partnerEmoji) return '';
        // 生成 HTML，保持原来的大小
        return `<div class="mood-display-row"><span class="mood-emoji">${myEmoji || ''}</span><span class="mood-emoji">${partnerEmoji || ''}</span></div>`;
    };

    // 生成日历格子
    let calendarDays = '';
    // 上个月的空白格子
    for (let i = 0; i < startDayOfWeek; i++) {
        calendarDays += '<div class="calendar-day empty"></div>';
    }

    // 当月的日期
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentCalendarYear}-${String(currentCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const events = getEventsForDay(day);
        const isToday = today.getFullYear() === currentCalendarYear && today.getMonth() === currentCalendarMonth && today.getDate() === day;
        const isSelected = selectedCalendarDate === dateStr;
        
        // 心情 HTML
        const moodHTML = getMoodEmojisHTML(dateStr);
        // 日程点 HTML (右上角小点)
        const dotHTML = events.length > 0 ? '<div class="schedule-dot"></div>' : '';

        calendarDays += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${events.length > 0 ? 'has-events' : ''}" data-date="${dateStr}" onclick="selectCalendarDate('${dateStr}')">
                ${dotHTML}
                <span class="day-number">${day}</span>
                ${moodHTML}
            </div>
        `;
    }

    container.innerHTML = `
        <div class="calendar-wrapper">
            <!-- 日历头部 -->
            <div class="calendar-header">
                <div class="calendar-title">${currentCalendarYear}年 ${monthNames[currentCalendarMonth]}</div>
                <div class="calendar-nav">
                    <button class="calendar-nav-btn" onclick="prevMonth()"><i class="fas fa-chevron-left"></i></button>
                    <button class="calendar-nav-btn" onclick="goToToday()"><i class="fas fa-calendar-day"></i></button>
                    <button class="calendar-nav-btn" onclick="nextMonth()"><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
            <!-- 星期标题 -->
            <div class="calendar-weekdays">
                ${dayNames.map(d => `<div class="calendar-weekday">${d}</div>`).join('')}
            </div>
            <!-- 日期格子 -->
            <div class="calendar-days">
                ${calendarDays}
            </div>
            <!-- 日程列表 -->
            <div class="calendar-events-section">
                <!--<div class="events-header">
                    <div class="events-title" id="selected-date-title">选择日期查看</div>
                    <button class="add-event-btn" id="add-event-btn" style="display: none;" onclick="openAddEventModal()"><i class="fas fa-plus"></i> 添加日程</button>
                </div>-->
                <div class="events-header" style="flex-wrap: wrap; gap: 6px;">
                    <div class="events-title" id="selected-date-title">选择日期查看</div>
                    <div style="display: flex; gap: 6px;">
                         <!-- 新增：记录心情按钮 -->
                         <button class="add-event-btn" id="add-mood-btn" style="display: none;">记录心情</button>
                         <!-- 原有：添加日程按钮 -->
                         <button class="add-event-btn" id="add-event-btn" style="display: none;">添加日程</button>
                    </div>
                </div>

                <!-- 新增：心情详情区域 -->
                <div id="mood-detail-area"></div>
                <!-- 旧：日程列表区域 -->
                <div class="events-list" id="events-list">
                    <div class="no-events">选择日期查看日程</div>
                </div>
            </div>
        </div>
    `;

    // 更新选中日期的日程
    if (selectedCalendarDate) {
        updateEventsList(selectedCalendarDate);
    }
}


// ===== 选择日期 =====
window.selectCalendarDate = function(dateStr) {
    selectedCalendarDate = dateStr;
    renderCalendar();
    updateEventsList(dateStr);
};

// ===== 更新日程列表 =====

function updateEventsList(dateStr) {
    const titleEl = document.getElementById('selected-date-title');
    const addBtn = document.getElementById('add-event-btn');
    const addMoodBtn = document.getElementById('add-mood-btn'); // 新增：记录心情按钮
    const listEl = document.getElementById('events-list');
    const moodArea = document.getElementById('mood-detail-area');

    if (!titleEl || !addBtn || !listEl || !moodArea || !addMoodBtn) return;

    const dateParts = dateStr.split('-');
    const displayDate = `${parseInt(dateParts[1])}月${parseInt(dateParts[2])}日`;
    titleEl.textContent = `${displayDate}`;
    
    // 显示两个按钮
    addBtn.style.display = 'flex';
    addBtn.onclick = () => openAddEventModal(); // 绑定日程事件

    // --- 新增：渲染心情详情 ---
    const moodEntry = window.moodData[dateStr];
    const hasMood = moodEntry && (moodEntry.user || moodEntry.partner);
    let moodHTML = '';

    // 控制按钮显示：如果有心情记录，隐藏“记录心情”按钮，显示卡片；反之显示按钮
    //addMoodBtn.style.display = !hasMood ? 'flex' : 'none';
    // 修改为：始终显示“记录心情”按钮
    addMoodBtn.style.display = 'flex';

    //addMoodBtn.onclick = () => window.openMoodSelector(dateStr, 'me'); // 绑定心情事件
    addMoodBtn.onclick = () => {
        // 派发自定义事件，将 dateStr 传递出去，不直接调用 mood.js 的函数
        const event = new CustomEvent('openMoodSelector', { detail: { dateStr: dateStr } });
        document.dispatchEvent(event);
    };
    if (hasMood) {
        // 构建第一行：我的
        let myLine = '';
        if (moodEntry.user) {
            const obj = window.getAllMoodOptions().find(m => m.key === moodEntry.user);
            const noteText = (moodEntry.note || obj.label || '').substring(0, 8) + ((moodEntry.note || obj.label || '').length > 8 ? '...' : '');
            myLine = `<div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">我的：${obj ? obj.kaomoji : ''} ${noteText}</div>`;
        }

        // 构建第二行：Ta的
        let partnerLine = '';
        if (moodEntry.partner) {
            const obj = window.getAllMoodOptions().find(m => m.key === moodEntry.partner);
            const noteText = (moodEntry.partnerNote || obj.label || '').substring(0, 8) + ((moodEntry.partnerNote || obj.label || '').length > 8 ? '...' : '');
            partnerLine = `<div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Ta的：${obj ? obj.kaomoji : ''} ${noteText}</div>`;
        }
        // 拼接卡片：左侧文字，右侧“点击查看”
        moodHTML = `
            <div class="mood-detail-card" onclick="window.openMoodDetailModal('${dateStr}')" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px;">
                <div style="flex: 1; font-size: 12px; line-height: 1.6; margin-right: 8px; color: var(--text-primary);">
                    ${myLine}
                    ${partnerLine}
                </div>
                <div style="font-size: 10px; color: var(--text-secondary); flex-shrink: 0;">点击查看</div>
            </div>
        `;
    }
    
    moodArea.innerHTML = moodHTML;
    // --- 结束：心情渲染 ---

    // 原有的日程列表渲染逻辑
    const events = calendarEvents.filter(e => e.date === dateStr);
    if (events.length === 0) {
        listEl.innerHTML = '<div class="no-events">暂无日程</div>';
        return;
    }

    events.sort((a, b) => {
        if (!a.time) return -1;
        if (!b.time) return 1;
        return a.time.localeCompare(b.time);
    });

    listEl.innerHTML = events.map(event => `
        <div class="event-item">
            <div class="event-color" style="background: ${event.color || 'var(--accent-color)'}"></div>
            <div class="event-content">
                <div class="event-title">${event.title}</div>
                ${event.time ? `<div class="event-time">${event.time}</div>` : ''}
            </div>
            <div class="event-actions">
                <button class="event-action-btn" onclick="editCalendarEvent('${event.id}')" title="编辑"><i class="fas fa-edit"></i></button>
                <button class="event-action-btn delete" onclick="deleteCalendarEvent('${event.id}')" title="删除"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}


// ===== 上个月 =====
window.prevMonth = function() {
    currentCalendarMonth--;
    if (currentCalendarMonth < 0) {
        currentCalendarMonth = 11;
        currentCalendarYear--;
    }
    renderCalendar();
};

// ===== 下个月 =====
window.nextMonth = function() {
    currentCalendarMonth++;
    if (currentCalendarMonth > 11) {
        currentCalendarMonth = 0;
        currentCalendarYear++;
    }
    renderCalendar();
};

// ===== 回到今天 =====
window.goToToday = function() {
    const today = new Date();
    currentCalendarYear = today.getFullYear();
    currentCalendarMonth = today.getMonth();
    selectedCalendarDate = `${currentCalendarYear}-${String(currentCalendarMonth + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    renderCalendar();
};

// ===== 打开添加日程弹窗 =====
let editingEventId = null;

window.openAddEventModal = function() {
    editingEventId = null;
    const overlay = document.getElementById('event-modal-overlay');
    if (overlay) {
        overlay.classList.add('active');
        // 设置日期
        const dateInput = document.getElementById('event-date-input');
        if (dateInput && selectedCalendarDate) {
            dateInput.value = selectedCalendarDate;
        }
        // 清空表单
        document.getElementById('event-title-input').value = '';
        document.getElementById('event-time-input').value = '';
        // 重置颜色选择
        document.querySelectorAll('.color-option').forEach((el, i) => {
            el.classList.toggle('selected', i === 0);
        });
    }
};

// ===== 关闭日程弹窗 =====
window.closeEventModal = function() {
    const overlay = document.getElementById('event-modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
    editingEventId = null;
};

// ===== 编辑日程 =====
window.editCalendarEvent = function(eventId) {
    const event = calendarEvents.find(e => e.id === eventId);
    if (!event) return;
    
    editingEventId = eventId;
    
    const overlay = document.getElementById('event-modal-overlay');
    if (overlay) {
        overlay.classList.add('active');
        
        document.getElementById('event-title-input').value = event.title;
        document.getElementById('event-time-input').value = event.time || '';
        document.getElementById('event-date-input').value = event.date;
        
        // 设置颜色
        document.querySelectorAll('.color-option').forEach(el => {
            el.classList.toggle('selected', el.dataset.color === event.color);
        });
    }
};

// ===== 保存日程 =====
window.saveCalendarEvent = function() {
    const title = document.getElementById('event-title-input').value.trim();
    const time = document.getElementById('event-time-input').value;
    const date = document.getElementById('event-date-input').value;
    const selectedColor = document.querySelector('.color-option.selected');
    const color = selectedColor ? selectedColor.dataset.color : 'var(--accent-color)';
    
    if (!title) {
        showNotification('请输入日程标题', 'warning');
        return;
    }
    
    if (!date) {
        showNotification('请选择日期', 'warning');
        return;
    }
    
    if (editingEventId) {
        // 编辑模式
        const index = calendarEvents.findIndex(e => e.id === editingEventId);
        if (index !== -1) {
            calendarEvents[index] = {
                ...calendarEvents[index],
                title,
                time,
                date,
                color
            };
        }
    } else {
        // 添加模式
        calendarEvents.push({
            id: Date.now().toString(),
            title,
            time,
            date,
            color,
            createdAt: new Date().toISOString()
        });
    }
    
    // 保存数据
    /*if (typeof throttledSaveData === 'function') {
        throttledSaveData();
    }*/
        // 强制保存数据
    try {
        if (window.throttledSaveData) {
            window.throttledSaveData();
        } else if (typeof throttledSaveData === 'function') {
            throttledSaveData();
        } else {
            // 如果全局保存函数不存在，尝试直接保存到 localforage
            localforage.setItem(getStorageKey('calendarEvents'), calendarEvents);
            console.warn('使用了兜底保存方式');
        }
    } catch(e) {
        console.error('日程保存失败:', e);
    }

    
    closeEventModal();
    renderCalendar();
    
    if (selectedCalendarDate) {
        updateEventsList(selectedCalendarDate);
    }
    
    showNotification(editingEventId ? '日程已更新' : '日程已添加', 'success');
};

// ===== 删除日程 =====
window.deleteCalendarEvent = function(eventId) {
    if (!confirm('确定要删除这个日程吗？')) return;
    
    calendarEvents = calendarEvents.filter(e => e.id !== eventId);
    
    /*if (typeof throttledSaveData === 'function') {
        throttledSaveData();
    }*/
        // 强制保存数据
    try {
        if (window.throttledSaveData) {
            window.throttledSaveData();
        } else if (typeof throttledSaveData === 'function') {
            throttledSaveData();
        } else {
            // 如果全局保存函数不存在，尝试直接保存到 localforage
            localforage.setItem(getStorageKey('calendarEvents'), calendarEvents);
            console.warn('使用了兜底保存方式');
        }
    } catch(e) {
        console.error('日程保存失败:', e);
    }

    
    renderCalendar();
    
    if (selectedCalendarDate) {
        updateEventsList(selectedCalendarDate);
    }
    
    showNotification('日程已删除', 'success');
};

// ===== 初始化监听器 =====
function initCalendarListeners() {
    // 入口按钮
    const entryBtn = document.getElementById('calendar-function');
    if (entryBtn && !entryBtn.dataset.initialized) {
        entryBtn.dataset.initialized = 'true';
        entryBtn.addEventListener('click', () => {
            const advModal = document.getElementById('advanced-modal');
            if (advModal) hideModal(advModal);
            
            setTimeout(() => {
                renderCalendar();
                showModal(document.getElementById('calendar-modal'));
            }, 150);
        });
    }
    
    // 关闭按钮
    const closeBtn = document.getElementById('close-calendar');
    if (closeBtn && !closeBtn.dataset.initialized) {
        closeBtn.dataset.initialized = 'true';
        closeBtn.addEventListener('click', () => {
            hideModal(document.getElementById('calendar-modal'));
        });
    }
    
    // 颜色选择
    document.querySelectorAll('.color-option').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(e => e.classList.remove('selected'));
            el.classList.add('selected');
        });
    });
    
    // 点击遮罩关闭弹窗
    const overlay = document.getElementById('event-modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeEventModal();
            }
        });
    }
}

// ===== 导出 =====
window.initCalendar = initCalendar;
window.renderCalendar = renderCalendar;
