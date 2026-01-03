import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('confirmation');

  const orderData = location.state || {
    orderId: '000000',
    type: 'crypto-to-fiat',
    fromAmount: '0',
    fromCurrency: 'BTC',
    toAmount: '0',
    toCurrency: 'RUB',
    walletAddress: ''
  };

  const isCryptoToFiat = orderData.type === 'crypto-to-fiat';

  const handleCancel = () => {
    navigate('/');
  };

  const handleProceed = () => {
    if (isCryptoToFiat) {
      setCurrentStep('payment');
    } else {
      setCurrentStep('awaiting-payment');
    }
  };

  const handlePaid = () => {
    setCurrentStep('payment-confirmed');
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
            <Button variant="outline" onClick={() => navigate('/')}>
              <Icon name="Home" size={18} />
              <span className="ml-2">На главную</span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        {currentStep === 'confirmation' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle" size={40} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Заявка создана</h1>
              <p className="text-xl text-muted-foreground">Номер заявки: #{orderData.orderId}</p>
            </div>

            <Card className="glass-effect p-8 space-y-6 border-border/50">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Отдаёте</div>
                  <div className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
                    {orderData.fromAmount} {orderData.fromCurrency}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Получаете</div>
                  <div className="text-3xl font-bold gradient-secondary bg-clip-text text-transparent">
                    {orderData.toAmount} {orderData.toCurrency}
                  </div>
                </div>
              </div>

              <div className="border-t border-border/50 pt-6">
                <div className="text-sm text-muted-foreground mb-2">
                  {isCryptoToFiat ? 'Счёт получения' : 'Адрес кошелька'}
                </div>
                <div className="p-4 bg-muted/30 rounded-lg font-mono text-sm break-all">
                  {orderData.walletAddress}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 h-14 border-destructive/50 hover:bg-destructive/10"
                >
                  <Icon name="X" size={20} />
                  <span className="ml-2">Отменить заявку</span>
                </Button>
                <Button
                  onClick={handleProceed}
                  className="flex-1 h-14 gradient-primary hover:opacity-90"
                >
                  <Icon name="ArrowRight" size={20} />
                  <span className="ml-2">Перейти к оплате</span>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {currentStep === 'payment' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Оплата заявки</h1>
              <p className="text-xl text-muted-foreground">Заявка #{orderData.orderId}</p>
            </div>

            <Card className="glass-effect p-8 space-y-6 border-border/50">
              <div className="text-center space-y-4">
                <div className="text-sm text-muted-foreground">Отправьте криптовалюту на адрес</div>
                <div className="p-6 bg-muted/30 rounded-xl">
                  <div className="w-48 h-48 mx-auto mb-4 bg-white rounded-xl p-4 flex items-center justify-center">
                    <div className="text-xs text-gray-800 font-mono break-all">
                      QR-код<br/>для оплаты
                    </div>
                  </div>
                  <div className="font-mono text-sm break-all bg-background/50 p-4 rounded-lg">
                    bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">Сумма</div>
                    <div className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
                      {orderData.fromAmount} {orderData.fromCurrency}
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">Кошелёк</div>
                    <div className="text-xl font-bold">{orderData.fromCurrency}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 h-14 border-destructive/50 hover:bg-destructive/10"
                >
                  <Icon name="X" size={20} />
                  <span className="ml-2">Отменить</span>
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  className="flex-1 h-14 gradient-primary hover:opacity-90"
                >
                  <Icon name="Check" size={20} />
                  <span className="ml-2">Оплачено</span>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {currentStep === 'awaiting-payment' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Заявка принята</h1>
              <p className="text-xl text-muted-foreground">Заявка #{orderData.orderId}</p>
            </div>

            <Card className="glass-effect p-8 space-y-6 border-border/50">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Отдаёте</div>
                  <div className="text-2xl font-bold">
                    {orderData.fromAmount} {orderData.fromCurrency}
                  </div>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Получаете</div>
                  <div className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                    {orderData.toAmount} {orderData.toCurrency}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-accent/10 border border-accent/30 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <Icon name="MessageCircle" size={24} className="text-accent" />
                  <div className="text-lg font-semibold">Обратитесь в чат для получения реквизитов</div>
                </div>
                <p className="text-muted-foreground">
                  Наш оператор предоставит вам реквизиты для оплаты заявки
                </p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
                  <div className="text-sm font-semibold">Статус заявки</div>
                </div>
                <div className="text-lg">Ожидает оплаты клиентом</div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="h-14 border-destructive/50 hover:bg-destructive/10"
                >
                  <Icon name="X" size={20} />
                  <span className="ml-2">Отменить заявку</span>
                </Button>
                <Button
                  onClick={handlePaid}
                  className="h-14 gradient-primary hover:opacity-90"
                >
                  <Icon name="Check" size={20} />
                  <span className="ml-2">Я оплатил заявку</span>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {currentStep === 'payment-confirmed' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                <Icon name="Check" size={40} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Спасибо за подтверждение!</h1>
              <p className="text-xl text-muted-foreground">Заявка #{orderData.orderId}</p>
            </div>

            <Card className="glass-effect p-8 space-y-6 border-border/50">
              <div className="p-6 bg-primary/10 border border-primary/30 rounded-xl text-center space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <Icon name="CheckCircle" size={32} className="text-primary" />
                  <div className="text-2xl font-bold">Статус: Получено подтверждение</div>
                </div>
                <p className="text-muted-foreground">
                  Клиент подтвердил оплату заявки. Наша команда проверяет транзакцию.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground">Сумма оплаты</div>
                  <div className="text-xl font-bold">
                    {orderData.fromAmount} {orderData.fromCurrency}
                  </div>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground">К получению</div>
                  <div className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
                    {orderData.toAmount} {orderData.toCurrency}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate('/')}
                className="w-full h-14 gradient-primary hover:opacity-90"
              >
                <Icon name="Home" size={20} />
                <span className="ml-2">Вернуться на главную</span>
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmation;
