# Generated by Django 5.0 on 2024-01-10 19:24

import colorfield.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0008_material_color_material_opacity_material_transparent'),
    ]

    operations = [
        migrations.AlterField(
            model_name='material',
            name='color',
            field=colorfield.fields.ColorField(default='#ffffff', image_field=None, max_length=25, samples=None),
        ),
    ]
