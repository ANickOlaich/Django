from rest_framework import generics
from django.shortcuts import render, get_object_or_404, redirect
from .models import Project,Panel,Material,Size
from django.contrib import messages
from .forms import JSONFileUploadForm
from django.urls import reverse
from .serializers import PanelSerializer,MaterialSerializer, ProjectSerializer, SizeSerializer
from django.http import Http404
from django.http import JsonResponse
import base64

class PanelList(generics.ListAPIView):
    serializer_class = PanelSerializer

    def get_queryset(self):
        project_id = self.kwargs['project_id']
        return Panel.objects.filter(project__id=project_id).prefetch_related('contours')



def project_detail(request, project_id):
    project = get_object_or_404(Project, pk=project_id)
    return render(request, 'myapp/fullscreen.html', {'project': project})
    return render(request, 'myapp/project_detail.html', {'project': project})

def project_list(request):
    projects = Project.objects.all()
    return render(request, 'myapp/project_list.html', {'projects': projects})

def upload_json(request):
    if request.method == 'POST':
        form = JSONFileUploadForm(request.POST, request.FILES)
        if form.is_valid():
            json_file = form.cleaned_data['json_file']
            
            # Обработка файла JSON, например, сохранение данных в базу данных
            # Ваш код здесь...

            messages.success(request, 'Файл успешно загружен и обработан.')
            return redirect(reverse('myapp:upload_json'))
    else:
        form = JSONFileUploadForm()

    return render(request, 'myapp/upload_json.html', {'form': form})

class MaterialDetail(generics.RetrieveAPIView):
    serializer_class = MaterialSerializer
    queryset = Material.objects.all()
    lookup_field = 'pk'  # Указываем имя параметра для поиска объекта

    def get_queryset(self):
        material_id = self.kwargs['pk']
        return Material.objects.filter(pk=material_id)

class ProjectInfo(generics.RetrieveAPIView):
    serializer_class = ProjectSerializer
    queryset = Project.objects.all()
    lookup_field = 'pk'  # Указываем имя параметра для поиска объекта

    def get_queryset(self):
        project_id = self.kwargs['pk']
        return Project.objects.filter(pk=project_id)

class SizeList(generics.ListAPIView):
    serializer_class = SizeSerializer

    def get_queryset(self):
        project_id = self.kwargs['project_id']
        return Size.objects.filter(project__id=project_id)

def receive_screenshot(request):
    print(request)
    if request.method == 'POST':
        screenshot_data_base64 = request.POST.get('screenshot')
        
        try:
            # Декодируем base64-данные
            screenshot_data_binary = base64.b64decode(screenshot_data_base64)

            # Далее вы можете сохранить данные в файл или обработать их по своему усмотрению
            # Например:
            with open('screenshot.png', 'wb') as f:
                f.write(screenshot_data_binary)

            return JsonResponse({'status': 'success'})
        except Exception as e:
            # Если возникла ошибка декодирования или другая ошибка, вернуть 'error'
            return JsonResponse({'status': 'error', 'error_message': str(e)})

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

