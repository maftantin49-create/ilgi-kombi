// Legal business identity — sourced from vergi levhası (tax certificate).
//
// LEGAL_DEBT: mersisNumber not present on tax certificate — leave blank until
// MERSİS registration is confirmed. Empty string = field suppressed from public UI.
// LEGAL_DEBT: returnAddress blank — fallback to fullAddress (same physical location).
//
// Contact, phone, email, site URL → imported from site.ts (no duplication).

export const legal = {
  // Şahıs işletmesi — vergi levhasında ticaret unvanı boş; sahip adı kullanılır
  tradeName:       "Turgay Çıtak",
  taxOffice:       "Halkalı",
  taxNumber:       "",   // TODO_CLIENT: vergi kimlik numarası henüz iletilmedi
  mersisNumber:    "",
  fullAddress:     "İnönü Mah. Alageyik Cad. Yılmaz Apt No: 36-38C İç Kapı No: 3 Küçükçekmece / İstanbul",
  returnAddress:   "",   // fallback: fullAddress
  shippingCompany: "DHL",
}
