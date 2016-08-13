"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
var angular2_jwt_1 = require('angular2-jwt');
var auth_1 = require('../../services/auth/auth');
require('rxjs/add/operator/map');
var PingPage = (function () {
    function PingPage(http, authHttp, auth) {
        this.http = http;
        this.authHttp = authHttp;
        this.auth = auth;
    }
    PingPage.prototype.ping = function () {
        var _this = this;
        // Change the endpoint up for
        // one that points to your own server.
        this.http.get('http://example.com/ping')
            .map(function (res) { return res.json(); })
            .subscribe(function (data) { return _this.message = data; }, function (err) { return _this.error = err; });
    };
    PingPage.prototype.securedPing = function () {
        var _this = this;
        // Here we use authHttp to make an authenticated
        // request to the server. Change the endpoint up for
        // one that points to your own server.
        this.authHttp.get('http://example.com/secured/ping')
            .map(function (res) { return res.json(); })
            .subscribe(function (data) { return _this.message = data; }, function (err) { return _this.error = err; });
    };
    PingPage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/ping/ping.html',
        }), 
        __metadata('design:paramtypes', [http_1.Http, angular2_jwt_1.AuthHttp, auth_1.AuthService])
    ], PingPage);
    return PingPage;
}());
exports.PingPage = PingPage;
