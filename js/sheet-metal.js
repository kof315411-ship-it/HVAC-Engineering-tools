/**
 * HVAC Sheet Metal / Duct Surface Area Calculation Module (鐵皮才數計算)
 */

window.HVACSheetMetal = {
  STEEL_GAUGES: [
    { mm: 0.5, name: "#26 (0.5mm)", weightPerM2: 3.925 },
    { mm: 0.6, name: "#24 (0.6mm)", weightPerM2: 4.71 },
    { mm: 0.8, name: "#22 (0.8mm)", weightPerM2: 6.28 },
    { mm: 1.0, name: "#20 (1.0mm)", weightPerM2: 7.85 },
    { mm: 1.2, name: "#18 (1.2mm)", weightPerM2: 9.42 },
  ],

  calcSheetMetal: function(params) {
    const widthCM = params.widthCM !== undefined ? params.widthCM : 100;
    const heightCM = params.heightCM !== undefined ? params.heightCM : 50;
    const lengthM = params.lengthM !== undefined ? params.lengthM : 10;
    const qty = params.qty !== undefined ? params.qty : 1;
    const wasteRate = params.wasteRate !== undefined ? params.wasteRate : 0.10;
    const thicknessMM = params.thicknessMM !== undefined ? params.thicknessMM : 0.8;

    const w = parseFloat(widthCM) || 0;
    const h = parseFloat(heightCM) || 0;
    const l = parseFloat(lengthM) || 0;
    const n = parseInt(qty) || 1;
    const waste = parseFloat(wasteRate) || 0;

    const perimeterCM = 2 * (w + h);
    const perimeterM = perimeterCM / 100;

    const netAreaM2 = perimeterM * l * n;
    const grossAreaM2 = netAreaM2 * (1 + waste);

    const netTsai = netAreaM2 * 10.76391;
    const grossTsai = grossAreaM2 * 10.76391;

    const sheets3x7Net = netTsai / 21;
    const sheets3x7Gross = grossTsai / 21;

    const gaugeInfo = this.STEEL_GAUGES.find(g => Math.abs(g.mm - thicknessMM) < 0.05) || this.STEEL_GAUGES[2];
    const weightKgNet = netAreaM2 * gaugeInfo.weightPerM2;
    const weightKgGross = grossAreaM2 * gaugeInfo.weightPerM2;

    const sectionCount = Math.max(1, Math.ceil(l / 1.5)) * n;
    const flangeCornersPcs = 4 * sectionCount;
    const flangeClipsPcs = Math.ceil((perimeterCM / 15) * sectionCount);
    const gasketTapeMeters = perimeterM * sectionCount;

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
};
