import { supabase } from '../../lib/supabase'

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
  return { props: { project: data } }
}

export default function Project({ project }) {
  return (
    <div className="bg-[var(--bg)] text-[var(--text)] min-h-screen">
      <header className="flex justify-between items-center px-12 py-8 border-b border-[var(--accent)]/10">
        <a href="/" className="text-sm uppercase tracking-wider hover-underline">
          ← Back to Portfolio
        </a>
        <div className="flex gap-8">
          <a href="#images" className="text-sm uppercase tracking-wider hover-underline">Gallery</a>
          <a
            href="https://www.instagram.com/brookeulrich_/"
            target="_blank"
            className="text-sm uppercase tracking-wider hover-underline"
          >
            Instagram
          </a>
        </div>
      </header>

      <main className="px-12 py-16 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-playfair mb-8 text-center">{project.title}</h1>
          
          {/* Project Info Card */}
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg mb-16">
            <h2 className="text-2xl font-playfair mb-4">About This Project</h2>
            <p className="text-lg leading-relaxed text-[var(--text)]/80">
              {project.description}
            </p>
          </div>
        </div>

        {/* Image Gallery */}
        <div id="images" className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {project.image_urls?.map((url, i) => (
            <div key={i} className="group relative overflow-hidden rounded-lg aspect-[3/4]">
              <img
                src={url}
                alt={`${project.title}-${i}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>

        {/* Project Links */}
        <div className="mt-16 flex justify-center gap-6">
          <a
            href="/"
            className="px-8 py-3 bg-[var(--text)] text-[var(--bg)] rounded-full hover:bg-[var(--text)]/80 transition-colors"
          >
            View All Projects
          </a>
          {project.instagram_link && (
            <a
              href={project.instagram_link}
              target="_blank"
              className="px-8 py-3 bg-[var(--accent)] text-white rounded-full hover:bg-[var(--accent)]/80 transition-colors"
            >
              View on Instagram
            </a>
          )}
        </div>
      </main>
    </div>
  )
}
