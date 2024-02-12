from django.urls import path
from .views import create_project, create_other_form

urlpatterns = [
    path('create_project/', create_project, name='create_project'),
    path('create_other_form/', create_other_form, name='create_other_form'),
    # Другие URL-адреса вашего приложения
]