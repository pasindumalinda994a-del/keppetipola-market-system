import { PageHeader } from "@/components/shared/page-header";

const faqs = [
  {
    question: "Is this free for farmers?",
    answer:
      "Browsing prices and demand is free. Listing harvest and receiving offers is included for registered farmers.",
  },
  {
    question: "How often do prices update?",
    answer:
      "Prices refresh from completed deals and trader activity throughout the trading day.",
  },
  {
    question: "Do I need to visit the market?",
    answer:
      "Pickup and delivery are arranged between you and the trader. Many deals still settle at the physical stalls.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageHeader
        title="FAQ"
        description="Common questions about using Keppetipola Market."
      />
      <div className="space-y-6">
        {faqs.map((faq) => (
          <div key={faq.question}>
            <h2 className="font-medium text-foreground">{faq.question}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
