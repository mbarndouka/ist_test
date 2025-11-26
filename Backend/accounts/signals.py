from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import User, StaffMember, Manager, FinanceOfficer

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.user_type == User.STAFF:
            StaffMember.objects.create(user=instance)
        elif instance.user_type == User.MANAGEMENT:
            Manager.objects.create(user=instance)
        elif instance.user_type == User.FINANCE:
            FinanceOfficer.objects.create(user=instance)
            
    all_users = User.objects.all()
    for user in all_users:
        if user.user_type == User.STAFF:
            StaffMember.objects.get_or_create(user=user)
        elif user.user_type == User.MANAGEMENT:
            Manager.objects.get_or_create(user=user)
        elif user.user_type == User.FINANCE:
            FinanceOfficer.objects.get_or_create(user=user)