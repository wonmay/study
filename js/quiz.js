/**
 * rhcloud Tokens 销售作战学院 — 客户识别自查表
 * 工程师4交付 · quiz.js
 * 版本：1.0 · 2026年4月
 *
 * 使用方法：
 *   <div id="quiz-container"></div>
 *   <script src="js/quiz.js"></script>
 *   <script>
 *     document.addEventListener('DOMContentLoaded', function() {
 *       initQuiz('#quiz-container');
 *     });
 *   </script>
 */

(function (global) {
  'use strict';

  /* ═══════════════════════════════════════
     1. 题目数据（JSON，便于后续修改）
  ═══════════════════════════════════════ */
  const QUIZ_QUESTIONS = [
    {
      id: 1,
      icon: 'fas fa-briefcase',
      category: '招聘信号',
      question: '这家企业是否正在招聘 AI/大模型相关岗位？',
      hint: '可在 Boss直聘/猎聘 搜索企业名，查看在招职位',
      options: [
        { label: '是，正在招聘 AI工程师/大模型工程师',               score: 3, tag: '强信号' },
        { label: '有招聘，但岗位是 "算法工程师" 或 "数据分析"',      score: 1, tag: '弱信号' },
        { label: '没有相关招聘，或无法确认',                          score: 0, tag: '无信号' },
      ],
    },
    {
      id: 2,
      icon: 'fas fa-code',
      category: '技术栈',
      question: '该企业技术栈是否涉及 API 调用或 AI 应用开发框架？',
      hint: '可查官网技术文档、GitHub 或招聘 JD 中的技术要求',
      options: [
        { label: '明确有 API 调用、AI应用框架相关技术',               score: 3, tag: '强信号' },
        { label: '有提到 "云计算" 或 "大数据"，但AI不明确',          score: 1, tag: '弱信号' },
        { label: '无法判断，或完全没有技术信号',                      score: 0, tag: '无信号' },
      ],
    },
    {
      id: 3,
      icon: 'fas fa-globe',
      category: '官网AI入口',
      question: '企业官网是否已有 AI 功能入口或 AI 产品展示？',
      hint: '打开官网，查看产品/服务页是否有 "AI助手"、"智能推荐"、"AI生成" 等功能',
      options: [
        { label: '官网明确有 AI 功能入口/产品',                       score: 3, tag: '强信号' },
        { label: '官网提到 AI 但没有明显功能入口',                    score: 1, tag: '弱信号' },
        { label: '官网没有任何 AI 相关信息',                          score: 0, tag: '无信号' },
      ],
    },
    {
      id: 4,
      icon: 'fas fa-coins',
      category: '月用量级别',
      question: '估算该企业的月均 Tokens 消耗量级别是多少？',
      hint: '可通过询问对方月 API 费用、或根据业务规模推算，10万Tokens≈约1元（按均价估）',
      options: [
        { label: '月消耗 100万～5000万 Tokens（核心目标）',           score: 3, tag: '核心目标' },
        { label: '月消耗 10万～100万 Tokens（可培育）',               score: 2, tag: '可培育' },
        { label: '无法估算，或低于 10万 Tokens',                      score: 0, tag: '暂不符合' },
      ],
    },
    {
      id: 5,
      icon: 'fas fa-user-tie',
      category: '决策人层级',
      question: '对接的决策人是什么层级？',
      hint: '决策链越短，签约效率越高；个人开发者和大厂 ≠ 目标客户',
      options: [
        { label: 'CTO / 技术总监 / 运营 VP（中短决策链）',            score: 3, tag: '最佳' },
        { label: '技术经理 / 架构师（中等决策链）',                   score: 2, tag: '可推进' },
        { label: '个人开发者 / 执行层，无采购决策权',                  score: 0, tag: '需向上' },
      ],
    },
  ];

  // 评分结果定义
  const SCORE_TIERS = [
    {
      min: 11, max: 15,
      grade: 'A',
      label: '立即跟进',
      color: 'success',
      icon: 'fas fa-fire',
      emoji: '🔥',
      desc: '高度匹配目标客户特征，建议 24 小时内主动联系，按 Day1 SOP 执行。',
      actions: [
        '今日内拨打第一通电话，完成需求确认',
        'Day3 发送 ROI 对比表 + 行业案例',
        'Day7 安排视频面谈，展示"无感迁移"方案',
        '准备好 POC 测试账号，随时可接入',
      ],
    },
    {
      min: 6, max: 10,
      grade: 'B',
      label: '持续跟进',
      color: 'warning',
      icon: 'fas fa-chart-line',
      emoji: '📈',
      desc: '有一定 AI 业务信号，但部分条件尚未确认，需要进一步培育。',
      actions: [
        '先发送一份行业痛点报告（PDF）预热',
        '重点确认月 Tokens 消耗量和决策人',
        '每 2～3 周保持一次触达，不要频繁打扰',
        '等待对方明确痛点后再推进 ROI 计算',
      ],
    },
    {
      min: 0, max: 5,
      grade: 'C',
      label: '暂不跟进',
      color: 'danger',
      icon: 'fas fa-times-circle',
      emoji: '⏸️',
      desc: '当前信号不足，不符合目标客户画像，继续跟进会浪费销售资源。',
      actions: [
        '礼貌结束对话，避免无效耗时',
        '加入线索池，3 个月后重新评估',
        '把精力集中到 A类/B类 线索',
        '记录原因：不在用 Tokens / 规模不符 / 决策链太长',
      ],
    },
  ];

  /* ═══════════════════════════════════════
     2. 状态管理
  ═══════════════════════════════════════ */
  let _container = null;
  let _answers   = {};  // { questionId: optionIndex }
  let _submitted = false;

  function resetState() {
    _answers   = {};
    _submitted = false;
  }

  function getTotalScore() {
    return QUIZ_QUESTIONS.reduce((sum, q) => {
      const idx = _answers[q.id];
      if (idx === undefined) return sum;
      return sum + (q.options[idx].score || 0);
    }, 0);
  }

  function getMaxScore() {
    return QUIZ_QUESTIONS.reduce((sum, q) => sum + Math.max(...q.options.map(o => o.score)), 0);
  }

  function getTier(score) {
    return SCORE_TIERS.find(t => score >= t.min && score <= t.max) || SCORE_TIERS[2];
  }

  function allAnswered() {
    return QUIZ_QUESTIONS.every(q => _answers[q.id] !== undefined);
  }

  /* ═══════════════════════════════════════
     3. 渲染
  ═══════════════════════════════════════ */

  function render() {
    if (!_container) return;

    _container.innerHTML = `
<div class="quiz-inner">

  <!-- 题目进度 -->
  <div class="quiz-progress-bar-wrap">
    <div class="quiz-progress-info">
      <span>客户识别自查表</span>
      <span class="quiz-progress-num" id="quiz-prog-num">0 / ${QUIZ_QUESTIONS.length}</span>
    </div>
    <div class="quiz-progress-track">
      <div class="quiz-progress-fill" id="quiz-prog-fill" style="width:0%"></div>
    </div>
  </div>

  <!-- 题目列表 -->
  <div class="quiz-questions" id="quiz-questions">
    ${QUIZ_QUESTIONS.map((q, qi) => renderQuestion(q, qi)).join('')}
  </div>

  <!-- 提交按钮 -->
  <div class="quiz-submit-wrap">
    <button id="quiz-submit-btn" class="btn btn-primary quiz-submit-btn" disabled>
      <i class="fas fa-chart-bar"></i> 查看客户评级结果
    </button>
    <div class="quiz-submit-hint">请回答所有 ${QUIZ_QUESTIONS.length} 道题后查看结果</div>
  </div>

  <!-- 结果区（隐藏） -->
  <div class="quiz-result-wrap" id="quiz-result" style="display:none"></div>

</div>
    `;

    // 绑定选项点击
    _container.querySelectorAll('.quiz-option').forEach(function (optEl) {
      optEl.addEventListener('click', function () {
        if (_submitted) return;
        const qid = parseInt(optEl.dataset.qid);
        const idx = parseInt(optEl.dataset.idx);
        handleAnswer(qid, idx);
      });
    });

    // 绑定提交按钮
    const submitBtn = document.getElementById('quiz-submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', function () {
        if (!allAnswered()) return;
        showResult();
      });
    }

    updateProgress();
  }

  function renderQuestion(q, qi) {
    return `
<div class="quiz-question" id="quiz-q-${q.id}" data-qid="${q.id}">
  <div class="quiz-q-header">
    <div class="quiz-q-num">
      <i class="${q.icon}"></i>
    </div>
    <div class="quiz-q-meta">
      <span class="quiz-q-category">${q.category}</span>
      <div class="quiz-q-text">Q${qi + 1}. ${q.question}</div>
      <div class="quiz-q-hint"><i class="fas fa-lightbulb"></i> ${q.hint}</div>
    </div>
  </div>
  <div class="quiz-options">
    ${q.options.map((opt, oi) => `
    <div class="quiz-option" data-qid="${q.id}" data-idx="${oi}">
      <div class="quiz-option__radio"></div>
      <div class="quiz-option__label">
        <span>${opt.label}</span>
        <span class="quiz-option__tag">${opt.tag}</span>
      </div>
    </div>
    `).join('')}
  </div>
</div>
    `;
  }

  /* ═══════════════════════════════════════
     4. 交互逻辑
  ═══════════════════════════════════════ */

  function handleAnswer(qid, idx) {
    _answers[qid] = idx;

    // 高亮选中项
    const qEl = document.getElementById('quiz-q-' + qid);
    if (!qEl) return;
    qEl.querySelectorAll('.quiz-option').forEach(function (el, i) {
      el.classList.toggle('selected', i === idx);
    });
    qEl.classList.add('answered');

    updateProgress();
    updateSubmitBtn();
  }

  function updateProgress() {
    const done     = Object.keys(_answers).length;
    const total    = QUIZ_QUESTIONS.length;
    const pct      = (done / total) * 100;
    const numEl    = document.getElementById('quiz-prog-num');
    const fillEl   = document.getElementById('quiz-prog-fill');
    if (numEl)  numEl.textContent   = `${done} / ${total}`;
    if (fillEl) fillEl.style.width  = pct + '%';
  }

  function updateSubmitBtn() {
    const btn = document.getElementById('quiz-submit-btn');
    if (!btn) return;
    const ready = allAnswered();
    btn.disabled = !ready;
    if (ready) {
      btn.classList.add('ready');
    }
  }

  function showResult() {
    _submitted = true;

    const score   = getTotalScore();
    const maxScore = getMaxScore();
    const tier    = getTier(score);
    const pct     = Math.round((score / maxScore) * 100);

    const resultEl = document.getElementById('quiz-result');
    if (!resultEl) return;

    resultEl.style.display = 'block';
    resultEl.innerHTML = `
<div class="quiz-result quiz-result--${tier.color}">

  <div class="quiz-result-header">
    <div class="quiz-result-icon quiz-result-icon--${tier.color}">${tier.emoji}</div>
    <div class="quiz-result-meta">
      <div class="quiz-result-grade quiz-result-grade--${tier.color}">
        ${tier.grade} 类客户 &nbsp;·&nbsp; ${tier.label}
      </div>
      <div class="quiz-result-score">
        综合评分：<strong>${score}</strong> / ${maxScore} 分（${pct}%）
      </div>
    </div>
  </div>

  <div class="quiz-result-desc">${tier.desc}</div>

  <!-- 得分明细 -->
  <div class="quiz-result-breakdown">
    <div class="quiz-result-breakdown-title">📋 各项评分明细</div>
    ${QUIZ_QUESTIONS.map(q => {
      const idx = _answers[q.id];
      const opt = q.options[idx];
      return `
      <div class="quiz-breakdown-row">
        <div class="quiz-breakdown-q"><i class="${q.icon}"></i> ${q.category}</div>
        <div class="quiz-breakdown-a">${opt ? opt.label : '未作答'}</div>
        <div class="quiz-breakdown-score quiz-score-${opt ? (opt.score >= 3 ? 'high' : opt.score >= 1 ? 'mid' : 'low') : 'low'}">
          ${opt ? opt.score : 0}分
        </div>
      </div>`;
    }).join('')}
  </div>

  <!-- 建议行动 -->
  <div class="quiz-actions-list">
    <div class="quiz-actions-list__title">
      <i class="fas fa-tasks"></i> 建议行动
    </div>
    <ul>
      ${tier.actions.map(a => `<li><i class="fas fa-check-circle"></i> ${a}</li>`).join('')}
    </ul>
  </div>

  <!-- 重新测试 -->
  <div class="quiz-reset-wrap">
    <button class="btn btn-secondary quiz-reset-btn" id="quiz-reset-btn">
      <i class="fas fa-redo"></i> 重新测试
    </button>
    <a href="tools.html#roi" class="btn btn-primary">
      <i class="fas fa-calculator"></i> 去计算 ROI
    </a>
  </div>

</div>
    `;

    // 绑定重置
    document.getElementById('quiz-reset-btn').addEventListener('click', function () {
      resetState();
      render();
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // 滚动到结果
    setTimeout(function () {
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

    // 禁用所有选项
    _container.querySelectorAll('.quiz-option').forEach(function (el) {
      el.style.pointerEvents = 'none';
    });

    // 隐藏提交按钮
    const submitWrap = _container.querySelector('.quiz-submit-wrap');
    if (submitWrap) submitWrap.style.display = 'none';
  }

  /* ═══════════════════════════════════════
     5. 专属样式注入
  ═══════════════════════════════════════ */
  function injectStyles() {
    if (document.getElementById('quiz-style')) return;
    const style = document.createElement('style');
    style.id = 'quiz-style';
    style.textContent = `
/* ── 整体容器 ── */
.quiz-inner { max-width: 780px; margin: 0 auto; }

/* ── 进度条 ── */
.quiz-progress-bar-wrap {
  margin-bottom: 28px;
}
.quiz-progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 8px;
  font-weight: 500;
}
.quiz-progress-num { color: var(--primary); font-weight: 700; }
.quiz-progress-track {
  height: 6px;
  background: var(--bg4);
  border-radius: 99px;
  overflow: hidden;
}
.quiz-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), #4FA0FF);
  border-radius: 99px;
  transition: width 0.4s ease;
}

/* ── 题目卡片 ── */
.quiz-question {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 20px;
  margin-bottom: 16px;
  transition: border-color var(--trans);
}
.quiz-question.answered { border-color: var(--primary-border); }

.quiz-q-header {
  display: flex;
  gap: 14px;
  margin-bottom: 14px;
}
.quiz-q-num {
  width: 40px; height: 40px;
  border-radius: 10px;
  background: var(--primary-dim);
  border: 1px solid var(--primary-border);
  display: flex; align-items: center; justify-content: center;
  color: var(--primary);
  font-size: 16px;
  flex-shrink: 0;
}
.quiz-q-meta { flex: 1; }
.quiz-q-category {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-dim);
  border-radius: 4px;
  padding: 2px 8px;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}
.quiz-q-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.5;
  margin-bottom: 6px;
}
.quiz-q-hint {
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  gap: 5px;
  align-items: flex-start;
  line-height: 1.5;
}
.quiz-q-hint i { color: var(--warning); flex-shrink: 0; margin-top: 1px; }

/* ── 选项 ── */
.quiz-options { display: flex; flex-direction: column; gap: 8px; }

.quiz-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg3);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: border-color var(--trans), background var(--trans), transform 0.1s;
  user-select: none;
}
.quiz-option:hover {
  border-color: var(--border-hover);
  background: var(--bg4);
}
.quiz-option.selected {
  border-color: var(--primary);
  background: var(--primary-dim);
}
.quiz-option.selected .quiz-option__radio {
  background: var(--primary);
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(20,121,255,.25);
}
.quiz-option.selected .quiz-option__radio::after {
  opacity: 1;
}

.quiz-option__radio {
  width: 18px; height: 18px;
  border: 2px solid var(--border-hover);
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
  transition: border-color var(--trans), background var(--trans), box-shadow var(--trans);
}
.quiz-option__radio::after {
  content: '';
  position: absolute;
  width: 8px; height: 8px;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  border-radius: 50%;
  opacity: 0;
  transition: opacity var(--trans);
}

.quiz-option__label {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 14px;
  color: var(--text);
  line-height: 1.5;
}
.quiz-option__tag {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--bg4);
  border-radius: 4px;
  padding: 2px 8px;
  white-space: nowrap;
  flex-shrink: 0;
}
.quiz-option.selected .quiz-option__tag {
  background: rgba(20,121,255,.2);
  color: var(--primary);
}

/* ── 提交区 ── */
.quiz-submit-wrap {
  text-align: center;
  padding: 28px 0 20px;
}
.quiz-submit-btn {
  padding: 13px 40px;
  font-size: 15px;
  font-weight: 600;
  min-width: 240px;
}
.quiz-submit-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.quiz-submit-btn.ready {
  animation: pulse-btn 1.5s ease-in-out 2;
}
@keyframes pulse-btn {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,106,0,0); }
  50% { box-shadow: 0 0 0 8px rgba(255,106,0,.2); }
}
.quiz-submit-hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-muted);
}

/* ── 结果区 ── */
.quiz-result {
  border-radius: var(--radius-xl);
  padding: 28px;
  margin-top: 12px;
}
.quiz-result--success { background: rgba(82,196,26,.06);  border: 1.5px solid rgba(82,196,26,.3); }
.quiz-result--warning { background: rgba(250,173,20,.06); border: 1.5px solid rgba(250,173,20,.3); }
.quiz-result--danger  { background: rgba(255,77,79,.06);  border: 1.5px solid rgba(255,77,79,.3); }

.quiz-result-header {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}
.quiz-result-icon {
  font-size: 40px;
  line-height: 1;
  flex-shrink: 0;
}
.quiz-result-grade {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 4px;
}
.quiz-result-grade--success { color: var(--success); }
.quiz-result-grade--warning { color: var(--warning); }
.quiz-result-grade--danger  { color: var(--danger);  }

.quiz-result-score {
  font-size: 13px;
  color: var(--text-muted);
}
.quiz-result-score strong { color: var(--text); }

.quiz-result-desc {
  font-size: 14px;
  color: var(--text);
  line-height: 1.8;
  padding: 14px 16px;
  background: rgba(255,255,255,.03);
  border-radius: var(--radius);
  margin-bottom: 20px;
}

/* ── 得分明细 ── */
.quiz-result-breakdown {
  margin-bottom: 20px;
}
.quiz-result-breakdown-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 10px;
}
.quiz-breakdown-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
}
.quiz-breakdown-row:last-child { border-bottom: none; }
.quiz-breakdown-q {
  width: 90px;
  flex-shrink: 0;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}
.quiz-breakdown-a {
  flex: 1;
  color: var(--text);
  line-height: 1.5;
}
.quiz-breakdown-score {
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}
.quiz-score-high { color: var(--success); }
.quiz-score-mid  { color: var(--warning); }
.quiz-score-low  { color: var(--danger);  }

/* ── 建议行动 ── */
.quiz-actions-list {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px 18px;
  margin-bottom: 20px;
}
.quiz-actions-list__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.quiz-actions-list ul { display: flex; flex-direction: column; gap: 8px; }
.quiz-actions-list li {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
}
.quiz-actions-list li i { color: var(--success); flex-shrink: 0; margin-top: 2px; }

/* ── 重置区 ── */
.quiz-reset-wrap {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.quiz-reset-btn { flex: none; }

@media (max-width: 480px) {
  .quiz-result { padding: 18px; }
  .quiz-q-header { flex-direction: column; gap: 8px; }
  .quiz-breakdown-q { width: 70px; font-size: 11px; }
  .quiz-option__label { flex-direction: column; align-items: flex-start; gap: 4px; }
  .quiz-reset-wrap { flex-direction: column; }
  .quiz-reset-wrap .btn { width: 100%; justify-content: center; }
}
    `;
    document.head.appendChild(style);
  }

  /* ═══════════════════════════════════════
     6. 公开接口
  ═══════════════════════════════════════ */

  /**
   * 初始化客户识别自查表
   * @param {string} containerSelector - 挂载容器的 CSS 选择器
   */
  function initQuiz(containerSelector) {
    _container = document.querySelector(containerSelector);
    if (!_container) {
      console.warn('[quiz] 找不到容器：', containerSelector);
      return;
    }
    injectStyles();
    resetState();
    render();
  }

  /* ── 挂载到全局 ── */
  global.initQuiz = initQuiz;

})(window);
