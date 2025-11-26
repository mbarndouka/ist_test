
from django.contrib import admin
from django.urls import path, include
# import django settings
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)


urlpatterns = [
    path('dashboard/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/', include('core.urls')),
    # OpenAPI schema
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),

    # Swagger UI
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),

    # ReDoc UI
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
]

# add static files
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
# add media files
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)