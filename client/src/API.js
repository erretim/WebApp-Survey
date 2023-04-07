import Survey from "./models/Survey";
import Admin from "./models/Admin"
import Question from "./models/Question";
import ClosedAnswer from "./models/ClosedAnswer";







function addFullSurvey(survey, questions, closedAnswers) {
  // call: POST /api/surveys
  return new Promise((resolve, reject) => {
    
    fetch('/api/surveys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({"survey": survey, "questions": questions, "closedAnswers": closedAnswers}),
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}





async function logIn(credentials) {
  let response = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const admin = await response.json();
    return admin.username;
  }
  else {
    try {
      const errDetail = await response.json();
      throw errDetail.message;
    }
    catch (err) {
      throw err;
    }
  }
}

async function logOut() {
  await fetch('/api/sessions/current', { method: 'DELETE' });
}

async function getAdminInfo() {

  const response = await fetch('/api/sessions/current');
  const adminInfo = await response.json();
  if (response.ok) {
    return Admin.from(adminInfo);
  } else {
      // throw userInfo;  
  }
}





async function getAllSurveys() {
  // call: GET /api/surveys
  const response = await fetch('/api/surveys');
  const surveysJson = await response.json();
  if (response.ok) {
    return surveysJson.map((s) => Survey.from(s));
  } else {
    throw surveysJson;  
  }
}



async function getSurveysMaxId(){
  const response =await fetch('/api/maxId/surveys');
  const maxSidJson= await response.json();
  if (response.ok){
    return maxSidJson;
  }else 
    throw maxSidJson;
}

async function getQuestionsMaxId(){
  const response =await fetch('/api/maxId/questions');
  const maxQidJson= await response.json();
  if (response.ok){
    return maxQidJson;
  }else 
    throw maxQidJson;
}





//version #2 getQuestions

async function getQuestionsBySid(sid) {
  // call: GET /api/questions/:sid
  const response = await fetch('/api/filteredQuestions/'+sid);
  const questionsJson = await response.json();
  if (response.ok) {
    return questionsJson.map((q) => Question.from(q));
  } else {
    throw questionsJson;  // an object with the error coming from the server
  }
}


// version 2 get all closedAnswers

async function getClosedAnswersBySid(sid) {
  // call: GET /api/closedAnswers
  const response = await fetch('/api/filteredClosedAnswers/'+sid);
  const closedAnswersJson = await response.json();
  if (response.ok) {
    return closedAnswersJson.map((a) => ClosedAnswer.from(a));
  } else {
    throw closedAnswersJson;  // an object with the error coming from the server
  }
}





function addResponse(sid, answers) {
  // call: POST /api/surveys
  return new Promise((resolve, reject) => {
    
    fetch('/api/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({"sid": sid, "answers": (answers)}),
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}


async function getResponsesBySid(sid) {
  // call: GET /api/questions/:sid
  const response = await fetch('/api/sid/'+ sid +'/responses');
  const responses = await response.json();
  if (response.ok) {
 
  
    return responses.map((r) =>  JSON.parse(r.answers));

  } else {
    throw responses;  // an object with the error coming from the server
  }
}

const API = { getResponsesBySid, addResponse, logIn, logOut, getAdminInfo, addFullSurvey, getAllSurveys, getSurveysMaxId, getQuestionsMaxId, getQuestionsBySid, getClosedAnswersBySid};
export default API;
