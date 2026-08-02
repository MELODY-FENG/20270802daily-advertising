/**
 * Excel 文件解析服务 (客户端)
 *
 * 从原始 app.js parseExcelFile 100% 迁移
 * 依赖: SheetJS (xlsx)
 * 参考: 交接规范.json §数据规范.Excel解析规则
 */

import * as XLSX from 'xlsx';
import { NEEDED_COLS } from '../constants/col-mapping';
import type { AdRow } from '../types/data';

/**
 * 解析货币值: 去除 $ 和逗号
 */
function parseMoneyVal(v: any): number {
  if (v === null || v === undefined || v === '--' || v === '') return 0;
  if (typeof v === 'number') return v;
  const s = String(v).replace(/[$,]/g, '').trim();
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

/**
 * 解析数值: 去除 % 和逗号
 */
function parseNumVal(v: any): number {
  if (v === null || v === undefined || v === '--' || v === '') return 0;
  if (typeof v === 'number') return v;
  const s = String(v).replace(/[,%]/g, '').trim();
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

/**
 * 解析 Excel 文件为 AdRow[]
 *
 * 支持列顺序变化 — 通过表头行 findIndex 匹配列名
 */
export function parseExcelFile(file: File): Promise<AdRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const sheetName = 'Sheet1' in wb.Sheets ? 'Sheet1' : wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null }) as any[][];

        if (json.length < 2) {
          reject(new Error('文件无数据'));
          return;
        }

        // 从表头匹配列索引
        const header = json[0];
        const colMap: Record<string, number> = {};
        for (const col of NEEDED_COLS) {
          const idx = header.findIndex((h: any) => h && String(h).trim() === col);
          colMap[col] = idx;
        }

        const getVal = (col: string): string => {
          const idx = colMap[col];
          if (idx === -1 || idx === undefined) return '';
          const v = json[0][idx]; // use the row, not header
          // Actually, this function is called per-row below
          return ''; // placeholder
        };

        const records: AdRow[] = [];
        for (let i = 1; i < json.length; i++) {
          const row = json[i];
          if (!row || row.every((c: any) => c === null || c === undefined || c === '')) continue;

          const getCellVal = (col: string): string => {
            const idx = colMap[col];
            if (idx === -1 || idx === undefined) return '';
            const v = row[idx];
            if (v === null || v === undefined || v === '--' || v === '') return '';
            return String(v);
          };

          records.push([
            getCellVal('投放状态'),
            getCellVal('店铺'),
            getCellVal('业务组'),
            getCellVal('业务负责人'),
            getCellVal('三级分类'),
            getCellVal('广告类型'),
            getCellVal('广告活动'),
            parseMoneyVal(getCellVal('日预算')),
            parseMoneyVal(getCellVal('当前预算')),
            parseNumVal(getCellVal('花费')),
            parseNumVal(getCellVal('曝光量')),
            parseNumVal(getCellVal('点击量')),
            parseNumVal(getCellVal('销量')),
            parseNumVal(getCellVal('销售额')),
            parseNumVal(getCellVal('推广商品销量')),
            getCellVal('开关'),
          ] as AdRow);
        }

        resolve(records);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * 批量解析多个文件
 */
export async function parseMultipleFiles(files: File[]): Promise<Record<string, { data: AdRow[]; rawName: string }>> {
  const result: Record<string, { data: AdRow[]; rawName: string }> = {};

  for (const file of files) {
    const baseName = file.name.replace(/\.(xlsx|xls)$/i, '');
    const rows = await parseExcelFile(file);
    result[baseName] = { data: rows, rawName: file.name };
  }

  return result;
}
