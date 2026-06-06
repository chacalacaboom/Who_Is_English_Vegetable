// pages/LoginPage.jsx
import React, { useState } from 'react';
import { auth } from '../firebase'; // 往上一層去抓根目錄的 firebase.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router";

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); 

  // 💡 1. 註冊行為
  const handleSignUp = () => {
    console.log('準備註冊新帳號！', { email, password });

    if (!email || !password) {
      alert("請輸入信箱與密碼");
      return;
    }
    
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Firebase 回傳註冊成功：", userCredential.user);
        alert("帳號註冊成功！");
      })
      .catch((error) => {
        console.error("Firebase 回傳註冊失敗：", error.code, error.message);
        alert("註冊失敗：" + error.message);
      });
  };

  // 💡 2. 登入行為（補上你原本漏掉的登入功能）
  const handleLogin = () => {
    console.log('準備登入！', { email, password });

    if (!email || !password) {
      alert("請輸入信箱與密碼");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Firebase 回傳登入成功：", userCredential.user);
        alert("登入成功！");
        navigate('/');
      })
      .catch((error) => {
        console.error("Firebase 回傳登入失敗：", error.message);
        alert("登入失敗：帳密錯誤或帳號不存在");
      });
  };

  return (
    <div className="wrap">
      <h2>請選擇註冊或是登入</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        
        <label htmlFor="email">請輸入信箱</label>
        <input 
          type="email" 
          className="email" 
          placeholder="請輸入信箱" 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
        />
        <br />
        
        <label htmlFor="password">請輸入密碼</label>
        <input 
          type="password" 
          className="password" 
          placeholder="請輸入密碼" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        
        <div id="btn">
          {/* 正確綁定上面寫好的兩個行為 */}
          <input type="button" value="註冊" className="signUp" onClick={handleSignUp} />
          <input type="button" value="登入" className="logIn" onClick={handleLogin} />
        </div>

      </form>
    </div>
  );
}