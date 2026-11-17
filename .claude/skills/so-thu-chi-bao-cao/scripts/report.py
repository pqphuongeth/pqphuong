#!/usr/bin/env python3
"""Tạo báo cáo Sổ Thu Chi từ dữ liệu tải về của app (thư mục chứa các file JSON).

Cách dùng:
  python3 report.py --data DIR --mode day|week|month [--date YYYY-MM-DD] \
      [--html OUT.html] [--text OUT.txt] [--title-url URL]

  --data   thư mục có m-YYYY-MM.json, f-YYYY-MM.json, debts.json, meta.json
           (đúng như ArtifactData `list` với out_dir lưu ra: .../data/users/me)
  --mode   day   = tổng hợp thu chi trong ngày (dòng tiền vào, tổng chi và từng khoản chi)
           week  = thứ Hai tới ngày --date
           month = ngày 1 tới ngày --date
  --date   ngày chốt số liệu, mặc định hôm nay theo giờ Việt Nam
  --html   ghi trang báo cáo (không có <html>/<head>, dùng để đăng Artifact hoặc in PDF)
  --text   ghi bản tóm tắt ngắn để gửi lên điện thoại

Quy tắc tính (giống app):
  - Thu nhập không gồm hạng mục 'vonsan' (Vốn có sẵn / Số dư đầu kỳ).
  - Đầu tư: dir 'in' = rót vốn (tiền mặt giảm), dir 'out' = rút vốn (tiền mặt tăng).
  - Tổng tài sản = thu nhập + vốn có sẵn − chi tiêu; tiền mặt = tổng tài sản − đầu tư ròng.
  - Công nợ phải thu chưa thu KHÔNG tính vào tiền mặt / tài sản.
"""
import argparse, datetime, html, json, pathlib, sys

INCOME = {'luong': 'Lương', 'thuong': 'Thưởng', 'kinhdoanh': 'Kinh doanh', 'dautu': 'Lãi đầu tư / Cổ tức',
          'laitietkiem': 'Lãi tiết kiệm', 'chothue': 'Cho thuê tài sản', 'freelance': 'Làm thêm / Freelance',
          'hoahong': 'Hoa hồng từ bán hàng', 'quatang': 'Được tặng / Lì xì', 'thukhac': 'Thu nhập khác'}
CAPITAL = {'vonsan': 'Vốn có sẵn / Số dư đầu kỳ'}
EXPENSE = {'nhao': 'Nhà ở / Thuê nhà', 'concai': 'Gia đình', 'bome': 'Bố mẹ', 'dilai': 'Xăng xe ô tô', 'phixe': 'Phí xe ô tô',
           'vienthong': 'Điện thoại', 'anuong': 'Ăn uống & cà phê', 'tiepkhach': 'Tiếp khách',
           'hieuhi': 'Chi phí quà tặng, biếu khách hàng', 'muasam': 'Mua sắm cá nhân', 'muachocon': 'Mua sắm cho con',
           'tmdt': 'Mua hàng TMĐT cá nhân', 'yte': 'Sức khỏe / Y tế', 'giaoduc': 'Giáo dục / Học tập',
           'giaitri': 'Giải trí / Du lịch', 'lamdep': 'Thể thao', 'vesinh': 'Vệ sinh cá nhân', 'phanmem': 'Phần mềm / App',
           'baohiem': 'Bảo hiểm', 'trano': 'Trả nợ (gốc / lãi)', 'trabds': 'Trả tiền mua BĐS', 'thuetncn': 'Thuế TNCN',
           'chikhac': 'Chi phí khác'}
INVEST = {'chungkhoan': 'Chứng khoán / Cổ phiếu', 'quy': 'Cryptos', 'vang': 'Vàng / Bạc', 'batdongsan': 'Bất động sản',
          'guitietkiem': 'Gửi tiết kiệm'}
LEGACY = {'diennuoc': 'nhao'}
NAMES = {**INCOME, **CAPITAL, **EXPENSE, **INVEST}
FC_NAMES = {'luong': 'Lương', 'hhban': 'Hoa hồng từ bán hàng (công ty)', 'hhql': 'Hoa hồng quản lý (công ty)',
            'hh1': 'Hoa hồng khác 1', 'hh2': 'Hoa hồng khác 2', 'khac': 'Thu nhập khác', 've1': 'Khoản về khác 1',
            've2': 'Khoản về khác 2', 'nganhang': 'Trả ngân hàng', 'bds': 'Thanh toán tiền mua BĐS',
            'c1': 'Khoản chi khác 1', 'c2': 'Khoản chi khác 2', 'c3': 'Khoản chi khác 3'}
