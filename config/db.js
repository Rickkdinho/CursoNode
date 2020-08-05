//se o banco estiver rodando no heroku faz isso
if (process.env.NODE_ENV == "production") {
    module.exports = {mongoURI: "mongodb+srv://ricardo:cursonodeexpress@cluster0.xddec.mongodb.net/blogapp?retryWrites=true&w=majority"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}