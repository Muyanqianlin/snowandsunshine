/**
 * utils.js - Utility Functions
 * 工具函数
 */

        function safeGetItem(key) {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                console.error('Error getting item:', e);
                return null;
            }
        }

        function safeSetItem(key, value) {
            try {
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }
                localStorage.setItem(key, value);
            } catch (e) {
                console.error('Error setting item:', e);
            }
        }

        function safeRemoveItem(key) {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.error('Error removing item:', e);
            }
        }
        
function normalizeStringStrict(s) {
    if (typeof s !== 'string') return '';
    return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function deduplicateContentArray(arr, baseSystemArray = []) {
    const seen = new Set(baseSystemArray.map(normalizeStringStrict));
    const result = [];
    let removedCount = 0;
    
    for (const item of arr) {
        const norm = normalizeStringStrict(item);
        if (norm !== '' && !seen.has(norm)) {
            seen.add(norm);
            result.push(item);
        } else {
            removedCount++;
        }
    }
    return { result, removedCount };
}

        function cropImageToSquare(file, maxSize = 640) { 
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        const minSide = Math.min(img.width, img.height);
                        const sx = (img.width - minSide) / 2;
                        const sy = (img.height - minSide) / 2;

                        const canvas = document.createElement('canvas');
                        canvas.width = maxSize;
                        canvas.height = maxSize;
                        const ctx = canvas.getContext('2d');

                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';

                        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, maxSize, maxSize);

                        resolve(canvas.toDataURL('image/jpeg', 0.95));
                    };
                    img.onerror = reject;
                    img.src = e.target.result;
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        function exportDataToMobileOrPC(dataString, fileName) {
            if (navigator.share && navigator.canShare) {
                try {
                    const blob = new Blob([dataString], { type: 'application/json' });
                    const file = new File([blob], fileName, { type: 'application/json' });
                    if (navigator.canShare({ files: [file] })) {
                        navigator.share({
                            files: [file],
                            title: '传讯数据备份',
                            text: '这是您的回复库备份文件，请选择“保存到文件”或发送给好友。'
                        }).then(() => {
                        }).catch((err) => {
                            console.warn('分享未完成，尝试回退下载模式:', err);
                            downloadFileFallback(blob, fileName);
                        });
                        return;
                    }
                } catch (e) {
                    console.log("移动端分享构建失败，转为普通下载", e);
                }
            }
            const blob = new Blob([dataString], { type: 'application/json' });
            downloadFileFallback(blob, fileName);
        }

        function downloadFileFallback(blob, fileName) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 2000);
        }
        
        localforage.config({
            driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
            name: 'ChatApp_V3',
            version: 1.0,
            storeName: 'chat_data',
            description: 'Storage for Chat App V3'
        });


        function showNotification(message, type = 'info', duration = 3000) {
            const existingNotification = document.querySelector('.notification');
            if (existingNotification) existingNotification.remove();

            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            const iconMap = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-circle',
                info: 'fa-info-circle',
                warning: 'fa-exclamation-triangle'
            };
            notification.innerHTML = `<i class="fas ${iconMap[type] || 'fa-info-circle'}"></i><span>${message}</span>`;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.classList.add('hiding');
                notification.addEventListener('animationend', () => notification.remove());
            }, duration);
        }

        const playSound = (type) => {
            if (!settings.soundEnabled) return;
            try {
                if (settings.customSoundUrl && settings.customSoundUrl.trim()) {
                    const audio = new Audio(settings.customSoundUrl.trim());
                    audio.volume = Math.min(1, Math.max(0, settings.soundVolume || 0.15));
                    audio.play().catch(() => {});
                    return;
                }
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.type = 'sine';
                const vol = Math.min(0.5, Math.max(0.01, settings.soundVolume || 0.1));
                gainNode.gain.setValueAtTime(vol, audioContext.currentTime);
                if (type === 'send') oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                else if (type === 'favorite') oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
                else oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                oscillator.start();
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.15);
                oscillator.stop(audioContext.currentTime + 0.15);
            } catch (e) {
                console.warn("音频播放失败:", e);
            }
        };

        const throttledSaveData = () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(saveData, 500);
        };


async function applyCustomFont(url) {
    // 1. 清理旧标签
    let existingLink = document.getElementById('user-custom-font-link');
    if (existingLink) existingLink.remove();
    let existingStyle = document.getElementById('user-custom-font-style');
    if (existingStyle) existingStyle.remove();
    document.fonts.forEach(f => { if (f.family === 'UserCustomFont') document.fonts.delete(f); });

    if (!url || !url.trim()) {
        document.documentElement.style.removeProperty('--font-family');
        document.documentElement.style.removeProperty('--message-font-family');
        document.body.style.fontFamily = '';
        return;
    }

    try {
        if (url.endsWith('.css')) {
            // 处理 CSS 链接 (如 Google Fonts)
            const link = document.createElement('link');
            link.id = 'user-custom-font-link';
            link.rel = 'stylesheet';
            link.href = url;
            document.head.appendChild(link);
            
            // 💥 关键修复：尝试从 URL 提取字体名，或者默认使用 CSS 里定义的第一个字体
            // 例如: https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap
            const match = url.match(/family=([^&:]+)/);
            const fontName = match ? decodeURIComponent(match[1]).replace(/\+/g, ' ') : 'CustomUserFont';
            
            const fontStack = `"${fontName}", 'Noto Serif SC', serif`;
            document.documentElement.style.setProperty('--font-family', fontStack);
            document.documentElement.style.setProperty('--message-font-family', fontStack);
            document.body.style.fontFamily = fontStack;
            if (typeof settings !== 'undefined') settings.messageFontFamily = fontStack;
        } else {
            // 处理直链文件 (如 .ttf, .woff2)
            const fontName = 'UserCustomFont';
            const font = new FontFace(fontName, `url(${url})`);
            await font.load();
            document.fonts.add(font);
            
            const fontStack = `"${fontName}", 'Noto Serif SC', serif`;
            document.documentElement.style.setProperty('--font-family', fontStack);
            document.documentElement.style.setProperty('--message-font-family', fontStack);
            document.body.style.fontFamily = fontStack;
            if (typeof settings !== 'undefined') settings.messageFontFamily = fontStack;
        }
        console.log('字体加载成功');
    } catch (e) {
        console.error('字体加载失败:', e);
        showNotification('字体加载失败，请检查链接是否有效或为网络问题', 'error');
    }
}

