from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="Café Sonora API",
        default_version="v1",
        description="API de autenticación, usuarios y menú de Café Sonora.",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
    authentication_classes=[],
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("swagger.json", schema_view.without_ui(cache_timeout=0), name="schema-json"),
    path("swagger/", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("accounts.api_urls")),
    path("api/", include("menu.urls")),
    path("", TemplateView.as_view(template_name="home.html"), name="home"),
    path("registro/", TemplateView.as_view(template_name="register.html"), name="register"),
    path("login/", TemplateView.as_view(template_name="login.html"), name="login"),
    path("menu/", TemplateView.as_view(template_name="menu.html"), name="menu"),
]
