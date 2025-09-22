import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function AdminProjects({ onUpdateProject }) {
  const [projects, setProjects] = useState([])
  const [editing, setEditing] = useState(null)
  
  console.log('🔷 CHILD: onUpdateProject prop available:', !!onUpdateProject)

  useEffect(() => {
    console.log('🔷 CHILD: Fetching projects...')
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      console.log('🔷 CHILD: Fetching projects from database...')
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('🔷 CHILD: Error fetching projects:', error)
        return
      }
      
      console.log('🔷 CHILD: Projects loaded:', data?.length || 0)
      setProjects(data || [])
    } catch (error) {
      console.error('🔷 CHILD: Error in fetchProjects:', error)
    }
  }

  async function handleUpdate(id, updates) {
    console.log('🔷 CHILD: handleUpdate called')
    console.log('🔷 CHILD: ID:', id)
    console.log('🔷 CHILD: Updates:', updates)
    
    try {
      if (onUpdateProject) {
        console.log('🔷 CHILD: Calling parent updateProjectHandler')
        const success = await onUpdateProject(id, updates)
        
        console.log('🔷 CHILD: Parent handler returned:', success)
        
        if (success) {
          // Update local state
          setProjects(projects.map(p => p.id === id ? {...p, ...updates} : p))
          setEditing(null)
          
          // Refresh data from server to confirm changes
          setTimeout(() => fetchProjects(), 1000)
        }
        
        return
      } else {
        console.warn('🔷 CHILD: No parent update handler found, using fallback')
        
        // Fallback direct update
        const { error } = await supabase
          .from('projects')
          .update({
            title: updates.title,
            description: updates.description,
            instagram_link: updates.instagram_link
          })
          .eq('id', id)
        
        if (error) {
          console.error('🔷 CHILD: Fallback update failed:', error)
          throw error
        }
        
        setProjects(projects.map(p => p.id === id ? {...p, ...updates} : p))
        setEditing(null)
        alert('Project updated directly from child component!')
      }
    } catch (error) {
      console.error('🔷 CHILD: Update error:', error)
      alert('Error updating project: ' + error.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      console.log('🔷 CHILD: Deleting project:', id)
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('🔷 CHILD: Delete error:', error)
        alert('Error deleting project: ' + error.message)
        return
      }
      
      // Trigger revalidation to update the public site
      try {
        console.log('Triggering revalidation after project deletion')
        const revalidateResponse = await fetch('/api/revalidate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        const revalidateResult = await revalidateResponse.json()
        console.log('Revalidation result:', revalidateResult)
        
        if (!revalidateResponse.ok) {
          console.warn('Revalidation API returned error:', revalidateResult)
        }
      } catch (revalidateError) {
        console.warn('Failed to revalidate after delete:', revalidateError)
      }
      
      alert('Project deleted successfully!')
      fetchProjects()
    } catch (error) {
      console.error('🔷 CHILD: Delete error:', error)
      alert('Error deleting project: ' + error.message)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-playfair mb-6">Manage Projects</h2>
      {projects.length === 0 ? (
        <p className="text-gray-500">No projects found. Create your first project!</p>
      ) : (
        <div className="grid gap-6">
          {projects.map(project => (
            <div key={project.id} className="bg-white/50 backdrop-blur-sm rounded-lg p-6 shadow-sm">
              {editing === project.id ? (
                <EditForm
                  project={project}
                  onSave={(updates) => handleUpdate(project.id, updates)}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className="text-gray-600 line-clamp-2 mb-4">{project.description}</p>
                    <div className="flex gap-4">
                      <Link 
                        href={`/project/${project.id}`}
                        target="_blank"
                        className="text-sm text-[var(--accent)] hover-underline"
                      >
                        View Live
                      </Link>
                      {project.instagram_link && (
                        <a 
                          href={project.instagram_link}
                          target="_blank"
                          className="text-sm text-[var(--accent)] hover-underline"
                        >
                          Instagram
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditing(project.id)}
                      className="px-4 py-2 text-sm bg-black text-white rounded-full hover:bg-black/80"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="px-4 py-2 text-sm bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EditForm({ project, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: project.title || '',
    description: project.description || '',
    instagram_link: project.instagram_link || ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('📝 FORM: Submit with data:', formData)
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          rows="3"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Instagram Link</label>
        <input
          type="text"
          name="instagram_link"
          value={formData.instagram_link}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-black text-white rounded-full hover:bg-black/80"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}
