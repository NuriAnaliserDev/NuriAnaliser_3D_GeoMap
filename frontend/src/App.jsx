import { useState, useEffect } from "react";
import "./styles.css";
import InputForm from "./components/InputForm";
import ResultCard from "./components/ResultCard";
import HistoryList from "./components/HistoryList";
import DownloadButtons from "./components/DownloadButtons";

export default function App() {
  const [history, setHistory] = useState([]);
  const [latestReport, setLatestReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("report_history");
    if (stored) setHistory(JSON.parse(stored));
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
      const response = await fetch("http://127.0.0.1:8000/api/analyze/three-point", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
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

  return (
    <div className="container">
      <h1>📊 3 Nuqta Hisoblash</h1>
      <div className="subtitle">NuriAnalyser — Geologik yordamchi</div>

      <InputForm onSubmit={handleGenerateReport} loading={loading} error={error} />
      {latestReport && <ResultCard report={latestReport} />}
      <DownloadButtons />
      <HistoryList history={history} />
    </div>
  );
}
