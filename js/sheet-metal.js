/**
 * HVAC Sheet Metal / Duct Surface Area Calculation Module (鐵皮才數計算 - 帶入原始 Excel 完整公式)
 */

window.HVACSheetMetal = {
  // Excel H10 formula: =IF(A10=0,"",IF(A10<31,"26#",IF(A10<76,"24#",IF(A10<151,"22#",IF(A10<225,"20#","18#")))))
  getGaugeByLengthCM: function(lengthCM) {
    const a = parseFloat(lengthCM) || 0;
    if (a < 31) return { gauge: "26#", mm: 0.5, name: "26# (0.5mm)", weightPerM2: 3.925 };
    if (a < 76) return { gauge: "24#", mm: 0.6, name: "24# (0.6mm)", weightPerM2: 4.71 };
    if (a < 151) return { gauge: "22#", mm: 0.8, name: "22# (0.8mm)", weightPerM2: 6.536 };
    if (a < 225) return { gauge: "20#", mm: 1.0, name: "20# (1.0mm)", weightPerM2: 7.85 };
    return { gauge: "18#", mm: 1.2, name: "18# (1.2mm)", weightPerM2: 9.42 };
  },

  calcSheetMetal: function(params) {
    const widthCM = params.widthCM !== undefined ? params.widthCM : 80;
    const heightCM = params.heightCM !== undefined ? params.heightCM : 40;
    const lengthM = params.lengthM !== undefined ? params.lengthM : 1.2;
    const wasteRate = params.wasteRate !== undefined ? params.wasteRate : 0.10;

    const w = parseFloat(widthCM) || 0;
    const h = parseFloat(heightCM) || 0;
    const l = parseFloat(lengthM) || 0;
    const waste = parseFloat(wasteRate) || 0;

    // Excel H10 formula decision based on A10 (長CM):
    const maxSideCM = Math.max(w, h);
    const gaugeInfo = this.getGaugeByLengthCM(maxSideCM);

    // Excel formula: 風管支數 N = 米數 (長度 M) / 1.2
    const n = l > 0 ? l / 1.2 : 0;

    // 周長 Perimeter (cm) = (L_cm + W_cm) * 2
    const perimeterCM = (w + h) * 2;
    const perimeterM = perimeterCM / 100.0;

    // M2數 (包含裁切損耗率)
    // Excel formula: PerimeterM * LengthM * Qty * (1 + waste)
    const netAreaM2 = perimeterM * l * n;
    const grossAreaM2 = netAreaM2 * (1 + waste);

    // 保溫才數 (1 m2 = 10.76391 才)
    const netTsai = netAreaM2 * 10.76391;
    const grossTsai = grossAreaM2 * 10.76391;

    // 3'×7'張數 = 保溫才數 / 21
    const sheets3x7Net = netTsai / 21.0;
    const sheets3x7Gross = grossTsai / 21.0;

    // 總重量 (kg) = M2數 * 鈑材每米平方重量
    const weightKgNet = netAreaM2 * gaugeInfo.weightPerM2;
    const weightKgGross = grossAreaM2 * gaugeInfo.weightPerM2;

    // 法蘭與配件估算
    const sectionCount = Math.max(1, Math.ceil(l / 1.2)) * n;
    const flangeCornersPcs = 4 * sectionCount * 2;
    const flangeClipsPcs = Math.ceil((perimeterCM / 15) * sectionCount * 2);
    const gasketTapeMeters = perimeterM * sectionCount;

    return {
      widthCM: w,
      heightCM: h,
      lengthM: l,
      qty: n,
      wasteRatePercent: waste * 100,
      thicknessMM: gaugeInfo.mm,
      gaugeName: gaugeInfo.name,
      gauge: gaugeInfo.gauge,
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
