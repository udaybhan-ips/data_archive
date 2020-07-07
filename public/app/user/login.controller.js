var app = angular.module('sampleApp');

app.controller('LoginController', function (User, $timeout, $state, $scope) {

  $scope.alert = {
    success: '',
    error: ''
  };

  $scope.login = function () {
    User.login($scope.email, $scope.password)
      .then(function () {
        $state.go('profile');
      })
      .catch(function (err) {
        $scope.alert.error = err;
      });
  };

  $scope.register = function () {
    User.register($scope.name, $scope.email, $scope.password)
      .then(function () {
        $timeout(function () {
          $scope.login();
        }, 1000);
      })
      .catch(function (err) {
        $scope.alert.error = err;
      });
  };
});