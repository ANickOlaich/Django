from django.shortcuts import render, redirect, get_object_or_404
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse, HttpResponseRedirect
from .models import Fasteners, Material, FastenerType
from .forms import FastenersForm
import json
from django.urls import reverse




def fasteners_list(request):
    """
    Представление для отображения списка фурнитуры.
    """
    fasteners = Fasteners.objects.all()
    return render(request, 'fasteners/fasteners_list.html', {'fasteners': fasteners})

def fasteners_detail(request, fasteners_id):
    """
    Представление для отображения детальной информации о конкретной фурнитуре.
    """
    fasteners = get_object_or_404(Fasteners, id=fasteners_id)

    # Получаем список материалов, где id типа материала равен 5
    materials = Material.objects.filter(material_type_id=5)
    types_of_fasteners = FastenerType.objects.all()

    if request.method == 'POST':
        # Обработка данных из формы POST
        fasteners.name = request.POST.get('name')
        fasteners.position_x = request.POST.get('position_x')
        fasteners.position_y = request.POST.get('position_y')
        fasteners.position_z = request.POST.get('position_z')
        fasteners.rot_x = request.POST.get('rot_x')
        fasteners.rot_y = request.POST.get('rot_y')
        fasteners.rot_z = request.POST.get('rot_z')
        fasteners.rot_w = request.POST.get('rot_w')
        fasteners.material = Material.objects.get(id=request.POST.get('material'))
        fasteners.fastener_type = FastenerType.objects.get(id=request.POST.get('fastener_type'))
        fasteners.description = request.POST.get('description')
        fasteners.page_link = request.POST.get('page_link')
         # Проверяем, был ли загружен файл изображения
        if 'image' in request.FILES:
            # Получаем файл изображения из запроса
            image_file = request.FILES['image']
            # Сохраняем изображение в поле модели Fasteners
            fasteners.image = image_file

            # Сохранение изменений в базе данных
        fasteners.save()

        # Перенаправление на страницу с списком фурнитуры
        return HttpResponseRedirect(reverse('fasteners_list'))

    fasteners_data = {
        'name': fasteners.name,
        'position_x': fasteners.position_x,
        'position_y': fasteners.position_y,
        'position_z': fasteners.position_z,
        'rot_x': fasteners.rot_x,
        'rot_y': fasteners.rot_y,
        'rot_z': fasteners.rot_z,
        'rot_w': fasteners.rot_w,
        'material': fasteners.material.id,
        'stl_file': fasteners.stl_file.url if fasteners.stl_file else None,
        'type': fasteners.fastener_type.id,
        'description': fasteners.description,
        # Добавьте другие поля, если необходимо
    }
    fasteners_json = json.dumps(fasteners_data, cls=DjangoJSONEncoder)
    return render(request, 'fasteners/fasteners_detail.html', {'fasteners_json': fasteners_json, 'fasteners':fasteners, 'materials': materials, 'types':types_of_fasteners})



def create_fasteners(request):
    if request.method == 'POST':
        form = FastenersForm(request.POST, request.FILES)
        if form.is_valid():
            print(request.FILES)  # Вывод данных о файлах в консоль
            new_fasteners = form.save()
            fasteners_id = new_fasteners.id
            url = f'/fasteners/{fasteners_id}/'
            return redirect(url)
    else:
        form = FastenersForm()
    return render(request, 'fasteners/fasteners_list.html', {'form': form})