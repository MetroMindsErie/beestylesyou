import { supabase } from '../lib/supabase'

export async function getStaticProps() {
  const { data: projects } = await supabase.from('projects').select('*')
  return { props: { projects } }
}

export default function Home({ projects }) {
  return (
    <div className="bg-white text-black min-h-screen">
      {/* Navbar */}
      <header className="flex justify-between items-center px-8 py-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold tracking-wide">[Brooke Ulrich]</h1>
        <a
          href="https://instagram.com/[her_ig_handle]"
          target="_blank"
          className="text-sm uppercase tracking-wide hover:underline"
        >
          Instagram
        </a>
      </header>

      {/* Hero Section */}
      <section className="px-8 py-12 text-center max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold mb-4">Fashion Stylist & Creative Director</h2>
        <p className="text-gray-600">
          Showcasing my work in styling, editorial shoots, and creative direction.
        </p>
      </section>

      {/* Project Grid */}
      <main className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 pb-16">
        {projects?.map((p) => (
          <a key={p.id} href={`/project/${p.id}`} className="group block">
            <div className="overflow-hidden rounded-xl shadow-md">
              <img
                src={p.image_urls?.[0]}
                alt={p.title}
                className="w-full h-80 object-cover transform transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <h3 className="mt-4 text-lg font-semibold group-hover:underline">
              {p.title}
            </h3>
          </a>
        ))}
      </main>
    </div>
  )
}
