/**
 * screenshot.js - 截图功能完整实现 (最终修复版)
 * 解决问题：按钮点击无反应（事件未绑定）
 */

/**
 * 辅助函数：等待图片加载完成
 */
function waitImgLoad(img) {
    return new Promise(resolve => {
        if (img.complete) resolve();
        img.onload = resolve;
        img.onerror = resolve;
    });
}

/**
 * 辅助函数：动态加载 html2canvas 库
 */
function loadHtml2Canvas() {
    return new Promise((resolve, reject) => {
        if (typeof html2canvas !== 'undefined') {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('截图组件加载失败，请检查网络'));
        document.head.appendChild(script);
    });
}

/**
 * 1. 初始化截图按钮 (使用事件委托，解决加载顺序问题)
 */
function initScreenshotFunction() {
    // 【核心修复】使用事件委托，绑定在 document 上
    // 这样无论按钮何时加载出来，都能响应点击
    document.addEventListener('click', function(e) {
        // 检查点击的元素是否是截图按钮，或者包含截图按钮
        const btn = e.target.closest('#screenshot-chat-btn');
        if (btn) {
            // 阻止默认行为，防止其他事件干扰
            e.preventDefault();
            e.stopPropagation();
            openScreenshotModal();
        }
    });
}

function openScreenshotModal() {
    const selectModal = document.getElementById('screenshot-select-modal');
    if (!selectModal) {
        showNotification('截图组件未正确加载', 'error');
        console.error('screenshot-select-modal not found');
        return;
    }
    
    // 添加调试日志
    console.log('Opening screenshot modal...');
    
    // 强制显示模态框，使用 important
    selectModal.style.setProperty('display', 'flex', 'important');
    
    // 确保内容区域可见
    const modalContent = selectModal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.setProperty('display', 'flex', 'important');
        modalContent.style.setProperty('background-color', 'var(--secondary-bg)', 'important');
        modalContent.style.setProperty('opacity', '1', 'important');
        modalContent.style.setProperty('transform', 'translateY(0) scale(1)', 'important');
        modalContent.style.setProperty('z-index', '2001', 'important');
        
        // 确保内容容器可见
        const container = modalContent.querySelector('#message-selection-container');
        if (container) {
            container.style.setProperty('display', 'block', 'important');
            container.style.setProperty('visibility', 'visible', 'important');
        }
    }
    
    // 初始化列表
    try {
        initScreenshotSelection();
    } catch (error) {
        console.error('初始化消息选择失败:', error);
        showNotification('初始化失败，请重试', 'error');
        closeScreenshotModal();
    }
}

/**
 * 关闭选择模态框
 */
function closeScreenshotModal() {
    const selectModal = document.getElementById('screenshot-select-modal');
    if (selectModal) {
        selectModal.style.setProperty('display', 'none', 'important');
    }
}

/**
 * 3. 初始化消息选择列表 (优化版：支持批量选取、无提示、全交互)
 */
