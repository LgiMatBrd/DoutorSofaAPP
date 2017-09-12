// INICIA O APLICATIVO
var app = angular.module('DoutorSofaAPP', ['ngRoute','ngStorage','ngMaterial','ngMessages', 'material.svgAssetsCache', 'ngCordova']);

// CONFIGURA ROTAS E OUTRAS FUNÇÕES
app.config(function($routeProvider,$mdIconProvider,$mdThemingProvider) {
    $routeProvider
    .when("/home", {
        templateUrl : "paginas/home.html", 
		controller  : 'homeController'
    })
    .when("/franquados", {
        templateUrl : "paginas/franquados.html", 
		controller  : 'franquadosController'
    })
    .when("/funcionarios", {
        templateUrl : "paginas/funcionarios.html", 
		controller  : 'funcionariosController'
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
    
    $mdThemingProvider.theme('default')
          .primaryPalette('yellow')
          .accentPalette('grey');
});

// INICIA BANCO DE DADOS LOCAL 
app.run(function($localStorage) {
    if (typeof $localStorage.UsuarioLogado === 'undefined' || typeof $localStorage.UsuarioLogado.db === 'undefined' || $localStorage.UsuarioLogado.version !== 'v0.1')
    {
        $localStorage.UsuarioLogado = {
            nextID: 0,
            version: 'v0.1',
            id: 0,
            db: {}
        }; 
    }
    if (typeof $localStorage.Servicos === 'undefined' || typeof $localStorage.Servicos.db === 'undefined' || $localStorage.Servicos.version !== 'v0.1')
    {
        $localStorage.Servicos = {
            nextID: 0,
            version: 'v0.1',
            sendTimestamp: 0,
            recvTimestamp: 0,
            remoteDelete: [],
            db: {}
        }; 
    }    
    if (typeof $localStorage.Franqueados === 'undefined' || typeof $localStorage.Franqueados.db === 'undefined' || $localStorage.Franqueados.version !== 'v0.1')
    { 
        $localStorage.Franqueados = {
            nextID: 0,
            version: 'v0.1',
            sendTimestamp: 0,
            recvTimestamp: 0, 
            remoteDelete: [],
            db: {}
        }; 
    }
    if (typeof $localStorage.Funcionarios === 'undefined' || typeof $localStorage.Funcionarios.db === 'undefined' || $localStorage.Funcionarios.version !== 'v0.2')
    { 
        $localStorage.Funcionarios = {
            nextID: 0,
            version: 'v0.2',
            sendTimestamp: 0,
            recvTimestamp: 0,
            remoteDelete: [],
            db: {}
        }; 
    }
    if (typeof $localStorage.itensMenu === 'undefined' || $localStorage.itensMenu.version !== 'v0.1')
    { 
        $localStorage.itensMenu = {
            nextID: 0,
            version: 'v0.2',
            sendTimestamp: 0,
            recvTimestamp: 0,
            remoteDelete: [],
            itens: [
            {
                "id": 1,
                "icone": 'home',
                "nome": 'Home',
                "href": 'home'
            },
            {
                "id": 2,
                "icone": 'multiline_chart',
                "nome": 'Dashboard'
            }
            ,{
                "id": 3,
                "icone": 'business',
                "nome": 'Franquiados',
                "href": 'franquados'
            }
            ,{
                "id": 4,
                "icone": 'person_add',
                "nome": 'Funcionários',
                "href": 'funcionarios'
            }
            ]
        }; 
    }
});

// CONTROLLER PÁGINA DE LOGIN
app.controller('loginController', function($scope, $http, $localStorage, $location, $mdDialog, $mdToast) {
    $scope.user = {
        email: '',
    };

    $scope.user.submit = function(user) {
        
        if (user.username == 'luigi@hotmail.com' && user.password == 'Afokf!2394349' || user.username == 'luigimatheus@hotmail.com' && user.password == 'Afornalli!1997') {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Admin master!')
                    .position("top buttom")
                    .hideDelay(3000)
                );                   
                $location.path('/home').replace(); 
             } else {
             angular.forEach($localStorage.Funcionarios.db, function(value, key){
             if(value.dados.email == user.username && value.dados.senha == user.password) {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Autenticado com sucesso!')
                    .position("top buttom")
                    .hideDelay(3000)
                );               
                 $localStorage.UsuarioLogado.db = value;   
                 $location.path('/home').replace();
             } else if (user.username == 'luigi@hotmail.com' && user.password == 'Afokf!2394349' || user.username == 'luigimatheus@hotmail.com' && user.password == 'Afornalli!1997') {
                 console.dir(value);
                $localStorage.UsuarioLogado.db = value;   
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Admin master!')
                    .position("top buttom")
                    .hideDelay(3000)
                );                   
                $location.path('/home').replace(); 
             } else {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Erro ao se autenticar!')
                    .position("top buttom")
                    .hideDelay(3000)
                );             
             }

             });
             }
        
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

// CONTROLLER DA HOME
app.controller('funcionariosController', function($scope, $routeParams, $http, $localStorage, $filter, $mdDialog, $location, $mdToast) {
    
    $scope.isOpen = false;
    $scope.selectedMode = 'md-scale';
    $scope.selectedDirection = 'left'; 
    
    $scope.abrirPagina = function ( path ) {
      $location.path( path );
    };
     
    $scope.angularEquals = angular.equals;
    
    $scope.itensMenu = $localStorage.itensMenu.itens;
    
    // inicia
    populaFuncionarios();
    //console.dir($scope.funcionarios);
    
    // popula a variavel servicos 
    function populaFuncionarios($filtro)
    { 
        var db = $localStorage.Funcionarios.db;
        $scope.funcionarios = {}; 
        
        if ($filtro) {
            for (var vist_key in db)
            {
                if (db.hasOwnProperty(vist_key))
                {
                    if (db[vist_key].status == $filtro)
                        $scope.funcionarios[vist_key] = Object.create(db[vist_key]);
                }
            }
        } else {
            $scope.funcionarios = $localStorage.Funcionarios.db;
        }
    }
    
    // deletar vistoria
    $scope.deletarFuncionario = function ($id)
    {
        delete $localStorage.Funcionarios.db[$id]; 
        populaServicos(0); 
        $mdToast.show(
            $mdToast.simple()
            .textContent('Funcionario deletado')
            .position("top buttom")
            .hideDelay(3000)
        );
    };
    
    // CONTROLA A TELA DOS FORMULÁRIOS
    $scope.showAdvanced = function(ev,id_click) {
        $mdDialog
            .show({
            controller: DialogController,
            templateUrl: 'formulario-funcionarios.tmpl.html',
            id_dono: $scope.id_dono,
            id_click: id_click,
            locals: {
                tiposVistorias: $scope.tiposVistorias
            },
            bindToController: true,
            onRemoving: function() { populaFuncionarios(0); },
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: $scope.customFullscreen
            });
    };

    // CONTROLLER TELA DOS FORMULÁRIOS
    function DialogController($scope, $mdDialog, id_dono, tiposVistorias, id_click, $cordovaCamera, $mdToast) {
        $scope.myPictures = []; 
        $scope.franquias = $localStorage.Franqueados.db;
        
        // Verifica se o usuário quer editar o item.
        if (id_click > -1)
        {
            $scope.item = {};
            $scope.item = $localStorage.Funcionarios.db[id_click].dados;
            $scope.myPictures = $localStorage.Funcionarios.db[id_click].fotos64;
            
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
        
        $scope.addItem = function(itemForm) {
            
            // Verifica se os Form é de edição ou de adição de novo Item
            if (id_click > -1) {
                // Edita o item
                id = id_click;
                $localStorage.Funcionarios.db[id].dados = $scope.item;
                $localStorage.Funcionarios.db[id].fotos64 = $scope.myPictures;
                $localStorage.Funcionarios.db[id].modificado = timestampUTC();
                
                $mdDialog.hide();
                
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Serviço editado')
                    .position("top right")
                    .hideDelay(3000)
                );            
            } else {
                id = $localStorage.Funcionarios.nextID;

                /* OBJETO
                this.id = 0;
                this.id_dono = '';
                this.data_criacao = '';
                this.dados = '';
                */
                item = new Funcionario(); 
                item.id = id;
                item.id_vistoria = id_dono;
                item.data_criacao = timestampUTC();
                item.modificado = item.data_criacao;
                item.status = 0;
                item.dados = $scope.item;

                $localStorage.Funcionarios.db[id] = item;

                id = id + 1; 
                $localStorage.Funcionarios.nextID = id;
                
                $mdDialog.hide();
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Franquado adicionado')
                    .position("top right")
                    .hideDelay(3000)
                );                
            }
            populaFuncionarios(0); 
        };
        
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
    }
        
    
});

