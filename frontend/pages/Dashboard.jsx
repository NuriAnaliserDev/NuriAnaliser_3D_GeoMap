import { useEffect, useState } from "react";
import { listProjects, createProject, getResults, exportResults } from "../api";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    async function load() {
      const p = await listProjects();
      setProjects(p.data);
      const r = await getResults();
      setResults(r.data);
    }
    load();
  }, []);

  async function handleCreate() {
    const name = prompt("Project name:");
    if (name) {
      await createProject({ name });
      window.location.reload();
    }
  }

  async function handleExport() {
    const res = await exportResults();
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "results.csv");
    document.body.appendChild(link);
    link.click();
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">📊 NuriSection Dashboard</h1>
      <button className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4" onClick={handleCreate}>
        + Yangi loyiha
      </button>
      <h2 className="mt-6 text-xl font-semibold">📂 Loyiha Tarixi</h2>
      <ul className="list-disc ml-6">
        {projects.map((p) => (
          <li key={p._id}>{p.name}</li>
        ))}
      </ul>

      <h2 className="mt-6 text-xl font-semibold">📜 Natijalar</h2>
      <table className="mt-2 border">
        <thead>
          <tr>
            <th>Strike</th>
            <th>Dip</th>
            <th>Yo'nalish</th>
            <th>Vaqt</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={i}>
              <td>{r.strike}</td>
              <td>{r.dip}</td>
              <td>{r.dip_direction}</td>
              <td>{new Date(r.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4" onClick={handleExport}>
        ⬇ CSV yuklash
      </button>
    </div>
  );
}
