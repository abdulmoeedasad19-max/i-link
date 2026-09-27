import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import Container from "@/components/ui/container";
import SectionHeading from "@/components/ui/section-heading";
import ProductCard from "@/components/sections/product-card";
import Pagination from "@/components/ui/pagination";
import { getProductsByBrand } from "@/lib/products-repository";
import { getBrandBySlug } from "@/lib/brands-repository";
import { siteConfig } from "@/lib/site-config";
import { safeJsonLd } from "@/lib/utils";

const BRAND_PAGE_SIZE = 24;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);

  if (!brand) {
    return { title: "Brand Not Found" };
  }

  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams.page;
  const parsedPage = typeof pageParam === "string" ? parseInt(pageParam, 10) : 1;
  const page = !isNaN(parsedPage) && parsedPage > 1 ? parsedPage : 1;

  const canonicalPath = page > 1 ? `/brands/${slug}?page=${page}` : `/brands/${slug}`;

  return {
    title: brand.seoTitle || `${brand.name} Laptops & Computers in Pakistan | i.Link Systems`,
    description: brand.seoDescription || `Shop ${brand.name} products in Pakistan at i.Link Systems. Explore available ${brand.name} laptops, computers and technology products.`,
    alternates: { canonical: canonicalPath },
  };
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  
  const pageParam = resolvedSearchParams.page;
  const parsedPage = typeof pageParam === "string" ? parseInt(pageParam, 10) : 1;
  const page = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const brand = await getBrandBySlug(slug);

  if (!brand) {
    notFound();
  }

  const { products, total } = await getProductsByBrand(brand.slug, page, BRAND_PAGE_SIZE);
  const totalPages = Math.ceil(total / BRAND_PAGE_SIZE);

  const canonicalPath = page > 1 ? `/brands/${slug}?page=${page}` : `/brands/${slug}`;
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteConfig.url}/` },
      { "@type": "ListItem", position: 2, name: "Brands", item: `${siteConfig.url}/brands` },
      { "@type": "ListItem", position: 3, name: brand.name, item: canonicalUrl },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: brand.seoTitle || brand.name,
    description: brand.seoDescription || brand.description || `Shop ${brand.name} Laptops & Computers in Pakistan`,
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

  return (
    <div className="pb-16 pt-8 sm:pb-24 sm:pt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
      <Container>
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-slate">
          <Link href="/" className="hover:text-royal">Home</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <Link href="/brands" className="hover:text-royal">Brands</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="font-medium text-navy">{brand.name}</span>
        </nav>
        
        <div className="mb-12 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          {brand.logoUrl && (
            <div className="flex h-16 w-32 items-center justify-center shrink-0">
              <Image 
                src={brand.logoUrl} 
                alt={`${brand.name} logo`} 
                width={100} 
                height={100} 
                className="h-full w-auto object-contain" 
              />
            </div>
          )}
          <div>
            <SectionHeading 
              as="h1" 
              eyebrow="Brand" 
              title={brand.name} 
              description={brand.description || `Shop ${brand.name} Laptops & Computers in Pakistan`} 
            />
            {["hp", "dell", "lenovo"].includes(brand.slug.toLowerCase()) && (
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/laptops" className="inline-flex items-center text-sm font-semibold text-royal hover:text-navy transition-colors">
                  View All Laptops &rarr;
                </Link>
                <Link href="/laptops/business" className="inline-flex items-center text-sm font-semibold text-royal hover:text-navy transition-colors">
                  Shop Business Laptops &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>

        {products.length > 0 ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-navy">{brand.name} Products</h2>
              <span className="text-sm text-slate">{total} product{total === 1 ? "" : "s"}</span>
            </div>
            
            <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 4} />
              ))}
            </div>

            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              baseHref={`/brands/${slug}`} 
            />
          </>
        ) : (
          <div className="mx-auto mt-12 flex max-w-md flex-col items-center rounded-2xl border border-light-gray bg-soft-gray px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-royal/10 text-royal">
              <PackageSearch className="h-7 w-7" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-navy">
              More {brand.name} coming soon
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate">
              We&apos;re adding new products to this brand. In the meantime, contact our
              sales team for current availability and pricing.
            </p>
          </div>
        )}
        
        {/* SEO Content Section - Brand Specific */}
        {brand.slug.toLowerCase() === "hp" && (
          <div className="mt-24 space-y-12 border-t border-light-gray pt-16">
            <section>
              <h2 className="text-2xl font-bold text-navy mb-4">HP Laptops in Pakistan</h2>
              <div className="prose prose-slate max-w-none text-slate">
                <p>
                  Hewlett-Packard (HP) remains one of the most reliable and widely adopted laptop brands in Pakistan. Known for balancing performance with sleek design, HP laptops cater to a broad spectrum of users. Our inventory primarily focuses on HP's premium business and productivity lines, which offer robust build quality and essential security features.
                </p>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-navy mb-4">Popular HP Laptop Categories</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                <div className="rounded-xl bg-soft-gray p-6">
                  <h3 className="font-bold text-navy mb-2">HP EliteBook & ProBook (Business)</h3>
                  <p className="text-sm text-slate leading-relaxed">
                    Designed for enterprise professionals, the EliteBook and ProBook series are mainstays in our <Link href="/laptops/business" className="text-royal hover:underline">business laptops</Link> collection. They feature durable aluminum chassis, spill-resistant keyboards, and hardware-level security, making them ideal for rigorous daily office workloads.
                  </p>
                </div>
                <div className="rounded-xl bg-soft-gray p-6">
                  <h3 className="font-bold text-navy mb-2">Everyday & Student Laptops</h3>
                  <p className="text-sm text-slate leading-relaxed">
                    For general computing, HP offers versatile models that perfectly fit the requirements of <Link href="/laptops/student" className="text-royal hover:underline">student laptops</Link>. These models provide reliable battery life and clear displays, ensuring you can manage coursework and web browsing efficiently.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {brand.slug.toLowerCase() === "dell" && (
          <div className="mt-24 space-y-12 border-t border-light-gray pt-16">
            <section>
              <h2 className="text-2xl font-bold text-navy mb-4">Dell Laptops in Pakistan</h2>
              <div className="prose prose-slate max-w-none text-slate">
                <p>
                  Dell is globally recognized for manufacturing reliable, performance-driven machines. In Pakistan, Dell laptops are a top choice for both corporate offices and independent professionals. At i.Link Systems, a significant portion of our active inventory consists of high-quality Dell business machines, reflecting the brand's enduring popularity and durability.
                </p>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-navy mb-4">Comparing Dell Laptops</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                <div className="rounded-xl bg-soft-gray p-6">
                  <h3 className="font-bold text-navy mb-2">Dell Latitude Series</h3>
                  <p className="text-sm text-slate leading-relaxed">
                    The Latitude series forms the core of our <Link href="/laptops/business" className="text-royal hover:underline">business laptop</Link> offerings. Built with premium materials, extended battery options, and comprehensive port selections, Latitudes are engineered to survive daily commutes and demanding office environments.
                  </p>
                </div>
                <div className="rounded-xl bg-soft-gray p-6">
                  <h3 className="font-bold text-navy mb-2">Performance & Office Use</h3>
                  <p className="text-sm text-slate leading-relaxed">
                    Whether you are outfitting a small <Link href="/laptops/office" className="text-royal hover:underline">office</Link> or need a dependable machine for heavy multitasking, Dell provides reliable Intel Core processors and easily upgradeable RAM/storage configurations to keep your business running smoothly.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {brand.slug.toLowerCase() === "lenovo" && (
          <div className="mt-24 space-y-12 border-t border-light-gray pt-16">
            <section>
              <h2 className="text-2xl font-bold text-navy mb-4">Lenovo Laptops in Pakistan</h2>
              <div className="prose prose-slate max-w-none text-slate">
                <p>
                  Lenovo has established a formidable reputation in Pakistan, particularly for producing some of the most comfortable and durable keyboards in the industry. Our Lenovo inventory caters strongly to business users, developers, and writers who require uncompromising reliability and tactile feedback.
                </p>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-navy mb-4">Lenovo Use Cases & Models</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                <div className="rounded-xl bg-soft-gray p-6">
                  <h3 className="font-bold text-navy mb-2">Lenovo ThinkPad</h3>
                  <p className="text-sm text-slate leading-relaxed">
                    The ThinkPad is legendary in the corporate world. Featuring military-spec durability and the iconic TrackPoint, these machines are heavily represented in our <Link href="/laptops/business" className="text-royal hover:underline">business</Link> and <Link href="/laptops/programming" className="text-royal hover:underline">programming</Link> laptop categories due to their exceptional thermal management and typing experience.
                  </p>
                </div>
                <div className="rounded-xl bg-soft-gray p-6">
                  <h3 className="font-bold text-navy mb-2">Budget & Productivity</h3>
                  <p className="text-sm text-slate leading-relaxed">
                    Beyond premium enterprise models, Lenovo also provides excellent value for standard <Link href="/laptops/office" className="text-royal hover:underline">office work</Link> and <Link href="/laptops/student" className="text-royal hover:underline">student</Link> needs, offering robust performance in various price ranges.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </Container>
    </div>
  );
}