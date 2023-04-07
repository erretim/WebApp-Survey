'use strict'

const db = require('./db');

// get all surveys
exports.listSurveys = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM surveys';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const surveys = rows.map((s) => ({ sid: s.sid, adminId: s.adminId, title: s.title, nResponses: s.nResponses }));
      resolve(surveys);
    });
  });
};

// get all surveys by admin
exports.listSurveysByAdmin = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM surveys where adminId=?';
    db.all(sql, [id], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const surveys = rows.map((s) => ({ sid: s.sid, adminId: s.adminId, title: s.title }));
      resolve(surveys);
    });
  });
};


exports.getMaxSid =()=>{
  return new Promise( (resolve,reject) =>{
    const sql= 'SELECT MAX (sid) as maxSid From surveys'
    db.get( sql,[], (err, row) =>{
      if(err){
        reject(err);
        return
      }
      resolve (row.maxSid);
    })
  });
};

exports.getMaxQid =()=>{
  return new Promise( (resolve,reject) =>{
    const sql= 'SELECT MAX (qid) as maxQid From questions'
    db.get( sql,[], (err, row) =>{
      if(err){
        reject(err);
        return
      }
      resolve (row.maxQid);
    })
  });
};

// add a new survey
exports.createSurvey = (survey, adminId) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO surveys(sid, adminId, title) VALUES(?, ?, ?)';
    db.run(sql, [survey.sid, adminId, survey.title], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};




// version #2 get all questions
exports.getQuestions = (sid) => {
 

  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM questions where sid=?';
    db.all(sql, [sid], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const questions = rows.map((q) => ({ qid: q.qid, sid: q.sid, title: q.title, min: q.min, max: (q.max===null ? undefined: q.max), position: q.position }));
      resolve(questions);
    });
  });
};

// add new question(s)
exports.addQuestions = (questions) => {

  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO questions (qid, sid, title, min, max, position) VALUES(?, ?, ?, ?, ?, ?) ';

    questions.forEach(q => {
      db.run(sql, [q.qid, q.sid, q.title, q.min, q.max, q.position], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      });

    });


  });
};






// get  closed answers by sid
exports.getClosedAnswersBySid = (sid) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM closedAnswers where sid=?';
    db.all(sql, [sid], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      // const closedAnswers = rows.map((a) => ({ aid: a.aid, qid: a.qid, title: a.title, sid: a.sid, adminId: a.adminId}));
      const closedAnswers = rows;
      resolve(closedAnswers);
    });
  });
};

//add new closed answer(s)
exports.addClosedAnswers = (closedAnswers) => {

  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO closedAnswers (qid, title, sid) VALUES(?, ?,?)';

    closedAnswers.forEach(a => {
      db.run(sql, [a.qid, a.title, a.sid], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      });

    });


  });
};


exports.createResponse = (sid, answers) => {

  return new Promise((resolve, reject) => {
    const sql1 = 'INSERT INTO responses (sid, answers) VALUES(?, ?)';
    const sql2 = 'UPDATE surveys SET nResponses=nResponses+1 WHERE sid=?';

    db.serialize( ()=>{
      db.run(sql1, [sid, answers], function (err) {

        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      });

      db.run(sql2, [sid], function (err){
        if (err){
          reject(err);
          return;
        }
        resolve(this.lastID);
      })


    });
  



  });
};


exports.listOfResponsesBySid = (sid) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT answers FROM responses where sid=?';
    db.all(sql, [sid], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};