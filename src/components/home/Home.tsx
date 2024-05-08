import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import './Home.css'
import { MyNavbar } from '../navbar/Navbar';
import { ArrayInputData, InputData } from '../../interfaces/Table';
import RequestHandler from '../../services/RequestHandler';
import { User } from '../../interfaces/User';
import { BiPlus, BiPencil, BiTrash, BiInfoCircle } from 'react-icons/bi';


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
          if(response.status === 200){
            setChargePoints({
              data: response.data
            });

            const newMap = new Map(mapState);
            response.data.forEach((row: InputData) =>{
              newMap.set(row.id, row.status);
            }); 
            setMapState(newMap);
          }
          else if(response.status === 406){ // AGREGAR MODAL PARA SESION EXPIRADA
            sessionStorage.clear();
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
          const data = JSON.parse(event.data);
          console.log(data);
          if(data.event === 'ConnectionStatus'){
            setMapState(prevState => {
              const newMap = new Map(prevState);
              newMap.set(data.chargePointId, data.status);
              return newMap;
            });
          }
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
  const [mapState, setMapState] = useState<Map<string, string>>(new Map());

  return (
    <>
      <MyNavbar/>

      <div className='my-div'>

        <div className='header_table'>
            <div className="title_container">
                <h5>Puntos de Carga Registrados</h5>
            </div>
            <div className="controls_container">
                <button type='button' className="btn btn-success"><BiPlus className='icon'/> Add ChargePoint</button>
                <input type="text" className="form-control" placeholder="Buscar" defaultValue=""/>
            </div>
        </div>

        <div className='scrollable_tbody'>
          <Table striped responsive>
            <thead>
              <tr>
                <th>Device</th>
                <th>Marca</th>
                <th>Tipo Conexión</th>
                <th>Sockets</th>
                <th>Estado</th>
                <th>Revisar</th>
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
                      <td>
                        <div className="status-container">
                          <div className={mapState.get(row.id) === "Connected" ? "circle green" : "circle red"}></div>
                          <span>{mapState.get(row.id)}</span>
                        </div>
                      </td>
                      <td>
                        <button type="button" className="btn btn-warning"><BiInfoCircle className='icon'/> View</button>
                      </td>
                      <td>
                        <button type="button" className="btn btn-primary"><BiPencil className='icon'/> Edit</button>
                      </td>
                      <td>
                        <button type="button" className="btn btn-danger"><BiTrash className='icon'/> Delete</button>
                      </td>
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

