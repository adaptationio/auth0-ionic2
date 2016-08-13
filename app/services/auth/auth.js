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
var ionic_angular_1 = require('ionic-angular');
var angular2_jwt_1 = require('angular2-jwt');
var core_1 = require('@angular/core');
var Rx_1 = require('rxjs/Rx');
var auth0_variables_1 = require('../../auth0-variables');
var AuthService = (function () {
    function AuthService(authHttp, zone) {
        var _this = this;
        this.authHttp = authHttp;
        this.userSource = new Rx_1.BehaviorSubject({});
        this.user$ = this.userSource.asObservable();
        this.jwtHelper = new angular2_jwt_1.JwtHelper();
        this.auth0 = new Auth0({ clientID: auth0_variables_1.Auth0Vars.AUTH0_CLIENT_ID, domain: auth0_variables_1.Auth0Vars.AUTH0_DOMAIN });
        this.lock = new Auth0Lock(auth0_variables_1.Auth0Vars.AUTH0_CLIENT_ID, auth0_variables_1.Auth0Vars.AUTH0_DOMAIN, {
            auth: {
                redirect: false,
                params: {
                    scope: 'openid offline_access',
                }
            }
        });
        this.local = new ionic_angular_1.Storage(ionic_angular_1.LocalStorage);
        this.zoneImpl = zone;
        // Check if there is a profile saved in local storage
        this.local.get('profile').then(function (profile) {
            _this.user = JSON.parse(profile);
            console.log(profile);
            _this.userSource.next(_this.user);
        }).catch(function (error) {
            console.log(error);
        });
        this.lock.on('authenticated', function (authResult) {
            _this.local.set('id_token', authResult.idToken);
            // Fetch profile information
            _this.lock.getProfile(authResult.idToken, function (error, profile) {
                if (error) {
                    // Handle error
                    alert(error);
                    return;
                }
                profile.user_metadata = profile.user_metadata || {};
                _this.local.set('profile', JSON.stringify(profile));
                _this.user = profile;
                console.log(profile);
                _this.userSource.next(_this.user);
            });
            _this.lock.hide();
            _this.local.set('refresh_token', authResult.refreshToken);
            _this.zoneImpl.run(function () { return _this.user = authResult.profile; });
            // Schedule a token refresh
            _this.scheduleRefresh();
        });
    }
    AuthService.prototype.authenticated = function () {
        // Check if there's an unexpired JWT
        return angular2_jwt_1.tokenNotExpired();
    };
    AuthService.prototype.login = function () {
        // Show the Auth0 Lock widget
        this.lock.show();
    };
    AuthService.prototype.logout = function () {
        var _this = this;
        this.local.remove('profile');
        this.local.remove('id_token');
        this.local.remove('refresh_token');
        this.zoneImpl.run(function () {
            _this.user = null;
            _this.userSource.next(_this.user);
        });
        // Unschedule the token refresh
        this.unscheduleRefresh();
    };
    AuthService.prototype.scheduleRefresh = function () {
        var _this = this;
        // If the user is authenticated, use the token stream
        // provided by angular2-jwt and flatMap the token
        var source = this.authHttp.tokenStream.flatMap(function (token) {
            // The delay to generate in this case is the difference
            // between the expiry time and the issued at time
            var jwtIat = _this.jwtHelper.decodeToken(token).iat;
            var jwtExp = _this.jwtHelper.decodeToken(token).exp;
            var iat = new Date(0);
            var exp = new Date(0);
            var delay = (exp.setUTCSeconds(jwtExp) - iat.setUTCSeconds(jwtIat));
            return Rx_1.Observable.interval(delay);
        });
        this.refreshSubscription = source.subscribe(function () {
            _this.getNewJwt();
        });
    };
    AuthService.prototype.startupTokenRefresh = function () {
        var _this = this;
        // If the user is authenticated, use the token stream
        // provided by angular2-jwt and flatMap the token
        if (this.authenticated()) {
            var source = this.authHttp.tokenStream.flatMap(function (token) {
                // Get the expiry time to generate
                // a delay in milliseconds
                var now = new Date().valueOf();
                var jwtExp = _this.jwtHelper.decodeToken(token).exp;
                var exp = new Date(0);
                exp.setUTCSeconds(jwtExp);
                var delay = exp.valueOf() - now;
                // Use the delay in a timer to
                // run the refresh at the proper time
                return Rx_1.Observable.timer(delay);
            });
            // Once the delay time from above is
            // reached, get a new JWT and schedule
            // additional refreshes
            source.subscribe(function () {
                _this.getNewJwt();
                _this.scheduleRefresh();
            });
        }
    };
    AuthService.prototype.unscheduleRefresh = function () {
        // Unsubscribe fromt the refresh
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
    };
    AuthService.prototype.getNewJwt = function () {
        var _this = this;
        // Get a new JWT from Auth0 using the refresh token saved
        // in local storage
        this.local.get('refresh_token').then(function (token) {
            _this.auth0.refreshToken(token, function (err, delegationRequest) {
                if (err) {
                    alert(err);
                }
                _this.local.set('id_token', delegationRequest.id_token);
            });
        }).catch(function (error) {
            console.log(error);
        });
    };
    AuthService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [angular2_jwt_1.AuthHttp, core_1.NgZone])
    ], AuthService);
    return AuthService;
}());
exports.AuthService = AuthService;
