# Generated by Django 5.0 on 2024-03-10 18:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0022_block_parent'),
    ]

    operations = [
        migrations.AddField(
            model_name='block',
            name='uid',
            field=models.IntegerField(default=1),
        ),
    ]