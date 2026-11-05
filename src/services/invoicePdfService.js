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

function buildPdfBinary(jpegBytes, widthPx, heightPx, textItems = []) {
  const ptW = 595.28;
  const ptH = 841.89;
  const scaleX = ptW / widthPx;
  const scaleY = ptH / heightPx;

  let streamText = '';
  streamText += 'q\n';
  streamText += `${ptW.toFixed(2)} 0 0 ${ptH.toFixed(2)} 0 0 cm\n`;
  streamText += '/Im0 Do\n';
  streamText += 'Q\n';

  if (textItems.length > 0) {
    streamText += 'BT\n/F1 9 Tf\n3 Tr\n';
    for (const item of textItems) {
      const pdfX = (item.x * scaleX).toFixed(2);
      const pdfY = ((heightPx - item.y) * scaleY).toFixed(2);
      const fontSize = Math.max(7, item.fontSize * scaleY).toFixed(2);
      const encoded = toPdfWinAnsiLiteral(item.text);
      if (encoded) {
        streamText += `/F1 ${fontSize} Tf 1 0 0 1 ${pdfX} ${pdfY} Tm (${encoded}) Tj\n`;
      }
    }
    streamText += 'ET\n';
  }

  const textBytes = new TextEncoder().encode(streamText);

  const objects = [];
  function addObject(contentBytes) {
    const objNum = objects.length + 1;
    objects.push({ num: objNum, bytes: contentBytes });
    return objNum;
  }

  const catalogObjNum = 1;
  const pagesObjNum = 2;
  const pageObjNum = 3;
  const fontObjNum = 4;
  const imageObjNum = 5;
  const contentsObjNum = 6;

  const catalogStr = `<< /Type /Catalog /Pages ${pagesObjNum} 0 R >>`;
  const pagesStr = `<< /Type /Pages /Kids [${pageObjNum} 0 R] /Count 1 >>`;
  const pageStr = `<< /Type /Page /Parent ${pagesObjNum} 0 R /MediaBox [0 0 ${ptW.toFixed(2)} ${ptH.toFixed(2)}] /Resources << /Font << /F1 ${fontObjNum} 0 R >> /XObject << /Im0 ${imageObjNum} 0 R >> /ProcSet [/PDF /Text /ImageC] >> /Contents ${contentsObjNum} 0 R >>`;
  const fontStr = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';

  const imageHeader = `<< /Type /XObject /Subtype /Image /Width ${widthPx} /Height ${heightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`;
  const imageFooter = '\nendstream';
  const imgHeaderBytes = new TextEncoder().encode(imageHeader);
  const imgFooterBytes = new TextEncoder().encode(imageFooter);
  const fullImageBytes = new Uint8Array(imgHeaderBytes.length + jpegBytes.length + imgFooterBytes.length);
  fullImageBytes.set(imgHeaderBytes, 0);
  fullImageBytes.set(jpegBytes, imgHeaderBytes.length);
  fullImageBytes.set(imgFooterBytes, imgHeaderBytes.length + jpegBytes.length);

  const contentsHeader = `<< /Length ${textBytes.length} >>\nstream\n`;
  const contentsFooter = '\nendstream';
  const contentsHBytes = new TextEncoder().encode(contentsHeader);
  const contentsFBytes = new TextEncoder().encode(contentsFooter);
  const fullContentsBytes = new Uint8Array(contentsHBytes.length + textBytes.length + contentsFBytes.length);
  fullContentsBytes.set(contentsHBytes, 0);
  fullContentsBytes.set(textBytes, contentsHBytes.length);
  fullContentsBytes.set(contentsFBytes, contentsHBytes.length + textBytes.length);

  addObject(new TextEncoder().encode(catalogStr));
  addObject(new TextEncoder().encode(pagesStr));
  addObject(new TextEncoder().encode(pageStr));
  addObject(new TextEncoder().encode(fontStr));
  addObject(fullImageBytes);
  addObject(fullContentsBytes);

  let fileOffset = 0;
  const headerStr = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const headerBytes = new TextEncoder().encode(headerStr);
  fileOffset += headerBytes.length;

  const offsets = [];
  const bodyChunks = [];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(fileOffset);
    const prefix = `${i + 1} 0 obj\n`;
    const suffix = '\nendobj\n';
    const pBytes = new TextEncoder().encode(prefix);
    const sBytes = new TextEncoder().encode(suffix);
    bodyChunks.push(pBytes);
    bodyChunks.push(objects[i].bytes);
    bodyChunks.push(sBytes);
    fileOffset += pBytes.length + objects[i].bytes.length + sBytes.length;
  }

  const xrefOffset = fileOffset;
  let xrefStr = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 0; i < offsets.length; i++) {
    const offStr = String(offsets[i]).padStart(10, '0');
    xrefStr += `${offStr} 00000 n \n`;
  }
  xrefStr += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObjNum} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  const trailerBytes = new TextEncoder().encode(xrefStr);

  let totalSize = headerBytes.length + trailerBytes.length;
  for (const chunk of bodyChunks) totalSize += chunk.length;

  const finalPdf = new Uint8Array(totalSize);
  let pos = 0;
  finalPdf.set(headerBytes, pos);
  pos += headerBytes.length;
  for (const chunk of bodyChunks) {
    finalPdf.set(chunk, pos);
    pos += chunk.length;
  }
  finalPdf.set(trailerBytes, pos);

  return finalPdf;
}

