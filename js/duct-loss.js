/**
 * HVAC Duct Pressure Loss Calculation Module (風管壓損計算)
 */

export const FITTING_TYPES = [
  { id: "DUCT", name: "直線風管 (Straight Duct)", fixedPa: 0, cFactor: 0 },
  { id: "ELB90", name: "90° 彎頭 (90° Elbow)", fixedPa: 0, cFactor: 0.24 },
  { id: "ELB45", name: "45° 彎頭 (45° Elbow)", fixedPa: 0, cFactor: 0.15 },
  { id: "TEE", name: "三通分枝 (Tee Junction)", fixedPa: 0, cFactor: 0.40 },
  { id: "LOUVER", name: "外氣百葉 (Louver)", fixedPa: 120, cFactor: 1.5 },
  { id: "FILTER", name: "過濾網 (Air Filter)", fixedPa: 100, cFactor: 1.0 },
  { id: "COIL", name: "冷卻盤管 (Cooling Coil)", fixedPa: 50, cFactor: 0.5 },
  { id: "SILENCER", name: "消音器 (Silencer)", fixedPa: 70, cFactor: 0.78 },
  { id: "VD", name: "風量調節閥 (Volume Damper)", fixedPa: 0, cFactor: 0.15 },
  { id: "SAR", name: "出風口/散流器 (Diffuser/Grill)", fixedPa: 17.3, cFactor: 0.25 },
];

export function calcEquivalentDiameter(wMM, hMM) {
  if (!wMM || !hMM || wMM <= 0 || hMM <= 0) return 0;
  // Huebscher formula: D_eq = 1.30 * (W * H)^0.625 / (W + H)^0.25
  return (1.30 * Math.pow(wMM * hMM, 0.625)) / Math.pow(wMM + hMM, 0.25);
}

export function calcDuctLoss(params) {
  const {
    flowUnit = "CMH", // "CMH" or "CMS"
    flowValue = 5000,
    widthMM = 950,
    heightMM = 400,
    lengthM = 10,
    fittingId = "DUCT",
    fittingQty = 1,
    customCFactor = null,
    customFixedPa = null,
    roughnessMM = 0.15 // Galvanized steel roughness
  } = params;

  // Convert flow to m3/s (CMS)
  const flowCMS = flowUnit === "CMH" ? flowValue / 3600 : flowValue;
  const flowCMH = flowUnit === "CMH" ? flowValue : flowValue * 3600;

  // Duct area (m2)
  const widthM = widthMM / 1000;
  const heightM = heightMM / 1000;
  const areaM2 = widthM * heightM;

  // Air velocity V (m/s)
  const velocity = areaM2 > 0 ? flowCMS / areaM2 : 0;

  // Velocity Pressure Pv (Pa) = 0.5 * rho * V^2 (rho = 1.2 kg/m3)
  const pvPa = 0.6 * Math.pow(velocity, 2);

  // Equivalent Diameter (mm & m)
  const deqMM = calcEquivalentDiameter(widthMM, heightMM);
  const deqM = deqMM / 1000;

  // Friction factor & Friction Loss per meter (Pa/m)
  let frictionLossPerM = 0;
  let ductFrictionLoss = 0;

  if (deqM > 0 && velocity > 0) {
    const kinematicViscosity = 1.5e-5; // m2/s for air at 20°C
    const reynolds = (velocity * deqM) / kinematicViscosity;
    
    // Haaland approximation for Darcy-Weisbach friction factor
    const relRoughness = roughnessMM / deqMM;
    const fFactor = Math.pow(
      -1.8 * Math.log10(Math.pow(relRoughness / 3.7, 1.11) + 6.9 / reynolds),
      -2
    );

    // Friction loss per meter (Pa/m) = f * (1/D) * (0.5 * rho * V^2)
    frictionLossPerM = (fFactor / deqM) * pvPa;
    ductFrictionLoss = frictionLossPerM * lengthM;
  }

  // Fitting Loss Calculation
  const fittingPreset = FITTING_TYPES.find(f => f.id === fittingId) || FITTING_TYPES[0];
  const cFactor = customCFactor !== null ? customCFactor : fittingPreset.cFactor;
  const fixedPa = customFixedPa !== null ? customFixedPa : fittingPreset.fixedPa;

  let fittingLossPa = 0;
  if (fixedPa > 0) {
    fittingLossPa = fixedPa * fittingQty;
  } else {
    fittingLossPa = cFactor * pvPa * fittingQty;
  }

  // Segment total pressure loss
  const segmentLossPa = ductFrictionLoss + fittingLossPa;

  return {
    flowCMH,
    flowCMS,
    widthMM,
    heightMM,
    areaM2,
    deqMM,
    velocity,
    pvPa,
    lengthM,
    frictionLossPerM,
    ductFrictionLoss,
    fittingId,
    fittingName: fittingPreset.name,
    fittingQty,
    cFactor,
    fixedPa,
    fittingLossPa,
    segmentLossPa
  };
}

// Calculate System Total Loss with Safety Factor
export function calcSystemDuctLoss(segments, safetyFactor = 0.20) {
  let totalPa = 0;
  segments.forEach(seg => {
    totalPa += seg.segmentLossPa;
  });

  const safetyAddPa = totalPa * safetyFactor;
  const grandTotalPa = totalPa + safetyAddPa;
  const grandTotalMMAq = grandTotalPa / 9.80665;

  return {
    subtotalPa: totalPa,
    safetyFactorPercent: safetyFactor * 100,
    safetyAddPa,
    grandTotalPa,
    grandTotalMMAq
  };
}
