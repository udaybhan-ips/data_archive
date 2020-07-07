var app = angular.module('sampleApp');

app.service('Auth', function ($window, $localStorage) {
  this.parseJwt = function (token, next) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse($window.atob(base64));
  }

  this.saveToken = function (token) {
    $localStorage['TOKEN'] = token;
  }

  this.getToken = function () {
    return $localStorage['TOKEN'];
  }

  this.isAuthenticated = function () {
    var token = this.getToken();
    if (token) {
      try {
        var params = this.parseJwt(token);
        if (params.exp) {
          return Math.round(new Date().getTime() / 1000) <= params.exp;
        }
      }
      catch (error) {
        console.log('Error parsing token.')
      }
    }
    return false;
  }

  this.clear = function () {
    $localStorage.$reset();
  }
});