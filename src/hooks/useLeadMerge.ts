import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Lead } from '@/hooks/useLeads';
import { DuplicateGroup } from '@/hooks/useDuplicateDetection';

export const useLeadMerge = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const mergeLeads = async (duplicateGroup: DuplicateGroup, onSuccess?: () => void) => {
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Необходимо войти в систему",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const leads = duplicateGroup.leads;
      
      // Find the lead with the most complete information
      const primaryLead = selectPrimaryLead(leads);
      const duplicateLeads = leads.filter(lead => lead.id !== primaryLead.id);
      
      // Merge all information into the primary lead
      const mergedData = mergeLeadData(primaryLead, duplicateLeads);
      
      // Start transaction-like operations
      const { error: updateError } = await supabase
        .from('leads')
        .update(mergedData)
        .eq('id', primaryLead.id);

      if (updateError) throw updateError;

      // Log the merge action for the primary lead
      const mergeDetails = {
        action: 'lead_merge',
        merged_leads: duplicateLeads.map(lead => ({
          id: lead.id,
          name: lead.name,
          phone: lead.phone,
          company: lead.company,
          stage: lead.stage,
          notes: lead.notes
        })),
        duplicate_type: duplicateGroup.duplicateType,
        score: duplicateGroup.score
      };

      const { error: logError } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: user.id,
          action: 'lead_merge',
          target_type: 'lead',
          target_id: primaryLead.id,
          details: mergeDetails
        });

      if (logError) console.warn('Failed to log merge action:', logError);

      // Delete duplicate leads
      const { error: deleteError } = await supabase
        .from('leads')
        .delete()
        .in('id', duplicateLeads.map(lead => lead.id));

      if (deleteError) throw deleteError;

      toast({
        title: "Успешно",
        description: `Объединено ${leads.length} лидов в один. Дубликаты удалены.`,
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error merging leads:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось объединить лиды",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { mergeLeads, loading };
};

// Helper function to select the primary lead (most complete information)
const selectPrimaryLead = (leads: Lead[]): Lead => {
  return leads.reduce((primary, current) => {
    let primaryScore = 0;
    let currentScore = 0;

    // Score based on completeness of information
    if (primary.name?.trim()) primaryScore += 2;
    if (primary.phone?.trim()) primaryScore += 2;
    if (primary.company?.trim()) primaryScore += 1;
    if (primary.notes?.trim()) primaryScore += 1;

    if (current.name?.trim()) currentScore += 2;
    if (current.phone?.trim()) currentScore += 2;
    if (current.company?.trim()) currentScore += 1;
    if (current.notes?.trim()) currentScore += 1;

    // Prefer more recent leads if scores are equal
    if (currentScore > primaryScore) {
      return current;
    } else if (currentScore === primaryScore) {
      return new Date(current.created_at) > new Date(primary.created_at) ? current : primary;
    }
    
    return primary;
  });
};

// Helper function to merge lead data intelligently
const mergeLeadData = (primary: Lead, duplicates: Lead[]) => {
  const merged = { ...primary };
  const allLeads = [primary, ...duplicates];

  // Merge notes from all leads
  const allNotes = allLeads
    .map(lead => lead.notes?.trim())
    .filter(note => note && note.length > 0);
  
  if (allNotes.length > 1) {
    const uniqueNotes = [...new Set(allNotes)];
    merged.notes = uniqueNotes.join('\n\n--- Объединенные заметки ---\n');
  }

  // Prefer non-empty fields from any lead
  for (const lead of allLeads) {
    if (!merged.company?.trim() && lead.company?.trim()) {
      merged.company = lead.company;
    }
  }

  // Use the most advanced stage
  const stageOrder = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'];
  const stages = allLeads.map(lead => lead.stage).filter(stage => stage);
  const advancedStage = stages.reduce((best, current) => {
    const bestIndex = stageOrder.indexOf(best);
    const currentIndex = stageOrder.indexOf(current);
    return currentIndex > bestIndex ? current : best;
  }, stages[0] || 'new');
  
  merged.stage = advancedStage;

  return merged;
};