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
  },
  zh: {
    home: '主页',
    scan: '扫描',
    info: '信息',
    history: '历史记录',
    profile: '我的资料',
    homeScreen: '主页屏幕',
    scanScreen: '扫描屏幕',
    infoScreen: '信息屏幕',
    historyScreen: '历史记录屏幕',
    profileScreen: '我的资料屏幕',
    // OCR / Scan keys (HEAD)
    scanMode: '扫描模式',
    ocrMode: '文字模式',
    permissionNeeded: '需要相机权限',
    grantPermission: '授予权限',
    scannedData: '扫描数据',
    tapToScanAgain: '点击重新扫描',
    captureText: '拍摄文字',
    pickImage: '选择图片',
    processing: '处理中...',
    noTextFound: '未发现文字',
    scanAgain: '重新扫描',
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
