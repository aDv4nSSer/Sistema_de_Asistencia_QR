# app/limiter.py
from slowapi import Limiter
from slowapi.util import get_remote_address

# Esta función le dice al limiter que agrupe las peticiones por dirección IP
limiter = Limiter(key_func=get_remote_address)