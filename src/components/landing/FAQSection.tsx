import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I get started as a client?",
    answer: "Getting started is easy! Simply click on 'Get Started' or 'Client Registration' to create your account. Once registered, you'll receive a unique URL for your storefront and can start adding products from our catalog.",
  },
  {
    question: "What payment methods are supported?",
    answer: "We support secure payment processing through Paystack, which accepts all major credit cards, debit cards, and bank transfers. All transactions are encrypted and secure.",
  },
  {
    question: "How does the commission system work?",
    answer: "Our platform operates on a transparent commission model. When a sale is made through your storefront, a small percentage goes to the platform. You can view all commission details in your payment management dashboard.",
  },
  {
    question: "Can I customize my storefront?",
    answer: "Yes! Clients can upload custom banners through the carousel management feature and personalize their product listings. Your unique URL creates a branded experience for your customers.",
  },
  {
    question: "How do I track my sales?",
    answer: "Your client dashboard includes a comprehensive sales management section where you can view all orders, track delivery status, and analyze your sales performance with detailed reports.",
  },
  {
    question: "What support is available?",
    answer: "We offer 24/7 customer support through our contact form. Our team is always ready to help with technical issues, account questions, or general inquiries.",
  },
];

const FAQSection = () => {
  return (
    <section id="faqs" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">FAQs</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mt-3 mb-6">
            Frequently Asked
            <span className="gradient-text"> Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about our platform and services.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border/50 rounded-xl px-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
