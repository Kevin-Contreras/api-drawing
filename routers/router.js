let express = require("express")
let router = express.Router();
let multer = require("multer")
let bodyParser = require("body-parser")
let fs = require("fs")
const path = require('path');
let mysql = require("../database/db")
let cloudinary = require("../database/s3")

router.use(bodyParser.json({limit: '25mb'}))





router.post("/save", (req,res,next)=>{
 
    const base64Data = req.body.imagen.split(';base64,').pop();
    const fileName = `image_${Date.now()}.png`;

    // Verificar si la carpeta 'uploads' existe, y si no, crearla
  
// Subir la imagen a Cloudinary
cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Data}`, {
    folder:"updoads",
    public_id: fileName

},(error, result) => {
  if (error) {
    console.error('Error al subir la imagen:', error);
  } else {
    mysql.query('INSERT INTO publicacion (imagen, username) VALUES ('+'"'+result.secure_url+'","'+req.body.user+'"'+');',function(err,result){
        if(!err){
            console.log("se subio la imagen")
        }else{
            console.log(err)
        }
    })
    res.send('Imagen subida correctamente.')
    console.log('Imagen subida exitosamente:', result);
  }
});
    // Devolver una respuesta al cliente
  

})



router.get("/liensos",function(req,res,next){
    mysql.query('SELECT * FROM  users INNER JOIN publicacion  ON users.username =publicacion.username ORDER BY publicacion.id DESC;',function(err,result){
        if(!err){
            res.send(result)
        }
        
    })
})
router.post("/registro",function(req,res,next){
    console.log(req.body)
    const fileName = `image_${Date.now()}.png`;
    const base64Data = req.body.avatar.split(';base64,').pop();
    cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Data}`, {
        folder:"updoads/avatar",
        public_id: fileName
    
    },(error, resulta) => {
console.log(resulta)
        if(!error){
            if(req.body.avatar!=''){
                mysql.query('SELECT * FROM `users` where username ='+'"'+req.body.user+'"'+';',function(err,result){
                    if(!err){
                        if(result.length==0){
                           
        
                            mysql.query('INSERT INTO users (username, passwords,avatar,nombre) VALUES ('+'"'+req.body.user+'",'+'"'+req.body.pass+'",'+'"'+resulta.secure_url+'",'+'"'+req.body.nombre+'"'+');',function(err,resultss,filds){
                                if(!err){
                                    mysql.query('SELECT * FROM `users` where username ='+'"'+req.body.user+'"'+';',function(err,resultados){
            
                                        if(!err){
                                            res.send(resultados)
                                        }
                                    })
                                   
                                }else{
                                    console.log(err)
                                }
                            })
                        }else{
                       
                            res.send({error:"ya existe el usuario"})
                        }
                      
                       
                    }else{
                        res.send({error:"ya existe el usuario"})
                        console.log("no se pudo extraer el dato")
                      
                    }
                    
                })
            }else{
                console.log("no se cargo la foto")
                res.send({error:"no se cargo nunguna foto."})
            }
            
        
        
         
        }
    }
    )
    
})
router.post("/logins",  function(req,res,next){
     mysql.query('SELECT * FROM `users` where username ='+'"'+req.body.user+'"'+';',function(err,result){
        if(!err){
            if(result.length!=0){
                if(req.body.user==result[0].username && req.body.pass == result[0].passwords){
                    res.send(result)
                    console.log(req.body)

                }else{
                    console.log(req.body)
                    res.send({err:"el usuario o la contraseña no existen."})
                }
            }else{
                res.send({err:"el usuario o la contraseña no existen."})

            }
           
        }else{
            console.log(req.body)
            console.log("no se pudo extraer el dato")
          
        }
        
    })
})
router.post("/misDibujos",function(req,res,next){
    let dato=[]
    mysql.query('SELECT * FROM  users INNER JOIN publicacion ON users.username =publicacion.username ORDER BY publicacion.id DESC ;    ',function(err,result){
        if(!err){
            result.map((datos,index)=>{
                if(req.body.user==datos.username){
                    console.log(result[index])
                    dato.push(result[index])
                  
                   

                }else{
                    console.log(index)
                }
              
              
            })
            res.send(dato)
        }else{

            console.log(err)
        }
        
    })
})

