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
    <div className="bg-white text-black min-h-screen">
      <header className="flex justify-between items-center px-8 py-6 border-b border-gray-200">
        <a href="/" className="text-sm uppercase tracking-wide hover:underline">
          ← Back
        </a>
        <a
          href="https://instagram.com/[her_ig_handle]"
          target="_blank"
          className="text-sm uppercase tracking-wide hover:underline"
        >
          Instagram
        </a>
      </header>

      <main className="px-8 py-12 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
        <p className="text-gray-600 mb-8">{project.description}</p>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {project.image_urls?.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`${project.title}-${i}`}
              className="rounded-xl object-cover shadow-md"
            />
          ))}
        </div>

        {/* Instagram Link */}
        {project.instagram_link && (
          <div className="mt-10">
            <a
              href={project.instagram_link}
              target="_blank"
              className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              View on Instagram
            </a>
          </div>
        )}
      </main>
    </div>
  )
}
