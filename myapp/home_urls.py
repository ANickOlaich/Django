# myapp/urls.py
from django.urls import path
from .views import home,user_profile, CustomLogoutView
from django.contrib.auth import views as auth_views
from . import views



urlpatterns = [
    path('',home, name='home'),
    path('register/', views.register, name='register'),
    path('login/', auth_views.LoginView.as_view(), name='login'),
    path('logout/', CustomLogoutView.as_view(), name='logout'),
    path('accounts/profile/', user_profile, name='user_profile'),
]

