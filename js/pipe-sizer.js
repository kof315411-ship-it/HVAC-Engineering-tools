/**
 * HVAC Pipe Sizing Lookup Module (管徑表速查與推算)
 */

window.HVACPipeSizer = {
  CHILLED_WATER_TABLE: [
    { sizeA: "15A", sizeInch: '1/2"', maxLPM: 8.4 },
    { sizeA: "20A", sizeInch: '3/4"', maxLPM: 18.1 },
    { sizeA: "25A", sizeInch: '1"', maxLPM: 33.1 },
    { sizeA: "32A", sizeInch: '1-1/4"', maxLPM: 72.1 },
    { sizeA: "40A", sizeInch: '1-1/2"', maxLPM: 108.1 },
    { sizeA: "50A", sizeInch: '2"', maxLPM: 186.1 },
    { sizeA: "65A", sizeInch: '2-1/2"', maxLPM: 300.1 },
    { sizeA: "80A", sizeInch: '3"', maxLPM: 540.1 },
    { sizeA: "100A", sizeInch: '4"', maxLPM: 1080.1 },
    { sizeA: "125A", sizeInch: '5"', maxLPM: 1800.1 },
    { sizeA: "150A", sizeInch: '6"', maxLPM: 2700.1 },
    { sizeA: "200A", sizeInch: '8"', maxLPM: 4800.1 },
    { sizeA: "250A", sizeInch: '10"', maxLPM: 7500.1 },
    { sizeA: "300A", sizeInch: '12"', maxLPM: 10500.1 },
    { sizeA: "350A", sizeInch: '14"', maxLPM: 12000.1 },
    { sizeA: "400A", sizeInch: '16"', maxLPM: 16800.1 },
    { sizeA: "450A", sizeInch: '18"', maxLPM: 21600.1 },
    { sizeA: "500A", sizeInch: '20"', maxLPM: 27000.1 },
    { sizeA: "600A", sizeInch: '24"', maxLPM: 39000.1 },
    { sizeA: "750A", sizeInch: '30"', maxLPM: 61800.1 },
    { sizeA: "800A", sizeInch: '32"', maxLPM: 999999.0 },
  ],

  COOLING_WATER_TABLE: [
    { sizeA: "15A", sizeInch: '1/2"', maxLPM: 6.0 },
    { sizeA: "20A", sizeInch: '3/4"', maxLPM: 6.1 },
    { sizeA: "25A", sizeInch: '1"', maxLPM: 12.1 },
    { sizeA: "32A", sizeInch: '1-1/4"', maxLPM: 24.1 },
    { sizeA: "40A", sizeInch: '1-1/2"', maxLPM: 51.1 },
    { sizeA: "50A", sizeInch: '2"', maxLPM: 78.1 },
    { sizeA: "65A", sizeInch: '2-1/2"', maxLPM: 150.1 },
    { sizeA: "80A", sizeInch: '3"', maxLPM: 240.1 },
    { sizeA: "100A", sizeInch: '4"', maxLPM: 420.1 },
    { sizeA: "125A", sizeInch: '5"', maxLPM: 840.1 },
    { sizeA: "150A", sizeInch: '6"', maxLPM: 1560.1 },
    { sizeA: "200A", sizeInch: '8"', maxLPM: 2520.1 },
    { sizeA: "250A", sizeInch: '10"', maxLPM: 4800.1 },
    { sizeA: "300A", sizeInch: '12"', maxLPM: 7500.1 },
    { sizeA: "350A", sizeInch: '14"', maxLPM: 10500.1 },
    { sizeA: "400A", sizeInch: '16"', maxLPM: 13200.1 },
    { sizeA: "450A", sizeInch: '18"', maxLPM: 16800.1 },
    { sizeA: "500A", sizeInch: '20"', maxLPM: 21600.1 },
    { sizeA: "600A", sizeInch: '24"', maxLPM: 27000.1 },
    { sizeA: "750A", sizeInch: '30"', maxLPM: 39000.1 },
    { sizeA: "800A", sizeInch: '32"', maxLPM: 61800.1 },
  ],

  lookupPipeSize: function(sysType, rtValue, lpmValue, customFactor) {
    if (!sysType) sysType = "chilled";
    const isChilled = sysType === "chilled";
    const defaultFactor = isChilled ? 10.08 : 12.8;
    const factor = customFactor !== undefined && customFactor !== null && customFactor > 0 ? customFactor : defaultFactor;
    const table = isChilled ? this.CHILLED_WATER_TABLE : this.COOLING_WATER_TABLE;

    let rt = 0;
    let lpm = 0;

    if (rtValue !== null && rtValue !== undefined && rtValue !== "") {
      rt = parseFloat(rtValue) || 0;
      lpm = rt * factor;
    } else if (lpmValue !== null && lpmValue !== undefined && lpmValue !== "") {
      lpm = parseFloat(lpmValue) || 0;
      rt = factor > 0 ? lpm / factor : 0;
    }

    let recommended = table[table.length - 1];
    let recommendedIdx = table.length - 1;

    for (let i = 0; i < table.length; i++) {
      if (lpm <= table[i].maxLPM) {
        recommended = table[i];
        recommendedIdx = i;
        break;
      }
    }

    return {
      sysType,
      sysName: isChilled ? "冰水管 (Chilled Water)" : "冷卻水管 (Cooling Water)",
      factor,
      rt,
      lpm,
      recommendedSizeA: recommended.sizeA,
      recommendedSizeInch: recommended.sizeInch,
      maxLPM: recommended.maxLPM,
      recommendedIdx,
      table
    };
  }
};
