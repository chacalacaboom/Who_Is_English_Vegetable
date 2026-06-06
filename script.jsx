// script.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { LanguageProvider } from './i18n/LanguageContext';
import './style.css'; // 確保你的樣式表有被引入

export default function App() {
  return (
    <LanguageProvider>
      {/* 💡 讓 RouterProvider 撐起全站路由，這樣內層的所有頁面（包含 LoginPage）才能正常使用 useNavigate */}
      <RouterProvider router={router} />
    </LanguageProvider>
  );
}

// 🎯 找到 HTML 裡的 div (id="root") 並將整個專案渲染進去
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);