from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from django.db.models import Count
from .models import Location
from .serializers import LocationSerializer

# Create your views here.

class LocationGeoJSONView(generics.ListAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        # Manually format as FeatureCollection
        geojson_output = {
            "type": "FeatureCollection",
            "features": serializer.data
        }
        return Response(geojson_output)

class LocationStatisticsView(APIView):
    def get(self, request):
        total_locations = Location.objects.count()
        category_counts = Location.objects.values('category').annotate(count=Count('category')).order_by('-count')

        stats = {
            'total_locations': total_locations,
            'category_counts': list(category_counts)
        }
        return Response(stats)
