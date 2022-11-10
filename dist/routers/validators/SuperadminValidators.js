"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperadminValidators = void 0;
const express_validator_1 = require("express-validator");
const Superadmin_1 = require("../../models/Superadmin");
const Admin_1 = require("../../models/Admin");
const Ticket_1 = require("../../models/Ticket");
const User_1 = require("../../models/User");
class SuperadminValidators {
    static signup() {
        return [
            (0, express_validator_1.body)('name', 'name is Required').isString(),
            (0, express_validator_1.body)('password', 'password is Required').isString(),
            (0, express_validator_1.body)('code', 'code Is Required').custom((code, { req }) => {
                return Superadmin_1.default.findOne({ code: code }).then(superadmin => {
                    if (superadmin) {
                        throw new Error('Superadmin Already Exist');
                    }
                    else {
                        return true;
                    }
                });
            }),
        ];
    }
    static createAdmin() {
        return [
            (0, express_validator_1.body)('name', 'name is Required').isString(),
            (0, express_validator_1.body)('password', 'password is Required').isString(),
        ];
    }
    static login() {
        return [(0, express_validator_1.query)('code', 'Code is Required')
                .custom((code, { req }) => {
                return Superadmin_1.default.findOne({ code: code }).then(superadmin => {
                    if (superadmin) {
                        req.superadmin = superadmin;
                        return true;
                    }
                    else {
                        throw new Error('Superadmin Does Not Exist');
                    }
                });
            }), (0, express_validator_1.query)('password', 'Password is Required').isAlphanumeric()];
    }
    static updateAdmin() {
        return [(0, express_validator_1.param)('id').custom((id, { req }) => {
                return Admin_1.default.findOne({ _id: id }, { __v: 0 }).then((admin) => {
                    if (admin) {
                        req.admin = admin;
                        return true;
                    }
                    else {
                        throw new Error('admin Does Not Exist');
                    }
                });
            })];
    }
    static updateUser() {
        return [(0, express_validator_1.param)('id').custom((id, { req }) => {
                return User_1.default.findOne({ _id: id }, { __v: 0 }).then((user) => {
                    if (user) {
                        req.user = user;
                        return true;
                    }
                    else {
                        throw new Error('user Does Not Exist');
                    }
                });
            })];
    }
    static bidResult() {
        return [(0, express_validator_1.param)('id').custom((id, { req }) => {
                return Ticket_1.default.findOne({ _id: id }, { __v: 0 }).then((ticket) => {
                    if (ticket) {
                        req.ticket = ticket;
                        return true;
                    }
                    else {
                        throw new Error('ticket Does Not Exist');
                    }
                });
            })];
    }
    static allUser() {
        return [(0, express_validator_1.param)('id').custom((id, { req }) => {
                return Admin_1.default.findOne({ _id: id }, { __v: 0 }).then((admin) => {
                    if (admin) {
                        req.admin = admin;
                        return true;
                    }
                    else {
                        throw new Error('admin Does Not Exist');
                    }
                });
            })];
    }
    static adminTransaction() {
        return [(0, express_validator_1.param)('id').custom((id, { req }) => {
                return Admin_1.default.findOne({ _id: id }, { __v: 0 }).then((admin) => {
                    if (admin) {
                        req.admin = admin;
                        return true;
                    }
                    else {
                        throw new Error('admin Does Not Exist');
                    }
                });
            })];
    }
    static userTransaction() {
        return [(0, express_validator_1.param)('id').custom((id, { req }) => {
                return User_1.default.findOne({ _id: id }, { __v: 0 }).then((user) => {
                    if (user) {
                        req.user = user;
                        return true;
                    }
                    else {
                        throw new Error('user Does Not Exist');
                    }
                });
            })];
    }
    static transfer() {
        return [
            (0, express_validator_1.body)('coins', 'coins is Required').isNumeric(),
            (0, express_validator_1.body)('admin_id', 'admin_id Is Required').isString().custom((admin_id, { req }) => {
                return Admin_1.default.findOne({ _id: admin_id, super_admin_id: req.superadmin.superadmin_id }).then(admin => {
                    if (admin) {
                        return true;
                    }
                    else {
                        throw new Error('admin not Exist');
                    }
                });
            })
        ];
    }
    static withdraw() {
        return [
            (0, express_validator_1.body)('admin_id', 'admin_id Is Required').isString().custom((admin_id, { req }) => {
                return Admin_1.default.findOne({ _id: admin_id, super_admin_id: req.superadmin.superadmin_id }).then(admin => {
                    if (admin) {
                        return true;
                    }
                    else {
                        throw new Error('admin not Exist');
                    }
                });
            }),
            (0, express_validator_1.body)('coins', 'coins is Required').isNumeric().custom((coins, { req }) => {
                return Admin_1.default.findOne({ _id: req.body.admin_id, wallet: { $gte: coins } }).then(superadmin => {
                    if (superadmin) {
                        return true;
                    }
                    else {
                        throw new Error('admin wallet not having enough balance');
                    }
                });
            }),
        ];
    }
}
exports.SuperadminValidators = SuperadminValidators;
