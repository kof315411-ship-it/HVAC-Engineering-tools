/**
 * HVAC Engineering Web Tools - Main Application Controller
 */

import { calcEnthalpy, calcRoomLoad } from "./load-calc.js";
import { FITTING_TYPES, calcDuctLoss, calcSystemDuctLoss } from "./duct-loss.js";
import { STEEL_GAUGES, calcSheetMetal } from "./sheet-metal.js";
import { lookupPipeSize } from "./pipe-sizer.js";

// Global App State
const state = {
  activeTab: "tab-load",
  loadCalc: {
    outTemp: 33,
    outRH: 75,
    rooms: [
      {
        id: "room-1",
        roomName: "辦公室 (樣例 1)",
        areaM2: 51,
        height: 3.5,
        inTemp: 24,
        inRH: 55,
        baseRate: 450,
        windowArea: 0,
        windowRate: 120,
        people: 5,
        equipHP: 0,
        equipW: 0,
        freshAirCMH: 100
      },
      {
        id: "room-2",
        roomName: "迎賓大廳 (樣例 2)",
        areaM2: 101,
        height: 7.0,
        inTemp: 24,
        inRH: 55,
        baseRate: 450,
        windowArea: 0,
        windowRate: 120,
        people: 12,
        equipHP: 0,
        equipW: 0,
        freshAirCMH: 420
      }
    ]
  },
  ductLoss: {
    flow: 5000,
    width: 950,
    height: 400,
    length: 10,
    fittingId: "DUCT",
    fittingQty: 1,
    segments: []
  },
  sheetMetal: {
    width: 100,
    height: 50,
    length: 10,
    qty: 1,
    wasteRate: 10,
    thicknessMM: 0.8
  },
  pipeSizer: {
    sysType: "chilled",
    inputRT: 100,
    inputLPM: ""
  }
};

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initLoadCalc();
  initDuctLoss();
  initSheetMetal();
  initPipeSizer();
  registerServiceWorker();
});

// Register Service Worker for Offline PWA Support
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("sw.js")
      .then(() => console.log("Service Worker registered successfully."))
      .catch((err) => console.warn("Service Worker registration failed:", err));
  }
}

// Navigation Tabs Manager
function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn, .bottom-nav-item");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      if (!targetTab) return;

      state.activeTab = targetTab;

      // Update active state in top & bottom nav
      document.querySelectorAll(".tab-btn, .bottom-nav-item").forEach((b) => {
        if (b.getAttribute("data-tab") === targetTab) {
          b.classList.add("active");
        } else {
          b.classList.remove("active");
        }
      });

      // Update active pane
      document.querySelectorAll(".tab-pane").forEach((pane) => {
        if (pane.id === targetTab) {
          pane.classList.add("active");
        } else {
          pane.classList.remove("active");
        }
      });
    });
  });
}

/* ==========================================================================
   TAB 1: 空調負載計算 Controller
   ========================================================================== */
function initLoadCalc() {
  const outTempInput = document.getElementById("load-out-temp");
  const outRHInput = document.getElementById("load-out-rh");
  const outEnthalpyInput = document.getElementById("load-out-enthalpy");
  const addRoomBtn = document.getElementById("btn-add-room");

  function updateAmbient() {
    state.loadCalc.outTemp = parseFloat(outTempInput.value) || 33;
    state.loadCalc.outRH = parseFloat(outRHInput.value) || 75;

    const outEnthalpy = calcEnthalpy(state.loadCalc.outTemp, state.loadCalc.outRH);
    outEnthalpyInput.value = outEnthalpy.toFixed(2);

    renderRooms();
  }

  outTempInput.addEventListener("input", updateAmbient);
  outRHInput.addEventListener("input", updateAmbient);

  addRoomBtn.addEventListener("click", () => {
    const newId = "room-" + Date.now();
    state.loadCalc.rooms.push({
      id: newId,
      roomName: `新空間 ${state.loadCalc.rooms.length + 1}`,
      areaM2: 33,
      height: 3.2,
      inTemp: 24,
      inRH: 55,
      baseRate: 450,
      windowArea: 0,
      windowRate: 120,
      people: 2,
      equipHP: 0,
      equipW: 0,
      freshAirCMH: 70
    });
    renderRooms();
  });

  updateAmbient();
}

