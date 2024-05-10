import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MySidebar } from '../sidebar/Sidebar';
import { Table } from 'react-bootstrap';
import { ArrayConnectorData, ConnectorData } from '../../interfaces/Table';
import { User } from '../../interfaces/User';
import RequestHandler from '../../services/RequestHandler';
import { ModalInterface } from '../../interfaces/Modal';
import MyModal from '../modal/Modal';
import { MapState } from '../../interfaces/MapState';

export const Connector = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState<User>({ idTag: "", username: "", typeUser: "", token: "" });
  const [connectors, setConnectors] = useState<ArrayConnectorData>({data: []});
  const [mapState, setMapState] = useState<Map<number, MapState>>(new Map());

  const [modalData, setModalData] = useState<ModalInterface>({show: false, title: "", cause: ""});

  const onHideModal = () => {
    setModalData(prevState => ({
      ...prevState,
      show: false
    }));
    navigate('/user/auth');
  };

  useEffect(() => {
    const userData = {
      idTag: sessionStorage.getItem("idTag"),
      username: sessionStorage.getItem("user"),
      typeUser: sessionStorage.getItem("typeUser"),
      token: sessionStorage.getItem("token")
    };
    setUser(userData);

    const fetchData = async () => {
      try {
        const body: {chargePointId?: string} = {chargePointId: id};
        const response = await RequestHandler.sendRequet("POST", '/chargePoint/connector/read', userData.token, body);
        if(response.status === 200){
          setConnectors({
            data: response.data
          });

          const newMap = new Map(mapState);
          response.data.forEach((row: ConnectorData) => {
            newMap.set(row.number_connector, {status: row.status, date: new Date()})
          });
          setMapState(newMap);

        }
        else if(response.status === 406){
          sessionStorage.clear();
          setModalData({show: true, title: "Session Expired", cause: "Your session has expired, please log in again"});
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
        if(data.event === 'StatusNotification'){
          if(data.chargePointId === id){
            setMapState(prevState => {
              const newMap = new Map(prevState);
              newMap.set(data.connectorId, {status: data.status, date: new Date()});
              return newMap;
            });
          }
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
  
  }, [navigate]);

  return (
   <>
    <MySidebar/>

    <div className='my-rest-space'>

      <div className='my-div'>

        <div className='header_table'>
          <div className="title_container">
            <h5>Conectores de Cargador {id}</h5>
          </div>
          <div className="controls_container">
            <button type='button' className="btn btn-outline-success"> ChargePoint</button>
            <input type="text" className="form-control" placeholder="Buscar" defaultValue=""/>
          </div>
        </div>

        <div className='scrollable_tbody'>
          <Table striped responsive>
            <thead>
              <tr>
                <th>N°</th>
                <th>Estado</th>
                <th>Actualización</th>
                <th>Cola de Espera</th>
              </tr>
            </thead>
            <tbody > 
              {connectors.data && connectors.data.length > 0 ? (
                connectors.data.map((row, index) => (
                  <tr key={index}>
                    <td>{row.number_connector}</td>
                    <td>
                      <div className="status-container">
                        <div className={
                          mapState.get(row.number_connector)?.status === "Disconnected" ? "circle red" :
                          mapState.get(row.number_connector)?.status === "Available" ? "circle green" :
                          mapState.get(row.number_connector)?.status === "Reserved" ? "circle yellow" :
                          mapState.get(row.number_connector)?.status === "Preparing" ? "circle blue-blinking" :
                          mapState.get(row.number_connector)?.status === "Charging" ? "circle blue" :
                          mapState.get(row.number_connector)?.status === "Finishing" ? "circle blue-blinking" :
                          "circle"
                        }></div>
                        <span>{mapState.get(row.number_connector)?.status}</span>
                      </div>
                    </td>
                    <td>{mapState.get(row.number_connector)?.date ? mapState.get(row.number_connector)?.date.toLocaleString().replace(',', '') : "Sin Información"}</td>
                    <td>{row.sizeReservationQueue > 0 ? `${row.sizeReservationQueue} Usuarios` : 'Sin Usuarios'}</td>
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

    </div>
    <MyModal modalData={modalData} onHide={onHideModal}/>
   </>
  )
}
