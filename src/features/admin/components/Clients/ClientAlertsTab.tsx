import { useState, useEffect } from 'react';
import { useClientStock, type StockAlert } from '@/hooks/useClientStock';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ClientAlertsTabProps {
  clientId: string;
}

export default function ClientAlertsTab({ clientId }: ClientAlertsTabProps) {
  const { getAlerts, acknowledgeAlert, resolveAlert } = useClientStock(clientId);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, [clientId]);

  const loadAlerts = async () => {
    setLoading(true);
    const data = await getAlerts();
    setAlerts(data);
    setLoading(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'default';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  const handleAcknowledge = async (id: string) => {
    await acknowledgeAlert(id);
    loadAlerts();
  };

  const handleResolve = async (id: string) => {
    await resolveAlert(id);
    loadAlerts();
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
          <p className="text-muted-foreground">Нет активных уведомлений</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Уведомления ({alerts.length})</h3>
      <div className="space-y-3">
        {alerts.map(alert => (
          <Card key={alert.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-3 flex-1">
                  <AlertCircle className={`h-5 w-5 mt-0.5 ${
                    alert.severity === 'critical' ? 'text-red-500' :
                    alert.severity === 'high' ? 'text-orange-500' :
                    'text-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(alert.severity) as any}>
                        {alert.alert_type}
                      </Badge>
                      {alert.acknowledged && (
                        <Badge variant="outline">Подтверждено</Badge>
                      )}
                    </div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(alert.created_at), 'dd.MM.yyyy HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!alert.acknowledged && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAcknowledge(alert.id)}
                    >
                      Подтвердить
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolve(alert.id)}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Решено
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}