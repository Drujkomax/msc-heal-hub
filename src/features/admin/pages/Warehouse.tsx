import { useState, useEffect } from 'react';
import { useWarehouse, LowStockItem } from '@/hooks/useWarehouse';
import { AddWarehouseItemDialog } from '../components/Warehouse/AddWarehouseItemDialog';
import { EditWarehouseItemDialog } from '../components/Warehouse/EditWarehouseItemDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Package, MapPin, Archive, Pencil, Trash2, Search, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const Warehouse = () => {
  const { items, loading, archiveItem, deleteItem, getLowStockItems } = useWarehouse();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);

  useEffect(() => {
    const fetchLowStock = async () => {
      const lowStock = await getLowStockItems();
      setLowStockItems(lowStock);
    };
    fetchLowStock();
  }, [items]);

  const filteredItems = items.filter(item =>
    item.name.ru.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getConditionBadge = (condition: string) => {
    const variants: Record<string, { label: string; variant: any }> = {
      new: { label: 'Новое', variant: 'default' },
      used: { label: 'Б/У', variant: 'secondary' },
      refurbished: { label: 'Восстановленное', variant: 'outline' }
    };
    return variants[condition] || variants.new;
  };

  const handleArchive = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите архивировать этот товар?')) {
      try {
        await archiveItem(id);
      } catch (error) {
        console.error('Error archiving item:', error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар? Это действие необратимо.')) {
      try {
        await deleteItem(id);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Склад</h1>
          <p className="text-muted-foreground">Управление складскими товарами</p>
        </div>
        <AddWarehouseItemDialog />
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Низкие остатки на складе</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {lowStockItems.map((item) => (
                <div key={item.id} className="text-sm">
                  <span className="font-medium">{item.name.ru}</span> - осталось {item.quantity} из минимум {item.minimum_stock}
                  {item.location && <span className="text-muted-foreground ml-2">({item.location})</span>}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Всего позиций</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Всего единиц</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.reduce((sum, item) => sum + item.quantity, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Новые товары</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.filter(i => i.condition === 'new').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Б/У товары</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.filter(i => i.condition === 'used').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по названию или местоположению..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-video bg-muted relative">
              {item.images.cover ? (
                <img
                  src={item.images.cover}
                  alt={item.name.ru}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{item.name.ru}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge {...getConditionBadge(item.condition)} className="text-xs">
                    {getConditionBadge(item.condition).label}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {item.quantity} {item.unit}
                  </Badge>
                </div>
              </div>

              {item.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{item.location}</span>
                </div>
              )}

              {(item.purchase_price || item.selling_price) && (
                <div className="flex justify-between text-sm">
                  {item.purchase_price && (
                    <div>
                      <span className="text-muted-foreground">Закупка: </span>
                      <span className="font-medium">${item.purchase_price}</span>
                    </div>
                  )}
                  {item.selling_price && (
                    <div>
                      <span className="text-muted-foreground">Продажа: </span>
                      <span className="font-medium">${item.selling_price}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setEditingItem(item)}
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Изменить
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleArchive(item.id)}
                >
                  <Archive className="h-3 w-3" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Товары не найдены</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Попробуйте изменить параметры поиска' : 'Начните добавлять товары на склад'}
          </p>
        </div>
      )}

      {/* Edit Dialog */}
      {editingItem && (
        <EditWarehouseItemDialog
          item={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
        />
      )}
    </div>
  );
};