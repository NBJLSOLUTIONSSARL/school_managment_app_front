const SUBJECT_PALETTES = {
  Mathématiques: { bg: '#EBF3FC', border: '#BDD8FC', text: '#163E91' },
  Français: { bg: '#FFF0E6', border: '#FDCFA8', text: '#93310D' },
  Sciences: { bg: '#E8F8F0', border: '#A1EFCA', text: '#065942' },
  'Physique-Chimie': { bg: '#E8F8F0', border: '#A1EFCA', text: '#065942' },
  Physique: { bg: '#E8F8F0', border: '#A1EFCA', text: '#065942' },
  Chimie: { bg: '#E8F8F0', border: '#A1EFCA', text: '#065942' },
  SVT: { bg: '#E8F8F0', border: '#A1EFCA', text: '#065942' },
  Anglais: { bg: '#F5ECFE', border: '#E4CBFE', text: '#621B9E' },
  Arabe: { bg: '#F5ECFE', border: '#E4CBFE', text: '#621B9E' },
  Espagnol: { bg: '#F5ECFE', border: '#E4CBFE', text: '#621B9E' },
  Allemand: { bg: '#F5ECFE', border: '#E4CBFE', text: '#621B9E' },
  Sport: { bg: '#EBF3FC', border: '#BDD8FC', text: '#163E91' },
  Musique: { bg: '#FFF0E6', border: '#FDCFA8', text: '#93310D' },
  'Arts Plastiques': { bg: '#ECEEFF', border: '#C2CEFE', text: '#312A99' },
  Histoire: { bg: '#F5ECFE', border: '#E4CBFE', text: '#621B9E' },
  'Histoire-Géographie': { bg: '#F5ECFE', border: '#E4CBFE', text: '#621B9E' },
  Géographie: { bg: '#F5ECFE', border: '#E4CBFE', text: '#621B9E' },
  Philosophie: { bg: '#FFF0E6', border: '#FDCFA8', text: '#93310D' },
  Informatique: { bg: '#E8F8F0', border: '#A1EFCA', text: '#065942' },
  Technologie: { bg: '#E8F8F0', border: '#A1EFCA', text: '#065942' },
  Économie: { bg: '#EBF3FC', border: '#BDD8FC', text: '#163E91' },
  SES: { bg: '#EBF3FC', border: '#BDD8FC', text: '#163E91' },
};

const DEFAULT_PALETTE = { bg: '#FAF8F5', border: '#E2DDD5', text: '#1E293B' };

const WIN_ANSI_MAP = {
  'é': '\\351', 'è': '\\350', 'ê': '\\352', 'ë': '\\353',
  'à': '\\340', 'â': '\\342', 'ä': '\\344',
  'î': '\\356', 'ï': '\\357',
  'ô': '\\364', 'ö': '\\366',
  'ù': '\\371', 'û': '\\373', 'ü': '\\374',
  'ç': '\\347',
  'É': '\\311', 'È': '\\310', 'Ê': '\\312', 'Ë': '\\313',
  'À': '\\300', 'Â': '\\302', 'Ä': '\\304',
  'Î': '\\316', 'Ï': '\\317',
  'Ô': '\\324', 'Ö': '\\326',
  'Ù': '\\331', 'Û': '\\333', 'Ü': '\\334',
  'Ç': '\\307',
  '«': '\\253', '»': '\\273',
  '•': '\\225', '–': '\\226', '—': '\\227',
  '’': '\\222', '‘': '\\221', '“': '\\223', '”': '\\224'
};

function toPdfWinAnsiLiteral(str) {
  if (!str) return '';
  let res = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '\\' || ch === '(' || ch === ')') {
      res += '\\' + ch;
    } else if (WIN_ANSI_MAP[ch]) {
      res += WIN_ANSI_MAP[ch];
    } else {
      const code = ch.charCodeAt(0);
      if (code >= 32 && code <= 126) {
        res += ch;
      } else {
        res += ' ';
      }
    }
  }
  return res.replace(/\s+/g, ' ').trim();
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawDiamond(ctx, cx, cy, size, fillStyle) {
  ctx.save();
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.lineTo(cx + size, cy);
  ctx.lineTo(cx, cy + size);
  ctx.lineTo(cx - size, cy);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCornerBracket(ctx, x, y, size, dirX, dirY, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x + dirX * size, y);
  ctx.lineTo(x, y);
  ctx.lineTo(x, y + dirY * size);
  ctx.stroke();
  drawDiamond(ctx, x + dirX * (size + 6), y, 3.5, color);
  drawDiamond(ctx, x, y + dirY * (size + 6), 3.5, color);
  drawDiamond(ctx, x + dirX * 10, y + dirY * 10, 4.5, color);
  ctx.restore();
}

function drawSchoolEmblem(ctx, cx, cy, radius) {
  ctx.save();
  ctx.strokeStyle = '#C5A880';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#E8DFC9';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#0E1E2E';
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#C5A880';
  ctx.strokeStyle = '#C5A880';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(cx, cy - 26);
  ctx.lineTo(cx - 24, cy - 12);
  ctx.lineTo(cx + 24, cy - 12);
  ctx.closePath();
  ctx.fill();

  ctx.fillRect(cx - 26, cy - 11, 52, 4);

  const colWidth = 5;
  const colHeight = 22;
  const colY = cy - 6;
  const colXs = [cx - 20, cx - 10, cx + 5, cx + 15];
  for (const x of colXs) {
    ctx.fillRect(x, colY, colWidth, colHeight);
  }

  ctx.fillRect(cx - 25, cy + 17, 50, 4);
  ctx.fillRect(cx - 28, cy + 22, 56, 4);

  drawDiamond(ctx, cx, cy - 32, 4, '#DFC2A0');
  ctx.restore();
}

function getFormattedDate() {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  } catch {
    return '04 novembre 2026';
  }
}

function drawFittedText(ctx, text, x, y, maxWidth, initialSize, minSize, fontSpec, align = 'center') {
  let size = initialSize;
  ctx.textAlign = align;
  ctx.font = fontSpec(size);
  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size -= 1;
    ctx.font = fontSpec(size);
  }
  ctx.fillText(text, x, y);
  return size;
}

