
let router = require("./routers/router")
let express = require("express")
let path = require("path")
let app = express();
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Permitir solicitudes desde cualquier origen (cambiar "*" por el dominio del frontend en producción)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });
  app.use('/uploads', express.static(path.join(__dirname, '/routers/uploads')));
console.log(__dirname)
app.set("port",process.env.PORT||3000)
app.use(router)
app.listen(app.get("port"),function(){
console.log("Se inicializo el servidor en el puerto "+ app.get("port"))
})