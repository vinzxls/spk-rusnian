/**
 * Penulis file Excel (.xlsx) tanpa dependensi berat.
 *
 * XLSX hanyalah arsip ZIP berisi beberapa berkas XML. Di sini arsipnya dibuat
 * dengan `fflate`, dan tiap sel ditulis sebagai inline string / angka, jadi
 * tidak perlu tabel sharedStrings.
 *
 * Dipakai untuk ekspor rekap kuesioner di panel admin.
 */
import { zipSync, strToU8 } from 'fflate'

export type ExcelCell = string | number | null | undefined

export interface ExcelSheet {
  /** Nama sheet (maks. 31 karakter, tanpa karakter : \ / ? * [ ]). */
  name: string
  rows: ExcelCell[][]
  /** Baris pertama dianggap judul tabel: ditebalkan dan diberi latar. */
  headerRow?: boolean
  /** Lebar kolom dalam satuan karakter Excel. */
  columnWidths?: number[]
  /** Kolom (indeks 0-based) yang diformat 4 desimal. */
  decimalColumns?: number[]
}

/** Escape karakter yang tidak sah di dalam teks XML. */
function escXml(value: string): string {
  return (
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
      // Buang karakter kontrol yang membuat Excel menolak berkas.
      .split('')
      .filter((ch) => {
        const kode = ch.charCodeAt(0)
        return kode === 9 || kode === 10 || kode === 13 || kode >= 32
      })
      .join('')
  )
}

/** 0 → A, 25 → Z, 26 → AA. */
export function columnName(index: number): string {
  let n = index
  let name = ''
  while (n >= 0) {
    name = String.fromCharCode((n % 26) + 65) + name
    n = Math.floor(n / 26) - 1
  }
  return name
}

/** Nama sheet yang aman untuk Excel. */
export function safeSheetName(name: string, fallback = 'Sheet1'): string {
  const bersih = name.replace(/[:\\/?*[\]]/g, ' ').trim().slice(0, 31)
  return bersih || fallback
}

interface StyleIds {
  header: number
  decimal: number
  integer: number
}

const STYLE_IDS: StyleIds = { header: 1, decimal: 2, integer: 3 }

function sheetXml(sheet: ExcelSheet): string {
  const rows = sheet.rows
  const decimalCols = new Set(sheet.decimalColumns ?? [])
  const headerRow = sheet.headerRow ?? true

  const cols = sheet.columnWidths?.length
    ? `<cols>${sheet.columnWidths
        .map(
          (w, i) =>
            `<col min="${i + 1}" max="${i + 1}" width="${Math.max(w, 6)}" customWidth="1"/>`
        )
        .join('')}</cols>`
    : ''

  const body = rows
    .map((row, rowIndex) => {
      const r = rowIndex + 1
      const isHeader = headerRow && rowIndex === 0

      const cells = row
        .map((cell, colIndex) => {
          const ref = `${columnName(colIndex)}${r}`

          if (cell === null || cell === undefined || cell === '') {
            return `<c r="${ref}"/>`
          }

          if (typeof cell === 'number' && Number.isFinite(cell)) {
            const s = decimalCols.has(colIndex) ? STYLE_IDS.decimal : STYLE_IDS.integer
            return `<c r="${ref}" s="${s}"><v>${cell}</v></c>`
          }

          const s = isHeader ? ` s="${STYLE_IDS.header}"` : ''
          return `<c r="${ref}" t="inlineStr"${s}><is><t xml:space="preserve">${escXml(
            String(cell)
          )}</t></is></c>`
        })
        .join('')

      return `<row r="${r}">${cells}</row>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="${headerRow ? 1 : 0}" topLeftCell="A${headerRow ? 2 : 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>${cols}<sheetData>${body}</sheetData></worksheet>`
}

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="2"><numFmt numFmtId="164" formatCode="0.0000"/><numFmt numFmtId="165" formatCode="0"/></numFmts>
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE8EDF5"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="4">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`

function workbookXml(sheets: ExcelSheet[]): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets
    .map(
      (sheet, i) =>
        `<sheet name="${escXml(safeSheetName(sheet.name, `Sheet${i + 1}`))}" sheetId="${
          i + 1
        }" r:id="rId${i + 1}"/>`
    )
    .join('')}</sheets></workbook>`
}

function workbookRelsXml(count: number): string {
  const sheets = Array.from(
    { length: count },
    (_, i) =>
      `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`
  ).join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets}<Relationship Id="rId${
    count + 1
  }" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`
}

function contentTypesXml(count: number): string {
  const sheets = Array.from(
    { length: count },
    (_, i) =>
      `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
  ).join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheets}<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`
}

const ROOT_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`

/** Susun berkas .xlsx (Uint8Array) dari satu atau beberapa sheet. */
export function buildXlsx(sheets: ExcelSheet[]): Uint8Array {
  if (!sheets.length) throw new Error('Minimal satu sheet diperlukan')

  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': strToU8(contentTypesXml(sheets.length)),
    '_rels/.rels': strToU8(ROOT_RELS_XML),
    'xl/workbook.xml': strToU8(workbookXml(sheets)),
    'xl/_rels/workbook.xml.rels': strToU8(workbookRelsXml(sheets.length)),
    'xl/styles.xml': strToU8(STYLES_XML),
  }

  sheets.forEach((sheet, i) => {
    files[`xl/worksheets/sheet${i + 1}.xml`] = strToU8(sheetXml(sheet))
  })

  return zipSync(files, { level: 6 })
}

/** Picu unduhan berkas .xlsx di browser. */
export function downloadXlsx(filename: string, sheets: ExcelSheet[]): void {
  const bytes = buildXlsx(sheets)
  // Salin ke ArrayBuffer baru: tipe Uint8Array dari fflate memakai ArrayBufferLike,
  // sedangkan BlobPart menuntut ArrayBuffer biasa.
  const buffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buffer).set(bytes)
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Beri waktu browser memulai unduhan sebelum URL dicabut.
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export const excelWriter = { buildXlsx, downloadXlsx, columnName, safeSheetName }
export default excelWriter
