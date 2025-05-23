from django.urls import path
from .views import LocationGeoJSONView, LocationStatisticsView

urlpatterns = [
    path('geojson/', LocationGeoJSONView.as_view(), name='location-geojson'),
    path('statistics/', LocationStatisticsView.as_view(), name='location-statistics'),
] 