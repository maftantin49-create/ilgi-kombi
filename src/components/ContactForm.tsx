"use client"

import { useState } from "react"
import { CheckCircle } from "lucide-react"

interface FormData {
  name: string
  phone: string
  subject: string
  message: string
}

interface Errors {
  name?: string
  phone?: string
  message?: string
}

const validate = (data: FormData): Errors => {
  const errors: Errors = {}
  if (!data.name.trim() || data.name.trim().length < 2) errors.name = "Ad Soyad en az 2 karakter olmalı"
  const phoneClean = data.phone.replace(/[\s\-()]/g, "")
  if (!phoneClean || !/^(\+90|0)?5\d{9}$/.test(phoneClean)) errors.phone = "Geçerli bir telefon numarası girin (05XX XXX XX XX)"
  if (!data.message.trim() || data.message.trim().length < 10) errors.message = "Mesaj en az 10 karakter olmalı"
  return errors
}

const inputBase: React.CSSProperties = {
  width: "100%",
  background: "#FFFFFF",
  border: "1px solid #E2E6EA",
  borderRadius: "10px",
  padding: "10px 14px",
  fontSize: "14px",
  color: "#111827",
  outline: "none",
  transition: "border-color 180ms",
}

const inputError: React.CSSProperties = {
  ...inputBase,
  borderColor: "rgba(239,68,68,0.60)",
}

export default function ContactForm() {
  const [form, setForm] = useState<FormData>({ name: "", phone: "", subject: "", message: "" })
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field as keyof Errors]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    const lines = [
      `*İletişim Formu*`,
      `Ad Soyad: ${form.name}`,
      `Telefon: ${form.phone}`,
      form.subject ? `Konu: ${form.subject}` : null,
      `Mesaj: ${form.message}`,
    ].filter(Boolean).join("\n")
    window.open(`https://wa.me/905304434885?text=${encodeURIComponent(lines)}`, "_blank", "noopener,noreferrer")
    setSubmitted(true)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#93C5FD"
  }
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#E2E6EA"
  }

  if (submitted) {
    return (
      <div
        className="p-8 rounded-[20px] flex flex-col items-center justify-center text-center min-h-[400px]"
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E6EA",
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}
        >
          <CheckCircle size={32} style={{ color: "#22c55e" }} aria-hidden="true" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">WhatsApp Açıldı!</h3>
        <p className="text-[14px] mb-6 max-w-xs text-gray-500">
          Mesajınız WhatsApp&apos;ta hazır. Gönder tuşuna basmanız yeterli.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ name: "", phone: "", subject: "", message: "" }) }}
          className="text-sm font-medium transition-colors text-blue-600 hover:text-blue-800"
        >
          Yeni mesaj gönder
        </button>
      </div>
    )
  }

  return (
    <div
      className="p-6 rounded-[20px]"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E6EA",
      }}
    >
      <h2 className="font-bold text-[17px] text-gray-900 mb-2">Mesaj Gönderin</h2>
      <p className="text-[12px] mb-5 text-gray-500">
        Formu doldurun, WhatsApp üzerinden ileteceğiz.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Name */}
        <div>
          <label htmlFor="contact-name" className="block text-[12px] font-medium mb-1.5 text-gray-500">
            Adınız Soyadınız <span className="text-red-400" aria-hidden="true">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            value={form.name}
            onChange={set("name")}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Ahmet Yılmaz"
            autoComplete="name"
            aria-required="true"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            style={errors.name ? inputError : inputBase}
          />
          {errors.name && (
            <p id="name-error" role="alert" className="text-[11px] text-red-400 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="contact-phone" className="block text-[12px] font-medium mb-1.5 text-gray-500">
            Telefon <span className="text-red-400" aria-hidden="true">*</span>
          </label>
          <input
            id="contact-phone"
            type="tel"
            value={form.phone}
            onChange={set("phone")}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="0532 123 45 67"
            autoComplete="tel"
            aria-required="true"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            style={errors.phone ? inputError : inputBase}
          />
          {errors.phone && (
            <p id="phone-error" role="alert" className="text-[11px] text-red-400 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="contact-subject" className="block text-[12px] font-medium mb-1.5 text-gray-500">
            Konu
          </label>
          <select
            id="contact-subject"
            value={form.subject}
            onChange={set("subject")}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{ ...inputBase, colorScheme: "light" }}
          >
            <option value="">Konu seçin</option>
            <option value="parca-sorgusu">Parça sorusu</option>
            <option value="siparis">Sipariş bilgisi</option>
            <option value="iade">İade / değişim</option>
            <option value="teknik">Teknik destek</option>
            <option value="diger">Diğer</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="contact-message" className="block text-[12px] font-medium mb-1.5 text-gray-500">
            Mesajınız <span className="text-red-400" aria-hidden="true">*</span>
          </label>
          <textarea
            id="contact-message"
            rows={4}
            value={form.message}
            onChange={set("message")}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Mesajınızı buraya yazın..."
            aria-required="true"
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "message-error" : undefined}
            style={{ ...inputBase, resize: "none" }}
          />
          {errors.message && (
            <p id="message-error" role="alert" className="text-[11px] text-red-400 mt-1">{errors.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 font-bold text-[13px] tracking-[0.08em] uppercase rounded-[10px] flex items-center justify-center gap-2 transition-all duration-150 hover:-translate-y-0.5"
          style={{
            background: "#1E3A8A",
            color: "#FFFFFF",
            boxShadow: "0 2px 14px rgba(30,58,138,0.20)",
          }}
        >
          WhatsApp ile Gönder
        </button>
      </form>
    </div>
  )
}
