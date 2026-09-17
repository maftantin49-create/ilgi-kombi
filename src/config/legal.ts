// Legal business identity — sourced from vergi levhası (tax certificate).
//
// LEGAL_DEBT: mersisNumber not present on tax certificate — leave blank until
// MERSİS registration is confirmed. Empty string = field suppressed from public UI.
// LEGAL_DEBT: shippingCompany unknown — fill when carrier contract is signed.
// LEGAL_DEBT: returnAddress blank — fallback to fullAddress (same physical location).
//
// Contact, phone, email, site URL → imported from site.ts (no duplication).

// Legal business identity — sourced from vergi levhası (tax certificate).
// Fill from customer form. Empty string = field suppressed from public UI.
// DO NOT commit real client data here before receiving the signed customer form.

export const legal = {
  tradeName:       "",   // TODO_CLIENT: vergi levhasından
  taxOffice:       "",   // TODO_CLIENT: vergi levhasından
  taxNumber:       "",   // TODO_CLIENT: vergi levhasından
  mersisNumber:    "",
  fullAddress:     "",   // TODO_CLIENT: müşteri formundan
  returnAddress:   "",
  shippingCompany: "",   // TODO_CLIENT: kargo sözleşmesinden
}
