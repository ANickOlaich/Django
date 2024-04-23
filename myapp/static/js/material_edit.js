import * as THREE from './three/three.module.js';
import { OrbitControls } from './three/jsm/OrbitControls.js';
import { RGBELoader } from './three/jsm/RGBELoader.js';


 // Define a JavaScript variable to hold the static URL
 const staticUrl = document.getElementById('staticUrl').value;


const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // Цвет фона

const canvas = document.getElementById('threeCanvas');
const camera = new THREE.PerspectiveCamera( 75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
// Создаем свободную камеру с использованием OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Включаем затухание (инерцию)
controls.dampingFactor = 0.1; // Настраиваем коэффициент затухания



new RGBELoader()
    .setPath(staticUrl+'environment/')
    .load('small_empty_room_3_1k.hdr', function (texture) {

        texture.mapping = THREE.EquirectangularReflectionMapping;

        //scene.background = texture;
        scene.environment = texture;

    });

 

    const length = 1, width = 1;

    const shape = new THREE.Shape();
    shape.moveTo( -length/2,-width/2 );
    shape.lineTo( length/2, -width/2 );
    shape.lineTo( length/2, width/2 );
    shape.lineTo( -length/2, width/2 );
    shape.lineTo( -length/2, -width/2);
    
    const extrudeSettings = {
        steps: 1,
        depth: 0.018,
        bevelEnabled: true,
        bevelThickness: 0.001,
        bevelSize: 0.001,
        bevelOffset: 0,
        bevelSegments: 3
    };
    
const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
const textureLoader = new THREE.TextureLoader();
const textureUrl = staticUrl+document.getElementById('texture').value
texture = textureLoader.load(textureUrl);
  
// Настройка текстуры
texture.repeat.set(1, 1);
texture.wrapS = THREE.MirroredRepeatWrapping;
texture.wrapT = THREE.MirroredRepeatWrapping;

const material = new THREE.MeshPhysicalMaterial({map: texture});
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );




camera.position.x = 0.7;
camera.position.y = 0.5;
camera.position.z = 0.7;
updateMaterial();

function animate() {
   
    
	requestAnimationFrame( animate );
	controls.update();
	renderer.render( scene, camera );
}

animate();

/*name = models.CharField(max_length=255, help_text="Наименование материала")
    texture_link = models.ImageField(upload_to='textures/', blank=True, null=True, help_text="Текстура")
    roughness = models.FloatField(default=0.5, help_text="Степень матовости. 0 - Полностью блестящий, 1 - Полностью матовый)")
    metalness = models.FloatField(default=0, help_text="Степень металлического блеска (от 0 до 1)")
    transmission = models.FloatField(default=0, help_text="Прозрачность. 0 - Не прозрачный, 1 - полностью прозрачный")
    clearcoat = models.FloatField(default=0, help_text="Количество покрытия")
    clearcoatRoughness = models.FloatField(default=0, help_text="Шероховатость покрытия")
    reflectivity = models.FloatField(default=0.2, help_text="Коэффициент отражения (от 0 до 1)")
    color = ColorField(default='#ffffff', help_text="Цвет")
*/
function updateMaterial(){
    console.log(camera);
    material.roughness = document.getElementById('roughness').value;
    material.metalness = document.getElementById('metalness').value;
    material.transmission = document.getElementById('transmission').value;
    material.clearcoat = document.getElementById('clearcoat').value;
    material.clearcoatRoughness = document.getElementById('clearcoatRoughness').value;
    material.reflectivity = document.getElementById('reflectivity').value;
    const color = document.getElementById('color').value;
    const hexColor = color.substring(1); // Remove the '#' character
    const rgbColor = new THREE.Color(`#${hexColor}`);
    material.color = rgbColor
    
}

window.update = function(){
    updateMaterial();
}
window.updateTexture = function(){
    const fileInput = document.getElementById('texture_link');
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', function () {
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(reader.result, function () {
        material.map = texture;
        material.needsUpdate = true;
        });
    });

    if (file) {
        reader.readAsDataURL(file);
    }
    
}

window.prepareForm = function() {
   
   
    /*
   camera.position.x = -0.12;
   camera.position.y = 0.141;
   camera.position.z = -0.791;

   const quaternion = new THREE.Quaternion(-0.66,-0.12,-0.008,0.99);
   camera.applyQuaternion(quaternion);
   animate();
*/

   // Получаем данные изображения в формате base64
   var imageData = canvas.toDataURL('image/png');
    
   // Устанавливаем значение скрытого поля формы равным данным изображения
   document.getElementById('canvasImage').value = imageData;
   
   // Возвращаем true для продолжения отправки формы
   return true;
}

// Добавляем обработчик события отправки формы
document.getElementById('myForm').onsubmit = prepareForm;

// Обработчик изменения размеров окна
window.addEventListener('resize', function () {
 
    //canvas = document.getElementById('threeCanvas');

    camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
});
