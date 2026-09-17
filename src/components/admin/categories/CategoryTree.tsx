import Link from "next/link"
import { toggleCategoryStatus } from "@/lib/admin/categories.actions"
import { DeleteCategoryButton } from "@/components/admin/categories/DeleteCategoryButton"
import type { CategoryNode } from "@/lib/admin/categories"

interface TreeNodeProps {
  node: CategoryNode
  depth: number
}

function TreeNode({ node, depth }: TreeNodeProps) {
  const indent = depth * 24

  return (
    <>
      <tr
        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
        className="hover:bg-white/[0.02] transition-colors"
      >
        <td className="py-3 px-4">
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: `${indent}px` }}
          >
            {depth > 0 && (
              <span className="text-xs" style={{ color: "#A5A5A5" }}>
                └
              </span>
            )}
            <span className="font-medium text-sm" style={{ color: "#F4F4F2" }}>
              {node.name}
            </span>
            {node.children.length > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "#A5A5A5",
                }}
              >
                {node.children.length} alt
              </span>
            )}
          </div>
        </td>
        <td className="py-3 px-4 font-mono text-xs" style={{ color: "#A5A5A5" }}>
          {node.slug}
        </td>
        <td className="py-3 px-4 text-center text-xs" style={{ color: "#A5A5A5" }}>
          {node.sort_order}
        </td>
        <td className="py-3 px-4 text-center">
          <form action={toggleCategoryStatus}>
            <input type="hidden" name="categoryId" value={node.id} />
            <input
              type="hidden"
              name="currentStatus"
              value={String(node.is_active)}
            />
            <button
              type="submit"
              className="px-2 py-0.5 rounded text-xs font-medium transition-opacity hover:opacity-75"
              style={
                node.is_active
                  ? { background: "rgba(16,185,129,0.15)", color: "#34d399" }
                  : { background: "rgba(255,255,255,0.06)", color: "#A5A5A5" }
              }
            >
              {node.is_active ? "Aktif" : "Pasif"}
            </button>
          </form>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/admin/categories/${node.id}/edit`}
              className="px-3 py-1 rounded text-xs font-medium transition-opacity hover:opacity-75"
              style={{ background: "rgba(212,160,23,0.12)", color: "#D4A017" }}
            >
              Düzenle
            </Link>
            <DeleteCategoryButton categoryId={node.id} name={node.name} />
          </div>
        </td>
      </tr>
      {node.children.map((child) => (
        <TreeNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </>
  )
}

interface Props {
  tree: CategoryNode[]
}

export function CategoryTree({ tree }: Props) {
  if (tree.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: "#A5A5A5" }}>
        Henüz kategori eklenmemiş.
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
              Kategori
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
              Sıra
            </th>
            <th
              className="text-center py-3 px-4 font-medium"
              style={{ color: "#A5A5A5" }}
            >
              Durum
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
          {tree.map((node) => (
            <TreeNode key={node.id} node={node} depth={0} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
