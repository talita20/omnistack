const Booking = require('../models/Booking');

module.exports = {
    async store(req, res) {
        const { user_id } = req.headers;
        const { spot_id } = req.params;
        const { date } = req.body;

        const booking = await Booking.create({
            user: user_id,
            spot: spot_id,
            date,
        });

        await booking.populate('spot').populate('user').execPopulate(); // populando o registro com os demais dados da tabela de usuários

        const ownerSocket = req.connectedUsers[booking.spot.user]; // verifica se o dono do spot está na conexão em tempo real

        if(ownerSocket){
            req.io.to(ownerSocket).emit('booking_request', booking);
        }

        return res.json(booking);
    }
};