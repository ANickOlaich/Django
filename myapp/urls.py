# myapp/urls.py
from django.urls import path
from .views import upload_json, PanelList, MaterialDetail, ProjectInfo, SizeList, receive_screenshot



urlpatterns = [
   
    path('api/panels/<int:project_id>/', PanelList.as_view(), name='panel-list'),
    path('api/material/<int:pk>/', MaterialDetail.as_view(), name='material_detail_api'),
    path('api/project/<int:pk>/', ProjectInfo.as_view(), name='project_detail_api'),
    path('api/size/<int:project_id>/', SizeList.as_view(), name='size_detail_api'),
    path('api/screenshot/', receive_screenshot, name='screenshot_api'),  # Без .as_view()
]

