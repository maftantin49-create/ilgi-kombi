"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Search, ChevronRight, ArrowRight } from "lucide-react"
import { Suspense } from "react"
import { wa } from "@/lib/whatsapp"
import Link from "next/link"

const BRANDS = [
  "Baymak", "Vaillant", "Ferroli", "Demirdöküm", "Ariston",
  "Bosch", "Buderus", "Junkers", "Protherm", "Immergas",
]

const combiModels: Record<string, string[]> = {
  Baymak:     ["Luna Duo Tec", "Luna3 Comfort", "Luna Classic", "Turbo B", "28 Fi"],
  Vaillant:   ["turboTEC plus", "turboTEC pro", "ecoTEC plus", "atmoTEC"],
  Ferroli:    ["Domiproject", "DomiFer", "BlueHelix", "Divatech"],
  Demirdöküm: ["Niobe Duo", "Nitromix", "Atmomax", "Demirfen"],
  Ariston:    ["Clas One", "Genus One", "BS II", "Egis Plus"],
  Bosch:      ["Condens 7000", "Gaz 7000", "ZSC", "ZWC"],
}

const steps = ["Marka", "Model", "Arıza", "Sonuçlar"]

function ParcaBulContent() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState(() => {
    const m  = searchParams.get("marka")
    const mo = searchParams.get("model")
    const a  = searchParams.get("ariza")
    if (m && mo && a) return 4
    if (m && mo) return 3
    if (m) return 2
    return 1
  })
  const [brand,   setBrand]   = useState(searchParams.get("marka") || "")
  const [model,   setModel]   = useState(searchParams.get("model") || "")
  const [symptom, setSymptom] = useState(searchParams.get("ariza") || "")

  const availableModels = brand ? (combiModels[brand] || ["Modelim listede yok"]) : []

  const listingHref = brand
    ? `/urunler?marka=${encodeURIComponent(brand)}`
    : "/urunler"

  const cardStyle = {
    background: "#151618",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "16px",
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "#F4F4F2" }}>Parça Bul</h1>
        <p style={{ color: "#666660" }}>Cihazınızı seçin, uyumlu parçaları listeleyelim</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors"
              style={
                step > i + 1
                  ? { background: "#22c55e", color: "#fff" }
                  : step === i + 1
                  ? { background: "#D4A017", color: "#090A0C" }
                  : { background: "#252527", color: "#555550" }
              }
            >
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span
              className="text-sm hidden md:block"
              style={{ color: step === i + 1 ? "#D4A017" : "#555550", fontWeight: step === i + 1 ? 600 : 400 }}
            >
              {s}
            </span>
            {i < steps.length - 1 && <ChevronRight size={14} style={{ color: "#3A3A3A" }} />}
          </div>
        ))}
      </div>

      {/* Step 1: Brand */}
      {step >= 1 && (
        <div style={cardStyle}>
          <h2 className="font-bold mb-4" style={{ color: "#F4F4F2" }}>
            1. Cihazınızın markası nedir?
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {BRANDS.map(b => (
              <button
                key={b}
                onClick={() => { setBrand(b); setModel(""); setStep(2) }}
                className="rounded-xl py-2.5 px-3 text-sm font-medium transition-all"
                style={
                  brand === b
                    ? { border: "1px solid #D4A017", background: "rgba(212,160,23,0.10)", color: "#D4A017" }
                    : { border: "1px solid rgba(255,255,255,0.08)", color: "#A0A09A" }
                }
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Model */}
      {step >= 2 && brand && (
        <div style={cardStyle}>
          <h2 className="font-bold mb-4" style={{ color: "#F4F4F2" }}>
            2. Modelinizi seçin
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            {availableModels.map(m => (
              <button
                key={m}
                onClick={() => { setModel(m); setStep(3) }}
                className="rounded-xl py-2.5 px-3 text-sm font-medium text-left transition-all"
                style={
                  model === m
                    ? { border: "1px solid #D4A017", background: "rgba(212,160,23,0.10)", color: "#D4A017" }
                    : { border: "1px solid rgba(255,255,255,0.08)", color: "#A0A09A" }
                }
              >
                {m}
              </button>
            ))}
          </div>
          <p className="text-xs" style={{ color: "#555550" }}>
            Modelinizi bilmiyorsanız cihazın ön paneline veya teknik etiketine bakın.
          </p>
        </div>
      )}

      {/* Step 3: Symptom */}
      {step >= 3 && model && (
        <div style={cardStyle}>
          <h2 className="font-bold mb-4" style={{ color: "#F4F4F2" }}>
            3. Ne tür bir sorun yaşıyorsunuz?
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "isinmiyor",   label: "🌡️ Isınmıyor",    desc: "Radyatörler soğuk" },
              { value: "su-gelmiyor", label: "🚿 Sıcak su yok", desc: "Sıcak su gelmiyor" },
              { value: "hata-kodu",   label: "⚠️ Hata kodu",    desc: "Ekranda hata var" },
              { value: "gurultu",     label: "🔊 Ses yapıyor",  desc: "Gürültülü çalışıyor" },
              { value: "kireç",       label: "🧹 Bakım",         desc: "Periyodik bakım" },
              { value: "diger",       label: "❓ Diğer",         desc: "Farklı bir sorun" },
            ].map(s => (
              <button
                key={s.value}
                onClick={() => { setSymptom(s.value); setStep(4) }}
                className="rounded-xl p-3 text-left transition-all"
                style={
                  symptom === s.value
                    ? { border: "1px solid #D4A017", background: "rgba(212,160,23,0.08)" }
                    : { border: "1px solid rgba(255,255,255,0.08)" }
                }
              >
                <div className="font-medium text-sm" style={{ color: "#E8E8E2" }}>{s.label}</div>
                <div className="text-xs" style={{ color: "#666660" }}>{s.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 4 && (
        <div>
          <div
            className="rounded-2xl p-4 mb-6 flex items-start gap-3"
            style={{
              background: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.25)",
            }}
          >
            <span className="text-2xl">✅</span>
            <div>
              <div className="font-semibold" style={{ color: "#22c55e" }}>
                {brand} {model} için uyumlu parçalar
              </div>
              <div className="text-sm mt-1" style={{ color: "#666660" }}>
                Emin değilseniz WhatsApp&apos;tan teknik destek alabilirsiniz.
              </div>
            </div>
          </div>

          <Link
            href={listingHref}
            className="flex items-center justify-between gap-3 px-6 py-4 rounded-2xl font-semibold transition-colors mb-4"
            style={{ background: "#D4A017", color: "#090A0C" }}
          >
            <span>{brand} uyumlu parçaların tümünü gör</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>

          <div className="mt-6 text-center">
            <a
              href={wa.parcaBul(brand, model, symptom)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors hover:bg-green-600"
              style={{ background: "#22c55e", color: "#fff" }}
            >
              <Search size={16} />
              Bulamadım — WhatsApp&apos;tan Yardım Al
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ParcaBulPage() {
  return (
    <Suspense fallback={<div className="text-center py-20" style={{ color: "#666660" }}>Yükleniyor...</div>}>
      <ParcaBulContent />
    </Suspense>
  )
}
