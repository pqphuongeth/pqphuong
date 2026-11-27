#!/usr/bin/env python3
"""Tạo báo cáo Sổ Thu Chi từ dữ liệu tải về của app (thư mục chứa các file JSON).

Cách dùng:
  python3 report.py --data DIR --mode day|week|month [--date YYYY-MM-DD] \
      [--html OUT.html] [--text OUT.txt] [--title-url URL]

  --data   thư mục có m-YYYY-MM.json, commissions.json, loans.json, meta.json
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
  - Trả nợ (type 'repay') làm giảm tiền mặt nhưng KHÔNG tính là chi tiêu.
  - Tổng tài sản = thu nhập + vốn có sẵn − chi tiêu − trả nợ; tiền mặt = tổng tài sản − đầu tư ròng.
  - Hoa hồng chưa nhận KHÔNG tính vào thu nhập, tiền mặt hay tài sản cho tới khi nhận.
"""
import argparse, datetime, html, json, pathlib, sys

INCOME = {'luong': 'Lương', 'thuong': 'Thưởng', 'kinhdoanh': 'Kinh doanh', 'dautu': 'Lãi đầu tư / Cổ tức',
          'laitietkiem': 'Lãi tiết kiệm', 'chothue': 'Cho thuê tài sản', 'freelance': 'Làm thêm / Freelance',
          'hoahong': 'Hoa hồng từ bán hàng', 'hhquanly': 'Hoa hồng quản lý', 'quatang': 'Được tặng / Lì xì', 'thukhac': 'Thu nhập khác'}
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
REPAY = {'tr_nganhang': 'Trả nợ ngân hàng (gốc)', 'tr_laivay': 'Trả lãi vay', 'tr_thetindung': 'Thẻ tín dụng / Trả góp',
         'tr_canhan': 'Trả nợ cá nhân / người thân', 'tr_khac': 'Trả nợ khác'}
LEGACY = {'diennuoc': 'nhao'}
NAMES = {**INCOME, **CAPITAL, **EXPENSE, **INVEST, **REPAY}
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
    global LOANS, COMMS; LOANS = {}; COMMS = {}
    for f in sorted(folder.glob('*.json')):
        body = json.loads(f.read_text(encoding='utf-8'))
        body = body.get('data', body) if isinstance(body, dict) and 'data' in body and 'id' in body else body
        if f.stem.startswith('m-'):
            for t in body.get('tx', []):
                t = dict(t); t['cat'] = LEGACY.get(t.get('cat'), t.get('cat')); tx.append(t)
        elif f.stem.startswith('f-'):
            # Kế hoạch dòng tiền theo tháng đã bỏ khỏi app: chỉ lấy công nợ còn nằm trong tài liệu tháng (bản cũ)
            pass
        elif f.stem == 'debts':
            pass   # Công nợ phải thu đã bỏ khỏi app (nằm trong danh sách hoa hồng chưa nhận)
        elif f.stem == 'commissions':
            COMMS.update({k: v for k, v in body.items() if isinstance(v, dict)})
        elif f.stem == 'loans':
            LOANS.update({k: v for k, v in body.items() if isinstance(v, dict)})
        elif f.stem == 'meta':
            budgets, notes = body.get('budgets') or {}, body.get('catNotes') or {}
    return tx, forecast, debts, budgets, notes


LOANS = {}   # khoản vay (tài liệu `loans`): {id: {name, amount (dư nợ ban đầu), date (tính từ ngày), note}}


def loans_status(tx, upto):
    """Dư nợ từng khoản: trả nợ gắn khoản vay (t.loan) trừ vào nợ gốc, trừ 'tr_laivay' (lãi)."""
    out = []
    for lid, l in sorted(LOANS.items(), key=lambda kv: kv[1].get('createdAt', 0)):
        paid = interest = 0
        for t in tx:
            if t['type'] != 'repay' or t.get('loan') != lid or t['date'] > upto: continue   # đã gắn khoản vay thì luôn trừ
            if t['cat'] == 'tr_laivay': interest += t['amount']
            else: paid += t['amount']
        principal = l.get('amount') or 0
        out.append(dict(id=lid, name=l.get('name') or 'Khoản nợ chưa đặt tên', principal=principal, paid=paid,
                        interest=interest, remaining=max(principal - paid, 0), date=l.get('date'), note=l.get('note') or ''))
    return out


