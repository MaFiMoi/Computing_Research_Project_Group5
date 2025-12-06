"use client";

import React, { useEffect, useState } from "react";
import { Container } from "./Container";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ShieldCheck,
  AlertCircle,
  XCircle,
  Sparkles,
} from "lucide-react";

// =======================================================
// Highlight Function
// =======================================================
const highlightText = (text: string, keyword: string) => {
  if (!keyword.trim()) return text;
  const regex = new RegExp(`(${keyword})`, "gi");
  return text.replace(regex, `<mark class="bg-yellow-300 text-black">$1</mark>`);
};

// =======================================================
// AI Similarity Function (no API required)
// =======================================================
const getSimilarityScore = (query: string, target: string): number => {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  if (!q) return 0;
  if (t.includes(q)) return q.length * 5; // ưu tiên match trực tiếp

  // AI-like fuzzy matching
  let score = 0;
  for (let char of q) {
    if (t.includes(char)) score += 1;
  }

  // Ưu tiên từ nằm ở đầu câu
  if (t.startsWith(q)) score += 4;

  return score;
};

// =======================================================
// FAQ ITEM
// =======================================================
function FAQItem({
  index,
  activeIndex,
  onToggle,
  question,
  answer,
  icon,
  keyword,
}: any) {
  const open = activeIndex === index;

  return (
    <div className="mb-5 border rounded-xl shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
      {/* Question */}
      <button
        onClick={() => onToggle(index)}
        className="w-full flex items-center justify-between px-6 py-4 text-left text-lg text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span
            className="font-semibold"
            dangerouslySetInnerHTML={{
              __html: highlightText(question, keyword),
            }}
          />
        </div>

        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-indigo-500" />
        </motion.div>
      </button>

      {/* Answer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
            className="px-6 py-4 text-gray-600 dark:text-gray-300 border-t dark:border-gray-600"
          >
            <div
              dangerouslySetInnerHTML={{
                __html: highlightText(answer, keyword),
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =======================================================
// MAIN COMPONENT
// =======================================================
export const Faq = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");

  const toggleFAQ = (idx: number) => {
    setActiveIndex((prev) => (prev === idx ? null : idx));
  };

  // ===================================================
  // AI-powered FAQ Suggestion
  // ===================================================
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (!keyword.trim()) {
      setSuggestions([]);
      return;
    }

    const results = faqdata
      .map((item) => ({
        ...item,
        score: getSimilarityScore(keyword, item.question + item.answer),
      }))
      .filter((i) => i.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4); // giới hạn 4 gợi ý

    setSuggestions(results);
  }, [keyword]);

  const filteredData = faqdata.filter(
    (item) =>
      item.question.toLowerCase().includes(keyword.toLowerCase()) ||
      item.answer.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <Container className="!p-0">
      <div className="w-full max-w-3xl mx-auto p-4">

        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
          Frequently Asked Questions
        </h1>

        {/* SEARCH BAR */}
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Ask a question..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
          />

          {keyword && (
            <button
              onClick={() => setKeyword("")}
              className="px-3 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <p className="font-semibold text-gray-700 dark:text-gray-200">AI Suggestions</p>
            </div>

            <div className="flex flex-col gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const index = faqdata.indexOf(s);
                    setActiveIndex(index);
                    setKeyword(s.question);
                  }}
                  className="text-left px-4 py-3 rounded-lg border bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition text-gray-800 dark:text-gray-200"
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: highlightText(s.question, keyword),
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FAQ LIST */}
        {filteredData.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-300 italic mt-10">
            No results found.
          </p>
        ) : (
          filteredData.map((item, index) => (
            <FAQItem
              key={index}
              index={index}
              activeIndex={activeIndex}
              onToggle={toggleFAQ}
              question={item.question}
              answer={item.answer}
              icon={item.icon}
              keyword={keyword}
            />
          ))
        )}

        {/* GROUP MEMBERS */}
        <div className="border-t border-gray-300 dark:border-gray-600 my-14"></div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-gray-100">
            Group Members
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 border-b">
                    Member Name
                  </th>
                </tr>
              </thead>

              <tbody>
                {partners.map((member) => (
                  <tr
                    key={member.name}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="px-6 py-4 border-b dark:border-gray-600 text-gray-800 dark:text-gray-200">
                      {member.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Container>
  );
};

// =======================================================
// FAQ DATA
// =======================================================
const faqdata = [
  {
    question: "Is this service completely free to use?",
    answer: "Yes! You can use and contribute without paying any fees.",
    icon: <ShieldCheck className="w-6 h-6 text-green-500" />,
  },
  {
    question: "Can I use this platform for commercial purposes?",
    answer: "Absolutely! You can integrate our service into any project.",
    icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
  },
  {
    question: "Do you offer technical support?",
    answer: "Free users get basic support. Premium users get priority help.",
    icon: <AlertCircle className="w-6 h-6 text-yellow-500" />,
  },
  {
    question: "How do I check if a phone number is a scam?",
    answer: "Enter the number in our tool to see reports and scam data.",
    icon: <AlertCircle className="w-6 h-6 text-red-500" />,
  },
  {
    question: "Where do scam statistics come from?",
    answer:
      "From user submissions, verified reports, and trusted security providers.",
    icon: <ShieldCheck className="w-6 h-6 text-indigo-500" />,
  },
  {
    question: "Is my personal information protected when reporting?",
    answer: "Yes. We never disclose or expose your personal data.",
    icon: <ShieldCheck className="w-6 h-6 text-green-600" />,
  },
];

// =======================================================
// GROUP MEMBERS
// =======================================================
const partners = [
  { name: "Nguyễn Duy Hoàng - BH01754" },
  { name: "Kim Tiến Đạt - BH01783" },
  { name: "Lương Hoàng Hải - BH01797" },
  { name: "Trần Đức Toàn - BH01780" },
  { name: "Nguyễn Quang Linh - BH01804" },
];
