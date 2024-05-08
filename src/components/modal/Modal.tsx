import { Modal, Button } from "react-bootstrap";
import { ModalInput } from "../../interfaces/Modal";

const MyModal: React.FC<ModalInput> = ({modalData, onHide}) =>{
    return (
        <Modal show={modalData.show} onHide={onHide}>
            <Modal.Header>
                <Modal.Title>{modalData.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {modalData.cause}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default MyModal;