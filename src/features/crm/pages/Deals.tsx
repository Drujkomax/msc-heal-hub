import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useDeals } from '@/hooks/useDeals';
import { useClients } from '@/hooks/useClients';
import AddDealDialog from '@/features/crm/components/AddDealDialog';
import { 
  Search, 
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Calendar,
  User,
  TrendingUp
} from 'lucide-react';

const Deals = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { deals, loading, addDeal, deleteDeal, updateDeal } = useDeals();
  const { clients, getClientById } = useClients();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDeals = deals.filter(deal =>
    deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getClientById(deal.clientId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDeal = async (dealData: Parameters<typeof addDeal>[0]) => {
    try {
      await addDeal(dealData);
      toast({
        title: t('common.success'),
        description: 'Сделка успешно добавлена',
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Ошибка при добавлении сделки',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDeal = async (id: string) => {
    try {
      await deleteDeal(id);
      toast({
        title: t('common.success'),
        description: 'Сделка успешно удалена',
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Ошибка при удалении сделки',
        variant: 'destructive',
      });
    }
  };

  const getStageColor = (stage: string) => {
    const colors = {
      lead: 'bg-gray-100 text-gray-800',
      qualified: 'bg-blue-100 text-blue-800',
      proposal: 'bg-yellow-100 text-yellow-800',
      negotiation: 'bg-orange-100 text-orange-800',
      closed: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStageLabel = (stage: string) => {
    const labels = {
      lead: 'Лид',
      qualified: 'Квалифицированный',
      proposal: 'Предложение',
      negotiation: 'Переговоры',
      closed: 'Закрыт',
      lost: 'Потерян',
    };
    return labels[stage as keyof typeof labels] || stage;
  };

  const getPriorityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 50) return 'text-yellow-600';
    if (probability >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">{t('deals.title')}</h2>
          <p className="text-muted-foreground">{t('deals.subtitle')}</p>
        </div>
        <AddDealDialog onAddDeal={handleAddDeal} />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Общая сумма</p>
                <p className="text-2xl font-bold">
                  {deals.reduce((sum, deal) => sum + deal.amount, 0).toLocaleString()} ₽
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Активные сделки</p>
                <p className="text-2xl font-bold">
                  {deals.filter(d => !['closed', 'lost'].includes(d.stage)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Закрытые сделки</p>
                <p className="text-2xl font-bold">
                  {deals.filter(d => d.stage === 'closed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Ср. размер сделки</p>
                <p className="text-2xl font-bold">
                  {deals.length > 0 ? Math.round(deals.reduce((sum, deal) => sum + deal.amount, 0) / deals.length).toLocaleString() : 0} ₽
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={t('deals.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDeals.map((deal) => {
          const client = getClientById(deal.clientId);
          return (
            <Card key={deal.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{deal.title}</CardTitle>
                    {client && (
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <User className="w-4 h-4 mr-1" />
                        {client.name}
                      </p>
                    )}
                  </div>
                  <Badge className={getStageColor(deal.stage)}>
                    {getStageLabel(deal.stage)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Сумма:</span>
                    <span className="font-semibold">{deal.amount.toLocaleString()} ₽</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Вероятность:</span>
                    <span className={`font-semibold ${getPriorityColor(deal.probability)}`}>
                      {deal.probability}%
                    </span>
                  </div>
                  
                  {deal.closeDate && (
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>Закрытие: {new Date(deal.closeDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="text-sm text-muted-foreground">
                    Создано: {new Date(deal.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      {t('common.view')}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      {t('common.edit')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteDeal(deal.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDeals.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">{t('deals.notFound')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Deals;