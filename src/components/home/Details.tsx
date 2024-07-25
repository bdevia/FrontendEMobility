import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { MySidebar } from '../sidebar/Sidebar';
import { TableStatusFirmwareDetails, ChargePointDetails } from '../../interfaces/Table';
import './Details.css';
import { Table } from 'react-bootstrap';
import RequestHandler from '../../services/RequestHandler';
import { ModalInterface, ModalUpdateInput } from '../../interfaces/Modal';
import { ModalUpdateFirmware, MyModal } from '../modal/Modal';
import { table } from 'console';

export const Details = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [modalData, setModalData] = useState<ModalInterface>({show: false, title: "", cause: "", variant: ""});
    const [modalUpdateFirmware, setModalUpdateFirmware] = useState(false);

    const [details, setDetails] = useState<ChargePointDetails>();
    const [tableStatusFirmware, setTableStatusFirmware] = useState<TableStatusFirmwareDetails>({status: "", timestamp: "", schedule: "", file: ""});

    const mapStyle: Map<string, string> = new Map([
        ["Sin Eventos", "grey"],
        ["Downloaded", "blue"],
        ["DownloadFailed", "red"],
        ["Downloading", "blue-blinking"],
        ["Idle", "yellow"],
        ["InstallationFailed", "red"],
        ["Installing", "blue-blinking"],
        ["Installed", "green"],
        ["Uploaded", "green"],
        ["UploadFailed", "red"],
        ["Uploading", "blue-blinking"]
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

        const fetch = async () => {
            try {
                const body = {chargePointId: id};
                const response = await RequestHandler.sendRequet('POST', '/business/chargePoint/readById', userToken, body);
                if(response.status === 200){
                    const chargePointDetails: ChargePointDetails = {
                        id: response.data.id,
                        id_list_auth: response.data.id_list_auth,
                        vendor: response.data.vendor,
                        serial_number: response.data.serial_number,
                        box_serial_number: response.data.box_serial_number,
                        firmware_version: response.data.firmware_version,
                        icc_id: response.data.icc_id,
                        imsi: response.data.imsi,
                        meter_type: response.data.meter_type,
                        meter_serial_number: response.data.meter_serial_number,
                        connectors: response.data.connectors,
                        connection_type: response.data.connection_type,
                        location: response.data.location,
                        coordinates: response.data.coordinates
                    };
                    setDetails(chargePointDetails);

                    const statusFirmware: TableStatusFirmwareDetails = { 
                        status: response.data.statusFirmware, 
                        timestamp: response.data.timestmapFirmware, 
                        schedule: response.data.scheduleFirmware,
                        file: response.data.fileFirmware
                    };
                    setTableStatusFirmware(statusFirmware);
                }
            } 
            catch(error){
                console.error(error);
            }
        };

        const listenSSE = () => {
            const eventSource = new EventSource(`http://localhost:8080/api/sse/events/${userToken}`);

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log(data);
                
                if(data.event === 'FirmwareStatusNotification' && data.chargePointId === id){
                    setTableStatusFirmware({
                        status: data.status,
                        timestamp: data.timestamp,
                        schedule: data.schedule,
                        file: data.file
                    });
                }
                else if(data.event === 'DiagnosticsStatusNotification' && data.chargePointId === id){
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
                eventSource.close();
            };
        };

        fetch();
        listenSSE();

    }, []);

    const showModalUpdateFirmware = () =>{
        setModalUpdateFirmware(true);
    };

    const handleUpdateFirmware = async (retries: string, retieveDate: string) => {
        setModalUpdateFirmware(false);
        try {
            const body = {chargePointId: id, retries: retries, retrieveDate: retieveDate};
            const response = await RequestHandler.sendRequet('POST', '/v16/firmware/update/chargePoint', sessionStorage.getItem("token"), body);
            if(response.status === 200){
                setModalData({show: true, title: "Successful Scheduling", cause: "The firmware update scheduling has been completed successfully", variant: "primary"});
            }
            else{
                handleModalResponse(response.status, response.data.status, response.data.cause);
            }
            
        } 
        catch (error){
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
    };

    return (
        <>
            <MySidebar/>

            <div className='my-rest-space'> 
                <div className='my-div'>

                    <div className='header_table'>
                        <div className="title_container">
                            <h5>Panel de Configuración</h5>
                        </div>
                        <div className="controls_container">
                            <button type='button' className="btn btn-outline-primary">Editar Información</button>
                            <input type="text" className="form-control" placeholder="Buscar"/>
                        </div>
                    </div>

                    {details ? (
                        <form className='details-container'>
                        <div className='column'>
                            <div className='form-group-custom'>
                                <label>Identificador</label>
                                <input type='text' className="form-control" value={details.id} readOnly />
                            </div>
                            <div className='form-group-custom'>
                                <label>Fabricante</label>
                                <input type='text'className="form-control" value={details.vendor} readOnly />
                            </div>
                            <div className='form-group-custom'>
                                <label>Serial Number</label>
                                <input type='text' className="form-control" value={details.serial_number} readOnly />
                            </div>
                        </div>
                        <div className='column'>
                            <div className='form-group-custom'>
                                <label>Firmware Version</label>
                                <input type='text' className="form-control" value={details.firmware_version} readOnly />
                            </div>
                            <div className='form-group-custom'>
                                <label>ICC ID</label>
                                <input type='text' className="form-control" value={details.icc_id} readOnly />
                            </div>
                            <div className='form-group-custom'>
                                <label>IMSI</label>
                                <input type='text' className="form-control" value={details.imsi} readOnly />
                            </div>
                        </div>
                        <div className='column'>
                            <div className='form-group-custom'>
                                <label>Connection Type</label>
                                <input type='text' className="form-control" value={details.connection_type} readOnly />
                            </div>
                            <div className='form-group-custom'>
                                <label>Location</label>
                                <input type='text' className="form-control" value={details.location} readOnly />
                            </div>
                            <div className='form-group-custom'>
                                <label>Coordinates</label>
                                <input type='text' className="form-control" value={details.coordinates} readOnly />
                            </div>
                        </div>
                        </form>
                    ) : (
                        <p>Cargando detalles...</p>
                    )}

                    <div className='below_container'>
                        <div className='content'>
                            <h5></h5>
                        </div>
                        <div className='buttons'>
                            <button type='button' className="btn btn-outline-primary">Listas Autorización</button>
                            <button type='button' className="btn btn-outline-primary">Perfiles Carga</button>
                            <button type='button' className="btn btn-outline-primary">Obtener Diagnostico</button>
                            <button type='button' className="btn btn-outline-primary" onClick={showModalUpdateFirmware}>Actualización Firmware</button>
                        </div>
                    </div>

                    <div className='header_table'>
                        <div className="title_container">
                            <h5>Eventos de Actualizacion de Firmware</h5>
                        </div>
                    </div>


                    <div className='scrollable_tbody details'>
                        <Table striped responsive>
                        <thead>
                            <tr>
                            <th>Nombre Archivo</th>
                            <th>Fecha Programada</th>
                            <th>Estado Actualización</th>
                            <th>Ultimo Evento</th>
                            </tr>
                        </thead>
                        <tbody > 
                            {tableStatusFirmware ? (
                            <tr>
                                <td>{tableStatusFirmware.file}</td>
                                <td>{tableStatusFirmware.schedule}</td>
                                <td>
                                    <div className="status-container">
                                    <div className={tableStatusFirmware.status !== undefined ? "circle " + mapStyle.get(tableStatusFirmware.status) : ""}></div>
                                        <span>{tableStatusFirmware.status}</span>
                                    </div>
                                </td>
                                <td>{tableStatusFirmware.timestamp}</td>
                            </tr>
                            ) : 
                            <tr>
                                <td colSpan={4}>No hay datos disponibles</td>
                            </tr>}
                        </tbody>
                        </Table>
                    </div>

                </div>

            </div>
            <MyModal modalData={modalData} onHide={() => onHideModal(modalData.title)}/>
            <ModalUpdateFirmware show={modalUpdateFirmware} onHide={() => {setModalUpdateFirmware(false)}} acept={handleUpdateFirmware}/>
        </>
    )
}


