import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/products";

// compareAtPrice is optional here, not required: wishlist/page.tsx still
// feeds this component from the legacy static catalog (see
// src/lib/products-repository.ts's own comment on why), which has no
// such field. DB-backed callers (shop, search) pass a real value; the
// legacy caller simply renders without the discount strikethrough.
type ProductCardProps = Product & { compareAtPrice?: number | null };

export default function ProductCard({ 
  product, 
  priority = false,
  isRentalPreview = false,
}: { 
  product: ProductCardProps;
  priority?: boolean;
  isRentalPreview?: boolean;
}) {
  const inStock = product.stock > 0;
  const hasDiscount = product.compareAtPrice != null && product.compareAtPrice > product.price;

  const whatsappMessage = `Hi i.Link, I am interested in renting the ${product.name}. Please share rental pricing and availability.`;
  const whatsappUrl = `https://wa.me/923318852808?text=${encodeURIComponent(whatsappMessage)}`;

  const CardWrapper = isRentalPreview ? "div" : Link;
  const wrapperProps = isRentalPreview 
    ? { className: "group block overflow-hidden rounded-2xl border border-light-gray bg-white premium-shadow transition-all duration-300 hover:-translate-y-1.5 hover:border-royal/30 hover:shadow-[0_1px_2px_rgba(15,23,42,0.06),0_20px_40px_-16px_rgba(29,78,216,0.28)] flex flex-col h-full" }
    : { href: `/product/${product.slug}`, className: "group block overflow-hidden rounded-2xl border border-light-gray bg-white premium-shadow transition-all duration-300 hover:-translate-y-1.5 hover:border-royal/30 hover:shadow-[0_1px_2px_rgba(15,23,42,0.06),0_20px_40px_-16px_rgba(29,78,216,0.28)] flex flex-col h-full" };

  const InnerWrapper = isRentalPreview ? Link : "div";
  const innerProps = isRentalPreview ? { href: `/product/${product.slug}`, className: "flex flex-col flex-grow h-full" } : { className: "flex flex-col flex-grow h-full" };

  return (
    <CardWrapper {...wrapperProps}>
      <InnerWrapper {...innerProps}>
        <div className="relative aspect-square overflow-hidden bg-soft-gray">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority={priority}
            quality={75}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          {!inStock && !isRentalPreview && (
            <span className="absolute left-3 top-3 rounded-full bg-navy/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              Out of Stock
            </span>
          )}
        </div>

        <div className="p-4 sm:p-5 flex flex-col flex-grow">
          <Badge variant="royal" className="text-[10px] w-fit">
            {product.category}
          </Badge>
          <h3 className="mt-2.5 line-clamp-2 text-[15px] font-bold leading-snug text-navy">
            {product.name}
          </h3>
          <p className="mt-1 text-xs font-medium text-slate">{product.brand}</p>
          
          <div className="mt-auto pt-3">
            {!isRentalPreview ? (
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-baseline gap-1.5">
                  <span className="text-base font-bold text-navy">{formatPrice(product.price)}</span>
                  {hasDiscount && (
                    <span className="text-xs font-medium text-slate line-through">
                      {formatPrice(product.compareAtPrice as number)}
                    </span>
                  )}
                </span>
                {inStock ? (
                  <span className="text-xs font-semibold text-success">In Stock</span>
                ) : (
                  <span className="text-xs font-semibold text-slate">Unavailable</span>
                )}
              </div>
            ) : (
              // On click, stop propagation so it doesn't trigger the outer link if somehow it got nested, though we prevented nesting.
              <Link 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center rounded-lg bg-royal py-2.5 text-sm font-semibold text-white transition-colors hover:bg-royal/90"
              >
                Request Rental Quote
              </Link>
            )}
          </div>
        </div>
      </InnerWrapper>
    </CardWrapper>
  );
}
