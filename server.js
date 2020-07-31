const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose();
const port = 3700

let db = new sqlite3.Database('./db/keluarga.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log(err.message)
    }
});

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))

// parse application/json
app.use(bodyParser.json())

// // for searching
// app.get('/', (req,res) => {
//     let dataSearch = []
//     let searchFinal = ""

//     if(req.query.id) {
//         dataSearch.push(`id = ${req.query.id}`)
//     }
//     if(req.query.string) {
//         dataSearch.push(`string = "${req.query.string}"`)
//     }
//     if (dataSearch.length > 0){
//         searchFinal += `WHERE ${dataSearch}`
//     }
//     console.log(searchFinal);

//     let sql = `select * from bread ${searchFinal}`
//     db.all (sql, (err, row) => {
//         if (err) {
//         throw err
//         }
//         if (row) {
//             let data = []
//             row.forEach(row => {
//                 data.push(row)
//             })
//             res.render('index', {data})
//         }
//     })
// })

app.get('/', (req, res) => {

    let dataSearch = []
    let searchFinal = ""

    if (req.query.id) {
        dataSearch.push(`id = ${req.query.id}`)
    }

    if (req.query.string) {
        dataSearch.push(`string = "${req.query.string}"`)
    }

    if (req.query.integer) {
        dataSearch.push(`integer = "${req.query.integer}"`)
    }
    if (req.query.float) {
        dataSearch.push(`float = "${req.query.float}"`)
       
    }
    if (req.query.date) {
        dataSearch.push(`string = "${req.query.date}"`)
    }

    if (req.query.boolean) {
        dataSearch.push(`boolean = "${req.query.boolean}"`)
    }

    if (dataSearch.length > 0) {
       searchFinal += ` WHERE ${dataSearch.join(' AND ')}`
    }
    console.log("data search " , dataSearch);
    
    const page = req.query.page || 1
    const limit = 3
    const offset = (page - 1) * limit

    db.all(`SELECT COUNT (id) as total FROM bread ${searchFinal}`, (err,row) => {
        if (err) {
            throw err
        }
        else  if (row == 0) {
            return res.send('data not found')
        }
        else {
            total = row[0].total
            const pages = Math.ceil(total / limit)
            console.log('total', total);

            let sql =`SELECT * FROM BREAD ${searchFinal} limit ? offset ?`
            db.all(sql, [limit, offset], (err, row) => {
                if (err) {
                    throw err
                }
                else if (row == 0) {
                    return res.send('data tidak ditemukan')
                }
                else {
                    let data = []
                    row.forEach(row => {
                        data.push(row)
                    })
                    res.render('index', {data, page, pages})
                }
            })
        }
    })
})

// app.get('/', (req, res) => {
//     db.serialize(() => {
//         let data = []
//         let sql = `SELECT * FROM bread`
//         db.all(sql, (err, row) => {
//             if (err) {
//                 throw err
//             }
//             if (row)
//                 row.forEach(row => {
//                     data.push(row)
//                 })
//             res.render('index', {data})
//         })
//     })
// })

app.get('/add', (req, res) => res.render('add'))

app.post('/add', (req, res) => {
    let dat = req.body;
    db.serialize(() => {
        let sql = `INSERT INTO bread (string, integer, float, date, boolean) VALUES (?,?,?,?,?)`
        db.run(sql, [dat.string, Number(dat.integer), parseFloat(dat.float), dat.date, dat.boolean], (err) => {
            if (err) throw err
        })
        res.redirect('/')
    })
})

app.get('/delete/:id', (req, res) => {
    let id = req.params.id
    let sql = `DELETE FROM BREAD WHERE id=?`
    db.run(sql, id, (err) => {
        if (err) {
            throw err
        }
        res.redirect('/')
        console.log(id);
    })
})


app.get('/edit/:id', (req, res) => {
    let id = req.params.id
    let sql = `select * from bread where id=?`
    db.get(sql, id, (err, row) => {
        if (err) {
            throw err
        }
        res.render('edit', {
            row
        })
    })
})

app.post('/edit/:id', (req, res) => {
    let id = req.params.id;
    let dat = req.body;
    db.serialize(() => {
        let sql = `UPDATE bread set string=?, integer=?, float=?, date=?, boolean=? where id=?`
        db.run(sql, [dat.string, Number(dat.integer), parseFloat(dat.float), dat.date, dat.boolean, id], (err) => {
            if (err) throw err
        })
        res.redirect('/')
    })
})

app.listen(port, () => console.log(`aplikasi berjalan di PORT:${port}`))

// /?page=<%= parseInt(page) - 1%>