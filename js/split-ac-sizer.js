/**
 * HVAC Engineering Tools - Split AC Sizing & Brand Model Selection Module
 * Reference: 三菱重工 / 台灣空調工程各大品牌分離式冷氣型錄與試算標準
 * 涵蓋 19 大空調品牌：日立、國際牌、大金、三菱重工、富士通、LG、格力、冰點、華菱、禾聯、東元、聲寶、萬士益、台灣三洋、奇美、良峰、歌林、艾普頓、松林夏
 */

(function (window) {
  "use strict";

  // 19 大品牌資訊
  const BRANDS = [
    { id: "hitachi", name: "日立 (Hitachi)", tier: "tier1", origin: "日系一線", color: "#dc2626" },
    { id: "panasonic", name: "國際牌 (Panasonic)", tier: "tier1", origin: "日系一線", color: "#0284c7" },
    { id: "daikin", name: "大金 (Daikin)", tier: "tier1", origin: "日系一線", color: "#0284c7" },
    { id: "mhi", name: "三菱重工 (MHI)", tier: "tier1", origin: "日系一線", color: "#ea580c" },
    { id: "fujitsu", name: "富士通 (Fujitsu)", tier: "tier1", origin: "日系一線", color: "#dc2626" },
    { id: "lg", name: "LG (台灣樂金)", tier: "tier1", origin: "韓系大廠", color: "#db2777" },
    { id: "gree", name: "格力 (GREE)", tier: "tier2", origin: "全球大廠", color: "#059669" },
    { id: "bd", name: "冰點 (BD)", tier: "tier2", origin: "台灣製造", color: "#0284c7" },
    { id: "hawrin", name: "華菱 (Hawrin)", tier: "tier2", origin: "台灣製造", color: "#0891b2" },
    { id: "heran", name: "禾聯 (Heran)", tier: "tier2", origin: "台灣大廠", color: "#7c3aed" },
    { id: "teco", name: "東元 (TECO)", tier: "tier2", origin: "台灣大廠", color: "#2563eb" },
    { id: "sampo", name: "聲寶 (SAMPO)", tier: "tier2", origin: "台灣大廠", color: "#e11d48" },
    { id: "maxe", name: "萬士益 (Maxe)", tier: "tier2", origin: "台灣製造", color: "#059669" },
    { id: "sanlux", name: "台灣三洋 (Sanlux)", tier: "tier2", origin: "台灣大廠", color: "#d97706" },
    { id: "chimei", name: "奇美 (CHIMEI)", tier: "tier2", origin: "台灣品牌", color: "#4f46e5" },
    { id: "renfoss", name: "良峰 (Renfoss)", tier: "tier2", origin: "台灣製造", color: "#0d9488" },
    { id: "kolin", name: "歌林 (Kolin)", tier: "tier2", origin: "台灣品牌", color: "#9333ea" },
    { id: "appleton", name: "艾普頓 (Appleton)", tier: "tier2", origin: "台灣製造", color: "#475569" },
    { id: "songlinxia", name: "松林夏 (Songlinxia)", tier: "tier2", origin: "台灣製造", color: "#475569" }
  ];

  // 19 廠牌型錄與機型數據庫 (涵蓋 2.2kW ~ 11.0kW)
  const BRAND_MODELS = {
    hitachi: [
      { kw: 2.2, model: "RAS-22NJP / RAC-22NJP", series: "尊榮變頻冷暖", cspf: 7.60, rangeKW: "1.0~3.2", btu: "7,500", ping: "3-4坪", features: "凍結洗淨2.0+、防黴風扇、日本製壓縮機、體感舒適" },
      { kw: 2.8, model: "RAS-28NJP / RAC-28NJP", series: "尊榮變頻冷暖", cspf: 7.20, rangeKW: "1.0~3.8", btu: "9,600", ping: "4-5坪", features: "凍結洗淨2.0+、防黴風扇、日本製壓縮機、體感舒適" },
      { kw: 3.6, model: "RAS-36NJP / RAC-36NJP", series: "尊榮變頻冷暖", cspf: 6.90, rangeKW: "1.0~4.4", btu: "12,400", ping: "5-7坪", features: "凍結洗淨2.0+、體感舒適科技、高耐蝕藍波鰭片" },
      { kw: 4.1, model: "RAS-40NJP / RAC-40NJP", series: "尊榮變頻冷暖", cspf: 6.60, rangeKW: "1.1~5.0", btu: "14,100", ping: "6-8坪", features: "凍結洗淨2.0+、體感舒適科技、高耐蝕藍波鰭片" },
      { kw: 5.0, model: "RAS-50NJP / RAC-50NJP", series: "尊榮變頻冷暖", cspf: 6.30, rangeKW: "1.2~5.8", btu: "17,200", ping: "8-10坪", features: "凍結洗淨2.0+、日本製壓縮機、大風量3D氣流" },
      { kw: 6.3, model: "RAS-63NJP / RAC-63NJP", series: "尊榮變頻冷暖", cspf: 6.00, rangeKW: "1.5~7.3", btu: "21,700", ping: "10-12坪", features: "凍結洗淨2.0+、大空間超靜音渦輪風扇" },
      { kw: 7.1, model: "RAS-71NJP / RAC-71NJP", series: "尊榮變頻冷暖", cspf: 5.80, rangeKW: "1.5~8.2", btu: "24,400", ping: "11-14坪", features: "凍結洗淨2.0+、高能效雙迴轉壓縮機、強效冷房" },
      { kw: 8.1, model: "RAS-81NJP / RAC-81NJP", series: "尊榮變頻冷暖", cspf: 5.60, rangeKW: "1.7~9.1", btu: "27,900", ping: "13-16坪", features: "大坪數首選、凍結洗淨2.0+、全直流變頻" },
      { kw: 9.0, model: "RAS-90NJP / RAC-90NJP", series: "尊榮變頻冷暖", cspf: 5.40, rangeKW: "2.0~10.2", btu: "31,000", ping: "15-18坪", features: "超大空間客餐廳、商業空間、全機高耐蝕防護" },
      { kw: 11.0, model: "RAS-110NJP / RAC-110NJP", series: "尊榮變頻冷暖", cspf: 5.00, rangeKW: "2.5~12.0", btu: "37,800", ping: "18-22坪", features: "商用大客廳、長距離送風、高耐候重工機殼" }
    ],
    panasonic: [
      { kw: 2.2, model: "CS-RX22JA2 / CU-RX22JHA2", series: "RX頂級旗艦", cspf: 8.10, rangeKW: "0.8~3.4", btu: "7,500", ping: "3-4坪", features: "nanoe™ X 48兆抑菌淨化、24小時防霉監控、內建WiFi、3D氣流" },
      { kw: 2.8, model: "CS-RX28JA2 / CU-RX28JHA2", series: "RX頂級旗艦", cspf: 7.80, rangeKW: "0.8~4.0", btu: "9,600", ping: "4-5坪", features: "nanoe™ X 48兆抑菌淨化、24小時防霉監控、內建WiFi、3D氣流" },
      { kw: 3.6, model: "CS-RX36JA2 / CU-RX36JHA2", series: "RX頂級旗艦", cspf: 7.20, rangeKW: "0.9~4.6", btu: "12,400", ping: "5-7坪", features: "nanoe™ X 48兆抑菌淨化、ECONAVI智慧節能、雙迴轉壓縮機" },
      { kw: 4.0, model: "CS-RX40JA2 / CU-RX40JHA2", series: "RX頂級旗艦", cspf: 6.80, rangeKW: "1.0~5.3", btu: "14,100", ping: "6-8坪", features: "nanoe™ X 48兆抑菌淨化、ECONAVI智慧節能、雙迴轉壓縮機" },
      { kw: 5.0, model: "CS-RX50JA2 / CU-RX50JHA2", series: "RX頂級旗艦", cspf: 6.40, rangeKW: "1.2~6.0", btu: "17,200", ping: "8-10坪", features: "nanoe™ X 48兆、大出風口遠距送風、內建Panasonic App" },
      { kw: 6.3, model: "CS-RX63JA2 / CU-RX63JHA2", series: "RX頂級旗艦", cspf: 6.10, rangeKW: "1.4~7.5", btu: "21,700", ping: "10-12坪", features: "大客廳首選、極速冷房模式、全機七年保固" },
      { kw: 7.1, model: "CS-RX71JA2 / CU-RX71JHA2", series: "RX頂級旗艦", cspf: 5.90, rangeKW: "1.5~8.5", btu: "24,400", ping: "11-14坪", features: "大坪數頂級淨化、超省電一級能效、防鏽防沼氣鰭片" },
      { kw: 8.0, model: "CS-RX80JA2 / CU-RX80JHA2", series: "RX頂級旗艦", cspf: 5.70, rangeKW: "1.7~9.3", btu: "27,500", ping: "13-16坪", features: "超大空間旗艦款、全方位立體導風、原廠全機保固" },
      { kw: 9.0, model: "CS-RX90JA2 / CU-RX90JHA2", series: "RX頂級旗艦", cspf: 5.50, rangeKW: "2.0~10.5", btu: "31,000", ping: "15-18坪", features: "營業大空間、頂級省電一級能效、雙馬達強風送風" },
      { kw: 11.0, model: "CS-RX110JA2 / CU-RX110JHA2", series: "RX頂級旗艦", cspf: 5.10, rangeKW: "2.3~12.2", btu: "37,800", ping: "18-22坪", features: "超大風量遠距送風、高耐腐蝕室外機、商用等級" }
    ],
    daikin: [
      { kw: 2.2, model: "FTXM22VVLT / RXM22VVLT", series: "橫綱V旗艦", cspf: 7.80, rangeKW: "0.9~3.4", btu: "7,500", ping: "3-4坪", features: "閃流放電除菌、溫濕雙控 (Hybrid Cooling)、康達效應氣流" },
      { kw: 2.8, model: "FTXM28VVLT / RXM28VVLT", series: "橫綱V旗艦", cspf: 7.50, rangeKW: "1.0~4.0", btu: "9,600", ping: "4-5坪", features: "閃流放電除菌、溫濕雙控 (Hybrid Cooling)、康達效應氣流" },
      { kw: 3.6, model: "FTXM36VVLT / RXM36VVLT", series: "橫綱V旗艦", cspf: 7.00, rangeKW: "1.2~4.7", btu: "12,400", ping: "5-7坪", features: "閃流放電、航太搖擺式壓縮機、超靜音運轉 19dB" },
      { kw: 4.1, model: "FTXM41VVLT / RXM41VVLT", series: "橫綱V旗艦", cspf: 6.60, rangeKW: "1.3~5.2", btu: "14,100", ping: "6-8坪", features: "閃流放電、航太搖擺式壓縮機、防黴自體洗淨" },
      { kw: 5.0, model: "FTXM50VVLT / RXM50VVLT", series: "橫綱V旗艦", cspf: 6.20, rangeKW: "1.4~6.2", btu: "17,200", ping: "8-10坪", features: "溫濕雙控體感舒適、強化防蝕熱交換器、智慧眼感應" },
      { kw: 6.0, model: "FTXM60VVLT / RXM60VVLT", series: "橫綱V旗艦", cspf: 5.90, rangeKW: "1.6~7.4", btu: "20,600", ping: "10-12坪", features: "大客廳推薦、3D立體氣流、全機日本品質設計" },
      { kw: 7.1, model: "FTXM71VVLT / RXM71VVLT", series: "橫綱V旗艦", cspf: 5.70, rangeKW: "1.8~8.6", btu: "24,400", ping: "11-14坪", features: "大坪數頂級溫濕控制、強力運轉模式、長壽命壓縮機" },
      { kw: 8.0, model: "FTXM80VVLT / RXM80VVLT", series: "橫綱V旗艦", cspf: 5.50, rangeKW: "2.0~9.5", btu: "27,500", ping: "13-16坪", features: "超大風量、遠距康達氣流、高耐候防銹外機" },
      { kw: 9.0, model: "FTXM90VVLT / RXM90VVLT", series: "橫綱V旗艦", cspf: 5.30, rangeKW: "2.2~10.6", btu: "31,000", ping: "15-18坪", features: "大空間首選、冷暖雙溫控、智慧省電模式" }
    ],
    mhi: [
      { kw: 2.0, model: "DXK20ZST-W / DXC20ZST-W", series: "晴空變頻冷暖", cspf: 7.20, rangeKW: "0.9~3.2", btu: "6,900", ping: "3-4坪", features: "重工航太噴射氣流 (Jet Air)、鋸齒風扇超靜音、3D Auto送風" },
      { kw: 2.5, model: "DXK25ZST-W / DXC25ZST-W", series: "晴空變頻冷暖", cspf: 7.00, rangeKW: "0.9~3.8", btu: "8,600", ping: "4-5坪", features: "重工航太噴射氣流 (Jet Air)、鋸齒風扇超靜音、3D Auto送風" },
      { kw: 3.5, model: "DXK35ZST-W / DXC35ZST-W", series: "晴空變頻冷暖", cspf: 6.70, rangeKW: "1.0~4.4", btu: "12,000", ping: "5-7坪", features: "航太級超長送風 17 米、過敏原清淨濾網、自體清潔" },
      { kw: 4.1, model: "DXK41ZST-W / DXC41ZST-W", series: "晴空變頻冷暖", cspf: 6.40, rangeKW: "1.1~5.1", btu: "14,100", ping: "6-8坪", features: "航太級超長送風 17 米、過敏原清淨濾網、自體清潔" },
      { kw: 5.0, model: "DXK50ZST-W / DXC50ZST-W", series: "晴空變頻冷暖", cspf: 6.10, rangeKW: "1.3~5.9", btu: "17,200", ping: "8-10坪", features: "重工耐操口碑、極速冷房模式、全直流變頻馬達" },
      { kw: 6.0, model: "DXK60ZRT-W / DXC60ZRT-W", series: "大空間ZRT冷暖", cspf: 5.80, rangeKW: "1.5~7.2", btu: "20,600", ping: "10-12坪", features: "大客廳旗艦機種、長送風 20 米、強悍重工壓縮機" },
      { kw: 7.1, model: "DXK71ZRT-W / DXC71ZRT-W", series: "大空間ZRT冷暖", cspf: 5.60, rangeKW: "1.7~8.4", btu: "24,400", ping: "11-14坪", features: "大坪數頂級渦輪送風、高耐候耐腐蝕散熱器" },
      { kw: 8.0, model: "DXK80ZRT-W / DXC80ZRT-W", series: "大空間ZRT冷暖", cspf: 5.40, rangeKW: "1.9~9.2", btu: "27,500", ping: "13-16坪", features: "豪宅客廳推薦、重工專利低壓損熱交換管" },
      { kw: 10.0, model: "DXK100ZRT-W / DXC100ZRT-W", series: "大空間ZRT冷暖", cspf: 5.00, rangeKW: "2.3~11.5", btu: "34,400", ping: "16-20坪", features: "商用豪宅大空間、頂級重工雙迴轉壓縮機、強勁氣流" }
    ],
    fujitsu: [
      { kw: 2.2, model: "ASYG22KMTA / AOYG22KMTA", series: "高級KM系列", cspf: 7.50, rangeKW: "0.9~3.4", btu: "7,500", ping: "3-4坪", features: "熱交換器加熱除菌、全機10年壓縮機保固、高密度多路徑熱交換器" },
      { kw: 2.8, model: "ASYG28KMTA / AOYG28KMTA", series: "高級KM系列", cspf: 7.10, rangeKW: "1.0~4.0", btu: "9,600", ping: "4-5坪", features: "熱交換器加熱除菌、全機10年壓縮機保固、高密度多路徑熱交換器" },
      { kw: 3.6, model: "ASYG36KMTA / AOYG36KMTA", series: "高級KM系列", cspf: 6.60, rangeKW: "1.1~4.6", btu: "12,400", ping: "5-7坪", features: "熱交換器加熱除菌、超低溫啟動、靜音舒眠模式" },
      { kw: 4.1, model: "ASYG40KMTA / AOYG40KMTA", series: "高級KM系列", cspf: 6.30, rangeKW: "1.2~5.2", btu: "14,100", ping: "6-8坪", features: "熱交換器加熱除菌、強力冷房模式、防黴抗菌濾網" },
      { kw: 5.0, model: "ASYG50KMTA / AOYG50KMTA", series: "高級KM系列", cspf: 6.00, rangeKW: "1.4~6.1", btu: "17,200", ping: "8-10坪", features: "客廳首選、雙導風板超廣角送風、全直流變頻科技" },
      { kw: 6.3, model: "ASYG63KMTA / AOYG63KMTA", series: "高級KM系列", cspf: 5.70, rangeKW: "1.6~7.4", btu: "21,700", ping: "10-12坪", features: "大客廳推薦、防鏽藍波防腐外機、高效率變頻" },
      { kw: 7.1, model: "ASYG71KMTA / AOYG71KMTA", series: "高級KM系列", cspf: 5.50, rangeKW: "1.8~8.5", btu: "24,400", ping: "11-14坪", features: "大坪數頂級機種、富士通原廠日本品質認證" },
      { kw: 8.0, model: "ASYG80KMTA / AOYG80KMTA", series: "高級KM系列", cspf: 5.30, rangeKW: "2.0~9.4", btu: "27,500", ping: "13-16坪", features: "大空間首選、長距離強效氣流、耐候抗酸雨機身" }
    ],
    lg: [
      { kw: 2.2, model: "LSU22COHP / LSN22COHP", series: "DualCool雙迴轉", cspf: 7.30, rangeKW: "0.8~3.2", btu: "7,500", ping: "3-4坪", features: "DUAL Inverter 雙迴轉變頻 (10年保固)、ThinQ WiFi智慧連網、抗鏽金散熱片" },
      { kw: 2.8, model: "LSU28COHP / LSN28COHP", series: "DualCool雙迴轉", cspf: 7.00, rangeKW: "0.9~3.8", btu: "9,600", ping: "4-5坪", features: "DUAL Inverter 雙迴轉變頻 (10年保固)、ThinQ WiFi智慧連網、抗鏽金散熱片" },
      { kw: 3.6, model: "LSU36COHP / LSN36COHP", series: "DualCool雙迴轉", cspf: 6.60, rangeKW: "1.0~4.5", btu: "12,400", ping: "5-7坪", features: "ThinQ App遠端遙控、奈米離子除菌、低噪音 19dB" },
      { kw: 4.1, model: "LSU41COHP / LSN41COHP", series: "DualCool雙迴轉", cspf: 6.30, rangeKW: "1.1~5.1", btu: "14,100", ping: "6-8坪", features: "ThinQ App遠端遙控、奈米離子除菌、超低耗電" },
      { kw: 5.2, model: "LSU52COHP / LSN52COHP", series: "DualCool雙迴轉", cspf: 6.00, rangeKW: "1.3~6.2", btu: "17,900", ping: "8-10坪", features: "四向導風立體氣流、UV抑菌風扇、省電一級能效" },
      { kw: 6.3, model: "LSU63COHP / LSN63COHP", series: "DualCool雙迴轉", cspf: 5.70, rangeKW: "1.5~7.4", btu: "21,700", ping: "10-12坪", features: "大客廳推薦、快速降溫 40%、韓系質感美型機身" },
      { kw: 7.2, model: "LSU72COHP / LSN72COHP", series: "DualCool雙迴轉", cspf: 5.50, rangeKW: "1.7~8.4", btu: "24,800", ping: "11-14坪", features: "大坪數頂級款、金色防鏽抗蝕塗層、智慧電量監控" },
      { kw: 8.3, model: "LSU83COHP / LSN83COHP", series: "DualCool雙迴轉", cspf: 5.30, rangeKW: "1.9~9.3", btu: "28,500", ping: "13-16坪", features: "超大空間雙迴轉壓縮機、強效冷房、全方位智慧聯網" }
    ],
    gree: [
      { kw: 2.3, model: "GKS-23HO / GKS-23HI", series: "尊爵變頻冷暖", cspf: 6.80, rangeKW: "0.8~3.2", btu: "7,900", ping: "3-4坪", features: "G-10變頻引擎、黑金翅片防腐蝕、3D立體送風、防霉自潔" },
      { kw: 2.8, model: "GKS-28HO / GKS-28HI", series: "尊爵變頻冷暖", cspf: 6.50, rangeKW: "0.9~3.8", btu: "9,600", ping: "4-5坪", features: "G-10變頻引擎、黑金翅片防腐蝕、3D立體送風、防霉自潔" },
      { kw: 3.6, model: "GKS-36HO / GKS-36HI", series: "尊爵變頻冷暖", cspf: 6.20, rangeKW: "1.0~4.5", btu: "12,400", ping: "5-7坪", features: "5段風速調節、7段出風導葉、快速冷房、低耗電" },
      { kw: 4.1, model: "GKS-41HO / GKS-41HI", series: "尊爵變頻冷暖", cspf: 5.90, rangeKW: "1.1~5.0", btu: "14,100", ping: "6-8坪", features: "5段風速調節、7段出風導葉、快速冷房、低耗電" },
      { kw: 5.0, model: "GKS-50HO / GKS-50HI", series: "尊爵變頻冷暖", cspf: 5.70, rangeKW: "1.3~6.0", btu: "17,200", ping: "8-10坪", features: "大客廳首選、黑金散熱器、高品質靜音風道設計" },
      { kw: 6.3, model: "GKS-63HO / GKS-63HI", series: "尊爵變頻冷暖", cspf: 5.50, rangeKW: "1.5~7.3", btu: "21,700", ping: "10-12坪", features: "大坪數頂級省電、全機防潮抗腐、超長保固" },
      { kw: 7.2, model: "GKS-72HO / GKS-72HI", series: "尊爵變頻冷暖", cspf: 5.30, rangeKW: "1.7~8.4", btu: "24,800", ping: "11-14坪", features: "大空間首選、高效率壓縮機、全天候舒適運轉" },
      { kw: 8.5, model: "GKS-85HO / GKS-85HI", series: "尊爵變頻冷暖", cspf: 5.10, rangeKW: "2.0~9.5", btu: "29,200", ping: "14-17坪", features: "超大空間專用、雙導風板超遠送風、商用耐操" }
    ],
    bd: [
      { kw: 2.2, model: "FU-22HSA / FI-22HSA", series: "AI智慧變頻", cspf: 6.80, rangeKW: "0.8~3.2", btu: "7,500", ping: "3-4坪", features: "台灣製造 MIT、雙溫感智慧控溫、藍波散熱器、自體防霉" },
      { kw: 2.8, model: "FU-28HSA / FI-28HSA", series: "AI智慧變頻", cspf: 6.50, rangeKW: "0.9~3.8", btu: "9,600", ping: "4-5坪", features: "台灣製造 MIT、雙溫感智慧控溫、藍波散熱器、自體防霉" },
      { kw: 3.6, model: "FU-36HSA / FI-36HSA", series: "AI智慧變頻", cspf: 6.20, rangeKW: "1.0~4.4", btu: "12,400", ping: "5-7坪", features: "微電腦智慧控溫、低噪音風道、一級節能省電" },
      { kw: 4.1, model: "FU-41HSA / FI-41HSA", series: "AI智慧變頻", cspf: 5.90, rangeKW: "1.1~5.0", btu: "14,100", ping: "6-8坪", features: "微電腦智慧控溫、低噪音風道、一級節能省電" },
      { kw: 5.0, model: "FU-50HSA / FI-50HSA", series: "AI智慧變頻", cspf: 5.70, rangeKW: "1.3~5.9", btu: "17,200", ping: "8-10坪", features: "客廳首選、高效率熱交換器、耐用度高、全機保固" },
      { kw: 6.3, model: "FU-63HSA / FI-63HSA", series: "AI智慧變頻", cspf: 5.50, rangeKW: "1.5~7.3", btu: "21,700", ping: "10-12坪", features: "大客廳推薦、超強勁風量、台灣製造在地服務" },
      { kw: 7.2, model: "FU-72HSA / FI-72HSA", series: "AI智慧變頻", cspf: 5.30, rangeKW: "1.7~8.4", btu: "24,800", ping: "11-14坪", features: "大坪數頂級冷暖、藍波耐腐蝕塗層、全直流變頻" },
      { kw: 8.5, model: "FU-85HSA / FI-85HSA", series: "AI智慧變頻", cspf: 5.10, rangeKW: "2.0~9.5", btu: "29,200", ping: "14-17坪", features: "大空間首選、長送風距離、高可靠度壓縮機" }
    ],
    hawrin: [
      { kw: 2.3, model: "HS-23JE / HIS-23JE", series: "極致變頻冷暖", cspf: 6.60, rangeKW: "0.8~3.2", btu: "7,900", ping: "3-4坪", features: "易拆洗專利設計、藍波防鏽親水散熱片、自體淨防霉、快速冷房" },
      { kw: 2.8, model: "HS-28JE / HIS-28JE", series: "極致變頻冷暖", cspf: 6.40, rangeKW: "0.9~3.8", btu: "9,600", ping: "4-5坪", features: "易拆洗專利設計、藍波防鏽親水散熱片、自體淨防霉、快速冷房" },
      { kw: 3.6, model: "HS-36JE / HIS-36JE", series: "極致變頻冷暖", cspf: 6.10, rangeKW: "1.0~4.4", btu: "12,400", ping: "5-7坪", features: "風道全拆洗專利、全機防腐蝕處理、靜音運轉" },
      { kw: 4.1, model: "HS-41JE / HIS-41JE", series: "極致變頻冷暖", cspf: 5.80, rangeKW: "1.1~5.0", btu: "14,100", ping: "6-8坪", features: "風道全拆洗專利、全機防腐蝕處理、靜音運轉" },
      { kw: 5.0, model: "HS-50JE / HIS-50JE", series: "極致變頻冷暖", cspf: 5.60, rangeKW: "1.3~5.9", btu: "17,200", ping: "8-10坪", features: "客廳專用、風輪易洗保養免拆機、一級節能省電" },
      { kw: 6.3, model: "HS-63JE / HIS-63JE", series: "極致變頻冷暖", cspf: 5.40, rangeKW: "1.5~7.2", btu: "21,700", ping: "10-12坪", features: "大客廳推薦、強勁風量立體送風、高CP值首選" },
      { kw: 7.2, model: "HS-72JE / HIS-72JE", series: "極致變頻冷暖", cspf: 5.20, rangeKW: "1.7~8.3", btu: "24,800", ping: "11-14坪", features: "大坪數空間首選、長壽命壓縮機、藍波散熱器" },
      { kw: 8.5, model: "HS-85JE / HIS-85JE", series: "極致變頻冷暖", cspf: 5.00, rangeKW: "2.0~9.4", btu: "29,200", ping: "14-17坪", features: "營業大空間、超大風量、全直流變頻馬達" }
    ],
    heran: [
      { kw: 2.3, model: "HI-GA23H / HO-GA23H", series: "沼氣防護冷暖", cspf: 6.80, rangeKW: "0.8~3.2", btu: "7,900", ping: "3-4坪", features: "雙重沼氣防護抗腐蝕、5D氣流導風板、藍波防鏽鰭片、自體淨" },
      { kw: 2.8, model: "HI-GA28H / HO-GA28H", series: "沼氣防護冷暖", cspf: 6.50, rangeKW: "0.9~3.8", btu: "9,600", ping: "4-5坪", features: "雙重沼氣防護抗腐蝕、5D氣流導風板、藍波防鏽鰭片、自體淨" },
      { kw: 3.6, model: "HI-GA36H / HO-GA36H", series: "沼氣防護冷暖", cspf: 6.20, rangeKW: "1.0~4.4", btu: "12,400", ping: "5-7坪", features: "全機藍波防鏽處理、超靜音導風、一級能效節能" },
      { kw: 4.1, model: "HI-GA41H / HO-GA41H", series: "沼氣防護冷暖", cspf: 5.90, rangeKW: "1.1~5.0", btu: "14,100", ping: "6-8坪", features: "全機藍波防鏽處理、超靜音導風、一級能效節能" },
      { kw: 5.0, model: "HI-GA50H / HO-GA50H", series: "沼氣防護冷暖", cspf: 5.70, rangeKW: "1.3~5.9", btu: "17,200", ping: "8-10坪", features: "客廳專用、四向立體送風、高耐蝕防沼氣熱交換器" },
      { kw: 6.3, model: "HI-GA63H / HO-GA63H", series: "沼氣防護冷暖", cspf: 5.50, rangeKW: "1.5~7.3", btu: "21,700", ping: "10-12坪", features: "大客廳推薦、極速降溫模式、全機保固安心使用" },
      { kw: 7.2, model: "HI-GA72H / HO-GA72H", series: "沼氣防護冷暖", cspf: 5.30, rangeKW: "1.7~8.4", btu: "24,800", ping: "11-14坪", features: "大坪數推薦、大風量遠距送風、高效率壓縮機" },
      { kw: 8.5, model: "HI-GA85H / HO-GA85H", series: "沼氣防護冷暖", cspf: 5.10, rangeKW: "2.0~9.5", btu: "29,200", ping: "14-17坪", features: "超大客廳與商業空間、防沼氣耐用首選" }
    ],
    teco: [
      { kw: 2.2, model: "MS22IH-GA3 / MA22IH-GA3", series: "頂級GA極芳香", cspf: 7.10, rangeKW: "0.8~3.2", btu: "7,500", ping: "3-4坪", features: "燦金防銹散熱鰭片、關機防霉自動風乾、香氛盒擴香、一級能效" },
      { kw: 2.8, model: "MS28IH-GA3 / MA28IH-GA3", series: "頂級GA極芳香", cspf: 6.80, rangeKW: "0.9~3.8", btu: "9,600", ping: "4-5坪", features: "燦金防銹散熱鰭片、關機防霉自動風乾、香氛盒擴香、一級能效" },
      { kw: 3.6, model: "MS36IH-GA3 / MA36IH-GA3", series: "頂級GA極芳香", cspf: 6.40, rangeKW: "1.0~4.5", btu: "12,400", ping: "5-7坪", features: "燦金防銹散熱鰭片、超廣角3D送風、極靜音運轉" },
      { kw: 4.1, model: "MS41IH-GA3 / MA41IH-GA3", series: "頂級GA極芳香", cspf: 6.10, rangeKW: "1.1~5.1", btu: "14,100", ping: "6-8坪", features: "燦金防銹散熱鰭片、超廣角3D送風、極靜音運轉" },
      { kw: 5.0, model: "MS50IH-GA3 / MA50IH-GA3", series: "頂級GA極芳香", cspf: 5.80, rangeKW: "1.3~6.0", btu: "17,200", ping: "8-10坪", features: "客廳專用、東元自研高效率變頻控制模組" },
      { kw: 6.3, model: "MS63IH-GA3 / MA63IH-GA3", series: "頂級GA極芳香", cspf: 5.60, rangeKW: "1.5~7.4", btu: "21,700", ping: "10-12坪", features: "大客廳推薦、強效大風量送風、超低頻省電" },
      { kw: 7.2, model: "MS72IH-GA3 / MA72IH-GA3", series: "頂級GA極芳香", cspf: 5.40, rangeKW: "1.7~8.4", btu: "24,800", ping: "11-14坪", features: "大空間首選、金色防腐蝕塗層、全直流變頻" },
      { kw: 8.5, model: "MS85IH-GA3 / MA85IH-GA3", series: "頂級GA極芳香", cspf: 5.10, rangeKW: "2.0~9.5", btu: "29,200", ping: "14-17坪", features: "商用豪宅推薦、大風量高風速、長年耐用" }
    ],
    sampo: [
      { kw: 2.2, model: "AU-NF22DC / AM-NF22DC", series: "頂級P系列冷暖", cspf: 7.00, rangeKW: "0.8~3.2", btu: "7,500", ping: "3-4坪", features: "Pico Pure 水離子淨化、金燦防鏽鰭片、凍結洗淨抗霉、一級能效" },
      { kw: 2.8, model: "AU-NF28DC / AM-NF28DC", series: "頂級P系列冷暖", cspf: 6.70, rangeKW: "0.9~3.8", btu: "9,600", ping: "4-5坪", features: "Pico Pure 水離子淨化、金燦防鏽鰭片、凍結洗淨抗霉、一級能效" },
      { kw: 3.6, model: "AU-NF36DC / AM-NF36DC", series: "頂級P系列冷暖", cspf: 6.30, rangeKW: "1.0~4.4", btu: "12,400", ping: "5-7坪", features: "Pico Pure 清淨抑菌、3D立體導風、靜音舒眠模式" },
      { kw: 4.1, model: "AU-NF41DC / AM-NF41DC", series: "頂級P系列冷暖", cspf: 6.00, rangeKW: "1.1~5.0", btu: "14,100", ping: "6-8坪", features: "Pico Pure 清淨抑菌、3D立體導風、靜音舒眠模式" },
      { kw: 5.0, model: "AU-NF50DC / AM-NF50DC", series: "頂級P系列冷暖", cspf: 5.70, rangeKW: "1.3~5.9", btu: "17,200", ping: "8-10坪", features: "客廳專用、自體淨除塵洗淨、聲寶全機保固" },
      { kw: 6.3, model: "AU-NF63DC / AM-NF63DC", series: "頂級P系列冷暖", cspf: 5.50, rangeKW: "1.5~7.3", btu: "21,700", ping: "10-12坪", features: "大客廳推薦、強勁快速冷房、全直流變頻馬達" },
      { kw: 7.2, model: "AU-NF72DC / AM-NF72DC", series: "頂級P系列冷暖", cspf: 5.30, rangeKW: "1.7~8.4", btu: "24,800", ping: "11-14坪", features: "大空間首選、金燦高耐候散熱鰭片、超長壽命" },
      { kw: 8.5, model: "AU-NF85DC / AM-NF85DC", series: "頂級P系列冷暖", cspf: 5.00, rangeKW: "2.0~9.5", btu: "29,200", ping: "14-17坪", features: "營業大空間首選、強效遠距出風、商用耐操" }
    ],
    maxe: [
      { kw: 2.3, model: "MAS-23MH / RA-23MH", series: "極緻變頻冷暖", cspf: 6.60, rangeKW: "0.8~3.2", btu: "7,900", ping: "3-4坪", features: "台灣製造、雙重防鏽抗腐蝕、超靜音導風風道、智慧溫控" },
      { kw: 2.8, model: "MAS-28MH / RA-28MH", series: "極緻變頻冷暖", cspf: 6.40, rangeKW: "0.9~3.8", btu: "9,600", ping: "4-5坪", features: "台灣製造、雙重防鏽抗腐蝕、超靜音導風風道、智慧溫控" },
      { kw: 3.6, model: "MAS-36MH / RA-36MH", series: "極緻變頻冷暖", cspf: 6.10, rangeKW: "1.0~4.4", btu: "12,400", ping: "5-7坪", features: "高耐候藍波親水熱交換器、快速冷房、全直流省電" },
      { kw: 4.1, model: "MAS-41MH / RA-41MH", series: "極緻變頻冷暖", cspf: 5.80, rangeKW: "1.1~5.0", btu: "14,100", ping: "6-8坪", features: "高耐候藍波親水熱交換器、快速冷房、全直流省電" },
      { kw: 5.0, model: "MAS-50MH / RA-50MH", series: "極緻變頻冷暖", cspf: 5.60, rangeKW: "1.3~5.9", btu: "17,200", ping: "8-10坪", features: "客廳專用、四向導風立體氣流、一級節能省電" },
      { kw: 6.3, model: "MAS-63MH / RA-63MH", series: "極緻變頻冷暖", cspf: 5.40, rangeKW: "1.5~7.2", btu: "21,700", ping: "10-12坪", features: "大客廳推薦、強效大風量風扇、萬士益在地服務" },
      { kw: 7.2, model: "MAS-72MH / RA-72MH", series: "極緻變頻冷暖", cspf: 5.20, rangeKW: "1.7~8.3", btu: "24,800", ping: "11-14坪", features: "大坪數首選、高效率變頻控制、長壽命壓縮機" },
      { kw: 8.5, model: "MAS-85MH / RA-85MH", series: "極緻變頻冷暖", cspf: 5.00, rangeKW: "2.0~9.4", btu: "29,200", ping: "14-17坪", features: "商用大空間、極速降溫模式、超強耐用度" }
    ],
    sanlux: [
      { kw: 2.2, model: "SAC-V22HF / SAE-V22HF", series: "精品型變頻冷暖", cspf: 6.80, rangeKW: "0.8~3.2", btu: "7,500", ping: "3-4坪", features: "直流雙變頻馬達、藍波防鏽親水散熱片、自體淨防霉、舒眠定時" },
      { kw: 2.8, model: "SAC-V28HF / SAE-V28HF", series: "精品型變頻冷暖", cspf: 6.50, rangeKW: "0.9~3.8", btu: "9,600", ping: "4-5坪", features: "直流雙變頻馬達、藍波防鏽親水散熱片、自體淨防霉、舒眠定時" },
      { kw: 3.6, model: "SAC-V36HF / SAE-V36HF", series: "精品型變頻冷暖", cspf: 6.20, rangeKW: "1.0~4.4", btu: "12,400", ping: "5-7坪", features: "三洋經典品質、全直流DC變頻、超靜音運轉模式" },
      { kw: 4.1, model: "SAC-V41HF / SAE-V41HF", series: "精品型變頻冷暖", cspf: 5.90, rangeKW: "1.1~5.0", btu: "14,100", ping: "6-8坪", features: "三洋經典品質、全直流DC變頻、超靜音運轉模式" },
      { kw: 5.0, model: "SAC-V50HF / SAE-V50HF", series: "精品型變頻冷暖", cspf: 5.70, rangeKW: "1.3~5.9", btu: "17,200", ping: "8-10坪", features: "客廳首選、3D立體導風板、藍波防鏽熱交換器" },
      { kw: 6.3, model: "SAC-V63HF / SAE-V63HF", series: "精品型變頻冷暖", cspf: 5.50, rangeKW: "1.5~7.3", btu: "21,700", ping: "10-12坪", features: "大客廳推薦、快速冷房模式、全省綿密服務網" },
      { kw: 7.2, model: "SAC-V72HF / SAE-V72HF", series: "精品型變頻冷暖", cspf: 5.30, rangeKW: "1.7~8.4", btu: "24,800", ping: "11-14坪", features: "大坪數專用、一級能效省電、高耐候耐腐蝕機殼" },
      { kw: 8.5, model: "SAC-V85HF / SAE-V85HF", series: "精品型變頻冷暖", cspf: 5.10, rangeKW: "2.0~9.5", btu: "29,200", ping: "14-17坪", features: "超大空間首選、長距離強風送風、商用耐操" }
    ],
    chimei: [
      { kw: 2.3, model: "RB-S23HT1 / RC-S23HT1", series: "星鑽變頻冷暖", cspf: 6.80, rangeKW: "0.8~3.2", btu: "7,900", ping: "3-4坪", features: "全直流 DC 變頻、鍍金防鏽防腐蝕、智慧舒眠溫控、3D立體氣流" },
      { kw: 2.8, model: "RB-S28HT1 / RC-S28HT1", series: "星鑽變頻冷暖", cspf: 6.50, rangeKW: "0.9~3.8", btu: "9,600", ping: "4-5坪", features: "全直流 DC 變頻、鍍金防鏽防腐蝕、智慧舒眠溫控、3D立體氣流" },
      { kw: 3.6, model: "RB-S36HT1 / RC-S36HT1", series: "星鑽變頻冷暖", cspf: 6.20, rangeKW: "1.0~4.4", btu: "12,400", ping: "5-7坪", features: "自體防霉乾燥、一級節能省電、極靜音運轉" },
      { kw: 4.1, model: "RB-S41HT1 / RC-S41HT1", series: "星鑽變頻冷暖", cspf: 5.90, rangeKW: "1.1~5.0", btu: "14,100", ping: "6-8坪", features: "自體防霉乾燥、一級節能省電、極靜音運轉" },
      { kw: 5.0, model: "RB-S50HT1 / RC-S50HT1", series: "星鑽變頻冷暖", cspf: 5.70, rangeKW: "1.3~5.9", btu: "17,200", ping: "8-10坪", features: "客廳專用、奇美美學機身設計、超廣角送風" },
      { kw: 6.3, model: "RB-S63HT1 / RC-S63HT1", series: "星鑽變頻冷暖", cspf: 5.50, rangeKW: "1.5~7.3", btu: "21,700", ping: "10-12坪", features: "大客廳推薦、強效大風量風扇、全機原廠保固" },
      { kw: 7.2, model: "RB-S72HT1 / RC-S72HT1", series: "星鑽變頻冷暖", cspf: 5.30, rangeKW: "1.7~8.4", btu: "24,800", ping: "11-14坪", features: "大空間首選、金盾高耐候防護、高能效壓縮機" },
      { kw: 8.5, model: "RB-S85HT1 / RC-S85HT1", series: "星鑽變頻冷暖", cspf: 5.10, rangeKW: "2.0~9.5", btu: "29,200", ping: "14-17坪", features: "超大空間豪宅專用、長送風距離、商用耐久" }
    ],
    renfoss: [
      { kw: 2.2, model: "RXI-222HF / RXO-222HF", series: "星耀變頻冷暖", cspf: 6.60, rangeKW: "0.8~3.2", btu: "7,500", ping: "3-4坪", features: "台灣製造、藍波防鏽散熱片、全直流變頻、液晶無線遙控" },
      { kw: 2.8, model: "RXI-282HF / RXO-282HF", series: "星耀變頻冷暖", cspf: 6.40, rangeKW: "0.9~3.8", btu: "9,600", ping: "4-5坪", features: "台灣製造、藍波防鏽散熱片、全直流變頻、液晶無線遙控" },
      { kw: 3.6, model: "RXI-362HF / RXO-362HF", series: "星耀變頻冷暖", cspf: 6.10, rangeKW: "1.0~4.4", btu: "12,400", ping: "5-7坪", features: "自體防霉乾燥、快速冷房模式、靜音舒眠運轉" },
      { kw: 4.1, model: "RXI-412HF / RXO-412HF", series: "星耀變頻冷暖", cspf: 5.80, rangeKW: "1.1~5.0", btu: "14,100", ping: "6-8坪", features: "自體防霉乾燥、快速冷房模式、靜音舒眠運轉" },
      { kw: 5.0, model: "RXI-502HF / RXO-502HF", series: "星耀變頻冷暖", cspf: 5.60, rangeKW: "1.3~5.9", btu: "17,200", ping: "8-10坪", features: "客廳專用、四方立體送風、高效率冷暖變頻" },
      { kw: 6.3, model: "RXI-632HF / RXO-632HF", series: "星耀變頻冷暖", cspf: 5.40, rangeKW: "1.5~7.2", btu: "21,700", ping: "10-12坪", features: "大客廳推薦、良峰在地口碑、一級節能省電" },
      { kw: 7.2, model: "RXI-722HF / RXO-722HF", series: "星耀變頻冷暖", cspf: 5.20, rangeKW: "1.7~8.3", btu: "24,800", ping: "11-14坪", features: "大坪數推薦、雙迴轉變頻壓縮機、耐候機身" },
      { kw: 8.5, model: "RXI-852HF / RXO-852HF", series: "星耀變頻冷暖", cspf: 5.00, rangeKW: "2.0~9.4", btu: "29,200", ping: "14-17坪", features: "商用大空間、極速降溫、長壽命耐操首選" }
    ],
    kolin: [
      { kw: 2.2, model: "KSA-222DV03 / KSO-222DV03", series: "智慧變頻冷暖", cspf: 6.50, rangeKW: "0.8~3.2", btu: "7,500", ping: "3-4坪", features: "藍波親水防鏽、四方擺葉送風、自體防霉、一級能效節能" },
      { kw: 2.8, model: "KSA-282DV03 / KSO-282DV03", series: "智慧變頻冷暖", cspf: 6.30, rangeKW: "0.9~3.8", btu: "9,600", ping: "4-5坪", features: "藍波親水防鏽、四方擺葉送風、自體防霉、一級能效節能" },
      { kw: 3.6, model: "KSA-362DV03 / KSO-362DV03", series: "智慧變頻冷暖", cspf: 6.00, rangeKW: "1.0~4.4", btu: "12,400", ping: "5-7坪", features: "全直流 DC 變頻、靜音風道設計、防霉自體淨" },
      { kw: 4.1, model: "KSA-412DV03 / KSO-412DV03", series: "智慧變頻冷暖", cspf: 5.80, rangeKW: "1.1~5.0", btu: "14,100", ping: "6-8坪", features: "全直流 DC 變頻、靜音風道設計、防霉自體淨" },
      { kw: 5.0, model: "KSA-502DV03 / KSO-502DV03", series: "智慧變頻冷暖", cspf: 5.50, rangeKW: "1.3~5.9", btu: "17,200", ping: "8-10坪", features: "客廳專用、四向立體氣流、快速降溫模式" },
      { kw: 6.3, model: "KSA-632DV03 / KSO-632DV03", series: "智慧變頻冷暖", cspf: 5.30, rangeKW: "1.5~7.2", btu: "21,700", ping: "10-12坪", features: "大客廳推薦、強勁大風量、全省保固維修" },
      { kw: 7.2, model: "KSA-722DV03 / KSO-722DV03", series: "智慧變頻冷暖", cspf: 5.10, rangeKW: "1.7~8.3", btu: "24,800", ping: "11-14坪", features: "大空間首選、防蝕散熱鰭片、高效率壓縮機" },
      { kw: 8.5, model: "KSA-852DV03 / KSO-852DV03", series: "智慧變頻冷暖", cspf: 4.90, rangeKW: "2.0~9.4", btu: "29,200", ping: "14-17坪", features: "營業大空間、超強出風風量、經濟省電" }
    ],
    appleton: [
      { kw: 2.3, model: "AP-23VR / APO-23VR", series: "精緻變頻冷暖", cspf: 6.40, rangeKW: "0.8~3.2", btu: "7,900", ping: "3-4坪", features: "高CSPF節能、藍波防鏽鰭片、快速降溫、經濟實惠" },
      { kw: 2.8, model: "AP-28VR / APO-28VR", series: "精緻變頻冷暖", cspf: 6.20, rangeKW: "0.9~3.8", btu: "9,600", ping: "4-5坪", features: "高CSPF節能、藍波防鏽鰭片、快速降溫、經濟實惠" },
      { kw: 3.6, model: "AP-36VR / APO-36VR", series: "精緻變頻冷暖", cspf: 5.90, rangeKW: "1.0~4.4", btu: "12,400", ping: "5-7坪", features: "自體防霉乾燥、一級能效節能、超靜音運轉" },
      { kw: 4.1, model: "AP-41VR / APO-41VR", series: "精緻變頻冷暖", cspf: 5.70, rangeKW: "1.1~5.0", btu: "14,100", ping: "6-8坪", features: "自體防霉乾燥、一級能效節能、超靜音運轉" },
      { kw: 5.0, model: "AP-50VR / APO-50VR", series: "精緻變頻冷暖", cspf: 5.50, rangeKW: "1.3~5.9", btu: "17,200", ping: "8-10坪", features: "客廳專用、3D導風板立體氣流、全直流變頻" },
      { kw: 6.3, model: "AP-63VR / APO-63VR", series: "精緻變頻冷暖", cspf: 5.30, rangeKW: "1.5~7.2", btu: "21,700", ping: "10-12坪", features: "大客廳推薦、強效大風量、台灣製造在地品質" },
      { kw: 7.2, model: "AP-72VR / APO-72VR", series: "精緻變頻冷暖", cspf: 5.10, rangeKW: "1.7~8.3", btu: "24,800", ping: "11-14坪", features: "大空間首選、長壽命壓縮機、耐腐蝕散熱器" },
      { kw: 8.5, model: "AP-85VR / APO-85VR", series: "精緻變頻冷暖", cspf: 4.90, rangeKW: "2.0~9.4", btu: "29,200", ping: "14-17坪", features: "商用大空間、極速降溫模式、超高性價比" }
    ],
    songlinxia: [
      { kw: 2.3, model: "SL-23VR / SLO-23VR", series: "超值變頻冷暖", cspf: 6.40, rangeKW: "0.8~3.2", btu: "7,900", ping: "3-4坪", features: "靜音舒眠模式、雙重防蝕保護、微電腦精準溫控、台灣組裝" },
      { kw: 2.8, model: "SL-28VR / SLO-28VR", series: "超值變頻冷暖", cspf: 6.20, rangeKW: "0.9~3.8", btu: "9,600", ping: "4-5坪", features: "靜音舒眠模式、雙重防蝕保護、微電腦精準溫控、台灣組裝" },
      { kw: 3.6, model: "SL-36VR / SLO-36VR", series: "超值變頻冷暖", cspf: 5.90, rangeKW: "1.0~4.4", btu: "12,400", ping: "5-7坪", features: "高耐候藍波親水熱交換器、自體防霉、一級節能" },
      { kw: 4.1, model: "SL-41VR / SLO-41VR", series: "超值變頻冷暖", cspf: 5.70, rangeKW: "1.1~5.0", btu: "14,100", ping: "6-8坪", features: "高耐候藍波親水熱交換器、自體防霉、一級節能" },
      { kw: 5.0, model: "SL-50VR / SLO-50VR", series: "超值變頻冷暖", cspf: 5.50, rangeKW: "1.3~5.9", btu: "17,200", ping: "8-10坪", features: "客廳專用、四向導風立體氣流、全直流省電" },
      { kw: 6.3, model: "SL-63VR / SLO-63VR", series: "超值變頻冷暖", cspf: 5.30, rangeKW: "1.5~7.2", btu: "21,700", ping: "10-12坪", features: "大客廳推薦、強效大風量風扇、經濟耐用" },
      { kw: 7.2, model: "SL-72VR / SLO-72VR", series: "超值變頻冷暖", cspf: 5.10, rangeKW: "1.7~8.3", btu: "24,800", ping: "11-14坪", features: "大空間首選、高效率變頻控制、長壽命壓縮機" },
      { kw: 8.5, model: "SL-85VR / SLO-85VR", series: "超值變頻冷暖", cspf: 4.90, rangeKW: "2.0~9.4", btu: "29,200", ping: "14-17坪", features: "商用大空間、極速降溫、超值首選" }
    ]
  };

  // 標準容量階梯 (kW)
  const STANDARD_KW_STEPS = [2.2, 2.8, 3.6, 4.1, 5.0, 6.3, 7.1, 8.0, 9.0, 11.0];

  // 空間類型基準熱負荷 (kcal/h.坪)
  const ROOM_BASE_RATES = {
    bedroom: { name: "🛏️ 一般臥室 / 書房", rate: 450, desc: "安靜舒適環境，一般居住睡眠空間" },
    living: { name: "🛋️ 客廳 / 餐廳", rate: 500, desc: "家庭日常活動與用餐空間" },
    kitchen: { name: "🍳 開放式廚房 / 餐廳", rate: 550, desc: "含烹飪發熱與油煙氣流互動空間" },
    office: { name: "🏢 辦公室 / 商業空間", rate: 650, desc: "多人電腦作業與事務設備發熱" },
    store: { name: "🏪 營業門市 / 餐廳", rate: 750, desc: "人員頻繁進出與高密度設備發熱" }
  };

  /**
   * 計算空間所需冷房能力
   * @param {Object} params
   * @param {string} params.roomType - 空間類型 ("bedroom", "living", "kitchen", "office", "store")
   * @param {number} params.areaPing - 空間坪數 (坪)
   * @param {number} params.heightM - 天花板高度 (m)
   * @param {Array<string>} params.factors - 特殊熱源環境 (["topFloor", "westSun", "glassWindow", "crowded", "devices", "ironRoof"])
   */
  function calcCoolingDemand(params) {
    const roomType = params.roomType || "bedroom";
    const areaPing = Math.max(0.5, parseFloat(params.areaPing) || 4);
    const heightM = Math.max(2.0, parseFloat(params.heightM) || 2.8);
    const factors = Array.isArray(params.factors) ? params.factors : [];

    const roomInfo = ROOM_BASE_RATES[roomType] || ROOM_BASE_RATES.bedroom;
    let baseRate = roomInfo.rate;

    // 挑高加成係數
    let heightFactor = 0.0;
    if (heightM > 4.2) {
      heightFactor = 0.35; // 挑高 4.2m 以上 (+35%)
    } else if (heightM > 3.5) {
      heightFactor = 0.20; // 挑高 3.5m ~ 4.2m (+20%)
    } else if (heightM > 2.9) {
      heightFactor = 0.10; // 挑高 2.9m ~ 3.5m (+10%)
    }

    // 環境熱源加成係數
    let envFactor = 0.0;
    if (factors.includes("topFloor")) envFactor += 0.20; // 頂樓 (+20%)
    if (factors.includes("westSun")) envFactor += 0.20;  // 西曬 (+20%)
    if (factors.includes("glassWindow")) envFactor += 0.15; // 大面積玻璃 (+15%)
    if (factors.includes("crowded")) envFactor += 0.10; // 常態多人 (+10%)
    if (factors.includes("devices")) envFactor += 0.10; // 電器多 (+10%)
    if (factors.includes("ironRoof")) envFactor += 0.35; // 鐵皮屋 (+35%)

    const totalFactor = 1.0 + heightFactor + envFactor;
    const actualRatePerPing = baseRate * totalFactor;

    // 總熱量 (kcal/h)
    const totalKcal = areaPing * actualRatePerPing;

    // 換算 kW (1 kW ≈ 860 kcal/h)
    const exactKW = totalKcal / 860.0;

    // 換算 BTU/h (1 kcal/h ≈ 3.968 BTU/h)
    const totalBTU = totalKcal * 3.968;

    // 換算冷凍噸 RT (1 RT ≈ 3,024 kcal/h)
    const totalRT = totalKcal / 3024.0;

    // 推薦標準冷房能力階梯 (kW) - 買大不買小原則
    let recommendedKW = STANDARD_KW_STEPS[0];
    for (let i = 0; i < STANDARD_KW_STEPS.length; i++) {
      if (STANDARD_KW_STEPS[i] >= exactKW) {
        recommendedKW = STANDARD_KW_STEPS[i];
        break;
      }
      if (i === STANDARD_KW_STEPS.length - 1) {
        recommendedKW = STANDARD_KW_STEPS[i];
      }
    }

    return {
      roomType: roomType,
      roomInfo: roomInfo,
      areaPing: areaPing,
      heightM: heightM,
      heightFactorPercent: Math.round(heightFactor * 100),
      envFactorPercent: Math.round(envFactor * 100),
      totalFactorPercent: Math.round((totalFactor - 1.0) * 100),
      actualRatePerPing: Math.round(actualRatePerPing),
      totalKcal: Math.round(totalKcal),
      exactKW: exactKW,
      totalBTU: Math.round(totalBTU),
      totalRT: totalRT,
      recommendedKW: recommendedKW
    };
  }

  /**
   * 依據推薦之冷房能力(kW)及品牌篩選清單，從各品牌型錄挑選最匹配機種
   * @param {number} targetKW - 目標冷房能力 (kW)
   * @param {Array<string>} selectedBrandIds - 勾選之品牌 ID 清單
   */
  function matchBrandModels(targetKW, selectedBrandIds) {
    const activeBrandIds = Array.isArray(selectedBrandIds) && selectedBrandIds.length > 0
      ? selectedBrandIds
      : BRANDS.map((b) => b.id);

    const matches = [];

    BRANDS.forEach((brand) => {
      if (!activeBrandIds.includes(brand.id)) return;

      const models = BRAND_MODELS[brand.id] || [];
      if (models.length === 0) return;

      // 尋找最接近且 >= targetKW 的機型；若超過最大則選最大機型
      let matchedModel = models[0];
      for (let i = 0; i < models.length; i++) {
        if (models[i].kw >= targetKW) {
          matchedModel = models[i];
          break;
        }
        if (i === models.length - 1) {
          matchedModel = models[i];
        }
      }

      matches.push({
        brand: brand,
        model: matchedModel
      });
    });

    return matches;
  }

  // 匯出全域模組
  window.HVACSplitACSizer = {
    BRANDS: BRANDS,
    BRAND_MODELS: BRAND_MODELS,
    STANDARD_KW_STEPS: STANDARD_KW_STEPS,
    ROOM_BASE_RATES: ROOM_BASE_RATES,
    calcCoolingDemand: calcCoolingDemand,
    matchBrandModels: matchBrandModels
  };
})(window);
