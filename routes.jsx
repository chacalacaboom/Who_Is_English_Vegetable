import React from 'react';
import { createBrowserRouter } from 'react-router';
import HomePage from './pages/HomePage';
import NewsPage from './pages/NewsPage';
import QuizPage from './pages/QuizPage';
import FlashcardPage from './pages/FlashcardPage';
import { LoginPage } from './pages/LoginPage';

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },        // 主頁
  { path: "/news", element: <NewsPage /> },    // 時事新聞
  { path: "/quiz", element: <QuizPage /> },    // 單字測驗
  { path: "/cards", element: <FlashcardPage /> }, // 單字卡
  { path: "/login", element: <LoginPage /> }, // 登入頁面
]);