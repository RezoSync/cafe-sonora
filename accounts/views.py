from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import CafeTokenObtainPairSerializer, RegisterSerializer


class RegisterThrottle(AnonRateThrottle):
    scope = "auth_register"


class LoginThrottle(AnonRateThrottle):
    scope = "auth_login"


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [RegisterThrottle]


class LoginView(TokenObtainPairView):
    serializer_class = CafeTokenObtainPairSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [LoginThrottle]


class RefreshView(TokenRefreshView):
    permission_classes = [AllowAny]
    authentication_classes = []
