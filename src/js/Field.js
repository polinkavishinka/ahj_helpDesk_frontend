/* eslint-disable no-param-reassign */
import uniqid from 'uniqid';

export default class Field {

  init() {
    this.renderField();
    this.openForms();
    this.redrawAllTickets();
  }

  renderField() {
    this.field = document.createElement('div');
    this.field.classList.add('field');
    const header = document.createElement('div');
    header.classList.add('header');
    const addBtn = document.createElement('button');
    addBtn.classList.add('add-button');
    addBtn.classList.add('btn');
    addBtn.innerText = 'Добавить тикет';
    header.appendChild(addBtn);
    const ticketList = document.createElement('ul');
    ticketList.classList.add('ticket-list');
    this.field.appendChild(header);
    this.field.appendChild(ticketList);
    document.querySelector('body').appendChild(this.field);
    this.addForm = document.createElement('form');
    this.addForm.classList.add('add-form');
    this.addForm.classList.add('modal');
    this.addForm.innerHTML = '<div class = \'form-header-wrapper\'> <h3 class = \'form-header\'> Добавить тикет </h3></div>';
    this.addForm.innerHTML += '<div class = \'input-wrapper\'> <h4 class = \'input-header\'> Краткое описание </h4> <input class = \'form-input\' id = \'short-desc\'>  </div>';
    this.addForm.innerHTML += '<div class = \'input-wrapper\'> <h4 class = \'input-header\'> Полное описание </h4> <textarea id = \'full-desc\'> </textarea></div>';
    this.addForm.innerHTML += '<div class = \'btn-group\'> <button class = \'btn cancel-button\'> Отмена </button> <button class = \'btn ok-button\'> OK </button></div>';
    this.addForm.querySelector('.cancel-button').addEventListener('click', (evt) => {
      evt.preventDefault();
      evt.target.closest('.modal').remove();
    });
    this.addForm.querySelector('.ok-button').addEventListener('click', (evt) => {
      evt.preventDefault();
      this.addNewTicket();
      evt.target.closest('.modal').remove();
    });
  }

  showAddForm() {
    document.querySelector('.field').appendChild(this.addForm);
  }

