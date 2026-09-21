import type { Metadata } from "next";
import Image from "next/image";
import Container from "@/components/ui/container";
import SectionHeading from "@/components/ui/section-heading";
import FadeIn from "@/components/ui/fade-in";
import Button from "@/components/ui/button";
import Accordion from "@/components/ui/accordion";
import ProductCard from "@/components/sections/product-card";
import { getProductsByCategory, type RepositoryProduct } from "@/lib/products-repository";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { Building2, Calendar, Monitor, Users, Briefcase, GraduationCap, CheckCircle2 } from "lucide-react";
import { safeJsonLd } from "@/lib/utils";

const canonicalPath = "/laptop-rental";

export const metadata: Metadata = {
  title: "Laptop Rental in Pakistan | Laptops on Rent | i.Link",
  description: "Rent laptops in Pakistan for events, seminars, conferences, corporate training, workshops and temporary business needs. Laptop rental from PKR 1,000-2,500 per day. Get a custom quote from i.Link.",
  alternates: { canonical: canonicalPath },
  openGraph: {
    type: "website",
    title: "Laptop Rental in Pakistan | Laptops on Rent | i.Link",
    description: "Rent laptops in Pakistan for events, seminars, conferences, corporate training, workshops and temporary business needs. Laptop rental from PKR 1,000-2,500 per day. Get a custom quote from i.Link.",
    url: canonicalPath,
  },
  twitter: {
    card: "summary",
    title: "Laptop Rental in Pakistan | Laptops on Rent | i.Link",
    description: "Rent laptops in Pakistan for events, seminars, conferences, corporate training, workshops and temporary business needs. Laptop rental from PKR 1,000-2,500 per day. Get a custom quote from i.Link.",
  },
};

const whatsappMessage = "Hi i.Link, I am interested in renting laptops. Please share available options and a quotation. Quantity, rental dates, location and required specifications can be discussed.";
const whatsappUrl = `https://wa.me/923318852808?text=${encodeURIComponent(whatsappMessage)}`;

const useCases = [
  { title: "Events & Seminars", icon: Calendar, description: "Ensure your events run smoothly with reliable laptops for registration desks, presentations, and interactive sessions." },
  { title: "Conferences", icon: Users, description: "Equip your conference rooms and guest speakers with high-performance laptops tailored for large-scale corporate gatherings." },
  { title: "Corporate Training", icon: GraduationCap, description: "Provide temporary, standardized laptops for your employees during training workshops and certification programs." },
  { title: "Temporary Office Setups", icon: Building2, description: "Quickly deploy IT infrastructure for temporary teams, short-term projects, or seasonal business expansions." },
  { title: "Meetings & Workshops", icon: Briefcase, description: "Rent premium laptops for crucial client meetings, strategy workshops, or executive presentations." },
  { title: "Educational Programs", icon: Monitor, description: "Cost-effective laptop rentals for schools, universities, and specialized short-term educational courses." },
];

const benefits = [
  "Flexible rental quantities",
  "Multiple laptop specifications available",
  "Short-term and extended rental options",
  "Ideal for corporate events and business activities",
  "Customized quotations for bulk requirements",
  "Islamabad-based service with support for requirements across Pakistan",
];

