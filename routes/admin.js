const express = require('express');
const router = express.Router(); //Router usado para separar rotas e organiza-las
const mongoose = require('mongoose');
require('../models/Categoria') // Acesso o arquivo Categoria da pasta model para usar no bd
const Categoria = mongoose.model('categorias'); // Passando o nome que esta no arquivo models/Categoria
require('../models/Postagem');
const Postagem = mongoose.model('postagens');
const {eAdmin}= require("../helpers/eAdmin");

router.get('/', eAdmin, (req, res) => { // arrow function, o mesmo que function (req, res){}
    res.render("admin/index");
});


//LISTANDO OS DADOS (Categorias) DO BANCO
router.get('/categorias', eAdmin, (req, res) => { 
    Categoria.find({}).sort({date:'desc'}).then((categorias) => {  //Comando que lista as categorias que existe no BD, e  ordena pela data decrescente
        res.render('admin/categorias', {categorias: categorias.map(categorias => categorias.toJSON())});
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias");
        res.redirect('/admin');
    }) 
});

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render("admin/addcategorias");
});

router.post('/categorias/nova', eAdmin, (req, res) => { //rota responsavel por cadastrar usuario no banco

    //validando formulário
    var erros = []; // array zerado

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"}); //adiciona um elemento no array criado informando o erro na validação
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"}); //adiciona um elemento no array criado informando o erro na validação
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria é muito pequeno!"});
    }

    if(erros.length > 0){ //se array for maior que 0, ou seja se tiver algum erro de autenticação
        res.render("admin/addcategorias", {erros: erros}); //o render passa dados pra view, no caso aqui é a addcategorias
    } else {

        const novaCategoria = { //pegando dados do formulário
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso"); //passa a msg de sucesso na variavel global success_mg e é exibido no partials/_msg.handlebars, caso o cadastro deu certo
            res.redirect("/admin/categorias"); //redireciona para a rota desejada se o cadastro obter sucesso
        }).catch((erro) => {
            req.flash("erro_msg", "Houve um erro ao salvar a categoria, tente novamente!"); //passa a msg de erro na variavel global error_msg e é exibido no partials/_msg.handlebars, caso o cadastro deu certo
            res.redirect("/admin"); //redireciona para a rota desejada se o cadastro obter erro
        });
    }
});

//EDITANDO AS CATEGORIAS
router.get('/categorias/edit/:id', eAdmin, (req, res) => {
    Categoria.findOne({_id:req.params.id}).lean().then((categorias) => {
        res.render('admin/editcategorias', {categorias: categorias});
    }).catch((erro) => {
        req.flash("error_msg", "Esta categoria não existe");
        res.redirect("/admin/categorias");
    });
});

router.post('/categorias/edit', eAdmin, (req, res) => { //concluindo alteração das categorias

//Validando Edição

    var erros = []; // array zerado

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    erros.push({texto: "Nome inválido"}); //adiciona um elemento no array criado informando o erro na validação
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"}); //adiciona um elemento no array criado informando o erro na validação
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria é muito pequeno!"});
    }

    if(erros.length > 0){ //se array for maior que 0, ou seja se tiver algum erro de autenticação
        res.render("admin/addcategorias", {erros: erros}); //o render passa dados pra view, no caso aqui é a addcategorias
    } else {

        Categoria.findOne({_id:req.body.id}).then((categorias) => {
        
            categorias.nome = req.body.nome //recebendo o dado do formulário e passando pro banco
            categorias.slug = req.body.slug //recebendo o dado do formulário e passando pro banco

            categorias.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso");
                res.redirect("/admin/categorias");
            }).catch((erro) => {
                req.flash("error_msg", "Houve um erro interno ao salvar a edição");
                res.redirect("/admin/categorias");
            });

        }).catch((erro) => {
            req.flash("error_msg", "Houve um erro ao editar a categoria");
            res.redirect("/admin/categorias");
        });
    };
});



//DELETANDO CATEGORIAS

router.post('/categorias/deletar', eAdmin, (req, res) => {

    Categoria.remove({_id:req.body.id}).then((categorias) => {
        req.flash("success_msg", "Categoria deletada com sucesso!");
        res.redirect("/admin/categorias");
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao deletar a categoria");
        res.redirect("/admin/categorias");
    });
});

//LISTANDO POSTAGENS

router.get('/postagens', eAdmin, (req, res) => {
    Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => {
        res.render("admin/postagens", {postagens: postagens});
    }).catch((error) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens");
        res.redirect("/admin");
    })
});

//ADD POSTAGENS

router.get('/postagens/add', eAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagem", {categorias: categorias});
    }).catch((error) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário");
    })
    
})


router.post('/postagens/nova', eAdmin, (req, res) => {

    var erros = [];

    if(req.body.categoria == "0"){
        erros.push({text:"Categoria inválida, registre uma categoria"});
    }

    if(erros.length > 0) {
        res.render("admin/addpostagem", {erros: erros});

    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso");
            res.redirect("/admin/postagens");
        }).catch ((error) => {
            req.flash("error_msg", "Houve um erro no salvamento da postagem");
            res.redirect("/admin/postagens");
        })
    }
})

//EDITANDO POSTAGENS

router.get('/postagens/edit/:id', eAdmin, (req, res) => {

    Postagem.findOne({_id:req.params.id}).lean().then((postagens) => {

        Categoria.find().lean().then((categorias) => {
            res.render('admin/editpostagens', {categorias: categorias, postagens: postagens});
        }).catch((error) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias");
            res.redirect("/admin/postagens");
        })
        
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição");
        res.redirect("/admin/postagens");
    });
});

router.post('/postagens/edit', eAdmin, (req, res) => { //concluindo alteração das categorias

    //Validando Edição
    
            Postagem.findOne({_id:req.body.id}).then((postagens) => {
            
                postagens.titulo = req.body.titulo //recebendo o dado do formulário e passando pro banco
                postagens.slug = req.body.slug
                postagens.descricao = req.body.descricao 
                postagens.conteudo = req.body.conteudo 
                postagens.categoria = req.body.categoria 
    
                postagens.save().then(() => {
                    req.flash("success_msg", "Postagem editada com sucesso");
                    res.redirect("/admin/postagens");
                }).catch((erro) => {
                    req.flash("error_msg", "Houve um erro interno ao salvar a edição");
                    res.redirect("/admin/postagens");
                });
    
            }).catch((erro) => {
                req.flash("error_msg", "Houve um erro ao editar a postagem");
                res.redirect("/admin/postagens");
            });
});

//DELETANDO POSTAGENS

router.post('/postagens/deletar', eAdmin, (req, res) => {

    Postagem.remove({_id:req.body.id}).then((postagens) => {
        req.flash("success_msg", "Postagem deletada com sucesso!");
        res.redirect("/admin/postagens");
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao deletar a postagem");
        res.redirect("/admin/postagens");
    });
});


//Exportando módulos
module.exports = router;