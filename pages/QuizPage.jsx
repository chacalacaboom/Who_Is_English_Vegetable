import React, { useState } from 'react';
import { storageUtils } from '../utils/storage';

const mockQuestions = [
  { id: 1, word: "Resilient", options: ["韌性的", "脆弱的", "瘋狂的"], answer: "韌性的" },
  { id: 2, word: "Prosperity", options: ["貧窮", "繁榮", "災難"], answer: "繁榮" },
];

export default function QuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);

  const handleAnswer = (selected) => {
    const currentQ = mockQuestions[currentIndex];
    
    if (selected === currentQ.answer) {
      setScore(score + 1);
      alert("正確！");
    } else {
      alert("答錯了，這個單字會幫你加入單字卡！");
      // 自動呼叫你寫在 utils/storage.js 的功能
      storageUtils.addWord(currentQ.word); 
    }

    if (currentIndex < mockQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert(`測驗結束！你的得分是：${score + (selected === currentQ.answer ? 1 : 0)}`);
    }
  };

  const currentQ = mockQuestions[currentIndex];

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>單字挑戰 (第 {currentIndex + 1} 題)</h2>
      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px' }}>
        <h3>{currentQ.word}</h3>
        {currentQ.options.map(option => (
          <button 
            key={option} 
            onClick={() => handleAnswer(option)}
            style={{ display: 'block', width: '100%', margin: '10px 0', padding: '10px' }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}