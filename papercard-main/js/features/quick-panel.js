/** * quick-panel.js - 底部快捷面板逻辑 (终极修复版) */ 
(function() { 
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const panel = document.getElementById('user-sticker-picker'); 
    const triggerBtn = document.getElementById('combo-btn'); 
    const contentArea = document.getElementById('combo-content-area'); 
    if (!panel || !triggerBtn || !contentArea) return; 
    
    let currentTab = 'my-sticker'; 

    function getFileBase64(file) { 
        return new Promise((resolve, reject) => { 
            const reader = new FileReader(); 
            reader.onload = e => resolve(e.target.result); 
            reader.onerror = reject; 
            reader.readAsDataURL(file); 
        }); 
    } 

    // 强制同步函数：保证面板读到的永远是最新的全局变量
    function getMyStickers() {
        return typeof myStickerLibrary !== 'undefined' ? myStickerLibrary : window.myStickerLibrary || [];
    }
    function setMyStickers(arr) {
        if (typeof myStickerLibrary !== 'undefined') myStickerLibrary = arr;
        window.myStickerLibrary = arr;
    }

    function init() { 
        panel.querySelectorAll('.combo-tab-btn').forEach(btn => { 
            btn.addEventListener('click', (e) => { 
                e.stopPropagation(); 
                panel.querySelectorAll('.combo-tab-btn').forEach(b => b.classList.remove('active')); 
                btn.classList.add('active'); 
                currentTab = btn.dataset.tab; 
                renderContent(currentTab); 
            }); 
        }); 
        
        triggerBtn.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            const isActive = panel.classList.contains('active'); 
            if (isActive) { 
                panel.classList.remove('active'); 
            } else { 
                panel.classList.add('active'); 
                renderContent(currentTab); 
            } 
        }); 
        
        document.addEventListener('click', (e) => { 
            if (!panel.contains(e.target) && !triggerBtn.contains(e.target)) { 
                panel.classList.remove('active'); 
            } 
        }); 
        
        renderContent(currentTab); 
    } 

    function renderContent(tab) { 
        contentArea.innerHTML = ''; 
        if (tab === 'my-sticker') renderMyStickers(); 
        else if (tab === 'photo') renderPhotoUploader(); 
        else if (tab === 'poke') renderPokeMenu(); 
    } 

    function renderMyStickers() {
        // 1. 完全清空内容区
        contentArea.innerHTML = '';
        
        const addBtn = document.createElement('button');
        addBtn.style.cssText = "background:var(--accent-color);border:none;cursor:pointer;padding:8px 12px;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;gap:6px;border-radius:8px;width:100%;justify-content:center;margin-bottom:12px;box-shadow:0 2px 8px rgba(var(--accent-color-rgb),0.35);";
        addBtn.innerHTML = '<i class="fas fa-plus"></i> 添加我的表情';
        addBtn.onclick = (e) => {
            e.stopPropagation();
            handleAddSticker();
        };
        contentArea.appendChild(addBtn);

        if (!window.myStickerLibrary || window.myStickerLibrary.length === 0) {
            const tip = document.createElement('div');
            tip.style.cssText = 'text-align:center; padding:30px 0; color:var(--text-secondary); font-size:13px;';
            tip.innerHTML = '<i class="fas fa-image" style="font-size:24px;display:block;margin-bottom:8px;opacity:0.5;"></i>还没有表情，点击上方添加';
            contentArea.appendChild(tip);
            return;
        }

        // 2. 过滤重复的表情（基于图片URL）
        const uniqueStickers = [...new Set(window.myStickerLibrary)];
        
        const grid = document.createElement('div');
        grid.style.cssText = 'display:grid; grid-template-columns:repeat(4, 1fr); gap:8px;';
        
        uniqueStickers.forEach((src, idx) => {
            const item = document.createElement('div');
            item.style.cssText = 'position:relative; aspect-ratio:1; border-radius:8px; overflow:hidden; cursor:pointer; background:var(--secondary-bg);';
            /*item.innerHTML = `
                <img src="${src}" style="width:100%; height:100%; object-fit:cover;">
                <div class="qp-del-btn" style="position:absolute; top:2px; right:2px; width:16px; height:16px; background:rgba(0,0,0,0.6); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:8px; color:#fff; opacity:0; transition:opacity 0.2s; z-index:2;"><i class="fas fa-times"></i></div>
            `;
            item.onmouseenter = () => item.querySelector('.qp-del-btn').style.opacity = '1';
            item.onmouseleave = () => item.querySelector('.qp-del-btn').style.opacity = '0';*/
            const stickerInitOpacity = isTouchDevice ? '0.5' : '0';
            item.innerHTML = ` <img src="${src}" style="width:100%; height:100%; object-fit:cover;"> <div class="qp-del-btn" style="position:absolute; top:2px; right:2px; width:16px; height:16px; background:rgba(0,0,0,0.6); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:8px; color:#fff; opacity:${stickerInitOpacity}; transition:opacity 0.2s; z-index:2;"><i class="fas fa-times"></i></div> `;
            if (!isTouchDevice) {
            item.onmouseenter = () => item.querySelector('.qp-del-btn').style.opacity = '1';
            item.onmouseleave = () => item.querySelector('.qp-del-btn').style.opacity = '0';
            }

            
            item.querySelector('img').onclick = (e) => {
                e.stopPropagation();
                if (typeof sendMessage === 'function') sendMessage(null, 'normal', src);
                panel.classList.remove('active');
            };
            
            item.querySelector('.qp-del-btn').onclick = (e) => {
                e.stopPropagation();
                if (confirm('确定要删除这个表情吗？')) {
                    // 从原始数组中删除（而不是过滤后的数组）
                    const originalIndex = window.myStickerLibrary.indexOf(src);
                    if (originalIndex > -1) {
                        window.myStickerLibrary.splice(originalIndex, 1);
                        if (typeof throttledSaveData === 'function') throttledSaveData();
                        showNotification('已删除表情', 'success');
                        renderMyStickers(); // 重新渲染
                    }
                }
            };
            grid.appendChild(item);
        });
        contentArea.appendChild(grid);
    }

    async function handleAddSticker() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.onchange = async (e) => {
            const files = Array.from(e.target.files);
            if (!files.length) return;
            const validFiles = files.filter(f => f.size <= 2 * 1024 * 1024);
            if (files.length > validFiles.length) {
                showNotification('部分图片超过2MB已跳过', 'warning');
            }
            if(validFiles.length === 0) return;
            showNotification(`正在处理 ${validFiles.length} 张图片...`, 'info');
            
            let ok = 0;      // 成功添加的数量
            let dup = 0;     // 重复的数量

            const tasks = validFiles.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const base64Str = ev.target.result;
                        // 确保 myStickerLibrary 存在
                        if (typeof myStickerLibrary === 'undefined') {
                            window.myStickerLibrary = [];
                        }
                        // 检查是否已经存在一模一样的图片
                        if (window.myStickerLibrary.includes(base64Str)) {
                            dup++; // 重复，跳过不添加
                        } else {
                            window.myStickerLibrary.push(base64Str);
                            ok++; // 全新的，添加进去
                        }
                        resolve();
                    };
                    reader.onerror = () => resolve();
                    reader.readAsDataURL(file);
                });
            });

            await Promise.all(tasks);
            
            // 使用正确的键名保存数据
            const correctKey = `${APP_PREFIX}${SESSION_ID}_myStickerLibrary`;
            try {
                await localforage.setItem(correctKey, window.myStickerLibrary);
                console.log('保存成功！');
            } catch (err) {
                console.error('保存失败:', err);
            }

            // 根据实际情况显示不同的提示文案
            if (ok === 0 && dup > 0) {
                // 全部都是重复的
                showNotification(`检测到有重复表情包 已清除`, 'info');
            } else if (ok > 0 && dup > 0) {
                // 一部分全新，一部分重复
                showNotification(`成功添加 ${ok} 张，检测到 ${dup} 张重复已清除`, 'success');
            } else if (ok > 0) {
                // 全部都是全新的
                showNotification(`✓ 成功添加 ${ok} 张表情`, 'success');
            }
            
            renderMyStickers();
        };
        input.click();
    }


    function renderPhotoUploader() { 
        const wrapper = document.createElement('div'); 
        wrapper.style.cssText = 'display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px 0; gap:15px;'; 
        const icon = document.createElement('div'); 
       // icon.style.cssText = 'width:50px; height:50px; border-radius:50%; background:rgba(var(--accent-color-rgb), 0.1); display:flex; align-items:center; justify-content:center; font-size:22px; color:var(--accent-color);'; 
       // icon.innerHTML = '<i class="fas fa-camera"></i>'; 
        const text = document.createElement('div'); 
        text.style.cssText = 'font-size:13px; color:var(--text-secondary); text-align:center;'; 
        text.textContent = '选择照片直接发送到聊天区'; 
        const uploadBtn = document.createElement('button'); 
        uploadBtn.style.cssText = "background:var(--accent-color);border:none;cursor:pointer;padding:8px 12px;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;gap:6px;border-radius:8px;box-shadow:0 2px 8px rgba(var(--accent-color-rgb),0.35);"; 
        uploadBtn.innerHTML = '<i class="fas fa-image"></i> 发送照片'; 
        uploadBtn.onclick = (e) => { e.stopPropagation(); handleSendPhoto(); }; 
        wrapper.appendChild(icon); wrapper.appendChild(text); wrapper.appendChild(uploadBtn); 
        contentArea.appendChild(wrapper); 
    } 

    async function handleSendPhoto() { 
        const input = document.createElement('input'); 
        input.type = 'file'; 
        input.accept = 'image/*'; 
        input.onchange = async (e) => { 
            const file = e.target.files[0]; 
            if (!file) return; 
            if (file.size > 5 * 1024 * 1024) { showNotification('图片不能超过5MB', 'error'); return; } 
            //showNotification('正在发送图片...', 'info'); 
            try { 
                const base64 = await getFileBase64(file); 
                if (typeof sendMessage === 'function') sendMessage(null, 'normal', base64); 
                panel.classList.remove('active'); 
            } catch(err) { showNotification('图片处理失败', 'error'); } 
        }; 
        input.click(); 
    } 

    function renderPokeMenu() {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex; flex-direction:column; gap:8px;';

        // 1. 顶部的"添加新动作"按钮
        const customBtn = document.createElement('button');
        customBtn.className = 'custom-poke-btn';
        customBtn.innerHTML = '<i class="fas fa-plus"></i> 添加新动作';
        customBtn.onclick = (e) => {
            e.stopPropagation();

            // 🌟 隐藏按钮，显示内联输入框
            customBtn.style.display = 'none';

            const inputWrapper = document.createElement('div');
            inputWrapper.className = 'inline-poke-input-wrapper';
            inputWrapper.style.cssText = 'display:flex; gap:6px; animation:fadeIn 0.2s ease;';

            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = '输入新的拍一拍动作...';
            input.style.cssText = 'flex:1; padding:8px 12px; border:1.5px solid var(--accent-color); border-radius:8px; background:var(--primary-bg); color:var(--text-primary); font-size:13px; outline:none; font-family:var(--font-family); box-shadow:0 0 0 3px rgba(var(--accent-color-rgb,224,105,138),0.15);';

            // 保存按钮（勾勾）
            const saveBtn = document.createElement('button');
            saveBtn.innerHTML = '<i class="fas fa-check"></i>';
            saveBtn.title = '保存';
            saveBtn.style.cssText = 'background:var(--accent-color); border:none; color:#fff; width:36px; height:36px; border-radius:8px; font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:transform 0.15s;';
            saveBtn.onmousedown = () => saveBtn.style.transform = 'scale(0.92)';
            saveBtn.onmouseup = () => saveBtn.style.transform = 'scale(1)';

            // 取消按钮（叉叉）
            const cancelBtn = document.createElement('button');
            cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
            cancelBtn.title = '取消';
            cancelBtn.style.cssText = 'background:var(--border-color); border:none; color:var(--text-secondary); width:36px; height:36px; border-radius:8px; font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:transform 0.15s;';
            cancelBtn.onmousedown = () => cancelBtn.style.transform = 'scale(0.92)';
            cancelBtn.onmouseup = () => cancelBtn.style.transform = 'scale(1)';

            // 保存逻辑
            saveBtn.onclick = (e) => {
                e.stopPropagation();
                const text = input.value.trim();
                if (!text) {
                    showNotification('请输入动作内容', 'error');
                    input.focus();
                    // 抖动效果
                    input.style.animation = 'none';
                    void input.offsetWidth;
                    input.style.animation = 'shake 0.3s ease';
                    return;
                }
                if (!settings.myPokeList) settings.myPokeList = [];
                if (settings.myPokeList.includes(text)) {
                    showNotification('这个动作已经存在了', 'warning');
                    input.focus();
                    return;
                }
                settings.myPokeList.push(text);
                if (typeof throttledSaveData === 'function') throttledSaveData();
                showNotification('动作已添加 ✓', 'success', 1500);
                // 🌟 重新渲染整个面板
                contentArea.innerHTML = '';
                renderPokeMenu();
            };

            // 取消逻辑
            cancelBtn.onclick = (e) => {
                e.stopPropagation();
                inputWrapper.remove();
                customBtn.style.display = '';
            };

            // 键盘快捷键：回车保存，Esc取消
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveBtn.click();
                } else if (e.key === 'Escape') {
                    cancelBtn.click();
                }
            });

            // 组装
            inputWrapper.appendChild(input);
            inputWrapper.appendChild(saveBtn);
            inputWrapper.appendChild(cancelBtn);

            // 插入到按钮后面
            customBtn.parentNode.insertBefore(inputWrapper, customBtn.nextSibling);
            input.focus();
        };
        wrapper.appendChild(customBtn);

        // 2. 获取你自己的独立拍一拍列表（如果是老用户，先给个默认值）
        if (!settings.myPokeList || settings.myPokeList.length === 0) {
            settings.myPokeList = ["拍了拍对方的头", "戳了戳对方的脸颊", "抱住了对方", "给对方比了个心", "牵起了对方的手"];
            if (typeof throttledSaveData === 'function') throttledSaveData();
        }
        let pokeList = settings.myPokeList;

        // 3. 如果全删光了，显示空状态
        if (pokeList.length === 0) {
            const tip = document.createElement('div');
            tip.style.cssText = 'text-align:center; padding:30px 0; color:var(--text-secondary); font-size:13px;';
            tip.innerHTML = '<i class="fas fa-hand-point-up" style="font-size:24px;display:block;margin-bottom:8px;opacity:0.5;"></i>还没有动作，点击上方添加';
            wrapper.appendChild(tip);
        } else {
            // 4. 渲染列表
            pokeList.forEach((text, index) => {
                const item = document.createElement('div');
                item.className = 'poke-quick-item';
                item.style.cssText = 'display:flex; align-items:center; justify-content:space-between; gap:8px;';
               /* item.innerHTML = `
                    <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; cursor:pointer;">${text}</span>
                    <div class="qp-del-btn" style="position:relative; width:20px; height:20px; background:rgba(0,0,0,0.15); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:9px; color:var(--text-secondary); opacity:0; transition:opacity 0.2s; flex-shrink:0;"><i class="fas fa-times"></i></div>
                `;

                // 鼠标悬停显示删除按钮
                item.onmouseenter = () => item.querySelector('.qp-del-btn').style.opacity = '1';
                item.onmouseleave = () => item.querySelector('.qp-del-btn').style.opacity = '0';*/
                const pokeInitOpacity = isTouchDevice ? '0.4' : '0';
                item.innerHTML = ` <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; cursor:pointer;">${text}</span> <div class="qp-del-btn" style="position:relative; width:20px; height:20px; background:rgba(0,0,0,0.15); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:9px; color:var(--text-secondary); opacity:${pokeInitOpacity}; transition:opacity 0.2s; flex-shrink:0;"><i class="fas fa-times"></i></div> `;
                if (!isTouchDevice) {
                item.onmouseenter = () => item.querySelector('.qp-del-btn').style.opacity = '1';
                item.onmouseleave = () => item.querySelector('.qp-del-btn').style.opacity = '0';
                }


                // 点击文字：执行拍一拍（发消息并触发回复）
                item.querySelector('span').onclick = (e) => {
                    e.stopPropagation();
                    if (typeof addMessage === 'function') {
                        const name = (window.settings && window.settings.myName) ? window.settings.myName : '我';
                        const formattedText = typeof window._formatPokeText === 'function' ? window._formatPokeText(`${name} ${text}`) : `${name} ${text}`;
                        addMessage({
                            id: Date.now(),
                            text: formattedText,
                            timestamp: new Date(),
                            type: 'system',
                            sender: 'user'
                        });
                    }
                    panel.classList.remove('active');
                    if (typeof simulateReply === 'function') setTimeout(simulateReply, 1500);
                };

                // 删除按钮
                item.querySelector('.qp-del-btn').onclick = (e) => {
                    e.stopPropagation();
                    if (confirm('确定要删除这个动作吗？')) {
                        // 1. 先过滤掉空字符串和undefined
                        settings.myPokeList = settings.myPokeList.filter(item => item && item.trim() !== '');
                        // 2. 再执行删除（按当前索引）
                        const filteredList = settings.myPokeList.filter((_, i) => i !== index);
                        settings.myPokeList = filteredList;
                        // 3. 保存并刷新
                        if (typeof throttledSaveData === 'function') throttledSaveData();
                        showNotification('已删除该动作', 'success');
                        // 4. 强制重新渲染（确保残留元素被清除）
                        contentArea.innerHTML = '';
                        renderPokeMenu();
                    }
                };

                wrapper.appendChild(item);
            });
        }
        contentArea.appendChild(wrapper);
    }



    init(); 
})();
