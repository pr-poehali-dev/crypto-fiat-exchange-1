import json
import urllib.request
import urllib.error
from typing import Dict, Any


def handler(event: dict, context) -> dict:
    '''Получает актуальные курсы криптовалют и фиатных валют'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        crypto_rates = fetch_crypto_rates()
        fiat_rates = fetch_fiat_rates()
        
        rates = {**crypto_rates, **fiat_rates}
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=60'
            },
            'body': json.dumps({
                'success': True,
                'rates': rates,
                'timestamp': context.request_time_epoch if hasattr(context, 'request_time_epoch') else None
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': str(e)
            })
        }


def fetch_crypto_rates() -> Dict[str, float]:
    '''Получает курсы криптовалют к RUB через CoinGecko API'''
    
    crypto_ids = {
        'bitcoin': 'BTC',
        'ethereum': 'ETH',
        'tether': 'USDT',
        'tron': 'TRX',
        'ripple': 'XRP',
        'the-open-network': 'TON',
        'usd-coin': 'USDC'
    }
    
    ids_param = ','.join(crypto_ids.keys())
    url = f'https://api.coingecko.com/api/v3/simple/price?ids={ids_param}&vs_currencies=rub'
    
    req = urllib.request.Request(url)
    req.add_header('Accept', 'application/json')
    
    with urllib.request.urlopen(req, timeout=10) as response:
        data = json.loads(response.read().decode())
    
    rates = {}
    for coin_id, symbol in crypto_ids.items():
        if coin_id in data and 'rub' in data[coin_id]:
            rate = data[coin_id]['rub']
            rates[symbol] = rate
            
            if symbol == 'USDT':
                rates['USDT-TRC20'] = rate
                rates['USDT-BEP20'] = rate
                rates['USDT-ERC20'] = rate
                rates['USDT-ARB'] = rate
                rates['USDT-TON'] = rate
                rates['USDT-MATIC'] = rate
            elif symbol == 'ETH':
                rates['ETH-ARB'] = rate
                rates['ETH-BEP20'] = rate
            elif symbol == 'USDC':
                rates['USDC-ERC20'] = rate
                rates['USDC-SOL'] = rate
                rates['USDC-MATIC'] = rate
    
    return rates


def fetch_fiat_rates() -> Dict[str, float]:
    '''Получает курсы фиатных валют к RUB через exchangerate-api'''
    
    url = 'https://api.exchangerate-api.com/v4/latest/RUB'
    
    req = urllib.request.Request(url)
    req.add_header('Accept', 'application/json')
    
    with urllib.request.urlopen(req, timeout=10) as response:
        data = json.loads(response.read().decode())
    
    rates_data = data.get('rates', {})
    
    fiat_rates = {}
    
    if 'USD' in rates_data:
        usd_rate = 1 / rates_data['USD']
        fiat_rates['USD-REVOLUT'] = usd_rate
        fiat_rates['USD-WISE'] = usd_rate
        fiat_rates['USD-CARD'] = usd_rate
    
    if 'EUR' in rates_data:
        eur_rate = 1 / rates_data['EUR']
        fiat_rates['EUR-CARD'] = eur_rate
        fiat_rates['EUR-REVOLUT'] = eur_rate
        fiat_rates['EUR-WISE'] = eur_rate
        fiat_rates['EUR-PAYSERA'] = eur_rate
        fiat_rates['EUR-SEPA'] = eur_rate
    
    if 'KZT' in rates_data:
        kzt_rate = 1 / rates_data['KZT']
        fiat_rates['KZT-KASPI'] = kzt_rate
        fiat_rates['KZT-HALYK'] = kzt_rate
        fiat_rates['KZT-JUSAN'] = kzt_rate
        fiat_rates['KZT-ALTYN'] = kzt_rate
        fiat_rates['KZT-FREEDOM'] = kzt_rate
    
    if 'UAH' in rates_data:
        uah_rate = 1 / rates_data['UAH']
        fiat_rates['UAH-MONO'] = uah_rate
        fiat_rates['UAH-PRIVAT'] = uah_rate
        fiat_rates['UAH-ABANK'] = uah_rate
        fiat_rates['UAH-PUMB'] = uah_rate
        fiat_rates['UAH-IZI'] = uah_rate
        fiat_rates['UAH-SENSE'] = uah_rate
        fiat_rates['UAH-TRANSFER'] = uah_rate
    
    fiat_rates['RUB-SBP'] = 1
    fiat_rates['RUB-TINKOFF'] = 1
    fiat_rates['RUB-VTB'] = 1
    fiat_rates['RUB-PSB'] = 1
    fiat_rates['RUB-SBER'] = 1
    fiat_rates['RUB-ALFA'] = 1
    fiat_rates['RUB-RAIF'] = 1
    fiat_rates['RUB-POST'] = 1
    fiat_rates['RUB-MTS'] = 1
    fiat_rates['RUB-GPB'] = 1
    
    return fiat_rates
