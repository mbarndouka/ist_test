from typing import Any
from django.contrib import admin
from accounts.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from accounts.forms import UserAdminChangeForm, UserAdminCreationForm
# groups
from django.contrib.auth.models import Group
from django.utils.translation import gettext_lazy as _


class UserAdmin(BaseUserAdmin):
    form = UserAdminChangeForm
    add_form = UserAdminCreationForm

    list_display = ('username','full_name', 'email', 'user_type','admin', 'created_at')
    list_filter = ('admin','user_type', 'gender','is_active', 'created_at')
    fieldsets = (
        ("Unique Identifier", {'fields': (
            'username',
            'email',
            'password'
        )}),
        (
            'Personal info',
            {
                'fields': (
                    'full_name',
                    'phone_number',
                    'address',
                    'gender',
                    'date_of_birth',
                    'marital_status',
                    'user_type',
                )
            }
        ),

        (
            'Permissions',
            {
                'fields': (
                    'is_active',
                    # 'admin',
                    # 'staff',
                )
            }
        ),
    )

    add_fieldsets = (("Fill the form to add new account", {
        'classes': ('wide',),
        'fields': (
            'username',
            'email',
            'full_name',
            'gender',
            'address',
            'marital_status',
            'date_of_birth',
            'user_type',
            'password1',
            'password2',
        )}),)

    search_fields = (
        'username',
        'email',
        'full_name',
        'phone_number',
    )

    ordering = ('username',)
    filter_horizontal = ()
    actions = ['disable_user', 'enable_user']

    def disable_user(self, request, queryset):
        queryset.update(is_active=False)

    def enable_user(self, request, queryset):
        queryset.update(is_active=True)

    disable_user.short_description = "Disable selected users"
    enable_user.short_description = "Enable selected users"

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(is_superuser=False)

    def save_model(self, request: Any, obj: User, form: Any, change: Any) -> None:
        if change:
            if obj.user_type == User.MANAGEMENT:
                obj.staff = True
                obj.admin = True
                    
        return super().save_model(request, obj, form, change)


admin.site.register(User, UserAdmin)
admin.site.unregister(Group)