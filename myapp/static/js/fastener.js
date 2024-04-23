import * as THREE from '/static/js/three/three.module.js';
import { OrbitControls } from '/static/js/three/jsm/OrbitControls.js'; // Импортируем OrbitControls
import { STLLoader } from '/static/js/three/jsm/STLLoader.js'; // Импортируем STLLoader

var fastenersDataElement = document.getElementById("fasteners-data");
var fastenersData = JSON.parse(fastenersDataElement.value);
console.log(fastenersData);

// Получаем ссылку на элемент canvas
const canvas = document.getElementById('fasteners-canvas');

// Создаем сцену
const scene = new THREE.Scene();

// Создаем камеру
const camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.01, 100);
camera.position.z = 0.5;

// Создаем рендерер
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

// Устанавливаем белый цвет фона
renderer.setClearColor(0xffffff);

// Создаем освещение
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();
scene.add(light);

const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x8d8d8d, 1);
hemiLight.position.set( 0, 5, 0 );
scene.add( hemiLight );

// Создаем объект осей координат
const axesHelper = new THREE.AxesHelper(0.05); // Длина осей: 5 единиц

// Добавляем оси координат на сцену
scene.add(axesHelper);

// ground
  
/*const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 20, 20 ), new THREE.MeshPhongMaterial( { color: 0xcbcbcb, depthWrite: false } ) );
mesh.rotation.x = - Math.PI / 2;
mesh.receiveShadow = true;
scene.add( mesh );*/

const grid = new THREE.GridHelper( 1, 1, 0xc1c1c1, 0x8d8d8d );
scene.add( grid );

// Создаем управление камерой с помощью OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.update(); // Обязательно вызывайте этот метод после изменения параметров камеры или контроллеров

// Создаем загрузчик STL
const loader = new STLLoader();

// Полный URL до STL файла
const stlFileURL = "http://localhost:8000" + fastenersData.stl_file;

 // Создаем материал для модели
  // Создаем материал с использованием данных о материале
var material = new THREE.MeshPhysicalMaterial();
 
 fetch(`/myapp/api/material/${fastenersData.material}/`)
 .then(response => response.json())
 .then(data => {
     // Обрабатываем полученные данные
     console.log(data);
     const color = new THREE.Color(data.color);
     material.color = color
     material.transmission = data.transmission,
     //material.map = texture,
     material.roughness = data.roughness,
     material.metalness = data.metalness,
     material.clearcoat = data.clearcoat,
     material.clearcoatRoughness = data.clearcoatRoughness,
     material.reflectivity = data.reflectivity,
     material.transparent = data.transparent
 })
 
 


// Загружаем модель фурнитуры с помощью STLLoader
loader.load(stlFileURL, function (geometry) {
   

     // Создайте новую матрицу масштабирования
     const scaleFactor = 1 / 1000; // Уменьшить размер в 1000 раз
     const scaleMatrix = new THREE.Matrix4().makeScale(scaleFactor, scaleFactor, scaleFactor);

     // Примените матрицу масштабирования к геометрии
     geometry.applyMatrix4(scaleMatrix);

    // Создаем объект в сцене на основе загруженной геометрии и материала
    const fastenersObject = new THREE.Mesh(geometry, material);
    fastenersObject.name = 'fastenersObject'; // Установите имя объекта
    fastenersObject.position.x = fastenersData.position_x/1000;
    fastenersObject.position.y = fastenersData.position_y/1000;
    fastenersObject.position.z = fastenersData.position_z/1000;

    scene.add(fastenersObject);
});

// Отрисовываем сцену
function animate() {
    requestAnimationFrame(animate);

    controls.update(); // Обновляем контроллеры

    renderer.render(scene, camera);
}
animate();

// Функция для обновления размеров сцены при изменении размеров окна
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Добавляем слушатель события изменения размеров окна
window.addEventListener('resize', onWindowResize);

// Вызываем функцию onWindowResize() в начале, чтобы размеры сцены были правильно установлены при загрузке страницы
onWindowResize();


// Получаем ссылку на элемент <select> материала
const materialSelect = document.getElementById('material');

// Добавляем обработчик события change
materialSelect.addEventListener('change', function() {
    // Получаем выбранное значение (id материала)
    const selectedMaterialId = parseInt(this.value);
    console.log(selectedMaterialId);
     // Выполняем запрос fetch
     fetch(`/myapp/api/material/${selectedMaterialId}/`)
     .then(response => response.json())
     .then(data => {
         // Обрабатываем полученные данные
         console.log(data);
            // Найдем объект по имени и применим материал к нему
        const objectInScene = scene.getObjectByName('fastenersObject');
        if (objectInScene) {
            // Конвертируем строку HEX в объект THREE.Color
    const color = new THREE.Color(data.color);
    
    // Применяем цвет к материалу объекта
    material.color = color;

    // Применяем остальные свойства материала
    material.roughness = data.roughness;
    material.metalness = data.metalness;
    material.transmission = data.transmission;
    //material.opacity = data.opacity;
    material.clearcoat = data.clearcoat;
    material.clearcoatRoughness = data.clearcoatRoughness;
    material.reflectivity = data.reflectivity;

    // Перерисовываем сцену
    renderer.render(scene, camera);

    }
         // Ваш дальнейший код для обработки ответа от сервера
     })
     .catch(error => {
         console.error('Error:', error);
         // Обработка ошибок, если необходимо
     });

    // Ваш код JavaScript для обработки изменений в выборе материала
    // Например, обновление сцены с новым материалом
});


// Функция для изменения позиции по оси
window.changePosition = function(axis, step) {
    // Получаем текущее значение из соответствующего элемента формы
    var currentValue = parseFloat(document.getElementById('position_' + axis).value);
    
    // Добавляем шаг к текущему значению для изменения
    var newValue = currentValue + step;
    
    // Устанавливаем новое значение в элемент формы
    document.getElementById('position_' + axis).value = newValue;
    // Получаем объект из сцены по имени
    const objectInScene = scene.getObjectByName('fastenersObject');
    console.log(objectInScene);
    // Проверяем, найден ли объект в сцене
    if (objectInScene) {
        // Обновляем соответствующее свойство объекта в зависимости от оси
        if (axis === 'x') {
            objectInScene.position.x = newValue/1000;
            console.log('x=',newValue);
        } else if (axis === 'y') {
            objectInScene.position.y = newValue/1000;
            console.log('y=',newValue);
        } else if (axis === 'z') {
            objectInScene.position.z = newValue/1000;
            console.log('z=',newValue);
        }
        
        // Перерисовываем сцену
        renderer.render(scene, camera);
    }
    
    // Вызываем функцию, которая будет отправлять данные на сервер или обновлять сцену в three.js
    // Например, вы можете добавить сюда код для отправки данных на сервер или обновления сцены в three.js
}

window.handleKeyPress = function(event, axis) {
    console.log(event);
    if (event.keyCode === 13) {
        event.preventDefault(); // Предотвращаем стандартное поведение (отправку формы)
        changePosition(axis, 0); // Вызываем функцию changePosition с нужным аргументом
    } 
}

 // Функция для отображения выбранного изображения
 window.previewImage = function(input) {
    var preview = document.getElementById('image-preview');
    var file = input.files[0];
    var reader = new FileReader();

    reader.onloadend = function () {
        preview.src = reader.result;
    }

    if (file) {
        reader.readAsDataURL(file);
    } else {
        preview.src = "";
    }
}