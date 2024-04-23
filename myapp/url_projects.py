# myapp/urls.py
from django.urls import path
from .views import project_list, project_view, project_edit
from .viewsProject import upload_project, check_fasteners, check_materials, check_project



urlpatterns = [
    path('', project_list, name='project_list'),
    path('<int:project_id>/', project_view, name='project_view'),
    path('edit/<int:project_id>/', project_edit, name='project_edit'),
    path('upload', upload_project, name='upload_project'),
    path('check_fasteners/', check_fasteners, name = 'check_fasteners'),
    path('check_materials/', check_materials, name = 'check_materials'),
    path('check_project/', check_project, name = 'check_project')

]

