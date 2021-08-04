// SPDX-License-Identifier: GPL-3.0
pragma solidity <=0.7.0;
import "./auction.sol";

contract Fundstorage {
    address public CA;
    auction instanceuser;
    constructor (address addr, auction Ref ) public {
        CA = addr;
        instanceuser = auction (Ref);
    }

    address payable owner = 0x3FDFf32C6f2AAc237ca20e37a0Fb181CC9594e98;
    modifier onlyOwner (){
        require (owner == msg.sender, "Only available for owner.");
        _;
    }
    function () external payable {} 
    address payable internal contractAddr = address(this);
    //lock the bids in this contract and only unlocked by issuer
    modifier onlyIssuer (uint ID) {
        require(instanceuser.bondOwner(ID) == msg.sender, "Only available to bond issuer.");
        _;
    }

    modifier onlyTokenholder (uint ID) {
        require (instanceuser.getTokenOwner(ID) == msg.sender, "Only available to owner.");
        _;
    }
    
    modifier reqTime (uint ID) {
        require (block.timestamp >= instanceuser.getTTD(ID), "Default period has not reached yet.");
        _;
    }

    //require the auction to complete before sending funds
    function send_Funds (uint ID, address payable _to, uint amt) public payable onlyIssuer (ID) {
        require (instanceuser.bondState(ID) == 2, "Auction is in session or capital has been transferred.");
        // uint amount_transfer = amt - instanceuser.getCollateral(ID);
        uint amount_transfer = amt * 700000000000000000;
        // uint xferAmt = amount_transfer * 1000000000000000000; //amount in wei
        _to.transfer(amount_transfer);
        owner.transfer (amt * 10000000000000000);
        instanceuser.changeState(ID); //for auction
    }

    function refund_Bids (address payable _refundAddress, uint _refundAmt, uint bid_code, uint ID) public payable onlyIssuer(ID) {
        require (instanceuser.getbidOwner(bid_code) == _refundAddress, "Address given is not the same as bidder's address.");
        require (instanceuser.getbidqty(bid_code) == _refundAmt, "Amount given is not equal.");
        require (instanceuser.getbidStatus(bid_code) == 1, "Bid is already refunded.");
        uint refundAmt = _refundAmt * 1000000000000000000;
        _refundAddress.transfer(refundAmt);
        instanceuser.changeBidStatus(bid_code);
    }

    //function to set the transfer amount 
    function transferBids (uint ID) public payable {
        require (instanceuser.bondOwner(ID) != msg.sender, "Bond issuer cannot bid for own bond.");
        contractAddr.transfer(msg.value);
    }
    
    function getCA () public view returns (address) {
        return CA;
    }

    function getBondowner (uint ID) public view returns (address payable){
        return instanceuser.bondOwner(ID);
    }

    // function getStatus (uint ID) public view returns (bool){
    //     return instanceuser.checkEnd(ID);
    // }

    function sendCollateral (uint ID) public payable onlyIssuer (ID) {
        require (instanceuser.getStatus(ID) == 1, "Bond is either has defaulted or collateral has been claimed.");
        if (instanceuser.getCouponCount(ID) >= instanceuser.minimumReq(ID)){
            uint collateralAmt = instanceuser.getCollateral(ID);
            address payable owner_Address = getBondowner(ID);
            owner_Address.transfer(collateralAmt);
            instanceuser.changeStatusCollected(ID);
        }
    }

    function default_call (uint tokenID, uint bondID) public onlyTokenholder(tokenID) reqTime(bondID) {
        instanceuser.changeStatus(bondID);
    } 

    // function for issuer to pay coupons 
    function issueCoupons (uint ID, address payable [] memory winners) public payable onlyIssuer (ID){
        contractAddr.transfer(instanceuser.getTotalCouponAmount(ID));
        for (uint i=0; i<winners.length; i++ ){
            address payable tmpAddr = winners[i];
            uint amount = instanceuser.getCouponAmt(ID);
            tmpAddr.transfer(amount);
        }
        instanceuser.changeCouponCount(ID);
    }

    // function to retreive collateral for bondholders
    function retrieveCollateral (uint tokenICN, uint bondID) public payable onlyTokenholder (tokenICN) {
        require (instanceuser.getStatus(bondID) == 2, "Bond is not in a default state");
        require (instanceuser.getTokenOwner(tokenICN) == msg.sender, "Only available for token holders");
        require (instanceuser.getTokenState(tokenICN) != 1, "Collateral already claimed");
        address payable tokenAdd = instanceuser.getTokenOwner(tokenICN);
        tokenAdd.transfer(300000000000000000);
        instanceuser.changeTokenState(tokenICN);
    }
    // function to send principal to bondholders
    function sendPrincipal (uint ID, address payable [] memory winners) public payable onlyIssuer (ID){
        require (instanceuser.getCouponCount(ID) == instanceuser.getTerm(ID));
        contractAddr.transfer(instanceuser.getDebt(ID));
        for (uint i =0; i<winners.length; i++){
            address payable tmpAddr = winners[i];
            uint amount = 1000000000000000000;
            tmpAddr.transfer(amount);
        }
        instanceuser.repaidfully(ID);
    }

    // function for transactional fees when creating an auction
    function fees (uint ID) public payable onlyIssuer(ID) {
        //issuer pays 0.01 eth for creation of auction session
        contractAddr.transfer(msg.value);
        owner.transfer(10000000000000000);
    }

}

