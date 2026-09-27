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
  title: "Laptops Under PKR 100,000 in Pakistan | i.Link Systems",
  description: "Find high-quality laptops under 100,000 in Pakistan. Browse our dynamically updated inventory of excellent mid-tier active laptops.",
  alternates: {
    canonical: "/laptops/under-100000",
  },
};

export default async function LaptopsUnder100kPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams.page;
  let page = typeof pageParam === "string" ? parseInt(pageParam, 10) : 1;
  if (isNaN(page) || page < 1) page = 1;

  const { products, total } = await getLaptopsByMaxPrice(100000, page, PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const canonicalPath = page > 1 ? `/laptops/under-100000?page=${page}` : `/laptops/under-100000`;
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Laptops Under PKR 100,000 in Pakistan",
    description: "Find high-quality laptops under 100,000 in Pakistan. Browse our dynamically updated inventory of excellent mid-tier active laptops.",
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
      { "@type": "ListItem", position: 3, name: "Under 100,000", item: canonicalUrl },
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
          <span className="font-medium text-navy">Under 100,000</span>
        </nav>

        <div className="mb-12">
          <SectionHeading 
            as="h1" 
            title="Laptops Under PKR 100,000 in Pakistan" 
            description="Explore our current inventory of laptops priced under PKR 100,000. These listings are dynamically generated from our active product catalog, offering strong performance for professionals and students." 
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/laptops/under-75000" className="rounded-full border border-light-gray bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-royal hover:text-royal">
              Under 75,000
            </Link>
            <Link href="/laptops/under-150000" className="rounded-full border border-light-gray bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-royal hover:text-royal">
              Under 150,000
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
                baseHref={`/laptops/under-100000`} 
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
              We currently don't have any active laptops under PKR 100,000.
            </p>
          </div>
        )}
        
        {/* SEO Content Section */}
        <div className="mt-24 space-y-12 border-t border-light-gray pt-16">
          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">What to Expect Under 100,000 PKR</h2>
            <div className="prose prose-slate max-w-none text-slate">
              <p>
                A budget of PKR 100,000 opens up a versatile tier of laptops in Pakistan. At this price point, you move past entry-level compromises and can find highly capable <Link href="/laptops/office" className="text-royal hover:underline">office laptops</Link> or premium refurbished <Link href="/laptops/business" className="text-royal hover:underline">business laptops</Link>. This range is widely considered the sweet spot for professional users, university students with heavier workloads, and developers who need reliable daily drivers.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">Realistic Specifications in this Budget</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">Processors (CPU)</h3>
                <p className="text-sm text-slate leading-relaxed">
                  In this budget, you will frequently encounter modern Intel Core i5 and i7 processors (8th generation and above), as well as capable AMD Ryzen 5 and 7 series chips. These processors easily handle intensive multitasking, large spreadsheets, and basic coding tasks without noticeable lag.
                </p>
              </div>
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">RAM & Storage</h3>
                <p className="text-sm text-slate leading-relaxed">
                  8GB of RAM is standard here, but it is very common to find models equipped with 16GB. For storage, fast NVMe Solid State Drives (SSDs) are the norm, usually ranging from 256GB to a much more comfortable 512GB, ensuring fast boot times and ample space for applications.
                </p>
              </div>
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">Build Quality</h3>
                <p className="text-sm text-slate leading-relaxed">
                  You can expect superior build materials. Many options under 100k include aluminum chassis, spill-resistant keyboards, and Full HD IPS displays. Premium lines from <Link href="/brands/hp" className="text-royal hover:underline">HP</Link>, <Link href="/brands/dell" className="text-royal hover:underline">Dell</Link>, and <Link href="/brands/lenovo" className="text-royal hover:underline">Lenovo</Link> are prominent in this segment.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">Is this the Right Range for You?</h2>
            <div className="prose prose-slate max-w-none text-slate mb-6">
              <p>
                If your primary use is basic web browsing or simple school assignments, you might save money by browsing our <Link href="/laptops/under-50000" className="text-royal hover:underline">laptops under 50,000</Link>. However, if you rely on your laptop for professional work, <Link href="/laptops/programming" className="text-royal hover:underline">programming</Link>, or running moderately heavy software, investing up to PKR 100,000 ensures you get a machine that will remain fast and reliable for years to come.
              </p>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}

