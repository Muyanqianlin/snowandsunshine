/**
 * features/anniversary.js - 重要日与提醒系统
 */

// 当前正在编辑的纪念日ID（用于区分新增/编辑）
let currentEditAnnId = null;
window.isAnnEditMode = false;

window.selectAnnType = function(type) {
    currentAnniversaryType = type;
    currentAnnType = type;
    
    // 按钮高亮
    document.querySelectorAll('.ann-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });

    // 提示语
    const hint = document.getElementById('ann-type-desc');
    if (hint) {
        if (type === 'anniversary') hint.textContent = '计算从过去某一天到现在已经过了多少天';
        else if (type === 'birthday') hint.textContent = '每年当天会触发专属通知与寄语';
        else hint.textContent = '计算从现在到未来某一天还剩下多少天';
    }

    // 👉 核心修改：切换选项显示，并处理倒数日隐藏
    const annOpt = document.getElementById('ann-opt-anniversary');
    const birOpt = document.getElementById('ann-opt-birthday');
    const reminderGroup = document.getElementById('ann-reminder-settings-group'); // 获取大容器

    if (type === 'countdown') {
        // 倒数日：隐藏整个提醒组
        if(reminderGroup) reminderGroup.style.display = 'none';
    } else {
        // 纪念日或生日：显示提醒组
        if(reminderGroup) reminderGroup.style.display = 'block';
        
        // 然后分别控制子选项
        if(annOpt) annOpt.style.display = (type === 'anniversary') ? 'block' : 'none';
        if(birOpt) birOpt.style.display = (type === 'birthday') ? 'block' : 'none';
    }
};


window.deleteAnniversary = function(id, event) {
    if (event) event.stopPropagation();
    if (confirm('确定要删除这个重要日吗？')) {
        anniversaries = anniversaries.filter(a => a.id !== id);
        throttledSaveData();
        renderAnniversariesList();
        showNotification('重要日已删除', 'success');
    }
};

let activeAnnId = null;

async function fillAnnHeaderCard(ann) {
    const headerCard = document.getElementById('ann-header-card');
    const toolbar = document.getElementById('ann-card-toolbar');
    if (!ann || !headerCard) return;

    activeAnnId = ann.id;
    headerCard.style.display = 'block';
    if (toolbar) toolbar.style.display = 'flex';

    const now = new Date();
    const isCountdown = ann.type === 'countdown';
    const targetDate = new Date(ann.date);
    let diffDays;

    if (isCountdown) {
        diffDays = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) diffDays = 0;
    } else {
        diffDays = Math.floor((now - targetDate) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) diffDays = 0;
    }

    const iconEl = document.getElementById('ann-header-icon');
    const labelEl = document.getElementById('ann-header-label');
    if (iconEl) iconEl.textContent = isCountdown ? '♡' : '♥';
    if (labelEl) labelEl.textContent = isCountdown ? 'COUNTDOWN' : 'ANNIVERSARY';

    document.getElementById('ann-header-title').textContent = ann.name;
    document.getElementById('ann-header-date').textContent = ann.date;

    const daysEl = document.getElementById('ann-header-days');
    daysEl.innerHTML = `${diffDays.toLocaleString('zh-CN')}<span class="ann-header-days-unit">${isCountdown ? '天后' : '天'}</span>`;

    const milestonesEl = document.getElementById('ann-header-milestones');
    if (milestonesEl) {
        milestonesEl.innerHTML = '';
        if (!isCountdown) {
            const milestones = [];
            if (diffDays >= 100) {
                const n = Math.floor(diffDays / 100);
                milestones.push(`🎉 第 ${n * 100} 天`);
            }
            if (diffDays >= 365) {
                const n = Math.floor(diffDays / 365);
                milestones.push(`🎊 ${n} 周年`);
            }
            if (diffDays > 0 && diffDays < 100) {
                milestones.push(`💫 距 100 天还有 ${100 - diffDays} 天`);
            }
            milestones.forEach(m => milestonesEl.insertAdjacentHTML('beforeend', `<span class="ann-milestone-chip">${m}</span>`));
        }
    }

    const bgEl = document.getElementById('ann-header-card-bg');
    if (bgEl) {
        const savedBg = await localforage.getItem(getStorageKey(`annHeaderBg_${ann.id}`));
        bgEl.style.backgroundImage = savedBg ? `url(${savedBg})` : '';
    }

    document.querySelectorAll('.ann-item-card').forEach(el => el.classList.remove('ann-item-active'));
    const activeEl = document.querySelector(`.ann-item-card[data-ann-id="${ann.id}"]`);
    if (activeEl) activeEl.classList.add('ann-item-active');
}

