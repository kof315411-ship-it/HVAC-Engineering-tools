/**
 * HVAC Load Calculation Module (空調負載計算)
 */

// Calculate Air Enthalpy (Kcal/Kg) from Temperature (°C) and Relative Humidity (%)
export function calcEnthalpy(temp, rh) {
  // Saturated vapor pressure (hPa)
  const pSat = 6.1078 * Math.pow(10, (7.5 * temp) / (237.3 + temp));
  // Vapor pressure
  const pV = pSat * (rh / 100);
  // Humidity ratio W (kg/kg)
  const w = (0.622 * pV) / (1013.25 - pV);
  // Enthalpy kJ/kg = 1.006 * T + w * (2501 + 1.86 * T)
  const hKJ = 1.006 * temp + w * (2501 + 1.86 * temp);
  // Convert to Kcal/kg (1 kJ = 1 / 4.1868 Kcal)
  return hKJ / 4.1868;
}

// Calculate Single Room HVAC Load
export function calcRoomLoad(params) {
  const {
    outTemp = 33,
    outRH = 75,
    roomName = "新空間",
    inTemp = 24,
    inRH = 55,
    height = 3.2,
    areaM2 = 33,
    baseRate = 450, // Kcal/h.坪
    windowArea = 0,
    windowRate = 120,
    people = 2,
    equipHP = 0,
    equipW = 0,
    freshAirCMH = null, // Auto calculated if null
    freshAirPerPerson = 25 // CMH per person
  } = params;

  // Outdoor Enthalpy
  const outEnthalpy = calcEnthalpy(outTemp, outRH);
  // Indoor Enthalpy
  const inEnthalpy = calcEnthalpy(inTemp, inRH);

  // Space Ping
  const ping = areaM2 / 3.3;

  // Actual Base Space Load Rate (Kcal/h.坪)
  // Formula: BaseRate/2 * Height/3.2 + BaseRate/2 * (Tout - Tin)/(Tout - 26)
  const tempDiffFactor = outTemp > 26 ? (outTemp - inTemp) / (outTemp - 26) : 1.0;
  const actualBaseRate = (baseRate / 2) * (height / 3.2) + (baseRate / 2) * tempDiffFactor;

  // Space Load (Kcal/h)
  const spaceLoad = ping * actualBaseRate;

  // Window Load (Kcal/h)
  const windowLoad = windowArea * windowRate;

  // People Heat Load (Kcal/h): IF(people > 0, (people - (ping / 6)) * 130, 0)
  const peopleLoad = people > 0 ? Math.max(0, (people - ping / 6) * 130) : 0;

  // Equipment Heat Load (Kcal/h): (HP * 746 + W) * 0.86 (1W = 0.86 Kcal/h)
  const equipLoad = (equipHP * 746 + equipW) * 0.86;

  // Fresh Air CMH
  const freshAir = freshAirCMH !== null ? freshAirCMH : people * freshAirPerPerson;

  // Fresh Air Heat Load (Kcal/h): 72 * FreshAir / 60 * (H_out - H_in)
  // (72 = 1.2 kg/m3 * 60 min/h)
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
