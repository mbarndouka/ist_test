import uuid
from django.db import models

# Create your models here.
from accounts.models import Manager, FinanceOfficer, StaffMember



class PurchaseRequest(models.Model):
    PENDING = 'pending'
    APPROVED = 'approved'
    REJECTED = 'rejected'
    status_choices = [
        (PENDING, 'Pending'),
        (APPROVED, 'Approved'),
        (REJECTED, 'Rejected'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=status_choices, default=PENDING)
    created_by = models.ForeignKey(StaffMember, on_delete=models.CASCADE, null=True, blank=True, related_name='purchase_requests')
    approved_by = models.ForeignKey(Manager, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_requests')
    timestamps = models.DateTimeField(auto_now=True)
    proforma = models.FileField(upload_to='proformas/', null=True, blank=True)
    purchase_order = models.FileField(upload_to='purchase_orders/', null=True, blank=True)
    receipt = models.FileField(upload_to='receipts/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.status}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Purchase Request'
        verbose_name_plural = 'Purchase Requests'