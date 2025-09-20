import { useState } from "react";

export const API_URL = "http://127.0.0.1:8000/api/results";

export default function DownloadButtons() {
  const [loading, setLoading] = useState(null);

  const handleDownload = async (format) => {
    setLoading(format);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/export/${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `results.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Yuklab olishda xatolik yuz berdi');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ marginTop: "1rem", display:"flex", gap:"10px" }}>
      <button 
        onClick={() => handleDownload('csv')} 
        disabled={loading === 'csv'}
        style={{ 
          padding: '8px 16px', 
          backgroundColor: '#4CAF50', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: loading === 'csv' ? 'not-allowed' : 'pointer'
        }}
      >
        {loading === 'csv' ? '⏳' : '⬇️'} CSV
      </button>
      
      <button 
        onClick={() => handleDownload('json')} 
        disabled={loading === 'json'}
        style={{ 
          padding: '8px 16px', 
          backgroundColor: '#2196F3', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: loading === 'json' ? 'not-allowed' : 'pointer'
        }}
      >
        {loading === 'json' ? '⏳' : '⬇️'} JSON
      </button>
      
      <button 
        onClick={() => handleDownload('pdf')} 
        disabled={loading === 'pdf'}
        style={{ 
          padding: '8px 16px', 
          backgroundColor: '#f44336', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: loading === 'pdf' ? 'not-allowed' : 'pointer'
        }}
      >
        {loading === 'pdf' ? '⏳' : '⬇️'} PDF
      </button>
    </div>
  );
}