function initScreenshotSelection() {
    const container = document.getElementById('message-selection-container');
    const selectedCount = document.getElementById('selected-count');
    const saveBtn = document.getElementById('save-selected-messages');

    if (!container) {
        console.error('message-selection-container not found in DOM');
        const modalContent = document.querySelector('#screenshot-select-modal .modal-content');
        if (modalContent) {
            const newContainer = document.createElement('div');
            newContainer.id = 'message-selection-container';
            modalContent.insertBefore(newContainer, modalContent.firstChild);
            container = newContainer;
        } else {
            showNotification('截图模态框结构错误', 'error');
            closeScreenshotModal();
            return;
        }
    }

    // 动态插入日期筛选工具栏
    let filterBar = document.getElementById('screenshot-date-filter-bar');
    if (!filterBar) {
        filterBar = document.createElement('div');
        filterBar.id = 'screenshot-date-filter-bar';
        filterBar.style.cssText = 'display: flex; gap: 8px; margin-bottom: 12px; padding: 10px; background: var(--primary-bg); border-radius: 12px; align-items: center; flex-wrap: wrap;';
        filterBar.innerHTML = `
            <input type="date" id="screenshot-filter-date" style="flex:1; padding: 8px; border-radius: 8px; border: 1px solid var(--border-color); font-size: 13px; background: var(--secondary-bg); color: var(--text-primary);">
            <button id="screenshot-filter-btn" class="modal-btn modal-btn-secondary" style="padding: 8px 12px; font-size: 12px;">跳转</button>
            <button id="screenshot-filter-clear-btn" class="modal-btn modal-btn-secondary" style="padding: 8px 12px; font-size: 12px; opacity: 0.7;">显示全部</button>
        `;
        container.parentNode.insertBefore(filterBar, container);
    }

    container.innerHTML = '';

    // 获取消息数据
    let currentMessages = [];
    if (typeof messages !== 'undefined' && Array.isArray(messages)) {
        currentMessages = [...messages];
    } else if (window.messages && Array.isArray(window.messages)) {
        currentMessages = [...window.messages];
    }

    if (currentMessages.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-secondary);">没有可截图的聊天记录</div>';
        if(saveBtn) saveBtn.disabled = true;
        return;
    }

    // 倒序排列
    const allMessagesSorted = [...currentMessages].sort((a, b) => b.timestamp - a.timestamp);

    // ===== 批量选取逻辑 =====
    let batchMode = false;
    let batchStartEl = null;
    // 注意：这里ID改为对应HTML中的 screenshot-batch-btn
    const batchBtn = document.getElementById('screenshot-batch-btn');
    
    if (batchBtn) {
        batchBtn.onclick = () => {
            batchMode = !batchMode;
            batchStartEl = null;
            if (batchMode) {
                batchBtn.style.background = 'var(--accent-color)';
                batchBtn.style.color = '#fff';
                // 按照要求，去掉了提示
            } else {
                batchBtn.style.background = '';
                batchBtn.style.color = '';
            }
        };
    }

    // 渲染列表
    function renderList(msgs) {
        container.innerHTML = '';
        msgs.forEach((msg) => {
            const isUser = msg.sender === 'user';
            const time = new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
           // const safeText = (msg.text || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
            let safeText = (msg.text || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
            // 获取图片地址（兼容 msg.image 或 msg.sticker 字段）
            const imgUrl = msg.image || msg.sticker || msg.img || '';
            let imgPreviewHTML = '';
            if (imgUrl) {
                imgPreviewHTML = `<div style="margin-top:6px;"><img src="${imgUrl}" style="max-width:120px; max-height:120px; border-radius:8px; display:block;"></div>`;
            }
            let replyPreviewHTML = '';
            if (msg.replyTo) {
                const replySender = msg.replyTo.sender === 'user' ? (settings.myName || '我') : (settings.partnerName || '对方');
                let replyText = msg.replyTo.text ? msg.replyTo.text.slice(0, 20) : '[图片]';
                if (msg.replyTo.text && msg.replyTo.text.length > 20) replyText += '...';
                replyPreviewHTML = `
                    <div class="reply-indicator-preview" style="font-size: 11px; color: var(--text-secondary); opacity: 0.6; margin-bottom: 4px; padding-left: 8px; border-left: 2px solid var(--border-color); line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        <span style="color: var(--accent-color); margin-right: 4px; font-weight: 600;">${replySender}</span>
                        <span style="font-style: italic; opacity: 0.8;">${replyText}</span>
                    </div>
                `;
            }

            // ===== 新增：处理特殊消息的预览文本 =====
            let displayText = safeText;
            let isSpecialType = false;
            let specialIcon = '';
            
            if (msg.type === 'system') {
                isSpecialType = true;
                displayText = msg.text || '拍了拍'; 
                
                // ✅ 核心修复：如果是“我”发的拍一拍，强制修正文本展示
                const myNameStr = settings.myName || '我';
                if (msg.sender === 'user') {
                    // 如果文本里没有“我”也没有我的昵称，说明是机器生成的无主语文本，手动补上
                    if (!displayText.includes('我') && !displayText.includes(myNameStr)) {
                        displayText = `${myNameStr} ${displayText}`;
                    }
                } else {
                    // 如果是对方发的，确保文本里能体现是对方
                    const partnerNameStr = settings.partnerName || '对方';
                    if (!displayText.includes(partnerNameStr) && !displayText.includes('对方')) {
                        displayText = `${partnerNameStr} ${displayText}`;
                    }
                }
            } else if (msg.type === 'call-event') {
                isSpecialType = true;
                if (msg.callIcon === 'fa-phone-slash') {
                    specialIcon = '📵';
                } else {
                    specialIcon = '📹';
                }
                displayText = safeText; 
            }

            // 如果是特殊类型，覆盖掉原本的 safeText 用于显示
            if (isSpecialType) {
                safeText = `<span style="color:var(--text-secondary); font-style:italic;">${specialIcon} ${displayText}</span>`;
            }


            const item = document.createElement('div');
            item.className = 'message-selection-item';
            item.dataset.id = msg.id;
            item.dataset.timestamp = msg.timestamp;
            item.innerHTML = `
                <input type="checkbox" class="message-checkbox" style="width:18px; height:18px; margin-right:12px; cursor:pointer; flex-shrink:0;">
                <div style="flex:1; min-width:0;">
                    ${replyPreviewHTML}
                    <div style="font-size:14px; margin-bottom:2px; word-break:break-all;">${safeText}</div>
                     ${imgPreviewHTML} 
                    <div style="font-size:11px; color:var(--text-secondary); display:flex; justify-content:space-between;">
                        <!--<span style="font-weight:500; color:${isUser ? 'var(--accent-color)' : 'var(--text-primary)'};">${isUser ? '我' : '对方'}</span>-->
                        <span style="font-weight:500; color:${msg.sender === 'user' ? 'var(--accent-color)' : 'var(--text-primary)'};">
                            ${msg.sender === 'user' ? (settings.myName || '我') : (settings.partnerName || '对方')}
                        </span>
                        <span>${time}</span>
                    </div>
                </div>
            `;

            const checkbox = item.querySelector('.message-checkbox');

            // ===== 核心修改：统一点击事件 =====
            item.addEventListener('click', (e) => {
                
                // 1. 如果在批量模式下
                if (batchMode) {
                    // 无论点击哪里（消息或复选框），都执行批量逻辑
                    if (!batchStartEl) {
                        // 第一次点击：设定起点
                        batchStartEl = item;
                        item.style.outline = '2px solid var(--accent-color)';
                        item.style.outlineOffset = '-2px';
                        checkbox.checked = true; // 选中起点
                        updateCount();
                    } else {
                        // 第二次点击：设定终点并批量选中
                        const allItems = Array.from(container.querySelectorAll('.message-selection-item'));
                        const startIdx = allItems.indexOf(batchStartEl);
                        const endIdx = allItems.indexOf(item);
                        
                        const min = Math.min(startIdx, endIdx);
                        const max = Math.max(startIdx, endIdx);

                        for (let i = min; i <= max; i++) {
                            const cb = allItems[i].querySelector('.message-checkbox');
                            if (cb) cb.checked = true;
                        }

                        // 清理状态
                        batchStartEl.style.outline = '';
                        batchStartEl = null;
                        batchMode = false;
                        if (batchBtn) {
                            batchBtn.style.background = '';
                            batchBtn.style.color = '';
                        }
                        updateCount();
                    }
                    // 阻止默认事件，防止复选框状态被二次切换
                    e.preventDefault(); 
                } 
                // 2. 普通模式
                else {
                    // 如果点击的是复选框本身，让它自己切换（不调用preventDefault）
                    if (e.target === checkbox) {
                         // 浏览器默认行为会切换checkbox，这里只需更新计数
                         // 使用setTimeout确保状态更新后再计数
                         setTimeout(updateCount, 0);
                    } else {
                        // 如果点击的是消息行，手动切换复选框
                        checkbox.checked = !checkbox.checked;
                        updateCount();
                    }
                }
            });

            container.appendChild(item);
        });
    }

    renderList(allMessagesSorted);

    // 更新计数函数
    function updateCount() {
        const count = container.querySelectorAll('.message-checkbox:checked').length;
        if (selectedCount) selectedCount.textContent = count;
        if (saveBtn) saveBtn.disabled = count === 0;
        // 【新增】控制 TXT 按钮状态
        const saveTxtBtn = document.getElementById('save-selected-txt');
        if (saveTxtBtn) {
            saveTxtBtn.disabled = count === 0; // 如果数量为0，禁用按钮
        }
    }

    // 绑定控制按钮
    const selectAllBtn = document.getElementById('select-all');
    const selectNoneBtn = document.getElementById('select-none');
    const cancelBtn = document.getElementById('cancel-screenshot-select');

    if (selectAllBtn) {
        selectAllBtn.onclick = () => {
            container.querySelectorAll('.message-checkbox').forEach(c => c.checked = true);
            updateCount();
        };
    }
    if (selectNoneBtn) {
        selectNoneBtn.onclick = () => {
            container.querySelectorAll('.message-checkbox:checked').forEach(c => c.checked = false);
            updateCount();
        };
    }
    if (cancelBtn) {
        cancelBtn.onclick = closeScreenshotModal;
    }

    // 头像显示开关
    const avatarToggle = document.getElementById('screenshot-show-avatar');
    if (avatarToggle) {
        const savedPref = localStorage.getItem('screenshot-show-avatar');
        avatarToggle.checked = savedPref === 'true';
        avatarToggle.addEventListener('change', (e) => {
            localStorage.setItem('screenshot-show-avatar', e.target.checked);
        });
    }

    // 日期筛选逻辑
    const dateInput = document.getElementById('screenshot-filter-date');
    const filterBtn = document.getElementById('screenshot-filter-btn');
    const clearBtn = document.getElementById('screenshot-filter-clear-btn');

    if (filterBtn && dateInput) {
        filterBtn.onclick = () => {
            const selectedDate = dateInput.value;
            if (!selectedDate) {
                renderList(allMessagesSorted);
                return;
            }
            const filtered = allMessagesSorted.filter(msg => {
                const msgDate = new Date(msg.timestamp).toISOString().split('T')[0];
                return msgDate === selectedDate;
            });
            renderList(filtered);
            if (filtered.length > 0) {
                const firstItem = container.querySelector('.message-selection-item');
                if (firstItem) {
                    firstItem.style.background = 'rgba(var(--accent-color-rgb), 0.1)';
                    setTimeout(() => { firstItem.style.background = ''; }, 2000);
                }
            }
        };
    }
    if (clearBtn) {
        clearBtn.onclick = () => {
            dateInput.value = '';
            renderList(allMessagesSorted);
        };
    }

    // 保存按钮点击事件
    if (saveBtn) {
        saveBtn.onclick = () => {
            const checkedItems = container.querySelectorAll('.message-checkbox:checked');
            const selectedMsgs = [];
            checkedItems.forEach(cb => {
                const itemEl = cb.closest('.message-selection-item');
                const msgId = itemEl.dataset.id;
                const foundMsg = currentMessages.find(m => String(m.id) === String(msgId));
                if (foundMsg) selectedMsgs.push(foundMsg);
            });
            if (selectedMsgs.length === 0) {
                showNotification('请选择消息', 'warning');
                return;
            }
            closeScreenshotModal();
            generateScreenshot(selectedMsgs);
        };
    }

        // 【新增】导出 TXT 按钮事件
    const saveTxtBtn = document.getElementById('save-selected-txt');
    if (saveTxtBtn) {
        saveTxtBtn.onclick = () => {
            const checkedItems = container.querySelectorAll('.message-checkbox:checked');
            const selectedMsgs = [];
            checkedItems.forEach(cb => {
                const itemEl = cb.closest('.message-selection-item');
                const msgId = itemEl.dataset.id;
                const foundMsg = currentMessages.find(m => String(m.id) === String(msgId));
                if (foundMsg) selectedMsgs.push(foundMsg);
            });
            
            if (selectedMsgs.length === 0) {
                showNotification('请选择消息', 'warning');
                return;
            }
            
            // 关闭模态框并导出
            closeScreenshotModal();
            generateTxtFile(selectedMsgs);
        };
    }

    updateCount();
}

