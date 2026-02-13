from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings
import uuid

#class WalletSession(models.Model):
#    STATUS_CHOICES = (
#       ('pending', 'Pending'),
#      ('scanned', 'Scanned'),
  #       ('authenticated', 'Authenticated'),
    #     ('expired', 'Expired'),
      #   ('failed', 'Failed'),
   #  )
    
    # id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # session_id = models.CharField(max_length=100, unique=True, db_index=True)
    # auth_url = models.URLField(max_length=500)
    # status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    # user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
      #                       null=True, blank=True)
    # wallet_address = models.CharField(max_length=255, null=True, blank=True)
    # signature = models.TextField(null=True, blank=True)
    # created_at = models.DateTimeField(auto_now_add=True)
    # expires_at = models.DateTimeField()
    # updated_at = models.DateTimeField(auto_now=True)
    
    # class Meta:
      #   indexes = [
        #     models.Index(fields=['session_id']),
          #   models.Index(fields=['status', 'expires_at']),
        # ]
    
    # def __str__(self):
      #   return f"Session {self.session_id[:8]} - {self.status}"