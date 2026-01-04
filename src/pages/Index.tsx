import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const CRYPTO_CURRENCIES = {
  'Tether TRC20': 'USDT-TRC20',
  'Tether BEP20': 'USDT-BEP20',
  'Tether ERC20': 'USDT-ERC20',
  'Tether ARBITRUM': 'USDT-ARB',
  'Tether TON': 'USDT-TON',
  'Tether POLYGON': 'USDT-MATIC',
  'Bitcoin': 'BTC',
  'Ethereum': 'ETH',
  'Ethereum ARBITRUM': 'ETH-ARB',
  'Ethereum BEP20': 'ETH-BEP20',
  'Tron': 'TRX',
  'USDC ERC20': 'USDC-ERC20',
  'USDC SOL': 'USDC-SOL',
  'USDC POLYGON': 'USDC-MATIC',
  'Ripple': 'XRP',
  'Toncoin': 'TON',
};

const FIAT_CURRENCIES = {
  RUB: {
    'SBP': 'RUB-SBP',
    'Тинькофф': 'RUB-TINKOFF',
    'ВТБ': 'RUB-VTB',
    'Промсвязьбанк': 'RUB-PSB',
    'Сбербанк': 'RUB-SBER',
    'Альфа-банк': 'RUB-ALFA',
    'Райффайзенбанк': 'RUB-RAIF',
    'Почта Банк': 'RUB-POST',
    'МТС Банк': 'RUB-MTS',
    'Газпромбанк': 'RUB-GPB',
  },
  UAH: {
    'Монобанк': 'UAH-MONO',
    'Приват 24': 'UAH-PRIVAT',
    'А-Банк': 'UAH-ABANK',
    'Пумб': 'UAH-PUMB',
    'Izibank': 'UAH-IZI',
    'Sense': 'UAH-SENSE',
    'Bank Transfer': 'UAH-TRANSFER',
  },
  EUR: {
    'Visa/MasterCard': 'EUR-CARD',
    'Revolut': 'EUR-REVOLUT',
    'Wise': 'EUR-WISE',
    'Paysera': 'EUR-PAYSERA',
    'Sepa': 'EUR-SEPA',
  },
  USD: {
    'Revolut': 'USD-REVOLUT',
    'Wise': 'USD-WISE',
    'Visa/MasterCard': 'USD-CARD',
  },
  KZT: {
    'Kaspi Bank': 'KZT-KASPI',
    'Halyk Bank': 'KZT-HALYK',
    'Jusan Bank': 'KZT-JUSAN',
    'Altyn Bank': 'KZT-ALTYN',
    'Freedom Bank': 'KZT-FREEDOM',
  },
};

const MOCK_RATES: { [key: string]: number } = {
  'BTC': 6500000,
  'ETH': 350000,
  'USDT-TRC20': 95,
  'USDT-BEP20': 95,
  'USDT-ERC20': 95,
  'USDT-ARB': 95,
  'USDT-TON': 95,
  'USDT-MATIC': 95,
  'TRX': 15,
  'XRP': 55,
  'TON': 450,
  'USDC-ERC20': 95,
  'USDC-SOL': 95,
  'USDC-MATIC': 95,
  'ETH-ARB': 350000,
  'ETH-BEP20': 350000,
};

