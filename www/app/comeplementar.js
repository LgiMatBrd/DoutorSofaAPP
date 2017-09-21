/** 
 * 
 */
function timestampUTC() {
    //var today = new Date();
    //return Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds(), today.getMilliseconds);
    return (Date.now()/1000) | 0;
}

/** 
 * 
 */
function calcTime(timestamp, offset) {

    // create Date object for current location
    var d = new Date(timestamp);

    // convert to msec
    // add local time zone offset
    // get UTC time in msec
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);

    // create new Date object for different city
    // using supplied offset
    var nd = new Date(utc + (3600000*offset));

    // return time as a string
    return "The local time is " + nd.toLocaleString();
}

/** 
 * 
 */
function convertToLocalTime(timestamp) {

    // create Date object for current location
    var d = new Date(timestamp);

    return d.toLocaleString();
}

// Define e inicializa os objetos a serem usados na DB através de construtores

// Objeto de cliente
function Franqueado()
{
    this.id = 0; // ID da row no DB local
    this.idext = 0; // ID da row no DB externo (obtido na sincronização)
    this.nome = ''; // Nome do Cliente
    this.email = '';
    this.senha = '';
    this.data_criacao = 0; // Timestamp UTC da criação
    this.modificado = 0; // Timestamp UTC da última modificação
} 

// Objeto da vistoria
function Funcionario()
{
    this.id = 0;
    this.idext = 0;
    this.nome = '';
    this.email = '';
    this.senha = '';
    this.id_cliente = 0;
    this.data_criacao = 0;
    this.modificado = 0;
} 

// Objeto do item vistoriado
function Servicos()
{
    this.id = 0;
    this.idext = 0;
    this.id_vistoria = 0;
    this.data_criacao = 0;
    this.modificado = 0;
    this.status = 0; // 1 cancelados 2 realizado

    this.fotos64 = [];
    this.dados = {};
}

// Objeto para salvar dados recentes
function Recent()
{
    this.key = -1;
    this.idext = 0;
}

// Permite a clonagem de uma row da DB
function dbClone(obj)
{
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Cliente
    if (obj instanceof Cliente) {
        copy = new Cliente();
        copy.id = obj.id;
        copy.idext = obj.idext;
        copy.nome = obj.nome;
        copy.data_criacao = obj.data_criacao;
        copy.modificado = obj.modificado;
        return copy;
    }

    // Handle Vistoria
    if (obj instanceof Vistoria) {
        copy = new Vistoria();
        copy.id = obj.id;
        copy.idext = obj.idext;
        copy.nome = obj.nome;
        copy.id_cliente = obj.id_cliente;
        copy.data_criacao = obj.data_criacao;
        copy.modificado = obj.modificado;    
        return copy;
    }

    // Handle itemVitoriado
    if (obj instanceof itemVitoriado) {
        copy = new itemVitoriado();
        copy.id = obj.id;
        copy.idext = obj.idext;
        copy.id_vistoria = obj.id_vistoria;
        copy.data_criacao = obj.data_criacao;
        copy.modificado = obj.modificado;
        copy.fotos64 = obj.fotos64;
        copy.dados = obj.dados;
        return copy;
    }
    
    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = dbClone(obj[i]);
        }
        return copy;
    }
    
    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = dbClone(obj[attr]);
        }
        return copy;
    }
    throw new Error("Não foi possível clonar o objeto! Formato não suportado.");
}

var pictureSource;   // picture source
var destinationType; // sets the format of returned value 
// Wait for PhoneGap to connect with the device
//
document.addEventListener("deviceready",onDeviceReady,false);
// PhoneGap is ready to be used!
//
function onDeviceReady() {
    pictureSource=navigator.camera.PictureSourceType;
    destinationType=navigator.camera.DestinationType;
}
// Called when a photo is successfully retrieved
//
function onPhotoDataSuccess(imageData) {
  // Get image handle
  //
  var smallImage = document.getElementById('smallImage');
  // Unhide image elements
  //
  smallImage.style.display = 'block';
  // Show the captured photo
  // The inline CSS rules are used to resize the image
  //
  smallImage.src = "data:image/jpeg;base64," + imageData;
}

// Called when a photo is successfully retrieved
//
function onPhotoFileSuccess(imageData) {
  // Get image handle
  console.log(JSON.stringify(imageData));

  // Get image handle
  //
  var smallImage = document.getElementById('smallImage');
  // Unhide image elements
  //
  smallImage.style.display = 'block';
  // Show the captured photo
  // The inline CSS rules are used to resize the image
  //
  smallImage.src = imageData;
}
// Called when a photo is successfully retrieved
//
function onPhotoURISuccess(imageURI) {
  // Uncomment to view the image file URI 
  // console.log(imageURI);
  // Get image handle
  //
  var largeImage = document.getElementById('largeImage');
  // Unhide image elements
  //
  largeImage.style.display = 'block';
  // Show the captured photo
  // The inline CSS rules are used to resize the image
  //
  largeImage.src = imageURI;
}
// A button will call this function
//
function capturePhotoWithData() {
  // Take picture using device camera and retrieve image as base64-encoded string
  navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50 });
}
function ccapturePhotoWithFile() {
    navigator.camera.getPicture(onPhotoFileSuccess, onFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI });
}

// A button will call this function
//
function getPhoto(source) {
  // Retrieve image file location from specified source
  navigator.camera.getPicture(onPhotoURISuccess, onFail, { quality: 50, 
    destinationType: destinationType.FILE_URI,
    sourceType: source });
}
// Called if something bad happens.
// 
function onFail(message) {
  alert('Failed because: ' + message);
}

function moveFile(fileUri) {
    console.log(fileUri);
    window.resolveLocalFileSystemURL(
          fileUri,
          function(fileEntry)
          {
                newFileUri  = cordova.file.dataDirectory + "images/";
                oldFileUri  = fileUri;
                fileExt     = "." + oldFileUri.split('.').pop();

                newFileName = 'car' + fileExt;
                window.resolveLocalFileSystemURL(newFileUri,
                        function(dirEntry)
                        {
                            // move the file to a new directory and rename it
                            fileEntry.moveTo(dirEntry, newFileName, successCallback, errorCallback);
                            return newFileUri + newFileName;
                        },
                        photoErrorCallback);
          },
          photoErrorCallback);
}

function gotFile(file){
    readDataUrl(file);
}

function readDataUrl(file) {
    var reader = new FileReader();
    reader.onloadend = function(evt) {
        console.log("Read as data URL");
        console.log(evt.target.result);

        var imageData = evt.target.result;
        return imageData;
    };  
    reader.readAsDataURL(file); // Read as Data URL (base64)
}

function photoErrorCallback()
{
    return false;
}