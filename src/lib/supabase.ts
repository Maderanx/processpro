import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Dashboard data fetching functions
export async function getWorkloadDistribution() {
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select(`
      status,
      departments (
        name
      )
    `);

  if (error) throw error;
  return tasks;
}

export async function getProjectSuccessRates() {
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*');

  if (error) throw error;
  return projects;
}

export async function getPerformanceMetrics() {
  const { data: metrics, error } = await supabase
    .from('performance_metrics')
    .select('*')
    .order('month', { ascending: true })
    .limit(6);

  if (error) throw error;
  return metrics;
}

export async function getTaskDistribution() {
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('type, status');

  if (error) throw error;
  return tasks;
}

export async function getCompletedTasks() {
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('type, completed_at')
    .eq('status', 'completed')
    .order('completed_at', { ascending: true });

  if (error) throw error;
  return tasks;
}

export async function getPendingTasks() {
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('priority, status')
    .neq('status', 'completed');

  if (error) throw error;
  return tasks;
} 