import { useState } from "react";

export default function CSVUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Faqat CSV fayllar qabul qilinadi");
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Fayl tanlang");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("project_id", "default");

      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/analyze/upload-csv", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sessiya tugagan. Qaytadan kiring.");
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || "Yuklashda xatolik");
      }

      const data = await response.json();
      onUpload(data);
      setFile(null);
      document.getElementById("csv-file").value = "";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      marginTop: "20px",
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      backgroundColor: "#f9f9f9"
    }}>
      <h3>📁 CSV Fayl Yuklash</h3>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}>
        CSV faylda x, y, z ustunlari bo'lishi kerak. Har 3 ta qator uchun hisoblanadi.
      </p>
      
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <input
          id="csv-file"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            flex: 1
          }}
        />
        
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          style={{
            padding: "8px 16px",
            backgroundColor: file && !loading ? "#28a745" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: file && !loading ? "pointer" : "not-allowed"
          }}
        >
          {loading ? "⏳ Yuklanmoqda..." : "📤 Yuklash"}
        </button>
      </div>

      {error && (
        <div style={{
          color: "red",
          marginTop: "10px",
          padding: "10px",
          backgroundColor: "#ffe6e6",
          border: "1px solid #ffcccc",
          borderRadius: "4px"
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
