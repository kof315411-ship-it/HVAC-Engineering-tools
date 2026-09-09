/**
 * HVAC Engineering Tools - Wire Size & Conduit Selection Calculation Engine
 * Reference: 經濟部《用戶用電設備裝置規則》(原屋內線路裝置規則)
 * 表二五～二：金屬導線管配線之導線安培容量 (絕緣物 60℃)
 * 表二五～三：金屬導線管配線之導線安培容量 (絕緣物 75℃)
 * 表二五～四：金屬導線管配線之導線安培容量 (絕緣物 90℃)
 * 表二五～五：PVC管配線之導線安培容量 (絕緣物 60℃)
 * 表二五～七：周圍溫度非為攝氏 35℃ 之修正係數
 * 導線管徑選定標準：EMT薄鋼管、厚鋼電線管(RSG/GIP)、PVC塑膠導線管
 */

(function (window) {
  "use strict";

  // 表二五～二：金屬導線管配線之導線安培容量 (絕緣物最高容許溫度 60℃，周圍溫度 35℃ 以下)
  // 適用：600V PVC絕緣電線 (如 IV線) 敷設於金屬管、金屬可撓導線管、金屬線槽
  const TABLE_25_2 = [
    { sizeStr: "1.6 mm", isSingle: true, sizeNum: 1.6, cap3: 13, cap4: 12, cap56: 10, cap79: 9 },
    { sizeStr: "2.0 mm", isSingle: true, sizeNum: 2.0, cap3: 18, cap4: 16, cap56: 14, cap79: 12 },
    { sizeStr: "2.6 mm", isSingle: true, sizeNum: 2.6, cap3: 25, cap4: 23, cap56: 20, cap79: 18 },
    { sizeStr: "3.5 mm²", isSingle: false, sizeNum: 3.5, cap3: 19, cap4: 17, cap56: 15, cap79: 13 },
    { sizeStr: "5.5 mm²", isSingle: false, sizeNum: 5.5, cap3: 28, cap4: 25, cap56: 22, cap79: 19 },
    { sizeStr: "8 mm²", isSingle: false, sizeNum: 8, cap3: 36, cap4: 32, cap56: 28, cap79: 25 },
    { sizeStr: "14 mm²", isSingle: false, sizeNum: 14, cap3: 52, cap4: 47, cap56: 41, cap79: 36 },
    { sizeStr: "22 mm²", isSingle: false, sizeNum: 22, cap3: 65, cap4: 58, cap56: 52, cap79: 45 },
    { sizeStr: "30 mm²", isSingle: false, sizeNum: 30, cap3: 81, cap4: 73, cap56: 64, cap79: 56 },
    { sizeStr: "38 mm²", isSingle: false, sizeNum: 38, cap3: 94, cap4: 85, cap56: 75, cap79: 66 },
    { sizeStr: "50 mm²", isSingle: false, sizeNum: 50, cap3: 108, cap4: 97, cap56: 86, cap79: 75 },
    { sizeStr: "60 mm²", isSingle: false, sizeNum: 60, cap3: 125, cap4: 112, cap56: 100, cap79: 87 },
    { sizeStr: "80 mm²", isSingle: false, sizeNum: 80, cap3: 145, cap4: 130, cap56: 116, cap79: 101 },
    { sizeStr: "100 mm²", isSingle: false, sizeNum: 100, cap3: 173, cap4: 155, cap56: 138, cap79: 121 },
    { sizeStr: "125 mm²", isSingle: false, sizeNum: 125, cap3: 195, cap4: 175, cap56: 156, cap79: 136 },
    { sizeStr: "150 mm²", isSingle: false, sizeNum: 150, cap3: 220, cap4: 198, cap56: 176, cap79: 154 },
    { sizeStr: "200 mm²", isSingle: false, sizeNum: 200, cap3: 251, cap4: 225, cap56: 200, cap79: 175 },
    { sizeStr: "250 mm²", isSingle: false, sizeNum: 250, cap3: 292, cap4: 262, cap56: 233, cap79: 204 },
    { sizeStr: "325 mm²", isSingle: false, sizeNum: 325, cap3: 330, cap4: 297, cap56: 264, cap79: 231 },
    { sizeStr: "400 mm²", isSingle: false, sizeNum: 400, cap3: 373, cap4: 335, cap56: 298, cap79: 261 },
    { sizeStr: "500 mm²", isSingle: false, sizeNum: 500, cap3: 409, cap4: 368, cap56: 327, cap79: 286 }
  ];

  // 表二五～三：金屬導線管配線之導線安培容量 (絕緣物最高容許溫度 75℃，周圍溫度 35℃ 以下)
  // 適用：75℃ 耐熱 PVC 絕緣電線 (如 HIV線) 敷設於金屬導線管
  const TABLE_25_3 = [
    { sizeStr: "1.6 mm", isSingle: true, sizeNum: 1.6, cap3: 19, cap4: 17, cap56: 15, cap79: 13 },
    { sizeStr: "2.0 mm", isSingle: true, sizeNum: 2.0, cap3: 23, cap4: 21, cap56: 18, cap79: 16 },
    { sizeStr: "2.6 mm", isSingle: true, sizeNum: 2.6, cap3: 33, cap4: 30, cap56: 26, cap79: 23 },
    { sizeStr: "3.5 mm²", isSingle: false, sizeNum: 3.5, cap3: 24, cap4: 22, cap56: 19, cap79: 17 },
    { sizeStr: "5.5 mm²", isSingle: false, sizeNum: 5.5, cap3: 34, cap4: 31, cap56: 27, cap79: 24 },
    { sizeStr: "8 mm²", isSingle: false, sizeNum: 8, cap3: 46, cap4: 41, cap56: 36, cap79: 32 },
    { sizeStr: "14 mm²", isSingle: false, sizeNum: 14, cap3: 63, cap4: 57, cap56: 50, cap79: 44 },
    { sizeStr: "22 mm²", isSingle: false, sizeNum: 22, cap3: 82, cap4: 74, cap56: 65, cap79: 57 },
    { sizeStr: "30 mm²", isSingle: false, sizeNum: 30, cap3: 101, cap4: 91, cap56: 80, cap79: 70 },
    { sizeStr: "38 mm²", isSingle: false, sizeNum: 38, cap3: 115, cap4: 103, cap56: 92, cap79: 80 },
    { sizeStr: "50 mm²", isSingle: false, sizeNum: 50, cap3: 134, cap4: 120, cap56: 107, cap79: 93 },
    { sizeStr: "60 mm²", isSingle: false, sizeNum: 60, cap3: 155, cap4: 139, cap56: 124, cap79: 108 },
    { sizeStr: "80 mm²", isSingle: false, sizeNum: 80, cap3: 182, cap4: 163, cap56: 145, cap79: 127 },
    { sizeStr: "100 mm²", isSingle: false, sizeNum: 100, cap3: 210, cap4: 189, cap56: 168, cap79: 147 },
    { sizeStr: "125 mm²", isSingle: false, sizeNum: 125, cap3: 240, cap4: 216, cap56: 192, cap79: 168 },
    { sizeStr: "150 mm²", isSingle: false, sizeNum: 150, cap3: 275, cap4: 247, cap56: 220, cap79: 192 },
    { sizeStr: "200 mm²", isSingle: false, sizeNum: 200, cap3: 320, cap4: 288, cap56: 256, cap79: 224 },
    { sizeStr: "250 mm²", isSingle: false, sizeNum: 250, cap3: 370, cap4: 333, cap56: 296, cap79: 259 },
    { sizeStr: "325 mm²", isSingle: false, sizeNum: 325, cap3: 425, cap4: 382, cap56: 340, cap79: 297 },
    { sizeStr: "400 mm²", isSingle: false, sizeNum: 400, cap3: 485, cap4: 436, cap56: 388, cap79: 339 },
    { sizeStr: "500 mm²", isSingle: false, sizeNum: 500, cap3: 545, cap4: 490, cap436: 436, cap79: 381 }
  ];

  // 表二五～四：金屬導線管配線之導線安培容量 (絕緣物最高容許溫度 90℃，周圍溫度 35℃ 以下)
  // 適用：交連 PE 絕緣電線 (XLPE線 / CZ線) 敷設於金屬導線管
  const TABLE_25_4 = [
    { sizeStr: "1.6 mm", isSingle: true, sizeNum: 1.6, cap3: 24, cap4: 21, cap56: 19, cap79: 16 },
    { sizeStr: "2.0 mm", isSingle: true, sizeNum: 2.0, cap3: 28, cap4: 25, cap56: 22, cap79: 19 },
    { sizeStr: "2.6 mm", isSingle: true, sizeNum: 2.6, cap3: 39, cap4: 35, cap56: 31, cap79: 27 },
    { sizeStr: "3.5 mm²", isSingle: false, sizeNum: 3.5, cap3: 30, cap4: 27, cap56: 24, cap79: 21 },
    { sizeStr: "5.5 mm²", isSingle: false, sizeNum: 5.5, cap3: 39, cap4: 35, cap56: 31, cap79: 27 },
    { sizeStr: "8 mm²", isSingle: false, sizeNum: 8, cap3: 51, cap4: 46, cap56: 40, cap79: 35 },
    { sizeStr: "14 mm²", isSingle: false, sizeNum: 14, cap3: 74, cap4: 66, cap56: 59, cap79: 51 },
    { sizeStr: "22 mm²", isSingle: false, sizeNum: 22, cap3: 93, cap4: 83, cap56: 74, cap79: 65 },
    { sizeStr: "30 mm²", isSingle: false, sizeNum: 30, cap3: 116, cap4: 104, cap56: 92, cap79: 81 },
    { sizeStr: "38 mm²", isSingle: false, sizeNum: 38, cap3: 130, cap4: 117, cap56: 104, cap79: 91 },
    { sizeStr: "50 mm²", isSingle: false, sizeNum: 50, cap3: 155, cap4: 139, cap56: 124, cap79: 108 },
    { sizeStr: "60 mm²", isSingle: false, sizeNum: 60, cap3: 176, cap4: 158, cap56: 140, cap79: 123 },
    { sizeStr: "80 mm²", isSingle: false, sizeNum: 80, cap3: 208, cap4: 187, cap56: 166, cap79: 145 },
    { sizeStr: "100 mm²", isSingle: false, sizeNum: 100, cap3: 241, cap4: 217, cap56: 193, cap79: 168 },
    { sizeStr: "125 mm²", isSingle: false, sizeNum: 125, cap3: 275, cap4: 247, cap56: 220, cap79: 192 },
    { sizeStr: "150 mm²", isSingle: false, sizeNum: 150, cap3: 315, cap4: 283, cap56: 252, cap79: 220 },
    { sizeStr: "200 mm²", isSingle: false, sizeNum: 200, cap3: 370, cap4: 333, cap56: 296, cap79: 259 },
    { sizeStr: "250 mm²", isSingle: false, sizeNum: 250, cap3: 425, cap4: 382, cap56: 340, cap79: 297 },
    { sizeStr: "325 mm²", isSingle: false, sizeNum: 325, cap3: 490, cap4: 441, cap56: 392, cap79: 343 },
    { sizeStr: "400 mm²", isSingle: false, sizeNum: 400, cap3: 555, cap4: 499, cap444: 444, cap79: 388 },
    { sizeStr: "500 mm²", isSingle: false, sizeNum: 500, cap3: 625, cap4: 562, cap500: 500, cap79: 437 }
  ];

  // 表二五～五：PVC管配線之導線安培容量 (絕緣物最高容許溫度 60℃，周圍溫度 35℃ 以下)
  // 適用：600V PVC絕緣電線敷設於 PVC管、HDPE管、非金屬可撓導線管
  const TABLE_25_5 = [
    { sizeStr: "1.6 mm", isSingle: true, sizeNum: 1.6, cap3: 15, cap4: 14, cap56: 12, cap79: 11 },
    { sizeStr: "2.0 mm", isSingle: true, sizeNum: 2.0, cap3: 19, cap4: 17, cap56: 15, cap79: 13 },
    { sizeStr: "2.6 mm", isSingle: true, sizeNum: 2.6, cap3: 26, cap4: 23, cap56: 21, cap79: 18 },
    { sizeStr: "3.5 mm²", isSingle: false, sizeNum: 3.5, cap3: 19, cap4: 17, cap56: 15, cap79: 13 },
    { sizeStr: "5.5 mm²", isSingle: false, sizeNum: 5.5, cap3: 25, cap4: 23, cap56: 20, cap79: 18 },
    { sizeStr: "8 mm²", isSingle: false, sizeNum: 8, cap3: 33, cap4: 30, cap56: 26, cap79: 23 },
    { sizeStr: "14 mm²", isSingle: false, sizeNum: 14, cap3: 50, cap4: 45, cap56: 40, cap79: 35 },
    { sizeStr: "22 mm²", isSingle: false, sizeNum: 22, cap3: 60, cap4: 54, cap56: 48, cap79: 42 },
    { sizeStr: "30 mm²", isSingle: false, sizeNum: 30, cap3: 75, cap4: 68, cap56: 60, cap79: 53 },
    { sizeStr: "38 mm²", isSingle: false, sizeNum: 38, cap3: 85, cap4: 77, cap56: 68, cap79: 60 },
    { sizeStr: "50 mm²", isSingle: false, sizeNum: 50, cap3: 100, cap4: 90, cap56: 80, cap79: 70 },
    { sizeStr: "60 mm²", isSingle: false, sizeNum: 60, cap3: 115, cap4: 104, cap56: 92, cap79: 81 },
    { sizeStr: "80 mm²", isSingle: false, sizeNum: 80, cap3: 140, cap4: 126, cap56: 112, cap79: 98 },
    { sizeStr: "100 mm²", isSingle: false, sizeNum: 100, cap3: 160, cap4: 144, cap56: 128, cap79: 112 },
    { sizeStr: "125 mm²", isSingle: false, sizeNum: 125, cap3: 185, cap4: 167, cap56: 148, cap79: 130 },
    { sizeStr: "150 mm²", isSingle: false, sizeNum: 150, cap3: 215, cap4: 194, cap56: 172, cap79: 151 },
    { sizeStr: "200 mm²", isSingle: false, sizeNum: 200, cap3: 250, cap4: 225, cap56: 200, cap79: 175 },
    { sizeStr: "250 mm²", isSingle: false, sizeNum: 250, cap3: 285, cap4: 257, cap228: 228, cap79: 200 },
    { sizeStr: "325 mm²", isSingle: false, sizeNum: 325, cap3: 330, cap4: 297, cap56: 264, cap79: 231 },
    { sizeStr: "400 mm²", isSingle: false, sizeNum: 400, cap3: 370, cap4: 333, cap56: 296, cap79: 259 },
    { sizeStr: "500 mm²", isSingle: false, sizeNum: 500, cap3: 415, cap4: 374, cap56: 332, cap79: 291 }
  ];

  // 表二五～七：周圍溫度非為攝氏 35℃ 之修正係數
  // 溫度等級: 60℃, 75℃, 90℃
  const TEMP_CORRECTION = {
    "35": { "60": 1.00, "75": 1.00, "90": 1.00 },
    "40": { "60": 0.89, "75": 0.94, "90": 0.95 },
    "45": { "60": 0.77, "75": 0.87, "90": 0.90 },
    "50": { "60": 0.63, "75": 0.79, "90": 0.85 },
    "55": { "60": 0.45, "75": 0.71, "90": 0.80 },
    "60": { "60": 0.00, "75": 0.61, "90": 0.74 }
  };

  // 配管尺寸選用表 (依據線徑與穿線條數 2條, 3條, 4條)
  // 金屬管(EMT薄鋼管)、金屬管(厚鋼管 RSG/GIP)、PVC管(E管/厚管)
  const CONDUIT_SPECS = {
    "1.6 mm": {
      emt: { 2: "E19 (1/2\")", 3: "E19 (1/2\")", 4: "E19 (1/2\")" },
      thick: { 2: "G16 (1/2\")", 3: "G16 (1/2\")", 4: "G16 (1/2\")" },
      pvc: { 2: "16 (1/2\")", 3: "16 (1/2\")", 4: "16 (1/2\")" }
    },
    "2.0 mm": {
      emt: { 2: "E19 (1/2\")", 3: "E19 (1/2\")", 4: "E19 (1/2\")" },
      thick: { 2: "G16 (1/2\")", 3: "G16 (1/2\")", 4: "G16 (1/2\")" },
      pvc: { 2: "16 (1/2\")", 3: "16 (1/2\")", 4: "16 (1/2\")" }
    },
    "2.6 mm": {
      emt: { 2: "E19 (1/2\")", 3: "E19 (1/2\")", 4: "E25 (3/4\")" },
      thick: { 2: "G16 (1/2\")", 3: "G16 (1/2\")", 4: "G22 (3/4\")" },
      pvc: { 2: "16 (1/2\")", 3: "16 (1/2\")", 4: "20 (3/4\")" }
    },
    "3.5 mm²": {
      emt: { 2: "E19 (1/2\")", 3: "E19 (1/2\")", 4: "E25 (3/4\")" },
      thick: { 2: "G16 (1/2\")", 3: "G16 (1/2\")", 4: "G22 (3/4\")" },
      pvc: { 2: "16 (1/2\")", 3: "16 (1/2\")", 4: "20 (3/4\")" }
    },
    "5.5 mm²": {
      emt: { 2: "E19 (1/2\")", 3: "E25 (3/4\")", 4: "E25 (3/4\")" },
      thick: { 2: "G16 (1/2\")", 3: "G22 (3/4\")", 4: "G22 (3/4\")" },
      pvc: { 2: "16 (1/2\")", 3: "20 (3/4\")", 4: "20 (3/4\")" }
    },
    "8 mm²": {
      emt: { 2: "E25 (3/4\")", 3: "E25 (3/4\")", 4: "E31 (1\")" },
      thick: { 2: "G22 (3/4\")", 3: "G22 (3/4\")", 4: "G28 (1\")" },
      pvc: { 2: "20 (3/4\")", 3: "20 (3/4\")", 4: "28 (1\")" }
    },
    "14 mm²": {
      emt: { 2: "E25 (3/4\")", 3: "E31 (1\")", 4: "E39 (1-1/4\")" },
      thick: { 2: "G22 (3/4\")", 3: "G28 (1\")", 4: "G36 (1-1/4\")" },
      pvc: { 2: "20 (3/4\")", 3: "28 (1\")", 4: "35 (1-1/4\")" }
    },
    "22 mm²": {
      emt: { 2: "E31 (1\")", 3: "E39 (1-1/4\")", 4: "E39 (1-1/4\")" },
      thick: { 2: "G28 (1\")", 3: "G36 (1-1/4\")", 4: "G36 (1-1/4\")" },
      pvc: { 2: "28 (1\")", 3: "35 (1-1/4\")", 4: "35 (1-1/4\")" }
    },
    "30 mm²": {
      emt: { 2: "E39 (1-1/4\")", 3: "E39 (1-1/4\")", 4: "E51 (1-1/2\")" },
      thick: { 2: "G36 (1-1/4\")", 3: "G36 (1-1/4\")", 4: "G42 (1-1/2\")" },
      pvc: { 2: "35 (1-1/4\")", 3: "35 (1-1/4\")", 4: "41 (1-1/2\")" }
    },
    "38 mm²": {
      emt: { 2: "E39 (1-1/4\")", 3: "E51 (1-1/2\")", 4: "E51 (1-1/2\")" },
      thick: { 2: "G36 (1-1/4\")", 3: "G42 (1-1/2\")", 4: "G42 (1-1/2\")" },
      pvc: { 2: "35 (1-1/4\")", 3: "41 (1-1/2\")", 4: "41 (1-1/2\")" }
    },
    "50 mm²": {
      emt: { 2: "E51 (1-1/2\")", 3: "E51 (1-1/2\")", 4: "E63 (2\")" },
      thick: { 2: "G42 (1-1/2\")", 3: "G42 (1-1/2\")", 4: "G54 (2\")" },
      pvc: { 2: "41 (1-1/2\")", 3: "41 (1-1/2\")", 4: "52 (2\")" }
    },
    "60 mm²": {
      emt: { 2: "E51 (1-1/2\")", 3: "E63 (2\")", 4: "E63 (2\")" },
      thick: { 2: "G42 (1-1/2\")", 3: "G54 (2\")", 4: "G54 (2\")" },
      pvc: { 2: "41 (1-1/2\")", 3: "52 (2\")", 4: "52 (2\")" }
    },
    "80 mm²": {
      emt: { 2: "E63 (2\")", 3: "E75 (2-1/2\")", 4: "E75 (2-1/2\")" },
      thick: { 2: "G54 (2\")", 3: "G70 (2-1/2\")", 4: "G70 (2-1/2\")" },
      pvc: { 2: "52 (2\")", 3: "65 (2-1/2\")", 4: "65 (2-1/2\")" }
    },
    "100 mm²": {
      emt: { 2: "E63 (2\")", 3: "E75 (2-1/2\")", 4: "E75 (2-1/2\")" },
      thick: { 2: "G54 (2\")", 3: "G70 (2-1/2\")", 4: "G70 (2-1/2\")" },
      pvc: { 2: "52 (2\")", 3: "65 (2-1/2\")", 4: "65 (2-1/2\")" }
    },
    "125 mm²": {
      emt: { 2: "E75 (2-1/2\")", 3: "E75 (2-1/2\")", 4: "E75 (2-1/2\")" },
      thick: { 2: "G70 (2-1/2\")", 3: "G70 (2-1/2\")", 4: "G82 (3\")" },
      pvc: { 2: "65 (2-1/2\")", 3: "65 (2-1/2\")", 4: "80 (3\")" }
    },
    "150 mm²": {
      emt: { 2: "E75 (2-1/2\")", 3: "E75 (2-1/2\")", 4: "E75 (2-1/2\")" },
      thick: { 2: "G70 (2-1/2\")", 3: "G82 (3\")", 4: "G82 (3\")" },
      pvc: { 2: "65 (2-1/2\")", 3: "80 (3\")", 4: "80 (3\")" }
    },
    "200 mm²": {
      emt: { 2: "E75 (2-1/2\")", 3: "E75 (2-1/2\")", 4: "電纜槽/多管" },
      thick: { 2: "G82 (3\")", 3: "G82 (3\")", 4: "G104 (4\")" },
      pvc: { 2: "80 (3\")", 3: "80 (3\")", 4: "100 (4\")" }
    },
    "250 mm²": {
      emt: { 2: "電纜槽/多管", 3: "電纜槽/多管", 4: "電纜槽/多管" },
      thick: { 2: "G82 (3\")", 3: "G104 (4\")", 4: "G104 (4\")" },
      pvc: { 2: "80 (3\")", 3: "100 (4\")", 4: "100 (4\")" }
    },
    "325 mm²": {
      emt: { 2: "電纜槽/多管", 3: "電纜槽/多管", 4: "電纜槽/多管" },
      thick: { 2: "G104 (4\")", 3: "G104 (4\")", 4: "G104 (4\")" },
      pvc: { 2: "100 (4\")", 3: "100 (4\")", 4: "100 (4\")" }
    },
    "400 mm²": {
      emt: { 2: "電纜槽/多管", 3: "電纜槽/多管", 4: "電纜槽/多管" },
      thick: { 2: "G104 (4\")", 3: "G104 (4\")", 4: "特規配管" },
      pvc: { 2: "100 (4\")", 3: "100 (4\")", 4: "特規配管" }
    },
    "500 mm²": {
      emt: { 2: "電纜槽/多管", 3: "電纜槽/多管", 4: "電纜槽/多管" },
      thick: { 2: "G104 (4\")", 3: "特規配管", 4: "特規配管" },
      pvc: { 2: "100 (4\")", 3: "特規配管", 4: "特規配管" }
    }
  };

  const TABLE_MAP = {
    "t25_2": {
      id: "t25_2",
      name: "表二五～二：金屬導線管 (60℃ 絕緣物 - IV/PVC線)",
      shortName: "60℃ 金屬管 (表25-2)",
      tempRating: "60",
      type: "metal",
      data: TABLE_25_2
    },
    "t25_3": {
      id: "t25_3",
      name: "表二五～三：金屬導線管 (75℃ 耐熱線 - HIV線)",
      shortName: "75℃ 金屬管 (表25-3)",
      tempRating: "75",
      type: "metal",
      data: TABLE_25_3
    },
    "t25_4": {
      id: "t25_4",
      name: "表二五～四：金屬導線管 (90℃ 交連PE - XLPE/CZ線)",
      shortName: "90℃ 金屬管 (表25-4)",
      tempRating: "90",
      type: "metal",
      data: TABLE_25_4
    },
    "t25_5": {
      id: "t25_5",
      name: "表二五～五：PVC管配線 (60℃ 絕緣物 - IV/PVC線)",
      shortName: "60℃ PVC管 (表25-5)",
      tempRating: "60",
      type: "pvc",
      data: TABLE_25_5
    }
  };

  /**
   * 依據使用者輸入之電流(A)、表格類別、導線條數、環境溫度推算導線及配管規格
   * @param {Object} params
   * @param {number} params.currentA - 負載電流 (安培 A)
   * @param {string} params.tableKey - 表格代碼 ("t25_2", "t25_3", "t25_4", "t25_5", "all")
   * @param {number} params.wireCount - 載流導線條數 (2, 3, 4)
   * @param {string|number} params.ambientTemp - 環境周圍溫度 ("35", "40", "45", "50", "55", "60")
   */
  function calcWireAndConduit(params) {
    const currentA = parseFloat(params.currentA) || 0;
    const tableKey = params.tableKey || "t25_2";
    const wireCount = parseInt(params.wireCount, 10) || 3;
    const ambientTemp = String(params.ambientTemp || "35");

    // 單表計算輔助函式
    function evaluateSingleTable(tKey) {
      const tableInfo = TABLE_MAP[tKey];
      if (!tableInfo) return null;

      const tempRating = tableInfo.tempRating;
      const tempFactor = (TEMP_CORRECTION[ambientTemp] && TEMP_CORRECTION[ambientTemp][tempRating] !== undefined)
        ? TEMP_CORRECTION[ambientTemp][tempRating]
        : 1.0;

      let capField = "cap3";
      if (wireCount === 4) capField = "cap4";
      else if (wireCount >= 5 && wireCount <= 6) capField = "cap56";
      else if (wireCount >= 7) capField = "cap79";
      else capField = "cap3"; // 2條或3條載流導線均適用 3條以下之數值

      let matchedRow = null;
      let matchedIndex = -1;

      for (let i = 0; i < tableInfo.data.length; i++) {
        const row = tableInfo.data[i];
        const baseCap = row[capField] || 0;
        const effectiveCap = Math.round(baseCap * tempFactor * 10) / 10;

        if (currentA > 0 && effectiveCap >= currentA) {
          matchedRow = row;
          matchedIndex = i;
          break;
        }
      }

      // 若電流超過表中最大規格
      if (currentA > 0 && !matchedRow && tableInfo.data.length > 0) {
        matchedRow = tableInfo.data[tableInfo.data.length - 1];
        matchedIndex = tableInfo.data.length - 1;
      }

      // 如果未輸入電流或為 0，預設指向第一列
      if (!matchedRow && tableInfo.data.length > 0) {
        matchedRow = tableInfo.data[0];
        matchedIndex = 0;
      }

      const sizeStr = matchedRow ? matchedRow.sizeStr : "--";
      const baseCap = matchedRow ? (matchedRow[capField] || 0) : 0;
      const effectiveCap = Math.round(baseCap * tempFactor * 10) / 10;

      // 配管查詢
      const conduitSpec = CONDUIT_SPECS[sizeStr] || {
        emt: { 2: "依工程計算", 3: "依工程計算", 4: "依工程計算" },
        thick: { 2: "依工程計算", 3: "依工程計算", 4: "依工程計算" },
        pvc: { 2: "依工程計算", 3: "依工程計算", 4: "依工程計算" }
      };

      const countKey = (wireCount === 4) ? 4 : (wireCount === 2 ? 2 : 3);
      const emtSize = conduitSpec.emt[countKey] || conduitSpec.emt[3] || "--";
      const thickSize = conduitSpec.thick[countKey] || conduitSpec.thick[3] || "--";
      const pvcSize = conduitSpec.pvc[countKey] || conduitSpec.pvc[3] || "--";

      return {
        tableKey: tKey,
        tableName: tableInfo.name,
        tableShortName: tableInfo.shortName,
        tempRating: tempRating,
        tempFactor: tempFactor,
        matchedIndex: matchedIndex,
        matchedRow: matchedRow,
        sizeStr: sizeStr,
        baseAmpacity: baseCap,
        effectiveAmpacity: effectiveCap,
        wireCount: wireCount,
        ambientTemp: ambientTemp,
        emtConduit: emtSize,
        thickConduit: thickSize,
        pvcConduit: pvcSize,
        isOverCapacity: currentA > effectiveCap
      };
    }

    const currentPrimary = evaluateSingleTable(tableKey === "all" ? "t25_2" : tableKey);

    // 同時計算四張表的對照數據
    const comparison = {
      t25_2: evaluateSingleTable("t25_2"),
      t25_3: evaluateSingleTable("t25_3"),
      t25_4: evaluateSingleTable("t25_4"),
      t25_5: evaluateSingleTable("t25_5")
    };

    return {
      inputA: currentA,
      tableKey: tableKey,
      wireCount: wireCount,
      ambientTemp: ambientTemp,
      primary: currentPrimary,
      comparison: comparison,
      tableData: TABLE_MAP[tableKey === "all" ? "t25_2" : tableKey].data,
      tableMeta: TABLE_MAP[tableKey === "all" ? "t25_2" : tableKey]
    };
  }

  // 匯出全域模組
  window.HVACWireSizer = {
    TABLE_25_2: TABLE_25_2,
    TABLE_25_3: TABLE_25_3,
    TABLE_25_4: TABLE_25_4,
    TABLE_25_5: TABLE_25_5,
    TEMP_CORRECTION: TEMP_CORRECTION,
    CONDUIT_SPECS: CONDUIT_SPECS,
    TABLE_MAP: TABLE_MAP,
    calcWireAndConduit: calcWireAndConduit
  };
})(window);
