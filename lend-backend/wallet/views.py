# wallet/views.py
# PAYTACA-COMPATIBLE VERSION

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from datetime import timedelta
import json
import secrets
from wallet.models import WalletSession

# Your app's callback URL (update this to your actual domain)
CALLBACK_BASE_URL = "http://localhost:8000/api/wallet"

@csrf_exempt
@require_http_methods(["POST"])
def create_session(request):
    """
    Create a new wallet connection session with Paytaca deep link
    """
    try:
        # Generate unique session ID
        session_id = secrets.token_urlsafe(32)
        
        # Create Paytaca deep link format
        # Format: paytaca://connect?callback=<url>&session=<id>&message=<msg>
        callback_url = f"{CALLBACK_BASE_URL}/webhook/"
        message = "Connect to Lend Platform"
        
        # Paytaca deep link (for mobile)
        paytaca_deeplink = f"paytaca://connect?callback={callback_url}&session={session_id}&message={message}"
        
        # For desktop QR scanning, we'll use a simpler auth URL
        # This should work with Paytaca's QR scanner
        auth_url = f"bitcoincash:?action=auth&callback={callback_url}&session={session_id}&message={message}"
        
        # Create session in database
        session = WalletSession.objects.create(
            session_id=session_id,
            auth_url=auth_url,
            status='pending',
            expires_at=timezone.now() + timedelta(minutes=5)
        )
        
        return JsonResponse({
            'success': True,
            'session_id': session_id,
            'auth_url': auth_url,  # For QR code
            'deeplink': paytaca_deeplink,  # For direct app opening
            'expires_in': 300,
            'message': 'Scan this QR code with Paytaca wallet'
        })
        
    except Exception as e:
        print(f"Error creating session: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_http_methods(["GET"])
def check_session_status(request, session_id):
    """
    Check the status of a wallet connection session
    """
    try:
        session = WalletSession.objects.get(session_id=session_id)
        
        if session.expires_at < timezone.now():
            session.status = 'expired'
            session.save()
        
        response_data = {
            'success': True,
            'session_id': session_id,
            'status': session.status,
            'wallet_address': session.wallet_address,
        }
        
        if session.status == 'authenticated':
            response_data['user_id'] = session.user.id if session.user else None
            response_data['authenticated_at'] = session.updated_at.isoformat()
        
        return JsonResponse(response_data)
        
    except WalletSession.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Session not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def authenticate_session(request, session_id):
    """
    Authenticate a session after wallet connection
    """
    try:
        data = json.loads(request.body)
        wallet_address = data.get('wallet_address')
        signature = data.get('signature')
        
        if not wallet_address:
            return JsonResponse({
                'success': False,
                'error': 'Wallet address is required'
            }, status=400)
        
        session = WalletSession.objects.get(session_id=session_id)
        
        if session.expires_at < timezone.now():
            return JsonResponse({
                'success': False,
                'error': 'Session expired'
            }, status=400)
        
        session.wallet_address = wallet_address
        session.signature = signature
        session.status = 'authenticated'
        session.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Wallet authenticated successfully',
            'wallet_address': wallet_address
        })
        
    except WalletSession.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Session not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_http_methods(["GET"])
def get_wallet_balance(request):
    """
    Get BCH balance for authenticated wallet
    """
    try:
        wallet_address = request.GET.get('address')
        
        if not wallet_address:
            return JsonResponse({
                'success': False,
                'error': 'Wallet address required'
            }, status=400)
        
        import requests
        
        clean_address = wallet_address.replace('bitcoincash:', '')
        
        # Try multiple APIs for reliability
        apis = [
            f"https://rest.bitcoin.com/v2/address/details/{clean_address}",
            f"https://api.fullstack.cash/v5/electrumx/balance/{clean_address}",
        ]
        
        for api_url in apis:
            try:
                response = requests.get(api_url, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    
                    # Parse based on API response format
                    if 'balance' in data:
                        # Bitcoin.com format
                        balance_satoshis = data.get('balance', 0) + data.get('unconfirmedBalance', 0)
                    else:
                        # FullStack.cash format
                        balance_satoshis = data.get('confirmed', 0) + data.get('unconfirmed', 0)
                    
                    balance_bch = balance_satoshis / 100000000
                    
                    return JsonResponse({
                        'success': True,
                        'balance': f"{balance_bch:.8f}",
                        'address': wallet_address,
                    })
            except:
                continue
        
        # If all APIs fail, return 0
        return JsonResponse({
            'success': True,
            'balance': '0.00000000',
            'address': wallet_address,
            'message': 'Could not fetch balance from blockchain APIs'
        })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def paytaca_webhook(request):
    """
    Webhook endpoint for Paytaca to notify about wallet connections
    This is called when user approves connection in Paytaca
    """
    try:
        # Paytaca can send data as JSON or form data
        if request.content_type == 'application/json':
            data = json.loads(request.body)
        else:
            data = request.POST.dict()
        
        print(f"Webhook received: {data}")
        
        session_id = data.get('session') or data.get('session_id')
        wallet_address = data.get('address') or data.get('wallet_address')
        signature = data.get('signature')
        event_type = data.get('event') or 'authenticated'
        
        if not session_id:
            return JsonResponse({
                'success': False,
                'error': 'Session ID required'
            }, status=400)
        
        session = WalletSession.objects.get(session_id=session_id)
        
        if event_type == 'scanned':
            session.status = 'scanned'
            session.save()
            
        elif event_type in ['approved', 'authenticated', 'connected']:
            if wallet_address:
                # Ensure address has bitcoincash: prefix
                if not wallet_address.startswith('bitcoincash:'):
                    wallet_address = f'bitcoincash:{wallet_address}'
                
                session.wallet_address = wallet_address
                session.signature = signature
                session.status = 'authenticated'
                session.save()
                
                print(f"Session {session_id[:8]}... authenticated with address {wallet_address[:20]}...")
            
        elif event_type == 'rejected':
            session.status = 'failed'
            session.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Webhook processed',
            'session_status': session.status
        })
        
    except WalletSession.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Session not found'
        }, status=404)
    except Exception as e:
        print(f"Webhook error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)