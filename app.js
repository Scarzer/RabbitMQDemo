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

// These are states for the server itself. This is great for stroing values that you might want to give up in a jade template.
// Since I'm staritng to get better with jade templates, this is actually a great feature that comes with the terretory of
// express. I should take full advantage of this new technology.

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

app.post('/new-exchange', function(req, res){
    app.e = app.rabbitMqConnection.exchange('test-exchange');
    app.exchangeStatus = 'The queue is now ready to be used!';
    res.redirect('/');
});

app.post('/new-queue', function(req, res){
    app.q = app.rabbitMqConnection.queue('test-queue');
    app.queueStatus = 'The queue is now ready to be used!';
    res.redirect('/');
});

app.get('/message-service', function(req, res){
    app.q.bind(app.e, '#');
    res.render('messaging-service.jade',{
        title: 'Welcome to the messaging Service!',
        sentMessage: ''
    });
});

app.post('/newMessage', function(req, res){
    var newMessage = req.body.newMessage;
    console.log(newMessage);
    app.e.publish('routingKey', {message: newMessage});

    app.q.subscribe(function(msg){
        res.render('messaging-service.jade', {
            title: 'You\'ve got mail!',
            sentMessage: msg.message
        });
    });
});