router.post("/buscar",function(req,res,next){
    console.log(req.body.user)
    mysql.query("SELECT * FROM users where username Like "+"'"+req.body.user+"%';",function(err,resultado){
        if(!err){
            mysql.query("SELECT * FROM solicitudes WHERE usernameRemitente ="+"'"+req.body.el+"';",function(err,resulta){
                if(!err){
                    
                    res.send({result:resultado,amigos:resulta})
                }else{
                    res.send({err:"hay un error"})
                }
            })
            
            console.log(resultado)
        }else{
            res.send({err:"hay algun error"})
        }
    })

})

router.post("/agregarSolicitud", function(req,res,next){

mysql.query("SELECT * FROM solicitudes WHERE usernameRemitente ="+"'"+req.body.beneficiario+"'"+" AND userBeneficiario ="+"'"+req.body.remitente+"'"+";",function(err,resultado){
    if(!err){
        if(resultado.length==0){

            mysql.query("SELECT * FROM solicitudes WHERE usernameRemitente ="+"'"+req.body.remitente+"'"+" AND userBeneficiario ="+"'"+req.body.beneficiario+"'"+";",function(err,respuesta){
                if(respuesta.length==0){
                    mysql.query('INSERT INTO solicitudes (usernameRemitente, userBeneficiario,amigos) VALUES ('+'"'+req.body.remitente+'","'+req.body.beneficiario+'",'+req.body.amigo+');',function(err,result){
                        if(!err){
                            res.send(result)
                        }else{
                            res.send({err:"error"})
                        }
                    })
                }else{
                    res.send({resultado:"ya existe en la tabla",amigo:respuesta[0].amigos})
                }
            })
       
        }else{
            res.send({resultado:"ya existe en la tabla",amigo:resultado[0].amigos})
        }
       
    }
})

   
})
router.post("/agregarSolicitud2",function(req,res,next){
    mysql.query('INSERT INTO solicitudes (usernameRemitente, userBeneficiario,amigos) VALUES ('+'"'+req.body.remitente+'","'+req.body.beneficiario+'",'+req.body.amigo+');',function(err,result){
        if(!err){
            res.send(result)
        }else{
            res.send({err:"error"})
        }
})
})
router.post("/actualizar",function(req,res,next){
mysql.query("SELECT * FROM solicitudes WHERE usernameRemitente ="+"'"+req.body.beneficiario+"'"+" AND userBeneficiario ="+"'"+req.body.remitente+"'"+";",function(err,result){
if(!err){
    console.log(result)
    mysql.query("UPDATE solicitudes SET amigos = "+req.body.amigo+" WHERE solicitudes.id = "+result[0].id+";",function(err,resultado){
        if(!err){
            res.send(resultado)
        }else{
            console.log(err)
            res.send({err:"no se actualizo el dato"})
        }
    })
}else{
    res.send({err:"no se encontro el dato"})
}
})
})

router.post("/solicitudes", function(req,res,next){
    let dato=[]

    mysql.query('SELECT * FROM  users INNER JOIN solicitudes ON users.username =solicitudes.usernameRemitente;',function(err,result){
        if(!err){
            result.map((datos,index)=>{
                if(req.body.user==datos.userBeneficiario && datos.amigos==0){
                    console.log(result[index])
                    dato.push(result[index])
                  
                   

                }else{
                    console.log(index)
                }
              
              
            })
            res.send(dato)
        }else{

            console.log(err)
        }
    })
})
router.post("/amigos", function(req,res,next){
    let dato=[]

    mysql.query('SELECT * FROM  users INNER JOIN solicitudes ON users.username =solicitudes.usernameRemitente;',function(err,result){
        if(!err){
            result.map((datos,index)=>{
                if(req.body.user==datos.userBeneficiario && datos.amigos==1){
                    console.log(result[index])
                    dato.push(result[index])
                  
                   

                }else{
                    console.log(index)
                }
              
              
            })
            res.send(dato)
        }else{

            console.log(err)
        }
    })
})

router.get("/buscarAmigo",function(req,res,next){
    mysql.query("SELECT * FROM solicitudes ",function(err,respuesta){
        if(!err){
            res.send(respuesta)
        }else{
            res.send({error:err})
        }
    })
})
router.post("/eliminarAmigo",function(req,res,next){

    mysql.query("DELETE FROM solicitudes WHERE usernameRemitente ="+"'"+req.body.beneficiario+"'"+" AND userBeneficiario ="+"'"+req.body.remitente+"'"+";",function(err,result){
if(!err){
    mysql.query("DELETE FROM solicitudes WHERE usernameRemitente ="+"'"+req.body.remitente+"'"+" AND userBeneficiario ="+"'"+req.body.beneficiario+"'"+";",function(err,result2){
        if(!err){
            res.send(result2)
        }
    })
}
    })

})
module.exports = router;