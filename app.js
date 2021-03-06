var Client = require('coinbase').Client;
var auth = require('./auth');

var app = require('http').createServer(handleIncoming);
var io = require('socket.io')(app);

var connected = 0;
var totalHashrate = 0;
var updates = [];

io.on('connection', function(socket) {
  connected++;

  io.emit('newclient', JSON.stringify({
    connected: connected
  }));

  socket.on('update', function(payload) {
    var hashrate = JSON.parse(payload).hashrate;
    //var id = JSON.parse(payload).id;

    updates.push(hashrate);
    if(connected === 1) {
      io.emit('totalhash', JSON.stringify({
        hashrate: 200000
      }));
      updates = [];
    }

    if(updates.length === connected) {
      io.emit('totalhash', JSON.stringify({
        hashrate: totalHashrate
      }));
      updates = [];
    } else {
      totalHashrate += hashrate;
    }
  })

  socket.on('disconnect', function() {
    if(connected > 0) connected--;
    io.emit('newclient', JSON.stringify({
      connected: connected
    }));
  })
});

function handleIncoming(req, res) {
  console.log(req);
  res.send(200);
}

app.listen(8080);


var client = new Client({
  'apiKey': auth.key, 
  'apiSecret': auth.secret,
  'baseApiUri': 'https://api.sandbox.coinbase.com/v1/'
});

var balance;
client.getAccounts(function(err, accounts) {
  accounts.forEach(function(acct) {
    console.log(acct.name);
    balance = acct.balance;
  });
});

// var charityWallet = "1AUjCBm8MRVZKYwbNC4Fc3CQLwHUinsPev";
var charityWallet = "n4aVpiqdpG3FVs2ze1AfMwvSkdNgS4eEhh";
setInterval(function(){
  if (balance > 0.001) {
    account.sendMoney({
      "to": charityWallet,
      "amount": balance,
      "notes": "A donation, brought to you by the miners of Cryptocause!"
    }, function(err, txn) {
      console.log('my txn id is: ' + txn.id);
    });
  }
  else {
    console.log('sufficient funds not met');
  }
}, 60 * 1000);