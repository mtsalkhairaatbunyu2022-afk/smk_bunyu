/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Generate and download Excel template with multiple sheets
export function downloadExcelTemplate() {
  const wb = XLSX.utils.book_new();

  const dataX = [
    { NOMOR: 1, NAMA: 'Andi Pratama', KELAS: 'X RPL', JURUSAN: 'Rekayasa Perangkat Lunak' },
    { NOMOR: 2, NAMA: 'Bella Syahputri', KELAS: 'X RPL', JURUSAN: 'Rekayasa Perangkat Lunak' },
    { NOMOR: 3, NAMA: 'Candra Wijaya', KELAS: 'X TKJ', JURUSAN: 'Teknik Komputer & Jaringan' },
    { NOMOR: 4, NAMA: 'Dina Mariana', KELAS: 'X AKL', JURUSAN: 'Akuntansi & Keuangan Lembaga' },
  ];

  const dataXI = [
    { NOMOR: 1, NAMA: 'Eko Sulistyo', KELAS: 'XI RPL', JURUSAN: 'Rekayasa Perangkat Lunak' },
    { NOMOR: 2, NAMA: 'Fitri Handayani', KELAS: 'XI TKJ', JURUSAN: 'Teknik Komputer & Jaringan' },
    { NOMOR: 3, NAMA: 'Guntur Saputra', KELAS: 'XI AKL', JURUSAN: 'Akuntansi & Keuangan Lembaga' },
  ];

  const dataXII = [
    { NOMOR: 1, NAMA: 'Hendra Setiawan', KELAS: 'XII RPL', JURUSAN: 'Rekayasa Perangkat Lunak' },
    { NOMOR: 2, NAMA: 'Indah Lestari', KELAS: 'XII TKJ', JURUSAN: 'Teknik Komputer & Jaringan' },
    { NOMOR: 3, NAMA: 'Joko Susilo', KELAS: 'XII AKL', JURUSAN: 'Akuntansi & Keuangan Lembaga' },
  ];

  const wsX = XLSX.utils.json_to_sheet(dataX);
  const wsXI = XLSX.utils.json_to_sheet(dataXI);
  const wsXII = XLSX.utils.json_to_sheet(dataXII);

  // Set column widths
  const wscols = [
    { wch: 8 },  // NOMOR
    { wch: 25 }, // NAMA
    { wch: 12 }, // KELAS
    { wch: 30 }  // JURUSAN
  ];
  wsX['!cols'] = wscols;
  wsXI['!cols'] = wscols;
  wsXII['!cols'] = wscols;

  XLSX.utils.book_append_sheet(wb, wsX, 'KELAS X');
  XLSX.utils.book_append_sheet(wb, wsXI, 'KELAS XI');
  XLSX.utils.book_append_sheet(wb, wsXII, 'KELAS XII');

  XLSX.writeFile(wb, 'Template_Impor_Siswa_SMKN1_Bunyu.xlsx');
}

