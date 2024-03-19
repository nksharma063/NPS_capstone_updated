const NpsResponse = require('../models/npsresponses.model').NpsResponse
const Student = require('../models/student.model').Student;
const Batch = require('../models/batch.model').Batch;
const Program = require('../models/program.model').Program;
const Npsform = require('../models/npsform.model').Npsform;
const Studentacademic = require('../models/studentacademicdata.model').Studentacademic
const Question = require('../models/questions.model').Question
const QuestionType = require('../models/questionType.model').Questiontype
const mongoose = require('mongoose');
const AWS = require("aws-sdk");

const getAllNPSStat = async (req, res) => {
    try {
        const data = await NpsResponse.find();
        let promoter = 0;
        let detractor = 0;
        let neutral = 0;

        // Iterate over each response to calculate promoters and detractors
        data.forEach(npsResponse => {
            npsResponse.responses.forEach(response => {
                if (response.questionType === "nps") {
                    if (response.responseVal > 8) {
                        promoter++;
                    } else if (response.responseVal < 7) {
                        detractor++;
                    }else if(response.responseVal ==7 || response.responseVal == 8 ){
                        neutral++;
                    }
                }
            });
        });

        console.log('[+]  promoter',promoter)
        console.log('[+]  detractor',detractor)
        let promoterPercentage = promoter * 100 / (promoter + neutral + detractor)
        let detractorPercentage = detractor * 100 /(promoter + neutral + detractor)
        // Calculate NPS
        let nps = 0;
        nps = promoterPercentage - detractorPercentage
        const completedResponses = data.filter(response => response.completionStatus === 'completed');
        const msg = {
            totalPromoter: promoter,
            totalDetractor: Math.abs(detractor),
            totalNeutral: neutral,
            totalNPSResponse: data.length, 
            totalCompletedResponse: completedResponses.length,
            satisfactionRate: nps.toFixed(2)
        };
        res.status(200).json(msg);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAllNPSResponseStatus = async (req, res) => {
    try {
        const responses = await NpsResponse.find()
            .populate({
                path: 'studentId',
                select: 'name email phoneNo batchid',
                populate: {
                    path: 'batchid',
                    select: 'batchName programId',
                    populate: {
                        path: 'programId',
                        select: 'programName'
                    }
                }
            })
            .populate({
                path: 'npsFormId',
                select: 'npsFormCode'
            })
            .select('_id studentId completionStatus npsType');
            console.log('responses: ', responses)

            

        const formattedResponses = await Promise.all(responses.map(async response => {
            const npsForm = await Npsform.findById(response.npsFormId);
            const npsEndDate = npsForm.npsEndDate.toISOString().substring(0, 10);
            console.log('res:', response)
            
            return {
                name: response.studentId.name,
                userId: response.studentId._id,
                phoneNo: response.studentId.phoneNo,
                programName: response.studentId.batchid.programId.programName,
                batchName: response.studentId.batchid.batchName,
                batchId: response.studentId.batchid._id,
                npsFormCode: response.npsFormId.npsFormCode,
                responseId: response._id,
                completionStatus: response.completionStatus,
                npsFormId: response.npsFormId._id,
                npsType: response.npsType, // Adjusted to access npsType from npsData
                npsEndDate: npsEndDate
            };
        }));

        // console.log('Formatted Response: ', formattedResponses);
        res.json(formattedResponses);
    } catch (error) {
        console.error(error);
        throw new Error('Error occurred while fetching NPS responses');
    }
};


// --> /stat/npsreport

const getCurrentNpsReport = async (req, res) => {
    try {
        const activeNpsForms = await Npsform.find({
            formStatus: 'publish',
            npsEndDate: { $gt: new Date() } 
        }).populate({
            path: 'npsData.batchId',
            populate: { path: 'programId' }
        });

        if (activeNpsForms.length === 0) {
            return res.status(200).json({ msg: 'No active NPS forms found' });
        }

        let reports = [];

        // Iterate over each active NPS form
        for (const form of activeNpsForms) {
            const batches = form.npsData.map(data => data.batchId).flat();
            for (const batch of batches) {
                for (const npsType of ['start', 'mid', 'end']) {
                    // Find all responses for the current batch and NPS type
                    const responsesForBatch = await NpsResponse.find({
                        npsFormId: form._id,
                        batchId: batch._id,
                        npsType
                    });

                    const completedResponses = responsesForBatch.filter(response => response.completionStatus === 'completed');
                    
                    const totalResponsesCreated = responsesForBatch.length;
                    const totalCompletedResponses = completedResponses.length;
                    console.log('response: ',completedResponses)

                    if (totalResponsesCreated > 0) {
                        const npsScore = calculateNpsScore(completedResponses.map(r => r.responses).flat());
                        // const csatScore = calculateCSATScore(completedResponses.map(r => r.responses).flat())
                        const responsePercentage = (totalCompletedResponses / totalResponsesCreated * 100).toFixed(2);

                        reports.push({
                            npsFormName: form.npsFormName,
                            npsFormCode: form.npsFormCode,
                            npsEndDate: form.npsEndDate.toISOString().split('T')[0],
                            npsType,
                            programName: batch.programId.programName,
                            batchName: batch.batchName,
                            totalCompletedResponses: totalCompletedResponses,
                            totalResponsesCreated: totalResponsesCreated,
                            responsePercentage: responsePercentage + '%',
                            npsScore: npsScore.toFixed(2) + '%'                            
                        });
                    }
                }
            }
        }
        console.log('Reports Number: ', reports.length)
        let uniqueReports = removeDuplicates(reports)
        console.log('Unique Reports Number: ', uniqueReports.length)
        res.json(uniqueReports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occurred while generating NPS report', error });
    }
};



const getAllNpsReport = async (req, res) => {
    try {
        const activeNpsForms = await Npsform.find({
            formStatus: 'publish'
        }).populate({
            path: 'npsData.batchId',
            populate: { path: 'programId' }
        });

        if (activeNpsForms.length === 0) {
            return res.status(200).json({ msg: 'No NPS forms found' });
        }

        let reports = [];

        // Iterate over each active NPS form
        for (const form of activeNpsForms) {
            const batches = form.npsData.map(data => data.batchId).flat();
            for (const batch of batches) {
                for (const npsType of ['start', 'mid', 'end']) {
                    // Find all responses for the current batch and NPS type
                    const responsesForBatch = await NpsResponse.find({
                        npsFormId: form._id,
                        batchId: batch._id,
                        npsType
                    });

                    const completedResponses = responsesForBatch.filter(response => response.completionStatus === 'completed');
                    
                    const totalResponsesCreated = responsesForBatch.length;
                    const totalCompletedResponses = completedResponses.length;
                    console.log('response: ',completedResponses)

                    if (totalResponsesCreated > 0) {
                        const npsScore = calculateNpsScore(completedResponses.map(r => r.responses).flat());
                        // const csatScore = calculateCSATScore(completedResponses.map(r => r.responses).flat())
                        const responsePercentage = (totalCompletedResponses / totalResponsesCreated * 100).toFixed(2);

                        reports.push({
                            npsFormName: form.npsFormName,
                            npsFormCode: form.npsFormCode,
                            npsEndDate: form.npsEndDate.toISOString().split('T')[0],
                            npsType,
                            programName: batch.programId.programName,
                            batchName: batch.batchName,
                            totalCompletedResponses: totalCompletedResponses,
                            totalResponsesCreated: totalResponsesCreated,
                            responsePercentage: responsePercentage + '%',
                            npsScore: npsScore.toFixed(2) + '%'                            
                        });
                    }
                }
            }
        }
        console.log('Reports Number: ', reports.length)
        let uniqueReports = removeDuplicates(reports)
        console.log('Unique Reports Number: ', uniqueReports.length)
        res.json(uniqueReports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occurred while generating NPS report', error });
    }
};


function removeDuplicates(reports) {
    const uniqueReports = [];
    const seen = new Set();
  
    for (const report of reports) {
      // Create a unique identifier string
      const identifier = `${report.npsFormCode}-${report.npsType}-${report.batchName}-${report.programName}`;
  
      if (!seen.has(identifier)) {
        uniqueReports.push(report);
        seen.add(identifier);
      }
    }
  
    return uniqueReports;
  }


const calculateNpsScore = (responses) => {    
    
    let promoters = 0;
    let detractors = 0;
    let neutral = 0;

    responses.forEach(response => {
        if(response.questionType == 'nps'){
            console.log('[+] calculateNpsScore Responses: ', response.questionType)
            console.log('[+] Calculate NPS Score, responsevalue: ', response.responseVal)
            if (response.responseVal >= 9) {            
                promoters++;
            } else if (response.responseVal <= 6) {
                detractors++;
            }else {
                neutral++;
            }
        }        
    });
    console.log('[+] Promoter:  ', promoters)
    console.log('[+] Dectractor:  ', detractors)
    console.log('[+] Neutral:  ', neutral)
    let totalResponses = responses.flat().length;
    if (totalResponses === 0) return 0;
    let promoterPercentage = promoters*100/(promoters+detractors+neutral)
    let detractorPercentage = detractors*100/(promoters+detractors+neutral)
    console.log('[+] Promoter Percentage:  ', promoterPercentage)
    console.log('[+] Dectractor Percentage:  ', detractorPercentage)
    return promoterPercentage - detractorPercentage;
};
const calculateCSATScore = (responses) => {    
    
    let csatVal = 0

    responses.forEach(response => {
        if(response.questionType == 'csat'){
            csatVal = csatVal + response.responseVal
        }        
    });
  
    
    return Math.round(csatVal/responses.length,2);
};

const getNpsReportByBatchId = async (req,res) => {

}

module.exports = { getAllNpsReport, getNpsReportByBatchId, getAllNPSStat, 
    getAllNPSResponseStatus, getCurrentNpsReport }