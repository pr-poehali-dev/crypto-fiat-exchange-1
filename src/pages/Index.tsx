import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('crypto-to-fiat');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('BTC');
  const [toCurrency, setToCurrency] = useState('RUB');
  const [walletAddress, setWalletAddress] = useState('');
  const [activeSection, setActiveSection] = useState('exchange');

  const cryptoCurrencies = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL'];
  const fiatCurrencies = ['RUB', 'USD', 'EUR', 'KZT'];

  const handleExchange = () => {
    const orderId = Math.floor(100000 + Math.random() * 900000).toString();
    
    navigate('/order-confirmation', {
      state: {
        orderId,
        type: activeTab,
        fromAmount,
        fromCurrency,
        toAmount,
        toCurrency,
        walletAddress
      }
    });
  };

  const calculateRate = () => {
    if (!fromAmount || isNaN(Number(fromAmount))) return;
    
    const rates: { [key: string]: number } = {
      'BTC-RUB': 6500000,
      'ETH-RUB': 350000,
      'USDT-RUB': 95,
      'BNB-RUB': 45000,
      'SOL-RUB': 18000,
      'BTC-USD': 68000,
      'ETH-USD': 3700,
      'USDT-USD': 1,
      'BNB-USD': 475,
      'SOL-USD': 190,
    };

    const rateKey = `${fromCurrency}-${toCurrency}`;
    const rate = rates[rateKey] || 1;
    
    if (activeTab === 'crypto-to-fiat') {
      setToAmount((Number(fromAmount) * rate).toFixed(2));
    } else {
      setToAmount((Number(fromAmount) / rate).toFixed(8));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="glass-effect border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Icon name="ArrowLeftRight" size={20} className="text-white" />
              </div>
              <span className="text-2xl font-bold">CryptoExchange</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setActiveSection('exchange')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeSection === 'exchange' ? 'gradient-primary text-white' : 'hover:bg-muted'
                }`}
              >
                <Icon name="ArrowLeftRight" size={18} />
                <span className="font-medium">Обмен</span>
              </button>
              <button
                onClick={() => setActiveSection('orders')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeSection === 'orders' ? 'gradient-primary text-white' : 'hover:bg-muted'
                }`}
              >
                <Icon name="FileText" size={18} />
                <span className="font-medium">Заявки</span>
              </button>
              <button
                onClick={() => setActiveSection('history')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeSection === 'history' ? 'gradient-primary text-white' : 'hover:bg-muted'
                }`}
              >
                <Icon name="History" size={18} />
                <span className="font-medium">История</span>
              </button>
              <button
                onClick={() => setActiveSection('profile')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeSection === 'profile' ? 'gradient-primary text-white' : 'hover:bg-muted'
                }`}
              >
                <Icon name="User" size={18} />
                <span className="font-medium">Профиль</span>
              </button>
              <button
                onClick={() => setActiveSection('support')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeSection === 'support' ? 'gradient-primary text-white' : 'hover:bg-muted'
                }`}
              >
                <Icon name="MessageCircle" size={18} />
                <span className="font-medium">Поддержка</span>
              </button>
            </div>

            <Button className="gradient-primary">
              <Icon name="Wallet" size={18} />
              <span className="ml-2">Подключить</span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        {activeSection === 'exchange' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-bold gradient-primary bg-clip-text text-transparent">
                Быстрый обмен криптовалют
              </h1>
              <p className="text-xl text-muted-foreground">
                Выгодный курс, мгновенные переводы, безопасность
              </p>
            </div>

            <Card className="glass-effect p-8 space-y-6 animate-scale-in border-border/50">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                  <TabsTrigger value="crypto-to-fiat" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
                    <Icon name="TrendingDown" size={18} />
                    <span className="ml-2">Крипта → Фиат</span>
                  </TabsTrigger>
                  <TabsTrigger value="fiat-to-crypto" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
                    <Icon name="TrendingUp" size={18} />
                    <span className="ml-2">Фиат → Крипта</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="crypto-to-fiat" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Icon name="Send" size={16} />
                        Отдаёте
                      </Label>
                      <div className="flex gap-3">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={fromAmount}
                          onChange={(e) => setFromAmount(e.target.value)}
                          onBlur={calculateRate}
                          className="flex-1 h-14 text-lg bg-muted/30 border-border/50"
                        />
                        <Select value={fromCurrency} onValueChange={setFromCurrency}>
                          <SelectTrigger className="w-32 h-14 bg-muted/30 border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {cryptoCurrencies.map((currency) => (
                              <SelectItem key={currency} value={currency}>
                                {currency}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                        <Icon name="ArrowDown" size={24} className="text-white" />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Icon name="Wallet" size={16} />
                        Получаете
                      </Label>
                      <div className="flex gap-3">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={toAmount}
                          readOnly
                          className="flex-1 h-14 text-lg bg-muted/30 border-border/50"
                        />
                        <Select value={toCurrency} onValueChange={setToCurrency}>
                          <SelectTrigger className="w-32 h-14 bg-muted/30 border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fiatCurrencies.map((currency) => (
                              <SelectItem key={currency} value={currency}>
                                {currency}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Icon name="CreditCard" size={16} />
                        Счёт получения фиата
                      </Label>
                      <Input
                        placeholder="Введите номер карты или счёта"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="h-14 bg-muted/30 border-border/50"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="fiat-to-crypto" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Icon name="Send" size={16} />
                        Отдаёте
                      </Label>
                      <div className="flex gap-3">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={fromAmount}
                          onChange={(e) => setFromAmount(e.target.value)}
                          onBlur={calculateRate}
                          className="flex-1 h-14 text-lg bg-muted/30 border-border/50"
                        />
                        <Select value={fromCurrency} onValueChange={setFromCurrency}>
                          <SelectTrigger className="w-32 h-14 bg-muted/30 border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fiatCurrencies.map((currency) => (
                              <SelectItem key={currency} value={currency}>
                                {currency}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <div className="w-12 h-12 rounded-full gradient-secondary flex items-center justify-center">
                        <Icon name="ArrowDown" size={24} className="text-white" />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Icon name="Wallet" size={16} />
                        Получаете
                      </Label>
                      <div className="flex gap-3">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={toAmount}
                          readOnly
                          className="flex-1 h-14 text-lg bg-muted/30 border-border/50"
                        />
                        <Select value={toCurrency} onValueChange={setToCurrency}>
                          <SelectTrigger className="w-32 h-14 bg-muted/30 border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {cryptoCurrencies.map((currency) => (
                              <SelectItem key={currency} value={currency}>
                                {currency}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Icon name="Wallet" size={16} />
                        Кошелёк для получения криптовалюты
                      </Label>
                      <Input
                        placeholder="Введите адрес кошелька"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="h-14 bg-muted/30 border-border/50"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                onClick={handleExchange}
                disabled={!fromAmount || !toAmount || !walletAddress}
                className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity"
              >
                <Icon name="ArrowRight" size={20} />
                <span className="ml-2">Создать заявку</span>
              </Button>
            </Card>

            <Card className="glass-effect p-6 border-border/50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl gradient-secondary flex-shrink-0 flex items-center justify-center">
                  <Icon name="Users" size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Реферальная программа</h3>
                  <p className="text-muted-foreground mb-4">
                    Приглашайте друзей и получайте <span className="text-primary font-semibold">0.5%</span> от каждой их сделки
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex-1 min-w-[200px] p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="text-sm text-muted-foreground">Приглашено друзей</div>
                      <div className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">0</div>
                    </div>
                    <div className="flex-1 min-w-[200px] p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="text-sm text-muted-foreground">Заработано</div>
                      <div className="text-2xl font-bold gradient-secondary bg-clip-text text-transparent">0 ₽</div>
                    </div>
                  </div>
                  <Button className="mt-4 gradient-secondary">
                    <Icon name="Share2" size={18} />
                    <span className="ml-2">Получить реферальную ссылку</span>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeSection === 'orders' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold mb-6">Мои заявки</h2>
            <Card className="glass-effect p-8 border-border/50 text-center">
              <Icon name="FileText" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground">У вас пока нет активных заявок</p>
            </Card>
          </div>
        )}

        {activeSection === 'history' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold mb-6">История операций</h2>
            <Card className="glass-effect p-8 border-border/50 text-center">
              <Icon name="History" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground">История операций пуста</p>
            </Card>
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold mb-6">Профиль</h2>
            <Card className="glass-effect p-8 border-border/50 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
                  <Icon name="User" size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Пользователь</h3>
                  <p className="text-muted-foreground">user@example.com</p>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="text-sm text-muted-foreground">Всего операций</div>
                  <div className="text-2xl font-bold">0</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="text-sm text-muted-foreground">Общий объём</div>
                  <div className="text-2xl font-bold">0 ₽</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeSection === 'support' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold mb-6">Поддержка</h2>
            <Card className="glass-effect p-8 border-border/50 space-y-6">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto">
                  <Icon name="MessageCircle" size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold">Чат с поддержкой</h3>
                <p className="text-muted-foreground">Наша команда готова помочь вам 24/7</p>
              </div>
              <Button className="w-full h-14 gradient-primary">
                <Icon name="Send" size={20} />
                <span className="ml-2">Открыть чат</span>
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
