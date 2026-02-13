import uuid
from datetime import timedelta
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from wallet.models import WalletSession
from wallet.bch_utils import BCHUtils
from wallet.models import Wallet

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def create_session(request):
    """POST /api/wallet/session/create/ - Create new QR session"""
    
    # Generate unique session ID
    session_id = str(uuid.uuid4())
    
    # Generate auth URL for Paytaca
    auth_url = BCHUtils.generate_auth_url(session_id)
    
    # Create session (expires in 5 minutes)
    session = WalletSession.objects.create(
        session_id=session_id,
        auth_url=auth_url,
        expires_at=timezone.now() + timedelta(minutes=5),
        status='pending'
    )
    
    return JsonResponse({
        'session_id': session.session_id,
        'auth_url': session.auth_url,
        'status': session.status,
        'expires_at': session.expires_at.isoformat()
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def check_session_status(request, session_id):
    """GET /api/wallet/session/status/{session_id}/ - Check connection status"""
    
    try:
        session = WalletSession.objects.get(session_id=session_id)
        
        # Check if expired
        if session.expires_at < timezone.now():
            session.status = 'expired'
            session.save()
            return JsonResponse({
                'authenticated': False,
                'error': 'Session expired'
            })
        
        # Return status
        response = {
            'authenticated': session.status == 'authenticated',
            'status': session.status
        }
        
        if session.status == 'authenticated' and session.wallet_address:
            response['address'] = session.wallet_address
            
        return JsonResponse(response)
        
    except WalletSession.DoesNotExist:
        return JsonResponse({
            'authenticated': False,
            'error': 'Session not found'
        }, status=404)

@csrf_exempt
def paytaca_webhook(request):
    """Webhook for Paytaca to call when QR is scanned"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    import json
    try:
        data = json.loads(request.body)
        session_id = data.get('session')
        address = data.get('address')
        signature = data.get('signature')
        
        if not all([session_id, address, signature]):
            return JsonResponse({'error': 'Missing data'}, status=400)
        
        # Validate address format
        if not BCHUtils.validate_address(address):
            return JsonResponse({'error': 'Invalid address format'}, status=400)
        
        # Find session
        session = WalletSession.objects.get(session_id=session_id)
        
        # Update session
        session.status = 'authenticated'
        session.wallet_address = address
        session.signature = signature
        session.save()
        
        # Create or get user
        user, created = User.objects.get_or_create(
            wallet_address=address,
            defaults={'username': f"user_{address[-8:]}"}
        )
        
        # Create or update wallet
        Wallet.objects.update_or_create(
            user=user,
            defaults={
                'address': address,
                'balance_bch': 0,
                'balance_sats': 0
            }
        )
        
        session.user = user
        session.save()
        
        return JsonResponse({'status': 'success'})
        
    except WalletSession.DoesNotExist:
        return JsonResponse({'error': 'Session not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)