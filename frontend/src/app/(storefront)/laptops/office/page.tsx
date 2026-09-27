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
  title: "Office & Work Laptops in Pakistan | i.Link Systems",
  description: "Shop reliable office laptops in Pakistan. Find the best laptops for everyday work, multitasking, and productivity from top brands.",
  alternates: {
    canonical: "/laptops/office",
  },
};

export default async function OfficeLaptopsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams.page;
  let page = typeof pageParam === "string" ? parseInt(pageParam, 10) : 1;
  if (isNaN(page) || page < 1) page = 1;

  const { products, total } = await getProductsByCollectionSlug("office", page, PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const canonicalPath = page > 1 ? `/laptops/office?page=${page}` : `/laptops/office`;
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Office Laptops in Pakistan",
    description: "Shop reliable office laptops in Pakistan. Find the best laptops for everyday work, multitasking, and productivity from top brands.",
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
      { "@type": "ListItem", position: 3, name: "Office Laptops", item: canonicalUrl },
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
          <span className="font-medium text-navy">Office</span>
        </nav>

        <div className="mb-12">
          <SectionHeading 
            as="h1" 
            title="Office Laptops in Pakistan" 
            description="Equip your workspace with reliable laptops built for everyday tasks, multitasking, and seamless connectivity." 
          />
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
                baseHref={`/laptops/office`} 
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
            <h2 className="text-2xl font-bold text-navy mb-4">Choosing a Reliable Office Laptop</h2>
            <div className="prose prose-slate max-w-none text-slate">
              <p>
                An effective office laptop needs to balance performance, reliability, and ease of use to support daily workplace productivity. Whether you are drafting documents, managing emails, or conducting virtual meetings, a dedicated laptop for office work ensures you can complete tasks without frustrating slowdowns.
              </p>
              <p className="mt-4">
                At i.Link Systems, we offer a range of laptops that are perfect for standard office environments, featuring trusted brands like <Link href="/brands/hp" className="text-royal hover:underline">HP</Link>, <Link href="/brands/dell" className="text-royal hover:underline">Dell</Link>, and <Link href="/brands/lenovo" className="text-royal hover:underline">Lenovo</Link>. These models focus on practical features that improve daily workflow.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">What to Consider for Everyday Work</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">Multitasking Capability</h3>
                <p className="text-sm text-slate leading-relaxed">
                  Keeping multiple browser tabs, spreadsheets, and email clients open simultaneously requires sufficient memory. We recommend a minimum of 8GB of RAM, though 16GB is ideal for power users who handle larger datasets or intensive web applications.
                </p>
              </div>
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">Storage & Speed</h3>
                <p className="text-sm text-slate leading-relaxed">
                  A Solid State Drive (SSD) is essential for any modern office laptop. It significantly reduces boot times and allows applications like Microsoft Office to launch instantly. 256GB is generally sufficient for basic document storage, while 512GB provides extra headroom.
                </p>
              </div>
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">Display & Comfort</h3>
                <p className="text-sm text-slate leading-relaxed">
                  Staring at a screen all day requires a comfortable display. A 14-inch or 15.6-inch Full HD (1080p) screen with an anti-glare coating reduces eye strain. A comfortable keyboard is equally critical for heavy typing sessions.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">Need Higher Performance?</h2>
            <div className="prose prose-slate max-w-none text-slate mb-6">
              <p>
                While standard office laptops are excellent for typical administrative tasks, some roles require specialized hardware. If your work involves enterprise-level security protocols, frequent travel, or heavy data processing, you might want to explore our premium <Link href="/laptops/business" className="text-royal hover:underline">business laptops</Link>. For software development or complex engineering, view our <Link href="/laptops/programming" className="text-royal hover:underline">programming laptops</Link>.
              </p>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}