function buildPdfBinary(jpegBytes, imgWidth, imgHeight, textItems = []) {
  const enc = new TextEncoder();
  const chunks = [];
  const offsets = [];
  let currentOffset = 0;

  function addChunk(uint8Arr) {
    chunks.push(uint8Arr);
    currentOffset += uint8Arr.length;
  }

  function addString(str) {
    addChunk(enc.encode(str));
  }

  addString('%PDF-1.4\r\n%\xE2\xE3\xCF\xD3\r\n');

  offsets.push(currentOffset);
  addString('1 0 obj\r\n<<\r\n  /Type /Catalog\r\n  /Pages 2 0 R\r\n>>\r\nendobj\r\n');

  offsets.push(currentOffset);
  addString('2 0 obj\r\n<<\r\n  /Type /Pages\r\n  /Kids [3 0 R]\r\n  /Count 1\r\n>>\r\nendobj\r\n');

  offsets.push(currentOffset);
  addString('3 0 obj\r\n<<\r\n  /Type /Page\r\n  /Parent 2 0 R\r\n  /MediaBox [0 0 841.89 595.28]\r\n  /Resources <<\r\n    /XObject << /Im1 4 0 R >>\r\n    /Font << /F1 6 0 R >>\r\n    /ProcSet [/PDF /Text /ImageC]\r\n  >>\r\n  /Contents 5 0 R\r\n>>\r\nendobj\r\n');

  offsets.push(currentOffset);
  addString(
    '4 0 obj\r\n<<\r\n  /Type /XObject\r\n  /Subtype /Image\r\n  /Width ' +
      imgWidth +
      '\r\n  /Height ' +
      imgHeight +
      '\r\n  /ColorSpace /DeviceRGB\r\n  /BitsPerComponent 8\r\n  /Filter /DCTDecode\r\n  /Length ' +
      jpegBytes.length +
      '\r\n>>\r\nstream\r\n'
  );
  addChunk(jpegBytes);
  addString('\r\nendstream\r\nendobj\r\n');

  let textOps = '';
  if (textItems && textItems.length > 0) {
    textOps += 'BT\r\n/F1 10 Tf\r\n3 Tr\r\n';
    for (const item of textItems) {
      if (!item.text) continue;
      const clean = toPdfWinAnsiLiteral(item.text);
      if (!clean) continue;
      const x = Number(item.x || 0).toFixed(2);
      const y = Number(item.y || 0).toFixed(2);
      const size = Number(item.size || 10).toFixed(2);
      textOps += '/F1 ' + size + ' Tf\r\n';
      textOps += '1 0 0 1 ' + x + ' ' + y + ' Tm\r\n';
      textOps += '(' + clean + ') Tj\r\n';
    }
    textOps += 'ET\r\n';
  }

  const contentStreamStr = 'q\r\n841.89 0 0 595.28 0 0 cm\r\n/Im1 Do\r\nQ\r\n' + textOps;
  const contentBytes = enc.encode(contentStreamStr);

  offsets.push(currentOffset);
  addString('5 0 obj\r\n<<\r\n  /Length ' + contentBytes.length + '\r\n>>\r\nstream\r\n');
  addChunk(contentBytes);
  addString('\r\nendstream\r\nendobj\r\n');

  offsets.push(currentOffset);
  addString('6 0 obj\r\n<<\r\n  /Type /Font\r\n  /Subtype /Type1\r\n  /BaseFont /Helvetica\r\n  /Encoding /WinAnsiEncoding\r\n>>\r\nendobj\r\n');

  const startxref = currentOffset;
  let xref = 'xref\r\n0 7\r\n0000000000 65535 f \r\n';
  for (const off of offsets) {
    xref += String(off).padStart(10, '0') + ' 00000 n \r\n';
  }
  xref += 'trailer\r\n<<\r\n  /Size 7\r\n  /Root 1 0 R\r\n>>\r\nstartxref\r\n' + startxref + '\r\n%%EOF\r\n';
  addString(xref);

  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
  const merged = new Uint8Array(totalLength);
  let pos = 0;
  for (const c of chunks) {
    merged.set(c, pos);
    pos += c.length;
  }
  return merged;
}

