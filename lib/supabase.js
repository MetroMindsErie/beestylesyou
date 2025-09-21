import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Direct database operation helper
export async function updateProject(id, updates) {
  try {
    // Get the user's session first
    const { data: sessionData } = await supabase.auth.getSession()
    
    // Use standard update with authorization header
    const { data, error } = await supabase
      .from('projects')
      .update({
        title: updates.title,
        description: updates.description,
        instagram_link: updates.instagram_link
      })
      .eq('id', id)
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error('Update project error:', error)
    return { success: false, error }
  }
}
