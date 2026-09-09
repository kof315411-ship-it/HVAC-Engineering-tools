/**
 * HVAC Load Calculation Module (空調負載計算)
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

  // Calculate Single Room HVAC Load
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
    const freshAirCMH = params.freshAirCMH !== undefined && params.freshAirCMH !== null ? params.freshAirCMH : (people * 25);

    // Outdoor & Indoor Enthalpy
    const outEnthalpy = this.calcEnthalpy(outTemp, outRH);
    const inEnthalpy = this.calcEnthalpy(inTemp, inRH);

    // Space Ping
    const ping = areaM2 / 3.3;

    // Actual Base Space Load Rate (Kcal/h.坪)
    const tempDiffFactor = outTemp > 26 ? (outTemp - inTemp) / (outTemp - 26) : 1.0;
    const actualBaseRate = (baseRate / 2) * (height / 3.2) + (baseRate / 2) * tempDiffFactor;

    // Space Load (Kcal/h)
    const spaceLoad = ping * actualBaseRate;

    // Window Load (Kcal/h)
    const windowLoad = windowArea * windowRate;

    // People Heat Load (Kcal/h)
    const peopleLoad = people > 0 ? Math.max(0, (people - ping / 6) * 130) : 0;

    // Equipment Heat Load (Kcal/h)
    const equipLoad = (equipHP * 746 + equipW) * 0.86;

    // Fresh Air Heat Load (Kcal/h)
    const freshAir = freshAirCMH;
    const enthalpyDiff = Math.max(0, outEnthalpy - inEnthalpy);
    const freshAirLoad = 1.2 * freshAir * enthalpyDiff;

    // Total Load without Fresh Air (Kcal/h)
    const totalNoFresh = spaceLoad + windowLoad + peopleLoad + equipLoad;
    const rtNoFresh = totalNoFresh / 3024;
    const pingPerRTNoFresh = rtNoFresh > 0 ? ping / rtNoFresh : 0;

    // Total Load with Fresh Air (Kcal/h)
    const totalWithFresh = totalNoFresh + freshAirLoad;
    const rtWithFresh = totalWithFresh / 3024;
    const pingPerRTWithFresh = rtWithFresh > 0 ? ping / rtWithFresh : 0;

    // Winter Total Load (Kcal/h)
    const winterLoad = totalWithFresh * 0.6;
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
