"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ShieldCheck,
  AlertCircle,
  Search,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  RefreshCcw,
  Lock
} from "lucide-react";

// Load Recharts dynamic để tránh lỗi server-side rendering
const BarChart = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(m => m.Bar), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(m => m.CartesianGrid), { ssr: false });
const LineChart = dynamic(() => import("recharts").then(m => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then(m => m.Line), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false });

// --- TYPES ---
interface FAQItemType {
  question: string;
  answer: string;
  category: string;
  icon: React.ReactNode;
  popularity: number;
  date: string;
  views: number;
  helpfulYes: number;
  helpfulNo: number;
  score?: number;
}

interface FAQItemProps {
  index: number;
  activeIndex: number | null;
  onToggle: (idx: number) => void;
  question: string;
  answer: string;
  icon: React.ReactNode;
  keyword: string;
  onHelpful: (faq: FAQItemType, value: boolean) => void;
  faq: FAQItemType;
}

// --- UTILS ---
const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const highlightText = (text: string, keyword: string): string => {
  if (!keyword.trim()) return escapeHtml(text);
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  return escapeHtml(text).replace(
    regex,
    `<mark class="bg-yellow-300 text-black px-1">$1</mark>`
  );
};

const getSimilarityScore = (query: string, target: string): number => {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (!q) return 0;
  if (t.includes(q)) return q.length * 5;
  let score = 0;
  for (let c of q) if (t.includes(c)) score++;
  if (t.startsWith(q)) score += 4;
  return score;
};

// --- SUB COMPONENT ---
function FAQItem({
  index,
  activeIndex,
  onToggle,
  question,
  answer,
  icon,
  keyword,
  onHelpful,
  faq,
}: FAQItemProps) {
  const open = activeIndex === index;

  return (
    <div className="mb-5 border rounded-xl shadow-sm bg-white overflow-hidden">
      <button
        onClick={() => onToggle(index)}
        className="w-full flex justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span
            className="font-semibold text-left"
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
            className="px-6 py-4 border-t bg-white"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: highlightText(answer, keyword) }}
            />
            <div className="mt-4 flex gap-4 text-sm text-gray-600">
              <span>Was this helpful?</span>
              <button
                onClick={() => onHelpful(faq, true)}
                className="p-2 border rounded-lg hover:bg-green-100"
              >
                <ThumbsUp className="w-4 h-4 text-green-600" />
              </button>
              <button
                onClick={() => onHelpful(faq, false)}
                className="p-2 border rounded-lg hover:bg-red-100"
              >
                <ThumbsDown className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- DATA ---
const faqdata: FAQItemType[] = [
  {
    question: "Is this service completely free to use?",
    answer: "Yes! You can use and contribute without paying any fees.",
    category: "general",
    icon: <ShieldCheck className="w-6 h-6 text-green-500" />,
    popularity: 120,
    date: "2024-01-10",
    views: 320,
    helpfulYes: 40,
    helpfulNo: 2,
  },
  {
    question: "Can I use this platform for commercial purposes?",
    answer: "Absolutely! Integrate into any project freely.",
    category: "general",
    icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
    popularity: 90,
    date: "2024-01-15",
    views: 270,
    helpfulYes: 35,
    helpfulNo: 5,
  },
  {
    question: "Do you offer technical support?",
    answer: "Free users get basic support. Premium users get priority help.",
    category: "technical",
    icon: <AlertCircle className="w-6 h-6 text-yellow-500" />,
    popularity: 140,
    date: "2024-01-20",
    views: 380,
    helpfulYes: 52,
    helpfulNo: 6,
  },
  {
    question: "How often is the system updated?",
    answer:
      "Security definitions and scam detection models are updated weekly to ensure maximum protection.",
    category: "technical",
    icon: <RefreshCcw className="w-6 h-6 text-purple-500" />,
    popularity: 160,
    date: "2024-02-12",
    views: 410,
    helpfulYes: 60,
    helpfulNo: 3,
  },
  {
    question: "How is my personal data protected?",
    answer:
      "All submitted data is encrypted and never shared with third parties without your consent.",
    category: "security",
    icon: <Lock className="w-6 h-6 text-red-500" />,
    popularity: 180,
    date: "2024-02-18",
    views: 450,
    helpfulYes: 70,
    helpfulNo: 4,
  },
  {
    question: "Can I contribute new scam reports?",
    answer:
      "Yes! You can submit scam information directly, and our team will verify and publish it.",
    category: "community",
    icon: <Search className="w-6 h-6 text-indigo-500" />,
    popularity: 130,
    date: "2024-02-22",
    views: 290,
    helpfulYes: 38,
    helpfulNo: 1,
  },
];

// --- MAIN COMPONENT (RENAMED TO Faq) ---
export default function Faq() {
  const [keyword, setKeyword] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [data, setData] = useState<FAQItemType[]>(faqdata);
  const [suggestions, setSuggestions] = useState<FAQItemType[]>([]);

  useEffect(() => {
    if (!keyword) return setSuggestions([]);
    const ranked = data
      .map((item) => ({ ...item, score: getSimilarityScore(keyword, item.question) }))
      .filter((x) => x.score! > 0)
      .sort((a, b) => b.score! - a.score!)
      .slice(0, 5);
    setSuggestions(ranked);
  }, [keyword, data]);

  const onHelpful = (faq: FAQItemType, yes: boolean) => {
    setData((prev) =>
      prev.map((item) =>
        item.question === faq.question
          ? {
              ...item,
              helpfulYes: yes ? item.helpfulYes + 1 : item.helpfulYes,
              helpfulNo: !yes ? item.helpfulNo + 1 : item.helpfulNo,
            }
          : item
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search FAQ..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-10 pr-3 py-3 border rounded-xl w-full text-black"
          />
        </div>
        {keyword && (
          <button onClick={() => setKeyword("")}>
            <XCircle className="w-6 h-6 text-gray-500 hover:text-red-500" />
          </button>
        )}
      </div>

      {/* FAQ List */}
      {data.map((faq, index) => (
        <FAQItem
          key={index}
          index={index}
          activeIndex={activeIndex}
          onToggle={(idx) => setActiveIndex(idx === activeIndex ? null : idx)}
          question={faq.question}
          answer={faq.answer}
          icon={faq.icon}
          keyword={keyword}
          faq={faq}
          onHelpful={onHelpful}
        />
      ))}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-10 p-6 border rounded-xl bg-purple-50">
          <h2 className="font-bold mb-3 text-black">AI Suggested Questions</h2>
          {suggestions.map((s, i) => (
            <div key={i} className="py-2 text-purple-700">
              • {s.question}
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="mt-16 overflow-x-auto">
        <h2 className="text-2xl font-bold mb-6 text-black">FAQ Analytics</h2>
        <div className="flex flex-col gap-10">
            <BarChart width={600} height={250} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="question" tick={false} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="views" fill="#8884d8" />
            </BarChart>

            <LineChart width={600} height={250} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="question" tick={false} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="helpfulYes" stroke="#82ca9d" />
            </LineChart>
        </div>
      </div>
    </div>
  );
}