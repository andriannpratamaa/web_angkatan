import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import type { Gallery } from '../../lib/types'
import { ErrorState, Skeleton } from '../ui/Feedback'
import { Reveal } from '../ui/Reveal'
import { MediaThumb } from '../common/MediaThumb'
import { SectionHeading } from './SectionHeading'

export function GallerySection() {
  const { data, loading, error } = useApi<{ data: Gallery[] }>('/galleries')
  const galleries = (data?.data ?? []).slice(0, 6)

  return (
    <section className="section-pad relative border-t border-white/5">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Galeri"
            title="Momen yang kami abadikan"
            description="Dokumentasi kegiatan, kebersamaan, dan capaian angkatan Teknik Otomasi 2026."
          />
          <Reveal delay={0.1}>
            <Link to="/galeri" className="btn-ghost">
              Buka Galeri
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>

        {error ? <div className="mt-10"><ErrorState message={error} /></div> : null}

        <div className="mt-12 grid auto-rows-[200px] grid-cols-2 gap-4 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-full w-full rounded-2xl" />
              ))
            : galleries.map((item, index) => (
                <Reveal
                  key={item.id}
                  delay={index * 0.05}
                  className={index === 0 ? 'col-span-2 row-span-2' : ''}
                >
                  <MediaThumb
                    title={item.title}
                    image={item.image_url}
                    category={item.category}
                    className="h-full w-full"
                  />
                </Reveal>
              ))}
        </div>
      </div>
    </section>
  )
}