// Export data to MS Word (.doc) via formatted HTML Blob
export function exportToWord(
  title: string,
  headers: string[],
  rows: string[][],
  filename: string,
  subtitle?: string
) {
  const dateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const headerCells = headers.map(h => `<th style="background-color: #1e3a8a; color: #ffffff; padding: 10px; border: 1px solid #cbd5e1; text-align: left; font-family: Arial, sans-serif; font-size: 11pt;">${h}</th>`).join('');
  const bodyRows = rows.map((row, i) => {
    const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
    const cells = row.map(cell => `<td style="padding: 8px; border: 1px solid #cbd5e1; font-family: Arial, sans-serif; font-size: 10pt;">${cell || '-'}</td>`).join('');
    return `<tr style="background-color: ${bg};">${cells}</tr>`;
  }).join('');

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <title>${title}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: A4;
          margin: 2cm;
        }
        body {
          font-family: Arial, sans-serif;
          line-height: 1.5;
        }
        .header {
          text-align: center;
          margin-bottom: 25px;
          border-bottom: 3px double #1e3a8a;
          padding-bottom: 10px;
        }
        .school-title {
          font-size: 16pt;
          font-weight: bold;
          color: #1e3a8a;
          margin: 0;
          text-transform: uppercase;
        }
        .school-subtitle {
          font-size: 11pt;
          color: #475569;
          margin: 3px 0 0 0;
        }
        .doc-title {
          font-size: 14pt;
          font-weight: bold;
          text-align: center;
          margin-top: 15px;
          margin-bottom: 5px;
          text-transform: uppercase;
          color: #0f172a;
        }
        .doc-date {
          font-size: 10pt;
          color: #64748b;
          text-align: center;
          margin-bottom: 20px;
          font-style: italic;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .footer {
          margin-top: 50px;
          text-align: right;
          font-size: 10pt;
        }
        .signature-space {
          height: 70px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="school-title">SMK NEGERI 1 BUNYU</div>
        <div class="school-subtitle">Bimbingan Konseling & Jurnal Informasi Akademik Siswa</div>
        <div class="school-subtitle" style="font-size: 9pt;">Kec. Bunyu, Kab. Bulungan, Kalimantan Utara</div>
      </div>
      
      <div class="doc-title">${title}</div>
      ${subtitle ? `<div style="text-align: center; font-size: 11pt; font-weight: bold; margin-bottom: 10px; color: #334155;">${subtitle}</div>` : ''}
      <div class="doc-date">Dicetak pada: ${dateStr}</div>

      <table>
        <thead>
          <tr>${headerCells}</tr>
        </thead>
        <tbody>
          ${bodyRows}
        </tbody>
      </table>

      <div class="footer">
        <div>Bunyu, ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div>Mengetahui,</div>
        <div style="font-weight: bold; margin-top: 5px;">Guru Bimbingan Konseling / Pengajar</div>
        <div class="signature-space"></div>
        <div style="text-decoration: underline; font-weight: bold;">................................................</div>
        <div>NIP. .......................................</div>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export data to PDF via jsPDF & autoTable with elegant styling and headers
export function exportToPDF(
  title: string,
  headers: string[],
  rows: string[][],
  filename: string,
  subtitle?: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper to draw Header Kop Surat
  const drawHeader = (pdfDoc: jsPDF) => {
    // Top border accent
    pdfDoc.setFillColor(30, 58, 138); // Deep Blue (#1e3a8a)
    pdfDoc.rect(0, 0, pageWidth, 4, 'F');

    // School Name
    pdfDoc.setFont('helvetica', 'bold');
    pdfDoc.setFontSize(14);
    pdfDoc.setTextColor(30, 58, 138);
    pdfDoc.text('PEMERINTAH PROVINSI KALIMANTAN UTARA', pageWidth / 2, 12, { align: 'center' });
    pdfDoc.text('DINAS PENDIDIKAN DAN KEBUDAYAAN', pageWidth / 2, 18, { align: 'center' });
    pdfDoc.text('SMK NEGERI 1 BUNYU', pageWidth / 2, 24, { align: 'center' });

    // Address
    pdfDoc.setFont('helvetica', 'normal');
    pdfDoc.setFontSize(8);
    pdfDoc.setTextColor(71, 85, 105);
    pdfDoc.text('Jl. Kesehatan RT 05 Kec. Bunyu, Kab. Bulungan, Kalimantan Utara 77181', pageWidth / 2, 29, { align: 'center' });

    // Decorative line
    pdfDoc.setDrawColor(30, 58, 138);
    pdfDoc.setLineWidth(0.8);
    pdfDoc.line(15, 32, pageWidth - 15, 32);
    pdfDoc.setLineWidth(0.2);
    pdfDoc.line(15, 33, pageWidth - 15, 33);
  };

  // Helper to draw Footer (Page Numbers & Date)
  const drawFooter = (pdfDoc: jsPDF, pageNum: number, totalPages: number) => {
    pdfDoc.setFont('helvetica', 'italic');
    pdfDoc.setFontSize(8);
    pdfDoc.setTextColor(148, 163, 184);
    
    // Left aligned: App footer
    pdfDoc.text('Aplikasi BK LA SMKN 1 Bunyu - Offline & Online Portal', 15, pageHeight - 10);
    
    // Right aligned: Page numbers
    pdfDoc.text(`Halaman ${pageNum} dari ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
  };

  // Draw first page header
  drawHeader(doc);

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(title.toUpperCase(), pageWidth / 2, 42, { align: 'center' });

  if (subtitle) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(subtitle, pageWidth / 2, 47, { align: 'center' });
  }

  // Printed date info
  const dateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Dicetak pada: ${dateStr}`, 15, 52);

  // AutoTable options
  autoTable(doc, {
    startY: 55,
    head: [headers],
    body: rows,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      font: 'helvetica',
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
      valign: 'middle'
    },
    bodyStyles: {
      font: 'helvetica',
      fontSize: 8,
      textColor: [30, 41, 59],
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 15, right: 15, top: 40, bottom: 45 },
    didDrawPage: (data) => {
      // Draw header on subsequent pages if autoTable overflows
      if (data.pageNumber > 1) {
        drawHeader(doc);
      }
    }
  });

  // Calculate signature block position (safely append after table or on bottom of last page)
  const finalY = (doc as any).lastAutoTable.finalY || 60;
  let signatureY = finalY + 12;

  // If signature block overflows current page, add new page
  if (signatureY + 40 > pageHeight) {
    doc.addPage();
    drawHeader(doc);
    signatureY = 45;
  }

  // Draw signature block
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const shortDateStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Bunyu, ${shortDateStr}`, pageWidth - 70, signatureY);
  doc.text('Mengetahui,', pageWidth - 70, signatureY + 5);
  doc.setFont('helvetica', 'bold');
  doc.text('Guru BK / Pengajar SMKN 1 Bunyu', pageWidth - 70, signatureY + 10);
  
  doc.setDrawColor(148, 163, 184);
  doc.line(pageWidth - 70, signatureY + 32, pageWidth - 15, signatureY + 32);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('NIP. .................................................', pageWidth - 70, signatureY + 36);

  // Add headers and footers to all pages retrospectively to get exact page count
  const totalPages = doc.internal.pages.length - 1; // jsPDF has a blank entry or array includes meta
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, i, totalPages);
  }

  doc.save(`${filename}.pdf`);
}

// Export data to Excel (.xlsx)
export function exportToExcel(
  title: string,
  headers: string[],
  rows: string[][],
  filename: string,
  subtitle?: string
) {
  const wb = XLSX.utils.book_new();
  
  // Custom layout for the Excel sheet
  const sheetData: any[][] = [];
  
  // Header block
  sheetData.push(['SMK NEGERI 1 BUNYU']);
  sheetData.push(['Bimbingan Konseling & Jurnal Informasi Akademik Siswa']);
  if (subtitle) {
    sheetData.push([`${title} - ${subtitle}`]);
  } else {
    sheetData.push([title]);
  }
  sheetData.push([`Dicetak pada: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`]);
  sheetData.push([]); // blank separator line
  
  // Table headers
  sheetData.push(headers);
  
  // Table rows
  rows.forEach(row => {
    sheetData.push(row);
  });
  
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  
  // Auto-fit column widths based on maximum length of cell content
  const colWidths = headers.map((header, colIndex) => {
    let maxLen = header.length;
    rows.forEach(row => {
      const val = row[colIndex] ? String(row[colIndex]) : '';
      if (val.length > maxLen) {
        maxLen = val.length;
      }
    });
    return { wch: Math.min(Math.max(maxLen + 4, 10), 50) };
  });
  ws['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

