"use client";
import { useState } from "react";

export default function ReportPage() {
  const [email, setEmail] = useState("");
  const [site, setSite] = useState("");
  const [type, setType] = useState("");
  const [evidence, setEvidence] = useState("");
  const [agree, setAgree] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    alert("✅ Thank you for your report! Our system will review it shortly.");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-trueGray-900 py-10">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 px-4">
        {/* Report Form */}
        <div className="bg-white dark:bg-trueGray-800 shadow-md rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-indigo-600 mb-6 uppercase">
            Report a Scam
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Your Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-400 dark:bg-trueGray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Website / Phone / Email to Report
              </label>
              <input
                type="text"
                required
                value={site}
                onChange={(e) => setSite(e.target.value)}
                placeholder="https://example.com or +84912345678"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-400 dark:bg-trueGray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Scam Category
              </label>
              <select
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-400 dark:bg-trueGray-900 dark:text-white"
              >
                <option value="">Select a category</option>
                <option>Fake Shopping Site</option>
                <option>Phishing Call / SMS</option>
                <option>Investment / Crypto Scam</option>
                <option>Romance Scam</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Provide Evidence (optional)
              </label>
              <textarea
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="Describe what happened or include scam message details..."
                rows={4}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-400 dark:bg-trueGray-900 dark:text-white"
              />
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.gif"
                className="mt-2 text-sm text-gray-600 dark:text-gray-400"
              />
            </div>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={agree}
                onChange={() => setAgree(!agree)}
                required
              />
              <span className="text-sm">
                I have read and agree with the reporting terms.
              </span>
            </label>

            <button
              type="submit"
              disabled={!agree}
              className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition font-semibold"
            >
              Submit Report
            </button>
          </form>

          <div className="mt-6 border-t pt-4 text-sm text-gray-500 dark:text-gray-300">
            <p>Submit reports also via:</p>
            <ul className="mt-2 space-y-1">
              <li>• Vietnam’s National Cybersecurity Association</li>
              <li>• Microsoft Security Intelligence</li>
              <li>• Google Safe Browsing</li>
              <li>• Anti-Phishing Working Group</li>
            </ul>
          </div>
        </div>

        {/* Information Panel */}
        <div>
          <h2 className="text-2xl font-bold text-indigo-600 mb-4 uppercase">
            Reporting Guidelines
          </h2>

          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-red-600 mb-1">⚠️ Notice</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Please avoid reporting adult or gambling websites — these are
              already classified as violating local laws. Our system focuses on
              scams targeting users’ data or money.
            </p>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-600 mb-1">
              ✅ Important Information
            </h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>
                Read our terms and verify the website’s legality before
                reporting.
              </li>
              <li>
                We use your reports to update scam databases and notify browser
                and cybersecurity partners (Google, Microsoft, etc.).
              </li>
              <li>
                If the site poses a real threat, it will be blocked across major
                browsers and DNS providers.
              </li>
              <li>
                If you believe a legitimate site was flagged incorrectly, please
                appeal via our contact form.
              </li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-indigo-600 mt-10 mb-4 uppercase">
            🏆 Reporter Rankings
          </h2>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-indigo-600 text-white p-6 rounded-lg text-center shadow-md">
              <h3 className="text-lg font-semibold">🥇 Top Reporter</h3>
              <p className="text-2xl font-bold mt-2">hi***s</p>
            </div>
            <div className="bg-indigo-500 text-white p-6 rounded-lg text-center shadow-md">
              <h3 className="text-lg font-semibold">🥈 2nd Place</h3>
              <p className="text-2xl font-bold mt-2">hu***5</p>
            </div>
            <div className="bg-indigo-400 text-white p-6 rounded-lg text-center shadow-md">
              <h3 className="text-lg font-semibold">🥉 3rd Place</h3>
              <p className="text-2xl font-bold mt-2">bt***g</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-center">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Confirmed Reports
              </h3>
              <p className="text-3xl font-bold text-indigo-600 mt-2">2,127</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Pending Reviews
              </h3>
              <p className="text-3xl font-bold text-indigo-600 mt-2">9,581</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
