import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MySidebar } from '../sidebar/Sidebar';
import { Table } from 'react-bootstrap';
import { ArrayConnectorData, ConnectorData } from '../../interfaces/Table';
import { User } from '../../interfaces/User';
import RequestHandler from '../../services/RequestHandler';
import { ModalInterface } from '../../interfaces/Modal';
import MyModal from '../modal/Modal';
import { MapStateConnector } from '../../interfaces/MapState';
import './Connector.css'

export const Connector = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState<User>({ idTag: "", username: "", typeUser: "", token: "" });
  const [connectors, setConnectors] = useState<ArrayConnectorData>({data: []});
  const [mapState, setMapState] = useState<Map<number, MapStateConnector>>(new Map());

  const [modalData, setModalData] = useState<ModalInterface>({show: false, title: "", cause: ""});

  const mapStyle: Map<string, string> = new Map([
    ["Disconnected", "red"],
    ["Unavailable", "red"],
    ["Available", "green"],
    ["Reserved", "aquamarine"],
    ["Preparing", "blue-blinking"],
    ["Charging", "blue"],
    ["Finishing", "blue-blinking"]
  ]);

  const onHideModal = () => {
    setModalData(prevState => ({
      ...prevState,
      show: false
    }));
    navigate('/user/auth');
  };

  useEffect(() => {
    const userId = sessionStorage.getItem("idTag");
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
            newMap.set(row.number_connector, {status: row.status, errorCode: row.errorCode, timestamp: row.timestamp})
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
      const eventSource = new EventSource(`http://localhost:8080/api/sse/events/${userId}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data);
        if(data.event === 'StatusNotification'){
          if(data.chargePointId === id){
            setMapState(prevState => {
              const newMap = new Map(prevState);
              newMap.set(data.connectorId, {status: data.status, errorCode: data.errorCode, timestamp: data.timestamp});
              return newMap;
            });
          }
          else if(data.event === 'ExpiredSession'){
            sessionStorage.clear();
            setModalData({show: true, title: "Session Expired", cause: "Your session has expired, please log in again"});
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
  
  }, []);

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
                <th>Error Code</th>
                <th>Ultimo Evento</th>
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
                      <div className={mapState.get(row.number_connector)?.status !== undefined ? "circle " + mapStyle.get(mapState.get(row.number_connector)!.status) : ""}></div>
                        <span>{mapState.get(row.number_connector)?.status}</span>
                      </div>
                    </td>
                    <td>{mapState.get(row.number_connector)?.errorCode}</td>
                    <td>{mapState.get(row.number_connector)?.timestamp}</td>
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
