import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MySidebar } from '../sidebar/Sidebar';
import { Table } from 'react-bootstrap';
import { ArrayConnectorData, ConnectorData } from '../../interfaces/Table';
import { User, UserState } from '../../interfaces/User';
import RequestHandler from '../../services/RequestHandler';
import { ModalInterface } from '../../interfaces/Modal';
import { MyModal } from '../modal/Modal';
import { MapStateConnector } from '../../interfaces/MapState';
import './Connector.css'
import { BiBookmarkAltPlus } from "react-icons/bi";
import { MdOutlineNotStarted } from "react-icons/md";
import { RiInformationLine } from "react-icons/ri";

export const Connector = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState<User>({ idTag: "", username: "", typeUser: "", token: "" });
  const [connectors, setConnectors] = useState<ArrayConnectorData>({data: []});
  const [mapState, setMapState] = useState<Map<number, MapStateConnector>>(new Map());
  const [userStatus, setUserStatus] = useState<UserState>({status: "", chargePointId: "", connectorId: "", positionInQueue: -1})

  const [modalData, setModalData] = useState<ModalInterface>({show: false, title: "", cause: "", variant: ""});
  const [checked, setChecked] = useState<Map<number, boolean>>(new Map());

  const mapStyle: Map<string, string> = new Map([
    ["Disconnected", "red"],
    ["Sin Eventos", "grey"],
    ["Unavailable", "red"],
    ["Available", "green"],
    ["Reserved", "yellow"],
    ["Preparing", "blue-blinking"],
    ["Charging", "blue"],
    ["Finishing", "blue-blinking"]
  ]);

  const onHideModal = (title: string) => {
    setModalData(prevState => ({
      ...prevState,
      show: false
    }));

    if(title === "Session Expired"){
      navigate('/user/auth');
    }
  };

  useEffect(() => {
    const userId = sessionStorage.getItem("idTag");
    const userToken = sessionStorage.getItem("token");
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
        const response = await RequestHandler.sendRequet("POST", '/business/chargePoint/connector/read', userData.token, body);
        if(response.status === 200){
          setConnectors({
            data: response.data
          });

          const newMap = new Map(mapState);
          const newcheckMap = new Map(checked);
          response.data.forEach((row: ConnectorData) => {
            newMap.set(row.number_connector, {status: row.status, errorCode: row.errorCode, sizeReservationQueue: row.sizeReservationQueue, timestamp: row.timestamp});
            newcheckMap.set(row.number_connector, !(row.status === "Disconnected" || row.status === "Unavailable" || row.status === "Sin Eventos"));
          });
          setMapState(newMap);
          setChecked(newcheckMap);

        }
        else if(response.status === 406){
          sessionStorage.clear();
          setModalData({show: true, title: "Session Expired", cause: "Your session has expired, please log in again", variant: "danger"});
        }
      }
      catch(error){
          console.error(error);
      }
    };

    const fechDataUser = async () => {
      try {
        const response = await RequestHandler.sendRequet("GET", "/business/user/status", userToken, null);
        if(response.status === 200){
          const data: UserState = response.data; // Tipado explícito
          setUserStatus(data);
        }
        else if(response.status === 406){
          sessionStorage.clear();
          setModalData({show: true, title: "Session Expired", cause: "Your session has expired, please log in again", variant: "danger"});
        }
      } 
      catch(error){
        console.error(error);
      }
    };

    const listenSse = () => {
      const eventSource = new EventSource(`http://localhost:8080/api/sse/events/${userToken}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data);
        if(data.event === 'StatusNotification'){
          if(data.chargePointId === id){
            setMapState(prevState => {
              const newMap = new Map(prevState);
              newMap.set(data.connectorId, {status: data.status, errorCode: data.errorCode, sizeReservationQueue: data.sizeReservationQueue, timestamp: data.timestamp});
              return newMap;
            });
            const newcheckMap = new Map(checked);
            newcheckMap.set(data.connectorId, !(data.status === "Disconnected" || data.status === "Unavailable" || data.status === "Sin Eventos"));
            setChecked(newcheckMap);
          }
        }
        else if(data.event === 'ExpiredSession'){
          sessionStorage.clear();
          setModalData({show: true, title: "Session Expired", cause: "Your session has expired, please log in again", variant: "danger"});
        }
        else if(data.event === "UserStatus"){
          setUserStatus(data);
          if(data.status === 'InReservation'){
            setModalData({show: true, title: "Reservation in Process", cause: "The charger is reserved for you for 10 minutes", variant: "primary"});
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
    fechDataUser();
    listenSse();
  
  }, []);

  const handleReservation = async (connectorId: number) => {
    try{
      const body = {chargePointId: id, connectorId: connectorId};
      const response = await RequestHandler.sendRequet("POST", "/business/reservation/new", user.token, body);
      if(response.status === 200){
        setModalData({show: true, title: "Successful Reservation", cause: "Your reservation has been processed correctly", variant: "primary"});
      }
      else{
        handleModalResponse(response.status, response.data.status, response.data.cause);
      }
    }
    catch(error){
      console.error(error);
    }
  }

  const handleCancelReservation = async () => {
    try {
      const response = await RequestHandler.sendRequet("POST", "/business/reservation/cancel", user.token, {chargePointId: id});
      if(response.status === 200){
        setModalData({show: true, title: "successful reservation cancellation", cause: "Your cancellation has been processed correctly", variant: "primary"});
      }
      else{
        handleModalResponse(response.status, response.data.status, response.data.cause);
      }
    }
    catch(error){
      console.error(error);
    }
  }

  const handleRemoteStartTransaction = async (connectorId: number) => {
    try{
      const body = {chargePointId: id, connectorId: connectorId};
      const response = await RequestHandler.sendRequet("POST", "/business/remoteTransaction/start", user.token, body);
      if(response.status === 200){
        setModalData({show: true, title: "Starting Charging", cause: "Please connect the connector to start charging", variant: "primary"});
      }
      else{
        handleModalResponse(response.status, response.data.status, response.data.cause);
      }
    }
    catch(error){
      console.error(error);
    }
  }

  const handlerRemoteStopTransaction = async () => {
    try {
      const response = await RequestHandler.sendRequet("POST", "/business/remoteTransaction/stop", user.token, {chargePointId: id});
      if(response.status === 200){
        setModalData({show: true, title: "Stopping Charging", cause: "Stopping charging, please wait a few seconds", variant: "primary"});
      }
      else{
        handleModalResponse(response.status, response.data.status, response.data.cause);
      }
    }
    catch(error){
      console.error(error);
    }
  }

  const handleChange = async (connectorId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(prevChecked => {
      const newCheckedMap = new Map(prevChecked);
      newCheckedMap.set(connectorId, event.target.checked);
      return newCheckedMap;
    });
    try {
      const operation = event.target.checked ? "Operative" : "Inoperative";
      const body = {chargePointId: id, connectorId: connectorId, type: operation};
      const response = await RequestHandler.sendRequet("POST", "/v16/stationOperation/changeAvailability/chargePoint", user.token, body);
      if(response.status === 200){
        setModalData({show: true, title: "Successful Change Availability", cause: "The change of availability has been successful", variant: "primary"});
      }
      else{
        setChecked(prevChecked => {
          const newCheckedMap = new Map(prevChecked);
          newCheckedMap.set(connectorId, !event.target.checked);
          return newCheckedMap;
        });
        handleModalResponse(response.status, response.data.status, response.data.cause);
      }
    } 
    catch(error){
      console.error(error);
    }
  };

  const handleModalResponse = (status: number, title: string, cause: string) => {
    if(status === 406){
      sessionStorage.clear();
      setModalData({show: true, title: title, cause: "Your session has expired, please log in again", variant: "danger"});
    }
    else{
      setModalData({show: true, title: title, cause: cause, variant: "danger"});
    }
  }

  const renderSizeReservationQueue = (size?: number, position?: number | null) => {
    if((size === 0 || size == null) && (position == null || position === 0)){
      return `Sin Usuarios`;
    }
    else if(size != null && size > 0 && position != null && position > 0){
      return `${position} / ${size} Usuarios`;
    }
    else if(size != null && size > 0 && (position == null || position === 0)){
      return `${size} Usuarios`;
    }
  };

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
            <input type="text" className="form-control" placeholder="Buscar" defaultValue=""/>
          </div>
        </div>

        <div className='scrollable_tbody connector'>
          <Table striped responsive>
            <thead>
              <tr>
                <th>Actividad</th>
                <th>N°</th>
                <th>Estado Conector</th>
                <th>Error Code</th>
                <th>Ultimo Evento</th>
                <th>En Espera</th>
                <th>Reservación</th>
                <th>Cargar Vehículo</th>
              </tr>
            </thead>
            <tbody > 
              {connectors.data && connectors.data.length > 0 ? (
                connectors.data.map((row, index) => (
                  <tr key={index}>
                    <td>
                    <div className="form-check form-switch switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id={`flexSwitchCheckChecked-${row.number_connector}`}
                        checked={checked.get(row.number_connector) || false}
                        onChange={(event) => handleChange(row.number_connector, event)}
                      />
                      <label className="form-check-label" htmlFor={`flexSwitchCheckChecked-${row.number_connector}`}>
                        {checked.get(row.number_connector) ? 'Activo' : 'Inactivo'}
                      </label>
                    </div>
                  </td>
                    <td>{row.number_connector}</td>
                    <td>
                      <div className="status-container">
                      <div className={mapState.get(row.number_connector)?.status !== undefined ? "circle " + mapStyle.get(mapState.get(row.number_connector)!.status) : ""}></div>
                        <span>{mapState.get(row.number_connector)?.status}</span>
                      </div>
                    </td>
                    <td>{mapState.get(row.number_connector)?.errorCode}</td>
                    <td>{mapState.get(row.number_connector)?.timestamp}</td>
                    <td>{renderSizeReservationQueue(mapState.get(row.number_connector)?.sizeReservationQueue, userStatus.positionInQueue)}</td>
                    <td>
                      <button type="button" className="btn btn-outline-primary" onClick={() => handleReservation(row.number_connector)}><BiBookmarkAltPlus className='icon'/> Reservar</button>
                    </td>
                    <td>
                      <button type="button" className="btn btn-outline-primary" onClick={() => handleRemoteStartTransaction(row.number_connector)}><MdOutlineNotStarted className='icon'/> Iniciar Carga</button>
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
        <br/>

        <div className='below_container'>
          <div className='content'>
            <h5></h5>
          </div>
          <div className='buttons'>
            <button type='button' className="btn btn-outline-danger" onClick={() => handleCancelReservation()}> Cancelar Reservacion</button>
            <button type='button' className="btn btn-outline-danger" onClick={() => handlerRemoteStopTransaction()}> Finalizar Carga</button>
          </div>
        </div>

      </div>
    </div>
    <MyModal modalData={modalData} onHide={() => onHideModal(modalData.title)}/>
   </>
  )
}
