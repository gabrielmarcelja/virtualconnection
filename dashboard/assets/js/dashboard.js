document.addEventListener('DOMContentLoaded', () => {
    const contactsContainer = document.getElementById('contactsContainer');
    const addContactBtn = document.getElementById('addContactBtn');
    const addContactForm = document.getElementById('addContactForm');
    const contactForm = document.getElementById('contactForm');
    const cancelAddBtn = document.getElementById('cancelAddBtn');
    const editContactForm = document.getElementById('editContactForm');
    const editForm = document.getElementById('editForm');
    const cancelEditBtn = document.getElementById('cancelEditBtn');

    function checkSession() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/dashboard/check_session', true); 
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.status === 'success') {
                        loadContacts();
                    } else {
                        window.location.href = '/auth/login';
                    }
                } else {
                    contactsContainer.innerHTML = '<p class="error">Erro ao verificar sessão.</p>';
                }
            }
        };
        xhr.send();
    }

    function loadContacts() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/dashboard/get_contacts', true); 
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.status === 'success') {
                        contatosOriginais = response.contacts;
                        renderContacts(contatosOriginais);
                    } else {
                        contactsContainer.innerHTML = `<p class="error">${response.message}</p>`;
                    }
                } else {
                    contactsContainer.innerHTML = '<p class="error">Erro ao carregar contatos.</p>';
                }
            }
        };
        xhr.send();
    }

    
    let contatosOriginais = []; 
    let contatosFiltrados = []; 

    function renderContacts(contacts) {
        contatosFiltrados = contacts; 
        contactsContainer.innerHTML = '';
    
        if (contacts.length === 0) {
            contactsContainer.innerHTML = '<p>Nenhum contato encontrado.</p>';
            return;
        }
    
        contacts.forEach(contact => {
            const contactDiv = document.createElement('div');
            contactDiv.className = 'contactContainer';
            contactDiv.innerHTML = `
                <div class="contactContainertwo">
                    <p class="contactName">${escapeHTML(contact.Nome)}</p>
                    <a href="#" class="deleteContact" data-id="${contact.Id_Contato}">Excluir</a>
                </div>
                <div class="contactInfo">
                    <div class="contactInfoContainer">
                        <input type="email" class="contactEmail contactinput" value="${escapeHTML(contact.Email)}" readonly>
                        <a href="#" class="editContact" data-id="${contact.Id_Contato}">Editar</a>
                    </div>
                    <div class="contactInfoContainer">
                        <input type="text" class="contactTelefone contactinput" value="${escapeHTML(contact.Telefone)}" readonly>
                        <a href="#" class="editContact" data-id="${contact.Id_Contato}">Editar</a>
                    </div>
                </div>
            `;
            contactsContainer.appendChild(contactDiv);
        });
    
        atribuirEventos();
    }
    

function atribuirEventos() {
    document.querySelectorAll('.editContact').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const contactId = link.getAttribute('data-id');
            editContact(contactId);
        });
    });

    document.querySelectorAll('.deleteContact').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const contactId = link.getAttribute('data-id');
            deleteContact(contactId);
        });
    });
}


    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    addContactBtn.addEventListener('click', () => {
        addContactForm.classList.toggle('hidden');
        editContactForm.classList.add('hidden');
    });

    cancelAddBtn.addEventListener('click', () => {
        addContactForm.classList.add('hidden');
        contactForm.reset();
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const phone = document.getElementById('contactPhone').value.trim();

        if (name.length < 2) {
            alert('O nome deve ter pelo menos 2 caracteres.');
            return;
        }
        if (email.length > 0) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Por favor, insira um email válido ou deixe em branco.');
                return;
            }
        }
        if (phone.length < 1) {
            alert('O telefone não pode estar vazio.');
            return;
        }

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/dashboard/add_contact', true); 
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.status === 'success') {
                        addContactForm.classList.add('hidden');
                        contactForm.reset();
                        loadContacts();
                    } else {
                        alert(response.message);
                    }
                } else {
                    alert('Erro na comunicação com o servidor.');
                }
            }
        };

        const data = `name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`;
        xhr.send(data);
    });

    function editContact(contactId) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `/dashboard/get_contacts?id=${contactId}`, true); 
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.status === 'success' && response.contacts.length > 0) {
                    const contact = response.contacts[0];
                    document.getElementById('editContactId').value = contact.Id_Contato;
                    document.getElementById('editContactName').value = contact.Nome;
                    document.getElementById('editContactEmail').value = contact.Email;
                    document.getElementById('editContactPhone').value = contact.Telefone;
                    editContactForm.classList.remove('hidden');
                    addContactForm.classList.add('hidden');
                }
            }
        };
        xhr.send();
    }

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('editContactId').value;
        const name = document.getElementById('editContactName').value.trim();
        const email = document.getElementById('editContactEmail').value.trim();
        const phone = document.getElementById('editContactPhone').value.trim();

        if (name.length < 2) {
            alert('O nome deve ter pelo menos 2 caracteres.');
            return;
        }
        if (email.length > 0) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Por favor, insira um email válido ou deixe em branco.');
                return;
            }
        }
        if (phone.length < 1) {
            alert('O telefone não pode estar vazio.');
            return;
        }

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/dashboard/edit_contact', true); 
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.status === 'success') {
                        editContactForm.classList.add('hidden');
                        editForm.reset();
                        loadContacts();
                    } else {
                        alert(response.message);
                    }
                } else {
                    alert('Erro na comunicação com o servidor.');
                }
            }
        };

        const data = `id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`;
        xhr.send(data);
    });

    cancelEditBtn.addEventListener('click', () => {
        editContactForm.classList.add('hidden');
        editForm.reset();
    });

    function deleteContact(contactId) {
        if (confirm('Tem certeza que deseja excluir este contato?')) {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `/dashboard/delete_contact?id=${contactId}`, true); 
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        if (response.status === 'success') {
                            loadContacts();
                        } else {
                            alert(response.message);
                        }
                    } else {
                        alert('Erro na comunicação com o servidor.');
                    }
                }
            };
            xhr.send();
        }
    }
    const searchInput = document.getElementById('searchbarInput');

    searchInput.addEventListener('input', () => {
        const termo = searchInput.value.toLowerCase();
    
        const filtrados = contatosOriginais.filter(c =>
            c.Nome.toLowerCase().includes(termo) ||
            c.Email.toLowerCase().includes(termo) ||
            c.Telefone.toLowerCase().includes(termo)
        );
    
        renderContacts(filtrados);
    });
    
    
    checkSession();
});