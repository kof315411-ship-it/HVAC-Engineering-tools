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
  },

  // Export Load Calculation Report to formatted Excel file matching 負載計算.xlsx layout
  exportToExcel: function(outTemp, outRH, outEnthalpy, rooms) {
    if (typeof XLSX === "undefined") {
      alert("Excel 匯出元件尚未載入，請稍後再試！");
      return;
    }

    if (!rooms || rooms.length === 0) {
      alert("目前無任何空間變數，無法匯出報告！");
      return;
    }

    const dateStr = new Date().toISOString().split('T')[0];
    
    const data = [
      ["空調熱負載計算報告書 (HVAC Heat Load Calculation Report)"],
      [],
      ["室外乾球溫度", `${outTemp} °Cdb`, "室外相對濕度", `${outRH} %RH`, "室外空氣焓值", `${outEnthalpy.toFixed(2)} Kcal/kg`, "報告日期", dateStr],
      [],
      [
        "空間/用途別", "環境需求", "", "環境焓值", "空調需求", "空間大小", "", 
        "標準空間負載", "實際空間負載", "空間負載", 
        "窗戶大小負載", "", "", 
        "人員負載", "", 
        "設備發熱量估算", "", "", 
        "外氣負載", "", 
        "不含外氣負載合計", "", "", 
        "含外氣負載合計", "", "", 
        "冬季負載合計", ""
      ],
      [
        "", "(°Cdb)", "(%RH)", "(Kcal/Kg)", "高度(m)", "(m²)", "(坪)", 
        "(Kcal/h.坪)", "(Kcal/h.坪)", "(Kcal/h)", 
        "(m²)", "(Kcal/h.m²)", "(Kcal/h)", 
        "(人)", "(Kcal/h)", 
        "Hp", "W", "(Kcal/h)", 
        "CMH", "(Kcal/h)", 
        "(Kcal/h)", "(RT)", "(坪/RT)", 
        "(Kcal/h)", "(RT)", "(坪/RT)", 
        "(Kcal/h)", "(RT)"
      ]
    ];

    let totalAreaM2 = 0;
    let totalPing = 0;
    let totalSpaceLoad = 0;
    let totalWindowLoad = 0;
    let totalPeople = 0;
    let totalPeopleLoad = 0;
    let totalEquipLoad = 0;
    let totalFreshAirCMH = 0;
    let totalFreshAirLoad = 0;
    let totalNoFreshKcal = 0;
    let totalWithFreshKcal = 0;
    let totalWinterKcal = 0;

    rooms.forEach(r => {
      totalAreaM2 += r.areaM2 || 0;
      totalPing += r.ping || 0;
      totalSpaceLoad += r.spaceLoad || 0;
      totalWindowLoad += r.windowLoad || 0;
      totalPeople += r.people || 0;
      totalPeopleLoad += r.peopleLoad || 0;
      totalEquipLoad += r.equipLoad || 0;
      totalFreshAirCMH += r.freshAir || 0;
      totalFreshAirLoad += r.freshAirLoad || 0;
      totalNoFreshKcal += r.totalNoFresh || 0;
      totalWithFreshKcal += r.totalWithFresh || 0;
      totalWinterKcal += r.winterLoad || 0;

      data.push([
        r.roomName,
        r.inTemp,
        r.inRH,
        Number((r.inEnthalpy || 0).toFixed(2)),
        r.height,
        r.areaM2,
        Number((r.ping || 0).toFixed(2)),
        r.baseRate,
        Number((r.actualBaseRate || 0).toFixed(1)),
        Math.round(r.spaceLoad || 0),
        r.windowArea,
        r.windowRate,
        Math.round(r.windowLoad || 0),
        r.people,
        Math.round(r.peopleLoad || 0),
        r.equipHP,
        r.equipW,
        Math.round(r.equipLoad || 0),
        r.freshAir,
        Math.round(r.freshAirLoad || 0),
        Math.round(r.totalNoFresh || 0),
        Number((r.rtNoFresh || 0).toFixed(2)),
        Number((r.pingPerRTNoFresh || 0).toFixed(2)),
        Math.round(r.totalWithFresh || 0),
        Number((r.rtWithFresh || 0).toFixed(2)),
        Number((r.pingPerRTWithFresh || 0).toFixed(2)),
        Math.round(r.winterLoad || 0),
        Number((r.winterRT || 0).toFixed(2))
      ]);
    });

    const totalRtNoFresh = totalNoFreshKcal / 3024;
    const totalRtWithFresh = totalWithFreshKcal / 3024;
    const totalWinterRT = totalWinterKcal / 3024;

    // Add Totals summary row
    data.push([
      "總計 (Total)",
      "", "", "", "",
      Number(totalAreaM2.toFixed(1)),
      Number(totalPing.toFixed(2)),
      "", "",
      Math.round(totalSpaceLoad),
      "", "",
      Math.round(totalWindowLoad),
      totalPeople,
      Math.round(totalPeopleLoad),
      "", "",
      Math.round(totalEquipLoad),
      totalFreshAirCMH,
      Math.round(totalFreshAirLoad),
      Math.round(totalNoFreshKcal),
      Number(totalRtNoFresh.toFixed(2)),
      totalRtNoFresh > 0 ? Number((totalPing / totalRtNoFresh).toFixed(2)) : 0,
      Math.round(totalWithFreshKcal),
      Number(totalRtWithFresh.toFixed(2)),
      totalRtWithFresh > 0 ? Number((totalPing / totalRtWithFresh).toFixed(2)) : 0,
      Math.round(totalWinterKcal),
      Number(totalWinterRT.toFixed(2))
    ]);

    const ws = XLSX.utils.aoa_to_sheet(data);

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 27 } },
      { s: { r: 4, c: 1 }, e: { r: 4, c: 2 } },
      { s: { r: 4, c: 5 }, e: { r: 4, c: 6 } },
      { s: { r: 4, c: 10 }, e: { r: 4, c: 12 } },
      { s: { r: 4, c: 13 }, e: { r: 4, c: 14 } },
      { s: { r: 4, c: 15 }, e: { r: 4, c: 17 } },
      { s: { r: 4, c: 18 }, e: { r: 4, c: 19 } },
      { s: { r: 4, c: 20 }, e: { r: 4, c: 22 } },
      { s: { r: 4, c: 23 }, e: { r: 4, c: 25 } },
      { s: { r: 4, c: 26 }, e: { r: 4, c: 27 } },
    ];

    ws['!cols'] = [
      { wch: 18 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 },
      { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
      { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 14 },
      { wch: 8 },  { wch: 8 },  { wch: 14 }, { wch: 10 }, { wch: 14 },
      { wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 16 }, { wch: 10 },
      { wch: 10 }, { wch: 16 }, { wch: 10 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "空調負載計算報告");
    XLSX.writeFile(wb, `空調熱負載計算報告書_${dateStr}.xlsx`);
  }
};
