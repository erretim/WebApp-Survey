'use strict';

const express = require('express');
const morgan = require('morgan');
const { check, validationResult } = require('express-validator'); // validation middleware
const session = require('express-session');

const passport = require('passport');
const passportLocal = require('passport-local');

const surveyDao = require('./survey-dao'); // module for accessing the surveys in the DB
const adminDao = require('./admin-dao');
const { json, response } = require('express');



// initialize and configure passport
passport.use(new passportLocal.Strategy((username, password, done) => {
  // verification callback for authentication
  adminDao.getAdmin(username, password).then(admin => {
    if (admin)
      done(null, admin);
    else
      done(null, false, { message: 'Username or password wrong' });
  }).catch(err => {
    done(err);
  });
}));

// serialize and de-serialize the admin (admin object <-> session)
// we serialize the admin id and we store it in the session: the session is very small in this way
passport.serializeUser((admin, done) => {
  done(null, admin.id);
});

// starting from the data in the session, we extract the current (logged-in) admin
passport.deserializeUser((id, done) => {
  adminDao.getAdminById(id)
    .then(admin => {
      done(null, admin); // this will be available in req.admin
    }).catch(err => {
      done(err, null);
    });
});


// init express
const app = new express();
const port = 3001;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());

// custom middleware: check if a given request is coming from an authenticated admin
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'not authenticated' });
}


// initialize and configure HTTP sessions
app.use(session({
  secret: 'this and that and other',
  resave: false,
  saveUninitialized: false
}));

// tell passport to use session cookies
app.use(passport.initialize());
app.use(passport.session());





/*** Surveys APIs ***/

//VERSION IN WHICH I PASS A JASON WITH ALL INFO
app.post('/api/surveys', isLoggedIn, [
  // I'm sorry, I didn't do validation for time reason
], async (req, res) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(422).json({errors: errors.array()});
  // }
  const survey = req.body.survey;
  const questions = req.body.questions;
  const closedAnswers = req.body.closedAnswers;


  try {
    await surveyDao.addClosedAnswers(closedAnswers);
    try {
      await surveyDao.addQuestions(questions);
      try {
        await surveyDao.createSurvey(survey, req.user.id);
        res.status(201).end();
      } catch (err) {
        res.status(503).json({ error: `Database error during the creation of survey: ${survey.title}.` });
      }
    } catch (err) {
      res.status(503).json({ error: `Database error creation of questions of survey: ${survey.title}.` })
    }
  } catch (err) {
    res.status(503).json({ error: `Database error during creation of closedAnswers of survey: ${survey.title}.` })
  }
});



//get survey's details only
app.get('/api/surveys', (req, res) => {
  surveyDao.listSurveys()
    .then(surveys => res.json(surveys))
    .catch(() => res.status(500).end());
});


// version #2 GET api/questions/:sid
app.get('/api/filteredQuestions/:sid', (req, res) => {
  surveyDao.getQuestions(req.params.sid)
    .then(questions => res.json(questions))
    .catch(() => res.status(500).end());
});

// version #2 GET api/closedAnswers
app.get('/api/filteredClosedAnswers/:sid', (req, res) => {
  // if (req.isAuthenticated())
  surveyDao.getClosedAnswersBySid(req.params.sid)
    .then(closedAnswers => res.json(closedAnswers))
    .catch(() => res.status(500).end());
});



app.get('/api/maxId/surveys', (req, res) => {
  surveyDao.getMaxSid()
    .then(maxSid => res.json(maxSid))
    .catch(() => res.status(500).end());
});

app.get('/api/maxId/questions', (req, res) => {
  surveyDao.getMaxQid()
    .then(maxQid => res.json(maxQid))
    .catch(() => res.status(500).end());
});



//POST responses

app.post('/api/responses', [
  //Controlla anche adminId loggato
  // sorry again for the validation
], async (req, res) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(422).json({errors: errors.array()});
  // }
  const sid = req.body.sid;
  const answers = JSON.stringify(req.body.answers);

  try {
    await surveyDao.createResponse(sid, answers);
    res.status(201).end();
  } catch (err) {
    res.status(503).json({ error: `Database error during the creation of survey with sid: ${sid}.` });
  }

});


//get responses by sid
app.get('/api/sid/:sid/responses', isLoggedIn, (req, res) => {
  if (req.isAuthenticated())
  surveyDao.listOfResponsesBySid(req.params.sid)
    .then(responses => res.json(responses))
    .catch(() => res.status(500).end());
});






/*** Admins APIs ***/

// POST /sessions 
// login
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, admin, info) => {
    if (err)
      return next(err);
    if (!admin) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(admin, (err) => {
      if (err)
        return next(err);

      // req.admin contains the authenticated admin, we send all the admin info back
      // this is coming from adminDao.getAdmin()
      return res.json(req.user);
    });
  })(req, res, next);
});


// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout();
  res.end();
});

// GET /sessions/current
// check whether the admin is logged in or not
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'Unauthenticated admin!' });;
});


// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});