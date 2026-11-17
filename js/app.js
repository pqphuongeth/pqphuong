/* =========================================================
   Sổ Thu Chi – Ứng dụng quản lý chi tiêu cá nhân
   Dữ liệu lưu trong localStorage của trình duyệt.
   ========================================================= */
(() => {
  'use strict';

  // ---------------- DANH MỤC ----------------
  const INCOME_CATS = [
    { id: 'luong',       name: 'Lương',               icon: '💼', color: '#10b981' },
    { id: 'thuong',      name: 'Thưởng',              icon: '🎁', color: '#22c55e' },
    { id: 'kinhdoanh',   name: 'Kinh doanh',          icon: '🏪', color: '#14b8a6' },
    { id: 'dautu',       name: 'Lãi đầu tư / Cổ tức', icon: '📈', color: '#0ea5e9' },
    { id: 'laitietkiem', name: 'Lãi tiết kiệm',       icon: '🏦', color: '#3b82f6' },
    { id: 'chothue',     name: 'Cho thuê tài sản',    icon: '🔑', color: '#6366f1' },
    { id: 'freelance',   name: 'Làm thêm / Freelance',icon: '💻', color: '#8b5cf6' },
    { id: 'hoahong',     name: 'Hoa hồng từ bán hàng', icon: '🤝', color: '#a855f7' },
    { id: 'quatang',     name: 'Được tặng / Lì xì',   icon: '🧧', color: '#ec4899' },
    { id: 'thukhac',     name: 'Thu nhập khác',       icon: '💰', color: '#84cc16' },
  ];
  // Giữ nguyên id của các khoản cũ được đổi tên để dữ liệu đã nhập vẫn đúng chỗ
  const EXPENSE_CATS = [
    { id: 'nhao',      name: 'Nhà ở / Thuê nhà',                    icon: '🏠', color: '#ef4444' },
    { id: 'concai',    name: 'Gia đình',                            icon: '👨‍👩‍👧', color: '#f43f5e' },
    { id: 'bome',      name: 'Bố mẹ',                               icon: '👴', color: '#e11d48' },
    { id: 'dilai',     name: 'Xăng xe ô tô',                        icon: '⛽', color: '#0ea5e9' },
    { id: 'phixe',     name: 'Phí xe ô tô',                         icon: '🚗', color: '#0284c7' },
    { id: 'vienthong', name: 'Điện thoại',                          icon: '📱', color: '#3b82f6' },
    { id: 'anuong',    name: 'Ăn uống & cà phê',                    icon: '🍜', color: '#f97316', desc: 'Ăn uống và cà phê hằng ngày' },
    { id: 'tiepkhach', name: 'Tiếp khách',                          icon: '🥂', color: '#ea580c' },
    { id: 'hieuhi',    name: 'Chi phí quà tặng, biếu khách hàng',   icon: '🎁', color: '#d946ef' },
    { id: 'muasam',    name: 'Mua sắm cá nhân',                     icon: '🛍️', color: '#ec4899' },
    { id: 'muachocon', name: 'Mua sắm cho con',                     icon: '🧸', color: '#fb7185', desc: 'Đồ chơi, quần áo, đồ dùng học tập…' },
    { id: 'tmdt',      name: 'Mua hàng TMĐT cá nhân',               icon: '📦', color: '#f59e0b', desc: 'Mua hàng thương mại điện tử cá nhân (Shopee, Lazada, Tiki, TikTok Shop…)' },
    { id: 'yte',       name: 'Sức khỏe / Y tế',                     icon: '💊', color: '#14b8a6' },
    { id: 'giaoduc',   name: 'Giáo dục / Học tập',                  icon: '📚', color: '#6366f1' },
    { id: 'giaitri',   name: 'Giải trí / Du lịch',                  icon: '🎬', color: '#a855f7' },
    { id: 'lamdep',    name: 'Thể thao',                            icon: '🏸', color: '#22c55e' },
    { id: 'vesinh',    name: 'Vệ sinh cá nhân',                     icon: '💇', color: '#06b6d4', desc: 'Cắt tóc, gội đầu' },
    { id: 'phanmem',   name: 'Phần mềm / App',                      icon: '💻', color: '#8b5cf6' },
    { id: 'baohiem',   name: 'Bảo hiểm',                            icon: '🛡️', color: '#64748b' },
    { id: 'trano',     name: 'Trả nợ (gốc / lãi)',                  icon: '💳', color: '#78716c' },
    { id: 'trabds',    name: 'Trả tiền mua BĐS',                    icon: '🏗️', color: '#b45309' },
    { id: 'thuetncn',  name: 'Thuế TNCN',                           icon: '🧾', color: '#eab308' },
    { id: 'chikhac',   name: 'Chi phí khác',                        icon: '🗂️', color: '#94a3b8' },
  ];
  const INVEST_CATS = [
    { id: 'chungkhoan',  name: 'Chứng khoán / Cổ phiếu', icon: '📊', color: '#2563eb' },
    { id: 'quy',         name: 'Cryptos',                icon: '🪙', color: '#0891b2' },
    { id: 'vang',        name: 'Vàng / Bạc',             icon: '🥇', color: '#ca8a04' },
    { id: 'batdongsan',  name: 'Bất động sản',           icon: '🏘️', color: '#7c3aed' },
    { id: 'guitietkiem', name: 'Gửi tiết kiệm',          icon: '🏛️', color: '#059669' },
  ];
  const CATS_BY_TYPE = { income: INCOME_CATS, expense: EXPENSE_CATS, invest: INVEST_CATS };
  const TYPE_NAMES = { income: 'Thu nhập', expense: 'Chi tiêu', invest: 'Đầu tư' };
  const CAT_MAP = Object.fromEntries([...INCOME_CATS, ...EXPENSE_CATS, ...INVEST_CATS].map(c => [c.id, c]));
  const catOf = id => CAT_MAP[id] || { id, name: 'Không rõ', icon: '❔', color: '#999' };
  // Khoản đã bỏ khỏi danh sách: chuyển dữ liệu cũ sang khoản gần nhất
  const LEGACY_CAT = { diennuoc: 'nhao' };
  const catNote = c => (state && state.catNotes && c.id in state.catNotes ? state.catNotes[c.id] : c.desc || '');
  const migrateTx = t => (LEGACY_CAT[t.cat] ? { ...t, cat: LEGACY_CAT[t.cat] } : t);

  // ---------------- LƯU TRỮ ----------------
  // Hai chế độ lưu:
  //  - 'local': localStorage của trình duyệt (khi mở file index.html / GitHub Pages)
  //  - 'cloud': kho dữ liệu riêng của tài khoản khi mở trên claude.ai
  //    (mỗi tháng một tài liệu data/users/<id>/m-YYYY-MM, ngân sách ở .../meta)
  const STORE_KEY = 'sothuchi_v1';
  const THEME_KEY = 'sothuchi_theme';
  let storageMode = 'local';
  let cloud = null;                 // { db, base }
  const synced = {};                // docId -> JSON đã đồng bộ, để chỉ ghi phần thay đổi
  const writeChains = {};           // docId -> Promise, ghi tuần tự từng tài liệu
  let state = load();
  let themePref = (() => { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } })();

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY));
      if (raw && Array.isArray(raw.transactions)) return { transactions: raw.transactions.map(migrateTx), budgets: raw.budgets || {}, catNotes: raw.catNotes || {}, forecast: raw.forecast || {} };
    } catch (e) { /* bỏ qua */ }
    return { transactions: [], budgets: {}, catNotes: {}, forecast: {} };
  }
  function cloudDocs() {
    const docs = { meta: JSON.stringify({ budgets: state.budgets, catNotes: state.catNotes }) };
    const byMonth = {};
    for (const t of state.transactions) (byMonth['m-' + t.date.slice(0, 7)] ||= []).push(t);
    for (const [k, list] of Object.entries(byMonth)) docs[k] = JSON.stringify({ tx: list.slice().sort((a, b) => a.id.localeCompare(b.id)) });
    for (const [k, f] of Object.entries(state.forecast || {})) if (fcHasData(f)) docs['f-' + k] = JSON.stringify(f);
    return docs;
  }
  function queueWrite(id, body) {
    const ref = cloud.db.collection(cloud.base).doc(id);
    const run = () => (body === null ? ref.delete() : ref.set(JSON.parse(body))).catch(err => {
      delete synced[id];
      toast(err && err.code === 'quota_exceeded' ? '⚠️ Kho dữ liệu đã đầy, hãy xóa bớt giao dịch cũ' : '⚠️ Chưa lưu được lên tài khoản, hãy thử lại');
    });
    writeChains[id] = (writeChains[id] || Promise.resolve()).then(run);
  }
  function save() {
    if (storageMode === 'cloud') {
      const docs = cloudDocs();
      for (const [id, body] of Object.entries(docs)) if (synced[id] !== body) { synced[id] = body; queueWrite(id, body); }
      for (const id of Object.keys(synced)) if (!(id in docs) && synced[id] !== null) { synced[id] = null; queueWrite(id, null); }
      return;
    }
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
    catch (e) { toast('⚠️ Không thể lưu dữ liệu trên trình duyệt này'); }
  }
  function setSyncStatus(kind, text) {
    const el = $('#syncStatus'); if (!el) return;
    el.className = 'sync ' + kind; el.textContent = text;
  }
  async function connectCloud() {
    if (!window.claude || typeof window.claude.use !== 'function') return setSyncStatus('local', '💾 Lưu trên trình duyệt này');
    setSyncStatus('wait', '⏳ Đang kết nối…');
    const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    const id = user ? await user.id() : null;
    if (!db || !id) return setSyncStatus('local', '💾 Lưu trên trình duyệt này');
    cloud = { db, base: 'data/users/' + id };
    storageMode = 'cloud';
    state = { transactions: [], budgets: {}, catNotes: {}, forecast: {} };
    renderCurrent();
    let timer = setTimeout(() => setSyncStatus('wait', '⚠️ Chưa tải được dữ liệu, đang thử lại…'), 10000);
    db.collection(cloud.base).onSnapshot(snap => {
      const tx = [];
      let budgets = {}, catNotes = {}; const forecast = {};
      for (const d of snap.docs) {
        const body = d.data() || {};
        if (d.id.startsWith('f-')) { forecast[d.id.slice(2)] = JSON.parse(JSON.stringify(body)); synced[d.id] = JSON.stringify(body); continue; }
        synced[d.id] = d.id === 'meta' ? JSON.stringify({ budgets: body.budgets || {}, catNotes: body.catNotes || {} }) : JSON.stringify({ tx: body.tx || [] });
        if (d.id === 'meta') { budgets = { ...(body.budgets || {}) }; catNotes = { ...(body.catNotes || {}) }; }
        else if (Array.isArray(body.tx)) body.tx.forEach(t => tx.push(migrateTx({ ...t })));
      }
      state = { transactions: tx, budgets, catNotes, forecast };
      if (!snap.metadata.fromCache) { clearTimeout(timer); setSyncStatus('cloud', '☁️ Đã lưu vào tài khoản'); }
      renderCurrent();
    }, () => {
      clearTimeout(timer);
      setSyncStatus('wait', '⚠️ Mất kết nối kho dữ liệu, hãy tải lại trang');
    });
  }

  // ---------------- TIỆN ÍCH ----------------
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const nf = new Intl.NumberFormat('vi-VN');
  const money = n => nf.format(Math.round(n)) + ' ₫';
  // Đầu tư: dir 'in' = rót vốn (tiền mặt giảm), 'out' = rút vốn (tiền mặt tăng)
  const isWithdraw = t => t.type === 'invest' && t.dir === 'out';
  const txSigned = t => (t.type === 'income' || isWithdraw(t) ? '+' : '−') + money(t.amount);
  const shortMoney = n => {
    const a = Math.abs(n), s = n < 0 ? '-' : '';
    if (a >= 1e9) return s + +(a / 1e9).toFixed(1) + ' tỷ';
    if (a >= 1e6) return s + +(a / 1e6).toFixed(1) + ' tr';
    if (a >= 1e3) return s + +(a / 1e3).toFixed(0) + 'k';
    return s + a;
  };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const pad = n => String(n).padStart(2, '0');
  const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const today = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
  const DOW = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const DOW_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const dm = d => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
  const dmy = d => `${dm(d)}/${d.getFullYear()}`;
  const mondayOf = d => addDays(d, -((d.getDay() + 6) % 7));
  const isoWeek = d => {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return Math.ceil(((t - y0) / 864e5 + 1) / 7);
  };
  const parseAmount = s => Number(String(s).replace(/[^\d]/g, '')) || 0;

  function sumRange(startKey, endKey) {
    let income = 0, expense = 0, invest = 0, count = 0;
    const byCat = {};
    for (const t of state.transactions) {
      if (t.date < startKey || t.date > endKey) continue;
      count++;
      const amt = isWithdraw(t) ? -t.amount : t.amount;
      if (t.type === 'income') income += amt;
      else if (t.type === 'expense') expense += amt;
      else invest += amt;
      byCat[t.cat] = (byCat[t.cat] || 0) + amt;
    }
    // net: tích lũy (thu − chi); cash: tiền mặt còn lại sau khi đầu tư
    return { income, expense, invest, net: income - expense, cash: income - expense - invest, count, byCat };
  }

  // ---------------- KỲ THỐNG KÊ ----------------
  // Trả về {start, end, label, buckets:[{label,start,end}], trendTitle}
  function periodInfo(type, anchor) {
    const y = anchor.getFullYear(), m = anchor.getMonth();
    let start, end, label, buckets = [], trendTitle;
    if (type === 'day') {
      start = end = anchor;
      label = `${DOW[anchor.getDay()]}, ${dmy(anchor)}`;
      for (let i = 6; i >= 0; i--) {
        const d = addDays(anchor, -i);
        buckets.push({ label: `${DOW_SHORT[d.getDay()]} ${dm(d)}`, start: d, end: d });
      }
      trendTitle = 'Thu – chi 7 ngày gần nhất (tính đến ngày đã chọn)';
    } else if (type === 'week') {
      start = mondayOf(anchor); end = addDays(start, 6);
      label = `Tuần ${isoWeek(start)} (${dm(start)} – ${dmy(end)})`;
      for (let i = 0; i < 7; i++) {
        const d = addDays(start, i);
        buckets.push({ label: `${DOW_SHORT[d.getDay()]} ${dm(d)}`, start: d, end: d });
      }
      trendTitle = 'Thu – chi từng ngày trong tuần';
    } else if (type === 'month') {
      start = new Date(y, m, 1); end = new Date(y, m + 1, 0);
      label = `Tháng ${m + 1}/${y}`;
      for (let d = start; d <= end; d = addDays(d, 1)) buckets.push({ label: String(d.getDate()), start: d, end: d });
      trendTitle = 'Thu – chi từng ngày trong tháng';
    } else if (type === 'quarter') {
      const q = Math.floor(m / 3);
      start = new Date(y, q * 3, 1); end = new Date(y, q * 3 + 3, 0);
      label = `Quý ${q + 1}/${y}`;
      for (let i = 0; i < 3; i++) {
        buckets.push({ label: `Tháng ${q * 3 + i + 1}`, start: new Date(y, q * 3 + i, 1), end: new Date(y, q * 3 + i + 1, 0) });
      }
      trendTitle = 'Thu – chi từng tháng trong quý';
    } else {
      start = new Date(y, 0, 1); end = new Date(y, 11, 31);
      label = `Năm ${y}`;
      for (let i = 0; i < 12; i++) buckets.push({ label: `T${i + 1}`, start: new Date(y, i, 1), end: new Date(y, i + 1, 0) });
      trendTitle = 'Thu – chi từng tháng trong năm';
    }
    return { start, end, label, buckets, trendTitle };
  }
  function shiftAnchor(type, d, dir) {
    if (type === 'day') return addDays(d, dir);
    if (type === 'week') return addDays(d, 7 * dir);
    if (type === 'month') return new Date(d.getFullYear(), d.getMonth() + dir, 1);
    if (type === 'quarter') return new Date(d.getFullYear(), d.getMonth() + 3 * dir, 1);
    return new Date(d.getFullYear() + dir, 0, 1);
  }
  const PERIOD_NAMES = { day: 'hôm trước', week: 'tuần trước', month: 'tháng trước', quarter: 'quý trước', year: 'năm trước' };

  // ---------------- UI CHUNG ----------------
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  }

  const VIEW_TITLES = { dashboard: 'Tổng quan', transactions: 'Sổ giao dịch', reports: 'Thống kê', forecast: 'Dòng tiền dự kiến', budgets: 'Ngân sách', settings: 'Cài đặt' };
  let currentView = 'dashboard';
  function showView(v) {
    currentView = v;
    $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === v));
    $$('.view').forEach(s => s.classList.toggle('active', s.id === 'view-' + v));
    $('#viewTitle').textContent = VIEW_TITLES[v];
    renderCurrent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function renderCurrent() {
    ({ dashboard: renderDashboard, transactions: renderTransactions, reports: renderReports, forecast: renderForecast, budgets: renderBudgets, settings: renderSettings })[currentView]();
  }

  function statCard(icon, cls, label, value, delta) {
    return `<div class="stat"><div class="stat-ico ${cls}">${icon}</div><div class="stat-body">
      <div class="stat-label">${label}</div><div class="stat-value" title="${esc(value)}">${value}</div>
      ${delta ? `<div class="stat-delta ${delta.cls}">${delta.text}</div>` : ''}</div></div>`;
  }
  function deltaInfo(cur, prev, higherIsGood, periodName) {
    if (!prev) return cur ? { cls: 'muted', text: `Chưa có dữ liệu ${periodName}` } : null;
    const pct = ((cur - prev) / Math.abs(prev)) * 100;
    const up = pct >= 0;
    const good = higherIsGood ? up : !up;
    return { cls: good ? 'up-good' : 'up-bad', text: `${up ? '▲' : '▼'} ${Math.abs(pct).toFixed(1)}% so với ${periodName}` };
  }

  function txRow(t) {
    const c = catOf(t.cat);
    return `<div class="tx" data-id="${t.id}">
      <div class="tx-ico" style="background:${c.color}22">${c.icon}</div>
      <div class="tx-main"><div class="tx-cat">${esc(c.name)}${t.type === 'invest' ? ` <span class="tag ${t.dir === 'out' ? 'out' : ''}">${t.dir === 'out' ? 'Rút vốn' : 'Rót vốn'}</span>` : ''}</div><div class="tx-note">${esc(t.note) || '<span style="opacity:.6">Không có ghi chú</span>'}</div></div>
      <div class="tx-amt ${t.type}">${txSigned(t)}</div>
      <button class="tx-del" data-del="${t.id}" title="Xóa">🗑️</button>
    </div>`;
  }
  const sortTx = list => list.slice().sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0));

  function emptyState(text, withSample = false) {
    return `<div class="empty"><div class="big">🗒️</div><div>${text}</div>
      ${withSample ? '<div style="margin-top:12px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><button class="btn btn-primary btn-sm" data-action="add">＋ Thêm giao dịch</button><button class="btn btn-ghost btn-sm" data-action="sample">✨ Dùng dữ liệu mẫu</button></div>' : ''}</div>`;
  }

  // ---------------- BIỂU ĐỒ ----------------
  const charts = {};
  const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function drawChart(id, config) {
    if (typeof Chart === 'undefined') return;
    if (charts[id]) charts[id].destroy();
    const el = document.getElementById(id);
    if (!el) return;
    Chart.defaults.font.family = '"Be Vietnam Pro", system-ui, sans-serif';
    Chart.defaults.color = cssVar('--muted');
    charts[id] = new Chart(el, config);
  }
  function barConfig(labels, inc, exp, inv) {
    const grid = cssVar('--border');
    return {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Thu nhập', data: inc, backgroundColor: cssVar('--income'), borderRadius: 6, maxBarThickness: 28 },
          { label: 'Chi tiêu', data: exp, backgroundColor: cssVar('--expense'), borderRadius: 6, maxBarThickness: 28 },
          { label: 'Đầu tư', data: inv, backgroundColor: cssVar('--invest'), borderRadius: 6, maxBarThickness: 28 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8 } },
          tooltip: { callbacks: { label: c => `${c.dataset.label}: ${money(c.parsed.y)}` } },
        },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: grid }, border: { display: false }, ticks: { callback: v => shortMoney(v) } },
        },
      },
    };
  }
  function pieConfig(byCat, cats) {
    const items = cats.map(c => ({ c, v: byCat[c.id] || 0 })).filter(x => x.v > 0).sort((a, b) => b.v - a.v);
    const total = items.reduce((s, x) => s + x.v, 0);
    return {
      type: 'doughnut',
      data: {
        labels: items.map(x => `${x.c.icon} ${x.c.name}`),
        datasets: [{ data: items.map(x => x.v), backgroundColor: items.map(x => x.c.color), borderColor: cssVar('--surface'), borderWidth: 3, hoverOffset: 8 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '62%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { title: c => c[0].label, label: c => ` ${money(c.parsed)} (${(c.parsed / total * 100).toFixed(1)}%)` } },
        },
      },
      _empty: items.length === 0,
    };
  }
  function drawPie(canvasId, emptyId, byCat, cats) {
    const cfg = pieConfig(byCat, cats);
    const empty = cfg._empty;
    $('#' + emptyId).classList.toggle('hidden', !empty);
    document.getElementById(canvasId).style.visibility = empty ? 'hidden' : 'visible';
    drawChart(canvasId, cfg);
  }
  function catTable(byCat, cats, total, limit = Infinity) {
    const items = cats.map(c => ({ c, v: byCat[c.id] || 0 })).filter(x => x.v > 0).sort((a, b) => b.v - a.v).slice(0, limit);
    if (!items.length) return '';
    return `<div class="cat-table">${items.map(({ c, v }) => {
      const p = total ? v / total * 100 : 0;
      return `<div class="cat-row"><div class="emoji">${c.icon}</div>
        <div><div class="name">${esc(c.name)} <small>${p.toFixed(1)}%</small></div>
        <div class="bar"><i style="width:${p}%;background:${c.color}"></i></div></div>
        <div class="val">${money(v)}</div></div>`;
    }).join('')}</div>`;
  }

  // ---------------- TỔNG QUAN ----------------
  function renderDashboard() {
    const t = today(), tk = keyOf(t);
    const mStart = new Date(t.getFullYear(), t.getMonth(), 1), mEnd = new Date(t.getFullYear(), t.getMonth() + 1, 0);
    const pmStart = new Date(t.getFullYear(), t.getMonth() - 1, 1), pmEnd = new Date(t.getFullYear(), t.getMonth(), 0);
    const cur = sumRange(keyOf(mStart), keyOf(mEnd));
    const prev = sumRange(keyOf(pmStart), keyOf(pmEnd));
    const all = sumRange('0000-00-00', '9999-12-31');
    const todayS = sumRange(tk, tk);

    $('#dbBalance').textContent = money(all.net);
    $('#dbBalanceSub').textContent = `Tiền mặt ${money(all.cash)} • Đang đầu tư ${money(all.invest)}`;
    $('#dbToday').textContent = money(todayS.expense);
    const monthExpToDate = sumRange(keyOf(mStart), tk).expense;
    $('#dbAvg').textContent = money(monthExpToDate / t.getDate());

    const rate = cur.income ? (cur.net / cur.income * 100) : 0;
    $('#dbStats').innerHTML =
      statCard('⬆️', 'ico-income', `Thu nhập tháng ${t.getMonth() + 1}`, money(cur.income), deltaInfo(cur.income, prev.income, true, 'tháng trước')) +
      statCard('⬇️', 'ico-expense', `Chi tiêu tháng ${t.getMonth() + 1}`, money(cur.expense), deltaInfo(cur.expense, prev.expense, false, 'tháng trước')) +
      statCard('📊', 'ico-invest', `Đầu tư tháng ${t.getMonth() + 1}`, money(cur.invest), deltaInfo(cur.invest, prev.invest, true, 'tháng trước')) +
      statCard('💵', 'ico-primary', 'Tiền mặt còn lại tháng này', money(cur.cash), { cls: 'muted', text: 'Thu − Chi − Đầu tư' }) +
      statCard('🐷', 'ico-warn', 'Tỷ lệ tiết kiệm & đầu tư', cur.income ? rate.toFixed(1) + '%' : '—', { cls: 'muted', text: '(Thu − Chi) / Thu' });

    // Xu hướng 6 tháng
    const labels = [], inc = [], exp = [], inv = [];
    for (let i = 5; i >= 0; i--) {
      const s = new Date(t.getFullYear(), t.getMonth() - i, 1), e = new Date(t.getFullYear(), t.getMonth() - i + 1, 0);
      const r = sumRange(keyOf(s), keyOf(e));
      labels.push(`T${s.getMonth() + 1}/${String(s.getFullYear()).slice(2)}`); inc.push(r.income); exp.push(r.expense); inv.push(r.invest);
    }
    drawChart('dbTrendChart', barConfig(labels, inc, exp, inv));
    drawPie('dbPieChart', 'dbPieEmpty', cur.byCat, EXPENSE_CATS);
    $('#dbPieTable').innerHTML = catTable(cur.byCat, EXPENSE_CATS, cur.expense, 5);
    renderPortfolio(all);
    renderDbForecast();

    // Cảnh báo ngân sách
    const alerts = EXPENSE_CATS.filter(c => state.budgets[c.id] > 0)
      .map(c => ({ c, spent: cur.byCat[c.id] || 0, limit: state.budgets[c.id] }))
      .map(x => ({ ...x, p: x.spent / x.limit * 100 }))
      .sort((a, b) => b.p - a.p);
    if (!alerts.length) {
      $('#dbBudgetAlerts').innerHTML = `<div class="empty"><div class="big">🎯</div>Bạn chưa đặt hạn mức chi tiêu.<br><button class="btn btn-ghost btn-sm" style="margin-top:10px" data-goto="budgets">Đặt ngân sách ngay</button></div>`;
    } else {
      $('#dbBudgetAlerts').innerHTML = alerts.slice(0, 6).map(x => {
        const st = budgetStatus(x.p);
        return `<div class="alert-row"><div class="tx-ico" style="background:${x.c.color}22">${x.c.icon}</div>
          <div class="t"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(x.c.name)}</b><span class="badge ${st.cls}">${st.text}</span></div>
          <div class="bar"><i style="width:${Math.min(x.p, 100)}%;background:${st.color}"></i></div>
          <div class="muted small">${money(x.spent)} / ${money(x.limit)}</div></div></div>`;
      }).join('');
    }

    const recent = sortTx(state.transactions).slice(0, 6);
    $('#dbRecent').innerHTML = recent.length
      ? `<div class="tx-list">${recent.map(txRow).join('')}</div>`
      : emptyState('Chưa có giao dịch nào. Hãy bắt đầu ghi chép!', true);
  }

  // Danh mục đầu tư tích lũy (tổng rót − tổng rút theo từng khoản)
  function renderPortfolio(all) {
    $('#dbPortTotal').textContent = money(all.invest);
    drawPie('dbPortPie', 'dbPortEmpty', all.byCat, INVEST_CATS);
    $('#dbPortTable').innerHTML = INVEST_CATS.map(c => {
      const v = all.byCat[c.id] || 0, p = all.invest > 0 && v > 0 ? v / all.invest * 100 : 0;
      return `<div class="cat-row"><div class="emoji">${c.icon}</div>
        <div><div class="name">${esc(c.name)} <small>${p.toFixed(1)}%</small></div>
        <div class="bar"><i style="width:${p}%;background:${c.color}"></i></div></div>
        <div class="val">${money(v)}</div></div>`;
    }).join('');
  }

  function budgetStatus(p) {
    if (p > 100) return { cls: 'over', text: `Vượt ${(p - 100).toFixed(0)}%`, color: cssVar('--expense') };
    if (p >= 80) return { cls: 'warn', text: `${p.toFixed(0)}% – Sắp hết`, color: cssVar('--warn') };
    return { cls: 'ok', text: `${p.toFixed(0)}%`, color: cssVar('--income') };
  }

  // ---------------- GIAO DỊCH ----------------
  function fillCatFilter() {
    const type = $('#fType').value, sel = $('#fCat'), prev = sel.value;
    const group = (label, cats) => `<optgroup label="${label}">${cats.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}</optgroup>`;
    sel.innerHTML = '<option value="all">Tất cả danh mục</option>' +
      Object.entries(CATS_BY_TYPE).filter(([k]) => type === 'all' || type === k).map(([k, cats]) => group(TYPE_NAMES[k], cats)).join('');
    sel.value = [...sel.options].some(o => o.value === prev) ? prev : 'all';
  }
  function totals(list) {
    const r = { income: 0, expense: 0, invest: 0 };
    list.forEach(t => { r[t.type] += isWithdraw(t) ? -t.amount : t.amount; });
    return r;
  }
  function renderTransactions() {
    const q = $('#fSearch').value.trim().toLowerCase();
    const type = $('#fType').value, cat = $('#fCat').value, from = $('#fFrom').value, to = $('#fTo').value;
    const list = sortTx(state.transactions.filter(t =>
      (type === 'all' || t.type === type) &&
      (cat === 'all' || t.cat === cat) &&
      (!from || t.date >= from) && (!to || t.date <= to) &&
      (!q || (t.note || '').toLowerCase().includes(q) || catOf(t.cat).name.toLowerCase().includes(q) || String(t.amount).includes(q))
    ));
    const tot = totals(list);
    const show = k => type === 'all' || type === k;
    $('#txSummary').innerHTML = `<span class="pill">${list.length} giao dịch</span>` +
      (show('income') ? `<span class="pill income">Thu: ${money(tot.income)}</span>` : '') +
      (show('expense') ? `<span class="pill expense">Chi: ${money(tot.expense)}</span>` : '') +
      (show('invest') ? `<span class="pill invest">Đầu tư: ${money(tot.invest)}</span>` : '') +
      (type === 'all' ? `<span class="pill">Tiền mặt còn lại: <b>${money(tot.income - tot.expense - tot.invest)}</b></span>` : '');

    if (!list.length) {
      $('#txList').innerHTML = `<div class="card">${emptyState(state.transactions.length ? 'Không tìm thấy giao dịch phù hợp với bộ lọc.' : 'Chưa có giao dịch nào.', !state.transactions.length)}</div>`;
      return;
    }
    const groups = new Map();
    list.forEach(t => { if (!groups.has(t.date)) groups.set(t.date, []); groups.get(t.date).push(t); });
    const tk = keyOf(today()), yk = keyOf(addDays(today(), -1));
    let html = '';
    for (const [date, items] of groups) {
      const d = parseKey(date);
      const name = date === tk ? 'Hôm nay' : date === yk ? 'Hôm qua' : DOW[d.getDay()];
      const g = totals(items);
      html += `<div class="day-group"><div class="day-head"><span>${name}, ${dmy(d)}</span><span class="vals">
        ${g.income ? `<span class="income-text">+${money(g.income)}</span>` : ''}${g.expense ? `<span class="expense-text">−${money(g.expense)}</span>` : ''}${g.invest ? `<span class="invest-text">${g.invest > 0 ? `Đầu tư ${money(g.invest)}` : `Rút vốn +${money(-g.invest)}`}</span>` : ''}</span></div>
        <div class="card flush"><div class="tx-list">${items.map(txRow).join('')}</div></div></div>`;
    }
    $('#txList').innerHTML = html;
  }

  // ---------------- THỐNG KÊ ----------------
  let rpType = 'month', rpAnchor = today();
  function renderReports() {
    const info = periodInfo(rpType, rpAnchor);
    const prevInfo = periodInfo(rpType, shiftAnchor(rpType, rpAnchor, -1));
    const cur = sumRange(keyOf(info.start), keyOf(info.end));
    const prev = sumRange(keyOf(prevInfo.start), keyOf(prevInfo.end));
    const pn = PERIOD_NAMES[rpType];

    $('#periodLabel').textContent = info.label;
    $$('#periodTabs button').forEach(b => b.classList.toggle('active', b.dataset.period === rpType));

    const days = Math.round((info.end - info.start) / 864e5) + 1;
    const rate = cur.income ? cur.net / cur.income * 100 : 0;
    $('#rpStats').innerHTML =
      statCard('⬆️', 'ico-income', 'Tổng thu', money(cur.income), deltaInfo(cur.income, prev.income, true, pn)) +
      statCard('⬇️', 'ico-expense', 'Tổng chi', money(cur.expense), deltaInfo(cur.expense, prev.expense, false, pn)) +
      statCard('📊', 'ico-invest', 'Đầu tư (rót − rút)', money(cur.invest), deltaInfo(cur.invest, prev.invest, true, pn)) +
      statCard('💵', 'ico-primary', 'Tiền mặt còn lại', money(cur.cash), { cls: cur.cash >= 0 ? 'up-good' : 'up-bad', text: cur.income ? `Tiết kiệm & đầu tư ${rate.toFixed(1)}% thu nhập` : `${cur.count} giao dịch` }) +
      statCard('📅', 'ico-warn', days > 1 ? 'Chi trung bình / ngày' : 'Số giao dịch', days > 1 ? money(cur.expense / days) : String(cur.count), days > 1 ? { cls: 'muted', text: `${cur.count} giao dịch trong kỳ` } : null);

    $('#rpTrendTitle').textContent = info.trendTitle;
    const inc = [], exp = [], inv = [];
    info.buckets.forEach(b => { const r = sumRange(keyOf(b.start), keyOf(b.end)); inc.push(r.income); exp.push(r.expense); inv.push(r.invest); });
    drawChart('rpTrendChart', barConfig(info.buckets.map(b => b.label), inc, exp, inv));

    drawPie('rpExpPie', 'rpExpEmpty', cur.byCat, EXPENSE_CATS);
    drawPie('rpIncPie', 'rpIncEmpty', cur.byCat, INCOME_CATS);
    $('#rpExpTable').innerHTML = catTable(cur.byCat, EXPENSE_CATS, cur.expense);
    $('#rpIncTable').innerHTML = catTable(cur.byCat, INCOME_CATS, cur.income);
    drawPie('rpInvPie', 'rpInvEmpty', cur.byCat, INVEST_CATS);
    $('#rpInvTable').innerHTML = catTable(cur.byCat, INVEST_CATS, INVEST_CATS.reduce((a, c) => a + Math.max(cur.byCat[c.id] || 0, 0), 0));
  }

  // ---------------- NGÂN SÁCH ----------------
  let bAnchor = new Date(today().getFullYear(), today().getMonth(), 1);
  function renderBudgets() {
    const s = bAnchor, e = new Date(s.getFullYear(), s.getMonth() + 1, 0);
    $('#bLabel').textContent = `Tháng ${s.getMonth() + 1}/${s.getFullYear()}`;
    const r = sumRange(keyOf(s), keyOf(e));
    const totalLimit = EXPENSE_CATS.reduce((a, c) => a + (state.budgets[c.id] || 0), 0);
    const budgetedSpent = EXPENSE_CATS.reduce((a, c) => a + (state.budgets[c.id] ? (r.byCat[c.id] || 0) : 0), 0);
    const p = totalLimit ? budgetedSpent / totalLimit * 100 : 0;
    const st = budgetStatus(p);
    $('#bTotal').innerHTML = `
      <div><div class="lbl">Tổng hạn mức</div><div class="num">${money(totalLimit)}</div></div>
      <div><div class="lbl">Đã chi (có hạn mức)</div><div class="num expense-text">${money(budgetedSpent)}</div></div>
      <div><div class="lbl">Còn được chi</div><div class="num ${totalLimit - budgetedSpent < 0 ? 'expense-text' : 'income-text'}">${money(totalLimit - budgetedSpent)}</div></div>
      <div>${totalLimit ? `<div style="display:flex;justify-content:space-between" class="small"><span class="muted">Tổng chi cả tháng: <b>${money(r.expense)}</b></span><span class="badge ${st.cls}">${st.text}</span></div>
        <div class="bar thick"><i style="width:${Math.min(p, 100)}%;background:${st.color}"></i></div>` : '<span class="muted small">Nhập hạn mức ở các thẻ bên dưới để bắt đầu kiểm soát chi tiêu.</span>'}</div>`;

    $('#bList').innerHTML = EXPENSE_CATS.map(c => {
      const limit = state.budgets[c.id] || 0, spent = r.byCat[c.id] || 0;
      const pp = limit ? spent / limit * 100 : 0;
      const s2 = limit ? budgetStatus(pp) : { cls: 'none', text: 'Chưa đặt', color: cssVar('--muted') };
      return `<div class="card budget-item">
        <div class="top"><div class="tx-ico" style="background:${c.color}22">${c.icon}</div>
          <div class="t"><b>${esc(c.name)}</b>${catNote(c) ? `<span class="cat-note-text">${esc(catNote(c))}</span>` : ''}<span class="muted small">Đã chi ${money(spent)}</span></div>
          <span class="badge ${s2.cls}">${s2.text}</span></div>
        <div class="bar thick"><i style="width:${limit ? Math.min(pp, 100) : 0}%;background:${s2.color}"></i></div>
        <div class="meta"><span>${limit ? (limit - spent >= 0 ? `Còn ${money(limit - spent)}` : `Vượt ${money(spent - limit)}`) : 'Không giới hạn'}</span></div>
        <div class="limit-row"><span class="muted small" style="white-space:nowrap">Hạn mức/tháng:</span>
          <input class="input budget-input" data-cat="${c.id}" inputmode="numeric" placeholder="Không giới hạn" value="${limit ? nf.format(limit) : ''}" /></div>
      </div>`;
    }).join('');
  }

  // ---------------- DÒNG TIỀN DỰ KIẾN ----------------
  // Mỗi tháng: { in: {k: dòng}, out: {k: dòng} }, dòng = { amount, date, note, label, done, txId }
  // "Ghi vào sổ" tạo giao dịch thật theo hạng mục tương ứng và đánh dấu đã về / đã chi.
  const FC_LINES = {
    in: [
      { k: 'luong', name: 'Lương', cat: 'luong' },
      { k: 'hhban', name: 'Hoa hồng từ bán hàng (công ty)', cat: 'hoahong' },
      { k: 'hhql',  name: 'Hoa hồng quản lý (công ty)', cat: 'hoahong' },
      { k: 'hh1',   name: 'Hoa hồng khác 1', cat: 'hoahong', editable: true },
      { k: 'hh2',   name: 'Hoa hồng khác 2', cat: 'hoahong', editable: true },
      { k: 'khac',  name: 'Thu nhập khác', cat: 'thukhac' },
    ],
    out: [
      { k: 'nganhang', name: 'Trả ngân hàng', cat: 'trano' },
      { k: 'bds',      name: 'Thanh toán tiền mua BĐS', cat: 'trabds' },
      { k: 'c1',       name: 'Khoản chi khác 1', cat: 'chikhac', editable: true },
      { k: 'c2',       name: 'Khoản chi khác 2', cat: 'chikhac', editable: true },
      { k: 'c3',       name: 'Khoản chi khác 3', cat: 'chikhac', editable: true },
    ],
  };
  const monthKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  const fcHasData = f => f && ['in', 'out'].some(side => Object.values(f[side] || {}).some(l => l && (l.amount || l.note || l.label || l.date)));
  const fcMonth = key => state.forecast[key] || { in: {}, out: {} };
  const fcLine = (key, side, k) => (fcMonth(key)[side] || {})[k] || {};
  const fcName = (def, line) => line.label || def.name;
  function fcTotals(key) {
    const r = { in: 0, out: 0, inPending: 0, outPending: 0, inDone: 0, outDone: 0 };
    for (const side of ['in', 'out']) for (const def of FC_LINES[side]) {
      const l = fcLine(key, side, def.k), a = Number(l.amount) || 0;
      r[side] += a; if (l.done) r[side + 'Done'] += a; else r[side + 'Pending'] += a;
    }
    return r;
  }
  function setFcLine(key, side, k, patch) {
    const f = JSON.parse(JSON.stringify(fcMonth(key)));
    f[side] = f[side] || {};
    f[side][k] = { ...(f[side][k] || {}), ...patch };
    for (const [pk, pv] of Object.entries(f[side][k])) if (pv === '' || pv === 0 || pv === false || pv == null) delete f[side][k][pk];
    if (!Object.keys(f[side][k]).length) delete f[side][k];
    state.forecast = { ...state.forecast, [key]: f };
    if (!fcHasData(f) && !Object.values(f.in || {}).length && !Object.values(f.out || {}).length) { const n = { ...state.forecast }; delete n[key]; state.forecast = n; }
    save();
  }

  let fcAnchor = new Date(today().getFullYear(), today().getMonth() + 1, 1);
  const fcKeyNow = () => monthKey(fcAnchor);

  function fcRow(key, side, def) {
    const l = fcLine(key, side, def.k), c = catOf(def.cat);
    const doneText = side === 'in' ? 'Đã về' : 'Đã chi';
    return `<div class="fc-row ${l.done ? 'done' : ''}" data-side="${side}" data-k="${def.k}">
      <div class="fc-name">
        ${def.editable ? `<input class="input fc-label" id="fc-${side}-${def.k}-label" maxlength="60" placeholder="${esc(def.name)}" value="${esc(l.label || '')}" aria-label="Tên khoản" />` : `<b>${esc(def.name)}</b>`}
        <small class="muted">Ghi sổ vào: ${c.icon} ${esc(c.name)}</small>
      </div>
      <label class="fc-cell"><span>Số tiền (₫)</span><input class="input fc-amount" id="fc-${side}-${def.k}-amount" inputmode="numeric" placeholder="0" value="${l.amount ? nf.format(l.amount) : ''}" ${l.done ? 'disabled' : ''} /></label>
      <label class="fc-cell"><span>Ngày dự kiến</span><input type="date" class="input fc-date" id="fc-${side}-${def.k}-date" value="${esc(l.date || '')}" ${l.done ? 'disabled' : ''} /></label>
      <label class="fc-cell fc-note-cell"><span>Ghi chú</span><input class="input fc-note" id="fc-${side}-${def.k}-note" maxlength="120" placeholder="Ghi chú…" value="${esc(l.note || '')}" /></label>
      <button type="button" class="fc-status ${l.done ? 'is-done' : ''} ${side}" data-fc-status>${l.done ? `✅ ${doneText}` : '📥 Ghi vào sổ'}</button>
    </div>`;
  }
  function renderForecast() {
    const key = fcKeyNow();
    $('#fcLabel').textContent = `Tháng ${fcAnchor.getMonth() + 1}/${fcAnchor.getFullYear()}`;
    renderFcSummary();
    // Đang gõ trong bảng thì không vẽ lại các dòng để không mất chữ
    const ae = document.activeElement;
    if (ae && ae.tagName === 'INPUT' && ae.closest('.fc-row')) return;
    for (const side of ['in', 'out']) $('#fcList-' + side).innerHTML = FC_LINES[side].map(def => fcRow(key, side, def)).join('');
  }
  function renderFcSummary() {
    const key = fcKeyNow(), t = fcTotals(key);
    const all = sumRange('0000-00-00', '9999-12-31');
    const net = t.in - t.out;
    const projected = all.cash + t.inPending - t.outPending;
    $('#fcStats').innerHTML =
      statCard('📥', 'ico-income', 'Dự kiến tiền về', money(t.in), { cls: 'muted', text: `Đã về ${money(t.inDone)} • Còn chờ ${money(t.inPending)}` }) +
      statCard('📤', 'ico-expense', 'Dự kiến chi ra', money(t.out), { cls: 'muted', text: `Đã chi ${money(t.outDone)} • Còn phải chi ${money(t.outPending)}` }) +
      statCard('⚖️', 'ico-primary', 'Chênh lệch dự kiến', money(net), { cls: net >= 0 ? 'up-good' : 'up-bad', text: net >= 0 ? 'Dư tiền trong tháng' : 'Thiếu tiền, cần cân đối' }) +
      statCard('💵', 'ico-warn', 'Tiền mặt sau khi thu/chi hết', money(projected), { cls: projected >= 0 ? 'muted' : 'up-bad', text: `Tiền mặt hiện có ${money(all.cash)}` });
    const bar = (done, total, cls) => `<div class="bar thick"><i style="width:${total ? Math.min(done / total * 100, 100) : 0}%;background:var(--${cls})"></i></div>`;
    $('#fcTotal-in').innerHTML = `<span>Tổng dự kiến về</span><b class="income-text">${money(t.in)}</b>${bar(t.inDone, t.in, 'income')}`;
    $('#fcTotal-out').innerHTML = `<span>Tổng dự kiến chi</span><b class="expense-text">${money(t.out)}</b>${bar(t.outDone, t.out, 'expense')}`;
  }
  function renderDbForecast() {
    const d = new Date(today().getFullYear(), today().getMonth() + 1, 1), key = monthKey(d), t = fcTotals(key);
    const el = $('#dbForecast');
    if (!t.in && !t.out) {
      el.innerHTML = `<div class="fc-db-empty"><span>Chưa lập dòng tiền dự kiến cho tháng ${d.getMonth() + 1}/${d.getFullYear()}.</span><button class="btn btn-ghost btn-sm" data-goto="forecast">Lập kế hoạch</button></div>`;
      return;
    }
    el.innerHTML = `<div class="fc-db">
      <div><span class="muted small">Dự kiến về</span><b class="income-text">${money(t.in)}</b></div>
      <div><span class="muted small">Dự kiến chi ra</span><b class="expense-text">${money(t.out)}</b></div>
      <div><span class="muted small">Chênh lệch</span><b class="${t.in - t.out >= 0 ? 'income-text' : 'expense-text'}">${money(t.in - t.out)}</b></div>
    </div>`;
  }
  async function fcToggleDone(side, k) {
    const key = fcKeyNow(), def = FC_LINES[side].find(x => x.k === k), l = fcLine(key, side, k), c = catOf(def.cat);
    if (l.done) {
      if (!await askConfirm('Hoàn tác: xóa giao dịch đã ghi vào sổ và đánh dấu lại là chưa thực hiện?', 'Hoàn tác')) return;
      if (l.txId) state.transactions = state.transactions.filter(t => t.id !== l.txId);
      setFcLine(key, side, k, { done: false, txId: '' });
      renderCurrent(); toast('↩️ Đã hoàn tác');
      return;
    }
    if (!(l.amount > 0)) { toast('Nhập số tiền trước khi ghi vào sổ'); return; }
    const date = l.date || keyOf(today());
    if (!await askConfirm(`Ghi "${fcName(def, l)}" ${money(l.amount)} vào sổ giao dịch (${c.name}, ngày ${dmy(parseKey(date))})?`, 'Ghi vào sổ')) return;
    const tx = { id: uid(), createdAt: Date.now(), type: side === 'in' ? 'income' : 'expense', cat: def.cat, amount: l.amount, date, note: [fcName(def, l), l.note].filter(Boolean).join(' – ').slice(0, 120) };
    state.transactions.push(tx);
    setFcLine(key, side, k, { done: true, txId: tx.id, date });
    renderCurrent(); toast(`✅ Đã ghi ${side === 'in' ? 'khoản thu' : 'khoản chi'} ${money(l.amount)} vào sổ`);
  }
  async function fcCopyPrev() {
    const key = fcKeyNow(), prevD = new Date(fcAnchor.getFullYear(), fcAnchor.getMonth() - 1, 1), prev = fcMonth(monthKey(prevD));
    if (!fcHasData(prev)) { toast(`Tháng ${prevD.getMonth() + 1} chưa có kế hoạch để sao chép`); return; }
    if (fcHasData(fcMonth(key)) && !await askConfirm('Thay kế hoạch tháng này bằng bản sao của tháng trước?', 'Sao chép')) return;
    const shift = ds => { if (!ds) return ''; const d = parseKey(ds); const last = new Date(fcAnchor.getFullYear(), fcAnchor.getMonth() + 1, 0).getDate(); return keyOf(new Date(fcAnchor.getFullYear(), fcAnchor.getMonth(), Math.min(d.getDate(), last))); };
    const f = { in: {}, out: {} };
    for (const side of ['in', 'out']) for (const [k, l] of Object.entries(prev[side] || {})) {
      const n = { amount: l.amount, date: shift(l.date), note: l.note, label: l.label };
      Object.keys(n).forEach(x => { if (!n[x]) delete n[x]; });
      if (Object.keys(n).length) f[side][k] = n;
    }
    state.forecast = { ...state.forecast, [key]: f };
    save(); renderForecast(); toast(`📋 Đã sao chép kế hoạch tháng ${prevD.getMonth() + 1}`);
  }
  function bindForecast() {
    const view = $('#view-forecast');
    $('#fcPrev').addEventListener('click', () => { fcAnchor = new Date(fcAnchor.getFullYear(), fcAnchor.getMonth() - 1, 1); renderForecast(); });
    $('#fcNext').addEventListener('click', () => { fcAnchor = new Date(fcAnchor.getFullYear(), fcAnchor.getMonth() + 1, 1); renderForecast(); });
    $('#fcCopy').addEventListener('click', fcCopyPrev);
    view.addEventListener('input', e => {
      if (e.target.classList.contains('fc-amount')) { const v = parseAmount(e.target.value); e.target.value = v ? nf.format(v) : ''; }
    });
    view.addEventListener('change', e => {
      const row = e.target.closest('.fc-row'); if (!row) return;
      const { side, k } = row.dataset, cls = e.target.classList;
      const patch = cls.contains('fc-amount') ? { amount: parseAmount(e.target.value) }
        : cls.contains('fc-date') ? { date: e.target.value }
        : cls.contains('fc-note') ? { note: e.target.value.trim() }
        : cls.contains('fc-label') ? { label: e.target.value.trim() } : null;
      if (!patch) return;
      setFcLine(fcKeyNow(), side, k, patch);
      renderFcSummary();
    });
    view.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.closest('.fc-row') && e.target.tagName === 'INPUT') e.target.blur(); });
    view.addEventListener('click', e => {
      const b = e.target.closest('[data-fc-status]'); if (!b) return;
      const row = b.closest('.fc-row'); fcToggleDone(row.dataset.side, row.dataset.k);
    });
  }

  // ---------------- CÀI ĐẶT ----------------
  function renderSettings() {
    xSummary();
    // Đang gõ ghi chú thì không vẽ lại để không mất chữ
    if (document.activeElement && document.activeElement.classList.contains('cat-note-input')) return;
    const rows = cats => cats.map(c => `<label class="cat-note" for="note-${c.id}">
      <span class="cat-note-ico" style="background:${c.color}22">${c.icon}</span>
      <span class="cat-note-body"><b>${esc(c.name)}</b>
      <input class="input cat-note-input" id="note-${c.id}" data-cat="${c.id}" maxlength="200" placeholder="Thêm ghi chú…" value="${esc(catNote(c))}" /></span></label>`).join('');
    $('#incomeCatList').innerHTML = rows(INCOME_CATS);
    $('#expenseCatList').innerHTML = rows(EXPENSE_CATS);
    $('#investCatList').innerHTML = rows(INVEST_CATS);
    $('#incomeCatTitle').textContent = `${INCOME_CATS.length} khoản thu nhập`;
    $('#expenseCatTitle').textContent = `${EXPENSE_CATS.length} khoản chi tiêu`;
    $('#investCatTitle').textContent = `${INVEST_CATS.length} khoản đầu tư`;
  }
  async function download(name, content, mime) {
    const dl = window.claude && typeof window.claude.use === 'function' ? await window.claude.use('downloads') : null;
    if (dl) {
      try { await dl.save({ filename: name, data: content }); toast('✅ Đã lưu file ' + name); }
      catch (err) { if (!err || err.code !== 'declined') toast('⚠️ Không tải được file ở chế độ xem này'); }
      return;
    }
    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  // ---------------- XUẤT EXCEL (.xlsx) ----------------
  // Dùng SheetJS (biến toàn cục XLSX). Ngày ghi dạng ngày thật của Excel, tiền dạng số có định dạng #,##0,
  // dòng tổng dùng công thức SUM để sửa số trong Excel vẫn tự cộng lại.
  const XL_SHEETS = [
    { id: 'overview', name: 'Tổng quan' },
    { id: 'tx',       name: 'Giao dịch' },
    { id: 'cat',      name: 'Theo hạng mục' },
    { id: 'month',    name: 'Theo tháng' },
    { id: 'budget',   name: 'Ngân sách' },
    { id: 'forecast', name: 'Dòng tiền dự kiến' },
  ];
  const MONEY_FMT = '#,##0';
  const xm = v => ({ t: 'n', v: Math.round(v || 0), z: MONEY_FMT });
  const xpct = v => ({ t: 'n', v: v || 0, z: '0.0%' });
  const xdate = key => { const [y, mo, d] = key.split('-').map(Number); return { t: 'n', v: (Date.UTC(y, mo - 1, d) - Date.UTC(1899, 11, 30)) / 864e5, z: 'dd/mm/yyyy' }; };
  const xsum = (col, r1, r2, v) => (r2 >= r1 ? { t: 'n', v: Math.round(v || 0), f: `SUM(${col}${r1}:${col}${r2})`, z: MONEY_FMT } : xm(0));
  const colL = c => String.fromCharCode(65 + c);
  function xSheet(rows, widths, filter) {
    const ws = {}; let maxC = 0;
    rows.forEach((row, r) => row.forEach((val, c) => {
      if (val === null || val === undefined || val === '') return;
      const cell = typeof val === 'object' ? { ...val } : { t: typeof val === 'number' ? 'n' : 's', v: val };
      ws[XLSX.utils.encode_cell({ r, c })] = cell; maxC = Math.max(maxC, c);
    }));
    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: Math.max(rows.length - 1, 0), c: maxC } });
    if (widths) ws['!cols'] = widths.map(w => ({ wch: w }));
    if (filter) ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: filter[0], c: 0 }, e: { r: filter[1], c: maxC } }) };
    return ws;
  }
  const monthsBetween = (fromKey, toKey) => {
    const out = []; let d = new Date(+fromKey.slice(0, 4), +fromKey.slice(5, 7) - 1, 1);
    const end = new Date(+toKey.slice(0, 4), +toKey.slice(5, 7) - 1, 1);
    while (d <= end && out.length < 600) { out.push(monthKey(d)); d = new Date(d.getFullYear(), d.getMonth() + 1, 1); }
    return out;
  };
  const monthRange = mk => { const [y, mo] = mk.split('-').map(Number); return [keyOf(new Date(y, mo - 1, 1)), keyOf(new Date(y, mo, 0))]; };
  const mLabel = mk => `Tháng ${+mk.slice(5)}/${mk.slice(0, 4)}`;

  function xRange() {
    const v = $('#xRange').value, t = today(), y = t.getFullYear(), m = t.getMonth(), q = Math.floor(m / 3);
    const span = (a, b) => [keyOf(a), keyOf(b)];
    if (v === 'thisMonth') return span(new Date(y, m, 1), new Date(y, m + 1, 0));
    if (v === 'lastMonth') return span(new Date(y, m - 1, 1), new Date(y, m, 0));
    if (v === 'thisQuarter') return span(new Date(y, q * 3, 1), new Date(y, q * 3 + 3, 0));
    if (v === 'thisYear') return span(new Date(y, 0, 1), new Date(y, 11, 31));
    if (v === 'lastYear') return span(new Date(y - 1, 0, 1), new Date(y - 1, 11, 31));
    if (v === 'custom') {
      const f = $('#xFrom').value, to = $('#xTo').value;
      return f && to ? (f <= to ? [f, to] : [to, f]) : null;
    }
    const dates = state.transactions.map(x => x.date).sort();
    const fcm = Object.keys(state.forecast || {}).sort();
    const lo = [dates[0], fcm[0] && fcm[0] + '-01', keyOf(t)].filter(Boolean).sort()[0];
    const hi = [dates[dates.length - 1], fcm.length && monthRange(fcm[fcm.length - 1])[1], keyOf(t)].filter(Boolean).sort().pop();
    return [lo, hi];
  }
  function xSummary() {
    const el = $('#xSummary'); if (!el) return;
    $('#xCustom').classList.toggle('hidden', $('#xRange').value !== 'custom');
    const r = xRange();
    if (!r) { el.textContent = 'Chọn ngày bắt đầu và ngày kết thúc.'; return; }
    const n = state.transactions.filter(x => x.date >= r[0] && x.date <= r[1]).length;
    el.textContent = `Sẽ xuất ${n} giao dịch từ ${dmy(parseKey(r[0]))} đến ${dmy(parseKey(r[1]))}.`;
  }

  function buildWorkbook(fromKey, toKey, sheetIds) {
    const wb = XLSX.utils.book_new();
    wb.Props = { Title: 'Sổ Thu Chi', CreatedDate: new Date() };
    const txs = state.transactions.filter(x => x.date >= fromKey && x.date <= toKey).slice()
      .sort((a, b) => a.date.localeCompare(b.date) || (a.createdAt || 0) - (b.createdAt || 0));
    const r = sumRange(fromKey, toKey);
    const months = monthsBetween(fromKey, toKey);
    const period = `${dmy(parseKey(fromKey))} – ${dmy(parseKey(toKey))}`;
    const add = (id, ws) => XLSX.utils.book_append_sheet(wb, ws, XL_SHEETS.find(x => x.id === id).name);

    if (sheetIds.includes('overview')) {
      const acc = sumRange('0000-00-00', toKey);
      add('overview', xSheet([
        ['SỔ THU CHI – BÁO CÁO TÀI CHÍNH CÁ NHÂN'],
        ['Khoảng thời gian', period],
        ['Ngày xuất', xdate(keyOf(today()))],
        [],
        ['TRONG KỲ', 'Số tiền (₫)'],
        ['Tổng thu nhập', xm(r.income)],
        ['Tổng chi tiêu', xm(r.expense)],
        ['Đầu tư (rót vốn − rút vốn)', xm(r.invest)],
        ['Chênh lệch thu − chi', { t: 'n', v: r.net, f: 'B6-B7', z: MONEY_FMT }],
        ['Tiền mặt còn lại (thu − chi − đầu tư)', { t: 'n', v: r.cash, f: 'B6-B7-B8', z: MONEY_FMT }],
        ['Tỷ lệ tiết kiệm & đầu tư', { t: 'n', v: r.income ? r.net / r.income : 0, f: 'IF(B6=0,0,B9/B6)', z: '0.0%' }],
        ['Số giao dịch', r.count],
        [],
        [`LŨY KẾ ĐẾN ${dmy(parseKey(toKey))}`, 'Số tiền (₫)'],
        ['Tổng tài sản tích lũy (thu − chi)', xm(acc.net)],
        ['Tiền mặt', xm(acc.cash)],
        ['Đang đầu tư', xm(acc.invest)],
      ], [40, 22]));
    }

    if (sheetIds.includes('tx')) {
      const rows = [['Ngày', 'Loại', 'Hạng mục', 'Thu nhập (₫)', 'Chi tiêu (₫)', 'Đầu tư (₫) (+rót / −rút)', 'Ghi chú']];
      for (const x of txs) {
        const c = catOf(x.cat), type = TYPE_NAMES[x.type] + (x.type === 'invest' ? (x.dir === 'out' ? ' – Rút vốn' : ' – Rót vốn') : '');
        rows.push([xdate(x.date), type, c.name, x.type === 'income' ? xm(x.amount) : '', x.type === 'expense' ? xm(x.amount) : '',
          x.type === 'invest' ? xm(isWithdraw(x) ? -x.amount : x.amount) : '', x.note || '']);
      }
      const last = rows.length;
      rows.push(['TỔNG CỘNG', `${txs.length} giao dịch`, '', xsum('D', 2, last, r.income), xsum('E', 2, last, r.expense), xsum('F', 2, last, r.invest), '']);
      add('tx', xSheet(rows, [12, 20, 34, 16, 16, 22, 44], [0, last - 1]));
    }

    if (sheetIds.includes('cat')) {
      const rows = [['Loại', 'Hạng mục', 'Số tiền (₫)', 'Tỷ trọng', 'Số giao dịch', 'Ghi chú hạng mục']];
      const counts = {}; txs.forEach(x => { counts[x.cat] = (counts[x.cat] || 0) + 1; });
      for (const [type, cats] of Object.entries(CATS_BY_TYPE)) {
        const total = r[type];
        const start = rows.length + 1;
        cats.map(c => ({ c, v: r.byCat[c.id] || 0 })).sort((a, b) => b.v - a.v).forEach(({ c, v }) => {
          rows.push([TYPE_NAMES[type], c.name, xm(v), xpct(total ? v / total : 0), counts[c.id] || 0, catNote(c)]);
        });
        rows.push([`Tổng ${TYPE_NAMES[type].toLowerCase()}`, '', xsum('C', start, rows.length, total), '', '', '']);
        rows.push([]);
      }
      add('cat', xSheet(rows, [12, 36, 18, 10, 13, 44]));
    }

    if (sheetIds.includes('month')) {
      const rows = [['Tháng', 'Thu nhập (₫)', 'Chi tiêu (₫)', 'Đầu tư (₫)', 'Chênh lệch thu − chi (₫)', 'Tiền mặt còn lại (₫)', 'Tỷ lệ tiết kiệm']];
      months.forEach((mk, i) => {
        const [a, b] = monthRange(mk), x = sumRange(a < fromKey ? fromKey : a, b > toKey ? toKey : b), row = i + 2;
        rows.push([mLabel(mk), xm(x.income), xm(x.expense), xm(x.invest),
          { t: 'n', v: x.net, f: `B${row}-C${row}`, z: MONEY_FMT }, { t: 'n', v: x.cash, f: `B${row}-C${row}-D${row}`, z: MONEY_FMT },
          { t: 'n', v: x.income ? x.net / x.income : 0, f: `IF(B${row}=0,0,E${row}/B${row})`, z: '0.0%' }]);
      });
      const last = rows.length, n = last + 1;
      rows.push(['TỔNG CỘNG', xsum('B', 2, last, r.income), xsum('C', 2, last, r.expense), xsum('D', 2, last, r.invest),
        xsum('E', 2, last, r.net), xsum('F', 2, last, r.cash), { t: 'n', v: r.income ? r.net / r.income : 0, f: `IF(B${n}=0,0,E${n}/B${n})`, z: '0.0%' }]);
      add('month', xSheet(rows, [16, 16, 16, 16, 22, 20, 15]));
    }

    if (sheetIds.includes('budget')) {
      const rows = [['Tháng', 'Hạng mục', 'Hạn mức (₫)', 'Đã chi (₫)', 'Còn lại (₫)', '% đã dùng', 'Trạng thái']];
      const limited = EXPENSE_CATS.filter(c => state.budgets[c.id] > 0);
      if (!limited.length) rows.push(['Chưa đặt hạn mức chi tiêu cho hạng mục nào.']);
      for (const mk of months) {
        const [a, b] = monthRange(mk);
        if (a > keyOf(today())) continue; // tháng chưa tới thì chưa có gì để so với hạn mức
        const x = sumRange(a, b);
        for (const c of limited) {
          const lim = state.budgets[c.id], sp = x.byCat[c.id] || 0, p = sp / lim, row = rows.length + 1;
          rows.push([mLabel(mk), c.name, xm(lim), xm(sp), { t: 'n', v: lim - sp, f: `C${row}-D${row}`, z: MONEY_FMT },
            { t: 'n', v: p, f: `IF(C${row}=0,0,D${row}/C${row})`, z: '0%' }, p > 1 ? 'Vượt hạn mức' : p >= .8 ? 'Sắp hết' : 'Trong hạn mức']);
        }
      }
      add('budget', xSheet(rows, [16, 36, 16, 16, 16, 11, 16], limited.length ? [0, rows.length - 1] : null));
    }

    if (sheetIds.includes('forecast')) {
      const rows = [['Tháng', 'Loại', 'Khoản', 'Số tiền (₫)', 'Ngày dự kiến', 'Ghi chú', 'Trạng thái']];
      const fm = new Set(months.filter(mk => state.forecast[mk]));
      const tk = keyOf(today());
      if (tk >= fromKey && tk <= toKey) { const nx = monthKey(new Date(today().getFullYear(), today().getMonth() + 1, 1)); if (state.forecast[nx]) fm.add(nx); }
      if (!fm.size) rows.push(['Chưa có kế hoạch dòng tiền cho các tháng trong khoảng này.']);
      for (const mk of [...fm].sort()) {
        const t = fcTotals(mk), first = {};
        for (const side of ['in', 'out']) {
          first[side] = rows.length + 1;
          for (const def of FC_LINES[side]) {
            const l = fcLine(mk, side, def.k);
            if (!l.amount && !l.note && !l.label && !l.date) continue;
            rows.push([mLabel(mk), side === 'in' ? 'Dự kiến về' : 'Dự kiến chi', fcName(def, l), xm(l.amount || 0), l.date ? xdate(l.date) : '', l.note || '',
              l.done ? (side === 'in' ? 'Đã về' : 'Đã chi') : 'Chưa thực hiện']);
          }
          first[side + 'End'] = rows.length;
        }
        const ri = rows.length + 1;
        rows.push([mLabel(mk), 'Tổng dự kiến về', '', xsum('D', first.in, first.inEnd, t.in)]);
        rows.push([mLabel(mk), 'Tổng dự kiến chi', '', xsum('D', first.out, first.outEnd, t.out)]);
        rows.push([mLabel(mk), 'Chênh lệch', '', { t: 'n', v: t.in - t.out, f: `D${ri}-D${ri + 1}`, z: MONEY_FMT }]);
        rows.push([]);
      }
      add('forecast', xSheet(rows, [16, 18, 36, 16, 14, 40, 16]));
    }
    return wb;
  }
  async function exportExcel(fromKey, toKey, sheetIds) {
    if (typeof XLSX === 'undefined') { toast('⚠️ Chưa tải được thư viện Excel, hãy kiểm tra mạng rồi thử lại'); return; }
    if (!sheetIds.length) { toast('Chọn ít nhất một sheet để xuất'); return; }
    const wb = buildWorkbook(fromKey, toKey, sheetIds);
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array', compression: true });
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    await download(`so-thu-chi_${fromKey}_${toKey}.xlsx`, blob, blob.type);
  }

  // ---------------- DỮ LIỆU MẪU ----------------
  function sampleData() {
    const out = [], t = today();
    const rnd = (a, b) => Math.round((a + Math.random() * (b - a)) / 1000) * 1000;
    const push = (type, cat, amount, d, note, dir) => out.push({ id: uid(), type, cat, amount, date: keyOf(d), note, createdAt: Date.now(), ...(type === 'invest' ? { dir: dir || 'in' } : {}) });
    const notesFood = ['Ăn sáng', 'Cơm trưa văn phòng', 'Cà phê', 'Đi chợ', 'Ăn tối cùng gia đình', 'Trà sữa'];
    for (let mo = 11; mo >= 0; mo--) {
      const base = new Date(t.getFullYear(), t.getMonth() - mo, 1);
      const last = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
      const maxDay = mo === 0 ? t.getDate() : last;
      const d = n => new Date(base.getFullYear(), base.getMonth(), Math.min(n, maxDay));
      if (maxDay >= 5) push('income', 'luong', rnd(25e6, 28e6), d(5), 'Lương tháng ' + (base.getMonth() + 1));
      if (Math.random() < .5) push('income', 'freelance', rnd(2e6, 6e6), d(15 + Math.floor(Math.random() * 10)), 'Dự án làm thêm');
      if (Math.random() < .35) push('income', 'dautu', rnd(5e5, 3e6), d(20), 'Cổ tức');
      push('income', 'laitietkiem', rnd(3e5, 6e5), d(1), 'Lãi sổ tiết kiệm');
      if (base.getMonth() === 0 || base.getMonth() === 1) push('income', 'quatang', rnd(2e6, 5e6), d(10), 'Lì xì Tết');
      if (base.getMonth() === 11 || base.getMonth() === 5) push('income', 'thuong', rnd(5e6, 15e6), d(25), 'Thưởng');
      if (maxDay >= 6) {
        push('invest', 'chungkhoan', rnd(2e6, 4e6), d(6), 'Mua cổ phiếu định kỳ');
        push('invest', 'quy', 1e6, d(6), 'Mua BTC định kỳ');
      }
      if (base.getMonth() % 3 === 0) push('invest', 'guitietkiem', 5e6, d(7), 'Mở sổ tiết kiệm 6 tháng');
      if (Math.random() < .3) push('invest', 'vang', rnd(3e6, 8e6), d(18), 'Mua vàng nhẫn');
      if (Math.random() < .15) push('invest', 'chungkhoan', rnd(2e6, 5e6), d(22), 'Chốt lời một phần', 'out');
      if (mo === 8) push('invest', 'batdongsan', 30e6, d(3), 'Góp vốn mua đất');
      push('expense', 'nhao', 5e6, d(2), 'Tiền thuê nhà');
      push('expense', 'nhao', rnd(6e5, 1.1e6), d(8), 'Điện nước tháng');
      push('expense', 'bome', 2e6, d(5), 'Gửi bố mẹ');
      push('expense', 'vienthong', rnd(2.5e5, 3.5e5), d(10), 'Cước điện thoại');
      push('expense', 'phixe', rnd(1.2e6, 2e6), d(11), 'Gửi xe tháng + phí đường bộ');
      push('expense', 'phanmem', rnd(2e5, 5e5), d(12), 'Thuê bao phần mềm');
      push('expense', 'thuetncn', rnd(8e5, 1.2e6), d(5), 'Thuế TNCN khấu trừ');
      if (base.getMonth() % 3 === 1) push('expense', 'trabds', 10e6, d(20), 'Thanh toán đợt mua căn hộ');
      push('expense', 'baohiem', 6e5, d(12), 'Bảo hiểm sức khỏe');
      push('expense', 'trano', 2e6, d(15), 'Trả gốc + lãi vay');
      for (let day = 1; day <= maxDay; day++) {
        if (Math.random() < .85) push('expense', 'anuong', rnd(4e4, 2.5e5), d(day), notesFood[Math.floor(Math.random() * notesFood.length)]);
        if (Math.random() < .12) push('expense', 'dilai', rnd(3e5, 8e5), d(day), 'Đổ xăng ô tô');
        if (Math.random() < .08) push('expense', 'muasam', rnd(2e5, 1.5e6), d(day), 'Mua sắm cá nhân');
        if (Math.random() < .05) push('expense', 'muachocon', rnd(1.5e5, 8e5), d(day), 'Quần áo / đồ chơi cho con');
        if (Math.random() < .07) push('expense', 'tmdt', rnd(1e5, 7e5), d(day), 'Đơn hàng Shopee');
        if (Math.random() < .06) push('expense', 'tiepkhach', rnd(5e5, 2e6), d(day), 'Tiếp khách hàng');
        if (Math.random() < .06) push('expense', 'giaitri', rnd(1.5e5, 8e5), d(day), 'Xem phim / đi chơi');
        if (Math.random() < .04) push('expense', 'yte', rnd(1e5, 5e5), d(day), 'Thuốc');
        if (Math.random() < .04) push('expense', 'hieuhi', rnd(3e5, 1e6), d(day), 'Quà biếu khách hàng');
        if (Math.random() < .05) push('expense', 'lamdep', rnd(1e5, 4e5), d(day), 'Cầu lông / Gym');
        if (Math.random() < .07) push('expense', 'vesinh', rnd(5e4, 2e5), d(day), 'Cắt tóc / gội đầu');
        if (Math.random() < .03) push('expense', 'giaoduc', rnd(2e5, 1.5e6), d(day), 'Sách / khóa học');
        if (Math.random() < .04) push('expense', 'concai', rnd(1e5, 6e5), d(day), 'Chi tiêu gia đình');
        if (Math.random() < .02) push('expense', 'chikhac', rnd(5e4, 3e5), d(day), 'Linh tinh');
      }
    }
    return out;
  }

  // ---------------- MODAL GIAO DỊCH ----------------
  let editingId = null, mType = 'expense', mCat = null, mDir = 'in';
  const QUICK = [20000, 50000, 100000, 200000, 500000, 1000000, 5000000];
  function openModal(tx) {
    editingId = tx ? tx.id : null;
    mType = tx ? tx.type : 'expense';
    mCat = tx ? tx.cat : null;
    mDir = tx && tx.dir === 'out' ? 'out' : 'in';
    $('#txModalTitle').textContent = tx ? 'Sửa giao dịch' : 'Thêm giao dịch';
    $('#txAmount').value = tx ? nf.format(tx.amount) : '';
    $('#txDate').value = tx ? tx.date : keyOf(today());
    $('#txNote').value = tx ? tx.note || '' : '';
    $('#txDelete').classList.toggle('hidden', !tx);
    renderModalType();
    $('#txModal').classList.remove('hidden');
    setTimeout(() => $('#txAmount').focus(), 50);
  }
  function closeModal() { $('#txModal').classList.add('hidden'); }
  function renderModalType() {
    $$('#typeToggle button').forEach(b => b.classList.toggle('active', b.dataset.type === mType));
    $('#dirToggle').classList.toggle('hidden', mType !== 'invest');
    $$('#dirToggle button').forEach(b => b.classList.toggle('active', b.dataset.dir === mDir));
    const cats = CATS_BY_TYPE[mType];
    if (!cats.some(c => c.id === mCat)) mCat = cats[0].id;
    $('#catGrid').innerHTML = cats.map(c => `<button type="button" class="cat-btn ${c.id === mCat ? 'active' : ''}" data-cat="${c.id}" title="${esc(catNote(c) || c.name)}"><span class="e">${c.icon}</span>${esc(c.name)}</button>`).join('');
    const sel = catOf(mCat);
    $('#catHint').textContent = catNote(sel) ? `📝 ${sel.name}: ${catNote(sel)}` : '';
  }
  function saveTx(e) {
    e.preventDefault();
    const amount = parseAmount($('#txAmount').value);
    const date = $('#txDate').value;
    if (amount <= 0) { toast('Vui lòng nhập số tiền lớn hơn 0'); $('#txAmount').focus(); return; }
    if (!date) { toast('Vui lòng chọn ngày'); return; }
    const data = { type: mType, cat: mCat, amount, date, note: $('#txNote').value.trim() };
    if (mType === 'invest') data.dir = mDir;
    if (editingId) {
      const t = state.transactions.find(x => x.id === editingId);
      delete t.dir;
      Object.assign(t, data);
      toast('✅ Đã cập nhật giao dịch');
    } else {
      state.transactions.push({ id: uid(), createdAt: Date.now(), ...data });
      toast(`✅ Đã thêm ${{ income: 'khoản thu', expense: 'khoản chi', invest: mDir === 'out' ? 'khoản rút vốn' : 'khoản đầu tư' }[mType]} ${money(amount)}`);
    }
    save(); closeModal(); renderCurrent();
    if (mType === 'expense') checkBudgetAfterSave(data);
  }
  function checkBudgetAfterSave(t) {
    const limit = state.budgets[t.cat];
    if (!limit) return;
    const d = parseKey(t.date);
    const spent = sumRange(keyOf(new Date(d.getFullYear(), d.getMonth(), 1)), keyOf(new Date(d.getFullYear(), d.getMonth() + 1, 0))).byCat[t.cat] || 0;
    const p = spent / limit * 100;
    if (p > 100) setTimeout(() => toast(`⚠️ ${catOf(t.cat).name}: đã vượt hạn mức ${money(spent - limit)}!`), 2500);
    else if (p >= 80) setTimeout(() => toast(`🔔 ${catOf(t.cat).name}: đã dùng ${p.toFixed(0)}% hạn mức tháng`), 2500);
  }
  function askConfirm(message, okLabel = 'Đồng ý') {
    return new Promise(resolve => {
      const box = $('#confirmModal');
      $('#confirmText').textContent = message;
      $('#confirmOk').textContent = okLabel;
      box.classList.remove('hidden');
      const done = v => { box.classList.add('hidden'); $('#confirmOk').onclick = $('#confirmCancel').onclick = null; resolve(v); };
      $('#confirmOk').onclick = () => done(true);
      $('#confirmCancel').onclick = () => done(false);
      $('#confirmOk').focus();
    });
  }
  async function deleteTx(id) {
    const t = state.transactions.find(x => x.id === id);
    if (!t) return;
    if (!await askConfirm(`Xóa giao dịch "${catOf(t.cat).name}" ${money(t.amount)}?`, 'Xóa')) return;
    state.transactions = state.transactions.filter(x => x.id !== id);
    save(); closeModal(); renderCurrent(); toast('🗑️ Đã xóa giao dịch');
  }

  // ---------------- GIAO DIỆN SÁNG/TỐI ----------------
  // Chưa chọn thì theo hệ thống (hoặc theo giao diện của trang chứa nếu có data-theme)
  const isDark = () => {
    const a = document.documentElement.dataset.theme;
    return a ? a === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  };
  function applyTheme() {
    if (themePref) document.documentElement.dataset.theme = themePref;
    $('#themeToggle').textContent = isDark() ? '☀️' : '🌙';
  }

  // ---------------- SỰ KIỆN ----------------
  function bind() {
    document.addEventListener('click', e => {
      const el = e.target.closest('[data-view],[data-goto],[data-action],[data-del],.tx,[data-close],[data-period]');
      if (!el) return;
      if (el.dataset.del) { e.stopPropagation(); deleteTx(el.dataset.del); return; }
      if (el.dataset.view) return showView(el.dataset.view);
      if (el.dataset.goto) return showView(el.dataset.goto);
      if (el.dataset.action === 'add') return openModal(null);
      if (el.dataset.action === 'sample') return loadSample();
      if (el.hasAttribute('data-close')) return closeModal();
      if (el.dataset.period) { rpType = el.dataset.period; return renderReports(); }
      if (el.classList.contains('tx')) { const t = state.transactions.find(x => x.id === el.dataset.id); if (t) openModal(t); }
    });

    $('#txModal').addEventListener('mousedown', e => { if (e.target.id === 'txModal') closeModal(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal();
      if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName) && $('#txModal').classList.contains('hidden')) {
        e.preventDefault(); openModal(null);
      }
    });
    $('#typeToggle').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { mType = b.dataset.type; renderModalType(); } });
    $('#dirToggle').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { mDir = b.dataset.dir; renderModalType(); } });
    $('#catGrid').addEventListener('click', e => { const b = e.target.closest('.cat-btn'); if (b) { mCat = b.dataset.cat; renderModalType(); } });
    $('#txAmount').addEventListener('input', e => { const v = parseAmount(e.target.value); e.target.value = v ? nf.format(v) : ''; });
    $('#quickAmounts').innerHTML = QUICK.map(v => `<button type="button" data-q="${v}">${shortMoney(v)}</button>`).join('');
    $('#quickAmounts').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      $('#txAmount').value = nf.format(parseAmount($('#txAmount').value) + Number(b.dataset.q));
    });
    $('#txForm').addEventListener('submit', saveTx);
    $('#txDelete').addEventListener('click', () => deleteTx(editingId));

    // Bộ lọc giao dịch
    ['#fSearch', '#fCat', '#fFrom', '#fTo'].forEach(s => $(s).addEventListener('input', renderTransactions));
    $('#fType').addEventListener('change', () => { fillCatFilter(); renderTransactions(); });
    $('#fReset').addEventListener('click', () => {
      $('#fSearch').value = ''; $('#fType').value = 'all'; $('#fFrom').value = ''; $('#fTo').value = '';
      fillCatFilter(); $('#fCat').value = 'all'; renderTransactions();
    });

    // Thống kê
    $('#prevPeriod').addEventListener('click', () => { rpAnchor = shiftAnchor(rpType, rpAnchor, -1); renderReports(); });
    $('#nextPeriod').addEventListener('click', () => { rpAnchor = shiftAnchor(rpType, rpAnchor, 1); renderReports(); });
    $('#currentPeriod').addEventListener('click', () => { rpAnchor = today(); renderReports(); });

    // Ngân sách
    $('#bPrev').addEventListener('click', () => { bAnchor = new Date(bAnchor.getFullYear(), bAnchor.getMonth() - 1, 1); renderBudgets(); });
    $('#bNext').addEventListener('click', () => { bAnchor = new Date(bAnchor.getFullYear(), bAnchor.getMonth() + 1, 1); renderBudgets(); });
    $('#bList').addEventListener('input', e => {
      if (!e.target.classList.contains('budget-input')) return;
      const v = parseAmount(e.target.value); e.target.value = v ? nf.format(v) : '';
    });
    $('#bList').addEventListener('change', e => {
      if (!e.target.classList.contains('budget-input')) return;
      const v = parseAmount(e.target.value);
      if (v) state.budgets[e.target.dataset.cat] = v; else delete state.budgets[e.target.dataset.cat];
      save(); renderBudgets(); toast('💾 Đã lưu hạn mức ' + catOf(e.target.dataset.cat).name);
    });

    // Cài đặt
    $('#themeToggle').addEventListener('click', () => {
      themePref = isDark() ? 'light' : 'dark';
      try { localStorage.setItem(THEME_KEY, themePref); } catch (e) { /* bỏ qua */ }
      applyTheme(); renderCurrent();
    });
    $('#exportJson').addEventListener('click', () => download(`so-thu-chi-backup-${keyOf(today())}.json`, JSON.stringify({ transactions: state.transactions, budgets: state.budgets, catNotes: state.catNotes, forecast: state.forecast }, null, 2), 'application/json'));
    $('#xSheets').innerHTML = XL_SHEETS.map(x => `<label class="x-check"><input type="checkbox" id="x-sheet-${x.id}" value="${x.id}" checked /> ${x.name}</label>`).join('');
    ['#xRange', '#xFrom', '#xTo'].forEach(id => $(id).addEventListener('change', xSummary));
    $('#exportXlsx').addEventListener('click', () => {
      const r = xRange(); if (!r) { toast('Chọn ngày bắt đầu và ngày kết thúc'); return; }
      exportExcel(r[0], r[1], $$('#xSheets input:checked').map(i => i.value));
    });
    $('#rpExcel').addEventListener('click', () => {
      const info = periodInfo(rpType, rpAnchor);
      exportExcel(keyOf(info.start), keyOf(info.end), XL_SHEETS.map(x => x.id));
    });
    $('#importJson').addEventListener('change', e => {
      const f = e.target.files[0]; if (!f) return;
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const d = JSON.parse(reader.result);
          if (!Array.isArray(d.transactions)) throw new Error();
          const valid = d.transactions.map(t => (t ? migrateTx(t) : t)).filter(t => t && CATS_BY_TYPE[t.type] && CATS_BY_TYPE[t.type].some(c => c.id === t.cat) && /^\d{4}-\d{2}-\d{2}$/.test(t.date) && Number(t.amount) > 0)
            .map(t => ({ id: String(t.id || uid()), type: t.type, cat: t.cat, amount: Number(t.amount), date: t.date, note: String(t.note || '').slice(0, 120), createdAt: Number(t.createdAt) || Date.now(), ...(t.type === 'invest' ? { dir: t.dir === 'out' ? 'out' : 'in' } : {}) }));
          e.target.value = '';
          if (!await askConfirm(`Khôi phục ${valid.length} giao dịch? Dữ liệu hiện tại sẽ bị thay thế.`, 'Khôi phục')) return;
          state.transactions = valid;
          state.budgets = d.budgets && typeof d.budgets === 'object' ? Object.fromEntries(Object.entries(d.budgets).filter(([k, v]) => CAT_MAP[k] && Number(v) > 0).map(([k, v]) => [k, Number(v)])) : {};
          if (d.catNotes && typeof d.catNotes === 'object') state.catNotes = Object.fromEntries(Object.entries(d.catNotes).filter(([k, v]) => CAT_MAP[k] && typeof v === 'string').map(([k, v]) => [k, v.slice(0, 200)]));
          state.forecast = {};
          if (d.forecast && typeof d.forecast === 'object') for (const [k, f] of Object.entries(d.forecast)) {
            if (!/^\d{4}-\d{2}$/.test(k) || !f || typeof f !== 'object') continue;
            const clean = { in: {}, out: {} };
            for (const side of ['in', 'out']) for (const def of FC_LINES[side]) {
              const l = f[side] && f[side][def.k]; if (!l || typeof l !== 'object') continue;
              const n = { amount: Number(l.amount) > 0 ? Number(l.amount) : 0, date: /^\d{4}-\d{2}-\d{2}$/.test(l.date) ? l.date : '', note: String(l.note || '').slice(0, 120), label: String(l.label || '').slice(0, 60), done: !!l.done, txId: String(l.txId || '') };
              Object.keys(n).forEach(x => { if (!n[x]) delete n[x]; });
              if (Object.keys(n).length) clean[side][def.k] = n;
            }
            if (fcHasData(clean)) state.forecast[k] = clean;
          }
          save(); renderCurrent(); toast('✅ Đã khôi phục dữ liệu');
        } catch (err) { toast('❌ File không hợp lệ'); }
        e.target.value = '';
      };
      reader.readAsText(f);
    });
    $('#loadSample').addEventListener('click', loadSample);
    bindForecast();
    $('#view-settings').addEventListener('change', e => {
      if (!e.target.classList.contains('cat-note-input')) return;
      const c = catOf(e.target.dataset.cat), v = e.target.value.trim();
      if (v === catNote(c)) return;
      state.catNotes = { ...state.catNotes, [c.id]: v };
      save(); toast(`📝 Đã lưu ghi chú: ${c.name}`);
    });
    $('#view-settings').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.classList.contains('cat-note-input')) e.target.blur(); });
    $('#clearAll').addEventListener('click', async () => {
      if (!await askConfirm('Xóa TOÀN BỘ giao dịch và ngân sách? Hành động này không thể hoàn tác.', 'Xóa hết')) return;
      state.transactions = []; state.budgets = {}; state.forecast = {}; save(); renderCurrent(); toast('🗑️ Đã xóa toàn bộ dữ liệu');
    });

    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(renderCurrent, 250); });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { applyTheme(); renderCurrent(); });
    // Trang chứa (vd. claude.ai) có thể đổi data-theme: vẽ lại biểu đồ theo màu mới
    new MutationObserver(() => { $('#themeToggle').textContent = isDark() ? '☀️' : '🌙'; renderCurrent(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }
  async function loadSample() {
    if (state.transactions.length && !await askConfirm('Dữ liệu mẫu sẽ THAY THẾ dữ liệu hiện tại. Tiếp tục?', 'Nạp dữ liệu mẫu')) return;
    state.transactions = sampleData();
    const nk = monthKey(new Date(today().getFullYear(), today().getMonth() + 1, 1));
    const nd = n => `${nk}-${pad(n)}`;
    state.forecast = { [nk]: {
      in: { luong: { amount: 27000000, date: nd(5) }, hhban: { amount: 15000000, date: nd(10), note: 'Dự án căn hộ, chờ công ty duyệt' }, hhql: { amount: 5000000, date: nd(15) }, hh1: { label: 'Hoa hồng giới thiệu khách', amount: 3000000, date: nd(20) } },
      out: { nganhang: { amount: 12000000, date: nd(25), note: 'Gốc + lãi vay mua nhà' }, bds: { amount: 20000000, date: nd(28), note: 'Đợt 3 hợp đồng mua căn hộ' }, c1: { label: 'Học phí con', amount: 4500000, date: nd(5) } },
    } };
    state.budgets = { anuong: 4500000, dilai: 2000000, muasam: 1500000, giaitri: 1000000, tiepkhach: 2000000, lamdep: 500000 };
    save(); renderCurrent(); toast('✨ Đã nạp dữ liệu mẫu 12 tháng');
  }

  // ---------------- KHỞI ĐỘNG ----------------
  function init() {
    const t = today();
    $('#todayLabel').textContent = `${DOW[t.getDay()]}, ngày ${dmy(t)}`;
    applyTheme();
    fillCatFilter();
    bind();
    renderCurrent();
    connectCloud().catch(() => setSyncStatus('local', '💾 Lưu trên trình duyệt này'));
  }
  init();
})();
