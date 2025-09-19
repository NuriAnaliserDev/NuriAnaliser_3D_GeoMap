export default function ResultCard({ report }) {
  if (!report) return null;

  const strike = report.strike ?? 0;
  const dip = report.dip ?? 0;
  const dipDirection = report.dip_direction ?? 0;

  return (
    <div className="result">
      <h3>✅ Hisob Natijasi</h3>
      <p><strong>📐 Yo‘nalish (Strike):</strong> {strike.toFixed(2)}°</p>
      <p><strong>📏 Yotish Burchagi (Dip):</strong> {dip.toFixed(2)}°</p>
      <p><strong>🧭 Yotish Azimuti:</strong> {dipDirection.toFixed(2)}°</p>
      <div className="result-footer">
        Hisobot saqlandi: {report.timestamp
          ? new Date(report.timestamp).toLocaleString()
          : "Noma’lum vaqt"}
      </div>
    </div>
  );
}
