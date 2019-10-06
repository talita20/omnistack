const express = require('express'); //express é um microframework (com definição de rotas, etc)
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const socketio = require('socket.io');
const http = require('http');

const routes = require('./routes');

const app = express();
const server = http.Server(app); //servidor http
const io = socketio(server); //o servidor passa a ouvir o socket

const connectedUsers = {};

mongoose.connect('mongodb://omnistack:omnistack@omnistack-shard-00-00-i8xix.mongodb.net:27017,omnistack-shard-00-01-i8xix.mongodb.net:27017,omnistack-shard-00-02-i8xix.mongodb.net:27017/test?ssl=true&replicaSet=OmniStack-shard-0&authSource=admin&retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

io.on('connection', socket => {
    //console.log(socket.handshake.query);
    //console.log('Usuário conectado', socket.id);

    const { user_id } = socket.handshake.query;

    connectedUsers[user_id] = socket.id; //relacionando o id do usuário com o id de conexão dele

    /*setTimeout(() => {
        socket.emit('hello', 'World');
    }, 4000);*/

    socket.on('omni', data => {
        console.log(data);
    })
});

app.use((req, res, next) => {
    req.io = io;
    req.connectedUsers = connectedUsers;

    return next();
}); // adicionando uma funcionalidade em todas as rotas

// GET (buscar uma informação), POST (criar uma nova informação), PUT (editar alguma informação), DELETE (deletar uma informação)

// req.query => acessar query params (para filtros)
// req.params => acessar route params (para edição e delete)
// req.body => acessar corpo da requisição (para criação e edição)

/*app.get('/users', (req, res) => { //Rota. O req é a requisição e o res a resposta
    return res.json({ idade: req.query.idade }); //sempre enviar um objeto ou um array. NUNCA enviar uma variável
});

app.put('/users/:id', (req, res) => {
    return res.json({ idade: req.params.id });
});*/

app.use(cors());
app.use(express.json()); //falando pro express utilizar o json
app.use('/files', express.static(path.resolve(__dirname, '..', 'uploads'))); //retorno de arquivos
app.use(routes);

server.listen(3333); //escolhendo a porta em que o servidor vai rodar