import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Building,
  Edit,
  Trash2
} from 'lucide-react';

// Моковые данные клиентов
const mockClients = [
  {
    id: 1,
    name: 'ООО "МедЦентр Плюс"',
    contactPerson: 'Иванов Алексей Петрович',
    phone: '+998 71 123-45-67',
    email: 'ivanov@medcenter.uz',
    status: 'active',
    lastContact: '2024-01-15',
    deals: 3,
    revenue: 2500000
  },
  {
    id: 2,
    name: 'Республиканская больница',
    contactPerson: 'Петрова Мария Ивановна',
    phone: '+998 71 987-65-43',
    email: 'petrova@hospital.uz',
    status: 'potential',
    lastContact: '2024-01-10',
    deals: 1,
    revenue: 850000
  },
  {
    id: 3,
    name: 'Диагностический центр "Здоровье"',
    contactPerson: 'Сидоров Дмитрий Александрович',
    phone: '+998 71 555-33-22',
    email: 'sidorov@health.uz',
    status: 'active',
    lastContact: '2024-01-18',
    deals: 5,
    revenue: 4200000
  }
];

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'potential'>('all');

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      potential: 'secondary',
    } as const;
    
    const labels = {
      active: 'Активный',
      potential: 'Потенциальный',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const filteredClients = mockClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Клиенты</h2>
          <p className="text-muted-foreground">Управление базой клиентов</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Добавить клиента
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Поиск клиентов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                Все
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('active')}
                size="sm"
              >
                Активные
              </Button>
              <Button
                variant={statusFilter === 'potential' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('potential')}
                size="sm"
              >
                Потенциальные
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <div className="grid gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{client.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{client.contactPerson}</span>
                    {getStatusBadge(client.status)}
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
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{client.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{client.email}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Сделок: </span>
                  <span className="font-medium">{client.deals}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Выручка: </span>
                  <span className="font-medium">{client.revenue.toLocaleString()} сум</span>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Последний контакт: {new Date(client.lastContact).toLocaleDateString('ru-RU')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Клиенты не найдены</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Clients;