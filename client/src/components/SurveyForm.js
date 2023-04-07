import { useState, useEffect } from 'react';
import { Form, Container, Card, Row, Col, Button, Alert} from 'react-bootstrap'

import { Link, Redirect } from 'react-router-dom';
import API from '../API';
import Survey from '../models/Survey';

import { QuestionComponent } from './QuestionComponents'
import { QuestionForm} from './QuestionForm'

function SurveyForm(props) {
    const { addSurvey, admin } = props;

    const [surveyTitle, setSurveyTitle] = useState('');
    const [questions, setQuestions] = useState([]); // all questions that will be part of this survey
    const [closedAnswers, setClosedAnswers] = useState([]); // all answers that will be part of this survey
    const [sid, setSid] = useState();
    const [qid, setQid] = useState();
    const [submitted, setSubmitted] = useState(false);
    const readMode=false;
    const [errorMessagesSurvey, setErrorMessagesSurvey]=useState([]);
    const [errorMessagesQuestions, setErrorMessagesQuestions]=useState([]);



    useEffect(() => {
        const promises = [API.getSurveysMaxId(), API.getQuestionsMaxId()];
        Promise.all(promises).then(
            ([maxSid, maxQid]) => {
                setSid(maxSid + 1);
                setQid(maxQid + 1);
            }
        ).catch(err => {
            console.error("Could not get maximum sid or qid");
        });
    }, []);

    const deleteQuestion = (qid) => {
        setClosedAnswers(old => old.filter(a => a.qid !== qid));
        setQuestions(old => old.filter(q => q.qid !== qid));
    }


    const handlePosition = (question, direction) => {
        const otherQuestion = direction === 'down' ? questions[question.position + 1] : questions[question.position - 1];
        setQuestions(old => old.map(q => q.qid === otherQuestion.qid ? { ...{ ...otherQuestion, ...{ position: question.position } } } : q));
        setQuestions(old => old.map(q => q.qid === question.qid ? { ...{ ...question }, ...{ position: otherQuestion.position } } : q));
    }



    const handleSubmit = () => {
        setErrorMessagesSurvey([]);
        let valid=true;
    
        if(surveyTitle.length===0){
            valid=false;
            setErrorMessagesSurvey( old=>[...old, "Must instert survey title"])
        }

        if(questions.length===0){
            valid=false;
            setErrorMessagesSurvey( old=>[...old, "Must instert at least a question"])

        }
        
      
       if(valid){
        const newSurvey = new Survey(sid, admin.id, surveyTitle, 0);
         addSurvey(newSurvey, questions, closedAnswers);
         setSubmitted(true);
    }
    }

    console.log(surveyTitle);
    console.log(questions);
    console.log(closedAnswers);


    return (
        <>{submitted? <Redirect to='/Main' /> :
            <Container >

                {errorMessagesSurvey.map(error=> <AlertComponent key={error} errorMessage={error}/>)}

                <Form.Group controlid="form-survey-title">
                    <Form.Label><h4>Survey Title</h4> </Form.Label>
                    <Form.Control type='text' value={surveyTitle} onChange={ev => setSurveyTitle(ev.target.value)} placeholder="Insert Survey title" />
                </Form.Group>

                <QuestionForm
                    questionsLength={questions.length}
                    closedAnswers={closedAnswers}
                    setClosedAnswers={setClosedAnswers}
                    setQuestions={setQuestions}
                    sid={sid}
                    qid={qid}
                    setQid={setQid}
                    setErrorMessagesQuestions={setErrorMessagesQuestions}
                />


                {errorMessagesQuestions.map(err=> <AlertComponent key={err} errorMessage={err}/>)}

                {questions.length !== 0 && (
                    <Info />
                )}

                {questions.sort((q1, q2) => q1.position - q2.position).map((q) =>
                    <QuestionComponent key={q.qid} closedAnswers={closedAnswers.filter(a => a.qid === q.qid)} question={q} numQuestions={questions.length}
                        deleteQuestion={deleteQuestion} handlePosition={handlePosition} loggedIn={true} readMode={readMode}/>)}



                <Row className='mt-3'>
                    <Col>
                        <Link to='/main'><Button variant='danger'>Cancel</Button></Link>
                    </Col>
                    <Col className='align-end'>
                        <Button variant='success' onClick={() => handleSubmit()}> Save</Button>
                    </Col>
                </Row>
            </Container>
        }</>

    )
}

export { SurveyForm }



function Info() {

    return (
        <>
            <Card id="instructionsCard" body>
                <h5> Below you can see how your survey will appear</h5>
                <h6>Now you can:</h6>
                <ul>
                    <li>Make your survey public by clicking on "Save"</li>
                    <li>Add a new question by filling again the question fields </li>
                    <li>Delete a question</li>
                    <li>Change the order of questions by clicking on ↓ ↑</li>
                </ul>
                <h6>Note: after publication will no longer be allowed to make changes to the survey.</h6>
            </Card>
        </>
    )
}


function AlertComponent(props) {

    const { errorMessage } = props;

    const [show, setShow] = useState(true);

    if (show) {
        return (
            <Alert variant="danger" onClose={() => setShow(false)} dismissible>
                <Alert.Heading>Oops, you got an error! :(</Alert.Heading>
                <p>
                    {errorMessage}
                </p>
            </Alert>
        );
    }
    // return<></>;
    return <Button variant='danger' onClick={() => setShow(true)}>Show Alert again</Button>;
}