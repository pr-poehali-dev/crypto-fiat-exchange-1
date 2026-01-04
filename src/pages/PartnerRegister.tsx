import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://functions.poehali.dev/9b14cf78-8c7c-447f-9f9e-fc0f5a8be268';

export default function PartnerRegister() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isLogin ? 'login' : 'register',
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('partner_data', JSON.stringify(data));
        navigate('/partner-dashboard');
      } else {
        setError(data.error || 'Ошибка при входе');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-background to-cyan-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
              Партнерская программа
            </h1>
            <p className="text-muted-foreground">
              {isLogin ? 'Войдите в личный кабинет' : 'Станьте партнером и зарабатывайте'}
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Минимум 6 символов"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Повторите пароль"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                  <Icon name="AlertCircle" size={16} />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Icon name="Loader" size={20} className="animate-spin mr-2" />
                    Загрузка...
                  </>
                ) : (
                  isLogin ? 'Войти' : 'Зарегистрироваться'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-sm text-primary hover:underline"
              >
                {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
              </button>
            </div>
          </Card>

          {!isLogin && (
            <Card className="mt-6 p-6 bg-gradient-to-br from-violet-50 to-cyan-50">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="Gift" size={20} className="text-primary" />
                Условия партнерской программы
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Комиссия 2% от маржинальной прибыли с каждого обмена</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Пользователи закрепляются за вами навсегда</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Начисления за все обмены, включая бесприбыльные операции</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Минимальная сумма выплаты 1000 руб</span>
                </li>
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
