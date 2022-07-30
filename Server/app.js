const express = require('express')
const morgan = require('morgan')
const { MongoClient } = require('mongodb')
const ObjectId = require('mongodb').ObjectId;
const bodyParser = require('body-parser')
var multiparty = require("multiparty")
const fs = require('fs')

//express 配置
const app = express()
app.use('/public', express.static('public'))
app.use(morgan('dev'))
app.use(bodyParser.json())
app.listen(3000)
//mongoDB配置
const dbURI = 'mongodb://localhost'
const dbName = 'test'
const collectionName = 'apps'
//连接数据库
const client = new MongoClient(dbURI, (err) => {
    if (err) {
        console.log(err)
        return
    }

})
client.connect((err) => {
    if (err) {
        console.log(err)
        return
    }
    console.log('Connected successfully to Database')
})

const db = client.db(dbName)

//后端业务代码
app.get('/apps', (req, res) => {
    console.log('Connected Collection')
    db.collection(collectionName).find({}).toArray((err, data) => {
        if (err) {
            console.log(err)
            return
        }
        res.send(data)
    })
})

app.post('/apps/add', (req, res) => {
    console.log(req.body)
    db.collection(collectionName).insertOne(
        {
            title: req.body.title,
            state: req.body.state,
            modelFileList: [],
            inputFileList: [],
            resultFileList: []
        }, (err, result) => {
            if (err) {
                console.log(err)
                return
            }
            console.log('Add successfully to Database')
            console.log(result)
            res.send(result)
        }
    )
})

app.put('/apps/app', (req, res) => {
    db.collection(collectionName).updateOne(
        {
            _id: ObjectId(req.body._id)
        },
        {
            $set: {
                title: req.body.title
            }
        }, (err, result) => {
            if (err) {
                console.log(err)
                return
            }
            console.log('Update app successfully')
            console.log(result)
            res.send(result)
        }
    )
})

app.delete('/apps/delete', (req, res) => {
    db.collection(collectionName).deleteOne({ _id: ObjectId(req.body._id) }, (err, result) => {
        if (err) {
            console.log(err)
            return
        }
        console.log('Delete app successfully')
        console.log(result)
        res.send(result)
    })
})



app.put('/apps/app/:cardState', (req, res) => {
    db.collection(collectionName).updateOne(
        {
            _id: ObjectId(req.body._id)
        },
        {
            $set: {
                state: req.body.state
            }
        }, (err, result) => {
            if (err) {
                console.log(err)
                return
            }
            console.log('Update state successfully')
            console.log(result)
            res.send(result)
        }
    )
})

app.post('/apps/app/upload/:uploadDir', (req, res) => {
    console.log('Upload File')
    let uploadType = req.params.uploadDir
    let form = new multiparty.Form()
    form.encoding = 'utf-8'
    form.uploadDir = 'public'
    form.parse(req, function (err, fields, files) {
        console.log(fields)
        console.log(files)
        console.log('------------------------------')
        let id = fields._id + ''
        let secondPath = 'public/' + fields._id
        let thirdPath = 'public/' + fields._id + '/' + uploadType
        let upFile = files.file[0]
        let newPath = thirdPath + '/' + upFile.originalFilename
        let newFile = { name: upFile.originalFilename, url: newPath }

        if (!fs.existsSync(secondPath)) {
            fs.mkdirSync(secondPath)
        }
        if (!fs.existsSync(thirdPath)) {
            fs.mkdirSync(thirdPath)
        }
        if (!fs.existsSync(newPath)) {
            fs.renameSync(upFile.path, newPath)
            if (uploadType === 'model') {
                db.collection(collectionName).updateOne(
                    {
                        _id: ObjectId(id)
                    },
                    {
                        $push: {

                            modelFileList: newFile
                        }
                    }, (err, result) => {
                        console.log(result)
                        res.send(result)
                    }
                )
            }
            if (uploadType === 'input') {
                db.collection(collectionName).updateOne(
                    {
                        _id: ObjectId(id)
                    },
                    {
                        $push: {

                            inputFileList: newFile
                        }
                    }, (err, result) => {
                        console.log(result)
                        res.send(result)
                    }
                )
            }
            console.log('Upload file successfully')

        } else {
            fs.unlinkSync(upFile.path)
            res.status(406).send({
                msg: 'File Existed'
            })
        }

    })
})

app.delete('/apps/app/delete/file', (req, res) => {
    console.log(req.body)
    let arr = req.body.file.url.split('/')
    let cardId = arr[1] + ''
    let uploadType = req.body.deleteFolderType
    let newFile = { name: req.body.file.name, url: req.body.file.url }

    console.log('Delete File')
    if (uploadType === 'model') {
        db.collection(collectionName).updateOne(
            {
                _id: ObjectId(cardId)
            },
            {
                $pull: {
                    modelFileList: newFile
                }
            }, (err, result) => {
                console.log(result)
                res.send(result)
            }
        )
    }
    if (uploadType === 'input') {
        db.collection(collectionName).updateOne(
            {
                _id: ObjectId(cardId)
            },
            {
                $pull: {
                    inputFileList: newFile
                }
            }, (err, result) => {
                console.log(result)
                res.send(result)
            }
        )
    }
    fs.unlink(req.body.file.url, () => {
        console.log(req.body.file)
    })
    console.log('Delete file successfully')
})
