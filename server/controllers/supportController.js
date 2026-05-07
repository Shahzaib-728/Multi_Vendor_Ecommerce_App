import * as service from '../services/supportService.js'

export async function create(req, res, next) {
    try {
        const { subject, category, message } = req.body;
        const ticket = await service.createTicket(req.user.id, subject, category, message);
        res.status(201).json(ticket);
    } catch (err) {
        next(err);
    }
}

export async function getActive(req, res, next) {
    try {
        const ticket = await service.getActiveTicket(req.user.id)
        if (!ticket) return res.json(null) // No active ticket is fine
        res.json(ticket)
    } catch (err) {
        next(err)
    }
}

export async function list(req, res, next) {
    try {
        const tickets = await service.listTickets()
        res.json(tickets)
    } catch (err) {
        next(err)
    }
}

export async function get(req, res, next) {
    try {
        const ticket = await service.getTicket(req.params.id)
        if (!ticket) return res.status(404).json({ error: 'Not found' })
        res.json(ticket)
    } catch (err) {
        next(err)
    }
}

export async function reply(req, res, next) {
    try {
        const { message, status } = req.body
        const ticket = await service.addReply(req.params.id, req.user.id, message, status)
        res.json(ticket)
    } catch (err) {
        next(err)
    }
}

export async function globalSearch(req, res, next) {
    try {
        const { query } = req.query;
        const results = await service.globalSearch(query);
        res.json(results);
    } catch (err) {
        next(err);
    }
}
