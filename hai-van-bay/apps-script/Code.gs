/**
 * Hệ thống lưu khách hàng cho landing page Hải Vân Bay.
 * Dán toàn bộ file này vào Google Apps Script gắn với một Google Sheet
 * (Tiện ích mở rộng → Apps Script), rồi Triển khai → Ứng dụng web.
 * Hướng dẫn chi tiết: hai-van-bay/README.md
 *
 * Trang gửi về 3 loại sự kiện (JSON, Content-Type text/plain):
 *   visit   – khi khách mở trang (ghi 1 dòng vào tab LuotXem)
 *   engage  – khi khách rời / ẩn trang (cập nhật thời gian xem, độ cuộn… vào đúng dòng đó)
 *   lead    – khi khách gửi form (ghi vào tab DangKy + gửi email báo cho bạn)
 */

// ===== CẤU HÌNH =====
var NOTIFY_EMAIL = '';           // Email nhận thông báo khi có khách đăng ký. Để trống = email chủ script.
var NOTIFY_ON_VISIT_WITH_CODE = true; // Gửi email khi khách mở link cá nhân (có ?kh=...) lần đầu.
var TIMEZONE = 'Asia/Ho_Chi_Minh';

var VISIT_SHEET = 'LuotXem';
var LEAD_SHEET = 'DangKy';

var VISIT_HEADERS = [
  'Thời gian', 'Mã phiên', 'Mã trình duyệt', 'Lượt xem thứ', 'Mã KH (link)', 'Tên KH (link)',
  'Nguồn (utm_source)', 'Kênh (utm_medium)', 'Chiến dịch (utm_campaign)', 'Nội dung (utm_content)',
  'Trang dẫn tới', 'Thiết bị', 'Hệ điều hành', 'Trình duyệt', 'Màn hình', 'Ngôn ngữ', 'Múi giờ',
  'Địa chỉ trang', 'Thời gian xem (giây)', 'Cuộn tối đa (%)', 'Mục đã xem', 'Nút đã bấm', 'Đã để lại thông tin'
];
var LEAD_HEADERS = [
  'Thời gian', 'Họ tên', 'Số điện thoại', 'Email', 'Nhu cầu', 'Sản phẩm quan tâm', 'Ngân sách',
  'Thời gian tiện liên hệ', 'Lời nhắn', 'Mã KH (link)', 'Nguồn', 'Chiến dịch', 'Mã trình duyệt',
  'Mã phiên', 'Số lượt xem trước đó', 'Đồng ý liên hệ', 'Trạng thái', 'Người phụ trách', 'Ghi chú chăm sóc'
];

