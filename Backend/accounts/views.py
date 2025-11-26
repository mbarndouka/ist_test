# Third party imports
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from django.contrib.auth import update_session_auth_hash, logout

from accounts.forms import User
from core.serializers import CustomTokenObtainPairSerializer
from docs.auth_docs import user_login, user_logout
# Create your views here.

from drf_spectacular.utils import (
    extend_schema_view,
)

@extend_schema_view(
    user_login=user_login,
    user_logout=user_logout
)
class UserLoginViewset(viewsets.GenericViewSet):
    permission_classes = (AllowAny,)
    serializer_class = CustomTokenObtainPairSerializer

    def get_queryset(self):
        return User.objects.all()
    
    def get_permissions(self):
        if self.action == 'user_logout':
            self.permission_classes = (IsAuthenticated,)
        return super().get_permissions()
    
    @action(detail=False, methods=['post'], url_path='login')
    def user_login(self, request):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            token = serializer.get_token(serializer.user)
            return Response({
                "successMessage": "Login successful",
                "status_code": status.HTTP_200_OK,
                "refresh": str(token),
                "access": str(token.access_token),
                **serializer.validated_data
                }, status=status.HTTP_200_OK)
        
        error_data = ''
        
        if serializer.errors.get('username'):
            error_data += 'usename filed is required. '
        if serializer.errors.get('password'):
            error_data += 'password is required. '
        if serializer.errors.get('login_error'):
            error_data += serializer.errors.get('login_error')[0]

        return Response({
            "errorMessage": error_data,
            "status_code": status.HTTP_400_BAD_REQUEST,
        },  status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=False, methods=['post'], url_path='logout')
    def user_logout(self, request):
        copy_user = request.user.username
        logout(request)
        return Response({'message': 'Logged out successfully', 'user': copy_user}, status=status.HTTP_200_OK)
    
