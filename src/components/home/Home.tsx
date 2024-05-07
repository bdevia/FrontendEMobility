import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import './Home.css'
import { MyNavbar } from '../navbar/Navbar';
import { ArrayInputData } from '../../interfaces/Table';
import RequestHandler from '../../services/RequestHandler';
import { User } from '../../interfaces/User';

export const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {

    const userData = {
      idTag: sessionStorage.getItem("idTag"),
      username: sessionStorage.getItem("user"),
      typeUser: sessionStorage.getItem("typeUser"),
      token: sessionStorage.getItem("token")
    };
    setUser(userData);

    if(userData){

      const fetchData = async () => {
        try {
          const response = await RequestHandler.sendRequet('GET', '/chargePoint/read', userData.token, null);
          if(response.status === 200) {
            setChargePoints({
              data: response.data
            });
          } 
          else {
            navigate('/user/auth');
          }
        }
        catch(error){
          console.error(error);
        }

      };

      const listenSse = () => {
        const eventSource = new EventSource('http://localhost:8080/api/sse/events');

        eventSource.onmessage = (event) => {
          const newEvent = JSON.parse(event.data);
          console.log("evento: ", newEvent);
        };

        eventSource.onerror = (error) => {
          console.error('Error de EventSource: ', error);
          eventSource.close();
        };

        return () => {
          eventSource.close();
        };

      };

      fetchData();
      listenSse();
    }
  }, [navigate]);

  const [user, setUser] = useState<User>({ idTag: "", username: "", typeUser: "", token: "" });
  const [chargePoints, setChargePoints] = useState<ArrayInputData>({ data: [] });

  return (
    <>
      <MyNavbar/>

       <div className='my-div'>

      <div className='header_table'>
          <div className="title_container">
              <h5>Puntos de Carga Registrados</h5>
          </div>
          <div className="controls_container">
              <button type='button' className="btn btn-outline-success">Opciones</button>
              <input type="text" className="form-control" placeholder="Buscar" defaultValue=""/>
          </div>
      </div>

      <div className='scrollable_tbody'>
        <Table striped>
          <thead>
            <tr>
              <th>ID</th>
              <th>Marca</th>
              <th>Tipo Conexión</th>
              <th>Sockets</th>
              <th>Estado</th>
              <th>Visualizar</th>
              <th>Editar</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody > 
              {chargePoints.data && chargePoints.data.length > 0 ? (
                chargePoints.data.map((row, index) => (
                  <tr key={index}>
                    <td>{row.id}</td>
                    <td>{row.vendor}</td>
                    <td>{row.connection_type}</td>
                    <td>{row.connectors}</td>
                    <th>Estado</th>
                    <td><button type="button" className="btn btn-outline-success">Visualizar</button></td>
                    <td><button type="button" className="btn btn-outline-primary">Editar</button></td>
                    <td><button type="button" className="btn btn-outline-danger">Eliminar</button></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8}>No hay datos disponibles</td>
                </tr>
              )}
            
          </tbody>
        </Table>
      </div>
    
    </div>  


    </>
  );
}

