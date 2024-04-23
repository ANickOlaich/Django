// Функция для извлечения значения параметра Mode из URL
function getModeFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('Mode');
}

document.addEventListener('DOMContentLoaded', function () {
  const mode = getModeFromUrl();
  if (mode !== 'admin') {
    const adminButton = document.getElementById('buttonAdmin');
    if (adminButton) {
      adminButton.style.display = 'none';
    }
  }
});

// Получаем идентификатор проекта из атрибута данных HTML-элемента
var project_id = document.getElementById('panel-info').dataset.projectId;
//console.log(document.getElementById('panel-info'));

 // Инициализация Offcanvas
 $(document).ready(function () {
  $('[data-toggle="offcanvas"]').on('click', function () {
      var target = $($(this).data('target'));
      target.toggleClass('open');
  });
});

var materials = []

/*var layer1 = new THREE.Layers(); //Все остальное, кром -
var layer2 = new THREE.Layers();  //Фасады

layer1.set(1); // Устанавливаем первый бит маски для первого слоя
layer2.set(2); // Устанавливаем второй бит маски для второго слоя
*/

// Создаем сцену
var scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee); // Цвет фона

const frameGroup = new THREE.Group();
const fasads = new THREE.Group();
const arrowsGroup = new THREE.Group();
scene.add(frameGroup);
scene.add(fasads);
scene.add(arrowsGroup);

// Создаем камеру
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100);

// Создаем рендерер
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Включаем тени
document.body.appendChild(renderer.domElement);

// Устанавливаем стили для рендерера
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.overflow = 'hidden';

// LIGHTS

const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x8d8d8d, 1);
				hemiLight.position.set( 0, 20, 0 );
				scene.add( hemiLight );

				const dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
				dirLight.position.set( 10, 10, 10 );
				dirLight.castShadow = true;
				dirLight.shadow.camera.top = 2;
				dirLight.shadow.camera.bottom = - 2;
				dirLight.shadow.camera.left = - 2;
				dirLight.shadow.camera.right = 2;
				dirLight.shadow.camera.near = 0.1;
				dirLight.shadow.camera.far = 40;
				scene.add( dirLight );

// ground

const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 20, 20 ), new THREE.MeshPhongMaterial( { color: 0xcbcbcb, depthWrite: false } ) );
				mesh.rotation.x = - Math.PI / 2;
				mesh.receiveShadow = true;
				scene.add( mesh );

        const grid = new THREE.GridHelper( 20, 20, 0xc1c1c1, 0x8d8d8d );
				scene.add( grid );

// Создаем свободную камеру с использованием OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // Включаем затухание (инерцию)
        controls.dampingFactor = 0.1; // Настраиваем коэффициент затухания

// Вызываем функцию для получения данных и создания панелей
fetchDataAndCreatePanels(project_id, scene);

function displayMaterials(materialsArray) {
  materialsArray.forEach(function(materialData) {
    addCardMaterial(materialData);
  });
}


//------------------------Стрелки------------------------
function createArrows(size){
  var d=size.width/5000
  const points =[];
        points.push (new THREE.Vector3(0,d,0))
        points.push (new THREE.Vector3(0,d*6,0))
        points.push (new THREE.Vector3(0,d*5,0))
        points.push (new THREE.Vector3(0-d/2,d*5.5,0))
        points.push (new THREE.Vector3(0+d/2,d*4.5,0))
        points.push (new THREE.Vector3(0,d*5,0))
        points.push (new THREE.Vector3(0-d,d*5,0))
        points.push (new THREE.Vector3(size.length/1000+d,d*5,0))
        points.push (new THREE.Vector3(size.length/1000,d*5,0))
        points.push (new THREE.Vector3(size.length/1000-d/2,d*5.5,0))
        points.push (new THREE.Vector3(size.length/1000+d/2,d*4.5,0))
        points.push (new THREE.Vector3(size.length/1000,d*5,0))
        points.push (new THREE.Vector3(size.length/1000,d*6,0))
        points.push (new THREE.Vector3(size.length/1000,d,0))

  const geometry = new THREE.BufferGeometry().setFromPoints( points );
  // Создаем материал для линии
  const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });

  // Создаем объект линии и добавляем его в сцену
  const arrow = new THREE.Line(geometry, material);

  // Добавляем текст

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  context.fillStyle = 'green'
  context.font = '60px sans-serif'
  context.fillText(Math.round(size.size), 0, 60)
  // canvas contents are used for a texture
  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true
  var materialt = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  })
  materialt.transparent = true
  var textMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.10), materialt)
  if (size.pos_x > size.pos_y) {
    //console.log("Разворот размера");
    //console.log(size.size);
    const euler = new THREE.Euler(0, Math.PI, 0);
    textMesh.setRotationFromEuler(euler);
  }

  textMesh.position.x = size.length/1000/2;
  textMesh.position.y = d*5;

  arrowGroup = new THREE.Group();
  arrowGroup.add(textMesh);
  arrowGroup.add(arrow)
    
  const quaternion = new THREE.Quaternion(
    size.rot_x,
    size.rot_y,
    size.rot_z,
    size.rot_w
);

  // Нормализуем кватернион
  quaternion.normalize();

  // Создаем вектор позиции на основе данных о позиции
  const position = new THREE.Vector3(size.pos_x/1000, size.pos_y/1000, size.pos_z/1000);

  // Позиционируем текст относительно стрелки (на ваш выбор)
  arrowGroup.position.copy(position);
  arrowGroup.quaternion.copy(quaternion);

  // Добавляем стрелку и текст в группу (arrowsGroup)
  arrowsGroup.add(arrowGroup);
}

