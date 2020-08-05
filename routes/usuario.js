const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");
const bcrypt = require("bcryptjs"); //modulo para codificar senha
const passport = require("passport"); //carregando modulo passport
const eAdmin = require("../helpers/eAdmin");

//registrando usuarios

router.get("/registro", (req, res) => {
    res.render("usuarios/registro");
});

router.post("/registro", (req, res) => {

    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: "Nome inválido!"});
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({texto: "E-mail inválido!"});
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({texto: "Senha inválida!"});
    }

    if(req.body.senha.length < 4) {
        erros.push({texto: "Senha muita curta!"});
    }

    if(req.body.senha != req.body.senha2) {
        erros.push({texto: "As senha não correspondem, tente novamente!"});
    }

    if(erros.length > 0) {

        res.render("usuarios/registro", {erros: erros});

    }else{ //responsavel por cadastrar o novo usuario

        Usuario.findOne({email: req.body.email}).lean().then((usuario) => {

            if(usuario){
                req.flash("error_msg", "Já exite uma conta com esse e-mail no nosso sistema");
                res.redirect("/usuarios/registro");
            }else{

                const novoUsuario = new Usuario ({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                    //campo criado para definir um admin
                    //eAdmin: 1
                })
                
                //codificando a senha com bcrypt - hash
                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro) {
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário!");
                            res.redirect("/");
                        }
                    
                        novoUsuario.senha = hash;

                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuário criado com sucesso");
                            res.redirect("/");

                        }).catch((error) => {
                            req.flash("error_msg", "Houve um erro ao criar o usuário! Tente novamente");
                            res.redirect("/usuarios/registro");
                        })
                    })
                })
            }

        }).catch((error) => {
            req.flash("error_msg", "Houve um erro interno");
            res.redirect("/");
        })
    }
})

//rota responsavel pelo formulario de login
router.get("/login", (req, res) => {
    res.render("usuarios/login");
})

//rota de autenticação
router.post("/login", (req, res, next) => {

    //funcao que autentica
    passport.authenticate("local", {

        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true

    })(req, res, next)
})

//rota que faz logout do usuario do sistema
router.get("/logout", (req, res) => {

    req.logout();
    req.flash("success_msg", "Deslogado com sucesso");
    res.redirect("/");

})

module.exports = router;