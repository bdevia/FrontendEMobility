import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';

export const Login = () => {
  return (

    <div className="container-fluid p-0 custom-container">
        <div className="row">

            <div className="col-md-6 p-0 col-left">
                <div className="custom-img h-100 w-100"></div>
                <div className="image-text">
                    <h2>Fleishchamann IoT</h2>
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
                            <input type="text" className="form-control my-label" placeholder='username' required/>
                        </div>
                        <div className="form-group">
                            <label className='my-label'>Contraseña</label>
                            <input type="password" className="form-control" placeholder='password' required/>
                        </div>
                        <div className="mb-3 form-check form-group">
                            <input type="checkbox" className="form-check-input" id="rememberPassword"/>
                            <label className="form-check-label" htmlFor="rememberPassword">Recordar contraseña</label>
                        </div>
                        <button type="submit" className="btn btn-primary my-button">Ingresar</button>
                    </form>
                    <p className="mt-3 p-recovery"><span>¿Olvidaste tu contraseña? Haz click en </span><a href="/">Recuperar</a></p>
                </div>
            </div>

        </div>
    </div>

  )
}
