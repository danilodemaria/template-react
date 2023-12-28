'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col,
  Alert,
} from 'reactstrap';
import DataTable from 'react-data-table-component';
import SweetAlert from 'react-bootstrap-sweetalert';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {
  const [bookings, setBooking] = useState([]);
  const [bookingsDone, setBookingDone] = useState([]);
  const [client, setClient] = useState({});
  const [modal, setModal] = useState(false);
  const [state, setState] = useState({
    showAlertSuccess: false,
    pager: { page: 0, total: 0 },
  });
  const toggle = () => setModal(!modal);

  const { showAlertSuccess } = state;

  const getBookings = async () => {
    const {
      pager: { page },
    } = state;
    try {
      const respApi = await axios.get(
        `https://backend-recepcao-checkin-dev-xgpk.4.us-1.fl0.io/api/booking?page=${page}&token=6hrFDATxrG9w14QY9wwnmVhLE0Wg6LIvwOwUaxz761m1JfRp4rs8Mzozk5xhSkw0_MQz6`
      );
      const {
        data: { count, rows },
      } = respApi;
      setBooking(rows);
      setState((prevState) => ({
        ...prevState,
        pager: { ...prevState.pager, total: count },
      }));
    } catch (err) {
      console.log(err);
    }
  };

  const getBookingsDone = async () => {
    try {
      const respApi = await axios.get(
        'https://backend-recepcao-checkin-dev-xgpk.4.us-1.fl0.io/api/booking/all?token=6hrFDATxrG9w14QY9wwnmVhLE0Wg6LIvwOwUaxz761m1JfRp4rs8Mzozk5xhSkw0_MQz6'
      );
      const { data } = respApi;
      setBookingDone(data);
    } catch (err) {
      console.log(err);
    }
  };

  const showAlert = () => {
    setState((prevState) => ({ ...prevState, showAlertSuccess: true }));
  };

  const handleAlert = async () => {
    try {
      const respApi = await axios.post(
        'https://backend-recepcao-checkin-dev-xgpk.4.us-1.fl0.io/api/booking/update',
        { id: client.id }
      );
      const { data } = respApi;
      setState((prevState) => ({ ...prevState, showAlertSuccess: false }));
      setModal(!modal);
      getBookings();
      getBookingsDone();
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCancel = () => {
    setState((prevState) => ({ ...prevState, showAlertSuccess: false }));
  };

  const handleButtonClick = (row) => {
    setClient(row);
    setModal(!modal);
  };

  const handleSetNotRead = async (e, row) => {
    try {
      const respApi = await axios.post(
        'https://backend-recepcao-checkin-dev-xgpk.4.us-1.fl0.io/api/booking/unread',
        { id: row.id }
      );
      const { data } = respApi;
      setState((prevState) => ({ ...prevState, showAlertSuccess: false }));
      getBookings();
      getBookingsDone();
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  const renderDataTable = () => {
    const {
      pager: { total },
    } = state;
    const options = {
      rowsPerPageText: 'Por Página:',
      rangeSeparatorText: 'de',
      noRowsPerPage: true,
      selectAllRowsItem: false,
      selectAllRowsItemText: 'Mostrar Todos',
    };
    const columns = [
      {
        name: 'ID',
        selector: 'id',
        sortable: true,
      },
      {
        name: 'Código da Reserva',
        selector: 'id_booking',
        sortable: true,
      },
      {
        name: 'Nome',
        selector: 'name',
        sortable: true,
      },
      {
        name: 'CPF',
        selector: 'cpf',
        sortable: false,
      },
      {
        name: 'Data de Entrada',
        selector: 'check_in_date',
        sortable: true,
      },
      {
        name: 'Visualizar',
        sortable: false,
        cell: (row) => (
          <Button
            onClick={() => handleButtonClick(row)}
            size='sm'
            color='primary'
          >
            Visualizar
          </Button>
        ),
      },
    ];

    return (
      <DataTable
        columns={columns}
        data={bookings}
        noHeader
        subHeader={false}
        noDataComponent='SEM NOVOS CHECK-INS'
        pagination
        paginationServer
        paginationTotalRows={total}
        paginationComponentOptions={options}
        onChangePage={(page) => {
          setState((prevState) => ({
            ...prevState,
            pager: {
              ...prevState.pager,
              page: page - 1,
            },
          }));
        }}
      />
    );
  };

  const renderDataTableDone = () => {
    const columns = [
      {
        name: 'ID',
        selector: 'id',
        sortable: true,
      },
      {
        name: 'Código da Reserva',
        selector: 'id_booking',
        sortable: true,
      },
      {
        name: 'Nome',
        selector: 'name',
        sortable: true,
      },
      {
        name: 'CPF',
        selector: 'cpf',
        sortable: false,
      },
      {
        name: 'Data de Entrada',
        selector: 'check_in_date',
        sortable: true,
      },
      {
        name: 'Ação',
        sortable: false,
        cell: (row) => (
          <Button
            onClick={(e) => handleSetNotRead(e, row)}
            size='sm'
            color='primary'
          >
            Marcar como não feito
          </Button>
        ),
      },
    ];

    return (
      <DataTable
        columns={columns}
        data={bookingsDone}
        noHeader
        subHeader={false}
        noDataComponent='NENHUM DADO ENCONTRADO'
      />
    );
  };

  useEffect(() => {
    getBookings();
    getBookingsDone();
  }, []);

  return (
    <>
      <SweetAlert
        warning
        showCancel
        closeOnClickOutside={false}
        show={showAlertSuccess}
        title='Confirmação'
        onConfirm={handleAlert}
        onCancel={handleCancel}
        confirmBtnText='Confirmar'
        cancelBtnText='Cancelar'
      >
        Deseja realmente marcar este check-in como lido?
      </SweetAlert>
      <Alert
        style={{ marginTop: '20px', marginBottom: '30px' }}
        color='primary'
      >
        CHECK-IN PENDENTES
      </Alert>
      <div>{renderDataTable()}</div>
      <div>
        <Modal
          centered
          isOpen={modal}
          toggle={toggle}
          style={{ marginTop: '7px', display: 'block' }}
        >
          <ModalHeader>Dados do Check-In</ModalHeader>
          <ModalBody>
            <Row>
              <Col xs={9}>
                {client ? (
                  <ul>
                    <li>ID Desbravador: {client.id_booking}</li>
                    <li>Nome: {client.name}</li>
                    <li>Data de Aniversário: {client.birth_date}</li>
                    <li>Email: {client.email}</li>
                    <li>Data de check-in: {client.check_in_date}</li>
                    <li>Telefone: {client.phone_number}</li>
                    <li>Cep: {client.cep}</li>
                    <li>Rua: {client.street}</li>
                    <li>Bairro: {client.neighborhood}</li>
                    <li>Cidade: {client.city}</li>
                    <li>Estado: {client.state}</li>
                    <li>RG: {client.rg}</li>
                    <li>CPF: {client.cpf}</li>
                    <li>Profissão: {client.occupation}</li>
                    <li>Placa veículo: {client.license_plate}</li>
                    <li>Acompanhantes: {client.companions}</li>
                  </ul>
                ) : (
                  <p>Carregando...</p>
                )}
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter className='d-flex justify-content-between'>
            <Button onClick={showAlert} size='sm' color='success'>
              <i className='feather icon-send' /> Marcar como lido
            </Button>
          </ModalFooter>
        </Modal>
      </div>
      <Alert
        style={{ marginTop: '20px', marginBottom: '30px' }}
        color='success'
      >
        CHECK-IN EFETUADOS
      </Alert>
      <div>{renderDataTableDone()}</div>
    </>
  );
}
