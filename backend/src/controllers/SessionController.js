const User = require('../models/User');
// index (listagem), show (listar um único item), store (cadastrar), update (editar), destroy (deletar)

module.exports = {
    async store(req, res){ // async para mostrar que a função é assíncrona
        const { email } = req.body;

        let user = await User.findOne({ email });

        if(!user){
            user = await User.create({ email }); // await para esperar a criação do email acontecer para depois ir para a próxima tarefa
        }

        return res.json(user);
    }
};