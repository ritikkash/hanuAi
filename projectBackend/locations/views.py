from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import viewsets
from rest_framework import status
from rest_framework.decorators import action
from django.db.models import Count
from .models import Location
from .serializers import LocationSerializer
import logging

logger = logging.getLogger(__name__)

# Create your views here.

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = []  # Allow all requests
    authentication_classes = []  # No authentication required

    def get_permissions(self):
        return []  # Allow all requests

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        # Manually format as FeatureCollection
        geojson_output = {
            "type": "FeatureCollection",
            "features": serializer.data
        }
        return Response(geojson_output)

    def create(self, request, *args, **kwargs):
        logger.info(f"Received POST request with data: {request.data}")
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            logger.error(f"Error creating location: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class LocationStatisticsView(APIView):
    def get(self, request):
        total_locations = Location.objects.count()
        category_counts = Location.objects.values('category').annotate(count=Count('category')).order_by('-count')

        stats = {
            'total_locations': total_locations,
            'category_counts': list(category_counts)
        }
        return Response(stats)
