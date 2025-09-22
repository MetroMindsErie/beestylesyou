import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  // Get auth token to verify user is authenticated
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  try {
    // Get the project ID and update data from request body
    const { id, updates } = req.body
    
    if (!id || !updates) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    console.log('API: Updating project:', id)
    console.log('API: Updates:', updates)

    // Use the admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({
        title: updates.title,
        description: updates.description,
        instagram_link: updates.instagram_link,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('API: Error updating project:', error)
      return res.status(500).json({ error: error.message })
    }

    // Get the updated project to verify the changes
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (verifyError) {
      console.error('API: Error verifying update:', verifyError)
    } else {
      console.log('API: Verified update data:', verifyData)
    }

    // Trigger revalidation
    try {
      console.log('Revalidating pages after project update...')
      
      // Revalidate the homepage
      await res.revalidate('/')
      console.log('Home page revalidated')
      
      // Revalidate the specific project page
      await res.revalidate(`/project/${id}`)
      console.log(`Project page /project/${id} revalidated`)
      
      // Also make a call to our dedicated revalidation endpoint as backup
      try {
        const revalidateResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/revalidate?id=${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        })
        console.log('Backup revalidation result:', await revalidateResponse.text())
      } catch (backupError) {
        console.warn('Backup revalidation failed:', backupError)
        // Continue even if backup fails
      }
    } catch (revalidateError) {
      console.warn('Failed to revalidate pages:', revalidateError)
      // Continue even if revalidation fails
    }

    return res.status(200).json({ 
      success: true, 
      data: verifyData || data,
      revalidated: true
    })
  } catch (error) {
    console.error('API: Unexpected error:', error)
    return res.status(500).json({ error: error.message })
  }
}