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

AWS.config.update({
    accessKeyId: process.env.AWS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
  });

  const ses = new AWS.SES({ region: process.env.AWS_REGION });

  const sendEmail = async (to, link) => {
    const params = {
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Text: {
            Data: `Your survey link is: ${link}`,
          },
        },
        Subject: {
          Data: "Survey Link",
        },
      },
      Source: "noreply@prashantdey.in",
    };
  
    try {
      await ses.sendEmail(params).promise();
      console.log(`Link Email sent successfully to ${to}`);
    } catch (error) {
      console.error("Error sending Link email:", error);
      throw error;
    }
  };
  

const fetchAllResponses = async (req,res) => {
    try{
        const npsResponses = await NpsResponse.find();
        res.status(200).json(npsResponses);
    }catch(error){
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const createNpsResponseForBatch = async (req, res) => {
    try {
        const { batchId, formId, attendancePercentageThreshold, assignmentSubmissionThreshold } = req.body;

        const students = await Student.find({ batchid: batchId });

        const formDetails = await Npsform.findById(formId);

        if (!formDetails) {
            return res.status(404).json({ error: 'Form not found' });
        }

        const questions = await Question.find({ _id: { $in: formDetails.questions } });

        const npsResponses = [];
        for (const student of students) {
            const academicData = await Studentacademic.findOne({ studentid: student._id });

            if (!academicData) {
                continue; 
            }

            let createResponse = true;
            if (attendancePercentageThreshold && parsePercentage(academicData.attendancePercentage) < attendancePercentageThreshold) {
                createResponse = false;
            }
            if (assignmentSubmissionThreshold && parsePercentage(academicData.assignmentSubmission) < assignmentSubmissionThreshold) {
                createResponse = false;
            }
            const existingResponse = await NpsResponse.findOne({
                studentId: student._id,
                npsFormId: formId
            });

            if (existingResponse) {
                console.log(`Response already exists for studentId ${student._id} and formId ${formId}`);
                continue; // Skip this student since the response already exists
            }

            if (createResponse) {
                const responses = questions.map(question => ({
                    questionId: question._id,
                    questionType: question.questionType,
                    responseVal: null,
                    responseComment: '',
                    responseTagType: 'NA',
                    responseTag: []
                }));

                const npsResponse = new NpsResponse({
                    studentId: student._id,
                    npsFormId: formId,
                    npsFormCode: formDetails.npsFormCode,
                    npsType: formDetails.npsType,
                    completionStatus: 'pending',
                    responses: responses,
                    enrolledAt: student.createdAt 
                });
                await npsResponse.save(); 
                
                const studentEmail = await Student.findById(student._id)
                console.log('Email: ', studentEmail.email)
                const surveyLink = `${process.env.SURVEY_LINK}/${student._id}`
                await sendEmail(studentEmail.email, surveyLink);
                npsResponses.push(npsResponse);
            }
        }

        res.status(201).json({ msg: 'Npsresponse entries created successfully.', npsResponses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const parsePercentage = (percentageString) => {
    return parseFloat(percentageString.replace('%', ''));
};

const getNpsResponses = async (req, res) => {
    try {
        const npsResponses = await NpsResponse.find()
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
            .select('studentId npsType completionStatus');
        // const npsResponses = await NpsResponse.find()
        //     .populate('npsFormId')
        console.log(npsResponses)
        res.json(npsResponses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getResponseByUserId = async (req,res) => {
    try{
        const responseId = req.params.userId;
        console.log('responseId:',responseId)
        // const userId = req.params.userId;        
        const formRes = await NpsResponse.find({responseCode: responseId });
        console.log(formRes)
        if (!formRes) {
            return res.status(404).json({ error: 'Form not found' });
        }
        res.status(200).json(formRes);
    }catch(error){
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const getDetailedResponseByResponseId = async (req, res) => {
    try {
        const responseId = req.params.responseId;

        // Find the response by response ID
        const response = await NpsResponse.findById(responseId)
            .populate({
                path: 'studentId',
                select: 'name email phoneNo'
            })
            .populate({
                path: 'npsFormId',
                select: 'npsFormCode npsType'
            })
            .select('completionStatus responses');
        console.log('response: ',response)

        if (!response) {
            return res.status(404).json({ error: 'Response not found' });
        }

        // Populate questions for each response
        const populatedResponses = await Promise.all(response.responses.map(async item => {
            const populatedQuestion = await Question.populate(item, { path: 'questionId', select: 'questionType question' });
            return {
                questionType: item.questionId.questionType,
                question: populatedQuestion.questionId.question,
                responseVal: item.responseVal,
                responseComment: item.responseComment,
                responseTagType: item.responseTagType,
                responseTag: item.responseTag
            };
        }));

        // Construct detailed response data
        const detailedResponse = {
            name: response.studentId.name,
            email: response.studentId.email,
            phoneNo: response.studentId.phoneNo,
            completionStatus: response.completionStatus,
            npsType: response.npsFormId.npsType,
            npsFormCode: response.npsFormId.npsFormCode,
            questions: populatedResponses
        };

        res.json(detailedResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




const getResponseById = async (req,res) => {
    try{
        const resId = req.params.id;
        const formRes = await NpsResponse.findById(resId);
        if (!formRes) {
            return res.status(404).json({ error: 'Form not found' });
        }
        res.status(200).json(formRes);
    }catch(error){
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getAllNPSStat = async (req, res) => {
    try {
        const data = await NpsResponse.find();
        const completedResponses = data.filter(response => response.completionStatus === 'completed');
        const msg = {
            totalNPSResponse: data.length, 
            totalCompletedResponse: completedResponses.length 
        };
        res.status(200).json(msg);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
};


const postResendEmail = async (req,res) => {
    try{
        const responseId = req.body.responseId
        const userId = req.body.userId
        console.log('res: ', responseId)
        console.log('usrId: ', userId)
        const resD = await Student.findById(userId)
        console.log('Email: ', resD.email)
        email = resD.email
        const data = await NpsResponse.findById(responseId)
        const surveyLink = `${process.env.SURVEY_LINK}/${data.responseCode}`
        console.log('surveyLink: ', surveyLink)
        
        sendEmail(email,surveyLink)
        res.status(200).json({msg: "Email Sent"})
    }catch(error){
        console.error(error);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
}

const updateResponseById = async (req, res) => {
    try {
        const responseId = req.params.id;
        // const formCodeId = uniqueId.substring(uniqueId.length - 6);
        // const sId = uniqueId.slice(0, -6);
        // console.log(formCodeId)
        // console.log(sId)
        console.log(req.body)
        const { studentId, npsFormId, completionStatus, responses } = req.body;
        console.log('request Sid:',studentId)

        // Check if the studentId in the request body matches the one from the parameters
        // if (sId !== studentId) {
        //     return res.status(400).json({ error: 'StudentId in the request body does not match the one in parameters' });
        // }

        // Check if the studentId and npsFormId are valid ObjectId strings
        // if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(npsFormId)) {
        //     return res.status(400).json({ error: 'Invalid ObjectId' });
        // }

        // Find the existing response
        const existingResponse = await NpsResponse.findOne({ responseCode: responseId});

        if (existingResponse) {
            // If completionStatus is already "completed", do not update
            if (existingResponse.completionStatus === 'completed') {
                return res.status(200).json({ msg: "Response already marked as completed" });
            }

            // Otherwise, update the response
            existingResponse.completionStatus = completionStatus;
            existingResponse.responses = responses;

            // Save the updated response
            await existingResponse.save();

            return res.status(200).json({ msg: "Response Updated" });
        } else {
            // Create a new response
            const newResponse = new NpsResponse({
                studentId,
                npsFormId,
                completionStatus,
                responses
            });

            // Save the new response
            await newResponse.save();

            return res.status(200).json({ msg: "Response Added" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


// const addResponseById = async (req,res) => {
//     try{

//     }catch(error){
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }

const sampleTry = async(req,res)=>{
    try{
        formId = req.body.formId
        console.log(formId)
        const formDetails = await Npsform.findById(formId).populate('questions')
        console.log(formDetails)
        res.json(formDetails)

    }catch(err){
        res.send({msg: 'err'})
    }
}

module.exports = { fetchAllResponses, getResponseById, 
    getNpsResponses, createNpsResponseForBatch,
    sampleTry, getResponseByUserId, updateResponseById, getAllNPSStat,
    postResendEmail, getDetailedResponseByResponseId }
