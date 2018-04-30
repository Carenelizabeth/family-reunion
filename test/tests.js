'use strict'

const chai = require('chai');
const chaitHttp = require('chai-http');
const mongoose = require('mongoose');

const expect = chai.expect;

const app = require('../server.js');

chai.use(chaitHttp);

describe('Event planning API', function(){
    it('should answer a request to root with html', function(){
        let res;
        return chai.request(app)
            .get('/')
            .then(function(_res){
                res = _res;
                expect(res).to.have.status(200);
                expect(res).to.be.html;
            })
    })
})