function addAnniversary() {
    const nameInput = document.getElementById('ann-input-name');
    const dateInput = document.getElementById('ann-input-date');
    const name = nameInput ? nameInput.value.trim() : '';
    const date = dateInput ? dateInput.value : '';

    if (!name || !date) {
        showNotification('请填写名称和日期', 'error');
        return;
    }

    const type = (typeof currentAnnType !== 'undefined' ? currentAnnType : null) || 
                 (typeof currentAnniversaryType !== 'undefined' ? currentAnniversaryType : 'anniversary');

    const remindRules = [];
    
    // 1. 普通复选框
    document.querySelectorAll('.ann-reminder-checkbox:checked').forEach(cb => {
        // 过滤掉需要特殊处理的（自定义天数、间隔年），只取普通值
        if (cb.id !== 'ann-opt-custom-check' && cb.id !== 'ann-opt-interval-check') {
            remindRules.push(cb.value);
        }
    });

    // 2. 纪念日自定义天数（支持多行/逗号分割）
    const customCheck = document.getElementById('ann-opt-custom-check');
    const customDaysEl = document.getElementById('ann-opt-custom-days');
    if (customCheck && customCheck.checked && customDaysEl && customDaysEl.value) {
        const rawDays = customDaysEl.value;
        // 分割逻辑：先按换行分割，再按逗号分割
        rawDays.split('\n').forEach(line => {
            line.split(',').forEach(d => {
                const day = parseInt(d.trim());
                if (!isNaN(day) && day > 0) {
                    remindRules.push('custom:' + day);
                }
            });
        });
    }
    // 🆕 3. 纪念日间隔年逻辑（插入到这里）
    const yearlyIntervalCheck = document.getElementById('ann-opt-yearly-interval-check');
    const yearlyIntervalEl = document.getElementById('ann-opt-yearly-interval-val');
    if (yearlyIntervalCheck && yearlyIntervalCheck.checked && yearlyIntervalEl && yearlyIntervalEl.value) {
        const yrs = parseInt(yearlyIntervalEl.value);
        if (!isNaN(yrs) && yrs > 0) {
            remindRules.push('anniversaryYearly:' + yrs);
        }
    }
    // 3. 生日间隔年
    const intervalCheck = document.getElementById('ann-opt-interval-check');
    const intervalEl = document.getElementById('ann-opt-interval-years');
    if (intervalCheck && intervalCheck.checked && intervalEl && intervalEl.value) {
        const years = parseInt(intervalEl.value);
        if (!isNaN(years) && years > 0) {
            remindRules.push('interval:' + years);
        }
    }

    // 4. 文案（直接保存多行文本即可）
    const customMsgEl = document.getElementById('ann-custom-message');
    const customMessage = customMsgEl ? customMsgEl.value.trim() : '';

    // 编辑或新增逻辑
   /* if (currentEditAnnId) {
        const index = anniversaries.findIndex(a => a.id === currentEditAnnId);
        if (index > -1) {
            anniversaries[index].name = name;
            anniversaries[index].date = date;
            anniversaries[index].type = type;
            anniversaries[index].remindRules = remindRules;
            anniversaries[index].customMessage = customMessage;
            currentEditAnnId = null;
        }
    } else {
        anniversaries.push({
            id: Date.now(),
            name: name,
            date: date,
            type: type,
            remindRules: remindRules,
            customMessage: customMessage
        });
    }

    throttledSaveData();
    renderAnniversariesList();*/
    let justSavedAnn = null;

    if (currentEditAnnId) {
        const index = anniversaries.findIndex(a => a.id === currentEditAnnId);
        if (index > -1) {
            anniversaries[index].name = name;
            anniversaries[index].date = date;
            anniversaries[index].type = type;
            anniversaries[index].remindRules = remindRules;
            anniversaries[index].customMessage = customMessage;
            justSavedAnn = anniversaries[index];
            currentEditAnnId = null;
        }
    } else {
        const newAnn = {
            id: Date.now(),
            name: name,
            date: date,
            type: type,
            remindRules: remindRules,
            customMessage: customMessage
        };
        anniversaries.push(newAnn);
        justSavedAnn = newAnn;
    }
    throttledSaveData();
    renderAnniversariesList();
    // 保存后，头部卡片显示刚编辑/新增的那一条
    if (justSavedAnn) {
        fillAnnHeaderCard(justSavedAnn);
    }


    // 清空
    if (nameInput) nameInput.value = '';
    if (dateInput) dateInput.value = '';
    if (customMsgEl) customMsgEl.value = '';
    if (customDaysEl) customDaysEl.value = '';
    if (intervalEl) intervalEl.value = '';
    document.querySelectorAll('.ann-reminder-checkbox').forEach(cb => cb.checked = false);

    const annFormWrapper = document.getElementById('ann-form-wrapper');
    const annToggleBtn = document.getElementById('ann-toggle-btn');
    if (annFormWrapper) annFormWrapper.classList.remove('active');
    if (annToggleBtn) annToggleBtn.classList.remove('active');

    showNotification('重要日已保存', 'success');

}


