import { Navbar, Nav, DropdownButton, Dropdown } from 'react-bootstrap/';
import { ClipboardCheck } from 'react-bootstrap-icons';

function Navigation(props) {
  const {loggedIn, admin, doLogOut}=props;


  return (

    <Navbar bg="dark" variant="dark" fixed='top' className="justify-content-between">

      <Navbar.Brand href="" >
        <ClipboardCheck />
        {' '}
        Survey
      </Navbar.Brand>


      <Nav>


        <DropdownButton
        variant='dark'
          menuAlign="right"
          title= {loggedIn ? `${admin.username}`: "Admin area" }
          id="dropdown-menu-align-right"
        >

          {loggedIn ?
            <>
              <Dropdown.Item onClick={doLogOut}>Logout</Dropdown.Item>
            </>
            :
            <Dropdown.Item href="/login" >
              Login
            </Dropdown.Item>
          }
        </DropdownButton>

      </Nav>
    </Navbar>

  )
}

export default Navigation;