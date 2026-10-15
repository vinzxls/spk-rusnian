/**
 * VIKOR Pure Calculator — murni, testable, tanpa I/O.
 * S_i = sum w_j * (f_j* - f_ij)/(f_j* - f_j^-)
 * R_i = max w_j * (f_j* - f_ij)/(f_j* - f_j^-)
 * Q_i = v*(S_i-S*)/(S^--S*) + (1-v)*(R_i-R*)/(R^--R*)
 */
import {
  AlternativeValue,
  CriteriaWeight,
  IdealSolution,
  VikorsCalculation,
  VikorsConfig,
  VikorsResult,
  DEFAULT_VIKORS_CONFIG,
  roundToDecimalPlaces,
} from '../types/vikor.types';

const CRITERIA_KEYS = ['C1', 'C2', 'C3', 'C4', 'C5'] as const;

export function weightsToArray(w: CriteriaWeight): number[] {
  return CRITERIA_KEYS.map((k) => w[k]);
}

export function alternativeToArray(a: AlternativeValue): number[] {
  return CRITERIA_KEYS.map((k) => a[k]);
}

export function findIdealSolution(
  alternatives: AlternativeValue[],
  isBenefit: boolean[],
): IdealSolution {
  const n = 5;
  const fStar: number[] = [];
  const fMinus: number[] = [];
  for (let j = 0; j < n; j++) {
    const col = alternatives.map((a) => alternativeToArray(a)[j]);
    if (isBenefit[j]) {
      fStar.push(Math.max(...col));
      fMinus.push(Math.min(...col));
    } else {
      // cost: terbaik = min, terburuk = max
      fStar.push(Math.min(...col));
      fMinus.push(Math.max(...col));
    }
  }
  return { fStar, fMinus, isBenefit };
}

export function calculateSR(
  alternatives: AlternativeValue[],
  weights: CriteriaWeight,
  ideal: IdealSolution,
): Array<{ alternativeId: string; alternativeName: string; S: number; R: number; originalValues: AlternativeValue }> {
  const w = weightsToArray(weights);
  return alternatives.map((a) => {
    const vals = alternativeToArray(a);
    const terms: number[] = [];
    for (let j = 0; j < vals.length; j++) {
      const gapNum = ideal.isBenefit[j] ? ideal.fStar[j] - vals[j] : vals[j] - ideal.fStar[j];
      const gapDen = ideal.isBenefit[j] ? ideal.fStar[j] - ideal.fMinus[j] : ideal.fMinus[j] - ideal.fStar[j];
      let d = 0;
      if (gapDen !== 0) {
        d = gapNum / gapDen;
      }
      terms.push(w[j] * d);
    }
    const S = terms.reduce((s, t) => s + t, 0);
    const R = Math.max(...terms);
    return { alternativeId: a.alternativeId, alternativeName: a.alternativeName, S, R, originalValues: a };
  });
}

export function calculateQ(
  sr: Array<{ alternativeId: string; alternativeName: string; S: number; R: number; originalValues: AlternativeValue }>,
  v = DEFAULT_VIKORS_CONFIG.v,
  decimalPlaces = DEFAULT_VIKORS_CONFIG.decimalPlaces,
): VikorsResult[] {
  const Svals = sr.map((x) => x.S);
  const Rvals = sr.map((x) => x.R);
  const Sstar = Math.min(...Svals);
  const Sminus = Math.max(...Svals);
  const Rstar = Math.min(...Rvals);
  const Rminus = Math.max(...Rvals);

  const sDen = Sminus - Sstar;
  const rDen = Rminus - Rstar;

  const withQ = sr.map((x) => {
    const sTerm = sDen !== 0 ? (x.S - Sstar) / sDen : 0;
    const rTerm = rDen !== 0 ? (x.R - Rstar) / rDen : 0;
    const Q = v * sTerm + (1 - v) * rTerm;
    return {
      alternativeId: x.alternativeId,
      alternativeName: x.alternativeName,
      S: roundToDecimalPlaces(x.S, decimalPlaces),
      R: roundToDecimalPlaces(x.R, decimalPlaces),
      Q: roundToDecimalPlaces(Q, decimalPlaces),
      rank: 0,
      originalValues: x.originalValues,
    } as VikorsResult;
  });

  // ranking: Q terkecil = rank 1
  const sorted = [...withQ].sort((a, b) => a.Q - b.Q);
  sorted.forEach((r, idx) => {
    r.rank = idx + 1;
  });
  return sorted;
}

export function computeVIKOR(
  alternatives: AlternativeValue[],
  weights: CriteriaWeight,
  config: VikorsConfig = DEFAULT_VIKORS_CONFIG,
): VikorsCalculation {
  if (alternatives.length === 0) throw new Error('alternatives tidak boleh kosong');
  const isBenefit = config.criteriaType.map((c) => c.isBenefit);
  const ideal = findIdealSolution(alternatives, isBenefit);
  const sr = calculateSR(alternatives, weights, ideal);
  const results = calculateQ(sr, config.v, config.decimalPlaces);
  return {
    results,
    idealSolution: ideal,
    weights,
    v: config.v,
    computedAt: new Date().toISOString(),
  };
}
