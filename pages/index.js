import { supabase } from '../lib/supabase'

export async function getStaticProps() {
  const { data: projects } = await supabase.from('projects').select('*')
  return { props: { projects } }
}

export default function Home({ projects }) {
  return (
    <div className="bg-[var(--bg)] text-[var(--text)] min-h-screen">
      {/* Navbar */}
      <header className="flex justify-between items-center px-12 py-8 border-b border-[var(--accent)]/10">
        <h1 className="text-3xl font-playfair tracking-wide">Brooke Ulrich</h1>
        <nav className="flex gap-8">
          <a href="#work" className="text-sm uppercase tracking-wider hover-underline">Portfolio</a>
          <a href="#about" className="text-sm uppercase tracking-wider hover-underline">About</a>
          <a
            href="https://www.instagram.com/brookeulrich_/"
            target="_blank"
            className="text-sm uppercase tracking-wider hover-underline"
          >
            Instagram
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-12 py-24 text-center max-w-3xl mx-auto">
        <h2 className="text-5xl font-playfair mb-6">Fashion Stylist & Creative Director</h2>
        <p className="text-lg text-[var(--text)]/70 max-w-2xl mx-auto">
          Crafting visual narratives through editorial styling, creative direction, and fashion storytelling.
        </p>
      </section>

      {/* Project Grid */}
      <main id="work" className="px-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {projects?.map((p) => (
            <article key={p.id} className="project-card group">
              <div className="aspect-[3/4] w-full">
                <img
                  src={p.image_urls?.[0]}
                  alt={p.title}
                  className="w-full h-full object-cover"
                />
                <div className="project-card-content backdrop-blur-sm">
                  <h3 className="text-white text-xl font-playfair mb-3">{p.title}</h3>
                  <p className="text-white/90 text-sm leading-relaxed line-clamp-3 mb-6">{p.description}</p>
                  <div className="flex gap-4">
                    <a
                      href={`/project/${p.id}`}
                      className="px-4 py-2 bg-white/90 text-black text-sm rounded-full hover:bg-white transition-colors"
                    >
                      Read More
                    </a>
                    {p.instagram_link && (
                      <a
                        href={p.instagram_link}
                        target="_blank"
                        className="px-4 py-2 bg-black/50 text-white text-sm rounded-full hover:bg-black/70 transition-colors"
                      >
                        Instagram
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* About Section */}
      <section id="about" className="px-12 py-24 bg-[var(--accent)]/5 border-t border-[var(--accent)]/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-playfair mb-8">About Me</h2>
          <div className="prose prose-lg mx-auto text-[var(--text)]/80">
            <p className="mb-6">
              As a fashion stylist and creative director based in Los Angeles, I blend contemporary aesthetics 
              with timeless elegance to create compelling visual narratives.
            </p>
            <p className="mb-6">
              My work spans editorial styling, creative direction, and fashion consulting, 
              with a focus on crafting authentic and innovative style stories that resonate.
            </p>
            <p>
              For collaborations and inquiries, reach out on{' '}
              <a 
                href="https://www.instagram.com/brookeulrich_/" 
                target="_blank"
                className="text-[var(--accent)] hover-underline"
              >
                Instagram
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
