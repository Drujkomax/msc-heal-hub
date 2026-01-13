import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KanbanBoard from '@/features/crm/components/KanbanBoard';
import DealKanbanBoard from '@/features/crm/components/DealKanbanBoard';
import AddDealDialog from '@/features/crm/components/AddDealDialog';
import ViewDealModal from '@/features/crm/components/ViewDealModal';
import EnhancedAddDealDialog from '@/features/crm/components/EnhancedAddDealDialog';
import { Deal } from '@/types/crm';
import { useDeals } from '@/hooks/useDeals';

const AdminKanban = () => {
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isViewDealOpen, setIsViewDealOpen] = useState(false);
  const [isEditDealOpen, setIsEditDealOpen] = useState(false);
  const { refreshDeals } = useDeals();

  const handleAddDeal = () => {
    setIsAddDealOpen(true);
  };

  const handleViewDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsViewDealOpen(true);
  };

  const handleEditDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsEditDealOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Канбан доска</h1>
        <p className="text-muted-foreground">
          Управляйте лидами и сделками с помощью drag & drop интерфейса
        </p>
      </div>

      <Tabs defaultValue="leads" className="w-full">
        <TabsList>
          <TabsTrigger value="leads">Лиды</TabsTrigger>
          <TabsTrigger value="deals">Сделки</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="mt-6">
          <KanbanBoard />
        </TabsContent>

        <TabsContent value="deals" className="mt-6">
          <DealKanbanBoard 
            onAddDeal={handleAddDeal}
            onViewDeal={handleViewDeal}
            onEditDeal={handleEditDeal}
          />
        </TabsContent>
      </Tabs>

      {/* Диалоги для сделок */}
      <AddDealDialog
        open={isAddDealOpen}
        onClose={() => {
          setIsAddDealOpen(false);
          refreshDeals();
        }}
      />

      <ViewDealModal
        deal={selectedDeal}
        open={isViewDealOpen}
        onClose={() => {
          setIsViewDealOpen(false);
          setSelectedDeal(null);
        }}
        onEdit={handleEditDeal}
      />

      <EnhancedAddDealDialog
        open={isEditDealOpen}
        onClose={() => {
          setIsEditDealOpen(false);
          setSelectedDeal(null);
          refreshDeals();
        }}
        deal={selectedDeal}
      />
    </div>
  );
};

export default AdminKanban;