export async function generateInvoicePdfBlob(invoice = {}) {
  const width = 1240;
  const height = 1754;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const textItems = [];

  function addText(text, x, y, size = 16) {
    if (text) {
      textItems.push({ text: String(text), x, y, fontSize: size });
    }
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#16222F';
  ctx.fillRect(0, 0, width, 180);

  ctx.fillStyle = '#C5A880';
  ctx.fillRect(0, 180, width, 8);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px "Playfair Display", Georgia, serif';
  ctx.fillText('ACADÉMIE LUMIÈRE', 80, 85);
  addText('ACADÉMIE LUMIÈRE', 80, 85, 36);

  ctx.fillStyle = '#DFC2A0';
  ctx.font = '16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Établissement Privé d\'Enseignement d\'Excellence', 80, 120);
  addText('Établissement Privé d\'Enseignement d\'Excellence', 80, 120, 16);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('FACTURE SCOLAIRE', width - 80, 85);
  addText('FACTURE SCOLAIRE', width - 260, 85, 28);

  ctx.fillStyle = '#DFC2A0';
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(invoice.number || 'INV-2026-0001', width - 80, 120);
  addText(invoice.number || 'INV-2026-0001', width - 200, 120, 18);

  ctx.textAlign = 'left';

  const boxY = 230;
  ctx.fillStyle = '#FAF7F2';
  ctx.strokeStyle = '#E8DFC9';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(80, boxY, 500, 170, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#16222F';
  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('ÉLÈVE CONCERNÉ', 110, boxY + 40);

  ctx.fillStyle = '#16222F';
  ctx.font = 'bold 22px "Playfair Display", Georgia, serif';
  ctx.fillText(invoice.studentName || 'Élève Académie', 110, boxY + 75);
  addText(invoice.studentName || 'Élève Académie', 110, boxY + 75, 22);

  ctx.fillStyle = '#64748B';
  ctx.font = '14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Matricule : ${invoice.studentNumber || `STU-${invoice.studentId || '001'}`}`, 110, boxY + 110);
  addText(`Matricule : ${invoice.studentNumber || `STU-${invoice.studentId || '001'}`}`, 110, boxY + 110, 14);
  ctx.fillText(`Période : ${invoice.billingPeriod || 'Année 2026-2027'}`, 110, boxY + 135);

  ctx.fillStyle = '#FAF7F2';
  ctx.beginPath();
  ctx.roundRect(width - 580, boxY, 500, 170, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#16222F';
  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('DÉTAILS DE FACTURATION', width - 550, boxY + 40);

  ctx.fillStyle = '#64748B';
  ctx.font = '14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Date d'émission : ${invoice.createdAt ? invoice.createdAt.substring(0, 10) : '01/09/2026'}`, width - 550, boxY + 75);
  ctx.fillText(`Date d'échéance : ${invoice.dueDate || '30/11/2026'}`, width - 550, boxY + 105);

  ctx.fillText('Statut : ', width - 550, boxY + 140);
  const status = invoice.status || 'UNPAID';
  let badgeBg = '#FEE2E2';
  let badgeText = '#991B1B';
  let label = 'IMPAYÉE';
  if (status === 'PAID') {
    badgeBg = '#DCFCE7';
    badgeText = '#166534';
    label = 'RÉGLÉE / PAYÉE';
  } else if (status === 'PARTIAL') {
    badgeBg = '#FEF3C7';
    badgeText = '#92400E';
    label = 'PARTIELLEMENT RÉGLÉE';
  } else if (status === 'OVERDUE') {
    badgeBg = '#F3E8FF';
    badgeText = '#6B21A8';
    label = 'EN RETARD';
  }

  ctx.fillStyle = badgeBg;
  ctx.beginPath();
  ctx.roundRect(width - 480, boxY + 122, 180, 26, 8);
  ctx.fill();
  ctx.fillStyle = badgeText;
  ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(label, width - 470, boxY + 139);

  const tableY = 440;
  ctx.fillStyle = '#16222F';
  ctx.fillRect(80, tableY, width - 160, 45);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('DESCRIPTION DU FRAIS', 100, tableY + 28);
  ctx.fillText('QUANTITÉ', width - 480, tableY + 28);
  ctx.fillText('PRIX UNITAIRE', width - 340, tableY + 28);
  ctx.fillText('TOTAL LIGNE', width - 180, tableY + 28);

  let curY = tableY + 45;
  const lines = invoice.lines && invoice.lines.length > 0
    ? invoice.lines
    : [{ feeTypeName: 'Frais de scolarité', quantity: 1, unitAmount: invoice.totalAmount || 4500, lineTotal: invoice.totalAmount || 4500 }];

  lines.forEach((l, idx) => {
    ctx.fillStyle = idx % 2 === 0 ? '#FFFFFF' : '#FAF7F2';
    ctx.fillRect(80, curY, width - 160, 48);

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(80, curY + 48);
    ctx.lineTo(width - 80, curY + 48);
    ctx.stroke();

    ctx.fillStyle = '#16222F';
    ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(l.feeTypeName || 'Frais scolaire', 100, curY + 30);
    addText(l.feeTypeName || 'Frais scolaire', 100, curY + 30, 14);

    ctx.font = '14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(String(l.quantity || 1), width - 460, curY + 30);
    ctx.fillText(`${new Intl.NumberFormat('fr-FR').format(l.unitAmount || 0)} MAD`, width - 340, curY + 30);
    ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${new Intl.NumberFormat('fr-FR').format(l.lineTotal || 0)} MAD`, width - 180, curY + 30);

    curY += 48;
  });

  const totY = curY + 30;
  const totX = width - 480;
  ctx.fillStyle = '#FAF7F2';
  ctx.strokeStyle = '#E8DFC9';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(totX, totY, 400, 190, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#64748B';
  ctx.font = '14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Montant brut :', totX + 30, totY + 40);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#16222F';
  ctx.fillText(`${new Intl.NumberFormat('fr-FR').format(invoice.totalAmount || 0)} MAD`, totX + 370, totY + 40);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748B';
  ctx.fillText('Réduction / Bourse :', totX + 30, totY + 75);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#16222F';
  ctx.fillText(`- ${new Intl.NumberFormat('fr-FR').format(invoice.discount || 0)} MAD`, totX + 370, totY + 75);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#16222F';
  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Total net à payer :', totX + 30, totY + 115);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#C5A880';
  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  const finalAmt = invoice.finalAmount || invoice.totalAmount || 0;
  ctx.fillText(`${new Intl.NumberFormat('fr-FR').format(finalAmt)} MAD`, totX + 370, totY + 115);
  addText(`${new Intl.NumberFormat('fr-FR').format(finalAmt)} MAD`, totX + 220, totY + 115, 20);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748B';
  ctx.font = '13px "Plus Jakarta Sans", sans-serif';
  const paid = invoice.paidAmount || (invoice.status === 'PAID' ? finalAmt : 0);
  const remaining = invoice.remainingAmount !== undefined ? invoice.remainingAmount : Math.max(0, finalAmt - paid);
  ctx.fillText(`Montant déjà réglé : ${new Intl.NumberFormat('fr-FR').format(paid)} MAD`, totX + 30, totY + 150);
  ctx.fillText(`Reste dû : ${new Intl.NumberFormat('fr-FR').format(remaining)} MAD`, totX + 30, totY + 172);

  ctx.textAlign = 'left';
  const payY = totY + 230;
  if (invoice.payments && invoice.payments.length > 0) {
    ctx.fillStyle = '#16222F';
    ctx.font = 'bold 16px "Playfair Display", Georgia, serif';
    ctx.fillText('HISTORIQUE DES PAIEMENTS ASSOCIÉS', 80, payY);

    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(80, payY + 15, width - 160, 35);
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('RÉFÉRENCE', 100, payY + 37);
    ctx.fillText('DATE', 300, payY + 37);
    ctx.fillText('MODE DE RÈGLEMENT', 550, payY + 37);
    ctx.fillText('MONTANT VERSÉ', width - 200, payY + 37);

    let pY = payY + 50;
    invoice.payments.forEach((p, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? '#FFFFFF' : '#FAF7F2';
      ctx.fillRect(80, pY, width - 160, 36);
      ctx.fillStyle = '#16222F';
      ctx.font = '13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`PAY-${p.id}`, 100, pY + 23);
      ctx.fillText(p.paidAt ? p.paidAt.substring(0, 16).replace('T', ' ') : 'Récemment', 300, pY + 23);
      ctx.fillText(p.method || 'VIREMENT', 550, pY + 23);
      ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`${new Intl.NumberFormat('fr-FR').format(p.amount || 0)} MAD`, width - 200, pY + 23);
      pY += 36;
    });
  }

  const footerY = height - 180;
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, footerY);
  ctx.lineTo(width - 80, footerY);
  ctx.stroke();

  ctx.fillStyle = '#16222F';
  ctx.font = 'bold 14px "Playfair Display", Georgia, serif';
  ctx.fillText('ACADÉMIE LUMIÈRE • DIRECTION FINANCIÈRE', 80, footerY + 35);
  ctx.fillStyle = '#64748B';
  ctx.font = '12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Avenue de la Renaissance, Ville Scolaire • contact@academie-lumiere.ma • +212 5 22 00 00 00', 80, footerY + 58);
  ctx.fillText('RIB : 007 810 0001234567890123 45 • Banque Populaire du Maroc', 80, footerY + 80);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#16222F';
  ctx.font = 'bold 14px "Playfair Display", Georgia, serif';
  ctx.fillText('Pour la Direction & Comptabilité', width - 80, footerY + 35);
  ctx.fillStyle = '#C5A880';
  ctx.font = 'italic 12px "Playfair Display", serif';
  ctx.fillText('Cachet officiel de l\'établissement', width - 80, footerY + 80);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
  const base64 = dataUrl.split(',')[1];
  const binStr = atob(base64);
  const len = binStr.length;
  const jpegBytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    jpegBytes[i] = binStr.charCodeAt(i);
  }

  const pdfBytes = buildPdfBinary(jpegBytes, width, height, textItems);
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export async function downloadInvoicePdf(invoice = {}) {
  const blob = await generateInvoicePdfBlob(invoice);
  const num = (invoice.number || `Facture_${invoice.id || '001'}`).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${num}.pdf`;

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
