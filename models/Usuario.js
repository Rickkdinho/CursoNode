const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Usuario = new Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    senha: {
        type: String,
        required: true
    },

    //campo q faz controle de quem é admin se o campo for igual a 1 é admin
    eAdmin: {
        type: Number,
        default: 0
    }
})

mongoose.model("usuarios", Usuario);