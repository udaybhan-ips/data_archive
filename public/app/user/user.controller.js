var app = angular.module('sampleApp');

app.controller('UserController', function (User, Auth, $state, $scope, $rootScope) {
  
  $rootScope.user = {};

  var init = function () {
    User.getUserData()
      .then(function (data) {
        $rootScope.user.name = data.name;
        $rootScope.user.email = data.email;
        $rootScope.user.id = data.id;
      });
  }

  $scope.isAuthenticated = function () {
    return Auth.isAuthenticated ? Auth.isAuthenticated() : false;
  };

  $scope.logout = function () {
    Auth.clear();
    $state.go('login');
  };
  
  init();
});