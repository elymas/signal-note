import { AhmedOnChartTranscriptOverrides } from '../reels-transcripts/update-2026-09-04/ahmed-on-chart.js';
import { TravisWooTranscriptOverrides } from '../reels-transcripts/update-2026-09-04/travis-woo.js';
import { TarzanTradingTtTranscriptOverrides } from '../reels-transcripts/update-2026-09-04/tarzan-trading-tt.js';
import { ErickJablonskiTranscriptOverrides } from '../reels-transcripts/update-2026-09-04/erick-jablonski.js';
import { LuxalgoTranscriptOverrides } from '../reels-transcripts/update-2026-09-04/luxalgo.js';
import { TraderNoteJasonTranscriptOverrides } from '../reels-transcripts/update-2026-09-04/trader-note-jason.js';
import { DumbHunterTranscriptOverrides } from '../reels-transcripts/update-2026-09-04/dumb-hunter.js';
import { MaxAnthonyTranscriptOverrides } from '../reels-transcripts/update-2026-09-04/max-anthony.js';
import { YostradesTranscriptOverrides } from '../reels-transcripts/update-2026-09-04/yostrades.js';
import { TradeWithPatTranscriptOverrides } from '../reels-transcripts/update-2026-09-04/trade-with-pat.js';
import { NovoLegacyTranscriptOverrides } from '../reels-transcripts/update-2026-09-04/novo-legacy.js';
import { Official20MinuteTraderTranscriptOverrides } from '../reels-transcripts/update-2026-09-04/official-20-minute-trader.js';
import { reelEditorialOverrides20260904 } from './editorial-overrides-2026-09-04.js';

const cleanKorean = (value) => {
  if (typeof value !== 'string') return value;
  const replacements = [
    [/캔들stick/gi, '캔들'],
    [/\bCandle\b/gi, '캔들'],
    [/\bdowntrend\b/gi, '하락 추세'],
    [/\bbullish market\b/gi, '상승장'],
    [/\bbullish\b/gi, '강세'],
    [/\bVolume Profile\b/gi, '거래량 프로필'],
    [/\bOrderflow\b/gi, '오더플로'],
    [/\bDay Trading\b/gi, '데이 트레이딩'],
    [/\bTAKE PROFIT\b/gi, '익절 목표'],
    [/스탑[ -]?(?:loss|러스)/gi, '손절'],
    [/손절를/g, '손절을'],
    [/포지션 크기이/g, '포지션 크기가'],
    [/인덱스 펀즈/g, '인덱스 펀드'],
    [/업트렌드/g, '상승 추세'],
    [/브레이크아웃/g, '돌파'],
    [/컨플루언스/g, '중첩 근거'],
    [/애셋/g, '자산'],
    [/9:30\s*AM/gi, '오전 9시 30분'],
    [/\s*#[\p{L}\p{N}_-]+/gu, ''],
    [/\s*[🚀📈💰💸]+/gu, ''],
  ];
  return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value).replace(/\s+/g, ' ').trim();
};

const toReels = (cards) => [...cards].map(([id, card]) => {
  const override = reelEditorialOverrides20260904.get(id) || {};
  const merged = { ...card, ...override };
  return {
    id,
    sourceUrl: `https://www.facebook.com/reel/${id}/`,
    ...merged,
    title: cleanKorean(merged.title),
    core: cleanKorean(merged.core),
    rules: (merged.rules || []).map(cleanKorean),
    cta: cleanKorean(merged.cta),
    caution: cleanKorean(merged.caution),
    tags: (merged.tags || []).map(cleanKorean),
  };
});

export const reelsUpdate20260904 = new Map([
  ['ahmed-on-chart', toReels(AhmedOnChartTranscriptOverrides)],
  ['travis-woo', toReels(TravisWooTranscriptOverrides)],
  ['tarzan-trading-tt', toReels(TarzanTradingTtTranscriptOverrides)],
  ['erick-jablonski', toReels(ErickJablonskiTranscriptOverrides)],
  ['luxalgo', toReels(LuxalgoTranscriptOverrides)],
  ['trader-note-jason', toReels(TraderNoteJasonTranscriptOverrides)],
  ['dumb-hunter', toReels(DumbHunterTranscriptOverrides)],
  ['max-anthony', toReels(MaxAnthonyTranscriptOverrides)],
  ['yostrades', toReels(YostradesTranscriptOverrides)],
  ['trade-with-pat', toReels(TradeWithPatTranscriptOverrides)],
  ['novo-legacy', toReels(NovoLegacyTranscriptOverrides)],
  ['official-20-minute-trader', toReels(Official20MinuteTraderTranscriptOverrides)],
]);
