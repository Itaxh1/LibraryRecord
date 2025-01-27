/*
 * Module for working with a MongoDB connection.
 */

const { MongoClient } = require('mongodb')

const mongoHost = process.env.MONGO_HOST || 'localhost'
const mongoPort = process.env.MONGO_PORT || 27017
const mongoUser = 'User'
const mongoPassword = 'ashwin999'
const mongoDbName = 'Tarpulin'
const mongoAuthDbName = 'admin'

const mongoUrl =   `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoAuthDbName}`

let _db = null
let _closeDbConnection = null

exports.connectToDb = async function (callback) {
    console.log(mongoUrl)
    const client = await MongoClient.connect(mongoUrl)
    _db = client.db(mongoDbName)
    _closeDbConnection = function () {
        client.close()
    }
}

exports.getDb = function () {
    return _db
}

exports.closeDbConnection = function (callback) {
    _closeDbConnection(callback)
}
