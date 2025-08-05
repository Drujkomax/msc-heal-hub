import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Edit,
  Trash2,
  Eye,
  Package
} from 'lucide-react';

// Моковые данные товаров
const mockProducts = [
  {
    id: 1,
    name: 'УЗИ аппарат Mindray DC-40',
    category: 'Диагностическое оборудование',
    price: 45000000,
    status: 'available',
    stock: 5,
    image: '/placeholder.svg'
  },
  {
    id: 2,
    name: 'Рентген система Samsung GC80',
    category: 'Рентгеновское оборудование',
    price: 85000000,
    status: 'available',
    stock: 2,
    image: '/placeholder.svg'
  },
  {
    id: 3,
    name: 'Анализатор крови Sysmex XN-1000',
    category: 'Лабораторное оборудование',
    price: 120000000,
    status: 'out_of_stock',
    stock: 0,
    image: '/placeholder.svg'
  },
  {
    id: 4,
    name: 'МРТ Siemens Magnetom',
    category: 'Томографы',
    price: 450000000,
    status: 'pre_order',
    stock: 1,
    image: '/placeholder.svg'
  }
];

const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'out_of_stock' | 'pre_order'>('all');

  const getStatusBadge = (status: string) => {
    const variants = {
      available: 'default',
      out_of_stock: 'destructive',
      pre_order: 'secondary',
    } as const;
    
    const labels = {
      available: 'В наличии',
      out_of_stock: 'Нет в наличии',
      pre_order: 'Под заказ',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Товары</h2>
          <p className="text-muted-foreground">Управление каталогом товаров</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Добавить товар
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
                  placeholder="Поиск товаров..."
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
                variant={statusFilter === 'available' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('available')}
                size="sm"
              >
                В наличии
              </Button>
              <Button
                variant={statusFilter === 'out_of_stock' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('out_of_stock')}
                size="sm"
              >
                Нет в наличии
              </Button>
              <Button
                variant={statusFilter === 'pre_order' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pre_order')}
                size="sm"
              >
                Под заказ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                <Package className="w-12 h-12 text-muted-foreground" />
              </div>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  {getStatusBadge(product.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Цена:</span>
                  <span className="font-semibold">{product.price.toLocaleString()} сум</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Остаток:</span>
                  <span className={`font-medium ${product.stock === 0 ? 'text-destructive' : ''}`}>
                    {product.stock} шт.
                  </span>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    Просмотр
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Изменить
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Товары не найдены</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminProducts;