"use client"

import { motion } from "framer-motion"

function WaIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className="shrink-0"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

interface Props {
  waLink?: string | null
  phone?: string | null
  phoneDisplay?: string | null
}

export default function WhatsAppCTA({ waLink, phone, phoneDisplay }: Props) {
  return (
    <section
      aria-label="WhatsApp teknik destek"
      style={{
        background: "#111214",
        borderTop: "1px solid rgba(255,196,0,0.14)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16 flex flex-col lg:flex-row items-center justify-between gap-8">

        {/* Left */}
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.48, ease: "easeOut" }}
          className="text-center lg:text-left"
        >
          <div className="flex justify-center lg:justify-start mb-5">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.22)",
                color: "#22c55e",
              }}
            >
              <WaIcon size={24} />
            </div>
          </div>

          <h2
            className="font-black mb-3"
            style={{ color: "#F4F4F2", fontSize: "clamp(22px, 2.4vw, 30px)" }}
          >
            Parçanızı bulamadınız mı?
          </h2>
          <p
            className="text-[15px] leading-[1.75]"
            style={{ color: "#666660", maxWidth: "440px" }}
          >
            WhatsApp üzerinden yazın, uzman ekibimiz parçanızı bulmanıza yardımcı olsun.
          </p>
        </motion.div>

        {/* Right */}
        <motion.div
          initial={{ opacity: 0, x: 18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.48, ease: "easeOut", delay: 0.1 }}
          className="shrink-0 flex flex-col items-center gap-3"
        >
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 font-bold px-8 py-4 rounded-xl transition-colors duration-150 hover:bg-[#F2C94C]"
              style={{
                background: "#D4A017",
                color: "#090A0C",
                boxShadow: "0 4px 20px rgba(212,160,23,0.25)",
                fontSize: "14px",
              }}
            >
              <WaIcon size={18} />
              WhatsApp ile Yaz
            </a>
          ) : (
            <a
              href="/iletisim"
              className="flex items-center gap-2.5 font-bold px-8 py-4 rounded-xl transition-colors duration-150 hover:bg-[#F2C94C]"
              style={{
                background: "#D4A017",
                color: "#090A0C",
                boxShadow: "0 4px 20px rgba(212,160,23,0.25)",
                fontSize: "14px",
              }}
            >
              Bize Ulaşın
            </a>
          )}
          {phone && phoneDisplay && (
            <a
              href={`tel:${phone}`}
              className="text-[12px] transition-colors duration-150 hover:text-white"
              style={{ color: "#4A4A48" }}
            >
              veya arayın: {phoneDisplay}
            </a>
          )}
        </motion.div>
      </div>
    </section>
  )
}
