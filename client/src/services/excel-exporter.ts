import * as XLSX from 'xlsx';
import { calcAggregates, groupByCampaign, groupBy, groupByTwo } from '../utils/calc';
import { fmtInt, fmtMoney, fmtPct, fmtRatio } from '../utils/format';
import { ACOS_RANGES } from '../constants/acos-ranges';
import { COL } from '../constants/col-mapping';
import { sortFileNamesByDate } from '../utils/file-name';
import type { AdRow, FileEntry } from '../types/data';

export interface ExportResult { success: boolean; fileName?: string; error?: string; }

export function exportToExcel(
  allFiles: Record<string, FileEntry>,
  currentFileName: string,
): ExportResult {
  try {
    const wb = XLSX.utils.book_new();
    const currentData = currentFileName && allFiles[currentFileName] ? allFiles[currentFileName].data : [];
    const campaigns = groupByCampaign(currentData);
    const agg = currentData.length ? calcAggregates(currentData) : null;

    // === Sheet: 指标卡片 ===
    if (agg) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['指标', '数值'],
        ['广告活动去重计数', fmtInt(agg.campaignCount)], ['日预算', fmtMoney(agg.dailyBudget)],
        ['当前预算', fmtMoney(agg.currentBudget)], ['花费', fmtMoney(agg.spend)],
        ['曝光量', fmtInt(agg.impressions)], ['点击量', fmtInt(agg.clicks)],
        ['销量', fmtInt(agg.sales)], ['$CPC', fmtMoney(agg.cpc)],
        ['CTR%', fmtPct(agg.ctr)], ['CVR%', fmtPct(agg.cvr)],
        ['销额', fmtMoney(agg.salesAmount)], ['$CPO', fmtMoney(agg.cpo)],
        ['ACOS%', fmtPct(agg.acos)], ['ROAS', fmtRatio(agg.roas)],
        ['直购率%', fmtPct(agg.directRate)],
      ]), '指标卡片');
    }

    // === ACOS 各区间 CAM 明细 ===
    for (const range of ACOS_RANGES) {
      const rc = range.isZero
        ? campaigns.filter((c) => c.acos <= 0 && c.clicks >= 50)
        : campaigns.filter((c) => c.acos > (range.min ?? 0) && c.acos <= (range.max ?? Infinity));
      if (!rc.length) continue;
      const name = (range.isZero ? 'ACOS=0%点击≥50' : range.label).substring(0, 25);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['广告活动', '花费', '点击量', '$CPC', 'CTR%', 'CVR%', '销额', '$CPO', 'ACOS%', 'ROAS', '直购率%'],
        ...rc.sort((a, b) => b.spend - a.spend).map((c) => [c.name, c.spend, c.clicks, c.cpc, c.ctr, c.cvr, c.salesAmount, c.cpo, c.acos, c.roas, c.directRate]),
      ]), name);
    }

    // === 最新趋势警示 (多文件) ===
    const sorted = sortFileNamesByDate(Object.keys(allFiles));
    if (sorted.length >= 2) {
      const latest = sorted[sorted.length - 1];
      const previous = sorted[sorted.length - 2];
      const prevNames = new Set(
        groupByCampaign(allFiles[previous]?.data || [])
          .filter((c) => (c.acos <= 0 && c.clicks >= 50) || c.acos > 1.00).map((c) => c.name),
      );
      const trend = groupByCampaign(allFiles[latest]?.data || [])
        .filter((c) => (c.acos <= 0 && c.clicks >= 50) || c.acos > 1.00)
        .map((c) => ({ ...c, isNew: !prevNames.has(c.name) }))
        .sort((a, b) => b.spend - a.spend);
      if (trend.length) {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
          ['广告活动', '是否新增', '点击量', '$CPC', 'CTR%', 'CVR%', '销额', '$CPO', 'ACOS%', 'ROAS', '直购率%', '花费'],
          ...trend.map((c) => [c.name, c.isNew ? '✓新增' : '✗持续', c.clicks, c.cpc, c.ctr, c.cvr, c.salesAmount, c.cpo, c.acos, c.roas, c.directRate, c.spend]),
        ]), '最新趋势警示');
      }
    }

    // === 异常CAM日进度 (多文件) ===
    if (sorted.length >= 2) {
      const ownerMap = new Map<string, Record<string, number>>();
      for (const fn of sorted) {
        const d = allFiles[fn]?.data; if (!d?.length) continue;
        const cs = groupByCampaign(d).filter((c) => (c.acos <= 0 && c.clicks >= 50) || c.acos > 1.00);
        for (const c of cs) {
          const owner = c.业务负责人 || '(空)';
          if (!ownerMap.has(owner)) ownerMap.set(owner, {});
          const row = ownerMap.get(owner)!;
          row[fn] = (row[fn] || 0) + 1;
        }
      }
      if (ownerMap.size) {
        const rows = [...ownerMap.entries()].map(([owner, files]) => [owner, ...sorted.map((f) => files[f] || 0)]);
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
          ['业务负责人', ...sorted],
          ...rows,
        ]), '异常CAM日进度');
      }
    }

    // === 业务组 / 三级分类 / 业务负责人警示 ===
    for (const [colIdx, label] of [[COL.业务组, '业务组'], [COL.三级分类, '三级分类'], [COL.业务负责人, '业务负责人']] as [number, string][]) {
      const warnCamps = campaigns.filter((c) => c.acos > 0.50 || (c.acos <= 0 && c.clicks >= 50));
      if (!warnCamps.length) continue;
      const groups = groupBy(warnCamps.flatMap((c) => c.rows), colIdx);
      if (!groups.length) continue;
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        [label, 'CAM数', '花费', '曝光量', '点击量', '销量', '$CPC', 'CTR%', '$CPO', 'ACOS%', 'ROAS', '直购率'],
        ...groups.map((g) => [g.key, g.campaignCount, g.spend, g.impressions, g.clicks, g.sales, g.cpc, g.ctr, g.cpo, g.acos, g.roas, g.directRate]),
      ]), `${label}警示`);
    }

    // === 明细表 ===
    for (const [colIdx, label] of [[COL.店铺, '店铺'], [COL.广告类型, '广告类型'], [COL.三级分类, '三级分类']] as [number, string][]) {
      const groups = groupBy(currentData, colIdx);
      if (!groups.length) continue;
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        [label, 'CAM数', '花费', '点击量', '$CPC', 'CTR%', 'CVR%', '销额', '$CPO', 'ACOS%', 'ROAS', '直购率%'],
        ...groups.map((g) => [g.key, g.campaignCount, g.spend, g.clicks, g.cpc, g.ctr, g.cvr, g.salesAmount, g.cpo, g.acos, g.roas, g.directRate]),
      ]), `${label}明细`);
    }

    // 三级分类+广告类型
    const catAdGroups = groupByTwo(currentData, COL.三级分类, COL.广告类型);
    if (catAdGroups.length) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['三级分类', '广告类型', 'CAM数', '花费', '点击量', '$CPC', 'CTR%', 'CVR%', '销额', '$CPO', 'ACOS%', 'ROAS', '直购率%'],
        ...catAdGroups.map((g: any) => [g.key1, g.key2, g.campaignCount, g.spend, g.clicks, g.cpc, g.ctr, g.cvr, g.salesAmount, g.cpo, g.acos, g.roas, g.directRate]),
      ]), '三级分类+广告类型明细');
    }

    // === 全量数据 ===
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ['广告活动', '店铺', '业务组', '业务负责人', '三级分类', '广告类型', '花费', '点击量', '$CPC', 'CTR%', 'CVR%', '销额', '$CPO', 'ACOS%', 'ROAS', '直购率%'],
      ...campaigns.map((c) => [c.name, c.店铺, c.业务组, c.业务负责人, c.三级分类, c.广告类型, c.spend, c.clicks, c.cpc, c.ctr, c.cvr, c.salesAmount, c.cpo, c.acos, c.roas, c.directRate]),
    ]), '全量数据');

    const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    const fileName = `广告监控看板_${currentFileName || 'export'}_${ts}.xlsx`;
    XLSX.writeFile(wb, fileName);
    return { success: true, fileName };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
