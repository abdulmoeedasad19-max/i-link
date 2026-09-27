import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import Container from "@/components/ui/container";
import SectionHeading from "@/components/ui/section-heading";
import ProductCard from "@/components/sections/product-card";
import Pagination from "@/components/ui/pagination";
import { getLaptopsByMaxPrice } from "@/lib/products-repository";
import { siteConfig } from "@/lib/site-config";
import { safeJsonLd } from "@/lib/utils";

const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: "Laptops Under PKR 50,000 in Pakistan | i.Link Systems",
  description: "Find affordable laptops under 50,000 in Pakistan. Browse our dynamically updated inventory of budget-friendly active laptops.",
  alternates: {
    canonical: "/laptops/under-50000",
  },
};

export default async function LaptopsUnder50kPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams.page;
  let page = typeof pageParam === "string" ? parseInt(pageParam, 10) : 1;
  if (isNaN(page) || page < 1) page = 1;

  const { products, total } = await getLaptopsByMaxPrice(50000, page, PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const canonicalPath = page > 1 ? `/laptops/under-50000?page=${page}` : `/laptops/under-50000`;
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Laptops Under PKR 50,000 in Pakistan",
    description: "Find affordable laptops under 50,000 in Pakistan. Browse our dynamically updated inventory of budget-friendly active laptops.",
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
            offers: {
              "@type": "Offer",
              priceCurrency: "PKR",
              price: String(product.price),
              availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
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
      { "@type": "ListItem", position: 2, name: "Laptops", item: `${siteConfig.url}/laptops` },
      { "@type": "ListItem", position: 3, name: "Under 50,000", item: canonicalUrl },
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
          <Link href="/laptops" className="hover:text-royal">Laptops</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="font-medium text-navy">Under 50,000</span>
        </nav>

        <div className="mb-12">
          <SectionHeading 
            as="h1" 
            title="Laptops Under PKR 50,000 in Pakistan" 
            description="Explore our current inventory of laptops priced under PKR 50,000. These listings are dynamically generated from our active product catalog, offering excellent value for budget-conscious buyers." 
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/laptops" className="rounded-full border border-light-gray bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-royal hover:text-royal">
              All Laptops
            </Link>
            <Link href="/laptops/under-75000" className="rounded-full border border-light-gray bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-royal hover:text-royal">
              Under 75,000
            </Link>
          </div>
        </div>

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
                baseHref={`/laptops/under-50000`} 
              />
            </div>
          </>
        ) : (
          <div className="mx-auto mt-12 flex max-w-md flex-col items-center rounded-2xl border border-light-gray bg-soft-gray px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-royal/10 text-royal">
              <PackageSearch className="h-7 w-7" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-navy">
              No laptops found
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate">
              We currently don't have any active laptops under PKR 50,000.
            </p>
          </div>
        )}
        
        {/* SEO Content Section */}
        <div className="mt-24 space-y-12 border-t border-light-gray pt-16">
          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">What to Expect Under 50,000 PKR</h2>
            <div className="prose prose-slate max-w-none text-slate">
              <p>
                Finding a laptop under PKR 50,000 in Pakistan usually means exploring the refurbished or slightly older pre-owned market. At this price point, you are looking at practical, budget-friendly options designed for basic daily tasks rather than heavy computational workloads. These machines are often excellent choices for young <Link href="/laptops/student" className="text-royal hover:underline">students</Link> or small businesses needing simple data entry devices.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">Realistic Specifications in this Budget</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">Performance Limitations</h3>
                <p className="text-sm text-slate leading-relaxed">
                  Laptops in this range typically feature older generation Intel Core i3 or i5 processors. You can generally expect 4GB to 8GB of RAM. While this is sufficient for web browsing, watching videos, and basic Microsoft Office work, heavy multitasking or modern gaming will be limited.
                </p>
              </div>
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">Storage & Upgrades</h3>
                <p className="text-sm text-slate leading-relaxed">
                  Many options in this tier might come with traditional Hard Drives (HDDs) or smaller 128GB Solid State Drives (SSDs). We highly recommend prioritizing models with an SSD (even a smaller one) as it significantly improves the overall speed and responsiveness of the laptop.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">Considering a Higher Budget?</h2>
            <div className="prose prose-slate max-w-none text-slate mb-6">
              <p>
                If your work requires running multiple applications smoothly or you need a machine that will last through four years of university, you may want to increase your budget slightly. Exploring our <Link href="/laptops/under-75000" className="text-royal hover:underline">laptops under 75,000</Link> or <Link href="/laptops/under-100000" className="text-royal hover:underline">laptops under 100,000</Link> will unlock significantly better processors, standard 8GB/16GB RAM configurations, and much faster storage.
              </p>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}

