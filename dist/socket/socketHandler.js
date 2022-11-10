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
exports.SocketHandler = void 0;
const Bid_1 = require("../models/Bid");
const Candidate_1 = require("../models/Candidate");
const Party_1 = require("../models/Party");
const Location_1 = require("../models/Location");
const State_1 = require("../models/State");
const Ticket_1 = require("../models/Ticket");
const TicketCandidate_1 = require("../models/TicketCandidate");
const User_1 = require("../models/User");
const socketService_1 = require("./socketService");
const Admin_1 = require("../models/Admin");
class SocketHandler {
    // io changed to socketService.io
    static connectSocket() {
        socketService_1.socketService.io.on('connection', function (socket) {
            console.log('New Socket Connected: ' + socket.id);
            socket.on('disconnect', () => {
                console.log('user disconnected: ' + socket.id);
            });
            SocketHandler.uiHandler(socket);
        });
    }
    static uiHandler(socket) {
        // user data
        socket.on('userData', (user_id) => __awaiter(this, void 0, void 0, function* () {
            let user = yield User_1.default.findOne({ _id: user_id }, { __v: 0 });
            if (user) {
                let myData = user.toObject();
                let bids = yield Bid_1.default.find({ user_id: user_id, result_declare_status: false });
                var sum = 0;
                for (const bid of bids) {
                    sum += bid['bid_amount'];
                }
                myData['exposure'] = sum;
                socketService_1.socketService.io.emit('userData', myData);
            }
            else {
                socketService_1.socketService.io.emit('userData', "No User Present");
            }
        }));
        // admin data
        socket.on('adminData', (admin_id) => __awaiter(this, void 0, void 0, function* () {
            let admin = yield Admin_1.default.findOne({ _id: admin_id }, { __v: 0 });
            if (admin) {
                socketService_1.socketService.io.emit('adminData', admin);
            }
            else {
                socketService_1.socketService.io.emit('adminData', "No admin Present");
            }
        }));
        // state wise tickets for users
        socket.on('tickets', (state_id) => __awaiter(this, void 0, void 0, function* () {
            //let state = await State.find({status:true}, {__v: 0});
            let state = yield State_1.default.findOne({ _id: state_id, status: true }, { __v: 0 });
            // let state_array =[];
            // for(let data of state){
            //let myData:object = data.toObject();
            let myData = state.toObject();
            myData['tickets'] = [];
            const parties = yield Party_1.default.find({ state_id: myData['_id'], status: true }, { __v: 0 });
            for (const party of parties) {
                let ticket = yield Ticket_1.default.findOne({ party_id: party['_id'], status: true }, { __v: 0 }).sort({ created_at: -1 }).populate('party_id');
                if (ticket) {
                    myData['tickets'].push(ticket);
                }
            }
            //state_array.push(myData);
            // }
            socketService_1.socketService.io.emit('tickets', myData);
        }));
        // user bids statewise
        socket.on('userPartyBid', (data) => __awaiter(this, void 0, void 0, function* () {
            let parties = yield Party_1.default.find({ state_id: data.state_id }, { __v: 0 });
            let party_id_array = [];
            for (const party of parties) {
                party_id_array.push(party['_id']);
            }
            let tickets = yield Ticket_1.default.find({ party_id: { "$in": party_id_array } });
            let ticket_id_array = [];
            for (const ticket of tickets) {
                ticket_id_array.push(ticket['_id']);
            }
            let bids = yield Bid_1.default.find({ user_id: data.user_id, ticket_type: "tickets", ticket_id: { "$in": ticket_id_array } }).sort({ created_at: -1 }).populate([
                { path: 'ticket_id', populate: { path: "party_id", populate: { path: "state_id" } } }
            ]);
            socketService_1.socketService.io.emit('userPartyBid', bids);
        }));
        // location wise candidate tickets for users
        socket.on('candidateTickets', (location_id) => __awaiter(this, void 0, void 0, function* () {
            let location = yield Location_1.default.findOne({ _id: location_id, status: true }, { __v: 0 });
            let myData = location.toObject();
            myData['tickets'] = [];
            const candidates = yield Candidate_1.default.find({ location_id: myData['_id'], status: true }, { __v: 0 });
            for (const candidate of candidates) {
                let ticket = yield TicketCandidate_1.default.findOne({ candidate_id: candidate['_id'], status: true }, { __v: 0 }).sort({ created_at: -1 }).populate('party_id');
                if (ticket) {
                    myData['tickets'].push(ticket);
                }
            }
            socketService_1.socketService.io.emit('candidateTickets', myData);
        }));
        // user candidate bids locationwise
        socket.on('userBidOnCandidateLocationwise', (data) => __awaiter(this, void 0, void 0, function* () {
            let candidates = yield Candidate_1.default.find({ location_id: data.location_id }, { __v: 0 });
            let candidate_id_array = [];
            for (const candidate of candidates) {
                candidate_id_array.push(candidate['_id']);
            }
            let tickets = yield TicketCandidate_1.default.find({ candidate_id: { "$in": candidate_id_array } });
            let ticket_id_array = [];
            for (const ticket of tickets) {
                ticket_id_array.push(ticket['_id']);
            }
            let bids = yield Bid_1.default.find({ user_id: data.user_id, ticket_type: "ticket_candidates", ticket_id: { "$in": ticket_id_array } }).sort({ created_at: -1 }).populate([
                { path: 'ticket_id', populate: { path: "candidate_id", populate: { path: "state_id" } } }
            ]);
            socketService_1.socketService.io.emit('userBidOnCandidateLocationwise', bids);
        }));
        // user candidate bids statewise
        socket.on('userCandidateBid', (data) => __awaiter(this, void 0, void 0, function* () {
            let candidates = yield Candidate_1.default.find({ state_id: data.state_id }, { __v: 0 });
            let candidate_id_array = [];
            for (const candidate of candidates) {
                candidate_id_array.push(candidate['_id']);
            }
            let tickets = yield TicketCandidate_1.default.find({ candidate_id: { "$in": candidate_id_array } });
            let ticket_id_array = [];
            for (const ticket of tickets) {
                ticket_id_array.push(ticket['_id']);
            }
            let bids = yield Bid_1.default.find({ user_id: data.user_id, ticket_type: "ticket_candidates", ticket_id: { "$in": ticket_id_array } }).sort({ created_at: -1 }).populate([
                { path: 'ticket_id', populate: { path: "candidate_id", populate: { path: "state_id" } } }
            ]);
            socketService_1.socketService.io.emit('userCandidateBid', bids);
        }));
        // user candidate bids locationwise
        socket.on('candidateLocationwise', (data) => __awaiter(this, void 0, void 0, function* () {
            var location = yield Location_1.default.findOne({ _id: data.location_id, status: true }, { __v: 0 });
            if (location) {
                let myData = location.toObject();
                myData['tickets'] = [];
                const candidates = yield Candidate_1.default.find({ location_id: myData['_id'], status: true }, { __v: 0 });
                let candidate_id_array = [];
                for (const candidate of candidates) {
                    candidate_id_array.push(candidate['_id']);
                    // get ticket total yes or no winning amount
                    let yesValue = 0;
                    let noValue = 0;
                    let allTicket = yield TicketCandidate_1.default.find({ candidate_id: candidate['_id'], status: true }, { __v: 0 }).sort({ created_at: -1 });
                    for (const aticket of allTicket) {
                        let abids = yield Bid_1.default.find({ user_id: data.user_id, ticket_type: "ticket_candidates", ticket_id: aticket['_id'] }).sort({ created_at: -1 });
                        for (const abid of abids) {
                            if (abid['yes_or_no'] == "yes") {
                                yesValue += abid['bid_amount'] * aticket['yes_winning_percent'] / 100;
                            }
                            else {
                                noValue += abid['bid_amount'] * aticket['no_winning_percent'] / 100;
                            }
                        }
                    }
                    //end
                    let ticket = yield TicketCandidate_1.default.findOne({ candidate_id: candidate['_id'], status: true }, { __v: 0 }).sort({ created_at: -1 }).populate('candidate_id');
                    if (ticket) {
                        let amyData = ticket.toObject();
                        amyData['yesValue'] = yesValue;
                        amyData['noValue'] = noValue;
                        myData['tickets'].push(amyData);
                    }
                }
                let tickets = yield TicketCandidate_1.default.find({ candidate_id: { "$in": candidate_id_array } });
                let ticket_id_array = [];
                for (const ticket of tickets) {
                    ticket_id_array.push(ticket['_id']);
                }
                let bids = yield Bid_1.default.find({ user_id: data.user_id, ticket_type: "ticket_candidates", ticket_id: { "$in": ticket_id_array } }).sort({ created_at: -1 }).populate([
                    { path: 'ticket_id', populate: { path: "candidate_id", populate: { path: "state_id" } } }
                ]);
                myData['bids'] = bids;
                socketService_1.socketService.io.emit('candidateLocationwise', myData);
            }
            else {
                socketService_1.socketService.io.emit('candidateLocationwise', 'Location Not Exist');
            }
        }));
    }
}
exports.SocketHandler = SocketHandler;
