App = {
  web3Provider: null,
  contracts: {},
  tokenAddress: null,
  crowdsaleAddress: null,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      console.log('current provider is ');
      console.log(App.web3Provider);
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
      //App.web3Provider = new Web3.providers.HttpProvider('https://ropsten.infura.io/cpokRXa96X1xQ48pv841');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('BinkdToken.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var MintableTokenArtifact = data;
      App.contracts.MintableToken = TruffleContract(MintableTokenArtifact);

      // Set the provider for our contract.
      App.contracts.MintableToken.setProvider(App.web3Provider);

      // Use subcontract token to return current token balance of the user.
      return App.getTokenAddress();
    });
    $.getJSON('BinkdPresale.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var SampleCrowdsaleArtifact = data;
      App.contracts.SampleCrowdsale = TruffleContract(SampleCrowdsaleArtifact);

      // Set the provider for our contract.
      App.contracts.SampleCrowdsale.setProvider(App.web3Provider);

      // Use subcontract token to return current token balance of the user.
      return App.getCrowdsaleAddress(), App.getStartTime(), App.getEndTime(), App.getRaisedFunds();
    });  
    console.log(App.contracts);
    return App.bindEvents();
  },

  getTokenAddress: function() {
    App.contracts.MintableToken.deployed().then(function(instance) {
      console.log('TOKEN ADDRESS IS');
      console.log(instance);
      App.tokenAddress = instance.address;
    });
  },

  getCrowdsaleAddress: function() {
    App.contracts.SampleCrowdsale.deployed().then(function(instance) {
      console.log("CROWDSALE ADDRESS IS");
      console.log(instance);
      instance.paused.call().then(function(response) {
        console.log(response);
      }).catch(function(e) {
        console.log(e);
      });
      console.log(instance.address);
      App.crowdsaleAddress = instance.address;
    });
  },

  getEndTime: function(){
    console.log('Getting endtime...');
    App.contracts.SampleCrowdsale.deployed().then(function(instance) {
        crowdsale = instance;
        return crowdsale.endTime();
    }).then(function(result){
      endTime = new Date(result.c[0]*1000);
      console.log(endTime);
      $('#EndTime').text(endTime);
      }).catch(function(err) {
          console.log(err.message);
        });
  },
  getStartTime: function(){
    console.log('Getting starttime...');
    App.contracts.SampleCrowdsale.deployed().then(function(instance) {
        crowdsale = instance;
        return crowdsale.startTime();
    }).then(function(result){
      startTime = new Date(result.c[0]*1000);
      console.log(startTime);
      $('#StartTime').text(startTime);
      }).catch(function(err) {
          console.log(err.message);
        });
  },
  getRaisedFunds: function(){
    console.log('Getting raised funds...');
    App.contracts.SampleCrowdsale.deployed().then(function(instance) {
        crowdsale = instance;
        return crowdsale.weiRaised();
    }).then(function(result){
      EthRaised = Math.round(1000*result/1000000000000000000)/1000; // Result is returned in wei (10^18 per 1 ETH), so divide by 10^18. Also using a technique to "multiply and divide" by 1000 for rounding up to 3 decimals.
      $('#ETHRaised').text(EthRaised.toString(10));
      }).catch(function(err) {
          console.log(err.message);
        });
  },

  bindEvents: function() {
    $(document).on('click', '#wlAddressButton', App.handleWhitelist);
    $(document).on('click', '#transferOwnership', App.transferOwnership);
    $(document).on('click', '#getOwnership', App.getOwnership);
    $(document).on('click', '#unpauseTokenTransfers', App.unpauseTokenTransfers);
    $(document).on('click', '#resetInitialDates', App.resetInitialDates);
  },

  handleWhitelist: function(event) {
    event.preventDefault();
    console.log('Whitelisting Address...');
    var crowdsale;
      App.contracts.SampleCrowdsale.deployed().then(function(instance) {
        crowdsale = instance;
        var wlAddresses = [];
        wlAddresses.push($('#wl_address').val());
        console.log('logging wlAddresses...');
        console.log(wlAddresses);
        crowdsale.addToWhitelist(wlAddresses, {from: "0xd543e794cd0e97a066200efaf30e53ec62d4e3d9"});
      });
  },
  transferOwnership: function(event) {
    event.preventDefault();
    console.log('Transfering Ownership to Contract...');
    var crowdsale;
      App.contracts.MintableToken.deployed().then(function(instance) {
        token = instance;
        console.log(token);
        token.transferOwnership(App.crowdsaleAddress, {from: "0x8c6f185437f3cf63302e915d0031c69b57cb0a5b"}).then(function(result) {
          console.log(result);
        });
      });
  },
  getOwnership: function(event) {
    event.preventDefault();
    console.log('Getting Ownership of Token Contract...');
    var crowdsale;
      App.contracts.MintableToken.deployed().then(function(instance) {
        token = instance;
        console.log(token);
        token.owner.call({from: "0x8c6f185437f3cf63302e915d0031c69b57cb0a5b"}).then(function(result) {
          console.log(result);
        });
      });
  },  
  unpauseTokenTransfers: function(event) {
    event.preventDefault();
    console.log('Unpausing token tranfers...');
    var crowdsale;
      App.contracts.MintableToken.deployed().then(function(instance) {
        token = instance;
        token.paused.call({from: "0x8c6f185437f3cf63302e915d0031c69b57cb0a5b"}).then(function(result) {
          console.log(result);
        }).catch(function(e) {
          console.log(e);
        });
        console.log(token);
        token.unpause({from: "0x8c6f185437f3cf63302e915d0031c69b57cb0a5b"}).then(function(result) {
          console.log(result);
        }).catch(function(e) {
          console.log(e);
        });
      });
  },   
  resetInitialDates: function(event) {
    event.preventDefault();
    console.log('Resetting Initial Dates...');
    var crowdsale;
      App.contracts.SampleCrowdsale.deployed().then(function(instance) {
        crowdsale = instance;
        var _startTime = Date.now()/1000|0 + 120;
        var _endTime = _startTime + 604800;
        crowdsale.setPresaleDates(_startTime, _endTime, {from: "0x8c6f185437f3cf63302e915d0031c69b57cb0a5b"}).then(function(result) {
          console.log(result);
        }).catch(function(e) {
          console.log(e);
        });
      });
  },  
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
