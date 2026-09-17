"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowRight } from "lucide-react"
const BRANDS = [
  "Baymak", "Vaillant", "Ferroli", "Demirdöküm", "Ariston",
  "Bosch", "Buderus", "Junkers", "Protherm", "Immergas",
]

const combiModels: Record<string, string[]> = {
  Baymak: ["Luna Duo Tec", "Luna3 Comfort", "Luna Classic", "Turbo B", "28 Fi"],
  Vaillant: ["turboTEC plus", "turboTEC pro", "ecoTEC plus", "atmoTEC", "24 kW"],
  Ferroli: ["Domiproject", "DomiFer", "BlueHelix", "Divatech", "Domina"],
  Demirdöküm: ["Niobe Duo", "Nitromix", "Atmomax", "Demirfen", "24 kW"],
  Ariston: ["Clas One", "Genus One", "BS II", "Egis Plus", "24 kW"],
  Bosch: ["Condens 7000", "Gaz 7000", "ZSC", "ZWC", "24 kW"],
}

const symptoms = [
  { value: "isinmiyor", label: "Isınmıyor / Düşük ısı" },
  { value: "su-gelmiyor", label: "Sıcak su gelmiyor" },
  { value: "hata-kodu", label: "Hata kodu veriyor" },
  { value: "ses-gurultu", label: "Ses / gürültü yapıyor" },
  { value: "kireç", label: "Kireç / bakım" },
  { value: "diger", label: "Diğer" },
]

export default function ParcaBulWidget() {
  const router = useRouter()
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [symptom, setSymptom] = useState("")

  const availableModels = brand ? (combiModels[brand] || []) : []

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (brand) params.set("marka", brand)
    if (model) params.set("model", model)
    if (symptom) params.set("ariza", symptom)
    router.push(`/parca-bul?${params.toString()}`)
  }

  return (
    <div className="bg-white/10 backdrop-blur rounded-2xl p-4 md:p-5 max-w-2xl">
      <div className="text-sm font-medium text-blue-100 mb-3">Cihazını seç, parçanı bul</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <select
          value={brand}
          onChange={e => { setBrand(e.target.value); setModel("") }}
          className="bg-white/20 border border-white/30 text-white rounded-xl px-3 py-2.5 text-sm placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          <option value="" className="text-gray-800">Marka seç</option>
          {BRANDS.map(b => (
            <option key={b} value={b} className="text-gray-800">{b}</option>
          ))}
        </select>

        <select
          value={model}
          onChange={e => setModel(e.target.value)}
          disabled={!brand}
          className="bg-white/20 border border-white/30 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
        >
          <option value="" className="text-gray-800">Model seç</option>
          {availableModels.map(m => (
            <option key={m} value={m} className="text-gray-800">{m}</option>
          ))}
          <option value="diger" className="text-gray-800">Modelim listede yok</option>
        </select>

        <select
          value={symptom}
          onChange={e => setSymptom(e.target.value)}
          className="bg-white/20 border border-white/30 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          <option value="" className="text-gray-800">Arıza / ihtiyaç</option>
          {symptoms.map(s => (
            <option key={s.value} value={s.value} className="text-gray-800">{s.label}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleSearch}
        className="w-full bg-[#F97316] hover:bg-orange-500 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        <Search size={16} />
        Parça Bul
        <ArrowRight size={16} />
      </button>
    </div>
  )
}