COMMS = {}  # hoa hồng chưa nhận theo căn (tài liệu `commissions`): {id: {code, group, batch, total, receivedBefore, amount, note}}
COMM_GROUPS = {'ngoai': 'Ngoài công ty', 'banhang': 'Trong công ty · Hoa hồng bán hàng', 'quanly': 'Trong công ty · Hoa hồng quản lý'}


# Quy định nhận hoa hồng theo tiến độ KH thanh toán: [% KH đã thanh toán, % hoa hồng được nhận cộng dồn]
SCHEDULES = {'dot1': [(30, 50), (50, 90), (70, 100)], 'dot2': [(15, 50), (25, 70), (45, 95), (70, 100)], 'none': []}


def sched_of(c):
    if c.get('sched') in SCHEDULES: return c['sched']
    if c.get('group') == 'ngoai': return 'none'
    txt = f"{c.get('batch', '')} {c.get('code', '')}".lower()
    return 'dot2' if 'đợt 2' in txt else 'dot1' if 'đợt 1' in txt else 'none'


def comm_status(tx, upto):
    """Phần hoa hồng còn chưa nhận: amount (lúc nhập) − các khoản thu gắn căn (t.comm) tới ngày `upto`."""
    out = []
    for cid, c in sorted(COMMS.items(), key=lambda kv: kv[1].get('order', 0)):
        got = sum(t['amount'] for t in tx if t['type'] == 'income' and t.get('comm') == cid and t['date'] <= upto)
        rem = max((c.get('amount') or 0) - got, 0)
        total = c.get('total') or ((c.get('receivedBefore') or 0) + (c.get('amount') or 0))
        steps = SCHEDULES[sched_of(c)]; ticked = c.get('steps') or {}
        reached = max([k + 1 for k in range(len(steps)) if ticked.get(str(k)) or ticked.get(k)] or [0])
        pct = steps[reached - 1][1] if reached else 0
        due_amt = int(total * pct / 100 + 0.5)   # làm tròn như Math.round của app (không dùng round kiểu ngân hàng)
        due_left = max(min(due_amt - (total - rem), rem), 0) if steps else 0
        if due_left < 100: due_left = 0   # phần lẻ do làm tròn số liệu, giống app
        out.append(dict(id=cid, code=c.get('code', cid), group=c.get('group', 'banhang'), batch=c.get('batch', ''), total=total,
                        received=total - rem, remaining=rem, got=got, sched=sched_of(c), reached=reached, pct=pct,
                        paid_pct=steps[reached - 1][0] if reached else 0, due_amt=due_amt, due_left=due_left))
    return out


def flows(tx, a, b):
    """Tổng hợp giao dịch có ngày trong [a, b]."""
    r = dict(income=0, capital=0, expense=0, repay=0, inv_in=0, inv_out=0, count=0, by_exp={}, by_inc={}, by_rep={}, items=[])
    for t in tx:
        if not (a <= t['date'] <= b): continue
        r['count'] += 1; r['items'].append(t); amt = t['amount']
        if t['type'] == 'income':
            if t['cat'] in CAPITAL: r['capital'] += amt
            else: r['income'] += amt; r['by_inc'][t['cat']] = r['by_inc'].get(t['cat'], 0) + amt
        elif t['type'] == 'expense':
            r['expense'] += amt; r['by_exp'][t['cat']] = r['by_exp'].get(t['cat'], 0) + amt
        elif t['type'] == 'repay':
            r['repay'] += amt; r['by_rep'][t['cat']] = r['by_rep'].get(t['cat'], 0) + amt
        elif t['type'] == 'invest':
            r['inv_out' if t.get('dir') == 'out' else 'inv_in'] += amt
    r['invest'] = r['inv_in'] - r['inv_out']
    r['saving'] = r['income'] - r['expense']
    r['cash'] = r['income'] + r['capital'] - r['expense'] - r['invest'] - r['repay']
    r['items'].sort(key=lambda t: (t['date'], t.get('createdAt', 0)))
    return r


