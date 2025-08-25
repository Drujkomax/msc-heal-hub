import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import LogoutButton from '@/components/auth/LogoutButton';
import { useUserRole } from '@/hooks/useUserRole';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import RoleBasedAccess from '@/components/auth/RoleBasedAccess';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { 
  Users, 
  ShoppingBag, 
  BarChart3,
  Home,
  MessageSquare,
  Settings,
  Columns3
} from 'lucide-react';

export function AdminSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { role } = useUserRole();
  const { hasPermission } = useUserPermissions();

  const getNavigationItems = () => {
    const baseItems = [
      { name: t('admin.dashboard'), href: '/admin', icon: BarChart3, permission: null },
      { name: 'Лиды', href: '/admin/leads', icon: Users, permission: null },
      { name: 'Канбан', href: '/admin/kanban', icon: Columns3, permission: null },
    ];

    const conditionalItems = [];

    if (hasPermission('manage_products')) {
      conditionalItems.push({ name: t('admin.products'), href: '/admin/products', icon: ShoppingBag, permission: 'manage_products' });
    }

    if (hasPermission('manage_services')) {
      conditionalItems.push({ name: 'Услуги', href: '/admin/services', icon: Settings, permission: 'manage_services' });
    }

    if (hasPermission('manage_contacts')) {
      conditionalItems.push({ name: t('admin.contacts'), href: '/admin/contacts', icon: MessageSquare, permission: 'manage_contacts' });
    }

    if (role === 'director') {
      conditionalItems.push({ name: 'Сотрудники', href: '/admin/employees', icon: Users, permission: null });
    }

    return [...baseItems, ...conditionalItems];
  };

  const navigation = getNavigationItems();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground font-bold">A</span>
          </div>
          <span className="font-semibold text-lg">{t('admin.title')}</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Навигация</SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.href}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${
                          active
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <LanguageSwitcher />
            <Badge variant="secondary" className="text-xs">
              {role === 'director' ? 'Директор' :
               role === 'sales_manager' ? 'Администратор' :
               role === 'admin' ? 'Администратор' :
               role === 'salesperson' ? 'Продавец' :
               t('admin.role')}
            </Badge>
          </div>
          <Link to="/">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Home className="w-4 h-4 mr-2" />
              {t('admin.toWebsite')}
            </Button>
          </Link>
          <LogoutButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}