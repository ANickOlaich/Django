# Generated by Django 5.0 on 2024-01-10 20:25

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0012_size'),
    ]

    operations = [
        migrations.AddField(
            model_name='size',
            name='project',
            field=models.ForeignKey(default=0, on_delete=django.db.models.deletion.CASCADE, to='myapp.project'),
        ),
    ]