const Index = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('exchange');
  const [exchangeMode, setExchangeMode] = useState<'crypto-to-fiat' | 'fiat-to-crypto'>('crypto-to-fiat');
  
  const [fromCurrency, setFromCurrency] = useState('BTC');
  const [toCurrency, setToCurrency] = useState('RUB-SBP');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [telegram, setTelegram] = useState('');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [tagIban, setTagIban] = useState('');

  const calculateExchange = (amount: string, isFromField: boolean) => {
    if (!amount || isNaN(Number(amount))) {
      setToAmount('');
      return;
    }

    const fromRate = MOCK_RATES[fromCurrency] || 1;
    const toRate = MOCK_RATES[toCurrency] || 1;

    if (isFromField) {
      if (exchangeMode === 'crypto-to-fiat') {
        const result = (Number(amount) * fromRate).toFixed(2);
        setToAmount(result);
      } else {
        const result = (Number(amount) / toRate).toFixed(8);
        setToAmount(result);
      }
    }
  };

  useEffect(() => {
    if (fromAmount) {
      calculateExchange(fromAmount, true);
    }
  }, [fromCurrency, toCurrency, exchangeMode]);

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    calculateExchange(value, true);
  };

  const handleSubmit = () => {
    const orderId = Math.floor(100000 + Math.random() * 900000).toString();
    navigate('/order-confirmation', {
      state: {
        orderId,
        type: exchangeMode,
        fromAmount,
        fromCurrency,
        toAmount,
        toCurrency,
        phone,
        fullName,
        telegram,
        email,
        cardNumber,
        tagIban,
      }
    });
  };

  const needsSBPFields = exchangeMode === 'crypto-to-fiat' && toCurrency.startsWith('RUB-SBP');
  const needsCardFields = exchangeMode === 'crypto-to-fiat' && toCurrency.startsWith('UAH-');
  const needsTagIbanUSD = exchangeMode === 'crypto-to-fiat' && toCurrency.startsWith('USD-');
  const needsTagIbanEUR = exchangeMode === 'crypto-to-fiat' && toCurrency.startsWith('EUR-');

  return (
    <div className="min-h-screen bg-background">
      <nav className="glass-effect border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Icon name="ArrowLeftRight" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">ALWAYSCHANGE24</h1>
                <p className="text-xs text-muted-foreground">Обменник криптовалют</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveSection('exchange')}
                className={`px-4 py-2 rounded-lg transition-all font-medium ${
                  activeSection === 'exchange' ? 'gradient-primary text-white' : 'hover:bg-muted'
                }`}
              >
                Обмен
              </button>
              <button
                onClick={() => setActiveSection('rules')}
                className={`px-4 py-2 rounded-lg transition-all font-medium ${
                  activeSection === 'rules' ? 'gradient-primary text-white' : 'hover:bg-muted'
                }`}
              >
                Правила обмена
              </button>
              <button
                onClick={() => setActiveSection('contacts')}
                className={`px-4 py-2 rounded-lg transition-all font-medium ${
                  activeSection === 'contacts' ? 'gradient-primary text-white' : 'hover:bg-muted'
                }`}
              >
                Контакты
              </button>
              <button
                onClick={() => setActiveSection('reviews')}
                className={`px-4 py-2 rounded-lg transition-all font-medium ${
                  activeSection === 'reviews' ? 'gradient-primary text-white' : 'hover:bg-muted'
                }`}
              >
                Отзывы
              </button>
              <button
                onClick={() => setActiveSection('profile')}
                className={`px-4 py-2 rounded-lg transition-all font-medium ${
                  activeSection === 'profile' ? 'gradient-primary text-white' : 'hover:bg-muted'
                }`}
              >
                Профиль
              </button>
            </div>

            <Button className="gradient-secondary">
              <Icon name="MessageCircle" size={18} />
              <span className="ml-2">Чат поддержки</span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        {activeSection === 'exchange' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center space-y-3">
              <h2 className="text-5xl font-bold gradient-primary bg-clip-text text-transparent">
                Обмен криптовалюты
              </h2>
              <p className="text-xl text-muted-foreground">
                Быстро, надежно, выгодно
              </p>
            </div>

            <Card className="glass-effect p-8 space-y-6 border-border/50">
              <div className="flex gap-2 p-1 bg-muted/30 rounded-lg">
                <button
                  onClick={() => setExchangeMode('crypto-to-fiat')}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                    exchangeMode === 'crypto-to-fiat' ? 'gradient-primary text-white' : 'hover:bg-muted'
                  }`}
                >
                  Крипта → Фиат
                </button>
                <button
                  onClick={() => setExchangeMode('fiat-to-crypto')}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                    exchangeMode === 'fiat-to-crypto' ? 'gradient-primary text-white' : 'hover:bg-muted'
                  }`}
                >
                  Фиат → Крипта
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Icon name="Send" size={18} />
                    Отдаёте
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={fromAmount}
                      onChange={(e) => handleFromAmountChange(e.target.value)}
                      className="h-14 text-lg bg-muted/30"
                    />
                    <Select value={fromCurrency} onValueChange={setFromCurrency}>
                      <SelectTrigger className="h-14 bg-muted/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {exchangeMode === 'crypto-to-fiat' ? (
                          Object.entries(CRYPTO_CURRENCIES).map(([label, value]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))
                        ) : (
                          Object.entries(FIAT_CURRENCIES).flatMap(([fiat, methods]) =>
                            Object.entries(methods).map(([method, value]) => (
                              <SelectItem key={value} value={value}>{`${fiat} - ${method}`}</SelectItem>
                            ))
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center">
                    <Icon name="ArrowDown" size={24} className="text-white" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Icon name="TrendingUp" size={18} />
                    Получаете
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={toAmount}
                      readOnly
                      className="h-14 text-lg bg-muted/30 font-bold"
                    />
                    <Select value={toCurrency} onValueChange={setToCurrency}>
                      <SelectTrigger className="h-14 bg-muted/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {exchangeMode === 'crypto-to-fiat' ? (
                          Object.entries(FIAT_CURRENCIES).flatMap(([fiat, methods]) =>
                            Object.entries(methods).map(([method, value]) => (
                              <SelectItem key={value} value={value}>{`${fiat} - ${method}`}</SelectItem>
                            ))
                          )
                        ) : (
                          Object.entries(CRYPTO_CURRENCIES).map(([label, value]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-6 space-y-4">
                  <h3 className="font-semibold text-lg">Данные получателя</h3>
                  
                  {needsSBPFields && (
                    <>
                      <div>
                        <Label>Номер телефона СБП</Label>
                        <Input
                          placeholder="+7 (900) 123-45-67"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="h-12 mt-2"
                        />
                      </div>
                      <div>
                        <Label>ФИО</Label>
                        <Input
                          placeholder="Иванов Иван Иванович"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="h-12 mt-2"
                        />
                      </div>
                    </>
                  )}

                  {needsCardFields && (
                    <>
                      <div>
                        <Label>Номер карты</Label>
                        <Input
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="h-12 mt-2"
                        />
                      </div>
                      <div>
                        <Label>ФИО</Label>
                        <Input
                          placeholder="Іванов Іван Іванович"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="h-12 mt-2"
                        />
                      </div>
                    </>
                  )}

                  {needsTagIbanUSD && (
                    <>
                      <div>
                        <Label>Tag/IBAN/Email</Label>
                        <Input
                          placeholder="Введите реквизиты"
                          value={tagIban}
                          onChange={(e) => setTagIban(e.target.value)}
                          className="h-12 mt-2"
                        />
                      </div>
                      <div>
                        <Label>ФИО</Label>
                        <Input
                          placeholder="John Smith"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="h-12 mt-2"
                        />
                      </div>
                    </>
                  )}

                  {needsTagIbanEUR && (
                    <>
                      <div>
                        <Label>Tag/IBAN</Label>
                        <Input
                          placeholder="DE89370400440532013000"
                          value={tagIban}
                          onChange={(e) => setTagIban(e.target.value)}
                          className="h-12 mt-2"
                        />
                      </div>
                      <div>
                        <Label>ФИО</Label>
                        <Input
                          placeholder="John Smith"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="h-12 mt-2"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <Label>Ваш Telegram</Label>
                    <Input
                      placeholder="@username"
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      className="h-12 mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label>Ваша почта</Label>
                    <Input
                      type="email"
                      placeholder="example@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 mt-2"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!fromAmount || !toAmount || !email || !telegram}
                className="w-full h-14 text-lg font-bold gradient-primary hover:opacity-90"
              >
                <Icon name="CheckCircle" size={22} />
                <span className="ml-2">Создать заявку на обмен</span>
              </Button>
            </Card>

            <Card className="glass-effect p-6 border-primary/30">
              <div className="flex items-center gap-3 mb-4">
                <Icon name="Shield" size={24} className="text-primary" />
                <h3 className="text-xl font-bold">Безопасность и надежность</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle2" size={16} className="text-primary" />
                  <span>AML/KYC проверка</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle2" size={16} className="text-primary" />
                  <span>SSL шифрование</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle2" size={16} className="text-primary" />
                  <span>Партнёр BestChange</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeSection === 'rules' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-4xl font-bold mb-6">Правила обмена</h2>
            <Card className="glass-effect p-8 border-border/50 space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                  <Icon name="FileText" size={24} className="text-primary" />
                  Условия создания заявки
                </h3>
                <ul className="space-y-2 text-muted-foreground ml-8">
                  <li>• Минимальная сумма обмена: 50 USD</li>
                  <li>• Курс фиксируется на 15 минут после создания заявки</li>
                  <li>• Обязательно указание действующего email и Telegram</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                  <Icon name="Clock" size={24} className="text-primary" />
                  Сроки обработки
                </h3>
                <ul className="space-y-2 text-muted-foreground ml-8">
                  <li>• Оплата заявки клиентом: в течение 15 минут</li>
                  <li>• Обработка платежа: 5-30 минут после получения</li>
                  <li>• Выплата средств: моментально после подтверждения</li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                  <Icon name="Shield" size={24} className="text-primary" />
                  AML/KYC политика
                </h3>
                <p className="text-muted-foreground ml-8">
                  Мы проводим проверки в соответствии с международными стандартами. 
                  В редких случаях может потребоваться верификация личности.
                </p>
              </div>
            </Card>
          </div>
        )}

        {activeSection === 'contacts' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-4xl font-bold mb-6">Контакты</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-effect p-8 border-border/50">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Icon name="MessageCircle" size={24} className="text-primary" />
                  Онлайн-чат
                </h3>
                <p className="text-muted-foreground mb-4">
                  Доступен 24/7 для быстрого решения вопросов
                </p>
                <Button className="gradient-primary w-full">
                  <Icon name="Send" size={18} />
                  <span className="ml-2">Открыть чат</span>
                </Button>
              </Card>

              <Card className="glass-effect p-8 border-border/50">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Icon name="Mail" size={24} className="text-primary" />
                  Email
                </h3>
                <p className="text-muted-foreground mb-2">support@alwayschange24.com</p>
                <p className="text-sm text-muted-foreground">Ответ в течение 1 часа</p>
              </Card>

              <Card className="glass-effect p-8 border-border/50">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Icon name="Phone" size={24} className="text-primary" />
                  Telegram
                </h3>
                <Button variant="outline" className="w-full">
                  <Icon name="Send" size={18} />
                  <span className="ml-2">Написать в Telegram</span>
                </Button>
              </Card>

              <Card className="glass-effect p-8 border-border/50">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Icon name="Clock" size={24} className="text-primary" />
                  Режим работы
                </h3>
                <p className="text-2xl font-bold text-primary">24/7</p>
                <p className="text-muted-foreground">Круглосуточная поддержка</p>
              </Card>
            </div>
          </div>
        )}

        {activeSection === 'reviews' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-4xl font-bold mb-6">Отзывы клиентов</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="glass-effect p-6 border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                      <Icon name="User" size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold">Клиент #{i}</h4>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Icon key={star} name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground">
                        Отличный сервис! Быстрый обмен, выгодный курс, отзывчивая поддержка.
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-4xl font-bold mb-6">Профиль</h2>
            <Card className="glass-effect p-8 border-border/50 text-center">
              <Icon name="User" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground">Войдите для доступа к профилю</p>
              <Button className="mt-6 gradient-primary">
                <Icon name="LogIn" size={18} />
                <span className="ml-2">Войти</span>
              </Button>
            </Card>
          </div>
        )}
      </div>

      <footer className="glass-effect border-t border-border/50 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Наши партнёры</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors">BestChange</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Binance</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Bybit</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Информация</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors">Политика AML</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Статьи</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Каталог направлений обмена</li>
              </ul>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                  <Icon name="ArrowLeftRight" size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">ALWAYSCHANGE24</h3>
                  <p className="text-xs text-muted-foreground">© 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
