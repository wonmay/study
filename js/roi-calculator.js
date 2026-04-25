/**
 * rhcloud Tokens 销售作战学院 — ROI 计算器
 * 工程师4交付 · roi-calculator.js
 * 版本：1.0 · 2026年4月
 *
 * 使用方法：在 HTML 底部引入本文件后调用：
 *   RoiCalculator.init('#roi-section');
 *
 * 核心函数：
 *   calculateROI(model, volume, unitPrice)
 *   → 返回 { monthlySaving, yearSaving, tpmGain, stability, switchCost }
 */

(function (global) {
  'use strict';

  /* ═══════════════════════════════════════
     1. 纯计算函数（可单独调用）
  ═══════════════════════════════════════ */

  /**
   * 计算 ROI 数据
   * @param {string} model      - 当前模型：'qwen' | 'deepseek' | 'gpt4o' | 'other'
   * @param {number} volume     - 月均 Tokens 消耗量（万 Tokens）
   * @param {number} unitPrice  - 当前单价（元/百万 Tokens）
   * @returns {{ currentMonthly, monthlySaving, yearSaving, tpmGain, stability, switchCost, saveRate }}
   */
  function calculateROI(model, volume, unitPrice) {
    // 节省比例按模型类型
    const rateMap = {
      qwen:     0.20,  // 通义千问系列节省20%
      deepseek: 0.20,  // DeepSeek系列节省20%
      gpt4o:    0.35,  // GPT-4o节省35%（价格较高）
      other:    0.25,  // 其他模型节省25%
    };
    const saveRate = rateMap[model] || 0.25;

    // volume 单位：万Tokens；unitPrice 单位：元/百万Tokens
    // 当前月费 = volume(万) × 10000 / 1000000 × unitPrice = volume × unitPrice / 100
    const currentMonthly = parseFloat(((volume * unitPrice) / 100).toFixed(2));

    // 月节省 = 当前月费 × 节省比例
    const monthlySaving = parseFloat((currentMonthly * saveRate).toFixed(2));

    // 年节省 = 月节省 × 12
    const yearSaving = parseFloat((monthlySaving * 12).toFixed(2));

    // 固定性能数据
    const tpmGain    = 60;    // TPM 提升60%
    const stability  = 99.9;  // 稳定性99.9%

    // 切换回本周期：迁移成本 = 0（只需改一行代码），当月即可回本
    const switchCost = '当月即可回本';

    return {
      currentMonthly,
      monthlySaving,
      yearSaving,
      tpmGain,
      stability,
      switchCost,
      saveRate,
    };
  }

  /* ═══════════════════════════════════════
     2. DOM 渲染与交互
  ═══════════════════════════════════════ */

  // 模型选项
  const MODEL_OPTIONS = [
    { value: 'qwen',     label: '通义千问（Qwen-Turbo / Plus）',  priceHint: '参考区间：1～40 元/百万Tokens' },
    { value: 'deepseek', label: 'DeepSeek（V3 / R1）',             priceHint: '参考区间：1～8 元/百万Tokens' },
    { value: 'gpt4o',    label: 'GPT-4o 系列',                      priceHint: '参考区间：20～100 元/百万Tokens' },
    { value: 'other',    label: '其他模型',                          priceHint: '请根据账单估算单价' },
  ];

  /** 格式化数字：千分位 + 保留整数 */
  function fmtNum(n) {
    return Math.round(n).toLocaleString('zh-CN');
  }

  /** 渲染计算器 HTML */
  function renderCalculator(container) {
    container.innerHTML = `
<div class="roi-wrap" id="roi-inner">

  <!-- 左列：输入表单 -->
  <div class="roi-form-col">
    <div class="roi-panel">
      <div class="roi-panel__head">
        <i class="fas fa-sliders-h"></i>
        填写当前使用情况
      </div>
      <div class="roi-panel__body">

        <!-- 模型选择 -->
        <div class="roi-field">
          <label class="roi-label">当前使用的模型</label>
          <select id="roi-model" class="roi-select">
            ${MODEL_OPTIONS.map(o => `<option value="${o.value}">${o.label}</option>`).join('')}
          </select>
        </div>

        <!-- 月均消耗量 -->
        <div class="roi-field">
          <label class="roi-label">
            月均 Tokens 消耗量
            <span class="roi-unit">（万 Tokens）</span>
          </label>
          <input id="roi-volume" type="number" class="roi-input"
                 placeholder="例如：500" min="10" max="50000"
                 value="500">
          <div class="roi-hint" id="roi-volume-hint">
            <i class="fas fa-info-circle"></i>
            可在云厂商账单页查看，或估算：月API调用次数 × 平均每次Token数 ÷ 10000
          </div>
        </div>

        <!-- 当前单价 -->
        <div class="roi-field">
          <label class="roi-label">
            当前单价
            <span class="roi-unit">（元 / 百万 Tokens）</span>
          </label>
          <input id="roi-price" type="number" class="roi-input"
                 placeholder="例如：4" min="0.1" max="5000" step="0.1"
                 value="4">
          <div class="roi-hint" id="roi-price-hint">
            <i class="fas fa-info-circle"></i>
            参考区间：1～40 元/百万Tokens
          </div>
        </div>

        <!-- 实时预估月费 -->
        <div class="roi-preview">
          <span class="roi-preview__label">当前预估月费</span>
          <span class="roi-preview__val" id="roi-preview-val">—</span>
          <span class="roi-preview__unit">元/月</span>
        </div>

        <!-- 计算按钮 -->
        <button id="roi-calc-btn" class="btn btn-primary roi-calc-btn">
          <i class="fas fa-calculator"></i>
          立即计算节省金额
        </button>

        <div class="roi-error" id="roi-error"></div>
      </div>
    </div>
  </div>

  <!-- 右列：结果展示 -->
  <div class="roi-result-col">
    <div class="roi-result-panel" id="roi-result-panel">

      <!-- 空态提示 -->
      <div class="roi-empty" id="roi-empty">
        <i class="fas fa-chart-bar"></i>
        <p>填写左侧数据，点击计算<br>即可看到 ROI 分析报告</p>
      </div>

      <!-- 结果内容（隐藏至计算完毕） -->
      <div id="roi-result-content" style="display:none">

        <!-- 可截图区域 -->
        <div id="roi-screenshot-area">
          <div class="roi-result-header">
            <div class="roi-result-logo">rhcloud ROI 分析报告</div>
            <div class="roi-result-date" id="roi-result-date"></div>
          </div>

          <!-- 四个大数字卡片 -->
          <div class="roi-metrics">
            <div class="roi-metric roi-metric--save">
              <div class="roi-metric__label">月均节省</div>
              <div class="roi-metric__val"><span id="res-monthly">0</span></div>
              <div class="roi-metric__unit">元/月</div>
            </div>
            <div class="roi-metric roi-metric--year">
              <div class="roi-metric__label">年均节省</div>
              <div class="roi-metric__val"><span id="res-year">0</span></div>
              <div class="roi-metric__unit">元/年</div>
            </div>
            <div class="roi-metric roi-metric--tpm">
              <div class="roi-metric__label">性能提升</div>
              <div class="roi-metric__val"><span id="res-tpm">60</span>%</div>
              <div class="roi-metric__unit">TPM 提升</div>
            </div>
            <div class="roi-metric roi-metric--stable">
              <div class="roi-metric__label">服务稳定性</div>
              <div class="roi-metric__val"><span id="res-stable">99.9</span>%</div>
              <div class="roi-metric__unit">专有集群保障</div>
            </div>
          </div>

          <!-- 可复制话术文案 -->
          <div class="roi-script-box">
            <div class="roi-script-box__label">
              <i class="fas fa-comment-dots"></i> 可直接发给客户的话术
            </div>
            <div class="roi-script-text" id="roi-script-text"></div>
          </div>

          <!-- 切换回本说明 -->
          <div class="roi-payback">
            <i class="fas fa-bolt text-orange"></i>
            <span>迁移成本：<strong>只需修改一行代码接入</strong>，无需重构系统 —— <strong id="res-payback">当月即可回本</strong></span>
          </div>
        </div><!-- /roi-screenshot-area -->

        <!-- 操作按钮区（不进截图） -->
        <div class="roi-actions">
          <button class="btn btn-secondary" id="roi-copy-btn">
            <i class="far fa-copy"></i> 复制话术
          </button>
          <button class="btn btn-primary" id="roi-screenshot-btn">
            <i class="fas fa-camera"></i> 生成截图发给客户
          </button>
        </div>

        <!-- 免责提示 -->
        <div class="roi-disclaimer">
          * 以上数据为估算参考，实际节省金额以迁移后账单为准。
          接入 rhcloud 后可免费提供 POC 测试验证，零风险体验。
        </div>
      </div><!-- /roi-result-content -->
    </div>
  </div>

</div><!-- /roi-wrap -->
    `;
  }

  /** 绑定事件 */
  function bindEvents() {
    const modelSel  = document.getElementById('roi-model');
    const volumeInp = document.getElementById('roi-volume');
    const priceInp  = document.getElementById('roi-price');
    const previewEl = document.getElementById('roi-preview-val');
    const priceHint = document.getElementById('roi-price-hint');
    const errEl     = document.getElementById('roi-error');
    const calcBtn   = document.getElementById('roi-calc-btn');

    /** 更新价格参考提示 */
    function updatePriceHint() {
      const opt = MODEL_OPTIONS.find(o => o.value === modelSel.value);
      if (opt && priceHint) priceHint.innerHTML = `<i class="fas fa-info-circle"></i> ${opt.priceHint}`;
    }

    /** 实时更新预览月费 */
    function updatePreview() {
      const vol   = parseFloat(volumeInp.value) || 0;
      const price = parseFloat(priceInp.value)  || 0;
      if (vol > 0 && price > 0) {
        const monthly = (vol * price) / 100;
        previewEl.textContent = fmtNum(monthly);
      } else {
        previewEl.textContent = '—';
      }
    }

    modelSel.addEventListener('change',  () => { updatePriceHint(); updatePreview(); });
    volumeInp.addEventListener('input',  updatePreview);
    priceInp.addEventListener('input',   updatePreview);

    // 初始化
    updatePriceHint();
    updatePreview();

    /** 点击计算 */
    calcBtn.addEventListener('click', function () {
      errEl.textContent = '';
      const model  = modelSel.value;
      const volume = parseFloat(volumeInp.value);
      const price  = parseFloat(priceInp.value);

      // 校验
      if (!volume || volume < 10 || volume > 50000) {
        errEl.textContent = '请输入有效的月均消耗量（10 ～ 50000 万Tokens）';
        volumeInp.focus();
        return;
      }
      if (!price || price <= 0) {
        errEl.textContent = '请输入有效的当前单价（大于0）';
        priceInp.focus();
        return;
      }

      const result = calculateROI(model, volume, price);
      renderResult(result, model, volume, price);
    });

    // 支持回车触发计算
    [volumeInp, priceInp].forEach(el => {
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter') calcBtn.click();
      });
    });
  }

  /** 获取模型显示名 */
  function getModelLabel(model) {
    return (MODEL_OPTIONS.find(o => o.value === model) || {}).label || '当前模型';
  }

  /** 渲染结果 */
  function renderResult(result, model, volume, unitPrice) {
    const emptyEl   = document.getElementById('roi-empty');
    const contentEl = document.getElementById('roi-result-content');

    if (emptyEl)   emptyEl.style.display    = 'none';
    if (contentEl) contentEl.style.display  = 'block';

    // 填写日期
    const dateEl = document.getElementById('roi-result-date');
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString('zh-CN') + ' 生成';
    }

    // 填写四个数字
    document.getElementById('res-monthly').textContent = fmtNum(result.monthlySaving);
    document.getElementById('res-year').textContent    = fmtNum(result.yearSaving);
    document.getElementById('res-tpm').textContent     = result.tpmGain;
    document.getElementById('res-stable').textContent  = result.stability;
    document.getElementById('res-payback').textContent = result.switchCost;

    // 生成话术文本
    const modelLabel = getModelLabel(model);
    const savePct    = Math.round(result.saveRate * 100);
    const scriptText =
      `您目前使用「${modelLabel}」，月均Tokens消耗约 ${volume} 万，` +
      `当前月费约 ${fmtNum(result.currentMonthly)} 元。` +
      `接入 rhcloud 专有集群后，预计可节省约 ${savePct}%，` +
      `每月节省 ${fmtNum(result.monthlySaving)} 元，` +
      `年节省约 ${fmtNum(result.yearSaving)} 元。` +
      `同时 TPM（吐字速度）提升60%，服务稳定性高达99.9%。` +
      `迁移只需修改一行代码，零风险接入，当月即可回本。` +
      `我们可以先提供免费 POC 测试，您先体验再决定。`;

    const scriptEl = document.getElementById('roi-script-text');
    if (scriptEl) scriptEl.textContent = scriptText;

    // 绑定复制按钮
    const copyBtn = document.getElementById('roi-copy-btn');
    if (copyBtn) {
      copyBtn.onclick = function () {
        navigator.clipboard.writeText(scriptText).then(function () {
          copyBtn.innerHTML = '<i class="fas fa-check"></i> 已复制 ✓';
          copyBtn.classList.add('copied');
          setTimeout(function () {
            copyBtn.innerHTML = '<i class="far fa-copy"></i> 复制话术';
            copyBtn.classList.remove('copied');
          }, 2000);
        });
      };
    }

    // 绑定截图按钮
    const shotBtn = document.getElementById('roi-screenshot-btn');
    if (shotBtn) {
      shotBtn.onclick = function () {
        takeScreenshot(volume);
      };
    }

    // 滚动到结果区域
    const resultPanel = document.getElementById('roi-result-panel');
    if (resultPanel) {
      setTimeout(function () {
        resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }

  /** 生成截图 */
  function takeScreenshot(volume) {
    const area = document.getElementById('roi-screenshot-area');
    if (!area) return;

    // 检查 html2canvas 是否已加载
    if (typeof html2canvas === 'undefined') {
      alert('截图功能需要 html2canvas 库，请确认页面已引入。');
      return;
    }

    const btn = document.getElementById('roi-screenshot-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 生成中…';
    }

    html2canvas(area, {
      backgroundColor: '#131625',
      scale: 2,
      useCORS: true,
      logging: false,
    }).then(function (canvas) {
      const link = document.createElement('a');
      link.download = `rhcloud-ROI-${volume}万Tokens.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-camera"></i> 生成截图发给客户';
      }
    }).catch(function (err) {
      console.error('截图失败：', err);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-camera"></i> 生成截图发给客户';
      }
      alert('截图生成失败，请尝试手动截图。');
    });
  }

  /* ═══════════════════════════════════════
     3. 专属样式注入
  ═══════════════════════════════════════ */
  function injectStyles() {
    if (document.getElementById('roi-calc-style')) return;
    const style = document.createElement('style');
    style.id = 'roi-calc-style';
    style.textContent = `
/* ── ROI 计算器布局 ── */
.roi-wrap {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 24px;
  align-items: flex-start;
}
@media (max-width: 900px) {
  .roi-wrap { grid-template-columns: 1fr; }
}

/* ── 输入面板 ── */
.roi-panel {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}
.roi-panel__head {
  background: var(--bg3);
  border-bottom: 1px solid var(--border);
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 10px;
}
.roi-panel__head i { color: var(--orange); }
.roi-panel__body { padding: 20px; }

/* ── 表单元素 ── */
.roi-field { margin-bottom: 20px; }
.roi-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}
.roi-unit { font-weight: 400; color: var(--text-muted); }

.roi-select,
.roi-input {
  width: 100%;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 14px;
  font-size: 15px;
  color: var(--text);
  transition: border-color var(--trans);
  appearance: none;
  -webkit-appearance: none;
}
.roi-select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238892AE' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; }
.roi-select:focus,
.roi-input:focus { border-color: var(--border-active); }

.roi-hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  align-items: flex-start;
  gap: 5px;
  line-height: 1.5;
}
.roi-hint i { color: var(--primary); flex-shrink: 0; margin-top: 1px; }

/* ── 实时预览月费 ── */
.roi-preview {
  background: var(--bg4);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.roi-preview__label { font-size: 13px; color: var(--text-muted); flex: 1; }
.roi-preview__val   { font-size: 22px; font-weight: 700; color: var(--warning); }
.roi-preview__unit  { font-size: 12px; color: var(--text-muted); }

.roi-calc-btn {
  width: 100%;
  padding: 13px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.roi-error {
  margin-top: 10px;
  font-size: 13px;
  color: var(--danger);
  min-height: 16px;
}

/* ── 结果面板 ── */
.roi-result-panel {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  min-height: 300px;
}

.roi-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 64px 32px;
  text-align: center;
  color: var(--text-muted);
}
.roi-empty i { font-size: 40px; color: var(--text-dim); }
.roi-empty p { font-size: 14px; line-height: 1.8; }

/* ── 截图区 ── */
#roi-screenshot-area {
  padding: 24px;
  background: var(--bg2);
}

.roi-result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}
.roi-result-logo {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: 0.3px;
}
.roi-result-date {
  font-size: 12px;
  color: var(--text-muted);
}

/* ── 四个指标卡片 ── */
.roi-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}
@media (max-width: 540px) {
  .roi-metrics { grid-template-columns: 1fr; }
}

.roi-metric {
  border-radius: var(--radius-lg);
  padding: 16px 18px;
  border: 1px solid;
  text-align: center;
}
.roi-metric--save   { background: rgba(82,196,26,.08);   border-color: rgba(82,196,26,.25); }
.roi-metric--year   { background: rgba(20,121,255,.08);  border-color: rgba(20,121,255,.25); }
.roi-metric--tpm    { background: rgba(255,106,0,.08);   border-color: rgba(255,106,0,.25); }
.roi-metric--stable { background: rgba(123,97,255,.08);  border-color: rgba(123,97,255,.25); }

.roi-metric__label { font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
.roi-metric__val   { font-size: 30px; font-weight: 800; line-height: 1.1; }
.roi-metric--save   .roi-metric__val { color: var(--success); }
.roi-metric--year   .roi-metric__val { color: var(--primary); }
.roi-metric--tpm    .roi-metric__val { color: var(--orange); }
.roi-metric--stable .roi-metric__val { color: #9B7FFF; }
.roi-metric__unit  { font-size: 11px; color: var(--text-muted); margin-top: 4px; }

/* ── 话术文案框 ── */
.roi-script-box {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 16px;
}
.roi-script-box__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.roi-script-text {
  font-size: 14px;
  color: var(--text);
  line-height: 1.9;
  white-space: pre-wrap;
}

/* ── 回本周期 ── */
.roi-payback {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text-muted);
  padding: 10px 14px;
  background: var(--orange-dim);
  border-radius: var(--radius);
  border: 1px solid rgba(255,106,0,.2);
}
.roi-payback strong { color: var(--orange); }

/* ── 操作按钮区 ── */
.roi-actions {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  background: var(--bg3);
}
.roi-actions .btn { flex: 1; justify-content: center; }

/* 已复制状态 */
.btn.copied {
  background: var(--success) !important;
  border-color: var(--success) !important;
  color: #fff !important;
}

/* ── 免责提示 ── */
.roi-disclaimer {
  padding: 10px 24px 16px;
  font-size: 12px;
  color: var(--text-dim);
  background: var(--bg3);
}
    `;
    document.head.appendChild(style);
  }

  /* ═══════════════════════════════════════
     4. 公开初始化接口
  ═══════════════════════════════════════ */

  /**
   * 初始化 ROI 计算器
   * @param {string} selector - 挂载容器的 CSS 选择器
   */
  function init(selector) {
    const container = document.querySelector(selector);
    if (!container) {
      console.warn('[roi-calculator] 找不到容器：', selector);
      return;
    }
    injectStyles();
    renderCalculator(container);
    bindEvents();
  }

  /* ── 挂载到全局 ── */
  global.RoiCalculator = { init, calculateROI };

})(window);
