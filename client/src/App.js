import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch, Link } from 'react-router-dom';

import { Container, Row, Card } from 'react-bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css"

import API from './API';
import Navigation from './components/Navigation';
import { LoginForm } from './components/LoginComponents';
import { SurveyTable } from './components/SurveyComponents'
import { ResponseForm } from './components/ResponseForm';
import { SurveyForm } from './components/SurveyForm'



function App() {


  const [loggedIn, setLoggedIn] = useState(false); // at the beginning, no user is logged in
  const [admin, setAdmin] = useState({});
  const [dirty, setDirty] = useState(true);
  const [surveys, setSurveys] = useState([]);
  const [responses, setResponses] = useState([]);
  const [currentSurvey, setCurrentSurvey] = useState();


  useEffect(() => {
    setDirty(false);
  }, [dirty])




  useEffect(() => {
    const getSurveys = async () => {
      const surveys = await API.getAllSurveys();
      setSurveys(surveys);
      // setDirty(true);  
    };
    // if (loggedIn)
    getSurveys()
      .catch(err => {
        // setMessage({ msg: "Impossible to load your surveys! Please, try again later...", type: 'danger' });
        console.error(err);
      });
    setDirty(true);
  }, [dirty]);




  //load responses by sid
  useEffect(() => {
    if (currentSurvey !== undefined) {
      const getResponses = async () => {
        const responses = await API.getResponsesBySid(currentSurvey.sid);
        setResponses(responses);  
      };
      // if (loggedIn)
      getResponses()
        .catch(err => {
          // setMessage({ msg: "Impossible to load your surveys! Please, try again later...", type: 'danger' });
          console.error(err);
        });
    }
  }, [currentSurvey]);

  const addSurvey = (survey, questions, closedAnswers) => {

    const createSurvey = async () => {
      await API.addFullSurvey(survey, questions, closedAnswers);
      setSurveys(old => [...old, survey])
    }

    createSurvey().catch(err => { console.error(err) })
    setDirty(true);
  }




  const doLogIn = async (credentials) => {
    try {
      await API.logIn(credentials);
      const admin = await API.getAdminInfo();

      setAdmin(admin);

      setLoggedIn(true);

      // console.log(`login effettuato ${admin.username}`);
      // setMessage({ msg: `Welcome, ${user}!`, type: 'success' });
    } catch (err) {
      // setMessage({ msg: err, type: 'danger' });
      console.log('error during login');
    }
  }

  const doLogOut = async () => {
    try {
      await API.logOut();
      setLoggedIn(false);
      setAdmin(undefined);

      // clean up everything

      //To Do: clear all states
    } catch (err) {
      console.log(err);
    }
  }


  return (
    <Router>


      <Container id="mainContainer">
        <Navigation admin={admin} loggedIn={loggedIn} doLogOut={doLogOut} />



        <Switch>



          <Route path="/Create-a-new-survey" render={() =>
            <>
              {loggedIn ? <SurveyForm addSurvey={addSurvey} admin={admin} /> : <Redirect to='/login' />}
            </>
          } />




          {responses.map(r => <Route key={r} path={`/View-responses/${responses.indexOf(r)}`} render={() =>
            <>
              {loggedIn ?
                <>

                  <ResponseForm loggedIn={loggedIn}
                    survey={currentSurvey}
                    response={responses[responses.indexOf(r)]}
                    responsesLength={responses.length}

                  />
                </>

                :
                <Redirect to='/login' />

              }
            </>

          } />

          )}



          {surveys.map(s => <Route key={s.sid} path={`/fill-out-survey/${s.sid}`} render={() =>
            <ResponseForm survey={s} loggedIn={loggedIn}
            />}
          />)}




          <Route path="/Main" render={() =>
            <>
              {loggedIn ?

                <>

                  <InfoHomeAdmin admin={admin} />


                </>

                :
                <>
                  <InfoHomeUser />
                </>}


              <SurveyTable
                loggedIn={loggedIn}
                admin={admin}
                surveys={surveys}
                setCurrentSurvey={setCurrentSurvey}
                responses={responses}
              />
            </>
          } />

          <Route path="/login" render={() =>
            <Row className="justify-content-md-center">
              <LoginForm login={doLogIn} />
              {loggedIn ? <Redirect to="/Main" /> : <Redirect to="/login" />}
            </Row>
          } />




          {/* <Route path="/Personal-Area" render={() =>
            <>
              {loggedIn ?
                <>
                  <Row >
                    <h1>ciao sono {admin}</h1>
                  </Row>
                </>
                : <Redirect to="/Compile-a-Survey" />}
            </>
          } /> */}

          <Route exact path="/" render={() =>
            <><Redirect to='/Main' /></>

          } />

          <Route path='*'> 404</Route>

        </Switch>

      </Container>

    </Router>
  );
}

export default App;



function InfoHomeAdmin(props) {
  const { admin } = props;
  return (
    <>
      <Card body>

        <p> Hello {admin.username},</p>
        <ul>
          <li>you can check responses by clicking on a survey's title</li>
          or
          <li>Create a new survey by clicking  <Link to='/Create-a-new-survey'> HERE </Link> </li>
        </ul>

      </Card>
    </>
  )
}

function InfoHomeUser(props) {

  return (
    <>
      <Card body>

        <p> Hello, please click on one of the following titles to start completing a survey. </p>

      </Card>
    </>
  )
}