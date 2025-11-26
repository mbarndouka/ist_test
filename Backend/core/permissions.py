from rest_framework.permissions import BasePermission, SAFE_METHODS
from accounts.models import User


class HasManagmentPermission(BasePermission):
    message = "You are not allow the view or perform this action"
    
    def has_permission(self, request, view):
        if request.user.is_authenticated:
            if request.user.user_type == User.MANAGEMENT:
                return True
        return False
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_authenticated:
            if request.user.user_type == User.MANAGEMENT:
                return True
        return False
    

class HasFinanceMemberPermission(BasePermission):
    message = "You are not allow the view or perform this action"
    
    def has_permission(self, request, view):
        if request.user.is_authenticated:
            if request.user.user_type == User.FINANCE:
                return True
        return False
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_authenticated:
            if request.user.user_type == User.FINANCE:
                return True
        return False
    

class HasStaffMemberPermission(BasePermission):
    message = "You are not allow the view or perform this action"
    
    def has_permission(self, request, view):
        if request.user.is_authenticated:
            if request.user.user_type == User.STAFF:
                return True
        return False
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_authenticated:
            if request.user.user_type == User.STAFF:
                return True
        return False