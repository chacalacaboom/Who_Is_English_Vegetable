import React from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../i18n/LanguageContext'; // 引入我們寫好的 Hook

export default function HomePage() {
  const navigate = useNavigate();
  const { t, toggleLang } = useLanguage(); // 拿出翻譯 t 和切換函數

  // 1. 定義選單資料陣列
  const menuItems = [
    { label: '單字測驗', path: '/quiz' },
    { label: '時事新聞', path: '/news' },
    { label: '製作單字卡', path: '/cards' },
    { label: '語言切換', path: '#' } // 語言切換通常是觸發一個 function，暫時用 #
  ];

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#2c3e50' }}>誰是菜英文 - 主選單</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px', 
        marginTop: '30px' 
      }}>
        {/* 2. 使用 map 遍歷陣列並生成按鈕 */}
        {menuItems.map((item, index) => (
          <button 
            key={index} 
            onClick={() => {
              if (item.path !== '#') {
                navigate(item.path); // 執行真正的跳轉
              } else {
                alert('切換語言功能開發中！');
              }
            }} 
            style={buttonStyle}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '20px',
  fontSize: '18px',
  cursor: 'pointer',
  backgroundColor: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '10px'
};