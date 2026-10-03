import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center">
      <div className="absolute inset-0 blueprint opacity-40" />
      <div className="relative">
        <p className="font-display text-7xl font-bold text-azure">404</p>
        <h1 className="mt-4 font-display text-2xl font-semibold text-snow">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link to="/" className="btn-primary mt-8">
          <Home className="h-4 w-4" />
          Kembali ke Home
        </Link>
      </div>
    </div>
  )
}
