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
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white font-sans p-4 md:p-10">
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">🎬 ViralCut – KI-Videoeditor</h1>
        <p className="text-zinc-400 text-lg">Erstelle virale Kurzvideos mit nur wenigen Klicks</p>
      </header>

      <div className="grid gap-8 max-w-3xl mx-auto">
        <section className="bg-zinc-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-2">📁 Videos hochladen</h2>
          <input type="file" accept="video/*" multiple onChange={handleUpload} className="block w-full bg-zinc-700 text-white rounded-lg p-2" />
          {videos.length > 0 && (
            <ul className="mt-2 text-sm text-zinc-300">
              {videos.map((file, idx) => (
                <li key={idx}>• {file.name}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-zinc-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-2">🎯 Kategorie auswählen</h2>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-zinc-700 text-white p-2 rounded-md w-full"
          >
            <option value="edit">🎞️ Edit</option>
            <option value="tiktok">📱 TikTok</option>
            <option value="auto">🚗 Auto</option>
            <option value="werbung">💼 Werbung</option>
          </select>
        </section>

        <section className="bg-zinc-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">🧠 KI-Chat</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {messages.map((m, i) => (
              <div key={i} className="text-sm">
                <strong className="text-purple-300">{m.sender}:</strong> {m.text}
              </div>
            ))}
          </div>
          <div className="flex mt-4">
            <input
              type="text"
              value={chat}
              onChange={(e) => setChat(e.target.value)}
              placeholder="Sag der KI, was gemacht werden soll..."
              className="flex-1 p-2 rounded-l-lg bg-zinc-700 text-white"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 transition px-4 rounded-r-lg"
            >
              {loading ? '⏳' : 'Senden'}
            </button>
          </div>
        </section>

        {responseVideoUrl && (
          <section className="bg-zinc-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-2">🎥 Ergebnis</h2>
            <video src={responseVideoUrl} controls className="w-full rounded-lg" />
            <a
              href={responseVideoUrl}
              download
              className="block mt-4 text-center bg-purple-500 hover:bg-purple-600 transition py-2 rounded-lg"
            >
              ⬇️ Herunterladen
            </a>
          </section>
        )}
      </div>
    </div>
  );
}
