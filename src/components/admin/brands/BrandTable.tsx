import Link from "next/link"
import { toggleBrandStatus, deleteBrandAction } from "@/lib/admin/brands.actions"
import type { Brand } from "@/lib/admin/brands"
import { DeleteConfirmButton } from "@/components/admin/brands/DeleteConfirmButton"

interface Props {
  brands: Brand[]
}

export function BrandTable({ brands }: Props) {
  if (brands.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: "#A5A5A5" }}>
        Henüz marka eklenmemiş.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <th
              className="text-left py-3 px-4 font-medium"
              style={{ color: "#A5A5A5" }}
            >
              Marka Adı
            </th>
            <th
              className="text-left py-3 px-4 font-medium"
              style={{ color: "#A5A5A5" }}
            >
              Slug
            </th>
            <th
              className="text-center py-3 px-4 font-medium"
              style={{ color: "#A5A5A5" }}
            >
              Durum
            </th>
            <th
              className="text-left py-3 px-4 font-medium"
              style={{ color: "#A5A5A5" }}
            >
              Oluşturulma
            </th>
            <th
              className="text-right py-3 px-4 font-medium"
              style={{ color: "#A5A5A5" }}
            >
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand) => (
            <tr
              key={brand.id}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              className="hover:bg-white/[0.02] transition-colors"
            >
              <td
                className="py-3 px-4 font-medium"
                style={{ color: "#F4F4F2" }}
              >
                {brand.name}
              </td>
              <td className="py-3 px-4 font-mono text-xs" style={{ color: "#A5A5A5" }}>
                {brand.slug}
              </td>
              <td className="py-3 px-4 text-center">
                <form action={toggleBrandStatus}>
                  <input type="hidden" name="brandId" value={brand.id} />
                  <input
                    type="hidden"
                    name="currentStatus"
                    value={String(brand.is_active)}
                  />
                  <button
                    type="submit"
                    className="px-2 py-0.5 rounded text-xs font-medium transition-opacity hover:opacity-75"
                    style={
                      brand.is_active
                        ? { background: "rgba(16,185,129,0.15)", color: "#34d399" }
                        : { background: "rgba(255,255,255,0.06)", color: "#A5A5A5" }
                    }
                  >
                    {brand.is_active ? "Aktif" : "Pasif"}
                  </button>
                </form>
              </td>
              <td className="py-3 px-4 text-xs" style={{ color: "#A5A5A5" }}>
                {new Date(brand.created_at).toLocaleDateString("tr-TR")}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/brands/${brand.id}/edit`}
                    className="px-3 py-1 rounded text-xs font-medium transition-opacity hover:opacity-75"
                    style={{
                      background: "rgba(212,160,23,0.12)",
                      color: "#D4A017",
                    }}
                  >
                    Düzenle
                  </Link>
                  <DeleteConfirmButton
                    action={deleteBrandAction}
                    idValue={brand.id}
                    confirmMsg={`"${brand.name}" markasını silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz.`}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
