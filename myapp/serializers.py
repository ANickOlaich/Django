# serializers.py
from rest_framework import serializers
from .models import Panel, Contour, Material, Project, Size, Line3D

class ContourSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contour
        fields = '__all__'

class PanelSerializer(serializers.ModelSerializer):
    contours = ContourSerializer(many=True, read_only=True)

    class Meta:
        model = Panel
        fields = '__all__'

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'

class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = '__all__'

class Line3DSerializer(serializers.ModelSerializer):
    class Meta:
        model = Line3D
        fields = '__all__'

