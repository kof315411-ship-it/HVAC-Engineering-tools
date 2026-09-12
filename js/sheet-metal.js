/**
 * HVAC Sheet Metal / Duct Surface Area Calculation Module (鐵皮才數計算 - 帶入原始 Excel 完整公式)
 * Reference: 原始 Excel 檔案《算鐵皮才數.xls》
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
    const lengthM = params.lengthM !== undefined ? params.lengthM : 120;
    const wasteRate = params.wasteRate !== undefined ? params.wasteRate : 0.10;

    const w = parseFloat(widthCM) || 0;
    const h = parseFloat(heightCM) || 0;
    const l = parseFloat(lengthM) || 0;
    const waste = parseFloat(wasteRate) || 0;

    // Excel H10 formula: 依最大邊長判斷板材號數
    const maxSideCM = Math.max(w, h);
    const gaugeInfo = this.getGaugeByLengthCM(maxSideCM);

    // 風管周長 (cm) = (長CM + 寬CM) * 2
    const perimeterCM = (w + h) * 2;
    const perimeterM = perimeterCM / 100.0;

    // Excel Col D (風管支數): = 米數 / 1.2 (若無法整除則無條件+1支 Math.ceil)
    const exactN = l > 0 ? l / 1.2 : 0;
    const n = Math.ceil(exactN);

    // 損耗加成乘數 = 1 + wasteRate (若輸入 10% 則為 1.10，若輸入 20% 則為 1.20)
    const wasteMultiplier = 1.0 + waste;

    // Excel Col G (保溫才數 / 鐵皮才數): = (((長CM + 寬CM) * 2 * 米數) / 9.29) * (1 + 損耗率)
    const tsaiNet = l > 0 ? (((w + h) * 2 * l) / 9.29) : 0;
    const tsai = tsaiNet * wasteMultiplier;

    // Excel Col E (3'×7'張數): = 保溫才數 / 21
    const sheets3x7 = tsai / 21.0;

    // Excel Col F (M2數): = 保溫才數 / 10.76
    const areaM2 = tsai / 10.76;

    // Excel Col I (總重量 kg): = ((((長CM + 寬CM) * 2 * 7.85) * 米數) / 100) * (1 + 損耗率)
    const weightKgNet = l > 0 ? (((w + h) * 2 * 7.85 * l) / 100.0) : 0;
    const weightKg = weightKgNet * wasteMultiplier;

    // Excel Col J (L法蘭角 個): = 風管支數 * 8
    const flangeCornersPcs = Math.round(n * 8);

    // Excel Col K (法蘭夾片 支): = ((長CM + 寬CM) * 2 / 15) * 風管支數
    const flangeClipsPcs = Math.round(((w + h) * 2 / 15.0) * n);

    // Excel Col L (墊片 米): = ((長CM + 寬CM) * 2 * 風管支數) / 100
    const gasketTapeMeters = ((w + h) * 2 * n) / 100.0;

    return {
      widthCM: w,
      heightCM: h,
      lengthM: l,
      qty: n,
      exactQty: exactN,
      wasteRatePercent: waste * 100,
      thicknessMM: gaugeInfo.mm,
      gaugeName: gaugeInfo.name,
      gauge: gaugeInfo.gauge,
      perimeterCM: perimeterCM,
      perimeterM: perimeterM,
      tsaiNet: tsaiNet,
      areaM2: areaM2,
      tsai: tsai,
      sheets3x7: sheets3x7,
      weightKgNet: weightKgNet,
      weightKg: weightKg,
      flangeCornersPcs: flangeCornersPcs,
      flangeClipsPcs: flangeClipsPcs,
      gasketTapeMeters: gasketTapeMeters
    };
  }
};
