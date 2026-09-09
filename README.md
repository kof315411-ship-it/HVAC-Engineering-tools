# ❄️ 空調工程離線小工具 (HVAC Engineering Tools)

100% 離線可用、行動優先 (Mobile-First) 的空調工程計算小工具，包含空調負載計算、風管壓損計算、鐵皮才數計算與水管管徑表速查。

- **線上 PWA 網址**：[https://kof315411-ship-it.github.io/HVAC-Engineering-tools/](https://kof315411-ship-it.github.io/HVAC-Engineering-tools/)
- **GitHub 專案庫**：[https://github.com/kof315411-ship-it/HVAC-Engineering-tools](https://github.com/kof315411-ship-it/HVAC-Engineering-tools)

---

## 📱 手機 APP 安裝方式 (Android / iOS)

### 1. PWA 主畫面 App (推薦)
無需安裝 `.apk` 即可像原生 App 一樣全螢幕與離線使用：
- **iPhone (iOS Safari)**：開啟網址 ➔ 點擊下方「分享 ⎋」 ➔ 選擇「加入主畫面」。
- **Android (Chrome)**：開啟網址 ➔ 點擊右上角「⋮」 ➔ 選擇「安裝應用程式」或「新增至主畫面」。

### 2. 打包為 Android APK 安裝包
專案已包含原生的 Android WebView 工程 (`android/` 目錄)：
- **使用 PWABuilder (微軟官方線上免費打包工具)**：
  1. 前往 [https://www.pwabuilder.com/](https://www.pwabuilder.com/)
  2. 輸入網址 `https://kof315411-ship-it.github.io/HVAC-Engineering-tools/`
  3. 點擊 **Package for Store / Android** 即可下載 `.apk` 安裝包。
- **使用 Android Studio**：
  1. 開啟本專案中的 `android/` 目錄。
  2. 執行 `Build ➔ Build Bundle(s) / APK(s) ➔ Build APK(s)` 即可產出原生的 `.apk` 檔。

---

## ⚙️ 計算功能與公式說明

1. **🔥 空調負載計算**
   - 包含濕空氣焓值計算 ($h$), 顯熱/潛熱分量, 設備負載與人員發熱計算。
   - 保留原始 Excel 正確算式，編輯區僅開放未計算之原始變數輸入。

2. **🌀 風管壓損計算**
   - 根據風速 $V$, 當量直徑 $D_{\text{eq}}$, 達西-威斯巴哈 (Darcy-Weisbach) 沿程阻力與局部阻力係數 $K$ 計算靜壓損失，並加上 20% 安全係數。

3. **📐 鐵皮才數計算**
   - 風管支數 $N = \text{長度(米)} / 1.2$（唯讀欄位）。
   - 板材號數（`26#`, `24#`, `22#`, `20#`, `18#`）依照原始 Excel `H10` 判斷公式 `=IF(A<31,"26#",IF(A<76,"24#",IF(A<151,"22#",IF(A<225,"20#","18#"))))` 自動產生（唯讀欄位）。

4. **💧 管徑表速查**
   - 支援冰水 (10.08 LPM/RT) 與冷卻水 (12.8 LPM/RT) 15A ~ 800A 快速查表與自動高亮顯示。

5. **⚡ 電線線徑、配管選用查詢**
   - 依據經濟部《用戶用電設備裝置規則》表二五～二 至 表二五～五及表二五～七。
   - 輸入運轉電流（安培 A），即時推算推薦線徑規格，並同步列出金屬管（EMT 薄鋼管、厚鋼電線管 RSG/GIP）與 PVC 電線導管尺寸，支援周溫修正與全表對照。

6. **🧥 配管保溫選用**
   - 依據公有建築與中研院工程施工規範第 15080 章《空調用保溫》。
   - 涵蓋冰水管路 (5~12℃)、熱水管路 (40~80℃)、低溫鹵水管路 (-15~0℃)、冷凝水排水管 (10~18℃) 與空調風管。
   - 提供酚樹脂保溫材 (K≦0.022)、橡塑合成發泡 (K≦0.036)、PE 發泡 (K≦0.039) 等保溫厚度、保溫後外徑推算與外護層（24#鋁皮/26#不銹鋼皮）、高密度鞍座規範要求。