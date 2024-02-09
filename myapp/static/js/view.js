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
      //addCardMaterial(materialData);
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
          bevelEnabled: false,
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
          opacity:0.5,
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
  
  
  
  
  
  
  
  
  
  
  
  
 
    // Обработчик изменения размеров окна
    window.addEventListener('resize', function () {
      // Обновляем размеры рендерера и соотношение сторон камеры
      var newWidth = window.innerWidth;
      var newHeight = window.innerHeight;
  
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
  
      renderer.setSize(newWidth, newHeight);
  });
  
  
   
  
  
  
    
  
    
    // Включение и отключение спиннера
    function showSpinner() {
      document.getElementById('spinner').style.display = 'block';
    }
  
    function hideSpinner() {
      document.getElementById('spinner').style.display = 'none';
    }
   
    function seeButtonClick(option, icon) {
        // Проверяем текущий класс кнопки
        console.log(icon.classList);
        var isView = true;
        icon.classList.toggle('selected'); // Добавляем или удаляем класс 'selected' при клике
        if (icon.classList.contains('selected')){
            isView = false;
        }
        switch (option){
          case 'Фасады':
            fasads.visible = isView;
            break;
          case 'Вид':
            if (isView){
                frameGroup.visible = true;
                scene.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    if (child.material.opacity==0.5) child.material.transparent = false;
            }
        })

            }else{
                frameGroup.visible = true;
                scene.traverse(function (child) {
                  if (child instanceof THREE.Mesh) {
                    if (child.material.opacity==0.5) child.material.transparent = true;
                  }
                });
            }
            
            break;
          case 'Размеры':
            arrowsGroup.visible = isView;
            break;
        }
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
  