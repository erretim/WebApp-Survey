import { useState, useEffect } from 'react'
import { Form, Card, Col, Row, Button } from 'react-bootstrap'

import ClosedAnswer from '../models/ClosedAnswer';
import Question from '../models/Question';


function QuestionForm(props) {
    const { questionsLength, setQuestions, closedAnswers, setClosedAnswers, sid, qid, setQid, setErrorMessagesQuestions } = props;

    const [dirty, setDirty] = useState(true);

    const [title, setTitle] = useState('');
    const [type, setType] = useState('');
    const [manOrOpt, setManOrOpt] = useState('');
    const [min, setMin] = useState();
    const [max, setMax] = useState();

    const [numAnsLeft, setNumAnsLeft] = useState(10);
    const [tmpClosedAnswers, setTmpClosedAnswers] = useState([]);
    const [closedAnswerTitle, setClosedAnserTitle] = useState('');
    const [tmpClosedId, setTmpClosedId] = useState(0);



    useEffect(() => {
        setDirty(false);
    }, [dirty])


    const handleType = (type, title) => {
        clearFields(); //clear other fields when admin change question type
        setType(type);
        setTitle(title);
    }

    const handleManOrOpt = (manOrOpt) => {
        if (manOrOpt === 'Mandatory') {
            setManOrOpt("Mandatory");
            setMin(1);
        }
        if (manOrOpt === 'Optional') {
            setManOrOpt('Optional')
            setMin(0);
        }
    }

    const clearFields = () => {
        setTitle('');
        setType('');
        setMin();
        setMax();
        setTmpClosedAnswers([]);
        setNumAnsLeft(10);
        setManOrOpt('');

    }


    const addTmpClosedAnswer = () => {
        const closedAns = new ClosedAnswer(tmpClosedId, qid, closedAnswerTitle, sid);

        setTmpClosedAnswers(old => [...old, closedAns]);
        setClosedAnserTitle('');
        setNumAnsLeft(numAnsLeft - 1);
        setDirty(true);
        setTmpClosedId(tmpClosedId + 1);
    }

    const handleMin = (minimum) => {
        setMin(minimum);
        setMax();
        setDirty(true);
    }


    const addQuestion = () => {
        setErrorMessagesQuestions([]);

        let valid = true;

        if (title.length === 0) {
            valid = false;
            setErrorMessagesQuestions(old=>[...old, " Missing question title"]);
        }
        if (type=== "") {
            valid = false;
            setErrorMessagesQuestions(old=>[...old, " Missing question type"]);
        }

        if(type==="Open-ended" && manOrOpt===''){
            valid = false;
            setErrorMessagesQuestions(old=>[...old, " Missing question mandatory or option flag"]);
        }

        if(type==="Closed-answer" && tmpClosedAnswers.length===0){
            valid = false;
            setErrorMessagesQuestions(old=>[...old, " Number of closed option not valid. Please insert at least one option"]);
        }
        if(type==="Closed-answer" && min ===undefined){
            valid = false;
            setErrorMessagesQuestions(old=>[...old, " Please insert a valid number of minimum accepted answers"]);
        }

        if(type==="Closed-answer" && max ===undefined){
            valid = false;
            setErrorMessagesQuestions(old=>[...old, " Please insert a valid number maximum accepted answers"]);
        }



        if (valid) {
            const question = new Question(qid, sid, title, min, max, questionsLength);

            setQuestions(oldQuestions => [...oldQuestions, question]);

            if (max !== undefined)
                setClosedAnswers(closedAnswers.concat(tmpClosedAnswers));
            clearFields();

            setQid(qid + 1);
        }
        setDirty(true);
    }





    return (
        <>
            <Card>
                <Card.Header>
                    <Row>
                        <Col>
                            <Card.Text>Question #{questionsLength + 1} </Card.Text>
                        </Col>
                        <Col className='align-end'>
                            <Button disabled={title === '' && type === ''} onClick={() => clearFields()}>clear fields</Button>
                        </Col>
                    </Row>

                </Card.Header>
                <Card.Body>

                    <Form.Group controlid="form-question-title">
                        <Form.Label>Question title</Form.Label>
                        <Form.Control type='text' value={title} onChange={ev => setTitle(ev.target.value)} placeholder="Insert question title" />
                    </Form.Group>

                    <Form.Group controlid="form-question-type">
                        <Form.Label>Question type</Form.Label>
                        <Form.Control as="select" value={type} onChange={event => handleType(event.target.value, title)}>
                            <option hidden >--select question type--</option>
                            <option>Closed-answer</option>
                            <option>Open-ended</option>
                        </Form.Control>
                    </Form.Group>

                    {title !== '' && type === 'Open-ended' && (
                        <Form.Group>
                            <Form.Label>Mandatory or Optional</Form.Label>
                            <Form.Control as="select" value={manOrOpt} onChange={event => handleManOrOpt(event.target.value)}>
                                <option hidden >--select status--</option>
                                <option>Mandatory</option>
                                <option>Optional</option>
                            </Form.Control>
                        </Form.Group>
                    )}

                    {title !== '' && type === 'Closed-answer' && !dirty && (
                        <>
                            <Form.Group controlid="form-add-new-closed-answer">

                                {/* <Form.Label> {tmpClosedAnswers.length === 0 ? "Add an answer" : "Add another answer"} </Form.Label> */}
                                <Form.Control disabled={numAnsLeft < 1} as="textarea" rows={2} onChange={ev => setClosedAnserTitle(ev.target.value)}
                                    placeholder={tmpClosedAnswers.length === 0 ? "Insert an answer option. (MAX 10)" : `Insert another answer option. (${numAnsLeft}  left)`} />
                            </Form.Group>

                            {closedAnswerTitle.length > 0 && numAnsLeft > 0 && (
                                <>
                                    <Form.Row>
                                        <Button onClick={() => addTmpClosedAnswer()}>add option </Button>

                                    </Form.Row>

                                </>
                            )}

                            {tmpClosedAnswers.length > 0 && (
                                <>
                                    <p>The possible answers to this question will be:</p>
                                    <ul>
                                        {tmpClosedAnswers.map(ans => <li key={ans.aid}>{ans.title}</li>)}
                                    </ul>
                                </>
                            )}



                        </>
                    )}

                    {tmpClosedAnswers.length > 0 && (
                        <Form.Group controlid="form-minimum-number-off-accepted-answers">
                            <Form.Control as="select" value={min} onChange={(ev) => handleMin(ev.target.value)}>
                                <option hidden>--minimum number of answers that will be accepted--</option>
                                {[...Array(10 - numAnsLeft)].map((x, i) =>
                                    <option key={i} > {i}</option>
                                )}
                            </Form.Control>
                        </Form.Group>
                    )}

                    {min >= 0 && type === 'Closed-answer' && (
                        <>
                            {/* <h1> min={min} numAnsLeft={numAnsLeft}</h1> */}
                            <Form.Group controlid="form-maximum-number-off-accepted-answers">
                                {/* <Form.Label>Maximum number of answers that will be accepted.</Form.Label> */}
                                <Form.Control as="select" value={max} onChange={(ev) => setMax(ev.target.value)}>
                                    <option hidden>--Maximum number of answers that will be accepted--</option>

                                    {[...Array(11 - numAnsLeft - min)].map((x, i) =>

                                        <option hidden={(parseInt(i) + parseInt(min)) === 0} key={i} > {(parseInt(i) + parseInt(min))}</option>
                                    )}
                                </Form.Control>
                            </Form.Group>
                        </>

                    )}



                </Card.Body>
            </Card>
            <Form.Row>
                <Button onClick={() => addQuestion()}>add question</Button>
            </Form.Row>
        </>
    )
};





export { QuestionForm };