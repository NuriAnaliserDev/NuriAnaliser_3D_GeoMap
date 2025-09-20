import { useState } from "react";

export default function InputForm({ onSubmit, loading, error }) {
  const [points, setPoints] = useState({
    p1: { x: "", y: "", z: "" },
    p2: { x: "", y: "", z: "" },
    p3: { x: "", y: "", z: "" },
  });

  const handleChange = (point, coord, value) => {
    setPoints((prev) => ({
      ...prev,
      [point]: {
        ...prev[point],
        [coord]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allValues = Object.values(points).flatMap((p) => [p.x, p.y, p.z]);
    if (allValues.some((v) => v === "")) {
      return alert("❌ Barcha nuqtalar to‘ldirilishi shart!");
    }

    const payload = [
      [Number(points.p1.x), Number(points.p1.y), Number(points.p1.z)],
      [Number(points.p2.x), Number(points.p2.y), Number(points.p2.z)],
      [Number(points.p3.x), Number(points.p3.y), Number(points.p3.z)],
    ];

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="inputs">
      {["p1", "p2", "p3"].map((p, idx) => (
        <div key={p} className="point-row">
          <div className="point-label">{idx === 0 ? "🧮" : "📍"} {p.toUpperCase()}</div>
          <input type="number" placeholder="X" value={points[p].x}
            onChange={(e) => handleChange(p, "x", e.target.value)} className="input" />
          <input type="number" placeholder="Y" value={points[p].y}
            onChange={(e) => handleChange(p, "y", e.target.value)} className="input" />
          <input type="number" placeholder="Z" value={points[p].z}
            onChange={(e) => handleChange(p, "z", e.target.value)} className="input" />
        </div>
      ))}

      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading} className="button">
        {loading ? "⏳ Hisoblanmoqda..." : "🔎 Hisoblash"}
      </button>
    </form>
  );
}