const faqs = [
  {
    question: "How much does it cost to rent a laptop in Pakistan?",
    answer: "Laptop rental typically ranges from PKR 1,000 to PKR 2,500 per laptop per day. The final price depends on the laptop model, specifications, rental duration, quantity, and specific event requirements."
  },
  {
    question: "What affects laptop rental pricing?",
    answer: "Pricing is primarily affected by the required technical specifications (e.g., standard office laptops vs. high-performance laptops), the number of laptops you need, and the total duration of the rental."
  },
  {
    question: "Can I rent multiple laptops for an event?",
    answer: "Yes, we specialize in providing laptops for events, seminars, and conferences. We can accommodate bulk requests and provide customized rates for large quantities."
  },
  {
    question: "Can I rent laptops for corporate training?",
    answer: "Absolutely. We supply laptops for corporate training sessions, workshops, and temporary office setups to ensure your team has the right equipment when needed."
  },
  {
    question: "Do you offer customized rates for bulk quantities?",
    answer: "Yes, customers renting larger quantities or requiring laptops for an extended period can receive customized, discounted rental rates. Contact us on WhatsApp for a tailored quote."
  },
  {
    question: "Which cities do you serve?",
    answer: "Based in Islamabad, i.Link provides laptop rental services with support for customers and requirements across Pakistan. Please discuss your specific location and event needs with our team."
  },
  {
    question: "How do I request a laptop rental quotation?",
    answer: "Simply send us a message on WhatsApp detailing your required quantity, rental dates, location, and technical specifications. Our team will review your requirement and share available options along with a custom quotation."
  }
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default async function LaptopRentalPage() {
  // Fetch up to 6 laptops to showcase as examples. 
  // We use the existing catalog but present them strictly as "examples".
  let products: RepositoryProduct[] = [];
  try {
    const res = await getProductsByCategory("laptops", 1, 6);
    products = res.products;
  } catch (err) {
    console.error("Laptop Rental page failed to load example products:", err);
  }

  return (
    <div className="flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />

      {/* WhatsApp Floating Button with custom message */}
      <WhatsAppButton phoneNumber="923318852808" message={whatsappMessage} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-navy py-20 text-white sm:py-32 lg:py-40">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/hero/laptop-rental-hero.jpg" 
            alt="Laptops deployed at a large corporate event in Pakistan"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          {/* Desktop: gradient that is very dark on the left (where text is) and fades right */}
          <div className="absolute inset-0 hidden bg-gradient-to-r from-navy/95 via-navy/80 to-navy/30 sm:block" />
          {/* Mobile: darker overall so stacked text remains readable over the image */}
          <div className="absolute inset-0 bg-gradient-to-b from-navy/90 via-navy/80 to-navy/50 sm:hidden" />
        </div>
        <Container className="relative z-10">
          <div className="max-w-2xl text-left">
            <FadeIn>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Laptop Rental in Pakistan
                <span className="mt-2 block text-2xl font-medium text-light-gray sm:text-3xl lg:mt-4">
                  Affordable Laptops on Rent
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-slate-300 sm:text-xl leading-relaxed">
                Based in Islamabad, i.Link provides laptop rental services for events, seminars, conferences, corporate training, workshops and temporary business requirements, with rental support for customers across Pakistan.
              </p>
              
              <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Button href={whatsappUrl} target="_blank" rel="noopener noreferrer" variant="primary" size="lg" className="w-full sm:w-auto font-bold bg-[#25D366] hover:bg-[#20b958] border-none text-white">
                  Get Rental Quote on WhatsApp
                </Button>
                <Button href="/business/quotation" variant="secondary" size="lg" className="w-full sm:w-auto border-white/20 bg-white/5 text-white hover:bg-white/10">
                  Business Quotation Form
                </Button>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Pricing & Value Proposition Section */}
      <section className="bg-soft-gray py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 sm:p-12 premium-shadow text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold text-navy">Laptop Rental Pricing</h2>
              <div className="mt-6 flex flex-col items-center justify-center gap-3">
                <span className="text-sm font-bold uppercase tracking-widest text-slate">Indicative Rates</span>
                <span className="text-4xl font-extrabold text-royal sm:text-5xl">
                  PKR 1,000 - 2,500
                </span>
                <span className="text-lg font-medium text-slate">per laptop / per day</span>
              </div>
              <p className="mt-6 text-base text-slate leading-relaxed">
                Rental rates vary depending on laptop model and specifications, quantity, rental duration, location and event requirements.
              </p>
              <div className="mt-6 inline-flex rounded-xl bg-royal/10 px-6 py-3 text-sm font-semibold text-royal">
                Need a larger quantity or longer rental period? Contact us for customized rental rates.
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Simple Process"
            title="How It Works"
            description="Getting laptops on rent is straightforward and tailored to your specific needs."
          />
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Share Your Requirement",
                description: "Tell us the quantity, dates, location and required laptop specifications.",
              },
              {
                step: "02",
                title: "Get a Custom Quote",
                description: "We review the requirement and provide suitable options and pricing.",
              },
              {
                step: "03",
                title: "Confirm Your Rental",
                description: "Once the requirement and quotation are agreed, we arrange the rental accordingly.",
              },
            ].map((s, i) => (
              <FadeIn key={s.step} delay={i * 100} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-royal/10 text-xl font-bold text-royal">
                  {s.step}
                </div>
                <h3 className="mt-6 text-xl font-bold text-navy">{s.title}</h3>
                <p className="mt-3 text-slate leading-relaxed">{s.description}</p>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      {/* Use Cases Section */}
      <section className="bg-soft-gray py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Corporate & Event Solutions"
            title="Rental for Events & Bulk Requirements"
            description="We support organizations needing multiple laptops for specialized use cases. Contact us with your quantity, dates, location, and specifications for a customized quotation."
          />
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <FadeIn key={useCase.title} delay={index * 50} className="rounded-2xl border border-light-gray bg-white p-8 premium-shadow transition-shadow hover:shadow-xl">
                  <div className="inline-flex rounded-xl bg-royal/10 p-3 text-royal">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-navy">{useCase.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate">{useCase.description}</p>
                </FadeIn>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-20 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <FadeIn>
              <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
                Why Rent from i.Link?
              </h2>
              <p className="mt-4 text-lg text-slate leading-relaxed">
                Whether you need laptops for a short seminar or an extended corporate training session, we offer reliable equipment and customized solutions.
              </p>
              <ul className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-royal" aria-hidden="true" />
                    <span className="text-navy font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Button href={whatsappUrl} target="_blank" rel="noopener noreferrer" variant="primary">
                  Discuss Your Requirement
                </Button>
              </div>
            </FadeIn>
            <FadeIn className="relative h-[400px] lg:h-[500px] overflow-hidden rounded-3xl premium-shadow">
              {/* Fallback image style using a solid color/gradient as an abstract placeholder if no specific image exists, but we can just use a standard placeholder or decorative div since we don't have a guaranteed rental image */}
              <div className="absolute inset-0 bg-gradient-to-br from-navy to-royal opacity-90" />
              <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
                <p className="text-2xl font-bold text-white/90 leading-snug">Empowering your business with temporary IT infrastructure.</p>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Examples / Catalog Preview */}
      {products.length > 0 && (
        <section className="bg-soft-gray py-20 sm:py-24">
          <Container>
            <SectionHeading
              eyebrow="Available Options"
              title="Example Laptop Options"
              description="Some laptop models that may be available for rental. Availability remains subject to your specific rental requirement and current stock."
            />
            <div className="mt-16 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
              {products.map((product) => (
                <FadeIn key={product.id}>
                  {/* Reuse the existing product card for visual display */}
                  <ProductCard product={product} />
                </FadeIn>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* FAQ Section */}
      <section className="bg-white py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-3xl">
            <SectionHeading
              eyebrow="Questions?"
              title="Frequently Asked Questions"
              description="Common questions about our laptop rental service in Pakistan."
            />
            <div className="mt-12">
              <Accordion items={faqs} />
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-navy py-20 text-center text-white sm:py-24">
        <Container className="relative z-10">
          <FadeIn>
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Need Laptops for Your Event or Business?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
              Tell us your quantity, rental dates, location and required specifications and we&apos;ll help you find a suitable rental option.
            </p>
            <div className="mt-10 flex justify-center">
              <Button href={whatsappUrl} target="_blank" rel="noopener noreferrer" variant="primary" size="lg" className="font-bold bg-[#25D366] hover:bg-[#20b958] border-none text-white">
                Get Rental Quote on WhatsApp
              </Button>
            </div>
          </FadeIn>
        </Container>
      </section>
    </div>
  );
}
