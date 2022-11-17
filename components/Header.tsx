import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
// import NavDropdown from 'react-bootstrap/NavDropdown'
// import Row from 'react-bootstrap/Row'
// import Col from 'react-bootstrap/Col'
// import Image from 'next/image'
// import Link from 'next/link'
// import samplelogo from '/public/favicon.png'

const Header = () => {
  return (
    <header className="pb-10 sm:pb-10">
      <Navbar  collapseOnSelect expand="lg" variant="light" className="color-nav navbar-expand-sm px-2 sm:px-4 py-2.5 fixed w-full z-20 top-0 left-0">
        <Container>
          <Navbar.Brand href="/">MAGIC Monero Fund</Navbar.Brand>
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
