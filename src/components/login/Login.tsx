import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';
import RequestHandler from '../../services/RequestHandler';
import { ModalInterface } from '../../interfaces/Modal';
import MyModal from '../modal/Modal';

export const Login = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const user = sessionStorage.getItem("user");
        if(user){
            navigate('/home');
        }
    }, [navigate]);

    const [credentials, setCredentials] = useState<{username: string; password: string}>({
        username: '',
        password: ''
    });

    const [modalData, setModalData] = useState<ModalInterface>({show: false, title: '', cause: '', variant: ''});

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setCredentials(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSumit = async () => {
        try {
            const response = await RequestHandler.sendRequet('POST', '/business/user/auth', null, credentials);
            if(response.status === 200){
                sessionStorage.setItem("idTag", response.data.id);
                sessionStorage.setItem("typeUser", response.data.type_user);
                sessionStorage.setItem("user", credentials.username);
                sessionStorage.setItem("token", response.data.token);
                navigate('/home');
            }
            else{
                setModalData({show: true, title: "Fail Authentication", cause: response.data.cause, variant: "danger"});
            }
        }
        catch(error){
            console.error(error);
        }
    }

    const closeModal = () => {
        setModalData(prevState => ({
            ...prevState,
            show: false
        }));
    }

  return (

    <>
    <div className="container-fluid p-0 custom-container">
        <div className="row">

            <div className="col-md-6 p-0 col-left">
                <div className="custom-img"></div>
                <div className="image-text">
                    <h2>Fleishchmann IoT</h2>
                    <p>Soluciones Digitales</p>
                </div>
            </div>

            <div className='col-md-6 col-right'>
                <div className="my-div-form">
                    <h3>Inicio de Sesión</h3>
                    <p>Inicia sesión para ingresar a la plataforma</p>
                    <form>
                        <div className="form-group">
                            <label className='my-label'>Nombre de Usuario</label>
                            <input type="text" className="form-control my-label" placeholder="username" name="username" onChange={handleInputChange} required/>
                        </div>
                        <div className="form-group">
                            <label className='my-label'>Contraseña</label>
                            <input type="password" className="form-control" placeholder='password' name='password' onChange={handleInputChange} required/>
                        </div>
                        <div className="mb-3 form-check form-group">
                            <input type="checkbox" className="form-check-input" id="rememberPassword"/>
                            <label className="form-check-label" htmlFor="rememberPassword">Recordar contraseña</label>
                        </div>
                        <button type="button" className="btn btn-primary my-button" onClick={handleSumit}>Ingresar</button>
                    </form>
                    <p className="mt-3 p-recovery"><span>¿Olvidaste tu contraseña? Haz click en </span><a href="/">Recuperar</a></p>
                </div>
            </div>

        </div>
    </div>
    <MyModal modalData={modalData} onHide={closeModal}></MyModal>
    </>
  )
}
