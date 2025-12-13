import { useState } from "react";

function App() {
  const [topic, setTopic] = useState("");
  const [scenes, setScenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        durationMinutes: 1,
      }),
    });

    const data = await res.json();
    setScenes(data.scenes);
    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Story → Scenes Generator</h2>

      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter topic"
      />

      <button onClick={generate} disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </button>

      <pre>{JSON.stringify(scenes, null, 2)}</pre>
    </div>
  );
}

export default App;
