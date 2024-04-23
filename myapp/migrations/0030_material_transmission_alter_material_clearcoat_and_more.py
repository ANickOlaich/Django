# Generated by Django 5.0 on 2024-03-15 16:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0029_block_anim_axis_end_x_block_anim_axis_end_y_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='material',
            name='transmission',
            field=models.FloatField(default=0, help_text='Прозрачность. 0 - Не прозрачный, 1 - полностью прозрачный'),
        ),
        migrations.AlterField(
            model_name='material',
            name='clearcoat',
            field=models.FloatField(default=0, help_text='Количество покрытия'),
        ),
        migrations.AlterField(
            model_name='material',
            name='metalness',
            field=models.FloatField(default=0, help_text='Степень металлического блеска (от 0 до 1)'),
        ),
        migrations.AlterField(
            model_name='material',
            name='roughness',
            field=models.FloatField(default=0.5, help_text='Степень матовости. 0 - Полностью блестящий, 1 - Полностью матовый)'),
        ),
    ]