from django.views.generic.edit import FormView
from rest_framework import generics
from django.shortcuts import render, get_object_or_404, redirect
from .models import Project,Panel,Material,Size, Line3D, Block
from django.contrib import messages
from .forms import JSONFileUploadForm, ImageForm
from django.urls import reverse
from .serializers import PanelSerializer,MaterialSerializer, ProjectSerializer, SizeSerializer, Line3DSerializer, BlockSerializer
from django.http import Http404
from django.http import JsonResponse
import base64,os,json
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LogoutView
from django.http import HttpResponseRedirect
from .forms import UserRegistrationForm

@login_required
def user_profile(request):
    return render(request, 'user_profile.html', {'user': request.user})


def register(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('login')
    else:
        form = UserRegistrationForm()
    return render(request, 'registration/register.html', {'form': form})

def upload_material_image(request):
    print('---------------------------------Material Image')
    if request.method == 'POST':
        # Получаем изображение из запроса
        image_data = request.FILES.get('image')
        material_id = request.POST.get('id')
        print(image_data)
        print(material_id)
        
        # Здесь может быть ваша логика обработки изображения и материала
        
        # Возвращаем успешный ответ
        return JsonResponse({'message': 'Image uploaded successfully'})
    else:
        # Если метод запроса не POST, возвращаем ошибку
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=400)

class CustomLogoutView(LogoutView):
    next_page = '/'  # страница, на которую перенаправляется после выхода

    def get(self, request, *args, **kwargs):
        self.logout(request)
        return HttpResponseRedirect(self.get_next_page())

class PanelList(generics.ListAPIView):
    serializer_class = PanelSerializer

    def get_queryset(self):
        project_id = self.kwargs['project_id']
        return Panel.objects.filter(project__id=project_id).prefetch_related('contours')

class SaveImageView(FormView):
    form_class = ImageForm

    def post(self, request, *args, **kwargs):
        form = self.get_form()
        if form.is_valid():
            try:
                # Получаем данные изображения из формы
                image_data = form.cleaned_data['image_data']
                # Получаем project_id из POST-параметров
                project_id = request.POST.get('project_id')
                
                # Проверяем наличие project_id
                if not project_id:
                    raise ValueError("Project ID is missing")

                # Извлекаем бинарные данные из base64
                image_data = base64.b64decode(image_data.split(',')[1])

                # Генерируем имя файла
                image_name = f'project_{project_id}_image.jpg'

                # Путь для сохранения изображения
                image_path = os.path.join('myapp', 'static', 'images', image_name)

                # Сохраняем изображение на сервере
                with open(image_path, 'wb') as f:
                    f.write(image_data)

                # Получаем объект Project по project_id
                project = Project.objects.get(pk=project_id)

                # Обновляем поле image модели Project
                project.image = 'images/'+image_name
                project.save()

                # Возвращаем JSON-ответ об успешном сохранении
                return JsonResponse({'status': 'success'})
            except Exception as e:
                # Возвращаем JSON-ответ с сообщением об ошибке
                return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
        else:
            # Возвращаем JSON-ответ с ошибками валидации формы
            return JsonResponse({'status': 'error', 'errors': form.errors}, status=400)

def home(request):
    return render(request,'home.html')

def upload_walls(request):
    if request.method == 'POST' and request.FILES['walls']:
        project_id = request.POST.get('project_id') # Получаем project_id из POST-параметров

        # Получаем файл из запроса
        uploaded_file = request.FILES['walls']

        fileName = "wall_"+project_id
        
        # Определяем путь для сохранения файла
        file_path = os.path.join('myapp','static','walls', fileName)

        # Сохраняем файл на сервере
        with open(file_path, 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)

        project = Project.objects.get(id=project_id)
        
        # Сохраняем файл, автоматически связывая его с объектом Project
        project.walls = fileName
        project.save()

        # Возвращаем успешный ответ
        return JsonResponse({'success': True, 'file_url': fileName})
    else:
        # Если запрос не методом POST или файл не был передан, возвращаем ошибку
        return JsonResponse({'success': False, 'error': 'Файл не был передан или запрос не методом POST'}, status=400)






def update_project(request):
    if request.method == 'POST':
        try:
            print(request.body)
            data = json.loads(request.body)  # Получаем данные из тела запроса в формате JSON
            project_id = data.get('projectId')  # Получаем ID проекта из данных JSON
            project = Project.objects.get(pk=project_id)  # Получаем объект проекта по его ID
            # Обновляем данные проекта из данных JSON
            project.name = data.get('projectName')
            project.description = data.get('projectDescription')
            project.status = data.get('projectStatus')
            project.visibility = data.get('isOnMain')
            # Обновляем другие поля проекта при необходимости
            project.save()  # Сохраняем обновленные данные проекта
            return JsonResponse({'success': True})  # Отправляем JSON-ответ об успешном обновлении
        except Project.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Проект не найден'}, status=404)  # Отправляем JSON-ответ с ошибкой 404 Not Found
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)  # Отправляем JSON-ответ с ошибкой 400 Bad Request
    else:
        return JsonResponse({'error': 'Метод не поддерживается'}, status=405)  # Отправляем JSON-ответ с ошибкой и статусом 405 Method Not Allowed для GET-запросов

def project_view(request, project_id):
    project = get_object_or_404(Project, pk=project_id)
    return render(request, 'myapp/project_view.html', {'project': project})
    return render(request, 'myapp/project_detail.html', {'project': project})

def project_edit(request, project_id):
    project = get_object_or_404(Project, pk=project_id)
    return render(request, 'myapp/project_edit2.html', {'project': project})
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

class BlockList(generics.ListAPIView):
    serializer_class = BlockSerializer

    def get_queryset(self):
        project_id = self.kwargs['project_id']
        return Block.objects.filter(project__id=project_id)

class Line3DList(generics.ListAPIView):
    serializer_class = Line3DSerializer

    def get_queryset(self):
        project_id = self.kwargs['project_id']
        return Line3D.objects.filter(project__id=project_id)

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

