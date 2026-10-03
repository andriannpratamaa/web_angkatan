import { Cpu, DraftingCompass, Rocket, Wrench } from 'lucide-react'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from './SectionHeading'

const pillars = [
  {
    icon: Cpu,
    title: 'Engineering',
    text: 'Berpikir sistematis, menghitung, dan merancang solusi teknis yang dapat diandalkan.',
  },
  {
    icon: Wrench,
    title: 'Automation',
    text: 'Mengubah proses manual menjadi sistem otomatis yang efisien dan presisi.',
  },
  {
    icon: Rocket,
    title: 'Technology',
    text: 'Mengikuti perkembangan industri 4.0, IoT, dan sistem kontrol modern.',
  },
]

export function AboutSection() {
  return (
    <section id="tentang" className="section-pad relative border-t border-white/5">
      <div className="container-x grid items-start gap-14 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Tentang Angkatan"
            title={
              <>
                Satu angkatan, satu visi untuk{' '}
                <span className="text-aqua">mengotomasi masa depan</span>.
              </>
            }
            description="Teknik Otomasi 2026 (TO26) adalah angkatan yang menaungi mahasiswa Program Studi Teknik Otomasi. Kami percaya bahwa teknologi terbaik lahir dari kolaborasi, rasa ingin tahu, dan kebersamaan yang kuat."
          />

          <Reveal delay={0.1} className="mt-8 grid gap-4 sm:grid-cols-3">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="card card-hover p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-azure/15 text-aqua">
                  <pillar.icon className="h-5 w-5" />
                </span>
                <p className="mt-3 font-display text-sm font-semibold text-snow">{pillar.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{pillar.text}</p>
              </div>
            ))}
          </Reveal>
        </div>

        <Reveal delay={0.15} className="relative">
          <div className="panel relative overflow-hidden">
            <div className="absolute inset-0 blueprint opacity-40" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-azure to-aqua text-ink">
                  <DraftingCompass className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-base font-semibold text-snow">
                    Nilai Angkatan
                  </p>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
                    core values to26
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    title: 'Solidaritas',
                    text: 'Saling mendukung dalam setiap proses belajar dan kegiatan angkatan.',
                  },
                  {
                    title: 'Integritas',
                    text: 'Jujur, transparan, dan bertanggung jawab dalam setiap tindakan.',
                  },
                  {
                    title: 'Inovasi',
                    text: 'Berani bereksperimen dan menciptakan solusi otomasi yang baru.',
                  },
                  {
                    title: 'Profesionalisme',
                    text: 'Bekerja dengan standar tinggi layaknya engineer industri.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 rounded-xl border border-white/10 bg-ink/50 p-4">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-aqua" />
                    <div>
                      <p className="font-display text-sm font-semibold text-snow">{item.title}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

const subjects = [
  { code: 'PLC', title: 'PLC & Mikrokontroler', text: 'Pemrograman ladder, Arduino, dan ESP32 untuk kendali otomatis.' },
  { code: 'SCADA', title: 'SCADA & HMI', text: 'Perancangan antarmuka monitoring dan kontrol sistem industri.' },
  { code: 'CTRL', title: 'Sistem Kontrol', text: 'Kontrol PID, loop tertutup, dan analisis kestabilan sistem.' },
  { code: 'INSTR', title: 'Instrumentasi', text: 'Sensor, transduser, kalibrasi, dan pengukuran industri.' },
  { code: 'ROBO', title: 'Robotika', text: 'Kinematika, aktuator, dan integrasi robot industri.' },
  { code: 'IOT', title: 'Internet of Things', text: 'Monitoring jarak jauh, cloud, dan komunikasi data sensor.' },
  { code: 'PNEU', title: 'Pneumatik & Hidrolik', text: 'Sistem aktuasi fluida untuk lini produksi otomatis.' },
  { code: 'PANEL', title: 'Panel & Kelistrikan', text: 'Wiring, proteksi, dan perancangan panel kontrol.' },
]

export function LearnSection() {
  return (
    <section className="section-pad relative border-t border-white/5">
      <div className="container-x">
        <SectionHeading
          eyebrow="What We Learn"
          title="Kompetensi yang kami bangun"
          description="Kurikulum Teknik Otomasi memadukan teori dan praktik untuk menyiapkan engineer yang siap menghadapi industri."
          align="center"
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {subjects.map((subject, index) => (
            <Reveal key={subject.code} delay={index * 0.05}>
              <div className="card card-hover h-full p-5">
                <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-aqua">
                  {subject.code}
                </span>
                <h3 className="mt-3 font-display text-base font-semibold text-snow">
                  {subject.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{subject.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function QuoteSection() {
  return (
    <section className="section-pad relative border-t border-white/5">
      <div className="container-x">
        <Reveal className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-navy/60 p-10 text-center sm:p-16">
          <div className="absolute inset-0 blueprint opacity-30" />
          <div className="absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-azure/20 blur-3xl" />
          <p className="relative font-mono text-[11px] uppercase tracking-[0.32em] text-aqua">
            Quote Angkatan
          </p>
          <blockquote className="relative mt-6 font-display text-2xl font-semibold leading-snug text-snow sm:text-3xl">
            "Otomasi bukan sekadar menggantikan pekerjaan manusia, tetapi membebaskan manusia untuk
            berkarya lebih tinggi."
          </blockquote>
          <p className="relative mt-6 font-mono text-sm uppercase tracking-widest text-slate-400">
            - Teknik Otomasi 2026
          </p>
        </Reveal>
      </div>
    </section>
  )
}