function renderRooms() {
  const container = document.getElementById("room-list-container");
  if (!container) return;

  container.innerHTML = "";

  let totalProjectRT = 0;
  let totalProjectKcal = 0;
  let totalWinterRT = 0;

  state.loadCalc.rooms.forEach((room, index) => {
    const res = calcRoomLoad({
      outTemp: state.loadCalc.outTemp,
      outRH: state.loadCalc.outRH,
      ...room
    });

    totalProjectRT += res.rtWithFresh;
    totalProjectKcal += res.totalWithFresh;
    totalWinterRT += res.winterRT;

    const roomCard = document.createElement("div");
    roomCard.className = "card";
    roomCard.style.borderLeft = "4px solid var(--primary)";
    roomCard.style.marginBottom = "16px";

    roomCard.innerHTML = `
      <div class="card-title">
        <span>空間 ${index + 1}: ${res.roomName}</span>
        <button class="btn btn-danger btn-sm btn-delete-room" data-id="${room.id}">刪除空間</button>
      </div>
      <div class="grid-3" style="margin-bottom: 12px;">
        <div class="form-group">
          <label class="form-label">空間名稱</label>
          <input type="text" class="form-control room-input" data-id="${room.id}" data-field="roomName" value="${room.roomName}">
        </div>
        <div class="form-group">
          <label class="form-label">面積 (m²)</label>
          <div class="input-wrapper">
            <input type="number" class="form-control has-unit room-input" data-id="${room.id}" data-field="areaM2" value="${room.areaM2}" step="1">
            <span class="input-unit">m² (${res.ping.toFixed(1)}坪)</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">天花板高度</label>
          <div class="input-wrapper">
            <input type="number" class="form-control has-unit room-input" data-id="${room.id}" data-field="height" value="${room.height}" step="0.1">
            <span class="input-unit">m</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">室內設計溫度</label>
          <div class="input-wrapper">
            <input type="number" class="form-control has-unit room-input" data-id="${room.id}" data-field="inTemp" value="${room.inTemp}" step="0.5">
            <span class="input-unit">°C</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">人員數量</label>
          <div class="input-wrapper">
            <input type="number" class="form-control has-unit room-input" data-id="${room.id}" data-field="people" value="${room.people}" step="1">
            <span class="input-unit">人</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">外氣風量 (CMH)</label>
          <div class="input-wrapper">
            <input type="number" class="form-control has-unit room-input" data-id="${room.id}" data-field="freshAirCMH" value="${room.freshAirCMH}" step="10">
            <span class="input-unit">CMH</span>
          </div>
        </div>
      </div>

      <div class="grid-4" style="background: var(--bg-main); padding: 12px; border-radius: 8px; border: 1px solid var(--border);">
        <div>
          <div style="font-size: 11px; color: var(--text-muted);">實際空間負載</div>
          <div style="font-size: 15px; font-weight: 700; color: var(--text-main);">${res.actualBaseRate.toFixed(0)} <span style="font-size: 11px;">Kcal/h.坪</span></div>
        </div>
        <div>
          <div style="font-size: 11px; color: var(--text-muted);">外氣顯/潛熱負載</div>
          <div style="font-size: 15px; font-weight: 700; color: var(--text-main);">${res.freshAirLoad.toFixed(0)} <span style="font-size: 11px;">Kcal/h</span></div>
        </div>
        <div>
          <div style="font-size: 11px; color: var(--text-muted);">本區總冷負載 (含外氣)</div>
          <div style="font-size: 16px; font-weight: 800; color: var(--primary);">${res.rtWithFresh.toFixed(2)} <span style="font-size: 12px;">RT</span></div>
        </div>
        <div>
          <div style="font-size: 11px; color: var(--text-muted);">冷負荷指標</div>
          <div style="font-size: 15px; font-weight: 700; color: var(--text-main);">${res.pingPerRTWithFresh.toFixed(2)} <span style="font-size: 11px;">坪/RT</span></div>
        </div>
      </div>
    `;

    container.appendChild(roomCard);
  });

  // Attach event listeners for inputs & delete buttons
  document.querySelectorAll(".room-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const roomId = e.target.getAttribute("data-id");
      const field = e.target.getAttribute("data-field");
      const targetRoom = state.loadCalc.rooms.find((r) => r.id === roomId);
      if (targetRoom) {
        if (field === "roomName") {
          targetRoom[field] = e.target.value;
        } else {
          targetRoom[field] = parseFloat(e.target.value) || 0;
        }
        renderRooms();
      }
    });
  });

  document.querySelectorAll(".btn-delete-room").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const roomId = e.target.getAttribute("data-id");
      state.loadCalc.rooms = state.loadCalc.rooms.filter((r) => r.id !== roomId);
      renderRooms();
    });
  });

  // Update Total Card
  document.getElementById("load-total-rt").innerHTML = `${totalProjectRT.toFixed(2)} <span style="font-size: 20px;">RT</span>`;
  document.getElementById("load-total-kcal").innerText = `總發熱量: ${Math.round(totalProjectKcal).toLocaleString()} Kcal/h | 冬季總負載: ${totalWinterRT.toFixed(2)} RT`;
}

