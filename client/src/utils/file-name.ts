/**
 * 文件名验证工具
 *
 * 从原始 app.js 100% 迁移
 * 参考: 交接规范.json §数据规范.文件名格式
 */

import { FILE_NAME_REGEX } from '../constants/col-mapping';

/**
 * 验证文件名格式: YYYYMMDD_YYYYMMDD
 */
export function validateFileName(fileName: string): boolean {
  const baseName = fileName.replace(/\.(xlsx|xls)$/i, '');
  return FILE_NAME_REGEX.test(baseName);
}

/**
 * 从文件名解析日期范围
 * 输入: "20260715_20260721" → [20260715, 20260721]
 */
export function parseFileDates(fileName: string): [string, string] | null {
  const baseName = fileName.replace(/\.(xlsx|xls)$/i, '');
  const match = baseName.match(FILE_NAME_REGEX);
  if (!match) return null;
  return [match[1], match[2]];
}

/**
 * 按起始日期排序文件
 */
export function sortFileNamesByDate(fileNames: string[]): string[] {
  return fileNames.slice().sort((a, b) => {
    const dA = parseFileDates(a);
    const dB = parseFileDates(b);
    if (!dA || !dB) return 0;
    return dA[0].localeCompare(dB[0]);
  });
}
