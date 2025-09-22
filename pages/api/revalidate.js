import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client directly in the API route
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  try {
    console.log('Revalidation API called')
    
    // Allow both GET and POST methods for flexibility
    if (req.method !== 'GET' && req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' })
    }

    // Get project ID from query or body if available
    const projectId = req.query.id || (req.body && req.body.id)
    
    console.log('Revalidating home page...')
    await res.revalidate('/')
    console.log('Home page revalidated successfully')
    
    if (projectId) {
      // If specific project ID provided, just revalidate that one
      console.log(`Revalidating project page: ${projectId}`)
      await res.revalidate(`/project/${projectId}`)
      console.log(`Project ${projectId} revalidated successfully`)
    } else {
      // Otherwise revalidate all project pages
      console.log('Fetching all projects for revalidation...')
      
      // Use direct Supabase client instead of fetch for better reliability
      const { data: projects, error } = await supabaseClient
        .from('projects')
        .select('id')
      
      if (error) {
        console.error('Error fetching projects for revalidation:', error)
        throw error
      }
      
      console.log(`Found ${projects?.length || 0} projects to revalidate`)
      
      if (projects && projects.length > 0) {
        for (const project of projects) {
          try {
            console.log(`Revalidating /project/${project.id}`)
            await res.revalidate(`/project/${project.id}`)
          } catch (projectError) {
            console.error(`Failed to revalidate project ${project.id}:`, projectError)
            // Continue with other projects even if one fails
          }
        }
      }
    }

    return res.status(200).json({ 
      success: true,
      revalidated: true,
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    console.error('Revalidation error:', err)
    return res.status(500).json({ 
      error: 'Error revalidating', 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    })
  }
}