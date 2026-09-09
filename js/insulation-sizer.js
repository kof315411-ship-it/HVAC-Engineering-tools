/**
 * HVAC Engineering Tools - Pipe & Duct Insulation Sizing Calculation Engine
 * Reference: 中研院/公有建築物施工規範第 15080 章《空調用保溫》V3.0
 * 涵蓋：冰水管、熱水管、鹵水管、冷凝水排水管、風管保溫
 * 保溫材質：酚樹脂保溫材 (Phenolic Foam)、橡塑合成發泡 (NBR/Elastomeric)、聚乙烯發泡 (PE Foam)、玻璃棉 (Glass Wool)
 */

(function (window) {
  "use strict";

  // 標準管徑對照表 (公稱管徑 A / 吋別 Inch / 外徑 OD mm)
  const PIPE_SIZES = [
    { sizeA: 15, sizeInch: "1/2\"", odMM: 21.7 },
    { sizeA: 20, sizeInch: "3/4\"", odMM: 27.2 },
    { sizeA: 25, sizeInch: "1\"", odMM: 34.0 },
    { sizeA: 32, sizeInch: "1-1/4\"", odMM: 42.7 },
    { sizeA: 40, sizeInch: "1-1/2\"", odMM: 48.6 },
    { sizeA: 50, sizeInch: "2\"", odMM: 60.5 },
    { sizeA: 65, sizeInch: "2-1/2\"", odMM: 76.3 },
    { sizeA: 80, sizeInch: "3\"", odMM: 89.1 },
    { sizeA: 100, sizeInch: "4\"", odMM: 114.3 },
    { sizeA: 125, sizeInch: "5\"", odMM: 139.8 },
    { sizeA: 150, sizeInch: "6\"", odMM: 165.2 },
    { sizeA: 200, sizeInch: "8\"", odMM: 216.3 },
    { sizeA: 250, sizeInch: "10\"", odMM: 267.4 },
    { sizeA: 300, sizeInch: "12\"", odMM: 318.5 },
    { sizeA: 350, sizeInch: "14\"", odMM: 355.6 },
    { sizeA: 400, sizeInch: "16\"", odMM: 406.4 }
  ];

  // 規範第 15080 章 保溫材料物理性能標準
  const MATERIAL_SPECS = {
    phenolic: {
      id: "phenolic",
      name: "酚樹脂保溫材 (Phenolic Foam)",
      shortName: "酚樹脂",
      kVal: "≦ 0.022 W/m·K (20℃)",
      kNum: 0.022,
      density: "35 kg/m³",
      tempRange: "-40℃ ～ 80℃",
      waterAbsorb: "≦ 3% (ASTM C209)",
      fireRating: "具防火防水氣鋁箔護套、自封式蓋面",
      standards: "ASTM C209 / CNS",
      desc: "閉孔率高達 90% 以上，導熱係數極低，防結露性能最佳，適用於高要求之冰水、熱水及低溫鹵水系統。"
    },
    rubber: {
      id: "rubber",
      name: "橡塑合成發泡保溫材料 (NBR / Elastomeric)",
      shortName: "橡塑發泡",
      kVal: "≦ 0.036 W/m·K (24℃)",
      kNum: 0.036,
      density: "45 ～ 70 kg/m³",
      tempRange: "-40℃ ～ 80℃ (冰水/鹵水) / 0℃ ～ 80℃ (熱水)",
      waterAbsorb: "≦ 0.3% (ASTM C209)",
      fireRating: "BS476 Part 7 Class 1 / ASTM E84 (火焰蔓延≦25, 煙產生≦50) / FM 認證",
      standards: "ASTM C518 / ASTM E84 / FM Approved",
      desc: "彈性閉泡結構，透濕阻抗極高，耐酸鹼、吸震耐候，為中央空調水管與風管最通用之防結露保溫材。"
    },
    pe: {
      id: "pe",
      name: "非鹵素聚乙烯發泡保溫材 (PE Foam)",
      shortName: "PE 發泡",
      kVal: "≦ 0.039 W/m·K (30±5℃)",
      kNum: 0.039,
      density: "24 ± 3 kg/m³",
      tempRange: "-30℃ ～ 70℃",
      waterAbsorb: "≦ 0.01 g/cm³",
      fireRating: "難燃、低煙、燃燒時間<2分鐘、燃燒長度<6cm",
      standards: "CNS 10487 正字標記 / Halogen Free",
      desc: "獨立閉泡、無氟氯碳化物(CFC)、無鹵素環保材料，符合 CNS 10487 標準。"
    },
    glasswool: {
      id: "glasswool",
      name: "玻璃棉保溫材 (Glass Wool)",
      shortName: "玻璃棉",
      kVal: "≦ 0.044 W/m·K (70±5℃)",
      kNum: 0.044,
      density: "40 kg/m³ (外保溫) / 48 kg/m³ (內保溫)",
      tempRange: "0℃ ～ 120℃",
      waterAbsorb: "需配合表面強化鋁箔防潮",
      fireRating: "耐燃一級不燃材 / 耐高溫",
      standards: "CNS 3657 人造礦物纖維保溫材料",
      desc: "耐高溫、防火性能卓越，廣泛用於風管外保溫、熱水管及高溫熱媒管路。"
    }
  };

  // 系統流體類別定義
  const SYSTEM_TYPES = {
    chilled: {
      id: "chilled",
      name: "❄️ 冰水管路 (Chilled Water)",
      tempDesc: "常用工作溫度: 5℃ ～ 12℃ (設計基準: 7℃/12℃)",
      fluidType: "冰水 / 冰水回水",
      desc: "規範第 2.2.1 節規定，防止管面結露與冷量損失。"
    },
    hot: {
      id: "hot",
      name: "🔥 熱水管路 (Hot Water)",
      tempDesc: "常用工作溫度: 40℃ ～ 80℃ (設計基準: 60℃)",
      fluidType: "熱水 / 採暖熱水",
      desc: "規範第 2.2.2 節規定，防止熱量散失與人員防燙保護。"
    },
    brine: {
      id: "brine",
      name: "🧊 低溫鹵水管路 (Brine / 冰蓄熱)",
      tempDesc: "常用工作溫度: -15℃ ～ 0℃ (設計基準: -5℃)",
      fluidType: "乙二醇 / 鹵水溶液",
      desc: "規範第 2.2.1 節規定，極低溫流體需加強防結露保溫厚度及氣密防潮層。"
    },
    drain: {
      id: "drain",
      name: "💧 冷凝水排水管路 (Condensate Drain)",
      tempDesc: "常用工作溫度: 10℃ ～ 18℃",
      fluidType: "冷凝排水",
      desc: "規範第 2.2.1 節規定，防止排水管表面反潮滴水損壞天花板。"
    },
    duct: {
      id: "duct",
      name: "🌬️ 空調風管系統 (Air Duct)",
      tempDesc: "常用送風溫度: 12℃ ～ 16℃ (外保溫 / 內保溫)",
      fluidType: "冷氣送風 / 回風",
      desc: "規範第 2.1 節規定，送風及回風風管被覆外保溫或內襯消音保溫。"
    }
  };

  /**
   * 根據規範第 15080 章第 2.2.1 與 2.2.2 節推算保溫厚度 (mm)
   * @param {string} sysType - 系統類別 ("chilled", "hot", "brine", "drain", "duct")
   * @param {string} material - 材料代碼 ("phenolic", "rubber", "pe", "glasswool")
   * @param {number} sizeA - 管徑公稱口徑 (mm / A，例如 15, 20, 25, ..., 400)
   */
  function getInsulationThickness(sysType, material, sizeA) {
    if (sysType === "drain") {
      // 冷凝水排水管一律採用 19mm
      return 19;
    }

    if (sysType === "duct") {
      // 風管保溫厚度標準
      if (material === "glasswool") return 50;
      if (material === "rubber") return 25;
      if (material === "pe") return 25;
      return 30;
    }

    if (sysType === "brine") {
      // 低溫鹵水管路 (溫度低於 0℃，依規範加強等級)
      if (sizeA >= 125) return 65; // 5"及以上雙層加厚
      if (sizeA >= 80) return 50;  // 3"~4"
      if (sizeA >= 50) return 38;  // 2"~2-1/2"
      if (sizeA >= 20) return 32;  // 3/4"~1-1/2"
      return 25;                  // 1/2"及以下
    }

    // 冰水 (chilled) 與 熱水 (hot) 依規範 2.2.1 與 2.2.2 規定：
    if (material === "pe") {
      // 非鹵素聚乙烯發泡保溫材 (PE) 規範分級：
      // 100mm∮(含)以上厚度使用 [50]mm
      // 80mm∮～65mm∮厚度使用 [38]mm
      // 50mm∮～40mm∮厚度使用 [30]mm
      // 32mm∮～20mm∮厚度使用 [25]mm
      // 小於 15mm∮（含）採用厚度 [19]mm
      if (sizeA >= 100) return 50;
      if (sizeA >= 65) return 38;
      if (sizeA >= 40) return 30;
      if (sizeA >= 20) return 25;
      return 19;
    } else {
      // 酚樹脂 (phenolic) 與 橡塑發泡 (rubber) 規範分級：
      // 125mm∮(含)以上厚度使用 [50]mm
      // 100mm∮～80mm∮厚度使用 [38]mm
      // 65mm∮～50mm∮厚度使用 [30]mm
      // 40mm∮～20mm∮厚度使用 [25]mm
      // 小於 15mm∮（含）採用厚度 [19]mm
      if (sizeA >= 125) return 50;
      if (sizeA >= 80) return 38;
      if (sizeA >= 50) return 30;
      if (sizeA >= 20) return 25;
      return 19;
    }
  }

  /**
   * 查詢與計算指定管徑之保溫規格詳細結果
   * @param {Object} params
   * @param {string} params.sysType - 系統類別 ("chilled", "hot", "brine", "drain", "duct")
   * @param {string} params.material - 保溫材料 ("phenolic", "rubber", "pe", "glasswool")
   * @param {number} params.sizeA - 選定管徑 (A，如 50)
   */
  function lookupInsulation(params) {
    const sysType = params.sysType || "chilled";
    const material = params.material || "phenolic";
    const sizeA = parseInt(params.sizeA, 10) || 50;

    const sysInfo = SYSTEM_TYPES[sysType] || SYSTEM_TYPES.chilled;
    const matInfo = MATERIAL_SPECS[material] || MATERIAL_SPECS.phenolic;
    const pipeInfo = PIPE_SIZES.find((p) => p.sizeA === sizeA) || PIPE_SIZES[5]; // default 50A

    const thicknessMM = getInsulationThickness(sysType, material, pipeInfo.sizeA);
    const totalOuterDiameterMM = pipeInfo.odMM + thicknessMM * 2;

    // 同時計算其他三種材質在該管徑下的推薦厚度 (作為並列比對)
    const comparison = {
      phenolic: {
        thickMM: getInsulationThickness(sysType, "phenolic", pipeInfo.sizeA),
        outerDiameter: (pipeInfo.odMM + getInsulationThickness(sysType, "phenolic", pipeInfo.sizeA) * 2).toFixed(1),
        info: MATERIAL_SPECS.phenolic
      },
      rubber: {
        thickMM: getInsulationThickness(sysType, "rubber", pipeInfo.sizeA),
        outerDiameter: (pipeInfo.odMM + getInsulationThickness(sysType, "rubber", pipeInfo.sizeA) * 2).toFixed(1),
        info: MATERIAL_SPECS.rubber
      },
      pe: {
        thickMM: getInsulationThickness(sysType, "pe", pipeInfo.sizeA),
        outerDiameter: (pipeInfo.odMM + getInsulationThickness(sysType, "pe", pipeInfo.sizeA) * 2).toFixed(1),
        info: MATERIAL_SPECS.pe
      }
    };

    // 建立完整管徑清單對照表 (供表格渲染)
    const fullTable = PIPE_SIZES.map((p, idx) => {
      const thickP = getInsulationThickness(sysType, "phenolic", p.sizeA);
      const thickR = getInsulationThickness(sysType, "rubber", p.sizeA);
      const thickPE = getInsulationThickness(sysType, "pe", p.sizeA);
      const isSelected = p.sizeA === pipeInfo.sizeA;

      return {
        index: idx,
        sizeA: p.sizeA,
        sizeInch: p.sizeInch,
        odMM: p.odMM,
        thickPhenolic: thickP,
        odPhenolic: (p.odMM + thickP * 2).toFixed(1),
        thickRubber: thickR,
        odRubber: (p.odMM + thickR * 2).toFixed(1),
        thickPE: thickPE,
        odPE: (p.odMM + thickPE * 2).toFixed(1),
        currentSelectedThick: getInsulationThickness(sysType, material, p.sizeA),
        isSelected: isSelected
      };
    });

    return {
      sysType: sysType,
      sysInfo: sysInfo,
      material: material,
      matInfo: matInfo,
      pipeInfo: pipeInfo,
      thicknessMM: thicknessMM,
      totalOuterDiameterMM: totalOuterDiameterMM.toFixed(1),
      comparison: comparison,
      fullTable: fullTable,
      claddingGuide: {
        indoor: "PVC 膠帶纏繞或鋁箔膠帶緊密密封",
        plantAndExposed: "室外、露明處及機房水管保溫應另加金屬外護層，採用 [24# 鋁皮 (0.51mm)] 或 [26# 不銹鋼鐵皮 (0.45mm)]",
        hanger: "管路支撐、吊架吊座處應採用密度 [200 kg/m³] 高密度耐承重保溫鞍座，確保吊架處保溫完整且不被壓陷",
        valves: "法蘭、閥類、過濾器均須以相同厚度保溫包覆，過濾器須設計可單獨拆卸濾網而不破壞保溫層"
      }
    };
  }

  // 匯出全域模組
  window.HVACInsulationSizer = {
    PIPE_SIZES: PIPE_SIZES,
    MATERIAL_SPECS: MATERIAL_SPECS,
    SYSTEM_TYPES: SYSTEM_TYPES,
    getInsulationThickness: getInsulationThickness,
    lookupInsulation: lookupInsulation
  };
})(window);
