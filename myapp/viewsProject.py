import json
import codecs
from django.shortcuts import render, redirect
from .forms import ProjectForm
from .models import Project, Fasteners, FastenerType, MaterialType, Material
from django.contrib.auth.models import User

def upload_project(request):
    if request.method == 'POST':
        form = ProjectForm(request.POST, request.FILES)
        if form.is_valid():
            json_file = form.cleaned_data['json_file']
            try:
                data = json.load(codecs.getreader("cp1251")(json_file))
                project_data = data.get('Model')
                
                # Получение имени проекта из формы
                project_name = form.cleaned_data['name']
                
                # Проверка существования проекта с указанным именем
                if Project.objects.filter(name=project_name).exists():
                    # Проект с таким именем уже существует
                    form.add_error('name', 'Проект с таким именем уже существует.')
                    return render(request, 'upload/upload.html', {'form': form})
                
                project = {
                    'name': project_name,
                    'description': request.POST.get('description'),
                    'author': request.user.id,
                    'status': 'new',
                    'size_x': project_data['Size']['x'],
                    'size_y': project_data['Size']['y'],
                    'size_z': project_data['Size']['z'],
                    'visibility': data.get('visibility', False)
                }

                request.session['project_data'] = project
                request.session['data'] = data

                return redirect('check_fasteners')
            except json.JSONDecodeError:
                pass
    else:
        form = ProjectForm()
    
    return render(request, 'upload/upload.html', {'form': form})
def check_fasteners(request):
    if request.method == 'POST':
        print('POST')
        print(request.body)
         # Декодируем объект байтов в строку
        data_str = request.body.decode('utf-8')
        # Сохраняем строку в сеансе
        request.session['fasteners_data'] = data_str
        return redirect('check_materials')
    """
    Представление для отображения списка фурнитуры.
    """
  # Получить данные JSON из сеанса
    data = request.session.get('data', {})
    fasteners_data = data.get('Fastener')
    
    unique_fasteners = []
   # Проход по списку фурнитур
    for idx, fastener in enumerate(fasteners_data):
        # Проверка, есть ли такая фурнитура уже в списке уникальных
        is_unique = True
        for unique_fastener in unique_fasteners:
            if unique_fastener['Name'] == fastener['Name']:
                is_unique = False
                break
        
        # Если фурнитура уникальна, добавляем её в список
        if is_unique:
            unique_fasteners.append({
                'Id': idx + 1,  # Добавляем 1, чтобы начать с 1 вместо 0
                'Name': fastener['Name'],
                'Image': '',
                'inBase':0,
            })
    unique_fastener_json = json.dumps(unique_fasteners)

    # Проверяем результат
    for fastener in unique_fasteners:
        print(fastener)

    fasteners = Fasteners.objects.all()
    fasteners_type = FastenerType.objects.all()

   
    print(fasteners)
    print(fasteners_type)
    return render(request, 'upload/fasteners.html', {'fasteners': fasteners, 'fasteners_type':fasteners_type, 'in_project':unique_fasteners, 'in_project_json':unique_fastener_json})

def check_materials(request):
    if request.method == 'POST':
        print('POST')
        print(request.body)
         # Декодируем объект байтов в строку
        data_str = request.body.decode('utf-8')
        # Сохраняем строку в сеансе
        request.session['materials_data'] = data_str
        return redirect('check_project')
    """
    Представление для отображения списка фурнитуры.
    """
  # Получить данные JSON из сеанса
    data = request.session.get('data', {})
    materials_data = data.get('materials')
    print(materials_data)

    unique_materials = []
   # Проход по списку фурнитур
    for idx, material in enumerate(materials_data):
        # Проверка, есть ли такая фурнитура уже в списке уникальных
        is_unique = True
        for unique_material in unique_materials:
            if unique_material['name'] == material['name']:
                is_unique = False
                break
        
        # Если фурнитура уникальна, добавляем её в список
        if is_unique:
            unique_materials.append({
                'id': idx + 1,  # Добавляем 1, чтобы начать с 1 вместо 0
                'name': material['name'],
                'image': '',
                'inBase':0,
            })
    unique_materials_json = json.dumps(unique_materials)

    # Проверяем результат
    for material in unique_materials:
        print(material)


    materials = Material.objects.all()
    materials_type = MaterialType.objects.all()
    return render(request, 'upload/materials.html', {'materials': materials, 'materials_type':materials_type, 'in_project':unique_materials, 'in_project_json':unique_materials_json})

def check_project(request):
    if request.method == 'POST':
        print('POST')
        print(request.body)
        request.session['materials_data'] = request.body
        return redirect('check_')
    """
    Представление для отображения списка фурнитуры.
    """
  # Получить данные из сессии
    data = request.session.get('data', {})
    materials_data = request.session.get('materials_data', {})
    fasteners_data = request.session.get('fasteners_data', {})
    project_data = request.session.get('project_data',{})
    
     # Вывести данные из сессии в консоль
    print("Data from session:")
    print("Materials data:", materials_data)
    print("Fasteners data:", fasteners_data)
    print("Project data:", project_data)

    if request.user.is_authenticated:
        user_profile = request.user
        if not Project.objects.filter(name=project_data['name']).exists():
            # Запись с указанным именем не существует, можно создать новую запись
            project = Project.objects.create(
                name=project_data['name'],
                description=project_data['description'],
                author=user_profile,
                status=project_data['status'],
                size_x=project_data['size_x'],
                size_y=project_data['size_y'],
                size_z=project_data['size_z'],
                visibility=project_data['visibility']
            )


    return render(request, 'upload/project.html')