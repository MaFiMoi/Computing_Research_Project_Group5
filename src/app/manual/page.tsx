/**
 * Cyber Security Manual - Final English Version
 * Updated to match standard Tailwind Gray Dark Mode
 */
"use client";
import { useState, useMemo } from "react";

// --- 1. INTERFACE DEFINITION (TypeScript) ---
interface Scenario {
  id: number;
  shortTitle: string;
  question: string;
  options: string[];
  correct: number;
  advice: string[];
  note: string;
  videoUrl?: string;
}

interface Category {
  id: string;
  title: string;
  scenarios: Scenario[];
}

// --- 2. SCENARIO DATA (ENGLISH) ---
const categoriesData: Category[] = [
  {
    id: "social-web",
    title: "Social Media & Web Scams",
    scenarios: [
      {
        id: 101,
        shortTitle: "AI Photo Scam",
        question:
          "You see friends using an AI app to create photos with celebrities. A friend sends you a link inviting you to use the app. What is your safest action?",
        options: [
          "Click the link immediately to 'follow the trend.'",
          "Only use it on a computer to prevent data loss on your phone.",
          "Do not click the link. Research the app, check its publisher and required permissions before installation.",
        ],
        correct: 2,
        advice: [
          "Social media trends are often exploited by scammers to distribute malicious links or apps.",
          "Apps requiring excessive permissions (like accessing contacts or storage) are high-risk.",
          "Only download apps from official stores (App Store, Google Play) and verify the developer's credibility.",
        ],
        note: "Never trust links shared solely for trending topics. Always verify the source.",
        videoUrl: "https://www.youtube.com/embed/5D3oQp2h9L8",
      },
      {
        id: 102,
        shortTitle: "Free Concert Tickets",
        question:
          "A fan page announces free concert tickets. To receive them, you must click a link and provide your full name, phone number, ID card number (CCCD), and address. The tickets are limited to the first 30 sign-ups. What should you do?",
        options: [
          "Register immediately to secure the free tickets.",
          "Send it to friends for their opinion.",
          "Thoroughly check if the fan page is official. Absolutely refuse to enter sensitive information (like ID number) until the source is verified.",
        ],
        correct: 2,
        advice: [
          "Legitimate ticket offers rarely ask for sensitive government IDs (CCCD) or bank details.",
          "Scammers use urgency ('only 30 spots') to pressure you into acting without thinking.",
          "Always verify promotions directly on the artist's official website or main promoter's channel.",
        ],
        note: "High-value rewards with minimal effort are usually a scam.",
      },
      {
        id: 103,
        shortTitle: "Year-end Investment",
        question:
          "You see an ad for a 'Year-end Investment Opportunity' promising up to 30% monthly profit if you download their app. The app looks professional and offers 24/7 consulting. You are looking for an investment channel. What is your safest response?",
        options: [
          "Download the app and deposit money immediately to seize the opportunity.",
          "Message the consultant to ask for more details.",
          "Ignore the ad, do not download the app, and research official, licensed investment channels.",
        ],
        correct: 2,
        advice: [
          "Investment platforms promising unrealistic returns (e.g., 30% monthly) are almost always Ponzi schemes or fraud.",
          "Check the company's legal status and licensing with relevant government agencies.",
          "Never invest funds in applications or websites advertised only via social media without independent verification.",
        ],
        note: "If an investment seems too good to be true, it is fraudulent.",
        videoUrl: "https://www.youtube.com/embed/K9ZlHh3T7sQ",
      },
    ],
  },
  {
    id: "phone-email",
    title: "Phone & Email Scams",
    scenarios: [
      {
        id: 201,
        shortTitle: "Police Call Scam",
        question:
          "You receive a call from someone claiming to be a police officer, stating you are involved in a serious money laundering case, and demanding your cooperation for investigation. What should you do?",
        options: [
          "Keep the situation secret and follow their instructions immediately.",
          "Install a suspicious app as requested by the caller.",
          "Hang up, inform a trusted family member, and contact your local police station directly to verify the situation.",
        ],
        correct: 2,
        advice: [
          "Police or law enforcement agencies never conduct investigations or demand money/personal data over the phone.",
          "Real officers will contact you directly at your residence or workplace via official written summons.",
          "Never install third-party applications based on instructions from unverified callers.",
        ],
        note: "Hang up immediately. Scammers use fear and urgency to control victims.",
        videoUrl: "https://www.youtube.com/embed/c-Xh9r1D6T8",
      },
      {
        id: 202,
        shortTitle: "iPhone 17 Lottery Win",
        question:
          "You receive a call from a staff member of an official iPhone distributor, informing you that you have won a newly released iPhone 17. They ask for your address, ID number, and other personal information to process the gift claim. What should you do?",
        options: [
          "Provide personal information immediately to claim the gift.",
          "Ask them to send the details via email so you can respond later.",
          "Verify the program information via the official website, fan page, or customer service hotline of the distributor.",
        ],
        correct: 2,
        advice: [
          "Legitimate businesses do not call customers asking for sensitive information like ID numbers for simple promotions.",
          "Always be suspicious of unsolicited calls about prizes, especially when they require personal data.",
          "Use officially published contact methods to confirm the promotion's authenticity.",
        ],
        note: "Do not provide sensitive data to unverified callers.",
      },
      {
        id: 203,
        shortTitle: "Scholarship Fee Scam",
        question:
          "You receive an email announcing you won a university scholarship. The email stresses that only 5 spots are available and requires you to quickly provide personal information and pay a small fee to finalize the application. What should you do?",
        options: [
          "Immediately fill out the form and transfer the fee to secure the scholarship spot.",
          "Call the phone number in the email immediately for confirmation.",
          "Do not provide information or transfer money. Contact the university directly using their official contact information to verify.",
        ],
        correct: 2,
        advice: [
          "Real educational institutions rarely impose hidden or sudden 'processing fees' for scholarships.",
          "Phishing emails often create a false sense of urgency to prevent critical thinking.",
          "Look for grammatical errors, generic greetings, and suspicious sender email addresses.",
        ],
        note: "Never pay an upfront fee to claim a prize or scholarship.",
      },
    ],
  },
  {
    id: "general-security",
    title: "General Security Awareness",
    scenarios: [
      {
        id: 301,
        shortTitle: "Unauthorized Password Reset",
        question:
          "You receive an email notification about a password reset request for your account, but you did not initiate it. The email instructs you to click a link to proceed. What is your best course of action?",
        options: [
          "Click the link in the email to proceed with the reset as instructed.",
          "Do nothing, assuming it is spam.",
          "Do not click the link. Directly navigate to the official website and log in to check your account status.",
        ],
        correct: 2,
        advice: [
          "Clicking the link in a malicious email gives scammers access to a phishing site designed to steal your current password.",
          "Always navigate to websites by typing the known address directly into your browser.",
          "If the site supports Two-Factor Authentication (2FA), enable it immediately to protect against stolen passwords.",
        ],
        note: "Never click security-related links in unsolicited emails.",
      },
      {
        id: 302,
        shortTitle: "Setting a New Password",
        question:
          "Your company account password expires, and you need to set a new one. What is the safest way to create a strong password?",
        options: [
          "Use your date of birth combined with a family member's name for easy recall.",
          "Reuse a password you currently use for other services to keep it consistent.",
          "Create a strong password using a mix of uppercase, lowercase, numbers, and special characters; avoid personal information and never reuse passwords.",
        ],
        correct: 2,
        advice: [
          "Personal information is easy for hackers to guess or find through social media.",
          "Password reuse is the biggest vulnerability; if one service is breached, all your accounts are at risk.",
          "Use a reliable password manager to store and generate unique, complex passwords for every service.",
        ],
        note: "Uniqueness and complexity are key to password security.",
      },
      {
        id: 303,
        shortTitle: "Study Abroad Financial Proof",
        question:
          "Preparing for study abroad, you receive a call requesting financial proof to complete necessary procedures. The caller correctly names the schools you applied to and sounds very helpful. How do you verify the call's credibility?",
        options: [
          "Request they send an email to confirm their identity.",
          "Ask for a video call to observe the caller.",
          "Terminate the call. Proactively contact the study abroad consulting unit using the contact information you already possess from official channels.",
        ],
        correct: 2,
        advice: [
          "Scammers often scrape public information (like schools you applied to) to build trust.",
          "Do not rely on unsolicited emails or video calls for verification, as they can also be easily faked.",
          "Always initiate contact yourself using verified phone numbers or email addresses provided on official websites.",
        ],
        note: "Never trust unsolicited requests for sensitive documents or information.",
      },
      {
        id: 304,
        shortTitle: "Gift Scam from Company",
        question:
          "You receive a call from an unknown number. The person introduces themselves as a 'gift staffer' from a famous toy company, informing you that you won an attractive gift. They ask for your address and a small fee to process the gift. What should you do?",
        options: [
          "Follow the instructions to not miss out on the gift.",
          "Politely refuse and promise to ask an adult before deciding.",
          "Refuse to provide any information and end the call immediately.",
        ],
        correct: 2,
        advice: [
          "Legitimate contests or gifts do not require a processing fee paid to an unverified individual.",
          "If you must verify, call the company's official public number, not the number the caller provided.",
          "Scammers use the 'small fee' request to test the victim's willingness to comply and to steal small amounts of money.",
        ],
        note: "Never pay money to receive a prize.",
      },
      {
        id: 305,
        shortTitle: "Online Purchase Fraud",
        question:
          "You receive a text message from a strange number stating: 'Congratulations on winning a prize from the Lucky Draw Program. Please fill in your personal and bank account information to receive the prize.' What is your best action?",
        options: [
          "Try following the instructions to see if you receive the money.",
          "Call the number back to verify the information.",
          "Ignore the message, do not provide any information, and check the official website of the supposed program.",
        ],
        correct: 2,
        advice: [
          "Scammers use text messages (Smishing) to target a large number of people with low effort.",
          "Providing bank account information (even if 'just to receive money') is extremely risky and can be used for fraud.",
          "Never engage with unsolicited winning notifications via SMS or unverified calls.",
        ],
        note: "Do not provide personal banking details in response to text messages.",
      },
    ],
  },
];

