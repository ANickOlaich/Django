import * as THREE from 'three';


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
  // Создаем Raycaster
const raycaster = new THREE.Raycaster();
  
  /*var layer1 = new THREE.Layers(); //Все остальное, кром -
  var layer2 = new THREE.Layers();  //Фасады
  
  layer1.set(1); // Устанавливаем первый бит маски для первого слоя
  layer2.set(2); // Устанавливаем второй бит маски для второго слоя
  */
  // Объект для хранения начального состояния группы при анимации
  const initialGroupState = {};
  // Создаем сцену
  
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeeeeee); // Цвет фона
  
  const frameGroup = new THREE.Group();
  const fasads = new THREE.Group();
  const arrowsGroup = new THREE.Group();
  const line3dGroup = new THREE.Group();
  scene.add(frameGroup);
  scene.add(fasads);
  scene.add(arrowsGroup);
  scene.add(line3dGroup);
  
  
  
  // Создаем рендерер
  var renderer,camera;
  const canvas = document.getElementById('threeCanvas');
  //console.log(canvas);
  if(canvas){
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.canvas = canvas;
    renderer.antialias = true;
    renderer.preserveDrawingBuffer = true;
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
     
  // Создаем камеру
  camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.01, 100);
  }else{
     // Устанавливаем стили для рендерера
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.overflow = 'hidden';
  document.body.appendChild(renderer.domElement);
  // Создаем камеру
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100);
  }
  
  
  renderer.shadowMap.enabled = true; // Включаем тени
 
  
 
  
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
  

  function createLine(line){
    // Создаем геометрию линии
    var geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(line.pos1_x/1000, line.pos1_y/1000, line.pos1_z/1000),
        new THREE.Vector3(line.pos2_x/1000, line.pos2_y/1000, line.pos2_z/1000),
    );

    // Создаем материал для линии
    var material = new THREE.LineBasicMaterial({ color: 0x0000ff });

    // Создаем линию
    var line3D = new THREE.Line(geometry, material);

    // Добавляем линию на сцену
    line3dGroup.add(line3D);

  }
  
//--------------------------Блоки----------------------
/*
function addBlocksToScene(blocksData) {

  blocksData.forEach(blockData => {
      const blockGroup = new THREE.Group();
      blockGroup.name = blockData.uid;
      
      console.log(blockData);
      if(blockData.anim_type!=0){
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1); // Пример геометрии блока
        const material = new THREE.MeshBasicMaterial({ 
          color: 0x008000,
          transparent:true,
          opacity:0.5,
         }); // Пример материала блока
        const blockMesh = new THREE.Mesh(geometry, material);
       
        blockGroup.add(blockMesh);

      }
     

       // Создаем кватернион на основе данных о повороте
      const quaternion = new THREE.Quaternion(
        blockData.rotation_x,
        blockData.rotation_y,
        blockData.rotation_z,
        blockData.rotation_w
    );
    

    // Нормализуем кватернион
    quaternion.normalize();

    // Создаем вектор позиции на основе данных о позиции
    const position = new THREE.Vector3(blockData.position_x/1000, blockData.position_y/1000, blockData.position_z/1000);

    // Применяем позицию и поворот к мешу
    blockGroup.position.copy(position);
    blockGroup.quaternion.copy(quaternion);

      

      
      // Проверьте, есть ли у блока родитель, и добавьте его в соответствующую группу родителя
      if (blockData.parent!='1') {
          const parentGroup = scene.getObjectByName(blockData.parent);
         
          if (parentGroup) {
              parentGroup.add(blockGroup);
          } else {
              console.error(`Parent group "${blockData.parent}" not found for block "${blockData.name}"`);
          }
      } else {
        
          scene.add(blockGroup); // Если блок верхнего уровня, добавьте его напрямую в сцену
      }
  });
}
*/

// Функция для прохождения по всем элементам дерева
function traverseTree(tree, callback) {
  // Проходим по каждому узлу дерева
  tree.forEach(node => {
    // Вызываем обратный вызов для текущего узла
    callback(node);
    
    // Если у узла есть дочерние узлы, рекурсивно вызываем эту же функцию для каждого из них
    if (node.children) {
      traverseTree(node.children, callback);
    }
  });
}

