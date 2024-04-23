# myapp/models.py
from django.db import models
from colorfield.fields import ColorField
from django.contrib.auth.models import User, Group

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    groups = models.ManyToManyField(Group, blank=True)

    def __str__(self):
        return self.user.username


def project_json_upload_to(instance, filename):
    return f'{filename}'

class Project(models.Model):
    STATUS_CHOICES = [
        ('new', 'Новый'),
        ('in_progress', 'В работе'),
        ('completed', 'Окончен'),
    ]
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)  # Используем ForeignKey для указания на UserProfile
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Новый')
    image = models.ImageField(upload_to='images/', blank=True, null=True)
    json_file = models.FileField(upload_to='json/', blank=True, null=True)
    walls = models.FileField(upload_to='walls/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    size_x = models.FloatField(default = 2000)
    size_y = models.FloatField(default = 2000)
    size_z = models.FloatField(default = 2000)
    visibility = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Block(models.Model):
    uid = models.IntegerField(default=1)
    name = models.CharField(max_length=255)
    visibility = models.BooleanField(default=True)
    color = models.CharField(max_length=7, default="#FFFFFF")
    length = models.FloatField(default=0.0)
    width = models.FloatField(default=0.0)
    depth = models.FloatField(default=0.0)
    position_x = models.FloatField(default=0.0)
    position_y = models.FloatField(default=0.0)
    position_z = models.FloatField(default=0.0)
    rotation_x = models.FloatField(default=0.0)
    rotation_y = models.FloatField(default=0.0)
    rotation_z = models.FloatField(default=0.0)
    rotation_w = models.FloatField(default=1.0)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    parent =  models.IntegerField(default=1)
    anim_type = models.IntegerField(default=0)
    furn_type = models.CharField(max_length = 20,default="")
    anim_axis_start_x = models.FloatField(default=0.0)
    anim_axis_start_y = models.FloatField(default=0.0)
    anim_axis_start_z = models.FloatField(default=0.0)
    anim_axis_end_x = models.FloatField(default=0.0)
    anim_axis_end_y = models.FloatField(default=0.0)
    anim_axis_end_z = models.FloatField(default=0.0)

    
    def __str__(self):
        return self.name

class MaterialType(models.Model):
    name = models.CharField(max_length=255, help_text="Наименование типа материала")
    roughness = models.FloatField(default=0.5, help_text="Степень матовости. 0 - Полностью блестящий, 1 - Полностью матовый)")
    metalness = models.FloatField(default=0, help_text="Степень металлического блеска (от 0 до 1)")
    transmission = models.FloatField(default=0, help_text="Прозрачность. 0 - Не прозрачный, 1 - полностью прозрачный")
    opacity = models.FloatField(default=1.0, help_text="Прозрачность материала (от 0 до 1)")
    clearcoat = models.FloatField(default=0, help_text="Количество покрытия")
    clearcoatRoughness = models.FloatField(default=0, help_text="Шероховатость покрытия")
    reflectivity = models.FloatField(default=0.2, help_text="Коэффициент отражения (от 0 до 1)")
    sorted =  models.IntegerField(default=100)

    def __str__(self):
        return self.name

class Material(models.Model):
    name = models.CharField(max_length=255, help_text="Наименование материала")
    article = models.CharField(max_length=255, blank=True, help_text="Артикул")
    page_link = models.URLField(max_length=255, blank=True, null=True, help_text="Ссылка на сайт поставщика")
    texture_link = models.ImageField(upload_to='textures/', blank=True, null=True, help_text="Текстура")
    roughness = models.FloatField(default=0.5, help_text="Степень матовости. 0 - Полностью блестящий, 1 - Полностью матовый)")
    metalness = models.FloatField(default=0, help_text="Степень металлического блеска (от 0 до 1)")
    transmission = models.FloatField(default=0, help_text="Прозрачность. 0 - Не прозрачный, 1 - полностью прозрачный")
    clearcoat = models.FloatField(default=0, help_text="Количество покрытия")
    clearcoatRoughness = models.FloatField(default=0, help_text="Шероховатость покрытия")
    reflectivity = models.FloatField(default=0.2, help_text="Коэффициент отражения (от 0 до 1)")
    color = ColorField(default='#ffffff', help_text="Цвет")
    isNew = models.BooleanField(default=True, help_text="Новый материал?")
    material_type = models.ForeignKey(MaterialType, on_delete=models.CASCADE, related_name='materials', help_text="Тип материала", default=1)
    image = models.ImageField(upload_to='materials/images/', blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)

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
    block = models.IntegerField(default=1)
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
    block = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.project} - {self.size} "

class Line3D(models.Model):
    name = models.CharField(max_length=50)
    position_x = models.FloatField(default=0)
    position_y = models.FloatField(default=0)
    position_z = models.FloatField(default=0)
    rot_x = models.FloatField(default=0)
    rot_y = models.FloatField(default=0)
    rot_z = models.FloatField(default=0)
    rot_w = models.FloatField(default=1)
    pos1_x = models.FloatField()
    pos1_y = models.FloatField()
    pos1_z = models.FloatField()
    pos2_x = models.FloatField()
    pos2_y = models.FloatField()
    pos2_z = models.FloatField()
    project = models.ForeignKey(Project, on_delete=models.CASCADE, default=0)
    block = models.IntegerField(default=1)

    def __str__(self):
        return self.name

class FastenerType(models.Model):
    name = models.CharField(max_length=50, default='Default')

    def __str__(self):
        return self.name

class Fasteners(models.Model):
    name = models.CharField(max_length=50, default='New')
    description = models.TextField(blank=True, null=True)  # Добавлено поле для описания
    position_x = models.FloatField(default=0)
    position_y = models.FloatField(default=0)
    position_z = models.FloatField(default=0)
    rot_x = models.FloatField(default=0)
    rot_y = models.FloatField(default=0)
    rot_z = models.FloatField(default=0)
    rot_w = models.FloatField(default=1)
    material = models.ForeignKey(Material, on_delete=models.CASCADE, default=1)
    fastener_type = models.ForeignKey(FastenerType, on_delete=models.CASCADE, default=1)
    stl_file = models.FileField(upload_to='fasteners/', blank=True, null=True)
    image = models.ImageField(upload_to='fasteners/images/', blank=True, null=True)
    page_link = models.URLField(max_length=255, blank=True, null=True, help_text="Ссылка на сайт поставщика")

    def __str__(self):
        return self.name





