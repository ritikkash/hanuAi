from rest_framework import serializers
from .models import Location

class LocationSerializer(serializers.ModelSerializer):
    # Manually create GeoJSON-like representation
    type = serializers.CharField(default='Feature', read_only=True)
    geometry = serializers.SerializerMethodField()
    properties = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = ('type', 'geometry', 'properties', 'id', 'name', 'category', 'latitude', 'longitude')
        read_only_fields = ('type', 'geometry', 'properties')

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

    def to_representation(self, instance):
        # Convert to GeoJSON format for GET requests
        data = super().to_representation(instance)
        return {
            'type': 'Feature',
            'geometry': self.get_geometry(instance),
            'properties': self.get_properties(instance),
            'id': instance.id
        }

    def to_internal_value(self, data):
        # Handle incoming data for POST/PUT requests
        if 'properties' in data:
            # If data is in GeoJSON format
            internal_data = {
                'name': data['properties'].get('name', ''),
                'category': data['properties'].get('category', ''),
                'latitude': data['geometry']['coordinates'][1],
                'longitude': data['geometry']['coordinates'][0]
            }
        else:
            # If data is in regular format
            internal_data = {
                'name': data.get('name', ''),
                'category': data.get('category', ''),
                'latitude': data.get('latitude'),
                'longitude': data.get('longitude')
            }
        return super().to_internal_value(internal_data) 