import {
  Button,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import "./npsresponse.css";
import axios from "axios";
import { npsServiceUrl } from "../../../api/url";
import { useParams } from "react-router-dom";

export default function Npsresponse() {
  const [loading, setLoading] = useState(true);
  const [npsData, setNpsData] = useState(null);
  const [alignmentMap, setAlignmentMap] = useState({});
  const [tagTypeMap, setTagTypeMap] = useState({});
  const [commentTypeMap, setCommentTypeMap] = useState({});
  const [tagSelectionMap, setTagSelectionMap] = useState({});
  const { userId } = useParams();
  const [formState, setFormState] = useState("pending");
  const [submission, setSubmission] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    npsFormId: "",
    completionStatus: "completed",
    responses: [
      {
        questionId: "",
        questionType: "",
        responseVal: "",
        responseComment: "",
        responseTagType: "",
        responseTag: [],
      },
    ],
  });

  const handleSubmit = async () => {
    const responseArray = [];
    const formCodeId = userId.substring(userId.length - 6);
    const studentId = userId.slice(0, -6);
    console.log('[+] commentTypeMap', commentTypeMap)
    npsData.questions.forEach((question, index) => {
      console.log('[+] commentTypeMap for each question', commentTypeMap[index])
      const response = {
        questionId: question._id, // Assuming you have a unique question ID
        questionType: question.questionType.npsOrCsat,
        responseVal: alignmentMap[index],
        responseComment: commentTypeMap[index] || "", // You can add logic here to collect response comments if needed
        responseTagType: tagTypeMap[index] || "NA",
        responseTag: tagSelectionMap[index] || [],
      };
      responseArray.push(response);
    });

    const requestData = {
      studentId: studentId,
      npsFormId: npsData._id, // Assuming you have a unique form ID
      completionStatus: "completed",
      responses: responseArray,
    };

    try {
      console.log("Request Data: ", requestData);
      const res = await axios.put(`${npsServiceUrl}/npsresponse/${userId}`, requestData);
      console.log(res.data);
      setSubmission(true)
    } catch (error) {
      console.error("Error submitting response:", error);
      // Handle error
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${npsServiceUrl}/npsresponse/form/${userId}`
        );
        console.log("Data for the respon: ", res.data[0]);
        if (res.data[0].completionStatus === "pending") {
          const response = await axios.get(
            `${npsServiceUrl}/npsform/${res.data[0].npsFormId}`
          );
          setNpsData(response.data);
        } else {
          setFormState("completed");
        }
      } catch (error) {
        console.log(error.message);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  
  const handleAlignmentChange = (questionIndex, value, iscomment) => {    
    console.log('Inside handleAlignmentChange and value is: ', value)
    console.log('Question Index is: ', questionIndex)
    setAlignmentMap({ ...alignmentMap, [questionIndex]: value });
    const currentQuestion = npsData.questions[questionIndex];
    console.log('npsOrCsat: ',currentQuestion.questionType.npsOrCsat)
    console.log('commentTypeMap:',commentTypeMap)
    
    
    if (currentQuestion.questionType.npsOrCsat === "csat") {
      const tagIndex = value - 1;
      // if(iscomment === true){
      //   // console.log
      //   setCommentTypeMap({ ...commentTypeMap, [questionIndex]: value });
      // }
      if (tagIndex >= 0 && tagIndex < 5) {
        if (value === 3) {
          setTagTypeMap({ ...tagTypeMap, [questionIndex]: "neutralTags" });
        } else if (value === 1 || value === 2) {
          setTagTypeMap({ ...tagTypeMap, [questionIndex]: "detractorTags" });
        } else if (value === 4 || value === 5) {
          setTagTypeMap({ ...tagTypeMap, [questionIndex]: "promoterTags" });
        }
      } else {
        setTagTypeMap({ ...tagTypeMap, [questionIndex]: null });
      }
    }
    if (currentQuestion.questionType.npsOrCsat === "na") {
      const updatedFormData = { ...formData };
      setCommentTypeMap({ ...commentTypeMap, [questionIndex]: value });
      setFormData(updatedFormData);
    }
  };

  const handleTagSelectionChange = (questionIndex, selectedTag) => {
    setTagSelectionMap({ ...tagSelectionMap, [questionIndex]: selectedTag });
  };


  const handleCommentAlignmentChange = (questionIndex, value, iscomment) => {    
    console.log('Inside handleAlignmentChange and value is: ', value)
    console.log('Question Index is: ', questionIndex)
    setAlignmentMap({ ...alignmentMap, [questionIndex]: value });
    console.log('commentTypeMap:',commentTypeMap)

    if(iscomment === true){
      // console.log
      setCommentTypeMap({ ...commentTypeMap, [questionIndex-100]: value });
    }
    
  };

  const getCsatLabel = (value) => {
    switch (value) {
      case 1:
        return "Strongly Disagree";
      case 2:
        return "Somewhat Disagree";
      case 3:
        return "Neither Agree nor Disagree";
      case 4:
        return "Somewhat Agree";
      case 5:
        return "Strongly Agree";
      default:
        return "";
    }
  };

  const getNPSLabel = (value) => {
    switch (value) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 3:
        return 3;
      case 4:
        return 4;
      case 5:
        return 5;
      case 6:
        return 6;
      case 7:
        return 7;
      case 8:
        return 8;
      case 9:
        return 9;
      case 10:
        return 10;
      default:
        return "";
    }
  };

  if (!loading) {
    npsData &&
      npsData.questions &&
      npsData.questions.map((question, index) => {
        // console.log('Questions: ', question)
        // console.log('tag selected: ',tagSelectionMap)
        return 1;
      });
  }
  if (formState === "completed") {
    return <>Form has already been submitted...</>;
  }
  if (submission === true) {
    return (
      <div className="main">
        Response Submitted Successfully.<br></br>
        Thank you for your response.
      </div>
    );
  } else {
    return (
      <div className="main">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div>
            {npsData &&
              npsData.questions &&
              npsData.questions.map((question, index) => (
                <div
                  key={index}
                  className={
                    question.questionType.npsOrCsat === "nps" ? "nps" : "csat"
                  }
                >
                  <h3>{question.question}</h3>
                  {question.questionType.npsOrCsat === "nps" ? (
                    <ToggleButtonGroup
                      color="primary"
                      value={alignmentMap[index] || null}
                      exclusive
                      onChange={(event, value) =>
                        handleAlignmentChange(index, value)
                      }
                      aria-label="NPS Platform"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                        <ToggleButton key={value} value={value}>
                          {getNPSLabel(value)}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  ) : question.questionType.npsOrCsat === "na" ? (
                    <TextField
                      key={index}
                      placeholder="Enter your feedback"
                      multiline
                      fullWidth
                      variant="outlined"
                      onChange={(event) =>
                        handleCommentAlignmentChange(index+100, event.target.value, true)
                      }
                    />
                  ) : (
                    <ToggleButtonGroup
                      color="primary"
                      value={alignmentMap[index] || null}
                      exclusive
                      onChange={(event, value) =>
                        handleAlignmentChange(index, value)
                      }
                      aria-label="CSAT Platform"
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <ToggleButton key={value} value={value}>
                          {getCsatLabel(value)}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  )}
                  {tagTypeMap[index] && (
                    <div className="subtags">
                      <h3>
                        {tagTypeMap[index] === "promoterTags"
                          ? "Positive Feedback"
                          : tagTypeMap[index] === "neutralTags"
                          ? "Neutral Feedback"
                          : "Negative Feedback"}
                      </h3>
                      <ToggleButtonGroup
                        color="primary"
                        value={tagSelectionMap[index] || null}
                        onChange={(event, selectedTag) =>
                          handleTagSelectionChange(index, selectedTag)
                        }
                        aria-label="CSAT Subtags"
                      >
                        {/* {console.log('npsData:', npsData)}
                    {console.log('npsData.questions:', npsData && npsData.questions)}
                    {console.log('index:', index)}
                    {console.log('tagTypeMap[index]:', tagTypeMap[index])} */}

                        {npsData.questions[index][tagTypeMap[index]].map(
                          (tag, tagIndex) => {
                            // console.log("Tag: ", tag);
                            return (
                              <ToggleButton key={tagIndex} value={tag}>
                                {tag}
                              </ToggleButton>
                            );
                          }
                        )}
                      </ToggleButtonGroup>
                    </div>
                  )}
                  {/* {console.log(
                    `Tag selected for the index ${index}: `,
                    tagSelectionMap[index]
                  )} */}
                  {tagSelectionMap[index] &&
                    tagSelectionMap[index].indexOf("Any other reason") !==
                      -1 && (
                      <TextField
                        key={index}
                        placeholder="Enter the other reasons"
                        multiline
                        fullWidth
                        variant="outlined"
                        onChange={(event) =>
                          handleCommentAlignmentChange(index+100, event.target.value, true)
                        }
                      />
                    )}
                </div>
              ))}
            <div className="btn-center">
              <Button
                variant="contained"
                color="success"
                onClick={handleSubmit}
                // variant="contained"
                // color="primary"
                className="form-button"
                sx={{ mt: 2, ml: 2 }}
              >
                Submit
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
}