//------------------------------------------------------------------
async function fetchProjectInfo(project_id) {
  try {
    const response = await fetch(`/myapp/api/project/${project_id}/`);
      const data = await response.json();
      return data;

  } catch (error) {
    throw new Error(`Ошибка при получении данных о проекте: ${error}`);
  }
}
// Асинхронная функция для получения данных о панелях с сервера
async function fetchPanelsData(project_id) {
    //console.log('Получаю даннные о панелях');
    try {
      const response = await fetch(`/myapp/api/panels/${project_id}/`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Ошибка при получении данных о панелях: ${error}`);
    }
  }
  
  // Асинхронная функция для получения уникальных материалов из данных о панелях
  async function extractUniqueMaterials(panelsData) {
    //console.log('Ищу уникальные материалы');
    const uniqueMaterials = new Set();
  
    panelsData.forEach(panelData => {
      uniqueMaterials.add(panelData.material);
    });
  
    return Array.from(uniqueMaterials);
  }
  
  // Асинхронная функция для получения данных о материалах с сервера
  async function fetchMaterialsData(materialsIds) {
    //console.log('Получаю даннные о материалах');
    const materialsPromises = materialsIds.map(async materialId => {
      try {
        const response = await fetch(`/myapp/api/material/${materialId}/`);
        const materialData = await response.json();
        return materialData;
      } catch (error) {
        throw new Error(`Ошибка при получении данных для материала с id ${materialId}: ${error}`);
      }
    });
  
    return Promise.all(materialsPromises);
  }
  
  // Функция для создания панелей на основе данных
  function createPanels(panelsData, materialsData, scene) {
    //console.log('Создаю панели');
    panelsData.forEach(panelData => {
      const material = materialsData.find(material => material.id === panelData.material);
      // Используй полученные данные для создания панели
      createPanel(panelData, material, scene);
      // Создайте подписи (если необходимо)
      // createLabel(panelData, scene);
    });
  }

  async function fetchSizes(project_id) {
    //console.log('Получаю размеры');
    try {
      const response = await fetch(`/myapp/api/size/${project_id}/`);
      
      if (!response.ok) {
        throw new Error(`Ошибка при выполнении запроса: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      //console.log(data);
      return data;
    } catch (error) {
      throw new Error(`Ошибка при получении данных о размерах: ${error.message}`);
    }
  }
  
  // Используем асинхронные функции
  async function fetchDataAndCreatePanels(project_id, scene) {
    try {
      SpinnerOn('Загрузка...');
      const projectData = await fetchProjectInfo(project_id);
      //console.log(projectData);
      addOverlayText(projectData.name,10);
      camera.position.x = projectData.size_x/2000;
      camera.position.y = projectData.size_y/2000;
      camera.position.z = projectData.size_z*2/1000;
      camera.lookAt( projectData.size_x/2000, projectData.size_y/2000, 0 );
      controls.update();
      // Получаем данные о панелях
      const panelsData = await fetchPanelsData(project_id);
      //console.log(panelsData);
      // Находим уникальные материалы
      const uniqueMaterialsIds = await extractUniqueMaterials(panelsData);
      ////console.log(uniqueMaterialsIds);
      // Получаем данные о материалах
      const materialsData = await fetchMaterialsData(uniqueMaterialsIds);
      ////console.log(materialsData)
      displayMaterials(materialsData);
      const sizesData = await fetchSizes(project_id);
      sizesData.forEach(size=>{
        createArrows(size);
      })
      //console.log(sizesData);
      
      // Создаем панели на основе данных
      createPanels(panelsData, materialsData, scene);
    } catch (error) {
      console.error(error);
    } finally {
      SpinnerOff();
      //hideSpinner(); // Выключаем спиннер в любом случае (даже при ошибке)
    }
  }
  
  

//------------------------------------------------------------------

// Функция для создания панели на основе данных
function createPanel(panelData, materialData, scene) {
  const SCALE=1000;
    // Получаем контуры панели
    var lines = panelData.contours;

   // Создаем объект формы
  var shape = new THREE.Shape();

  // Проходим по всем данным и добавляем линии и дуги к форме
  lines.forEach(function (item) {
      if (item.type === 1) {
          // Линия
          shape.moveTo(item.pos1x/SCALE, item.pos1y/SCALE);
          shape.lineTo(item.pos2x/SCALE, item.pos2y/SCALE);
      } else if (item.type === 2) {
         // Дуга
        // Создаем дугу с использованием параметров, таких как radius, startAngle и endAngle
        var startAngle = item.start_angle;
        var endAngle = item.end_angle;

        // Учитываем направление дуги (по часовой стрелке или против)
        if (item.arc_dir === 0) {
            shape.moveTo(item.pos1x/SCALE,item.pos1y/SCALE);
            shape.absarc(item.center_x/SCALE, item.center_y/SCALE, item.radius/SCALE,   startAngle, endAngle,true);
            shape.moveTo(item.pos2x/SCALE,item.pos2y/SCALE);
        } else {
            shape.moveTo(item.pos1x/SCALE,item.pos1y/SCALE);
            shape.absarc(item.center_x/SCALE, item.center_y/SCALE, item.radius/SCALE,  startAngle, endAngle, false);
            shape.moveTo(item.pos2x/SCALE,item.pos2y/SCALE);
        }
      } else if (item.type === 3) {
        //окружность
        shape.moveTo(item.pos1x/SCALE,item.pos1y/SCALE);
        shape.absarc(item.center_x/SCALE, item.center_y/SCALE, item.radius/SCALE,   startAngle, endAngle,true);
        shape.moveTo(item.pos2x/SCALE,item.pos2y/SCALE);
      }
  });

  var texture=null;

  if (materialData.texture_link){
    // Загружаем текстуру для панели из данных о материале
    const textureLoader = new THREE.TextureLoader();
    texture = textureLoader.load(materialData.texture_link);

    // Настройка текстуры
    texture.repeat.set(1, 1);
    texture.wrapS = THREE.MirroredRepeatWrapping;
    texture.wrapT = THREE.MirroredRepeatWrapping;

    if (panelData.texture_orientation == 1){
        texture.rotation = Math.PI / 2;
    }

  }
    

    // Настройка параметров выдавливания
    var extrudeSettings = {
        depth: panelData.height/SCALE,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 1/SCALE,
        bevelThickness: 1/SCALE,
        curveSegments: 60,
        bevelOffset: -1/SCALE,
    };

    // Создаем геометрию выдавливания
    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Создаем материал с использованием данных о материале
    var material = new THREE.MeshPhysicalMaterial({
        color: materialData.color,
        map: texture,
        roughness: materialData.roughness,
        metalness: materialData.metalness,
        clearcoat: materialData.clearcoat,
        clearcoatRoughness: materialData.clearcoatRoughness,
        reflectivity: materialData.reflectivity,
        transparent:materialData.transparent
    });

    // Создаем меш
    const mesh = new THREE.Mesh(geometry, material);
    // Добавляем поле для хранения оригинального материала
    mesh.originalMaterial = material;
    mesh.castShadow = true; // Разрешаем мешу бросать тень
    mesh.receiveShadow = true;
    // Создаем кватернион на основе данных о повороте
    const quaternion = new THREE.Quaternion(
        panelData.rotation_x,
        panelData.rotation_y,
        panelData.rotation_z,
        panelData.rotation_w
    );

    // Нормализуем кватернион
    quaternion.normalize();

    // Создаем вектор позиции на основе данных о позиции
    const position = new THREE.Vector3(panelData.position_x/SCALE, panelData.position_y/SCALE, panelData.position_z/SCALE);

    // Применяем позицию и поворот к мешу
    mesh.position.copy(position);
    mesh.quaternion.copy(quaternion);
    
    const name = panelData.name.toLowerCase();

if (name.includes('фасад')) {
  fasads.add(mesh);
    //console.log('The name contains the word "фасад"');
} else {
  scene.add(mesh);
}
   
    

    // Создаем геометрию для рёбер
    const edgesGeometry = new THREE.EdgesGeometry(geometry);

    // Создаем материал LineBasicMaterial для рёбер (чёрный цвет)
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

    // Создаем объект LineSegments для отображения рёбер
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    edges.position.copy(position);
    edges.quaternion.copy(quaternion);

// Добавляем объект LineSegments в сцену
frameGroup.add(edges);
}
// Функция для добавления текста поверх сцены
function addOverlayText(text, top ) {
  // Создаем div элемент для текста
  var textDiv = document.createElement('div');
  textDiv.style.position = 'absolute';
  textDiv.style.width = '100px';
  textDiv.style.height = '50px';
  textDiv.style.top = top + 'px';  // Позиционируем сверху
  textDiv.style.left = '10px'; // Позиционируем слева
  textDiv.style.color = '#222222'; // Цвет текста
  textDiv.style.fontSize = '60px'; // Размер текста
  textDiv.innerHTML = text;

  // Добавляем div на страницу
  document.body.appendChild(textDiv);
}

// Функция для добавления текста поверх сцены
function SpinnerOn(text) {
  // Создаем div элемент для спиннера
  var spinnerDiv = document.createElement('div');
  spinnerDiv.id = 'spinnerContainer';
  spinnerDiv.style.position = 'fixed';
  spinnerDiv.style.top = '50%';  // Позиционируем сверху
  spinnerDiv.style.left = '50%'; // Позиционируем слева
  spinnerDiv.style.transform = 'translate(-50%, -50%)'; // Центрируем относительно центра
  spinnerDiv.style.textAlign = 'center';
  //spinnerDiv.style.z-index = '99';
  spinnerDiv.className = 'spinner-border-container'; // Добавляем класс для легкости поиска

  // Создаем элемент для текста спиннера
  var textDiv = document.createElement('div');
  textDiv.style.color = '#222222'; // Цвет текста
  textDiv.style.fontSize = '20px'; // Размер текста
  textDiv.innerHTML = text;

  // Создаем элемент для анимации спиннера
  var spinnerAnimation = document.createElement('div');
  spinnerAnimation.className = 'spinner-border m-5';

  // Добавляем элементы на страницу
  spinnerDiv.appendChild(spinnerAnimation);
  spinnerDiv.appendChild(textDiv);
  document.body.appendChild(spinnerDiv);
}

function SpinnerOff() {
  // Находим элемент спиннера по его ID
  var spinnerDiv = document.getElementById('spinnerContainer');

  // Проверяем, существует ли элемент спиннера
  if (spinnerDiv) {
    // Удаляем элемент спиннера из DOM
    spinnerDiv.remove();
  }
}







function hideSlide() {// Прячет все слайды
  var slideLftElements = document.querySelectorAll('.slide-lft');

  slideLftElements.forEach(function(element) {
    element.style.left = '-500px';
  });
}

function showSlide() {// Показывает все слайды
  var slideLftElements = document.querySelectorAll('.slide-lft');

  slideLftElements.forEach(function(element) {
    element.style.left = '0px';
  });
}


function toggleSlide(slideLft, slideIn) {
  slideLft.addEventListener('click', function() {
    if (slideLft.style.left === '250px') {
      slideLft.style.left = '0px';
      slideIn.style.left = '-250px';
      showSlide();
    } else {
      hideSlide();
      slideLft.style.left = '250px';
      slideIn.style.left = '0px';
    }
  });
}

var slideLft1 = document.querySelector('.slide-container:nth-child(1) .slide-lft');
var slideIn1 = document.querySelector('.slide-container:nth-child(1) .slide-in');
toggleSlide(slideLft1, slideIn1);

var slideLft2 = document.querySelector('.slide-container:nth-child(2) .slide-lft');
var slideIn2 = document.querySelector('.slide-container:nth-child(2) .slide-in');
toggleSlide(slideLft2, slideIn2);

var slideLft3 = document.querySelector('.slide-container:nth-child(3) .slide-lft');
var slideIn3 = document.querySelector('.slide-container:nth-child(3) .slide-in');
toggleSlide(slideLft3, slideIn3);

var slideLft4 = document.querySelector('.slide-container:nth-child(4) .slide-lft');
var slideIn4 = document.querySelector('.slide-container:nth-child(4) .slide-in');
toggleSlide(slideLft4, slideIn4);

var slideLft5 = document.querySelector('.slide-container:nth-child(5) .slide-lft');
var slideIn5 = document.querySelector('.slide-container:nth-child(5) .slide-in');
toggleSlide(slideLft5, slideIn5);

var slideLft6 = document.querySelector('.slide-container:nth-child(6) .slide-lft');
var slideIn6 = document.querySelector('.slide-container:nth-child(6) .slide-in');
toggleSlide(slideLft6, slideIn6);



function colorButtonClick(option, button) {
  var buttons = button.parentElement.getElementsByClassName('btn');

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove('btn-success-active');
    buttons[i].classList.add('btn-outline-success');
  }

  button.classList.remove('btn-outline-success');
  button.classList.add('btn-success', 'btn-success-active');

  switch (option) {
    case 'Цветной':
      frameGroup.visible = false;
      scene.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          if(child.originalMaterial){
            child.material = child.originalMaterial;
            child.material.wireframe = false;
          }
         
        }
      })
      break;
      case 'Цветной каркас':
        frameGroup.visible = true;
        scene.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            if(child.originalMaterial){
              child.material = child.originalMaterial;
              child.material.wireframe = false;
            }
           
          }
        })
        break;
    case 'Черно-белый':
      frameGroup.visible = true;
      scene.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        }
      });
      break;
    case 'Полупрозрачный':
      frameGroup.visible = true;
      scene.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({ color: 0xcccccc, transparent: true, opacity: 0.5 });
        }
      });
      break;
    case 'Каркасный':
      frameGroup.visible = true;
      scene.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({ color: 0xcccccc, transparent: true, opacity: 0 });
        }
      });
      break;
  }
}

