from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

def home(request):
    return HttpResponse("Lend API is running - Connect wallet at /api/wallet/session/create/")

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    path('api/wallet/', include('bch_sessions.urls')),
    path('api/wallet/', include('wallet.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]