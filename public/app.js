/**
 * 阿里云千问大模型互动广告 - 「一人公司·超级个体」
 * 前端交互逻辑 | 白色主题 | 内容创作者导向
 */

// ================================================================
// 全局状态
// ================================================================
const state = {
  currentRole: 'copywriting',
  currentEmployeeName: '脚本千问',
  currentIcon: 'fa-pen-fancy',
  isGenerating: false,
  lastGeneratedContent: '',
  lastGeneratedType: 'text',
  generationCount: 0       // 用于动态转化按钮文案
};

// ================================================================
// 员工配置（媒体/内容创作者导向）
// ================================================================
const EMPLOYEE_CONFIG = {
  copywriting: {
    name: '脚本千问',
    icon: 'fa-pen-fancy',
    title: '文案 / 编剧',
    badge: '✍️ 短视频脚本 · 广告文案',
    endpoint: '/api/generate-text',
    resultType: 'text',
    loadingTexts: [
      '脚本千问正在构思...',
      '调用千问大模型，激发内容创意...',
      '文案生成中，请稍候...'
    ],
    templates: [
      {
        label: '🎬 抖音短视频脚本',
        prompt: '写一个30秒的抖音短视频脚本，推广一款降噪耳机，主题「沉浸自己的世界」。包含画面描述和口播文案，风格年轻潮流。'
      },
      {
        label: '📝 品牌故事文案',
        prompt: '为一个叫"轻醒"的新式茶饮品牌撰写品牌故事，目标用户是25-35岁的都市白领，突出"慢下来喝杯好茶"的理念，300字左右。'
      },
      {
        label: '🎤 小红书口播文案',
        prompt: '为一款智能手表写一篇小红书种草文案，口播风格，要有吸引眼球的标题，正文带emoji分段，最后加话题标签。'
      }
    ]
  },
  operations: {
    name: '运营千问',
    icon: 'fa-chart-line',
    title: '数据分析 / 方案',
    badge: '📊 账号起号 · 选题策略',
    endpoint: '/api/generate-text',
    resultType: 'text',
    loadingTexts: [
      '运营千问正在分析赛道数据...',
      '调用千问大模型，制定内容策略...',
      '方案生成中，请稍候...'
    ],
    templates: [
      {
        label: '📱 小红书起号方案',
        prompt: '为一个小红书美食账号制定7天起号方案，包含每日选题方向、封面标题建议、发布时间策略。目标用户是一二线城市25-35岁女性。'
      },
      {
        label: '📈 内容数据复盘',
        prompt: '假设一个抖音账号最近7天发布5条视频，播放量分别是2.3w/8k/15w/3k/4.5w。请分析哪个内容方向最具爆款潜力，并给出下周的选题建议。'
      },
      {
        label: '🤝 KOL合作策略',
        prompt: '为一个美妆品牌设计一份小红书KOL/KOC合作方案，预算8万元，要求给出达人量级配比、内容方向建议和预期效果预估。'
      }
    ]
  },
  art: {
    name: '美工千问',
    icon: 'fa-palette',
    title: '视觉设计',
    badge: '🎨 海报设计 · AI 出图',
    endpoint: '/api/generate-image',
    resultType: 'image',
    loadingTexts: [
      '美工千问正在构思画面...',
      '调用视觉模型，渲染图像中...',
      '图片生成中，预计需要30-60秒...'
    ],
    templates: [
      {
        label: '🖼️ AI课程海报',
        prompt: '生成一张科技感海报，用于宣传AI绘画课程。尺寸1080x1920（竖版），风格现代简约，蓝色调为主，包含"AI绘画实战训练营"标题。'
      },
      {
        label: '🎨 社媒配图',
        prompt: '为一篇小红书爆款笔记生成配图：清新自然风格，以奶茶和绿植为主题，适合美食探店类账号使用，温暖的色调。'
      },
      {
        label: '📢 直播预告图',
        prompt: '生成一张直播预告海报：主题"内容创作者如何用AI提升10倍效率"，科技感风格，紫色和蓝色渐变，简洁高级。'
      }
    ]
  },
  video: {
    name: '视频千问',
    icon: 'fa-video',
    title: '视频制作',
    badge: '🎬 15秒短视频',
    endpoint: null,
    resultType: 'coming_soon',
    loadingTexts: ['视频千问即将上线...'],
    templates: []
  }
};

