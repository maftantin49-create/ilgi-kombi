export type TechnicalPattern = "pcb" | "circuit" | "pipe" | "fan" | "pump" | "sensor"
export type SceneTone = "cool" | "warm" | "neutral"

export interface ShowcaseBrand {
  id: string
  name: string
  slug: string
  initials: string
  productCount: number
  accentColor: string
  description: string
  featuredParts: string[]
  categoryLink: string
  parcaBulLink: string
  featuredImage: string
  technicalPattern: TechnicalPattern
  heroLabel: string
  sceneTone: SceneTone
}

export const showcaseBrands: ShowcaseBrand[] = [
  {
    id: "bosch",
    name: "Bosch",
    slug: "bosch",
    initials: "BSH",
    productCount: 24,
    accentColor: "#C8102E",
    description: "Alman mühendisliği. Uzun ömürlü, yüksek verimli ısıtma sistemleri.",
    featuredParts: ["Sirkülasyon Pompası", "Fan Motoru", "Kontrol Kartı"],
    categoryLink: "/urunler?marka=Bosch",
    parcaBulLink: "/parca-bul?marka=Bosch",
    featuredImage: "/images/products/pump.svg",
    technicalPattern: "pcb",
    heroLabel: "Alman Mühendisliği",
    sceneTone: "cool",
  },
  {
    id: "vaillant",
    name: "Vaillant",
    slug: "vaillant",
    initials: "VAL",
    productCount: 31,
    accentColor: "#00834D",
    description: "Avrupa'nın lider ısıtma markası. Enerji verimliliğinde standart.",
    featuredParts: ["Ateşleme Elektrodu", "NTC Sensör", "Fan Motoru"],
    categoryLink: "/urunler?marka=Vaillant",
    parcaBulLink: "/parca-bul?marka=Vaillant",
    featuredImage: "/images/products/electrode.svg",
    technicalPattern: "pump",
    heroLabel: "Avrupa Lideri",
    sceneTone: "cool",
  },
  {
    id: "demiirdokum",
    name: "Demirdöküm",
    slug: "demirdokum",
    initials: "DMR",
    productCount: 28,
    accentColor: "#1D4ED8",
    description: "Yerli kombi üretiminin öncüsü. Servis ağı ve stok güvencesi.",
    featuredParts: ["Anakart", "Gaz Valfi", "Üç Yollu Vana"],
    categoryLink: "/urunler?marka=Demirdöküm",
    parcaBulLink: "/parca-bul?marka=Demirdöküm",
    featuredImage: "/images/products/circuit-board.svg",
    technicalPattern: "circuit",
    heroLabel: "Yerli Öncü",
    sceneTone: "neutral",
  },
  {
    id: "baymak",
    name: "Baymak",
    slug: "baymak",
    initials: "BAY",
    productCount: 19,
    accentColor: "#D97706",
    description: "Güçlü Türk markası. Geniş ürün yelpazesi ve yaygın servis.",
    featuredParts: ["Plaka Eşanjör", "Sirkülasyon Pompası", "Sensör"],
    categoryLink: "/urunler?marka=Baymak",
    parcaBulLink: "/parca-bul?marka=Baymak",
    featuredImage: "/images/products/heat-exchanger.svg",
    technicalPattern: "pipe",
    heroLabel: "Türk Kalitesi",
    sceneTone: "warm",
  },
  {
    id: "eca",
    name: "E.C.A.",
    slug: "eca",
    initials: "ECA",
    productCount: 16,
    accentColor: "#7C3AED",
    description: "Yerli üretim kalitesi ve uygun fiyatlı parça politikası.",
    featuredParts: ["Fan Motoru", "NTC Sensör", "Anakart"],
    categoryLink: "/urunler?marka=E.C.A.",
    parcaBulLink: "/parca-bul?marka=E.C.A.",
    featuredImage: "/images/products/fan.svg",
    technicalPattern: "fan",
    heroLabel: "Uygun & Güçlü",
    sceneTone: "neutral",
  },
  {
    id: "ariston",
    name: "Ariston",
    slug: "ariston",
    initials: "ARI",
    productCount: 22,
    accentColor: "#BE123C",
    description: "İtalyan tasarımı. Estetik ve işlevselliği bir arada sunar.",
    featuredParts: ["Genleşme Tankı", "Gaz Valfi", "Kontrol Kartı"],
    categoryLink: "/urunler?marka=Ariston",
    parcaBulLink: "/parca-bul?marka=Ariston",
    featuredImage: "/images/products/expansion-tank.svg",
    technicalPattern: "sensor",
    heroLabel: "İtalyan Tasarımı",
    sceneTone: "warm",
  },
  {
    id: "ferroli",
    name: "Ferroli",
    slug: "ferroli",
    initials: "FER",
    productCount: 18,
    accentColor: "#B45309",
    description: "İtalyan mühendisliği. Güvenilir kombi yedek parça çözümleri.",
    featuredParts: ["Anakart", "Gaz Valfi", "Fan Motoru"],
    categoryLink: "/urunler?marka=Ferroli",
    parcaBulLink: "/parca-bul?marka=Ferroli",
    featuredImage: "/images/products/gas-valve.svg",
    technicalPattern: "pipe",
    heroLabel: "İtalyan Mühendisliği",
    sceneTone: "warm",
  },
  {
    id: "buderus",
    name: "Buderus",
    slug: "buderus",
    initials: "BUD",
    productCount: 14,
    accentColor: "#0E7490",
    description: "Bosch Group'un premium ısıtma markası. Kondansasyon teknolojisi.",
    featuredParts: ["Anakart", "Sirkülasyon Pompası", "Ateşleme Grubu"],
    categoryLink: "/urunler?marka=Buderus",
    parcaBulLink: "/parca-bul?marka=Buderus",
    featuredImage: "/images/products/sensor.svg",
    technicalPattern: "pcb",
    heroLabel: "Premium Kondansasyon",
    sceneTone: "cool",
  },
]
