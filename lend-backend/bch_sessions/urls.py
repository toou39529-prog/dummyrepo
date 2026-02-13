from django.urls import path
from . import views

urlpatterns = [
    path('session/create/', views.create_session, name='create-session'),
    path('session/status/<str:session_id>/', views.check_session_status, name='session-status'),
    #path('webhook/', views.paytaca_webhook, name='paytaca-webhook'),
]