import React from 'react';
import { SchemaScript } from './SchemaScript';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: "How much does a private tour in Sri Lanka cost?",
    answer: "Tripvibe Lanka private tour packages start from USD $250 per person for a 5-day itinerary. Pricing varies based on duration, group size, accommodation tier, and season. All tours are 100% private — you never share with strangers."
  },
  {
    question: "What is included in a Tripvibe Lanka private tour?",
    answer: "All tours include a government-certified English-speaking chauffeur-guide, fully air-conditioned executive vehicle, passenger insurance, and onboard Wi-Fi. Accommodation and activities can be included based on your selected package."
  },
  {
    question: "How many days do you need for a Sri Lanka tour?",
    answer: "We recommend a minimum of 7 days to cover the key highlights including Sigiriya, Kandy, and the Hill Country. Our most popular package is 10 days, covering Sigiriya, Kandy, Ella, Yala, and the South Coast."
  },
  {
    question: "Is Sri Lanka safe for tourists?",
    answer: "Yes, Sri Lanka is generally safe for tourists. Tripvibe Lanka provides certified local guides, fully insured vehicles, and 24/7 WhatsApp support throughout your journey for complete peace of mind."
  },
  {
    question: "What is the best time to visit Sri Lanka?",
    answer: "December to March is ideal for the west and south coasts. May to September is best for the east coast. The Hill Country and Cultural Triangle are accessible year-round."
  },
  {
    question: "Do I need a visa for Sri Lanka?",
    answer: "Most nationalities require an Electronic Travel Authorization (ETA) to enter Sri Lanka, which can be obtained online at eta.gov.lk before travel. We recommend applying at least 2 weeks in advance."
  },
  {
    question: "What is the difference between a private and group tour in Sri Lanka?",
    answer: "A Tripvibe Lanka private tour means the vehicle, guide, and itinerary are exclusively yours. You set the pace, stops, and schedule. Group tours share these with strangers and follow a fixed timetable."
  }
];

export function ToursFAQ() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="py-20 px-6 sm:px-8 bg-slate-50 border-t border-slate-200" aria-labelledby="faq-heading">
      <SchemaScript schema={faqSchema} />
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4 font-display">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-600">
            Everything you need to know about booking a private tour in Sri Lanka.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <details 
              key={idx} 
              className="group bg-white border border-slate-200 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between cursor-pointer p-6 sm:p-8 hover:bg-slate-50 transition-colors">
                <span className="text-lg font-semibold text-slate-900 pr-6">
                  {faq.question}
                </span>
                <span className="shrink-0 rounded-full bg-orange-500/10 p-2 text-brand-text group-open:-rotate-180 transition-transform duration-300">
                  <ChevronDown className="w-5 h-5" />
                </span>
              </summary>
              <div className="px-6 sm:px-8 pb-6 sm:pb-8 border-t border-slate-100 pt-6 mt-2">
                <p className="text-slate-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
