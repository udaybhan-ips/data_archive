var app = angular.module('sampleApp');

app.service('ApiInterceptor', function(Auth) {
    this.request = function(config) {
        if (config.url.indexOf('/api') >= 0) {
            var token = Auth.getToken();
            if (token) {
                config.headers.authorization = token;
            }
        }

        return config;
    };

    this.response = function(res) {
        if (res.config.url.indexOf('/api/auth/authenticate') >= 0) {
            var token = res.data.token;
            if (token) {
                Auth.saveToken(token);
            }
        }
        return res;
    };
});
