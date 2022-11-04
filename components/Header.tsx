import Image from 'next/image'
import samplelogo from '/public/favicon.png'
import Link from 'next/link'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'


async function handleClick() {
  try {
    console.log('element activated')
    // set the target element that will be collapsed or expanded (eg. navbar menu)
    const targetEl = document.getElementById('navbarToggleExternalContent');

    // optionally set a trigger element (eg. a button, hamburger icon)
    const triggerEl = document.getElementById('triggerEl');

    // optional options with default values and callback functions
    const options = {
      triggerEl: triggerEl,
      onCollapse: () => {
          console.log('element has been collapsed')
      },
      onExpand: () => {
          console.log('element has been expanded')
      },
      onToggle: () => {
          console.log('element has been toggled')
      }
    };


  } catch (e) {
    console.error(e)
  }
}

const Header = () => {
  return (
    <header className="pb-10 sm:pb-10">
      <Navbar  collapseOnSelect expand="lg" variant="light" className="color-nav navbar-expand-sm px-2 sm:px-4 py-2.5 fixed w-full z-20 top-0 left-0">
        <Container>
          <Navbar.Brand href="/">Monero Fund</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">   
              <Nav.Link href="/apply">Apply</Nav.Link>
              <Nav.Link href="/faq">FAQs</Nav.Link>
              <Nav.Link href="/about">About Us</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  )
}

export default Header
