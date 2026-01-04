import json
import os
import psycopg2
from datetime import datetime

DSN = os.environ.get('DATABASE_URL')


def handler(event: dict, context) -> dict:
    '''Отслеживание переходов по партнерским ссылкам и создание заявок'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return error_response('Method not allowed', 405)
    
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        if action == 'track_click':
            return track_click(body, event)
        elif action == 'create_order':
            return create_order(body)
        else:
            return error_response('Invalid action', 400)
            
    except Exception as e:
        return error_response(str(e), 500)


def track_click(data: dict, event: dict) -> dict:
    '''Отслеживание перехода по партнерской ссылке'''
    
    partner_code = data.get('partner_code')
    from_currency = data.get('from_currency', '')
    to_currency = data.get('to_currency', '')
    city = data.get('city', '')
    
    if not partner_code:
        return error_response('Partner code is required', 400)
    
    ip_address = event.get('requestContext', {}).get('identity', {}).get('sourceIp', '')
    user_agent = event.get('headers', {}).get('user-agent', '')
    
    conn = psycopg2.connect(DSN)
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT id FROM partners WHERE partner_code = %s", (partner_code,))
        result = cur.fetchone()
        
        if not result:
            return error_response('Partner not found', 404)
        
        partner_id = result[0]
        
        cur.execute(
            """INSERT INTO partner_clicks (partner_id, ip_address, user_agent, from_currency, to_currency, city)
               VALUES (%s, %s, %s, %s, %s, %s)
               RETURNING id""",
            (partner_id, ip_address, user_agent, from_currency, to_currency, city)
        )
        
        click_id = cur.fetchone()[0]
        conn.commit()
        
        return success_response({
            'click_id': click_id,
            'partner_id': partner_id,
            'from_currency': from_currency,
            'to_currency': to_currency
        })
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()


def create_order(data: dict) -> dict:
    '''Создание заявки на обмен с привязкой к партнеру'''
    
    partner_id = data.get('partner_id')
    from_currency = data.get('from_currency')
    to_currency = data.get('to_currency')
    from_amount = data.get('from_amount')
    to_amount = data.get('to_amount')
    exchange_rate = data.get('exchange_rate')
    margin_profit = data.get('margin_profit', 0)
    customer_email = data.get('customer_email', '')
    customer_contact = data.get('customer_contact', '')
    wallet_address = data.get('wallet_address', '')
    card_number = data.get('card_number', '')
    
    if not all([from_currency, to_currency, from_amount, to_amount, exchange_rate]):
        return error_response('Missing required fields', 400)
    
    import secrets
    order_number = f"EX{secrets.token_hex(6).upper()}"
    
    conn = psycopg2.connect(DSN)
    cur = conn.cursor()
    
    try:
        cur.execute(
            """INSERT INTO exchange_orders 
               (partner_id, order_number, from_currency, to_currency, from_amount, to_amount, 
                exchange_rate, margin_profit, customer_email, customer_contact, wallet_address, card_number, status)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending')
               RETURNING id, order_number""",
            (partner_id, order_number, from_currency, to_currency, from_amount, to_amount,
             exchange_rate, margin_profit, customer_email, customer_contact, wallet_address, card_number)
        )
        
        order_id, order_number = cur.fetchone()
        conn.commit()
        
        return success_response({
            'order_id': order_id,
            'order_number': order_number,
            'status': 'pending'
        })
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()


def success_response(data: dict) -> dict:
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'success': True, **data})
    }


def error_response(message: str, status_code: int = 400) -> dict:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'success': False, 'error': message})
    }
