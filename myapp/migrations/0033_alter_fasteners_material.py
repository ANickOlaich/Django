# Generated by Django 5.0 on 2024-03-15 18:35

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0032_remove_fasteners_block_remove_fasteners_project'),
    ]

    operations = [
        migrations.AlterField(
            model_name='fasteners',
            name='material',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='myapp.material'),
        ),
    ]