export const API_URL = "http://127.0.0.1:8000/api/results";

export default function DownloadButtons() {
  return (
    <div style={{ marginTop: "1rem", display:"flex", gap:"10px" }}>
      <a href={`${API_URL}/export`} target="_blank" rel="noopener noreferrer">
        <button>⬇️ CSV</button>
      </a>
    </div>
  );
}
