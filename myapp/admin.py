# myapp/admin.py
from django.contrib import admin
from .models import Project, Block, Panel, Contour, Material, Size, Line3D
from django.urls import reverse
from django.utils.html import format_html
import json
import os
import shutil  # Импортируем модуль shutil для удаления директорий
from .forms import MaterialForm
from .import_json import import_size, import_panels, import_line 

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
        frontend_url = reverse('project_view', kwargs={'project_id': obj.id})
        #admin_url = reverse('admin:your_app_name_project_change', args=[obj.id])
        link = f'<a class="button" href="{frontend_url}" target="_blank">На сайте</a>'
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
                        import_size(obj,json_data.get('Size',[]))   #Импорт размеров
                        import_panels(obj,json_data.get('Panel', []))       #Импорт панелей
                        import_panels(obj,json_data.get('Extrusion', []))       #Импорт тел выдавливания
                        import_line(obj,json_data.get('Line3D', []))       #Импорт линий
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
admin.site.register(Line3D)
admin.site.register(Size)
admin.site.register(Material, MaterialAdmin)


