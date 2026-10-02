"use client"

import Link from "next/link"
import {
  ShoppingCart, Search, Phone, Menu, X,
  Heart, ChevronDown, ChevronRight, Flame,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useCart } from "@/lib/cart"
import { useFavorites } from "@/lib/favorites"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { buildWa } from "@/lib/whatsapp"
import { validPhone, validWhatsApp } from "@/lib/storefront/guards"
import { useRouter, usePathname } from "next/navigation"
import { CAT_ICONS } from "@/components/layout/CategoryMegaMenu"
import ParcaGruplariMegaMenu, { QUICK_LINKS } from "@/components/layout/ParcaGruplariMegaMenu"
import type { StorefrontCategoryWithCount } from "@/lib/storefront/categories"
import type { StorefrontBrandWithCount } from "@/lib/storefront/brands"

// Nav links — "Parça Grupları" is rendered as a special mega-menu trigger below
const NAV_LINKS = [
  { href: "/urunler",    label: "Ürünler"         },
  { href: "/markalar",   label: "Kombi Markaları" },
  { href: "/urunler",    label: "Kampanyalar"      },
  { href: "/hakkimizda", label: "Hakkımızda"       },
  { href: "/iletisim",   label: "İletişim"         },
]

const WaIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

interface HeaderProps {
  categories: StorefrontCategoryWithCount[]
  brands:     StorefrontBrandWithCount[]
  siteName:   string
  phone:      string
  whatsapp:   string
}

