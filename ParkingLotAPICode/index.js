const sql = require('mssql')
const fs = require('fs')
let express = require('express')
var bodyParser = require('body-parser')
let app = express()

let config = JSON.parse(fs.readFileSync('config.json'))
// create application/json parser
var jsonParser = bodyParser.json()


let db_config = {
    user: config.user,
    password: config.pass,
    database: config.db,
    server: config.server,
    options: {
      encrypt: false
    }
  }

//Check if the slot is available
let slotAvailable = async (slot_no, vahicle_type) =>{
    let conn = await sql.connect(db_config);
    try{
        if(vahicle_type === 'car'){
            let result = await conn.query('select ps.id from parking_spaces ps left outer join alotment a on ps.id = a.ps_id where ps.p_type = \'car\' and a.vahicle_number is null')
            console.log(result.recordset)
            if(result.recordset.find(f => f.id === slot_no) !== undefined)
            {
                return true
            }
            else{
                return false
            }
        }
        else{
            let result = await conn.query('select ps.is from parking_spaces ps left outer join alotment a on ps.id = a.ps_id where a.vahicle_number is null union select * from parking_spaces where id in (select a.ps_id from parking_spaces ps left join alotment a on ps.id = a.ps_id where ps.p_type = \'car\' and a.vahicle_type = \'bike\' group by a.ps_id having count(a.ps_id) < 2)')
            console.log(result.recordset)
            if(result.recordset.find(f => f.id === slot_no) !== undefined)
            {
                return true
            }
            else{
                return false
            }
        }
    }
    catch(ex){
        console.log(ex)
    }
}

//Find available slots for car/bike. pass as querystring
app.get('/api/available-slots', async(req, res)=>{
    let slot_type = req.query.type ;
    let conn = await sql.connect(db_config);
    try{
        if(slot_type === 'car'){
            //Find empty car slots
            let result = await conn.query('select ps.* from parking_spaces ps left outer join alotment a on ps.id = a.ps_id where ps.p_type = \'car\' and a.vahicle_number is null')
            res.status(200).send(result.recordset)
            return
        }
        else{
            let result = await conn.query('select ps.* from parking_spaces ps left outer join alotment a on ps.id = a.ps_id where a.vahicle_number is null union select * from parking_spaces where id in (select a.ps_id from parking_spaces ps left join alotment a on ps.id = a.ps_id where ps.p_type = \'car\' and a.vahicle_type = \'bike\' group by a.ps_id having count(a.ps_id) < 2)')
            res.status(200).send(result.recordset)
            return
        }
    }
    catch(ex){
        console.log(ex)
        res.status(500).send('Server error!')
        return
    }
    finally{
        conn.close()
        return
    }
    
})

//Park a new car/bike
app.post('/api/bookslot', jsonParser, async(req, res) =>{

    if(!req.body.vahicle_no || !req.body.vahicle_type || !req.body.slot_no){
        res.status(400).send('Please check input!')
    }
    else{
        let conn = await sql.connect(db_config);
        try{
            let available =  await slotAvailable(req.body.slot_no, req.body.vahicle_type) //Check if car/bike can be allocated
            if(available){ 
                //Insert in Db to allocate car
                let result  = await conn.query(`insert into alotment values ( ${req.body.slot_no}, '${req.body.vahicle_no}', '${req.body.vahicle_type}', default)`)
                return
            }
        }
        catch(ex){
            console.log(ex)
            res.status(500).send('Server error!')
            return
        }
        finally{
            conn.close()
            res.status(200).send('Car allocated succesfuly!')
            return
        }
    }

})

//Calculate cost
app.get('/api/calculate', async(req,res)=>{
    let vahicle_number = req.query.v_no; //Vachile number passed as querystring
    let conn = await sql.connect(db_config);
    try{
        let result  = await conn.query(`select DATEDIFF(HOUR, a.alotted_time, CURRENT_TIMESTAMP)*ps.rate as charge from parking_spaces ps inner join alotment a on ps.id = a.ps_id where a.vahicle_number = '${vahicle_number}'`)
        console.log(result)
        res.status(200).send(result.recordset[0])
    }
    catch(ex){
        console.log(ex)
        res.status(500).send('Server error!')
        return
    }
    finally{
        conn.close()
        return
    }
})

//De-allocate car/bike
app.delete('/api/deallocate', async(req, res)=>{
    let vahicle_number = req.query.v_no; //Vachile number passed as querystring
    let conn = await sql.connect(db_config);
    try{
        let result  = await conn.query(`delete from alotment where vahicle_number ='${vahicle_number}'`)
        console.log(result)
    }
    catch(ex){
        console.log(ex)
        res.status(500).send('Server error!')
        return
    }
    finally{
        conn.close()
        res.status(200).send('Car de-allocated succesfuly!')
        return
    }
})

app.listen(3000)