function applyCustomBubbleCss(cssCode) {
    const styleId = 'user-custom-bubble-style';
    let styleTag = document.getElementById(styleId);
    
    if (!cssCode || !cssCode.trim()) {
        if (styleTag) styleTag.remove();
        return;
    }

    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
    }
    
    // Ensure image-only bubbles stay transparent even when custom CSS applies
    styleTag.textContent = cssCode + `
    .message.message-image-bubble-none,
    .message-image-bubble-none {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        border-radius: 0 !important;
    }`;
}

function applyGlobalThemeCss(cssCode) {
    const styleId = 'user-custom-global-theme-style';
    let styleTag = document.getElementById(styleId);

    if (!cssCode || !cssCode.trim()) {
        if (styleTag) styleTag.remove();
        return;
    }

    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
    }

    styleTag.textContent = cssCode;
}

// 替换原来的 checkStorageSpace 函数
async function checkStorageSpace() {
  if (!navigator.storage || !navigator.storage.estimate) return null;
  
  const estimate = await navigator.storage.estimate();
  const quota = estimate.quota || 0;
  
  // 只计算本应用 localforage 实际占用的体积，排除浏览器缓存等干扰
  let appUsage = 0;
  try {
    const keys = await localforage.keys();
    for (const key of keys) {
      const raw = await localforage.getItem(key);
      const str = typeof raw === 'string' ? raw : JSON.stringify(raw);
      appUsage += new Blob([str]).size;
    }
  } catch(e) {}

  // 加上 localStorage 的体积
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i) || '';
    const v = localStorage.getItem(k) || '';
    appUsage += (k.length + v.length) * 2;
  }

  const percentUsed = quota > 0 ? (appUsage / quota) * 100 : 0;
  
  // 提高阈值，因为之前算的是全局，实际应用数据占比通常很小
  if (percentUsed > 95) {
    showNotification('应用数据存储即将满载，建议导出备份', 'warning', 10000);
  }
  return estimate;
}

// 获取当前应该使用的字体源（优先本地文件，其次外部链接）
/*async function getActiveFontSource() {
  if (settings.useLocalFont) {
    try {
      // 🌟 优先读取极速版的二进制 Blob
      const fontBlob = await localforage.getItem(`${APP_PREFIX}local_font_blob`);
      if (fontBlob && fontBlob instanceof Blob) {
        return URL.createObjectURL(fontBlob); // 瞬间生成链接
      }
      // 兼容旧用户：如果他们以前存过 Base64，也能正常读出来
      const localBase64 = await localforage.getItem(`${APP_PREFIX}local_font_base64`);
      return localBase64 || '';
    } catch(e) {
      return '';
    }
  }
  return settings.customFontUrl || '';
}*/
async function getActiveFontSource() {
    if (settings.useLocalFont) {
        try {
            const fontList = await localforage.getItem(`${APP_PREFIX}local_font_list`) || [];
            // 优先按 activeLocalFontId 找
            if (settings.activeLocalFontId) {
                const activeFont = fontList.find(f => f.id === settings.activeLocalFontId);
                if (activeFont && activeFont.blob) return URL.createObjectURL(activeFont.blob);
            }
            // 找不到就取第一个
            if (fontList.length > 0 && fontList[0].blob) {
                return URL.createObjectURL(fontList[0].blob);
            }
            // 兼容旧版单文件
            const fontBlob = await localforage.getItem(`${APP_PREFIX}local_font_blob`);
            if (fontBlob && fontBlob instanceof Blob) return URL.createObjectURL(fontBlob);
            const localBase64 = await localforage.getItem(`${APP_PREFIX}local_font_base64`);
            return localBase64 || '';
        } catch(e) { return ''; }
    }
    return settings.customFontUrl || '';
}

// 统一的字体应用入口
async function applyCurrentFont() {
  const source = await getActiveFontSource();
  if (source && source.trim()) {
    await applyCustomFont(source);
  } else {
    await applyCustomFont('');
  }
}


// 在应用启动时检查
window.addEventListener('load', () => {
    setTimeout(checkStorageSpace, 5000);
});

// 每天检查一次
setInterval(checkStorageSpace, 24 * 60 * 60 * 1000);
