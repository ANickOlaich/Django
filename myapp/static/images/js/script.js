document.addEventListener('DOMContentLoaded', function() {
    var project_id = document.getElementById('panel-info').dataset.projectId;
    var canvas = document.getElementById('renderCanvas');
    var engine = new BABYLON.Engine(canvas, true);
    var camera; // Declare camera as a global variable

    var createScene = function () {
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0,1, 0,1, 0,1, 0);
        /*
        const camera = new BABYLON.FreeCamera("camera1", 
        new BABYLON.Vector3(0, 5, -10), 
        scene);
        // Targets the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());
        // Attaches the camera to the canvas
        camera.attachControl(canvas, true);
        */
        camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 5000, new BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
        // Установка чувствительности увеличения мыши
        camera.wheelPrecision = 0.1; // Задайте свое значение чувствительности

        // Дополнительные параметры, которые могут быть настроены
        // camera.upperRadiusLimit = 20; // Максимальный радиус
        // camera.lowerRadiusLimit = 5; // Минимальный радиус
        // camera.lowerBetaLimit = 0.1; // Минимальный угол наклона
         camera.upperBetaLimit = 2* Math.PI ; // Максимальный угол наклона
        // camera.lowerAlphaLimit = 0; // Минимальный угол азимута
         camera.upperAlphaLimit = 2 * Math.PI; // Максимальный угол азимута

        const light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 1;

        const ground = BABYLON.MeshBuilder.CreateGround("ground", 
        {width: 200, height: 200}, 
        scene);

        new BABYLON.AxesViewer(scene,1000);

        

        // Создаем панели и подписи
        fetch(`/myapp/api/panels/${project_id}/`)
            .then(response => response.json())
            .then(data => {
                console.log(data);  // Обрабатывайте полученные данные здесь

                data.forEach(panelData => {
                    createPanel3(panelData, scene);
                    //createLabel(panelData, scene);
                });

                // Автоматически настраиваем камеру для охвата всех объектов
                //scene.createDefaultCameraOrLight(true, true, true);

                // Добавьте дополнительную логику или обработку данных, если необходимо
            })
           .catch(error => {
                console.error('Ошибка запроса:', error);
        });
        

        return scene;
    };

    var scene = createScene();

    engine.runRenderLoop(function() {
        scene.render();
    });

    window.addEventListener('resize', function() {
        engine.resize();
    });

    function orderPointsClockwise(points) {
        // Находим центр масс точек
        var center = points.reduce(function(acc, point) {
            return {
                x: acc.x + point.x,
                y: acc.y + point.y
            };
        }, { x: 0, y: 0 });
    
        center.x /= points.length;
        center.y /= points.length;
    
        // Сортируем точки по полярным координатам относительно центра масс
        points.sort(function(a, b) {
            var angleA = Math.atan2(a.y - center.y, a.x - center.x);
            var angleB = Math.atan2(b.y - center.y, b.x - center.x);
            return angleA - angleB;
        });
    
        return points;
    }
    
    function createPanel3(panelData, scene) {
        // Извлекаем контуры из panelData
        var lines = panelData.contours;
    
        // Создаем массив точек
        var points = [];
        lines.forEach(function (p) {
            var p1 = { x: p.pos1x, y: p.pos1y };
            var p2 = { x: p.pos2x, y: p.pos2y };
            points.push(p1);
            points.push(p2);
        });
    
        // Удаляем повторяющиеся точки
        var uniquePoints = [];
        points.forEach(function (point) {
            if (!uniquePoints.some(p => p.x === point.x && p.y === point.y)) {
                uniquePoints.push(point);
            }
        });
    
        var orderedPoints = orderPointsClockwise(uniquePoints);
        
        var corners = orderedPoints.map(p => new BABYLON.Vector2(p.x, p.y));
        
    
        const panel = new BABYLON.PolygonMeshBuilder("panel",corners,scene)
        var polygon = panel.build(0,18)
    
       
      
    
            var material = new BABYLON.StandardMaterial("material", scene);
            material.diffuseTexture = new BABYLON.Texture("/static/images/ph18329.jpg", scene);
    
            const localAxes = new BABYLON.AxesViewer(scene,500);
            localAxes.xAxis.parent = polygon;
            localAxes.yAxis.parent = polygon;
            localAxes.zAxis.parent = polygon;   
        polygon.material=material;
        
      
         // Устанавливаем кватернион вращения
         polygon.rotationQuaternion = new BABYLON.Quaternion(
            panelData.rotation_x,
            panelData.rotation_y,
            panelData.rotation_z,
            panelData.rotation_w
            
        );
          // Поворот меша на 90 градусов вокруг оси X (XY -> XZ)
       polygon.rotate(BABYLON.Axis.X, -Math.PI / 2, BABYLON.Space.WORLD);
        // Устанавливаем позицию меша
        polygon.position = new BABYLON.Vector3(panelData.position_x, panelData.position_y, panelData.position_z);
    
       
    }

    function createPanel2(panelData, scene) {
        // Извлекаем контуры из panelData
        var lines = panelData.contours;
    
        // Создаем массив точек
        var points = [];
        lines.forEach(function (p) {
            var p1 = { x: p.pos1x, y: p.pos1y };
            var p2 = { x: p.pos2x, y: p.pos2y };
            points.push(p1);
            points.push(p2);
        });
    
        // Удаляем повторяющиеся точки
        var uniquePoints = [];
        points.forEach(function (point) {
            if (!uniquePoints.some(p => p.x === point.x && p.y === point.y)) {
                uniquePoints.push(point);
            }
        });
    
        //var orderedPoints = orderPointsClockwise(uniquePoints);
        var orderedPoints = uniquePoints;
    
        // Преобразуем уникальные точки в массив Vector3 для shape
        var myShape = orderedPoints.map(p => new BABYLON.Vector3(p.x,0, p.y));
        myShape.push(myShape[0]); // Закрываем профиль
    
        // Задаем путь для ExtrudeShape
        const myPath = [
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(0,0, panelData.height)
        ];
    
            console.log(orderedPoints);
    
        // Создаем тело выдавливания
        const panelMesh = BABYLON.MeshBuilder.ExtrudePolygon(
            "panel", // Имя меша
            {
                shape: myShape,
                depth:panelData.height,
            },
            scene
        );



        const localAxes = new BABYLON.AxesViewer(scene,500);
        localAxes.xAxis.parent = panelMesh;
        localAxes.yAxis.parent = panelMesh;
        localAxes.zAxis.parent = panelMesh;
        // Создание материала PBR
            /*var material = new BABYLON.PBRMaterial("material", scene);
            material.albedoColor = new BABYLON.Color3(1, 1, 1); // Цвет поверхности*/
    
            var material = new BABYLON.StandardMaterial("material", scene);
            material.diffuseTexture = new BABYLON.Texture("/static/images/ph18329.jpg", scene);
    
            // Загрузка текстуры ламината
           /* var laminateTexture = new BABYLON.Texture("/static/images/ph18329.jpg", scene);
            material.albedoTexture = laminateTexture;*/
        panelMesh.material=material;
        // Устанавливаем позицию меша
        
      
            
       // Поворот меша на 90 градусов вокруг оси X (XY -> XZ)
       //panelMesh.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);

        /*panelMesh.rotationQuaternion = new BABYLON.Quaternion(
            panelData.rotation_x,
            panelData.rotation_y,
            panelData.rotation_z,
            panelData.rotation_w
        );*/
         

        panelMesh.position = new BABYLON.Vector3(panelData.position_x, panelData.position_y, panelData.position_z);
    }

function createPanel(panelData, scene) {
    // Извлекаем контуры из panelData
    var lines = panelData.contours;

    // Создаем массив точек
    var points = [];
    lines.forEach(function (p) {
        var p1 = { x: p.pos1x, y: p.pos1y };
        var p2 = { x: p.pos2x, y: p.pos2y };
        points.push(p1);
        points.push(p2);
    });

    // Удаляем повторяющиеся точки
    var uniquePoints = [];
    points.forEach(function (point) {
        if (!uniquePoints.some(p => p.x === point.x && p.y === point.y)) {
            uniquePoints.push(point);
        }
    });

    var orderedPoints = orderPointsClockwise(uniquePoints);
    

    // Преобразуем уникальные точки в массив Vector3 для shape
    var myShape = orderedPoints.map(p => new BABYLON.Vector3(p.x, p.y, 0));
    myShape.push(myShape[0]); // Закрываем профиль

    // Задаем путь для ExtrudeShape
    const myPath = [
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0,0, panelData.height)
    ];

        console.log(orderedPoints);

    // Создаем тело выдавливания
    const panelMesh = BABYLON.MeshBuilder.ExtrudeShape(
        "panel", // Имя меша
        {
            shape: myShape,
            path: myPath,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE,
            cap: BABYLON.Mesh.CAP_ALL,
        },
        scene
    );
    // Обновляем матрицу мира, что приведет к пересчету нормалей
    panelMesh.computeWorldMatrix(true);
    // Создание материала PBR
        /*var material = new BABYLON.PBRMaterial("material", scene);
        material.albedoColor = new BABYLON.Color3(1, 1, 1); // Цвет поверхности*/

        var material = new BABYLON.StandardMaterial("material", scene);
        material.diffuseTexture = new BABYLON.Texture("/static/images/ph18329.jpg", scene);

        // Загрузка текстуры ламината
       /* var laminateTexture = new BABYLON.Texture("/static/images/ph18329.jpg", scene);
        material.albedoTexture = laminateTexture;*/
    panelMesh.material=material;
    // Устанавливаем позицию меша
    panelMesh.position = new BABYLON.Vector3(panelData.position_x, panelData.position_y, panelData.position_z);

    // Устанавливаем кватернион вращения
    panelMesh.rotationQuaternion = new BABYLON.Quaternion(
        panelData.rotation_x,
        panelData.rotation_y,
        panelData.rotation_z,
        panelData.rotation_w
    );
}
    


    
    function createLabel(panelData, scene) {
        // Создание подписи
        var label = new BABYLON.GUI.TextBlock();
        label.text = panelData.name;
        label.color = "black";
        label.fontSize = 24;
        label.isVisibl = true;

        // Позиция подписи в экранных координатах (используйте scene.debugLayer.show() для отображения координат)
        var screenPosition = BABYLON.Vector3.Project(panelData.position, BABYLON.Matrix.Identity(), scene.getTransformMatrix(), camera.viewport);
        label.left = screenPosition.x + "px";
        label.top = screenPosition.y + "px";

        // Добавление подписи на сцену
        scene.onAfterRenderObservable.add(() => {
            if (!label.isDisposed) {
                label.text = panelData.name;
            }
        });

        // Добавление подписи в onDisposeObservable, чтобы освободить ресурсы при удалении сцены
        scene.onDisposeObservable.add(() => {
            label.dispose();
        });
    }
});
