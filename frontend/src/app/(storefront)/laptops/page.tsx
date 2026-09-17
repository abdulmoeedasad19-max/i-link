import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch, Laptop, GraduationCap, Briefcase, Building2 } from "lucide-react";
import Container from "@/components/ui/container";
import SectionHeading from "@/components/ui/section-heading";
import ProductCard from "@/components/sections/product-card";
import Pagination from "@/components/ui/pagination";
import { getProductsByCategory } from "@/lib/products-repository";
import { siteConfig } from "@/lib/site-config";
import { safeJsonLd } from "@/lib/utils";

const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: "Laptops in Pakistan | Buy Laptops Online - i.Link Systems",
  description: "Shop the best laptops in Pakistan at i.Link Systems. Find HP, Dell, and Lenovo laptops for students, business, office, and professionals at great prices.",
  alternates: {
    canonical: "/laptops",
  },
};

export default async function LaptopsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams.page;
  let page = typeof pageParam === "string" ? parseInt(pageParam, 10) : 1;
  if (isNaN(page) || page < 1) page = 1;

  const { products, total } = await getProductsByCategory("laptops", page, PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const canonicalPath = page > 1 ? `/laptops?page=${page}` : `/laptops`;
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Laptops in Pakistan",
    description: "Shop the best laptops in Pakistan at i.Link Systems. Find HP, Dell, and Lenovo laptops for students, business, office, and professionals at great prices.",
    url: canonicalUrl,
    ...(products.length > 0 && {
      mainEntity: {
        "@type": "ItemList",
        itemListElement: products.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name: product.name,
            url: `${siteConfig.url}/product/${product.slug}`,
            image: `${siteConfig.url}${product.image}`,
            ...(product.sku ? { sku: product.sku } : {}),
            ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
            offers: {
              "@type": "Offer",
              url: `${siteConfig.url}/product/${product.slug}`,
              priceCurrency: "PKR",
              price: String(product.price),
              availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              ...(product.tags.some(t => t.toLowerCase().includes("used") || t.toLowerCase().includes("refurbished"))
                ? { itemCondition: "https://schema.org/UsedCondition" }
                : product.tags.some(t => t.toLowerCase().includes("new"))
                ? { itemCondition: "https://schema.org/NewCondition" }
                : {}),
            }
          }
        }))
      }
    })
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteConfig.url}/` },
      { "@type": "ListItem", position: 2, name: "Laptops", item: canonicalUrl },
    ],
  };

  return (
    <div className="pb-16 pt-8 sm:pb-24 sm:pt-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      
      <Container>
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-slate">
          <Link href="/" className="hover:text-royal">Home</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="font-medium text-navy">Laptops</span>
        </nav>

        <div className="mb-12">
          <SectionHeading 
            as="h1" 
            title="Laptops in Pakistan" 
            description="i.Link Systems offers a wide range of laptops in Pakistan for university students, office professionals, business users, and everyday home users. Explore top brands like HP, Dell, and Lenovo with competitive pricing and reliable warranties." 
          />
        </div>

        {/* Use Cases Navigation */}
        <div className="mb-16">
          <h2 className="mb-6 text-xl font-bold text-navy">Shop Laptops by Use</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link href="/laptops/student" className="group flex items-center gap-4 rounded-xl border border-light-gray bg-white p-5 transition-all hover:border-royal hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-royal/10 text-royal group-hover:bg-royal group-hover:text-white transition-colors">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-navy">Student Laptops</h3>
                <p className="text-sm text-slate">Affordable & reliable for studies</p>
              </div>
            </Link>
            
            <Link href="/laptops/business" className="group flex items-center gap-4 rounded-xl border border-light-gray bg-white p-5 transition-all hover:border-royal hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-royal/10 text-royal group-hover:bg-royal group-hover:text-white transition-colors">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-navy">Business Laptops</h3>
                <p className="text-sm text-slate">Premium security & performance</p>
              </div>
            </Link>

            <Link href="/laptops/office" className="group flex items-center gap-4 rounded-xl border border-light-gray bg-white p-5 transition-all hover:border-royal hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-royal/10 text-royal group-hover:bg-royal group-hover:text-white transition-colors">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-navy">Office Laptops</h3>
                <p className="text-sm text-slate">Durable for daily work tasks</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Brands Navigation */}
        <div className="mb-16">
          <h2 className="mb-6 text-xl font-bold text-navy">Shop Laptops by Brand</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/brands/hp" className="rounded-full border border-light-gray bg-white px-6 py-2.5 text-sm font-medium text-navy transition-colors hover:border-royal hover:text-royal">
              HP Laptops
            </Link>
            <Link href="/brands/dell" className="rounded-full border border-light-gray bg-white px-6 py-2.5 text-sm font-medium text-navy transition-colors hover:border-royal hover:text-royal">
              Dell Laptops
            </Link>
            <Link href="/brands/lenovo" className="rounded-full border border-light-gray bg-white px-6 py-2.5 text-sm font-medium text-navy transition-colors hover:border-royal hover:text-royal">
              Lenovo Laptops
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        <h2 className="mb-6 text-2xl font-bold text-navy">All Laptops</h2>
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 4} />
              ))}
            </div>
            
            <div className="mt-12">
              <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                baseHref={`/laptops`} 
              />
            </div>
          </>
        ) : (
          <div className="mx-auto mt-12 flex max-w-md flex-col items-center rounded-2xl border border-light-gray bg-soft-gray px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-royal/10 text-royal">
              <PackageSearch className="h-7 w-7" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-navy">
              More laptops coming soon
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate">
              We&apos;re adding new products. Contact our sales team for current availability.
            </p>
          </div>
        )}

        {/* SEO Content Section */}
        <div className="mt-24 space-y-12 border-t border-light-gray pt-16">
          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">Laptop Price in Pakistan</h2>
            <div className="prose prose-slate max-w-none text-slate">
              <p>
                When searching for a laptop price in Pakistan, it's important to understand that costs vary significantly based on specifications and condition. Whether you are buying a brand new machine or a certified pre-owned unit, the final price depends on:
              </p>
              <ul className="mt-4 space-y-2">
                <li><strong>Processor & Generation:</strong> Newer Intel Core i5 and i7 generations (or AMD Ryzen equivalents) command higher prices due to their enhanced speed and efficiency.</li>
                <li><strong>RAM & Storage:</strong> Laptops with 16GB RAM and NVMe SSDs offer superior performance but increase the baseline cost compared to standard 8GB/HDD configurations.</li>
                <li><strong>Display & Graphics:</strong> High-resolution IPS displays and dedicated GPUs (such as NVIDIA) add a premium to the laptop price in Pakistan, essential for creators and designers.</li>
                <li><strong>Brand & Build Quality:</strong> Premium business lines like Lenovo ThinkPad, HP EliteBook, and Dell Latitude feature military-grade durability, which retains value longer than entry-level consumer plastics.</li>
              </ul>
              <p className="mt-4">
                At i.Link Systems, we offer transparent pricing. We stock a variety of budget-friendly laptops under PKR 100,000 for students and small businesses, scaling up to high-end enterprise machines for demanding professionals.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">How to Choose the Right Laptop</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">For Students</h3>
                <p className="text-sm text-slate leading-relaxed">
                  Students need portability, long battery life, and durability for carrying between classes. Look for at least an Intel Core i3 or i5, 8GB RAM, and a fast SSD. A 13 or 14-inch display is highly recommended for mobility.
                </p>
              </div>
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">For Office & Business</h3>
                <p className="text-sm text-slate leading-relaxed">
                  Office laptops must handle multitasking, video conferencing, and extensive typing. Business laptops (like Dell Latitudes or HP ProBooks) offer better keyboards, extended warranties, and crucial security features like fingerprint readers.
                </p>
              </div>
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">For Developers & Creatives</h3>
                <p className="text-sm text-slate leading-relaxed">
                  Programmers need powerful CPUs (Core i7 or Ryzen 7) and ample RAM (16GB minimum) for running local environments and containers. Creatives should prioritize high-gamut color accuracy and potential dedicated graphics.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="border border-light-gray rounded-xl p-5">
                <h3 className="font-bold text-navy">Which laptop brand is best for business use in Pakistan?</h3>
                <p className="mt-2 text-sm text-slate">Lenovo (ThinkPad series), HP (EliteBook series), and Dell (Latitude series) are considered the industry standards for business use due to their enterprise-grade security, excellent keyboards, and durable build quality.</p>
              </div>
              <div className="border border-light-gray rounded-xl p-5">
                <h3 className="font-bold text-navy">Does i.Link Systems provide a warranty?</h3>
                <p className="mt-2 text-sm text-slate">Yes, all our laptops are genuine and backed by official manufacturer warranties or our specific store warranty, depending on the exact product and condition. Detailed warranty information is available on every product page.</p>
              </div>
              <div className="border border-light-gray rounded-xl p-5">
                <h3 className="font-bold text-navy">Can I upgrade the RAM or Storage later?</h3>
                <p className="mt-2 text-sm text-slate">Many business and office laptops allow for RAM and storage upgrades. However, some modern thin-and-light models have soldered memory. We recommend checking the individual product specifications or contacting our sales team to confirm upgradability before purchase.</p>
              </div>
            </div>
          </section>
        </div>

      </Container>
    </div>
  );
}

