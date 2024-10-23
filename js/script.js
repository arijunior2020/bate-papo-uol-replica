// Variável global para armazenar o nome do usuário, destinatário e visibilidade
let nomeUsuario = '';
let destinatario = 'Todos';
let visibilidade = 'message'; // "message" para público ou "private_message" para reservado

// UUID gerado
const uuid = '6da9d1ba-ef51-4ae9-abf2-5e9b026741fd';

// Função para perguntar o nome do usuário e entrar na sala
function entrarSala() {
    nomeUsuario = prompt("Qual é o seu nome?");
    if (nomeUsuario) {
        axios.post(`https://mock-api.driven.com.br/api/v6/uol/participants/${uuid}`, {
            name: nomeUsuario
        })
        .then(response => {
            if (response.status === 200) {
                manterConexao();
                carregarMensagens();
                carregarParticipantes();
                setInterval(() => carregarMensagens(), 3000); // Atualizar mensagens a cada 3 segundos
                setInterval(() => carregarParticipantes(), 10000); // Atualizar lista de participantes a cada 10 segundos
            }
        })
        .catch(error => {
            alert('Nome já em uso! Escolha outro nome.');
            entrarSala(); // Solicitar um novo nome
        });
    }
}

// Função para manter a conexão viva com o servidor
function manterConexao() {
    setInterval(() => {
        axios.post(`https://mock-api.driven.com.br/api/v6/uol/status/${uuid}`, {
            name: nomeUsuario
        }).catch(error => {
            console.error("Erro ao manter conexão:", error);
        });
    }, 5000); // Enviar requisição a cada 5 segundos
}

// Função para carregar as mensagens do servidor
function carregarMensagens() {
    axios.get(`https://mock-api.driven.com.br/api/v6/uol/messages/${uuid}`)
        .then(response => {
            const mensagens = response.data;
            const messagesDiv = document.getElementById('messages');
            
            // Verificar se o usuário já está no final do chat
            const deveRolar = messagesDiv.scrollTop + messagesDiv.clientHeight === messagesDiv.scrollHeight;

            messagesDiv.innerHTML = ''; // Limpar mensagens antigas

            mensagens.forEach(mensagem => {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message');

                // Criar os spans para cada parte da mensagem
                const timeElement = document.createElement('span');
                timeElement.classList.add('time');
                timeElement.textContent = `(${mensagem.time})`;

                const fromElement = document.createElement('span');
                fromElement.classList.add('from');
                fromElement.textContent = mensagem.from;

                // Cria o span para o "para"
                const paraElement = document.createElement('span');
                paraElement.textContent = ' para ';

                // Cria o span para o destinatário
                const toElement = document.createElement('span');
                toElement.classList.add('to');
                
                // Verificar se o destinatário é "Todos" e aplicar negrito
                if (mensagem.to === 'Todos') {
                    const boldTo = document.createElement('strong'); // Usar <strong> para negrito
                    boldTo.textContent = 'Todos:';
                    toElement.appendChild(boldTo);
                } else {
                    toElement.textContent = `${mensagem.to}:`; // Destinatário comum
                }

                const textElement = document.createElement('span');
                textElement.classList.add('text');
                textElement.textContent = mensagem.text;

                // Construir a mensagem completa com os elementos criados
                if (mensagem.type === 'status') {
                    messageElement.classList.add('status');
                    // Para status, basta exibir quem entrou/saiu da sala
                    messageElement.appendChild(timeElement);
                    messageElement.appendChild(fromElement);
                    messageElement.appendChild(textElement);
                } else if (mensagem.type === 'private_message') {
                    if (mensagem.to === nomeUsuario || mensagem.from === nomeUsuario) {
                        messageElement.classList.add('private');
                        
                        const privateText = document.createElement('span');
                        privateText.textContent = ' reservadamente ';
                        
                        messageElement.appendChild(timeElement);
                        messageElement.appendChild(fromElement);
                        messageElement.appendChild(privateText);
                        messageElement.appendChild(paraElement);
                        messageElement.appendChild(toElement);
                        messageElement.appendChild(textElement);
                    }
                } else if (mensagem.type === 'message') {
                    messageElement.classList.add('normal');
                    messageElement.appendChild(timeElement);
                    messageElement.appendChild(fromElement);
                    messageElement.appendChild(paraElement);
                    messageElement.appendChild(toElement);
                    messageElement.appendChild(textElement);
                }

                if (messageElement.children.length > 0) {
                    messagesDiv.appendChild(messageElement);
                }
            });

            // Rolar automaticamente para o final se o usuário já estava no final do chat
            if (deveRolar) {
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }
        })
        .catch(error => {
            console.error("Erro ao carregar mensagens:", error);
        });
}

