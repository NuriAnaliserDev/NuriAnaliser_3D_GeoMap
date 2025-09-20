export default function HistoryList({ history }) {
  if (!history.length) return null;

  return (
    <div className="result" style={{ marginTop: "24px" }}>
      <h3>📜 Tarix</h3>
      {history.map((item, idx) => (
        <div key={idx}>
          <p><strong>{item.created_at ? new Date(item.created_at).toLocaleString() : "???"}</strong></p>
          <p>
            Strike: {item.strike?.toFixed(2) ?? 0}°, 
            Dip: {item.dip?.toFixed(2) ?? 0}°, 
            Azimut: {item.dip_direction?.toFixed(2) ?? 0}°
          </p>
          <hr style={{ border: "0.5px solid rgba(255,255,255,0.1)" }} />
        </div>
      ))}
    </div>
  );
}
