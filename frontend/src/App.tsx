import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { PublicLayout, ScrollToTop } from './components/layout/PublicLayout'
import { AdminLayout } from './components/layout/AdminLayout'
import { useAuth } from './contexts/AuthContext'
import { useStudentAuth } from './contexts/StudentAuthContext'
import LandingPage from './pages/public/LandingPage'
import AngkatanPage from './pages/public/AngkatanPage'
import AngkatanDetailPage from './pages/public/AngkatanDetailPage'
import GaleriPage from './pages/public/GaleriPage'
import KegiatanPage from './pages/public/KegiatanPage'
import KasPage from './pages/public/KasPage'
import TimahPanasPage from './pages/public/TimahPanasPage'
import TimahPanasDetailPage from './pages/public/TimahPanasDetailPage'
import StudentLoginPage from './pages/public/StudentLoginPage'
import StudentDashboardPage from './pages/public/StudentDashboardPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminMahasiswaPage from './pages/admin/AdminMahasiswaPage'
import AdminKelasPage from './pages/admin/AdminKelasPage'
import AdminKasPage from './pages/admin/AdminKasPage'
import AdminTimahPanasPage from './pages/admin/AdminTimahPanasPage'
import AdminPesertaPage from './pages/admin/AdminPesertaPage'
import AdminGaleriPage from './pages/admin/AdminGaleriPage'
import AdminKegiatanPage from './pages/admin/AdminKegiatanPage'
import AdminTimelinePage from './pages/admin/AdminTimelinePage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import NotFoundPage from './pages/NotFoundPage'

function PublicShell() {
  return (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  )
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-brand" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}

function RequireStudent({ children }: { children: ReactNode }) {
  const { member, loading } = useStudentAuth()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-brand" />
      </div>
    )
  }

  if (!member) {
    return <Navigate to="/masuk" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicShell />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/angkatan" element={<AngkatanPage />} />
          <Route path="/angkatan/:slug" element={<AngkatanDetailPage />} />
          <Route path="/galeri" element={<GaleriPage />} />
          <Route path="/kegiatan" element={<KegiatanPage />} />
          <Route path="/kas" element={<KasPage />} />
          <Route path="/timahpanas" element={<TimahPanasPage />} />
          <Route path="/timahpanas/:slug" element={<TimahPanasDetailPage />} />
          <Route path="/masuk" element={<StudentLoginPage />} />
          <Route
            path="/akun"
            element={
              <RequireStudent>
                <StudentDashboardPage />
              </RequireStudent>
            }
          />
        </Route>

        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout>
                <Outlet />
              </AdminLayout>
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="mahasiswa" element={<AdminMahasiswaPage />} />
          <Route path="kelas" element={<AdminKelasPage />} />
          <Route path="kas" element={<AdminKasPage />} />
          <Route path="timahpanas" element={<AdminTimahPanasPage />} />
          <Route path="timahpanas/:id/peserta" element={<AdminPesertaPage />} />
          <Route path="galeri" element={<AdminGaleriPage />} />
          <Route path="kegiatan" element={<AdminKegiatanPage />} />
          <Route path="timeline" element={<AdminTimelinePage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
