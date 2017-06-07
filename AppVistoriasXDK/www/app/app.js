// INICIAL O APLICATIVO
var app = angular.module('seyconelApp', ['ngRoute','ngStorage','ngMaterial','ngMessages', 'material.svgAssetsCache', 'ngCordova']);

// CONFIGURA ROTAS E OUTRAS FUNÇÕES
app.config(function($routeProvider,$mdIconProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "paginas/vistoria.html",
		controller  : 'homeController'
    })
    .otherwise({
       redirectTo: '/'
    }); 
    
    $mdIconProvider
        .iconSet('social', 'img/icons/sets/social-icons.svg', 24)
        .iconSet('call', 'img/icons/sets/communication-icons.svg', 24)
        .iconSet('device', 'img/icons/sets/device-icons.svg', 24)
        .iconSet('communication', 'img/icons/sets/communication-icons.svg', 24)
        .icon('synced', 'icons/synced.svg')
        .defaultIconSet('img/icons/sets/core-icons.svg', 24);
});

// INICIA BANCO DE DADOS LOCAL
app.run(function($localStorage) {
    
    if (typeof $localStorage.clientes === 'undefined' || typeof $localStorage.clientes.db === 'undefined' || $localStorage.clientes.version !== 'v0.4')
    {
        $localStorage.clientes = {
            nextID: 0,
            version: 'v0.4',
            sendTimestamp: 0, // Armazena a timestamp UTC de modificação do último registro enviado
            recvTimestamp: 0, // Armazena a timestamp UTC de modificação do último registro recebido
            remoteDelete: [], // Armazena as IDs externas que devem ser apagadas
            db: {}
        }; 
    }
    if (typeof $localStorage.vistorias === 'undefined' || typeof $localStorage.vistorias.db === 'undefined' || $localStorage.vistorias.version !== 'v0.4')
    {
        $localStorage.vistorias = {
            nextID: 0,
            version: 'v0.4',
            sendTimestamp: 0,
            recvTimestamp: 0,
            remoteDelete: [],
            db: {}
        }; 
    }
    if (typeof $localStorage.itensVistoriados === 'undefined' || typeof $localStorage.itensVistoriados.db === 'undefined' || $localStorage.itensVistoriados.version !== 'v0.3')
    {
        $localStorage.itensVistoriados = {
            nextID: 0,
            version: 'v0.3',
            sendTimestamp: 0,
            recvTimestamp: 0,
            remoteDelete: [],
            db: {}
        }; 
    }
});