// ===== ĐIỂM VÀO =====
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var type = String(data.type || '');
    if (type === 'visit') return json_(recordVisit_(data));
    if (type === 'engage') return json_(recordEngage_(data));
    if (type === 'lead') return json_(recordLead_(data));
    return json_({ ok: false, error: 'unknown_type' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function doGet() {
  return json_({ ok: true, service: 'hai-van-bay-leads' });
}

// ===== XỬ LÝ =====
function recordVisit_(d) {
  var sh = sheet_(VISIT_SHEET, VISIT_HEADERS);
  if (findRow_(sh, 2, d.sid)) return { ok: true, dup: true };
  sh.appendRow([
    now_(), s_(d.sid), s_(d.vid), Number(d.visitNo) || 1, s_(d.kh), s_(d.ten),
    s_(d.utm_source), s_(d.utm_medium), s_(d.utm_campaign), s_(d.utm_content),
    s_(d.referrer), s_(d.device), s_(d.os), s_(d.browser), s_(d.screen), s_(d.lang), s_(d.tz),
    s_(d.url), 0, 0, '', '', ''
  ]);
  if (NOTIFY_ON_VISIT_WITH_CODE && d.kh && Number(d.visitNo) === 1) {
    mail_('[Hải Vân Bay] Khách ' + (d.ten || d.kh) + ' vừa mở trang',
      'Khách có mã ' + d.kh + (d.ten ? ' (' + d.ten + ')' : '') + ' vừa mở landing page lúc ' + now_() +
      '.\nThiết bị: ' + [d.device, d.os, d.browser].join(' / ') +
      '\nNguồn: ' + [d.utm_source, d.utm_campaign].filter(String).join(' / ') +
      '\n\nĐây là thời điểm tốt để gọi chăm sóc.');
  }
  return { ok: true };
}

function recordEngage_(d) {
  var sh = sheet_(VISIT_SHEET, VISIT_HEADERS);
  var row = findRow_(sh, 2, d.sid);
  if (!row) return { ok: false, error: 'no_visit' };
  var cur = sh.getRange(row, 19, 1, 4).getValues()[0];
  var seconds = Math.max(Number(cur[0]) || 0, Math.min(Number(d.seconds) || 0, 6 * 3600));
  var scroll = Math.max(Number(cur[1]) || 0, Math.min(Number(d.scroll) || 0, 100));
  sh.getRange(row, 19, 1, 4).setValues([[
    seconds, scroll, mergeList_(cur[2], d.sections), mergeList_(cur[3], d.clicks)
  ]]);
  return { ok: true };
}

function recordLead_(d) {
  if (d.website) return { ok: true }; // ô bẫy chống spam: người thật không thấy ô này
  var name = String(d.name || '').trim();
  var phone = String(d.phone || '').replace(/[^\d+]/g, '');
  if (!name || !/^(\+?84|0)\d{9,10}$/.test(phone)) return { ok: false, error: 'invalid' };

  var sh = sheet_(LEAD_SHEET, LEAD_HEADERS);
  sh.appendRow([
    now_(), s_(name), "'" + phone, s_(d.email), s_(d.need), s_(d.product), s_(d.budget),
    s_(d.time), s_(d.message), s_(d.kh), s_(d.utm_source), s_(d.utm_campaign), s_(d.vid),
    s_(d.sid), Number(d.visitNo) || 1, d.consent ? 'Có' : 'Không', 'Mới', '', ''
  ]);

  var vs = sheet_(VISIT_SHEET, VISIT_HEADERS);
  var row = findRow_(vs, 2, d.sid);
  if (row) vs.getRange(row, 23).setValue('Có');

  mail_('[Hải Vân Bay] Khách mới: ' + name + ' – ' + phone,
    'Có khách vừa để lại thông tin trên landing page Hải Vân Bay.\n\n' +
    'Họ tên: ' + name + '\nSĐT: ' + phone + '\nEmail: ' + (d.email || '') +
    '\nNhu cầu: ' + (d.need || '') + '\nSản phẩm: ' + (d.product || '') +
    '\nNgân sách: ' + (d.budget || '') + '\nGiờ tiện liên hệ: ' + (d.time || '') +
    '\nLời nhắn: ' + (d.message || '') + '\nMã KH (link): ' + (d.kh || '') +
    '\nNguồn: ' + [d.utm_source, d.utm_campaign].filter(String).join(' / ') +
    '\nĐã xem trang ' + (Number(d.visitNo) || 1) + ' lần.\n\nMở Google Sheet: ' +
    SpreadsheetApp.getActiveSpreadsheet().getUrl());
  return { ok: true };
}

// ===== TIỆN ÍCH =====
function sheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold').setBackground('#0b3b4f').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  }
  return sh;
}

function findRow_(sh, col, value) {
  if (!value || sh.getLastRow() < 2) return 0;
  var cell = sh.getRange(2, col, sh.getLastRow() - 1, 1)
    .createTextFinder(String(value)).matchEntireCell(true).findNext();
  return cell ? cell.getRow() : 0;
}

function mergeList_(oldVal, list) {
  var set = {};
  String(oldVal || '').split(', ').concat(Array.isArray(list) ? list : [])
    .forEach(function (x) { x = String(x).trim().slice(0, 40); if (x) set[x] = 1; });
  return s_(Object.keys(set).join(', '));
}

// Làm sạch giá trị: cắt độ dài, chặn công thức (=, +, -, @) để tránh chèn công thức vào Sheet.
function s_(v) {
  v = v == null ? '' : String(v).slice(0, 500);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function now_() {
  return Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
}

function mail_(subject, body) {
  try {
    var to = NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
    if (to) MailApp.sendEmail(to, subject, body);
  } catch (e) {}
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Chạy hàm này 1 lần trong trình soạn thảo để tạo sẵn 2 tab và cấp quyền. */
function setup() {
  sheet_(VISIT_SHEET, VISIT_HEADERS);
  sheet_(LEAD_SHEET, LEAD_HEADERS);
}
