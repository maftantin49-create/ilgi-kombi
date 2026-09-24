"use client"

import Link from "next/link"
import SiteLogo from "@/components/layout/SiteLogo"
import {
  ShoppingCart, Search, Phone, Menu, X, Flame,
  Heart, ChevronDown, ChevronRight, LayoutGrid,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useCart } from "@/lib/cart"
import { useFavorites } from "@/lib/favorites"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { buildWa } from "@/lib/whatsapp"
import { validPhone, validWhatsApp } from "@/lib/storefront/guards"
import { useRouter } from "next/navigation"
import CategoryMegaMenu, { CAT_ICONS } from "@/components/layout/CategoryMegaMenu"
import type { StorefrontCategoryWithCount } from "@/lib/storefront/categories"

const navLinks = [
  { href: "/",            label: "Ana Sayfa" },
  { href: "/hakkimizda",  label: "Kurumsal"  },
  { href: "/urunler",     label: "Ürünler"   },
  { href: "/markalar",    label: "Markalar"  },
  { href: "/iletisim",    label: "İletişim"  },
]

const WaIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const WaIconSm = () => (
  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

interface HeaderProps {
  categories: StorefrontCategoryWithCount[]
  siteName: string
  phone: string
  whatsapp: string
}

export default function Header({ categories, siteName, phone, whatsapp }: HeaderProps) {
  const totalItems     = useCart(s => s.totalItems)()
  const totalFavorites = useFavorites(s => s.totalFavorites)()
  const [mobileOpen,    setMobileOpen]    = useState(false)
  const [megaOpen,      setMegaOpen]      = useState(false)
  const [mobileCatOpen, setMobileCatOpen] = useState(false)
  const [search,        setSearch]        = useState("")
  const router    = useRouter()
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!megaOpen) return
    const onDown = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMegaOpen(false)
      }
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [megaOpen])

  useEffect(() => {
    if (!megaOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMegaOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [megaOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/urunler?q=${encodeURIComponent(search)}`)
      setMegaOpen(false)
    }
  }

  const validWa  = validWhatsApp(whatsapp)
  const validPh  = validPhone(phone)
  const wa       = buildWa(validWa)

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50"
      style={{
        background: "rgba(9,10,12,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(48,49,54,0.5)",
      }}
    >

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div style={{ background: "#101114", borderBottom: "1px solid #1E1E22" }}>
        <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-between gap-4 text-xs">
          <span className="text-[#85857F] tracking-wide">
            📦 Hızlı kargo · Aynı gün sevkiyat
          </span>
          <div className="flex items-center gap-6">
            {validPh && (
              <a
                href={`tel:${validPh}`}
                className="flex items-center gap-1.5 font-semibold text-[#E2E8F0] hover:text-white transition-colors"
              >
                <Phone size={12} aria-hidden="true" />
                {validPh}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Main header row ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-4">

        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 flex items-center"
          aria-label={`${siteName} Ana Sayfa`}
        >
          <SiteLogo
            siteName={siteName}
            width={200}
            height={64}
            className="h-11 w-auto object-contain"
            priority
          />
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 hidden md:flex" role="search">
          <div className="relative w-full">
            <label htmlFor="header-search" className="sr-only">Ürün ara</label>
            <Input
              id="header-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Parça adı, marka veya model numarası ara..."
              className="h-10 text-[14px] pr-12 rounded-xl border border-[#303136] bg-[#151619] text-[#F4F4F2] placeholder:text-[#85857F] focus-visible:border-[#64748B] focus-visible:ring-0"
            />
            <button
              type="submit"
              aria-label="Ara"
              className="absolute right-0 top-0 h-10 w-12 flex items-center justify-center rounded-r-xl bg-[#334155] text-white hover:bg-[#475569] transition-colors"
            >
              <Search size={18} aria-hidden="true" />
            </button>
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">

          {/* Telefon — desktop */}
          {validPh && (
            <a
              href={`tel:${validPh}`}
              className="hidden lg:flex items-center gap-2 bg-[#334155] hover:bg-[#475569] text-white text-[13px] font-bold px-4 py-2.5 rounded-xl transition-colors"
              style={{ boxShadow: "0 4px 14px -2px rgba(0,0,0,0.20)" }}
            >
              <Phone size={15} aria-hidden="true" />
              {validPh}
            </a>
          )}

          {/* Ayırıcı */}
          {validWa && (
            <div
              className="hidden lg:block w-px h-8 mx-2"
              style={{ background: "#303136" }}
              aria-hidden="true"
            />
          )}

          {/* WhatsApp */}
          {wa.home && (
            <a
              href={wa.home}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp ile destek al"
              className="hidden lg:flex items-center justify-center w-10 h-10 rounded-xl text-[#85857F] hover:text-white hover:bg-[#1B1C20] transition-colors"
            >
              <WaIcon />
            </a>
          )}

          {/* Favoriler */}
          <Link
            href="/favoriler"
            className="relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-[#85857F] hover:text-white hover:bg-[#1B1C20] transition-colors"
            aria-label={`Favoriler${totalFavorites > 0 ? `, ${totalFavorites} ürün` : ""}`}
          >
            <div className="relative">
              <Heart size={22} aria-hidden="true" />
              {totalFavorites > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold"
                  style={{ background: "#64748B" }}
                  aria-hidden="true"
                >
                  {totalFavorites}
                </span>
              )}
            </div>
            <span className="hidden lg:block text-[10px] font-medium">Favoriler</span>
          </Link>

          {/* Sepet */}
          <Link
            href="/sepet"
            className="relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-[#85857F] hover:text-white hover:bg-[#1B1C20] transition-colors"
            aria-label={`Sepet${totalItems > 0 ? `, ${totalItems} ürün` : ""}`}
          >
            <div className="relative">
              <ShoppingCart size={22} aria-hidden="true" />
              {totalItems > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold"
                  style={{ background: "#64748B" }}
                  aria-hidden="true"
                >
                  {totalItems}
                </span>
              )}
            </div>
            <span className="hidden lg:block text-[10px] font-medium">Sepetim</span>
          </Link>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={v => { setMobileOpen(v); if (!v) setMobileCatOpen(false) }}>
            <SheetTrigger
              className="md:hidden p-2.5 rounded-xl text-[#85857F] hover:text-white hover:bg-[#1B1C20] transition-colors"
              aria-label="Menüyü aç"
            >
              <Menu size={24} aria-hidden="true" />
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-80 p-0 overflow-y-auto"
              style={{ background: "#0E0E10", borderRight: "1px solid #303136" }}
            >
              {/* Sheet header */}
              <div
                className="px-6 py-4 flex items-center justify-between"
                style={{ borderBottom: "1px solid #303136", background: "#101114" }}
              >
                <SiteLogo
                  siteName={siteName}
                  width={130}
                  height={44}
                  className="h-11 w-auto object-contain"
                />
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Menüyü kapat"
                  className="p-1.5 rounded-lg transition-colors text-[#85857F] hover:text-white hover:bg-[#1B1C20]"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>

              {/* Mobile search */}
              <div className="px-5 py-4" style={{ borderBottom: "1px solid #303136" }}>
                <form onSubmit={e => { handleSearch(e); setMobileOpen(false) }} role="search">
                  <div className="relative">
                    <label htmlFor="mobile-search" className="sr-only">Ürün ara</label>
                    <Input
                      id="mobile-search"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Parça ara..."
                      className="h-11 pr-11 rounded-xl border border-[#303136] bg-[#151619] text-[#F4F4F2] placeholder:text-[#85857F] focus-visible:border-[#64748B] focus-visible:ring-0"
                    />
                    <button type="submit" aria-label="Ara" className="absolute right-3 top-2.5">
                      <Search size={18} className="text-[#85857F]" aria-hidden="true" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Nav */}
              <nav aria-label="Ana menü" className="px-4 py-3">
                <ul className="space-y-0.5">

                  {/* Kategoriler accordion */}
                  <li>
                    <button
                      onClick={() => setMobileCatOpen(v => !v)}
                      aria-expanded={mobileCatOpen}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#1B1C20] font-semibold text-[#F4F4F2] transition-colors text-[15px]"
                    >
                      <span className="flex items-center gap-3">
                        <LayoutGrid size={17} className="text-[#94A3B8]" aria-hidden="true" />
                        Kategoriler
                      </span>
                      <ChevronDown
                        size={16}
                        aria-hidden="true"
                        className={`text-[#85857F] transition-transform duration-200 ${mobileCatOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {mobileCatOpen && (
                      <div
                        className="mt-1 ml-4 pl-4 space-y-4 pb-3"
                        style={{ borderLeft: "1px solid #303136" }}
                      >
                        {(() => {
                          // Build groups from DB hierarchy: root cats → group headers, their children → items
                          const rootCats = categories.filter(c => !c.parent_id)
                          const groups = rootCats
                            .map(root => ({
                              id:    root.id,
                              title: root.name,
                              items: categories.filter(c => c.parent_id === root.id),
                            }))
                            .filter(g => g.items.length > 0)

                          // Root cats with no children show as standalone items
                          const standalone = rootCats.filter(
                            root => !categories.some(c => c.parent_id === root.id)
                          )

                          return (
                            <>
                              {standalone.map(cat => {
                                const CatIcon = CAT_ICONS[cat.slug] ?? Flame
                                return (
                                  <ul key={cat.id} className="space-y-0.5">
                                    <li>
                                      <Link
                                        href={`/urunler?kategori=${cat.slug}`}
                                        onClick={() => { setMobileOpen(false); setMobileCatOpen(false) }}
                                        className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-[#B9B9B4] hover:bg-[#1B1C20] hover:text-white transition-colors"
                                      >
                                        <CatIcon size={14} className="text-[#85857F] shrink-0" aria-hidden="true" />
                                        {cat.name}
                                      </Link>
                                    </li>
                                  </ul>
                                )
                              })}
                              {groups.map(group => (
                                <div key={group.id}>
                                  <div className="text-[10px] font-bold text-[#85857F] uppercase tracking-wider mb-1.5 px-2">
                                    {group.title}
                                  </div>
                                  <ul className="space-y-0.5">
                                    {group.items.map(cat => {
                                      const CatIcon = CAT_ICONS[cat.slug] ?? Flame
                                      return (
                                        <li key={cat.id}>
                                          <Link
                                            href={`/urunler?kategori=${cat.slug}`}
                                            onClick={() => { setMobileOpen(false); setMobileCatOpen(false) }}
                                            className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-[#B9B9B4] hover:bg-[#1B1C20] hover:text-white transition-colors"
                                          >
                                            <CatIcon size={14} className="text-[#85857F] shrink-0" aria-hidden="true" />
                                            {cat.name}
                                          </Link>
                                        </li>
                                      )
                                    })}
                                  </ul>
                                </div>
                              ))}
                              {groups.length === 0 && standalone.length === 0 && (
                                <p className="px-2 py-2 text-sm" style={{ color: "#555550" }}>Henüz kategori eklenmedi.</p>
                              )}
                            </>
                          )
                        })()}

                        <Link
                          href="/kategoriler"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-1.5 px-2 py-2 text-sm font-semibold text-[#94A3B8] hover:underline"
                        >
                          Tüm Kategoriler <ChevronRight size={13} aria-hidden="true" />
                        </Link>
                      </div>
                    )}
                  </li>

                  {navLinks.map(link => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="block px-4 py-3 rounded-xl hover:bg-[#1B1C20] font-medium text-[#B9B9B4] hover:text-white transition-colors text-[15px]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Sheet footer */}
              <div className="px-5 pb-6 pt-3 space-y-3" style={{ borderTop: "1px solid #303136" }}>
                {validPh && (
                  <a
                    href={`tel:${validPh}`}
                    className="flex items-center justify-center gap-2 w-full text-white px-4 py-3.5 rounded-xl font-bold transition-colors text-[15px]"
                    style={{ background: "#334155" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#475569")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#334155")}
                  >
                    <Phone size={16} aria-hidden="true" />
                    {validPh}
                  </a>
                )}
                {wa.home && (
                  <a
                    href={wa.home}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 w-full text-[#F4F4F2] px-4 py-3.5 rounded-xl font-semibold transition-colors text-[15px] hover:bg-[#1B1C20]"
                    style={{ border: "1px solid #303136" }}
                  >
                    <WaIconSm />
                    WhatsApp ile Ulaş
                  </a>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* ── Desktop navigation ────────────────────────────────────────────── */}
      <div
        className="hidden md:block relative"
        style={{ borderTop: "1px solid #1E1E22", background: "#0E0E10" }}
      >
        <div className="max-w-7xl mx-auto flex items-stretch">

          {/* Kategori butonu */}
          <button
            onClick={() => setMegaOpen(v => !v)}
            aria-expanded={megaOpen}
            aria-controls="mega-menu"
            aria-haspopup="true"
            aria-label="Kategorileri aç"
            className={`flex items-center gap-3 shrink-0 w-[230px] lg:w-[250px] xl:w-[270px] px-6 py-4 text-[14px] font-bold tracking-tight transition-all duration-150 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#64748B] ${
              megaOpen
                ? "text-white"
                : "text-[#F4F4F2] hover:bg-[#1B1C20]"
            }`}
            style={
              megaOpen
                ? { background: "#334155" }
                : { borderRight: "1px solid #303136", background: "#151619" }
            }
          >
            <LayoutGrid size={16} className="shrink-0" aria-hidden="true" />
            <span className="truncate">Kategoriler</span>
            <ChevronDown
              size={14}
              aria-hidden="true"
              className={`ml-auto shrink-0 transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Nav linkleri */}
          <nav aria-label="Ana menü" className="flex-1 px-3">
            <ul className="flex h-full items-center gap-0.5">
              {navLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center h-full px-5 py-4 text-[14px] font-semibold text-[#B9B9B4] hover:text-white hover:bg-[#1B1C20] rounded-lg transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[#64748B] tracking-wide"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {megaOpen && (
          <CategoryMegaMenu onClose={() => setMegaOpen(false)} categories={categories} />
        )}
      </div>

    </header>
  )
}
