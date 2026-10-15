from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils.text import slugify

from menu.models import Category, Product


SEED_MENU = {
    "Cafés calientes": [
        ("Espresso Sonora", "Espresso intenso con notas de cacao y nuez.", "42.00", "photo-1510707577719-ae7c14805e3a"),
        ("Americano del Desierto", "Café de altura, suave y aromático.", "48.00", "photo-1495474472287-4d71bcdd2085"),
        ("Latte de Canela", "Espresso, leche cremosa y canela de la casa.", "62.00", "photo-1570968915860-54d5c301fa9f"),
        ("Capuchino Clásico", "Espresso equilibrado con espuma aterciopelada.", "58.00", "photo-1572442388796-11668a67e53d"),
    ],
    "Bebidas frías": [
        ("Cold Brew de Piloncillo", "Extracción lenta con un toque dulce de piloncillo.", "65.00", "photo-1461023058943-07fcbe16d735"),
        ("Frappé de Cajeta", "Café frío licuado con cajeta y crema.", "72.00", "photo-1572490122747-3968b75cc699"),
        ("Limonada con Menta", "Limón fresco, menta y mucho hielo.", "52.00", "photo-1513558161293-ccaf765edfd7"),
        ("Té Helado de Jamaica", "Infusión de jamaica hecha en casa.", "48.00", "photo-1556679343-c7306c1976bc"),
    ],
    "Panadería": [
        ("Concha de Vainilla", "Pan dulce tradicional con cubierta de vainilla.", "32.00", "photo-1509440159596-0249088772ff"),
        ("Croissant de Almendra", "Hojaldre de mantequilla con almendra tostada.", "55.00", "photo-1555507036-ab1f4038808a"),
        ("Rol de Canela", "Masa suave, canela especiada y glaseado ligero.", "46.00", "photo-1509365465985-25d11c17e812"),
        ("Pan de Elote", "Rebanada húmeda de elote dulce, horneada en casa.", "42.00", "photo-1608198093002-ad4e005484df"),
    ],
    "Snacks": [
        ("Sándwich de Pollo", "Pollo a la plancha, aguacate y vegetales frescos.", "95.00", "photo-1521390188846-e2a3a97453a0"),
        ("Molletes", "Bolillo dorado con frijoles, queso y pico de gallo.", "78.00", "photo-1528735602780-2552fd46c7af"),
        ("Bagel con Queso Crema", "Bagel tostado con queso crema y hierbas.", "68.00", "photo-1553909489-cd47e0ef937f"),
        ("Ensalada de Frutas", "Fruta de temporada con un toque de limón.", "64.00", "photo-1490645935967-10de6ba17061"),
    ],
}


class Command(BaseCommand):
    help = "Crea o actualiza las categorías y los 16 productos de Café Sonora."

    def handle(self, *args, **options):
        for category_name, products in SEED_MENU.items():
            category, _ = Category.objects.update_or_create(
                slug=slugify(category_name),
                defaults={"name": category_name},
            )
            for name, description, price, photo_id in products:
                Product.objects.update_or_create(
                    name=name,
                    defaults={
                        "description": description,
                        "price": Decimal(price),
                        "image_url": (
                            f"https://images.unsplash.com/{photo_id}"
                            "?auto=format&fit=crop&w=800&q=80"
                        ),
                        "category": category,
                        "available": True,
                    },
                )
        self.stdout.write(self.style.SUCCESS("Menú cargado: 4 categorías y 16 productos."))
