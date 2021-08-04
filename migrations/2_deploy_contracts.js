const auction = artifacts.require("auction.sol");
const Fundstorage = artifacts.require ("Fundstorage.sol")

module.exports = function(deployer) {
  deployer.deploy(auction).then(function(){
    return deployer.deploy(Fundstorage, auction.address, auction.address)
  });
  // deployer.deploy(Fundstorage);
};
