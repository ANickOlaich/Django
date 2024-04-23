# myapp/urls.py
from django.urls import path
from .viewsMaterials import materials_list, material_edit


urlpatterns = [
    path('', materials_list, name='materials_list'),
    path('<int:material_id>/', material_edit, name='material_edit'),
    #path('create_fasteners/',create_fasteners,name='create_fasteners')
]
