var app = angular.module('sampleApp');

// Storage key prefix
app.config(['$localStorageProvider', function($localStorageProvider) {
  $localStorageProvider.setKeyPrefix('node-postgres-registration-')
}]);

// API auth interceptor
app.config(function ($httpProvider) {
  $httpProvider.interceptors.push('ApiInterceptor');
});