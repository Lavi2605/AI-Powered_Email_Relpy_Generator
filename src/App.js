import React, { useState } from "react";

const TONES = [
  "Formal",
  "Friendly",
  "Thankful",
  "Neutral",
  "Polite",
  "Concise",
  "Apologetic",
  "Encouraging",
];

// Hugging Face model endpoint (Zephyr-7B)
const HF_API_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta";

function App() {
  const [emailInput, setEmailInput] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [generatedReply, setGeneratedReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState([]);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setGeneratedReply("");
    try {
      const prompt = `Reply to the following email in a ${tone} tone:\n\n"${emailInput}"`;
      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.REACT_APP_HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      });
      const data = await response.json();
      console.log('Hugging Face API response:', data); // Debug log
      if (data.error) {
        setError(data.error);
      } else if (typeof data === 'string') {
        setGeneratedReply(data.trim());
      } else if (data[0]?.generated_text) {
        setGeneratedReply(data[0].generated_text.trim());
      } else {
        setError("No reply generated. Please try again.");
      }
    } catch (err) {
      setError("Error generating reply. Please check your API key and network.");
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (generatedReply) {
      navigator.clipboard.writeText(generatedReply);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleSaveDraft = () => {
    if (generatedReply) {
      setDrafts([...drafts, { reply: generatedReply, date: new Date().toLocaleString() }]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 mt-8">
        <h1 className="text-3xl font-bold mb-2 text-indigo-700 flex items-center gap-2">
          <span role="img" aria-label="email">📧</span> AI Email Reply Generator
        </h1>
        <p className="mb-6 text-gray-600">Paste your email, select a tone, and generate a professional reply instantly.</p>
        <textarea
          rows="6"
          className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-300 focus:outline-none transition mb-4 resize-none"
          placeholder="Paste your email here..."
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
        />
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="font-semibold text-gray-700">Tone:</label>
            <select
              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-200"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              {TONES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <button
            className="bg-indigo-600 text-white px-6 py-2 rounded shadow hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleGenerate}
            disabled={loading || !emailInput.trim()}
          >
            {loading ? "Generating..." : "Generate Reply"}
          </button>
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {generatedReply && (
          <div className="bg-gray-50 mt-6 p-4 border border-indigo-200 rounded-md shadow-sm relative">
            <h2 className="font-bold mb-2 text-indigo-700">AI-Generated Reply:</h2>
            <p className="whitespace-pre-line text-gray-800">{generatedReply}</p>
            <div className="flex gap-2 mt-4">
              <button
                className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition"
                onClick={handleCopy}
              >
                Copy
              </button>
              <button
                className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600 transition"
                onClick={handleRegenerate}
                disabled={loading}
              >
                Regenerate
              </button>
              <button
                className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition"
                onClick={handleSaveDraft}
              >
                Save as Draft
              </button>
            </div>
          </div>
        )}
        {drafts.length > 0 && (
          <div className="mt-8">
            <h3 className="font-semibold text-gray-700 mb-2">Saved Drafts</h3>
            <ul className="space-y-2">
              {drafts.map((draft, idx) => (
                <li key={idx} className="bg-white border border-gray-200 rounded p-3 shadow-sm">
                  <div className="text-gray-800 whitespace-pre-line">{draft.reply}</div>
                  <div className="text-xs text-gray-400 mt-1">Saved: {draft.date}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <footer className="mt-8 text-gray-400 text-sm">Made with ❤️ using React & Tailwind CSS</footer>
    </div>
  );
}

export default App;
