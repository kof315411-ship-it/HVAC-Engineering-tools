/**
 * HVAC Sheet Metal / Duct Surface Area Calculation Module (鐵皮才數計算)
 */

export const STEEL_GAUGES = [
  { mm: 0.5, name: "#26 (0.5mm)", weightPerM2: 3.925 },
  { mm: 0.6, name: "#24 (0.6mm)", weightPerM2: 4.71 },
  { mm: 0.8, name: "#22 (0.8mm)", weightPerM2: 6.28 },
  { mm: 1.0, name: "#20 (1.0mm)", weightPerM2: 7.85 },
  { mm: 1.2, name: "#18 (1.2mm)", weightPerM2: 9.42 },
];

export function calcSheetMetal(params) {
  const {
    widthCM = 100,
    heightCM = 50,
    lengthM = 10,
    qty = 1,
    wasteRate = 0.10, // 10% wastage
    thicknessMM = 0.8
  } = params;

  // Convert inputs
  const w = parseFloat(widthCM) || 0;
  const h = parseFloat(heightCM) || 0;
  const l = parseFloat(lengthM) || 0;
  const n = parseInt(qty) || 1;
  const waste = parseFloat(wasteRate) || 0;

  // Perimeter in cm & m
  const perimeterCM = 2 * (w + h);
  const perimeterM = perimeterCM / 100;

  // Total Surface Area (m2)
  const netAreaM2 = perimeterM * l * n;
  const grossAreaM2 = netAreaM2 * (1 + waste);

  // Tsai Count (才數): 1 m2 = 10.76391 才 (30.48cm * 30.48cm = 929.0304 cm2)
  const netTsai = netAreaM2 * 10.76391;
  const grossTsai = grossAreaM2 * 10.76391;

  // 3' x 7' Steel Sheet Count (1 sheet 3'x7' = 21 才)
  const sheets3x7Net = netTsai / 21;
  const sheets3x7Gross = grossTsai / 21;

  // Steel Weight Estimation (kg)
  const gaugeInfo = STEEL_GAUGES.find(g => Math.abs(g.mm - thicknessMM) < 0.05) || STEEL_GAUGES[2];
  const weightKgNet = netAreaM2 * gaugeInfo.weightPerM2;
  const weightKgGross = grossAreaM2 * gaugeInfo.weightPerM2;

  // Flange & Fitting Accessories Estimation
  // 1 duct section standard length is ~1.5m, so section count = Math.ceil(l / 1.5) * n
  const sectionCount = Math.max(1, Math.ceil(l / 1.5)) * n;
  const flangeCornersPcs = 4 * sectionCount; // 4 corners per flange
  const flangeClipsPcs = Math.ceil((perimeterCM / 15) * sectionCount); // ~1 clip per 15cm perimeter
  const gasketTapeMeters = perimeterM * sectionCount; // gasket around flange perimeter

  return {
    widthCM: w,
    heightCM: h,
    lengthM: l,
    qty: n,
    wasteRatePercent: waste * 100,
    thicknessMM: gaugeInfo.mm,
    gaugeName: gaugeInfo.name,
    perimeterCM,
    perimeterM,
    netAreaM2,
    grossAreaM2,
    netTsai,
    grossTsai,
    sheets3x7Net,
    sheets3x7Gross,
    weightKgNet,
    weightKgGross,
    sectionCount,
    flangeCornersPcs,
    flangeClipsPcs,
    gasketTapeMeters
  };
}
