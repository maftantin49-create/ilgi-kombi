// Pure string guard helpers — client-safe, no server imports.
// Returns null when a value is empty, a TODO placeholder, or otherwise invalid.

export function validPhone(phone: string): string | null {
  return phone && !phone.startsWith("TODO") ? phone : null
}

export function validWhatsApp(wa: string): string | null {
  return wa && !wa.startsWith("TODO") && wa.length >= 10 ? wa : null
}

export function validEmail(email: string): string | null {
  return email && !email.startsWith("TODO") && email.includes("@") ? email : null
}

export function validSocial(url: string): string | null {
  return url && !url.startsWith("TODO") && url.length > 4 ? url : null
}
