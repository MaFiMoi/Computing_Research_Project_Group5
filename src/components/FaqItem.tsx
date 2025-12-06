"use client";

import React, { useState } from "react";
import { Container } from "./Container";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ShieldCheck, AlertCircle } from "lucide-react";

// ========================================
// 🚀 Highlight helper
// ========================================
function highlight(text: string, keyword: string) {
  if (!keyword) return text;

  const regex = new RegExp(`(${keyword})`, "gi");
  return text.split(regex).map((part, index) =>
    regex.test(part) ? (
      <span key={index} className="bg-yellow-300 dark:bg-yellow-600 px-1 rounded">
        {part}
      </span>
    ) : (
      part
    )
  );
}

interface FAQItemProps {
  index: number;
  activeIndex: number | null;
  onToggle: (idx: number) => void;

  question: string;
  answer: string;
  icon?: React.ReactNode;
  search: string;
}

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
  search,
}: FAQItemProps) {
  const open = activeIndex === index;

  return (
    <div className="mb-5 border rounded-xl shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden">

      {/* BUTTON */}
      <button
        onClick={() => onToggle(index)}
        className="w-full flex items-center justify-between px-6 py-4 text-left text-lg text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold">{highlight(question, search)}</span>
        </div>

        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-indigo-500" />
        </motion.div>
      </button>

      {/* ANSWER PANEL */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
            className="px-6 py-4 text-gray-600 dark:text-gray-300 border-t dark:border-gray-600"
          >
            {highlight(answer, search)}
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
  const [search, setSearch] = useState("");

  const toggleFAQ = (idx: number) => {
    setActiveIndex((prev) => (prev === idx ? null : idx));
  };

  // Filter FAQ by keyword
  const filteredFAQ = faqdata.filter(
    (item) =>
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container className="!p-0">
      <div className="w-full max-w-3xl mx-auto p-4">

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-center mb-5 text-gray-900 dark:text-gray-100">
          Frequently Asked Questions
        </h1>

        {/* SEARCH BAR */}
        <input
          type="text"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 mb-8 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
        />

        {/* FAQ LOOP */}
        {filteredFAQ.map((item, index) => (
          <FAQItem
            key={index}
            index={index}
            activeIndex={activeIndex}
            onToggle={toggleFAQ}
            search={search}
            question={item.question}
            answer={item.answer}
            icon={item.icon}
          />
        ))}

        {filteredFAQ.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
            No results found.
          </p>
        )}

        {/* Divider */}
        <div className="border-t border-gray-300 dark:border-gray-600 my-14"></div>

        {/* GROUP MEMBERS TABLE */}
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
// FAQ DATA – SaaS Professional Edition
// =======================================================
const faqdata = [
  {
    question: "Is the platform free to use?",
    answer:
      "Yes. All core features are available at no cost. You can search data, submit reports, and access basic insights without any subscription.",
    icon: <ShieldCheck className="w-6 h-6 text-green-500" />,
  },
  {
    question: "Can I integrate this service into my applications?",
    answer:
      "Yes. Our system is designed for commercial and enterprise use. You’re free to integrate our APIs or data services into any product or workflow.",
    icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
  },
  {
    question: "Do you provide technical support?",
    answer:
      "We offer community support for all users. Premium plans include priority support and dedicated assistance.",
    icon: <AlertCircle className="w-6 h-6 text-yellow-500" />,
  },
  {
    question: "How can I verify if a phone number is a scam?",
    answer:
      "Enter the number in our search tool to see activity patterns, risk levels, and aggregated reports.",
    icon: <AlertCircle className="w-6 h-6 text-red-500" />,
  },
  {
    question: "Where does your security data come from?",
    answer:
      "Our database is updated from verified user submissions and global cybersecurity intelligence partners.",
    icon: <ShieldCheck className="w-6 h-6 text-indigo-500" />,
  },
  {
    question: "Is my personal information protected?",
    answer:
      "Absolutely. We follow strict data protection standards and never expose or share your private information.",
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
