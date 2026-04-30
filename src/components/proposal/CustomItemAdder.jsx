import { useState } from "react"
import { IconPlus } from "./ProposalIcons"

export default function CustomItemAdder({ onAdd }) {
  const [show, setShow] = useState(false)
  const [name, setName] = useState("")
  const [cost, setCost] = useState("")

  if (!show) {
    return (
      <button
        type="button"
        className="btn-ghost mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--accent)]"
        onClick={() => setShow(true)}
      >
        <IconPlus /> Custom Item
      </button>
    )
  }

  return (
    <div className="mt-2 rounded-lg bg-[var(--bg-primary)] p-3">
      <div className="flex flex-wrap items-end gap-2">
        <input
          className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
        />
        <input
          type="number"
          className="w-28 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs outline-none"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="Cost"
        />
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[#0f1117]"
          onClick={() => {
            if (name && cost) {
              onAdd({ name, cost: Number.parseFloat(cost) || 0 })
              setName("")
              setCost("")
              setShow(false)
            }
          }}
        >
          Add
        </button>
        <button type="button" className="rounded-lg px-3 py-1.5 text-xs text-[var(--text-muted)]" onClick={() => setShow(false)}>
          Cancel
        </button>
      </div>
    </div>
  )
}
