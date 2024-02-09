# myapp/urls.py
from django.urls import path
from .views import project_list, project_view, project_edit



urlpatterns = [
    path('', project_list, name='project_list'),
    path('<int:project_id>/', project_view, name='project_view'),
    path('edit/<int:project_id>/', project_edit, name='project_edit'),
]

