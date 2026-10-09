import Link from "next/link"

const CHIPS = [
  { label: "Çok Satanlar",  href: "/urunler",               highlight: true  },
  { label: "Yeni Gelenler", href: "/urunler?siralama=yeni", highlight: false },
  { label: "Fırsatlar",     href: "/urunler",               highlight: false },
  { label: "Parça Bul",     href: "/parca-bul",             highlight: false },
  { label: "Tüm Ürünler",   href: "/urunler",               highlight: false },
]

export default function QuickDiscovery() {
  return (
    <div
      className="bg-white"
      style={{ borderBottom: "1px solid #EAECEF" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div
          className="flex items-center gap-2 overflow-x-auto py-2"
          style={{ scrollbarWidth: "none" } as React.CSSProperties}
        >
          {CHIPS.map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className={`shrink-0 px-3 py-1 rounded-full text-[11.5px] font-semibold whitespace-nowrap transition-colors ${
                chip.highlight
                  ? "bg-[#1E3A8A] text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              style={chip.highlight ? undefined : { background: "#F4F5F7" }}
            >
              {chip.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
