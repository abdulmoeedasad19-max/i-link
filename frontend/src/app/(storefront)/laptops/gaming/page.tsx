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
  title: "Gaming Laptops in Pakistan | Dedicated GPU & High Performance | i.Link Systems",
  description: "Shop premium gaming laptops in Pakistan. Curated for gamers and creators, featuring dedicated NVIDIA/AMD graphics, high refresh rates, and top-tier processors.",
  alternates: {
    canonical: "/laptops/gaming",
  },
};

export default async function GamingLaptopsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams.page;
  let page = typeof pageParam === "string" ? parseInt(pageParam, 10) : 1;
  if (isNaN(page) || page < 1) page = 1;

  const { products, total } = await getProductsByCollectionSlug("gaming", page, PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const canonicalPath = page > 1 ? `/laptops/gaming?page=${page}` : `/laptops/gaming`;
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Gaming Laptops in Pakistan",
    description: "Shop premium gaming laptops in Pakistan. Curated for gamers and creators, featuring dedicated NVIDIA/AMD graphics, high refresh rates, and top-tier processors.",
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
      { "@type": "ListItem", position: 3, name: "Gaming Laptops", item: canonicalUrl },
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
          <span className="font-medium text-navy">Gaming</span>
        </nav>

        <div className="mb-12">
          <SectionHeading 
            as="h1" 
            title="Gaming Laptops in Pakistan" 
            description="Designed for intensive gaming and creative workloads. This collection is curated exclusively for laptops with dedicated graphics cards (GPUs) and explicitly built for gaming performance." 
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/laptops" className="rounded-full border border-light-gray bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-royal hover:text-royal">
              All Laptops
            </Link>
            <Link href="/laptops/programming" className="rounded-full border border-light-gray bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-royal hover:text-royal">
              Programming Laptops
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
                baseHref={`/laptops/gaming`} 
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
            <h2 className="text-2xl font-bold text-navy mb-4">Understanding Gaming Laptops</h2>
            <div className="prose prose-slate max-w-none text-slate">
              <p>
                A true gaming laptop differs significantly from a standard office or student machine. Designed to handle intensive real-time rendering, gaming laptops prioritize thermal management, high refresh rates, and most importantly, a dedicated Graphics Processing Unit (GPU). Whether you are exploring massive open worlds, engaging in competitive esports, or rendering 3D video projects, these laptops provide desktop-class performance in a portable chassis.
              </p>
              <p className="mt-4">
                At i.Link Systems, our gaming inventory fluctuates based on market availability. While our core focus often lies in premium business machines, we periodically stock capable gaming units when available.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">Core Specifications for Gaming</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">The Dedicated GPU</h3>
                <p className="text-sm text-slate leading-relaxed">
                  Unlike integrated graphics (which share memory with the CPU), a dedicated GPU (like an NVIDIA GeForce RTX or GTX series) has its own memory (VRAM). This is the single most important component in determining frame rates and graphic fidelity in modern titles.
                </p>
              </div>
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">Display Refresh Rate</h3>
                <p className="text-sm text-slate leading-relaxed">
                  A high refresh rate display (120Hz, 144Hz, or higher) allows the screen to update faster than a standard 60Hz monitor. This results in incredibly smooth motion, which is crucial for fast-paced shooters and competitive multiplayer games.
                </p>
              </div>
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">Thermals & Power</h3>
                <p className="text-sm text-slate leading-relaxed">
                  Gaming generates immense heat. Because of the robust cooling systems (larger fans and heat pipes) required to prevent thermal throttling, gaming laptops are naturally heavier and thicker than ordinary <Link href="/laptops/student" className="text-royal hover:underline">student laptops</Link>. Battery life is also generally shorter when under load.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">Alternative Uses</h2>
            <div className="prose prose-slate max-w-none text-slate mb-6">
              <p>
                The immense processing power of a gaming laptop isn't just for entertainment. These machines overlap heavily with the requirements for high-end <Link href="/laptops/programming" className="text-royal hover:underline">programming laptops</Link>, especially for developers working on Machine Learning (CUDA) or heavy video editing. If your workflow requires intense graphical computation, a gaming-class machine is often the most cost-effective solution.
              </p>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}

