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
    $.getJSON('MyToken.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var MintableTokenArtifact = data;
      App.contracts.MintableToken = TruffleContract(MintableTokenArtifact);

      // Set the provider for our contract.
      App.contracts.MintableToken.setProvider(App.web3Provider);

      // Use subcontract token to return current token balance of the user.
      return App.getTokenAddress();
    });
    $.getJSON('MyCrowdsale.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var SampleCrowdsaleArtifact = data;
      App.contracts.SampleCrowdsale = TruffleContract(SampleCrowdsaleArtifact);

      // Set the provider for our contract.
      App.contracts.SampleCrowdsale.setProvider(App.web3Provider);

      // Use subcontract token to return current token balance of the user.
      return App.getCrowdsaleAddress(), App.getEndTime(), App.getRaisedFunds();
    });  
    console.log(App.contracts);
    return App.bindEvents();
  },

  getTokenAddress: function() {
    App.contracts.MintableToken.deployed().then(function(instance) {
      console.log('TOKEN ADDRESS IS');
      console.log(instance.address);
      App.tokenAddress = instance.address;
    });
  },

  getCrowdsaleAddress: function() {
    App.contracts.SampleCrowdsale.deployed().then(function(instance) {
      console.log("CROWDSALE ADDRESS IS");
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
        token.transferOwnership(App.crowdsaleAddress).then(function(result) {
          console.log(result);
        });
      });
  },
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
