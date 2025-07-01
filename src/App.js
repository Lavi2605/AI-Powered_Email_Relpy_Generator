import React, { useState } from "react";
import { FiMail, FiCopy, FiRefreshCw, FiSave } from "react-icons/fi";
import { Toaster, toast } from "react-hot-toast";
import clsx from "clsx";

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

function AnimatedDots() {
  return (
    <span className="inline-block ml-2">
      <span className="animate-bounce inline-block w-1 h-1 bg-indigo-500 rounded-full mr-1" style={{animationDelay: '0ms'}}></span>
      <span className="animate-bounce inline-block w-1 h-1 bg-indigo-500 rounded-full mr-1" style={{animationDelay: '100ms'}}></span>
      <span className="animate-bounce inline-block w-1 h-1 bg-indigo-500 rounded-full" style={{animationDelay: '200ms'}}></span>
    </span>
  );
}

function AnimatedBackground() {
  // Animated gradient and SVG blob
  return (
    <>
      <div className="fixed inset-0 -z-10 w-full h-full animate-gradient-move bg-gradient-to-br from-indigo-300 via-purple-200 to-pink-200" style={{backgroundSize: '200% 200%'}} />
      <svg className="fixed top-0 left-0 w-[60vw] h-[60vw] opacity-30 -z-10 animate-blob-move pointer-events-none select-none" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_f)"><path fill="#a5b4fc" d="M300 500c100 0 200-100 200-200S400 100 300 100 100 200 100 300s100 200 200 200z"/></g>
        <defs>
          <filter id="filter0_f" x="0" y="0" width="600" height="600" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="60" />
          </filter>
        </defs>
      </svg>
    </>
  );
}

function App() {
  const [emailInput, setEmailInput] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [generatedReply, setGeneratedReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [showDrafts, setShowDrafts] = useState(true);

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
      toast.success("Reply copied to clipboard!");
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleSaveDraft = () => {
    if (generatedReply) {
      setDrafts([...drafts, { reply: generatedReply, date: new Date().toLocaleString() }]);
      toast.success("Reply saved as draft!");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center p-4 sm:p-6 overflow-x-hidden">
      <AnimatedBackground />
      <Toaster position="top-right" />
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-10 mt-8 relative overflow-hidden animate-fade-in border border-indigo-100">
        <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none select-none">
          <FiMail size={160} />
        </div>
        <h1 className="text-4xl font-extrabold mb-2 text-indigo-700 flex items-center gap-3 drop-shadow-lg">
          <FiMail className="text-indigo-500 animate-float" size={36} />
          AI Email Reply Generator
        </h1>
        <p className="mb-6 text-gray-600 text-lg">Paste your email, select a tone, and generate a professional reply instantly.</p>
        <textarea
          rows="6"
          className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:outline-none transition mb-4 resize-none shadow-sm text-base bg-white/80 backdrop-blur placeholder-gray-400"
          placeholder="Paste your email here..."
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
        />
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="font-semibold text-gray-700">Tone:</label>
            <select
              className="p-2 border border-gray-200 rounded focus:ring-2 focus:ring-indigo-200 shadow-sm bg-white/80 backdrop-blur"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              {TONES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <button
            className={clsx(
              "flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl shadow hover:bg-indigo-700 transition-all duration-150 font-semibold",
              loading || !emailInput.trim() ? "opacity-50 cursor-not-allowed" : ""
            )}
            onClick={handleGenerate}
            disabled={loading || !emailInput.trim()}
          >
            {loading ? (
              <>
                Generating<AnimatedDots />
              </>
            ) : (
              <>
                <FiMail /> Generate Reply
              </>
            )}
          </button>
        </div>
        {error && (
          <div className="text-red-600 mb-2 animate-shake bg-red-50 border border-red-200 rounded p-2 text-center">
            {error}
          </div>
        )}
        {generatedReply && (
          <div className="bg-gray-50/90 mt-6 p-4 border border-indigo-200 rounded-2xl shadow-sm relative animate-fade-in">
            <h2 className="font-bold mb-2 text-indigo-700 text-lg flex items-center gap-2">
              <FiMail className="text-indigo-400" /> AI-Generated Reply:
            </h2>
            <p className="whitespace-pre-line text-gray-800 text-base transition-all duration-300 animate-slide-in">
              {generatedReply}
            </p>
            <div className="flex gap-2 mt-4">
              <button
                className="flex items-center gap-1 bg-blue-500 text-white px-4 py-1.5 rounded hover:bg-blue-600 transition shadow"
                onClick={handleCopy}
              >
                <FiCopy /> Copy
              </button>
              <button
                className="flex items-center gap-1 bg-yellow-500 text-white px-4 py-1.5 rounded hover:bg-yellow-600 transition shadow"
                onClick={handleRegenerate}
                disabled={loading}
              >
                <FiRefreshCw /> Regenerate
              </button>
              <button
                className="flex items-center gap-1 bg-green-500 text-white px-4 py-1.5 rounded hover:bg-green-600 transition shadow"
                onClick={handleSaveDraft}
              >
                <FiSave /> Save as Draft
              </button>
            </div>
          </div>
        )}
        <div className="mt-8">
          <button
            className="text-indigo-600 font-semibold underline mb-2 focus:outline-none"
            onClick={() => setShowDrafts((v) => !v)}
          >
            {showDrafts ? "Hide" : "Show"} Saved Drafts ({drafts.length})
          </button>
          {showDrafts && drafts.length > 0 && (
            <ul className="space-y-2 animate-fade-in">
              {drafts.map((draft, idx) => (
                <li key={idx} className="bg-white/90 border border-gray-200 rounded-xl p-3 shadow-sm transition-all duration-300 animate-slide-in">
                  <div className="text-gray-800 whitespace-pre-line text-base">{draft.reply}</div>
                  <div className="text-xs text-gray-400 mt-1">Saved: {draft.date}</div>
                </li>
              ))}
            </ul>
          )}
          {showDrafts && drafts.length === 0 && (
            <div className="text-gray-400 text-sm">No drafts saved yet.</div>
          )}
        </div>
      </div>
      <footer className="mt-8 text-gray-400 text-sm text-center animate-fade-in drop-shadow-lg">Made with <span className="text-red-400">❤️</span> using React & Tailwind CSS</footer>
      {/* Animations */}
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s ease; }
        .animate-slide-in { animation: slideIn 0.5s cubic-bezier(.4,2,.6,1) both; }
        .animate-float { animation: float 2.5s ease-in-out infinite alternate; }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        .animate-gradient-move { animation: gradientMove 8s ease-in-out infinite alternate; }
        .animate-blob-move { animation: blobMove 12s ease-in-out infinite alternate; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes float { from { transform: translateY(0); } to { transform: translateY(-10px); } }
        @keyframes shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-4px); } 40%, 60% { transform: translateX(4px); } }
        @keyframes gradientMove { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }
        @keyframes blobMove { 0% { transform: scale(1) translate(0,0); } 100% { transform: scale(1.1) translate(40px, 30px); } }
      `}</style>
    </div>
  );
}

export default App;
