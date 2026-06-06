// firebase.js (直接放在根目錄)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC9bwRz9KuosnbVLSglPw9Kwlhko09GqNg",
  authDomain: "webprogramming-9d78d.firebaseapp.com",
  projectId: "webprogramming-9d78d",
  storageBucket: "webprogramming-9d78d.firebasestorage.app",
  messagingSenderId: "643716774053",
  appId: "1:643716774053:web:7d87ada8e7635df1e5b54c",
  measurementId: "G-4X7EH0VCZV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // 導出 auth 給登入頁面用