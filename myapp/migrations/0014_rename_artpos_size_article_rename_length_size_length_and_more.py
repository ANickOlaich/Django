# Generated by Django 5.0 on 2024-01-10 20:29

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0013_size_project'),
    ]

    operations = [
        migrations.RenameField(
            model_name='size',
            old_name='ArtPos',
            new_name='article',
        ),
        migrations.RenameField(
            model_name='size',
            old_name='Length',
            new_name='length',
        ),
        migrations.RenameField(
            model_name='size',
            old_name='PositionX',
            new_name='pos_x',
        ),
        migrations.RenameField(
            model_name='size',
            old_name='PositionY',
            new_name='pos_y',
        ),
        migrations.RenameField(
            model_name='size',
            old_name='PositionZ',
            new_name='pos_z',
        ),
        migrations.RenameField(
            model_name='size',
            old_name='RotW',
            new_name='rot_w',
        ),
        migrations.RenameField(
            model_name='size',
            old_name='RotX',
            new_name='rot_x',
        ),
        migrations.RenameField(
            model_name='size',
            old_name='RotY',
            new_name='rot_y',
        ),
        migrations.RenameField(
            model_name='size',
            old_name='RotZ',
            new_name='rot_z',
        ),
        migrations.RenameField(
            model_name='size',
            old_name='Size',
            new_name='size',
        ),
        migrations.RenameField(
            model_name='size',
            old_name='Width',
            new_name='width',
        ),
    ]
