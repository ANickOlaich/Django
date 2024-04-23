
var fastenersData, materialsData
var fastenersDataElement = document.getElementById("fasteners_in_project");
if(fastenersDataElement){
    fastenersData = JSON.parse(fastenersDataElement.value);
    console.log(fastenersData);
}

var materialsDataElement = document.getElementById("materials_in_project");
if(materialsDataElement){
    materialsData = JSON.parse(materialsDataElement.value);
    console.log(materialsData);
}



var inProjectId = 0;
var inProjectImage;

 // Получение CSRF токена из куки
 function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Найдем токен с помощью имени, которое вы установили в настройках Django
            if (cookie.startsWith(`${name}=`)) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');
// Обработчик нажатия на кнопку "Продолжить"
document.getElementById('continue_button').addEventListener('click', function() {
   if(fastenersData){
        // Отправка AJAX запроса с CSRF токеном
        fetch('/projects/check_fasteners/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken // Передаем CSRF токен в заголовке запроса
            },
            body: JSON.stringify({ fastenersData: fastenersData }) // Ваш JSON объект данных
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Произошла ошибка при отправке запроса:', response.statusText);
            }
            console.log('Запрос успешно отправлен');
            // Перенаправляем пользователя на другую страницу
            window.location.href = '../check_materials/'
        })
        .catch(error => {
            console.error(error);
        });
   }else if(materialsData){
        // Отправка AJAX запроса с CSRF токеном
        fetch('/projects/check_materials/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken // Передаем CSRF токен в заголовке запроса
            },
            body: JSON.stringify({ materialsData: materialsData }) // Ваш JSON объект данных
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Произошла ошибка при отправке запроса:', response.statusText);
            }
            console.log('Запрос успешно отправлен');
            // Перенаправляем пользователя на другую страницу
            window.location.href = '../check_project/'
        })
        .catch(error => {
            console.error(error);
        });
   }
    
    });

function handleItemClick(itemId){
    console.log(itemId);
    inProjectImage = document.getElementById(`in-project-image-${itemId}`);
    inProjectId = parseInt(itemId);
    }

function handleItemClickRight(itemId){
        console.log(itemId);
        if(inProjectId !== 0){
            // Находим объект в массиве fastenersData с нужным Id
            const inProjectIndex = fastenersData.findIndex(obj => obj.Id === inProjectId);
            if (inProjectIndex !== -1) {
                // Если объект найден, изменяем его поле inBase на значение itemId
                fastenersData[inProjectIndex].inBase = parseInt(itemId);
                
                // Получаем элемент рамочки
                const projectFastenerElement = document.getElementById(`project-fastener-${inProjectId}`);
                console.log(projectFastenerElement);
                projectFastenerElement.classList.remove('border-danger'); // Удаляем класс для красной рамки
                projectFastenerElement.classList.add('border-success'); // Добавляем класс для зеленой рамки
              
                
                // Обновляем изображение
                inProjectImage.src = document.getElementById(`fastener-image-${itemId}`).src;
                console.log(fastenersData);
            } else {
                console.log("Объект с указанным Id не найден в массиве fastenersData.");
            }
        } else {
            console.log("inProjectId равно 0, объект не может быть найден.");
        }
    }

    function materialItemClickRight(itemId){
        console.log(inProjectId+' <--- '+itemId);
        if(inProjectId !== 0){
            // Находим объект в массиве fastenersData с нужным Id
            const inProjectIndex = materialsData.findIndex(obj => obj.id === inProjectId);
            console.log(inProjectIndex);
            if (inProjectIndex !== -1) {
                // Если объект найден, изменяем его поле inBase на значение itemId
                materialsData[inProjectIndex].inBase = parseInt(itemId);
                
                // Получаем элемент рамочки
                const projectElement = document.getElementById(`project-material-${inProjectId}`);
                console.log(projectElement);
                projectElement.classList.remove('border-danger'); // Удаляем класс для красной рамки
                projectElement.classList.add('border-success'); // Добавляем класс для зеленой рамки
              
                
                // Обновляем изображение
                const newImage = document.getElementById(`material-image-${itemId}`).src;
                if (newImage){
                    inProjectImage.src = newImage;

                }
               
                console.log(materialsData);
            } else {
                console.log("Объект с указанным Id не найден в массиве materialssData.");
            }
        } else {
            console.log("inProjectId равно 0, объект не может быть найден.");
        }
    }

