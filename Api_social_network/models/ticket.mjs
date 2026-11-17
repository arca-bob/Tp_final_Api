import Validator from 'better-validator';

import authToken from '../helpers/auth-token.mjs';

let ticketTypes = [
    {
        id: 1,
        eventId: 1,
        name: 'VIP',
        amount: 50,
        quantity: 100
    }
];
let tickets = [];
const Tickets = class Tickets {
    constructor(app) {
        this.app = app;
        this.run();
    }

    validateTicketType(req) {
        const validator = new Validator();
        validator(req.body.eventId)
            .required()
            .isNumber();
        validator(req.body.name)
            .required()
            .isString();
        validator(req.body.amount)
            .required()
            .isNumber();
        validator(req.body.quantity)
            .required()
            .isNumber();
        return validator.run();
    }
    validatePurchase(req) {
        const validator = new Validator();
        validator(req.body.ticketTypeId)
            .required()
            .isNumber();
        validator(req.body.firstname)
            .required()
            .isString();
        validator(req.body.lastname)
            .required()
            .isString();
        validator(req.body.email)
            .required()
        validator(req.body.address)
            .required()
            .isString();
        return validator.run();
    }
    getTicketTypes() {
        this.app.get('/ticket-types', authToken, (req, res) => {
            res.status(200).json(ticketTypes);
        });
    }

    getTicketTypeById() {
        this.app.get('/ticket-types/:id', authToken, (req, res) => {
            const id = parseInt(req.params.id);
            const ticketType = ticketTypes.find(
                ticket => ticket.id === id
            );
            if (!ticketType) {
                return res.status(404).json({
                    code: 404,
                    message: 'Ticket type not found'
                });
            }
            res.status(200).json(ticketType);
        });
    }

    createTicketType() {
        this.app.post('/ticket-types', authToken, async (req, res) => {
            const errors = await this.validateTicketType(req);
            if (errors.length > 0) {
                return res.status(400).json({
                    code: 400,
                    message: 'Validation failed',
                    errors
                });
            }
            const ticketType = {
                id: ticketTypes.length + 1,
                eventId: req.body.eventId,
                name: req.body.name,
                amount: req.body.amount,
                quantity: req.body.quantity
            };
            ticketTypes.push(ticketType);
            res.status(201).json(ticketType);
        });
    }
    updateTicketType() {
        this.app.put('/ticket-types/:id', authToken, (req, res) => {
            const id = parseInt(req.params.id);
            const ticketType = ticketTypes.find(
                ticket => ticket.id === id
            );
            if (!ticketType) {
                return res.status(404).json({
                    code: 404,
                    message: 'Ticket type not found'
                });
            }
            ticketType.name = req.body.name ?? ticketType.name;
            ticketType.amount = req.body.amount ?? ticketType.amount;
            ticketType.quantity = req.body.quantity ?? ticketType.quantity;
            res.status(200).json(ticketType);
        });
    }

    deleteTicketType() {
        this.app.delete('/ticket-types/:id', authToken, (req, res) => {
            const id = parseInt(req.params.id);
            const index = ticketTypes.findIndex(
                ticket => ticket.id === id
            );
            if (index === -1) {
                return res.status(404).json({
                    code: 404,
                    message: 'Ticket type not found'
                });
            }
            const deleted = ticketTypes.splice(index, 1);
            res.status(200).json(deleted[0]);
        });
    }

    purchaseTicket() {
        this.app.post('/tickets', async (req, res) => {
            const errors = await this.validatePurchase(req);
            if (errors.length > 0) {
                return res.status(400).json({
                    code: 400,
                    message: 'Validation failed',
                    errors
                });
            }
            const ticketType = ticketTypes.find(
                ticket =>
                    ticket.id === req.body.ticketTypeId
            );
            if (!ticketType) {
                return res.status(404).json({
                    code: 404,
                    message: 'Ticket type not found'
                });
            }
            const soldTickets = tickets.filter(
                ticket => ticket.ticketTypeId === req.body.ticketTypeId
            ).length;
            if (soldTickets >= ticketType.quantity) {
                return res.status(400).json({
                    code: 400,
                    message: 'No tickets available'
                });
            }
            const existingTicket = tickets.find(
                ticket =>
                    ticket.email === req.body.email
            );
            if (existingTicket) {
                return res.status(409).json({
                    code: 409,
                    message: 'User already owns a ticket'
                });
            }
            const purchase = {
                id: tickets.length + 1,
                ticketTypeId: req.body.ticketTypeId,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                address: req.body.address,
                purchaseDate: new Date().toISOString()
            };
            tickets.push(purchase);
            res.status(201).json(purchase);
        });
    }

    getTickets() {
        this.app.get('/tickets', authToken, (req, res) => {
            res.status(200).json(tickets);
        });
    }
    getTicketById() {
        this.app.get('/tickets/:id', authToken, (req, res) => {
            const id = parseInt(req.params.id);
            const ticket = tickets.find(
                ticket =>
                    ticket.id === id
            );
            if (!ticket) {
                return res.status(404).json({
                    code: 404,
                    message: 'Ticket not found'
                });
            }
            res.status(200).json(ticket);
        });
    }

    run() {
        this.getTicketTypes();
        this.getTicketTypeById();
        this.createTicketType();
        this.updateTicketType();
        this.deleteTicketType();
        this.purchaseTicket();
        this.getTickets();
        this.getTicketById();
    }
};

export default Tickets;