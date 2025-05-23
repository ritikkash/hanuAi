from rest_framework import serializers
from .models import Location

class LocationSerializer(serializers.ModelSerializer):
    # Manually create GeoJSON-like representation
    type = serializers.CharField(default='Feature', read_only=True)
    geometry = serializers.SerializerMethodField()
    properties = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = ('type', 'geometry', 'properties', 'id')

    def get_geometry(self, obj):
        return {
            'type': 'Point',
            'coordinates': [obj.longitude, obj.latitude]
        }

    def get_properties(self, obj):
        return {
            'name': obj.name,
            'category': obj.category
        } 