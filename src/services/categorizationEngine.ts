import { normalizeText } from '@utils/textUtils';
import type { KeywordRow } from '@db/schema';

export interface SuggestedCategory {
  categoryId: string;
  matchedKeywords: string[];
  confidence: number; // 0–1, based on number of matches
}

export function suggestCategories(
  title: string,
  description: string,
  allKeywords: KeywordRow[],
): SuggestedCategory[] {
  const text = normalizeText(`${title} ${description}`);
  if (!text.trim()) return [];

  const hits = new Map<string, Set<string>>();

  for (const kw of allKeywords) {
    const normalizedKw = normalizeText(kw.keyword);
    if (!normalizedKw) continue;
    if (text.includes(normalizedKw)) {
      if (!hits.has(kw.categoryId)) hits.set(kw.categoryId, new Set());
      hits.get(kw.categoryId)!.add(kw.keyword);
    }
  }

  const maxHits = Math.max(1, ...Array.from(hits.values()).map((s) => s.size));

  return Array.from(hits.entries())
    .map(([categoryId, matched]) => ({
      categoryId,
      matchedKeywords: Array.from(matched),
      confidence: Math.min(1, matched.size / maxHits),
    }))
    .sort((a, b) => b.confidence - a.confidence);
}
