import Validator from 'better-validator';

import authToken from '../helpers/auth-token.mjs';

let data = [
    {
        id: 1,
        eventId: 1,
        title: 'Choix du repas',
        createdBy: 1,

        questions: [
            {
                id: 1,
                question: 'Quel repas souhaitez-vous ?',

                answers: [
                    'Pizza',
                    'Burger',
                    'Pâtes'
                ]
            }
        ],

        votes: []
    }
];

const Polls = class Polls {
    constructor(app) {
        this.app = app;
        this.run();
    }

    validatePoll(req) {
        const validator = new Validator();
        validator(req.body.eventId)
            .required()
            .isNumber();
        validator(req.body.title)
            .required()
            .isString()
        validator(req.body.createdBy)
            .required()
            .isNumber();
        return validator.run();
    }

    getAll() {
        this.app.get('/polls', authToken, (req, res) => {
            try {
                res.status(200).json(data);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    getShowById() {
        this.app.get('/polls/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const poll = data.find(
                    poll => poll.id === id
                );
                if (!poll) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Poll not found'
                    });
                }
                res.status(200).json(poll);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    create() {
        this.app.post('/polls', authToken, async (req, res) => {
            try {
                const errors = await this.validatePoll(req);
                if (errors.length > 0) {
                    return res.status(400).json({
                        code: 400,
                        message: 'Validation failed',
                        errors
                    });
                }
                const poll = {
                    id: data.length + 1,
                    eventId: req.body.eventId,
                    title: req.body.title,
                    createdBy: req.body.createdBy,
                    questions: req.body.questions ?? [],
                    votes: []
                };
                data.push(poll);
                res.status(201).json(poll);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    update() {
        this.app.put('/polls/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const poll = data.find(
                    poll => poll.id === id
                );
                if (!poll) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Poll not found'
                    });
                }
                poll.title = req.body.title ?? poll.title;
                poll.questions = req.body.questions ?? poll.questions;
                res.status(200).json(poll);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    delete() {
        this.app.delete('/polls/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const index = data.findIndex(
                    poll => poll.id === id
                );
                if (index === -1) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Poll not found'
                    });
                }
                const deletedPoll = data.splice(index, 1);
                res.status(200).json(deletedPoll[0]);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    vote() {
        this.app.post('/polls/:id/vote', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const poll = data.find(
                    poll => poll.id === id
                );
                if (!poll) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Poll not found'
                    });
                }
                const {
                    userId,
                    questionId,
                    answer
                } = req.body;
                const existingVote = poll.votes.find(
                    vote =>
                        vote.userId === userId &&
                        vote.questionId === questionId
                );
                if (existingVote) {
                    return res.status(409).json({
                        code: 409,
                        message: 'User already voted for this question'
                    });
                }
                poll.votes.push({
                    userId,
                    questionId,
                    answer
                });
                res.status(201).json({
                    code: 201,
                    message: 'Vote recorded'
                });
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    getPollResults() {
        this.app.get('/polls/:id/results', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const poll = data.find(
                    poll => poll.id === id
                );
                if (!poll) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Poll not found'
                    });
                }
                res.status(200).json(poll.votes);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    run() {
        this.getAll();
        this.getShowById();
        this.create();
        this.update();
        this.delete();
        this.vote();
        this.getPollResults();
    }
};

export default Polls;