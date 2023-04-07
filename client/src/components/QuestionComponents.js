import { useState, } from 'react';
import { Row, Col, Button, Card, Form, Badge } from 'react-bootstrap'
import { Trash } from 'react-bootstrap-icons';




function QuestionComponent(props) {
    const { loggedIn, question, numQuestions, handlePosition, deleteQuestion, handleChecked, addOrUpdateOpenAnswer, closedAnswers, givenOpenAnswer, givenClosedAnswers, readMode } = props;

    const [openAnswer, setOpenAnswer] = useState(readMode ? givenOpenAnswer : '');
    const [maxChar, setMaxChar] = useState(200);

    const handleOpenAnswer = (ans) => {
        setMaxChar(openAnswer.length < ans.length ? maxChar - 1 : maxChar + 1);
        setOpenAnswer(ans);
    }


    return (
        <>
          
            <Card id='questionCard'>
                <Card.Header>
                    <Row>
                        <Col className={question.min === 1 && question.max === undefined ? "mandatory" : ''} >
                            Q{question.position + 1}: {question.title}
                        </Col>

                        {loggedIn && !readMode && (
                            <Col className='text-right' md='5'>
                                <Button className='button' hidden={numQuestions === 1} disabled={question.position === numQuestions - 1} onClick={() => handlePosition(question, 'down')} >↓</Button>
                                <Button className='button' hidden={numQuestions === 1} disabled={question.position === 0} onClick={() => handlePosition(question, 'up')}>↑</Button>
                                <Button className='ml-2' variant='danger' onClick={() => deleteQuestion(question.qid)}><Trash /></Button>
                            </Col>
                        )}

                    </Row>

                    {question.max !== undefined ?
                        <>
                            <Badge variant="danger">min: {question.min} max: {question.max}</Badge>
                        </>
                        :
                        <>
                        {!loggedIn &&(
                            <Row id='maxChar'>
                            {openAnswer.length === 0 ? `[max characters: 200]` : `[characters left: ${maxChar}]`}
                        </Row>
                        )}
                        </>
                        
                    }
                </Card.Header>

                <Card.Body>
                    {question.max === undefined ?
                        <Card.Text>
                            <Form.Control
                                as="textarea"
                                disabled={maxChar === 0 || loggedIn}
                                rows={4}
                                name="openAnswer"
                                placeholder={loggedIn ? "" : "Enter your answer"}
                                value={openAnswer} 
                                onChange={(ev) => { handleOpenAnswer(ev.target.value); addOrUpdateOpenAnswer(question.qid, ev.target.value) }
                                }
                            />

                        </Card.Text>
                        :
                        <>
                            {closedAnswers.map(answer =>
                                <AnswerComponent key={answer.aid}
                                    loggedIn={loggedIn}
                                    answer={answer}
                                    question={question}
                                    handleChecked={handleChecked}

                                    givenClosedAnswer={readMode ? givenClosedAnswers.includes(answer.aid) : false}
                                />
                            )}
                        </>
                    }

                </Card.Body>
            </Card>
        </>

    )
}

function AnswerComponent(props) {
    const { loggedIn, answer, question, handleChecked, givenClosedAnswer } = props;

    return <>
        {question.max !== undefined && (
            <Row id='closedAns'>
                <Form.Check
                    defaultChecked={givenClosedAnswer}
                    type="checkbox"
                    disabled={loggedIn}
                    className="my-1 mr-sm-2"
                    id={answer.aid}
                    label={answer.title}
                    // checked={} answer location
                    onChange={(ev) => { handleChecked(question.qid, answer.aid, ev.target.checked); }}
                    custom
                />
            </Row>
        )}
    </>
}




export { QuestionComponent}