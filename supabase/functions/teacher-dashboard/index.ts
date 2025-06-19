
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    )

    // Get the JWT token from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Set the session for the supabase client
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Invalid or expired token')
    }

    const url = new URL(req.url)
    const endpoint = url.searchParams.get('endpoint')
    const classId = url.searchParams.get('classId')
    const studentId = url.searchParams.get('studentId')

    console.log(`Teacher Dashboard API called by user ${user.id} for endpoint: ${endpoint}`)

    let result: any

    switch (endpoint) {
      case 'classes':
        // Get teacher's classes
        const { data: classesData, error: classesError } = await supabaseClient.rpc(
          'get_teacher_classes', 
          { p_teacher_user_id: user.id }
        )
        
        if (classesError) {
          console.error('Error fetching classes:', classesError)
          throw new Error('Failed to fetch classes')
        }
        
        result = classesData || []
        break

      case 'students':
        // Get teacher's students (optionally filtered by class)
        const { data: studentsData, error: studentsError } = await supabaseClient.rpc(
          'get_teacher_students', 
          { 
            p_teacher_user_id: user.id,
            p_class_id: classId || null
          }
        )
        
        if (studentsError) {
          console.error('Error fetching students:', studentsError)
          throw new Error('Failed to fetch students')
        }
        
        result = studentsData || []
        break

      case 'creations':
        // Get student creations (optionally filtered by student or class)
        const { data: creationsData, error: creationsError } = await supabaseClient.rpc(
          'get_student_creations',
          {
            p_teacher_user_id: user.id,
            p_student_id: studentId || null,
            p_class_id: classId || null
          }
        )
        
        if (creationsError) {
          console.error('Error fetching creations:', creationsError)
          throw new Error('Failed to fetch creations')
        }
        
        result = creationsData || []
        break

      default:
        throw new Error(`Unknown endpoint: ${endpoint}`)
    }

    console.log(`Successfully processed ${endpoint} request, returning ${Array.isArray(result) ? result.length : 'N/A'} items`)

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        endpoint,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )

  } catch (error) {
    console.error('Teacher Dashboard API Error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )
  }
})
