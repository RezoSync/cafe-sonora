from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from menu.models import Product


class ProtectedMenuTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_menu", verbosity=0)

    def setUp(self):
        self.client = APIClient()

    def test_products_are_unauthorized_without_token(self):
        response = self.client.get("/api/products/")
        self.assertEqual(response.status_code, 401)

    def test_products_and_categories_require_valid_jwt(self):
        from django.contrib.auth import get_user_model

        user = get_user_model().objects.create_user(
            username="menu_guest", password="SonoraCafe!24"
        )
        token_response = self.client.post(
            "/api/auth/login/",
            {"username": user.username, "password": "SonoraCafe!24"},
            format="json",
        )
        self.assertEqual(token_response.status_code, 200)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {token_response.data['access']}"
        )
        products = self.client.get("/api/products/")
        categories = self.client.get("/api/categories/")
        self.assertEqual(products.status_code, 200)
        self.assertEqual(categories.status_code, 200)
        self.assertEqual(len(products.data), 16)
        self.assertEqual(len(categories.data), 4)
        self.assertEqual(Product.objects.count(), 16)

    def test_product_category_filter_and_search(self):
        from django.contrib.auth import get_user_model
        from rest_framework_simplejwt.tokens import AccessToken

        user = get_user_model().objects.create_user(
            username="search_guest", password="SonoraCafe!24"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {AccessToken.for_user(user)}")
        response = self.client.get("/api/products/?category=cafes-calientes&search=latte")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Latte de Canela")
