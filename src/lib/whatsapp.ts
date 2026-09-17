import { site } from "@/config/site"

const base = `https://wa.me/${site.whatsapp}?text=`

const link = (message: string) => base + encodeURIComponent(message)

export const wa = {
  home: link(
    "Merhaba,\n\nWeb siteniz üzerinden size ulaştım.\n\nYedek parça hakkında bilgi almak istiyorum."
  ),

  contact: link(
    "Merhaba,\n\nWeb siteniz üzerinden size ulaştım.\n\nMüsait olduğunuzda benimle iletişime geçebilir misiniz?"
  ),

  cart: link(
    "Merhaba,\n\nSepetimde bulunan ürünler hakkında bilgi almak ve sipariş oluşturmak istiyorum."
  ),

  parcaBul: (brand?: string, model?: string, symptom?: string) => {
    if (brand && model && symptom) {
      return link(
        `Merhaba,\n\nAracım/Cihazım için uygun yedek parçayı bulmak istiyorum.\n\nMarka: ${brand}\nModel: ${model}\nSorun: ${symptom}\n\nYardımcı olabilir misiniz?`
      )
    }
    return link(
      "Merhaba,\n\nAracım/Cihazım için uygun yedek parçayı bulmak istiyorum.\n\nYardımcı olabilir misiniz?"
    )
  },

  rehber: link(
    "Merhaba,\n\nWeb sitenizdeki rehberi inceledim.\n\nBununla ilgili birkaç sorum var.\n\nYardımcı olabilir misiniz?"
  ),

  notFound: link(
    "Merhaba,\n\nWeb sitenizde aradığım ürünü bulamadım.\n\nYardımcı olabilir misiniz?"
  ),

  product: (name: string, sku?: string, url?: string) =>
    link(
      `Merhaba,\n\n"${name}"${sku ? ` (SKU: ${sku})` : ""} hakkında bilgi almak istiyorum.` +
      `${url ? `\n\nÜrün linki:\n${url}` : ""}` +
      `\n\nMüsaitseniz yardımcı olabilir misiniz?`
    ),

  productOrder: (name: string, sku: string, qty: number) =>
    link(
      `Merhaba,\n\nWeb sitenizde bulunan\n\n"${name}" (${sku})\n\nisimli üründen ${qty} adet sipariş vermek istiyorum.\n\nMüsaitseniz yardımcı olabilir misiniz?`
    ),

  productCompat: (name: string) =>
    link(
      `Merhaba,\n\nWeb sitenizde bulunan\n\n"${name}"\n\nürününün cihazıma uyup uymadığını öğrenmek istiyorum.\n\nYardımcı olabilir misiniz?`
    ),

  cartOrder: (
    items: Array<{ name: string; sku: string; quantity: number; unitPrice: number }>,
    total: number
  ) =>
    link(
      `Merhaba,\n\nAşağıdaki ürünler için sipariş vermek istiyorum:\n\n` +
      items
        .map(
          (i) =>
            `• ${i.name} (${i.sku}) × ${i.quantity} = ${(i.unitPrice * i.quantity).toLocaleString("tr-TR")} ₺`
        )
        .join("\n") +
      `\n\nToplam: ${total.toLocaleString("tr-TR")} ₺\n\nYardımcı olabilir misiniz?`
    ),
}
