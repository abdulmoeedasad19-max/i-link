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
  title: "Laptops Under PKR 150,000 in Pakistan | i.Link Systems",
  description: "Find premium laptops under 150,000 in Pakistan. Browse our dynamically updated inventory of high-performance active laptops.",
  alternates: {
    canonical: "/laptops/under-150000",
  },
};

export default async function LaptopsUnder150kPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams.page;
  let page = typeof pageParam === "string" ? parseInt(pageParam, 10) : 1;
  if (isNaN(page) || page < 1) page = 1;

  const { products, total } = await getLaptopsByMaxPrice(150000, page, PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const canonicalPath = page > 1 ? `/laptops/under-150000?page=${page}` : `/laptops/under-150000`;
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Laptops Under PKR 150,000 in Pakistan",
    description: "Find premium laptops under 150,000 in Pakistan. Browse our dynamically updated inventory of high-performance active laptops.",
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
      { "@type": "ListItem", position: 3, name: "Under 150,000", item: canonicalUrl },
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
          <span className="font-medium text-navy">Under 150,000</span>
        </nav>

        <div className="mb-12">
          <SectionHeading 
            as="h1" 
            title="Laptops Under PKR 150,000 in Pakistan" 
            description="Explore our current inventory of laptops priced under PKR 150,000. These listings are dynamically generated from our active product catalog, featuring premium builds and higher specifications." 
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/laptops/under-100000" className="rounded-full border border-light-gray bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-royal hover:text-royal">
              Under 100,000
            </Link>
            <Link href="/laptops" className="rounded-full border border-light-gray bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-royal hover:text-royal">
              All Laptops
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
                baseHref={`/laptops/under-150000`} 
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
              We currently don't have any active laptops under PKR 150,000.
            </p>
          </div>
        )}
        
        {/* SEO Content Section */}
        <div className="mt-24 space-y-12 border-t border-light-gray pt-16">
          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">What to Expect Under 150,000 PKR</h2>
            <div className="prose prose-slate max-w-none text-slate">
              <p>
                A budget of PKR 150,000 places you in the premium tier of our refurbished and enterprise laptop inventory. At this price, you move significantly beyond basic computing. This category is dedicated to high-performance machines designed for heavy <Link href="/laptops/business" className="text-royal hover:underline">business</Link> multitasking, complex <Link href="/laptops/programming" className="text-royal hover:underline">programming</Link> workloads, and professionals who demand uncompromised reliability from their daily driver.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">Hardware Capabilities in this Tier</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">Modern Processors & High RAM</h3>
                <p className="text-sm text-slate leading-relaxed">
                  Laptops under 150k typically feature newer 10th or 11th generation Intel Core i5 and i7 processors (or their AMD Ryzen equivalents). Crucially, 16GB of RAM is the standard expectation here, providing vast headroom for running local servers, virtual machines, and massive datasets simultaneously without slowdowns.
                </p>
              </div>
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">Premium Enterprise Lines</h3>
                <p className="text-sm text-slate leading-relaxed">
                  Our inventory in this bracket is dominated by top-tier enterprise models like the <Link href="/brands/dell" className="text-royal hover:underline">Dell Latitude 7000 series</Link>, <Link href="/brands/hp" className="text-royal hover:underline">HP EliteBook 800 series</Link>, and <Link href="/brands/lenovo" className="text-royal hover:underline">Lenovo ThinkPad T-Series</Link>. These models offer superior thermal management, exceptional keyboards, and advanced security features (like facial recognition and TPM chips) compared to models found in the <Link href="/laptops/under-100000" className="text-royal hover:underline">under 100,000</Link> range.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">A Note on Dedicated Graphics</h2>
            <div className="prose prose-slate max-w-none text-slate mb-6">
              <p>
                While these laptops offer incredible CPU processing power, it is important to note that most premium business laptops rely on powerful integrated graphics (like Intel Iris Xe) rather than dedicated GPUs. They easily handle 4K video playback and light photo editing, but if your work explicitly requires rendering 3D models or heavy machine learning tasks, you should specifically look for our <Link href="/laptops/gaming" className="text-royal hover:underline">gaming or workstation laptops</Link> which feature dedicated NVIDIA or AMD chips.
              </p>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}

