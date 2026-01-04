import json
import os
import psycopg2
from datetime import datetime

DSN = os.environ.get('DATABASE_URL')


def handler(event: dict, context) -> dict:
    '''Личный кабинет партнера - статистика, начисления, выплаты'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            action = params.get('action')
            partner_id = params.get('partner_id')
            
            if not partner_id:
                return error_response('Partner ID required', 400)
            
            if action == 'stats':
                return get_partner_stats(int(partner_id))
            elif action == 'earnings':
                return get_partner_earnings(int(partner_id))
            elif action == 'payouts':
                return get_partner_payouts(int(partner_id))
            else:
                return error_response('Invalid action', 400)
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'request_payout':
                return request_payout(body)
            elif action == 'complete_order':
                return complete_order(body)
            else:
                return error_response('Invalid action', 400)
        
        else:
            return error_response('Method not allowed', 405)
            
    except Exception as e:
        return error_response(str(e), 500)


def get_partner_stats(partner_id: int) -> dict:
    '''Получение общей статистики партнера'''
    
    conn = psycopg2.connect(DSN)
    cur = conn.cursor()
    
    try:
        cur.execute(
            "SELECT balance, commission_rate, partner_code FROM partners WHERE id = %s",
            (partner_id,)
        )
        result = cur.fetchone()
        if not result:
            return error_response('Partner not found', 404)
        
        balance, commission_rate, partner_code = result
        
        cur.execute(
            "SELECT COUNT(*) FROM partner_clicks WHERE partner_id = %s",
            (partner_id,)
        )
        total_clicks = cur.fetchone()[0]
        
        cur.execute(
            "SELECT COUNT(*), COALESCE(SUM(to_amount), 0) FROM exchange_orders WHERE partner_id = %s AND status = 'completed'",
            (partner_id,)
        )
        completed_orders, total_volume = cur.fetchone()
        
        cur.execute(
            "SELECT COALESCE(SUM(amount), 0) FROM partner_earnings WHERE partner_id = %s",
            (partner_id,)
        )
        total_earned = cur.fetchone()[0]
        
        cur.execute(
            "SELECT COALESCE(SUM(amount), 0) FROM partner_payouts WHERE partner_id = %s AND status = 'completed'",
            (partner_id,)
        )
        total_paid = cur.fetchone()[0]
        
        return success_response({
            'partner_code': partner_code,
            'balance': float(balance),
            'commission_rate': float(commission_rate),
            'total_clicks': total_clicks,
            'completed_orders': completed_orders,
            'total_volume': float(total_volume),
            'total_earned': float(total_earned),
            'total_paid': float(total_paid)
        })
        
    finally:
        cur.close()
        conn.close()


def get_partner_earnings(partner_id: int) -> dict:
    '''Получение списка начислений партнера'''
    
    conn = psycopg2.connect(DSN)
    cur = conn.cursor()
    
    try:
        cur.execute(
            """SELECT 
                   pe.id, pe.amount, pe.commission_rate, pe.order_amount, 
                   pe.order_direction, pe.earned_at, eo.order_number
               FROM partner_earnings pe
               JOIN exchange_orders eo ON pe.order_id = eo.id
               WHERE pe.partner_id = %s
               ORDER BY pe.earned_at DESC
               LIMIT 100""",
            (partner_id,)
        )
        
        earnings = []
        for row in cur.fetchall():
            earnings.append({
                'id': row[0],
                'amount': float(row[1]),
                'commission_rate': float(row[2]),
                'order_amount': float(row[3]),
                'order_direction': row[4],
                'earned_at': row[5].isoformat() if row[5] else None,
                'order_number': row[6]
            })
        
        return success_response({'earnings': earnings})
        
    finally:
        cur.close()
        conn.close()


def get_partner_payouts(partner_id: int) -> dict:
    '''Получение списка выплат партнера'''
    
    conn = psycopg2.connect(DSN)
    cur = conn.cursor()
    
    try:
        cur.execute(
            """SELECT id, amount, payment_method, status, created_at, processed_at
               FROM partner_payouts
               WHERE partner_id = %s
               ORDER BY created_at DESC
               LIMIT 100""",
            (partner_id,)
        )
        
        payouts = []
        for row in cur.fetchall():
            payouts.append({
                'id': row[0],
                'amount': float(row[1]),
                'payment_method': row[2],
                'status': row[3],
                'created_at': row[4].isoformat() if row[4] else None,
                'processed_at': row[5].isoformat() if row[5] else None
            })
        
        return success_response({'payouts': payouts})
        
    finally:
        cur.close()
        conn.close()


def request_payout(data: dict) -> dict:
    '''Запрос на выплату средств'''
    
    partner_id = data.get('partner_id')
    amount = data.get('amount')
    payment_method = data.get('payment_method')
    payment_details = data.get('payment_details')
    
    if not all([partner_id, amount, payment_method, payment_details]):
        return error_response('Missing required fields', 400)
    
    if float(amount) < 1000:
        return error_response('Минимальная сумма выплаты 1000 руб', 400)
    
    conn = psycopg2.connect(DSN)
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT balance FROM partners WHERE id = %s", (partner_id,))
        result = cur.fetchone()
        if not result:
            return error_response('Partner not found', 404)
        
        balance = float(result[0])
        if balance < float(amount):
            return error_response('Недостаточно средств', 400)
        
        cur.execute(
            """INSERT INTO partner_payouts (partner_id, amount, payment_method, payment_details, status)
               VALUES (%s, %s, %s, %s, 'pending')
               RETURNING id""",
            (partner_id, amount, payment_method, payment_details)
        )
        
        payout_id = cur.fetchone()[0]
        
        cur.execute(
            "UPDATE partners SET balance = balance - %s WHERE id = %s",
            (amount, partner_id)
        )
        
        conn.commit()
        
        return success_response({
            'payout_id': payout_id,
            'message': 'Заявка на выплату создана'
        })
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()


def complete_order(data: dict) -> dict:
    '''Завершение заказа и начисление вознаграждения партнеру'''
    
    order_id = data.get('order_id')
    
    if not order_id:
        return error_response('Order ID required', 400)
    
    conn = psycopg2.connect(DSN)
    cur = conn.cursor()
    
    try:
        cur.execute(
            """SELECT partner_id, from_currency, to_currency, from_amount, to_amount, margin_profit
               FROM exchange_orders
               WHERE id = %s AND status = 'pending'""",
            (order_id,)
        )
        
        result = cur.fetchone()
        if not result:
            return error_response('Order not found or already completed', 404)
        
        partner_id, from_currency, to_currency, from_amount, to_amount, margin_profit = result
        
        if partner_id:
            cur.execute(
                "SELECT commission_rate FROM partners WHERE id = %s",
                (partner_id,)
            )
            commission_rate = float(cur.fetchone()[0])
            
            earning_amount = float(margin_profit) * (commission_rate / 100)
            
            cur.execute(
                """INSERT INTO partner_earnings 
                   (partner_id, order_id, amount, commission_rate, order_amount, order_direction)
                   VALUES (%s, %s, %s, %s, %s, %s)""",
                (partner_id, order_id, earning_amount, commission_rate, 
                 float(to_amount), f"{from_currency} → {to_currency}")
            )
            
            cur.execute(
                "UPDATE partners SET balance = balance + %s WHERE id = %s",
                (earning_amount, partner_id)
            )
        
        cur.execute(
            "UPDATE exchange_orders SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = %s",
            (order_id,)
        )
        
        conn.commit()
        
        return success_response({
            'message': 'Order completed successfully',
            'earning_amount': earning_amount if partner_id else 0
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
