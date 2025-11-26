# Django imports
from django.urls import path, include

# Third party apps
from rest_framework import routers

# Local imports
from core.views import (PurchaseRequestViewSet)

router = routers.DefaultRouter()



router.register('requests', PurchaseRequestViewSet, basename='purchase-request')

urlpatterns = router.urls