function viewButtonClick(option, button) {
  var buttons = button.parentElement.getElementsByClassName('btn');

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove('btn-primary-active');
    buttons[i].classList.add('btn-outline-primary');
  }

  button.classList.remove('btn-outline-primary');
  button.classList.add('btn-primary', 'btn-primary-active');

  switch (option) {
    case 'Дизайнер':
      
      break;
    case 'Сборщик':
      
      break;
  }
}

function seeButtonClick(option, button) {
  // Проверяем текущий класс кнопки
  var isView = false;
  if (button.classList.contains('btn-success')) {
    // Если класс btn-success уже установлен, заменяем его на btn-outline-success
    button.classList.remove('btn-success');
    button.classList.add('btn-outline-success');
    isView=false;
  } else {
    // Если класс btn-success не установлен, заменяем его на btn-success
    button.classList.remove('btn-outline-success');
    button.classList.add('btn-success');
    isView=true;
  }
  switch (option){
    case 'Фасады':
      fasads.visible = isView;
      break;
    case 'Фурнитура':
      
      break;
    case 'Размеры':
      arrowsGroup.visible = isView;
      break;
  }
}

function displayMaterialInfo(materialData,pos) {
  // Создаем div элемент для отображения информации о материале
  var materialDiv = document.createElement('div');
  materialDiv.classList.add('material-info');  // Добавляем класс для стилей
  materialDiv.style.position = 'absolute';  // Устанавливаем позицию как абсолютную
  materialDiv.style.bottom = pos*150+'px';  // Устанавливаем внизу
  materialDiv.style.left = '0';  // Устанавливаем слева
  materialDiv.style.display = 'flex';  // Используем flex для выравнивания элементов

  // Добавляем изображение текстуры материала
  var textureImage = document.createElement('img');
  textureImage.style.width = '150px';  // Устанавливаем ширину в 150 пикселей
  textureImage.style.maxHeight = '150px';
  textureImage.src = materialData.texture_link;
  materialDiv.appendChild(textureImage);

  // Добавляем название материала и артикул
  var textElement = document.createElement('p');
  textElement.style.fontSize = '18px';
  textElement.textContent = materialData.name;
  textElement.style.marginLeft = '10px';  // Добавляем отступ слева
  materialDiv.appendChild(textElement);

  // Добавляем созданный div на страницу
  document.body.appendChild(materialDiv);
}
  // Обработчик изменения размеров окна
  window.addEventListener('resize', function () {
    // Обновляем размеры рендерера и соотношение сторон камеры
    var newWidth = window.innerWidth;
    var newHeight = window.innerHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight);
});


 // Функция для добавления нового материала
 function addCardMaterial(cardData) {
  //console.log("Добавляю карточку материала");
  //console.log(cardData);
  
  var cardContainer = document.getElementById('cardContainer');

    // Создаем элемент карточки
    var card = document.createElement('div');
    card.className = 'custom-card';
    
    // Создаем элемент изображения
    var img = document.createElement('img');
    img.src = cardData.texture_link;
    img.alt = cardData.name;
    img.className = 'img-fluid';

    // Создаем элемент текста
    var cardText = document.createElement('div');
    cardText.className = 'custom-card-text';
    
    var title = document.createElement('h5');
    title.textContent = cardData.name;

    // Добавляем изображение и текст в карточку
    card.appendChild(img);
    cardText.appendChild(title);
    card.appendChild(cardText);

    // Добавляем обработчик события для открытия модального окна
    
    card.addEventListener('click', function() {
      openModal(cardData);
    });

    // Добавляем карточку в контейнер
    cardContainer.appendChild(card)
    
}


  // Функция для открытия модального окна с дополнительной информацией
  function openModal(cardData) {
    var modalBody = document.querySelector('#customModal .modal-body');
    modalBody.innerHTML = ''; // Очищаем содержимое модального окна

    // Создаем элементы для модального окна
    var title = document.createElement('h5');
    title.textContent = cardData.name;

    

    var img = document.createElement('img');
    img.src = cardData.texture_link;
    img.alt = cardData.name;

    // Добавляем элементы в модальное окно
    modalBody.appendChild(img);
    modalBody.appendChild(title);

    if (cardData.page_link){
      var description = document.createElement('p');
      var link = document.createElement('a');
      link.href = cardData.page_link;
      link.textContent = "Смотреть на сайте Вияр";
      link.rel = "nofollow"; // Добавляем атрибут nofollow
      description.appendChild(link);
      modalBody.appendChild(description);
    }

   

    // Открываем модальное окно
    $('#customModal').modal('show');
  }

  // Обработка событий от ползунков на сайте
  function handleLightChange(value) {
    dirLight.intensity = value;
  }
  function handleBackgroundChange(value) {
    //console.log(value);
    const numericValue = parseFloat(value);
  

    // Проверка, является ли значение числом в диапазоне от 0 до 1
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 1) {
      // Создаем цвет, используя значение от 0 до 1
      const color = new THREE.Color(numericValue, numericValue, numericValue);
      scene.background = color;
    }else if (value instanceof THREE.Texture) {
      // Если значение - объект Texture, считаем, что это текстура
      scene.background = value;
    } else {
      console.error('Неверный тип значения для изменения фона сцены.');
    }
  }

  function handleShadowChange(value) {
    dirLight.position.set( value, 10, 10 );
  }

  // Включение и отключение спиннера
  function showSpinner() {
    document.getElementById('spinner').style.display = 'block';
  }

  function hideSpinner() {
    document.getElementById('spinner').style.display = 'none';
  }
 function screanshot(){
  // Получаем DOM-элемент сцены Three.js
  const sceneContainer = renderer.domElement

  // Создаем canvas для отрисовки снимка
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  // Устанавливаем размер canvas таким же, как у контейнера сцены
  canvas.width = sceneContainer.clientWidth;
  canvas.height = sceneContainer.clientHeight;

  // Рисуем содержимое контейнера сцены на canvas
  context.drawImage(sceneContainer, 0, 0);

  // Получаем данные изображения в формате base64
  const screenshotDataUrl = canvas.toDataURL('image/png');

  // Отправляем снимок на сервер Django через API
  sendScreenshotToServer(screenshotDataUrl);
 }

 function sendScreenshotToServer(screenshotDataUrl) {
  // Создаем объект FormData для передачи данных на сервер
  const formData = new FormData();
  formData.append('screenshot', screenshotDataUrl);

  // Отправляем данные на сервер с использованием Fetch API
  fetch('/myapp/api/screenshot/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),  // Получаем CSRF-токен из cookie
    },
      body: formData,
      project : project_id,
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Ошибка при отправке снимка на сервер.');
      }
      console.log('Снимок успешно отправлен на сервер.');
  })
  .catch(error => {
      console.error(error.message);
  });
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}


// Создаем анимацию
var animate = function () {
    requestAnimationFrame(animate);

    // Обновляем контроллер
    controls.update();

    //renderer.clear();
  

    // Рендерим сцену
    renderer.render(scene, camera);
   
};

// Вызываем анимацию
animate();