DOW = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật']

e = html.escape
def vnd(n): return f"{round(n):,}".replace(',', '.') + ' ₫'
def num(n): return f"{round(n):,}".replace(',', '.')
def pct(x): return f"{x * 100:.1f}".replace('.', ',') + '%'
def tr(n):
    s = f"{n / 1e6:,.1f}".replace(',', 'X').replace('.', ',').replace('X', '.')
    return (s[:-2] if s.endswith(',0') else s) + ' tr'
def D(s): return datetime.date.fromisoformat(s)
def dmy(d): d = D(d) if isinstance(d, str) else d; return d.strftime('%d/%m/%Y')
def dm(d): d = D(d) if isinstance(d, str) else d; return d.strftime('%d/%m')
def cat_name(c): return NAMES.get(c, c)
def line_name(k, l): return l.get('label') or FC_NAMES.get(k) or k


# ---------------- Đọc dữ liệu ----------------
def load(folder):
    folder = pathlib.Path(folder)
    tx, forecast, debts, budgets, notes = [], {}, {}, {}, {}
    for f in sorted(folder.glob('*.json')):
        body = json.loads(f.read_text(encoding='utf-8'))
        body = body.get('data', body) if isinstance(body, dict) and 'data' in body and 'id' in body else body
        if f.stem.startswith('m-'):
            for t in body.get('tx', []):
                t = dict(t); t['cat'] = LEGACY.get(t.get('cat'), t.get('cat')); tx.append(t)
        elif f.stem.startswith('f-'):
            forecast[f.stem[2:]] = body
            for k, l in (body.get('debt') or {}).items():   # bản cũ: công nợ nằm trong tháng
                if l and l.get('amount') and k not in debts: debts[k] = l
        elif f.stem == 'debts':
            debts.update({k: v for k, v in body.items() if isinstance(v, dict)})
        elif f.stem == 'meta':
            budgets, notes = body.get('budgets') or {}, body.get('catNotes') or {}
    return tx, forecast, debts, budgets, notes


def flows(tx, a, b):
    """Tổng hợp giao dịch có ngày trong [a, b]."""
    r = dict(income=0, capital=0, expense=0, inv_in=0, inv_out=0, count=0, by_exp={}, by_inc={}, items=[])
    for t in tx:
        if not (a <= t['date'] <= b): continue
        r['count'] += 1; r['items'].append(t); amt = t['amount']
        if t['type'] == 'income':
            if t['cat'] in CAPITAL: r['capital'] += amt
            else: r['income'] += amt; r['by_inc'][t['cat']] = r['by_inc'].get(t['cat'], 0) + amt
        elif t['type'] == 'expense':
            r['expense'] += amt; r['by_exp'][t['cat']] = r['by_exp'].get(t['cat'], 0) + amt
        elif t['type'] == 'invest':
            r['inv_out' if t.get('dir') == 'out' else 'inv_in'] += amt
    r['invest'] = r['inv_in'] - r['inv_out']
    r['saving'] = r['income'] - r['expense']
    r['cash'] = r['income'] + r['capital'] - r['expense'] - r['invest']
    r['items'].sort(key=lambda t: (t['date'], t.get('createdAt', 0)))
    return r


def position(tx, upto):
    r = flows(tx, '0000-00-00', upto)
    port = {}
    for t in tx:
        if t['type'] == 'invest' and t['date'] <= upto:
            port[t['cat']] = port.get(t['cat'], 0) + (-t['amount'] if t.get('dir') == 'out' else t['amount'])
    return dict(assets=r['income'] + r['capital'] - r['expense'], cash=r['cash'], invest=r['invest'],
                port={k: v for k, v in port.items() if v})


def period(mode, day):
    if mode == 'day': return day, day, day - datetime.timedelta(days=1), day - datetime.timedelta(days=1)
    if mode == 'week':
        a = day - datetime.timedelta(days=day.weekday())
        return a, day, a - datetime.timedelta(days=7), day - datetime.timedelta(days=7)
    a = day.replace(day=1)
    prev_end = a - datetime.timedelta(days=1)            # ngày cuối tháng trước
    pa = prev_end.replace(day=1)
    pb = min(pa + datetime.timedelta(days=day.day - 1), prev_end)   # cùng số ngày, không vượt cuối tháng
    return a, day, pa, pb


