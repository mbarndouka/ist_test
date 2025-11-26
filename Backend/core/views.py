
# Third party imports
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action

# Django imports
from django.contrib.auth import update_session_auth_hash, logout
from core.serializers import PurchaseRequestSerializer, SubmitReceiptSerializer
from core.models import PurchaseRequest
from core.permissions import HasStaffMemberPermission, HasManagmentPermission, HasFinanceMemberPermission
from accounts.models import User, Manager, StaffMember


from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.parsers import MultiPartParser, FormParser

@extend_schema_view(
    list=extend_schema(summary="List purchase requests"),
    create=extend_schema(
        summary="Create a purchase request",
        description="Create a new purchase request. Only staff members can create purchase requests.",
        request=PurchaseRequestSerializer,
        responses=PurchaseRequestSerializer,
    )
)
class PurchaseRequestViewSet(viewsets.GenericViewSet):
    queryset = PurchaseRequest.objects.all()
    serializer_class = PurchaseRequestSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    # UUID lookup
    lookup_field = "id"
    lookup_url_kwarg = "id"

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()

        if request.user.user_type == User.STAFF:
            qs = qs.filter(created_by__user=request.user)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        if request.user.user_type != User.STAFF:
            return Response({
                "errorMessage": "Only staff members can create purchase requests",
                "status_code": status.HTTP_403_FORBIDDEN
                },
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance: PurchaseRequest = self.get_object()
        
        if request.user.user_type != User.STAFF:
            return Response({
                "errorMessage": "Only staff members can update purchase requests",
                "status_code": status.HTTP_403_FORBIDDEN
                }, status=status.HTTP_403_FORBIDDEN)
        
        if instance.created_by.user != request.user:
            return Response({
                "errorMessage": "You can only update your own purchase requests",
                "status_code": status.HTTP_403_FORBIDDEN
                }, status=status.HTTP_403_FORBIDDEN)
            
        if request.user.user_type == User.STAFF and instance.status != PurchaseRequest.PENDING:
            return Response({
                "errorMessage": "Cannot update after approval or rejection",
                "status_code": status.HTTP_400_BAD_REQUEST
                }, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"], url_path="approve", permission_classes=[HasManagmentPermission])
    def approve(self, request, id=None):
        pr: PurchaseRequest = self.get_object()
        pr.status = PurchaseRequest.APPROVED
        pr.approved_by = Manager.objects.get(user__username=request.user)
        pr.save()
        return Response({
            "successMessage": "Purchase request approved",
            "status_code": status.HTTP_200_OK
            }, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"], url_path="reject", permission_classes=[HasManagmentPermission])
    def reject(self, request, id=None):
        pr = self.get_object()
        pr.status = PurchaseRequest.REJECTED
        pr.approved_by = Manager.objects.get(user=request.user)
        pr.save()
        return Response({
            "successMessage": "Purchase request rejected",
            "status_code": status.HTTP_200_OK
            }, status=status.HTTP_200_OK)

    @extend_schema(
        request=SubmitReceiptSerializer,
        responses=PurchaseRequestSerializer,
        examples=[],
    )
    @action(detail=True, methods=["post"], url_path="submit-receipt", permission_classes=[HasStaffMemberPermission])
    def submit_receipt(self, request, id=None):
        pr = self.get_object()

        if pr.status != "approved":
            return Response({"detail": "You can only submit a receipt after approval"}, status=400)

        receipt = SubmitReceiptSerializer(instance=pr, data=request.data, partial=True)
        receipt.is_valid(raise_exception=True)
        receipt.save()

        return Response({
            "successMessage": "Receipt submitted successfully",
            "status_code": status.HTTP_200_OK
            }, status=status.HTTP_200_OK)


