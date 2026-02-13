# wallet/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Session management
    path('session/create/', views.create_session, name='create-session'),
    path('session/status/<str:session_id>/', views.check_session_status, name='session-status'),
    path('session/authenticate/<str:session_id>/', views.authenticate_session, name='authenticate-session'),
    
    # Wallet operations
    path('balance/', views.get_wallet_balance, name='wallet-balance'),
    
    # Webhook for Paytaca notifications
    path('webhook/', views.paytaca_webhook, name='paytaca-webhook'),
]