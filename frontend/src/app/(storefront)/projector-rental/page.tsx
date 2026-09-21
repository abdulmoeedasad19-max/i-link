import type { Metadata } from "next";
import Image from "next/image";
import Container from "@/components/ui/container";
import SectionHeading from "@/components/ui/section-heading";
import FadeIn from "@/components/ui/fade-in";
import Button from "@/components/ui/button";
import Accordion from "@/components/ui/accordion";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { Building2, Calendar, Monitor, Users, Briefcase, GraduationCap, CheckCircle2 } from "lucide-react";
import { safeJsonLd } from "@/lib/utils";

const canonicalPath = "/projector-rental";

export const metadata: Metadata = {
  title: "Projector Rental in Pakistan | Projectors on Rent | i.Link",
  description: "Rent projectors in Pakistan for meetings, seminars, conferences, corporate training, workshops, presentations and events. Contact i.Link for a customized projector rental quotation.",
  alternates: { canonical: canonicalPath },
  openGraph: {
    type: "website",
    title: "Projector Rental in Pakistan | Projectors on Rent | i.Link",
    description: "Rent projectors in Pakistan for meetings, seminars, conferences, corporate training, workshops, presentations and events. Contact i.Link for a customized projector rental quotation.",
    url: canonicalPath,
  },
  twitter: {
    card: "summary",
    title: "Projector Rental in Pakistan | Projectors on Rent | i.Link",
    description: "Rent projectors in Pakistan for meetings, seminars, conferences, corporate training, workshops, presentations and events. Contact i.Link for a customized projector rental quotation.",
  },
};

const whatsappMessage = "Hi i.Link, I am interested in renting a projector. Please share available options and a quotation. Quantity, rental dates, location and required specifications can be discussed.";
const whatsappUrl = `https://wa.me/923318852808?text=${encodeURIComponent(whatsappMessage)}`;

const useCases = [
  { title: "Meetings", icon: Briefcase, description: "Ensure your critical client meetings and executive presentations make an impact with reliable projector equipment." },
  { title: "Seminars & Conferences", icon: Users, description: "Equip your conference rooms and guest speakers with multimedia projectors suited for large audiences." },
  { title: "Corporate Training", icon: GraduationCap, description: "Enhance your employee training workshops and certification programs with clear, large-scale visual presentations." },
  { title: "Workshops", icon: Building2, description: "Perfect for interactive workshops where detailed visual aids and collaborative viewing are required." },
  { title: "Events", icon: Calendar, description: "Versatile projector rental for temporary business requirements, exhibitions, and corporate gatherings." },
  { title: "Educational Programs", icon: Monitor, description: "Cost-effective projector options for schools, universities, and specialized short-term educational courses." },
];

const benefits = [
  "Personalized rental quotations",
  "Suitable for business and event requirements",
  "Flexible quantity requirements",
  "Short-term and longer-duration enquiries",
  "Direct WhatsApp communication",
  "Islamabad-based business",
  "Requirements handled manually to ensure quality service",
];

