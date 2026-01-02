import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function GET(request: NextRequest) {
  try {
    // Fetch all active tasks
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return Response.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
    
    return Response.json(data || []);
  } catch (error) {
    console.error('Error in tasks API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, task_type, action_url, points } = await request.json();
    
    if (!name || !description || !task_type || points === undefined) {
      return Response.json({ 
        error: 'Missing required fields: name, description, task_type, points' 
      }, { status: 400 });
    }

    // Insert new task
    const { data, error } = await supabase
      .from('tasks')
      .insert({ 
        name, 
        description, 
        task_type, 
        action_url: action_url || null,
        points 
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating task:', error);
      return Response.json({ error: 'Failed to create task' }, { status: 500 });
    }
    
    return Response.json(data);
  } catch (error) {
    console.error('Error in tasks POST API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
