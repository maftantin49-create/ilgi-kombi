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
          className="flex items-center gap-3 overflow-x-auto py-2.5 md:py-3"
          style={{ scrollbarWidth: "none" } as React.CSSProperties}
        >
          {CHIPS.map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className={`shrink-0 px-4 py-1.5 rounded-full text-[12.5px] font-semibold whitespace-nowrap transition-colors ${
                chip.highlight
                  ? "bg-[#1E3A8A] text-white"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-200"
              }`}
              style={chip.highlight ? undefined : { background: "#EDEFF2", border: "1px solid #DDE1E7" }}
            >
              {chip.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