def position(tx, upto):
    r = flows(tx, '0000-00-00', upto)
    port = {}
    for t in tx:
        if t['type'] == 'invest' and t['date'] <= upto:
            port[t['cat']] = port.get(t['cat'], 0) + (-t['amount'] if t.get('dir') == 'out' else t['amount'])
    return dict(assets=r['income'] + r['capital'] - r['expense'] - r['repay'], cash=r['cash'], invest=r['invest'],
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
    for x in comm_status(tx, today):
        exp = COMMS.get(x['id'], {}).get('expected')
        if x['remaining'] and exp and exp < today:
            out.append(f"Hoa hồng {x['code']} còn {vnd(x['remaining'])} đã quá ngày dự kiến nhận {dmy(exp)}.")
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
    cs = {x['id']: x for x in comm_status(tx, s)}
    for t in sorted(inc, key=lambda t: -t['amount']):
        left = f" (căn {cs[t['comm']]['code']} còn chưa nhận {vnd(cs[t['comm']]['remaining'])})" if t.get('comm') in cs else ''
        L.append(f"  • {cat_name(t['cat'])}: {vnd(t['amount'])}{note(t)}{left}")
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
    rep = [t for t in r['items'] if t['type'] == 'repay']
    if rep:
        L.append(f"🏦 Trả nợ: {vnd(r['repay'])} (không tính vào chi tiêu)")
        for t in sorted(rep, key=lambda t: -t['amount']): L.append(f"  • {cat_name(t['cat'])}: {vnd(t['amount'])}{note(t)}")
    if not r['count']: L.append("Hôm nay chưa ghi khoản thu chi nào. Nhớ ghi bổ sung trong app.")
    L.append(f"💵 Tiền mặt hiện có: {vnd(pos['cash'])}")
    if cs:
        due = [x for x in cs.values() if x['due_left'] > 0]
        L.append(f"💰 Hoa hồng chưa nhận: {vnd(sum(x['remaining'] for x in cs.values()))}"
                 + (f" · đã tới hạn {vnd(sum(x['due_left'] for x in due))} ({len(due)} căn/khoản)" if due else ''))
    ls = [x for x in loans_status(tx, s) if x['principal']]
    if ls:
        L.append(f"🏦 Dư nợ còn phải trả: {vnd(sum(x['remaining'] for x in ls))}")
        for x in ls:
            if any(t.get('loan') == x['id'] for t in rep): L.append(f"  • {x['name']}: còn {vnd(x['remaining'])}")
    L.append(f"📅 Tháng {day.month}: thu {tr(m['income'])} · chi {tr(m['expense'])} · TB {tr(m['expense'] / day.day)}/ngày")
    soon_to = (day + datetime.timedelta(days=3)).isoformat()
    for x in comm_status(tx, s):
        exp = COMMS.get(x['id'], {}).get('expected')
        if x['remaining'] and exp and s < exp <= soon_to: L.append(f"⏰ Dự kiến nhận {dm(exp)}: hoa hồng {x['code']} {vnd(x['remaining'])}")
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
    if r['repay']: L.append(f"🏦 Trả nợ: {vnd(r['repay'])}{delta(r['repay'], p['repay'])} (không tính chi tiêu)")
    if r['inv_in'] or r['inv_out']: L.append(f"📊 Đầu tư: rót {tr(r['inv_in'])} · rút {tr(r['inv_out'])}")
    L.append(f"💰 Tổng tài sản {vnd(pos['assets'])} · tiền mặt {vnd(pos['cash'])}")
    open_debt = sum(l['amount'] for l in debts.values() if l.get('amount') and not l.get('done'))
    if open_debt: L.append(f"🧾 Công nợ chưa thu: {vnd(open_debt)}")
    cs = comm_status(tx, b.isoformat())
    if cs:
        got = sum(t['amount'] for t in r['items'] if t['type'] == 'income' and t.get('comm'))
        L.append(f"💰 Hoa hồng chưa nhận: {vnd(sum(x['remaining'] for x in cs))}" + (f" (trong {label} đã nhận {vnd(got)})" if got else ''))
        due = sorted([x for x in cs if x['due_left'] > 0], key=lambda x: -x['due_left'])
        if due: L.append(f"📥 Đã tới hạn nhận theo tiến độ KH thanh toán: {vnd(sum(x['due_left'] for x in due))} ("
                         + ', '.join(f"{x['code']} {tr(x['due_left'])}" for x in due[:5]) + ('…' if len(due) > 5 else '') + ')')
    ls = [x for x in loans_status(tx, b.isoformat()) if x['principal']]
    if ls:
        rem = sum(x['remaining'] for x in ls)
        L.append(f"🏦 Dư nợ phải trả: {vnd(rem)} (đã trả gốc {tr(sum(x['paid'] for x in ls))}) · tài sản ròng hiện tại {vnd(pos['assets'] - rem)}")
    # Hoa hồng dự kiến nhận: 14 ngày tới (báo cáo tuần) hoặc tới cuối tháng (báo cáo tháng)
    horizon = 14 if mode == 'week' else ((b.replace(day=28) + datetime.timedelta(days=4)).replace(day=1) - b).days - 1
    nxt = (b + datetime.timedelta(days=horizon)).isoformat()
    due = [x for x in comm_status(tx, b.isoformat()) if x['remaining'] and COMMS.get(x['id'], {}).get('expected') and COMMS[x['id']]['expected'] <= nxt]
    if due: L.append(f"⏰ Hoa hồng dự kiến nhận đến {dm(nxt)}: {vnd(sum(x['remaining'] for x in due))} ({', '.join(x['code'] for x in due[:5])}{'…' if len(due) > 5 else ''})")
    for c in checks(tx, forecast, debts, budgets, day, a)[:4]: L.append('⚠️ ' + c)
    if url: L.append(f"🔗 {url}")
    return '\n'.join(L)


# ---------------- Trang báo cáo (HTML) ----------------
# Bố cục theo trình tự đọc của một báo cáo tài chính: điểm chính → số liệu chính → dòng tiền → chi tiêu
# → tài sản và nợ → hoa hồng → việc cần làm → phụ lục giao dịch. Số tiền trong bảng không kèm "₫" (đơn vị ghi ở đầu trang).
def page(mode, tx, forecast, debts, budgets, notes, day, css):
    a, b, pa, pb = period(mode, day); A, B = a.isoformat(), b.isoformat()
    r = flows(tx, A, B); p = flows(tx, pa.isoformat(), pb.isoformat()); pos = position(tx, B)
    start_cash = position(tx, (a - datetime.timedelta(days=1)).isoformat())['cash']
    heading = {'day': f"Thu chi ngày {dmy(b)}", 'week': f"Báo cáo tài chính tuần {dm(a)} – {dmy(b)}",
               'month': f"Báo cáo tài chính tháng {b.month}/{b.year}"}[mode]
    days = (b - a).days + 1
    cs = comm_status(tx, B); ls = [x for x in loans_status(tx, B) if x['principal']]
    debt = sum(x['remaining'] for x in ls); due = sum(x['due_left'] for x in cs); comm_left = sum(x['remaining'] for x in cs)
    net = pos['assets'] - debt
    issues = checks(tx, forecast, debts, budgets, day, a)
    save_rate = r['saving'] / r['income'] if r['income'] else None

    def kpi(lbl, val, sub='', cls=''):
        return f'<div class="kpi {cls}"><span class="k-label">{lbl}</span><span class="k-value num">{val}</span><span class="k-sub">{sub}</span></div>'

    def cmp(cur, prev, good_up):
        if not prev: return f'kỳ trước ({dm(pa)}–{dm(pb)}) chưa có dữ liệu'
        up = cur >= prev
        return f'<span class="{"pos" if up == good_up else "neg"}">{"▲" if up else "▼"} {abs(cur - prev) / prev * 100:.0f}%</span> so với {dm(pa)}–{dm(pb)}'

    def bar(v, tot, cls=''):
        w = max(min(v / tot * 100, 100), 0) if tot else 0
        return f'<span class="bar {cls}"><i style="width:{w:.1f}%"></i></span>'

    def dash(v): return num(v) if v else '<span class="muted">–</span>'

    # ---- Điểm chính: mỗi ý là một kết luận ----
    pts = []
    if r['income'] or r['expense']:
        top = max(r['by_exp'], key=r['by_exp'].get) if r['by_exp'] else None
        pts.append(f"Thu nhập <b>{vnd(r['income'])}</b>, chi tiêu <b>{vnd(r['expense'])}</b>"
                   + (f", giữ lại được <b>{pct(save_rate)}</b> thu nhập." if save_rate is not None else '.')
                   + (f" Khoản chi lớn nhất là {e(cat_name(top))} ({vnd(r['by_exp'][top])})." if top else ''))
    moves = []
    if r['repay']: moves.append(f"trả nợ {vnd(r['repay'])}")
    if r['invest'] > 0: moves.append(f"rót đầu tư ròng {vnd(r['invest'])}")
    if r['invest'] < 0: moves.append(f"rút đầu tư ròng {vnd(-r['invest'])}")
    pts.append(f"Tiền mặt cuối kỳ còn <b>{vnd(pos['cash'])}</b> (đầu kỳ {vnd(start_cash)})"
               + (f"; ngoài chi tiêu, tiền đã dùng để {' và '.join(moves)}." if moves else '.'))
    dues = sorted([x for x in cs if x['due_left']], key=lambda x: -x['due_left'])
    if cs:
        pts.append(f"Hoa hồng <b>đã tới hạn nhưng chưa nhận: {vnd(due)}</b> ở {len(dues)} căn/khoản"
                   + (f" (lớn nhất: {', '.join(e(x['code']) for x in dues[:3])})" if dues else '')
                   + f". Tổng hoa hồng còn chưa nhận {vnd(comm_left)}.")
    if ls:
        pts.append(f"Dư nợ còn <b>{vnd(debt)}</b>; tài sản ròng hiện tại {vnd(net)}"
                   + (f", sẽ thành <b>{vnd(net + due)}</b> khi thu đủ hoa hồng đã tới hạn." if due else '.'))
    if issues: pts.append(f"Có {len(issues)} điểm cần xem lại trong dữ liệu (mục 5).")

    # ---- 1. Dòng tiền: tiền mặt đầu kỳ → cuối kỳ ----
    flow_rows = [('Tiền mặt đầu kỳ', start_cash, 'base', ''),
                 ('Thu nhập', r['income'], 'pos', '+'), ('Vốn có sẵn đưa vào sổ', r['capital'], 'pos', '+'),
                 ('Rút vốn đầu tư', r['inv_out'], 'inv', '+'), ('Chi tiêu', r['expense'], 'neg', '−'),
                 ('Trả nợ', r['repay'], 'rep', '−'), ('Rót vốn đầu tư', r['inv_in'], 'inv', '−')]
    big = max([abs(v) for _, v, _, _ in flow_rows] + [abs(pos['cash']), 1])
    flow_html = ''.join(f'<tr><td>{n}</td><td class="r num {c}">{s}{num(v)}</td><td class="w-bar">{bar(v, big, c)}</td></tr>'
                        for n, v, c, s in flow_rows if v or c == 'base')
    inc_rows = ''.join(f'<tr><td>{e(cat_name(c))}</td><td class="r num">{num(v)}</td><td class="r muted">{pct(v / r["income"])}</td></tr>'
                       for c, v in sorted(r['by_inc'].items(), key=lambda kv: -kv[1])) or '<tr><td colspan="3" class="muted">Chưa có thu nhập.</td></tr>'
    rep_rows = ''.join(f'<tr><td>{e(cat_name(c))}</td><td class="r num">{num(v)}</td><td></td></tr>'
                       for c, v in sorted(r['by_rep'].items(), key=lambda kv: -kv[1]))
    rep_block = (f'<h3 class="mt">Trả nợ</h3><table class="t"><tbody>{rep_rows}</tbody>'
                 f'<tfoot><tr><td>Tổng trả nợ</td><td class="r num">{num(r["repay"])}</td><td></td></tr></tfoot></table>') if rep_rows else ''

    # ---- 2. Chi tiêu theo hạng mục ----
    cnt = {}
    for t in r['items']:
        if t['type'] == 'expense': cnt[t['cat']] = cnt.get(t['cat'], 0) + 1
    exp_sorted = sorted(r['by_exp'].items(), key=lambda kv: -kv[1])
    has_budget = any(budgets.get(c) for c, _ in exp_sorted)
    exp_rows = ''.join(
        f'<tr><td class="muted">{i}</td><td>{e(cat_name(c))}{(" <small class=muted>· " + e(notes[c]) + "</small>") if notes.get(c) else ""}</td>'
        f'<td class="r muted">{cnt.get(c, 0)}</td><td class="r num">{num(v)}</td><td class="r">{pct(v / r["expense"])}</td>'
        f'<td class="w-bar">{bar(v, exp_sorted[0][1], "neg")}</td>'
        + (f'<td class="r muted">{num(budgets[c]) if budgets.get(c) else ""}</td>' if has_budget else '') + '</tr>'
        for i, (c, v) in enumerate(exp_sorted, 1))
    top3 = sum(v for _, v in exp_sorted[:3])

    # ---- 3. Tài sản và nợ ----
    port_rows = ''.join(f'<tr class="sub"><td>{e(cat_name(c))}</td><td class="r num">{num(v)}</td></tr>'
                        for c, v in sorted(pos['port'].items(), key=lambda kv: -kv[1]))
    loan_rows = ''.join(f'<tr><td>{e(x["name"])}<small class="muted block">ban đầu {num(x["principal"])} · đã trả gốc {num(x["paid"])}'
                        f'{(" · lãi " + num(x["interest"])) if x["interest"] else ""}</small>{bar(x["paid"], x["principal"], "pos")}</td>'
                        f'<td class="r num">{num(x["remaining"])}</td></tr>' for x in ls)

    # ---- 4. Hoa hồng ----
    sched_txt = {'dot1': 'Đợt 1', 'dot2': 'Đợt 2', 'none': '–'}
    grp_cards, comm_rows = '', ''
    for g, gname in COMM_GROUPS.items():
        items = sorted([x for x in cs if x['group'] == g], key=lambda x: (-x['due_left'], -x['remaining']))
        if not items: continue
        T = sum(x['total'] for x in items); R = sum(x['received'] for x in items)
        Dl = sum(x['due_left'] for x in items); L = sum(x['remaining'] for x in items)
        w = lambda v: f'{v / T * 100 if T else 0:.1f}%'
        grp_cards += (f'<div class="gcard"><b>{e(gname)}</b><span class="muted small">{len(items)} căn/khoản · tổng hoa hồng {num(T)}</span>'
                      f'<span class="stack"><i class="s-got" style="width:{w(R)}"></i><i class="s-due" style="width:{w(Dl)}"></i></span>'
                      f'<span class="gline"><span><i class="dot s-got"></i>Đã nhận {num(R)}</span><span><i class="dot s-due"></i>Tới hạn {num(Dl)}</span>'
                      f'<span><i class="dot s-wait"></i>Chưa tới hạn {num(L - Dl)}</span></span></div>')
        comm_rows += f'<tr class="grp"><td colspan="7">{e(gname)}</td></tr>'
        for x in items:
            prog = (f'{x["paid_pct"]}% → {x["pct"]}%' if x['reached']
                    else 'chưa đạt mốc' if x['sched'] != 'none' else 'không theo mốc')
            comm_rows += (f'<tr><td><b>{e(x["code"])}</b></td><td class="muted">{sched_txt[x["sched"]]}</td><td class="r num">{num(x["total"])}</td>'
                          f'<td class="r num">{dash(x["received"])}</td><td class="small muted">{prog}</td>'
                          f'<td class="r num due">{dash(x["due_left"])}</td><td class="r num">{dash(x["remaining"] - x["due_left"])}</td></tr>')
    T_all = sum(x['total'] for x in cs); R_all = sum(x['received'] for x in cs)

    # ---- 5. Việc cần làm ----
    todo = []
    for x in dues[:5]:
        todo.append(f'Thu hoa hồng <b>{e(x["code"])}</b>: {vnd(x["due_left"])}'
                    + (f' (khách đã thanh toán {x["paid_pct"]}%).' if x['reached'] else '.'))
    if len(dues) > 5: todo.append(f'Thu tiếp {len(dues) - 5} khoản hoa hồng tới hạn còn lại (bảng mục 4).')
    for x in ls:
        if x['remaining']: todo.append(f'Lên kế hoạch trả <b>{e(x["name"])}</b>: còn {vnd(x["remaining"])}.')
    todo += [e(i) for i in issues]

    # ---- Phụ lục: giao dịch nhóm theo loại, có cộng nhóm ----
    def kind(t):
        if t['type'] == 'income': return 'Vốn có sẵn' if t['cat'] in CAPITAL else 'Thu nhập'
        return {'expense': 'Chi tiêu', 'repay': 'Trả nợ', 'invest': 'Đầu tư'}[t['type']]
    def sign(t): return ('+' if t.get('dir') == 'out' else '−') if t['type'] == 'invest' else ''
    appx = ''
    for k in ('Thu nhập', 'Vốn có sẵn', 'Đầu tư', 'Trả nợ', 'Chi tiêu'):
        its = [t for t in r['items'] if kind(t) == k]
        if not its: continue
        tot = sum(-t['amount'] if sign(t) == '+' else t['amount'] for t in its)
        appx += f'<tr class="grp"><td colspan="3">{k} · {len(its)} khoản{" (rót − rút)" if k == "Đầu tư" else ""}</td><td class="r num">{num(tot)}</td></tr>'
        appx += ''.join(f'<tr><td class="num">{dm(t["date"])}</td><td>{e(cat_name(t["cat"]))}</td><td class="muted">{e(t.get("note") or "")}</td>'
                        f'<td class="r num">{sign(t)}{num(t["amount"])}</td></tr>' for t in its)

    def sec(n, t, body, note='', keep=False):
        return f'<section{" class=keep" if keep else ""}><h2><span class="sn">{n}</span>{t}</h2>{f"<p class=note>{note}</p>" if note else ""}{body}</section>'

    title = {'day': 'Thu chi trong ngày', 'week': 'Báo cáo tuần Sổ Thu Chi', 'month': 'Báo cáo tháng Sổ Thu Chi'}[mode]
    out = [f"""<title>{title}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap">
<style>
{css}
</style>
<div class="wrap">
<header class="top">
  <div><span class="eyebrow">Sổ Thu Chi · Báo cáo tài chính cá nhân</span><h1>{e(heading)}</h1></div>
  <dl class="meta"><div><dt>Kỳ báo cáo</dt><dd class="num">{dmy(a)} – {dmy(b)}</dd></div><div><dt>Số ngày</dt><dd>{days}</dd></div>
  <div><dt>Giao dịch</dt><dd>{r['count']}</dd></div><div><dt>Đơn vị</dt><dd>đồng (₫)</dd></div></dl>
</header>
<section class="summary"><h2>Điểm chính</h2><ol class="points">{''.join(f'<li>{x}</li>' for x in pts)}</ol></section>
<div class="kgroup"><span class="kg-title">Kết quả trong kỳ</span><div class="kpis">
  {kpi('Thu nhập', vnd(r['income']), cmp(r['income'], p['income'], True), 'pos')}
  {kpi('Chi tiêu', vnd(r['expense']), cmp(r['expense'], p['expense'], False), 'neg')}
  {kpi('Tỷ lệ giữ lại', pct(save_rate) if save_rate is not None else '–', f'thu nhập − chi tiêu = {vnd(r["saving"])}')}
  {kpi('Chi trung bình / ngày', vnd(r['expense'] / days), f'trên {days} ngày đã qua')}
</div></div>
<div class="kgroup"><span class="kg-title">Vị thế cuối kỳ ({dmy(b)})</span><div class="kpis">
  {kpi('Tiền mặt', vnd(pos['cash']), f'đầu kỳ {vnd(start_cash)}')}
  {kpi('Đang đầu tư', vnd(pos['invest']), f"{len(pos['port'])} danh mục", 'inv')}
  {kpi('Dư nợ phải trả', vnd(debt), f'{len([x for x in ls if x["remaining"]])} khoản nợ', 'neg')}
  {kpi('Hoa hồng tới hạn chưa nhận', vnd(due), f'{len(dues)} căn/khoản', 'due')}
</div></div>"""]
    out.append(sec(1, 'Dòng tiền trong kỳ', f'''<div class="grid2">
  <div class="card"><h3>Tiền mặt đầu kỳ → cuối kỳ</h3><table class="t"><tbody>{flow_html}</tbody>
    <tfoot><tr><td>Tiền mặt cuối kỳ</td><td class="r num">{num(pos['cash'])}</td><td class="w-bar">{bar(pos['cash'], big)}</td></tr></tfoot></table></div>
  <div class="card"><h3>Thu nhập theo nguồn</h3><table class="t">
    <thead><tr><th>Nguồn</th><th class="r">Số tiền</th><th class="r">Tỷ trọng</th></tr></thead>
    <tbody>{inc_rows}</tbody><tfoot><tr><td>Tổng thu nhập</td><td class="r num">{num(r['income'])}</td><td></td></tr></tfoot></table>{rep_block}</div>
</div>''', 'Vốn có sẵn, đầu tư và trả nợ làm tiền mặt thay đổi nhưng không tính là thu nhập hay chi tiêu.', True))
    if exp_sorted:
        out.append(sec(2, 'Chi tiêu theo hạng mục', f'''<div class="card"><table class="t">
  <thead><tr><th>#</th><th>Hạng mục</th><th class="r">Số khoản</th><th class="r">Số tiền</th><th class="r">Tỷ trọng</th><th></th>{'<th class="r">Hạn mức</th>' if has_budget else ''}</tr></thead>
  <tbody>{exp_rows}</tbody>
  <tfoot><tr><td></td><td>Tổng chi tiêu</td><td class="r">{sum(cnt.values())}</td><td class="r num">{num(r['expense'])}</td><td class="r">100%</td><td></td>{'<td></td>' if has_budget else ''}</tr></tfoot></table></div>''',
            f'3 hạng mục lớn nhất chiếm {pct(top3 / r["expense"])} tổng chi tiêu.'))
    out.append(sec(3, 'Tài sản và nợ', f'''<div class="grid2">
  <div class="card"><h3>Tài sản đang có</h3><table class="t"><tbody>
    <tr><td>Tiền mặt</td><td class="r num">{num(pos['cash'])}</td></tr>
    <tr><td>Đang đầu tư</td><td class="r num">{num(pos['invest'])}</td></tr>{port_rows}
  </tbody><tfoot><tr><td>Tổng tài sản (A)</td><td class="r num">{num(pos['assets'])}</td></tr></tfoot></table></div>
  <div class="card"><h3>Nợ phải trả</h3><table class="t"><tbody>{loan_rows or '<tr><td class="muted">Không có khoản nợ.</td><td></td></tr>'}</tbody>
    <tfoot><tr><td>Tổng dư nợ (B)</td><td class="r num">{num(debt)}</td></tr></tfoot></table></div>
</div>
<div class="card equation">
  <div><span>Tài sản ròng hiện tại (A − B)</span><b class="num {'neg' if net < 0 else 'pos'}">{vnd(net)}</b></div>
  <span class="op">+</span>
  <div><span>Hoa hồng đã tới hạn chưa nhận</span><b class="num due">{vnd(due)}</b></div>
  <span class="op">=</span>
  <div><span>Tài sản ròng khi thu đủ phần tới hạn</span><b class="num {'neg' if net + due < 0 else 'pos'}">{vnd(net + due)}</b></div>
</div>''', f'Hoa hồng chưa nhận ({vnd(comm_left)}) chưa được tính vào tài sản cho tới khi tiền về tài khoản.', True))
    if cs:
        out.append(sec(4, 'Hoa hồng chưa nhận theo căn', f'''<div class="gcards">{grp_cards}</div>
<div class="card"><table class="t comm">
  <thead><tr><th>Căn / khoản</th><th>Đợt</th><th class="r">Tổng HH</th><th class="r">Đã nhận</th><th>Mốc KH trả<br>→ HH nhận</th><th class="r">Tới hạn<br>chưa nhận</th><th class="r">Chưa<br>tới hạn</th></tr></thead>
  <tbody>{comm_rows}</tbody>
  <tfoot><tr><td colspan="2">Tổng {len(cs)} căn/khoản</td><td class="r num">{num(T_all)}</td><td class="r num">{num(R_all)}</td><td></td><td class="r num due">{num(due)}</td><td class="r num">{num(comm_left - due)}</td></tr></tfoot></table></div>''',
            'Quy định nhận: Đợt 1 – khách thanh toán 30/50/70% thì nhận 50/90/100% hoa hồng; Đợt 2 – 15/25/45/70% thì nhận 50/70/95/100%. '
            '“Tới hạn chưa nhận” là phần đã đủ điều kiện theo mốc khách đã thanh toán nhưng tiền chưa về; mỗi nhóm xếp khoản tới hạn lớn nhất lên đầu.'))
    if todo:
        out.append(sec(5, 'Việc cần làm', f'<div class="card"><ul class="todo">{"".join(f"<li>{x}</li>" for x in todo)}</ul></div>', keep=True))
    out.append(f'''<section class="appendix"><h2><span class="sn">PL</span>Phụ lục: giao dịch trong kỳ</h2>
<div class="card"><table class="t compact"><thead><tr><th>Ngày</th><th>Hạng mục</th><th>Ghi chú</th><th class="r">Số tiền</th></tr></thead>
<tbody>{appx or '<tr><td colspan="4" class="muted">Chưa có giao dịch.</td></tr>'}</tbody></table></div></section>
<footer>Lập từ dữ liệu app Sổ Thu Chi, số liệu chốt ngày {dmy(b)}. Tổng tài sản = thu nhập + vốn có sẵn − chi tiêu − trả nợ; tiền mặt = tổng tài sản − phần đang đầu tư; tài sản ròng = tổng tài sản − dư nợ.</footer>
</div>
''')
    return '\n'.join(out)


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
