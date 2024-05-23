import { useEffect, useState, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import './Home.css'
import { ArrayInputData, InputData } from '../../interfaces/Table';
import RequestHandler from '../../services/RequestHandler';
import { BiTrash } from 'react-icons/bi';
import { LiaPlusCircleSolid } from "react-icons/lia";
import { RiInformationLine } from "react-icons/ri";
import { PiPlugCharging } from "react-icons/pi";
import { ModalInterface } from '../../interfaces/Modal';
import MyModal from '../modal/Modal';
import { MySidebar } from '../sidebar/Sidebar';
import { MapState } from '../../interfaces/MapState';


export const Home = () => {
  const navigate = useNavigate();

  const [chargePoints, setChargePoints] = useState<ArrayInputData>({ data: [] });
  const [mapState, setMapState] = useState<Map<string, MapState>>(new Map());

  const [modalData, setModalData] = useState<ModalInterface>({show: false, title: "", cause: "", variant: ""});

  const [searchText, setSearchText] = useState<string>('');

  const [perPage, setPerPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = chargePoints.data.filter((row) =>
    Object.values(row).some(
      (value) =>
        typeof value === 'string' &&
        value.toLowerCase().startsWith(searchText.toLowerCase())
    )
  );

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, filteredData.length);

  const filteredDataInterval = filteredData.slice(startIndex, endIndex);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handlePerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPerPage(Number(event.target.value));
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const onHideModal = () => {
    setModalData(prevState => ({
      ...prevState,
      show: false
    }));
    navigate('/user/auth');
  };

  const onClickConnectors = (id: string) =>{
    navigate(`/chargePoint/${id}/connectors`);
  }

  useEffect(() => {
    const userId = sessionStorage.getItem("idTag");
    const userToken = sessionStorage.getItem("token");
    const fetchData = async () => {
      try {
        const response = await RequestHandler.sendRequet('GET', '/chargePoint/read', userToken, null);
        if(response.status === 200){
          setChargePoints({
            data: response.data
          });
  
          const newMap = new Map(mapState);
          response.data.forEach((row: InputData) =>{
            newMap.set(row.id, {status: row.status, timestamp: row.timestamp})
          }); 
          setMapState(newMap);
          setPerPage(response.data.length);
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
  
    fetchData(); // Ejecutar fetchData una vez al montar el componente
  
    const eventSource = new EventSource(`http://localhost:8080/api/sse/events/${userId}`);
  
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      if(data.event === 'ConnectionStatus'){
        setMapState(prevState => {
          const newMap = new Map(prevState);
          newMap.set(data.chargePointId, {status: data.status, timestamp: data.timestamp});
          return newMap;
        });
      }
      else if(data.event === 'ExpiredSession'){
        sessionStorage.clear();
        setModalData({show: true, title: "Session Expired", cause: "Your session has expired, please log in again", variant: "danger"});
      }
    };
  
    eventSource.onerror = (error) => {
      console.error('Error de EventSource: ', error);
      eventSource.close();
    };

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };

  }, []);

  return (
    <>
      <MySidebar/>

      <div className='my-rest-space'>

        <div className='my-div'>

          <div className='header_table'>
              <div className="title_container">
                  <h5>Puntos de Carga Registrados</h5>
              </div>
              <div className="controls_container">
                  <button type='button' className="btn btn-outline-success"><LiaPlusCircleSolid className='icon'/> New ChargePoint</button>
                  <input type="text" className="form-control" placeholder="Buscar" value={searchText} onChange={handleSearchChange}/>
              </div>
          </div>

          <div className='scrollable_tbody'>
            <Table striped responsive>
              <thead>
                <tr>
                  <th>Device</th>
                  <th>Marca</th>
                  <th>Tipo Conexión</th>
                  <th>Estado</th>
                  <th>Ultimo Evento</th>
                  <th>Conectores</th>
                  <th>Detalles</th>
                  <th>Eliminar</th>
                </tr>
              </thead>
              <tbody > 
                  {chargePoints.data && chargePoints.data.length > 0 ? (
                    filteredDataInterval.map((row, index) => (
                      <tr key={index}>
                        <td>{row.id}</td>
                        <td>{row.vendor}</td>
                        <td>{row.connection_type}</td>
                        <td>
                          <div className="status-container">
                            <div className={mapState.get(row.id)?.status === "Connected" ? "circle green" : "circle red"}></div>
                            <span>{mapState.get(row.id)?.status}</span>
                          </div>
                        </td>
                        <td>{mapState.get(row.id)?.timestamp}</td>
                        <td>
                          <button type="button" className="btn btn-outline-success" onClick={() => onClickConnectors(row.id.toString())}><PiPlugCharging className='icon'/> Conectores</button>
                        </td>
                        <td>
                          <button type="button" className="btn btn-outline-info"><RiInformationLine className='icon'/> Detalles</button>
                        </td>
                        <td>
                          <button type="button" className="btn btn-outline-danger"><BiTrash className='icon'/> Eliminar</button>
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

          <div className="pagination">
            <div className="pagination_info">
                <label>Filas por página:</label>
                <input type="number" value={perPage} className="form-control" onChange={handlePerPageChange} min={1} max={filteredData.length - endIndex === 0 ? 1 : filteredData.length}/>
            </div>
            <div className="pagination_info">
                {endIndex === startIndex ? startIndex : startIndex + 1} - {endIndex} de {filteredData.length}
            </div>
            <div className="pagination_control">
                <button type="button" className="btn btn-outline-secondary left" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} > &lt;</button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => handlePageChange(currentPage + 1)} disabled={endIndex >= filteredData.length}>&gt;</button>
            </div>
          </div>
      
        </div> 

      </div>
      <MyModal modalData={modalData} onHide={onHideModal}/>
    </>
  );
}