// --- 3. COMPONENT IMPLEMENTATION ---

export default function SecurityManualPage() {
  const [activeCategory, setActiveCategory] = useState(categoriesData[0]);
  const [selectedScenario, setSelectedScenario] = useState(categoriesData[0].scenarios[0]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Recalculate all scenarios when data changes
  const allScenarios = useMemo(() => {
    return categoriesData.flatMap(cat => cat.scenarios);
  }, []);

  const findScenarioById = (id: number) => {
    return allScenarios.find(s => s.id === id) || categoriesData[0].scenarios[0];
  };

  const handleScenarioSelect = (scenarioId: number) => {
    const scenario = findScenarioById(scenarioId);
    setSelectedScenario(scenario);
    setSelectedAnswer(null); // Reset answer
  };

  const handleCategoryChange = (categoryId: string) => {
    const category = categoriesData.find(c => c.id === categoryId);
    if (category) {
      setActiveCategory(category);
      if (category.scenarios.length > 0) {
        handleScenarioSelect(category.scenarios[0].id);
      }
    }
  };

  const handleAnswerChange = (index: number) => {
    if (selectedAnswer === null) {
      setSelectedAnswer(index);
    }
  };

  const hasVideo = selectedScenario.videoUrl && selectedScenario.videoUrl.trim() !== "";

  const getTabTitle = (scenario: Scenario) => {
    return `${scenario.shortTitle}`;
  };

  return (
    // Changed bg-[#0f172a] to bg-gray-900 to match standard theme
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-inter transition-colors duration-200">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        
        {/* --- CATEGORY TABS --- */}
        <div className="mb-4">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 pt-4 border-b border-gray-300 dark:border-gray-700 pb-2">
            Interactive Cyber Security Manual
          </h1>
          <div className="flex flex-col md:flex-row gap-4 border-b border-gray-300 dark:border-gray-700 pb-4">
            {categoriesData.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeCategory.id === cat.id
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        {/* --- SCENARIO TABS --- */}
        <div className="mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="inline-flex space-x-2 pb-2">
            {activeCategory.scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => handleScenarioSelect(scenario.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 flex-shrink-0 ${
                  selectedScenario.id === scenario.id
                    ? "bg-indigo-700 text-white shadow-xl"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {getTabTitle(scenario)}
              </button>
            ))}
          </div>
        </div>

        {/* --- SCENARIO CONTENT AREA --- */}
        {/* Changed bg-[#1e293b] to bg-gray-800 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 lg:p-8 transition-colors duration-200">
          
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-6 border-b border-gray-300 dark:border-gray-700 pb-3">
            {selectedScenario.shortTitle}: {selectedScenario.question}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- LEFT COLUMN: QUESTION & OPTIONS --- */}
            <div className="lg:col-span-2">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-6">
                Scenario: {selectedScenario.question}
              </p>

              {/* ANSWER OPTIONS */}
              <div className="space-y-4 mb-8">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 border-b border-gray-300 dark:border-gray-700 pb-2">
                  What is your safest action?
                </h3>
                {selectedScenario.options.map((option, index) => {
                  const isSelected = selectedAnswer !== null && selectedAnswer === index;
                  const isCorrect = selectedScenario.correct === index;
                  const isAnswered = selectedAnswer !== null;

                  let colorClass = "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600";
                  if (isAnswered) {
                    if (isCorrect) {
                      colorClass = "bg-green-100 dark:bg-green-900/40 border-green-500 dark:border-green-500";
                    } else if (isSelected && !isCorrect) {
                      colorClass = "bg-red-100 dark:bg-red-900/40 border-red-500 dark:border-red-500";
                    } else {
                      colorClass = "bg-gray-100 dark:bg-gray-700 opacity-50 border-gray-200 dark:border-gray-600";
                    }
                  } else if (isSelected) {
                    colorClass = "bg-indigo-100 dark:bg-indigo-900/40 hover:bg-indigo-200 dark:hover:bg-indigo-800 border-indigo-500";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerChange(index)}
                      disabled={isAnswered}
                      className={`w-full text-left p-4 rounded-lg shadow-md transition-all duration-300 border-2 ${colorClass}`}
                    >
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{index + 1}. </span>
                      <span className="text-gray-800 dark:text-gray-200">{option}</span>
                      {isAnswered && isCorrect && (
                        <span className="ml-3 text-green-700 dark:text-green-400 font-bold"> (Correct Answer)</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* FEEDBACK & TIPS */}
              {selectedAnswer !== null && (
                <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-700">
                  <h3 className="text-2xl font-bold mb-4">
                    {selectedAnswer === selectedScenario.correct
                      ? <span className="text-green-600 dark:text-green-400">✅ Correct Action!</span>
                      : <span className="text-red-600 dark:text-red-400">❌ Incorrect Action.</span>}
                  </h3>
                  
                  {/* ADVICE */}
                  {/* Changed dark:bg-gray-800 to dark:bg-gray-700 for better contrast inside the card */}
                  <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300 mb-2">Safety Advice:</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                      {selectedScenario.advice.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  {/* KEY TAKEAWAY */}
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-500 text-yellow-900 dark:text-yellow-100 rounded-md">
                    <p className="font-bold text-yellow-900 dark:text-yellow-200">Key Takeaway:</p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-100">{selectedScenario.note}</p>
                  </div>
                </div>
              )}
            </div>

            {/* --- RIGHT COLUMN: VIDEO/INFO --- */}
            <div className="lg:col-span-1">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-300 dark:border-gray-700 pb-2">
                Illustration & Context
              </h3>
              {hasVideo ? (
                <div className="aspect-w-16 aspect-h-9 w-full rounded-lg overflow-hidden shadow-xl">
                  <iframe
                    className="w-full h-full"
                    src={selectedScenario.videoUrl}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="p-6 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 h-64 flex items-center justify-center">
                  <p className="text-center">No video illustration available for this scenario. Always practice caution!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}