import React from 'react'

import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css'

export const MyNavbar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<string>('');

    useEffect(() => {
        const storedUser = sessionStorage.getItem("user");
        if(storedUser){
            setUser(storedUser)
        } else{
            navigate('/auth/login');
        }

    }, [navigate]); 

    const logout = () =>{
        sessionStorage.clear();
        navigate('/user/auth');
    };


  return (
    <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
        <Container className='my-container'>
            <Navbar.Brand href="/home"><img className="logo-nav" src="../img/logo-dark.png" alt="Logo de navbar"/></Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav my-custom-collapse">
                <Nav className="me-auto my-list-a">
                    <Nav.Link href="#alarmas">Organizaciones</Nav.Link>
                    <Nav.Link href="#eventos">Sucursales</Nav.Link>
                    <Nav.Link href="#personas">Usuarios</Nav.Link>
                </Nav>
                <Nav className="ml-auto">
                    <Nav.Link href="#mapa">Mapa</Nav.Link>
                    <NavDropdown title={user} id="basic-nav-dropdown">
                        <NavDropdown.Item href="#action/3.1">Perfil</NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.2"></NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item onClick={logout}>Cerrar Sesion</NavDropdown.Item>
                    </NavDropdown>
                </Nav>
            </Navbar.Collapse>
        </Container>
    </Navbar>
  )
}
