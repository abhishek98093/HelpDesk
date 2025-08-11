const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
import React, { useState } from "react";

function Track() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [personnel, setPersonnel] = useState(null);

  const handleTrack = async () => {
    setError("");
    setStatus(null);

    if (!email || !code) {
      setError("Please enter both email and ticket ID.");
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/complaints/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus(data.status);
        if (data.personnel) {
          setPersonnel(data.personnel);
        } else {
          setPersonnel(null);
        }
      }
      
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching status.");
    }
  };

  return (
    <main className="flex-grow mx-auto px-4 sm:px-6 lg:px-8 py-24"> 
    <div className="max-w-xl mx-auto p-8 bg-gray-800 rounded-2xl shadow-lg mt-10">
      <h2 className="text-3xl font-bold text-center text-white mb-6">Track Your Ticket</h2>
      <div className="space-y-4">
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-600 text-white"
        />
        <input
          type="text"
          placeholder="Ticket ID"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-600 text-white"
        />
        <button
          onClick={handleTrack}
          className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold"
        >
          Track Ticket
        </button>

        {status && (
          <div className="mt-4 text-lg text-white text-center">
            <strong>Status:</strong> <span className="text-indigo-400">{status}</span>
          </div>
        )}
        {personnel && (
          <div className="mt-2 text-white text-center">
            <p><strong>Assigned To:</strong> {personnel.name}</p>
            <p><strong>Contact:</strong> {personnel.contact}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-500 text-center font-medium">{error}</div>
        )}
      </div>
    </div>
    </main>
  );
}

export default Track;
