
// INICIA O APLICATIVO
var app = angular.module('DoutorSofaAPP', ['ngRoute','ngStorage','ngMaterial','ngMessages', 'material.svgAssetsCache', 'ngCordova']);

// CONFIGURA ROTAS E OUTRAS FUNÇÕES
app.config(function($routeProvider,$mdIconProvider,$mdThemingProvider, $httpProvider) {
    $routeProvider
    .when("/home", {
        templateUrl : "paginas/home.html", 
		controller  : 'homeController'
    })
    .when("/franqueados", {
        templateUrl : "paginas/franqueados.html", 
		controller  : 'franqueadosController'
    })
    .when("/funcionarios", {
        templateUrl : "paginas/funcionarios.html", 
		controller  : 'funcionariosController'
    })
    .when("/sair", {
        templateUrl : "paginas/login.html", 
		controller  : 'loginController'
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
          .primaryPalette('yellow', { 'default': 'A700' })
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
    if (typeof $localStorage.Sessao === 'undefined' || typeof $localStorage.Sessao.db === 'undefined' || $localStorage.Sessao.version !== 'v0.3')
    {
        $localStorage.Sessao = {
            version: 'v0.3',
            db: {},
            logado: false
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
                "nome": 'Franqueados',
                "href": 'franqueados'
            }
            ,{
                "id": 4,
                "icone": 'person_add',
                "nome": 'Funcionários',
                "href": 'funcionarios'
            },{
                "id": 5,
                "icone": 'close',
                "nome": 'Sair',
                "href": 'sair'
            }
            ]
        }; 
    }
    
    $localStorage.LayerCarregando = false;
});

