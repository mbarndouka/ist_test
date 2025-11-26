# Django imports
from django.urls import path, include

# Third party apps
from rest_framework import routers

# Local imports
from accounts.views import UserLoginViewset

router = routers.DefaultRouter()


router.register('', UserLoginViewset, basename='user-login')

urlpatterns = [
    path('', include(router.urls)),
]