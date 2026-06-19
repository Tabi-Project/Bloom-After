"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Faq {
  id: number;
  question: string;
  answer: string;
}

const faqs: Faq[] = [
  {
    id: 1,
    question: "How do I find a clinic or mental health professional near me?",
    answer:
      "Use our Clinic Finder to search for verified maternal mental health professionals and facilities across Nigeria. You can filter by state, language, and whether the clinic accepts walk-ins or requires an appointment.",
  },
  {
    id: 2,
    question: "What kind of resources are available on Bloom After?",
    answer:
      "Bloom After offers clinically reviewed articles, podcasts, and videos covering postpartum depression symptoms, recovery, and mental wellness. Resources are available in English, Yoruba, Hausa, and Igbo to ensure no mother is left out.",
  },
  {
    id: 3,
    question: "Is the community space safe and private?",
    answer:
      "Yes. Our community is a moderated, judgment-free space where mothers can share their experiences and support one another. You can participate anonymously and all conversations are held to strict community guidelines.",
  },
  {
    id: 4,
    question:
      "What should I do if I or someone I know is in a mental health crisis right now?",
    answer:
      "Go to our Crisis Handling page immediately. It provides step-by-step guidance based on the specific situation, as well as direct access to our 24/7 helpline staffed by trained maternal mental health counselors available in multiple Nigerian languages.",
  },
  {
    id: 5,
    question: "Can partners and family members use Bloom After?",
    answer:
      "Absolutely. Bloom After has resources specifically for partners and family members to help them understand postpartum depression, recognize warning signs, and learn how to provide meaningful support without causing harm.",
  },
  {
    id: 6,
    question: "Is Bloom After a replacement for professional medical care?",
    answer:
      "No. Bloom After is a supportive resource and should complement, not replace, professional medical advice. We strongly encourage all mothers experiencing symptoms to consult a qualified healthcare provider. Our Clinic Finder can help you locate one near you.",
  },
];

export default function Faqs() {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div className="faq-root faq-container">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div className={`faq-item ${isOpen ? "open" : ""}`} key={faq.id}>
            <div className="faq-header" aria-expanded={isOpen}>
              <button
                className="faq-question"
                onClick={() => setOpenId(isOpen ? null : faq.id)}
              >
                {faq.question}
              </button>
              <ChevronDown className="faq-icon" size={18} aria-hidden="true" />
            </div>
            <p className="faq-answer">{faq.answer}</p>
          </div>
        );
      })}
    </div>
  );
}
