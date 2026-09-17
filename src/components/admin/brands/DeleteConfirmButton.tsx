"use client"

interface Props {
  action: (formData: FormData) => Promise<void>
  idValue: string
  confirmMsg: string
  label?: string
}

export function DeleteConfirmButton({
  action,
  idValue,
  confirmMsg,
  label = "Sil",
}: Props) {
  return (
    <form action={action}>
      <input type="hidden" name="brandId" value={idValue} />
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm(confirmMsg)) e.preventDefault()
        }}
        className="px-3 py-1 rounded text-xs font-medium transition-opacity hover:opacity-75"
        style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}
      >
        {label}
      </button>
    </form>
  )
}
