import React, { useState } from "react";

export default function VideoEditorApp() {
  const [videoFile, setVideoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("edit");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDownloadUrl("");
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile || message.trim() === "") return;

    const newEntry = { role: "user", content: message };
    setChatHistory([...chatHistory, newEntry]);
    setMessage("");
    setLoading(true);

    const fullInstruction = `Kategorie: ${category}\n${message}`;
    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("instruction", fullInstruction);

    try {
      const response = await fetch("https://ki-video-backend.onrender.com/edit-video/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Videoverarbeitung fehlgeschlagen");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setChatHistory((prev) => [...prev, { role: "assistant", content: "✅ Dein bearbeitetes Video ist bereit." }]);
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [...prev, { role: "assistant", content: "❌ Fehler bei der Verarbeitung." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#111", color: "#fff", padding: "2rem", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>🎬 KI-Videoschnitt App</h1>

      <input type="file" accept="video/*" onChange={handleVideoUpload} />
      <br /><br />

      <label>Kategorie wählen:</label><br />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="edit">🎞️ Edit</option>
        <option value="auto">🚗 Auto</option>
        <option value="vlog">📹 Vlog</option>
        <option value="comedy">😂 Comedy</option>
        <option value="tutorial">🎓 Tutorial</option>
        <option value="music">🎵 Musik</option>
        <option value="produkt">🛍️ Produkt</option>
      </select>
      <br /><br />

      {previewUrl && <video src={previewUrl} controls width="400" style={{ borderRadius: "1rem" }}></video>}
      <br />

      <form onSubmit={handleChatSubmit}>
        <label>Was soll die KI machen?</label><br />
        <textarea
          rows="3"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="z. B. Kürze auf 10 Sekunden, Text bei 5s: '🔥🔥🔥'"
          style={{ width: "100%", padding: "1rem", marginTop: "0.5rem" }}
        ></textarea>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Wird verarbeitet..." : "An KI senden"}
        </button>
      </form>

      {downloadUrl && (
        <div style={{ marginTop: "2rem" }}>
          <a href={downloadUrl} download="edited.mp4" style={{ color: "lime" }}>
            ✅ Video herunterladen
          </a>
        </div>
      )}

      {chatHistory.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3>🧠 KI-Chatverlauf</h3>
          <ul>
            {chatHistory.map((entry, i) => (
              <li key={i}>
                <strong>{entry.role === "user" ? "Du" : "KI"}:</strong> {entry.content}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
