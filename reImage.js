var reImage = {

    images:[], // Контейнер, где хранятся все изоражения.. При отправке формы они берутся отсюда
    box: 'reImage_Box', // ID контейнера, для миниатюр
    thumbWidth: 150, // Ширина миниатюры
    thumbHeight: 150, // Длина миниатюры

    maxSize: 1024*1024, // При изменении качества, этот параметр задает максимальный размер выходного изображения. Я его не использую
    maxWidth: 1366, // Максимальная длина в px по ширине или по длине (что больше)

    // Начало
    bind: function(fileInput, inputName){

        // Инициализируем. Вешаем события.

        this.onChange(fileInput);
        this.onSubmit(fileInput, inputName);

    },

    // Событие при отправке формы
    onSubmit: function(fileInput, inputName){
        var api = this;

        var form = $(fileInput).closest('form');

        $(form).on('submit', function(e){
            e.preventDefault();

            var formData = new FormData($(form)[0]);

            var xhr = new XMLHttpRequest();
            xhr.open ('post', $(form).attr('action'), false);

            formData.delete($(fileInput).attr('name'));

            api.images.forEach(function(item, i, arr) {
                formData.set(inputName+'['+i+']', api.base64toBlob(item.data, item.type), item.name);
            });

            console.log(formData);

            xhr.onreadystatechange = function() { // Ждём ответа от сервера
                if (xhr.readyState == 4) { // Ответ пришёл
                    if(xhr.status == 200) { // Сервер вернул код 200 (что хорошо)
                        location.reload(); // Перезагружаем страницу
                        //console.log(xhr.responseText); // Выводим ответ сервера
                    }
                    else{
                        alert('Возникла ошибка при добавлении данных');

                        // Перезагружаем через 2 с. страницу
                        setInterval(function() {
                            location.reload();
                        }, 2000);
                        console.log(xhr.responseText);
                    }
                }
            };

            xhr.send (formData);

            // var list = $(fileInput)[0].files;
            //
            // api.images.forEach(function(item, i, arr) {
            //
            //     list[list.length] = new File([item.data], item.name);
            //
            //     //formData.set(inputName+'['+i+']', api.base64toBlob(item.data, item.type), item.name);
            // });
            //
            //
            // $(form).unbind('submit').submit();
            //
            //


        });
    },

    //Событие при изменении input file
    onChange: function(fileInput){
        var api = this;

        $(fileInput).on('change', function(e){

            // Если Нужно при изменении Input заново добавлять изображения - раскоментировать две нижние строчки
            // Я хочу, чтобы изображения добавлялись в массив при каждом добавлении
            //api.clearBox();
            //api.images = [];

            var files = this.files;

            $.each(files, function(index, file){

                var exist = $.grep(api.images, function(mEl) {
                    return mEl.name === file.name;
                });

                if(exist.length>0) return;

                if(file.type === "image/png" || file.type === "image/jpeg"){}
                else {
                    alert('Разрешены форматы JPG и PNG');
                    return;
                }

                var output_format = "jpg";
                if(file.type === "image/png") output_format = "png";

                var quality = api.calculateQuality(file, api.maxSize);

                var Img = new Image();

                var reader = new FileReader();
                reader.onload = function (e) {
                    Img.src =  e.target.result;
                };
                reader.onloadend = function(e){
                    var newImg = new Image(api.thumbWidth, api.thumbHeight);
                    if(file.size > api.maxSize){
                        newImg.src = api.compress(Img, quality, output_format).src;
                    }
                    else newImg.src = Img.src;


                    newImg.onload = function () {
                        api.addToBox(fileInput, this);
                        var base = this.src.replace("data:"+ file.type +";base64,", '');
                        api.images.push({
                            data: base,
                            name: file.name,
                            type: file.type
                        });
                    };
                };
                reader.readAsDataURL(file);
            });
        });

    },

    // При желании, можем изменить качество выходного изображения
    // Конкретно здесь, я не меняю качество и оставляю его 100%
    calculateQuality: function(File, size){

        var oldSize = File.size;
        var ret = 100;

        if(oldSize > size){

            var pers = oldSize/100;
            ret =  size/oldSize;

        }

        ret = parseInt(ret);

        return 100;
    },

    // Очищаем контейнер с миниатюрами
    clearBox: function(){
        var box = $('#'+this.box);
        $(box).remove();
    },

    /**
     *
     * @param {Image} Image
     */
    addToBox: function(fileInput, Image){

        if(!$("div").is('#'+this.box)){
            $(fileInput).after("<div id='"+this.box+"' style='border: 3px dashed #aaa;padding: 10px;margin-bottom: 10px;'></div>");

        }

        var box = $('#'+this.box);

        $(Image).css('margin', '3px');
        $(box).append(Image);

    },

    /**
     * Ужимаем изображение
     * Receives an Image Object (can be JPG, PNG, or WEBP) and returns a new Image Object compressed
     * @param {Image} source_img_obj The source Image Object
     * @param {Integer} quality The output quality of Image Object
     * @param {String} output_format. Possible values are jpg, png, and webp
     * @return {Image} result_image_obj The compressed Image Object
     */
    compress: function(source_img_obj, quality, output_format){

        var api = this;

        var mime_type;
        if(output_format==="png"){
            mime_type = "image/png";
        } else if(output_format==="webp") {
            mime_type = "image/webp";
        } else {
            mime_type = "image/jpeg";
        }

        var cvs = document.createElement('canvas');

        var w = source_img_obj.naturalWidth;
        var h = source_img_obj.naturalHeight;

        if(w > api.maxWidth || h > api.maxWidth){

            var koof = 1;

            if(w > h) koof = (w/api.maxWidth).toFixed(1);
            else koof = (h/api.maxWidth).toFixed(1);

            cvs.width = w/koof;
            cvs.height = h/koof;
        }
        else{
            cvs.width = w;
            cvs.height = h;
        }

        // cvs.width = source_img_obj.naturalWidth;
        // cvs.height = source_img_obj.naturalHeight;

        var ctx = cvs.getContext("2d").drawImage(source_img_obj, 0, 0, cvs.width, cvs.height);
        var newImageData = cvs.toDataURL(mime_type, quality);


        var result_image_obj = new Image();
        result_image_obj.src = newImageData;
        return result_image_obj;
    },

    /**
     * Конвертируем изображение из base64 в Blob
     * @param base64Data
     * @param contentType
     * @returns {Blob}
     */
    base64toBlob: function(base64Data, contentType) {
        contentType = contentType || '';
        var sliceSize = 1024;
        var byteCharacters = atob(base64Data);
        var bytesLength = byteCharacters.length;
        var slicesCount = Math.ceil(bytesLength / sliceSize);
        var byteArrays = new Array(slicesCount);

        for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
            var begin = sliceIndex * sliceSize;
            var end = Math.min(begin + sliceSize, bytesLength);

            var bytes = new Array(end - begin);
            for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
                bytes[i] = byteCharacters[offset].charCodeAt(0);
            }
            byteArrays[sliceIndex] = new Uint8Array(bytes);
        }
        return new Blob(byteArrays, { type: contentType });
    }

};
