var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var site_config_exports = {};
__export(site_config_exports, {
  brands: () => brands,
  categories: () => categories,
  contactAddresses: () => contactAddresses,
  footerLinks: () => footerLinks,
  getMapsUrl: () => getMapsUrl,
  navLinks: () => navLinks,
  shopMegaMenu: () => shopMegaMenu,
  shopMegaMenuFeatured: () => shopMegaMenuFeatured,
  siteConfig: () => siteConfig
});
module.exports = __toCommonJS(site_config_exports);
const siteConfig = {
  name: "i.Link Systems & Solutions",
  shortName: "i.Link",
  url: "https://www.ilinksystems.com",
  phone: "0331 8852808",
  phoneHref: "tel:+923318852808",
  email: "ilink.isb@gmail.com",
  hours: "Mon \u2013 Sat, 10:00 AM \u2013 8:00 PM"
};
const contactAddresses = [
  {
    label: "Address #1",
    lines: ["Display #03, Ground Floor, Feroz Centre,", "Fazal ul Haq Road, Blue Area, Islamabad"],
    full: "Display #03, Ground Floor, Feroz Centre, Fazal ul Haq Road, Blue Area, Islamabad"
  },
  {
    label: "Address #2",
    lines: ["Office #07, Basement, Azeem Mansion Plaza,", "Fazal ul Haq Road, Blue Area, Islamabad"],
    full: "Office #07, Basement, Azeem Mansion Plaza, Fazal ul Haq Road, Blue Area, Islamabad",
    mapsUrl: "https://www.google.com/maps/place/I+Link+Systems+%26+Solutions/@33.7161071,73.069988,17z/data=!3m1!4b1!4m6!3m5!1s0x38dfbf3aea380d75:0xc5d07a39dd8f1ee7!8m2!3d33.7161071!4d73.069988!16s%2Fg%2F11nx0m_vqm"
  }
];
function getMapsUrl(address) {
  return address.mapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.full)}`;
}
const shopMegaMenu = [
  {
    name: "Computers",
    href: "/shop/computers",
    items: [
      { name: "Laptops", href: "/shop/laptops" },
      { name: "Desktop PCs", href: "/shop/desktop-pcs" },
      { name: "All-in-One PCs", href: "/shop/all-in-one-pcs" },
      { name: "Gaming PCs", href: "/shop/gaming-pcs" },
      { name: "Workstations", href: "/shop/workstations" },
      { name: "Servers", href: "/shop/servers" }
    ]
  },
  {
    name: "Components",
    href: "/shop/components",
    items: [
      { name: "Graphics Cards", href: "/shop/graphics-cards" },
      { name: "Processors", href: "/shop/processors" },
      { name: "Motherboards", href: "/shop/motherboards" },
      { name: "RAM", href: "/shop/ram" },
      { name: "Storage & SSDs", href: "/shop/storage" },
      { name: "Power Supplies", href: "/shop/power-supplies" },
      { name: "Cases", href: "/shop/cases" },
      { name: "Cooling", href: "/shop/cooling" }
    ]
  },
  {
    name: "Peripherals",
    href: "/shop/peripherals",
    items: [
      { name: "Monitors", href: "/shop/monitors" },
      { name: "Keyboards", href: "/shop/keyboards" },
      { name: "Mouse", href: "/shop/mouse" },
      { name: "Headsets", href: "/shop/headsets" },
      { name: "Webcams", href: "/shop/webcams" },
      { name: "Printers", href: "/shop/printers" }
    ]
  },
  {
    name: "Networking & Security",
    href: "/shop/networking",
    items: [
      { name: "Networking", href: "/shop/networking" },
      { name: "CCTV", href: "/shop/cctv" },
      { name: "Storage (NAS)", href: "/shop/nas-storage" },
      { name: "Accessories", href: "/shop/accessories" }
    ]
  }
];
const shopMegaMenuFeatured = {
  title: "Business & Enterprise IT",
  description: "Bulk pricing, Net-30 credit and dedicated account managers for corporate, government and education procurement.",
  href: "/business/quotation",
  cta: "Request a Quotation"
};
const navLinks = [
  { name: "Business", href: "/business" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" }
];
const categories = [
  {
    name: "Laptops",
    href: "/shop/laptops",
    icon: "Laptop",
    description: "Business, gaming and creator laptops from the world's leading brands.",
    image: "/categories/laptops.jpg",
    tier: "featured"
  },
  {
    name: "Gaming PCs",
    href: "/shop/gaming-pcs",
    icon: "Gamepad2",
    description: "Custom-built gaming rigs engineered for peak performance.",
    image: "/categories/gaming-pcs.png",
    tier: "featured"
  },
  {
    name: "All-in-One PCs",
    href: "/shop/all-in-one-pcs",
    icon: "MonitorSmartphone",
    description: "Sleek, space-saving desktops for modern workspaces.",
    image: "/categories/all-in-one-pcs.jpg",
    tier: "featured"
  },
  {
    name: "Monitors",
    href: "/shop/monitors",
    icon: "MonitorCheck",
    description: "Immersive displays for gaming, design and productivity.",
    image: "/categories/monitors.jpg",
    tier: "secondary"
  },
  {
    name: "Networking Products",
    href: "/shop/networking",
    icon: "Network",
    description: "Routers, switches and access points for secure connectivity.",
    image: "/categories/networking.jpg",
    tier: "secondary"
  },
  {
    name: "CCTV",
    href: "/shop/cctv",
    icon: "Camera",
    description: "AI-powered surveillance for homes and businesses.",
    image: "/categories/cctv.jpg",
    tier: "secondary"
  },
  {
    name: "Graphics Cards",
    href: "/shop/graphics-cards",
    icon: "Cpu",
    description: "Latest GPUs for gaming, rendering and AI workloads.",
    image: "/categories/graphics-cards.jpg",
    tier: "secondary"
  },
  {
    name: "Printers",
    href: "/shop/printers",
    icon: "Printer",
    description: "Reliable printers for home, business and enterprise.",
    image: "/categories/printers.jpg",
    tier: "compact"
  },
  {
    name: "Storage",
    href: "/shop/storage",
    icon: "HardDrive",
    description: "High-speed SSDs, NVMe drives and enterprise storage.",
    image: "/categories/storage.jpg",
    tier: "compact"
  },
  {
    name: "RAM",
    href: "/shop/ram",
    icon: "MemoryStick",
    description: "High-performance memory for smoother multitasking.",
    image: "/categories/ram.jpg",
    tier: "compact"
  },
  {
    name: "Mouse",
    href: "/shop/mouse",
    icon: "Mouse",
    description: "Precision gaming and productivity mice.",
    image: "/categories/mouse.jpg",
    tier: "compact"
  },
  {
    name: "Keyboard",
    href: "/shop/keyboards",
    icon: "Keyboard",
    description: "Mechanical and wireless keyboards for every setup.",
    image: "/categories/keyboard.jpg",
    tier: "compact"
  },
  {
    name: "Headphones",
    href: "/shop/headsets",
    icon: "Headphones",
    description: "Immersive audio for gaming, calls and music.",
    image: "/categories/headphones.jpg",
    tier: "compact"
  },
  {
    name: "Gaming PC Cases",
    href: "/shop/cases",
    icon: "Box",
    description: "Premium cases with airflow and RGB styling.",
    image: "/categories/gaming-pc-cases.jpg",
    tier: "compact"
  },
  {
    name: "Power Supplies",
    href: "/shop/power-supplies",
    icon: "Plug",
    description: "Certified PSUs for safe, stable performance.",
    image: "/categories/power-supplies.jpg",
    tier: "compact"
  }
];
const brands = [
  "HP",
  "Dell",
  "Lenovo",
  "ASUS",
  "Acer",
  "Apple",
  "MSI",
  "Intel",
  "AMD",
  "NVIDIA",
  "Samsung",
  "Kingston",
  "Corsair",
  "WD",
  "Seagate",
  "Canon",
  "Epson",
  "Brother",
  "Cisco",
  "TP-Link",
  "Ubiquiti",
  "MikroTik",
  "Logitech",
  "Razer",
  "HyperX",
  "LG",
  "BenQ",
  "ViewSonic",
  "ZOTAC",
  "Gigabyte",
  "ASRock",
  "Cooler Master",
  "Antec",
  "NZXT",
  "Synology",
  "QNAP",
  "D-Link",
  "Hikvision",
  "Dahua",
  "APC",
  "Zebra",
  "Honeywell"
];
const footerLinks = {
  products: [
    { name: "Laptops", href: "/shop/laptops" },
    { name: "Desktop PCs", href: "/shop/desktop-pcs" },
    { name: "Gaming PCs", href: "/shop/gaming-pcs" },
    { name: "Monitors", href: "/shop/monitors" },
    { name: "Networking", href: "/shop/networking" },
    { name: "CCTV Solutions", href: "/shop/cctv" },
    { name: "Accessories", href: "/shop/accessories" }
  ],
  support: [
    { name: "Contact Us", href: "/contact" },
    { name: "Track Your Order", href: "/track-order" },
    { name: "Shipping Information", href: "/shipping" },
    { name: "Returns & Warranty", href: "/returns" },
    { name: "FAQs", href: "/faq" },
    { name: "Technical Support", href: "/support" }
  ],
  business: [
    { name: "Corporate & Government", href: "/business" },
    { name: "Bulk Order Quotation", href: "/business/quotation" },
    { name: "Tender Services", href: "/business/tenders" },
    { name: "Net-30 Credit Terms", href: "/business/credit" },
    { name: "Project Deployment", href: "/business/deployment" }
  ],
  company: [
    { name: "About i.Link", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Authorized Brands", href: "/brands" },
    { name: "Store Locations", href: "/stores" }
  ],
  policies: [
    { name: "Privacy Policy", href: "/policies/privacy" },
    { name: "Terms of Service", href: "/policies/terms" },
    { name: "Warranty Policy", href: "/policies/warranty" },
    { name: "Refund Policy", href: "/policies/refunds" }
  ]
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  brands,
  categories,
  contactAddresses,
  footerLinks,
  getMapsUrl,
  navLinks,
  shopMegaMenu,
  shopMegaMenuFeatured,
  siteConfig
});
