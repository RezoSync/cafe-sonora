from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

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
            {"username": "menu_guest", "password": "SonoraCafe!24"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertNotIn("password", response.data)
