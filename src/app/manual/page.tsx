"use client";
import React, { useState } from "react";

// --- TypeScript Interfaces ---
interface Scenario {
  id: number;
  title: string; // Full title for content area
  shortTitle: string; // Short title for the sidebar
  question: string;
  options: string[];
  correct: number;
  advice: string[];
  note: string;
}

interface ScenarioCategory {
  id: string;
  title: string; // Category Title
  scenarios: Scenario[];
}

// --- Data: 2 Categories, 5 Scenarios Each ---
const categoriesData: ScenarioCategory[] = [
  {
    id: "phone-sms",
    title: "Phone & SMS Scams",
    scenarios: [
      {
        id: 101,
        title: "Scenario 1: The Lottery Scam Call",
        shortTitle: "Lottery Scam Call",
        question:
          "You receive a call saying you’ve won a new iPhone. The caller asks for your personal information to claim the prize. What should you do?",
        options: [
          "Provide your personal details immediately to claim the reward.",
          "Ask them to send an email so you can verify later.",
          "Verify the information through the official website, fanpage, or customer service hotline.",
        ],
        correct: 2,
        advice: [
          "Be cautious — many scam calls use fake prize announcements to steal personal data.",
          "Never share sensitive details like ID number, address, or bank info via phone.",
        ],
        note: "Legitimate promotions never ask customers to pay fees or provide sensitive personal data to claim prizes.",
      },
      {
        id: 102,
        title: "Scenario 2: The Package Delivery Scam",
        shortTitle: "Package Delivery Scam",
        question:
          "You receive an SMS stating 'Your package is stuck at the warehouse' and requires you to pay a small fee via a strange link to resume delivery. What do you do?",
        options: [
          "Pay the fee immediately; it's a small amount, and it might be a real package.",
          "Click the link to see what the package is before deciding.",
          "Do not click the link. Check any tracking numbers on the official shipping company's website directly.",
        ],
        correct: 2,
        advice: [
          "Scammers use a small fee to lower your guard. Their real goal is to steal your credit card information.",
          "Major shipping companies do not demand extra fees via strange links in SMS.",
        ],
        note: "This is a very common Phishing scam via SMS, also known as 'Smishing'.",
      },
      {
        id: 103,
        title: "Scenario 3: The Fake Police/Govt. Call",
        shortTitle: "Fake Police Call",
        question:
          "You get a call from someone claiming to be a police officer, saying you have an outstanding fine and must pay immediately via bank transfer to avoid arrest. What is your reaction?",
        options: [
          "Transfer the money immediately to resolve the issue.",
          "Hang up. Verify the claim by calling the local police department's official, public phone number.",
          "Ask them for their badge number to prove they are real.",
        ],
        correct: 1,
        advice: [
          "Government agencies and police departments will never demand payment for fines over the phone, especially not via direct bank transfer.",
          "This is a high-pressure tactic designed to make you panic and act illogically.",
        ],
        note: "Always verify such serious claims through official, public channels. Never use a phone number provided by the caller.",
      },
      {
        id: 104,
        title: "Scenario 4: The 'Easy Loan' SMS",
        shortTitle: "Easy Loan SMS",
        question:
          "You receive an SMS offering a pre-approved, high-limit loan with '0% interest'. It just asks you to click a link and fill in your bank details to 'get the cash'. What do you do?",
        options: [
          "Click the link; it's a great opportunity to get cash easily.",
          "Ignore and delete the message. Reputable lenders do not operate this way.",
          "Reply 'STOP' to unsubscribe from the offer.",
        ],
        correct: 1,
        advice: [
          "These 'easy loan' offers are almost always scams to steal your bank login credentials or personal identity.",
          "Unsolicited financial offers via SMS are a major red flag.",
        ],
        note: "Never provide sensitive financial information through a link sent in an unsolicited text message.",
      },
      {
        id: 105,
        title: "Scenario 5: The SIM Card Upgrade Scam",
        shortTitle: "SIM Card Upgrade Scam",
        question:
          "Your phone provider supposedly calls, offering a 'free 5G SIM upgrade'. They ask you to read back the verification code (OTP) they just sent you to confirm the upgrade. What's the danger?",
        options: [
          "Read them the code; it's just to confirm my phone number for the upgrade.",
          "Ask them to confirm my account balance first before I give them the code.",
          "Hang up. This is likely a SIM swap attack; they are trying to steal my phone number.",
        ],
        correct: 2,
        advice: [
          "This is a classic 'SIM Swap' attack. If they get the OTP, they can transfer your phone number to their own SIM card.",
          "Once they control your number, they can reset passwords for your bank accounts, emails, and social media.",
        ],
        note: "NEVER, under any circumstances, share an OTP (One-Time Password) sent to your phone with anyone who calls you.",
      },
    ],
  },
  {
    id: "web-email",
    title: "Email & Web Phishing",
    scenarios: [
      {
        id: 201,
        title: "Scenario 1: The Bank Verification Scam",
        shortTitle: "Bank Verification Email",
        question:
          "You get an email claiming to be from your bank, asking you to click a link to 'verify your account' due to suspicious activity. What’s the safest action?",
        options: [
          "Click the link immediately to secure your account.",
          "Ignore the email and contact your bank via its official hotline (on your card or website).",
          "Reply to the email to confirm your identity.",
        ],
        correct: 1,
        advice: [
          "Banks never ask you to verify accounts via links in messages or emails.",
          "Fake links often lead to phishing websites designed to steal your login credentials.",
        ],
        note: "Always type your bank’s website address manually or call the hotline directly.",
      },
      {
        id: 202,
        title: "Scenario 2: The Online Purchase Fraud",
        shortTitle: "Online Purchase Fraud",
        question:
          "You find an online store (e.g., on social media) offering a product at half the market price. The seller asks for full payment upfront via bank transfer. What’s your response?",
        options: [
          "Proceed with payment to secure the great deal.",
          "Ask for payment upon delivery (COD) or use a secure escrow service.",
          "Send half the money first as a sign of trust.",
        ],
        correct: 1,
        advice: [
          "Extremely low prices are a major red flag for online scams.",
          "Use secure payment methods and reputable platforms that offer buyer protection.",
        ],
        note: "If it seems too good to be true, it probably is.",
      },
      {
        id: 203,
        title: "Scenario 3: The Fake IT Support Scam",
        shortTitle: "Fake IT Support",
        question:
          "A pop-up appears on your computer claiming 'IT Support' has detected a virus. It asks you to call a number or grant remote access to 'fix it'. What should you do?",
        options: [
          "Follow their instructions immediately to prevent data loss.",
          "Shut down the computer and restart it. If the pop-up persists, contact a trusted local technician.",
          "Grant them access; they are trying to help.",
        ],
        correct: 1,
        advice: [
          "Legitimate IT Support (like Microsoft or Apple) will not use a browser pop-up to alert you to a virus.",
          "Granting remote access gives scammers full control of your computer.",
        ],
        note: "Never grant remote access to your device to anyone from an unsolicited pop-up or call.",
      },
      {
        id: 204,
        title: "Scenario 4: The Fake Job Offer",
        shortTitle: "Fake Job Offer",
        question:
          "You receive an email with a vague but high-paying job offer ('Data Entry', 'Package Manager'). They ask you to pay a 'small processing fee' or 'buy equipment' to start. What's the catch?",
        options: [
          "Pay the fee; it's a small investment for a good job.",
          "This is a scam. A legitimate employer will never ask you to pay them to get a job.",
          "Ask for a contract first before paying the fee.",
        ],
        correct: 1,
        advice: [
          "No real job requires you to pay an application fee, processing fee, or background check fee upfront.",
          "They may also be trying to steal your identity with the 'application form'.",
        ],
        note: "Legitimate employers pay you, not the other way around.",
      },
      {
        id: 205,
        title: "Scenario 5: The 'Account Suspended' Phish",
        shortTitle: "'Account Suspended' Phish",
        question:
          "You get an email from 'Netflix' (or Spotify/Amazon) saying 'Your account is suspended due to a payment issue'. It asks you to 'click here to update your payment details'. What do you check?",
        options: [
          "The sender's email address. If it's not from '@netflix.com', it's fake.",
          "The link address (by hovering over it). If it doesn't go to 'netflix.com', it's fake.",
          "Both A and B are correct and essential checks.",
        ],
        correct: 2,
        advice: [
          "Always check the sender's full email address (not just the display name).",
          "Always hover your mouse over any link *before* clicking to see the real destination URL in the corner of your browser.",
        ],
        note: "When in doubt, log in to your account *manually* (by typing the address yourself) to check for any notifications.",
      },
    ],
  },
];

