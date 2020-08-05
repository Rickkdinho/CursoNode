//Carregando Módulos
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const admin = require('./routes/admin'); //pegando caminho da rota
const path = require('path'); //modulo para trabalhar com diretórios
const mongoose = require('mongoose'); //modulo para trabalhar com o BD - MongoDB
const session = require('express-session');
const flash = require('connect-flash');
require('./models/Postagem');
const Postagem = mongoose.model('postagens');
require('./models/Categoria');
const Categoria = mongoose.model('categorias');
const usuarios = require("./routes/usuario");
const passport = require('passport');
require('./config/auth')(passport);
const db = require("./config/db");

//Configurações

    //Session
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
    }));

    //iniciando a sessão com o passport
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());

    //Connect-flash
        app.use(flash());

    //Middleware  - //o locals cria variaveis globais
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg");
            res.locals.error_msg = req.flash("error_msg");
            res.locals.error = req.flash("error");
            res.locals.user = req.user || null;

            next();
        })


    //Body Parser
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());

    //Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}));
        app.set('view engine', 'handlebars');

    //Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect(db.mongoURI).then(() => { // criando o banco de dados com nome blogapp
            console.log("Conectado ao mongo");
        }).catch((erro) => {
            console.log("Erro ao se conectar: "+erro);
        })


    //Public
        app.use(express.static(path.join(__dirname,'public'))); //informa ao express que a pasta que guarda todos os arquivos estaticos é a public

        //Middlewares, são partes do arquivo divididas que são enviando pelo http
        app.use((req, res, next) => {  
            console.log("Middleware");
            next(); //chama o proximo middleware
        });

//Rotas

    app.get('/', (req, res) => {
        Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) =>{
            res.render("index", {postagens: postagens});
        }).catch((error) => {
            req.flash("error_msg","Houve um erro interno");
            res.redirect("/404");
        })
    });

    app.get('/404', (req, res) => {
        res.send("Erro 404!");
    })

    app.get('/postagens/:slug', (req, res) => {
        Postagem.findOne({slug: req.params.slug}).lean().then((postagens) => {

            if (postagens) {
                res.render("postagens/index", {postagens: postagens});
            }else{
                req.flash("error_msg", "Esta postagem não existe");
                res.redirect("/");
            }
        }).catch((error) => {
            req.flash("error_msg", "Houve um erro interno!");
            res.redirect("/");
        })
    })

    app.get('/categorias', (req, res) => {
        Categoria.find().lean().then((categorias) => {
            res.render("categorias/index", {categorias: categorias});
        }).catch((error) => {
            req.flash("error_msg", "Houve um erro interno ao listar as categorias!");
            res.redirect("/");
        })
    })

    app.get("/categorias/:slug", (req, res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categorias) => {
            if(categorias) {
                
                Postagem.find({categorias: categorias._id}).lean().then((postagens) => {

                    res.render("categorias/postagens", {postagens: postagens, categorias: categorias});
                    

                }).catch((error) => {
                    req.flash("error_msg","Houve um erro ao listar os posts!");
                    res.redirect("/");
                })

            }else{
                req.flash("error_msg", "Esta categoria não existe!");
                res.redirect("/");
            }
        }).catch((error) => {
            req.flash("error_msg", "Houve um erro interno ao carregar a página dessa categoria!");
            res.redirect("/");
        });
    });


    app.use('/usuarios', usuarios); // define o prefixo do grupo de rotas de usuarios
    app.use('/admin', admin); // define o prefixo do grupo de rotas de administrador

//Outros

//const PORT = 8081;

const PORT = process.env.PORT || 8081; //porta utilizada pra subir no heroku
app.listen(PORT, () => {
    console.log("Servidor rodando!");
});