import { faqs } from "../data/faqs.js";
function renderFAQs() {
  const faqContainer = document.getElementById("faq-root");
  faqContainer.classList.add("faq-container");

  faqs.forEach((faq) => {
    const faqItem = document.createElement("div");
    faqItem.classList.add("faq-item");
    faqItem.innerHTML = `
  <div class="faq-header" aria-expanded="false">
    <button class="faq-question">${faq.question}</button>
    <i class="fa-solid fa-caret-down faq-icon" aria-hidden="true"></i>
  </div>
  <p class="faq-answer">${faq.answer}</p>
`;

    const header = faqItem.querySelector(".faq-header");
    const answer = faqItem.querySelector(".faq-answer");

    header.addEventListener("click", () => {
      const isOpen = faqItem.classList.contains("open");

      faqContainer.querySelectorAll(".faq-item.open").forEach((item) => {
        item.classList.remove("open");
        item
          .querySelector(".faq-header")
          .setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        faqItem.classList.add("open");
        header.setAttribute("aria-expanded", "true");
      }
    });

    faqContainer.appendChild(faqItem);
  });
}

export { renderFAQs };
