# myapp/forms.py
from django import forms
from .models import Material, Fasteners
from django.contrib.auth.models import User


class JSONFileUploadForm(forms.Form):
    json_file = forms.FileField(
        label='Выберите файл JSON',
        help_text='Максимальный размер файла: 10 MB',
        widget=forms.ClearableFileInput(),
    )

class MaterialForm(forms.ModelForm):
    class Meta:
        model = Material
        fields = '__all__'  # Используем все поля модели Material

    def __init__(self, *args, **kwargs):
        super(MaterialForm, self).__init__(*args, **kwargs)
        # Настройка виджетов полей формы
        self.fields['name'].widget.attrs['class'] = 'form-control'
        self.fields['article'].widget.attrs['class'] = 'form-control'
        self.fields['page_link'].widget.attrs['class'] = 'form-control'
        self.fields['texture_link'].widget.attrs['class'] = 'form-control-file'  # для поля texture_link используем class form-control-file
        self.fields['roughness'].widget.attrs['class'] = 'form-range'
        self.fields['metalness'].widget.attrs['class'] = 'form-range'
        self.fields['transmission'].widget.attrs['class'] = 'form-range'
        self.fields['clearcoat'].widget.attrs['class'] = 'form-range'
        self.fields['clearcoatRoughness'].widget.attrs['class'] = 'form-range'
        self.fields['reflectivity'].widget.attrs['class'] = 'form-range'
        self.fields['color'].widget.attrs['class'] = 'form-control'
        self.fields['isNew'].widget.attrs['class'] = 'form-check-input'
        self.fields['material_type'].widget.attrs['class'] = 'form-select'
        self.fields['image'].widget.attrs['class'] = 'form-control-file'
    
class ImageForm(forms.Form):
    image_data = forms.CharField(widget=forms.HiddenInput())

class UserRegistrationForm(forms.ModelForm):
    password = forms.CharField(label="Пароль", widget=forms.PasswordInput)
    confirm_password = forms.CharField(label="Подтвердите пароль", widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        labels = {
            'username': 'Имя пользователя',
            'email': 'Email',
        }
        error_messages = {
            'username': {
                'required': 'Поле "Имя пользователя" обязательно для заполнения.',
                'max_length': 'Максимальная длина имени пользователя - 150 символов.',
                'invalid': 'Имя пользователя может содержать только буквы, цифры и следующие символы: @/./+/-/_.',
            },
            'password': {
                'min_length': 'Пароль должен содержать как минимум 8 символов.',
                'too_similar': 'Ваш пароль не должен слишком совпадать с вашей персональной информацией.',
                'common_password': 'Пароль не должен быть часто используемым паролем.',
                'numeric_password': 'Пароль не может состоять только из цифр.',
            },
        }

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        confirm_password = cleaned_data.get('confirm_password')

        if password != confirm_password:
            self.add_error('confirm_password', 'Пароли не совпадают.')

class FastenersForm(forms.ModelForm):
    class Meta:
        model = Fasteners
        fields = ['stl_file']

class ProjectForm(forms.Form):
    json_file = forms.FileField(label='Выберите JSON файл')
    name = forms.CharField(label="Назва", max_length=100)