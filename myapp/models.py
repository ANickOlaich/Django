# myapp/models.py
from django.db import models
from colorfield.fields import ColorField


def project_json_upload_to(instance, filename):
    return f'{filename}'

class Project(models.Model):
    STATUS_CHOICES = [
        ('new', 'Новый'),
        ('in_progress', 'В работе'),
        ('completed', 'Окончен'),
    ]
    name = models.CharField(max_length=255)
    description = models.TextField()
    author = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Новый')
    image = models.ImageField(upload_to='images/', blank=True, null=True)
    json_file = models.FileField(upload_to=project_json_upload_to, blank=True, null=True)
    walls = models.FileField(upload_to='walls/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    size_x = models.FloatField(default = 2000)
    size_y = models.FloatField(default = 2000)
    size_z = models.FloatField(default = 2000)
    visibility = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Block(models.Model):
    name = models.CharField(max_length=255)
    visibility = models.BooleanField(default=True)
    color = models.CharField(max_length=7, default="#FFFFFF")
    position_x = models.FloatField(default=0.0)
    position_y = models.FloatField(default=0.0)
    position_z = models.FloatField(default=0.0)
    rotation_x = models.FloatField(default=0.0)
    rotation_y = models.FloatField(default=0.0)
    rotation_z = models.FloatField(default=0.0)
    rotation_w = models.FloatField(default=1.0)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.name



class Material(models.Model):
    name = models.CharField(max_length=255, help_text="Наименование материала")
    article = models.CharField(max_length=255, help_text="Артикул")
    page_link = models.URLField(max_length=255, blank=True, null=True, help_text="Ссылка на сайт поставщика")
    texture_link = models.ImageField(upload_to='textures/', blank=True, null=True, help_text="Текстура")
    roughness = models.FloatField(default=0.5, help_text="Коэффициент шероховатости")
    metalness = models.FloatField(default=0.2, help_text="Коэффициент металличности")
    opacity = models.FloatField(default=1.0, help_text="Прозрачность материала (от 0 до 1)")
    clearcoat = models.FloatField(default=1, help_text="Количество покрытия")
    clearcoatRoughness = models.FloatField(default=0, help_text="Шероховатость покрытия")
    reflectivity = models.FloatField(default=0.2, help_text="Коэффициент отражения (от 0 до 1)")
    color = ColorField(default='#ffffff', help_text="Цвет")
    transparent = models.BooleanField(default=False, help_text="Прозрачность")

    def __str__(self):
        return self.name


class Panel(models.Model):
    name = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    length = models.FloatField(default=0.0)
    width = models.FloatField(default=0.0)
    height = models.FloatField(default=0.0)
    position_x = models.FloatField(default=0.0)
    position_y = models.FloatField(default=0.0)
    position_z = models.FloatField(default=0.0)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    block = models.ForeignKey(Block, on_delete=models.CASCADE, related_name='panels')  # Однонаправленное отношение к блоку
    rotation_x = models.FloatField(default=0.0)
    rotation_y = models.FloatField(default=0.0)
    rotation_z = models.FloatField(default=0.0)
    rotation_w = models.FloatField(default=1.0)
    texture_orientation = models.IntegerField(default=1)
    material = models.ForeignKey(Material, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Contour(models.Model):
    type = models.IntegerField()
    pos1x = models.FloatField()
    pos2x = models.FloatField()
    pos1y = models.FloatField()
    pos2y = models.FloatField()
    center_x = models.FloatField()
    center_y = models.FloatField()
    radius = models.FloatField()
    start_angle = models.FloatField()
    end_angle = models.FloatField()
    arc_dir = models.IntegerField()
    panel = models.ForeignKey('Panel', on_delete=models.CASCADE, related_name='contours')

    def __str__(self):
        return f"Contour {self.pk} for Panel {self.panel.pk}"

class Size(models.Model):
    article = models.CharField(max_length=255)
    pos_x = models.FloatField(default=0)
    pos_y = models.FloatField(default=0)
    pos_z = models.FloatField(default=0)
    rot_x = models.FloatField(default=0)
    rot_y = models.FloatField(default=0)
    rot_z = models.FloatField(default=0)
    rot_w = models.FloatField(default=1)
    size = models.FloatField(default=0)
    length = models.FloatField(default=0)
    width = models.FloatField(default=0)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, default=0)

    def __str__(self):
        return f"{self.project} - {self.size} "