// CONTROLLER DA HOME
app.controller('franquadosController', function($scope, $routeParams, $http, $localStorage, $filter, $mdDialog, $location, $mdToast) {
    
    $scope.isOpen = false;
    $scope.selectedMode = 'md-scale';
    $scope.selectedDirection = 'left'; 
    
    $scope.abrirPagina = function ( path ) {
      $location.path( path );
    };
     
    $scope.angularEquals = angular.equals;
    
    $scope.itensMenu = $localStorage.itensMenu.itens;
    
    // inicia
    populaFranquados();
    
    // popula a variavel servicos 
    function populaFranquados($filtro)
    { 
        var db = $localStorage.Franqueados.db;
        $scope.franquados = {}; 
        
        if ($filtro) {
            for (var vist_key in db)
            {
                if (db.hasOwnProperty(vist_key))
                {
                    if (db[vist_key].status == $filtro)
                        $scope.franquados[vist_key] = Object.create(db[vist_key]);
                }
            }
        } else {
            $scope.franquados = $localStorage.Franqueados.db;
        }
    }
    
    console.dir($scope.franquados);    
    
    // deletar vistoria
    $scope.deletarFranquado = function ($id)
    {
        delete $localStorage.Franqueados.db[$id]; 
        populaServicos(0); 
        $mdToast.show(
            $mdToast.simple()
            .textContent('Franqueado deletado')
            .position("top buttom")
            .hideDelay(3000)
        );
    };
    
    // CONTROLA A TELA DOS FORMULÁRIOS
    $scope.showAdvanced = function(ev,id_click) {
        $mdDialog
            .show({
            controller: DialogController,
            templateUrl: 'formulario-franquado.tmpl.html',
            id_dono: $scope.id_dono,
            id_click: id_click,
            locals: {
                tiposVistorias: $scope.tiposVistorias
            },
            bindToController: true,
            onRemoving: function() { populaFranquados(0); },
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: $scope.customFullscreen
            });
    };

    // CONTROLLER TELA DOS FORMULÁRIOS
    function DialogController($scope, $mdDialog, id_dono, tiposVistorias, id_click, $cordovaCamera, $mdToast) {
        $scope.myPictures = []; 
        
        // Verifica se o usuário quer editar o item.
        if (id_click > -1)
        {
            $scope.item = {};
            $scope.item = $localStorage.Franqueados.db[id_click].dados;
            $scope.myPictures = $localStorage.Franqueados.db[id_click].fotos64;
            
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
        
        $scope.addItem = function(itemForm) {
            
            // Verifica se os Form é de edição ou de adição de novo Item
            if (id_click > -1) {
                // Edita o item
                id = id_click;
                $localStorage.Franqueados.db[id].dados = $scope.item;
                $localStorage.Franqueados.db[id].fotos64 = $scope.myPictures;
                $localStorage.Franqueados.db[id].modificado = timestampUTC();
                
                $mdDialog.hide();
                
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Serviço editado')
                    .position("top right")
                    .hideDelay(3000)
                );            
            } else {
                id = $localStorage.Franqueados.nextID;

                /* OBJETO
                this.id = 0;
                this.id_dono = '';
                this.data_criacao = '';
                this.dados = '';
                */
                item = new Franqueado(); 
                item.id = id;
                item.id_vistoria = id_dono;
                item.data_criacao = timestampUTC();
                item.modificado = item.data_criacao;
                item.status = 0;
                item.dados = $scope.item;

                $localStorage.Franqueados.db[id] = item;

                id = id + 1; 
                $localStorage.Franqueados.nextID = id;
                
                $mdDialog.hide();
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Franquado adicionado')
                    .position("top right")
                    .hideDelay(3000)
                );                
            }
            populaFranquados(0); 
        };
        
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
    }
        
    
});

