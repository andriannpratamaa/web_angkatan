import { useMemo, useState } from 'react'
import { Images } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import type { Gallery } from '../../lib/types'
import { cn } from '../../lib/format'
import { ErrorState, Skeleton } from '../../components/ui/Feedback'
import { Modal } from '../../components/ui/Modal'
import { Reveal } from '../../components/ui/Reveal'
import { MediaThumb } from '../../components/common/MediaThumb'

export default function GaleriPage() {
  const { data, loading, error } = useApi<{ data: Gallery[] }>('/galleries')
  const [category, setCategory] = useState('semua')
  const [active, setActive] = useState<Gallery | null>(null)

  const galleries = data?.data ?? []
  const categories = useMemo(() => {
    const unique = new Set(galleries.map((item) => item.category).filter(Boolean) as string[])
    return ['semua', ...Array.from(unique)]
  }, [galleries])

  const filtered = category === 'semua' ? galleries : galleries.filter((item) => item.category === category)

  return (
    <div className="pt-[72px]">
      <section className="relative overflow-hidden border-b border-white/5 py-16">
        <div className="absolute inset-0 blueprint opacity-50" />
        <div className="absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-azure/15 blur-[120px]" />
        <div className="container-x relative">
          <span className="eyebrow">
            <Images className="h-3.5 w-3.5" />
            Galeri Angkatan
          </span>
          <h1 className="heading-xl mt-4">
            Galeri <span className="text-aqua">TO26</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-400">
            Dokumentasi momen, kegiatan, dan capaian Teknik Otomasi Angkatan 2026.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-xs font-medium transition',
                  category === item
                    ? 'border-aqua/60 bg-aqua/10 text-aqua'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-snow',
                )}
              >
                {item === 'semua' ? 'Semua' : item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-x">
          {error ? <ErrorState message={error} /> : null}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, index) => (
                <Skeleton key={index} className="h-56 w-full rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-20 text-center text-slate-400">Belum ada dokumentasi galeri.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item, index) => (
                <Reveal key={item.id} delay={Math.min(index, 8) * 0.04}>
                  <button
                    type="button"
                    onClick={() => setActive(item)}
                    className="block h-56 w-full text-left"
                  >
                    <MediaThumb
                      title={item.title}
                      image={item.image_url}
                      category={item.category}
                      className="h-full w-full"
                    />
                  </button>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <Modal
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={active?.title ?? ''}
        size="lg"
      >
        {active ? (
          <div>
            <MediaThumb
              title={active.title}
              image={active.image_url}
              category={active.category}
              className="h-72 w-full"
            />
            {active.description ? (
              <p className="mt-5 text-sm leading-relaxed text-slate-300">{active.description}</p>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
