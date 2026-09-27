import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import Container from "@/components/ui/container";
import SectionHeading from "@/components/ui/section-heading";
import ProductCard from "@/components/sections/product-card";
import Pagination from "@/components/ui/pagination";
import { getProductsByCollectionSlug } from "@/lib/products-repository";
import { siteConfig } from "@/lib/site-config";
import { safeJsonLd } from "@/lib/utils";

const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: "Business Laptops in Pakistan | Professional & Enterprise | i.Link Systems",
  description: "Shop premium business laptops in Pakistan. Find secure and durable laptops like Lenovo ThinkPad, HP EliteBook, and Dell Latitude for professionals.",
  alternates: {
    canonical: "/laptops/business",
  },
};

export default async function BusinessLaptopsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams.page;
  let page = typeof pageParam === "string" ? parseInt(pageParam, 10) : 1;
  if (isNaN(page) || page < 1) page = 1;

  const { products, total } = await getProductsByCollectionSlug("business", page, PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const canonicalPath = page > 1 ? `/laptops/business?page=${page}` : `/laptops/business`;
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Business Laptops in Pakistan",
    description: "Shop premium business laptops in Pakistan. Find secure and durable laptops like Lenovo ThinkPad, HP EliteBook, and Dell Latitude for professionals.",
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
      { "@type": "ListItem", position: 3, name: "Business Laptops", item: canonicalUrl },
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
          <span className="font-medium text-navy">Business</span>
        </nav>

        <div className="mb-12">
          <SectionHeading 
            as="h1" 
            title="Business Laptops in Pakistan" 
            description="Designed for professionals, business laptops offer enhanced security, premium durability, and all-day battery life. Browse our collection of enterprise-grade machines from top brands." 
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/brands/hp" className="rounded-full border border-light-gray bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-royal hover:text-royal">
              HP Business Laptops
            </Link>
            <Link href="/brands/dell" className="rounded-full border border-light-gray bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-royal hover:text-royal">
              Dell Business Laptops
            </Link>
            <Link href="/brands/lenovo" className="rounded-full border border-light-gray bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-royal hover:text-royal">
              Lenovo ThinkPads
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
                baseHref={`/laptops/business`} 
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
              Contact our sales team for current availability.
            </p>
          </div>
        )}
        
        {/* SEO Content Section */}
        <div className="mt-24 space-y-12 border-t border-light-gray pt-16">
          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">Choosing the Right Business Laptop</h2>
            <div className="prose prose-slate max-w-none text-slate">
              <p>
                A true business laptop offers more than just basic computing power. Designed for professionals and enterprise environments, these machines prioritize data security, build quality, and keyboard ergonomics. If you spend your day multitasking across spreadsheets, specialized software, and video conferences, investing in a proper business laptop is essential for productivity.
              </p>
              <p className="mt-4">
                Our business laptop collection includes industry standards like the <Link href="/brands/lenovo" className="text-royal hover:underline">Lenovo ThinkPad</Link>, <Link href="/brands/hp" className="text-royal hover:underline">HP EliteBook</Link>, and <Link href="/brands/dell" className="text-royal hover:underline">Dell Latitude</Link>. These models are built to handle rigorous travel and extended office hours while maintaining reliable performance.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">What to Consider for Professional Workloads</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">Performance & Multitasking</h3>
                <p className="text-sm text-slate leading-relaxed">
                  Modern business applications require smooth multitasking. We recommend at least an Intel Core i5 or Ryzen 5 processor paired with 16GB of RAM. A fast NVMe SSD ensures that your operating system and essential applications load instantly.
                </p>
              </div>
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">Security & Reliability</h3>
                <p className="text-sm text-slate leading-relaxed">
                  Enterprise-grade security features like TPM chips, fingerprint readers, and physical webcam shutters help protect sensitive company data. Furthermore, business laptops often feature durable chassis materials and spill-resistant keyboards.
                </p>
              </div>
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">Connectivity & Portability</h3>
                <p className="text-sm text-slate leading-relaxed">
                  Whether presenting in a boardroom or working remotely, you need ample ports (HDMI, USB-C, Thunderbolt) and a high-quality webcam for video meetings. Excellent battery life is also vital for professionals constantly on the move.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">Explore Related Laptop Options</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/laptops/office" className="rounded-full border border-light-gray bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-royal hover:text-royal">
                Office Laptops
              </Link>
              <Link href="/laptops/programming" className="rounded-full border border-light-gray bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-royal hover:text-royal">
                Programming Laptops
              </Link>
              <Link href="/laptops" className="rounded-full border border-light-gray bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-royal hover:text-royal">
                All Laptops
              </Link>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}