/**
 * 导出聊天记录为 TXT 文件 (极简分析版 + 头部统计)
 */
function generateTxtFile(msgs) {
    if (!msgs || msgs.length === 0) return;

    // 按时间正序排列
    const sortedMsgs = [...msgs].sort((a, b) => a.timestamp - b.timestamp);

    // ===== 1. 添加头部信息 =====
    const exportTime = new Date().toLocaleString('zh-CN'); // 例如：2023/10/27 16:30:00
    const count = sortedMsgs.length;
    
    // 拼接头部字符串
    let textContent = `导出时间：${exportTime}\n导出条数：${count} 条\n----------------------------------------\n`;

    // ===== 2. 循环生成消息内容 =====
    sortedMsgs.forEach(msg => {
        // 确定发送者昵称
        const sender = msg.sender === 'user' ? (settings.myName || '我') : (settings.partnerName || '对方');
        
        // 获取消息内容
        //const content = msg.text || '[图片/文件]';
        // 获取消息内容（优先显示文字，没有文字但如果有图，就显示为 [表情包]）
        let content = msg.text || '';

        // 兼容多种可能存储图片的字段名
        const hasImage = msg.image || msg.sticker || msg.img || msg.fileUrl || msg.url || '';

        if (!content.trim() && hasImage) {
            content = '[表情包]';
        } else if (!content.trim()) {
            content = '[图片/文件]';
        }


        // 处理引用内容 (全文)
        let replyStr = "";
        if (msg.replyTo) {
            const replySender = msg.replyTo.sender === 'user' ? (settings.myName || '我') : (settings.partnerName || '对方');
            const replyText = msg.replyTo.text || '[图片/文件]';
            replyStr = `【回复 ${replySender}: ${replyText}】`;
        }

        // 拼接最终行
        textContent += `${sender}: ${replyStr}${content}\n`;
    });

    // ===== 3. 下载文件 =====
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `聊天记录_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('TXT 文档已导出', 'success');
}

async function generateScreenshot(msgs) {
    showNotification('正在生成截图，消息较多会自动分张...', 'info');

    // 1. 强制等待字体加载完成
    if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
    }
    await new Promise(resolve => setTimeout(resolve, 100));

    // 🌟 核心防御：如果消息超过 60 条，强制分片，防止 html2canvas 内存爆炸
    const MAX_SLICE = 80; 
    const sortedMsgs = [...msgs].sort((a, b) => a.timestamp - b.timestamp);
    let slices = [];
    
    if (sortedMsgs.length > MAX_SLICE) {
        for (let i = 0; i < sortedMsgs.length; i += MAX_SLICE) {
            slices.push(sortedMsgs.slice(i, i + MAX_SLICE));
        }
    } else {
        slices.push(sortedMsgs);
    }

    const allResults = []; // 存放所有分片的数据 { url, count, width, height }

    // 2. 循环渲染每一片
    for (let s = 0; s < slices.length; s++) {
        const currentSliceMsgs = slices[s];
        const isLastSlice = (s === slices.length - 1);
        const sliceIndex = s + 1;
        
        try {
            const root = document.documentElement;
            const computedStyle = getComputedStyle(root);
            const fontFamily = computedStyle.getPropertyValue('--message-font-family').trim() || "'Noto Serif SC', serif";
            const accentColor = computedStyle.getPropertyValue('--accent-color').trim() || '#c5a47e';
            const accentColorRgb = computedStyle.getPropertyValue('--accent-color-rgb').trim() || '197, 164, 126';
            const secondaryBg = computedStyle.getPropertyValue('--secondary-bg').trim() || '#f0f0f0';
            const primaryBg = computedStyle.getPropertyValue('--primary-bg').trim() || '#ffffff';
            const textPrimary = computedStyle.getPropertyValue('--text-primary').trim() || '#1a1a1a';
            const textSecondary = computedStyle.getPropertyValue('--text-secondary').trim() || '#7a7a7a';
            const messageFontWeight = computedStyle.getPropertyValue('--message-font-weight').trim() || '400';
            const messageLineHeight = computedStyle.getPropertyValue('--message-line-height').trim() || '1.5';
            const bubbleStyle = settings.bubbleStyle || 'standard';
            const showAvatar = localStorage.getItem('screenshot-show-avatar') === 'true';

            let avatarRadius = '50%';
            const currentShape = settings.myAvatarShape || settings.partnerAvatarShape || 'circle';
            if (currentShape === 'square') {
                try { const r = computedStyle.getPropertyValue('--avatar-corner-radius').trim(); avatarRadius = (r && r !== '') ? r : '8px'; } catch(e) { avatarRadius = '8px'; }
            }
            // 背景设置 (适配 #real-bg-layer 新逻辑)
            let bgStyle = `background-color: ${primaryBg};`;
            try {
            const bgLayer = document.getElementById('real-bg-layer');
            if (bgLayer) {
                const bgImg = bgLayer.querySelector('img');
                if (bgImg && bgImg.src) {
                const bgSrc = bgImg.src;
                // 关键：必须包含 blob: 判断，否则 localforage 存的图会被跳过
                const isSafeImg = bgSrc.startsWith('data:') || bgSrc.startsWith(window.location.origin) || bgSrc.startsWith('blob:');
                if (isSafeImg) {
                    const isCoverMode = bgLayer.classList.contains('mode-cover');
                    bgStyle = `background-color: ${primaryBg}; background-image: url('${bgSrc}'); background-size: ${isCoverMode ? 'cover' : 'contain'}; background-position: center center; background-repeat: no-repeat;`;
                }
                }
            }
            } catch (e) {
            console.warn('截图获取背景失败:', e);
            }

            let myAvatarUrl = '', partnerAvatarUrl = '';
            if (showAvatar) {
                const myAvatarImg = document.querySelector('.user-info:last-child .avatar img');
                const partnerAvatarImg = document.querySelector('.user-info:first-child .avatar img');
                if (myAvatarImg) myAvatarUrl = myAvatarImg.src;
                if (partnerAvatarImg) partnerAvatarUrl = partnerAvatarImg.src;
            }

            const firstDate = new Date(currentSliceMsgs[0].timestamp).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', year: 'numeric' });
            let dateTitle = firstDate;
            if (!isLastSlice) {
                dateTitle += ` (第 ${sliceIndex} / ${slices.length} 张)`;
            } else if (slices.length > 1) {
                dateTitle += ` (第 ${sliceIndex} / ${slices.length} 张)`;
            }

            const chatParts = [];
            chatParts.push(`
                <div style="font-family:sans-serif; max-width: 100%; margin: auto; position: relative; z-index: 1; background: transparent;">
                <div style="text-align:center; margin-bottom:20px; padding:10px 0; font-size:18px; font-weight:600; color: #333; border-bottom: 1px solid #ddd; letter-spacing: 1px;">
                    聊天记录 · 本张 ${currentSliceMsgs.length} 条 ${slices.length > 1 ? '(共'+slices.length+'张)' : ''}
                </div>
                <div style="background: transparent; padding: 0;">
            `);
            currentSliceMsgs.forEach((msg, index) => {
                const isUser = msg.sender === 'user';
                const safeText = (msg.text || '').replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, '<br>');
                const msgType = msg.type || 'normal';

                // ===== 唯一的特殊消息拦截守卫（只保留这一个） =====
                if (msgType === 'system' || msgType === 'call-event') {
                    let finalMsgHtml = '';
                    if (msgType === 'system') {
                        const displayText = msg.text || '拍了拍';
                        finalMsgHtml = `
                            <div style="display:flex; justify-content:center; margin:16px 0;">
                                <span style="font-size:12px; color:${textSecondary}; letter-spacing:1px;">${displayText}</span>
                            </div>
                        `;
                    } else if (msgType === 'call-event') {
                        const isMissed = msg.callIcon === 'fa-phone-slash';
                        const eventIcon = isMissed ? '📵' : '📹';
                        let pillBg, pillBorderColor, pillTextColor;
                        if (isMissed) {
                            pillBg = 'rgba(255, 80, 80, 0.06)';
                            pillBorderColor = 'rgba(255, 80, 80, 0.2)';
                            pillTextColor = 'rgba(255, 80, 80, 0.75)';
                        } else {
                            pillBg = `rgba(${accentColorRgb}, 0.06)`;
                            pillBorderColor = `rgba(${accentColorRgb}, 0.18)`;
                            pillTextColor = textSecondary;
                        }
                        const detailText = msg.callDetail || '';
                        
                        finalMsgHtml = `<div style="display:flex; justify-content:center; padding:4px 16px; margin:4px 0;">
                            <div style="display:inline-flex; align-items:center; gap:7px; border-radius:20px; padding:6px 13px 6px 10px; font-size:12px; font-weight:500; letter-spacing:0.2px; border:1px solid ${pillBorderColor}; background:${pillBg}; color:${pillTextColor}; position:relative;">
                                <span style="font-size:11px; opacity:0.75; flex-shrink:0;">${eventIcon}</span>
                                <span style="max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${safeText}</span>
                                ${detailText ? `<span style="font-variant-numeric:tabular-nums; opacity:0.65; font-size:11px; flex-shrink:0;"><span style="margin-right:4px;">·</span>${detailText}</span>` : ''}
                            </div>
                        </div>`;
                    }

                    if (finalMsgHtml) {
                        chatParts.push(`<div style="display:flex; flex-direction:column; align-items:center; margin:8px 0;">${finalMsgHtml}</div>`);
                    }
                    return; // 🚀 这是唯一有效的拦截点
                }
                // ===== 拦截结束 =====

                let imageHtml = '';
                    // 兼容各种可能存储图片的字段名
                    const imgUrl = msg.image || msg.sticker || msg.img || msg.fileUrl || '';
                    if (imgUrl) {
                        // 【新增防卡顿核心】判断是不是本地图片或者同源图片
                        const isSafeImg = imgUrl.startsWith('data:') || imgUrl.startsWith(window.location.origin);
                        if (isSafeImg) {
                            // 安全图片：正常显示
                            const safeUrl = imgUrl.replace(/"/g, '&quot;');
                            const isOnlyImage = !safeText;
                            //const imgStyle = isOnlyImage ? 'max-width:100%; border-radius:12px; display:block;' : 'max-width:180px; max-height:180px; border-radius:8px; display:block; margin-top:6px;';
                            const imgStyle = 'max-width:150px; max-height:150px; border-radius:12px; display:block; object-fit:contain;';
                            imageHtml = `<img src="${safeUrl}" style="${imgStyle}" onerror="this.style.display='none'">`;
                        } else {
                            // 外部图床图片：用文字代替，防止 html2canvas 强行加载导致卡死
                            imageHtml = `<div style="font-size:12px;color:#999;padding:5px 0;">[图片]</div>`;
                        }
                    }

                let timeStrHTML = '';
                const fmt = settings.timeFormat || 'HH:mm';
                if (fmt !== 'off') {
                    const nextMsg = currentSliceMsgs[index + 1];
                    const isLastInGroup = !nextMsg || nextMsg.sender !== msg.sender;
                    if (isLastInGroup) {
                        const ts = new Date(msg.timestamp);
                        let timeStr;
                        if (fmt === 'HH:mm:ss') timeStr = ts.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                        else if (fmt === 'h:mm AM/PM') timeStr = ts.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                        else if (fmt === 'h:mm:ss AM/PM') timeStr = ts.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
                        else timeStr = ts.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
                        timeStrHTML = `<div style="font-size:11px;color:${isUser ? 'rgba(255,255,255,0.7)' : textSecondary};margin-top:5px;text-align:${isUser ? 'right' : 'left'};font-weight:500;opacity:0.7;">${timeStr}</div>`;
                    }
                }

                let replyContent = '';
                if (msg.replyTo) {
                    const replySender = msg.replyTo.sender === 'user' ? (settings.myName || '我') : (settings.partnerName || '对方');
                    let replyText = msg.replyTo.text ? msg.replyTo.text.slice(0, 40) : '[图片]';
                    if (msg.replyTo.text && msg.replyTo.text.length > 40) replyText += '...';
                    if (isUser) replyContent = `<div style="display:flex;flex-direction:column;border-left:3px solid rgba(255,255,255,0.7);padding:5px 10px 5px 9px;margin-bottom:7px;background-color:rgba(255,255,255,0.18);border-radius:0 8px 8px 0;overflow:hidden;"><div style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.9);margin-bottom:2px;">${replySender}</div><div style="font-size:12px;color:rgba(255,255,255,0.75);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-style:italic;max-width:200px;">${replyText}</div></div>`;
                    else replyContent = `<div style="display:flex;flex-direction:column;border-left:3px solid ${accentColor};padding:5px 10px 5px 9px;margin-bottom:7px;background-color:rgba(0,0,0,0.03);border-radius:0 8px 8px 0;overflow:hidden;"><div style="font-size:11px;font-weight:600;color:${accentColor};margin-bottom:2px;">${replySender}</div><div style="font-size:12px;color:${textSecondary};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-style:italic;max-width:200px;">${replyText}</div></div>`;
                }

                // 获取当前气泡样式的配置表
                const styleMap = {
                    'standard':      { recv: '16px 16px 16px 4px',  sent: '16px 16px 4px 16px',  recvShadow: '0 2px 10px rgba(0,0,0,0.08)', sentShadow: `0 3px 12px rgba(${accentColorRgb},0.22)` },
                    'rounded':       { recv: '18px 18px 18px 6px',  sent: '18px 18px 6px 18px',  recvShadow: '0 2px 10px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)', sentShadow: `0 3px 12px rgba(${accentColorRgb},0.25), 0 1px 3px rgba(${accentColorRgb},0.1)` },
                    'rounded-large': { recv: '24px 24px 24px 4px',  sent: '24px 24px 4px 24px',  recvShadow: '0 4px 16px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.05)', sentShadow: `0 4px 16px rgba(${accentColorRgb},0.28), 0 2px 4px rgba(${accentColorRgb},0.12)` },
                    'square':        { recv: '4px 4px 4px 0',       sent: '4px 4px 0 4px',       recvShadow: '0 3px 10px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)', sentShadow: `0 3px 10px rgba(${accentColorRgb},0.2), 0 1px 2px rgba(${accentColorRgb},0.08)` }
                };

                // 获取匹配的样式，如果没有匹配到则降级为 standard
                const currentStyle = styleMap[bubbleStyle] || styleMap['standard'];

                // 【新增防卡顿核心】判断是否为纯表情包（无文字且无引用回复），如果是，背景透明
                const isOnlyImageMsg = !safeText && !replyContent;
                let bubbleInnerStyle = '';

                if (isOnlyImageMsg) {
                    // 纯表情包模式：背景透明、无内边距、无阴影（和CSS里的 .message-image-bubble-none 一致）
                    bubbleInnerStyle = 'display:inline-block; padding:0; border-radius:12px; background:transparent; max-width:100%; text-align:left;';
                } else {
                    // 正常模式：根据 isUser 动态分配收发样式
                    const finalRadius = isUser ? currentStyle.sent : currentStyle.recv;
                    const finalShadow = isUser ? currentStyle.sentShadow : currentStyle.recvShadow;
                    
                    bubbleInnerStyle = `display:inline-block; padding:10px 15px; border-radius:${finalRadius}; background:${isUser ? accentColor : secondaryBg}; max-width:100%; color:${isUser ? '#fff' : textPrimary}; text-align:left; font-size:15px; word-break:break-word; box-shadow: ${finalShadow};`;
                }

                    
         // 头像 HTML
            // 头像 HTML（✨ 修复跨域卡死：过滤外部图床链接）
            const avatarSize = 35;
            const avatarUrl = isUser ? myAvatarUrl : partnerAvatarUrl;
            // 判断是不是安全的本地数据（base64）或者同源链接
            const isSafeImg = avatarUrl && (avatarUrl.startsWith('data:') || avatarUrl.startsWith(window.location.origin));

            let avatarHTML = '';
            if (showAvatar) {
                if (isSafeImg) {
                    // 安全图片：正常渲染 <img>
                    avatarHTML = `<img src="${avatarUrl}" style="width:${avatarSize}px; height:${avatarSize}px; border-radius:${avatarRadius}; object-fit:cover; flex-shrink:0; border: 2px solid rgba(255,255,255,0.3);">`;
                } else {
                    // 外部跨域图片（如图床）：用纯色文字代替，彻底避免 html2canvas 卡死
                    avatarHTML = `<div style="width:${avatarSize}px; height:${avatarSize}px; border-radius:${avatarRadius}; background:${isUser ? accentColor : '#e0e0e0'}; display:flex; align-items:center; justify-content:center; color:${isUser ? '#fff' : '#999'}; font-size:14px; flex-shrink:0; border: 2px solid rgba(255,255,255,0.3);">${isUser ? '我' : 'T'}</div>`;
                }
            }
                
               /* if (showAvatar) {
                    chatParts.push(`<div style="margin:16px 0; display:flex; align-items:flex-start; gap:12px; flex-direction:${isUser ? 'row-reverse' : 'row'};">${avatarHTML}<div style="display:flex; flex-direction:column; max-width:calc(80% - ${avatarSize + 12}px); align-items:${isUser ? 'flex-end' : 'flex-start'};"><div style="${bubbleInnerStyle}">${replyContent}${safeText}${imageHtml}</div>${timeStrHTML}</div></div>`);
                } else {
                    chatParts.push(`<div style="margin:16px 0; display:flex; flex-direction:column; align-items:${isUser ? 'flex-end' : 'flex-start'};"><div style="${bubbleInnerStyle}">${replyContent}${safeText}${imageHtml}</div>${timeStrHTML}</div>`);
                }
            });*/

	// 拼接消息块
                if (showAvatar) {
                    chatParts.push(`
                    <div style="margin:16px 0; display:flex; align-items:center; gap:12px; flex-direction:${isUser ? 'row-reverse' : 'row'};">
                        ${avatarHTML}
                        <div style="display:flex; flex-direction:column; max-width:calc(80% - ${avatarSize + 12}px); align-items:${isUser ? 'flex-end' : 'flex-start'};">
                        <div style="${bubbleInnerStyle}">
                            ${replyContent}
                            ${safeText}
                            ${imageHtml}
                        </div>
                        ${timeStrHTML}
                        </div>
                    </div>
                    `);
                } else {
                    chatParts.push(`
                    <div style="margin:16px 0; display:flex; flex-direction:column; align-items:${isUser ? 'flex-end' : 'flex-start'};">
                        <div style="${bubbleInnerStyle}">
                            ${replyContent}
                            ${safeText}
                            ${imageHtml}
                        </div>
                        ${timeStrHTML}
                    </div>
                    `);
                }

            });

            chatParts.push(`</div><div style="text-align:center; margin-top:20px; padding:10px; font-size:12px; color: #888; border-top: 1px solid #eee; border-radius: 0 0 12px 12px;">${dateTitle}</div></div>`);

            let tempContainer = document.createElement('div');
            const phoneWidth = 375;
            tempContainer.style.cssText = `position:fixed; left:-9999px; top:0; width:${phoneWidth}px; ${bgStyle} color:${textPrimary}; font-family: ${fontFamily}; font-weight: ${messageFontWeight}; line-height: ${messageLineHeight}; padding: 30px 20px; border-radius: 10px; overflow: hidden;`;
            tempContainer.innerHTML = chatParts.join('');
            document.body.appendChild(tempContainer);
            
            const useScale = 3; 

            const canvas = await html2canvas(tempContainer, {
                backgroundColor: null,
                scale: useScale,
                useCORS: false,
                logging: false,
                windowWidth: phoneWidth,
                allowTaint: true,
                ignoreElements: (element) => {
                    if (element.tagName === 'IMG' && element.src) {
                        const src = element.src;
                        const isSafe = src.startsWith('data:') || src.startsWith(window.location.origin) || src.startsWith('blob:');
                        if (!isSafe) return true;
                    }
                    return false;
                },
                onclone: (clonedDoc) => {
                    const clonedContainer = clonedDoc.body.querySelector('div[style*="width: 375px"]');
                    const fontStyle = clonedDoc.createElement('style');
                    fontStyle.textContent = `* { font-family: ${fontFamily} !important; }`;
                    if (clonedContainer) clonedContainer.insertBefore(fontStyle, clonedContainer.firstChild);
                    const userBubbleCSS = document.getElementById('user-custom-bubble-style');
                    if (userBubbleCSS && userBubbleCSS.textContent) {
                        const bubbleStyleEl = clonedDoc.createElement('style');
                        bubbleStyleEl.textContent = userBubbleCSS.textContent;
                        if (clonedContainer) clonedContainer.insertBefore(bubbleStyleEl, clonedContainer.firstChild);
                    }
                }
            });

            if (tempContainer && tempContainer.parentNode) document.body.removeChild(tempContainer);

            const url = canvas.toDataURL('image/png');
            allResults.push({ url, count: currentSliceMsgs.length, width: canvas.width, height: canvas.height, index: sliceIndex });

        } catch (error) {
            console.error(`第 ${sliceIndex} 张截图生成失败:`, error);
            showNotification(`第 ${sliceIndex} 张截图生成失败，已跳过`, 'error');
        }
    }

    // 3. 渲染最终的预览/下载弹窗
    if (allResults.length === 0) {
        showNotification('所有截图均生成失败', 'error');
        return;
    }

    // 如果只有一张，走原来的单张预览逻辑
    if (allResults.length === 1) {
        showScreenshotPreview(allResults[0].url, allResults[0].count, allResults[0].width, allResults[0].height);
    } else {
        // 如果是多张，显示打包下载界面
        showBatchScreenshotPreview(allResults);
    }
}

