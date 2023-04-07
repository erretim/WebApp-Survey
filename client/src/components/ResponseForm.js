import { useEffect, useState } from 'react';
import { Container, Button, Row, Col, Form, Alert } from 'react-bootstrap';
import { Link, Redirect, useLocation } from 'react-router-dom'

import { QuestionComponent } from './QuestionComponents'

import API from '../API'




function ResponseForm(props) {
    // const { survey, questions, closedAnswers, loggedIn } = props;

    const { survey, loggedIn, response, responsesLength } = props;


    const location = useLocation();
    const readMode = location.state ? true : false;

    const [closedAnswers, setClosedAnswers] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]);
    const [userName, setUserName] = useState(location.state ? response[0].ans : '');
    const [errorMessages, setErrorMessages] = useState([]);
    const [saveResponse, setSaveResponse] = useState(false);
    const [dirty, setDirty] = useState(true);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [errorName, setErrorName]=useState('');

    useEffect(() => {
        setDirty(false);
    }, [dirty])


    useEffect(() => {
        const promises = [API.getClosedAnswersBySid(survey.sid), API.getQuestionsBySid(survey.sid)];
        Promise.all(promises).then(
            ([closedAnswers, questions]) => {
                setClosedAnswers(closedAnswers);
                setQuestions(questions);
                setLoading(false);
            }
        ).catch(err => {
            console.error("error");
        });
    }, [survey.sid]);



    // NOTE: ans will be the id of the closed answer!!!
    const handleChecked = (qid, ans, check) => {
        if (check) {
           
            setUserAnswers(old => [...old, { "sid": survey.sid, "qid": qid, "ans": ans }])
        }
        if (!check && userAnswers.length >= 0) {
            
            setUserAnswers(old => old.filter(a => a.ans !== ans))
        }
    }

    const addOrUpdateOpenAnswer = (qid, ans) => {
        const alreadyExist = userAnswers.map(a => a.qid).includes(qid);

        if (alreadyExist) {
            setUserAnswers(old => old.map(a => a.qid === qid ? { "sid": survey.sid, "qid": qid, "ans": ans } : a))
        } else {
            setUserAnswers(old => [...old, { "sid": survey.sid, "qid": qid, "ans": ans }])
        }

    }

    const submit = () => {
        setErrorName('');

        setSaveResponse(true);
        let valid = true;

        setErrorMessages([]);
        if (userName === '') {
            valid = false;
            setErrorName('Please insert you name');

        }

        questions.forEach(q => {

            let numChecks;

            // check on min and max options checked
            if (q.max === undefined && q.min === 1 && !userAnswers.map(a => a.qid).includes(q.qid)) {
                valid = false;
                setErrorMessages(old => [...old, { 'qid': q.qid, 'errorMessage': `Open answer to Q${q.position + 1} cannot be empty!` }]);
            }

    
            if (q.max !== undefined && (numChecks > q.max || numChecks < q.min)) {
                setErrorMessages(old => {
                    let errorToShow = `In Q${q.position + 1} min & max are not satisfied: Please select `;

                    if (q.min === q.max)
                        errorToShow += `exactly ${q.min} ` + (q.min === 1 ? 'option' : 'options');

                    if (q.min === 0)
                        errorToShow += `maximun ${q.max} options`

                    if (q.min > 0 && q.max > q.min)
                        errorToShow += `at least ${q.min} and at most ${q.max} options`

                    return [...old, { 'qid': q.qid, 'errorMessage': errorToShow }]

                });
                valid = false;
            }
        });


        if (valid) {
            const createResponse = async () => {
                await API.addResponse(survey.sid, [{ "sid": survey.sid, "qid": -1, "ans": userName }, ...userAnswers]);
            }

            createResponse().catch(err => { console.error(err) });
            setSubmitted(true);
        }

    }


    return (
        <>
            {submitted ? <Redirect to='/Main' /> :
                <Container  >
                    {loading ? <span>🕗 Please wait, loading the survey... 🕗</span> :
                        <>

                            <Row>
                                <Col>
                                    <h3>{location.state ? "Responses to survey:" : "Fill out survey:"} {survey.title}</h3>
                                </Col>
                                {location.state && (
                                    <Col className='align-end'>

                                        <Link to={{
                                            pathname: `/View-responses/${location.state.currentIndexResponse - 1}`,
                                            state: { currentIndexResponse: location.state.currentIndexResponse - 1 }
                                        }}>
                                            <Button disabled={location.state.currentIndexResponse === 0}>←</Button>
                                        </Link>



                                        <Link to={{
                                            pathname: `/View-responses/${location.state.currentIndexResponse + 1}`,
                                            state: {
                                                currentIndexResponse: location.state.currentIndexResponse + 1
                                            }
                                        }}>
                                            <Button disabled={location.state.currentIndexResponse === responsesLength - 1}>→</Button>
                                        </Link>


                                    </Col>

                                )}

                            </Row>


                            <Form.Group controlid="form-user-name">
                                <Form.Label><h5 className='mandatory mt-4'>Name</h5> </Form.Label>
                                <Form.Control disabled={loggedIn} type='text' value={userName} onChange={ev => setUserName(ev.target.value)} placeholder="Please insert your name" />
                            </Form.Group>


                            {/* {response.map(a=><h3 key={a}>{a.ans}</h3>)} */}



                            {questions.map(q => (
                                <div key={q.position}>

                                    {errorMessages.length > 0 && (
                                        errorMessages.filter(err => err.qid === q.qid).map(err => <AlertComponent key={err.qid} errorMessage={err.errorMessage} ></AlertComponent>)
                                    )}


                                    <QuestionComponent key={q.qid}
                                        readMode={readMode}
                                        loggedIn={loggedIn}
                                        question={q}
                                        handleChecked={handleChecked}
                                        addOrUpdateOpenAnswer={addOrUpdateOpenAnswer}
                                        saveResponse={saveResponse}
                                        closedAnswers={closedAnswers.filter(a => a.qid === q.qid)}
                                        givenOpenAnswer={location.state ? response.filter(a => a.qid === q.qid && q.max === undefined).map(a => a.ans) : ""}
                                        givenClosedAnswers={location.state ? response.filter(a => a.qid === q.qid && q.max > 0).map(a => a.ans) : []} />

                                </div>))}


                            {/* {errorMessages.length > 0 && (<>
                                {errorMessages.map(err => <AlertComponent key={err} variant='danger' errorMessage={err.errorMessage} />)}
                            </>
                            )} */}

                            {errorName && (<AlertComponent errorMessage={errorName}/>)}
                            <Row className='mt-3'>
                                <Col>
                                    <Link to='/main'><Button disabled={loggedIn} hidden={loggedIn} variant='danger'>Cancel</Button></Link>
                                </Col>
                                <Col className='align-end'>
                                    <Button variant='success' disabled={loggedIn} hidden={loggedIn} onClick={() => submit()}> Save</Button>
                                </Col>
                            </Row>
                        </>}
                </Container>
            }
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


export { ResponseForm }