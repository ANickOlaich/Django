from django.db import migrations

def create_material_types(apps, schema_editor):
    MaterialType = apps.get_model('myapp', 'MaterialType')
    MaterialType.objects.bulk_create([
        MaterialType(id=1, name='Default'),
        MaterialType(id=2, name='ДСП'),
        MaterialType(id=3, name='Стільниці'),
        MaterialType(id=4, name='Фасади'),
        MaterialType(id=5, name='Фурнитура'),
        MaterialType(id=6, name='Скло')
    ])

class Migration(migrations.Migration):

    dependencies = [
       ('myapp', '0036_materialtype_remove_material_opacity_and_more'),
    ]

    operations = [
        migrations.RunPython(create_material_types),
    ]
