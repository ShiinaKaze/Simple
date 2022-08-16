const express = require('express')
const morgan = require('morgan')
const { MongoClient } = require('mongodb')
const ObjectId = require('mongodb').ObjectId;
const bodyParser = require('body-parser')
const multiparty = require("multiparty")
const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken');
const child_process = require('child_process')

//
if (!fs.existsSync('public')) {
    fs.mkdirSync('public')
}

if (!fs.existsSync('public/users')) {
    fs.mkdirSync('public/users')
}
// 递归创建文件夹
function createFolder(dirname) {
    try {
        if (fs.existsSync(dirname)) {
            return true;
        } else {
            if (createFolder(path.dirname(dirname))) {
                fs.mkdirSync(dirname);
                return true;
            }
        }
    } catch (error) {
        console.log(error)
        return
    }
}

// 递归删除文件夹
function deleteFolder(path) {
    try {
        let files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach(function (file, index) {
                let curPath = path + "/" + file;
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    deleteFolder(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    } catch (error) {
        console.log(error)
        return
    }
}

//express 配置
const app = express()
app.use('/public', express.static('public'))
app.use(morgan('dev'))
app.use(bodyParser.json())
app.listen(3000)

//token
const jwtSecret = 'shiina'
function getToken(data) {
    try {
        return jwt.sign(data, jwtSecret)
    } catch (error) {
        console.log(error)
        return
    }
}

function verifyToken(req) {
    try {
        let token = req.headers.authorization.slice(7)
        return jwt.verify(token, jwtSecret)
    } catch (error) {
        console.log(error)
        return
    }
}

//mongoDB配置
const dbURI = 'mongodb://127.0.0.1:27017'
const dbName = 'test'
const collectionApps = 'apps'
const collectionUsers = 'users'

//连接数据库
const client = new MongoClient(dbURI, (error) => {
    if (error) {
        console.log(error)
        return
    }

})
client.connect((error) => {
    if (error) {
        console.log('Connected failed to Database')
        console.log(error)
        return
    }
    console.log('Connected successfully to Database')
})

const db = client.db(dbName)

//后端业务代码
app.post('/login', (req, res) => {
    console.log('user login:');
    console.log(req.body)
    db.collection(collectionUsers).findOne(
        {
            userName: req.body.userName
        }, (error, result) => {
            if (error) {
                console.log(error)
                return
            }
            if (result) {
                let token = getToken(result._id.toString())
                res.send(token)
            }
        }
    )
})
app.post('/register', (req, res) => {
    console.log('user register:')
    db.collection(collectionUsers).findOne(
        {
            userName: req.body.userName
        }, (error, result) => {
            if (error) {
                console.log(error)
                return
            }
            if (result) {
                res.status(403).send('用户名重复')
            } else {
                db.collection(collectionUsers).insertOne(
                    {
                        userName: req.body.userName,
                        userPass: req.body.userPass,
                        avatar: ''
                    }, (error, result) => {
                        if (error) {
                            console.log(error)
                            return
                        }
                        console.log(result)
                        fs.mkdir('public/users/' + result.insertedId.toString(), (error) => {
                            if (error) {
                                console.log(error)
                                return
                            }
                        })
                        res.send('注册成功')
                    }
                )
            }
        }
    )
})

app.get('/user', (req, res) => {
    let userID = verifyToken(req)
    db.collection(collectionUsers).findOne(
        {
            _id: ObjectId(userID)
        }, (error, data) => {
            if (error) {
                console.log(error)
                return
            }
            res.send(data)
        }
    )
})

app.post('/user/upload', (req, res) => {
    let userID = verifyToken(req)
    let form = new multiparty.Form()
    form.encoding = 'utf-8'
    form.uploadDir = 'public'
    form.parse(req, function (error, fields, files) {
        let upFile = files.file[0]
        avatarPath = 'public/users/' + userID + '/avatar.webp'
        db.collection(collectionUsers).updateOne(
            {
                _id: ObjectId(userID)
            },
            {
                $set: {
                    avatar: avatarPath
                }
            }, (error, result) => {
                if (error) {
                    console.log(error)
                    return
                }
                res.send(result)
            }
        )
        try {
            fs.renameSync(upFile.path, avatarPath)
        } catch (error) {
            console.log(error)
            return
        }
    })
})

app.post('/user/name', (req, res) => {
    console.log(req.body)
    let userID = verifyToken(req)
    db.collection(collectionUsers).findOne(
        {
            _id: ObjectId(userID)
        }, (error, result) => {
            if (error) {
                console.log(error)
                return
            }
            console.log(result)
            if (result.userName === req.body.name) {
                res.status(403).send('用户名重复')
            } else {
                db.collection(collectionUsers).updateOne(
                    {
                        _id: ObjectId(userID)
                    },
                    {
                        $set: {
                            userName: req.body.name
                        }
                    }, (error, result) => {
                        if (error) {
                            console.log(error)
                            return
                        }
                        res.send(result)
                    }
                )
            }
        }
    )
})

app.post('/user/pass', (req, res) => {
    console.log(req.body)
    let userID = verifyToken(req)
    db.collection(collectionUsers).updateOne(
        {
            _id: ObjectId(userID)
        },
        {
            $set: {
                userPass: req.body.newPass
            }
        }, (error, result) => {
            if (error) {
                console.log(error)
                return
            }
            res.send(result)
        }
    )
})

app.post('/user/delete', (req, res) => {
    console.log('user delete:')
    let userID = verifyToken(req)
    db.collection(collectionUsers).findOne(
        {
            _id: ObjectId(userID)
        }, (error, result) => {
            if (error) {
                console.log(error)
                return
            }
            console.log(result)
            if (result.userPass === req.body.value) {
                db.collection(collectionUsers).deleteOne(
                    {
                        _id: ObjectId(userID)
                    }, (error, result) => {
                        if (error) {
                            console.log(error)
                            return
                        }
                        res.send(result)
                    }
                )
                deleteFolder('public/users/' + userID)
            } else {
                res.status(403).send('密码错误')
            }
        }
    )

})

app.get('/apps', (req, res) => {
    let userID = verifyToken(req)
    db.collection(collectionApps).find(
        {
            user_id: userID
        }
    ).toArray((error, data) => {
        if (error) {
            console.log(error)
            return
        }
        res.send(data)
    })
})

app.post('/apps/add', (req, res) => {
    let userID = verifyToken(req)
    db.collection(collectionApps).insertOne(
        {
            user_id: userID,
            title: req.body.title,
            state: req.body.state,
            scriptFileList: [],
            modelFileList: [],
            inputFileList: [],
            outputFileList: [
                ''
            ]
        }, (error, result) => {
            if (error) {
                console.log(error)
                return
            }
            console.log(result)
            let appPath = 'public/users/' + userID + '/' + result.insertedId.toString()
            createFolder(appPath + '/script')
            createFolder(appPath + '/model')
            createFolder(appPath + '/input')
            createFolder(appPath + '/output')
            res.send(result)
        }
    )
})

app.put('/apps/app', (req, res) => {
    db.collection(collectionApps).updateOne(
        {
            _id: ObjectId(req.body._id)
        },
        {
            $set: {
                title: req.body.title
            }
        }, (error, result) => {
            if (error) {
                console.log(error)
                return
            }
            console.log('Update app successfully')
            console.log(result)
            res.send(result)
        }
    )
})

app.delete('/apps/delete', (req, res) => {
    let userID = verifyToken(req)
    db.collection(collectionApps).deleteOne({ _id: ObjectId(req.body._id) }, (error, result) => {
        if (error) {
            console.log(error)
            return
        }
        deleteFolder('public/users/' + userID + '/' + req.body._id)
        console.log('Delete app successfully')
        res.send(result)
    })
})


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}


app.put('/apps/app/run', (req, res) => {
    let userID = verifyToken(req)
    let appID = req.body.id
    let scriptFilePath = 'public/users/' + userID + '/' + appID + '/script/script.py'
    db.collection(collectionApps).updateOne(
        {
            _id: ObjectId(appID)
        },
        {
            $set: {
                state: req.body.state
            }
        }, (error) => {
            if (error) {
                console.log(error)
                return
            }
            try {
                let outputPath = child_process.execSync('python ' + scriptFilePath + ' ' + userID + ' ' + appID, { encoding: 'utf8' }).toString()
                db.collection(collectionApps).updateOne(
                    {
                        _id: ObjectId(req.body.id)
                    },
                    {
                        $set: {
                            state: 'normal'
                        }
                    }, (error) => {
                        if (error) {
                            console.log(error)
                            return
                        }
                    }
                )
                db.collection(collectionApps).updateOne(
                    {
                        _id: ObjectId(req.body.id)
                    },
                    {
                        $set: {
                            'outputFileList.0': outputPath
                        }
                    }, (error) => {
                        if (error) {
                            console.log(error)
                            return
                        }
                    }
                )
            } catch (error) {
                res.status(500).send('运行失败')
                console.log(error)
                return
            }
            res.send('运行成功')
        }
    )
})

app.post('/apps/app/upload/:uploadDir', (req, res) => {
    console.log('Upload File')
    let uploadType = req.params.uploadDir
    let form = new multiparty.Form()
    form.encoding = 'utf-8'
    form.uploadDir = 'public'
    form.parse(req, function (error, fields, files) {
        // console.log(fields)
        // console.log(files)
        // console.log('------------------------------')
        let userID = fields.user_id
        let appID = fields._id + ''
        let upFile = files.file[0]
        let newPath = ''
        let newFile = {}

        if (uploadType === 'script') {
            newPath = 'public/users/' + userID + '/' + appID + '/script/script.py'
            newFile = { name: 'script.py', url: newPath }
            db.collection(collectionApps).updateOne(
                {
                    _id: ObjectId(appID)
                },
                {
                    $push: {

                        scriptFileList: newFile
                    }
                }, (error, result) => {
                    if (error) {
                        console.log(error)
                        return
                    }
                    console.log(result)
                    res.send(result)
                }
            )
        }
        if (uploadType === 'model') {
            newPath = 'public/users/' + userID + '/' + appID + '/model/' + upFile.originalFilename
            newFile = { name: upFile.originalFilename, url: newPath }

            db.collection(collectionApps).updateOne(
                {
                    _id: ObjectId(appID)
                },
                {
                    $push: {

                        modelFileList: newFile
                    }
                }, (error, result) => {
                    if (error) {
                        console.log(error)
                        return
                    }
                    console.log(result)
                    res.send(result)
                }
            )
        }
        if (uploadType === 'input') {
            newPath = 'public/users/' + userID + '/' + appID + '/input/' + upFile.originalFilename
            newFile = { name: upFile.originalFilename, url: newPath }
            db.collection(collectionApps).updateOne(
                {
                    _id: ObjectId(appID)
                },
                {
                    $push: {

                        inputFileList: newFile
                    }
                }, (error, result) => {
                    if (error) {
                        console.log(error)
                        return
                    }
                    console.log(result)
                    res.send(result)
                }
            )
        }
        try {
            fs.renameSync(upFile.path, newPath)
        } catch (error) {
            console.log(error)
            return
        }
        console.log('Upload file successfully')
    })
})

app.delete('/apps/app/delete/file', (req, res) => {
    let userID = verifyToken(req)
    console.log(req.body)
    let appID = req.body.id
    let uploadType = req.body.deleteFolderType
    let fileName = req.body.file.name
    let filePath = 'public/users/' + userID + '/' + appID + '/' + uploadType + '/' + fileName
    let newFile = { name: fileName, url: filePath }

    console.log('Delete File')
    if (uploadType === 'script') {
        db.collection(collectionApps).updateOne(
            {
                _id: ObjectId(appID)
            },
            {
                $pull: {
                    scriptFileList: newFile
                }
            }, (error, result) => {
                if (error) {
                    console.log(error)
                    return
                }
                console.log(result)
                res.send(result)
            }
        )
    }
    if (uploadType === 'model') {
        db.collection(collectionApps).updateOne(
            {
                _id: ObjectId(appID)
            },
            {
                $pull: {
                    modelFileList: newFile
                }
            }, (error, result) => {
                if (error) {
                    console.log(error)
                    return
                }
                console.log(result)
                res.send(result)
            }
        )
    }
    if (uploadType === 'input') {
        db.collection(collectionApps).updateOne(
            {
                _id: ObjectId(appID)
            },
            {
                $pull: {
                    inputFileList: newFile
                }
            }, (error, result) => {
                if (error) {
                    console.log(error)
                    return
                }
                console.log(result)
                res.send(result)
            }
        )
    }
    if (uploadType === 'output') {
        db.collection(collectionApps).updateOne(
            {
                _id: ObjectId(appID)
            },
            {
                $set: {
                    'outputFileList.0': ''
                }
            }, (error, result) => {
                if (error) {
                    console.log(error)
                    return
                }
                console.log(result)
                res.send(result)
            }
        )
    }
    try {
        fs.unlinkSync(filePath)
    } catch (error) {
        console.log(error)
        return
    }
    console.log('Delete file successfully')
})
