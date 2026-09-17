var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var faq_data_exports = {};
__export(faq_data_exports, {
  buildFaqJsonLd: () => buildFaqJsonLd,
  faqs: () => faqs
});
module.exports = __toCommonJS(faq_data_exports);
const faqs = [
  {
    question: "Are your laptops, computers, and IT products 100% genuine?",
    answer: "Yes. As a trusted computer store in Pakistan, i.Link Systems & Solutions is an authorized reseller for every brand we carry, sourcing laptops, PCs, networking gear, CCTV systems and accessories directly from official distributors \u2014 never grey market \u2014 and shipped in sealed manufacturer packaging."
  },
  {
    question: "Do your products come with official manufacturer warranty?",
    answer: "Every product we sell comes with manufacturer warranty coverage, honored locally in Pakistan through the brand's official service network. Exact coverage and duration vary by product and brand \u2014 check the product listing or your order documentation, or contact our support team to confirm."
  },
  {
    question: "Do you deliver computer products across Pakistan?",
    answer: "Yes, we deliver nationwide to all major cities and towns across all four provinces, with tracked and insured shipping on every order."
  },
  {
    question: "How long does delivery take in Pakistan?",
    answer: "Most orders within major cities arrive in 1\u20133 business days. Delivery to other cities and towns typically takes 3\u20135 business days depending on location."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We currently accept Cash on Delivery (COD) and Easypaisa. You'll see both options at checkout, with your exact total calculated before you place your order."
  },
  {
    question: "Is Cash on Delivery (COD) available?",
    answer: "Yes, Cash on Delivery is available and is one of our two checkout payment options, alongside Easypaisa."
  },
  {
    question: "Can I track my order after it has been shipped?",
    answer: "You can see your current order status any time from My Account \u2192 Orders. A dedicated public order-tracking page is still being rolled out \u2014 in the meantime, our support team can also give you a live status update using your order number."
  },
  {
    question: "What is your return policy?",
    answer: "Unused products in their original packaging can be requested for return within 7 days of delivery. Submit a return request from your order in My Account; our team reviews every request and will approve or reject it. Approval means your request has been accepted for processing \u2014 any applicable refund is handled as a separate step. See our Returns and Refund Policy pages for full details."
  },
  {
    question: "Do you offer bulk discounts for businesses and corporate orders?",
    answer: "Yes, we offer tiered volume pricing on bulk orders for businesses, government departments and educational institutions. Share your requirements with our business team and we'll prepare a competitive quotation."
  },
  {
    question: "Can businesses request a quotation for IT equipment?",
    answer: "Absolutely. Our Business Solutions team prepares custom quotations for corporate IT solutions \u2014 covering government, education and enterprise procurement \u2014 including bulk pricing and Net-30 credit terms for qualified accounts."
  },
  {
    question: "Do you provide networking and CCTV installation services?",
    answer: "Yes, our certified technical team offers on-site installation, configuration and deployment for networking infrastructure and CCTV surveillance systems for businesses of any size."
  },
  {
    question: "Do you sell gaming PCs, gaming laptops, and gaming components?",
    answer: "Yes, we stock a wide range of gaming laptops, prebuilt gaming PCs and individual components \u2014 including graphics cards, processors and cases \u2014 from brands like ASUS, MSI, HP and Dell."
  },
  {
    question: "Do you sell laptops for business, professional, and everyday use?",
    answer: "Yes, alongside gaming machines we carry business laptops and professional workstations for engineering, design and content creation, plus everyday laptops for home and student use, from HP, Dell, Lenovo, ASUS and Apple."
  },
  {
    question: "Can I get technical support after purchasing a product?",
    answer: "Yes. Our certified technicians are available to help you choose, configure and maintain your systems even after purchase \u2014 reach our support team by phone or email during business hours, Monday to Saturday, 10am\u20138pm."
  }
];
function buildFaqJsonLd(items = faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buildFaqJsonLd,
  faqs
});
