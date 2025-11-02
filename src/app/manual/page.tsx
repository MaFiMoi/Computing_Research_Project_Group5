"use client";
import { useState } from "react";

const scenarios = [
  {
    id: 1,
    title: "Scenario 1: Lottery Scam Call",
    question:
      "You receive a call saying you’ve won a new iPhone 17. The caller asks for your personal information to claim the prize. What should you do?",
    options: [
      "Provide your personal details immediately to claim the reward.",
      "Ask them to send an email so you can verify later.",
      "Verify the information through the official website, fanpage, or customer service hotline.",
    ],
    correct: 2,
    advice: [
      "Be cautious — many scam calls use fake prize announcements to steal personal data.",
      "Never share sensitive details like ID number, address, or bank info via phone.",
      "Always verify any promotion via the company’s official communication channels.",
    ],
    note: "Legitimate promotions never ask customers to pay fees or provide personal data to claim prizes.",
  },
  {
    id: 2,
    title: "Scenario 2: Bank Account Verification Scam",
    question:
      "You get a message claiming to be from your bank, asking you to click a link to verify your account due to suspicious activity. What’s the safest action?",
    options: [
      "Click the link immediately to secure your account.",
      "Ignore the message and contact your bank via official hotline.",
      "Reply to the message to confirm your identity.",
    ],
    correct: 1,
    advice: [
      "Banks never ask you to verify accounts via links in messages or emails.",
      "Fake links often lead to phishing websites that steal credentials.",
      "Always type your bank’s website address manually or call the hotline directly.",
    ],
    note: "Avoid clicking unknown links or downloading attachments from messages claiming to be urgent.",
  },
  {
    id: 3,
    title: "Scenario 3: Online Purchase Fraud",
    question:
      "You find an online store offering a product at half the market price. The seller asks for full payment upfront via bank transfer. What’s your response?",
    options: [
      "Proceed with payment to secure the great deal.",
      "Ask for payment upon delivery or use an escrow service.",
      "Send half the money first as a sign of trust.",
    ],
    correct: 1,
    advice: [
      "Extremely low prices are a red flag for online scams.",
      "Use secure payment methods and reputable platforms with buyer protection.",
      "Never transfer money directly to strangers or unofficial accounts.",
    ],
    note: "If it seems too good to be true, it probably is.",
  },
];

export default function SecurityManualPage() {
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const handleScenarioClick = (scenario: any) => {
    setSelectedScenario(scenario);
    setSelectedAnswer(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-trueGray-900 py-10">
      <div className="container mx-auto flex flex-col md:flex-row gap-8 px-4">
        {/* Sidebar */}
        <div className="md:w-1/4 bg-white dark:bg-trueGray-800 rounded-2xl shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4 text-indigo-600">Scenarios</h2>
          <ul className="space-y-3">
            {scenarios.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => handleScenarioClick(s)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    selectedScenario.id === s.id
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-gray-100 dark:hover:bg-trueGray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {s.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Content */}
        <div className="md:w-3/4 bg-white dark:bg-trueGray-800 rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-indigo-600 mb-4">
            {selectedScenario.title}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {selectedScenario.question}
          </p>

          <div className="space-y-2 mb-6">
            {selectedScenario.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center space-x-2 cursor-pointer p-2 rounded-md ${
                  selectedAnswer === index
                    ? "bg-indigo-50 dark:bg-trueGray-700"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  checked={selectedAnswer === index}
                  onChange={() => setSelectedAnswer(index)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-800 dark:text-gray-200">
                  {option}
                </span>
              </label>
            ))}
          </div>

          {selectedAnswer !== null && (
            <div
              className={`p-4 rounded-lg ${
                selectedAnswer === selectedScenario.correct
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {selectedAnswer === selectedScenario.correct
                ? "✅ Correct!"
                : "❌ Not quite right. Read the safety notes below."}
            </div>
          )}

          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold text-indigo-600 mb-2">
              Safety Tips:
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              {selectedScenario.advice.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
            <p className="mt-4 italic text-gray-600 dark:text-gray-400">
              {selectedScenario.note}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