/*

                <div className='custom-div-hijo-2'>
                    <div className='header_table'>
                        <div className="title_container">
                            <h5>Detalles del cargador</h5>
                        </div>
                        <div className="controls_container">
                            <button type='button' className="btn btn-outline-primary">Editar Información</button>
                            <input type="text" className="form-control" placeholder="Buscar"/>
                        </div>
                    </div>


                    {details ? (
                        <form className='details-container'>
                        <div className='column'>
                            <div className='form-group'>
                                <label>Identificador</label>
                                <input type='text' className="form-control" value={details.id} readOnly />
                            </div>
                            <div className='form-group'>
                                <label>Fabricante</label>
                                <input type='text'className="form-control" value={details.vendor} readOnly />
                            </div>
                            <div className='form-group'>
                                <label>Serial Number</label>
                                <input type='text' className="form-control" value={details.serial_number} readOnly />
                            </div>
                        </div>
                        <div className='column'>
                            <div className='form-group'>
                                <label>Firmware Version</label>
                                <input type='text' className="form-control" value={details.firmware_version} readOnly />
                            </div>
                            <div className='form-group'>
                                <label>ICC ID</label>
                                <input type='text' className="form-control" value={details.icc_id} readOnly />
                            </div>
                            <div className='form-group'>
                                <label>IMSI</label>
                                <input type='text' className="form-control" value={details.imsi} readOnly />
                            </div>
                        </div>
                        <div className='column'>
                            <div className='form-group'>
                                <label>Connection Type</label>
                                <input type='text' className="form-control" value={details.connection_type} readOnly />
                            </div>
                            <div className='form-group'>
                                <label>Location</label>
                                <input type='text' className="form-control" value={details.location} readOnly />
                            </div>
                            <div className='form-group'>
                                <label>Coordinates</label>
                                <input type='text' className="form-control" value={details.coordinates} readOnly />
                            </div>
                        </div>
                        </form>
                    ) : (
                        <p>Cargando detalles...</p>
                    )}
                </div>
*/ 