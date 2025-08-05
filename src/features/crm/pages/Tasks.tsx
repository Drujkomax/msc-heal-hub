import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Calendar,
  User,
  Building,
  Edit,
  Trash2,
  CheckCircle,
  Clock
} from 'lucide-react';

// Моковые данные задач
const mockTasks = [
  {
    id: 1,
    title: 'Презентация УЗИ оборудования',
    description: 'Провести презентацию нового УЗИ аппарата для клиента',
    client: 'ООО "МедЦентр Плюс"',
    assignee: 'Иванов А.П.',
    priority: 'high',
    status: 'in_progress',
    dueDate: '2024-01-25',
    createdDate: '2024-01-15'
  },
  {
    id: 2,
    title: 'Подготовка коммерческого предложения',
    description: 'Составить КП на лабораторное оборудование',
    client: 'Республиканская больница',
    assignee: 'Петрова М.И.',
    priority: 'medium',
    status: 'pending',
    dueDate: '2024-01-30',
    createdDate: '2024-01-18'
  },
  {
    id: 3,
    title: 'Техническая консультация',
    description: 'Консультация по возможностям рентген системы',
    client: 'Диагностический центр "Здоровье"',
    assignee: 'Сидоров Д.А.',
    priority: 'low',
    status: 'completed',
    dueDate: '2024-01-20',
    createdDate: '2024-01-10'
  },
  {
    id: 4,
    title: 'Планирование установки МРТ',
    description: 'Обсудить требования к помещению для установки МРТ',
    client: 'Областная больница',
    assignee: 'Козлов И.В.',
    priority: 'high',
    status: 'pending',
    dueDate: '2024-02-05',
    createdDate: '2024-01-20'
  }
];

const Tasks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      in_progress: 'default',
      completed: 'outline',
    } as const;
    
    const labels = {
      pending: 'Ожидает',
      in_progress: 'В работе',
      completed: 'Выполнена',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary',
    } as const;
    
    const labels = {
      high: 'Высокий',
      medium: 'Средний',
      low: 'Низкий',
    };

    return (
      <Badge variant={variants[priority as keyof typeof variants] || 'secondary'}>
        {labels[priority as keyof typeof labels] || priority}
      </Badge>
    );
  };

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Задачи</h2>
          <p className="text-muted-foreground">Управление задачами и активностями</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Создать задачу
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {mockTasks.filter(t => t.status === 'pending').length}
            </div>
            <p className="text-sm text-muted-foreground">Ожидает выполнения</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {mockTasks.filter(t => t.status === 'in_progress').length}
            </div>
            <p className="text-sm text-muted-foreground">В работе</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {mockTasks.filter(t => t.status === 'completed').length}
            </div>
            <p className="text-sm text-muted-foreground">Выполнено</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {mockTasks.filter(t => t.priority === 'high' && t.status !== 'completed').length}
            </div>
            <p className="text-sm text-muted-foreground">Высокий приоритет</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Поиск задач..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex gap-2">
                <span className="text-sm font-medium self-center">Статус:</span>
                {['all', 'pending', 'in_progress', 'completed'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    onClick={() => setStatusFilter(status as any)}
                    size="sm"
                  >
                    {status === 'all' ? 'Все' : 
                     status === 'pending' ? 'Ожидает' :
                     status === 'in_progress' ? 'В работе' :
                     'Выполнено'}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <span className="text-sm font-medium self-center">Приоритет:</span>
                {['all', 'high', 'medium', 'low'].map((priority) => (
                  <Button
                    key={priority}
                    variant={priorityFilter === priority ? 'default' : 'outline'}
                    onClick={() => setPriorityFilter(priority as any)}
                    size="sm"
                  >
                    {priority === 'all' ? 'Все' : 
                     priority === 'high' ? 'Высокий' :
                     priority === 'medium' ? 'Средний' :
                     'Низкий'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="grid gap-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(task.status)}
                    <CardTitle className="text-xl">{task.title}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(task.status)}
                    {getPriorityBadge(task.priority)}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{task.client}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{task.assignee}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    До: {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Задачи не найдены</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Tasks;