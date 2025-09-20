export default function ResultCard({ report }) {
  return (
    <div className="result">
      <h3>✅ Hisob Natijasi</h3>
      <p><strong>📐 Yo‘nalish (Strike):</strong> {report.strike.toFixed(2)}°</p>
      <p><strong>📏 Yotish Burchagi (Dip):</strong> {report.dip.toFixed(2)}°</p>
      <p><strong>🧭 Yotish Azimuti:</strong> {report.dip_direction.toFixed(2)}°</p>
      <div className="result-footer">
        Hisobot saqlandi: {new Date(report.created_at).toLocaleString()}
      </div>
    </div>
  );
}
