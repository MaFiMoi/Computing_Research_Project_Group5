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
  Flame,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

// =======================================================
// CATEGORY + SORT OPTIONS
// =======================================================
const categories = [
  { id: "all", label: "All", icon: null },
  { id: "general", label: "General", icon: <Sparkles className="w-4 h-4 text-purple-500" /> },
  { id: "security", label: "Security", icon: <Flame className="w-4 h-4 text-red-500" /> },
  { id: "technical", label: "Technical", icon: <Clock className="w-4 h-4 text-blue-500" /> },
];

const sortModes = [
  { id: "popular", label: "Most Popular" },
  { id: "newest", label: "Newest" },
  { id: "suggested", label: "Suggested (AI)" },
];

// =======================================================
// Highlight Function
// =======================================================
const highlightText = (text: string, keyword: string) => {
  if (!keyword.trim()) return text;
  const regex = new RegExp(`(${keyword})`, "gi");
  return text.replace(regex, `<mark class="bg-yellow-300 text-black">$1</mark>`);
};

// =======================================================
// AI Similarity Function
// =======================================================
const getSimilarityScore = (query: string, target: string): number => {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  if (!q) return 0;
  if (t.includes(q)) return q.length * 5;

  let score = 0;
  for (let char of q) if (t.includes(char)) score++;
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
  helpful,
  setHelpful,
}: any) {
  const open = activeIndex === index;

  return (
    <div className="mb-5 border rounded-xl shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => onToggle(index)}
        className="w-full flex items-center justify-between px-6 py-4 text-left text-lg text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span
            className="font-semibold"
            dangerouslySetInnerHTML={{ __html: highlightText(question, keyword) }}
          />
        </div>

        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="w-5 h-5 text-indigo-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
            className="px-6 py-4 text-gray-600 dark:text-gray-300 border-t dark:border-gray-600"
          >
            <div dangerouslySetInnerHTML={{ __html: highlightText(answer, keyword) }} />

            {/* Feedback */}
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <span>Was this helpful?</span>

              <button
                onClick={() => setHelpful({ ...helpful, [index]: "yes" })}
                className={`p-2 rounded-lg border ${
                  helpful[index] === "yes" ? "bg-green-100 text-green-600" : ""
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
              </button>

              <button
                onClick={() => setHelpful({ ...helpful, [index]: "no" })}
                className={`p-2 rounded-lg border ${
                  helpful[index] === "no" ? "bg-red-100 text-red-600" : ""
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =======================================================
// MAIN FAQ COMPONENT
// =======================================================
export const Faq = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortMode, setSortMode] = useState("popular");
  const [helpful, setHelpful] = useState<any>({});

  const toggleFAQ = (idx: number) => {
    setActiveIndex((prev) => (prev === idx ? null : idx));
  };

  // AI Suggestion
  const [suggestions, setSuggestions] = useState<any[]>([]);
  useEffect(() => {
    if (!keyword.trim()) return setSuggestions([]);

    const results = faqdata
      .map((item) => ({
        ...item,
        score: getSimilarityScore(keyword, item.question + item.answer),
      }))
      .filter((i) => i.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    setSuggestions(results);
  }, [keyword]);

  // Filter
  let filtered = faqdata.filter(
    (i) =>
      (selectedCategory === "all" || i.category === selectedCategory) &&
      (i.question.toLowerCase().includes(keyword.toLowerCase()) ||
        i.answer.toLowerCase().includes(keyword.toLowerCase()))
  );

  // Sort
  if (sortMode === "popular") filtered.sort((a, b) => b.popularity - a.popularity);
  if (sortMode === "newest")
    filtered.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  if (sortMode === "suggested" && suggestions.length) filtered = suggestions;

  return (
    <Container className="!p-0">
      <div className="w-full max-w-3xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-6">Frequently Asked Questions</h1>

        {/* Search */}
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Ask a question..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border"
          />
          {keyword && (
            <button onClick={() => setKeyword("")} className="px-3 py-3 bg-red-500 text-white rounded-xl">
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-2 border rounded-xl flex items-center gap-2 ${
                selectedCategory === c.id ? "bg-black text-white" : "bg-gray-100"
              }`}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {/* Sort Modes */}
        <div className="flex gap-2 mb-6">
          {sortModes.map((s) => (
            <button
              key={s.id}
              onClick={() => setSortMode(s.id)}
              className={`px-4 py-2 rounded-xl ${
                sortMode === s.id ? "bg-indigo-600 text-white" : "bg-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <p className="font-semibold">AI Suggestions</p>
            </div>

            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const pos = faqdata.indexOf(s);
                  setActiveIndex(pos);
                }}
                className="w-full text-left px-4 py-3 bg-gray-100 rounded-lg mb-2"
              >
                {s.question}
              </button>
            ))}
          </div>
        )}

        {/* FAQ LIST */}
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No results found.</p>
        ) : (
          filtered.map((item, i) => (
            <FAQItem
              key={i}
              index={i}
              activeIndex={activeIndex}
              onToggle={toggleFAQ}
              question={item.question}
              answer={item.answer}
              icon={item.icon}
              keyword={keyword}
              helpful={helpful}
              setHelpful={setHelpful}
            />
          ))
        )}

        {/* GROUP MEMBERS */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-semibold text-center mb-6">Group Members</h2>

          <table className="min-w-full border rounded-xl bg-white">
            <tbody>
              {partners.map((m) => (
                <tr key={m.name} className="border-b">
                  <td className="px-6 py-4">{m.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
};

// =======================================================
// FAQ DATA WITH CATEGORY + POPULARITY + DATE
// =======================================================
const faqdata = [
  {
    question: "Is this service completely free to use?",
    answer: "Yes! You can use and contribute without paying any fees.",
    icon: <ShieldCheck className="w-6 h-6 text-green-500" />,
    category: "general",
    popularity: 95,
    date: "2025-01-10",
  },
  {
    question: "Can I use this platform for commercial purposes?",
    answer: "Absolutely! You can integrate our service into any project.",
    icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
    category: "general",
    popularity: 70,
    date: "2025-01-18",
  },
  {
    question: "Do you offer technical support?",
    answer: "Free users get basic support. Premium users get priority help.",
    icon: <AlertCircle className="w-6 h-6 text-yellow-500" />,
    category: "technical",
    popularity: 120,
    date: "2025-01-20",
  },
  {
    question: "How do I check if a phone number is a scam?",
    answer: "Enter the number in our tool to see reports and scam data.",
    icon: <AlertCircle className="w-6 h-6 text-red-500" />,
    category: "security",
    popularity: 140,
    date: "2025-02-01",
  },
  {
    question: "Where do scam statistics come from?",
    answer: "From user submissions, verified reports, and trusted security providers.",
    icon: <ShieldCheck className="w-6 h-6 text-indigo-500" />,
    category: "security",
    popularity: 88,
    date: "2025-01-12",
  },
  {
    question: "Is my personal information protected when reporting?",
    answer: "Yes. We never disclose or expose your personal data.",
    icon: <ShieldCheck className="w-6 h-6 text-green-600" />,
    category: "security",
    popularity: 110,
    date: "2025-01-15",
  },
];

// =======================================================
const partners = [
  { name: "Nguyễn Duy Hoàng - BH01754" },
  { name: "Kim Tiến Đạt - BH01783" },
  { name: "Lương Hoàng Hải - BH01797" },
  { name: "Trần Đức Toàn - BH01780" },
  { name: "Nguyễn Quang Linh - BH01804" },
];
