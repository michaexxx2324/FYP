import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    home: 'Home',
    scan: 'Scan',
    info: 'Info',
    history: 'History',
    profile: 'My Profile',
    homeScreen: 'Home Screen',
    scanScreen: 'Scan Screen',
    infoScreen: 'Info Screen',
    historyScreen: 'History Screen',
    profileScreen: 'My Profile Screen',
    // OCR / Scan keys (HEAD)
    scanMode: 'Scan Mode',
    ocrMode: 'Text Mode',
    permissionNeeded: 'Camera permission is needed',
    grantPermission: 'Grant Permission',
    scannedData: 'Scanned Data',
    tapToScanAgain: 'Tap to Scan Again',
    captureText: 'Capture Text',
    pickImage: 'Pick Image',
    processing: 'Processing...',
    noTextFound: 'No text found',
    scanAgain: 'Scan Again',
    // VIP / Other keys (Incoming)
    upgradeVIP: 'Upgrade VIP',
    unlockFeatures: 'Unlock recipes and calorie calculation',
    quickScan: 'Quick Scan',
    openCamera: 'Open Camera',
    selectAlbum: 'Select from Album',
    alerts: 'Alerts (CFS)',
    recent: 'Recent',
    ocrScan: 'OCR Scan',
    barcodeQrScan: 'Barcode/QR code Scan',
    barcodeScan: 'Barcode Scan',
    qrCodeScan: 'QR Code Scan',
    newsTitle: 'CFS News',
    recallNotice: 'Recall Notice',
    warning: 'Warning',
    productRecall: 'Product Recall',
    foodAlert: 'Food Alert',
    // Edit Page
    editScan: 'Edit Scan',
    itemName: 'Item Name',
    itemCode: 'Item Code',
    ocrResult: 'OCR Result',
    save: 'Save',
    return: 'Return',
    saving: 'Saving...',
    saveSuccess: 'Saved Successfully',
    saveError: 'Save Failed',
    searchPlaceholder: 'Search by Name or Code',
    // New Keys
    recentScans: 'Recent Scans',
    view: 'View',
    viewMoreHistory: 'View more in History',
    notFound: 'Not Found',
    productNotFound: 'Product not found in database.',
    error: 'Error',
    fetchError: 'Failed to fetch product data. Check connection.',
    cameraError: 'Failed to open camera.',
    deleteHistory: 'Delete History',
    deleteConfirm: 'Are you sure you want to remove this item from history?',
    cancel: 'Cancel',
    delete: 'Delete',
    noHistoryFound: 'No matching history found.',
    enterItemName: 'Please enter an item name',
    success: 'Success',
    connectError: 'Failed to connect to server',
    cameraPermissionBarcode: 'Camera permission is required to scan barcodes.',
    // Mock Data
    mockNews1Title: 'Prepackaged cookies sample found to contain undeclared allergen (peanut)',
    mockNews1Content: 'The Centre for Food Safety (CFS) calls on the public not to consume the affected batch.',
    mockNews2Title: 'Bottled preserved bean curd sample found with excessive Bacillus cereus',
    mockNews2Content: 'The CFS has ordered the vendor concerned to stop the sale and remove from shelves.',
    // News Details
    comments: 'Comments',
    noComments: 'No one has commented yet',
    writeComment: 'Write a comment...',
  },
  zh: {
    home: '首頁',
    scan: '掃描',
    info: '資訊',
    history: '歷史記錄',
    profile: '個人資料',
    homeScreen: '首頁畫面',
    scanScreen: '掃描畫面',
    infoScreen: '資訊畫面',
    historyScreen: '歷史記錄畫面',
    profileScreen: '個人資料畫面',
    // OCR / Scan keys (HEAD)
    scanMode: '掃描模式',
    ocrMode: '文字模式',
    permissionNeeded: '需要相機權限',
    grantPermission: '授予權限',
    scannedData: '掃描數據',
    tapToScanAgain: '點擊重新掃描',
    captureText: '拍攝文字',
    pickImage: '選擇圖片',
    processing: '處理中...',
    noTextFound: '未發現文字',
    scanAgain: '重新掃描',
    // VIP / Other keys (Incoming)
    upgradeVIP: '升級 VIP',
    unlockFeatures: '解鎖食譜推薦與卡路里計算',
    quickScan: '快速掃描',
    openCamera: '開啟相機',
    selectAlbum: '從相簿選擇',
    alerts: '食安警示 ( CFS )',
    recent: '最近掃描',
    ocrScan: 'OCR 掃描',
    barcodeQrScan: '條碼/二維碼掃描',
    barcodeScan: '條碼掃描',
    qrCodeScan: '二維碼掃描',
    newsTitle: '食物安全新聞',
    recallNotice: '回收通知',
    warning: '警示',
    productRecall: '產品回收',
    foodAlert: '食物警示',
    // Edit Page
    editScan: '編輯掃描',
    itemName: '物品名稱',
    itemCode: '物品代碼',
    ocrResult: 'OCR 結果',
    save: '保存',
    return: '返回',
    saving: '保存中...',
    saveSuccess: '保存成功',
    saveError: '保存失敗',
    searchPlaceholder: '按名稱或代碼搜索',
    // New Keys
    recentScans: '最近掃描',
    view: '查看',
    viewMoreHistory: '查看更多歷史記錄',
    notFound: '未找到',
    productNotFound: '數據庫中未找到產品。',
    error: '錯誤',
    fetchError: '無法獲取產品數據。請檢查連接。',
    cameraError: '無法打開相機。',
    deleteHistory: '刪除歷史記錄',
    deleteConfirm: '您確定要從歷史記錄中刪除此項目嗎？',
    cancel: '取消',
    delete: '刪除',
    noHistoryFound: '未找到匹配的歷史記錄。',
    enterItemName: '請輸入物品名稱',
    success: '成功',
    connectError: '無法連接到服務器',
    cameraPermissionBarcode: '掃描條碼需要相機權限。',
    // Mock Data
    mockNews1Title: '預先包裝曲奇樣本含有未標示致敏物（花生）',
    mockNews1Content: '食物安全中心（食安中心）呼籲市民不要食用受影響批次。',
    mockNews2Title: '瓶裝腐乳樣本被檢出含過量蠟樣芽孢桿菌',
    mockNews2Content: '食安中心已指令有關商戶停售及下架受影響產品。',
    // News Details
    comments: '評論',
    noComments: '暫無評論',
    writeComment: '寫下你的評論...',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'zh' : 'en'));
  };

  const i18n = translations[language];

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, i18n }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
