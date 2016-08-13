"use strict";
var Auth0Vars = (function () {
    function Auth0Vars() {
    }
    Auth0Vars.AUTH0_CLIENT_ID = 'AUTH_CLIENT_ID';
    Auth0Vars.AUTH0_CALLBACK_URL = location.href;
    Auth0Vars.AUTH0_DOMAIN = 'AUTH0';
    return Auth0Vars;
}());
exports.Auth0Vars = Auth0Vars;
