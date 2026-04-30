import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLoginMutation } from "../features/auth/authApi"

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: "", password: "" })
  const [login, { isLoading, error }] = useLoginMutation()

  const onSubmit = async (e) => {
    e.preventDefault()
    await login(form).unwrap()
    navigate("/app/hub", { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="card w-full max-w-md p-8">
        <h1 className="font-['Outfit'] text-3xl font-bold">Sunbright HVAC</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Sign in to continue</p>

        <div className="mt-6 space-y-4">
          <input
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 outline-none"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
          />
          <input
            type="password"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 outline-none"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          />
        </div>

        {error && <p className="mt-4 text-sm text-[var(--red)]">Invalid credentials.</p>}

        <button
          disabled={isLoading}
          className="mt-6 w-full rounded-xl bg-[var(--accent)] py-3 font-semibold text-[#0f1117] disabled:opacity-50"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  )
}
