
// INICIA O APLICATIVO
var app = angular.module('DoutorSofaAPP', ['ngRoute','ngStorage','ngMaterial','ngMessages', 'material.svgAssetsCache', 'ngCordova', 'chart.js']);

// CONFIGURA ROTAS E OUTRAS FUNÇÕES
app.config(function($routeProvider,$mdIconProvider,$mdThemingProvider, $httpProvider) {
    $routeProvider
    .when("/home", {
        templateUrl : "paginas/home.html", 
		controller  : 'homeController'
    })
    .when("/dashboard", {
        templateUrl : "paginas/dashboard.html", 
		controller  : 'dashboardController'
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
                "nome": 'Dashboard',
                "href": 'dashboard'
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
app.controller('dashboardController', function($scope, $routeParams, $http, $localStorage, $filter, $mdDialog, $location, $mdToast, $rootScope) {
    
    $rootScope.LayerCarregando = $localStorage.LayerCarregando;
    
    $scope.abrirPagina = function ( path ) {
      $location.path( path );
    };
     
    $scope.angularEquals = angular.equals;
    
    $scope.itensMenu = $localStorage.itensMenu.itens;
    
    // inicia
    $scope.hideCompare = true;
    $scope.theme = 'yellow';
    $scope.dataSets = {};
    $scope.type = 'bar';
    $scope.dIndex = 0;

    //$scope.themes = ["red", 'black', 'yellow'];

  // Dataset select from md-tabs:
  $scope.dataSet = function(ds) {
    $scope.theme = $scope.themes[ds];
    $scope.dIndex = ds;
  };

  $scope.compareStuff = function() {
    $scope.hideCompare = !$scope.hideCompare;
  }
  
  $scope.updateCompare = function() {
      $scope.dataSets[3] = [
          [avgArray($scope.dataSets[0][0]), avgArray($scope.dataSets[1][0]), avgArray($scope.dataSets[2][0])]
      ];
  }

  $scope.printChart = function() {
    $mdToast.show(
      $mdToast.simple()
      .textContent('Gerando gráficos: bip bip brrt brrt brrt! ')
      .hideDelay(3000)
      .parent(document.getElementById("toaster"))
      .position('top right')
      .action('x')
    );
  };

    $scope.toggle = function() {
        $scope.type = $scope.type === 'bar' ? 'line' : 'bar';
    };
    
    $scope.labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    $scope.nomesFakes = ["Joinville", "Curitiba", "Curitiba", "Curitiba", "Curitiba", "Curitiba", "Curitiba", "Curitiba", "Curitiba"];
    $scope.graficos = [];
    for($scope.i=0; $scope.i<3; $scope.i++) {
/*        $scope.graficos.push({
            titulo: $scope.nomesFakes[$scope.i],
            dados: [200, 167, 18, 120, 100, 130, 130, 120, 140, 60, 200, 260],
            configs: {
                "title": {
                    display: true,
                    text: 'Serviços concluídos',
                    fontColor: 'rgb(75, 75, 75)',
                    fontSize: 16
                },
                "scales": {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            },
            dataset: {
                label: "Concluídos",
                fill: true,
                lineTension: 0.2,
                borderColor: "rgba(0,100,192,1)",
                backgroundColor: "rgba(0, 100, 192, 0.6)"                
            },
            "series": "Gráfico "+$scope.nomesFakes[$scope.i]
        });*/
        
    }
     
    $rootScope.LayerCarregando = true;
    $http.post('http://api.doutorsofa.com.br/servico/dashboard', $scope.item, { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
    .then(function(response) {
        // sucesso!    
        $scope.nomesFakes = response.data[0].labels;
        
        $scope.i = 0;
        console.dir(response.data[0].franquias);
        angular.forEach(response.data[0].franquias, function(value, key) {
            $scope.graficos.push({
                titulo: $scope.nomesFakes[$scope.i],
                labels: value.dia,
                dados: value.total,
                configs: {
                    "title": {
                        display: true,
                        text: 'Serviços concluídos',
                        fontColor: 'rgb(75, 75, 75)',
                        fontSize: 16
                    },
                    "scales": {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                },
                dataset: {
                    label: "R$",
                    fill: true,
                    lineTension: 0.2,
                    borderColor: "rgba(0,100,192,1)",
                    backgroundColor: "rgba(0, 100, 192, 0.6)"                
                },
                "series": "Gráfico "+$scope.nomesFakes[$scope.i]
            });     
            $scope.i++;
        });
        
        
        console.dir($scope.labels);
    }).finally(function() {
        $rootScope.LayerCarregando = false;   
    });
    
    /*
    $scope.graficos = {
        "0": {
            dados: [200, 167, 18, 120, 100, 130, 130, 120, 140, 60, 200, 260],
            configs: {
                "title": {
                    display: true,
                    text: 'Amount of red stuff in the warehouse',
                    fontColor: 'rgba(255,0,0,0.8)',
                    fontSize: 16
                },
                "scales": {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            },
            "series": "Series A"            
        }
    }*/


    
  $scope.seriesC = ['Blue Stuff', 'Red Stuff', 'Pink Stuff'];
    
  $scope.labelsC = ["Red", "Blue", "Pink2"];
    
      function avgArray(arr) {
    var sum = arr.reduce(function(a, b) {
      return a + b;
    });
    var avg = sum / arr.length;
    return avg.toFixed();
  }

    $scope.dataSets[0] = [
    [130, 130, 120, 140, 60, 200, 260, 200, 167, 18, 120, 100]
  ];
    $scope.dataSets[1] = [
    [130, 130, 120, 140, 60, 200, 260, 200, 167, 18, 120, 100]
  ];
  $scope.dataSets[3] = [
    [avgArray($scope.dataSets[0][0]), avgArray($scope.dataSets[1][0])]
  ];


    
  $scope.datasetOverrideC = [{
    backgroundColor: [
      "rgba(255,0,0,0.6)",
      "rgba(0,100,192,0.4)",
      "rgba(255,105,180,0.3)"
    ],
    borderColor: [
      "rgba(255,0,0,1)",
      "rgba(0,100,192,1)",
      "rgba(255,105,180,0.4)"
    ]

  }];

  $scope.optionsC = {
    rotation: 0.5 * Math.PI,
    title: {
      display: true,
      text: 'Comparação de franquias',
      fontColor: 'rgb(33, 33, 33)',
      fontSize: 16
    },
    legend: {
      display: true
    }
  }    
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
    $scope.date = new Date();
    $scope.UsuarioLogado = $localStorage.UsuarioLogado.db;
    
    $scope.isOpen = false;
    $scope.selectedMode = 'md-scale';
    $scope.selectedDirection = 'left'; 
    
    $scope.verificaServicoAtrasado = function(data) {
        if (new Date(data) < $scope.date) {
            return true;
        }
        return false;
    };
    
    $scope.abrirPagina = function ( path ) {
      $location.path( path );
    };
     
    $scope.angularEquals = angular.equals;
    $scope.itensMenu = $localStorage.itensMenu.itens;
    
    // inicia
    populaServicos();
    $scope.filtroTempoReal = 1;
    
    $scope.modificaFiltro = function(filtro) {
        $scope.filtroTempoReal = filtro;
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
    
    // edita status servico
    $scope.mudaStatus = function (ev, servico)
    {
        var confirm = $mdDialog.confirm()
              .title('Você tem certeza?')
              .textContent('Esta ação é irreversível.')
              .targetEvent(ev)
              .ok('SIM')
              .cancel('CANCELAR');

        $mdDialog.show(confirm).then(function() {
            $rootScope.LayerCarregando = true;
            $http.post('http://api.doutorsofa.com.br/servico/mudastatus', servico, { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
            .then(function(response) { 
                // sucesso!  
                data = response.data;  
                if (data.resposta == 1) {
                    populaServicos(0);
                    $mdDialog.hide();
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Serviço concluídos')
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
    console.dir($scope.item);
        $scope.myPictures = []; 
        
        $scope.atualizaHorarios = function(data) {
            $rootScope.LayerCarregando = true;
            $http.post('http://api.doutorsofa.com.br/servico/zikaL', data, { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
            .then(function(response) { 
                // sucesso!  
                console.dir(response);
                
                $scope.zika1 = response.data.map(
                    function(e) {
                        e.horario = parseInt(e.horario, 10);
                        return e;
                    }
                );
 
                $scope.horarios = [
                    { horario: 1, label: '00:00' },
                    { horario: 2, label: '01:00' },
                    { horario: 3, label: '02:00' },
                    { horario: 4, label: '03:00' },
                    { horario: 5, label: '04:00' },
                    { horario: 6, label: '05:00' },
                    { horario: 7, label: '06:00' },
                    { horario: 8, label: '07:00' },
                    { horario: 9, label: '08:00' },
                    { horario: 10, label: '09:00' },
                    { horario: 11, label: '10:00' },
                    { horario: 12, label: '11:00' },
                    { horario: 13, label: '12:00' },
                    { horario: 14, label: '13:00' },
                    { horario: 15, label: '14:00' },
                    { horario: 16, label: '15:00' },
                    { horario: 17, label: '16:00' },
                    { horario: 18, label: '17:00' },
                    { horario: 19, label: '18:00' },
                    { horario: 20, label: '19:00' },
                    { horario: 21, label: '20:00' },
                    { horario: 22, label: '21:00' },
                    { horario: 23, label: '22:00' },
                    { horario: 24, label: '23:00' },
                    { horario: 25, label: '24:00' } 
                ];

                $scope.prop = ['horario', 'label'];

                $scope.resultado = $scope.horarios.filter(function(o1){
                    // filter out (!) items in result2
                    return !$scope.zika1.some(function(o2){
                        return o1.horario === o2.horario;          // assumes unique horario
                    });
                }).map(function(o){
                    // use reduce to make objects with only the required properties
                    // and map to apply this to the filtered array as a whole
                    return $scope.prop.reduce(function(newo, label){
                        newo[label] = o[label];
                        return newo;
                    }, {});
                });
                
            }).finally(function() {
                $rootScope.LayerCarregando = false;   
            });            
        };
        
        $scope.testeee = $scope.item;
        
        // Verifica se o usuário quer editar o item.
        if (id_click > -1)
        { 
            $scope.edicao = true;
            $scope.item = {};
            $rootScope.LayerCarregando = true;
            $http.post('http://api.doutorsofa.com.br/servico/detalha', id_click, { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
            .then(function(response) { 
                // sucesso!    
                data = response.data;
                $scope.item = data[0];
                $scope.myPictures = data['fotos'];
                
                $scope.item.data = new Date($scope.item.data);
                
                console.dir(response.data);
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
            $scope.edicao = false;
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
                console.dir($scope.item);

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

app.directive('currencyMask', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ngModelController) {

      var formatNumber = function(value) {

        value = value.toString();
        value = value.replace(/[^0-9\.]/g, "");
        var parts = value.split('.');
        parts[0] = parts[0].replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, "$&,");
        if (parts[1] && parts[1].length > 2) {
          parts[1] = parts[1].substring(0, 2);
        }

        return parts.join(".");
      };
      var applyFormatting = function() {
        var value = element.val();
        var original = value;
        if (!value || value.length == 0) {
          return
        }
        value = formatNumber(value);
        if (value != original) {
          element.val(value);
          element.triggerHandler('input')
        }
      };
      element.bind('keyup', function(e) {
        var keycode = e.keyCode;
        var isTextInputKey =
          (keycode > 47 && keycode < 58) || // number keys
          keycode == 32 || keycode == 8 || // spacebar or backspace
          (keycode > 64 && keycode < 91) || // letter keys
          (keycode > 95 && keycode < 112) || // numpad keys
          (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
          (keycode > 218 && keycode < 223); // [\]' (in order)
        if (isTextInputKey) {
          applyFormatting();
        }
      });
      element.bind('blur', function(evt) {
        if (angular.isDefined(ngModelController.$modelValue)) {
          var val = ngModelController.$modelValue.split('.');
          if (val && val.length == 1) {
            if (val != "") {
              ngModelController.$setViewValue('R$ ' + val + '.00');
              ngModelController.$render();
            }
          } else if (val && val.length == 2) {
            if (val[1] && val[1].length == 1) {
              ngModelController.$setViewValue('R$ ' + val[0] + '.' + val[1] + '0');
              ngModelController.$render();
            } else if (val[1].length == 0) {
              ngModelController.$setViewValue('R$ ' + val[0] + '.00');
              ngModelController.$render();
            }
            applyFormatting();
          }
        }
      })
      ngModelController.$parsers.push(function(value) {
        if (!value || value.length == 0) {
          return value;
        }
        value = value.toString();
        value = value.replace(/[^0-9\.]/g, "");
        return value;
      });
      ngModelController.$formatters.push(function(value) {
        if (!value || value.length == 0) {
          return value;
        }
        value = formatNumber(value);
        return value;
      });
    }
  };
});