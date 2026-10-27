from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from zeep.exceptions import TransportError

User = get_user_model()


class RegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_hashes_password_and_never_returns_it(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "desert_guest",
                "email": "Guest@Example.com",
                "password": "SonoraCafe!24",
                "password_confirm": "SonoraCafe!24",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertNotIn("password", response.data)
        user = User.objects.get(username="desert_guest")
        self.assertNotEqual(user.password, "SonoraCafe!24")
        self.assertTrue(user.check_password("SonoraCafe!24"))
        self.assertEqual(user.email, "guest@example.com")

    def test_register_rejects_mismatched_passwords(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "guest",
                "email": "guest@example.com",
                "password": "SonoraCafe!24",
                "password_confirm": "Different!24",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("password_confirm", response.data)

    def test_register_rejects_password_missing_required_complexity(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "guest",
                "email": "guest@example.com",
                "password": "weakpassword",
                "password_confirm": "weakpassword",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.data)


class LoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        User.objects.create_user(
            username="menu_guest",
            email="menu@example.com",
            password="SonoraCafe!24",
        )

    def test_login_returns_access_and_refresh_tokens(self):
        response = self.client.post(
            "/api/auth/login/",
            {"email": "menu@example.com", "password": "SonoraCafe!24"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertNotIn("password", response.data)


class UserAPITests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin_user",
            email="ADMIN@example.com",
            password="SonoraCafe!24",
            is_staff=True,
            is_superuser=True,
        )
        self.user = User.objects.create_user(
            username="regular_user",
            email="regular@example.com",
            password="OriginalPass!24",
            telefono="+52 653 123 456",
        )

    def test_login_with_email_returns_access_and_refresh(self):
        response = self.client.post(
            "/api/auth/login/",
            {"email": "ADMIN@example.com", "password": "SonoraCafe!24"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_me_requires_authentication_and_never_returns_password(self):
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, 401)

        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("password", response.data)
        self.assertEqual(response.data["telefono"], "+52 653 123 456")

    def test_user_list_and_detail_never_return_password(self):
        self.client.force_authenticate(user=self.admin)

        list_response = self.client.get("/api/users/")
        detail_response = self.client.get(f"/api/users/{self.user.pk}/")

        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(detail_response.status_code, 200)
        self.assertTrue(all("password" not in row for row in list_response.data))
        self.assertNotIn("password", detail_response.data)
        self.assertEqual(detail_response.data["telefono"], "+52 653 123 456")

    def test_patch_without_password_preserves_existing_password(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(
            f"/api/users/{self.user.pk}/",
            {"first_name": "Sonora"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("OriginalPass!24"))
        self.assertEqual(self.user.first_name, "Sonora")

    def test_patch_with_password_hashes_and_changes_password(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(
            f"/api/users/{self.user.pk}/",
            {"password": "DifferentSecure!926"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertNotIn("password", response.data)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("DifferentSecure!926"))
        self.assertFalse(self.user.check_password("OriginalPass!24"))
        self.assertNotEqual(self.user.password, "DifferentSecure!926")

    def test_regular_user_cannot_access_user_crud(self):
        self.client.force_authenticate(user=self.user)

        list_response = self.client.get("/api/users/")
        update_response = self.client.patch(
            f"/api/users/{self.user.pk}/",
            {"is_staff": True, "is_superuser": True},
            format="json",
        )

        self.assertEqual(list_response.status_code, 403)
        self.assertEqual(update_response.status_code, 403)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_staff)
        self.assertFalse(self.user.is_superuser)

    def test_openapi_schema_is_public(self):
        response = self.client.get("/swagger.json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data.info.title, "Café Sonora API")
        self.assertIn("Bearer", response.data.security_definitions)

    def test_registration_stores_and_returns_telefono(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "phone_guest",
                "email": "PHONE@EXAMPLE.COM",
                "telefono": "+52 653 987 654",
                "password": "SonoraCafe!24",
                "password_confirm": "SonoraCafe!24",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["telefono"], "+52 653 987 654")
        self.assertEqual(response.data["email"], "phone@example.com")
        self.assertEqual(
            User.objects.get(username="phone_guest").telefono,
            "+52 653 987 654",
        )


class SoapCountryTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="soap_guest",
            email="soap@example.com",
            password="SonoraCafe!24",
        )
        self.client.force_authenticate(user=self.user)

    def test_country_service_requires_authentication(self):
        response = APIClient().get("/api/soap/country/?code=MX")
        self.assertEqual(response.status_code, 401)

    def test_country_service_rejects_malformed_iso_code(self):
        response = self.client.get("/api/soap/country/?code=MEX")
        self.assertEqual(response.status_code, 400)

    @patch("accounts.soap_views.Client")
    def test_country_service_returns_country_and_capital(self, soap_client):
        service = soap_client.return_value.service
        service.CountryName.return_value = "Mexico"
        service.CapitalCity.return_value = "Mexico City"

        response = self.client.get("/api/soap/country/?code=mx")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data,
            {"code": "MX", "name": "Mexico", "capital": "Mexico City"},
        )
        soap_client.assert_called_once()
        transport = soap_client.call_args.kwargs["transport"]
        self.assertEqual(transport.load_timeout, 10)
        self.assertEqual(transport.operation_timeout, 10)

    @patch("accounts.soap_views.Client")
    def test_country_service_rejects_unknown_iso_code(self, soap_client):
        soap_client.return_value.service.CountryName.return_value = (
            "Country not found in the database"
        )

        response = self.client.get("/api/soap/country/?code=ZZ")

        self.assertEqual(response.status_code, 400)
        soap_client.return_value.service.CapitalCity.assert_not_called()

    @patch("accounts.soap_views.Client", side_effect=TransportError("unavailable"))
    def test_country_service_returns_502_when_soap_is_unavailable(self, _soap_client):
        with patch("accounts.soap_views.logger.exception"):
            response = self.client.get("/api/soap/country/?code=MX")

        self.assertEqual(response.status_code, 502)
