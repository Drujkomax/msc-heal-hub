import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  Award,
  AlertTriangle,
  BarChart3,
  Activity,
} from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLeads } from "@/hooks/useLeads";
import { useDeals } from "@/hooks/useDeals";
import { useProducts } from "@/hooks/useProducts";
import { format, subDays } from "date-fns";
import { ru } from "date-fns/locale";
import { useTranslation } from "react-i18next";

const ExecutiveOverview = () => {
  const {
    getConversionAnalytics,
    getTopProductsByConversion,
    getEmployeeActivity,
    loading: analyticsLoading,
  } = useAnalytics();

  const { leads, loading: leadsLoading } = useLeads();
  const { deals } = useDeals();
  const { products, loading: productsLoading } = useProducts();

  const [analytics, setAnalytics] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [employeeActivity, setEmployeeActivity] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState("30");

  useEffect(() => {
    loadExecutiveData();
  }, [dateRange]);

  const { t, i18n } = useTranslation();

  const loadExecutiveData = async () => {
    const endDate = format(new Date(), "yyyy-MM-dd");
    const startDate = format(subDays(new Date(), parseInt(dateRange)), "yyyy-MM-dd");

    // Загружаем все данные параллельно
    const [analyticsData, topProductsData, activityData] = await Promise.all([
      getConversionAnalytics(startDate, endDate),
      getTopProductsByConversion(5),
      getEmployeeActivity(startDate, endDate),
    ]);

    setAnalytics(analyticsData);
    setTopProducts(topProductsData);
    setEmployeeActivity(activityData);
  };

  // Вычисляем ключевые метрики
  const getExecutiveMetrics = () => {
    // Конверсия товаров: дневные снимки analytics; если их ещё нет —
    // фолбэк на суммарные счётчики из products (за всё время)
    let totalViews = analytics.reduce((sum, item) => sum + item.views_count, 0);
    let totalQuotes = analytics.reduce((sum, item) => sum + item.quote_requests_count, 0);
    if (totalViews === 0 && totalQuotes === 0) {
      totalViews = products.reduce((sum, p: any) => sum + (p.views_count || 0), 0);
      totalQuotes = products.reduce((sum, p: any) => sum + (p.quote_requests_count || 0), 0);
    }
    const conversionRate = totalViews > 0 ? (totalQuotes / totalViews) * 100 : 0;

    // Выручка и пайплайн — из реальных СДЕЛОК (таблица conversion_analytics.revenue
    // никем не заполнялась, поэтому старая «выручка» всегда была $0)
    const periodStart = subDays(new Date(), parseInt(dateRange));
    const closedDeals = deals.filter((d: any) => d.stage === 'closed');
    const closedRevenue = closedDeals
      .filter((d: any) => new Date(d.close_date || d.created_at) >= periodStart)
      .reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0);
    const openDeals = deals.filter((d: any) => d.stage !== 'closed' && d.stage !== 'lost');
    const pipelineValue = openDeals.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0);
    const totalRevenue = closedRevenue;

    // Метрики по лидам
    const totalLeads = leads.length;
    const newLeads = leads.filter((lead) => {
      const createdAt = new Date(lead.created_at);
      const startDate = subDays(new Date(), parseInt(dateRange));
      return createdAt >= startDate;
    }).length;

    const convertedLeads = leads.filter((lead) => lead.stage === "converted" || lead.stage === "closed").length;

    const leadConversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Метрики по продуктам
    const activeProducts = products.filter((p) => !p.archived).length;
    const topPerformingProducts = topProducts.filter((p) => (p.conversion_rate || 0) >= 0.05).length;

    // Метрики по активности сотрудников
    const uniqueEmployees = new Set(employeeActivity.map((a) => a.user_id)).size;
    const totalActions = employeeActivity.length;
    const avgActionsPerEmployee = uniqueEmployees > 0 ? totalActions / uniqueEmployees : 0;

    const unassignedLeads = leads.filter(
      (l) => !l.assigned_to && l.stage !== 'closed' && l.stage !== 'lost',
    ).length;

    return {
      totalViews,
      totalQuotes,
      conversionRate,
      totalRevenue,
      pipelineValue,
      pipelineCount: openDeals.length,
      unassignedLeads,
      totalLeads,
      newLeads,
      leadConversionRate,
      activeProducts,
      topPerformingProducts,
      uniqueEmployees,
      totalActions,
      avgActionsPerEmployee,
    };
  };

  const metrics = getExecutiveMetrics();

  // Определяем критические показатели
  const getCriticalAlerts = () => {
    const alerts = [];

    if (metrics.unassignedLeads > 0) {
      alerts.push({
        type: "danger",
        message: t("dashboard.executive.alerts.unassignedLeads", "Лиды без ответственного"),
        value: `${metrics.unassignedLeads}`,
        action: t("dashboard.executive.alerts.assignLeads", "Назначьте менеджера в разделе «Лиды»"),
      });
    }

    if (metrics.totalViews > 0 && metrics.conversionRate < 2) {
      alerts.push({
        type: "warning",
        message: t("dashboard.executive.alerts.lowProductConversion", "Низкая конверсия товаров"),
        value: `${metrics.conversionRate.toFixed(1)}%`,
        action: t("dashboard.executive.alerts.optimizeCatalog", "Требуется оптимизация каталога"),
      });
    }

    if (metrics.leadConversionRate < 10) {
      alerts.push({
        type: "danger",
        message: t("dashboard.executive.alerts.lowLeadConversion", "Низкая конверсия лидов"),
        value: `${metrics.leadConversionRate.toFixed(1)}%`,
        action: t("dashboard.executive.alerts.improveLeadManagement", "Необходимо улучшить работу с лидами"),
      });
    }

    if (metrics.avgActionsPerEmployee < 5) {
      alerts.push({
        type: "info",
        message: t("dashboard.executive.alerts.lowEmployeeActivity", "Низкая активность сотрудников"),
        value: `${metrics.avgActionsPerEmployee.toFixed(1)} ${t(
          "dashboard.executive.alerts.actionsPerDay",
          "действий/день",
        )}`,
        action: t("dashboard.executive.alerts.checkWorkload", "Проверить загруженность персонала"),
      });
    }

    return alerts;
  };

  const criticalAlerts = getCriticalAlerts();

  const loading = analyticsLoading || leadsLoading || productsLoading;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("dashboard.executive.title", "Панель руководства")}</h1>
          <p className="text-muted-foreground">
            {t("dashboard.executive.subtitle", "Сводная аналитика для принятия решений")}
          </p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 {t("common.days", "дней")}</SelectItem>
            <SelectItem value="14">14 {t("common.days", "дней")}</SelectItem>
            <SelectItem value="30">30 {t("common.days", "дней")}</SelectItem>
            <SelectItem value="90">90 {t("common.days", "дней")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {criticalAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              {t("dashboard.executive.attention", "Требуют внимания")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalAlerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <h4 className="font-medium text-orange-900">{alert.message}</h4>
                    <p className="text-sm text-orange-700">{alert.action}</p>
                  </div>
                  <Badge variant="outline" className="text-orange-800 border-orange-300">
                    {alert.value}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.executive.metrics.pipeline", "Сделки в работе")}
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
              <BarChart3 className="h-4 w-4 text-blue-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.pipelineValue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metrics.pipelineCount} {t("dashboard.executive.metrics.openDeals", "открытых сделок")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.executive.metrics.totalRevenue", "Закрытая выручка")}
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
              <DollarSign className="h-4 w-4 text-green-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {t("dashboard.executive.metrics.closedFor", "Закрытые сделки за")} {dateRange} {t("common.days", "дней")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.executive.metrics.productConversion", "Конверсия товаров")}
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
              <Package className="h-4 w-4 text-violet-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalViews > 0 ? `${metrics.conversionRate.toFixed(1)}%` : "—"}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metrics.totalViews > 0
                ? `${t("dashboard.executive.metrics.viewsToQuotes", "Просмотры → КП")} (${metrics.totalViews.toLocaleString()})`
                : t("dashboard.executive.metrics.noViewData", "Просмотры начнут считаться после деплоя")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.executive.metrics.leadConversion", "Конверсия лидов")}
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <Users className="h-4 w-4 text-amber-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.leadConversionRate.toFixed(1)}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metrics.leadConversionRate >= 10 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {t("dashboard.executive.metrics.leadsToDeals", "Лиды → сделки")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.executive.metrics.teamActivity", "Активность команды")}
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100">
              <Activity className="h-4 w-4 text-sky-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgActionsPerEmployee.toFixed(1)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metrics.avgActionsPerEmployee >= 5 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {t("dashboard.executive.metrics.actionsPerEmployee", "Действий/сотрудник")}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">{t("dashboard.executive.tabs.products", "Товары")}</TabsTrigger>
          <TabsTrigger value="leads">{t("dashboard.executive.tabs.leadsDeals", "Лиды и сделки")}</TabsTrigger>
          <TabsTrigger value="team">{t("dashboard.executive.tabs.team", "Команда")}</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {t("dashboard.executive.products.overview", "Обзор товаров")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {t("dashboard.executive.products.activeProducts", "Активных товаров")}
                  </span>
                  <span className="font-medium">{metrics.activeProducts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {t("dashboard.executive.products.highConversion", "Высокая конверсия")}
                  </span>
                  <span className="font-medium">{metrics.topPerformingProducts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {t("dashboard.executive.products.totalViews", "Общие просмотры")}
                  </span>
                  <span className="font-medium">{metrics.totalViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {t("dashboard.executive.products.quoteRequests", "Запросы КП")}
                  </span>
                  <span className="font-medium">{metrics.totalQuotes.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  {t("dashboard.executive.products.topProducts", "Топ товары")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topProducts.slice(0, 3).map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0
                                ? "bg-yellow-100 text-yellow-800"
                                : index === 1
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium truncate max-w-32">
                            {(product.name as any)?.[i18n.language] || (product.name as any)?.ru || t("dashboard.executive.products.noName", "Без названия")}
                          </span>
                        </div>
                        <Badge variant="outline">{((product.conversion_rate || 0) * 100).toFixed(1)}%</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t("dashboard.executive.leads.funnel", "Воронка лидов")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {t("dashboard.executive.leads.totalLeads", "Всего лидов")}
                  </span>
                  <span className="font-medium">{metrics.totalLeads}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {t("dashboard.executive.leads.newLeads", "Новые лиды")}
                  </span>
                  <span className="font-medium text-green-600">+{metrics.newLeads}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {t("dashboard.executive.leads.conversion", "Конверсия")}
                  </span>
                  <span className="font-medium">{metrics.leadConversionRate.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.executive.leads.stageDistribution", "Распределение по этапам")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t("dashboard.stages.new", "Новые")}</span>
                    <span>{leads.filter((l) => l.stage === "new").length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t("dashboard.stages.contacted", "В работе")}</span>
                    <span>{leads.filter((l) => l.stage === "contacted").length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t("dashboard.stages.closed", "Закрыты")}</span>
                    <span>{leads.filter((l) => l.stage === "closed").length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {t("dashboard.executive.team.activity", "Активность команды")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {t("dashboard.executive.team.activeEmployees", "Активных сотрудников")}
                  </span>
                  <span className="font-medium">{metrics.uniqueEmployees}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {t("dashboard.executive.team.totalActions", "Всего действий")}
                  </span>
                  <span className="font-medium">{metrics.totalActions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {t("dashboard.executive.team.averagePerPerson", "Среднее на человека")}
                  </span>
                  <span className="font-medium">{metrics.avgActionsPerEmployee.toFixed(1)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.executive.team.recommendations", "Рекомендации")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {metrics.conversionRate < 2 && (
                    <div className="p-2 bg-orange-50 border border-orange-200 rounded">
                      <p className="font-medium text-orange-800">
                        {t("dashboard.executive.recommendations.catalogOptimization", "Оптимизация каталога")}
                      </p>
                      <p className="text-orange-700">
                        {t(
                          "dashboard.executive.recommendations.improveDescriptions",
                          "Улучшить описания и изображения товаров",
                        )}
                      </p>
                    </div>
                  )}
                  {metrics.leadConversionRate < 10 && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded">
                      <p className="font-medium text-red-800">
                        {t("dashboard.executive.recommendations.leadManagement", "Работа с лидами")}
                      </p>
                      <p className="text-red-700">
                        {t("dashboard.executive.recommendations.speedUpProcessing", "Ускорить обработку и follow-up")}
                      </p>
                    </div>
                  )}
                  {metrics.avgActionsPerEmployee < 5 && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                      <p className="font-medium text-blue-800">
                        {t("dashboard.executive.recommendations.teamMotivation", "Мотивация команды")}
                      </p>
                      <p className="text-blue-700">
                        {t("dashboard.executive.recommendations.checkProcesses", "Проверить загруженность и процессы")}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExecutiveOverview;