const faqs = [
  {
    question: "How much does it cost to rent a projector in Pakistan?",
    answer: "Projector rental pricing depends on the projector type and specifications, rental duration, quantity, location, and event or presentation requirements. Please contact us for a customized quotation."
  },
  {
    question: "Do you provide projectors on rent in Islamabad?",
    answer: "Yes, i.Link is based in Islamabad and we provide projector rental services. You can contact us with your requirement for a custom quote."
  },
  {
    question: "Can I rent a projector for a meeting?",
    answer: "Yes, renting a projector is an excellent choice for client meetings, presentations, and corporate discussions where visual aids are required temporarily."
  },
  {
    question: "Can I rent projectors for seminars and conferences?",
    answer: "Absolutely. We can accommodate requirements for seminars and conferences. Tell us your venue size and audience requirements so we can discuss suitable options."
  },
  {
    question: "Do you provide projector rental for corporate training?",
    answer: "Yes, we handle enquiries for corporate training programs and workshops. Let us know the dates and location of your training session."
  },
  {
    question: "Can I rent multiple projectors for an event?",
    answer: "Yes, we can discuss bulk requirements for larger events. Please provide the quantity and usage requirements when requesting a quote."
  },
  {
    question: "How do I request a projector rental quotation?",
    answer: "You can request a quotation by sending us a message on WhatsApp or by filling out our Business Quotation form with your required quantity, dates, and specifications."
  },
  {
    question: "What information should I provide when requesting a projector rental?",
    answer: "To get an accurate quote, please provide the required quantity, rental dates, location, venue size, room lighting conditions, and any specific technical requirements."
  },
  {
    question: "Do you offer projector rental for longer durations?",
    answer: "Yes, we consider both short-term and extended rental durations. Get in touch with us to discuss your longer-term requirements."
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

export default function ProjectorRentalPage() {
  return (
    <div className="flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />

      {/* WhatsApp Floating Button with custom message */}
      <WhatsAppButton phoneNumber="923318852808" message={whatsappMessage} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-navy py-20 text-white sm:py-32 lg:py-40">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/hero/projector-rental-hero.jpg" 
            alt="Multimedia projector projecting a bright image onto a screen in a corporate meeting room"
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
                Projector Rental in Pakistan
                <span className="mt-2 block text-2xl font-medium text-light-gray sm:text-3xl lg:mt-4">
                  Projectors on Rent for Meetings, Events & Presentations
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-slate-300 sm:text-xl leading-relaxed">
                Based in Islamabad, i.Link provides projector rental services for meetings, seminars, conferences, corporate training, workshops, and temporary business requirements. Depending on the requirement, we can handle requests across Pakistan.
              </p>
              
              <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Button href={whatsappUrl} target="_blank" rel="noopener noreferrer" variant="primary" size="lg" className="w-full sm:w-auto font-bold bg-[#25D366] hover:bg-[#20b958] border-none text-white">
                  Get Projector Rental Quote on WhatsApp
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
              <h2 className="text-3xl font-bold text-navy">Projector Rental Pricing</h2>
              <p className="mt-6 text-base text-slate leading-relaxed">
                Projector rental pricing depends on the projector type and specifications, rental duration, quantity, location, and event or presentation requirements.
              </p>
              <div className="mt-8 flex justify-center">
                <Button href={whatsappUrl} target="_blank" rel="noopener noreferrer" variant="primary" size="lg" className="font-bold">
                  Request a Projector Rental Quote
                </Button>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* SEO / Content Section */}
      <section className="bg-white py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold text-navy">Projector Rental for Events & Business</h2>
              <p className="mt-6 text-lg text-slate leading-relaxed">
                Whether you need a multimedia projector rental for meetings, seminars, conferences, corporate training, workshops, or presentations, renting equipment temporarily is often more cost-effective than purchasing. Based in Islamabad, we can discuss projector rental options and customize a quotation based on your specific use case. Customers can discuss requirements for locations across Pakistan.
              </p>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* What Determines the Right Projector? */}
      <section className="bg-soft-gray py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold text-navy">What Determines the Right Projector?</h2>
              <p className="mt-4 text-lg text-slate leading-relaxed">
                Tell us about your venue, audience size, presentation requirements and rental duration, and we can discuss suitable projector options for your requirement based on factors such as:
              </p>
            </FadeIn>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 text-left">
              {[
                "Presentation/content type",
                "Venue size",
                "Room lighting",
                "Required image size",
                "Resolution requirements",
                "Brightness requirements",
                "Rental duration",
                "Number of units required",
                "Location",
                "Event requirements"
              ].map((factor, index) => (
                <FadeIn key={factor} delay={index * 50} className="flex items-center gap-3 rounded-lg bg-white p-4 premium-shadow">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-royal" aria-hidden="true" />
                  <span className="font-medium text-navy">{factor}</span>
                </FadeIn>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Simple Process"
            title="How It Works"
            description="Getting a projector on rent is straightforward and tailored to your specific needs."
          />
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Share Your Requirement",
                description: "Tell us the quantity, rental dates, location and intended use.",
              },
              {
                step: "02",
                title: "Get a Custom Quote",
                description: "We discuss suitable options and provide a quotation based on your requirements.",
              },
              {
                step: "03",
                title: "Confirm Your Rental",
                description: "Once the requirements and quotation are agreed, finalize the rental arrangement with i.Link.",
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
            title="Who We Serve"
            description="We support organizations needing projectors for specialized use cases. Contact us with your requirements for a customized quotation."
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
                Why Choose i.Link?
              </h2>
              <p className="mt-4 text-lg text-slate leading-relaxed">
                Whether you need a projector for a short seminar or an extended corporate training session, we offer tailored support and customized solutions.
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
              <div className="absolute inset-0 bg-gradient-to-br from-navy to-royal opacity-90" />
              <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
                <p className="text-2xl font-bold text-white/90 leading-snug">Empowering your presentations with temporary audiovisual solutions.</p>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* No Fake Product Section */}
      <section className="bg-soft-gray py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 sm:p-12 premium-shadow text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold text-navy">Need a Projector for Your Requirement?</h2>
              <p className="mt-6 text-lg text-slate leading-relaxed">
                Customers can contact i.Link directly with their specific presentation requirements. We will review your needs and provide suitable projector options along with a customized quotation.
              </p>
              <div className="mt-8">
                <Button href="/business/quotation" variant="primary" size="lg">
                  Submit a Quotation Request
                </Button>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-3xl">
            <SectionHeading
              eyebrow="Questions?"
              title="Frequently Asked Questions"
              description="Common questions about our projector rental service in Pakistan."
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
              Need a Projector for Your Next Meeting or Event?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
              Tell us your quantity, rental dates, location, required specifications and event use case, and we&apos;ll help you find a suitable rental option.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Button href={whatsappUrl} target="_blank" rel="noopener noreferrer" variant="primary" size="lg" className="font-bold bg-[#25D366] hover:bg-[#20b958] border-none text-white">
                Get Projector Rental Quote on WhatsApp
              </Button>
              <Button href="/business/quotation" variant="secondary" size="lg" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                Business Quotation Form
              </Button>
            </div>
          </FadeIn>
        </Container>
      </section>
    </div>
  );
}

