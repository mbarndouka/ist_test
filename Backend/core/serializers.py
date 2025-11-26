from random import choice
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework import serializers, exceptions
from django.utils import timezone
from django.contrib.auth.password_validation import validate_password
from django.core import exceptions as django_exceptions
from django.contrib.auth import authenticate
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

from accounts.models import User
from core.models import PurchaseRequest
from utils.fields import CurrentStaffMemberDefault

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = {}
        authenticate_kwargs = {
            self.username_field: attrs[self.username_field],
            "password": attrs["password"],
        }
        try:
            authenticate_kwargs["request"] = self.context["request"]
        except KeyError:
            pass

        # log user out if already logged in

        self.user = authenticate(**authenticate_kwargs)

        if not self.user or not self.user.is_active:
            raise serializers.ValidationError({
                "login_error": "Email/username or password is incorrect",
                }
            )

        data['user_short_detail'] = {
            'id': self.user.id,
            'username': self.user.username,
            'full_name': self.user.full_name,
            'email': self.user.email,
            'phone_number': self.user.phone_number,
            'address': self.user.address,
            'user_type': self.user.user_type,
        }
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['full_name'] = user.full_name
        token['email'] = user.email
        token['phone_number'] = user.phone_number
        token['address'] = user.address
        token['user_type'] = user.user_type
        return token


class UserInfoSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(read_only=True)
    user_type = serializers.CharField(read_only=True)
    age = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'full_name',
            'email',
            'phone_number',
            'address',
            'user_type',
            'is_active',
            'about_me',
            'gender',
            'marital_status',
            'date_of_birth',
            'age',

        ]

    def get_age(self, obj):
        if obj.date_of_birth:
            return timezone.now().year - obj.date_of_birth.year
        return None


class PurchaseRequestSerializer(serializers.ModelSerializer):
    approver_details = serializers.SerializerMethodField(read_only=True)
    requester_details = serializers.SerializerMethodField(read_only=True)
    created_by = serializers.HiddenField(default=CurrentStaffMemberDefault())
    approved_by = serializers.PrimaryKeyRelatedField(read_only=True)
    receipt = serializers.FileField(required=False, allow_null=True)
    
    class Meta:
        model = PurchaseRequest
        fields = [
            'id',
            'title',
            'description',
            'amount',
            'status',
            'created_by',
            'requester_details',
            'approver_details',
            'approved_by',
            'timestamps',
            'proforma',
            'purchase_order',
            'receipt',
            'created_at',
        ]

    def get_approver_details(self, obj: PurchaseRequest):
        if obj.approved_by:
            return UserInfoSerializer(obj.approved_by.user).data
        return None
    
    def get_requester_details(self, obj: PurchaseRequest):
        if obj.created_by:
            return UserInfoSerializer(obj.created_by.user).data
        return None
        
        

class SubmitReceiptSerializer(serializers.ModelSerializer):
    receipt = serializers.FileField()

    class Meta:
        model = PurchaseRequest
        fields = ['receipt']