def checks(tx, forecast, debts, budgets, day, a):
    """Những điểm cần xem lại trong dữ liệu (đã gặp trên thực tế khi rà soát)."""
    out, today = [], day.isoformat()
    fut = [t for t in tx if t['date'] > today]
    if fut: out.append(f"{len(fut)} giao dịch ghi ngày trong tương lai (sau {dmy(day)}), đang được tính vào số dư.")
    for mk, f in forecast.items():
        for side, word in (('in', 'nhận'), ('out', 'chi')):
            for k, l in (f.get(side) or {}).items():
                if l.get('amount') and not l.get('done') and l.get('date') and l['date'] < today:
                    out.append(f"“{line_name(k, l)}” ({vnd(l['amount'])}) quá hạn {dmy(l['date'])} nhưng chưa bấm Ghi vào sổ (chưa {word}?).")
    for k, l in debts.items():
        if not l.get('amount') and (l.get('label') or l.get('date')):
            out.append(f"Dòng công nợ “{line_name(k, l)}” không có số tiền; nên xóa trống hẳn hoặc nhập số tiền.")
        elif l.get('amount') and not l.get('done') and l.get('date') and l['date'] < today:
            out.append(f"Công nợ “{line_name(k, l)}” ({vnd(l['amount'])}) đã quá ngày hẹn {dmy(l['date'])}.")
        elif l.get('amount') and not l.get('done') and l.get('date') == today:
            out.append(f"Công nợ “{line_name(k, l)}” hẹn trả hôm nay ({vnd(l['amount'])}); kiểm tra lại ngày hẹn nếu chưa đến hạn.")
    for t in tx:
        if t['type'] == 'income' and t['cat'] == 'thukhac' and a.isoformat() <= t['date'] <= today:
            n = (t.get('note') or '').lower()
            if any(w in n for w in ('vốn', 'rút', 'đầu tư', 'chuyển')):
                out.append(f"Khoản thu “{t.get('note')}” {vnd(t['amount'])} ({dmy(t['date'])}) có thể là vốn có sẵn hoặc rút vốn, không phải thu nhập.")
    if budgets:
        m = flows(tx, day.replace(day=1).isoformat(), today)
        for c, lim in budgets.items():
            sp = m['by_exp'].get(c, 0)
            if lim and sp > lim: out.append(f"Vượt hạn mức {cat_name(c)}: đã chi {vnd(sp)} / {vnd(lim)}.")
    return out


# ---------------- Văn bản gửi điện thoại ----------------
def text_day(tx, forecast, debts, budgets, day):
    s = day.isoformat(); r = flows(tx, s, s); pos = position(tx, s)
    m = flows(tx, day.replace(day=1).isoformat(), s)
    L = [f"📊 Thu chi {DOW[day.weekday()].lower()} {dmy(day)}"]
    note = lambda t: f" – {t['note']}" if t.get('note') else ''
    inc = [t for t in r['items'] if t['type'] == 'income' and t['cat'] not in CAPITAL]
    L.append(f"📥 Thu nhập (dòng tiền vào): {vnd(r['income'])}")
    for t in sorted(inc, key=lambda t: -t['amount']): L.append(f"  • {cat_name(t['cat'])}: {vnd(t['amount'])}{note(t)}")
    # Dòng vốn: tiền vào / ra nhưng không phải thu nhập hay chi tiêu
    cap = [t for t in r['items'] if t['cat'] in CAPITAL or t['type'] == 'invest']
    if cap:
        L.append("🔁 Dòng vốn (không tính thu nhập / chi tiêu):")
        for t in cap:
            if t['type'] == 'income': L.append(f"  • Vốn có sẵn +{vnd(t['amount'])}{note(t)}")
            elif t.get('dir') == 'out': L.append(f"  • Rút vốn {cat_name(t['cat'])} +{vnd(t['amount'])}{note(t)}")
            else: L.append(f"  • Rót vốn {cat_name(t['cat'])} −{vnd(t['amount'])}{note(t)}")
    exp = [t for t in r['items'] if t['type'] == 'expense']
    L.append(f"📤 Tổng chi: {vnd(r['expense'])} ({len(exp)} khoản)")
    for t in sorted(exp, key=lambda t: -t['amount']): L.append(f"  • {cat_name(t['cat'])}: {vnd(t['amount'])}{note(t)}")
    if not r['count']: L.append("Hôm nay chưa ghi khoản thu chi nào. Nhớ ghi bổ sung trong app.")
    L.append(f"💵 Tiền mặt hiện có: {vnd(pos['cash'])}")
    L.append(f"📅 Tháng {day.month}: thu {tr(m['income'])} · chi {tr(m['expense'])} · TB {tr(m['expense'] / day.day)}/ngày")
    due = [(k, l, 'nhận') for f in forecast.values() for k, l in (f.get('in') or {}).items()] + \
          [(k, l, 'chi') for f in forecast.values() for k, l in (f.get('out') or {}).items()]
    soon = [(k, l, w) for k, l, w in due if l.get('amount') and not l.get('done') and l.get('date')
            and s < l['date'] <= (day + datetime.timedelta(days=3)).isoformat()]
    for k, l, w in soon: L.append(f"⏰ Sắp tới hạn {w} {dm(l['date'])}: {line_name(k, l)} {vnd(l['amount'])}")
    for c in checks(tx, forecast, debts, budgets, day, day)[:3]: L.append('⚠️ ' + c)
    return '\n'.join(L)


