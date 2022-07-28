var app = angular.module('sampleApp');

app.controller('UserSettingsController', function(User, $rootScope, $scope) {

  $scope.alert = {
    success: '',
    error: ''
  };

  $scope.name = $rootScope.user.name;
  $scope.email = $rootScope.user.email;
  $scope.id = $rootScope.user.id;

  $scope.changeName = function() {
    User.changeName($scope.id, $scope.name)
      .then(function() {
        $scope.alert.success = 'Name changed successfully!';
        $scope.alert.error = '';

      })
      .catch(function(err) {
        $scope.alert.error = err;
        $scope.alert.success = '';
      });
  };

  $scope.changeEmail = function() {
    User.changeEmail($scope.id, $scope.email)
      .then(function() {
        $scope.alert.success = 'E-mail changed successfully!';
        $scope.alert.error = '';

      })
      .catch(function(err) {
        $scope.alert.error = err;
        $scope.alert.success = '';
      });
  };

  $scope.changePassword = function() {
    User.changePassword($scope.id, $scope.password)
      .then(function() {
        $scope.alert.success = 'Password changed successfully!';
        $scope.alert.error = '';

      })
      .catch(function(err) {
        $scope.alert.error = err;
        $scope.alert.success = '';
      });
  };

});