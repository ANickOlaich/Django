# Generated by Django 5.0 on 2024-03-16 16:58

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0039_alter_material_article'),
    ]

    operations = [
        migrations.CreateModel(
            name='FastenerType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(default='Default', max_length=50)),
            ],
        ),
        migrations.AddField(
            model_name='fasteners',
            name='fastener_type',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='myapp.fastenertype'),
        ),
    ]
