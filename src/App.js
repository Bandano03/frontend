import React, { useState } from 'react';
import './index.css';

export default function VideoEditorApp() {
  const [videos, setVideos] = useState([]);
  const [category, setCategory] = useState('edit');
  const [chat, setChat] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responseVideoUrl, setResponseVideoUrl] = useState(null);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    setVideos(files);
  };

  const handleSend = async () => {
    if (!chat.trim() || videos.length === 0) return;
    const newMessages = [...messages, { sender: 'Du', text: chat }];
    setMessages(newMessages);
    setChat('');
    setLoading(true);

    const formData = new FormData();
    videos.forEach((video) => formData.append('videos', video));
    formData.append('prompt', chat);
    formData.append('category', category);

    try {
      const res = await fetch('https://ki-video-backend.onrender.com/process', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      const kiAntwort = data.message || 'Video verarbeitet.';
      setMessages([...newMessages, { sender: 'KI', text: kiAntwort }]);
      if (data.video_url) setResponseVideoUrl(data.video_url);
    } catch (error) {
      setMessages([...newMessages, { sender: 'KI', text: '❌ Fehler bei der Verarbeitung.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>🎬 ViralCut – KI-Videoeditor</h1>
        <p>Erstelle virale Kurzvideos mit nur wenigen Klicks.</p>
      </header>

      <section className="upload-section">
        <h2>📁 Videos hochladen</h2>
        <input type="file" accept="video/mp4,video/webm,video/ogg,video/mov" multiple onChange={handleUpload} />
        {videos.length > 0 && (
          <ul>
            {videos.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="category-section">
        <h2>🎯 Kategorie auswählen</h2>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="edit">🎞️ Edit</option>
          <option value="tiktok">📱 TikTok</option>
          <option value="auto">🚗 Auto</option>
          <option value="werbung">💼 Werbung</option>
        </select>
      </section>

      <section className="chat-section">
        <h2>🧠 KI-Chatverlauf</h2>
        <div className="chat-log">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-msg ${msg.sender === 'Du' ? 'user' : 'ki'}`}>
              <strong>{msg.sender}:</strong> {msg.text}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={chat}
          onChange={(e) => setChat(e.target.value)}
          placeholder="Sag der KI, was gemacht werden soll..."
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? 'Verarbeite...' : 'Senden'}
        </button>
      </section>

      {responseVideoUrl && (
        <section className="result-section">
          <h2>🎥 Ergebnis</h2>
          <video src={responseVideoUrl} controls width="100%" />
          <a href={responseVideoUrl} download className="download-btn">⬇️ Herunterladen</a>
        </section>
      )}
    </div>
  );
}
