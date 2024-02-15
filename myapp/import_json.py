from .models import Project, Block, Panel, Contour, Material, Size, Line3D

def import_size(obj,size_datas):
    for size_data in size_datas:
                            print(f"size_data: {size_data}")
                            Size.objects.create(
                                project=obj,
                                article = size_data['ArtPos'],
                                pos_x = size_data['PositionX'],
                                pos_y = size_data['PositionY'],
                                pos_z = size_data['PositionZ'],
                                rot_x = size_data['RotX'],
                                rot_y = size_data['RotY'],
                                rot_z = size_data['RotZ'],
                                rot_w = size_data['RotW'],
                                size = size_data['Size'],
                                length = size_data['Length'],
                                width = size_data['Width'],
                            )

def import_panels(obj,panels_data):
    for panel_data in panels_data:
                            #print(f"panel_data: {panel_data}")

                            # Получаем или создаем блок
                            block, created = Block.objects.get_or_create(
                                name=panel_data['Owner'],  # Используем имя владельца панели как имя блока
                                project=obj,
                                defaults={
                                    'visibility': True,
                                    'color': '#FFFFFF',
                                    'position_x': 0.0,
                                    'position_y': 0.0,
                                    'position_z': 0.0,
                                    'rotation_x': 0.0,
                                    'rotation_y': 0.0,
                                    'rotation_z': 0.0,
                                    'rotation_w': 1.0,
                                }
                            )
                            # Получаем или создаем материал
                            mat_id = 0
                            if "MaterialId" in panel_data:
                                mat_id = panel_data["MaterialId"]
                            
                            material_instance, created = Material.objects.get_or_create(article=mat_id, defaults={
                                'name': panel_data['MaterialName'],
                                'article': mat_id,  # Добавьте вашу логику для получения артикула
                                'page_link': '',  # Добавьте вашу логику для получения ссылки на страницу
                                'texture_link': ''  # Добавьте вашу логику для получения ссылки на текстуру
                            })
                            # Добавляем или обновляем панель в блоке
                            panel = Panel.objects.create(
                                name=panel_data['Name'],
                                project=obj,
                                block=block,
                                position=panel_data['ArtPos'],
                                length=panel_data['Length'],
                                width=panel_data['Width'],
                                height=panel_data['Thickness'],
                                position_x=panel_data['PositionX'],
                                position_y=panel_data['PositionY'],
                                position_z=panel_data['PositionZ'],
                                material=material_instance,
                                rotation_x=panel_data['RotX'],
                                rotation_y=panel_data['RotY'],
                                rotation_z=panel_data['RotZ'],
                                rotation_w=panel_data['RotW'],
                                texture_orientation=panel_data['TextureOrientation']
                            )
                            # Обработка элементов контура
                            print(f"panel_data: {panel_data['ArtPos']}")
                            contours_data = panel_data.get('Cont', [])
                            
                            for contour_data in contours_data:
                                if contour_data:
                                    print(f"contour_data: {contour_data}")
                                    Contour.objects.create(
                                        type=contour_data['Type'],
                                        pos1x=contour_data['Pos1x'],
                                        pos2x=contour_data['Pos2x'],
                                        pos1y=contour_data['Pos1y'],
                                        pos2y=contour_data['Pos2y'],
                                        center_x=contour_data['CenterX'],
                                        center_y=contour_data['CenterY'],
                                        radius=contour_data['Radius'],
                                        start_angle=contour_data['StartAngle'],
                                        end_angle=contour_data['EndAngle'],
                                        arc_dir=contour_data['ArcDir'],
                                        panel=panel,
                                    )
                            #print(f"panel: {panel}")

def import_line(obj, line_datas):
    for line_data in line_datas:
        Line3D.objects.create(
            project=obj,
            name=line_data['Name'],
            position_x=line_data['PositionX'],
            position_y=line_data['PositionY'],
            position_z=line_data['PositionZ'],
            rot_x=line_data['RotX'],
            rot_y=line_data['RotY'],
            rot_z=line_data['RotZ'],
            rot_w=line_data['RotW'],
            pos1_x=line_data['Pos1']['x'],
            pos1_y=line_data['Pos1']['y'],
            pos1_z=line_data['Pos1']['z'],
            pos2_x=line_data['Pos2']['x'],
            pos2_y=line_data['Pos2']['y'],
            pos2_z=line_data['Pos2']['z'],
        )

