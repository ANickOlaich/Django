from django.shortcuts import render
import requests
from bs4 import BeautifulSoup

class Article:
    def __init__(self, id, name, group_name, unit_measure, price, coef, length, width, thickness, sign, overhang, color, texture, _class, sync_external):
        self.id = id
        self.name = name
        self.group_name = group_name
        self.unit_measure = unit_measure
        self.price = price
        self.coef = coef
        self.length = length
        self.width = width
        self.thickness = thickness
        self.sign = sign
        self.overhang = overhang
        self.color = color
        self.texture = texture
        self._class = _class
        self.sync_external = sync_external

def parser(request):
    article = None
    if request.method == 'POST':
        url = request.POST.get('url')
        # Извлекаем данные со страницы
        response = requests.get(url)
        if response.status_code == 200:
            # Парсим HTML-код страницы
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Извлекаем имя товара из тега h1 с классом product__title-text
            name_element = soup.find('h1', class_='product__title-text')
            name = name_element.text.strip() if name_element else "No name"

            # Извлекаем id товара из тега span с классом product__title-sup-value и id ms_prod_code
            id_element = soup.find('span', class_='product__title-sup-value', id='ms_prod_code')
            id = id_element.text.strip() if id_element else "No ID"

            # Извлекаем название группы товара из элемента td с классом product-info__content-substatus-name и текстом "Виробник:"
            group_name_element = soup.find('td', class_='product-info__content-substatus-name', text='Виробник:')
            group_name = group_name_element.find_next('td', class_='product-info__content-substatus-value').text.strip() if group_name_element else "No group name"

            # Извлекаем цену товара из тега span с классом product-price__cost
            price_element = soup.find('span', class_='product-price__cost')
            price = price_element.text.strip() if price_element else "No price"

            # Извлекаем остальные данные со страницы
            unit_measure = soup.find('Unit_Measure').text if soup.find('Unit_Measure') else "No unit measure"
            coef = soup.find('Coef').text if soup.find('Coef') else "No coef"
            length = soup.find('Length').text if soup.find('Length') else "No length"
            width = soup.find('Width').text if soup.find('Width') else "No width"
            thickness = soup.find('Thickness').text if soup.find('Thickness') else "No thickness"
            sign = soup.find('Sign').text if soup.find('Sign') else "No sign"
            overhang = soup.find('Overhang').text if soup.find('Overhang') else "No overhang"
            color = soup.find('Color').text if soup.find('Color') else "No color"
            texture = soup.find('Texture').text if soup.find('Texture') else "No texture"
            _class = soup.find('Class').text if soup.find('Class') else "No class"
            sync_external = soup.find('Sync_External').text if soup.find('Sync_External') else "No sync external"

            # Создаем объект Article
            article = Article(id, name, group_name, unit_measure, price, coef, length, width, thickness, sign, overhang, color, texture, _class, sync_external)
        else:
            return render(request, 'parsers/parser.html', {'error': 'Ошибка при загрузке страницы'})
    return render(request, 'parsers/parser.html', {'article': article})