import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import type { CashSummary, MembersResponse, TimahPanasResponse } from '../../lib/types'
import { Hero } from '../../components/sections/Hero'
import { AboutSection, LearnSection, QuoteSection } from '../../components/sections/LandingAbout'
import { StatsSection } from '../../components/sections/LandingStats'
import { PeopleSection } from '../../components/sections/LandingPeople'
import { ActivitiesSection } from '../../components/sections/LandingTimeline'
import { GallerySection } from '../../components/sections/LandingGallery'
import { SectionHeading } from '../../components/sections/SectionHeading'
import { Skeleton } from '../../components/ui/Feedback'
import { Reveal } from '../../components/ui/Reveal'

export default function LandingPage() {
  const members = useApi<MembersResponse>('/members')
  const cash = useApi<{ data: CashSummary }>('/cash/summary')
  const timah = useApi<TimahPanasResponse>('/timah-panas')

  const summary = timah.data?.summary

  return (
    <>
      <Hero
        memberCount={members.data?.meta.total ?? 0}
        balance={cash.data?.data.balance ?? 0}
        requirementCount={summary?.total_requirements ?? 0}
        progress={summary?.overall_progress ?? 0}
      />
      <AboutSection />
      <StatsSection
        memberCount={members.data?.meta.total ?? 0}
        balance={cash.data?.data.balance ?? 0}
        requirementCount={summary?.total_requirements ?? 0}
        fulfilledRequirements={summary?.fulfilled_requirements ?? 0}
        totalParticipation={summary?.total_participation ?? 0}
      />
      <ClassSection classes={members.data?.meta.classes ?? []} />
      <PeopleSection />
      <LearnSection />

      <ActivitiesSection />
      <GallerySection />
      <QuoteSection />
    </>
  )
}

function ClassSection({
  classes,
}: {
  classes: { id: number; code: string; label: string; name: string; members_count?: number }[]
}) {
  return (
    <section className="section-pad border-t border-line">
      <div className="container-x">
        <SectionHeading
          eyebrow="Pembagian Kelas"
          title="5 kelas, satu angkatan"
          description="Mahasiswa TO26 terbagi ke dalam lima kelas D4 Teknik Otomasi."
          align="center"
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {classes.length === 0
            ? Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-36 w-full rounded-2xl" />
              ))
            : classes.map((item, index) => (
                <Reveal key={item.id} delay={index * 0.05}>
                  <Link to="/angkatan" className="card card-hover flex h-full flex-col items-center p-6 text-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <GraduationCap className="h-5 w-5" />
                    </span>
                    <p className="mt-3 font-display text-xl font-bold text-content">{item.label}</p>
                    <p className="mt-1 text-xs text-muted">{item.name}</p>
                    <p className="mt-3 font-mono text-sm text-brand">{item.members_count ?? 0} mahasiswa</p>
                  </Link>
                </Reveal>
              ))}
        </div>
      </div>
    </section>
  )
}
