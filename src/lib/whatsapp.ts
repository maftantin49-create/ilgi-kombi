// WhatsApp link builder — pure functions, no module-level side effects.
// waNumber comes from DB settings (company.whatsapp). Returns null when
// number is not configured yet, so callers can hide the link instead of
// producing an invalid wa.me/TODO_... URL.

export type WaLinks = ReturnType<typeof buildWa>

function link(waNumber: string, message: string): string {
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
}

export function buildWa(waNumber: string | null) {
  if (!waNumber) {
    return {
      home:         null as string | null,
      contact:      null as string | null,
      cart:         null as string | null,
      rehber:       null as string | null,
      notFound:     null as string | null,
      parcaBul:     (_brand?: string, _model?: string, _symptom?: string) => null as string | null,
      product:      (_name: string, _sku?: string, _url?: string) => null as string | null,
      productOrder: (_name: string, _sku: string, _qty: number) => null as string | null,
      productCompat:(_name: string) => null as string | null,
      cartOrder:    (_items: Array<{ name: string; sku: string; quantity: number; unitPrice: number }>, _total: number) => null as string | null,
    }
  }

  return {
    home: link(waNumber,
      "Merhaba,\n\nWeb siteniz üzerinden size ulaştım.\n\nYedek parça hakkında bilgi almak istiyorum."
    ),
    contact: link(waNumber,
      "Merhaba,\n\nWeb siteniz üzerinden size ulaştım.\n\nMüsait olduğunuzda benimle iletişime geçebilir misiniz?"
    ),
    cart: link(waNumber,
      "Merhaba,\n\nSepetimde bulunan ürünler hakkında bilgi almak ve sipariş oluşturmak istiyorum."
    ),
    rehber: link(waNumber,
      "Merhaba,\n\nWeb sitenizdeki rehberi inceledim.\n\nBununla ilgili birkaç sorum var.\n\nYardımcı olabilir misiniz?"
    ),
    notFound: link(waNumber,
      "Merhaba,\n\nWeb sitenizde aradığım ürünü bulamadım.\n\nYardımcı olabilir misiniz?"
    ),
    parcaBul: (brand?: string, model?: string, symptom?: string) => {
      if (brand && model && symptom) {
        return link(waNumber,
          `Merhaba,\n\nAracım/Cihazım için uygun yedek parçayı bulmak istiyorum.\n\nMarka: ${brand}\nModel: ${model}\nSorun: ${symptom}\n\nYardımcı olabilir misiniz?`
        )
      }
      return link(waNumber,
        "Merhaba,\n\nAracım/Cihazım için uygun yedek parçayı bulmak istiyorum.\n\nYardımcı olabilir misiniz?"
      )
    },
    product: (name: string, sku?: string, url?: string) =>
      link(waNumber,
        `Merhaba,\n\n"${name}"${sku ? ` (SKU: ${sku})` : ""} hakkında bilgi almak istiyorum.` +
        `${url ? `\n\nÜrün linki:\n${url}` : ""}` +
        `\n\nMüsaitseniz yardımcı olabilir misiniz?`
      ),
    productOrder: (name: string, sku: string, qty: number) =>
      link(waNumber,
        `Merhaba,\n\nWeb sitenizde bulunan\n\n"${name}" (${sku})\n\nisimli üründen ${qty} adet sipariş vermek istiyorum.\n\nMüsaitseniz yardımcı olabilir misiniz?`
      ),
    productCompat: (name: string) =>
      link(waNumber,
        `Merhaba,\n\nWeb sitenizde bulunan\n\n"${name}"\n\nürününün cihazıma uyup uymadığını öğrenmek istiyorum.\n\nYardımcı olabilir misiniz?`
      ),
    cartOrder: (
      items: Array<{ name: string; sku: string; quantity: number; unitPrice: number }>,
      total: number
    ) =>
      link(waNumber,
        `Merhaba,\n\nAşağıdaki ürünler için sipariş vermek istiyorum:\n\n` +
        items.map((i) =>
          `• ${i.name} (${i.sku}) × ${i.quantity} = ${(i.unitPrice * i.quantity).toLocaleString("tr-TR")} ₺`
        ).join("\n") +
        `\n\nToplam: ${total.toLocaleString("tr-TR")} ₺\n\nYardımcı olabilir misiniz?`
      ),
  }
}

// Legacy shim — components that haven't migrated to settings-aware props
// can call this. Returns all-null links when number is not set.
export const wa = buildWa(null)
