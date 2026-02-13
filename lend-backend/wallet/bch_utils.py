import re
import requests
from django.conf import settings

class BCHUtils:
    """Bitcoin Cash utilities"""
    
    @staticmethod
    def validate_address(address):
        """Validate BCH address format"""
        if not address:
            return False
        # BCH address format: bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a
        pattern = r'^(bitcoincash:)?[qp][a-z0-9]{41}$'
        return bool(re.match(pattern, address, re.IGNORECASE))
    
    @staticmethod
    def get_balance(address):
        """Fetch BCH balance from explorer"""
        try:
            # Remove prefix if present
            clean_address = address.replace('bitcoincash:', '')
            
            # Using Bitcoin.com explorer API
            url = f'https://explorer.bitcoin.com/bch/api/addr/{clean_address}/balance'
            
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                balance_sats = int(response.text)
                balance_bch = balance_sats / 100_000_000
                return {
                    'balance_sats': balance_sats,
                    'balance_bch': balance_bch,
                    'balance': f"{balance_bch:.3f}"  # "0.000" format
                }
        except Exception as e:
            print(f"Balance fetch error: {e}")
        
        return {
            'balance_sats': 0,
            'balance_bch': 0,
            'balance': '0.000'
        }
    
    @staticmethod
    def generate_auth_url(session_id):
        """Generate Paytaca-compatible auth URL for QR code"""
        # Simple format - just encode the session ID
        return f"bch://lend/session/{session_id}"