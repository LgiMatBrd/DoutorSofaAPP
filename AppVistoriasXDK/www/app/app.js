// INICIA O APLICATIVO
var app = angular.module('DoutorSofaAPP', ['ngRoute','ngStorage','ngMaterial','ngMessages', 'material.svgAssetsCache', 'ngCordova']);

// CONFIGURA ROTAS E OUTRAS FUNÇÕES
app.config(function($routeProvider,$mdIconProvider) {
    $routeProvider
    .when("/home", {
        templateUrl : "paginas/home.html", 
		controller  : 'homeController'
    })
    .when("/teste", {
        templateUrl : "paginas/teste.html", 
		controller  : 'testeController'
    })
    .when("/cancelados", {
        templateUrl : "paginas/cancelados.html", 
		controller  : 'canceladosController'
    })
    .when("/realizados", {
        templateUrl : "paginas/realizados.html", 
		controller  : 'realizadosController'
    })
    .when("/", {
        templateUrl : "paginas/login.html",
		controller  : 'loginController'
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

// CONTROLLER PÁGINA DE LOGIN
app.controller('loginController', function($scope, $http, $localStorage, $location, $mdDialog) {
    $scope.user = {
        email: '',
    };
    
    $scope.user.submit = function(user) {
        $location.path('/home').replace();        
    }
    
    /*$scope.user.submit = function(user)
    {
        var p = hex_sha512(user.password);
        $http({
            method: 'POST',
            url: 'http://app.seyconel.com.br/apps/makelogin.php',
            data: {
                makelogin: 'true',
                username: user.username,
                password: '',
                p: p
            }
        })
        .then(function successCallback(response)
        {
            console.log(response);
            if (response.data.status == "ok")
            {
                if (response.data.logged === 'in')
                    $location.path('/sincronizar').replace();
                else
                    $scope.msg = response.data.msg;
            }
            else if (response.data.status == "error")
            {
                $scope.msg = "Não foi possível logar! "+response.data.msg;
            }
            
        }, function errorCallback(response){
            $scope.msg = "Ocorreu um problema ao efetuar login: "+response.statusText;
        });
    }*/
});

// CONTROLLER DOS SERVIÇOS REALIZADOS
app.controller('realizadosController', function($scope, $routeParams, $http, $localStorage, $filter, $mdDialog, $location) {
    $scope.go = function ( path ) {
      $location.path( path );
    };
    
    $scope.titulo = 'Realizados';
    $scope.isOpen = false;
    $scope.selectedMode = 'md-scale';
    $scope.selectedDirection = 'up';
    
	$scope.servicos = {
        foo: 'a', 
        fob: 'c',
        fof: 'd',
        for: 'e',
        bar: 'b'
    };
    
    $scope.tiposServicos = {
        'linc': 'Limpeza completa 1',
        'ectu': 'Limpeza completa 2',
        'aces': 'Limpeza completa 3',
        'gael': 'Limpeza completa 4',
        'lema': 'Limpeza completa 5',
        'dies': 'Limpeza completa 6',
        'lila': 'Limpeza completa 7',
    };
    
    // CONTROLA A TELA DOS FORMULÁRIOS
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

    // CONTROLLER TELA DOS FORMULÁRIOS
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

});

// CONTROLLER DOS SERVIÇOS CANCELADOS
app.controller('canceladosController', function($scope, $routeParams, $http, $localStorage, $filter, $mdDialog, $location) {
    $scope.go = function ( path ) {
      $location.path( path );
    };
    
    $scope.titulo = 'Cancelados';
    $scope.isOpen = false;
    $scope.selectedMode = 'md-scale';
    $scope.selectedDirection = 'up';
    
	$scope.servicos = {
        foo: 'a', 
        fob: 'c',
        fof: 'd',
        for: 'e',
        bar: 'b'
    };
    
    $scope.tiposServicos = {
        'linc': 'Limpeza completa 1',
        'ectu': 'Limpeza completa 2',
        'aces': 'Limpeza completa 3',
        'gael': 'Limpeza completa 4',
        'lema': 'Limpeza completa 5',
        'dies': 'Limpeza completa 6',
        'lila': 'Limpeza completa 7',
    };
    
    // CONTROLA A TELA DOS FORMULÁRIOS
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

    // CONTROLLER TELA DOS FORMULÁRIOS
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

});

app.controller('homeController', function($scope, $routeParams, $http, $localStorage, $filter, $mdDialog, $location) {
    $scope.go = function ( path ) {
      $location.path( path );
    };
    
    $scope.isOpen = false;
    $scope.selectedMode = 'md-scale';
    $scope.selectedDirection = 'up';
    
	$scope.servicos = {
        foo: 'a', 
        fob: 'c',
        fof: 'd',
        for: 'e',
        bar: 'b'
    };
    
    $scope.tiposServicos = {
        'linc': 'Limpeza completa 1',
        'ectu': 'Limpeza completa 2',
        'aces': 'Limpeza completa 3',
        'gael': 'Limpeza completa 4',
        'lema': 'Limpeza completa 5',
        'dies': 'Limpeza completa 6',
        'lila': 'Limpeza completa 7',
    };
    
    // CONTROLA A TELA DOS FORMULÁRIOS
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

    // CONTROLLER TELA DOS FORMULÁRIOS
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