// --- Main Component ---
export default function SecurityManualPage() {
  // State for active category
  const [activeCategory, setActiveCategory] = useState<ScenarioCategory>(
    categoriesData[0]
  );
  // State for active scenario
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(
    categoriesData[0].scenarios[0]
  );
  // State for selected answer
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // --- Event Handlers ---

  // Handles clicking a scenario in the sidebar
  const handleScenarioClick = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setSelectedAnswer(null); // Reset answer when changing scenarios
  };

  // Handles selecting a radio button answer
  const handleAnswerChange = (index: number) => {
    setSelectedAnswer(index);
  };

  // Handles clicking a category title in the sidebar
  const handleCategoryClick = (category: ScenarioCategory) => {
    setActiveCategory(category);
    // Automatically select the first scenario of that category
    setSelectedScenario(category.scenarios[0]);
    setSelectedAnswer(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 font-sans">
      <div className="container mx-auto flex flex-col md:flex-row gap-8 px-4">
        
        {/* --- Sidebar (Categorized) --- */}
        <div className="md:w-1/4 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 h-fit sticky top-10">
          {categoriesData.map((category) => (
            <div key={category.id} className="mb-4">
              {/* Category Title */}
              <h2
                className={`text-xl font-semibold mb-3 p-2 rounded-lg cursor-pointer transition ${
                  activeCategory.id === category.id
                    ? "text-indigo-600"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                {category.title}
              </h2>
              
              {/* Scenarios (only shown for active category) */}
              {activeCategory.id === category.id && (
                <ul className="space-y-2 pl-3 border-l-2 border-indigo-100 dark:border-gray-700">
                  {category.scenarios.map((s) => (
                    <li key={s.id}>
                      <button
                        onClick={() => handleScenarioClick(s)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
                          selectedScenario.id === s.id
                            ? "bg-indigo-600 text-white font-semibold shadow-md"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {s.shortTitle} {/* Using short title for sidebar */}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* --- Content Area --- */}
        <div className="md:w-3/4 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
          {/* Question Title */}
          <h2 className="text-2xl font-bold text-indigo-600 mb-4">
            {selectedScenario.title} {/* Using full title for content */}
          </h2>
          {/* Question Text */}
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            {selectedScenario.question}
          </p>

          {/* Options (Radio buttons) */}
          <div className="space-y-3 mb-6">
            {selectedScenario.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center space-x-3 cursor-pointer p-4 rounded-lg border transition ${
                  selectedAnswer === index
                    ? "bg-indigo-50 border-indigo-400 dark:bg-gray-700"
                    : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                }
                
                {/* Highlight correct/incorrect after selection */}
                ${selectedAnswer !== null && index === selectedScenario.correct ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700' : ''}
                ${selectedAnswer !== null && selectedAnswer === index && index !== selectedScenario.correct ? 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-700' : ''}
                `}
              >
                <input
                  type="radio"
                  name="answer"
                  checked={selectedAnswer === index}
                  onChange={() => handleAnswerChange(index)}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-800 dark:text-gray-200">
                  {option}
                </span>
              </label>
            ))}
          </div>

          {/* Feedback - Shows when an answer is selected */}
          {selectedAnswer !== null && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                selectedAnswer === selectedScenario.correct
                  ? "bg-green-100 text-green-800 border-l-4 border-green-600"
                  : "bg-red-100 text-red-800 border-l-4 border-red-600"
              }`}
            >
              <p className="font-bold text-lg">
                {selectedAnswer === selectedScenario.correct
                  ? "✅ Correct!"
                  : "❌ Not quite right. Please see the advice below."}
              </p>
            </div>
          )}

          {/* Advice & Note */}
          <div className="mt-6 border-t dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-indigo-600 mb-2">
              Prevention Tips (Internet & Phone):
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              {selectedScenario.advice.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
            <p className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg italic dark:bg-yellow-900/20 dark:text-yellow-200">
              <strong>Important Note:</strong> {selectedScenario.note}
            </p>
          </div>
        </div>
      </div>

      {/* --- Footer (Contact Info) --- */}
      <footer className="container mx-auto mt-12 pt-8 pb-6 border-t border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Contact For Assistance
        </h3>
        <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-10">
          <p className="text-base">
            <strong>Phone:</strong> (028) 3812 3456
          </p>
          <p className="text-base">
            <strong>Email:</strong> support@yourcompany.com
          </p>
          <p className="text-base">
            <strong>Address:</strong> 123 Security St, District 1, HCMC
          </p>
        </div>
        <p className="mt-8 text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Your Company. All rights reserved.
        </p>
      </footer>
      {/* --- End of Footer --- */}

    </div>
  );
}
