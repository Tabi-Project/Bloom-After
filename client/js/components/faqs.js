const faqs = [
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
    question: " Is the community space safe and private?",
    answer:
      "Yes, the community space is designed to be a safe and private environment for users to connect and share their experiencesYes. Our community is a moderated, judgment-free space where mothers can share their experiences and support one another. You can participate anonymously and all conversations are held to strict community guidelines.",
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

function renderFAQs() {
  const faqContainer = document.getElementById("faq-root");
  faqContainer.classList.add("faq-container");

  faqs.forEach((faq) => {
    const faqItem = document.createElement("div");
    faqItem.classList.add("faq-item");
    faqItem.innerHTML = `
      <div class="faq-header">
        <h4 class="faq-question">${faq.question}</h4>
        <i class="fa-solid fa-caret-down faq-icon"></i>
      </div>
      <p class="faq-answer">${faq.answer}</p>
    `;

    const header = faqItem.querySelector(".faq-header");
    const answer = faqItem.querySelector(".faq-answer");

    // Hide answer by default
    answer.style.display = "none";

    header.addEventListener("click", () => {
      const isOpen = faqItem.classList.contains("open");
      faqItem.classList.toggle("open", !isOpen);
      answer.style.display = isOpen ? "none" : "block";
    });

    faqContainer.appendChild(faqItem);
  });
}

export { renderFAQs };
