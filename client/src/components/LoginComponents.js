import { Form, Button, Alert} from 'react-bootstrap';
import { useState } from 'react';
//import { Redirect } from 'react-router';

function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('') ;
  
  const handleSubmit = (event) => {
      event.preventDefault();
      setErrorMessage('');
      const credentials = { username, password };
      
      // SOME VALIDATION, ADD MORE!!!
      let valid = true;
      if(username === '' || password === '' || password.length < 6)
          valid = false;
      
      if(valid)
      {
        props.login(credentials);
      }
      else {
        // show a better error message...
        setErrorMessage('Error(s) in the form, please insert valid credentials.')
      }
  };

  return (
    <Form>
      {errorMessage ? <Alert variant='danger'>{errorMessage}</Alert> : ''}
      <Form.Group controlid='username'>
          <Form.Label>username</Form.Label>
          <Form.Control type='text' value={username} onChange={ev => setUsername(ev.target.value)} />
      </Form.Group>
      <Form.Group controlid='password'>
          <Form.Label>Password</Form.Label>
          <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
      </Form.Group>
      <Button onClick={handleSubmit}>Login</Button>
    </Form>)
}


export { LoginForm};