import express from 'express'

const port = 3030

const app = express()



app.get('/',(req,res)=>{
    res.send("root du serveur")
})

app.listen(port,()=>{
    console.log("serveur en cours ...");
})