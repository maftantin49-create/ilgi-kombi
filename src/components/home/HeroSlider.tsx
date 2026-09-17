import Link from "next/link"
import Image from "next/image"

export default function HeroSlider() {
  return (
    <section aria-label="Ana sayfa hero bölümü">
      <Link href="/urunler" className="block">
        <Image
          src="/hero/hero-premium-v2.png"
          alt="Kombi ve ısıtma sistemleri için güvenilir çözüm ortağınız"
          width={1717}
          height={916}
          priority
          className="h-auto w-full object-contain"
          sizes="100vw"
        />
      </Link>
    </section>
  )
}
