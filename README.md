# reImage
javaScript little class to resize Images on client side in file input and send to server Form with new Images

Небольшой js класс, который позволяет загружать изображения через file Input, изменять размер изображения, и затем отправляет новые изображения в составе формы на сервер.

Это необходимо для клиентов с плохим интернетом. Использовать очень легко:

Html:

<form enctype="multipart/form-data" id="additem-form" action="/someUrl" method="post">

<input id="Client_name" type="text" name="Client[name]">

<select name="Client[status]" id="Client_status">
  <option value="Завершена">Завершена</option>
  <option value="Требует согласования с координатором">Требует согласования с координатором</option>
  <option value="Arrived At Location">Прибыл в торговую точку</option>
</select>

<input id="Client_images" accept="image/*" multiple="multiple" type="file" name="images[]">

</form>


JS:
reImage.bind($('#Client_images'), 'images');



Вот и все
