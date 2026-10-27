from django.urls import path
from rest_framework.routers import DefaultRouter

from .soap_views import SoapCountryView
from .views import UserViewSet

router = DefaultRouter()
router.register("users", UserViewSet, basename="user")

urlpatterns = [
    path("soap/country/", SoapCountryView.as_view(), name="soap-country"),
] + router.urls
