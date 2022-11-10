"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartyController = void 0;
const Party_1 = require("../models/Party");
const Ticket_1 = require("../models/Ticket");
class PartyController {
    static create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let party = yield new Party_1.default(req.body).save();
                res.json({
                    message: 'Party Save Successfully',
                    data: party,
                    status_code: 200
                });
            }
            catch (e) {
                next(e);
            }
        });
    }
    static update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const PartyId = req.party._id;
            try {
                const party = yield Party_1.default.findOneAndUpdate({ _id: PartyId }, req.body, { new: true, useFindAndModify: false });
                res.json({
                    message: 'Party Updated Successfully',
                    data: party,
                    status_code: 200
                });
            }
            catch (e) {
                next(e);
            }
        });
    }
    static result(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const partyId = req.party._id;
            try {
                // update party winning_seats
                const party = yield Party_1.default.findOneAndUpdate({ _id: partyId }, { winning_seats: req.body.winning_seats }, { new: true, useFindAndModify: false });
                if (party) {
                    let party_winning_seats = party['winning_seats'];
                    if (party_winning_seats) {
                        // All ticket of this party
                        let tickets = yield Ticket_1.default.find({ party_id: party['_id'] }, { __v: 0 });
                        for (const ticket of tickets) {
                            // update yes_seats
                            if (party_winning_seats >= ticket['yes_seats']) {
                                yield Ticket_1.default.findOneAndUpdate({ _id: ticket['_id'] }, { yes_result: true }, { new: true, useFindAndModify: false });
                            }
                            else {
                                yield Ticket_1.default.findOneAndUpdate({ _id: ticket['_id'] }, { yes_result: false }, { new: true, useFindAndModify: false });
                            }
                            // update no_seats
                            if (party_winning_seats <= ticket['no_seats']) {
                                yield Ticket_1.default.findOneAndUpdate({ _id: ticket['_id'] }, { no_result: true }, { new: true, useFindAndModify: false });
                            }
                            else {
                                yield Ticket_1.default.findOneAndUpdate({ _id: ticket['_id'] }, { no_result: false }, { new: true, useFindAndModify: false });
                            }
                        }
                    }
                }
                res.json({
                    message: 'Party Winning Seat Updated Successfully',
                    data: party,
                    status_code: 200
                });
            }
            catch (e) {
                next(e);
            }
        });
    }
    static Party(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const party = req.party;
            const data = {
                message: 'Success',
                data: party
            };
            res.json(data);
        });
    }
    static stateParty(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const party = req.party;
            const data = {
                message: 'Success',
                data: party
            };
            res.json(data);
        });
    }
    static allParty(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const party = yield Party_1.default.find({ status: true }, { __v: 0 }).populate({ path: "state_id" });
                const data = {
                    message: 'Success',
                    data: party
                };
                res.json(data);
            }
            catch (e) {
                next(e);
            }
        });
    }
    static allOwnerParty(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const party = yield Party_1.default.find();
                const data = {
                    message: 'Success',
                    data: party
                };
                res.json(data);
            }
            catch (e) {
                next(e);
            }
        });
    }
    static delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const party = req.party;
            try {
                yield party.remove();
                res.json({
                    message: 'Success ! Party Deleted Successfully',
                    status_code: 200
                });
            }
            catch (e) {
                next(e);
            }
        });
    }
}
exports.PartyController = PartyController;
