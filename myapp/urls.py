# myapp/urls.py
from django.urls import path
from .views import upload_walls,update_project,SaveImageView, upload_json, PanelList, MaterialDetail, ProjectInfo, SizeList, receive_screenshot, home, Line3DList, BlockList, upload_material_image
from .viewsParser import parser



urlpatterns = [
    path('api/panels/<int:project_id>/', PanelList.as_view(), name='panel-list'),
    path('api/material/<int:pk>/', MaterialDetail.as_view(), name='material_detail_api'),
    path('api/project/<int:pk>/', ProjectInfo.as_view(), name='project_detail_api'),
    path('api/size/<int:project_id>/', SizeList.as_view(), name='size_detail_api'),
    path('api/screenshot/', receive_screenshot, name='screenshot_api'),  # Без .as_view()
    path('api/save_image/', SaveImageView.as_view(), name='save_image'),
    path('api/update_project/', update_project, name='update_project_api'),
    path('api/upload_walls/', upload_walls, name='upload_walls_api'),
    path('api/line3d/<int:project_id>/',Line3DList.as_view(), name='line3d_detail_api'),
    path('api/block/<int:project_id>/',BlockList.as_view(), name='block_detail_api'),
    path('api/material-image/', upload_material_image, name='upload_material_image'),
    path('parser/', parser, name='parser'),
]

