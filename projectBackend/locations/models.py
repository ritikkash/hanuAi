from django.db import models

# Create your models here.

class Location(models.Model):
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True, null=True)
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return self.name
