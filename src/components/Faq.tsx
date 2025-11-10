"use client";
import React from "react";
import { Container } from "@/components/Container";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/solid";

export const Faq = () => {
  return (
    <Container className="!p-0">
      <div className="w-full max-w-2xl p-2 mx-auto">
        {faqdata.map((item) => (
          <div
            key={item.question}
            className="mb-5 border rounded-xl shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700"
          >
            <Disclosure>
              {({ open }) => (
                <>
                  <Disclosure.Button className="flex items-center justify-between w-full px-6 py-4 text-lg text-left text-gray-800 rounded-t-xl bg-gray-50 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-indigo-100 focus-visible:ring-opacity-75 dark:bg-gray-700 dark:text-gray-200">
                    <span className="font-medium">{item.question}</span>
                    <ChevronUpIcon
                      className={`${
                        open ? "transform rotate-180" : ""
                      } w-5 h-5 text-indigo-500`}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-6 py-4 text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-600">
                    {item.answer}
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          </div>
        ))}
      </div>
    </Container>
  );
};

const faqdata = [
  {
    question: "Is this service completely free to use?",
    answer:
      "Yes! You can use and contribute to the platform without paying any fees.",
  },
  {
    question: "Can I use this platform for commercial purposes?",
    answer:
      "Absolutely! You can integrate our service into both personal and commercial projects as long as you comply with our terms of use.",
  },
  {
    question: "What happens if I am not satisfied with the service?",
    answer:
      "If you experience any issues or believe the service does not meet your needs, feel free to contact us. We are always open to feedback and improvements.",
  },
  {
    question: "Do you offer technical support?",
    answer:
      "Basic support is included for free users. However, you can upgrade to a premium plan to get 24/7 priority assistance and advanced features.",
  },
  {
    question: "Can I customize or extend the features?",
    answer:
      "Definitely! Our platform is designed to be flexible, easy to integrate, and expandable with modern technology.",
  },
  {
    question: "How do I check if a phone number is reported as a scam?",
    answer:
      "Simply type the phone number into our search tool. If the number has been reported by users, you will see warning details and the scam type.",
  },
  {
    question: "Where do scam report statistics come from?",
    answer:
      "Statistics are collected from community submissions, validated reports, and trusted cybersecurity sources to ensure accuracy and reliability.",
  },
  {
    question: "Is my personal information protected when I report a number?",
    answer:
      "Yes. Your identity is fully confidential. We do not share or expose personal data to any third party.",
  },
];
