//controlando acesso de usuarios no sistema
//impede que o usuario acesse o sistema sem autenticar
//todo lugar que tiver eAdmin quer dizer que só o admin pode acessar
module.exports = {
    eAdmin: function(req, res, next){

        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next();
        }

        req.flash("error_msg", "Você precisa ser um administrador do sistema");
        res.redirect("/");
    }
}