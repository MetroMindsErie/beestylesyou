import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

export async function getStaticPaths() {
  const { data: projects } = await supabase.from('projects').select('id')
  const paths = projects?.map((p) => ({ params: { id: p.id } })) || []
  return { paths, fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single()
  
  return { 
    props: { 
      project: data 
    },
    // Re-generate at most once every 60 seconds
    revalidate: 60
  }
}

export default function Project({ project }) {
  return (
    <div className="bg-[var(--bg)] text-[var(--text)] min-h-screen">
      <header className="flex justify-between items-center px-4 sm:px-8 md:px-12 py-8 border-b border-[var(--accent)]/10">
        <Link href="/" className="text-xs sm:text-sm uppercase tracking-wider hover-underline">
          ← Back
        </Link>
        <div className="flex gap-4 sm:gap-8">
          <a href="#images" className="text-xs sm:text-sm uppercase tracking-wider hover-underline">Gallery</a>
          <a
            href="https://www.instagram.com/brookeulrich_/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm uppercase tracking-wider hover-underline"
          >
            Instagram
          </a>
        </div>
      </header>

      <main className="px-4 sm:px-8 md:px-12 py-8 md:py-16 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto mb-8 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-playfair mb-6 md:mb-8 text-center">{project.title}</h1>
          
          {/* Project Info Card */}
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg mb-8 md:mb-16">
            <h2 className="text-xl md:text-2xl font-playfair mb-3 md:mb-4">About This Project</h2>
            <p className="text-base md:text-lg leading-relaxed text-[var(--text)]/80">
              {project.description}
            </p>
          </div>
        </div>

        {/* Image Gallery */}
        <div id="images" className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {project.image_urls?.map((url, i) => (
            <div key={i} className="group relative overflow-hidden rounded-lg aspect-[3/4]">
              <Image
                src={url}
                alt={`${project.title}-${i}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>

        {/* Project Links */}
        <div className="mt-8 md:mt-16 flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6">
          <Link
            href="/"
            className="w-full sm:w-auto text-center px-6 sm:px-8 py-3 bg-[var(--text)] text-[var(--bg)] rounded-full hover:bg-[var(--text)]/80 transition-colors"
          >
            View All Projects
          </Link>
          {project.instagram_link && (
            <a
              href={project.instagram_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto text-center px-6 sm:px-8 py-3 bg-[var(--accent)] text-white rounded-full hover:bg-[var(--accent)]/80 transition-colors"
            >
              View on Instagram
            </a>
          )}
        </div>
      </main>
    </div>
  )
}
