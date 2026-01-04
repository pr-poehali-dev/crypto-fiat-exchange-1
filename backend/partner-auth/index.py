import json
import os
import psycopg2
import hashlib
import secrets
from datetime import datetime, timedelta

DSN = os.environ.get('DATABASE_URL')


def handler(event: dict, context) -> dict:
    '''Регистрация и авторизация партнеров'''
    
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
        
        if action == 'register':
            return register_partner(body)
        elif action == 'login':
            return login_partner(body)
        elif action == 'change_password':
            return change_password(body)
        else:
            return error_response('Invalid action', 400)
            
    except Exception as e:
        return error_response(str(e), 500)


def register_partner(data: dict) -> dict:
    '''Регистрация нового партнера'''
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return error_response('Email и пароль обязательны', 400)
    
    if len(password) < 6:
        return error_response('Пароль должен содержать минимум 6 символов', 400)
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    partner_code = generate_partner_code()
    
    conn = psycopg2.connect(DSN)
    cur = conn.cursor()
    
    try:
        cur.execute(
            "SELECT id FROM partners WHERE email = %s",
            (email,)
        )
        if cur.fetchone():
            return error_response('Email уже зарегистрирован', 400)
        
        cur.execute(
            """INSERT INTO partners (email, password_hash, partner_code, balance, commission_rate)
               VALUES (%s, %s, %s, 0, 2.00)
               RETURNING id, partner_code""",
            (email, password_hash, partner_code)
        )
        
        partner_id, partner_code = cur.fetchone()
        conn.commit()
        
        token = generate_token(partner_id)
        
        return success_response({
            'partner_id': partner_id,
            'email': email,
            'partner_code': partner_code,
            'token': token
        })
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()


def login_partner(data: dict) -> dict:
    '''Авторизация партнера'''
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return error_response('Email и пароль обязательны', 400)
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    conn = psycopg2.connect(DSN)
    cur = conn.cursor()
    
    try:
        cur.execute(
            "SELECT id, email, partner_code, balance, commission_rate FROM partners WHERE email = %s AND password_hash = %s",
            (email, password_hash)
        )
        
        result = cur.fetchone()
        if not result:
            return error_response('Неверный email или пароль', 401)
        
        partner_id, email, partner_code, balance, commission_rate = result
        
        token = generate_token(partner_id)
        
        return success_response({
            'partner_id': partner_id,
            'email': email,
            'partner_code': partner_code,
            'balance': float(balance),
            'commission_rate': float(commission_rate),
            'token': token
        })
        
    finally:
        cur.close()
        conn.close()


def change_password(data: dict) -> dict:
    '''Смена пароля партнера'''
    
    partner_id = data.get('partner_id')
    old_password = data.get('old_password', '')
    new_password = data.get('new_password', '')
    
    if not partner_id or not old_password or not new_password:
        return error_response('Все поля обязательны', 400)
    
    if len(new_password) < 6:
        return error_response('Новый пароль должен содержать минимум 6 символов', 400)
    
    old_password_hash = hashlib.sha256(old_password.encode()).hexdigest()
    new_password_hash = hashlib.sha256(new_password.encode()).hexdigest()
    
    conn = psycopg2.connect(DSN)
    cur = conn.cursor()
    
    try:
        cur.execute(
            "SELECT id FROM partners WHERE id = %s AND password_hash = %s",
            (partner_id, old_password_hash)
        )
        
        if not cur.fetchone():
            return error_response('Неверный текущий пароль', 401)
        
        cur.execute(
            "UPDATE partners SET password_hash = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
            (new_password_hash, partner_id)
        )
        
        conn.commit()
        
        return success_response({'message': 'Пароль успешно изменен'})
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()


def generate_partner_code() -> str:
    '''Генерация уникального кода партнера'''
    return 'BC' + secrets.token_hex(6).upper()


def generate_token(partner_id: int) -> str:
    '''Генерация токена для авторизации'''
    return hashlib.sha256(f"{partner_id}:{secrets.token_hex(32)}".encode()).hexdigest()


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
