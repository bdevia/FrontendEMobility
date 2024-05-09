import './Sidebar.css'
import { Navbar, Nav, Dropdown, Container, NavDropdown } from 'react-bootstrap';
import { IoHomeOutline } from "react-icons/io5";
import { AiOutlineDashboard } from "react-icons/ai";
import { GoOrganization } from "react-icons/go";
import { PiBuildingOffice } from "react-icons/pi";
import { FaRegUserCircle } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const MySidebar = () => {
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
    <>
    <Navbar bg="light" expand="lg" className="flex-column justify-content-start my-sidebar">
        <Navbar.Brand href="/" >
            <img className="logo-nav" src="/img/logo-dark.png" alt="Logo de navbar"/>
        </Navbar.Brand>
        <hr className="my-2 w-100 hr-line"/> 
        <Nav className="flex-column mb-auto my-nav">
            <Nav.Item>
                <Nav.Link href="#"><IoHomeOutline className='my-icon'/> Home</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link href="#"><AiOutlineDashboard className='my-icon'/> Dashboard</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link href="#"><GoOrganization className='my-icon'/> Organizaciones</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link href="#"><PiBuildingOffice className='my-icon'/> Sucursales</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link href="#"><FiUsers className='my-icon'/> Usuarios</Nav.Link>
            </Nav.Item>
        </Nav>
        <hr className="my-2 w-100 hr-line"/> 
        <Dropdown className='my-end' drop='up'>
            <Dropdown.Toggle variant="light"><FaRegUserCircle className='my-icon'/> {user}</Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item href="#">Perfil</Dropdown.Item>
                <Dropdown.Item href="#">Ajustes</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item href="#" onClick={logout}>Cerrar sesion</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    </Navbar>
    </>
  );
}
