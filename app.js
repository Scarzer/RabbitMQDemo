/**
 * Created with JetBrains WebStorm.
 * User: ventrius
 * Date: 4/11/13
 * Time: 1:02 PM
 * To change this template use File | Settings | File Templates.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    amqp = require('amqp');

var app = express();

http.createServer(app).listen(3000, function(){
    console.log("RabbitMQ + node.js app is running!");
});

app.configure(function(){
    app.set('port', 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.static(path.join(__dirname, 'public')));
});

app.connectionStatus = 'No Server Connection';
app.exchangeStatus = 'No Exchange Established';
app.queueStatus = 'No queue established';

app.get('/', function(req, res){
    res.render('index.jade',
    {
        title: 'Welcome to RabbitMQ and Node/Express Tutorial',
        connectionStatus : app.connectionStatus,
        exchangeStatus : app.exchangeStatus,
        queueStatus : app.queueStatus
    });
});

app.post('/start-server', function(req, res){
    app.rabbitMqConnection = amqp.createConnection({host: 'localhost'});
    app.rabbitMqConnection.on('ready', function(){
        app.connectionStatus = 'Connected!';
        res.redirect('/');
    });
});



