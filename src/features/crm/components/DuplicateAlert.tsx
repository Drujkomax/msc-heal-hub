import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Users, Merge } from 'lucide-react';
import { DuplicateGroup } from '@/hooks/useDuplicateDetection';

interface DuplicateAlertProps {
  duplicateGroup: DuplicateGroup;
  onViewDuplicates?: () => void;
  onMergeDuplicates?: (duplicateGroup: DuplicateGroup) => void;
}

export const DuplicateAlert = ({ duplicateGroup, onViewDuplicates, onMergeDuplicates }: DuplicateAlertProps) => {
  const { leads, duplicateType, score } = duplicateGroup;

  const getBadgeVariant = () => {
    if (score >= 90) return 'destructive';
    if (score >= 80) return 'secondary';
    return 'outline';
  };

  const getTypeText = () => {
    switch (duplicateType) {
      case 'both': return 'Имя и телефон';
      case 'name': return 'Имя';
      case 'phone': return 'Телефон';
      default: return 'Неизвестно';
    }
  };

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>Найдено {leads.length} похожих лидов</span>
          <Badge variant={getBadgeVariant()}>
            {getTypeText()} ({score}%)
          </Badge>
        </div>
        <div className="flex gap-2">
          {onViewDuplicates && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewDuplicates}
              className="text-orange-700 hover:text-orange-800"
            >
              Посмотреть
            </Button>
          )}
          {onMergeDuplicates && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onMergeDuplicates(duplicateGroup)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Merge className="h-3 w-3 mr-1" />
              Слияние
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};