def text_period(mode, tx, forecast, debts, budgets, day, url=None):
    a, b, pa, pb = period(mode, day); r = flows(tx, a.isoformat(), b.isoformat()); p = flows(tx, pa.isoformat(), pb.isoformat())
    pos = position(tx, b.isoformat()); label = 'tuần' if mode == 'week' else 'tháng'
    def delta(cur, prev): return '' if not prev else f" ({'▲' if cur >= prev else '▼'} {abs(cur - prev) / prev * 100:.0f}% so với {label} trước)"
    L = [f"📈 Báo cáo {label} {dm(a)}–{dmy(b)}"]
    L.append(f"📥 Thu nhập: {vnd(r['income'])}{delta(r['income'], p['income'])}")
    if r['capital']: L.append(f"   + vốn có sẵn {vnd(r['capital'])} (không tính thu nhập)")
    L.append(f"📤 Chi tiêu: {vnd(r['expense'])}{delta(r['expense'], p['expense'])}")
    days = (b - a).days + 1
    L.append(f"   TB {vnd(r['expense'] / days)}/ngày · tiết kiệm {pct(r['saving'] / r['income']) if r['income'] else '—'}")
    top = sorted(r['by_exp'].items(), key=lambda kv: -kv[1])[:3]
    if top: L.append('   Chi nhiều nhất: ' + ', '.join(f"{cat_name(c)} {tr(v)}" for c, v in top))
    if r['inv_in'] or r['inv_out']: L.append(f"📊 Đầu tư: rót {tr(r['inv_in'])} · rút {tr(r['inv_out'])}")
    L.append(f"💰 Tổng tài sản {vnd(pos['assets'])} · tiền mặt {vnd(pos['cash'])}")
    open_debt = sum(l['amount'] for l in debts.values() if l.get('amount') and not l.get('done'))
    if open_debt: L.append(f"🧾 Công nợ chưa thu: {vnd(open_debt)}")
    # Khoản sắp tới hạn: 14 ngày tới (báo cáo tuần) hoặc tới cuối tháng (báo cáo tháng)
    horizon = 14 if mode == 'week' else ((b.replace(day=28) + datetime.timedelta(days=4)).replace(day=1) - b).days - 1
    nxt = (b + datetime.timedelta(days=horizon)).isoformat()
    for side, w in (('in', 'nhận'), ('out', 'chi')):
        items = [(k, l) for f in forecast.values() for k, l in (f.get(side) or {}).items()
                 if l.get('amount') and not l.get('done') and l.get('date') and l['date'] <= nxt]
        if items:
            last = max(l['date'] for _, l in items)
            L.append(f"⏰ Đến {dm(last)} phải {w}: {vnd(sum(l['amount'] for _, l in items))} ({len(items)} khoản)")
    pin = sum(l['amount'] for f in forecast.values() for l in (f.get('in') or {}).values() if l.get('amount') and not l.get('done') and l.get('date', '9') <= nxt)
    pout = sum(l['amount'] for f in forecast.values() for l in (f.get('out') or {}).values() if l.get('amount') and not l.get('done') and l.get('date', '9') <= nxt)
    if pout > pos['cash']: L.append(f"❗ Cần ít nhất {vnd(pout - pos['cash'])} tiền về trước hạn để đủ chi {vnd(pout)}")
    for c in checks(tx, forecast, debts, budgets, day, a)[:4]: L.append('⚠️ ' + c)
    if url: L.append(f"🔗 {url}")
    return '\n'.join(L)


