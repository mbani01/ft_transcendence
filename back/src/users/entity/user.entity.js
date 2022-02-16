"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.User = void 0;
var typeorm_1 = require("typeorm");
var User = /** @class */ (function () {
    function User() {
    }
    __decorate([
        (0, typeorm_1.PrimaryColumn)({ unique: true })
    ], User.prototype, "id");
    __decorate([
        (0, typeorm_1.Column)({ unique: true })
    ], User.prototype, "username");
    __decorate([
        (0, typeorm_1.Column)()
    ], User.prototype, "avatar");
    __decorate([
        (0, typeorm_1.Column)({ "default": 0 })
    ], User.prototype, "gamesCount");
    __decorate([
        (0, typeorm_1.Column)({ "default": 0 })
    ], User.prototype, "gamesWon");
    __decorate([
        (0, typeorm_1.Column)({ "default": false })
    ], User.prototype, "is2FAEnabled");
    __decorate([
        (0, typeorm_1.Column)({ nullable: true })
    ], User.prototype, "twoFASecret");
    User = __decorate([
        (0, typeorm_1.Entity)("Users")
    ], User);
    return User;
}());
exports.User = User;
