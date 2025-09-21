import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import LoginPopup from '../components/LoginPopup'

export default function Admin() {
  const [session, setSession] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [instagram, setInstagram] = useState('')
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  async function handleUpload(e) {
    e.preventDefault()
    const files = Array.from(e.target.files)
    let urls = []

    setUploading(true)
    try {
      for (let file of files) {
        const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
        
        const { error: uploadError } = await supabase.storage
          .from('brooke')
          .upload(uniqueName, file, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) {
          throw uploadError
        }

        const url = `https://rzdoygryvifvcmhhbiaq.supabase.co/storage/v1/object/public/brooke/${uniqueName}`
        urls.push(url)
      }
      
      setImages(prev => [...prev, ...urls])
      alert('Images uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error.message)
      alert('Error uploading images: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const { error } = await supabase.from('projects').insert([
        {
          title,
          description,
          instagram_link: instagram,
          image_urls: images,
        },
      ])
      
      if (error) {
        throw error
      }
      
      alert('Project uploaded successfully!')
      setTitle('')
      setDescription('')
      setInstagram('')
      setImages([])
    } catch (error) {
      console.error('Submission error:', error.message)
      alert('Error saving project: ' + error.message)
    }
  }

  if (!session) {
    return <LoginPopup onLogin={({ session }) => setSession(session)} />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Upload New Project</h1>
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="text-sm text-gray-600 hover:underline"
          >
            Sign Out
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-semibold">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-black"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-black"
              rows="4"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold">Instagram Link</label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-black"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold">Upload Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleUpload}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {images.map((url, i) => (
                <img key={i} src={url} alt={`Upload ${i + 1}`} className="h-24 object-cover rounded-lg" />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800"
          >
            Save Project
          </button>
        </form>
      </div>
    </div>
  )
}