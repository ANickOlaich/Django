# myapp/admin.py
from django.contrib import admin
from .models import Project, Block, Panel, Contour, Material, Size
from django.urls import reverse
from django.utils.html import format_html
import json
import os
import shutil  # Импортируем модуль shutil для удаления директорий
from .forms import MaterialForm

class ProjectAdmin(admin.ModelAdmin):
    changelist_view_template = 'myapp/project_change_list.html'
    list_display = ('name','visibility', 'status', 'author', 'display_image', 'frontend_link')

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if obj:  # Если редактируется существующий проект
            form.base_fields['size_x'].widget.attrs['style'] = 'display:none;'
            form.base_fields['size_y'].widget.attrs['style'] = 'display:none;'
            form.base_fields['size_z'].widget.attrs['style'] = 'display:none;'
        return form

    def display_image(self, obj):
        return format_html('<img src="{}" width="50" height="50" />', obj.image)

    display_image.short_description = 'Image'

    def frontend_link(self, obj):
        frontend_url = reverse('project_detail', kwargs={'project_id': obj.id})
        #admin_url = reverse('admin:your_app_name_project_change', args=[obj.id])
        link = f'<a class="button" href="{frontend_url}?Mode=admin" target="_blank">На сайте</a>'
        return format_html(link)

    frontend_link.short_description = 'Frontend Link'

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        #extra_context['upload_json_url'] = reverse('upload_json')
        return super().changelist_view(request, extra_context=extra_context)

    def get_changeform_initial_data(self, request):
        # Предзаполняем поле 'author' исходным значением, например, именем текущего пользователя
        initial = super().get_changeform_initial_data(request)
        initial['author'] = request.user.username
        return initial

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
       
        json_file = form.cleaned_data.get('json_file')
        if json_file:
            try:
                # Сохраняем файл на диск
                file_path = os.path.join( json_file.name)
                print("-----------------------------------------------------------")
                #print(file_path)
                #print(json_file)

                with open(file_path, 'wb') as destination:
                    for chunk in json_file.chunks():
                        destination.write(chunk)

                # Теперь читаем содержимое файла с кодировкой Windows-1251
                with open(file_path, 'r', encoding='cp1251') as json_file:
                    json_content = json_file.read()
                    if json_content:
                        json_data = json.loads(json_content)
                        project_data = json_data.get('Model')
                        print(f"project_data: {project_data}")
                        print(f"project_data: {obj}")
                        obj.size_x = project_data['Size']['x']
                        obj.size_y = project_data['Size']['y']
                        obj.size_z = project_data['Size']['z']
                          # Если объект новый и author не установлен, установить его на имя текущего пользователя
                       
                        
                        size_datas = json_data.get('Size',[])
                        for size_data in size_datas:
                            print(f"size_data: {size_data}")
                            Size.objects.create(
                                project=obj,
                                article = size_data['ArtPos'],
                                pos_x = size_data['PositionX'],
                                pos_y = size_data['PositionY'],
                                pos_z = size_data['PositionZ'],
                                rot_x = size_data['RotX'],
                                rot_y = size_data['RotY'],
                                rot_z = size_data['RotZ'],
                                rot_w = size_data['RotW'],
                                size = size_data['Size'],
                                length = size_data['Length'],
                                width = size_data['Width'],
                            )
                        # Добавляем или обновляем панели в проекте
                        panels_data = json_data.get('Panel', [])
                        #print(f"panels_data: {panels_data}")
                        for panel_data in panels_data:
                            #print(f"panel_data: {panel_data}")

                            # Получаем или создаем блок
                            block, created = Block.objects.get_or_create(
                                name=panel_data['Owner'],  # Используем имя владельца панели как имя блока
                                project=obj,
                                defaults={
                                    'visibility': True,
                                    'color': '#FFFFFF',
                                    'position_x': 0.0,
                                    'position_y': 0.0,
                                    'position_z': 0.0,
                                    'rotation_x': 0.0,
                                    'rotation_y': 0.0,
                                    'rotation_z': 0.0,
                                    'rotation_w': 1.0,
                                }
                            )
                            # Получаем или создаем материал
                            mat_id = 0
                            if "MaterialId" in panel_data:
                                mat_id = panel_data["MaterialId"]
                            
                            material_instance, created = Material.objects.get_or_create(article=mat_id, defaults={
                                'name': panel_data['MaterialName'],
                                'article': mat_id,  # Добавьте вашу логику для получения артикула
                                'page_link': '',  # Добавьте вашу логику для получения ссылки на страницу
                                'texture_link': ''  # Добавьте вашу логику для получения ссылки на текстуру
                            })
                            # Добавляем или обновляем панель в блоке
                            panel = Panel.objects.create(
                                name=panel_data['Name'],
                                project=obj,
                                block=block,
                                position=panel_data['ArtPos'],
                                length=panel_data['Length'],
                                width=panel_data['Width'],
                                height=panel_data['Thickness'],
                                position_x=panel_data['PositionX'],
                                position_y=panel_data['PositionY'],
                                position_z=panel_data['PositionZ'],
                                material=material_instance,
                                rotation_x=panel_data['RotX'],
                                rotation_y=panel_data['RotY'],
                                rotation_z=panel_data['RotZ'],
                                rotation_w=panel_data['RotW'],
                                texture_orientation=panel_data['TextureOrientation']
                            )
                            # Обработка элементов контура
                            print(f"panel_data: {panel_data['ArtPos']}")
                            contours_data = panel_data.get('Cont', [])
                            
                            for contour_data in contours_data:
                                if contour_data:
                                    print(f"contour_data: {contour_data}")
                                    Contour.objects.create(
                                        type=contour_data['Type'],
                                        pos1x=contour_data['Pos1x'],
                                        pos2x=contour_data['Pos2x'],
                                        pos1y=contour_data['Pos1y'],
                                        pos2y=contour_data['Pos2y'],
                                        center_x=contour_data['CenterX'],
                                        center_y=contour_data['CenterY'],
                                        radius=contour_data['Radius'],
                                        start_angle=contour_data['StartAngle'],
                                        end_angle=contour_data['EndAngle'],
                                        arc_dir=contour_data['ArcDir'],
                                        panel=panel,
                                    )
                            #print(f"panel: {panel}")

                        #print("Панели успешно добавлены или обновлены.")

                         # Добавляем или обновляем тела выдавливания в проекте
                        panels_data = json_data.get('Extrusion', [])
                        #print(f"panels_data: {panels_data}")
                        for panel_data in panels_data:
                            #print(f"panel_data: {panel_data}")

                            # Получаем или создаем блок
                            block, created = Block.objects.get_or_create(
                                name=panel_data['Owner'],  # Используем имя владельца панели как имя блока
                                project=obj,
                                defaults={
                                    'visibility': True,
                                    'color': '#FFFFFF',
                                    'position_x': 0.0,
                                    'position_y': 0.0,
                                    'position_z': 0.0,
                                    'rotation_x': 0.0,
                                    'rotation_y': 0.0,
                                    'rotation_z': 0.0,
                                    'rotation_w': 1.0,
                                }
                            )
                            # Получаем или создаем материал
                            mat_id = 0
                            if "MaterialId" in panel_data:
                                mat_id = panel_data["MaterialId"]
                            
                            material_instance, created = Material.objects.get_or_create(article=mat_id, defaults={
                                'name': panel_data['MaterialName'],
                                'article': mat_id,  # Добавьте вашу логику для получения артикула
                                'page_link': '',  # Добавьте вашу логику для получения ссылки на страницу
                                'texture_link': ''  # Добавьте вашу логику для получения ссылки на текстуру
                            })
                            # Добавляем или обновляем панель в блоке
                            panel = Panel.objects.create(
                                name=panel_data['Name'],
                                project=obj,
                                block=block,
                                position=panel_data['ArtPos'],
                                length=panel_data['Length'],
                                width=panel_data['Width'],
                                height=panel_data['Thickness'],
                                position_x=panel_data['PositionX'],
                                position_y=panel_data['PositionY'],
                                position_z=panel_data['PositionZ'],
                                material=material_instance,
                                rotation_x=panel_data['RotX'],
                                rotation_y=panel_data['RotY'],
                                rotation_z=panel_data['RotZ'],
                                rotation_w=panel_data['RotW'],
                                texture_orientation=0
                            )
                            # Обработка элементов контура
                            print(f"panel_data: {panel_data['ArtPos']}")
                            contours_data = panel_data.get('Cont', [])
                            
                            for contour_data in contours_data:
                                if contour_data:
                                    print(f"contour_data: {contour_data}")
                                    Contour.objects.create(
                                        type=contour_data['Type'],
                                        pos1x=contour_data['Pos1x'],
                                        pos2x=contour_data['Pos2x'],
                                        pos1y=contour_data['Pos1y'],
                                        pos2y=contour_data['Pos2y'],
                                        center_x=contour_data['CenterX'],
                                        center_y=contour_data['CenterY'],
                                        radius=contour_data['Radius'],
                                        start_angle=contour_data['StartAngle'],
                                        end_angle=contour_data['EndAngle'],
                                        arc_dir=contour_data['ArcDir'],
                                        panel=panel,
                                    )
                            #print(f"panel: {panel}")

                        #print("Панели успешно добавлены или обновлены.")

                    else:
                        print("Файл JSON пуст.")
            except json.JSONDecodeError as e:
                print(f"Ошибка декодирования JSON-файла: {e}")
           
                
        else:
            print("Файл JSON отсутствует.")
    def project_image(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 100px; max-width: 100px;" />', obj.image)
        return "No image"

class MaterialAdmin(admin.ModelAdmin):
    list_display = ('name', 'article', 'page_link_button', 'texture_image')
    
    readonly_fields = ('texture_image',)  # чтобы избежать редактирования этого поля
    ordering = ('page_link',)  # Добавляем сортировку по полю page_link
    form = MaterialForm  # Используем вашу форму

    def page_link_button(self, obj):
        if obj.page_link:
            return format_html('<a href="{}" target="_blank">Перейти</a>', obj.page_link)
        return "No link"
    page_link_button.short_description = 'Page Link'

    def texture_image(self, obj):
        if obj.texture_link:
            return format_html('<img src="{}" style="max-height: 100px; max-width: 100px;" />', obj.texture_link.url)
        return "No image"
    texture_image.short_description = 'Texture Image'

    def display_texture_link(self, obj):
         return format_html('<img src="{}" width="50" height="50" />', obj.texture_link.url)
    display_texture_link.short_description = 'Texture Link'


    
    

admin.site.register(Project, ProjectAdmin)  # Register ProjectAdmin for the Project model
#admin.site.register(Block)
#admin.site.register(Panel)
#admin.site.register(Contour)
admin.site.register(Size)
admin.site.register(Material, MaterialAdmin)


