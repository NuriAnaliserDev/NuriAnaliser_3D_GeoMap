import { useState, useEffect } from "react";
import "./styles.css";
import InputForm from "./components/InputForm";
import ResultCard from "./components/ResultCard";
import HistoryList from "./components/HistoryList";
import DownloadButtons from "./components/DownloadButtons";
import LoginForm from "./components/LoginForm";
import Visualization3D from "./components/Visualization3D";
import CSVUpload from "./components/CSVUpload";

export default function App() {
  const [history, setHistory] = useState([]);
  const [latestReport, setLatestReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("report_history");
    if (stored) setHistory(JSON.parse(stored));
    
    // Auth holatini tekshirish
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    if (token && storedUsername) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
    }
  }, []);

  const saveToHistory = (report) => {
    const updated = [report, ...history];
    setHistory(updated);
    localStorage.setItem("report_history", JSON.stringify(updated));
  };

  const handleGenerateReport = async (pointsArray) => {
    setError("");
    setLoading(true);
    setLatestReport(null);

    // Backend uchun payload format
    const payload = {
      project_id: "default",
      points: pointsArray.map(([x, y, z]) => ({ x, y, z }))
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/analyze/three-point", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token eskirgan, logout qilish
          handleLogout();
          throw new Error("Sessiya tugagan. Qaytadan kiring.");
        }
        throw new Error(`Backend xatolik qaytardi! Status: ${response.status}`);
      }

      const data = await response.json();
      setLatestReport(data);
      saveToHistory(data);
    } catch (err) {
      console.error(err);
      setError("Xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (data) => {
    setIsAuthenticated(true);
    setUsername(localStorage.getItem("username"));
  };

  const handleRegister = (data) => {
    setIsAuthenticated(true);
    setUsername(localStorage.getItem("username"));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    setUsername("");
    setLatestReport(null);
    setHistory([]);
  };

  const handleCSVUpload = (data) => {
    // CSV yuklash natijalarini ko'rsatish
    if (data.results && data.results.length > 0) {
      const latestResult = data.results[0];
      setLatestReport(latestResult);
      saveToHistory(latestResult);
    }
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1>📊 3 Nuqta Hisoblash</h1>
          <div className="subtitle">NuriAnalyser — Geologik yordamchi</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>👤 {username}</span>
          <button 
            onClick={handleLogout}
            style={{
              padding: "5px 10px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Chiqish
          </button>
        </div>
      </div>

      <InputForm onSubmit={handleGenerateReport} loading={loading} error={error} />
      <CSVUpload onUpload={handleCSVUpload} />
      {latestReport && <ResultCard report={latestReport} />}
      
      {/* 3D Visualization */}
      <div style={{ marginTop: "20px" }}>
        <h3>🎯 3D Vizualizatsiya</h3>
        <Visualization3D 
          points={latestReport ? [
            { x: 0, y: 0, z: 0 },
            { x: 1, y: 0, z: 0 },
            { x: 0, y: 1, z: 0 }
          ] : null}
          strike={latestReport?.strike}
          dip={latestReport?.dip}
          dipDirection={latestReport?.dip_direction}
        />
      </div>
      
      <DownloadButtons />
      <HistoryList history={history} />
    </div>
  );
}
