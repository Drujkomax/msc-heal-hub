import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileDown, FileJson } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Lead } from '@/hooks/useLeads';

interface ExportLeadsProps {
  leads: Lead[];
}

export const ExportLeads = ({ leads }: ExportLeadsProps) => {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const exportToCSV = (data: Lead[]): string => {
    const headers = [
      'ID',
      'Имя',
      'Телефон',
      'Email',
      'Компания',
      'Город',
      'Статус',
      'Качество лида',
      'Источник',
      'Бюджет',
      'Интерес к оборудованию',
      'Должность',
      'Срок',
      'Примечания',
      'Создан',
      'Обновлен',
    ].join(',');

    const rows = data.map(lead => {
      const getStageLabel = (stage: string) => {
        const stageMap: Record<string, string> = {
          new: 'Новый',
          contacted: 'Связались',
          qualified: 'Квалифицирован',
          proposal: 'Отправил КП',
          negotiation: 'Переговоры',
          closed: 'Успешно',
          lost: 'Отказ'
        };
        return stageMap[stage] || stage;
      };

      const getQualityLabel = (quality?: string) => {
        const qualityMap: Record<string, string> = {
          hot: 'Горячий',
          warm: 'Теплый',
          cold: 'Холодный'
        };
        return quality ? qualityMap[quality] || quality : '';
      };

      return [
        lead.id,
        `"${lead.name.replace(/"/g, '""')}"`,
        lead.phone || '',
        lead.email || '',
        lead.company ? `"${lead.company.replace(/"/g, '""')}"` : '',
        lead.city || '',
        getStageLabel(lead.stage),
        getQualityLabel(lead.lead_quality),
        lead.source || '',
        lead.budget_range || '',
        lead.equipment_interest || '',
        lead.position || '',
        lead.timeline || '',
        lead.notes ? `"${lead.notes.replace(/"/g, '""')}"` : '',
        new Date(lead.created_at).toLocaleString('ru-RU'),
        new Date(lead.updated_at).toLocaleString('ru-RU'),
      ].join(',');
    });

    return [headers, ...rows].join('\n');
  };

  const exportToJSON = (data: Lead[]): string => {
    return JSON.stringify(data, null, 2);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    try {
      setLoading(true);

      if (leads.length === 0) {
        toast({
          title: 'Нет данных',
          description: 'Нет лидов для экспорта',
          variant: 'destructive',
        });
        return;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'csv') {
        content = exportToCSV(leads);
        filename = `leads_export_${timestamp}.csv`;
        mimeType = 'text/csv;charset=utf-8;';
      } else {
        content = exportToJSON(leads);
        filename = `leads_export_${timestamp}.json`;
        mimeType = 'application/json';
      }

      downloadFile(content, filename, mimeType);

      toast({
        title: 'Успешно',
        description: `Экспортировано ${leads.length} лидов в формате ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось экспортировать данные',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const activeLeads = leads.filter(lead => !lead.archived);
  const archivedLeads = leads.filter(lead => lead.archived);

  const statsByStage = leads.reduce((acc, lead) => {
    if (!lead.archived) {
      acc[lead.stage] = (acc[lead.stage] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Экспорт лидов
        </CardTitle>
        <CardDescription>
          Экспортируйте данные лидов в CSV или JSON формате
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Всего лидов</p>
            <p className="text-2xl font-bold">{leads.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Активных</p>
            <p className="text-2xl font-bold text-green-600">{activeLeads.length}</p>
          </div>
        </div>

        {/* Stage Breakdown */}
        <div className="space-y-2">
          <p className="text-sm font-medium">По статусам:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Новые:</span>
              <span className="font-medium">{statsByStage.new || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Связались:</span>
              <span className="font-medium">{statsByStage.contacted || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Квалифицированы:</span>
              <span className="font-medium">{statsByStage.qualified || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Отправил КП:</span>
              <span className="font-medium">{statsByStage.proposal || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Переговоры:</span>
              <span className="font-medium">{statsByStage.negotiation || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Успешно:</span>
              <span className="font-medium text-green-600">{statsByStage.closed || 0}</span>
            </div>
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Формат экспорта</label>
          <Select value={format} onValueChange={(value: 'csv' | 'json') => setFormat(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileDown className="h-4 w-4" />
                  <div>
                    <p className="font-medium">CSV</p>
                    <p className="text-xs text-muted-foreground">Для Excel и Google Sheets</p>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <FileJson className="h-4 w-4" />
                  <div>
                    <p className="font-medium">JSON</p>
                    <p className="text-xs text-muted-foreground">Для разработки и API</p>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Export Info */}
        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
          {format === 'csv' ? (
            <>
              <p className="font-medium mb-1">CSV формат включает:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                <li>Все основные поля лида</li>
                <li>Контактную информацию</li>
                <li>Даты создания и обновления</li>
                <li>Совместимость с Excel/Google Sheets</li>
              </ul>
            </>
          ) : (
            <>
              <p className="font-medium mb-1">JSON формат включает:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                <li>Полную структуру данных</li>
                <li>Все поля и связи</li>
                <li>Идеально для импорта в другие системы</li>
                <li>Читаемый формат для разработки</li>
              </ul>
            </>
          )}
        </div>

        {/* Export Button */}
        <Button 
          onClick={handleExport} 
          disabled={loading || leads.length === 0}
          className="w-full"
          size="lg"
        >
          <Download className="mr-2 h-4 w-4" />
          {loading ? 'Экспорт...' : `Экспортировать ${leads.length} лидов`}
        </Button>
      </CardContent>
    </Card>
  );
};