export default function Header({ categories, brands, siteName, phone, whatsapp }: HeaderProps) {
  const totalItems     = useCart(s => s.totalItems)()
  const totalFavorites = useFavorites(s => s.totalFavorites)()
  const [mobileOpen,    setMobileOpen]    = useState(false)
  const [megaOpen,      setMegaOpen]      = useState(false)
  const [mobileCatOpen, setMobileCatOpen] = useState(false)
  const [search,        setSearch]        = useState("")
  const [scrolled,      setScrolled]      = useState(false)
  const router    = useRouter()
  const pathname  = usePathname()
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close mega menu on outside click
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

  // Close mega menu on Escape
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
      setMobileOpen(false)
    }
  }

  const validWa = validWhatsApp(whatsapp)
  const validPh = validPhone(phone)
  const wa      = buildWa(validWa)

  // Shared nav link class helper
  const navLinkClass = (href: string) => {
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))
    return isActive
      ? "flex items-center px-3 py-2.5 text-[13px] font-medium text-blue-700 relative transition-all duration-150 whitespace-nowrap after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-blue-700 after:rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
      : "flex items-center px-3 py-2.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-all duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
  }

  // Parça Grupları trigger class
  const parcaClass = megaOpen
    ? "flex items-center gap-1 px-3 py-2.5 text-[13px] font-medium text-blue-700 relative transition-all duration-150 whitespace-nowrap after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-blue-700 after:rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
    : "flex items-center gap-1 px-3 py-2.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-all duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 bg-white transition-shadow duration-200${scrolled ? " shadow-[0_2px_12px_rgba(0,0,0,0.07)]" : ""}`}
      style={{ borderBottom: "1px solid #E2E6EA" }}
    >
      {/* ── Satır 1: Logo | Search | Actions ─────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3 md:gap-4">

        {/* Text logo */}
        <Link
          href="/"
          className="shrink-0"
          aria-label={`${siteName} Ana Sayfa`}
        >
          <span className="text-xl font-black text-[#1E3A8A] leading-none">İlgi Kombi</span>
          <span className="block text-[10px] font-medium text-gray-400 leading-none tracking-wide mt-0.5">
            Kombi Yedek Parça
          </span>
        </Link>

        {/* Search — desktop */}
        <form onSubmit={handleSearch} className="flex-1 hidden md:flex min-w-0" role="search">
          <div className="relative w-full max-w-2xl mx-auto">
            <label htmlFor="header-search" className="sr-only">Ürün ara</label>
            <Input
              id="header-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Parça adı, marka veya model numarası ara..."
              className="h-10 text-[14px] pr-12 rounded-lg border border-[#E2E6EA] bg-[#F8F9FA] text-gray-800 placeholder:text-gray-400 focus-visible:border-[#93C5FD] focus-visible:ring-2 focus-visible:ring-[#93C5FD]/20"
            />
            <button
              type="submit"
              aria-label="Ara"
              className="absolute right-0 top-0 h-10 w-12 flex items-center justify-center rounded-r-lg bg-[#1E3A8A] text-white hover:bg-[#1E40AF] transition-colors"
            >
              <Search size={17} aria-hidden="true" />
            </button>
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 ml-auto md:ml-0">

          {/* Telefon — desktop */}
          {validPh && (
            <a
              href={`tel:${validPh}`}
              className="hidden lg:flex items-center gap-2 text-[13px] font-semibold text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Phone size={15} className="text-[#1E3A8A]" aria-hidden="true" />
              {validPh}
            </a>
          )}

          {/* WhatsApp — desktop */}
          {wa.home && (
            <a
              href={wa.home}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp ile destek al"
              className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
            >
              <WaIcon />
            </a>
          )}

          {/* Favoriler */}
          <Link
            href="/favoriler"
            className="relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            aria-label={`Favoriler${totalFavorites > 0 ? `, ${totalFavorites} ürün` : ""}`}
          >
            <Heart size={21} aria-hidden="true" />
            {totalFavorites > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold bg-blue-600"
                aria-hidden="true"
              >
                {totalFavorites}
              </span>
            )}
          </Link>

          {/* Sepet */}
          <Link
            href="/sepet"
            className="relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            aria-label={`Sepet${totalItems > 0 ? `, ${totalItems} ürün` : ""}`}
          >
            <ShoppingCart size={21} aria-hidden="true" />
            {totalItems > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold bg-blue-600"
                aria-hidden="true"
              >
                {totalItems}
              </span>
            )}
          </Link>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={v => { setMobileOpen(v); if (!v) setMobileCatOpen(false) }}>
            <SheetTrigger
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              aria-label="Menüyü aç"
            >
              <Menu size={22} aria-hidden="true" />
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-80 p-0 overflow-y-auto"
              style={{ background: "#FFFFFF", borderRight: "1px solid #E2E6EA" }}
            >
              {/* Sheet header */}
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom: "1px solid #E2E6EA", background: "#F8F9FA" }}
              >
                <Link href="/" onClick={() => setMobileOpen(false)}>
                  <span className="text-lg font-black text-[#1E3A8A]">İlgi Kombi</span>
                  <span className="block text-[10px] font-medium text-gray-400 leading-none tracking-wide mt-0.5">Kombi Yedek Parça</span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Menüyü kapat"
                  className="p-1.5 rounded-lg transition-colors text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>

              {/* Mobile search */}
              <div className="px-4 py-3" style={{ borderBottom: "1px solid #E2E6EA" }}>
                <form onSubmit={handleSearch} role="search">
                  <div className="relative">
                    <label htmlFor="mobile-search" className="sr-only">Ürün ara</label>
                    <Input
                      id="mobile-search"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Parça ara..."
                      className="h-10 pr-10 rounded-lg border border-[#E2E6EA] bg-[#F8F9FA] text-gray-800 placeholder:text-gray-400 focus-visible:border-[#93C5FD] focus-visible:ring-0"
                    />
                    <button type="submit" aria-label="Ara" className="absolute right-3 top-2.5">
                      <Search size={17} className="text-gray-400" aria-hidden="true" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Mobile Nav */}
              <nav aria-label="Mobil menü" className="px-3 py-2">
                <ul className="space-y-0.5">

                  {/* Parça Grupları accordion */}
                  <li>
                    <button
                      onClick={() => setMobileCatOpen(v => !v)}
                      aria-expanded={mobileCatOpen}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-colors text-[14px]"
                    >
                      <span>Parça Grupları</span>
                      <ChevronDown
                        size={15}
                        aria-hidden="true"
                        className={`text-gray-400 transition-transform duration-200 ${mobileCatOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {mobileCatOpen && (
                      <div className="mt-1 ml-3 space-y-3 pb-2" style={{ borderLeft: "1px solid #E2E6EA", paddingLeft: "12px" }}>

                        {/* Parça Türleri */}
                        <div>
                          <p className="px-2 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            Parça Türleri
                          </p>
                          {(() => {
                            const rootCats = categories.filter(c => !c.parent_id)
                            const groups = rootCats
                              .map(root => ({
                                id:    root.id,
                                title: root.name,
                                items: categories.filter(c => c.parent_id === root.id),
                              }))
                              .filter(g => g.items.length > 0)

                            const standalone = rootCats.filter(
                              root => !categories.some(c => c.parent_id === root.id)
                            )

                            return (
                              <>
                                {standalone.map(cat => {
                                  const CatIcon = CAT_ICONS[cat.slug] ?? Flame
                                  return (
                                    <Link
                                      key={cat.id}
                                      href={`/urunler?kategori=${cat.slug}`}
                                      onClick={() => { setMobileOpen(false); setMobileCatOpen(false) }}
                                      className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                    >
                                      <CatIcon size={13} className="text-gray-400 shrink-0" aria-hidden="true" />
                                      {cat.name}
                                    </Link>
                                  )
                                })}
                                {groups.map(group => (
                                  <div key={group.id}>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-2 mt-2">
                                      {group.title}
                                    </div>
                                    {group.items.map(cat => {
                                      const CatIcon = CAT_ICONS[cat.slug] ?? Flame
                                      return (
                                        <Link
                                          key={cat.id}
                                          href={`/urunler?kategori=${cat.slug}`}
                                          onClick={() => { setMobileOpen(false); setMobileCatOpen(false) }}
                                          className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                        >
                                          <CatIcon size={13} className="text-gray-400 shrink-0" aria-hidden="true" />
                                          {cat.name}
                                        </Link>
                                      )
                                    })}
                                  </div>
                                ))}
                                {groups.length === 0 && standalone.length === 0 && (
                                  <p className="px-2 py-2 text-sm text-gray-400">Henüz kategori eklenmedi.</p>
                                )}
                              </>
                            )
                          })()}
                          <Link
                            href="/kategoriler"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-1 px-2 py-2 text-sm font-semibold text-blue-700 hover:underline mt-1"
                          >
                            Tüm Kategoriler <ChevronRight size={12} aria-hidden="true" />
                          </Link>
                        </div>

                        {/* Markaya Göre */}
                        {brands.filter(b => b.productCount > 0).length > 0 && (
                          <div style={{ borderTop: "1px solid #F1F3F5", paddingTop: "8px" }}>
                            <p className="px-2 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                              Markaya Göre
                            </p>
                            {brands.filter(b => b.productCount > 0).slice(0, 6).map(brand => (
                              <Link
                                key={brand.id}
                                href={`/urunler?marka=${encodeURIComponent(brand.name)}`}
                                onClick={() => { setMobileOpen(false); setMobileCatOpen(false) }}
                                className="flex items-center justify-between px-2 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                              >
                                <span>{brand.name}</span>
                                <span className="text-xs text-gray-400">{brand.productCount}</span>
                              </Link>
                            ))}
                            <Link
                              href="/markalar"
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-1 px-2 py-2 text-sm font-semibold text-blue-700 hover:underline"
                            >
                              Tüm Markalar <ChevronRight size={12} aria-hidden="true" />
                            </Link>
                          </div>
                        )}

                        {/* Hızlı Erişim */}
                        <div style={{ borderTop: "1px solid #F1F3F5", paddingTop: "8px" }}>
                          <p className="px-2 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            Hızlı Erişim
                          </p>
                          {QUICK_LINKS.map(link => (
                            <Link
                              key={link.label}
                              href={link.href}
                              onClick={() => { setMobileOpen(false); setMobileCatOpen(false) }}
                              className="block px-2 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>

                      </div>
                    )}
                  </li>

                  {/* Regular nav links */}
                  {NAV_LINKS.map(link => (
                    <li key={`${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 font-medium text-gray-600 hover:text-gray-900 transition-colors text-[14px]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Sheet footer */}
              <div className="px-4 pb-6 pt-2 space-y-2.5" style={{ borderTop: "1px solid #E2E6EA" }}>
                {validPh && (
                  <a
                    href={`tel:${validPh}`}
                    className="flex items-center justify-center gap-2 w-full text-white px-4 py-3 rounded-xl font-bold transition-colors text-[14px] bg-[#1E3A8A] hover:bg-[#1E40AF]"
                  >
                    <Phone size={15} aria-hidden="true" />
                    {validPh}
                  </a>
                )}
                {wa.home && (
                  <a
                    href={wa.home}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full text-gray-700 px-4 py-3 rounded-xl font-medium transition-colors text-[14px] hover:bg-gray-50 border border-[#E2E6EA]"
                  >
                    <WaIcon />
                    WhatsApp ile Ulaş
                  </a>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* ── Satır 2: Nav bar ─────────────────────────────────────────────── */}
      <div
        className="hidden md:block relative"
        style={{ borderTop: "1px solid #F1F3F5", background: "#FFFFFF" }}
        onMouseLeave={() => setMegaOpen(false)}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <nav aria-label="Ana menü">
            <ul className="flex items-stretch">

              {/* Ürünler */}
              <li>
                <Link href="/urunler" className={navLinkClass("/urunler")}>
                  Ürünler
                </Link>
              </li>

              {/* Kombi Markaları */}
              <li>
                <Link href="/markalar" className={navLinkClass("/markalar")}>
                  Kombi Markaları
                </Link>
              </li>

              {/* Parça Grupları — mega menu trigger */}
              <li
                onMouseEnter={() => setMegaOpen(true)}
                className="relative"
              >
                <button
                  onClick={() => setMegaOpen(v => !v)}
                  aria-expanded={megaOpen}
                  aria-haspopup="true"
                  className={parcaClass}
                >
                  Parça Grupları
                  <ChevronDown
                    size={13}
                    aria-hidden="true"
                    className={`transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </li>

              {/* Kampanyalar */}
              <li>
                <Link href="/urunler" className={navLinkClass("/__never__")}>
                  Kampanyalar
                </Link>
              </li>

              {/* Hakkımızda */}
              <li>
                <Link href="/hakkimizda" className={navLinkClass("/hakkimizda")}>
                  Hakkımızda
                </Link>
              </li>

              {/* İletişim */}
              <li>
                <Link href="/iletisim" className={navLinkClass("/iletisim")}>
                  İletişim
                </Link>
              </li>

            </ul>
          </nav>
        </div>

        {/* Mega menu — rendered inside nav row div so mouseLeave works correctly */}
        {megaOpen && (
          <div className="absolute top-full left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <ParcaGruplariMegaMenu
                categories={categories}
                brands={brands}
                onClose={() => setMegaOpen(false)}
                waLink={wa.home}
              />
            </div>
          </div>
        )}
      </div>

    </header>
  )
}
