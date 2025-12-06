"use client";

import React, { useState } from "react";
import { Container } from "./Container"; // ⭐ Import đúng với export bạn cung cấp
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ShieldCheck, AlertCircle } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
  icon?: React.ReactNode;
}
// PREMIUM FAQ ITEM WITH ANIMATION
function FAQItem({ question, answer, icon }: FAQItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-5 border rounded-xl shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
      {/* BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left text-lg text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold">{question}</span>
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
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================================================================
// MAIN EXPORTED COMPONENT
// ==================================================================
export const Faq = () => {
  return (
    <Container className="!p-0">
      <div className="w-full max-w-3xl mx-auto p-4">

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-gray-100">
          Frequently Asked Questions
        </h1>

        {/* FAQ LOOP */}
        {faqdata.map((item, index) => (
          <FAQItem
            key={index}
            question={item.question}
            answer={item.answer}
            icon={item.icon}
          />
        ))}

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

// ==================================================================
// FAQ DATA
// ==================================================================
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

// ==================================================================
// GROUP MEMBERS
// ==================================================================
const partners = [
  { name: "Nguyễn Duy Hoàng - BH01754" },
  { name: "Kim Tiến Đạt - BH01783" },
  { name: "Lương Hoàng Hải - BH01797" },
  { name: "Trần Đức Toàn - BH01780" },
  { name: "Nguyễn Quang Linh - BH01804" },
];
