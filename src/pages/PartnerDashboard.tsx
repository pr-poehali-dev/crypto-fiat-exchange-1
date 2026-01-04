import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const DASHBOARD_API = 'https://functions.poehali.dev/3f5e4441-9d48-4e84-ad94-358398ecd78a';
const AUTH_API = 'https://functions.poehali.dev/9b14cf78-8c7c-447f-9f9e-fc0f5a8be268';

interface PartnerStats {
  partner_code: string;
  balance: number;
  commission_rate: number;
  total_clicks: number;
  completed_orders: number;
  total_volume: number;
  total_earned: number;
  total_paid: number;
}

interface Earning {
  id: number;
  amount: number;
  commission_rate: number;
  order_amount: number;
  order_direction: string;
  earned_at: string;
  order_number: string;
}

interface Payout {
  id: number;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  processed_at: string | null;
}

export default function PartnerDashboard() {
  const navigate = useNavigate();
  const [partnerId, setPartnerId] = useState<number | null>(null);
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'earnings' | 'payouts' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);

  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    payment_method: 'RUB-SBP',
    payment_details: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    const partnerData = localStorage.getItem('partner_data');
    if (!partnerData) {
      navigate('/partner-register');
      return;
    }

    const data = JSON.parse(partnerData);
    setPartnerId(data.partner_id);
    loadStats(data.partner_id);
    loadEarnings(data.partner_id);
    loadPayouts(data.partner_id);
  }, [navigate]);

  const loadStats = async (id: number) => {
    try {
      const response = await fetch(`${DASHBOARD_API}?action=stats&partner_id=${id}`);
      const data = await response.json();
      if (data.success) {
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEarnings = async (id: number) => {
    try {
      const response = await fetch(`${DASHBOARD_API}?action=earnings&partner_id=${id}`);
      const data = await response.json();
      if (data.success) {
        setEarnings(data.earnings);
      }
    } catch (error) {
      console.error('Failed to load earnings:', error);
    }
  };

  const loadPayouts = async (id: number) => {
    try {
      const response = await fetch(`${DASHBOARD_API}?action=payouts&partner_id=${id}`);
      const data = await response.json();
      if (data.success) {
        setPayouts(data.payouts);
      }
    } catch (error) {
      console.error('Failed to load payouts:', error);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!partnerId) return;

    try {
      const response = await fetch(DASHBOARD_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_payout',
          partner_id: partnerId,
          ...payoutForm
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Заявка на выплату создана');
        loadStats(partnerId);
        loadPayouts(partnerId);
        setPayoutForm({ amount: '', payment_method: 'RUB-SBP', payment_details: '' });
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Ошибка при создании заявки');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('Новые пароли не совпадают');
      return;
    }

    if (!partnerId) return;

    try {
      const response = await fetch(AUTH_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          partner_id: partnerId,
          old_password: passwordForm.old_password,
          new_password: passwordForm.new_password
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Пароль успешно изменен');
        setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Ошибка при смене пароля');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('partner_data');
    navigate('/partner-register');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  const referralLink = stats ? `${window.location.origin}/?ref=${stats.partner_code}` : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-background to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
            Личный кабинет партнера
          </h1>
          <Button variant="outline" onClick={handleLogout}>
            <Icon name="LogOut" size={18} className="mr-2" />
            Выйти
          </Button>
        </div>

        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {(['overview', 'earnings', 'payouts', 'settings'] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' && 'Обзор'}
              {tab === 'earnings' && 'Начисления'}
              {tab === 'payouts' && 'Выплаты'}
              {tab === 'settings' && 'Настройки'}
            </Button>
          ))}
        </div>

        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-violet-100 to-cyan-100">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Ваша партнерская ссылка</Label>
                  <div className="flex gap-2 mt-2">
                    <Input value={referralLink} readOnly className="bg-white" />
                    <Button
                      onClick={() => navigator.clipboard.writeText(referralLink)}
                      variant="outline"
                    >
                      <Icon name="Copy" size={18} />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Код партнера</Label>
                  <div className="text-2xl font-bold mt-1">{stats.partner_code}</div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Icon name="Wallet" size={24} className="text-green-500" />
                  <span className="text-sm text-muted-foreground">Баланс</span>
                </div>
                <div className="text-2xl font-bold">{stats.balance.toFixed(2)} ₽</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Icon name="MousePointerClick" size={24} className="text-blue-500" />
                  <span className="text-sm text-muted-foreground">Переходы</span>
                </div>
                <div className="text-2xl font-bold">{stats.total_clicks}</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Icon name="CheckCircle2" size={24} className="text-violet-500" />
                  <span className="text-sm text-muted-foreground">Обменов</span>
                </div>
                <div className="text-2xl font-bold">{stats.completed_orders}</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Icon name="TrendingUp" size={24} className="text-orange-500" />
                  <span className="text-sm text-muted-foreground">Заработано</span>
                </div>
                <div className="text-2xl font-bold">{stats.total_earned.toFixed(2)} ₽</div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'earnings' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">История начислений</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Дата</th>
                    <th className="text-left py-3 px-2">Заказ</th>
                    <th className="text-left py-3 px-2">Направление</th>
                    <th className="text-right py-3 px-2">Сумма обмена</th>
                    <th className="text-right py-3 px-2">Комиссия</th>
                    <th className="text-right py-3 px-2">Начислено</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((earning) => (
                    <tr key={earning.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">{new Date(earning.earned_at).toLocaleDateString()}</td>
                      <td className="py-3 px-2">{earning.order_number}</td>
                      <td className="py-3 px-2 text-sm">{earning.order_direction}</td>
                      <td className="py-3 px-2 text-right">{earning.order_amount.toFixed(2)}</td>
                      <td className="py-3 px-2 text-right">{earning.commission_rate}%</td>
                      <td className="py-3 px-2 text-right font-semibold text-green-600">
                        +{earning.amount.toFixed(2)} ₽
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {earnings.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  Начислений пока нет
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'payouts' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Заказать выплату</h2>
              <form onSubmit={handleRequestPayout} className="space-y-4">
                <div>
                  <Label>Сумма (мин. 1000 ₽)</Label>
                  <Input
                    type="number"
                    min="1000"
                    step="0.01"
                    value={payoutForm.amount}
                    onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Способ выплаты</Label>
                  <Select
                    value={payoutForm.payment_method}
                    onValueChange={(value) => setPayoutForm({ ...payoutForm, payment_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RUB-SBP">СБП</SelectItem>
                      <SelectItem value="RUB-CARD">Карта РФ</SelectItem>
                      <SelectItem value="USDT-TRC20">USDT TRC20</SelectItem>
                      <SelectItem value="BTC">Bitcoin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Реквизиты для выплаты</Label>
                  <Input
                    placeholder="Номер карты / кошелька"
                    value={payoutForm.payment_details}
                    onChange={(e) => setPayoutForm({ ...payoutForm, payment_details: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Заказать выплату
                </Button>
              </form>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">История выплат</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Дата заявки</th>
                      <th className="text-left py-3 px-2">Способ</th>
                      <th className="text-right py-3 px-2">Сумма</th>
                      <th className="text-center py-3 px-2">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((payout) => (
                      <tr key={payout.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">{new Date(payout.created_at).toLocaleString()}</td>
                        <td className="py-3 px-2">{payout.payment_method}</td>
                        <td className="py-3 px-2 text-right font-semibold">{payout.amount.toFixed(2)} ₽</td>
                        <td className="py-3 px-2 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
                              payout.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : payout.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {payout.status === 'completed' ? 'Выполнена' : payout.status === 'pending' ? 'В обработке' : 'Отклонена'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {payouts.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    Выплат пока нет
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Изменить пароль</h2>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <Label>Текущий пароль</Label>
                <Input
                  type="password"
                  value={passwordForm.old_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Новый пароль</Label>
                <Input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Подтвердите новый пароль</Label>
                <Input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit">Изменить пароль</Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
