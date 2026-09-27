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
  title: "Best Student Laptops in Pakistan | i.Link Systems",
  description: "Shop affordable and reliable laptops for students in Pakistan. Perfect for university, school, and online classes. Find deals on HP, Dell, and Lenovo.",
  alternates: {
    canonical: "/laptops/student",
  },
};

export default async function StudentLaptopsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams.page;
  let page = typeof pageParam === "string" ? parseInt(pageParam, 10) : 1;
  if (isNaN(page) || page < 1) page = 1;

  const { products, total } = await getProductsByCollectionSlug("student", page, PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const canonicalPath = page > 1 ? `/laptops/student?page=${page}` : `/laptops/student`;
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Student Laptops in Pakistan",
    description: "Shop affordable and reliable laptops for students in Pakistan.",
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
      { "@type": "ListItem", position: 3, name: "Student Laptops", item: canonicalUrl },
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
          <span className="font-medium text-navy">Student</span>
        </nav>

        <div className="mb-12">
          <SectionHeading 
            as="h1" 
            title="Student Laptops in Pakistan" 
            description="Find the perfect laptop for university, school, or online learning. Our student laptops are selected for durability, battery life, and affordability." 
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
                baseHref={`/laptops/student`} 
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
            <h2 className="text-2xl font-bold text-navy mb-4">Choosing the Right Student Laptop</h2>
            <div className="prose prose-slate max-w-none text-slate">
              <p>
                Finding the best laptop for students involves balancing portability, battery life, and enough performance to handle daily university and school workloads. Whether you are typing assignments, researching online, attending virtual classes, or working on complex projects, a reliable student laptop is essential.
              </p>
              <p className="mt-4">
                At i.Link Systems, our student laptop collection features affordable options from trusted brands like <Link href="/brands/hp" className="text-royal hover:underline">HP</Link>, <Link href="/brands/dell" className="text-royal hover:underline">Dell</Link>, and <Link href="/brands/lenovo" className="text-royal hover:underline">Lenovo</Link>, providing excellent value for different academic requirements.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">What to Consider for University & School</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">General Studies</h3>
                <p className="text-sm text-slate leading-relaxed">
                  For essay writing, browsing, and reading, an Intel Core i3 or i5 (or AMD Ryzen 3/5) processor is sufficient. We recommend a minimum of 8GB RAM and a fast SSD (256GB or more) to ensure quick boot times and responsive document editing.
                </p>
              </div>
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">Portability & Battery</h3>
                <p className="text-sm text-slate leading-relaxed">
                  Students carrying laptops between classes should look for lightweight models (13 to 14-inch screens) to save backpack space. Solid battery life is crucial if you cannot always plug in during lectures.
                </p>
              </div>
              <div className="rounded-xl bg-soft-gray p-6">
                <h3 className="font-bold text-navy mb-2">Heavier Workloads</h3>
                <p className="text-sm text-slate leading-relaxed">
                  If your coursework involves engineering software, graphic design, or heavy data analysis, consider upgrading to 16GB RAM and a more powerful CPU. You may also want to browse our <Link href="/laptops/programming" className="text-royal hover:underline">programming laptops</Link> for higher performance specifications.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">Explore Related Laptop Options</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/laptops" className="rounded-full border border-light-gray bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-royal hover:text-royal">
                All Laptops
              </Link>
              <Link href="/laptops/under-50000" className="rounded-full border border-light-gray bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-royal hover:text-royal">
                Laptops under 50,000
              </Link>
              <Link href="/laptops/under-75000" className="rounded-full border border-light-gray bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-royal hover:text-royal">
                Laptops under 75,000
              </Link>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}