/* ==========================================================================
   TAB 2: 風管壓損計算 Controller
   ========================================================================== */
function initDuctLoss() {
  const flowInput = document.getElementById("duct-flow");
  const widthInput = document.getElementById("duct-width");
  const heightInput = document.getElementById("duct-height");
  const lengthInput = document.getElementById("duct-length");
  const fittingSelect = document.getElementById("duct-fitting-type");
  const fittingQtyInput = document.getElementById("duct-fitting-qty");
  const addSegmentBtn = document.getElementById("btn-add-duct-segment");

  // Populate fitting selector
  fittingSelect.innerHTML = "";
  FITTING_TYPES.forEach((f) => {
    const opt = document.createElement("option");
    opt.value = f.id;
    opt.textContent = f.name;
    fittingSelect.appendChild(opt);
  });

  function updateDuctCalc() {
    state.ductLoss.flow = parseFloat(flowInput.value) || 0;
    state.ductLoss.width = parseFloat(widthInput.value) || 0;
    state.ductLoss.height = parseFloat(heightInput.value) || 0;
    state.ductLoss.length = parseFloat(lengthInput.value) || 0;
    state.ductLoss.fittingId = fittingSelect.value;
    state.ductLoss.fittingQty = parseInt(fittingQtyInput.value) || 1;

    const res = calcDuctLoss({
      flowValue: state.ductLoss.flow,
      widthMM: state.ductLoss.width,
      heightMM: state.ductLoss.height,
      lengthM: state.ductLoss.length,
      fittingId: state.ductLoss.fittingId,
      fittingQty: state.ductLoss.fittingQty
    });

    document.getElementById("res-duct-deq").innerText = res.deqMM.toFixed(0);
    document.getElementById("res-duct-velocity").innerText = res.velocity.toFixed(1);
    document.getElementById("res-duct-pv").innerText = res.pvPa.toFixed(1);
    document.getElementById("res-duct-friction").innerText = res.frictionLossPerM.toFixed(2);
  }

  [flowInput, widthInput, heightInput, lengthInput, fittingSelect, fittingQtyInput].forEach((el) => {
    el.addEventListener("input", updateDuctCalc);
  });

  addSegmentBtn.addEventListener("click", () => {
    const segRes = calcDuctLoss({
      flowValue: state.ductLoss.flow,
      widthMM: state.ductLoss.width,
      heightMM: state.ductLoss.height,
      lengthM: state.ductLoss.length,
      fittingId: state.ductLoss.fittingId,
      fittingQty: state.ductLoss.fittingQty
    });

    state.ductLoss.segments.push(segRes);
    renderDuctSegments();
  });

  updateDuctCalc();
}

function renderDuctSegments() {
  const tbody = document.querySelector("#duct-segment-table tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  state.ductLoss.segments.forEach((seg, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>S-${idx + 1}</td>
      <td>${seg.widthMM}×${seg.heightMM}</td>
      <td>${seg.flowCMH}</td>
      <td>${seg.velocity.toFixed(1)}</td>
      <td>${seg.lengthM}</td>
      <td>${seg.fittingName} (${seg.fittingQty}個)</td>
      <td><strong>${seg.segmentLossPa.toFixed(1)} Pa</strong></td>
      <td><button class="btn btn-danger btn-sm btn-delete-segment" data-idx="${idx}">刪除</button></td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".btn-delete-segment").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.target.getAttribute("data-idx"));
      state.ductLoss.segments.splice(idx, 1);
      renderDuctSegments();
    });
  });

  // Calculate system total
  const sysRes = calcSystemDuctLoss(state.ductLoss.segments);
  document.getElementById("duct-total-pa").innerHTML = `${sysRes.grandTotalPa.toFixed(1)} <span style="font-size: 20px;">Pa</span>`;
  document.getElementById("duct-total-mmaq").innerText = `約等於 ${sysRes.grandTotalMMAq.toFixed(2)} mmAq | 含 20% 安全係數加成`;
}

/* ==========================================================================
   TAB 3: 鐵皮才數計算 Controller
   ========================================================================== */