export async function generateTimetableCanvas(data = {}) {
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {}
  }

  const canvasWidth = 3508;
  const canvasHeight = 2480;
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  const schoolName = (data.schoolName && data.schoolName.trim()) || 'Académie Lumière';
  const className = (data.className && data.className.trim()) || '1ère A';
  const academicYear = (data.academicYear && data.academicYear.trim()) || '2026 – 2027';
  const semester = (data.semester && data.semester.trim()) || 'Semestre 1';
  const slots = Array.isArray(data.slots) ? data.slots : [];
  const daysList = Array.isArray(data.daysList) && data.daysList.length > 0
    ? data.daysList
    : ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

  const allTimeRows = [];
  if (Array.isArray(data.timeRows) && data.timeRows.length > 0) {
    for (const tr of data.timeRows) {
      if (tr && !allTimeRows.includes(tr)) allTimeRows.push(tr);
    }
  }
  for (const s of slots) {
    if (s && s.timeSlotLabel && !allTimeRows.includes(s.timeSlotLabel)) {
      allTimeRows.push(s.timeSlotLabel);
    }
  }
  if (allTimeRows.length === 0) {
    allTimeRows.push('08h – 09h', '09h – 10h', '10h – 11h', '11h – 12h', '14h – 15h');
  }

  function parseStartHour(label) {
    const match = String(label).match(/(\d{1,2})[h:]/i);
    return match ? parseInt(match[1], 10) : 8;
  }

  allTimeRows.sort((a, b) => parseStartHour(a) - parseStartHour(b));

  const morningRows = allTimeRows.filter((r) => parseStartHour(r) < 12);
  const afternoonRows = allTimeRows.filter((r) => parseStartHour(r) >= 12);

  function normalizeTime(str) {
    return String(str || '')
      .replace(/\s*[\u2013\u2014-]\s*/g, '-')
      .replace(/\s+/g, '')
      .toLowerCase();
  }

  function findSlot(day, timeLabel) {
    const normTarget = normalizeTime(timeLabel);
    const targetHour = parseStartHour(timeLabel);
    return slots.find((s) => {
      if (!s || !s.dayOfWeek) return false;
      if (s.dayOfWeek.toLowerCase() !== day.toLowerCase()) return false;
      if (s.timeSlotLabel && normalizeTime(s.timeSlotLabel) === normTarget) return true;
      if (s.startTime && parseStartHour(s.startTime) === targetHour) return true;
      return false;
    });
  }

  const textItems = [];
  function recordText(text, cx, cy, fontSize) {
    if (!text) return;
    const px = (cx / canvasWidth) * 841.89;
    const py = 595.28 - (cy / canvasHeight) * 595.28;
    const size = (fontSize / canvasHeight) * 595.28;
    textItems.push({ text, x: px, y: py, size });
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.strokeStyle = '#C5A880';
  ctx.lineWidth = 4;
  ctx.strokeRect(60, 55, canvasWidth - 120, canvasHeight - 110);

  ctx.strokeStyle = 'rgba(197, 168, 128, 0.65)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(74, 69, canvasWidth - 148, canvasHeight - 138);

  const innerX = 74;
  const innerY = 69;
  const innerW = canvasWidth - 148;
  const innerH = canvasHeight - 138;
  drawCornerBracket(ctx, innerX + 16, innerY + 16, 36, 1, 1, '#C5A880');
  drawCornerBracket(ctx, innerX + innerW - 16, innerY + 16, 36, -1, 1, '#C5A880');
  drawCornerBracket(ctx, innerX + 16, innerY + innerH - 16, 36, 1, -1, '#C5A880');
  drawCornerBracket(ctx, innerX + innerW - 16, innerY + innerH - 16, 36, -1, -1, '#C5A880');

  drawSchoolEmblem(ctx, 185, 185, 52);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = '#0E1E2E';
  ctx.font = 'bold 42px "Cinzel", "Playfair Display", Georgia, serif';
  ctx.fillText(schoolName.toUpperCase(), 265, 168);
  recordText(schoolName, 265, 168, 42);

  ctx.fillStyle = '#967448';
  ctx.font = 'italic 22px "Playfair Display", Georgia, serif';
  ctx.fillText('Apprendre • Réussir • Grandir', 265, 204);
  recordText('Apprendre • Réussir • Grandir', 265, 204, 22);

  ctx.fillStyle = '#78716C';
  ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText("Établissement Privé d'Excellence • Document Pédagogique", 265, 236);

  const cardW = 270;
  const cardH = 74;
  const cardY = 135;

  const card1X = 3120;
  ctx.fillStyle = '#FAF7F2';
  ctx.strokeStyle = '#E8DFC9';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, card1X, cardY, cardW, cardH, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#8C7149';
  ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('ANNÉE SCOLAIRE', card1X + 22, cardY + 28);
  ctx.fillStyle = '#0E1E2E';
  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(academicYear, card1X + 22, cardY + 56);
  recordText(academicYear, card1X + 22, cardY + 56, 20);

  const card2X = 2825;
  ctx.fillStyle = '#FAF7F2';
  ctx.strokeStyle = '#E8DFC9';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, card2X, cardY, cardW, cardH, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#8C7149';
  ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('PÉRIODE', card2X + 22, cardY + 28);
  ctx.fillStyle = '#0E1E2E';
  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(semester, card2X + 22, cardY + 56);
  recordText(semester, card2X + 22, cardY + 56, 20);

  const centerX = canvasWidth / 2;
  const bannerW = 760;
  const bannerH = 82;
  const bannerX = centerX - bannerW / 2;
  const bannerY = 115;

  ctx.fillStyle = '#0E1E2E';
  ctx.strokeStyle = '#C5A880';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, bannerX, bannerY, bannerW, bannerH, 41);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(223, 194, 160, 0.5)';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, bannerX + 6, bannerY + 6, bannerW - 12, bannerH - 12, 35);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px "Cinzel", "Playfair Display", Georgia, serif';
  ctx.fillText('EMPLOI DU TEMPS', centerX, bannerY + 53);
  recordText('EMPLOI DU TEMPS', centerX - 180, bannerY + 53, 36);

  ctx.strokeStyle = '#C5A880';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(centerX - 480, 236);
  ctx.lineTo(centerX - 270, 236);
  ctx.stroke();
  drawDiamond(ctx, centerX - 484, 236, 4, '#C5A880');

  ctx.beginPath();
  ctx.moveTo(centerX + 270, 236);
  ctx.lineTo(centerX + 480, 236);
  ctx.stroke();
  drawDiamond(ctx, centerX + 484, 236, 4, '#C5A880');

  const pillW = 500;
  const pillH = 44;
  const pillX = centerX - pillW / 2;
  const pillY = 214;
  ctx.fillStyle = '#FAF7F2';
  ctx.strokeStyle = '#C5A880';
  ctx.lineWidth = 1.8;
  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 22);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0E1E2E';
  ctx.font = 'bold 19px "Cinzel", "Plus Jakarta Sans", sans-serif';
  const classLabel = 'CLASSE : ' + className.toUpperCase();
  ctx.fillText(classLabel, centerX, pillY + 29);
  recordText(classLabel, centerX - 100, pillY + 29, 19);

  const tableX = 114;
  const tableW = 3280;
  const colTimeW = 380;
  const colDayW = (tableW - colTimeW) / daysList.length;

  const headerH = 82;
  const tableY = 285;

  ctx.fillStyle = '#0E1E2E';
  ctx.beginPath();
  ctx.moveTo(tableX + 16, tableY);
  ctx.lineTo(tableX + tableW - 16, tableY);
  ctx.arcTo(tableX + tableW, tableY, tableX + tableW, tableY + 16, 16);
  ctx.lineTo(tableX + tableW, tableY + headerH);
  ctx.lineTo(tableX, tableY + headerH);
  ctx.lineTo(tableX, tableY + 16);
  ctx.arcTo(tableX, tableY, tableX + 16, tableY, 16);
  ctx.closePath();
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#DFC2A0';
  ctx.font = 'bold 18px "Cinzel", "Plus Jakarta Sans", sans-serif';
  ctx.fillText('HORAIRE', tableX + colTimeW / 2, tableY + 48);
  recordText('HORAIRE', tableX + colTimeW / 2 - 40, tableY + 48, 18);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px "Cinzel", "Playfair Display", Georgia, serif';
  for (let i = 0; i < daysList.length; i++) {
    const dayName = daysList[i];
    const dx = tableX + colTimeW + i * colDayW;

    ctx.strokeStyle = '#24374D';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(dx, tableY);
    ctx.lineTo(dx, tableY + headerH);
    ctx.stroke();

    ctx.fillText(dayName.toUpperCase(), dx + colDayW / 2, tableY + 50);
    recordText(dayName, dx + colDayW / 2 - 40, tableY + 50, 22);
  }

  const hasPauseRow = morningRows.length > 0 && afternoonRows.length > 0;
  const regularRowCount = morningRows.length + afternoonRows.length;
  const totalUnits = regularRowCount + (hasPauseRow ? 0.42 : 0);
  const availableTableH = 1730;
  const regularRowH = Math.floor(availableTableH / totalUnits);
  const pauseRowH = Math.floor(regularRowH * 0.42);

  let currentY = tableY + headerH;

  function renderSlotRow(timeLabel) {
    const rowY = currentY;
    const rowH = regularRowH;

    ctx.fillStyle = '#FFF8EC';
    ctx.fillRect(tableX, rowY, colTimeW, rowH);

    ctx.strokeStyle = '#E2D6C5';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tableX + colTimeW, rowY);
    ctx.lineTo(tableX + colTimeW, rowY + rowH);
    ctx.stroke();

    const timePillW = colTimeW - 40;
    const timePillH = Math.min(56, Math.floor(rowH * 0.35));
    const timePillX = tableX + 20;
    const timePillY = rowY + (rowH - timePillH) / 2;

    ctx.fillStyle = '#FAF0DE';
    ctx.strokeStyle = '#DFC2A0';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, timePillX, timePillY, timePillW, timePillH, 14);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#8D4B26';
    const timeFontSize = Math.min(21, Math.max(15, Math.floor(timePillH * 0.45)));
    ctx.font = `bold ${timeFontSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillText(timeLabel, tableX + colTimeW / 2, timePillY + timePillH * 0.65);
    recordText(timeLabel, tableX + 30, timePillY + timePillH * 0.65, timeFontSize);

    for (let di = 0; di < daysList.length; di++) {
      const day = daysList[di];
      const cellX = tableX + colTimeW + di * colDayW;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(cellX, rowY, colDayW, rowH);

      ctx.strokeStyle = '#E5DFD5';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cellX + colDayW, rowY);
      ctx.lineTo(cellX + colDayW, rowY + rowH);
      ctx.stroke();

      const slot = findSlot(day, timeLabel);

      if (slot && slot.subject && slot.subject !== '—' && slot.subject.toLowerCase() !== 'libre') {
        const pal = SUBJECT_PALETTES[slot.subject] || DEFAULT_PALETTE;
        const padX = 14;
        const padY = Math.max(8, Math.floor(rowH * 0.05));
        const cardX = cellX + padX;
        const cardY = rowY + padY;
        const cardWidth = colDayW - padX * 2;
        const cardHeight = rowH - padY * 2;

        ctx.fillStyle = pal.bg;
        ctx.strokeStyle = pal.border;
        ctx.lineWidth = 1.5;
        drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 14);
        ctx.fill();
        ctx.stroke();

        const hasTeacher = Boolean(slot.teacherName && String(slot.teacherName).trim());
        const hasRoom = Boolean(slot.classroomName && String(slot.classroomName).trim());

        const subjInitSize = Math.min(28, Math.max(18, Math.floor(cardHeight * 0.13)));
        const teachInitSize = Math.min(20, Math.max(13, Math.floor(cardHeight * 0.09)));
        const roomInitSize = Math.min(17, Math.max(12, Math.floor(cardHeight * 0.08)));
        const roomPillH = Math.min(38, Math.max(26, Math.floor(cardHeight * 0.16)));

        let subjY;
        let teachY;
        let roomPillY;

        if (!hasTeacher && !hasRoom) {
          subjY = cardY + cardHeight / 2 + subjInitSize * 0.35;
        } else if (hasTeacher && !hasRoom) {
          subjY = cardY + cardHeight * 0.40;
          teachY = cardY + cardHeight * 0.72;
        } else if (!hasTeacher && hasRoom) {
          subjY = cardY + cardHeight * 0.38;
          roomPillY = cardY + cardHeight * 0.62;
        } else {
          subjY = cardY + cardHeight * 0.28;
          teachY = cardY + cardHeight * 0.53;
          roomPillY = cardY + cardHeight * 0.70;
        }

        ctx.fillStyle = pal.text;
        const actualSubjSize = drawFittedText(
          ctx,
          slot.subject,
          cardX + cardWidth / 2,
          subjY,
          cardWidth - 24,
          subjInitSize,
          15,
          (s) => `bold ${s}px "Playfair Display", Georgia, serif`
        );
        recordText(slot.subject, cardX + 20, subjY, actualSubjSize);

        if (hasTeacher) {
          ctx.fillStyle = '#475569';
          const teacherDisplay = '👤  ' + String(slot.teacherName).trim();
          const actualTeachSize = drawFittedText(
            ctx,
            teacherDisplay,
            cardX + cardWidth / 2,
            teachY,
            cardWidth - 24,
            teachInitSize,
            12,
            (s) => `600 ${s}px "Plus Jakarta Sans", "Segoe UI Emoji", sans-serif`
          );
          recordText(String(slot.teacherName).trim(), cardX + 20, teachY, actualTeachSize);
        }

        if (hasRoom) {
          const roomDisplay = '📍  ' + String(slot.classroomName).trim();
          let rSize = roomInitSize;
          ctx.font = `600 ${rSize}px "Plus Jakarta Sans", "Segoe UI Emoji", sans-serif`;
          while (ctx.measureText(roomDisplay).width > cardWidth - 40 && rSize > 11) {
            rSize -= 1;
            ctx.font = `600 ${rSize}px "Plus Jakarta Sans", "Segoe UI Emoji", sans-serif`;
          }
          const roomW = Math.min(cardWidth - 20, Math.max(180, ctx.measureText(roomDisplay).width + 28));
          const roomX = cardX + (cardWidth - roomW) / 2;

          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = '#CBD5E1';
          ctx.lineWidth = 1;
          drawRoundedRect(ctx, roomX, roomPillY, roomW, roomPillH, 10);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#64748B';
          ctx.textAlign = 'center';
          ctx.font = `600 ${rSize}px "Plus Jakarta Sans", "Segoe UI Emoji", sans-serif`;
          ctx.fillText(roomDisplay, cardX + cardWidth / 2, roomPillY + roomPillH * 0.68);
          recordText(String(slot.classroomName).trim(), cardX + 20, roomPillY + roomPillH * 0.68, rSize);
        }
      } else {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#CBD5E1';
        ctx.font = '26px sans-serif';
        ctx.fillText('—', cellX + colDayW / 2, rowY + rowH / 2 + 8);
      }
    }

    ctx.strokeStyle = '#E5DFD5';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tableX, rowY + rowH);
    ctx.lineTo(tableX + tableW, rowY + rowH);
    ctx.stroke();

    currentY += rowH;
  }

  for (const timeLabel of morningRows) {
    renderSlotRow(timeLabel);
  }

  if (hasPauseRow) {
    const pauseY = currentY;
    const pauseH = pauseRowH;

    ctx.fillStyle = '#FCEBD8';
    ctx.fillRect(tableX, pauseY, colTimeW, pauseH);

    ctx.strokeStyle = '#DFC2A0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tableX + colTimeW, pauseY);
    ctx.lineTo(tableX + colTimeW, pauseY + pauseH);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#8D4B26';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('12h – 14h', tableX + colTimeW / 2, pauseY + pauseH / 2 + 7);
    recordText('12h – 14h', tableX + 30, pauseY + pauseH / 2 + 7, 20);

    const daySpanX = tableX + colTimeW;
    const daySpanW = tableW - colTimeW;

    ctx.fillStyle = '#FFF8EE';
    ctx.fillRect(daySpanX, pauseY, daySpanW, pauseH);

    ctx.strokeStyle = '#DFC2A0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tableX, pauseY);
    ctx.lineTo(tableX + tableW, pauseY);
    ctx.moveTo(tableX, pauseY + pauseH);
    ctx.lineTo(tableX + tableW, pauseY + pauseH);
    ctx.stroke();

    const pauseLineLeftEnd = centerX - 260;
    const pauseLineRightStart = centerX + 260;
    ctx.beginPath();
    ctx.moveTo(daySpanX + 40, pauseY + pauseH / 2);
    ctx.lineTo(pauseLineLeftEnd, pauseY + pauseH / 2);
    ctx.moveTo(pauseLineRightStart, pauseY + pauseH / 2);
    ctx.lineTo(tableX + tableW - 40, pauseY + pauseH / 2);
    ctx.stroke();

    drawDiamond(ctx, daySpanX + 36, pauseY + pauseH / 2, 4, '#DFC2A0');
    drawDiamond(ctx, tableX + tableW - 36, pauseY + pauseH / 2, 4, '#DFC2A0');

    const pauseBadgeW = 480;
    const pauseBadgeH = Math.min(pauseH - 16, 52);
    const pauseBadgeX = centerX - pauseBadgeW / 2;
    const pauseBadgeY = pauseY + (pauseH - pauseBadgeH) / 2;

    ctx.fillStyle = '#FAF0DE';
    ctx.strokeStyle = '#C5A880';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, pauseBadgeX, pauseBadgeY, pauseBadgeW, pauseBadgeH, pauseBadgeH / 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#8D4B26';
    ctx.font = 'bold 21px "Cinzel", "Playfair Display", Georgia, serif';
    ctx.fillText('☕  PAUSE DÉJEUNER', centerX, pauseBadgeY + pauseBadgeH / 2 + 7);
    recordText('PAUSE DEJEUNER', centerX - 100, pauseBadgeY + pauseBadgeH / 2 + 7, 21);

    currentY += pauseH;
  }

  for (const timeLabel of afternoonRows) {
    renderSlotRow(timeLabel);
  }

  ctx.strokeStyle = '#C5A880';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(tableX + 16, tableY);
  ctx.lineTo(tableX + tableW - 16, tableY);
  ctx.arcTo(tableX + tableW, tableY, tableX + tableW, tableY + 16, 16);
  ctx.lineTo(tableX + tableW, currentY);
  ctx.lineTo(tableX, currentY);
  ctx.lineTo(tableX, tableY + 16);
  ctx.arcTo(tableX, tableY, tableX + 16, tableY, 16);
  ctx.closePath();
  ctx.stroke();

  const footerDividerY = currentY + 35;
  ctx.strokeStyle = '#C5A880';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(tableX, footerDividerY);
  ctx.lineTo(tableX + tableW, footerDividerY);
  ctx.stroke();

  drawDiamond(ctx, centerX, footerDividerY, 6, '#C5A880');
  drawDiamond(ctx, tableX + 4, footerDividerY, 4, '#C5A880');
  drawDiamond(ctx, tableX + tableW - 4, footerDividerY, 4, '#C5A880');

  const footerContentY = footerDividerY + 40;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0E1E2E';
  ctx.font = 'bold 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(schoolName + " • Document Officiel d'Organisation Scolaire", tableX + 10, footerContentY);

  ctx.fillStyle = '#78716C';
  ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Généré automatiquement par le système le ' + getFormattedDate(), tableX + 10, footerContentY + 28);

  ctx.fillStyle = '#166534';
  ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('✓ Emploi du temps validé et certifié conforme', tableX + 10, footerContentY + 54);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#0E1E2E';
  ctx.font = 'italic 23px "Playfair Display", Georgia, serif';
  ctx.fillText("« L'excellence et la persévérance ouvrent la voie de la réussite »", centerX, footerContentY + 14);

  ctx.fillStyle = '#967448';
  ctx.font = 'bold 19px "Playfair Display", Georgia, serif';
  ctx.fillText('Bonne année scolaire ' + academicYear + ' !', centerX, footerContentY + 46);

  const sigRightX = tableX + tableW - 10;
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0E1E2E';
  ctx.font = 'bold 18px "Cinzel", "Playfair Display", serif';
  ctx.fillText("Le Directeur de l'Établissement", sigRightX, footerContentY);

  const sigLineW = 260;
  ctx.strokeStyle = '#0E1E2E';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sigRightX - sigLineW, footerContentY + 48);
  ctx.lineTo(sigRightX, footerContentY + 48);
  ctx.stroke();

  ctx.fillStyle = '#78716C';
  ctx.font = 'italic 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Cachet & Signature officielle', sigRightX, footerContentY + 70);

  return { canvas, textItems };
}

export async function generateTimetablePdfBlob(data = {}) {
  const { canvas, textItems } = await generateTimetableCanvas(data);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
  const base64 = dataUrl.split(',')[1];
  const binStr = atob(base64);
  const len = binStr.length;
  const jpegBytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    jpegBytes[i] = binStr.charCodeAt(i);
  }

  const pdfBytes = buildPdfBinary(jpegBytes, canvas.width, canvas.height, textItems);
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export async function downloadTimetablePdf(data = {}) {
  const blob = await generateTimetablePdfBlob(data);
  const rawClass = data.className || 'Classe';
  const cleanClass = String(rawClass)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_') || 'Generale';
  const filename = 'Emploi_du_temps_Classe_' + cleanClass + '.pdf';

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1500);
  return { success: true, filename };
}
