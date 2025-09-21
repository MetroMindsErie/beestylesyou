import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import LoginPopup from '../components/LoginPopup'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'

// Use dynamic import with SSR disabled to prevent hydration issues
const AdminProjects = dynamic(() => import('../components/AdminProjects'), { ssr: false })

export default function Admin() {
  const [session, setSession] = useState(null)
  const [activeTab, setActiveTab] = useState('upload')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [instagram, setInstagram] = useState('')
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [editingProject, setEditingProject] = useState(null)

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
      setActiveTab('manage')
      setTitle('')
      setDescription('')
      setInstagram('')
      setImages([])
    } catch (error) {
      console.error('Submission error:', error.message)
      alert('Error saving project: ' + error.message)
    }
  }
  
  // Function to directly update a project from parent component
  async function updateProjectHandler(id, updates) {
    console.log('🔶 PARENT: updateProjectHandler called')
    console.log('🔶 PARENT: ID:', id)
    console.log('🔶 PARENT: Updates:', updates)
    
    try {
      // Get the user's session to include the auth token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Not authenticated')
      }
      
      // Use our API route with service role instead of direct client access
      const response = await fetch('/api/admin/update-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id, updates })
      })
      
      const result = await response.json()
      console.log('🔶 PARENT: API response:', result)
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update project')
      }
      
      console.log('🔶 PARENT: Update successful!')
      alert('Project updated successfully!')
      return true
    } catch (error) {
      console.error('🔶 PARENT: Error in updateProjectHandler:', error)
      alert('Error updating project: ' + error.message)
      return false
    }
  }

  if (!session) {
    return <LoginPopup onLogin={({ session }) => setSession(session)} />
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('upload')}
              className={`text-lg ${activeTab === 'upload' ? 'text-black font-semibold' : 'text-gray-500'} hover:text-black`}
            >
              Upload Project
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`text-lg ${activeTab === 'manage' ? 'text-black font-semibold' : 'text-gray-500'} hover:text-black`}
            >
              Manage Projects
            </button>
            <Link
              href="/"
              className="text-lg text-[var(--accent)] hover:underline"
            >
              View Public Site
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="text-sm text-gray-600 hover:underline"
            >
              Sign Out
            </button>
          </div>
        </div>

        {activeTab === 'upload' ? (
          <div className="bg-white p-8 rounded-xl shadow-md">
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
                    <div key={i} className="relative h-24 rounded-lg overflow-hidden">
                      <Image 
                        src={url} 
                        alt={`Upload ${i + 1}`} 
                        fill 
                        sizes="(max-width: 768px) 33vw, 20vw"
                        className="object-cover" 
                      />
                    </div>
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
        ) : (
          <AdminProjects onUpdateProject={updateProjectHandler} />
        )}
      </div>
    </div>
  )
}