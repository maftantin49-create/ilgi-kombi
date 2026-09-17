import { notFound } from "next/navigation"
import Link from "next/link"
import { getPaymentById } from "@/lib/admin/payments"
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/admin/schemas/order"
import SanitizedResponseViewer from "@/components/admin/payments/SanitizedResponseViewer"
import type { PaymentAttempt } from "@/lib/admin/payments"
import type { PaymentStatus } from "@/types/database.types"
import { formatDateTimeFull, formatPrice } from "@/lib/admin/format"
import { StatusBadge } from "@/components/admin/StatusBadge"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ id: string }>
}

const PAYMENT_STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  initialized: { color: "#A5A5A5", bg: "rgba(165,165,165,0.08)" },
  pending:     { color: "#D4A017", bg: "rgba(212,160,23,0.1)" },
  success:     { color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  failed:      { color: "#f87171", bg: "rgba(248,113,113,0.1)" },
  cancelled:   { color: "#f87171", bg: "rgba(248,113,113,0.08)" },
  refunded:    { color: "#94a3b8", bg: "rgba(148,163,184,0.08)" },
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#151618",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "8px",
        overflow: "hidden",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          fontSize: "12px",
          fontWeight: 600,
          color: "#A5A5A5",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {title}
      </div>
      <div style={{ padding: "16px" }}>{children}</div>
    </div>
  )
}

function DataRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: "12px", marginBottom: "10px", fontSize: "13px" }}>
      <span style={{ color: "#A5A5A5", minWidth: "160px", flexShrink: 0 }}>{label}</span>
      <span style={{ color: "#F4F4F2", wordBreak: "break-all" }}>{children}</span>
    </div>
  )
}

