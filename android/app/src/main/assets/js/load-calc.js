/**
 * HVAC Load Calculation Module (空調負載計算 - 帶入原始 Excel 完整公式)
 */

window.HVACLoadCalc = {
  // Calculate Air Enthalpy (Kcal/Kg) from Temperature (°C) and Relative Humidity (%)
  calcEnthalpy: function(temp, rh) {
    const pSat = 6.1078 * Math.pow(10, (7.5 * temp) / (237.3 + temp));
    const pV = pSat * (rh / 100);
    const w = (0.622 * pV) / (1013.25 - pV);
    const hKJ = 1.006 * temp + w * (2501 + 1.86 * temp);
    return hKJ / 4.1868;
  },

  // Calculate Single Room HVAC Load matching original 負載計算.xlsx formulas
  calcRoomLoad: function(params) {
    const outTemp = params.outTemp !== undefined ? params.outTemp : 33;
    const outRH = params.outRH !== undefined ? params.outRH : 75;
    const roomName = params.roomName || "新空間";
    const inTemp = params.inTemp !== undefined ? params.inTemp : 24;
    const inRH = params.inRH !== undefined ? params.inRH : 55;
    const height = params.height || 3.2;
    const areaM2 = params.areaM2 || 33;
    const baseRate = params.baseRate || 450;
    const windowArea = params.windowArea || 0;
    const windowRate = params.windowRate || 120;
    const people = params.people !== undefined ? params.people : 2;
    const equipHP = params.equipHP || 0;
    const equipW = params.equipW || 0;
    const freshAirCMH = params.freshAirCMH !== undefined && params.freshAirCMH !== null ? params.freshAirCMH : (people * 20);

    // Outdoor & Indoor Enthalpy
    const outEnthalpy = this.calcEnthalpy(outTemp, outRH);
    const inEnthalpy = this.calcEnthalpy(inTemp, inRH);

    // Col 10: 坪數 J = I / 3.3
    const ping = areaM2 / 3.3;

    // Col 12: 實際空間負載 (Kcal/h.坪)
    // Excel formula: =(K/2*F/3.2 + K/2*($A$3-C)/($A$3-26))
    const tempDiffFactor = outTemp > 26 ? (outTemp - inTemp) / (outTemp - 26) : 1.0;
    const actualBaseRate = (baseRate / 2) * (height / 3.2) + (baseRate / 2) * tempDiffFactor;

    // Col 13: 空間負載 (Kcal/h) M = J * L
    const spaceLoad = ping * actualBaseRate;

    // Col 16: 窗戶負載 (Kcal/h) P = O * N
    const windowLoad = windowArea * windowRate;

    // Col 18: 人員負載 (Kcal/h) R = IF(Q>0, (Q - (J/6))*130, 0)
    const peopleLoad = people > 0 ? Math.max(0, (people - ping / 6) * 130) : 0;

    // Col 21: 設備發熱量 (Kcal/h) U
    // Excel formula: =IF((S*0.746 + T/1000 - (4/(0.3048^2))*I/1000)*860<0, 0, (S*0.746 + T/1000 - (4/(0.3048^2))*I/1000)*860)
    const areaLightingOffsetKW = (4.0 / (0.3048 * 0.3048)) * (areaM2 / 1000.0);
    const rawEquipKW = (equipHP * 0.746) + (equipW / 1000.0) - areaLightingOffsetKW;
    const equipLoad = Math.max(0, rawEquipKW * 860.0);

    // Col 22: 外氣 CMH V = Q * 20
    const freshAir = freshAirCMH;

    // Col 23: 外氣負載 (Kcal/h) W = 72 * V / 60 * (D3 - E)
    const enthalpyDiff = Math.max(0, outEnthalpy - inEnthalpy);
    const freshAirLoad = (72.0 * freshAir / 60.0) * enthalpyDiff;

    // Col 25: 不含外氣負載合計 (Kcal/h) Y = U + R + P + M
    const totalNoFresh = spaceLoad + windowLoad + peopleLoad + equipLoad;

    // Col 26: 不含外氣 RT Z = Y / 3024
    const rtNoFresh = totalNoFresh / 3024;

    // Col 27: 不含外氣 坪/RT AA = J / Z
    const pingPerRTNoFresh = rtNoFresh > 0 ? ping / rtNoFresh : 0;

    // Col 28: 含外氣負載合計 (Kcal/h) AB = W + U + R + P + M
    const totalWithFresh = totalNoFresh + freshAirLoad;

    // Col 29: 含外氣 RT AC = AB / 3024
    const rtWithFresh = totalWithFresh / 3024;

    // Col 30: 含外氣 坪/RT AD = J / AC
    const pingPerRTWithFresh = rtWithFresh > 0 ? ping / rtWithFresh : 0;

    // Col 32: 冬季負載合計 (Kcal/h) AF = AB * 0.6
    const winterLoad = totalWithFresh * 0.6;

    // Col 33: 冬季 RT AG = AF / 3024
    const winterRT = winterLoad / 3024;

    return {
      roomName,
      outTemp,
      outRH,
      outEnthalpy,
      inTemp,
      inRH,
      inEnthalpy,
      height,
      areaM2,
      ping,
      baseRate,
      actualBaseRate,
      spaceLoad,
      windowArea,
      windowRate,
      windowLoad,
      people,
      peopleLoad,
      equipHP,
      equipW,
      equipLoad,
      freshAir,
      freshAirLoad,
      totalNoFresh,
      rtNoFresh,
      pingPerRTNoFresh,
      totalWithFresh,
      rtWithFresh,
      pingPerRTWithFresh,
      winterLoad,
      winterRT
    };
  }
};
