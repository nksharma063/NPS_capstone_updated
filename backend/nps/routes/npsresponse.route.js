const express = require('express');
const routes = express.Router();
const npsResponseController = require('../controllers/npsresponses.controller')

routes.get('/',npsResponseController.fetchAllResponses)
routes.get('/:id',npsResponseController.getResponseById)
routes.post('/limited/',npsResponseController.getNpsResponses )
routes.post('/npsregisterstudent', npsResponseController.createNpsResponseForBatch)
routes.post('/sampletry', npsResponseController.sampleTry)
routes.post('/resend', npsResponseController.postResendEmail)
routes.get('/form/:userId',npsResponseController.getResponseByUserId)
routes.put('/:id', npsResponseController.updateResponseById)
routes.get('/npsstat/all', npsResponseController.getAllNPSStat)
routes.get('/nps/res/:responseId', npsResponseController.getDetailedResponseByResponseId)
module.exports = routes