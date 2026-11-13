import { describe, it, after } from 'node:test';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../index.js';

after(() => mongoose.disconnect());

describe('GET /', () => {
    it('return html response', () => {
        return request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', /html/)
    });
});

describe('GET /serverTime', () => {
    it('return json object', () => {
        return request(app)
        .get('/serverTime')
        .expect(200)
        .expect('Content-Type', /json/);
    })
})
