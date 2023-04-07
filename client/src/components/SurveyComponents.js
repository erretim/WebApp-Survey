import { Row, Col, ListGroup } from 'react-bootstrap'

import { Link } from 'react-router-dom';


function SurveyTable(props) {
    const { loggedIn, admin, surveys, setCurrentSurvey, responses } = props;


    return (
        <>
            <Row >
                <Col><h3> Title</h3></Col>

                {loggedIn && (<Col> <h3> N. Responses</h3></Col>)}
            </Row>

{/* Not the best solution. It would be better to create an API to manage the 2 situations. 
    Here I just simply filter on all surveys to show only the admin's surveys when he/she is loggedIn.
    I left this solution because all things considered, here I have only a request of all surveys without getting also the all the questions and the closed answer-options.
*/}
            {loggedIn ? <>
                <ListGroup variant='flush'>
                    {surveys.filter(s => s.adminId === admin.id).map((s) => <ListGroup.Item key={s.sid}> <SurveyRow
                        admin={admin}
                        survey={s}
                        loggedIn={loggedIn}

                        setCurrentSurvey={setCurrentSurvey}
                        responses={responses}
                    /> </ListGroup.Item>)}
                </ListGroup>
            </>
                :
                <>
                    <ListGroup variant='flush'>
                        {surveys.map((s) => <ListGroup.Item key={s.sid}> <SurveyRow
                            admin={admin}
                            survey={s}
                            loggedIn={loggedIn}

                            setCurrentSurvey={setCurrentSurvey}
                            responses={responses}
                        /> </ListGroup.Item>)}
                    </ListGroup>
                </>
            }



        </>
    );
}




function SurveyRow(props) {

    const { admin, survey, loggedIn, setCurrentSurvey } = props;

    return (


        <>

            <Row>
                {loggedIn && (survey.adminId === admin.id) ? <>
                    <Col>
                        {survey.nResponses>0 ? 
                            <Link to={{ pathname: "/View-responses/0", state: { currentIndexResponse: 0 } }} onClick={() => setCurrentSurvey(survey)}> {survey.title} </Link>
                        :
                        survey.title
                        }
                        
                    </Col>

                    <Col> {survey.nResponses}</Col>


                </> :

                    <>
                        <Col>
                            <Link to={`/fill-out-survey/${survey.sid}`} >
                                {survey.title}
                            </Link>
                        </Col>

                    </>
                   
                }


            </Row>
        </>

    )
}








export { SurveyTable };