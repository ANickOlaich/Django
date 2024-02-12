# myapp/forms.py
from django import forms
from .models import Material


class JSONFileUploadForm(forms.Form):
    json_file = forms.FileField(
        label='Выберите файл JSON',
        help_text='Максимальный размер файла: 10 MB',
        widget=forms.ClearableFileInput(),
    )

class MaterialForm(forms.ModelForm):
    class Meta:
        model = Material
        fields = '__all__'
    
class ImageForm(forms.Form):
    image_data = forms.CharField(widget=forms.HiddenInput())

