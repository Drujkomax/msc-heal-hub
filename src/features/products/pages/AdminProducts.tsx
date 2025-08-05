import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    description: 'Современный ультразвуковой аппарат с высокой четкостью изображения',
    image: '/placeholder.svg',
    status: 'active'
  },
  {
    id: 2,
    name: 'Рентген система Samsung XGEO GR40',
    category: 'Рентгенология',
    description: 'Цифровая рентгеновская система нового поколения',
    image: '/placeholder.svg',
    status: 'active'
  },
  {
    id: 3,
    name: 'Лабораторный анализатор Sysmex',
    category: 'Лабораторное оборудование',
    description: 'Автоматический анализатор крови',
    image: '/placeholder.svg',
    status: 'draft'
  },
  {
    id: 4,
    name: 'МРТ система Siemens',
    category: 'Томография',
    description: 'Магнитно-резонансная томография высокого разрешения',
    image: '/placeholder.svg',
    status: 'active'
  }
];

const AdminProducts = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      draft: 'secondary',
      archived: 'outline',
    } as const;
    
    const labels = {
      active: 'Активный',
      draft: 'Черновик',
      archived: 'Архив',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">{t('products.title')}</h2>
          <p className="text-muted-foreground">{t('products.subtitle')}</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t('products.addProduct')}
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Всего товаров</p>
                <p className="text-2xl font-bold">{mockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Активные</p>
                <p className="text-2xl font-bold">
                  {mockProducts.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-sm text-muted-foreground">Черновики</p>
                <p className="text-2xl font-bold">
                  {mockProducts.filter(p => p.status === 'draft').length}
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
                  placeholder={t('products.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="aspect-video w-full bg-gray-100 rounded-md mb-4 flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{product.category}</p>
                </div>
                {getStatusBadge(product.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    {t('common.view')}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    {t('common.edit')}
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
            <p className="text-muted-foreground">{t('products.notFound')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminProducts;