import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KanbanBoard from '@/features/crm/components/KanbanBoard';
import DealKanbanBoard from '@/features/crm/components/DealKanbanBoard';
import UnifiedDealDialog from '@/features/crm/components/UnifiedDealDialog';
import EnhancedViewDealModal from '@/features/crm/components/EnhancedViewDealModal';
import { Deal } from '@/types/crm';

const AdminKanban = () => {
  const [activeTab, setActiveTab] = useState('leads');
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [viewingDeal, setViewingDeal] = useState<Deal | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Канбан доска</h1>
        <p className="text-muted-foreground">
          Управляйте лидами и сделками с помощью drag & drop интерфейса
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="leads">Лиды</TabsTrigger>
          <TabsTrigger value="deals">Сделки</TabsTrigger>
        </TabsList>
        
        <TabsContent value="leads" className="mt-6">
          <KanbanBoard />
        </TabsContent>
        
        <TabsContent value="deals" className="mt-6">
          <DealKanbanBoard
            onAddDeal={() => setIsAddDealOpen(true)}
            onEditDeal={(deal) => setEditingDeal(deal)}
            onViewDeal={(deal) => setViewingDeal(deal)}
          />
        </TabsContent>
      </Tabs>

      {/* Deal dialogs */}
      <UnifiedDealDialog
        open={isAddDealOpen}
        onClose={() => setIsAddDealOpen(false)}
      />

      {editingDeal && (
        <UnifiedDealDialog
          open={!!editingDeal}
          onClose={() => setEditingDeal(null)}
          deal={editingDeal}
        />
      )}

      {viewingDeal && (
        <EnhancedViewDealModal
          deal={viewingDeal}
          open={!!viewingDeal}
          onClose={() => setViewingDeal(null)}
          onEdit={() => {
            setEditingDeal(viewingDeal);
            setViewingDeal(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminKanban;