// CONTROLLER PÁGINA DE LOGIN
app.controller('loginController', function($scope, $http, $localStorage, $location, $mdDialog, $mdToast, $rootScope) {
    $rootScope.LayerCarregando = $localStorage.LayerCarregando;
    
    // Se for ação de desogar
    if ( $location.path() == "/sair") {
        $rootScope.LayerCarregando = true;
        $http.post('http://api.doutorsofa.com.br/login/deslogar', { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
        .then(function(response) {
            // sucesso!
            data = response.data;
            if (data.resposta == 1) { 
                $scope.erro = false; 
                $mdToast.show(
                    $mdToast.simple()
                    .textContent(data.mensagem)
                    .position("top buttom")
                    .hideDelay(3000) 
                );    
                $rootScope.LayerCarregando = false;  
                $location.path('/login').replace();
            } else {
                $rootScope.LayerCarregando = false;
            }
        });          
    }
            
    //http://api.doutorsofa.com.br/login/listarUsuarios
    $http.post('http://api.doutorsofa.com.br/login/', { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
    .then(function(response) {
        if (response.data.resposta == 1) {
            //logado
            $rootScope.LayerCarregando = true;
            $rootScope.LayerCarregando = false;
            $location.path('/home').replace();
        } else {
            //deslogado
            // Se for ação de login 
            $scope.user = { email: '' }; 
            $scope.user.submit = function($event , user) {
                $event.preventDefault();
                var data = { username: user.username, password : user.password };
                $rootScope.LayerCarregando = true;
                $http.post('http://api.doutorsofa.com.br/login/', data, { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
                .then(function(response) {
                    // sucesso!     
                    data = response.data;
                    if (data.resposta == 1) {
                        $mdToast.show( 
                            $mdToast.simple() 
                            .textContent(data.mensagem)
                            .position("top buttom")
                            .hideDelay(3000)
                        );        
                        $rootScope.LayerCarregando = false;
                        $location.path('/home').replace();
                    } else {
                        $mdToast.show(
                            $mdToast.simple()
                            .textContent(data.mensagem)
                            .position("top buttom")
                            .hideDelay(3000) 
                        );
                        $rootScope.LayerCarregando = false;   
                    }
                });    
            }                
        }
        $scope.debug = response.data; 
    }); 
    /*if($localStorage.Sessao.logado == false) {
        alert('false');
        $scope.user.submit = function($event , user) { 
            $event.preventDefault();
            var data = { username: user.username, password : user.password };
            $localStorage.Sessao.dados = data;
            $rootScope.LayerCarregando = true;
            $http.post('http://api.doutorsofa.com.br/login/', data, { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
            .then(function(response) {
                // sucesso!     
                data = response.data;
                if (data.resposta == 1) {
                    $mdToast.show( 
                        $mdToast.simple() 
                        .textContent(data.mensagem)
                        .position("top buttom")
                        .hideDelay(3000)
                    );        
                    $rootScope.LayerCarregando = false;
                    $localStorage.Sessao.db = data.sessao;
                    $localStorage.Sessao.logado = true;
                    $location.path('/home').replace();
                } else {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent(data.mensagem)
                        .position("top buttom")
                        .hideDelay(3000) 
                    );
                    $rootScope.LayerCarregando = false;   
                }
            });    
        }
    } 
    else     
    {
        alert('true');
        //var zika = $rootScope.data; 
        //alert(  "login automatico");
        var data = { username: $scope.user.username, password : $scope.user.password };
        $http.post('http://api.doutorsofa.com.br/login/', $rootScope.data, { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
        .then(function(response) { 
            data = response.data;
            if (data.resposta == 1) {
                $localStorage.Sessao.db = data.sessao;
                $localStorage.Sessao.logado = true;
                //$location.path('/home').replace();  
            }
        });  
    }*/
    
    /*
    var data = { username: $scope.user.username, password : $scope.user.password };
    $http.post('http://api.doutorsofa.com.br/login/', data, { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
    .then(function(response) {
        // sucesso!     
        data = response.data;
        console.dir(data);
        if (data.resposta == 1) {
            //$mdToast.show($mdToast.simple().textContent(data.mensagem).position("top buttom").hideDelay(3000));       
            $rootScope.LayerCarregando = false;
            $localStorage.Sessao.db = data.sessao;
            $location.path('/home').replace();
        } else {
            //$mdToast.show($mdToast.simple().textContent(data.mensagem).position("top buttom").hideDelay(3000));   
            $rootScope.LayerCarregando = false;   
        }
    });  
    */
});

// CONTROLLER DA HOME
app.controller('funcionariosController', function($scope, $routeParams, $http, $localStorage, $filter, $mdDialog, $location, $mdToast, $rootScope) {
    
    $rootScope.LayerCarregando = $localStorage.LayerCarregando;
    
    /*if ($localStorage.UsuarioLogado.db.dados.tipoUsuario == 1) { 
        $mdToast.show(
            $mdToast.simple()
            .textContent('Sem permissão necessária!')
            .position("top buttom")
            .hideDelay(3000)
        );        
        $location.path('/home').replace();
    } 
    */
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
    
    // popula a variavel servicos 
    function populaFuncionarios($filtro)
    { 
        $rootScope.LayerCarregando = true;
        $http.post('http://api.doutorsofa.com.br/login/listarUsuarios', { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
        .then(function(response) { 
            // sucesso!    
            data = response.data;
            $scope.funcionarios = data;
        }).finally(function() {
            $rootScope.LayerCarregando = false;   
        });          
    }
    
    // deletar vistoria
    $scope.deletarFuncionario = function (ev, funcionario)
    {        
        var confirm = $mdDialog.confirm()
              .title('Você tem certeza?')
              .textContent('Esta ação é irreversível.')
              .targetEvent(ev)
              .ok('SIM')
              .cancel('CANCELAR');

        $mdDialog.show(confirm).then(function() {
            $rootScope.LayerCarregando = true;
            $http.post('http://api.doutorsofa.com.br/login/deletar', funcionario, { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
            .then(function(response) { 
                // sucesso!   
                data = response.data; 
                if (data.resposta == 1) {
                    populaFuncionarios(0); 
                    $mdDialog.hide();
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Funcionário deletado')
                        .position("top right")
                        .hideDelay(3000)
                    );
                } else {
                    $scope.mensagemErro = data.mensagem;
                    $scope.erro = true;
                }
            }).finally(function() {
                $rootScope.LayerCarregando = false;   
            });  
        }, function() {
        }); 
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
        
        $rootScope.LayerCarregando = true;
        $http.post('http://api.doutorsofa.com.br/franqueado/listar', { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
        .then(function(response) { 
            // sucesso!    
            data = response.data;
            $scope.franquias = data;
        }).finally(function() {
            $rootScope.LayerCarregando = false;   
        });          
        
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
                                     
                /*
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
                );    */        
            } else {
                id = $localStorage.Funcionarios.nextID;

                $rootScope.LayerCarregando = true;
                $http.post('http://api.doutorsofa.com.br/login/registrar', $scope.item, { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
                .then(function(response) {
                    // sucesso!    
                    data = response.data;
                    if (data.resposta == 1) {
                        $mdDialog.hide();
                        $mdToast.show(
                            $mdToast.simple()
                            .textContent('Funcionário adicionado')
                            .position("top right")
                            .hideDelay(3000)
                        );
                    } else {
                        $scope.mensagemErro = data.mensagem;
                        $scope.erro = true;
                    }
                }).finally(function() {
                    $rootScope.LayerCarregando = false;   
                });         
            }
            populaFuncionarios(0); 
        };
        
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
    }
        
    
});

// CONTROLLER DA HOME
app.controller('franqueadosController', function($scope, $routeParams, $http, $localStorage, $filter, $mdDialog, $location, $mdToast, $rootScope) {
     
    $rootScope.LayerCarregando = $localStorage.LayerCarregando;
    
    /*if ($localStorage.UsuarioLogado.db.dados.tipoUsuario != 3) { 
        $mdToast.show(
            $mdToast.simple()
            .textContent('Sem permissão necessária!')
            .position("top buttom")
            .hideDelay(3000)
        );        
        $location.path('/home').replace();
    }*/
    
    $scope.isOpen = false;
    $scope.selectedMode = 'md-scale';
    $scope.selectedDirection = 'left'; 
    
    $scope.abrirPagina = function ( path ) {
      $location.path( path );
    };
     
    $scope.angularEquals = angular.equals;
    
    $scope.itensMenu = $localStorage.itensMenu.itens;
    
    // inicia
    populaFranqueados();
    
    // popula a variavel servicos 
    function populaFranqueados($filtro)
    { 
        /*var db = $localStorage.Franqueados.db;
        $scope.franqueados = {}; 
        
        if ($filtro) {
            for (var vist_key in db)
            {
                if (db.hasOwnProperty(vist_key))
                {
                    if (db[vist_key].status == $filtro)
                        $scope.franqueados[vist_key] = Object.create(db[vist_key]);
                }
            }
        } else {
            $scope.franqueados = $localStorage.Franqueados.db;
        }*/
        $rootScope.LayerCarregando = true;
        $http.post('http://api.doutorsofa.com.br/franqueado/listar', { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
        .then(function(response) { 
            // sucesso!    
            data = response.data;
            $scope.franqueados = data;
        }).finally(function() {
            $rootScope.LayerCarregando = false;   
        });       
    } 
    
    // deletar vistoria
    $scope.deletarFranqueado = function (ev, franqueado)
    {        
        var confirm = $mdDialog.confirm()
              .title('Você tem certeza?')
              .textContent('Esta ação é irreversível.')
              .targetEvent(ev)
              .ok('SIM')
              .cancel('CANCELAR');

        $mdDialog.show(confirm).then(function() {
            $rootScope.LayerCarregando = true;
            $http.post('http://api.doutorsofa.com.br/franqueado/deletar', franqueado, { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
            .then(function(response) { 
                // sucesso!
                data = response.data;
                if (data.resposta == 1) {
                    populaFranqueados(0); 
                    $mdDialog.hide();
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Funcionário deletado')
                        .position("top right")
                        .hideDelay(3000)
                    );
                } else {
                    $scope.mensagemErro = data.mensagem;
                    $scope.erro = true;
                }
            }).finally(function() {
                $rootScope.LayerCarregando = false;   
            });
        }, function() {
        }); 
    };
    
    // CONTROLA A TELA DOS FORMULÁRIOS
    $scope.showAdvanced = function(ev,id_click) {
        $mdDialog
            .show({
            controller: DialogController,
            templateUrl: 'formulario-franqueado.tmpl.html',
            id_dono: $scope.id_dono,
            id_click: id_click,
            locals: {
                tiposVistorias: $scope.tiposVistorias
            },
            bindToController: true,
            onRemoving: function() { populaFranqueados(0); },
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

                $rootScope.LayerCarregando = true;
                $http.post('http://api.doutorsofa.com.br/franqueado/registrar', $scope.item, { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
                .then(function(response) {
                    // sucesso!    
                    data = response.data;
                    if (data.resposta == 1) {
                        $mdDialog.hide();
                        $mdToast.show(
                            $mdToast.simple()
                            .textContent('Franqueado adicionado')
                            .position("top right")
                            .hideDelay(3000)
                        );
                    } else {
                        $scope.mensagemErro = data.mensagem;
                        $scope.erro = true;
                    }
                }).finally(function() {
                    $rootScope.LayerCarregando = false;   
                });         
            }
            populaFranqueados(0); 
        };
        
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
    }
         
    
});

// CONTROLLER DA HOME
app.controller('homeController', function($scope, $routeParams, $http, $localStorage, $filter, $mdDialog, $location, $mdToast, $rootScope) {
    
    $rootScope.LayerCarregando = $localStorage.LayerCarregando;
    
    $scope.UsuarioLogado = $localStorage.UsuarioLogado.db;
    
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
        $rootScope.LayerCarregando = true;
        $http.post('http://api.doutorsofa.com.br/servico/listar', { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
        .then(function(response) { 
            // sucesso!    
            data = response.data;
            $scope.servicos = data;
        }).finally(function() {
            $rootScope.LayerCarregando = false;   
        });
    }
    
  $scope.showConfirm = function(ev) {
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
          .title('Would you like to delete your debt?')
          .textContent('All of the banks have agreed to forgive you your debts.')
          .ariaLabel('Lucky day')
          .targetEvent(ev)
          .ok('Please do it!')
          .cancel('Sounds like a scam');

    $mdDialog.show(confirm).then(function() {
      $scope.status = 'You decided to get rid of your debt.';
    }, function() {
      $scope.status = 'You decided to keep your debt.';
    });
  };
    
    // deletar vistoria
    $scope.deletarServico = function (ev, servico)
    {
        var confirm = $mdDialog.confirm()
              .title('Você tem certeza?')
              .textContent('Esta ação é irreversível.')
              .targetEvent(ev)
              .ok('SIM')
              .cancel('CANCELAR');

        $mdDialog.show(confirm).then(function() {
            $rootScope.LayerCarregando = true;
            $http.post('http://api.doutorsofa.com.br/servico/deletar', servico, { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
            .then(function(response) { 
                // sucesso!  
                data = response.data;  
                if (data.resposta == 1) {
                    populaServicos(0);
                    $mdDialog.hide();
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Funcionário deletado')
                        .position("top right")
                        .hideDelay(3000)    
                    );
                } else {
                    $scope.mensagemErro = data.mensagem;
                    $scope.erro = true;
                }
            }).finally(function() {
                $rootScope.LayerCarregando = false;   
            });
        }, function() {
        });        

    };
    
    // CONTROLA A TELA DOS FORMULÁRIOS
    $scope.showAdvanced = function(ev,id_click) {
        $mdDialog
            .show({
            controller: DialogController,
            templateUrl: 'formulario-servico.tmpl.html',
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
    function DialogController($scope, $mdDialog, tiposVistorias, id_click, $cordovaCamera, $mdToast) {
        $scope.myPictures = []; 
        
        // Verifica se o usuário quer editar o item.
        if (id_click > -1)
        { 
            $scope.item = {};
            $rootScope.LayerCarregando = true;
            $http.post('http://api.doutorsofa.com.br/servico/detalha', id_click, { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
            .then(function(response) { 
                // sucesso!    
                data = response.data;
                $scope.item = data[0];
                
                $scope.item.data = new Date($scope.item.data);
                
                console.dir($scope.item);
            }).finally(function() {
                $rootScope.LayerCarregando = false;   
            });             
            //$scope.myPictures = $localStorage.Servicos.db[id_click].fotos64;
            
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
                $rootScope.LayerCarregando = true;
                $http.post('http://api.doutorsofa.com.br/servico/editar', $scope.item, { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
                .then(function(response) { 
                    // sucesso!    
                    data = response.data;
                    if (data.resposta == 1) {
                        $mdDialog.hide();
                        populaServicos();
                        $mdToast.show(
                            $mdToast.simple()
                            .textContent('Serviço editado!')
                            .position("top right")
                            .hideDelay(3000)
                        );
                        $location.path('/home').replace();
                    } else {
                        $scope.mensagemErro = data.mensagem;
                        $scope.erro = true;
                    }
                }).finally(function() {
                    $rootScope.LayerCarregando = false;   
                });
                
            } else { 
                id = $localStorage.Servicos.nextID;

                $scope.item.fotos = $scope.myPictures;
                
                $rootScope.LayerCarregando = true;
                $http.post('http://api.doutorsofa.com.br/servico/registrar', $scope.item, { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
                .then(function(response) {
                    // sucesso!    
                    data = response.data;
                    if (data.resposta == 1) {
                        $mdDialog.hide();
                        populaServicos();
                        $mdToast.show(
                            $mdToast.simple()
                            .textContent('Serviço adicionado')
                            .position("top right")
                            .hideDelay(3000)
                        );
                    } else {
                        $scope.mensagemErro = data.mensagem;
                        $scope.erro = true;
                    }
                }).finally(function() {
                    $rootScope.LayerCarregando = false;   
                });                  
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