  showRemoveForm(ticket) {
    this.removeForm = document.createElement('div');
    this.removeForm.classList.add('remove-form');
    this.removeForm.classList.add('modal');
    this.removeForm.innerHTML = '<div class = \'form-header-wrapper\'> <h3 class = \'form-header\'> Удалить тикет </h3></div>';
    this.removeForm.innerHTML += '<div class = \'remove-form-wrapper\'> Вы действительно хотите удалить тикет? Это действие необратимо. </div>';
    this.removeForm.innerHTML += '<div class = \'btn-group\'> <button class = \'btn cancel-button\'> Отмена </button> <button class = \'btn ok-button\'> OK </button></div>';
    document.querySelector('.field').appendChild(this.removeForm);
    this.removeForm.querySelector('.ok-button').addEventListener('click', (evt) => {
      evt.preventDefault();
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${this.url}?removeTicket`, true);
      xhr.send(ticket.id);
      ticket.remove();
      this.removeForm.remove();
    });

    this.removeForm.querySelector('.cancel-button').addEventListener('click', (evt) => {
      evt.preventDefault();
      this.removeForm.remove();
    });
  }

  showEditForm(ticket) {
    this.editForm = document.createElement('form');
    this.editForm.classList.add('edit-form');
    this.editForm.classList.add('modal');
    this.editForm.innerHTML = '<div class = \'form-header-wrapper\'> <h3 class = \'form-header\'> Изменить тикет </h3></div>';
    this.editForm.innerHTML += `<div class = 'input-wrapper'> <h4 class = 'input-header'> Краткое описание </h4> <input class = 'form-input' id = 'short-desc' value = ${ticket.querySelector('.ticket-short-desc').innerText}></div>`;
    this.editForm.innerHTML += `<div class = 'input-wrapper'> <h4 class = 'input-header'> Полное описание </h4> <textarea id = 'full-desc' > ${ticket.querySelector('.ticket-full-desc').innerText} </textarea></div>`;
    this.editForm.innerHTML += '<div class = \'btn-group\'> <button class = \'btn cancel-button\'> Отмена </button> <button class = \'btn ok-button\'> OK </button></div>';
    document.querySelector('.field').appendChild(this.editForm);
    this.editForm.querySelector('.ok-button').addEventListener('click', (evt) => {
      evt.preventDefault();
      const shortDesc = document.getElementById('short-desc').value;
      ticket.querySelector('.ticket-short-desc').innerText = shortDesc;
      const fullDesc = document.getElementById('full-desc').value;
      ticket.querySelector('.ticket-full-desc').innerText = fullDesc;
      let isReady = 'false';
      if (ticket.querySelector('.ticket-status').classList.contains('ready')) {
        isReady = 'true';
      }
      const { created } = ticket.dataset;
      const editTicket = new FormData();
      editTicket.append('name', shortDesc);
      editTicket.append('description', fullDesc);
      editTicket.append('status', isReady);
      editTicket.append('created', created);
      editTicket.append('id', ticket.id);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${this.url}?editTicket`, true);
      xhr.send(editTicket);
      this.editForm.remove();
    });
    this.editForm.querySelector('.cancel-button').addEventListener('click', (evt) => {
      evt.preventDefault();
      this.editForm.remove();
    });
  }

  createTicket(shortDesc, fullDesc, status, created) {
    const ticket = document.createElement('li');
    ticket.classList.add('ticket');
    const createDate = `${new Date(created).toLocaleDateString()}, ${new Date(created).toLocaleTimeString()}`;
    ticket.innerHTML = `<div class = 'ticket-header'> <div class = 'ticket-status ${status}'></div> <div class = 'ticket-short-desc'> ${shortDesc}</div><div class = 'ticket-time'> ${createDate} </div> <div class = 'edit-ticket'> </div> <div class ='remove-ticket'> </div> </div> <div class = 'ticket-full-desc'> ${fullDesc} </div>`;
    ticket.querySelector('.ticket-status').addEventListener('click', (evt) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${this.url}?changeStatus`, true);
      xhr.send(ticket.id);
      if (evt.target.classList.contains('unready')) {
        evt.target.classList.remove('unready');
        evt.target.classList.add('ready');
      } else {
        evt.target.classList.remove('ready');
        evt.target.classList.add('unready');
      }
    });
    ticket.querySelector('.ticket-short-desc').addEventListener('click', (evt) => {
      if (evt.target.closest('.ticket').querySelector('.ticket-full-desc').classList.contains('visible') === false) {
        evt.target.closest('.ticket').querySelector('.ticket-full-desc').classList.add('visible');
      } else evt.target.closest('.ticket').querySelector('.ticket-full-desc').classList.remove('visible');
    });

    ticket.querySelector('.remove-ticket').addEventListener('click', () => {
      this.showRemoveForm(ticket);
    });

    ticket.querySelector('.edit-ticket').addEventListener('click', () => {
      this.showEditForm(ticket);
    });
    return ticket;
  }

  openForms() {
    document.querySelector('.add-button').addEventListener('click', (evt) => {
      evt.preventDefault();
      this.showAddForm();
    });
  }

  addNewTicket() {
    const shortDesc = document.getElementById('short-desc').value;
    const fullDesc = document.getElementById('full-desc').value;
    if (!shortDesc || !fullDesc) {
      return false;
    }
    const id = uniqid();
    const newTicket = new FormData();
    const created = Date.now();
    newTicket.append('name', shortDesc);
    newTicket.append('description', fullDesc);
    newTicket.append('status', 'false');
    newTicket.append('created', created);
    newTicket.append('id', id);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${this.url}?newTicket`, true);
    xhr.send(newTicket);
    const ticket = this.createTicket(shortDesc, fullDesc, 'unready', created);
    ticket.id = id;
    ticket.dataset.created = created;
    document.querySelector('.ticket-list').appendChild(ticket);
    return false;
  }

  redrawAllTickets() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${this.url}?allTickets`, true);
    xhr.addEventListener('readystatechange', () => {
      if (xhr.readyState === 4) {
        const tickets = JSON.parse(xhr.response);
        for (const element of tickets) {
          let ticketStatus;
          if (element.status === 'true') {
            ticketStatus = 'ready';
          }
          if (element.status === 'false') {
            ticketStatus = 'unready';
          }
          // eslint-disable-next-line
          const ticket = this.createTicket(element.name, element.description, ticketStatus, new Date(Number(element.created)));
          ticket.id = element.id;
          ticket.dataset.created = element.created;
          document.querySelector('ul').appendChild(ticket);
        }
      }
    });
    xhr.send();
  }
}