// ================================================================
// 粒子背景（浅色版）
// ================================================================
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  const COUNT = 40;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.2 + 0.4;
      this.speedX = (Math.random() - 0.5) * 0.2;
      this.speedY = (Math.random() - 0.5) * 0.2;
      this.opacity = Math.random() * 0.18 + 0.05;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < -10) this.x = canvas.width + 10;
      if (this.x > canvas.width + 10) this.x = -10;
      if (this.y < -10) this.y = canvas.height + 10;
      if (this.y > canvas.height + 10) this.y = -10;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(47, 128, 237, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(47, 128, 237, ${(1 - dist / 80) * 0.04})`;
          ctx.lineWidth = 0.4;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
}

// ================================================================
// Toast 提示
// ================================================================
function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = 'toast ' + type + ' show';
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => { toast.classList.remove('show'); }, 2500);
}

// ================================================================
// 历史作品管理（localStorage）
// ================================================================
function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('qianwen_history') || '[]');
  } catch { return []; }
}

function saveHistory(entry) {
  const history = getHistory();
  history.unshift(entry);
  if (history.length > 20) history.pop();
  localStorage.setItem('qianwen_history', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById('historyList');
  const count = document.getElementById('historyCount');
  const history = getHistory();

  if (count) count.textContent = history.length;

  if (!list) return;

  if (history.length === 0) {
    list.innerHTML = '<div class="history-empty">暂无保存的作品</div>';
    return;
  }

  list.innerHTML = history.map((h, i) => `
    <div class="history-item" onclick="loadHistoryItem(${i})">
      <div class="history-item-role">${escapeHtml(h.role)}</div>
      <div class="history-item-preview">${escapeHtml(h.preview)}</div>
      <div class="history-item-time">${escapeHtml(h.time)}</div>
    </div>
  `).join('');
}

function loadHistoryItem(index) {
  const history = getHistory();
  if (index < 0 || index >= history.length) return;
  const item = history[index];

  // 切换对应角色
  if (item.roleKey && EMPLOYEE_CONFIG[item.roleKey]) {
    selectEmployee(item.roleKey);
  }

  // 显示历史内容
  document.getElementById('resultPlaceholder').style.display = 'none';
  document.getElementById('resultLoading').style.display = 'none';
  document.getElementById('resultOutput').style.display = '';

  const resultBody = document.getElementById('resultBody');
  const resultTag = document.getElementById('resultTag');
  const resultEmployeeName = document.getElementById('resultEmployeeName');

  if (resultEmployeeName) resultEmployeeName.textContent = item.role;
  if (resultBody) resultBody.innerHTML = `<pre>${escapeHtml(item.content)}</pre>`;
  if (resultTag) resultTag.textContent = item.time + ' · 由千问大模型生成';

  document.getElementById('btnDownload').style.display = 'none';
  state.lastGeneratedContent = item.content;
  state.lastGeneratedType = 'text';

  showToast('已加载历史作品', 'success');
}

// ================================================================
// 初始化演示示例（媒体/内容创作者方向）
// ================================================================
function initDemoExamples() {
  const container = document.getElementById('demoExamples');
  if (!container) return;

  const demos = [
    {
      title: '脚本千问 · 示例成果：抖音脚本',
      text: '🎬 【画面】教室走廊，噪音杂乱的背景渐渐消失\n👤 口播："世界很吵，但我选择只听我想听的"\n🎬 【特写】戴上降噪耳机，世界瞬间安静\n👤 口播："X-Pods Pro，沉浸自己的世界"'
    },
    {
      title: '运营千问 · 示例成果：小红书起号方案',
      text: '📱 Day1：定位+人设打造，发布"美食博主教你选食材"\n📱 Day2：蹭热点话题，发布"打卡100家宝藏小店"\n📱 Day3：干货教程型，"3分钟学会XX菜"系列\n...预期7天涨粉 800-1200，单篇爆款率 20%+'
    }
  ];

  let html = '';
  demos.forEach(demo => {
    html += `
      <div class="demo-card">
        <div class="demo-card-title">${demo.title}</div>
        <div class="demo-card-text">${demo.text}</div>
        <div class="demo-card-tag">* 本内容由千问大模型生成（预置示例）</div>
      </div>
    `;
  });
  container.innerHTML = html;
}

// ================================================================
// 员工选择
// ================================================================
function selectEmployee(role) {
  if (role === 'video') {
    showToast('视频千问即将开放，敬请期待！');
    return;
  }

  const config = EMPLOYEE_CONFIG[role];
  if (!config) return;

  state.currentRole = role;
  state.currentEmployeeName = config.name;
  state.currentIcon = config.icon;

  document.querySelectorAll('.employee-card').forEach(card => {
    card.classList.toggle('active', card.dataset.role === role);
  });

  const ceName = document.querySelector('.ce-name');
  const ceAvatar = document.querySelector('.ce-avatar i');
  if (ceName) ceName.textContent = config.name;
  if (ceAvatar) ceAvatar.className = 'fa-solid ' + config.icon;

  updateTemplates(role);

  const btnGenerate = document.getElementById('btnGenerate');
  if (btnGenerate) btnGenerate.dataset.role = role;

  if (config.templates.length > 0) {
    const input = document.getElementById('promptInput');
    if (input) input.value = config.templates[0].prompt;
  }

  resetResultView();
}

function updateTemplates(role) {
  const config = EMPLOYEE_CONFIG[role];
  if (!config || config.templates.length === 0) return;

  const container = document.getElementById('promptTemplates');
  if (!container) return;

  let html = '';
  config.templates.forEach((tpl, i) => {
    html += `<button class="template-btn ${i === 0 ? 'active' : ''}" data-prompt="${escapeHtml(tpl.prompt)}">${tpl.label}</button>`;
  });
  container.innerHTML = html;

  container.querySelectorAll('.template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const input = document.getElementById('promptInput');
      if (input) input.value = btn.dataset.prompt;
    });
  });
}

// ================================================================
// 视图切换
// ================================================================
function resetResultView() {
  document.getElementById('resultPlaceholder').style.display = '';
  document.getElementById('resultLoading').style.display = 'none';
  document.getElementById('resultOutput').style.display = 'none';
}

function showLoading() {
  document.getElementById('resultPlaceholder').style.display = 'none';
  document.getElementById('resultLoading').style.display = '';
  document.getElementById('resultOutput').style.display = 'none';

  const loadingEmp = document.getElementById('loadingEmployee');
  const loadingText = document.getElementById('loadingText');
  const icon = loadingEmp.querySelector('i');
  if (icon) icon.className = 'fa-solid ' + state.currentIcon;

  const config = EMPLOYEE_CONFIG[state.currentRole];
  if (loadingText && config) loadingText.textContent = config.loadingTexts[0];

  if (config && config.loadingTexts.length > 1) {
    let idx = 0;
    loadingText._interval = setInterval(() => {
      idx = (idx + 1) % config.loadingTexts.length;
      loadingText.textContent = config.loadingTexts[idx];
    }, 2000);
  }

  loadingEmp.classList.toggle('art-icon', state.currentRole === 'art');
}

function showResult(content, tag, isImage = false, imageUrl = null) {
  const loadingText = document.getElementById('loadingText');
  if (loadingText && loadingText._interval) {
    clearInterval(loadingText._interval);
    loadingText._interval = null;
  }

  document.getElementById('resultPlaceholder').style.display = 'none';
  document.getElementById('resultLoading').style.display = 'none';
  document.getElementById('resultOutput').style.display = '';

  const resultEmployeeName = document.getElementById('resultEmployeeName');
  if (resultEmployeeName) resultEmployeeName.textContent = state.currentEmployeeName;

  const resultBody = document.getElementById('resultBody');
  if (resultBody) {
    if (isImage && imageUrl) {
      resultBody.innerHTML = `<img src="${imageUrl}" alt="AI生成图片" class="result-image" onerror="this.parentElement.innerHTML='<div class=\\'result-image-placeholder\\'><i class=\\'fa-solid fa-image\\'></i><p>图片加载失败</p></div>'">`;
    } else if (isImage) {
      resultBody.innerHTML = `<div class="result-image-placeholder"><i class="fa-solid fa-image"></i><p>${escapeHtml(content)}</p></div>`;
    } else {
      resultBody.innerHTML = `<pre>${escapeHtml(content)}</pre>`;
    }
  }

  const resultTag = document.getElementById('resultTag');
  if (resultTag) resultTag.textContent = tag || '本内容由千问大模型生成';

  const btnDownload = document.getElementById('btnDownload');
  if (btnDownload) btnDownload.style.display = (isImage && imageUrl) ? '' : 'none';

  state.lastGeneratedContent = content;
  state.lastGeneratedType = isImage ? 'image' : 'text';
  state.generationCount++;

  // 动态更新转化按钮文案
  updateCtaButton();

  if (window.innerWidth <= 900) {
    document.getElementById('resultOutput').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ================================================================
// 动态转化按钮
// ================================================================
function updateCtaButton() {
  const btn = document.getElementById('btnCtaResult');
  if (!btn) return;

  const counts = [128, 256, 512, 1024, 2048];
  const idx = Math.min(state.generationCount - 1, counts.length - 1);
  const count = counts[idx];

  if (state.generationCount >= 1) {
    btn.textContent = `🎉 已有${count}+人开启一人公司，立即加入`;
  }
}

// ================================================================
// 生成内容
// ================================================================
async function generate() {
  if (state.isGenerating) return;

  const prompt = document.getElementById('promptInput').value.trim();
  if (!prompt) {
    showToast('请输入指令，告诉你的 AI 员工该做什么', 'error');
    return;
  }

  const config = EMPLOYEE_CONFIG[state.currentRole];
  if (!config || !config.endpoint) return;

  state.isGenerating = true;
  const btn = document.getElementById('btnGenerate');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 生成中...';
  }

  showLoading();

  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (response.status === 429) {
      showToast('请求太频繁，请10秒后再试', 'error');
      resetResultView();
      return;
    }

    const data = await response.json();
    if (!data.success) {
      showToast('生成失败，请重试', 'error');
      resetResultView();
      return;
    }

    if (config.resultType === 'image') {
      showResult(data.fallback ? data.description : data.tag,
        data.tag, true, data.fallback ? null : data.imageUrl);
    } else {
      showResult(data.content, data.tag);
    }
  } catch (error) {
    console.error('生成失败:', error);
    showToast('网络错误，请检查连接后重试', 'error');
    resetResultView();
  } finally {
    state.isGenerating = false;
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-rocket"></i> 立刻干活';
    }
  }
}

// ================================================================
// 保存作品
// ================================================================
function saveCurrentWork() {
  if (!state.lastGeneratedContent) {
    showToast('暂无内容可保存', 'error');
    return;
  }

  const now = new Date();
  const timeStr = now.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  saveHistory({
    role: state.currentEmployeeName,
    roleKey: state.currentRole,
    content: state.lastGeneratedContent,
    preview: state.lastGeneratedContent.substring(0, 60).replace(/\n/g, ' ') + '...',
    time: timeStr,
    type: state.lastGeneratedType
  });

  const btnSave = document.getElementById('btnSave');
  if (btnSave) {
    btnSave.classList.add('saved');
    btnSave.innerHTML = '<i class="fa-solid fa-check"></i> 已保存';
    setTimeout(() => {
      btnSave.classList.remove('saved');
      btnSave.innerHTML = '<i class="fa-solid fa-download"></i> 保存本次成果';
    }, 2000);
  }

  showToast('作品已保存至左侧「历史作品」', 'success');
}

// ================================================================
// 复制到剪贴板
// ================================================================
async function copyToClipboard() {
  if (!state.lastGeneratedContent) return;
  try {
    await navigator.clipboard.writeText(state.lastGeneratedContent);
    const btnCopy = document.getElementById('btnCopy');
    if (btnCopy) {
      btnCopy.classList.add('copied');
      btnCopy.innerHTML = '<i class="fa-solid fa-check"></i> 已复制';
      setTimeout(() => {
        btnCopy.classList.remove('copied');
        btnCopy.innerHTML = '<i class="fa-solid fa-copy"></i> 复制';
      }, 2000);
    }
    showToast('内容已复制到剪贴板', 'success');
  } catch {
    showToast('复制失败，请手动选择复制', 'error');
  }
}

// ================================================================
// 下载图片
// ================================================================
function downloadImage() {
  const img = document.querySelector('.result-image');
  if (!img || !img.src) return;
  const a = document.createElement('a');
  a.href = img.src;
  a.download = 'qianwen-generated-image.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('图片下载中...', 'success');
}

// ================================================================
// 公司创建器
// ================================================================
function initCompanyCreator() {
  const toggle = document.getElementById('ccToggle');
  const body = document.getElementById('ccBody');
  const btn = document.getElementById('btnCreateCompany');

  if (!toggle || !body) return;

  toggle.addEventListener('click', () => {
    const visible = body.style.display !== 'none';
    body.style.display = visible ? 'none' : 'flex';
    const arrow = toggle.querySelector('.fa-chevron-down, .fa-chevron-up');
    if (arrow) arrow.className = 'fa-solid ' + (visible ? 'fa-chevron-down' : 'fa-chevron-up');
  });

  if (btn) {
    btn.addEventListener('click', async () => {
      const name = document.getElementById('ccCompanyName').value.trim();
      const industry = document.getElementById('ccIndustry').value.trim();
      if (!name || !industry) {
        showToast('请填写账号/公司名称和内容赛道', 'error');
        return;
      }
      selectEmployee('operations');
      const prompt = `我运营的账号叫"${name}"，内容赛道是"${industry}"。请帮我制定一份完整的内容运营方案，包括：1）账号定位 2）目标用户画像 3）核心选题方向 4）14天发布计划。`;
      const input = document.getElementById('promptInput');
      if (input) input.value = prompt;
      body.style.display = 'none';
      const arrow = toggle.querySelector('.fa-chevron-down, .fa-chevron-up');
      if (arrow) arrow.className = 'fa-solid fa-chevron-down';
      showToast(`已为"${name}"生成内容方案框架，点击生成获取完整方案`, 'success');
    });
  }
}

// ================================================================
// 历史面板折叠
// ================================================================
function initHistoryToggle() {
  const toggle = document.getElementById('historyToggle');
  const list = document.getElementById('historyList');
  const arrow = document.querySelector('.history-arrow');

  if (!toggle || !list) return;

  toggle.addEventListener('click', () => {
    const visible = list.style.display !== 'none';
    list.style.display = visible ? 'none' : 'block';
    if (arrow) arrow.classList.toggle('open', !visible);
  });
}

// ================================================================
// 页面首次加载默认展示
// ================================================================
function showDefaultExample() {
  const resultPlaceholder = document.getElementById('resultPlaceholder');
  const resultOutput = document.getElementById('resultOutput');
  if (resultPlaceholder) resultPlaceholder.style.display = '';
  if (resultOutput) resultOutput.style.display = 'none';
}

// ================================================================
// 工具函数
// ================================================================
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ================================================================
// 事件绑定
// ================================================================
function bindEvents() {
  document.querySelectorAll('.employee-card').forEach(card => {
    card.addEventListener('click', () => {
      const role = card.dataset.role;
      if (role) selectEmployee(role);
    });
  });

  const btnGenerate = document.getElementById('btnGenerate');
  if (btnGenerate) btnGenerate.addEventListener('click', generate);

  const btnCopy = document.getElementById('btnCopy');
  if (btnCopy) btnCopy.addEventListener('click', copyToClipboard);

  const btnDownload = document.getElementById('btnDownload');
  if (btnDownload) btnDownload.addEventListener('click', downloadImage);

  const btnSave = document.getElementById('btnSave');
  if (btnSave) btnSave.addEventListener('click', saveCurrentWork);

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      generate();
    }
  });

  updateTemplates('copywriting');
}

// ================================================================
// 启动
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initDemoExamples();
  initCompanyCreator();
  initHistoryToggle();
  renderHistory();
  bindEvents();
  showDefaultExample();

  console.log('🚀 阿里云千问 · 一人公司互动广告已就绪 | 白色主题 | 内容创作者版');
  console.log('   一人公司，「千问」驱动');
});
