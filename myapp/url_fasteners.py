# myapp/urls.py
from django.urls import path
from .viewsFasteners import fasteners_list,fasteners_detail,create_fasteners


urlpatterns = [
    path('', fasteners_list, name='fasteners_list'),
    path('<int:fasteners_id>/', fasteners_detail, name='fasteners_detail'),
    path('create_fasteners/',create_fasteners,name='create_fasteners')
]

