import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AuthPageProps {
  onSuccess?: () => void;
}

const AuthPage = ({ onSuccess }: AuthPageProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  // Signup form state
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'salesperson'
  });
  
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) {
        setError(getErrorMessage(error.message));
        toast({
          variant: 'destructive',
          title: 'Ошибка входа',
          description: getErrorMessage(error.message),
        });
      } else {
        toast({
          title: 'Успешно',
          description: 'Вход выполнен успешно',
        });
        onSuccess?.();
      }
    } catch (err) {
      const errorMessage = 'Произошла ошибка при входе';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (signupForm.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role: signupForm.role
          }
        }
      });

      if (error) {
        setError(getErrorMessage(error.message));
        toast({
          variant: 'destructive',
          title: 'Ошибка регистрации',
          description: getErrorMessage(error.message),
        });
      } else {
        // После успешной регистрации добавляем роль в базу данных
        if (data.user) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: data.user.id,
              role: signupForm.role as 'admin' | 'salesperson' | 'sales_manager' | 'director'
            });

          if (roleError) {
            console.error('Error adding user role:', roleError);
          }
        }

        toast({
          title: 'Регистрация успешна',
          description: 'Проверьте почту для подтверждения аккаунта',
        });
        
        // Переключаемся на вкладку входа
        setActiveTab('login');
        setSignupForm({
          email: '',
          password: '',
          confirmPassword: '',
          role: 'salesperson'
        });
      }
    } catch (err) {
      const errorMessage = 'Произошла ошибка при регистрации';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (error: string): string => {
    const errorMessages: { [key: string]: string } = {
      'Invalid login credentials': 'Неверный email или пароль',
      'Email not confirmed': 'Email не подтвержден. Проверьте почту',
      'User already registered': 'Пользователь с таким email уже зарегистрирован',
      'Password should be at least 6 characters': 'Пароль должен содержать минимум 6 символов',
      'Invalid email': 'Неверный формат email',
      'Signup is disabled': 'Регистрация отключена',
    };

    return errorMessages[error] || error;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Med Service Centre</CardTitle>
          <CardDescription>
            Войдите или зарегистрируйтесь для доступа к системе
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Вход
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Регистрация
              </TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Пароль</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Введите пароль"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Войти
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Пароль</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Минимум 6 символов"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Подтвердите пароль</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Повторите пароль"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Роль</Label>
                  <Select 
                    value={signupForm.role} 
                    onValueChange={(value) => setSignupForm(prev => ({ ...prev, role: value }))}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="salesperson">Продавец</SelectItem>
                      <SelectItem value="sales_manager">Менеджер продаж</SelectItem>
                      <SelectItem value="admin">Администратор</SelectItem>
                      <SelectItem value="director">Директор</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Зарегистрироваться
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;