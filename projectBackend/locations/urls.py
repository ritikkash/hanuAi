from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LocationViewSet, LocationStatisticsView

router = DefaultRouter()
router.register('locations', LocationViewSet, basename='location')

urlpatterns = [
    path('', include(router.urls)), # Include router urls
    path('statistics/', LocationStatisticsView.as_view(), name='location-statistics'),
] 