// CONTROLLER DA PÁGINA INICIAL
app.controller('homeController', function($scope, $routeParams, $http, $localStorage, $filter, $mdDialog) {    
    $scope.id_dono = '0';
	$scope.id = '0';
	$scope.nomeVistoria = $localStorage.vistorias.db[$scope.id].nome;
	$scope.idVistoria = $localStorage.vistorias.db[$scope.id].id;
	$scope.idDonoVistoria = $localStorage.vistorias.db[$scope.id].id_cliente;
    
   
	//$scope.idDono = $localStorage.vistorias.db[$scope.id].id_dono;
	//$scope.nomeCliente = $localStorage.clientes.db[$scope.idDono].nome;

	$scope.nomeClienteDono = $localStorage.clientes.db[$scope.idDonoVistoria].nome;
	$scope.NextID = $localStorage.itensVistoriados.nextID;
    
    // chama a função para preencher a variável que armazena as vistorias desse cliente
	$scope.itensVistoriados = {};
    populaVistorias($scope.id_dono);

    //menu
     $scope.isOpen = false;

      $scope.demo = {
        isOpen: false,
        count: 0,
        selectedDirection: 'left'
      };
    
    
    
    
    // Foto principal vistoria
    //$scope.fotoPrincipal = $localStorage.itensVistoriados.db;
    console.log($localStorage);
    
    $scope.showAdvanced = function(ev,id_click) {
        $mdDialog
            .show({
            controller: DialogController,
            templateUrl: 'formulario-vistoria.tmpl.html',
            id_dono: $scope.id_dono,
            id_click: id_click,
            locals: {
                tiposVistorias: $scope.tiposVistorias
            },
            bindToController: true,
            onRemoving: function() { populaVistorias($scope.id_dono); },
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: $scope.customFullscreen
            });
    };

    function DialogController($scope, $mdDialog, id_dono, tiposVistorias, id_click, $cordovaCamera) {
        $scope.myPictures = [];
        // Verifica se o usuário quer editar o item.
        if (id_click > -1)
        {
            $scope.item = {};
            $scope.item = $localStorage.itensVistoriados.db[id_click].dados;
            $scope.myPictures = $localStorage.itensVistoriados.db[id_click].fotos64;
            
            // Pega os valores booleanos que estão em string e coverte novamente.
            angular.forEach($scope.item, function(value, key) {
                //console.log(key + ': ' + value);
                if (value == "true") {
                    $scope.item[key] = true;
                }
            });
            
        } else {
            console.log('Nenhum item para ser editado, abrindo tela de adiconar novo item...');
        }
        
        $scope.$watch('myPicture', function(value) {
            if (value) {
                $scope.myPictures.push(value);
            }
        }, true);
        
        $scope.takePicture = function()
        {
            
            var options = {
              quality: 50,
              destinationType: Camera.DestinationType.DATA_URL,
              sourceType: Camera.PictureSourceType.CAMERA,
              allowEdit: false,
              encodingType: Camera.EncodingType.JPEG,
              mediaType: Camera.MediaType.PICTURE,
              targetWidth: 1024,
              targetHeight: 768,
              popoverOptions: CameraPopoverOptions,
              saveToPhotoAlbum: false,
              correctOrientation: false
            };
            $cordovaCamera.getPicture(options).then(function(data) {
                 $scope.myPicture = data;

            }, function(err) {
                 console.log(err);
            });
        
        }

        $scope.tiposVistorias = tiposVistorias;
        $scope.addItem = function(itemForm) {
            
            // Verifica se os Form é de edição ou de adição de novo Item
            if (id_click > -1) {
                // Edita o item
                id = id_click;
                $localStorage.itensVistoriados.db[id].dados = $scope.item;
                $localStorage.itensVistoriados.db[id].fotos64 = $scope.myPictures;
                $localStorage.itensVistoriados.db[id].modificado = timestampUTC();
                
                $mdDialog.hide();
            } else {
                id = $localStorage.itensVistoriados.nextID;

                /* OBJETO
                this.id = 0;
                this.id_dono = '';
                this.data_criacao = '';
                this.dados = '';
                */
                item = new itemVitoriado(); 
                item.id = id;
                item.id_vistoria = id_dono;
                item.data_criacao = timestampUTC();
                item.modificado = item.data_criacao;
                
                item.fotos64 = $scope.myPictures;
                item.dados = $scope.item;

                $localStorage.itensVistoriados.db[id] = item;

                id = id + 1; 
                $localStorage.itensVistoriados.nextID = id;
                
                $mdDialog.hide();
            }

        };
        
        $scope.capturePhotoWithFile = function ()
        {
            navigator.camera.getPicture(function (imageData) {
                imgView = imageData;
            }, function (msg) {
                console.log(msg);
            }, { quality: 50, destinationType: Camera.DestinationType.DATA_URL });
        }
        
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
    }

    // ler vistorias
    // popula a variavel $scope.vistorias
    function populaVistorias($id_dono)
    {  
        var db = $localStorage.itensVistoriados.db;
        $scope.itensVistoriados = {};
        
        for (var vist_key in db)
        {
            if (db.hasOwnProperty(vist_key))
            {
                if (db[vist_key].id_vistoria == $id_dono)
                    $scope.itensVistoriados[vist_key] = Object.create(db[vist_key]);
            }
        }
    }
        
    // botão de voltar
    $scope.goBack = function() {
        window.history.back();
    };
    
    // ver vistoria
    $scope.verVistoria = function (id) {
        $location.path('/vistoria/' + id);
    };

    // ler vistorias
    $scope.lerVistorias = function ($id_dono) 
    {
        var resultado = {};
        var db = $localStorage.vistorias.db; 
        
        for (var vist_key in db)
        {
            if (db.hasOwnProperty(vist_key))
            {
                if (db[vist_key].id_cliente == $id_dono)
                    resultado[vist_key] = Object.create(db[vist_key]);
            }
        }
        
        return resultado;
    };
   
    // deletar vistoria
    $scope.deletarVistoria = function ($id)
    {
        // Verifica se a row local já foi sincronizada alguma vez
        if ($localStorage.itensVistoriados.db[$id].idext)
        {
            // Já foi sincronizada, marca a row externa para ser apagada!
            var deleteSync = {
                        idext: $localStorage.itensVistoriados.db[$id].idext
                    };
            if ($localStorage.itensVistoriados.db[$id].dados && $localStorage.itensVistoriados.db[$id].dados.nome)
                deleteSync.nome = $localStorage.itensVistoriados.db[$id].dados.nome;
            $localStorage.itensVistoriados.remoteDelete.push(deleteSync);
        }
        
        delete $localStorage.itensVistoriados.db[$id]; 
        populaVistorias($scope.id);
    };
    
    $scope.tiposVistorias = {
        'linc': 'Linga de corrente (NR-11/NBR 15516 1 e 2/NBR ISO 3076/NBR ISO 1834)',
        'ectu': 'Eslingas, cintas planas e tubulares. (NR-11 NBR 15637 1 e 2)',
        'aces': 'Acessórios  (Ganchos, Cadeados, olhais, Manilhas) (NR-11/NBR 13545/NBR 16798)',
        'gael': 'Garras de elevação  (NR-11)',
        'lema': 'Levantador magnético  (NR 11)',
        'dies': 'Dispositivos Especiais: (NR 11)',
        'lila': 'Lingas e Laços de cabos de aço'
    };
    
});

// DIRETIVA DO BOTÃO VOLTAR
app.directive('backButton', function(){
    return {
      restrict: 'A',

      link: function(scope, element, attrs) {
        element.bind('click', goBack);

        function goBack() {
          history.back();
          scope.$apply();
        }
      }
    };
});

// DIRETIVA DE CONFIRMAR AÇÃO - não esta pronta
app.directive('ngConfirmClick', [
    function(){
        return {
            link: function (scope, element, attr) {
                var msg = attr.ngConfirmClick || "Você tem certeza?";
                var clickAction = attr.confirmedClick;
                element.bind('click',function (event) {
                    if ( window.confirm(msg) ) {
                        scope.$eval(clickAction);
                    } else {
                        //window.history.back();
                    }
                });
            }
        };
}]);

// FILTRO PARA CONDIÇÕES NA VIEW
app.filter('iif', function () {
   return function(input, trueValue, falseValue) {
        return input ? trueValue : falseValue;
   };
});