function renderAnniversariesList() {
    const listContainer = document.getElementById('ann-list-container');
    const headerCard = document.getElementById('ann-header-card');
    const toolbar = document.getElementById('ann-card-toolbar');

    if (!listContainer) return;
    listContainer.innerHTML = '';

    anniversaries.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (anniversaries.length === 0) {
        if (headerCard) headerCard.style.display = 'none';
        if (toolbar) toolbar.style.display = 'none';
        listContainer.innerHTML = `
        <div class="ann-empty">
            <div class="ann-empty-icon">💝</div>
            <p>还没有纪念日<br>去添加一个属于你们的日子吧~</p>
        </div>`;
        return;
    }

    const now = new Date();
    const defaultAnn = anniversaries.find(a => a.type === 'anniversary') || anniversaries[0];
    fillAnnHeaderCard(defaultAnn);

    anniversaries.forEach(ann => {
        const targetDate = new Date(ann.date);
        let diffDays = 0;
        let typeClass = '';
        let typeLabel = '';
        let dayLabel = '';

        if (ann.type === 'countdown') {
            typeClass = 'type-future';
            typeLabel = '倒数';
            dayLabel = '天后';
            diffDays = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
            if (diffDays < 0) diffDays = 0;
        } else {
            typeClass = 'type-past';
            typeLabel = '已过';
            dayLabel = '天';
            diffDays = Math.floor((now - targetDate) / (1000 * 60 * 60 * 24));
        }

        const formattedDays = diffDays.toLocaleString('zh-CN');

        // 点击卡片 -> 进入编辑模式
        const html = `
        <div class="ann-item-card ${typeClass}" data-ann-id="${ann.id}" onclick="isAnnEditMode ? editAnnCard(${ann.id}) : selectAnnCard(${ann.id})" style="cursor:pointer;">
            <div class="ann-item-left">
                <div class="ann-item-name">${ann.name}</div>
                <div class="ann-item-date">
                    <span class="ann-tag">${typeLabel}</span>
                    ${ann.date}
                </div>
            </div>
            <div style="display:flex; align-items:center;">
                <div class="ann-item-right">
                    <div class="ann-item-days">${formattedDays}</div>
                    <div class="ann-item-days-unit">${dayLabel}</div>
                </div>
                <div class="ann-delete-btn" onclick="event.stopPropagation(); deleteAnniversaryItem(${ann.id})">
                    <i class="fas fa-times"></i>
                </div>
            </div>
        </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', html);
    });
}

/**
 * 编辑模式：点击卡片时填充数据
 */

window.editAnnCard = function(id) {
    const ann = anniversaries.find(a => a.id === id);
    if (!ann) return;

    currentEditAnnId = ann.id;
    const editorSlide = document.getElementById('ann-editor-slide');
    if (editorSlide) editorSlide.classList.add('active');

    document.getElementById('ann-input-name').value = ann.name || '';
    document.getElementById('ann-input-date').value = ann.date || '';
    document.getElementById('ann-custom-message').value = ann.customMessage || ''; // 多行会自动保留
    
    selectAnnType(ann.type);

    // 清空所有复选框
    document.querySelectorAll('.ann-reminder-checkbox').forEach(cb => cb.checked = false);
    const customDaysEl = document.getElementById('ann-opt-custom-days');
    const intervalEl = document.getElementById('ann-opt-interval-years');
    if(customDaysEl) customDaysEl.value = '';
    if(intervalEl) intervalEl.value = '';

    // 回显规则
    let customDaysArray = [];
    if (ann.remindRules) {
        ann.remindRules.forEach(rule => {
            // 普通复选框
            const cb = document.querySelector(`.ann-reminder-checkbox[value="${rule}"]`);
            if (cb) cb.checked = true;

            // 自定义天数：收集起来
            if (rule.startsWith('custom:')) {
                customDaysArray.push(rule.split(':')[1]);
            }
                        // 🆕 新增：纪念日间隔年回显
            if (rule.startsWith('anniversaryYearly:')) {
                const y = rule.split(':')[1];
                const check = document.getElementById('ann-opt-yearly-interval-check');
                const input = document.getElementById('ann-opt-yearly-interval-val');
                if (check) check.checked = true;
                if (input) input.value = y;
            }

            // 间隔年
            if (rule.startsWith('interval:')) {
                const y = rule.split(':')[1];
                const check = document.getElementById('ann-opt-interval-check');
                if(check) check.checked = true;
                if(intervalEl) intervalEl.value = y;
            }
        });
    }

    // 回显自定义天数（用逗号连接）
    if (customDaysArray.length > 0) {
        const check = document.getElementById('ann-opt-custom-check');
        if(check) check.checked = true;
        if(customDaysEl) customDaysEl.value = customDaysArray.join(', ');
    }
};


window.selectAnnCard = function(id) {
    const ann = anniversaries.find(a => a.id === id);
    if (ann) fillAnnHeaderCard(ann);
};

window.clearAnnCardBg = async function() {
    if (!activeAnnId) return;
    await localforage.removeItem(getStorageKey(`annHeaderBg_${activeAnnId}`));
    const bgEl = document.getElementById('ann-header-card-bg');
    if (bgEl) bgEl.style.backgroundImage = '';
    showNotification('封面图已清除', 'success');
};

/**
 * 核心功能：检测系统，每日运行
 */

function initSpecialDaySystem() {
    const today = new Date();
    const todayStr = today.toDateString();
    
    const lastNotifyDate = localStorage.getItem('lastSpecialNotifyDate');
    const alreadyNotified = lastNotifyDate === todayStr;

    let specialEvent = null;

    anniversaries.forEach(ann => {
        const target = new Date(ann.date);
        if (!ann.remindRules || ann.remindRules.length === 0) return;

        // --- 纪念日逻辑 ---
        if (ann.type === 'anniversary') {
            const days = Math.floor((today - target) / (1000 * 60 * 60 * 24));
            if (days < 0) return;

            ann.remindRules.forEach(rule => {
                if (rule === '100' && days % 100 === 0 && days !== 0) specialEvent = ann;
                if (rule === '1000' && days % 1000 === 0 && days !== 0) specialEvent = ann;
                if (rule.startsWith('custom:')) {
                    const customDay = parseInt(rule.split(':')[1]);
                    if (days === customDay) specialEvent = ann;
                }
            });
             // 🆕 新增：纪念日周年逻辑判断
            // 判断今天是否是月日相同的日期
            const isAnniversaryDate = target.getMonth() === today.getMonth() && target.getDate() === today.getDate();
            if (isAnniversaryDate) {
                const years = today.getFullYear() - target.getFullYear();
                if (years > 0) {
                    ann.remindRules.forEach(rule => {
                        if (rule.startsWith('anniversaryYearly:')) {
                            const interval = parseInt(rule.split(':')[1]);
                            if (interval > 0 && years % interval === 0) {
                                specialEvent = ann;
                            }
                        }
                    });
                }
            }
        }

        // --- 生日逻辑 ---
        if (ann.type === 'birthday') {
            const isDateMatch = target.getMonth() === today.getMonth() && target.getDate() === today.getDate();
            if (isDateMatch) {
                const yearsPassed = today.getFullYear() - target.getFullYear();
                
                if (ann.remindRules.includes('yearly')) specialEvent = ann;
                if (ann.remindRules.includes('decade') && yearsPassed % 10 === 0 && yearsPassed > 0) {
                    specialEvent = ann;
                }
                // 检查自定义间隔
                ann.remindRules.forEach(rule => {
                    if (rule.startsWith('interval:')) {
                        const yr = parseInt(rule.split(':')[1]);
                        if (yr > 0 && yearsPassed % yr === 0 && yearsPassed > 0) {
                            specialEvent = ann;
                        }
                    }
                });
            }
        }
    });

    if (specialEvent) {
        // 👉 随机抽取文案
        let msg = `今天是特别的日子：${specialEvent.name}`;
        /*if (specialEvent.customMessage) {
            const lines = specialEvent.customMessage.split('\n').filter(s => s.trim() !== '');
            if (lines.length > 0) {
                msg = lines[Math.floor(Math.random() * lines.length)];
            }
        }*/
        if (specialEvent.customMessage) {
            const lines = specialEvent.customMessage.split('\n').filter(s => s.trim() !== '');
            if (lines.length > 0) {
                // 🎯 接入同样的盐值机制，保证通知弹窗和卡片显示的专属文案是同一条，且一天不变
                let userSalt = localStorage.getItem('_dgUserSalt');
                if (!userSalt) {
                    userSalt = String(Math.floor(Math.random() * 999983) + 1);
                    localStorage.setItem('_dgUserSalt', userSalt);
                }
                const noteSeed = parseInt(userSalt) + specialEvent.id;
                function seededRandomNote(s) {
                    const x = Math.sin(s * 9301 + 49297 + 233) * 1000003;
                    return x - Math.floor(x);
                }
                msg = lines[Math.floor(seededRandomNote(noteSeed) * lines.length)];
            }
        }

        
        window._todaySpecialNote = msg;
        
        if (!alreadyNotified && Notification.permission === 'granted') {
            new Notification('传讯 · 重要日提醒', { body: msg });
            localStorage.setItem('lastSpecialNotifyDate', todayStr);
        }
    } else {
        window._todaySpecialNote = null;
    }
}

window.toggleAnnEditMode = function() {
    window.isAnnEditMode = !window.isAnnEditMode;
    const btn = document.getElementById('ann-edit-mode-btn');
    const modal = document.getElementById('anniversary-modal');
    
    // 按钮变红 / 彻底清除颜色恢复灰色
    if (btn) {
        if (window.isAnnEditMode) {
            btn.style.color = '#ff4757';
        } else {
            btn.style.color = 'var(--text-secondary)'; // 把你内联写的那句话还回去
        }
    }
    
    // 虚线样式开关
    if (modal) {
        modal.classList.toggle('edit-mode', window.isAnnEditMode);
    }
    
    // 通知
    if (window.isAnnEditMode) {
        showNotification('已进入编辑模式', 'info');
    } else {
        showNotification('已退出编辑模式', 'info');
    }
};



function initAnniversaryModule() {
    const entryBtn = document.getElementById('anniversary-function');
    if (entryBtn) {
        const newBtn = entryBtn.cloneNode(true);
        entryBtn.parentNode.replaceChild(newBtn, entryBtn);
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const advancedModal = document.getElementById('advanced-modal');
            const annModal = document.getElementById('anniversary-modal');
            if (advancedModal) hideModal(advancedModal);
            renderAnniversariesList();
            if (annModal) showModal(annModal);
        });
    }

    const closeBtn = document.getElementById('close-anniversary-modal');
    if (closeBtn) {
        const newClose = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newClose, closeBtn);
        newClose.addEventListener('click', () => hideModal(document.getElementById('anniversary-modal')));
    }

    const openAddBtn = document.getElementById('open-ann-add-btn');
    const editorSlide = document.getElementById('ann-editor-slide');
    
    // 打开添加按钮 -> 重置编辑ID，确保是“新增模式”
    if (openAddBtn) {
        openAddBtn.onclick = () => {
            currentEditAnnId = null;
            document.getElementById('ann-input-name').value = '';
            document.getElementById('ann-input-date').value = '';
            document.getElementById('ann-custom-message').value = '';
            document.querySelectorAll('.ann-reminder-checkbox').forEach(cb => cb.checked = false);
            
            window.selectAnnType('anniversary');
            if (editorSlide) editorSlide.classList.add('active');
        };
    }

    const closeEditorBtn = document.getElementById('close-ann-editor');
    if (closeEditorBtn) {
        closeEditorBtn.onclick = () => {
            if (editorSlide) editorSlide.classList.remove('active');
            currentEditAnnId = null;
            //if (window.isAnnEditMode) window.toggleAnnEditMode();
        };
    }

    const saveBtn = document.getElementById('save-ann-btn');
    if (saveBtn) {
        const newSave = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSave, saveBtn);
        newSave.addEventListener('click', () => {
            addAnniversary();
            if (editorSlide) editorSlide.classList.remove('active');
        });
    }

    const annBgInput = document.getElementById('ann-header-bg-input');
    if (annBgInput) {
        annBgInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!activeAnnId) {
                showNotification('请先选择一个纪念日', 'warning');
                return;
            }
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const dataUrl = ev.target.result;
                const bgEl = document.getElementById('ann-header-card-bg');
                if (bgEl) bgEl.style.backgroundImage = `url(${dataUrl})`;
                await localforage.setItem(getStorageKey(`annHeaderBg_${activeAnnId}`), dataUrl);
                showNotification('封面图已更新', 'success');
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        });
        }
    window.startInlineEdit = function(id, event) {
        if (event) event.stopPropagation();
        const ann = anniversaries.find(a => a.id === id);
        if (!ann) return;

        const card = document.querySelector(`.ann-item-card[data-ann-id="${id}"]`);
        if (!card) return;

        card.classList.remove('type-past', 'type-future');
        card.innerHTML = `
            <div class="ann-item-left">
                <input class="ann-inline-input" id="inline-name-${id}" value="${ann.name}" placeholder="名称" />
                <div class="ann-item-date">
                    <input class="ann-inline-input" id="inline-date-${id}" type="date" value="${ann.date}" />
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
                <button class="ann-inline-save" onclick="event.stopPropagation(); saveInlineEdit(${id})" title="保存">
                    <i class="fas fa-check"></i>
                </button>
                <button class="ann-inline-cancel" onclick="event.stopPropagation(); renderAnniversariesList()" title="取消">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        const nameInput = document.getElementById(`inline-name-${id}`);
        if (nameInput) { nameInput.focus(); nameInput.select(); }

        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); saveInlineEdit(id); }
            if (e.key === 'Escape') { renderAnniversariesList(); }
        });
    };

    window.saveInlineEdit = function(id) {
        const nameEl = document.getElementById(`inline-name-${id}`);
        const dateEl = document.getElementById(`inline-date-${id}`);
        const name = nameEl ? nameEl.value.trim() : '';
        const date = dateEl ? dateEl.value : '';

        if (!name || !date) { showNotification('请填写名称和日期', 'error'); return; }

        const index = anniversaries.findIndex(a => a.id === id);
        if (index > -1) {
            anniversaries[index].name = name;
            anniversaries[index].date = date;
            throttledSaveData();
            renderAnniversariesList();
            fillAnnHeaderCard(anniversaries[index]);
            showNotification('重要日已更新', 'success');
        }
    };

    // 启动检测系统
    initSpecialDaySystem();
}
