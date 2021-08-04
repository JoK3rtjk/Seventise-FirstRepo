pragma solidity <= 0.7.0;

contract auction {
     //error message; list of errors that will be emitted based on users' errors
    enum Error {
        No_Error,
        Invalid_inputs,
        Auction_already_started,
        Start_Time_in_Future,
        End_Time_in_Past,
        Bidder_is_owner,
        Auction_reached_target
        
    }
    
    enum FailureInfo {
        Inputs_require_positive_integer,
        Check_bond_id_input,
        Start_Time_requires_now,
        End_Time_requires_time_in_future,
        Bidder_cannot_be_owner,
        No_more_bids_are_accepted
    }
    
    
    
    //end of error message
    
    /**
      * @dev `error` corresponds to enum Error; `info` corresponds to enum FailureInfo, and `detail` is an arbitrary
      * contract-specific code that enables us to report opaque error codes from upgradeable contracts.
      **/
    event Failure(uint error, uint info, uint detail);

    function fail(Error err, FailureInfo info) internal returns (uint) {
        emit Failure(uint(err), uint(info), 0);

        return uint(err);
    }
    
    //constructor 
    // constructor () public {
    //     address payable owneraddr = msg.sender;
    //     address owner = msg.sender;        
        
    // }
    address public contractAddr;
    // address public owner = 0x225AfD53408e1c63595bb87CABE9Dd38F92de576;
    address public owner = 0x3FDFf32C6f2AAc237ca20e37a0Fb181CC9594e98;

    function setContractAddr (address setCA) public onlyOwner {
        contractAddr = setCA;
    }
    
    modifier onlyOwner (){
        require (owner == msg.sender, "Only available for owner.");
        _;
    }

    modifier onlyIssuer (uint ID) {
        require(bondOwner(ID) == msg.sender, "Only available to bond issuer.");
        _;
    }
    
    modifier onlyTokenholder (uint ID) {
        require (getTokenOwner(ID) == msg.sender, "Only available to owner.");
        _;
    }
    
    modifier reqTime (uint ID) {
        require (block.timestamp >= getTTD(ID), "Default period has not reached yet.");
        _;
    }

    modifier contractCall () {
        require (msg.sender == contractAddr, "Only callable by contract.");
        _;
    }

    function getOwner () public view returns (address){
        return owner;
    }
    
    //the numbers for identifying the different elements in the smart contract
    uint public _bondID = 0; //each bond has a unique ID 
    uint public bid_code = 500;
    uint public _auctionID = 0;
    uint public tokenICN = 1000;
    
    // -------Issuing Bonds----------
    
    //struct for details of the bond
        struct _bondoffer {
        uint bond_ID;
        string bond_Name;
        uint years_to_Maturity; //years to maturity
        uint amountOffered;
        address payable owner;
        uint aucID;
        uint state;
    }    

    
    // event for when new bonds are created
    
        event bond_Registeration(
        uint bond_ID, 
        string bond_Name,
        uint years_to_Maturity,
        uint amountOffered,
        address payable owner,
        uint aucID,
        uint state
        );
        
    // mapping to get bond details with bond_ID
     mapping (uint => _bondoffer) public bondInfo;
     
    //function to get owner of bond 
    
    function bondOwner (uint ID) public view returns (address payable){
        return bondInfo[ID].owner;
    }
    
    // function to increase coupon count 
    // function upCount (uint ID) external {
    //     require (bondOwner(ID) == msg.sender, "Only available to issuer");
        
    // }
    
    //function to change state of bond
    function changeState (uint ID) public contractCall() {
        require (bondInfo[ID].state == 2, "Auction has not started or is in progress");
        bondInfo[ID].state = 3;
    }
    
    //function to get YTM 
    function term_of_bond (uint ID) public view returns (uint) {
        return bondInfo[ID].years_to_Maturity;
    }
    
    // function to register 
    
     function createNewIssue (string memory _name, uint _years, uint _amountOffered) public {
        _bondID ++;
        _auctionID++;
        bondInfo[_bondID] = _bondoffer (_bondID, _name, _years, _amountOffered, msg.sender,_auctionID, 0);
        emit bond_Registeration(_bondID, _name, _years, _amountOffered, msg.sender, _auctionID, 0);
    }
    
    // event for a new auction 
        event newAuction (
        uint startTime,
        uint endTime,
        uint amountOffered,
        string statusofauc
    );
    
    // struct for auction details
    struct createauction{
        uint start;
        uint end;
        uint amountOffered;
        uint8 statusofauc;
    }
    mapping (uint => createauction) public createauctions;
    
    //function to getState
    
    function bondState (uint bondID) public view returns (uint) {
        return bondInfo[bondID].state;
    }
    
    // funciton to create Auction session
    
    function createAuction(uint bondID, uint startTime, uint endTime) public returns (uint){
        require(msg.sender == bondInfo[bondID].owner, "Only available for bond issuer");
        require(bondInfo[bondID].state == 0, "Bond auction is already in session ");
        require (checkStart_Time(startTime) == uint(Error.No_Error), "Start Time requires present or before");
        require (checkEnd_Time(endTime) == uint(Error.No_Error), "End Time should be in the future");
        uint aucId = bondInfo[bondID].aucID;
        createauctions[aucId].start = startTime;
        createauctions[aucId].end = endTime;
        createauctions[aucId].amountOffered = bondInfo[bondID].amountOffered;
        createauctions[aucId].statusofauc = 1;
        bondInfo[bondID].state = 1;
        emit newAuction(startTime, endTime, bondInfo[bondID].amountOffered, "Open");
        return aucId;
    }
    
    //check the start time of the auction
    function checkStart_Time (uint st) internal returns (uint){
        if(st > block.timestamp){
            fail (Error.Start_Time_in_Future, FailureInfo.Start_Time_requires_now);
        } else {
            return uint(Error.No_Error);
        }
    }
    
    //check the end time of the auction
    function checkEnd_Time (uint et) internal returns (uint){
        if (et <= block.timestamp){
            fail (Error.End_Time_in_Past, FailureInfo.End_Time_requires_time_in_future);
        } else {
            return uint (Error.No_Error);
        }
    }
    
    // function that change auction state to 2
    function changeAuctionState (uint aucID, uint ID) public onlyIssuer (ID) {
        // require(block.timestamp >= createauctions[aucID].end, "Auction has not ended yet.");
        createauctions[aucID].statusofauc = 2;
    }

    // event for ending the auction
    event end_auction (
        uint bondID,
        string stateofauc
    );

    // function to end the auction
    function endAuction (uint bondID) public returns (uint) {
        require(msg.sender == bondInfo[bondID].owner, "Only available for bond issuer");
        bondInfo[bondID].state = 2;
        emit end_auction(bondID, "Completed");
        return bondInfo[bondID].state;
    }
    
    
    // --------Bidding---------
    
    // get the array of bid ids with bond id
    mapping (uint => bidIDArray) bidIDs;
    // array of bid codes
    struct bidIDArray { uint [] biddingCodes;}
    // get the bid information with bid codes
    mapping (uint => BidInfo) public Bid_information;
    
    // bid information 
    struct BidInfo{
        uint bond_ID;
        uint bidReturns;
        uint quantity;
        address owner;
        uint status;
    }
    // event when a successful bid is made
    event newBid_entered (
        uint bid_code,
        uint _bond_ID,
        uint _bidReturns,
        uint quantity,
        address owner,
        uint status); //status 1 => entered, 2 => refunded.
    
    // function for placing new bid     
    function newBid (uint _bond_ID, uint _bidReturns, uint _quantity) public {
        require(bondInfo[_bondID].state == 1, "The session is close or completed");
        require (checkEnd(_bond_ID) == true, "Bond is not available as target has been reached");
        require(bondInfo[_bondID].owner != msg.sender, "Owner cannot bid for own offering");
        bid_code++;
        Bid_information[bid_code] = BidInfo(_bond_ID, _bidReturns, _quantity, msg.sender,1);
        emit newBid_entered(bid_code,_bond_ID, _bidReturns, _quantity, msg.sender,1);
        bidIDs[_bond_ID].biddingCodes.push(bid_code);
    } //use client side to pay the bid 
    
    // function to check the quantity of bids currently and compare it with the target of issuer
    function checkEnd (uint _bond_ID) internal view returns (bool available) {
        uint [] memory tmpArray = bidIDs [_bond_ID].biddingCodes;
		uint tmpQuantity = 0;
		//the following line should be replace with the bondInfo[_bond_ID].amountOffered
		uint target = bondInfo[_bond_ID].amountOffered;
		for (uint i = 0; i < tmpArray.length ; i++){
		    tmpQuantity = tmpQuantity + Bid_information[tmpArray[i]].quantity;
		}
		if (tmpQuantity >= target){
		    available = false;
		} else {available = true;}
		
    }
    // function to get owner of bids
    function getbidOwner (uint bid_codes) public view returns (address) {
        address bid_Owner = Bid_information[bid_codes].owner;
        return bid_Owner;   
    }
    // function to get bid IDs on client side
    function getbidIDs (uint _bond_ID) public view returns (uint [] memory displayBiddingCodes ) {
        displayBiddingCodes = bidIDs [_bond_ID].biddingCodes;        
    }

    // function to get bid qty 
    function getbidqty (uint bidcode) public view returns (uint) {
        return Bid_information[bidcode].quantity;
    }

    // function to get bid status
    function getbidStatus (uint bidcode) public view returns (uint) {
        return Bid_information[bidcode].status;
    }
    
    // function to reduce excess bids from the winners
    function changebidqty (uint code, uint excess, uint ID) public onlyIssuer(ID) {
        Bid_information[code].quantity = Bid_information[code].quantity - excess;
    }

    // function to change status of bid
    function changeBidStatus (uint bidcode) public contractCall() {
        Bid_information[bidcode].status = 2;
    }
    
    // -------- Tokenising bonds ----------
    
    // Token details
    struct tokenData {
        uint bondID;
        string bondname;
        uint ytm;
        uint couponrate;
        address payable owner;
        uint year_Issued;
        uint time_to_default;
        uint defaultCollateral;
        uint couponPayment;
        uint state;
    }
    // state of token {0: normal, 1: default with collateral claimed, 2: repaid fully}
    //each token will have a unique ICN; short for international certified number
     mapping (uint => tokenData) public tokenInformation; 
     
    //each issued bond will produce a batch of ICN, which corresponds to the tokenized bond 
    struct batch {
        uint [] ICN; 
    }
    
    //bond ID map to the batch of ICN
    mapping (uint => batch) BatchID; 
    
    //each profile/account can identify what they owned
    struct ownedbonds {
        uint [] ICNowned; 
    }
    
    // get the assets owned with address
    mapping (address => ownedbonds) asset;
    
    // function to get the batch of tokens with bondID on client side
    function getBatch (uint _ID) public view returns (uint [] memory arrayReturn){
        arrayReturn = BatchID[_ID].ICN;
    }
    
    // function to get the Assets on client side
    function getAsset (address payable addr) public view returns (uint [] memory assetArray){
        assetArray = asset[addr].ICNowned;
    }
    
    // function to get token owners on client side
    function getTokenOwner (uint ID) public view returns (address payable){
        return tokenInformation[ID].owner;
    }
    
    // function to get collateral amount
    
    event newTokenizedBondsMint (
        address payable [] winners,
        uint ID,
        string name,
        uint ytm,
        uint couponRate,
        uint year_Issued,
        uint time_to_default,
        uint defaultCollateral,
        uint couponPayment,
        uint state
        );
    
    // function to mint tokenized bond after issuance
    function mintTokenizedBonds (address payable [] memory winners, uint _ID, string memory _name, uint _ytm, uint _couponRate, uint _yearIssued) public {
        require (bondOwner(_ID) == msg.sender, "Only issuer can mint.");
        // require (bondState(_ID) == 2, "Auction not completed yet.");
        uint timetoDefault = time_to_default(_ID);
        uint default_collateral = 300000000000000000; //amount in wei, assumning each bond is 1 ether
        for ( uint i=0; i<=winners.length-1; i++ ){
            tokenICN++;
            tokenInformation[tokenICN] = tokenData(_ID, _name, _ytm, _couponRate, winners[i], _yearIssued, timetoDefault, default_collateral,0, 0); 
            BatchID[_bondID].ICN.push(tokenICN);
            address winAddress = address (winners[i]);
            asset[winAddress].ICNowned.push(tokenICN);
        }
        emit newTokenizedBondsMint(winners, _ID, _name, _ytm, _couponRate, _yearIssued, timetoDefault, default_collateral,0, 0);

    }
    
    // function to change state when collateral is claimed
    function changeTokenState (uint ICN) public contractCall() {
        tokenInformation[ICN].state = 1; // 1 => collateral is claimed
    }

    function getTokenState (uint ICN) public view returns (uint) {
        return tokenInformation[ICN].state;
    }


    function time_to_default (uint ID) public view returns (uint) {
        uint ytm = bondInfo[ID].years_to_Maturity;
        if (ytm / uint(2) == 0) {
            // uint timeDefault = block.timestamp  + uint(360) * 1 days;
            uint timeDefault = block.timestamp + uint(10) * 1 seconds;
            return timeDefault;
        } else { 
            // uint timeDefault = block.timestamp + (ytm / uint(2)) * uint(360) * 1 days;
            uint timeDefault = block.timestamp + (ytm / uint(2)) * uint(10) * 1 seconds; 
            return timeDefault;    
        }
        
    }
    
    // fn to get time to default
    function getTTD (uint ID) public view returns (uint) {
        return tokenInformation[ID].time_to_default;
    }

    // struct to store the final order for issuer 
    struct issuanceOrder {
        uint bond_ID;
        string bond_name;
        uint years_to_Maturity;
        uint coupon_Rate;
        uint year_Issued;
        uint debt_Amount;
        uint collateral_Amount;
        uint coupon_Amount;
        uint coupon_Total;
        uint couponCount;
        address payable issuer_Address;
        uint bond_Status;
    }
    // bond status {1: normal, 2: defaulted, 3: collateral claimed, 4: repaid fully}

    // put in ID to get issuanceOrder
    mapping (uint => issuanceOrder) public issueInfo;
    
    
    struct issuerDebt {
        uint [] issueOrders;
    }
    mapping (address => issuerDebt) issuedOrders;
    
    function getIssuedOrder (address payable issuer) public view returns (uint [] memory issuedOrderArray){
        issuedOrderArray = issuedOrders[issuer].issueOrders;
        return issuedOrderArray; 
    }
    event issuanceEvent (
        uint bond_ID,
        string bond_name,
        uint years_to_Maturity,
        uint coupon_Rate,
        uint year_Issued,
        uint debt_Amount,
        uint collateral_Amount,
        uint coupon_Amount,
        uint coupon_Total,
        uint couponCount,
        address payable issuer_Address,
        uint bond_Status
        );
        
    // function to mint tokenized issuance order for issuer
    function mintOrder (uint ID, string memory _name, uint _ytm, uint _couponRate, uint _yearIssued, uint _debtAmount) public {
        require (bondOwner(ID) == msg.sender, "Only available for issuer");
        require (bondState(ID) != 1, "Auction has not been completed");
        uint _debtToWei = _debtAmount * 1000000000000000000;  
        uint _collateralToWei = _debtAmount * 300000000000000000;
        uint _couponAmountToWei = _couponRate * 10000000000000000;
        uint _couponTotal = _debtAmount * _couponRate * 10000000000000000;
        issueInfo[ID] = issuanceOrder (ID, _name, _ytm, _couponRate, _yearIssued, _debtToWei, _collateralToWei,_couponAmountToWei, _couponTotal, 0, msg.sender, 1);
        issuedOrders[msg.sender].issueOrders.push(ID);
        emit issuanceEvent(ID, _name, _ytm, _couponRate, _yearIssued, _debtToWei, _collateralToWei,_couponAmountToWei, _couponTotal, 0, msg.sender,1);
    }
    
    // function to get couponCount
    function getCouponCount (uint ID) public view returns (uint){
        return issueInfo[ID].couponCount;
    }
    
    // function to change couponCount
    function changeCouponCount (uint ID) public contractCall() {
        uint [] memory tokenICNarray = getBatch(ID);
        issueInfo[ID].couponCount += 1;
        for (uint i = 0; i < tokenICNarray.length; i++){
            tokenInformation[tokenICNarray[i]].couponPayment += 1;
        }
    }

    // function to change tokenState 
    function repaidfully (uint ID) public contractCall() {
        uint [] memory tokenICNarray = getBatch(ID);
        issueInfo[ID].bond_Status = 4;
        for (uint i = 0; i < tokenICNarray.length; i++) {
            tokenInformation[tokenICNarray[i]].state = 2;
        }
    }

    // function to get YTM 
    function getTerm (uint ID) public view returns (uint) {
        return issueInfo[ID].years_to_Maturity;
    }
    
    function minimumReq (uint ID) public view returns (uint){
        uint YTM = issueInfo[ID].years_to_Maturity;
        if(YTM / uint(2) == 0){
            return 1;
        } else { return YTM / uint(2);}
        
    }
    
    // function to get collateral_Amount
    function getCollateral (uint ID) public view returns (uint) {
        return issueInfo[ID].collateral_Amount;
    }
    
    function getCouponAmt (uint ID) public view returns (uint) {
        return issueInfo[ID].coupon_Amount;    
    }
    
    // function to get status of issue
    function getStatus (uint ID) public view returns (uint) {
       return issueInfo[ID].bond_Status;
    }
    
    function getTotalCouponAmount (uint ID) public view returns (uint) {
        return issueInfo[ID].coupon_Total;
    }

    // get total debt to pay back principal
    function getDebt (uint ID) public view returns (uint) {
        return issueInfo[ID].debt_Amount;
    }
    
    // function to change status after not paying coupon payments
    function changeStatus (uint ID) public reqTime (ID){
        require (getCouponCount(ID) < minimumReq(ID), "Coupon payments have been paid");
        issueInfo[ID].bond_Status = 2; // 2 => bond issuer defaulted
    }

    // function to change status after claiming collateral
    function changeStatusCollected (uint ID) public contractCall(){
        issueInfo[ID].bond_Status = 3; // 3 => bond issuer claimed collateral
    }


}

