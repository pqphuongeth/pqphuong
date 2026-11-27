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
    { id: 'hhquanly',    name: 'Hoa hồng quản lý',    icon: '🧑‍💼', color: '#9333ea' },
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
  // Tiền có sẵn từ trước (tiền mặt, tài khoản, vốn đầu tư cũ): cộng vào tiền mặt / tài sản nhưng KHÔNG tính là thu nhập.
  // Nằm ngoài 10 khoản thu nhập, chỉ hiện thêm ở cuối lưới chọn khi nhập khoản thu.
  const CAPITAL_CAT = { id: 'vonsan', name: 'Vốn có sẵn / Số dư đầu kỳ', icon: '🏧', color: '#64748b', capital: true,
    desc: 'Tiền có sẵn từ trước khi dùng app (tiền mặt, tài khoản, vốn đầu tư cũ). Cộng vào tiền mặt, không tính là thu nhập.' };
  // Trả nợ: tiền mặt giảm nhưng KHÔNG tính là chi tiêu (khoản trả lớn không làm sai thống kê chi tiêu hằng ngày)
  const REPAY_CATS = [
    { id: 'tr_nganhang',   name: 'Trả nợ ngân hàng (gốc)',       icon: '🏦', color: '#0f766e' },
    { id: 'tr_laivay',     name: 'Trả lãi vay',                  icon: '📉', color: '#0d9488' },
    { id: 'tr_thetindung', name: 'Thẻ tín dụng / Trả góp',       icon: '💳', color: '#14b8a6' },
    { id: 'tr_canhan',     name: 'Trả nợ cá nhân / người thân',  icon: '🤝', color: '#2dd4bf' },
    { id: 'tr_khac',       name: 'Trả nợ khác',                  icon: '📄', color: '#5eead4' },
  ];
  const CATS_BY_TYPE = { income: [...INCOME_CATS, CAPITAL_CAT], expense: EXPENSE_CATS, invest: INVEST_CATS, repay: REPAY_CATS };
  const TYPE_NAMES = { income: 'Thu nhập', expense: 'Chi tiêu', invest: 'Đầu tư', repay: 'Trả nợ' };
  const CAT_MAP = Object.fromEntries([...INCOME_CATS, CAPITAL_CAT, ...EXPENSE_CATS, ...INVEST_CATS, ...REPAY_CATS].map(c => [c.id, c]));
  const isCapital = t => t.type === 'income' && !!(CAT_MAP[t.cat] && CAT_MAP[t.cat].capital);
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
      if (raw && Array.isArray(raw.transactions)) return { transactions: raw.transactions.map(migrateTx), budgets: raw.budgets || {}, catNotes: raw.catNotes || {}, forecast: raw.forecast || {}, debts: raw.debts || {}, loans: raw.loans || {}, commissions: raw.commissions || {} };
    } catch (e) { /* bỏ qua */ }
    return { transactions: [], budgets: {}, catNotes: {}, forecast: {}, debts: {}, loans: {}, commissions: {} };
  }
  function cloudDocs() {
    const docs = { meta: JSON.stringify({ budgets: state.budgets, catNotes: state.catNotes }) };
    const byMonth = {};
    for (const t of state.transactions) (byMonth['m-' + t.date.slice(0, 7)] ||= []).push(t);
    for (const [k, list] of Object.entries(byMonth)) docs[k] = JSON.stringify({ tx: list.slice().sort((a, b) => a.id.localeCompare(b.id)) });
    for (const [k, f] of Object.entries(state.forecast || {})) if (fcHasData(f)) docs['f-' + k] = JSON.stringify(f);
    if (Object.keys(state.debts || {}).length) docs.debts = JSON.stringify(state.debts);
    if (Object.keys(state.loans || {}).length) docs.loans = JSON.stringify(state.loans);
    if (Object.keys(state.commissions || {}).length) docs.commissions = JSON.stringify(state.commissions);
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
    state = { transactions: [], budgets: {}, catNotes: {}, forecast: {}, debts: {}, loans: {}, commissions: {} };
    renderCurrent();
    let timer = setTimeout(() => setSyncStatus('wait', '⚠️ Chưa tải được dữ liệu, đang thử lại…'), 10000);
    db.collection(cloud.base).onSnapshot(snap => {
      const tx = [];
      let budgets = {}, catNotes = {}, debts = {}, loans = {}, commissions = {}; const forecast = {};
      for (const d of snap.docs) {
        const body = d.data() || {};
        if (d.id === 'commissions') { commissions = JSON.parse(JSON.stringify(body)); synced[d.id] = JSON.stringify(body); continue; }
        if (d.id === 'loans') { loans = JSON.parse(JSON.stringify(body)); synced[d.id] = JSON.stringify(body); continue; }
        if (d.id === 'debts') { debts = JSON.parse(JSON.stringify(body)); synced[d.id] = JSON.stringify(body); continue; }
        if (d.id.startsWith('f-')) { forecast[d.id.slice(2)] = JSON.parse(JSON.stringify(body)); synced[d.id] = JSON.stringify(body); continue; }
        synced[d.id] = d.id === 'meta' ? JSON.stringify({ budgets: body.budgets || {}, catNotes: body.catNotes || {} }) : JSON.stringify({ tx: body.tx || [] });
        if (d.id === 'meta') { budgets = { ...(body.budgets || {}) }; catNotes = { ...(body.catNotes || {}) }; }
        else if (Array.isArray(body.tx)) body.tx.forEach(t => tx.push(migrateTx({ ...t })));
      }
      // Bản cũ lưu công nợ trong từng tháng: chuyển sang danh sách riêng (lần lưu kế tiếp sẽ ghi lại)
      state = migrateDebts({ transactions: tx, budgets, catNotes, forecast, debts, loans, commissions });
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
    let income = 0, expense = 0, invest = 0, capital = 0, repay = 0, count = 0;
    const byCat = {};
    for (const t of state.transactions) {
      if (t.date < startKey || t.date > endKey) continue;
      count++;
      const amt = isWithdraw(t) ? -t.amount : t.amount;
      if (isCapital(t)) capital += amt;
      else if (t.type === 'income') income += amt;
      else if (t.type === 'expense') expense += amt;
      else if (t.type === 'repay') repay += amt;
      else invest += amt;
      byCat[t.cat] = (byCat[t.cat] || 0) + amt;
    }
    // income: thu nhập thật (không gồm vốn có sẵn); saving: thu − chi (tính tỷ lệ tiết kiệm)
    // net: tài sản đang nắm giữ (thu + vốn có sẵn − chi − trả nợ); cash: tiền mặt còn lại sau khi đầu tư và trả nợ
    return { income, expense, invest, capital, repay, saving: income - expense, net: income + capital - expense - repay, cash: income + capital - expense - invest - repay, count, byCat };
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

  const VIEW_TITLES = { dashboard: 'Tổng quan', transactions: 'Sổ giao dịch', reports: 'Thống kê', forecast: 'Dòng tiền hoa hồng & công nợ', budgets: 'Ngân sách', settings: 'Cài đặt' };
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
      <div class="tx-main"><div class="tx-cat">${esc(c.name)}${t.type === 'income' && t.comm && state.commissions && state.commissions[t.comm] ? ` <span class="tag income">← ${esc(commTag(state.commissions[t.comm]))}</span>` : t.type === 'income' && t.unit ? ` <span class="tag income">← ${esc(t.unit)}</span>` : ''}${t.type === 'repay' && t.loan && state.loans && state.loans[t.loan] ? ` <span class="tag repay">→ ${esc(loanName(state.loans[t.loan]))}</span>` : ''}${t.type === 'invest' ? ` <span class="tag ${t.dir === 'out' ? 'out' : ''}">${t.dir === 'out' ? 'Rút vốn' : 'Rót vốn'}</span>` : ''}</div><div class="tx-note">${esc(t.note) || '<span style="opacity:.6">Không có ghi chú</span>'}</div></div>
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
  function barConfig(labels, inc, exp, inv, rep) {
    const grid = cssVar('--border');
    return {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Thu nhập', data: inc, backgroundColor: cssVar('--income'), borderRadius: 6, maxBarThickness: 28 },
          { label: 'Chi tiêu', data: exp, backgroundColor: cssVar('--expense'), borderRadius: 6, maxBarThickness: 28 },
          { label: 'Đầu tư', data: inv, backgroundColor: cssVar('--invest'), borderRadius: 6, maxBarThickness: 28 },
          { label: 'Trả nợ', data: rep, backgroundColor: cssVar('--repay'), borderRadius: 6, maxBarThickness: 28 },
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
    const debtOpen = fcTotals(monthKey(t)).debtOpen;
    const lt = loansTotal(), ct = commTotal();
    $('#dbBalanceSub').textContent = `Tiền mặt ${money(all.cash)} • Đang đầu tư ${money(all.invest)}` + (debtOpen ? ` • Công nợ chưa thu ${money(debtOpen)}` : '')
      + (ct.remaining ? ` • Hoa hồng chưa nhận ${money(ct.remaining)}` : '')
      + (lt.count ? ` • Dư nợ phải trả ${money(lt.remaining)} • Tài sản ròng ${money(all.net - lt.remaining)}` : '');
    $('#dbToday').textContent = money(todayS.expense);
    const monthExpToDate = sumRange(keyOf(mStart), tk).expense;
    $('#dbAvg').textContent = money(monthExpToDate / t.getDate());
    $('#dbAvgLabel').textContent = `Chi trung bình/ngày (${t.getDate()} ngày đã qua của tháng)`;

    const rate = cur.income ? (cur.saving / cur.income * 100) : 0;
    $('#dbStats').innerHTML =
      statCard('⬆️', 'ico-income', `Thu nhập tháng ${t.getMonth() + 1}`, money(cur.income), deltaInfo(cur.income, prev.income, true, 'tháng trước')) +
      statCard('⬇️', 'ico-expense', `Chi tiêu tháng ${t.getMonth() + 1}`, money(cur.expense), deltaInfo(cur.expense, prev.expense, false, 'tháng trước')) +
      statCard('📊', 'ico-invest', `Đầu tư tháng ${t.getMonth() + 1}`, money(cur.invest), deltaInfo(cur.invest, prev.invest, true, 'tháng trước')) +
      statCard('🏦', 'ico-repay', `Trả nợ tháng ${t.getMonth() + 1}`, money(cur.repay), { cls: 'muted', text: lt.count ? `Dư nợ còn phải trả ${money(lt.remaining)}` : 'Không tính vào chi tiêu' }) +
      statCard('💵', 'ico-primary', 'Tiền mặt còn lại tháng này', money(cur.cash), { cls: 'muted', text: (cur.capital ? `Thu + vốn có sẵn ${money(cur.capital)} − Chi − Đầu tư` : 'Thu − Chi − Đầu tư') + ' − Trả nợ' }) +
      statCard('🐷', 'ico-warn', 'Tỷ lệ tiết kiệm & đầu tư', cur.income ? rate.toFixed(1) + '%' : '—', { cls: 'muted', text: '(Thu − Chi) / Thu' });

    // Xu hướng 6 tháng
    const labels = [], inc = [], exp = [], inv = [], rep = [];
    for (let i = 5; i >= 0; i--) {
      const s = new Date(t.getFullYear(), t.getMonth() - i, 1), e = new Date(t.getFullYear(), t.getMonth() - i + 1, 0);
      const r = sumRange(keyOf(s), keyOf(e));
      labels.push(`T${s.getMonth() + 1}/${String(s.getFullYear()).slice(2)}`); inc.push(r.income); exp.push(r.expense); inv.push(r.invest); rep.push(r.repay);
    }
    drawChart('dbTrendChart', barConfig(labels, inc, exp, inv, rep));
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
    const r = { income: 0, expense: 0, invest: 0, capital: 0, repay: 0 };
    list.forEach(t => { r[isCapital(t) ? 'capital' : t.type] += isWithdraw(t) ? -t.amount : t.amount; });
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
      (show('income') && tot.capital ? `<span class="pill">Vốn có sẵn: ${money(tot.capital)}</span>` : '') +
      (show('expense') ? `<span class="pill expense">Chi: ${money(tot.expense)}</span>` : '') +
      (show('invest') ? `<span class="pill invest">Đầu tư: ${money(tot.invest)}</span>` : '') +
      (show('repay') ? `<span class="pill repay">Trả nợ: ${money(tot.repay)}</span>` : '') +
      (type === 'all' ? `<span class="pill">Tiền mặt còn lại: <b>${money(tot.income + tot.capital - tot.expense - tot.invest - tot.repay)}</b></span>` : '');

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
        ${g.income + g.capital ? `<span class="income-text">+${money(g.income + g.capital)}</span>` : ''}${g.expense ? `<span class="expense-text">−${money(g.expense)}</span>` : ''}${g.repay ? `<span class="repay-text">Trả nợ ${money(g.repay)}</span>` : ''}${g.invest ? `<span class="invest-text">${g.invest > 0 ? `Đầu tư ${money(g.invest)}` : `Rút vốn +${money(-g.invest)}`}</span>` : ''}</span></div>
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
    // Chia cho số ngày ĐÃ QUA trong kỳ (giống Tổng quan): kỳ đang diễn ra chưa hết ngày thì không chia cho cả kỳ
    const tdy = today(), effEnd = info.end > tdy ? tdy : info.end;
    const elapsed = effEnd < info.start ? 0 : Math.round((effEnd - info.start) / 864e5) + 1;
    const rate = cur.income ? cur.saving / cur.income * 100 : 0;
    $('#rpStats').innerHTML =
      statCard('⬆️', 'ico-income', 'Tổng thu', money(cur.income), deltaInfo(cur.income, prev.income, true, pn)) +
      statCard('⬇️', 'ico-expense', 'Tổng chi', money(cur.expense), deltaInfo(cur.expense, prev.expense, false, pn)) +
      statCard('📊', 'ico-invest', 'Đầu tư (rót − rút)', money(cur.invest), deltaInfo(cur.invest, prev.invest, true, pn)) +
      statCard('🏦', 'ico-repay', 'Trả nợ', money(cur.repay), deltaInfo(cur.repay, prev.repay, true, pn)) +
      statCard('💵', 'ico-primary', 'Tiền mặt còn lại', money(cur.cash), { cls: cur.cash >= 0 ? 'up-good' : 'up-bad', text: cur.income ? `Tiết kiệm & đầu tư ${rate.toFixed(1)}% thu nhập` : `${cur.count} giao dịch` }) +
      (days > 1
        ? statCard('📅', 'ico-warn', 'Chi trung bình / ngày', elapsed ? money(cur.expense / elapsed) : '—',
            { cls: 'muted', text: elapsed ? `Chia cho ${elapsed}${elapsed < days ? `/${days}` : ''} ngày đã qua · ${cur.count} giao dịch` : 'Kỳ này chưa bắt đầu' })
        : statCard('📅', 'ico-warn', 'Số giao dịch', String(cur.count), null));

    $('#rpTrendTitle').textContent = info.trendTitle;
    const inc = [], exp = [], inv = [], rep = [];
    info.buckets.forEach(b => { const r = sumRange(keyOf(b.start), keyOf(b.end)); inc.push(r.income); exp.push(r.expense); inv.push(r.invest); rep.push(r.repay); });
    drawChart('rpTrendChart', barConfig(info.buckets.map(b => b.label), inc, exp, inv, rep));

    drawPie('rpExpPie', 'rpExpEmpty', cur.byCat, EXPENSE_CATS);
    drawPie('rpIncPie', 'rpIncEmpty', cur.byCat, INCOME_CATS);
    $('#rpExpTable').innerHTML = catTable(cur.byCat, EXPENSE_CATS, cur.expense);
    $('#rpIncTable').innerHTML = catTable(cur.byCat, INCOME_CATS, cur.income);
    drawPie('rpInvPie', 'rpInvEmpty', cur.byCat, INVEST_CATS);
    $('#rpInvTable').innerHTML = catTable(cur.byCat, INVEST_CATS, INVEST_CATS.reduce((a, c) => a + Math.max(cur.byCat[c.id] || 0, 0), 0));
    renderRpComm(keyOf(info.start), keyOf(info.end));
    drawPie('rpRepPie', 'rpRepEmpty', cur.byCat, REPAY_CATS);
    $('#rpRepTable').innerHTML = catTable(cur.byCat, REPAY_CATS, cur.repay);
  }

  function renderRpComm(a, b) {
    const rows = {};
    for (const t of state.transactions) {
      if (t.type !== 'income' || !COMM_CATS.includes(t.cat) || t.date < a || t.date > b) continue;
      const c = t.comm && state.commissions && state.commissions[t.comm];
      const key = c ? 'c:' + t.comm : t.unit ? 'u:' + t.unit : 'none';
      const name = c ? commTag(c) : t.unit || 'Chưa ghi căn';
      const grp = c ? COMM_GROUPS[c.group] : catOf(t.cat).name;
      (rows[key] ||= { name, grp, sum: 0, n: 0 }); rows[key].sum += t.amount; rows[key].n++;
    }
    const list = Object.values(rows).sort((x, y) => y.sum - x.sum), total = list.reduce((s2, r) => s2 + r.sum, 0);
    $('#rpCommTable').innerHTML = list.length ? `<div class="cat-table">${list.map(r => `<div class="cat-row"><div class="emoji">🏠</div>
        <div><div class="name">${esc(r.name)} <small>${esc(r.grp)} · ${r.n} lần</small></div><div class="bar"><i style="width:${r.sum / total * 100}%;background:var(--income)"></i></div></div>
        <div class="val">${money(r.sum)}</div></div>`).join('')}</div><p class="muted small" style="margin:10px 0 0">Tổng hoa hồng đã nhận trong kỳ: <b>${money(total)}</b></p>`
      : '<div class="empty small">Không có khoản hoa hồng nào trong kỳ.</div>';
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
      { k: 'hhql',  name: 'Hoa hồng quản lý (công ty)', cat: 'hhquanly' },
      { k: 'hh1',   name: 'Hoa hồng khác 1', cat: 'hoahong', editable: true },
      { k: 'hh2',   name: 'Hoa hồng khác 2', cat: 'hoahong', editable: true },
      { k: 'khac',  name: 'Thu nhập khác', cat: 'thukhac' },
      { k: 've1',   name: 'Khoản về khác 1', cat: 'thukhac', editable: true },
      { k: 've2',   name: 'Khoản về khác 2', cat: 'thukhac', editable: true },
    ],
    // Công nợ phải thu: tên từng khoản đổi được (vd. tên người nợ); thu được thì ghi sổ vào Thu nhập khác
    debt: [1, 2, 3, 4, 5].map(i => ({ k: 'd' + i, name: 'Khoản ' + i, cat: 'thukhac', editable: true })),
    out: [
      { k: 'nganhang', name: 'Trả ngân hàng', cat: 'tr_nganhang', type: 'repay' },
      { k: 'bds',      name: 'Thanh toán tiền mua BĐS', cat: 'trabds' },
      { k: 'c1',       name: 'Khoản chi khác 1', cat: 'chikhac', editable: true },
      { k: 'c2',       name: 'Khoản chi khác 2', cat: 'chikhac', editable: true },
      { k: 'c3',       name: 'Khoản chi khác 3', cat: 'chikhac', editable: true },
    ],
  };
  const FC_SIDES = ['in', 'debt', 'out'];   // thứ tự hiển thị
  const FC_MONTH_SIDES = ['in', 'out'];      // lưu theo tháng; công nợ lưu riêng trong state.debts
  const FC_TEXT = {
    in:   { group: 'Tới hạn nhận',     done: 'Đã nhận', type: 'income',  word: 'khoản thu' },
    debt: { group: 'Công nợ phải thu', done: 'Đã thu',  type: 'income',  word: 'khoản thu nợ' },
    out:  { group: 'Dự kiến chi',      done: 'Đã chi',  type: 'expense', word: 'khoản chi' },
  };
  const monthKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  const fcHasData = f => f && FC_MONTH_SIDES.some(side => Object.values(f[side] || {}).some(l => l && (l.amount || l.note || l.label || l.date)));
  const fcMonth = key => state.forecast[key] || { in: {}, out: {} };
  // Công nợ phải thu là tiền người khác còn nợ (chưa thu được), không thuộc tháng nào: hiện ở mọi tháng tới khi thu xong
  const fcLine = (key, side, k) => (side === 'debt' ? (state.debts || {})[k] : (fcMonth(key)[side] || {})[k]) || {};
  const fcName = (def, line) => line.label || def.name;
  // debt / debtPending / debtDone: công nợ có ngày hẹn trả trong tháng `key` (tính vào chênh lệch của tháng)
  // debtOpen: tổng công nợ chưa thu (mọi tháng); debtAll: tổng mọi khoản công nợ đang theo dõi
  function fcTotals(key) {
    const r = { in: 0, out: 0, debt: 0, inPending: 0, outPending: 0, debtPending: 0, inDone: 0, outDone: 0, debtDone: 0, debtOpen: 0, debtOpenCount: 0, debtAll: 0 };
    for (const side of FC_MONTH_SIDES) for (const def of FC_LINES[side]) {
      const l = fcLine(key, side, def.k), a = Number(l.amount) || 0;
      r[side] += a; if (l.done) r[side + 'Done'] += a; else r[side + 'Pending'] += a;
    }
    for (const def of FC_LINES.debt) {
      const l = fcLine(key, 'debt', def.k), a = Number(l.amount) || 0;
      if (!a) continue;
      r.debtAll += a;
      if (!l.done) { r.debtOpen += a; r.debtOpenCount++; }
      if (l.date && l.date.slice(0, 7) === key) { r.debt += a; if (l.done) r.debtDone += a; else r.debtPending += a; }
    }
    return r;
  }
  // Dư nợ phải trả: mỗi khoản vay có dư nợ ban đầu (kèm ngày ghi nhận); giao dịch Trả nợ gắn với khoản vay (t.loan)
  // được trừ dần, trừ "Trả lãi vay" vì lãi không làm giảm nợ gốc.
  const loanList = () => Object.entries(state.loans || {}).map(([id, l]) => ({ id, ...l })).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  function loanInfo(l, upto = '9999-12-31') {
    let paid = 0, interest = 0, times = 0;
    for (const t of state.transactions) {
      // Khoản trả đã gắn với khoản vay luôn được trừ (người dùng đã chủ động chọn), không phụ thuộc ngày ghi nhận dư nợ
      if (t.type !== 'repay' || t.loan !== l.id || t.date > upto) continue;
      if (t.cat === 'tr_laivay') interest += t.amount; else { paid += t.amount; times++; }
    }
    const principal = Number(l.amount) || 0;
    return { principal, paid, interest, times, remaining: Math.max(principal - paid, 0), over: Math.max(paid - principal, 0) };
  }
  function loansTotal(upto) {
    const r = { principal: 0, paid: 0, interest: 0, remaining: 0, count: 0 };
    for (const l of loanList()) { const i = loanInfo(l, upto); r.principal += i.principal; r.paid += i.paid; r.interest += i.interest; r.remaining += i.remaining; if (i.principal) r.count++; }
    return r;
  }
  const loanName = l => l.name || 'Khoản nợ chưa đặt tên';

  // Hoa hồng chưa nhận theo căn (nhập từ bảng tổng hợp hoa hồng): amount = số chưa nhận lúc nhập.
  // Khoản thu gắn với căn (t.comm) được trừ dần; tiền chưa về KHÔNG tính vào thu nhập hay tiền mặt.
  const COMM_GROUPS = { ngoai: 'Ngoài công ty', banhang: 'Trong công ty · Hoa hồng bán hàng', quanly: 'Trong công ty · Hoa hồng quản lý' };
  const commList = () => Object.entries(state.commissions || {}).map(([id, c]) => ({ id, ...c })).sort((a, b) => (a.order || 0) - (b.order || 0));
  function commInfo(c) {
    let got = 0, times = 0;
    for (const t of state.transactions) if (t.type === 'income' && t.comm === c.id) { got += t.amount; times++; }
    const remaining = Math.max((Number(c.amount) || 0) - got, 0);
    const total = Number(c.total) || ((Number(c.receivedBefore) || 0) + (Number(c.amount) || 0));
    return { got, times, remaining, total, receivedAll: total - remaining };
  }
  function commTotal() {
    const r = { remaining: 0, count: 0, byGroup: {} };
    for (const c of commList()) {
      const i = commInfo(c); r.remaining += i.remaining; if (i.remaining > 0) r.count++;
      r.byGroup[c.group] = (r.byGroup[c.group] || 0) + i.remaining;
    }
    return r;
  }
  const COMM_SHORT = { ngoai: 'Ngoài cty', banhang: 'Bán hàng', quanly: 'Quản lý' };
  const commTag = c => [c.code, c.group === 'quanly' ? '' : COMM_SHORT[c.group], c.group === 'quanly' ? '' : c.batch].filter(Boolean).join(' · ');
  const commLabel = c => (c.group === 'quanly' ? c.code : `Hoa hồng căn ${c.code}`);

  function migrateDebts(st) {
    st.debts = { ...(st.debts || {}) };
    const free = () => FC_LINES.debt.map(d => d.k).find(k => !st.debts[k]);
    const forecast = {};
    for (const [mk, f] of Object.entries(st.forecast || {})) {
      if (f && f.debt) for (const [k, l] of Object.entries(f.debt)) {
        if (!l || !(l.amount || l.label || l.note || l.date)) continue;
        const slot = !st.debts[k] ? k : free();
        if (slot) st.debts[slot] = l;
      }
      const rest = { in: (f && f.in) || {}, out: (f && f.out) || {} };
      if (fcHasData(rest)) forecast[mk] = rest;
    }
    st.forecast = forecast;
    return st;
  }
  function setFcLine(key, side, k, patch) {
    if (side === 'debt') {
      const l = { ...((state.debts || {})[k] || {}), ...patch };
      for (const [pk, pv] of Object.entries(l)) if (pv === '' || pv === 0 || pv === false || pv == null) delete l[pk];
      const d = { ...(state.debts || {}) };
      if (Object.keys(l).length) d[k] = l; else delete d[k];
      state.debts = d; save(); return;
    }
    const f = JSON.parse(JSON.stringify(fcMonth(key)));
    f[side] = f[side] || {};
    f[side][k] = { ...(f[side][k] || {}), ...patch };
    for (const [pk, pv] of Object.entries(f[side][k])) if (pv === '' || pv === 0 || pv === false || pv == null) delete f[side][k][pk];
    if (!Object.keys(f[side][k]).length) delete f[side][k];
    state.forecast = { ...state.forecast, [key]: f };
    if (!fcHasData(f) && !Object.values(f.in || {}).length && !Object.values(f.out || {}).length) { const n = { ...state.forecast }; delete n[key]; state.forecast = n; }
    save();
  }

  // Tháng mặc định: tháng này nếu còn khoản chưa nhận / chưa thu / chưa chi, ngược lại là tháng tới.
  // Tính lại mỗi lần vẽ cho tới khi người dùng tự chuyển tháng (dữ liệu tài khoản tải về sau khi mở trang).
  let fcPicked = null;
  const fcDefaultMonth = () => {
    const t = today(), cur = new Date(t.getFullYear(), t.getMonth(), 1), tt = fcTotals(monthKey(cur));
    return tt.inPending + tt.debtPending + tt.outPending > 0 ? cur : new Date(t.getFullYear(), t.getMonth() + 1, 1);
  };
  const fcA = () => fcPicked || fcDefaultMonth();
  const fcKeyNow = () => monthKey(fcA());

  function fcRow(key, side, def) {
    const l = fcLine(key, side, def.k), c = catOf(def.cat);
    const doneText = FC_TEXT[side].done;
    return `<div class="fc-row ${l.done ? 'done' : ''}" data-side="${side}" data-k="${def.k}">
      <div class="fc-name">
        ${def.editable ? `<input class="input fc-label" id="fc-${side}-${def.k}-label" maxlength="60" placeholder="${esc(side === 'debt' ? def.name + ' (tên người / đơn vị nợ)' : def.name)}" value="${esc(l.label || '')}" aria-label="Tên khoản" />` : `<b>${esc(def.name)}</b>`}
        <small class="muted">Ghi sổ vào: ${c.icon} ${esc(c.name)}</small>
      </div>
      <label class="fc-cell"><span>Số tiền (₫)</span><input class="input fc-amount" id="fc-${side}-${def.k}-amount" inputmode="numeric" placeholder="0" value="${l.amount ? nf.format(l.amount) : ''}" ${l.done ? 'disabled' : ''} /></label>
      <label class="fc-cell"><span>${side === 'debt' ? 'Ngày hẹn trả' : side === 'in' ? 'Ngày tới hạn' : 'Ngày dự kiến'}</span><input type="date" class="input fc-date" id="fc-${side}-${def.k}-date" value="${esc(l.date || '')}" ${l.done ? 'disabled' : ''} /></label>
      <label class="fc-cell fc-note-cell"><span>Ghi chú</span><input class="input fc-note" id="fc-${side}-${def.k}-note" maxlength="120" placeholder="Ghi chú…" value="${esc(l.note || '')}" /></label>
      <button type="button" class="fc-status ${l.done ? 'is-done' : ''} ${side}" data-fc-status>${l.done ? `✅ ${doneText}` : '📥 Ghi vào sổ'}</button>
    </div>`;
  }
  // Mục Dòng tiền: quản lý dòng tiền hoa hồng, công nợ phải thu, dư nợ phải trả (không còn kế hoạch theo tháng)
  function renderForecast() {
    renderFcSummary();
    // Đang gõ trong bảng thì không vẽ lại các dòng để không mất chữ
    const ae = document.activeElement;
    if (ae && ae.tagName === 'INPUT' && ae.closest('.fc-row, .comm-row')) return;
    $('#fcList-debt').innerHTML = FC_LINES.debt.map(def => fcRow('', 'debt', def)).join('');
    renderLoans();
    renderComms();
  }
  function commHistory(c) {
    const got = state.transactions.filter(t => t.type === 'income' && t.comm === c.id).sort((a, b) => a.date.localeCompare(b.date));
    return got.length ? `<small class="comm-hist">Đã nhận qua app: ${got.map(t => `${dm(parseKey(t.date))} ${money(t.amount)}`).join(' · ')}</small>` : '';
  }
  function renderComms() {
    const list = commList(), el = $('#commList');
    if (!list.length) { el.innerHTML = '<div class="empty small">Chưa có dữ liệu hoa hồng chưa nhận.</div>'; return; }
    const groups = {};
    list.forEach(c => (groups[c.group] ||= []).push(c));
    el.innerHTML = Object.keys(COMM_GROUPS).filter(g => groups[g]).map(g => {
      const items = groups[g], sum = items.reduce((a, c) => a + commInfo(c).remaining, 0);
      return `<div class="comm-group"><div class="comm-group-head"><b>${COMM_GROUPS[g]}</b><span class="income-text num">${money(sum)}</span></div>` +
        items.map(c => {
          const i = commInfo(c), p = i.total ? Math.min(i.receivedAll / i.total * 100, 100) : 0;
          return `<div class="comm-row ${i.remaining ? '' : 'done'}" data-comm="${c.id}">
            <div class="comm-name"><b>${esc(c.code)}</b><small class="muted">${esc([c.batch, i.total ? `Tổng HH ${money(i.total)}` : '', `đã nhận ${money(i.receivedAll)}`, c.note].filter(Boolean).join(' · '))}</small>
              ${commHistory(c)}
              ${i.remaining ? `<label class="comm-exp-wrap">Dự kiến nhận <input type="date" class="input comm-exp" id="comm-${c.id}-exp" value="${esc(c.expected || '')}" /></label>` : ''}</div>
            <div class="comm-amt"><span class="muted small">${i.remaining ? 'Còn chưa nhận' : 'Đã nhận đủ'}</span><b class="${i.remaining ? 'income-text' : ''}">${money(i.remaining)}</b></div>
            <div class="comm-actions">${i.remaining ? `<button type="button" class="fc-status in" data-comm-recv="${c.id}">📥 Nhận tiền</button>` : ''}<button type="button" class="icon-btn" data-comm-del="${c.id}" title="Xóa khỏi danh sách">✕</button></div>
            <div class="bar"><i style="width:${p}%;background:var(--income)"></i></div>
          </div>`;
        }).join('') + '</div>';
    }).join('');
  }
  function loanProgress(l) {
    const i = loanInfo(l), p = i.principal ? Math.min(i.paid / i.principal * 100, 100) : 0;
    return `<span>Đã trả gốc <b>${money(i.paid)}</b>${i.times ? ` (${i.times} lần)` : ''}${i.interest ? ` · Lãi đã trả ${money(i.interest)}` : ''}</span>
      <span class="loan-left">${i.principal ? (i.remaining ? `Còn phải trả <b>${money(i.remaining)}</b>` : `<b class="income-text">Đã trả hết</b>${i.over ? ` (trả dư ${money(i.over)})` : ''}`) : 'Nhập dư nợ để theo dõi'}</span>
      <div class="bar thick"><i style="width:${p}%;background:var(--repay)"></i></div>`;
  }
  function renderLoans() {
    const list = loanList();
    $('#loanList').innerHTML = list.length ? list.map(l => `<div class="fc-row loan-row" data-loan="${l.id}">
      <div class="fc-name"><input class="input fc-label loan-name" id="loan-${l.id}-name" maxlength="60" placeholder="Tên khoản nợ (vd: Vay mua nhà ngân hàng)" value="${esc(l.name || '')}" aria-label="Tên khoản nợ" /></div>
      <label class="fc-cell"><span>Dư nợ ban đầu (₫)</span><input class="input fc-amount loan-amount" id="loan-${l.id}-amount" inputmode="numeric" placeholder="0" value="${l.amount ? nf.format(l.amount) : ''}" /></label>
      <label class="fc-cell"><span>Ngày ghi nhận</span><input type="date" class="input loan-date" id="loan-${l.id}-date" value="${esc(l.date || '')}" /></label>
      <label class="fc-cell fc-note-cell"><span>Ghi chú</span><input class="input loan-note" id="loan-${l.id}-note" maxlength="120" placeholder="Lãi suất, kỳ hạn…" value="${esc(l.note || '')}" /></label>
      <button type="button" class="fc-status loan-del" data-loan-del="${l.id}">🗑️ Xóa</button>
      <div class="loan-progress" id="loan-${l.id}-prog">${loanProgress(l)}</div>
    </div>`).join('') : '<div class="empty small">Chưa có khoản nợ nào. Bấm “＋ Thêm khoản nợ” và nhập dư nợ hiện tại.</div>';
  }
  function renderLoanSum() {
    const t = loansTotal();
    $('#loanSum').innerHTML = `<div class="fc-db">
      <div><span class="muted small">Tổng dư nợ ban đầu</span><b>${money(t.principal)}</b></div>
      <div><span class="muted small">Đã trả gốc</span><b class="income-text">${money(t.paid)}</b></div>
      <div><span class="muted small">Lãi đã trả</span><b>${money(t.interest)}</b></div>
      <div><span class="muted small">Tổng dư nợ phải trả</span><b class="repay-text">${money(t.remaining)}</b></div>
    </div><div class="bar thick"><i style="width:${t.principal ? Math.min(t.paid / t.principal * 100, 100) : 0}%;background:var(--repay)"></i></div>`;
  }
  const COMM_CATS = ['hoahong', 'hhquanly'];
  // Hoa hồng đã nhận trong khoảng ngày (khoản thu mục Hoa hồng từ bán hàng / Hoa hồng quản lý)
  function commReceived(a, b) {
    let sum = 0, n = 0;
    for (const t of state.transactions) if (t.type === 'income' && COMM_CATS.includes(t.cat) && t.date >= a && t.date <= b) { sum += t.amount; n++; }
    return { sum, n };
  }
  // Hoa hồng còn chưa nhận có ngày dự kiến nhận trong tháng `mk` (YYYY-MM)
  const commDueIn = mk => commList().reduce((a, c) => a + (c.expected && c.expected.slice(0, 7) <= mk ? commInfo(c).remaining : 0), 0);
  function renderFcSummary() {
    const t0 = today(), mk = monthKey(t0), t = fcTotals(mk), all = sumRange('0000-00-00', '9999-12-31');
    const ct = commTotal(), lt = loansTotal(), due = commDueIn(mk);
    const rc = commReceived(keyOf(new Date(t0.getFullYear(), t0.getMonth(), 1)), keyOf(t0));
    const net = all.net + ct.remaining + t.debtOpen - lt.remaining;
    $('#fcStats').innerHTML =
      statCard('💰', 'ico-income', 'Hoa hồng chưa nhận', money(ct.remaining), { cls: 'muted', text: `${ct.count} căn / khoản · dự kiến nhận đến hết tháng ${t0.getMonth() + 1}: ${money(due)}` }) +
      statCard('📥', 'ico-income', `Hoa hồng đã nhận tháng ${t0.getMonth() + 1}`, money(rc.sum), { cls: 'muted', text: `${rc.n} lần nhận` }) +
      statCard('🧾', 'ico-invest', 'Công nợ chưa thu', money(t.debtOpen), { cls: 'muted', text: `${t.debtOpenCount} khoản` }) +
      statCard('🏦', 'ico-repay', 'Dư nợ phải trả', money(lt.remaining), { cls: 'muted', text: `${lt.count} khoản vay · đã trả gốc ${money(lt.paid)}` }) +
      statCard('💵', 'ico-primary', 'Tiền mặt hiện có', money(all.cash), { cls: 'muted', text: `Nếu thu hết hoa hồng và công nợ: ${money(all.cash + ct.remaining + t.debtOpen)}` }) +
      statCard('⚖️', 'ico-warn', 'Tài sản ròng (gồm khoản phải thu)', money(net), { cls: net >= 0 ? 'up-good' : 'up-bad', text: 'Tài sản + hoa hồng chưa nhận + công nợ − dư nợ' });
    const bar = (done, total, cls) => `<div class="bar thick"><i style="width:${total ? Math.min(done / total * 100, 100) : 0}%;background:var(--${cls})"></i></div>`;
    renderLoanSum();
    $('#commSum').innerHTML = `<div class="fc-db">${Object.keys(COMM_GROUPS).map(g => `<div><span class="muted small">${COMM_GROUPS[g]}</span><b>${money(ct.byGroup[g] || 0)}</b></div>`).join('')}
      <div><span class="muted small">Tổng hoa hồng chưa nhận</span><b class="income-text">${money(ct.remaining)}</b></div></div>`;
    $('#fcTotal-debt').innerHTML = `<span>Tổng công nợ chưa thu</span><b class="invest-text">${money(t.debtOpen)}</b>${bar(t.debtAll - t.debtOpen, t.debtAll, 'invest')}`;
  }
  // Ô trên Tổng quan: dòng tiền hoa hồng và công nợ
  function renderDbForecast() {
    const t0 = today(), mk = monthKey(t0), ct = commTotal(), lt = loansTotal(), t = fcTotals(mk);
    const rc = commReceived(keyOf(new Date(t0.getFullYear(), t0.getMonth(), 1)), keyOf(t0));
    const el = $('#dbForecast');
    if (!ct.remaining && !rc.sum && !t.debtOpen && !lt.count) {
      el.innerHTML = `<div class="fc-db-empty"><span>Chưa có hoa hồng chưa nhận, công nợ hay khoản vay nào.</span><button class="btn btn-ghost btn-sm" data-goto="forecast">Mở mục Dòng tiền</button></div>`;
      return;
    }
    el.innerHTML = `<div class="fc-db">
      <div><span class="muted small">Hoa hồng chưa nhận</span><b class="income-text">${money(ct.remaining)}</b></div>
      <div><span class="muted small">Đã nhận tháng ${t0.getMonth() + 1}</span><b>${money(rc.sum)}</b></div>
      <div><span class="muted small">Dự kiến nhận đến hết tháng</span><b>${money(commDueIn(mk))}</b></div>
      <div><span class="muted small">Công nợ chưa thu</span><b class="invest-text">${money(t.debtOpen)}</b></div>
      <div><span class="muted small">Dư nợ phải trả</span><b class="repay-text">${money(lt.remaining)}</b></div>
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
    // Ghi sổ là xác nhận tiền đã nhận / đã chi: ngày hẹn còn ở tương lai thì ghi theo hôm nay
    const date = l.date && l.date <= keyOf(today()) ? l.date : keyOf(today());
    let loans = def.type === 'repay' ? loanList().filter(x => loanInfo(x).remaining > 0) : [];
    // Nhiều khoản nợ: dòng "Trả ngân hàng" ưu tiên khoản có tên chứa "ngân hàng"
    if (loans.length > 1 && def.k === 'nganhang') { const bank = loans.filter(x => /ngân hàng|ngan hang|bank/i.test(x.name || '')); if (bank.length === 1) loans = bank; }
    const loanTxt = def.type !== 'repay' ? '' : loans.length === 1 ? ` Trừ vào khoản nợ "${loanName(loans[0])}".`
      : loans.length > 1 ? ' Chưa gắn với khoản nợ nào: sửa giao dịch trong Sổ giao dịch để chọn khoản nợ cần trừ.' : '';
    if (!await askConfirm(`Ghi "${fcName(def, l)}" ${money(l.amount)} vào sổ giao dịch (${c.name}, ngày ${dmy(parseKey(date))})?${loanTxt}`, 'Ghi vào sổ')) return;
    const tx = { id: uid(), createdAt: Date.now(), type: def.type || FC_TEXT[side].type, cat: def.cat, amount: l.amount, date, note: [fcName(def, l), l.note].filter(Boolean).join(' – ').slice(0, 120) };
    if (loans.length === 1) tx.loan = loans[0].id;
    state.transactions.push(tx);
    setFcLine(key, side, k, { done: true, txId: tx.id, date });
    renderCurrent(); toast(`✅ Đã ghi ${FC_TEXT[side].word} ${money(l.amount)} vào sổ`);
  }
  async function fcCopyPrev() {
    const fcAnchor = fcA(), key = fcKeyNow(), prevD = new Date(fcAnchor.getFullYear(), fcAnchor.getMonth() - 1, 1), prev = fcMonth(monthKey(prevD));
    if (!fcHasData(prev)) { toast(`Tháng ${prevD.getMonth() + 1} chưa có kế hoạch để sao chép`); return; }
    if (fcHasData(fcMonth(key)) && !await askConfirm('Thay kế hoạch tháng này bằng bản sao của tháng trước?', 'Sao chép')) return;
    const shift = ds => { if (!ds) return ''; const d = parseKey(ds); const last = new Date(fcAnchor.getFullYear(), fcAnchor.getMonth() + 1, 0).getDate(); return keyOf(new Date(fcAnchor.getFullYear(), fcAnchor.getMonth(), Math.min(d.getDate(), last))); };
    const f = { in: {}, out: {} };
    for (const side of FC_MONTH_SIDES) for (const [k, l] of Object.entries(prev[side] || {})) {
      const n = { amount: l.amount, date: shift(l.date), note: l.note, label: l.label };
      Object.keys(n).forEach(x => { if (!n[x]) delete n[x]; });
      if (Object.keys(n).length) f[side][k] = n;
    }
    state.forecast = { ...state.forecast, [key]: f };
    save(); renderForecast(); toast(`📋 Đã sao chép kế hoạch tháng ${prevD.getMonth() + 1}`);
  }
  function bindForecast() {
    const view = $('#view-forecast');
    $('#commAddToggle').addEventListener('click', () => { $('#commAddForm').classList.toggle('hidden'); if (!$('#commAddForm').classList.contains('hidden')) $('#caCode').focus(); });
    $('#caCancel').addEventListener('click', () => { $('#commAddForm').reset(); $('#commAddForm').classList.add('hidden'); });
    $('#commAddForm').addEventListener('submit', e => {
      e.preventDefault();
      const code = $('#caCode').value.trim(), total = parseAmount($('#caTotal').value), recv = parseAmount($('#caRecv').value);
      if (!code) return toast('Nhập mã căn hoặc nội dung');
      if (!(total > recv)) return toast('Tổng hoa hồng phải lớn hơn số đã nhận');
      const id = 'c' + uid(), order = commList().reduce((m, c) => Math.max(m, c.order || 0), 0) + 1;
      state.commissions = { ...(state.commissions || {}), [id]: { code, group: $('#caGroup').value, batch: $('#caBatch').value.trim(), total, receivedBefore: recv,
        amount: total - recv, expected: $('#caExp').value || '', note: $('#caNote').value.trim(), order } };
      save(); $('#commAddForm').reset(); $('#commAddForm').classList.add('hidden'); renderForecast();
      toast(`💰 Đã thêm ${code}: chưa nhận ${money(total - recv)}`);
    });
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-fc-open]'); if (!b) return;
      const [y, m] = b.dataset.fcOpen.split('-').map(Number); fcPicked = new Date(y, m - 1, 1); showView('forecast');
    });
    view.addEventListener('input', e => {
      if (e.target.classList.contains('fc-amount')) { const v = parseAmount(e.target.value); e.target.value = v ? nf.format(v) : ''; }
    });
    view.addEventListener('click', async e => {
      const rb = e.target.closest('[data-comm-recv]');
      if (rb) {
        const c = { id: rb.dataset.commRecv, ...state.commissions[rb.dataset.commRecv] };
        openModal(null, { type: 'income', cat: c.group === 'quanly' ? 'hhquanly' : 'hoahong', amount: commInfo(c).remaining, note: commLabel(c), comm: c.id });
        return;
      }
      const db = e.target.closest('[data-comm-del]'); if (!db) return;
      const id = db.dataset.commDel, c = state.commissions[id];
      if (!await askConfirm(`Xóa "${c.code}" khỏi danh sách hoa hồng chưa nhận? Các khoản đã ghi nhận vẫn giữ nguyên.`, 'Xóa')) return;
      const n = { ...state.commissions }; delete n[id]; state.commissions = n;
      state.transactions.forEach(t => { if (t.comm === id) delete t.comm; });
      save(); renderCurrent(); toast('🗑️ Đã xóa khỏi danh sách');
    });
    $('#loanAdd').addEventListener('click', () => {
      const id = 'L' + uid();
      state.loans = { ...(state.loans || {}), [id]: { name: '', amount: 0, date: keyOf(today()), createdAt: Date.now() } };
      save(); renderLoans(); renderLoanSum();
      setTimeout(() => { const el = document.getElementById(`loan-${id}-name`); if (el) el.focus(); }, 30);
    });
    view.addEventListener('click', async e => {
      const b = e.target.closest('[data-loan-del]'); if (!b) return;
      const id = b.dataset.loanDel, l = state.loans[id];
      if (!await askConfirm(`Xóa khoản nợ "${loanName(l)}"? Các giao dịch trả nợ đã ghi vẫn giữ nguyên, chỉ bỏ liên kết với khoản nợ này.`, 'Xóa')) return;
      const n = { ...state.loans }; delete n[id]; state.loans = n;
      state.transactions.forEach(t => { if (t.loan === id) delete t.loan; });
      save(); renderCurrent(); toast('🗑️ Đã xóa khoản nợ');
    });
    view.addEventListener('change', e => {
      if (e.target.classList.contains('comm-exp')) {
        const id = e.target.closest('.comm-row').dataset.comm;
        state.commissions = { ...state.commissions, [id]: { ...state.commissions[id], expected: e.target.value } };
        save(); renderFcSummary(); return;
      }
      const lr = e.target.closest('.loan-row');
      if (lr) {
        const id = lr.dataset.loan, cls = e.target.classList, cur = state.loans[id]; if (!cur) return;
        const patch = cls.contains('loan-amount') ? { amount: parseAmount(e.target.value) } : cls.contains('loan-date') ? { date: e.target.value }
          : cls.contains('loan-note') ? { note: e.target.value.trim() } : cls.contains('loan-name') ? { name: e.target.value.trim() } : null;
        if (!patch) return;
        state.loans = { ...state.loans, [id]: { ...cur, ...patch } };
        save();
        const pr = document.getElementById(`loan-${id}-prog`); if (pr) pr.innerHTML = loanProgress({ id, ...state.loans[id] });
        renderLoanSum();
        return;
      }
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
    $('#repayCatList').innerHTML = rows(REPAY_CATS);
    $('#incomeCatTitle').textContent = `${INCOME_CATS.length} khoản thu nhập`;
    $('#expenseCatTitle').textContent = `${EXPENSE_CATS.length} khoản chi tiêu`;
    $('#investCatTitle').textContent = `${INVEST_CATS.length} khoản đầu tư`;
    $('#repayCatTitle').textContent = `${REPAY_CATS.length} khoản trả nợ`;
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
    { id: 'forecast', name: 'Công nợ phải thu' },
    { id: 'loans',    name: 'Dư nợ phải trả' },
    { id: 'comm',     name: 'Hoa hồng chưa nhận' },
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
        ['Vốn có sẵn đưa vào (không tính là thu nhập)', xm(r.capital)],
        ['Tổng chi tiêu', xm(r.expense)],
        ['Đầu tư (rót vốn − rút vốn)', xm(r.invest)],
        ['Trả nợ (không tính là chi tiêu)', xm(r.repay)],
        ['Chênh lệch thu − chi', { t: 'n', v: r.saving, f: 'B6-B8', z: MONEY_FMT }],
        ['Tiền mặt còn lại (thu + vốn có sẵn − chi − đầu tư − trả nợ)', { t: 'n', v: r.cash, f: 'B6+B7-B8-B9-B10', z: MONEY_FMT }],
        ['Tỷ lệ tiết kiệm & đầu tư', { t: 'n', v: r.income ? r.saving / r.income : 0, f: 'IF(B6=0,0,B11/B6)', z: '0.0%' }],
        ['Số giao dịch', r.count],
        [],
        [`LŨY KẾ ĐẾN ${dmy(parseKey(toKey))}`, 'Số tiền (₫)'],
        ['Tổng tài sản đang nắm giữ (thu + vốn có sẵn − chi − trả nợ)', xm(acc.net)],
        ['Tiền mặt', xm(acc.cash)],
        ['Đang đầu tư', xm(acc.invest)],
      ], [40, 22]));
    }

    if (sheetIds.includes('tx')) {
      const rows = [['Ngày', 'Loại', 'Hạng mục', 'Tiền vào (₫) (thu nhập, vốn có sẵn)', 'Chi tiêu (₫)', 'Đầu tư (₫) (+rót / −rút)', 'Trả nợ (₫)', 'Ghi chú']];
      for (const x of txs) {
        const c = catOf(x.cat), type = isCapital(x) ? 'Vốn có sẵn' : TYPE_NAMES[x.type] + (x.type === 'invest' ? (x.dir === 'out' ? ' – Rút vốn' : ' – Rót vốn') : '');
        rows.push([xdate(x.date), type, c.name, x.type === 'income' ? xm(x.amount) : '', x.type === 'expense' ? xm(x.amount) : '',
          x.type === 'invest' ? xm(isWithdraw(x) ? -x.amount : x.amount) : '', x.type === 'repay' ? xm(x.amount) : '',
          [x.note, x.comm && state.commissions && state.commissions[x.comm] ? `[${commTag(state.commissions[x.comm])}]` : x.unit ? `[${x.unit}]` : ''].filter(Boolean).join(' ')]);
      }
      const last = rows.length;
      rows.push(['TỔNG CỘNG', `${txs.length} giao dịch`, '', xsum('D', 2, last, r.income + r.capital), xsum('E', 2, last, r.expense), xsum('F', 2, last, r.invest), xsum('G', 2, last, r.repay), '']);
      add('tx', xSheet(rows, [12, 20, 34, 16, 16, 22, 16, 44], [0, last - 1]));
    }

    if (sheetIds.includes('cat')) {
      const rows = [['Loại', 'Hạng mục', 'Số tiền (₫)', 'Tỷ trọng', 'Số giao dịch', 'Ghi chú hạng mục']];
      const counts = {}; txs.forEach(x => { counts[x.cat] = (counts[x.cat] || 0) + 1; });
      for (const [type, allCats] of Object.entries(CATS_BY_TYPE)) {
        const cats = allCats.filter(c => !c.capital), total = r[type];
        const start = rows.length + 1;
        cats.map(c => ({ c, v: r.byCat[c.id] || 0 })).sort((a, b) => b.v - a.v).forEach(({ c, v }) => {
          rows.push([TYPE_NAMES[type], c.name, xm(v), xpct(total ? v / total : 0), counts[c.id] || 0, catNote(c)]);
        });
        rows.push([`Tổng ${TYPE_NAMES[type].toLowerCase()}`, '', xsum('C', start, rows.length, total), '', '', '']);
        rows.push([]);
      }
      if (r.capital) rows.push(['Vốn có sẵn', CAPITAL_CAT.name, xm(r.capital), '', counts[CAPITAL_CAT.id] || 0, 'Không tính là thu nhập']);
      add('cat', xSheet(rows, [12, 36, 18, 10, 13, 44]));
    }

    if (sheetIds.includes('month')) {
      const rows = [['Tháng', 'Thu nhập (₫)', 'Vốn có sẵn (₫)', 'Chi tiêu (₫)', 'Đầu tư (₫)', 'Trả nợ (₫)', 'Chênh lệch thu − chi (₫)', 'Tiền mặt còn lại (₫)', 'Tỷ lệ tiết kiệm']];
      months.forEach((mk, i) => {
        const [a, b] = monthRange(mk), x = sumRange(a < fromKey ? fromKey : a, b > toKey ? toKey : b), row = i + 2;
        rows.push([mLabel(mk), xm(x.income), xm(x.capital), xm(x.expense), xm(x.invest), xm(x.repay),
          { t: 'n', v: x.saving, f: `B${row}-D${row}`, z: MONEY_FMT }, { t: 'n', v: x.cash, f: `B${row}+C${row}-D${row}-E${row}-F${row}`, z: MONEY_FMT },
          { t: 'n', v: x.income ? x.saving / x.income : 0, f: `IF(B${row}=0,0,G${row}/B${row})`, z: '0.0%' }]);
      });
      const last = rows.length, n = last + 1;
      rows.push(['TỔNG CỘNG', xsum('B', 2, last, r.income), xsum('C', 2, last, r.capital), xsum('D', 2, last, r.expense), xsum('E', 2, last, r.invest),
        xsum('F', 2, last, r.repay), xsum('G', 2, last, r.saving), xsum('H', 2, last, r.cash), { t: 'n', v: r.income ? r.saving / r.income : 0, f: `IF(B${n}=0,0,G${n}/B${n})`, z: '0.0%' }]);
      add('month', xSheet(rows, [16, 16, 16, 16, 16, 16, 22, 20, 15]));
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
      const rows = [['Khoản', 'Số tiền (₫)', 'Ngày hẹn trả', 'Ghi chú', 'Trạng thái']];
      const defs = FC_LINES.debt.filter(def => fcLine('', 'debt', def.k).amount);
      if (!defs.length) rows.push(['Chưa có công nợ phải thu.']);
      for (const def of defs) {
        const l = fcLine('', 'debt', def.k);
        rows.push([fcName(def, l), xm(l.amount), l.date ? xdate(l.date) : '', l.note || '', l.done ? 'Đã thu' : 'Chưa thu']);
      }
      if (defs.length) { const tt = fcTotals(monthKey(today())); rows.push(['Tổng công nợ', xsum('B', 2, rows.length, tt.debtAll)]); rows.push(['Còn chưa thu', xm(tt.debtOpen)]); }
      add('forecast', xSheet(rows, [36, 18, 14, 40, 14]));
    }
    if (sheetIds.includes('comm')) {
      const rows = [['Nhóm', 'Mã căn / Nội dung', 'Đợt', 'Tổng hoa hồng (₫)', 'Đã nhận (₫)', 'Còn chưa nhận (₫)', '% đã nhận', 'Ghi chú', 'Dự kiến nhận']];
      const list = commList();
      if (!list.length) rows.push(['Chưa có dữ liệu hoa hồng chưa nhận.']);
      list.forEach(c => {
        const i = commInfo(c), row = rows.length + 1;
        rows.push([COMM_GROUPS[c.group] || c.group, c.code, c.batch || '', xm(i.total), xm(i.receivedAll), xm(i.remaining),
          { t: 'n', v: i.total ? i.receivedAll / i.total : 0, f: `IF(D${row}=0,0,E${row}/D${row})`, z: '0.0%' }, c.note || '', c.expected ? xdate(c.expected) : '']);
      });
      if (list.length) {
        const last = rows.length, t = list.map(commInfo), n = last + 1;
        const sum = k => t.reduce((a, i) => a + i[k], 0);
        rows.push(['TỔNG CỘNG', '', '', xsum('D', 2, last, sum('total')), xsum('E', 2, last, sum('receivedAll')), xsum('F', 2, last, sum('remaining')),
          { t: 'n', v: sum('total') ? sum('receivedAll') / sum('total') : 0, f: `IF(D${n}=0,0,E${n}/D${n})`, z: '0.0%' }, '']);
      }
      add('comm', xSheet(rows, [30, 26, 12, 18, 18, 18, 10, 30, 14], list.length ? [0, rows.length - 2] : null));
    }
    if (sheetIds.includes('loans')) {
      const rows = [['Khoản nợ', 'Ngày ghi nhận', 'Dư nợ ban đầu (₫)', 'Đã trả gốc (₫)', 'Lãi đã trả (₫)', 'Còn phải trả (₫)', '% đã trả', 'Ghi chú']];
      const list = loanList();
      if (!list.length) rows.push(['Chưa có khoản nợ nào.']);
      list.forEach(l => {
        const i = loanInfo(l, toKey), row = rows.length + 1;
        rows.push([loanName(l), l.date ? xdate(l.date) : '', xm(i.principal), xm(i.paid), xm(i.interest),
          { t: 'n', v: i.remaining, f: `MAX(0,C${row}-D${row})`, z: MONEY_FMT }, { t: 'n', v: i.principal ? i.paid / i.principal : 0, f: `IF(C${row}=0,0,D${row}/C${row})`, z: '0.0%' }, l.note || '']);
      });
      if (list.length) {
        const last = rows.length, t = loansTotal(toKey), n = last + 1;
        rows.push(['TỔNG CỘNG', '', xsum('C', 2, last, t.principal), xsum('D', 2, last, t.paid), xsum('E', 2, last, t.interest), xsum('F', 2, last, t.remaining),
          { t: 'n', v: t.principal ? t.paid / t.principal : 0, f: `IF(C${n}=0,0,D${n}/C${n})`, z: '0.0%' }, '']);
      }
      add('loans', xSheet(rows, [34, 14, 18, 18, 16, 18, 10, 36]));
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
      push('repay', 'tr_nganhang', 2e6, d(15), 'Trả gốc vay ngân hàng');
      push('repay', 'tr_laivay', rnd(6e5, 9e5), d(15), 'Lãi vay tháng');
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
  let editingId = null, mType = 'expense', mCat = null, mDir = 'in', mLoan = '', mComm = '', mUnit = '';
  const QUICK = [20000, 50000, 100000, 200000, 500000, 1000000, 5000000];
  // preset: mở sẵn một khoản thu (vd. nhận tiền hoa hồng theo căn) { type, cat, amount, note, comm }
  function openModal(tx, preset) {
    editingId = tx ? tx.id : null;
    mType = tx ? tx.type : (preset ? preset.type : 'expense');
    mCat = tx ? tx.cat : (preset ? preset.cat : null);
    mComm = tx ? (tx.comm || (tx.unit ? '__other' : '')) : (preset && preset.comm ? preset.comm : '');
    mUnit = tx ? (tx.unit || '') : '';
    mDir = tx && tx.dir === 'out' ? 'out' : 'in';
    // Khoản trả nợ mới: nếu chỉ có một khoản nợ còn dư thì chọn sẵn
    const open = loanList().filter(l => loanInfo(l).remaining > 0);
    mLoan = tx ? (tx.loan || '') : (open.length === 1 ? open[0].id : '');
    $('#txModalTitle').textContent = tx ? 'Sửa giao dịch' : 'Thêm giao dịch';
    $('#txAmount').value = tx ? nf.format(tx.amount) : (preset && preset.amount ? nf.format(Math.round(preset.amount)) : '');
    $('#txDate').value = tx ? tx.date : keyOf(today());
    $('#txNote').value = tx ? tx.note || '' : (preset && preset.note ? preset.note : '');
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
    // Khoản thu Hoa hồng: chọn căn / khoản trong danh sách hoa hồng (đúng nhóm) hoặc ghi mã căn khác
    const isComm = mType === 'income' && COMM_CATS.includes(mCat);
    $('#commField').classList.toggle('hidden', !isComm);
    if (isComm) {
      const groups = mCat === 'hhquanly' ? ['quanly'] : ['banhang', 'ngoai'];
      const items = commList().filter(c => groups.includes(c.group) && (commInfo(c).remaining > 0 || c.id === mComm));
      if (mComm && mComm !== '__other' && !items.some(c => c.id === mComm)) mComm = '';
      $('#txComm').innerHTML = '<option value="">— Chưa chọn căn / khoản —</option>' +
        groups.filter(g => items.some(c => c.group === g)).map(g => `<optgroup label="${COMM_GROUPS[g]}">${items.filter(c => c.group === g)
          .map(c => `<option value="${c.id}">${esc(c.code)}${c.batch ? ' · ' + esc(c.batch) : ''} · còn ${money(commInfo(c).remaining)}</option>`).join('')}</optgroup>`).join('') +
        '<option value="__other">Căn / khoản khác (nhập mã)</option>';
      $('#txComm').value = mComm;
      $('#txUnit').classList.toggle('hidden', mComm !== '__other');
      $('#txUnit').value = mUnit;
      const sel = mComm && mComm !== '__other' ? { id: mComm, ...state.commissions[mComm] } : null;
      const back = editingId ? ((state.transactions.find(x => x.id === editingId) || {}).comm === mComm ? (state.transactions.find(x => x.id === editingId) || {}).amount || 0 : 0) : 0;
      $('#commText').textContent = sel ? `${COMM_GROUPS[sel.group]}${sel.batch ? ' · ' + sel.batch : ''} · còn chưa nhận ${money(commInfo(sel).remaining + back)}. Nhận một phần thì sửa lại số tiền.`
        : mComm === '__other' ? 'Ghi mã căn và phần (ngoài công ty / bán hàng / quản lý, đợt) để biết khoản này từ đâu.' : 'Chọn căn để trừ vào phần hoa hồng chưa nhận của căn đó.';
    }
    const showLoan = mType === 'repay' && loanList().length > 0;
    $('#loanField').classList.toggle('hidden', !showLoan);
    if (showLoan) {
      $('#txLoan').innerHTML = '<option value="">Không trừ vào khoản nợ nào</option>' +
        loanList().map(l => `<option value="${l.id}">${esc(loanName(l))} · còn ${money(loanInfo(l).remaining)}</option>`).join('');
      $('#txLoan').value = mLoan && state.loans[mLoan] ? mLoan : '';
      $('#loanHint').textContent = mCat === 'tr_laivay' ? 'Lãi vay được ghi nhận riêng, không trừ vào dư nợ gốc.' : 'Số tiền này sẽ được trừ vào dư nợ của khoản đã chọn.';
    }
  }
  function saveTx(e) {
    e.preventDefault();
    const amount = parseAmount($('#txAmount').value);
    const date = $('#txDate').value;
    if (amount <= 0) { toast('Vui lòng nhập số tiền lớn hơn 0'); $('#txAmount').focus(); return; }
    if (!date) { toast('Vui lòng chọn ngày'); return; }
    const data = { type: mType, cat: mCat, amount, date, note: $('#txNote').value.trim() };
    if (mType === 'invest') data.dir = mDir;
    if (mType === 'repay' && mLoan && state.loans[mLoan]) data.loan = mLoan;
    if (mType === 'income' && COMM_CATS.includes(mCat)) {
      if (mComm && mComm !== '__other' && state.commissions && state.commissions[mComm]) data.comm = mComm;
      else if (mComm === '__other' && mUnit.trim()) data.unit = mUnit.trim().slice(0, 60);
    }
    if (editingId) {
      const t = state.transactions.find(x => x.id === editingId);
      delete t.dir; delete t.loan; delete t.comm; delete t.unit;
      Object.assign(t, data);
      toast('✅ Đã cập nhật giao dịch');
    } else {
      state.transactions.push({ id: uid(), createdAt: Date.now(), ...data });
      toast(`✅ Đã thêm ${{ income: 'khoản thu', expense: 'khoản chi', invest: mDir === 'out' ? 'khoản rút vốn' : 'khoản đầu tư', repay: 'khoản trả nợ' }[mType]} ${money(amount)}`);
    }
    save(); closeModal(); renderCurrent();
    if (mType === 'expense') checkBudgetAfterSave(data);
    if (data.comm) { const c = { id: data.comm, ...state.commissions[data.comm] }; setTimeout(() => toast(`💰 ${c.code}: còn chưa nhận ${money(commInfo(c).remaining)}`), 2400); }
    if (data.loan) { const l = { id: data.loan, ...state.loans[data.loan] }; setTimeout(() => toast(`🏦 Dư nợ "${loanName(l)}" còn ${money(loanInfo(l).remaining)}`), 2400); }
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
    $('#txLoan').addEventListener('change', e => { mLoan = e.target.value; });
    $('#txComm').addEventListener('change', e => {
      mComm = e.target.value;
      // Chọn căn khi chưa nhập số tiền: điền sẵn phần còn chưa nhận
      if (mComm && mComm !== '__other' && !parseAmount($('#txAmount').value)) $('#txAmount').value = nf.format(Math.round(commInfo({ id: mComm, ...state.commissions[mComm] }).remaining));
      if (mComm && mComm !== '__other' && !$('#txNote').value.trim()) $('#txNote').value = commLabel(state.commissions[mComm]);
      renderModalType();
    });
    $('#txUnit').addEventListener('input', e => { mUnit = e.target.value; });
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
    $('#exportJson').addEventListener('click', () => download(`so-thu-chi-backup-${keyOf(today())}.json`, JSON.stringify({ transactions: state.transactions, budgets: state.budgets, catNotes: state.catNotes, forecast: state.forecast, debts: state.debts, loans: state.loans, commissions: state.commissions }, null, 2), 'application/json'));
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
            .map(t => ({ id: String(t.id || uid()), type: t.type, cat: t.cat, amount: Number(t.amount), date: t.date, note: String(t.note || '').slice(0, 120), createdAt: Number(t.createdAt) || Date.now(), ...(t.type === 'invest' ? { dir: t.dir === 'out' ? 'out' : 'in' } : {}), ...(t.type === 'repay' && typeof t.loan === 'string' ? { loan: t.loan } : {}), ...(t.type === 'income' && typeof t.comm === 'string' ? { comm: t.comm } : {}), ...(t.type === 'income' && typeof t.unit === 'string' ? { unit: t.unit.slice(0, 60) } : {}) }));
          e.target.value = '';
          if (!await askConfirm(`Khôi phục ${valid.length} giao dịch? Dữ liệu hiện tại sẽ bị thay thế.`, 'Khôi phục')) return;
          state.transactions = valid;
          state.budgets = d.budgets && typeof d.budgets === 'object' ? Object.fromEntries(Object.entries(d.budgets).filter(([k, v]) => CAT_MAP[k] && Number(v) > 0).map(([k, v]) => [k, Number(v)])) : {};
          if (d.catNotes && typeof d.catNotes === 'object') state.catNotes = Object.fromEntries(Object.entries(d.catNotes).filter(([k, v]) => CAT_MAP[k] && typeof v === 'string').map(([k, v]) => [k, v.slice(0, 200)]));
          state.commissions = {};
          if (d.commissions && typeof d.commissions === 'object') for (const [id, c] of Object.entries(d.commissions)) {
            if (!/^[A-Za-z0-9_-]{1,60}$/.test(id) || !c || typeof c !== 'object' || !(Number(c.amount) > 0)) continue;
            state.commissions[id] = { code: String(c.code || '').slice(0, 40), group: ['ngoai', 'banhang', 'quanly'].includes(c.group) ? c.group : 'banhang', batch: String(c.batch || '').slice(0, 40),
              total: Number(c.total) || 0, receivedBefore: Number(c.receivedBefore) || 0, amount: Number(c.amount), note: String(c.note || '').slice(0, 120), order: Number(c.order) || 0,
              expected: /^\d{4}-\d{2}-\d{2}$/.test(c.expected) ? c.expected : '' };
          }
          state.loans = {};
          if (d.loans && typeof d.loans === 'object') for (const [id, l] of Object.entries(d.loans)) {
            if (!/^[A-Za-z0-9_-]{1,40}$/.test(id) || !l || typeof l !== 'object') continue;
            state.loans[id] = { name: String(l.name || '').slice(0, 60), amount: Number(l.amount) > 0 ? Number(l.amount) : 0, date: /^\d{4}-\d{2}-\d{2}$/.test(l.date) ? l.date : '', note: String(l.note || '').slice(0, 120), createdAt: Number(l.createdAt) || Date.now() };
          }
          state.forecast = {};
          if (d.forecast && typeof d.forecast === 'object') for (const [k, f] of Object.entries(d.forecast)) {
            if (!/^\d{4}-\d{2}$/.test(k) || !f || typeof f !== 'object') continue;
            const clean = { in: {}, out: {}, debt: {} };  // debt: bản sao lưu cũ, migrateDebts chuyển ra danh sách riêng
            for (const side of FC_SIDES) for (const def of FC_LINES[side]) {
              const l = f[side] && f[side][def.k]; if (!l || typeof l !== 'object') continue;
              const n = { amount: Number(l.amount) > 0 ? Number(l.amount) : 0, date: /^\d{4}-\d{2}-\d{2}$/.test(l.date) ? l.date : '', note: String(l.note || '').slice(0, 120), label: String(l.label || '').slice(0, 60), done: !!l.done, txId: String(l.txId || '') };
              Object.keys(n).forEach(x => { if (!n[x]) delete n[x]; });
              if (Object.keys(n).length) clean[side][def.k] = n;
            }
            if (fcHasData(clean) || Object.keys(clean.debt).length) state.forecast[k] = clean;
          }
          state.debts = {};
          if (d.debts && typeof d.debts === 'object') for (const def of FC_LINES.debt) {
            const l = d.debts[def.k]; if (!l || typeof l !== 'object') continue;
            const n = { amount: Number(l.amount) > 0 ? Number(l.amount) : 0, date: /^\d{4}-\d{2}-\d{2}$/.test(l.date) ? l.date : '', note: String(l.note || '').slice(0, 120), label: String(l.label || '').slice(0, 60), done: !!l.done, txId: String(l.txId || '') };
            Object.keys(n).forEach(x => { if (!n[x]) delete n[x]; });
            if (Object.keys(n).length) state.debts[def.k] = n;
          }
          migrateDebts(state);
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
      state.transactions = []; state.budgets = {}; state.forecast = {}; state.debts = {}; state.loans = {}; state.commissions = {}; save(); renderCurrent(); toast('🗑️ Đã xóa toàn bộ dữ liệu');
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
    // Mẫu: vài căn còn hoa hồng chưa nhận (ví dụ, không phải dữ liệu thật)
    const nx = keyOf(new Date(today().getFullYear(), today().getMonth() + 1, 15));
    state.forecast = {};
    state.commissions = {
      cs1: { code: 'A1-0501', group: 'banhang', batch: 'Đợt 1', total: 90000000, receivedBefore: 30000000, amount: 60000000, expected: nx, note: 'Ví dụ', order: 1 },
      cs2: { code: 'B2-1203', group: 'banhang', batch: 'Đợt 1', total: 75000000, receivedBefore: 0, amount: 75000000, expected: '', note: 'Ví dụ', order: 2 },
      cs3: { code: 'Hoa hồng quản lý Đợt 1', group: 'quanly', batch: '', total: 120000000, receivedBefore: 40000000, amount: 80000000, expected: nx, note: 'Ví dụ', order: 3 },
      cs4: { code: 'C3-0808', group: 'ngoai', batch: '', total: 50000000, receivedBefore: 10000000, amount: 40000000, expected: '', note: 'Ví dụ', order: 4 },
    };
    state.budgets = { anuong: 4500000, dilai: 2000000, muasam: 1500000, giaitri: 1000000, tiepkhach: 2000000, lamdep: 500000 };
    save(); renderCurrent(); toast('✨ Đã nạp dữ liệu mẫu 12 tháng');
  }

  // ---------------- KHỞI ĐỘNG ----------------
  function init() {
    const t = today();
    $('#todayLabel').textContent = `${DOW[t.getDay()]}, ngày ${dmy(t)}`;
    state = migrateDebts(state); // dữ liệu trình duyệt bản cũ: công nợ nằm trong từng tháng
    applyTheme();
    fillCatFilter();
    bind();
    renderCurrent();
    connectCloud().catch(() => setSyncStatus('local', '💾 Lưu trên trình duyệt này'));
  }
  init();
})();