function initSheetMetal() {
  const widthInput = document.getElementById("sheet-width");
  const heightInput = document.getElementById("sheet-height");
  const lengthInput = document.getElementById("sheet-length");
  const qtyInput = document.getElementById("sheet-qty");
  const wasteInput = document.getElementById("sheet-waste");
  const thicknessSelect = document.getElementById("sheet-thickness");

  // Populate thickness selector
  thicknessSelect.innerHTML = "";
  STEEL_GAUGES.forEach((g) => {
    const opt = document.createElement("option");
    opt.value = g.mm;
    opt.textContent = g.name;
    if (g.mm === 0.8) opt.selected = true;
    thicknessSelect.appendChild(opt);
  });

  function updateSheetCalc() {
    state.sheetMetal.width = parseFloat(widthInput.value) || 0;
    state.sheetMetal.height = parseFloat(heightInput.value) || 0;
    state.sheetMetal.length = parseFloat(lengthInput.value) || 0;
    state.sheetMetal.qty = parseInt(qtyInput.value) || 1;
    state.sheetMetal.wasteRate = (parseFloat(wasteInput.value) || 0) / 100;
    state.sheetMetal.thicknessMM = parseFloat(thicknessSelect.value) || 0.8;

    const res = calcSheetMetal({
      widthCM: state.sheetMetal.width,
      heightCM: state.sheetMetal.height,
      lengthM: state.sheetMetal.length,
      qty: state.sheetMetal.qty,
      wasteRate: state.sheetMetal.wasteRate,
      thicknessMM: state.sheetMetal.thicknessMM
    });

    document.getElementById("res-sheet-tsai").innerHTML = `${res.grossTsai.toFixed(1)} <span style="font-size: 20px;">才</span>`;
    document.getElementById("res-sheet-3x7").innerText = `需 3'×7' 鍍鋅鐵皮: ${res.sheets3x7Gross.toFixed(1)} 張 (含 ${res.wasteRatePercent}% 損耗) | 淨展開面積: ${res.netAreaM2.toFixed(1)} m²`;

    document.getElementById("res-sheet-perimeter").innerText = res.perimeterCM;
    document.getElementById("res-sheet-weight").innerText = res.weightKgGross.toFixed(1);
    document.getElementById("res-sheet-corners").innerText = res.flangeCornersPcs;
    document.getElementById("res-sheet-clips").innerText = res.flangeClipsPcs;
  }

  [widthInput, heightInput, lengthInput, qtyInput, wasteInput, thicknessSelect].forEach((el) => {
    el.addEventListener("input", updateSheetCalc);
  });

  updateSheetCalc();
}

/* ==========================================================================
   TAB 4: 管徑表速查 Controller
   ========================================================================== */
function initPipeSizer() {
  const rtInput = document.getElementById("pipe-input-rt");
  const lpmInput = document.getElementById("pipe-input-lpm");
  const sysRadios = document.querySelectorAll('input[name="pipe-sys-type"]');

  function updatePipeCalc(changedField = "rt") {
    const sysType = document.querySelector('input[name="pipe-sys-type"]:checked').value;

    let res;
    if (changedField === "rt") {
      res = lookupPipeSize(sysType, rtInput.value, null);
      if (rtInput.value !== "") {
        lpmInput.value = res.lpm.toFixed(1);
      }
    } else {
      res = lookupPipeSize(sysType, null, lpmInput.value);
      if (lpmInput.value !== "") {
        rtInput.value = res.rt.toFixed(1);
      }
    }

    // Render result cards & highlight table
    document.getElementById("res-pipe-recommended").innerText = `${res.recommendedSizeA} (${res.recommendedSizeInch})`;
    document.getElementById("res-pipe-sub").innerText = `計算流量: ${res.lpm.toFixed(1)} LPM (最高支援 ${res.maxLPM === 999999 ? "800A以上" : res.maxLPM + " LPM"}) | 系統: ${res.sysName}`;

    renderPipeTable(res);
  }

  rtInput.addEventListener("input", () => updatePipeCalc("rt"));
  lpmInput.addEventListener("input", () => updatePipeCalc("lpm"));
  sysRadios.forEach((r) => r.addEventListener("change", () => updatePipeCalc("rt")));

  // Default initial calculation
  rtInput.value = 100;
  updatePipeCalc("rt");
}

function renderPipeTable(lookupRes) {
  const tbody = document.querySelector("#pipe-reference-table tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  lookupRes.table.forEach((row, idx) => {
    const tr = document.createElement("tr");
    if (idx === lookupRes.recommendedIdx && lookupRes.lpm > 0) {
      tr.className = "highlight";
    }

    const rtMax = row.maxLPM / lookupRes.factor;

    tr.innerHTML = `
      <td><strong>${row.sizeA}</strong></td>
      <td>${row.sizeInch}</td>
      <td>${row.maxLPM === 999999 ? "61800+" : row.maxLPM} LPM</td>
      <td>${row.maxLPM === 999999 ? "6000+" : rtMax.toFixed(1)} RT</td>
    `;
    tbody.appendChild(tr);
  });
}
