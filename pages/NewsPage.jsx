import React from 'react';

export default function NewsPage() {
  const newsSources = [
    { name: 'CNN Business', url: 'https://edition.cnn.com/business', genre: 'Business' },
    { name: 'BBC Tech', url: 'https://www.bbc.com/news/technology', genre: 'Tech' },
    { name: 'The Guardian', url: 'https://www.theguardian.com/international', genre: 'World' },
  ];

  // 實作劃重點偵測
  const handleSelection = () => {
    const selectedText = window.getSelection().toString();
    if (selectedText.trim()) {
      const confirmSave = window.confirm(`是否將「${selectedText}」加入單字卡？`);
      if (confirmSave) {
        alert('已存入單字卡！');
        // 這裡之後會接 storageUtils.addWord(selectedText)
      }
    }
  };

  return (
    <div style={{ padding: '20px' }} onMouseUp={handleSelection}>
      <h2>時事新聞導覽</h2>
      <p style={{ color: 'gray' }}>提示：選取下方文字可試用「劃重點」功能</p>
      
      <ul style={{ lineHeight: '2' }}>
        {newsSources.map((news, index) => (
          <li key={index}>
            [{news.genre}] - 
            <a href={news.url} target="_blank" rel="noreferrer" style={{ marginLeft: '10px', color: '#3498db' }}>
              {news.name} (開啟外部連結)
            </a>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '30px', border: '1px solid #ccc', padding: '15px' }}>
        <h3>閱讀範文 (測試劃重點用)</h3>
        <p>Artificial Intelligence is transforming the global economy and creating new opportunities for innovation.</p>
      </div>
    </div>
  );
}