/**
 * rhcloud Tokens 销售作战学院 — 全局脚本
 * 工程师1交付 · 包含：密码验证、Tooltip、一键复制、学习进度、全局搜索、返回顶部
 * 版本：1.0 · 2026年4月
 *
 * 使用方法（所有页面底部）：
 *   <script src="js/main.js"></script>
 *   <script>
 *     document.addEventListener('DOMContentLoaded', function() {
 *       RHCloud.init('页面模块ID');  // 例如 RHCloud.init('basic')
 *     });
 *   </script>
 */

(function(global) {
  'use strict';

  /* ═══════════════════════════════════════════════════
     A. 全站术语词典（其他工程师在HTML中使用 data-tip="术语key" 即可）
  ═══════════════════════════════════════════════════ */
  const TERM_DICT = {
    'TPM':    { full: 'TPM（每分钟Token处理量）', desc: '每分钟可处理的Tokens数量，数字越大AI吐字越快，相当于高速公路的车道数' },
    'RPD':    { full: 'RPD（每日请求次数上限）', desc: '每天的请求次数上限，超过就会被限流，类似每天只能发 X 条短信' },
    '多模态':  { full: '多模态（Multimodal）',    desc: 'AI同时能看图、听声音、读文字，不只是聊天，就像人有多种感官' },
    '专有集群': { full: '专有集群（Dedicated Cluster）', desc: '只给你家用的服务器资源，不跟别人挤，高峰期不会因为其他用户拖慢你' },
    '智能路由': { full: '智能路由（Smart Routing）', desc: '系统自动选最合适、最省钱的模型，不需要手动切换，类似导航自动选最快路线' },
    '智能记忆层': { full: '智能记忆层（Semantic Cache）', desc: '相似的问题不重复调用AI，直接复用结果，省钱省时，像翻一下旧答案' },
    'POC':    { full: 'POC（概念验证/小范围测试）', desc: '先小范围测试验证效果，再大规模使用，降低迁移风险，通常只迁移1%流量测试' },
    '上下文窗口': { full: '上下文窗口（Context Window）', desc: 'AI一次能记住的对话长度，越长记得越多，超出范围的早期对话会被遗忘' },
    '场景自适应分流': { full: '场景自适应分流（Dynamic Routing）', desc: '根据不同业务场景自动分配最合适的AI模型，无需人工干预' },
    'RAG':    { full: 'RAG（检索增强生成）', desc: 'AI先检索相关资料再生成答案，让AI"查文件"后再回答，减少胡说八道' },
    '微调':   { full: '微调（Fine-tuning）', desc: '用自家业务数据对AI进行专项训练，让它更懂你的行业和场景' },
    '开源模型': { full: '开源模型（Open Source）', desc: '代码和权重公开，任何人可以下载使用，代表有DeepSeek、Llama等' },
    '闭源模型': { full: '闭源模型（Closed Source）', desc: '只能通过API调用，代码不公开，代表有GPT-4o、Claude等' },
    'Tokens': { full: 'Tokens（AI计费单位）', desc: 'AI处理文字的最小单位，大约4个英文字母或1.5个中文字=1个Token，调用AI就消耗' },
    'API':    { full: 'API（应用程序接口）', desc: '让两个软件之间互相通信的接口，调用AI就是通过API传入问题、拿回答案' },
    '聚合平台': { full: '模型聚合平台', desc: '将多家AI模型统一接入的平台，只需对接一个接口就能调用多种模型' },
    'rhcloud路由引擎': { full: 'rhcloud路由引擎', desc: 'rhcloud自研的智能调度系统，自动为每个请求匹配最优模型和线路' },
    'rhcloud智能网关': { full: 'rhcloud智能网关', desc: 'rhcloud的统一接入层，所有API请求经此分发，支持负载均衡和故障转移' },
  };

  /* ═══════════════════════════════════════════════════
     B. 全局搜索索引（汇总时可由工程师1补充）
  ═══════════════════════════════════════════════════ */
  const SEARCH_INDEX = [
    { page: 'index.html',     title: '首页·学习仪表盘',        keywords: ['首页', '学习', '进度', '仪表盘', '导航'] },
    { page: 'basic.html',     title: 'Tokens通俗解读',          keywords: ['tokens', '话费', '流量', '基础', '入门', '大模型', '什么是'] },
    { page: 'basic.html',     title: '大模型市场地图',           keywords: ['gpt', 'deepseek', '通义', '豆包', '文心', '星火', '模型', '全球'] },
    { page: 'basic.html',     title: '模型能力分类',             keywords: ['文本生成', '图像生成', '视频', '多模态', '能力'] },
    { page: 'business.html',  title: '我们能卖什么',             keywords: ['卖什么', '产品', '第三方', '聚合', '业务'] },
    { page: 'business.html',  title: '产品套餐',                 keywords: ['套餐', '价格', '基础包', '企业级', '定制'] },
    { page: 'target.html',    title: '客户准入规则',             keywords: ['准入', '红线', '目标客户', '不做', '只做'] },
    { page: 'target.html',    title: '客户画像',                 keywords: ['画像', '决策人', 'cto', '技术总监', '中小企业'] },
    { page: 'target.html',    title: '客户评分工具',             keywords: ['评分', '判断', 'a类', 'b类', 'c类', '是否跟进'] },
    { page: 'prospect.html',  title: '云厂商生态渠道',           keywords: ['阿里云', '生态', '社群', '渠道', '挖掘'] },
    { page: 'prospect.html',  title: '原厂联动',                 keywords: ['原厂', '陪访', '沙龙', '联动'] },
    { page: 'prospect.html',  title: '展会/峰会拓客',            keywords: ['展会', 'aigc', '峰会', '白皮书'] },
    { page: 'prospect.html',  title: '老客户转介绍',             keywords: ['转介绍', '推荐', '激励', '老客户'] },
    { page: 'prospect.html',  title: '线上精准识别',             keywords: ['企查查', '天眼查', 'boss直聘', '招聘', '侦查', '线索'] },
    { page: 'industry.html',  title: '行业作战室入口',           keywords: ['行业', '作战', '速查', '拜访'] },
    { page: 'industry-ai-video.html',       title: 'AI视频创作行业',     keywords: ['视频', 'ai视频', '生成', '创作'] },
    { page: 'industry-education.html',      title: '在线教育/题库',      keywords: ['教育', '题库', '推理', '数学', '学习'] },
    { page: 'industry-game-npc.html',       title: '游戏NPC',            keywords: ['游戏', 'npc', '对话', '角色'] },
    { page: 'industry-live-ecommerce.html', title: '直播电商',           keywords: ['直播', '电商', '合规', '实时'] },
    { page: 'industry-hr.html',             title: '招聘/HR Tech',       keywords: ['招聘', 'hr', '简历', '人才'] },
    { page: 'playbook.html',  title: '四步成交SOP',              keywords: ['sop', '成交', '流程', '步骤', '识别', '痛点'] },
    { page: 'playbook.html',  title: '跟单节奏管理',             keywords: ['跟单', 'day1', 'day3', 'day7', '节奏'] },
    { page: 'playbook.html',  title: '谈判技巧',                 keywords: ['谈判', '异议', '官网挺好用', '价格太贵', '迁移麻烦'] },
    { page: 'playbook.html',  title: '避坑指南',                 keywords: ['避坑', '禁止', '不能说', '丢单', '禁语'] },
    { page: 'scripts.html',   title: '电话开场话术',             keywords: ['电话', '开场', '话术', '第一句话'] },
    { page: 'scripts.html',   title: '痛点挖掘话术',             keywords: ['痛点', '挖掘', '稳定性', '成本', '速度'] },
    { page: 'scripts.html',   title: '异议处理话术',             keywords: ['异议', '反驳', '客户说', '怎么回'] },
    { page: 'scripts.html',   title: '转化关单话术',             keywords: ['关单', '转化', '逼单', '签约'] },
    { page: 'advantage.html', title: '四大平台优势',             keywords: ['优势', '稳定', '更快', '更省', '更智能', '专有集群'] },
    { page: 'advantage.html', title: '平台对比表',               keywords: ['对比', '官网', 'vs', '区别', '比较'] },
    { page: 'tools.html',     title: 'ROI计算器',                keywords: ['roi', '计算', '节省', '成本', '多少钱'] },
    { page: 'tools.html',     title: '客户识别自查',             keywords: ['自查', '识别', '值不值', '跟不跟'] },
    { page: 'tools.html',     title: 'AI陪练对话',               keywords: ['陪练', '练习', '模拟', '对话', '打分'] },
  ];

  /* ═══════════════════════════════════════════════════
     C. 学习进度模块名称映射
  ═══════════════════════════════════════════════════ */
  const MODULE_NAMES = {
    basic:     '基础认知',
    business:  '业务认知',
    target:    '目标客户',
    prospect:  '客户挖掘',
    industry:  '行业作战室',
    playbook:  '销售方法论',
    scripts:   '话术库',
    advantage: '平台优势',
    tools:     '实战工具',
    index:     '首页概览',
  };

  /* ═══════════════════════════════════════════════════
     D. 密码验证模块
  ═══════════════════════════════════════════════════ */
  function initPasswordGate() {
    // 已验证则跳过
    if (sessionStorage.getItem('rh_auth') === '1') return;

    const PASS = atob('eXVhbnl1'); // Base64: yuanyu
    const LOCK_KEY = 'rh_lock';
    const TRIES_KEY = 'rh_tries';

    const overlay = document.getElementById('pwd-overlay');
    if (!overlay) return;

    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    const input   = overlay.querySelector('#pwd-input');
    const btn     = overlay.querySelector('#pwd-submit');
    const errEl   = overlay.querySelector('#pwd-error');
    const lockEl  = overlay.querySelector('#pwd-lock');

    function getTries() { return parseInt(localStorage.getItem(TRIES_KEY) || '0', 10); }
    function setTries(n) { localStorage.setItem(TRIES_KEY, String(n)); }

    function isLocked() {
      const ts = parseInt(localStorage.getItem(LOCK_KEY) || '0', 10);
      if (!ts) return false;
      const remaining = ts - Date.now();
      return remaining > 0;
    }

    function getLockRemain() {
      const ts = parseInt(localStorage.getItem(LOCK_KEY) || '0', 10);
      return Math.max(0, Math.ceil((ts - Date.now()) / 1000));
    }

    function showLock() {
      let remain = getLockRemain();
      lockEl.textContent = `锁定中，请等待 ${remain} 秒后重试`;
      lockEl.classList.add('show');
      errEl.classList.remove('show');
      btn.disabled = true;
      if (input) input.disabled = true;

      const timer = setInterval(() => {
        remain--;
        if (remain <= 0) {
          clearInterval(timer);
          lockEl.classList.remove('show');
          btn.disabled = false;
          if (input) input.disabled = false;
          localStorage.removeItem(LOCK_KEY);
          setTries(0);
        } else {
          lockEl.textContent = `锁定中，请等待 ${remain} 秒后重试`;
        }
      }, 1000);
    }

    // 初始化时检查锁定
    if (isLocked()) showLock();

    function verify() {
      if (isLocked()) return;
      if (!input) return;

      const val = input.value.trim();
      if (val === PASS) {
        // 验证成功
        sessionStorage.setItem('rh_auth', '1');
        localStorage.removeItem(LOCK_KEY);
        setTries(0);
        overlay.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
          overlay.classList.add('hidden');
          document.body.style.overflow = '';
        }, 300);
      } else {
        // 验证失败
        const tries = getTries() + 1;
        setTries(tries);
        input.classList.add('error');
        input.value = '';
        input.focus();

        if (tries >= 3) {
          // 锁定5分钟
          localStorage.setItem(LOCK_KEY, String(Date.now() + 5 * 60 * 1000));
          setTries(0);
          showLock();
        } else {
          errEl.textContent = `密码错误，请联系管理员（还可尝试 ${3 - tries} 次）`;
          errEl.classList.add('show');
          lockEl.classList.remove('show');
        }

        setTimeout(() => input.classList.remove('error'), 600);
      }
    }

    if (btn)   btn.addEventListener('click', verify);
    if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') verify(); });
    // 禁止点击遮罩关闭
    overlay.addEventListener('click', e => e.stopPropagation());
  }

  // CSS fadeOut 关键帧（动态插入）
  const style = document.createElement('style');
  style.textContent = '@keyframes fadeOut{to{opacity:0;transform:scale(1.02)}}';
  document.head.appendChild(style);

  /* ═══════════════════════════════════════════════════
     E. Tooltip 模块
  ═══════════════════════════════════════════════════ */
  let tooltipEl = null;
  let tipTimer  = null;
  let longPress = null;

  function createTooltipEl() {
    if (tooltipEl) return;
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'tooltip-bubble';
    document.body.appendChild(tooltipEl);
  }

  function showTip(term, x, y) {
    const data = TERM_DICT[term];
    if (!data) return;
    createTooltipEl();

    tooltipEl.innerHTML = `<div class="tooltip-bubble__term">${data.full}</div>${data.desc}`;
    tooltipEl.classList.add('show');

    // 自动定位，避免超出屏幕
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const bw = 280;
    const bh = 80;

    let left = x;
    let top  = y + 12;

    if (left + bw > vw - 12) left = vw - bw - 12;
    if (left < 12) left = 12;
    if (top + bh > vh - 12) top = y - bh - 12;

    tooltipEl.style.left = left + 'px';
    tooltipEl.style.top  = top + 'px';
  }

  function hideTip() {
    if (tooltipEl) tooltipEl.classList.remove('show');
  }

  function initTooltips() {
    const els = document.querySelectorAll('[data-tip]');
    els.forEach(el => {
      const term = el.getAttribute('data-tip');
      if (!TERM_DICT[term]) return;

      // PC: 悬停0.3s后显示
      el.addEventListener('mouseenter', e => {
        clearTimeout(tipTimer);
        tipTimer = setTimeout(() => showTip(term, e.clientX, e.clientY), 300);
      });
      el.addEventListener('mousemove', e => {
        if (tooltipEl && tooltipEl.classList.contains('show')) {
          showTip(term, e.clientX, e.clientY);
        }
      });
      el.addEventListener('mouseleave', () => {
        clearTimeout(tipTimer);
        hideTip();
      });

      // 移动端: 长按500ms显示
      el.addEventListener('touchstart', e => {
        const touch = e.touches[0];
        longPress = setTimeout(() => {
          showTip(term, touch.clientX, touch.clientY);
        }, 500);
      }, { passive: true });
      el.addEventListener('touchend', () => {
        clearTimeout(longPress);
      });
    });

    // 点击其他地方关闭
    document.addEventListener('click', e => {
      if (e.target.closest('[data-tip]')) return;
      hideTip();
    });
  }

  /* ═══════════════════════════════════════════════════
     F. Toast 提示
  ═══════════════════════════════════════════════════ */
  function showToast(msg, type) {
    type = type || 'success';
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = { success: '✓', info: 'ℹ', warn: '⚠', error: '✕' };
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || '✓'}</span><span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 260);
    }, 2200);
  }

  /* ═══════════════════════════════════════════════════
     G. 一键复制模块
  ═══════════════════════════════════════════════════ */
  function initCopyButtons() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('.copy-btn');
      if (!btn) return;

      let text = btn.getAttribute('data-copy') || '';

      // 如果没有 data-copy，则找最近的 .copy-target 元素
      if (!text) {
        const target = btn.closest('[data-copy-parent]') || btn.parentElement;
        const textEl = target && target.querySelector('.copy-target');
        if (textEl) text = textEl.innerText.trim();
      }

      if (!text) return;

      const doWrite = (str) => {
        btn.classList.add('copied');
        const icon = btn.querySelector('i');
        const span = btn.querySelector('span') || btn;
        const oldText = span.textContent;
        if (icon) icon.className = 'fas fa-check';
        if (span !== btn) span.textContent = '已复制';

        showToast('话术已复制到剪贴板');
        setTimeout(() => {
          btn.classList.remove('copied');
          if (icon) icon.className = 'far fa-copy';
          if (span !== btn) span.textContent = oldText;
        }, 2000);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => doWrite(text)).catch(() => {
          fallbackCopy(text);
          doWrite(text);
        });
      } else {
        fallbackCopy(text);
        doWrite(text);
      }
    });
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); } catch(e) {}
    document.body.removeChild(ta);
  }

  /* ═══════════════════════════════════════════════════
     H. 学习进度模块
  ═══════════════════════════════════════════════════ */
  const PROG_KEY = 'rh_progress';

  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROG_KEY) || '{}');
    } catch(e) { return {}; }
  }

  function markProgress(moduleId) {
    if (!moduleId) return;
    const prog = getProgress();
    if (!prog[moduleId]) {
      prog[moduleId] = true;
      localStorage.setItem(PROG_KEY, JSON.stringify(prog));
    }
  }

  function resetProgress() {
    localStorage.removeItem(PROG_KEY);
  }

  // 当页面滚动到70%时自动标记当前模块为已读
  function initAutoProgress(moduleId) {
    if (!moduleId || moduleId === 'index') return;
    let marked = false;
    function checkScroll() {
      if (marked) return;
      const scrolled = window.scrollY + window.innerHeight;
      const total    = document.documentElement.scrollHeight;
      if (scrolled / total >= 0.7) {
        marked = true;
        markProgress(moduleId);
        updateProgressUI();
      }
    }
    window.addEventListener('scroll', checkScroll, { passive: true });
  }

  function updateProgressUI() {
    const prog = getProgress();
    // 更新导航完成角标
    document.querySelectorAll('[data-module]').forEach(el => {
      const id = el.getAttribute('data-module');
      const badge = el.querySelector('.module-entry__done');
      if (prog[id] && badge) badge.style.display = 'flex';
    });
    // 更新仪表盘进度条
    document.querySelectorAll('.dashboard-module').forEach(row => {
      const id = row.getAttribute('data-module');
      const bar = row.querySelector('.progress-bar');
      const pct = row.querySelector('.dashboard-module__pct');
      if (!id || !bar) return;
      const done = prog[id] ? 100 : 0;
      bar.style.width = done + '%';
      if (pct) pct.textContent = done + '%';
    });

    // 总体统计
    const modules = Object.keys(MODULE_NAMES).filter(k => k !== 'index');
    const done = modules.filter(k => prog[k]).length;
    const totalEl = document.getElementById('stat-done');
    if (totalEl) totalEl.textContent = done;
    const totalModEl = document.getElementById('stat-total');
    if (totalModEl) totalModEl.textContent = modules.length;
    const pctEl = document.getElementById('stat-pct');
    if (pctEl) pctEl.textContent = Math.round(done / modules.length * 100) + '%';
  }

  /* ═══════════════════════════════════════════════════
     I. 全局搜索
  ═══════════════════════════════════════════════════ */
  function initSearch() {
    const input    = document.getElementById('search-input');
    const dropdown = document.getElementById('search-dropdown');
    if (!input || !dropdown) return;

    function search(q) {
      q = q.trim().toLowerCase();
      if (!q) return [];
      return SEARCH_INDEX.filter(item => {
        const kw = item.keywords.join(' ').toLowerCase();
        return kw.includes(q) || item.title.toLowerCase().includes(q);
      }).slice(0, 8);
    }

    function highlight(text, q) {
      if (!q) return text;
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      return text.replace(re, m => `<mark>${m}</mark>`);
    }

    function render(results, q) {
      if (!results.length) {
        dropdown.innerHTML = `<div class="search-dropdown__empty">没有找到"${q}"相关内容</div>`;
      } else {
        dropdown.innerHTML = results.map(r =>
          `<div class="search-dropdown__item" data-page="${r.page}">
            <div class="search-dropdown__item-title">${highlight(r.title, q)}</div>
            <div class="search-dropdown__item-path">${r.page}</div>
          </div>`
        ).join('');
      }
      dropdown.classList.add('show');
    }

    input.addEventListener('input', () => {
      const q = input.value.trim();
      if (!q) { dropdown.classList.remove('show'); return; }
      render(search(q), q);
    });

    input.addEventListener('focus', () => {
      if (input.value.trim()) {
        render(search(input.value.trim()), input.value.trim());
      }
    });

    dropdown.addEventListener('click', e => {
      const item = e.target.closest('.search-dropdown__item');
      if (!item) return;
      const page = item.getAttribute('data-page');
      if (page) window.location.href = page;
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('.nav-top__search')) {
        dropdown.classList.remove('show');
      }
    });

    // 快捷键 / 或 Ctrl+K 聚焦搜索框
    document.addEventListener('keydown', e => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        input.focus();
        input.select();
      }
    });
  }

  /* ═══════════════════════════════════════════════════
     J. 返回顶部
  ═══════════════════════════════════════════════════ */
  function initBackToTop() {
    const btn = document.getElementById('back-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 300);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ═══════════════════════════════════════════════════
     K. Tab 切换组件
  ═══════════════════════════════════════════════════ */
  function initTabs() {
    document.querySelectorAll('.tab-wrap').forEach(wrap => {
      const btns   = wrap.querySelectorAll('.tab-btn');
      const panels = wrap.querySelectorAll('.tab-panel');

      btns.forEach((btn, i) => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          panels.forEach(p => p.classList.remove('active'));
          btn.classList.add('active');
          if (panels[i]) panels[i].classList.add('active');
        });
      });

      // 默认激活第一个
      if (btns[0]) btns[0].click();
    });
  }

  /* ═══════════════════════════════════════════════════
     L. 折叠面板
  ═══════════════════════════════════════════════════ */
  function initAccordion() {
    document.querySelectorAll('.accordion-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.accordion-item');
        if (!item) return;

        const isOpen = item.classList.contains('open');
        // 可选：同时只开一个
        // item.closest('.accordion')?.querySelectorAll('.accordion-item.open').forEach(o => o.classList.remove('open'));
        item.classList.toggle('open', !isOpen);
      });
    });
  }

  /* ═══════════════════════════════════════════════════
     M. 翻转卡片
  ═══════════════════════════════════════════════════ */
  function initFlipCards() {
    document.querySelectorAll('.flip-card').forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
      });
    });
  }

  /* ═══════════════════════════════════════════════════
     N. 顶部导航高亮当前页
  ═══════════════════════════════════════════════════ */
  function highlightNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-top__link[data-page]').forEach(link => {
      const pg = link.getAttribute('data-page');
      if (pg === currentPage || (pg === 'index.html' && currentPage === '')) {
        link.classList.add('active');
      }
    });
    document.querySelectorAll('.nav-bottom__item[data-page]').forEach(item => {
      const pg = item.getAttribute('data-page');
      if (pg === currentPage) item.classList.add('active');
    });
  }

  /* ═══════════════════════════════════════════════════
     O. 工具函数（供其他工程师使用）
  ═══════════════════════════════════════════════════ */
  function formatNumber(n) {
    n = parseFloat(n);
    if (isNaN(n)) return '0';
    if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿';
    if (n >= 10000)     return (n / 10000).toFixed(1) + '万';
    return n.toLocaleString('zh-CN');
  }

  function formatMoney(n) {
    n = parseFloat(n);
    if (isNaN(n)) return '¥0';
    if (n >= 10000) return '¥' + (n / 10000).toFixed(1) + '万';
    return '¥' + n.toFixed(0);
  }

  /* ═══════════════════════════════════════════════════
     P. 主初始化入口
  ═══════════════════════════════════════════════════ */
  function init(moduleId) {
    initPasswordGate();
    initTooltips();
    initCopyButtons();
    initBackToTop();
    initSearch();
    initTabs();
    initAccordion();
    initFlipCards();
    highlightNav();
    initAutoProgress(moduleId);
    updateProgressUI();
  }

  /* ═══════════════════════════════════════════════════
     Q. 对外暴露接口
  ═══════════════════════════════════════════════════ */
  global.RHCloud = {
    init,
    showToast,
    formatNumber,
    formatMoney,
    getProgress,
    markProgress,
    resetProgress,
    updateProgressUI,
    MODULE_NAMES,
    TERM_DICT,
  };

})(window);
