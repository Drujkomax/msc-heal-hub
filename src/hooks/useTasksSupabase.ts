import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Task {
  id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  client_id?: string;
  deal_id?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export const useTasksSupabase = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Error fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const user = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: taskData.title,
          description: taskData.description,
          assignee_id: taskData.assignee_id,
          client_id: taskData.client_id,
          deal_id: taskData.deal_id,
          status: taskData.status,
          priority: taskData.priority,
          due_date: taskData.due_date,
          created_by: user.data.user?.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      setTasks(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding task:', err);
      setError(err instanceof Error ? err.message : 'Error adding task');
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: updates.title,
          description: updates.description,
          assignee_id: updates.assignee_id,
          client_id: updates.client_id,
          deal_id: updates.deal_id,
          status: updates.status,
          priority: updates.priority,
          due_date: updates.due_date,
          completed_at: updates.status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setTasks(prev => 
        prev.map(task => task.id === id ? data : task)
      );
      return data;
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Error updating task');
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setTasks(prev => prev.filter(task => task.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err instanceof Error ? err.message : 'Error deleting task');
      throw err;
    }
  };

  const getTaskById = (id: string) => {
    return tasks.find(task => task.id === id);
  };

  const getTasksByClientId = (clientId: string) => {
    return tasks.filter(task => task.client_id === clientId);
  };

  const getTasksByDealId = (dealId: string) => {
    return tasks.filter(task => task.deal_id === dealId);
  };

  const completeTask = async (id: string) => {
    return updateTask(id, { 
      status: 'completed', 
      completed_at: new Date().toISOString() 
    });
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    getTaskById,
    getTasksByClientId,
    getTasksByDealId,
    completeTask,
    refreshTasks: fetchTasks,
  };
};