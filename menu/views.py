from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Product.objects.filter(available=True).select_related("category")
        category = self.request.query_params.get("category")
        search = self.request.query_params.get("search")
        if category:
            queryset = queryset.filter(category__slug=category)
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(available=True).select_related("category")
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
