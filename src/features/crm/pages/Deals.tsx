import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Calendar,
  DollarSign,
  Building,
  Edit,
  Trash2,
  TrendingUp
} from 'lucide-react';

// Моковые данные сделок
const mockDeals = [
  {
    id: 1,
    title: 'Поставка УЗИ аппарата Mindray',
    client: 'ООО "МедЦентр Плюс"',
    value: 45000000,
    stage: 'negotiation',
    probability: 70,
    expectedCloseDate: '2024-02-15',
    createdDate: '2024-01-01',
    manager: 'Иванов А.П.'
  },
  {
    id: 2,
    title: 'Комплект лабораторного оборудования',
    client: 'Республиканская больница',
    value: 120000000,
    stage: 'proposal',
    probability: 50,
    expectedCloseDate: '2024-03-01',
    createdDate: '2024-01-10',
    manager: 'Петрова М.И.'
  },
  {
    id: 3,
    title: 'Рентген система Samsung',
    client: 'Диагностический центр "Здоровье"',
    value: 85000000,
    stage: 'closed_won',
    probability: 100,
    expectedCloseDate: '2024-01-20',
    createdDate: '2023-12-15',
    manager: 'Сидоров Д.А.'
  },
  {
    id: 4,
    title: 'МРТ система под ключ',
    client: 'Областная больница',
    value: 450000000,
    stage: 'qualification',
    probability: 30,
    expectedCloseDate: '2024-04-30',
    createdDate: '2024-01-18',
    manager: 'Козлов И.В.'
  }
];

const Deals = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'>('all');

  const getStageBadge = (stage: string) => {
    const variants = {
      qualification: 'secondary',
      proposal: 'outline',
      negotiation: 'default',
      closed_won: 'default',
      closed_lost: 'destructive',
    } as const;
    
    const labels = {
      qualification: 'Квалификация',
      proposal: 'Предложение',
      negotiation: 'Переговоры',
      closed_won: 'Выиграна',
      closed_lost: 'Проиграна',
    };

    return (
      <Badge variant={variants[stage as keyof typeof variants] || 'secondary'}>
        {labels[stage as keyof typeof labels] || stage}
      </Badge>
    );
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return 'text-green-600';
    if (probability >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredDeals = mockDeals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'all' || deal.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Сделки</h2>
          <p className="text-muted-foreground">Управление продажами и сделками</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Создать сделку
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {mockDeals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost').length}
            </div>
            <p className="text-sm text-muted-foreground">Активные сделки</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {mockDeals.filter(d => d.stage === 'closed_won').length}
            </div>
            <p className="text-sm text-muted-foreground">Выигранные</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {mockDeals
                .filter(d => d.stage !== 'closed_lost')
                .reduce((sum, d) => sum + d.value, 0)
                .toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Общая стоимость (сум)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {Math.round(
                mockDeals
                  .filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost')
                  .reduce((sum, d) => sum + d.probability, 0) /
                mockDeals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost').length
              )}%
            </div>
            <p className="text-sm text-muted-foreground">Средний %</p>
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
                  placeholder="Поиск сделок..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'qualification', 'proposal', 'negotiation', 'closed_won'].map((stage) => (
                <Button
                  key={stage}
                  variant={stageFilter === stage ? 'default' : 'outline'}
                  onClick={() => setStageFilter(stage as any)}
                  size="sm"
                >
                  {stage === 'all' ? 'Все' : 
                   stage === 'qualification' ? 'Квалификация' :
                   stage === 'proposal' ? 'Предложение' :
                   stage === 'negotiation' ? 'Переговоры' :
                   'Выигранные'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deals List */}
      <div className="grid gap-4">
        {filteredDeals.map((deal) => (
          <Card key={deal.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{deal.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{deal.client}</span>
                    {getStageBadge(deal.stage)}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{deal.value.toLocaleString()} сум</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className={`text-sm font-medium ${getProbabilityColor(deal.probability)}`}>
                    {deal.probability}%
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{new Date(deal.expectedCloseDate).toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Менеджер: </span>
                  <span className="font-medium">{deal.manager}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDeals.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Сделки не найдены</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Deals;