// Função para carregar a lista de participantes
function carregarParticipantes() {
    axios.get(`https://mock-api.driven.com.br/api/v6/uol/participants/${uuid}`)
        .then(response => {
            const participantes = response.data;
            const participantsList = document.getElementById('participants-list');
            participantsList.innerHTML = '<li data-to="Todos"><img src="img/people 2.png" alt="Todos"> Todos</li>'; // Reinicia a lista

            participantes.forEach(participante => {
                const li = document.createElement('li');
                li.innerHTML = `<img src="img/person-circle 2.png" alt="${participante.name}"> ${participante.name}`;
                li.setAttribute('data-to', participante.name);
                participantsList.appendChild(li);
            });
        })
        .catch(error => {
            console.error("Erro ao carregar participantes:", error);
        });
}

// Atualizar a mensagem sobre o destinatário e a visibilidade
function atualizarInfoEnvio() {
    const info = document.getElementById('send-info');
    const visibilidadeTexto = visibilidade === 'message' ? 'público' : 'reservadamente';
    info.textContent = `Enviando para ${destinatario} (${visibilidadeTexto})`;
}

// Abrir a barra lateral
document.getElementById('openSidebarBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('sidebar-open');
});

// Fechar a barra lateral ao clicar fora dela
document.addEventListener('click', (event) => {
    const sidebar = document.getElementById('sidebar');
    const openSidebarBtn = document.getElementById('openSidebarBtn');

    // Verifica se o clique foi fora da sidebar e do botão de abrir
    if (!sidebar.contains(event.target) && !openSidebarBtn.contains(event.target)) {
        sidebar.classList.remove('sidebar-open');
    }
});

// Selecionar destinatário e visibilidade
document.getElementById('sidebar').addEventListener('click', (event) => {
    const selectedElement = event.target.closest('li');
    
    // Se for selecionado um contato
    if (selectedElement && selectedElement.hasAttribute('data-to')) {
        destinatario = selectedElement.getAttribute('data-to');
        
        // Remove a classe 'selected' de todos os destinatários
        document.querySelectorAll('[data-to]').forEach(el => el.classList.remove('selected'));
        
        // Adiciona a classe 'selected' ao contato selecionado
        selectedElement.classList.add('selected');

        // Atualizar informações de envio
        atualizarInfoEnvio();
    }

    // Se for selecionada uma visibilidade (público/reservado)
    const selectedVisibility = event.target.getAttribute('data-visibility');
    if (selectedVisibility) {
        visibilidade = selectedVisibility === 'public' ? 'message' : 'private_message';
        
        // Remove a classe 'selected' de todas as visibilidades
        document.querySelectorAll('[data-visibility]').forEach(el => el.classList.remove('selected'));

        // Adiciona a classe 'selected' à visibilidade selecionada
        event.target.classList.add('selected');

        // Atualizar informações de envio
        atualizarInfoEnvio();
    }
});

// Função para enviar uma mensagem
document.getElementById('send-btn').addEventListener('click', () => {
    const mensagem = document.getElementById('message-input').value;

    if (mensagem) {
        axios.post(`https://mock-api.driven.com.br/api/v6/uol/messages/${uuid}`, {
            from: nomeUsuario,  // Agora usamos a variável global que contém o nome
            to: destinatario, // "Todos" para público ou participante específico para privado
            text: mensagem,
            type: visibilidade // "message" para público ou "private_message" para privado
        })
        .then(response => {
            carregarMensagens(); // Recarregar o chat após enviar a mensagem
            document.getElementById('message-input').value = ''; // Limpar o campo de mensagem
        })
        .catch(error => {
            console.error("Erro ao enviar mensagem:", error);
            window.location.reload(); // Se houver erro, recarregar a página
        });
    }
});

// Iniciar o processo
entrarSala();
