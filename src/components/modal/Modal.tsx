import { Modal, Button, Form } from "react-bootstrap";
import { ModalInput, ModalUpdateInput } from "../../interfaces/Modal";
import { useState} from 'react'
import './Modal.css'

export const MyModal: React.FC<ModalInput> = ({modalData, onHide}) =>{
    return (
        <Modal show={modalData.show} onHide={onHide}>
            <Modal.Header>
                <Modal.Title>{modalData.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {modalData.cause}
            </Modal.Body>
            <Modal.Footer>
                <Button variant={modalData.variant} onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    )
}

export const ModalUpdateFirmware: React.FC<ModalUpdateInput> = ({show, onHide, acept}) => {
    const [scheduleDateTime, setScheduleDateTime] = useState('');
    const [retrieveDate, setRetrieveDate] = useState('');

    const handleAccept = () => {
        const dateTime = new Date(scheduleDateTime);
        const formattedDateTime = `${dateTime.getFullYear()}-${String(dateTime.getMonth() + 1).padStart(2, '0')}-${String(dateTime.getDate()).padStart(2, '0')} ${String(dateTime.getHours()).padStart(2, '0')}:${String(dateTime.getMinutes()).padStart(2, '0')}:${String(dateTime.getSeconds()).padStart(2, '0')}`;
        acept(retrieveDate, formattedDateTime);
      };
  
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header>
                <Modal.Title>Firmware Update Scheduling</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formDateTime" className="ModalUpdate-group">
                        <Form.Label className="ModalUpdate-label">Date and Time of Update</Form.Label>
                        <Form.Control className="ModalUpdate-input"
                        type="datetime-local"
                        value={scheduleDateTime}
                        onChange={(e) => setScheduleDateTime(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="formRetrieveDate">
                        <Form.Label className="ModalUpdate-label">Number of Retries</Form.Label>
                        <Form.Control className="ModalUpdate-input"
                        type="number"
                        min="1"
                        max="5"
                        value={retrieveDate}
                        onChange={(e) => setRetrieveDate(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={onHide}>Cancel</Button>
                <Button variant="primary" onClick={handleAccept}>Schedule</Button>
            </Modal.Footer>
        </Modal>
    )
};
