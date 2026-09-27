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
  title: "Programming & Coding Laptops in Pakistan | i.Link Systems",
  description: "Shop premium programming laptops in Pakistan. Specially curated for developers and coding, featuring high-performance processors and robust multitasking capabilities.",
  alternates: {
    canonical: "/laptops/programming",
  },
};

export default async function ProgrammingLaptopsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams.page;
  let page = typeof pageParam === "string" ? parseInt(pageParam, 10) : 1;
  if (isNaN(page) || page < 1) page = 1;

  const { products, total } = await getProductsByCollectionSlug("programming", page, PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const canonicalPath = page > 1 ? `/laptops/programming?page=${page}` : `/laptops/programming`;
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Programming & Coding Laptops in Pakistan",
    description: "Shop premium programming laptops in Pakistan. Specially curated for developers and coding, featuring high-performance processors and robust multitasking capabilities.",
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
      { "@type": "ListItem", position: 3, name: "Programming & Coding Laptops", item: canonicalUrl },
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
          <span className="font-medium text-navy">Programming & Coding</span>
        </nav>

        <div className="mb-12">
          <SectionHeading 
            as="h1" 
            title="Programming & Coding Laptops in Pakistan" 
            description="Curated for software developers and heavy coding workloads, these laptops feature ample RAM, high-performance processors, and robust multi-tasking capabilities based on their documented configurations." 
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/laptops" className="rounded-full border border-light-gray bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-royal hover:text-royal">
              All Laptops
            </Link>
            <Link href="/laptops/business" className="rounded-full border border-light-gray bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-royal hover:text-royal">
              Business Laptops
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
                baseHref={`/laptops/programming`} 
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
            <h2 className="text-2xl font-bold text-navy mb-4">Choosing a Laptop for Programming</h2>
            <div className="prose prose-slate max-w-none text-slate">
              <p>
                Software development demands a reliable environment. Whether you are building web applications, compiling large codebases, or running local Docker containers, a specialized coding laptop significantly reduces waiting times. Our programming laptops are carefully selected based on the processing power and multitasking capabilities necessary for modern IDEs like Visual Studio Code, IntelliJ, and Android Studio.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">Crucial Specifications for Developers</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">CPU & Memory (RAM)</h3>
                <p className="text-sm text-slate leading-relaxed">
                  The processor and RAM are the heart of your development setup. We recommend at least an Intel Core i5 or Ryzen 5, though an i7 or Ryzen 7 is preferred for heavy compilation. 16GB of RAM is the standard minimum for comfortable software development today.
                </p>
              </div>
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">Storage (SSD)</h3>
                <p className="text-sm text-slate leading-relaxed">
                  Fast storage is critical when reading thousands of small files during builds or starting local servers. Ensure your coding laptop has a fast NVMe SSD, ideally 512GB or more, to accommodate multiple projects, virtual machines, and development environments.
                </p>
              </div>
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">Display & Keyboard</h3>
                <p className="text-sm text-slate leading-relaxed">
                  Programming involves hours of reading syntax. A sharp, high-resolution display (at least 1080p) reduces eye strain, while a tactile, comfortable keyboard—often found in <Link href="/laptops/business" className="text-royal hover:underline">business laptops</Link> like the ThinkPad series—improves coding speed and ergonomics.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">When Do You Need a Dedicated GPU?</h2>
            <div className="prose prose-slate max-w-none text-slate mb-6">
              <p>
                Most standard web development, Python programming, and backend coding do not require a dedicated graphics card. Integrated graphics (like Intel Iris Xe or AMD Radeon Graphics) are more than sufficient. However, if your work involves Artificial Intelligence, Machine Learning models (CUDA workloads), game development, or heavy 3D rendering, you will need a laptop with a dedicated NVIDIA GPU. In those cases, you may also want to explore our <Link href="/laptops/gaming" className="text-royal hover:underline">gaming laptops</Link> which naturally feature dedicated graphics.
              </p>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}

