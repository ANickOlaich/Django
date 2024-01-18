import requests
from bs4 import BeautifulSoup
from django.http import JsonResponse

def parse_data():
    # URL страницы для парсинга
    target_url = "https://example.com"

    try:
        # Отправляем GET-запрос к странице
        response = requests.get(target_url)
        response.raise_for_status()  # Проверяем успешность запроса

        # Используем BeautifulSoup для парсинга HTML
        soup = BeautifulSoup(response.content, 'html.parser')

        # Здесь ты можешь использовать soup для извлечения нужных данных
        # Например:
        title = soup.title.text
        paragraphs = [p.text for p in soup.find_all('p')]

        # Возвращаем результат в формате JSON
        return JsonResponse({'title': title, 'paragraphs': paragraphs})
    except Exception as e:
        # В случае ошибки возвращаем сообщение об ошибке
        return JsonResponse({'error': str(e)}, status=500)