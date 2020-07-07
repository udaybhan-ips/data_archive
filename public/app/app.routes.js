var app = angular.module('sampleApp');

app.config(function ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('login', {
      templateUrl: '/app/partials/login.html',
      controller: 'LoginController'
    })
    .state('register', {
      templateUrl: '/app/partials/register.html',
      controller: 'LoginController'
    })
    .state('profile', {
      url: '/',
      templateUrl: '/app/partials/profile.html',
      controller: 'UserController',
      resolve: {
        authenticated: verifyAuth
      }
    })
    .state('settings', {
      templateUrl: '/app/partials/settings.html',
      controller: 'UserSettingsController',
      resolve: {
        authenticated: verifyAuth
      }
    });

  function verifyAuth(Auth, $q, $timeout, $state) {
    if (Auth.isAuthenticated()) {
      return $q.when();
    }
    else {
      $timeout(function () {
        $state.go('login');
      });

      return $q.reject('Not authenticated');
    }
  }
});