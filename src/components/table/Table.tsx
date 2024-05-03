import React from 'react'
import { Table } from 'react-bootstrap';
import { ArrayInputData } from '../../interfaces/Table';

export const MyTable: React.FC<ArrayInputData> = ({data}) => {
  return (

    <div className='my-div'>

      <div className='header_table'>
          <div className="title_container">
              <h5>Puntos de Carga Registrados</h5>
          </div>
          <div className="controls_container">
              <button type="button" className="btn btn-outline-info">Configuración</button>
              <input type="text" className="form-control" placeholder="Buscar" value=""/>
          </div>
      </div>

      <div className='scrollable_tbody'>
        <Table striped>
          <thead>
            <tr>
              <th>ID</th>
              <th>Marca</th>
              <th>Fase</th>
              <th>Conectores</th>
              <th>Ver</th>
              <th>Editar</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody > 
              {data && data.length > 0 ? (
                data.map((row, index) => (
                  <tr key={index}>
                    <td>{row.id}</td>
                    <td>{row.vendor}</td>
                    <td>{row.connectionType}</td>
                    <td>{row.numberConnectors}</td>
                    <td><button type="button" className="btn btn-outline-primary">Ver</button></td>
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
  )
}
