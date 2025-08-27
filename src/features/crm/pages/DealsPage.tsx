import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DealList from '../components/DealList';
import DealKanbanBoard from '../components/DealKanbanBoard';
import AddDealDialog from '../components/AddDealDialog';
import ViewDealModal from '../components/ViewDealModal';
import { Deal } from '@/types/crm';
import { useTranslation } from 'react-i18next';
import RoleBasedAccess from '@/components/auth/RoleBasedAccess';

const DealsPage = () => {
  const { t } = useTranslation();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [viewingDeal, setViewingDeal] = useState<Deal | null>(null);

  const handleAddDeal = () => {
    setShowAddDialog(true);
  };

  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setViewingDeal(null);
    setShowAddDialog(true);
  };

  const handleViewDeal = (deal: Deal) => {
    setViewingDeal(deal);
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingDeal(null);
    setViewingDeal(null);
  };

  return (
    <RoleBasedAccess permissions={['view_all_leads']}>
      <div className="space-y-6">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">{t('deals.listView')}</TabsTrigger>
            <TabsTrigger value="kanban">{t('deals.kanbanView')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-6">
            <DealList 
              onAddDeal={handleAddDeal}
              onEditDeal={handleEditDeal}
              onViewDeal={handleViewDeal}
            />
          </TabsContent>
          
          <TabsContent value="kanban" className="space-y-6">
            <DealKanbanBoard 
              onAddDeal={handleAddDeal}
              onEditDeal={handleEditDeal}
              onViewDeal={handleViewDeal}
            />
          </TabsContent>
        </Tabs>

        <AddDealDialog
          open={showAddDialog}
          onClose={handleCloseDialog}
          deal={editingDeal}
        />

        <ViewDealModal
          open={!!viewingDeal}
          onClose={handleCloseDialog}
          deal={viewingDeal}
          onEdit={handleEditDeal}
        />
      </div>
    </RoleBasedAccess>
  );
};

export default DealsPage;