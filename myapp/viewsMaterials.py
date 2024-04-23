from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import  Material, MaterialType
from .forms import MaterialForm
import base64
from django.conf import settings
import os


def materials_list(request):
    """
    Представление для отображения списка материалов.
    """
    materials = Material.objects.all()
    types_of_materials = MaterialType.objects.all() 
    return render(request, 'materials/materials_list.html', {'materials': materials, 'types': types_of_materials})

def material_edit(request, material_id):
    if material_id == 0:  # Проверяем, является ли material_id нулем
        material = Material.objects.create(
            name="New",
            article="",
            page_link="",
            texture_link="",
            roughness=0.5,
            metalness=0,
            transmission=0,
            clearcoat=0,
            clearcoatRoughness=0,
            reflectivity=0.1,
            color="#ffffff",
            isNew=True,
            material_type=MaterialType.objects.get(pk=1),
            image="",
            author=request.user
        )
    else:
        try:
            material = Material.objects.get(pk=material_id)
        except Material.DoesNotExist:
            return redirect('materials_list')  # Если материал не найден, перенаправляем на список материалов

    if request.method == 'POST':
        form = MaterialForm(request.POST, request.FILES, instance=material)
        if form.is_valid():
            # Сохраняем изменения в базе данных
            form.save()

            canvas_data = request.POST.get('image')
           
            if canvas_data:
                format, imgstr = canvas_data.split(';base64,')
                ext = format.split('/')[-1]
                data = base64.b64decode(imgstr)
                image_name = f'material_{material.pk}_image.{ext}'
                image_path = os.path.join(settings.MEDIA_ROOT, 'materials', image_name)
                with open(image_path, 'wb') as f:
                    f.write(data)
                # Обновляем поле image модели Material
                material.image = os.path.join('materials', image_name)
                material.save()         
            return redirect('materials_list')
        else:
            print(form.errors)  # Вывод ошибок в консоль для отладки
    else:
        form = MaterialForm(instance=material)

    types_of_materials = MaterialType.objects.all()
    return render(request, 'materials/material_edit.html', {'material': material, 'types': types_of_materials, 'form': form})