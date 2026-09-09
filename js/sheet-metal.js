/**
 * HVAC Sheet Metal / Duct Surface Area Calculation Module (鐵皮才數計算 - 帶入原始 Excel 完整公式)
 */

window.HVACSheetMetal = {
  STEEL_GAUGES: [
    { mm: 0.5, name: "26# (0.5mm)", weightPerM2: 3.925 },
    { mm: 0.6, name: "24# (0.6mm)", weightPerM2: 4.71 },
    { mm: 0.8, name: "22# (0.8mm)", weightPerM2: 6.536 },
    { mm: 1.0, name: "20# (1.0mm)", weightPerM2: 7.85 },
    { mm: 1.2, name: "18# (1.2mm)", weightPerM2: 9.42 },
  ],

  calcSheetMetal: function(params) {
    const widthCM = params.widthCM !== undefined ? params.widthCM : 80;
    const heightCM = params.heightCM !== undefined ? params.heightCM : 40;
    const lengthM = params.lengthM !== undefined ? params.lengthM : 3;
    const qty = params.qty !== undefined ? params.qty : 2.5;
    const wasteRate = params.wasteRate !== undefined ? params.wasteRate : 0.10;
    const thicknessMM = params.thicknessMM !== undefined ? params.thicknessMM : 0.8;

    const w = parseFloat(widthCM) || 0;
    const h = parseFloat(heightCM) || 0;
    const l = parseFloat(lengthM) || 0;
    const n = parseFloat(qty) || 1;
    const waste = parseFloat(wasteRate) || 0;

    // Col 1 & 2: 周長 Perimeter (cm) = (L_cm + W_cm) * 2
    const perimeterCM = (w + h) * 2;
    const perimeterM = perimeterCM / 100.0;

    // Col 6: M2數 (包含裁切損耗率)
    // Excel formula: PerimeterM * LengthM * Qty * (1 + waste)
    const netAreaM2 = perimeterM * l * n;
    const grossAreaM2 = netAreaM2 * (1 + waste);

    // Col 7: 保溫才數 (1 m2 = 10.76391 才)
    const netTsai = netAreaM2 * 10.76391;
    const grossTsai = grossAreaM2 * 10.76391;

    // Col 5: 3'×7'張數 = 保溫才數 / 21
    const sheets3x7Net = netTsai / 21.0;
    const sheets3x7Gross = grossTsai / 21.0;

    // Col 8 & 9: 總重量 (kg) = M2數 * 鈑材每米平方重量
    const gaugeInfo = this.STEEL_GAUGES.find(g => Math.abs(g.mm - thicknessMM) < 0.05) || this.STEEL_GAUGES[2];
    const weightKgNet = netAreaM2 * gaugeInfo.weightPerM2;
    const weightKgGross = grossAreaM2 * gaugeInfo.weightPerM2;

    // Col 10, 11, 12: 法蘭與配件估算
    const sectionCount = Math.max(1, Math.ceil(l / 1.5)) * n;
    const flangeCornersPcs = 4 * sectionCount * 2; // Col 10
    const flangeClipsPcs = Math.ceil((perimeterCM / 15) * sectionCount * 2); // Col 11
    const gasketTapeMeters = perimeterM * sectionCount; // Col 12

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
