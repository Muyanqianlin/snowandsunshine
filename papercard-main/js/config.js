/**
 * config.js - App Constants & Data Structures
 * 应用常量与数据结构
 */

        const APP_PREFIX = 'CHAT_APP_V3_';

        // ============================================================
        // 📦 应用数据注册表
        // 新增功能只需在此添加一行配置，导出/导入/界面自动同步
        // ============================================================
        window.APP_DATA_REGISTRY = [
            // --- 核心数据 ---
            { id: 'messages', name: '聊天记录', icon: 'fa-comments', core: true, backup: true, 
            onImport: (d) => d.map(m => ({...m, timestamp: new Date(m.timestamp)})) 
            },
            { id: 'settings', name: '外观与设置', icon: 'fa-sliders-h', core: true, backup: true, 
            onImport: (d) => Object.assign(settings, d) // 设置需要合并
            },

            // --- 回复与表情 ---
            { id: 'customReplies', name: '字卡回复库', icon: 'fa-solid fa-feather-pointed', backup: true },
            { id: 'customEmojis', name: '自定义 Emoji', icon: 'fa-smile', backup: true },
            { id: 'stickerLibrary', name: '表情包库', icon: 'fa-sticky-note', backup: true },
            { id: 'myStickerLibrary', name: '我的收藏表情', icon: 'fa-folder-open', backup: true },

            // --- 氛围感 (合并为一组) ---
            { id: 'customPokes', name: '拍一拍', icon: 'fa-hand-point-up', backup: true, group: 'atmosphere' },
            { id: 'customStatuses', name: '对方状态', icon: 'fa-user-circle', backup: true, group: 'atmosphere' },
            { id: 'customMottos', name: '顶部格言', icon: 'fa-quote-right', backup: true, group: 'atmosphere' },
            { id: 'customIntros', name: '开场动画', icon: 'fa-film', backup: true, group: 'atmosphere' },
            // 虚拟组：用于界面显示合并项
            { id: 'atmosphere', name: '氛围感配置', icon: 'fa-magic', isVirtual: true, children: ['customPokes', 'customStatuses', 'customMottos', 'customIntros'] },

            // --- 功能数据 ---
            { id: 'anniversaries', name: '纪念日/倒计时', icon: 'fa-calendar-heart', backup: true },
            //{ id: 'calendarEvents', name: '心情与日程', icon: 'fa-calendar-alt', backup: true },
            // 👇 替换成下面三行：
            { id: 'calendarEvents', name: '日程记录', icon: 'fa-calendar-alt', backup: true },
            { id: 'moodData', name: '心情记录', icon: 'fa-cloud-sun', backup: true },

            // 假设信封数据变量名为 envelopeData (如果不对应请修改 id)
            { id: 'envelopeData', name: '留言板', icon: 'fa-envelope-open-text', backup: true },
            // 假设占卜记录变量名为 divinationHistory
            { id: 'divinationHistory', name: '占卜记录', icon: 'fa-moon', backup: true },

            // --- 外观主题 ---
            { id: 'savedBackgrounds', name: '背景图集', icon: 'fa-image', backup: true },
            { id: 'customThemes', name: '自定义主题', icon: 'fa-palette', backup: true },
            { id: 'themeSchemes', name: '主题方案', icon: 'fa-swatchbook', backup: true },
            { id: 'specialDayConfig', name: '特殊日子文案', icon: 'fa-bell', backup: true },

        ];

        // 辅助函数：获取变量值
        window._getRegVal = (id) => {
            try {
                return window[id]; 
            } catch(e) { return null; }
        };

        // 辅助函数：设置变量值
        window._setRegVal = (id, val) => {
            try {
                window[id] = val;
            } catch(e) { console.warn('设置变量失败:', id); }
        };
 
        
        const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
        const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
        const MESSAGES_PER_PAGE = 50;
        
        const CONSTANTS = {
            HEADER_MOTTOS: [],
            WELCOME_ANIMATIONS: [
                {
                    line1: "𝑳𝒐𝒗𝒆",
                    line2: "若要由我来谈论爱的话"
                },
                {
                    line1: "𝕰𝖈𝖍𝖔",
                    line2: "听见我的回音了吗？"
                },
                {
                    line1: "𝚂𝚘𝚞𝚕𝚖𝚊𝚝𝚎",
                    line2: "灵魂正在共振"
                },
                {
                    line1: "Melody",
                    line2: "心跳的旋律为你奏响"
                },
                {
                    line1: "Destiny",
                    line2: "命运的红线将我们相连"
                },
                {
                    line1: "Memory",
                    line2: "创造属于我们的回忆"
                },
                {
                    line1: "Amore",
                    line2: "心跳漏拍的那一秒"
                },
                {
                    line1: "共振",
                    line2: "频率相同的两个灵魂"
                },
                {
                    line1: "∞",
                    line2: "无限循环的思念"
                },
                {
                    line1: "Serendipity",
                    line2: "最美丽的意外"
                },
                {
                    line1: "Elysian",
                    line2: "与你共度的理想乡"
                },
                {
                    line1: "Paracosm",
                    line2: "共同构建的私宇宙"
                },
                {
                    line1: "Æther",
                    line2: "弥漫在空气中的悸动"
                },
                {
                    line1: "Symphony",
                    line2: "生命交织的乐章"
                },
                {
                    line1: "Nebula",
                    line2: "朦胧而璀璨的心事"
                },
                {
                    line1: "Event Horizon",
                    line2: "再也无法逃离的引力"
                },
                {
                    line1: "ℰ𝓉𝑒𝓇𝓃𝒶𝓁",
                    line2: "时间停驻的此刻"
                },
                {
                    line1: "𝓚𝓲𝓼𝓼",
                    line2: "未说出口的告白"
                },
                {
                    line1: "𝓜𝓲𝓻𝓪𝓬𝓵𝓮",
                    line2: "你就是奇迹本身"
                },
                {
                    line1: "𝓛𝓾𝓬𝓴𝔂",
                    line2: "此生最大的幸运"
                },
                {
                    line1: "𝓗𝓮𝓪𝓻𝓽",
                    line2: "为你跳动的心脏"
                },
                {
                    line1: "𝓒𝓸𝓶𝓮𝓽",
                    line2: "划过天际的相遇"
                },
                {
                    line1: "𝓢𝓽𝓪𝓻𝓭𝓾𝓼𝓽",
                    line2: "散落在身的星尘"
                },
                {
                    line1: "𝓟𝓻𝓮𝓬𝓲𝓸𝓾𝓼",
                    line2: "视若珍宝的你我"
                },
                {
                    line1: "𝒜𝓂𝒶𝓇𝓃𝓉𝒽",
                    line2: "永不凋零的心意"
                },
                {
                    line1: "Étoile",
                    line2: "你是我唯一的星辰"
                },
                {
                    line1: "𝑩𝒍ü𝒕𝒆",
                    line2: "悄然绽放的恋慕"
                },
                {
                    line1: "𝑪𝒆𝒍𝒆𝒔𝒕𝒆",
                    line2: "来自天际的馈赠"
                },
                {
                    line1: "𝑺𝒆𝒓𝒂𝒑𝒉",
                    line2: "守护你的六翼天使"
                },
                {
                    line1: "𝑬𝒑𝒐𝒏𝒂",
                    line2: "穿越时空的眷恋"
                },
                {
                    line1: "𝑽𝒆𝒓𝒔𝒂𝒊𝒍𝒍𝒆𝒔",
                    line2: "为你建造的宫殿"
                },
                {
                    line1: "𝑴𝒂𝒓é𝒆",
                    line2: "温柔席卷的浪潮"
                },
                {
                    line1: "𝑺𝒐𝒖𝒇𝒇𝒍𝒆𝒓",
                    line2: "甜蜜的折磨"
                },
                {
                    line1: "𝑨𝒖𝒓𝒐𝒓𝒆",
                    line2: "黎明前的极光"
                },
                {
                    line1: "𝑪𝒚𝒂𝒏𝒐𝒑𝒉𝒚𝒍𝒍𝒆",
                    line2: "青涩的恋之叶"
                },
            ],
            WELCOME_ICONS: [
                "fas fa-heart", "fas fa-star", "fas fa-moon", "fas fa-sun", "fas fa-cloud", "fas fa-feather", "fas fa-book", "fas fa-music", "fas fa-pen", "fas fa-key", "fas fa-compass", "fas fa-globe", "fas fa-leaf", "fas fa-water", "fas fa-fire", "fas fa-snowflake", "fas fa-umbrella", "fas fa-anchor", "fas fa-bell", "fas fa-gem", "fas fa-crown", "fas fa-dragon", "fas fa-feather-alt", "fas fa-fish", "fas fa-frog", "fas fa-hat-wizard", "fas fa-magic", "fas fa-ring", "fas fa-scroll", "fas fa-shield-alt", "fas fa-dove", "fas fa-cat", "fas fa-dog", "fas fa-horse", "fas fa-otter", "fas fa-paw", "fas fa-spider", "fas fa-kiwi-bird", "fas fa-crow", "fas fa-dove", "fas fa-seedling", "fas fa-tree", "fas fa-mountain", "fas fa-water", "fas fa-wind", "fas fa-volcano", "fas fa-meteor", "fas fa-satellite", "fas fa-rocket", "fas fa-user-astronaut"
            ],
            PARTNER_STATUSES: [],
            REPLY_MESSAGES: [],
            REPLY_EMOJIS: [],
            POKE_ACTIONS: [],
            TAROT_CARDS: [
                { name: "愚人", eng: "The Fool", meaning: "新的开始、冒险、天真、无畏", keyword: "流浪", icon: "fa-hiking" },
                { name: "魔术师", eng: "The Magician", meaning: "创造力、技能、意志力、化腐朽为神奇", keyword: "创造", icon: "fa-hat-wizard" },
                { name: "女祭司", eng: "The High Priestess", meaning: "直觉、潜意识、神秘、智慧", keyword: "智慧", icon: "fa-book-open" },
                { name: "女帝", eng: "The Empress", meaning: "丰饶、母性、自然、感官享受", keyword: "丰收", icon: "fa-seedling" },
                { name: "皇帝", eng: "The Emperor", meaning: "权威、结构、控制、父亲形象", keyword: "支配", icon: "fa-crown" },
                { name: "教皇", eng: "The Hierophant", meaning: "传统、信仰、教导、精神指引", keyword: "援助", icon: "fa-church" },
                { name: "恋人", eng: "The Lovers", meaning: "爱、和谐、关系、价值观的选择", keyword: "结合", icon: "fa-heart" },
                { name: "战车", eng: "The Chariot", meaning: "意志力、胜利、决心、自我控制", keyword: "胜利", icon: "fa-horse-head" },
                { name: "力量", eng: "Strength", meaning: "勇气、耐心、控制、内在力量", keyword: "意志", icon: "fa-fist-raised" },
                { name: "隐士", eng: "The Hermit", meaning: "内省、孤独、寻求真理、指引", keyword: "探索", icon: "fa-lightbulb" },
                { name: "命运之轮", eng: "Wheel of Fortune", meaning: "循环、命运、转折点、运气", keyword: "轮回", icon: "fa-dharmachakra" },
                { name: "正义", eng: "Justice", meaning: "公正、真理、因果、法律", keyword: "均衡", icon: "fa-balance-scale" },
                { name: "倒吊人", eng: "The Hanged Man", meaning: "牺牲、新的视角、等待、放下", keyword: "奉献", icon: "fa-user-injured" },
                { name: "死神", eng: "Death", meaning: "结束、转变、重生、放手", keyword: "结束", icon: "fa-skull" },
                { name: "节制", eng: "Temperance", meaning: "平衡、适度、耐心、调和", keyword: "净化", icon: "fa-glass-whiskey" },
                { name: "恶魔", eng: "The Devil", meaning: "束缚、物质主义、欲望、诱惑", keyword: "诱惑", icon: "fa-link" },
                { name: "高塔", eng: "The Tower", meaning: "突变、混乱、启示、破坏", keyword: "毁灭", icon: "fa-gopuram" },
                { name: "星星", eng: "The Star", meaning: "希望、灵感、平静、治愈", keyword: "希望", icon: "fa-star" },
                { name: "月亮", eng: "The Moon", meaning: "幻觉、恐惧、焦虑、潜意识", keyword: "不安", icon: "fa-moon" },
                { name: "太阳", eng: "The Sun", meaning: "快乐、成功、活力、清晰", keyword: "生命", icon: "fa-sun" },
                { name: "审判", eng: "Judgement", meaning: "复活、觉醒、号召、决定", keyword: "复活", icon: "fa-bullhorn" },
                { name: "世界", eng: "The World", meaning: "完成、整合、成就、圆满", keyword: "达成", icon: "fa-globe-americas" }
            ]

        };

// Make key constants globally accessible for inline scripts
window.APP_PREFIX = APP_PREFIX;