/**
 * 🌟 新增：多张截图批量下载预览界面
 */
function showBatchScreenshotPreview(results) {
    const previewModal = document.createElement('div');
    previewModal.className = 'modal';
    previewModal.id = 'screenshot-preview-modal';
    
    let imgsHtml = results.map(r => `
        <div style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: #fff;">
            <img src="${r.url}" style="width: 100%; display: block;" alt="第${r.index}张截图">
            <div style="padding: 8px; font-size: 12px; color: var(--text-secondary); text-align: center;">
                第 ${r.index} 张 · ${r.count}条消息
            </div>
        </div>
    `).join('');

    previewModal.innerHTML = `
        <div class="modal-content" style="max-height: 85vh; display:flex; flex-direction:column;">
            <div class="modal-title">
                <i class="fas fa-images"></i>
                <span>截图已自动分为 ${results.length} 张</span>
            </div>
            <div style="flex: 1; overflow-y: auto; margin-bottom: 16px; display: flex; flex-direction: column; gap: 12px;">
                ${imgsHtml}
            </div>
            <div style="font-size: 13px; color: var(--text-secondary); text-align: center; margin-bottom: 12px;">
                点击下方按钮，将 ${results.length} 张图片打包下载
            </div>
            <div class="modal-buttons">
                <button class="modal-btn modal-btn-secondary" id="close-screenshot-preview">
                    <i class="fas fa-times"></i> 关闭
                </button>
                <button class="modal-btn modal-btn-primary" id="download-all-screenshots">
                    <i class="fas fa-download"></i> 一键打包下载
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(previewModal);
    if (typeof showModal === 'function') showModal(previewModal); else previewModal.style.display = 'flex';

    // 一键下载逻辑
    previewModal.querySelector('#download-all-screenshots').addEventListener('click', () => {
        results.forEach((r, i) => {
            setTimeout(() => {
                const a = document.createElement('a');
                a.href = r.url;
                const dateStr = new Date().toISOString().slice(0, 10);
                a.download = `聊天记录_第${r.index}张_${dateStr}.png`;
                a.click();
            }, i * 500); // 间隔 0.5 秒下载一张，防止浏览器拦截
        });
        showNotification(`正在下载 ${results.length} 张截图，请稍候...`, 'success', 3000);
    });

    const closeHandler = () => {
        if (typeof hideModal === 'function') { hideModal(previewModal); setTimeout(() => previewModal.remove(), 300); }
        else { previewModal.style.display = 'none'; previewModal.remove(); }
    };
    previewModal.querySelector('#close-screenshot-preview').addEventListener('click', closeHandler);
    previewModal.addEventListener('click', (e) => { if (e.target === previewModal) closeHandler(); });
}


/**
 * 5. 显示预览模态框
 */
function showScreenshotPreview(url, count, width, height) {
    const previewModal = document.createElement('div');
    previewModal.className = 'modal';
    previewModal.id = 'screenshot-preview-modal';
    
    previewModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-title">
                <i class="fas fa-image"></i>
                <span>截图预览</span>
            </div>
            <div style="margin-bottom: 16px; text-align: center; max-height: 60vh; overflow-y: auto;">
                <img src="${url}" style="max-width: 100%; border-radius: var(--radius); box-shadow: var(--shadow);" alt="聊天记录截图">
            </div>
            <div style="margin-bottom: 16px; font-size: 14px; color: var(--text-secondary); text-align: center;">
                包含 ${count} 条消息 · 尺寸: ${width} × ${height}
            </div>
            <div class="modal-buttons">
                <button class="modal-btn modal-btn-secondary" id="close-screenshot-preview">
                    <i class="fas fa-times"></i> 关闭
                </button>
                <button class="modal-btn modal-btn-primary" id="download-screenshot">
                    <i class="fas fa-download"></i> 下载图片
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(previewModal);

    if (typeof showModal === 'function') {
        showModal(previewModal);
    } else {
        previewModal.style.display = 'flex';
    }

    const downloadBtn = previewModal.querySelector('#download-screenshot');
    downloadBtn.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = url;
        const date = new Date();
        const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
        a.download = `聊天记录_${dateStr}_${count}条消息.png`;
        a.click();
        showNotification('截图下载中...', 'success', 2000);
    });

    const closeBtn = previewModal.querySelector('#close-screenshot-preview');
    closeBtn.addEventListener('click', () => {
        if (typeof hideModal === 'function') {
            hideModal(previewModal);
            setTimeout(() => previewModal.remove(), 300);
        } else {
            previewModal.style.display = 'none';
            previewModal.remove();
        }
    });
    
    previewModal.addEventListener('click', (e) => {
        if (e.target === previewModal) {
             if (typeof hideModal === 'function') {
                hideModal(previewModal);
                setTimeout(() => previewModal.remove(), 300);
            } else {
                previewModal.style.display = 'none';
                previewModal.remove();
            }
        }
    });
}
window.initScreenshotFunction = initScreenshotFunction;