const ORDER_STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  draft:              { color: "#A5A5A5", bg: "rgba(165,165,165,0.08)" },
  pending_payment:    { color: "#D4A017", bg: "rgba(212,160,23,0.1)" },
  paid:               { color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  preparing:          { color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  shipped:            { color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  delivered:          { color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  cancelled:          { color: "#f87171", bg: "rgba(248,113,113,0.1)" },
  refunded:           { color: "#f87171", bg: "rgba(248,113,113,0.1)" },
  partially_refunded: { color: "#D4A017", bg: "rgba(212,160,23,0.1)" },
}

function AttemptRow({ attempt, currentId }: { attempt: PaymentAttempt; currentId: string }) {
  const isCurrent = attempt.id === currentId
  const statusColor = PAYMENT_STATUS_STYLE[attempt.status]?.color ?? "#A5A5A5"
  const statusLabel = PAYMENT_STATUS_LABELS[attempt.status as PaymentStatus] ?? attempt.status

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 12px",
        borderRadius: "6px",
        background: isCurrent ? "rgba(212,160,23,0.05)" : "transparent",
        border: isCurrent ? "1px solid rgba(212,160,23,0.2)" : "1px solid transparent",
        marginBottom: "6px",
        gap: "12px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "11px",
            color: isCurrent ? "#D4A017" : "#A5A5A5",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "3px",
            padding: "2px 6px",
          }}
        >
          #{attempt.attempt_number}
        </span>
        <span style={{ fontSize: "11px", color: "#A5A5A5" }}>
          {attempt.provider}
        </span>
        <span style={{ fontSize: "11px", color: "#A5A5A5" }}>
          {formatDateTimeFull(attempt.created_at)}
        </span>
        {isCurrent && (
          <span style={{ fontSize: "10px", color: "#D4A017", fontWeight: 600 }}>
            ← mevcut
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <span style={{ fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap" }}>
          {formatPrice(Number(attempt.amount), attempt.currency)}
        </span>
        <span style={{ fontSize: "12px", color: statusColor, whiteSpace: "nowrap" }}>
          {statusLabel}
        </span>
        {attempt.id !== currentId && (
          <Link
            href={`/admin/payments/${attempt.id}`}
            style={{
              fontSize: "11px",
              color: "#A5A5A5",
              textDecoration: "none",
              padding: "2px 8px",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "3px",
            }}
          >
            Git
          </Link>
        )}
      </div>
    </div>
  )
}

export default async function PaymentDetailPage({ params }: Props) {
  const { id } = await params
  const detail = await getPaymentById(id)

  if (!detail) notFound()

  const order = detail.orders
  const customer = order?.customers

  // Extract errorCode from sanitized_response safely (before redaction for display)
  // We read it raw here only to extract the error code string for the header summary
  type SanitizedShape = { errorCode?: string; errorMessage?: string }
  const rawResponse = detail.sanitized_response as SanitizedShape | null
  const errorCode = rawResponse?.errorCode ?? null
  const errorMessage = rawResponse?.errorMessage ?? null

  return (
    <div style={{ maxWidth: "900px" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/payments"
          style={{ color: "#A5A5A5", fontSize: "13px", textDecoration: "none" }}
        >
          ← Ödemeler
        </Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>/</span>
        <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#A5A5A5" }}>
          {detail.id.slice(0, 8)}…
        </span>
      </div>

      {/* Status bar */}
      <div
        style={{
          background: "#151618",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "20px",
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          alignItems: "center",
        }}
      >
        <div>
          <p style={{ fontSize: "11px", color: "#A5A5A5", marginBottom: "4px" }}>Ödeme Durumu</p>
          <StatusBadge
            value={detail.status}
            labels={PAYMENT_STATUS_LABELS}
            styles={PAYMENT_STATUS_STYLE}
          />
        </div>
        <div>
          <p style={{ fontSize: "11px", color: "#A5A5A5", marginBottom: "4px" }}>Tutar</p>
          <p style={{ fontSize: "16px", fontWeight: 600, color: "#F4F4F2" }}>
            {formatPrice(Number(detail.amount), detail.currency)}
          </p>
        </div>
        <div>
          <p style={{ fontSize: "11px", color: "#A5A5A5", marginBottom: "4px" }}>Provider</p>
          <p style={{ fontSize: "13px", color: "#F4F4F2" }}>{detail.provider}</p>
        </div>
        <div>
          <p style={{ fontSize: "11px", color: "#A5A5A5", marginBottom: "4px" }}>Tarih</p>
          <p style={{ fontSize: "13px", color: "#F4F4F2" }}>{formatDateTimeFull(detail.created_at)}</p>
        </div>
        {errorCode && (
          <div>
            <p style={{ fontSize: "11px", color: "#A5A5A5", marginBottom: "4px" }}>Hata Kodu</p>
            <p style={{ fontSize: "13px", color: "#f87171", fontFamily: "monospace" }}>
              {errorCode}
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {errorMessage && (
        <div
          style={{
            background: "rgba(248,113,113,0.05)",
            border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: "6px",
            padding: "12px 16px",
            marginBottom: "20px",
            fontSize: "13px",
            color: "#f87171",
          }}
        >
          <strong>Hata Mesajı:</strong> {errorMessage}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Payment info */}
        <SectionCard title="Ödeme Bilgileri">
          <DataRow label="Ödeme ID">
            <span style={{ fontFamily: "monospace", fontSize: "11px" }}>{detail.id}</span>
          </DataRow>
          <DataRow label="Provider">{detail.provider}</DataRow>
          <DataRow label="Provider Payment ID">
            {detail.provider_payment_id ? (
              <span style={{ fontFamily: "monospace", fontSize: "11px" }}>
                {detail.provider_payment_id}
              </span>
            ) : (
              <span style={{ color: "#A5A5A5" }}>—</span>
            )}
          </DataRow>
          <DataRow label="Conversation ID">
            <span style={{ fontFamily: "monospace", fontSize: "11px" }}>{detail.conversation_id}</span>
          </DataRow>
          <DataRow label="Deneme No">#{detail.attempt_number}</DataRow>
          <DataRow label="Taksit">{detail.installment ?? "Tek çekim"}</DataRow>
          <DataRow label="Oluşturulma">{formatDateTimeFull(detail.created_at)}</DataRow>
          <DataRow label="Tamamlanma">{formatDateTimeFull(detail.completed_at)}</DataRow>
        </SectionCard>

        {/* Order + Customer */}
        <div>
          {order ? (
            <SectionCard title="İlgili Sipariş">
              <DataRow label="Sipariş No">
                <Link
                  href={`/admin/orders/${order.id}`}
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: "#D4A017",
                    textDecoration: "none",
                  }}
                >
                  #{order.order_number}
                </Link>
              </DataRow>
              <DataRow label="Sipariş Durumu">
                <StatusBadge
                  value={order.status}
                  labels={ORDER_STATUS_LABELS}
                  styles={ORDER_STATUS_STYLE}
                />
              </DataRow>
              <DataRow label="Ödeme Durumu">
                <StatusBadge
                  value={order.payment_status}
                  labels={PAYMENT_STATUS_LABELS}
                  styles={PAYMENT_STATUS_STYLE}
                />
              </DataRow>
              <DataRow label="Sipariş Toplamı">
                {formatPrice(Number(order.grand_total), detail.currency)}
              </DataRow>
            </SectionCard>
          ) : (
            <SectionCard title="İlgili Sipariş">
              <p style={{ fontSize: "13px", color: "#A5A5A5" }}>Sipariş bilgisi yüklenemedi.</p>
            </SectionCard>
          )}

          <SectionCard title="Müşteri">
            {customer ? (
              <>
                <DataRow label="Ad Soyad">
                  {order?.customer_id ? (
                    <Link
                      href={`/admin/customers/${order.customer_id}`}
                      style={{ color: "#D4A017", textDecoration: "none" }}
                    >
                      {customer.first_name} {customer.last_name}
                    </Link>
                  ) : (
                    `${customer.first_name} ${customer.last_name}`
                  )}
                </DataRow>
                {customer.email && <DataRow label="E-posta">{customer.email}</DataRow>}
                {customer.phone && <DataRow label="Telefon">{customer.phone}</DataRow>}
              </>
            ) : (
              <p style={{ fontSize: "13px", color: "#A5A5A5", fontStyle: "italic" }}>
                {order?.customer_id
                  ? "Müşteri kaydı bulunamadı (silinmiş olabilir)"
                  : "Misafir sipariş"}
              </p>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Payment attempts (retry history) */}
      {detail.attempts.length > 0 && (
        <SectionCard title={`Aynı Siparişin Ödeme Denemeleri (${detail.attempts.length})`}>
          {detail.attempts.map((attempt) => (
            <AttemptRow key={attempt.id} attempt={attempt} currentId={detail.id} />
          ))}
        </SectionCard>
      )}

      {/* Sanitized response viewer */}
      <SectionCard title="Provider Yanıtı (Redakte)">
        <SanitizedResponseViewer data={detail.sanitized_response} />
      </SectionCard>
    </div>
  )
}
