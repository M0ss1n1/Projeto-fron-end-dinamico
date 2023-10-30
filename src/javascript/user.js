document.addEventListener('DOMContentLoaded', function () {
    const loggedInUser = localStorage.getItem('loggedInUser');
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const taskListComplete = document.getElementById('task-list-complete');
    const logoutButton = document.getElementById('logout-button');
    const clearCompletedButton = document.getElementById('clear-completed-button');

    if (!loggedInUser) {
        alert('Você precisa fazer login para acessar esta área.');
        window.location.href = './login.html';
    }
    enquote = 0
    function getQuote() {
        fetch('https://stoic-quotes.com/api/quote')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro na solicitação da API');
                }
                return response.json();
            })
            .then(data => {
                enquote = data.text
            })
        console.log(enquote)
    }

    // funcao para mostrar hora
    function carregar() {
        if (enquote == 0) { 
            getQuote() 
        }
        const msgdata = document.getElementById('datas')
        let data = new Date()
        let dia = data.getDay()
        let mes = data.getMonth()
        let ano = data.getFullYear()

        let hora = data.getHours()
        let min = data.getMinutes()
        if (min < 10) {
            min = "0" + min
        }

        if (hora >= 0 && hora < 13) { //bom dia
            msgdata.innerText = `Bom dia ${loggedInUser}, bora ver suas tarefas! Hoje é ${dia}/${mes}/${ano} e agora são ${hora}:${min}. O seu dia será motivado pelo seguinte pensamento estoico: ${enquote}`

        } else if (hora >= 13 && hora < 19) { //boa tarde
            msgdata.innerText = `Boa tarde ${loggedInUser}, bora ver suas tarefas! Hoje é ${dia}/${mes}/${ano} e agora são${hora}:${min}. O seu dia será motivado pelo seguinte pensamento estoico: ${enquote}`

        } else {//boa noite
            msgdata.innerText = `Boa noite ${loggedInUser}, bora ver suas tarefas! Hoje é ${dia}/${mes}/${ano} e agora são ${hora}:${min} . O seu dia será motivado pelo seguinte pensamento estoico: ${enquote}`
        }
    }

    setInterval(() => {
        carregar()
    }, 1000)

    //

    // Adiciona o evento de clique ao botão de logout
    logoutButton.addEventListener('click', function () {
        localStorage.removeItem('loggedInUser');
        window.location.href = '../../index.html';
    });

    // Carrega as tarefas concluídas no histórico
    loadCompletedTasks();

    // Adiciona o evento de clique ao botão "Limpar Concluídas"
    clearCompletedButton.addEventListener('click', function () {
        clearCompletedTasks();
    });

    // Adiciona o evento de clique ao botão de editar tarefa
    taskList.addEventListener('click', function (event) {
        if (event.target.tagName === 'BUTTON' && event.target.classList.contains('edit-button')) {
            const taskId = event.target.getAttribute('data-id');
            editTask(taskId);
        }
    });

    // Adiciona o evento de clique ao botão de completar tarefa
    taskList.addEventListener('click', function (event) {
        if (event.target.tagName === 'BUTTON' && event.target.classList.contains('complete-button')) {
            const taskId = event.target.getAttribute('data-id');
            completeTask(taskId);
        }
    });

    // Função para limpar as tarefas concluídas
    function clearCompletedTasks() {
        // Limpa as tarefas concluídas do histórico
        localStorage.removeItem(loggedInUser + "_completed");
        loadCompletedTasks(); // Atualiza a lista de tarefas concluídas (que agora estará vazia)
    }

    // Função para marcar uma tarefa como concluída
    function completeTask(taskId) {
        const userTasks = JSON.parse(localStorage.getItem(loggedInUser)) || [];
        const completedTask = userTasks.splice(taskId, 1)[0];
        completedTask.state = "Concluída";

        const completedTasksHistory = JSON.parse(localStorage.getItem(loggedInUser + "_completed")) || [];
        completedTasksHistory.push(completedTask);
        localStorage.setItem(loggedInUser + "_completed", JSON.stringify(completedTasksHistory));

        localStorage.setItem(loggedInUser, JSON.stringify(userTasks));
        loadTasks();
        loadCompletedTasks(); // Atualiza a lista de tarefas concluídas
    }

    function loadCompletedTasks() {
        const completedTasksHistory = JSON.parse(localStorage.getItem(loggedInUser + "_completed")) || [];

        taskListComplete.innerHTML = ''; // Limpa a lista de tarefas concluídas

        completedTasksHistory.forEach((task, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <strong>Nome:</strong> ${task.name}<br>
                <strong>Descrição:</strong> ${task.description}<br>
                <strong>Prazo:</strong> ${task.dueDate}<br>
                <strong>Estado:</strong> ${task.state}<br>
                <button data-id="${index}" class="undo-complete-button"><i class="fa-solid fa-rotate-left"></i>Desfazer Conclusão</button>
                <div class="espace"></div>
            `;
            taskListComplete.appendChild(listItem);

            // Adiciona o evento de clique ao botão "Desfazer Conclusão"
            const undoCompleteButton = listItem.querySelector('.undo-complete-button');
            undoCompleteButton.addEventListener('click', function () {
                undoCompleteTask(index);
            });
        });
    }

    // Função para desfazer a conclusão de uma tarefa
    function undoCompleteTask(taskId) {
        const completedTasksHistory = JSON.parse(localStorage.getItem(loggedInUser + "_completed")) || [];
        const undoneTask = completedTasksHistory.splice(taskId, 1)[0];
        undoneTask.state = "Pendente";

        // Salva a tarefa desfeita de volta na lista de tarefas pendentes
        const userTasks = JSON.parse(localStorage.getItem(loggedInUser)) || [];
        userTasks.push(undoneTask);
        localStorage.setItem(loggedInUser + "_completed", JSON.stringify(completedTasksHistory));
        localStorage.setItem(loggedInUser, JSON.stringify(userTasks));

        loadCompletedTasks(); // Atualiza a lista de tarefas concluídas
        loadTasks(); // Atualiza a lista de tarefas pendentes
    }

    // Adiciona o evento de clique ao botão de salvar edição de tarefa
    taskList.addEventListener('click', function (event) {
        if (event.target.tagName === 'BUTTON' && event.target.classList.contains('save-button')) {
            const taskId = event.target.getAttribute('data-id');
            saveTask(taskId);
        }
    });

    // Adiciona o evento de clique ao botão de cancelar edição de tarefa
    taskList.addEventListener('click', function (event) {
        if (event.target.tagName === 'BUTTON' && event.target.classList.contains('cancel-button')) {
            loadTasks(); // Carregue as tarefas para cancelar a edição
        }
    });

    // Adiciona o evento de clique ao botão de excluir tarefa
    taskList.addEventListener('click', function (event) {
        if (event.target.tagName === 'BUTTON' && event.target.classList.contains('delete-button')) {
            const taskId = event.target.getAttribute('data-id');
            deleteTask(taskId);
        }
    });

    function editTask(taskId) {
        const userTasks = JSON.parse(localStorage.getItem(loggedInUser)) || [];
        const taskItem = userTasks[taskId];

        // Cria elementos de input para editar a tarefa
        const editTaskName = document.createElement('input');
        editTaskName.value = taskItem.name;
        const editTaskDescription = document.createElement('input');
        editTaskDescription.value = taskItem.description;
        const editTaskDueDate = document.createElement('input');
        editTaskDueDate.type = 'date';
        editTaskDueDate.value = taskItem.dueDate;

        // Substitue o item da lista pela edição
        const listItem = taskList.children[taskId];
        listItem.innerHTML = '';
        listItem.appendChild(editTaskName);
        listItem.appendChild(editTaskDescription);
        listItem.appendChild(editTaskDueDate);

        // Adiciona botões para salvar ou cancelar a edição
        const saveButton = document.createElement('button');
        saveButton.classList.add('save-button');
        saveButton.setAttribute('data-id', taskId);
        saveButton.textContent = 'Salvar';
        const cancelButton = document.createElement('button');
        cancelButton.classList.add('cancel-button');
        cancelButton.setAttribute('data-id', taskId);
        cancelButton.textContent = 'Cancelar';

        listItem.appendChild(saveButton);
        listItem.appendChild(cancelButton);
    }

    function saveTask(taskId) {
        const userTasks = JSON.parse(localStorage.getItem(loggedInUser)) || [];
        const listItem = taskList.children[taskId];
        const editedTaskName = listItem.querySelector('input:nth-child(1)').value;
        const editedTaskDescription = listItem.querySelector('input:nth-child(2)').value;
        const editedTaskDueDate = listItem.querySelector('input:nth-child(3)').value;

        const currentDate = new Date().toISOString().split('T')[0];
        if (editedTaskDueDate < currentDate) {
            alert('Não é possível criar tarefas com datas anteriores à data atual.');
            return;
        }

        userTasks[taskId].name = editedTaskName;
        userTasks[taskId].description = editedTaskDescription;
        userTasks[taskId].dueDate = editedTaskDueDate;

        localStorage.setItem(loggedInUser, JSON.stringify(userTasks));
        loadTasks(); // Atualiza a lista de tarefas
    }

    function deleteTask(taskId) {
        const userTasks = JSON.parse(localStorage.getItem(loggedInUser)) || [];
        userTasks.splice(taskId, 1); // Remova a tarefa pelo índice
        localStorage.setItem(loggedInUser, JSON.stringify(userTasks));
        loadTasks(); // Atualiza a lista de tarefas
    }

    function clearTaskForm() {
        document.getElementById('task-name').value = '';
        document.getElementById('task-description').value = '';
        document.getElementById('task-due-date').value = '';
    }

    function loadTasks() {
        taskList.innerHTML = ''; // Limpa a lista de tarefas
        const userTasks = JSON.parse(localStorage.getItem(loggedInUser)) || [];

        // Ordena as tarefas por prazo
        userTasks.sort((a, b) => (a.dueDate > b.dueDate) ? 1 : -1);

        userTasks.forEach((task, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <strong class='tasknamee'>${task.name}</strong> <br>
                <strong>Descrição:</strong> ${task.description}<br>
                <strong>Prazo:</strong> ${task.dueDate}<br>
                <button data-id="${index}" class="complete-button"><i class="fa-regular fa-square-check"></i>Concluir</button>
                <button data-id="${index}" class="edit-button"><i class="fa-solid fa-pen"></i>Editar</button>
                <button data-id="${index}" class="delete-button"><i class="fa-solid fa-trash-can"></i>Excluir</button>
                <div class="espace"></div>
            `;
            taskList.appendChild(listItem);
        });
    }

    taskForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const taskName = document.getElementById('task-name').value;
        const taskDescription = document.getElementById('task-description').value;
        const taskDueDate = document.getElementById('task-due-date').value;

        const currentDate = new Date().toISOString().split('T')[0];
        if (taskDueDate < currentDate) {
            alert('Não é possível criar tarefas com datas anteriores à data atual.');
            return;
        }

        if (!taskName || !taskDueDate) {
            alert('Nome da Tarefa e Prazo são campos obrigatórios.');
            return;
        }

        const userTasks = JSON.parse(localStorage.getItem(loggedInUser)) || [];
        const newTask = {
            name: taskName,
            description: taskDescription,
            dueDate: taskDueDate,
            state: "Pendente", //Coloca o estado pendente por padrão
        };
        userTasks.push(newTask);
        localStorage.setItem(loggedInUser, JSON.stringify(userTasks));

        clearTaskForm();
        loadTasks();
    });

    loadTasks(); // Carrega as tarefas iniciais
});