function createBlockTree(objects) {
  const tree = [];
  const map = {};
  
  // Проход по массиву объектов для создания карты uid-объект
  objects.forEach(obj => {
    map[obj.uid] = { ...obj, children: [], parent: null, group: null }; // Добавляем поле parent и инициализируем его как null
  });
  
  // Проход по массиву объектов для связывания родителей и детей
  objects.forEach(obj => {
    const parent = map[obj.parent];
    if (parent) {
      const child = map[obj.uid];
      child.parent = parent; // Устанавливаем ссылку на родителя
      parent.children.push(child);
    } else {
      tree.push(map[obj.uid]); // Добавляем узел в дерево, если у него нет родителя
    }
  });
  
  return tree;
}
function findNodeByUid(tree, uid) {
  //console.log("Checking node:", uid);
  
  for (const treeElem of tree) {
    // Проверяем, если текущий узел имеет нужный uid, возвращаем его
    if (treeElem.uid === uid) {
      //console.log("Found node with uid:", uid);
      return treeElem;
    }
    
    // Если у узла есть дочерние узлы, рекурсивно ищем среди них
    if (treeElem.children) {
      const foundNode = findNodeByUid(treeElem.children, uid);
      if (foundNode) {
        return foundNode;
      }
    }
  }
  
  // Если узел не найден, возвращаем null
  return null;
}
// Функция для добавления объектов к узлам дерева на основе свойства block
function attachElementsToTree(tree, elements) {
  // Проход по массиву блоков
  elements.forEach(elem => {
    // Находим родительский узел дерева по значению id
    
    const parentNode = findNodeByUid(tree, elem.block);
    if (parentNode) {
      // Добавляем блок к родительскому узлу
      if (!parentNode.panels) {
        parentNode.panels = [];
      }
      parentNode.panels.push(elem);
    } else {
      console.error(`Родительский узел с id ${elem.block} не найден.`);
    }
  });
}






  //------------------------Стрелки------------------------
  function createArrows(size){
    //console.log(size);
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
   // arrowsGroup.add(arrowGroup);
   const parentGroup = scene.getObjectByName(size.block);
   if(parentGroup){
    parentGroup.add(arrowGroup);
   }else{
    scene.add(arrowGroup)
   }
   
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

  async function fetchBlockData(project_id) {
    try {
      const response = await fetch(`/myapp/api/block/${project_id}/`);
        const data = await response.json();
        //console.log(data);
        return data;
  
    } catch (error) {
      throw new Error(`Ошибка при получении данных о блоках: ${error}`);
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

    async function fetchLinesData(project_id) {
      try {
        const response = await fetch(`/myapp/api/line3d/${project_id}/`);
          const data = await response.json();
          return data;
    
      } catch (error) {
        throw new Error(`Ошибка при получении данных о линиях: ${error}`);
      }
    }
    
    // Функция для создания панелей на основе данных
    function createPanels(panelsData, materialsData, scene, Group) {
      //console.log('Создаю панели');
      panelsData.forEach(panelData => {
        const material = materialsData.find(material => material.id === panelData.material);
        // Используй полученные данные для создания панели
        createPanel(panelData, material, scene, Group);
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
        //addOverlayText(projectData.name,10);
        camera.position.x = projectData.size_x/2000;
        camera.position.y = projectData.size_y/2000;
        camera.position.z = projectData.size_z*2/1000;
        camera.lookAt( projectData.size_x/2000, projectData.size_y/2000, 0 );
        controls.update();
        // Получаем данные о блоках
        const blockData = await fetchBlockData(project_id);
        // Создание дерева
        const BlockTree = createBlockTree(blockData);
        console.log(BlockTree);
        // Новый объект для добавления
const newNode = {
  id: 1,
  uid: 1,
  name: "Сцена",
  anim_type: 0,
  children: [],
  color: "#FFFFFF",
  depth: 0,
  furn_type: "",
  group: null,
  length: 0,
  parent: null,
  position_x: 0,
  position_y: 0,
  position_z: 0,
  project: project_id,
  rotation_w: 1,
  rotation_x: 0,
  rotation_y: 0,
  rotation_z: 0,
  visibility: true,
  width:0
};

// Добавляем новый объект в массив
BlockTree.push(newNode);
        // Получаем данные о панелях
        const panelsData = await fetchPanelsData(project_id);
        attachElementsToTree(BlockTree, panelsData)
           
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
        const linesData = await fetchLinesData(project_id);
       
        linesData.forEach(line=>{
          createLine(line);
        })
         // Создаем группы
         traverseTree(BlockTree, (node) => {
          const group = new THREE.Group();
          const quaternion = new THREE.Quaternion(
            node.rotation_x,
            node.rotation_y,
            node.rotation_z,
            node.rotation_w
        );
        quaternion.normalize();
        const position = new THREE.Vector3(node.position_x / 1000, node.position_y / 1000, node.position_z / 1000);
        group.position.copy(position);
        group.quaternion.copy(quaternion);
        

          node.group=group;
          if(node.parent==null){
            scene.add(group)
          }else{
            node.parent.group.add(group);
          }
        });
      
       
       // Устанавливаем анимацию для дочерних блоков
      function setAnimChild(children,node){
        
        children.forEach(child=>{
          if(!child.animBlock){
            child.anim_type = node.anim_type;
            child.animBlock = node;
          }
         
          if (child.children){
            setAnimChild(child.children,node);
          }
        })
      }
      traverseTree(BlockTree,(node)=>{
        if (node.anim_type!==0){
         
          if(!node.animBlock){
            node.animBlock=node;
          }
          
          if (node.children){
            setAnimChild(node.children,node)
          }
        }
      })  
      //Устанавливаем анимацию для панелей
        traverseTree(BlockTree,(node)=>{
          if (node.anim_type!==0){
            if (node.panels) {
              node.panels.forEach(panel=>{
                panel.animBlock = node.animBlock
              })
            }
          }
        })

        //Добавляем панели
        traverseTree(BlockTree, (node) => {
         
          if (node.panels){
            createPanels(node.panels, materialsData, scene, node.group);
          }
        });
        console.log(BlockTree);

        creatFasteners();
       
      } catch (error) {
        console.error(error);
      } finally {
        SpinnerOff();
        //hideSpinner(); // Выключаем спиннер в любом случае (даже при ошибке)
      }
    }
    
  function creatFasteners(){
    /*
    // Создайте экземпляр загрузчика
// Создайте экземпляр загрузчика
var loader = new THREE.FileLoader();


// Укажите путь к файлу STL
var stlFile = 'http://localhost:8000/media/fasteners/stopka.stl';

// Загрузите модель
loader.load(stlFile, function (stlString) {
  var geometry = new THREE.STLLoader().parse(stlString);

  // Создайте Mesh на основе загруженной геометрии
  var material = new THREE.MeshNormalMaterial(); // Просто пример материала
  var mesh = new THREE.Mesh(geometry, material);

  // Добавьте Mesh на сцену
  scene.add(mesh);
});*/

/*const loader = new STLLoader();
				loader.load( './models/stl/ascii/slotted_disk.stl', function ( geometry ) {

					const material = new THREE.MeshPhongMaterial( { color: 0xff9c7c, specular: 0x494949, shininess: 200 } );
					const mesh = new THREE.Mesh( geometry, material );

					mesh.position.set( 0, - 0.25, 0.6 );
					mesh.rotation.set( 0, - Math.PI / 2, 0 );
					mesh.scale.set( 0.5, 0.5, 0.5 );

					mesh.castShadow = true;
					mesh.receiveShadow = true;

					scene.add( mesh );

				} );
*/
const material = new THREE.MeshPhysicalMaterial({
  color: 0xb2ffc8,
  //envMap: envTexture,
  metalness: 0.25,
  roughness: 0.1,
  opacity: 1.0,
  transparent: true,
  transmission: 0.99,
  clearcoat: 1.0,
  clearcoatRoughness: 0.25,
})
const loader = new STLLoader()
loader.load(
    'http://localhost:8000/media/fasteners/stopka.stl',
    function (geometry) {
        const mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)
  }
  
  //------------------------------------------------------------------
  
  // Функция для создания панели на основе данных
  function createPanel(panelData, materialData, scene, Group) {
    
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
    console.log(materialData.texture_link);
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

      mesh.userData = panelData;
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
  
      // Создаем геометрию для рёбер
      const edgesGeometry = new THREE.EdgesGeometry(geometry);
  
      // Создаем материал LineBasicMaterial для рёбер (чёрный цвет)
      const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
  
      // Создаем объект LineSegments для отображения рёбер
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      edges.position.copy(position);
      edges.quaternion.copy(quaternion);
  
      panelData.mesh = mesh;
      panelData.edge = edges;
  
  Group.add(mesh);
  Group.add(edges);
  //console.log(blockData);

 
  
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
        //console.log(icon.classList);
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
  
  function onClick(event) {
    // Получаем координаты клика мыши
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );
  
    // Обновляем позицию луча в соответствии с координатами мыши
    raycaster.setFromCamera(mouse, camera);
  
    // Пересекаем луч с объектами на сцене
    const intersects = raycaster.intersectObjects(scene.children, true);
  
    // Проверяем, есть ли пересечения
    if (intersects.length > 0) {
        // Ищем первый объект с типом Mesh
        let intersectedMesh = null;
        for (const intersect of intersects) {
            if (intersect.object.type === 'Mesh') {
                intersectedMesh = intersect.object;
                break;
            }
        }
  
        // Если найден объект с типом Mesh, проверяем его userData
        if (intersectedMesh !== null) {
            const userData = intersectedMesh.userData;
            console.log(userData);
            if (userData && userData.animBlock) {
                // Выполняем функцию animateBlock
                animateBlock(userData.animBlock);
            } else {
                console.log('Объект Mesh не содержит animBlock в своем userData.');
            }
        } else {
            console.log('Пересечений с объектами Mesh не найдено.');
        }
    }
  }
  
  function animateBlock(Block) {
      const group = Block.group; 
      console.log(Block);
      // Сохраняем начальное состояние группы перед анимацией
      if (!initialGroupState[group.uuid]) {
           initialGroupState[group.uuid] = {
               rotationY: group.rotation.y,
               rotationX: group.rotation.x,
               positionZ: group.position.z,
               positionX: group.position.x
           };
       }

      
    
     
     if (Block.anim_type == 2) {//-----------------Фасад петли слева

               const initialRotationY = initialGroupState[group.uuid].rotationY;
               let targetRotationY = initialRotationY - Math.PI / 3;

               // Проверяем, была ли группа уже повернута, если да - возвращаем в исходное положение
               if (group.rotation.y !== initialRotationY) {
                   targetRotationY = initialRotationY;
               }

               // Анимация поворота на угол Math.PI / 8 вокруг оси Y
               createjs.Tween.get(group.rotation)
                   .to({ y: targetRotationY }, 500);
      } else if (Block.anim_type == 3) {//------------------Фасад петли справа
                const initialRotationY = initialGroupState[group.uuid].rotationY;
                let targetRotationY = initialRotationY + Math.PI / 3;

                // Проверяем, была ли группа уже повернута, если да - возвращаем в исходное положение
                if (group.rotation.y !== initialRotationY) {
                    targetRotationY = initialRotationY;
                }
               // Получаем центр группы
const center = new THREE.Vector3();
const boundingBox = new THREE.Box3().setFromObject(group);
boundingBox.getCenter(center);

// Устанавливаем отрицательный масштаб для отражения по оси X через центр
group.scale.x *= -1;

// Смещаем группу обратно на ее исходное положение по оси X
group.position.x = -center.x;
              

                
                // Анимация поворота на угол Math.PI / 8 вокруг оси Y
                createjs.Tween.get(group.rotation)
                    .to({ y: targetRotationY }, 500);
                
      }else if (Block.anim_type == 5) {//------------------Фасад петли сверху
                const initialRotationX = initialGroupState[group.uuid].rotationX;
                let targetRotationX = initialRotationX + Math.PI / 3;

                // Проверяем, была ли группа уже повернута, если да - возвращаем в исходное положение
                if (group.rotation.x !== initialRotationX) {
                    targetRotationX = initialRotationX;
                }

                // Анимация поворота на угол Math.PI / 8 вокруг оси Y
                createjs.Tween.get(group.rotation)
                    .to({ x: targetRotationX }, 500);
                
      }else if (Block.anim_type == 6) {       //---------------------Дверь купе левая
                const initialPositionX = initialGroupState[group.uuid].positionX;
                let targetPositionX = initialPositionX + (Block.length-35)/1000;

                // Проверяем, была ли группа уже сдвинута, если да - возвращаем в исходное положение
                if (group.position.x !== initialPositionX) {
                    targetPositionX = initialPositionX;
                }

                // Создаем анимацию сдвига с использованием TweenJS из CreateJS
                createjs.Tween.get(group.position)
                    .to({ x: targetPositionX }, 500);
      }else if (Block.anim_type == 7) {       //---------------------Дверь купе правая
                const initialPositionX = initialGroupState[group.uuid].positionX;
                let targetPositionX = initialPositionX -  (Block.length-35)/1000;

                // Проверяем, была ли группа уже сдвинута, если да - возвращаем в исходное положение
                if (group.position.x !== initialPositionX) {
                    targetPositionX = initialPositionX;
                }

                // Создаем анимацию сдвига с использованием TweenJS из CreateJS
                createjs.Tween.get(group.position)
                    .to({ x: targetPositionX }, 500);
      }else if (Block.anim_type == 8) {       //---------------------Ящик
                const initialPositionZ = initialGroupState[group.uuid].positionZ;
                let targetPositionZ = initialPositionZ + 0.4;

                // Проверяем, была ли группа уже сдвинута, если да - возвращаем в исходное положение
                if (group.position.z !== initialPositionZ) {
                    targetPositionZ = initialPositionZ;
                }

                // Создаем анимацию сдвига с использованием TweenJS из CreateJS
                createjs.Tween.get(group.position)
                    .to({ z: targetPositionZ }, 500);
          }
  }
// Добавляем обработчик клика на окно
window.addEventListener('click', onClick);