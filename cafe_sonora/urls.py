from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("menu.urls")),
    path("", TemplateView.as_view(template_name="home.html"), name="home"),
    path("registro/", TemplateView.as_view(template_name="register.html"), name="register"),
    path("login/", TemplateView.as_view(template_name="login.html"), name="login"),
    path("menu/", TemplateView.as_view(template_name="menu.html"), name="menu"),
]
