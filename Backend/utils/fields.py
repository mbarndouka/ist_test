from accounts.models import User, Manager, StaffMember, FinanceOfficer
from rest_framework import serializers

class CurrentStaffMemberDefault:
    requires_context = True
    
    def __call__(self, serializer_field):
        try:
            return StaffMember.objects.get(
                user__username=serializer_field.context['request'].user)
        except StaffMember.DoesNotExist:
            raise serializers.ValidationError("StaffMember does not exist for the current user.")
        
    

class CurrentManagerDefault:
    requires_context = True
    
    def __call__(self, serializer_field):
        try:
            return Manager.objects.get(
                user=serializer_field.context['request'].user)
        except Manager.DoesNotExist:
            raise serializers.ValidationError("Manager does not exist for the current user.")
        
class CurrentFinanceOfficerDefault:
    requires_context = True
    
    def __call__(self, serializer_field):
        return FinanceOfficer.objects.get(
            user__username=serializer_field.context['request'].user)