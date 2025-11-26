from drf_spectacular.utils import (
    extend_schema,
    OpenApiExample,
    OpenApiResponse,
)
from drf_spectacular.types import OpenApiTypes

from core.serializers import CustomTokenObtainPairSerializer

user_login = extend_schema(
    summary="Login user",
    description="Authenticate a user and return JWT access & refresh tokens.",
    tags=["Accounts"],
    request=CustomTokenObtainPairSerializer,
    examples=[
        OpenApiExample(
            "Login Example",
            value={"username": "john", "password": "123456"}
        )
    ],
    responses={
        200:  OpenApiResponse(
            response=OpenApiTypes.OBJECT,   # 👈 REQUIRED for examples to appear
            description="Successful login",
            examples=[
                OpenApiExample(
                        "Success Response",
                        value={
                            "successMessage": "Login successful",
                            "status_code": 200,
                            "refresh": "jwt-refresh-token",
                            "access": "jwt-access-token",
                            "user_short_detail": {
                                "id": "433212a2-a409-4f8d-9d66-cef9f55b9dc5",
                                "username": "admin",
                                "full_name": "admin user",
                                "email": "admin@gmail.com",
                                "phone_number": "+25070000000",
                                "address": " Kigali, Rwanda",
                                "user_type": "staff"
                            }
                        }
                )
            ]
        ),
        400: OpenApiResponse(
            description="Invalid credentials",
            response=OpenApiTypes.OBJECT,
            examples=[
                OpenApiExample(
                        "Error Response",
                        value={
                            "errorMessage": "usename filed is required. password is required. Invalid username or password.",
                            "status_code": 400
                        }
                )
            ]
        ),
    },
)

user_logout = extend_schema(
    summary="Logout user",
    description="Logs out the current authenticated user and clears session.",
    tags=["Accounts"],
    request=None,
    responses={
        200: OpenApiResponse(
            description="Successfully logged out",
            examples=[
                OpenApiExample(
                        "Success Response",
                        value={
                            "message": "Logged out successfully",
                            "user": "john"
                        }
                )
            ]
        )
    },
),