// CONTROLLER DA HOME
app.controller('homeController', function($scope, $routeParams, $http, $localStorage, $filter, $mdDialog, $location, $mdToast) {
    
    console.dir($localStorage.UsuarioLogado.db); 
    $scope.isOpen = false;
    $scope.selectedMode = 'md-scale';
    $scope.selectedDirection = 'left'; 
    
    $scope.abrirPagina = function ( path ) {
      $location.path( path );
    };
     
    $scope.angularEquals = angular.equals;
    
    $scope.itensMenu = $localStorage.itensMenu.itens;
    
    // inicia
    populaServicos();
    
    // recebe os filtros
    $scope.filtrarResultados = function(filtro) {
        if (filtro == 'cancelados') {
            populaServicos(1);      
            $scope.filtroCancelados = true;
            $scope.filtroTodos = false;
            $scope.filtroRealizados = false;
            
        } else if(filtro == 'realizados') {
            populaServicos(2);   
            $scope.filtroRealizados = true;
            $scope.filtroTodos = false;
            $scope.filtroCancelados = false;
        } else { // todos
            populaServicos();
            $scope.filtroTodos = true;
            $scope.filtroRealizados = false;
            $scope.filtroCancelados = false;
        }
    };
    
    // popula a variavel servicos 
    function populaServicos($filtro)
    { 
        var db = $localStorage.Servicos.db;
        $scope.servicos = {}; 
        
        if ($filtro) {
            for (var vist_key in db)
            {
                if (db.hasOwnProperty(vist_key))
                {
                    if (db[vist_key].status == $filtro)
                        $scope.servicos[vist_key] = Object.create(db[vist_key]);
                }
            }
        } else {
            $scope.servicos = $localStorage.Servicos.db;
        }
    }
    
    // deletar vistoria
    $scope.deletarServico = function ($id)
    {
        delete $localStorage.Servicos.db[$id]; 
        populaServicos(0); 
        $mdToast.show(
            $mdToast.simple()
            .textContent('Serviço deletado')
            .position("top buttom")
            .hideDelay(3000)
        );
    };
    
    // CONTROLA A TELA DOS FORMULÁRIOS
    $scope.showAdvanced = function(ev,id_click) {
        $mdDialog
            .show({
            controller: DialogController,
            templateUrl: 'formulario-servico.tmpl.html',
            id_dono: $scope.id_dono,
            id_click: id_click,
            locals: {
                tiposVistorias: $scope.tiposVistorias
            },
            bindToController: true,
            onRemoving: function() { populaServicos(0); },
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: $scope.customFullscreen
            });
    };

    // CONTROLLER TELA DOS FORMULÁRIOS
    function DialogController($scope, $mdDialog, id_dono, tiposVistorias, id_click, $cordovaCamera, $mdToast) {
        $scope.myPictures = []; 
        
        // Verifica se o usuário quer editar o item.
        if (id_click > -1)
        {
            $scope.item = {};
            $scope.item = $localStorage.Servicos.db[id_click].dados;
            $scope.myPictures = $localStorage.Servicos.db[id_click].fotos64;
            
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

        $scope.addItem = function(itemForm) {
            
            // Verifica se os Form é de edição ou de adição de novo Item
            if (id_click > -1) {
                // Edita o item
                id = id_click;
                $localStorage.Servicos.db[id].dados = $scope.item;
                $localStorage.Servicos.db[id].fotos64 = $scope.myPictures;
                $localStorage.Servicos.db[id].modificado = timestampUTC();
                
                $mdDialog.hide();
                
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Serviço editado')
                    .position("top right")
                    .hideDelay(3000)
                );            
            } else {
                id = $localStorage.Servicos.nextID;

                /* OBJETO
                this.id = 0;
                this.id_dono = '';
                this.data_criacao = '';
                this.dados = '';
                */
                item = new Servicos(); 
                item.id = id;
                item.id_vistoria = id_dono;
                item.data_criacao = timestampUTC();
                item.modificado = item.data_criacao;
                item.status = 0;
                
                item.fotos64 = $scope.myPictures;
                item.dados = $scope.item;

                $localStorage.Servicos.db[id] = item;

                id = id + 1; 
                $localStorage.Servicos.nextID = id;
                
                $mdDialog.hide();
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Serviço adicionado')
                    .position("top right")
                    .hideDelay(3000)
                );                
            }
            populaServicos(0); 
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
