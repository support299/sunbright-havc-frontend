import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import RequireAuth from "./components/RequireAuth"
import RequireAdmin from "./components/RequireAdmin"
import AppShell from "./layouts/AppShell"
import AdminPage from "./pages/AdminPage"
import HubPage from "./pages/HubPage"
import LoginPage from "./pages/LoginPage"
import ProposalEditPage from "./pages/ProposalEditPage"
import ProposalsPage from "./pages/ProposalsPage"
import RootGate from "./pages/RootGate"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootGate />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/app/proposals/:proposalId/edit" element={<ProposalEditPage />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Navigate to="/app/hub" replace />} />
            <Route path="hub" element={<HubPage />} />
            <Route path="proposals" element={<ProposalsPage />} />
            <Route
              path="admin"
              element={
                <RequireAdmin>
                  <AdminPage />
                </RequireAdmin>
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