# ---------------- Trang báo cáo (HTML) ----------------
def page(mode, tx, forecast, debts, budgets, notes, day, css):
    a, b, pa, pb = period(mode, day); A, B = a.isoformat(), b.isoformat()
    r = flows(tx, A, B); p = flows(tx, pa.isoformat(), pb.isoformat()); pos = position(tx, B)
    label = {'day': 'ngày', 'week': 'tuần', 'month': 'tháng'}[mode]
    heading = {'day': f"Ngày {dmy(b)}", 'week': f"Tuần {dm(a)} – {dmy(b)}", 'month': f"Tháng {b.month}/{b.year}"}[mode]
    days = (b - a).days + 1
    open_debts = [(k, l) for k, l in debts.items() if l.get('amount') and not l.get('done')]
    open_debt = sum(l['amount'] for _, l in open_debts)
    mk = b.strftime('%Y-%m'); fc = forecast.get(mk, {})
    ins = sorted(((k, l) for k, l in (fc.get('in') or {}).items() if l.get('amount')), key=lambda kv: -kv[1]['amount'])
    outs = [(k, l) for k, l in (fc.get('out') or {}).items() if l.get('amount')]
    pin = sum(l['amount'] for _, l in ins if not l.get('done')); pout = sum(l['amount'] for _, l in outs if not l.get('done'))
    proj = pos['cash'] + pin - pout; need = max(pout - pos['cash'], 0)
    issues = checks(tx, forecast, debts, budgets, day, a)

    def kpi(lbl, val, sub, cls=''): return f'<div class="kpi"><span class="label">{lbl}</span><span class="value {cls}">{val}</span><span class="sub">{sub}</span></div>'
    def delta(cur, prev, good_up):
        if not prev: return f'chưa có dữ liệu {label} trước'
        up = cur >= prev; ok = up == good_up
        return f'<span class="{"pos" if ok else "neg"}">{"▲" if up else "▼"} {abs(cur - prev) / prev * 100:.1f}% so với {label} trước</span>'
    bars = ''.join(
        f'<div class="bar-row"><span class="name">{e(cat_name(c))}<small>{pct(v / r["expense"])}{(" · " + e(notes[c])) if notes.get(c) else ""}</small></span>'
        f'<span class="amt num">{vnd(v)}</span><div class="track"><i style="width:{v / r["expense"] * 100:.1f}%"></i></div></div>'
        for c, v in sorted(r['by_exp'].items(), key=lambda kv: -kv[1])) if r['expense'] else '<p class="muted">Chưa có khoản chi.</p>'

    def tx_row(t):
        if t['type'] == 'income': kind, cls, sg = ('Vốn có sẵn', 'muted', '+') if t['cat'] in CAPITAL else ('Thu nhập', 'pos', '+')
        elif t['type'] == 'expense': kind, cls, sg = 'Chi tiêu', 'neg', '−'
        else: kind, cls, sg = ('Đầu tư · rút vốn', 'inv', '+') if t.get('dir') == 'out' else ('Đầu tư · rót vốn', 'inv', '−')
        return (f'<tr><td class="num">{dmy(t["date"])}</td><td>{kind}</td><td>{e(cat_name(t["cat"]))}</td>'
                f'<td class="muted">{e(t.get("note") or "")}</td><td class="r num {cls}">{sg}{num(t["amount"])}</td></tr>')

    def fc_rows(items, word):
        return ''.join(f'<tr><td>{e(line_name(k, l))}</td><td class="muted">{e(l.get("note") or "")}</td>'
                       f'<td class="num">{dmy(l["date"]) if l.get("date") else "—"}</td><td class="r num">{num(l["amount"])}</td>'
                       f'<td><span class="pill {"done" if l.get("done") else "wait"}">{("Đã " if l.get("done") else "Chưa ") + word}</span></td></tr>'
                       for k, l in items)

    port = ''.join(f'<tr><td>{e(cat_name(c))}</td><td class="r num">{num(v)}</td><td class="r">{pct(v / pos["invest"]) if pos["invest"] else ""}</td></tr>'
                   for c, v in sorted(pos['port'].items(), key=lambda kv: -kv[1]))
    lede = (f'Tổng tài sản đến {dmy(b)} là <b>{vnd(pos["assets"])}</b>, gồm {vnd(pos["cash"])} tiền mặt và {vnd(pos["invest"])} đang đầu tư.'
            + (f' Còn <b>{vnd(open_debt)}</b> công nợ chưa thu.' if open_debt else '')
            + f' Trong {label} này: thu nhập {vnd(r["income"])}, chi tiêu {vnd(r["expense"])}'
            + (f', tiết kiệm {pct(r["saving"] / r["income"])} thu nhập.' if r['income'] else '.')
            + (f' Kế hoạch tháng {b.month} còn phải chi {vnd(pout)}, cần ít nhất <b>{vnd(need)}</b> tiền về trước hạn.' if need else ''))

    sec_fc = '' if not (ins or outs) else f"""
  <section>
    <h2>Dòng tiền tới hạn tháng {b.month}/{b.year}</h2>
    <div class="kpis">{kpi('Còn chờ nhận', vnd(pin), f'{len(ins)} khoản', 'pos')}{kpi('Còn phải chi', vnd(pout), f'{len(outs)} khoản', 'neg')}{kpi('Chênh lệch', vnd(pin - pout), 'chờ nhận − phải chi', 'pos' if pin >= pout else 'neg')}{kpi('Tiền mặt sau thu/chi', vnd(proj), 'nếu đúng hạn')}</div>
    <div class="sheet"><div class="table-wrap"><table>
      <thead><tr><th>Khoản</th><th>Ghi chú</th><th>Hạn</th><th class="r">Số tiền (₫)</th><th>Trạng thái</th></tr></thead>
      <tbody><tr><td colspan="5"><b class="pos">Tới hạn nhận</b></td></tr>{fc_rows(ins, 'nhận')}<tr><td colspan="5"><b class="neg">Phải chi</b></td></tr>{fc_rows(outs, 'chi')}</tbody>
    </table></div></div>
  </section>"""
    sec_debt = '' if not open_debts else f"""
  <section>
    <h2>Công nợ phải thu</h2>
    <p class="section-note">Tiền người khác còn nợ, chưa thu được; chưa tính vào tiền mặt và tài sản.</p>
    <div class="sheet"><div class="table-wrap"><table>
      <thead><tr><th>Khoản</th><th>Ghi chú</th><th>Hẹn trả</th><th class="r">Số tiền (₫)</th><th>Trạng thái</th></tr></thead>
      <tbody>{fc_rows(open_debts, 'thu')}</tbody>
      <tfoot><tr><td colspan="3">Tổng công nợ chưa thu</td><td class="r num inv">{num(open_debt)}</td><td></td></tr></tfoot>
    </table></div></div>
  </section>"""
    sec_issue = '' if not issues else '<section><h2>Cần xem lại trong app</h2><div class="sheet"><ol class="todo">' + \
        ''.join(f'<li>{e(i)}</li>' for i in issues) + '</ol></div></section>'

    # Tiêu đề cố định theo loại báo cáo: trang tuần được cập nhật tại cùng một link mỗi tuần
    title = {'day': 'Thu chi trong ngày', 'week': 'Báo cáo tuần Sổ Thu Chi', 'month': 'Báo cáo tháng Sổ Thu Chi'}[mode]
    return f"""<title>{title}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap">
<style>
{css}
</style>
<div class="wrap">
  <header class="top">
    <span class="eyebrow">Sổ Thu Chi · Báo cáo {label}</span>
    <h1>{e(heading)}</h1>
    <div class="meta"><span>Số liệu tính đến <b class="num">{dmy(b)}</b></span><span>{r['count']} giao dịch trong {label}</span><span>So sánh với {dm(pa)}–{dmy(pb)}</span></div>
  </header>
  <section>
    <h2>Tóm tắt</h2>
    <p class="lede">{lede}</p>
    <div class="kpis">{kpi('Tổng tài sản', vnd(pos['assets']), 'tiền mặt + đang đầu tư')}{kpi('Tiền mặt', vnd(pos['cash']), 'sau thu, chi và đầu tư')}{kpi('Đang đầu tư', vnd(pos['invest']), f"{len(pos['port'])} danh mục", 'inv')}{kpi('Công nợ chưa thu', vnd(open_debt), f'{len(open_debts)} khoản', 'inv')}</div>
  </section>
  <section>
    <h2>Thu chi trong {label} ({dm(a)}–{dm(b)})</h2>
    <div class="kpis">{kpi('Thu nhập', vnd(r['income']), delta(r['income'], p['income'], True), 'pos')}{kpi('Chi tiêu', vnd(r['expense']), delta(r['expense'], p['expense'], False), 'neg')}{kpi('Tiết kiệm', vnd(r['saving']), f"tỷ lệ {pct(r['saving'] / r['income'])}" if r['income'] else '—', 'pos' if r['saving'] >= 0 else 'neg')}{kpi('Chi TB / ngày', vnd(r['expense'] / days), f'{days} ngày')}</div>
    <div class="sheet"><div class="two">
      <div style="display:flex;flex-direction:column;gap:10px;min-width:0"><h3>Tiền vào và tiền ra</h3><div class="table-wrap"><table style="min-width:0"><tbody>
        <tr><td>Thu nhập</td><td class="r num pos">+{num(r['income'])}</td></tr>
        <tr><td>Vốn có sẵn (không tính thu nhập)</td><td class="r num">+{num(r['capital'])}</td></tr>
        <tr><td>Chi tiêu</td><td class="r num neg">−{num(r['expense'])}</td></tr>
        <tr><td>Rót vốn đầu tư</td><td class="r num inv">−{num(r['inv_in'])}</td></tr>
        <tr><td>Rút vốn đầu tư</td><td class="r num inv">+{num(r['inv_out'])}</td></tr>
      </tbody><tfoot><tr><td>Tiền mặt tăng / giảm</td><td class="r num">{num(r['cash'])}</td></tr></tfoot></table></div></div>
      <div style="display:flex;flex-direction:column;gap:10px;min-width:0"><h3>Chi tiêu theo hạng mục</h3><div class="bars">{bars}</div></div>
    </div></div>
  </section>{sec_fc}{sec_debt}
  {'' if not port else f'<section><h2>Danh mục đầu tư</h2><div class="sheet"><div class="table-wrap"><table style="min-width:0"><thead><tr><th>Danh mục</th><th class="r">Đang đầu tư (₫)</th><th class="r">Tỷ trọng</th></tr></thead><tbody>{port}</tbody></table></div></div></section>'}
  <section>
    <h2>Giao dịch trong {label}</h2>
    <div class="sheet"><div class="table-wrap"><table>
      <thead><tr><th>Ngày</th><th>Loại</th><th>Hạng mục</th><th>Ghi chú</th><th class="r">Số tiền (₫)</th></tr></thead>
      <tbody>{''.join(tx_row(t) for t in r['items']) or '<tr><td colspan="5" class="muted">Chưa có giao dịch.</td></tr>'}</tbody>
    </table></div></div>
  </section>{sec_issue}
  <footer>Lập từ dữ liệu app Sổ Thu Chi. Tổng tài sản = thu nhập + vốn có sẵn − chi tiêu; tiền mặt = tổng tài sản − phần đang đầu tư; công nợ chưa thu không tính vào tài sản.</footer>
</div>
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--data', required=True)
    ap.add_argument('--mode', choices=['day', 'week', 'month'], required=True)
    ap.add_argument('--date')
    ap.add_argument('--html'); ap.add_argument('--text'); ap.add_argument('--title-url')
    a = ap.parse_args()
    day = D(a.date) if a.date else (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=7)).date()
    tx, forecast, debts, budgets, notes = load(a.data)
    if a.text:
        t = text_day(tx, forecast, debts, budgets, day) if a.mode == 'day' else text_period(a.mode, tx, forecast, debts, budgets, day, a.title_url)
        pathlib.Path(a.text).write_text(t, encoding='utf-8'); print(t)
    if a.html:
        css = (pathlib.Path(__file__).resolve().parent.parent / 'assets' / 'report.css').read_text(encoding='utf-8')
        pathlib.Path(a.html).write_text(page(a.mode, tx, forecast, debts, budgets, notes, day, css), encoding='utf-8')
        print('HTML:', a.html, file=sys.stderr)


if __name__ == '__main__':
    main()
