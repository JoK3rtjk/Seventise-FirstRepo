import Web3 from "web3";
import auctionArtifact from "../../build/contracts/auction.json";
import FundstorageArtifact from "../../build/contracts/Fundstorage.json";

const App = {
  web3: null,
  account: null,
  meta: null,
  escrow: null,

  start: async function () {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = auctionArtifact.networks[networkId];
      const deployedNetwork2 = FundstorageArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        auctionArtifact.abi,
        deployedNetwork.address
      );
      this.escrow = new web3.eth.Contract(
        FundstorageArtifact.abi,
        deployedNetwork2.address
      );
    

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
      console.log(this.account);
      let bal = await web3.eth.getBalance(deployedNetwork2.address);
      let tmpOwner = await this.meta.methods.getOwner().call();
      console.log(tmpOwner);
      // let con = await this.meta.methods.contractAddr().call();
      // console.log(con);
      // let setCA = this.meta.methods.setContractAddr("0x0316B930B266ECAEDDE92eF32e94411163fE9a02").send({from:this.account});

      
      // WRITE ACCOUNT # ON HEADER 
      document.getElementById("address").innerHTML = "Account: " + this.account;
      //Display details of bonds on html
      const bondID = await this.meta.methods._bondID().call();
      for (var i = 1; i <= parseInt(bondID); i++) {
        let id = i.toString();
        let bidCodesArray = await App.mapBids(id);
        let total = await App.getTotalqty(bidCodesArray[i - 1]);
        let BCInfo = await this.meta.methods.bondInfo(parseInt(i)).call();
        let tmpTokenArray = await this.meta.methods.getBatch(id).call();
        // let tokenInfo = await this.meta.methods.tokenInformation(tmpTokenArray[0]).call();
        let aucInfo = await this.meta.methods.createauctions(parseInt(i)).call();
        let aucState = aucInfo[3];
        console.log(aucState);
        let endTime = aucInfo[1];
        App.createModal(i);
        let b0 = document.getElementById("mk").appendChild(document.createElement("div"));
        // padding: "77px 20px 20px 30px"
        $(b0).css({
          margin: "0px"
        });
        $(b0).addClass("mk-box");
        let b1 = b0.appendChild(document.createElement("div"));
        $(b1).addClass("card text-center text-white bg-secondary mb-3");
        $(b1).css({
          width: "18.5rem"
        });
        let b2 = b1.appendChild(document.createElement("div"));
        $(b2).addClass("card-header");
        b2.innerHTML = "Bond ID: " + BCInfo[0];
        let b3 = b1.appendChild(document.createElement("div"));
        $(b3).addClass("card-body");
        b3.setAttribute("id", "cardbody" + BCInfo[0]);
        let b4 = b3.appendChild(document.createElement("h4"));
        b4.innerHTML = "Name: " + BCInfo[1];
        let b5 = b3.appendChild(document.createElement("h4"));
        b5.innerHTML = "Years to Maturity: " + BCInfo[2];
        let b6 = b3.appendChild(document.createElement("h4"));
        b6.innerHTML = "Targeted Capital: " + BCInfo[3];
        let b8 = b3.appendChild(document.createElement("p"));
        let bsmall = b8.appendChild(document.createElement("small"));
        b8.innerHTML = "Owner: " + BCInfo[4];
        let b7 = b3.appendChild(document.createElement("div"));
        let b9 = b7.appendChild(document.createElement("span"));
        b9.setAttribute("id", "badge" + BCInfo[0]);
        let state_1 = BCInfo[6];
        // Newly registered bonds, to be issued. 
        if (parseInt(state_1) == 0) {
          $(b9).addClass("badge rounded-pill bg-secondary");
          b9.innerHTML = "Closed";
        // Unsuccessful auction with bids refunded 
        } else if (parseInt(aucState) == 2) {
          $(b9).addClass("badge rounded-pill bg-danger");
          b9.innerHTML = "Ended";
        } else if (parseInt(state_1) == 1 && parseInt(Date.now()) >= parseInt(endTime) && BCInfo[4] == this.account && parseInt(total) == 0){
          $(b9).addClass("badge rounded-pill bg-danger");
          b9.innerHTML = "Ended";
        } else if (parseInt(state_1) == 1 && parseInt(Date.now()) >= parseInt(endTime) && BCInfo[4] == this.account){
          let bidref = await App.getBidCodes(i);
          console.log(bidref);
          $(b9).addClass("badge rounded-pill bg-danger");
          b9.innerHTML = "Ended [Bids: " + total + "]";
          let b990 = b3.appendChild(document.createElement("button"));
          $(b990).addClass("btn btn-dark round-btn");
          $(b990).css({
            margin: "10px"
          });
          b990.innerHTML = "Start Refund";
          $(b990).on("click", function (){
            App.Unsuccesful_auctions_refund(bidref);
          })

        } else if (parseInt(state_1) == 1 && parseInt(Date.now()) >= parseInt(endTime)){
          $(b9).addClass("badge rounded-pill bg-danger");
          b9.innerHTML = "Ended";
          // add end button for owner that refund if the auction does not fulfil the required target

        } else if (parseInt(state_1) == 1) {
          $(b9).addClass("badge rounded-pill bg-success");
          b9.innerHTML = "Open";
          let b1010 = b3.appendChild(document.createElement("p"))
          let b1011 = b1010.appendChild(document.createElement("div"));
          let b10 = b3.appendChild(document.createElement("button"));
          $(b10).addClass("btn btn-dark round-btn");
          $(b10).css({
            margin: "10px"
          });
          b10.innerHTML = "Bid";
          b10.setAttribute("id", "bid" + i);
          let bidref = b10.getAttribute("id");
          let modref = "modal" + i;
          $("#" + bidref).on("click", function () {
            App.openModal(modref);
          });
          if (parseInt(total) < parseInt(BCInfo[3]) && BCInfo[4] == this.account){
            let b1012 = b1011.appendChild(document.createElement("span"));
            $(b1012).addClass("badge round-pill bg-primary");
            b1012.innerHTML = "Current total quantity bidded: " + total;
          }
          else if (parseInt(total) >= parseInt(BCInfo[3]) && BCInfo[4] == this.account) {
            let b1012 = b1011.appendChild(document.createElement("span"));
            $(b1012).addClass("badge round-pill bg-primary");
            b1012.innerHTML = "Current total quantity bidded: " + total;
            let b1013 = b3.appendChild(document.createElement("button"));
            $(b1013).addClass("btn btn-warning round-btn");
            b1013.innerHTML = "End";
            b1013.setAttribute("id", "complete" + i);
            let completeref = b1013.getAttribute("id");
            $("#" + completeref).on("click", function () {
              App.winningBidCodes(bondID);
            });
          }
        } else if (parseInt(state_1) == 2 && BCInfo[4] == this.account){
          App.createIssueModal(i);
          let tokenInfo = await this.meta.methods.tokenInformation(tmpTokenArray[0]).call();
          let couponRate = tokenInfo[3];
          console.log(couponRate);
          $(b9).addClass ("badge round-pill bg-primary");
          b9.innerHTML = "Completed"
          let b11 = b3.appendChild (document.createElement("button"));
          $(b11).addClass ("btn btn-dark round-btn");
          b11.innerHTML = "Accept"
          let tokenModal = "tokenModal" + i
          $(b11).on("click", function(){
            App.openModal(tokenModal);
          });
          // make a modal that shows the issuance details and provide options to accept or decline
          $(b11).css({
            margin: "10px"
          });
        } else {
          $(b9).addClass("badge rounded-pill bg-dark");
          b9.innerHTML = "Completed";
        }
      };

      //DISPLAY TOKENIZED BONDS ON HTML FOR BONDHOLDERS
      let assetArray = await this.meta.methods.getAsset(this.account).call();
      console.log(assetArray);
      for (var j = 0; j < assetArray.length; j++){
        let curr = Date.now();
        let token_information = await this.meta.methods.tokenInformation(assetArray[j]).call();
        let tokenID = parseInt(assetArray[j]);
        let tokenStatus = token_information[9];
        let status = await this.meta.methods.getStatus(token_information[0]).call();
        console.log("Issuance Status: " + status);
        console.log ("Token Status: " + tokenStatus);
        // let d0 = document.getElementById("token-sect").appendChild(document.createElement("div"));
        let d0 = document.getElementById("token-sect").appendChild(document.createElement("div"));
        $(d0).addClass("token-container");
        let d1 = d0.appendChild(document.createElement("div"));
        $(d1).addClass("card");
        let d2 = d1.appendChild(document.createElement("div"));
        $(d2).addClass("card-body");
        let d3 = d2.appendChild(document.createElement("p"));
        $(d3).addClass("header1");
        d3.innerHTML = "Token ICN: " + assetArray[j];
        let d4 = d2.appendChild(document.createElement("p"));
        $(d4).addClass("header1");
        d4.innerHTML = "Token issue year: " + token_information[5];
        let d5 = d2.appendChild(document.createElement("p"));
        $(d5).addClass("header1");
        d5.innerHTML = "Token coupon payment received: " + token_information[8];
        if (parseInt(curr) >= parseInt(token_information[6]) && parseInt(status) == 1){
          let d6 = d2.appendChild(document.createElement("button"));
          $(d6).addClass("btn btn-dark round-btn");
          $(d6).css({
            margin: "10px"
          });
          d6.innerHTML = "Default call";
          $(d6).on("click", function(){
            App.default_call(tokenID,parseInt(token_information[0]));
          })
        } else if (parseInt(tokenStatus) == 1) {
          let d8 = d2.appendChild(document.createElement("span"));
          $(d8).addClass("badge rounded-pill bg-info");
          d8.innerHTML = "Collateral Claimed, Issuer Defaulted";
        }
         else if (parseInt(status) == 2){
          let d8 = d2.appendChild(document.createElement("span"));
          $(d8).addClass("badge badge-pill-danger");
          d8.innerHTML = "Defaulted";
          let d7 = d2.appendChild(document.createElement("button"))
          $(d7).addClass ("btn btn-dark round-btn");
          $(d7).css ({
            margin: "10px"
          });
          d7.innerHTML = "Retrieve Collateral";
          $(d7).on("click", function(){
            App.retrieveCollateral(tokenID, parseInt(token_information[0]));
          })
        } else if (parseInt(status) == 4) {
          let d8 = d2.appendChild(document.createElement("span"));
          $(d8).addClass("badge rounded-pill bg-success");
          d8.innerHTML = "Repaid";
        }
        
      }
      // display issuanceOrder for issuer on html
      let issuanceRef = await this.meta.methods.getIssuedOrder(this.account).call();
      // console.log(issuanceRef);
      for (var k = 0; k < issuanceRef.length; k++){
        let status = await this.meta.methods.getStatus(issuanceRef[k]).call();
        let minimumRequirement = await this.meta.methods.minimumReq(issuanceRef[k]).call();
        let tmpIssuanceInfo = await this.meta.methods.issueInfo(issuanceRef[k]).call();
        console.log(tmpIssuanceInfo[9]);  
        let issueID = tmpIssuanceInfo[0];
        console.log("Status: "+ status);
        // let h0 = document.getElementById("token-sect").appendChild(document.createElement("div"));
        let h0 = document.getElementById("token-sect").appendChild(document.createElement("div"));
        $(h0).addClass("token-container")
        let h1 = h0.appendChild(document.createElement("div"));
        $(h1).addClass("card");
        let h2 = h1.appendChild(document.createElement("div"));
        $(h2).addClass("card-body");
        let h3 = h2.appendChild(document.createElement("h5"));
        $(h3).addClass("header1");
        h3.innerHTML = "Issuance ID: " + issuanceRef[k];
        let h5 = h2.appendChild(document.createElement("h5"));
        $(h5).addClass("header1")
        h5.innerHTML = "Issuance coupon rate: " + tmpIssuanceInfo[3];
        if (parseInt(status) == 4) {
          let h05 = h2.appendChild(document.createElement("span"));
          $(h05).addClass ("badge badge-pill badge-success");
          h05.innerHTML = "Repaid";
        } else if (parseInt(status) == 2) {
          let h05 = h2.appendChild(document.createElement("span"));
          $(h05).addClass ("badge badge-pill badge-danger");
          h05.innerHTML = "Defaulted";
        } else if (parseInt(status) == 1) {
          let h4 = h2.appendChild(document.createElement("button"));
          $(h4).addClass("btn btn-dark round-btn");
          $(h4).css({
            margin: "10px"
          });
          h4.innerHTML = "Coupon Payment";
          $(h4).on("click", function () {
            App.issueCoupons(issueID);
          })
          if (parseInt(tmpIssuanceInfo[9]) >= parseInt(minimumRequirement) && parseInt(status) == 1) {
            let h100 = h2.appendChild(document.createElement("button"));
            $(h100).addClass("btn btn-dark round-btn");
            $(h100).css({
              margin: "10px"
            });
            h100.innerHTML = "Claim collateral";
            $(h100).on("click", function () {
              App.sendCollateral(issueID);
            })

          }

          else if (parseInt(tmpIssuanceInfo[9]) == parseInt(tmpIssuanceInfo[2])) {
            let h110 = h2.appendChild(document.createElement("button"));
            $(h110).addClass("btn btn-dark round-btn");
            $(h110).css({
              margin: "10px"
            });
            h110.innerHTML = "Repay Principal";
            $(h110).on("click", function () {
              App.sendPrincipal(issueID);
            })
          }
        }
      }

    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  //Register a new bond and write into the blockchain
  createNewIssue: async function () {
    let name = document.getElementById("BondName").value;
    let YTM = (document.getElementById("YTM").value);
    let tc = (document.getElementById("TC").value);
    const { createNewIssue } = this.meta.methods;
    await createNewIssue(name, YTM, tc).send({ from: this.account });
    const bondID = await this.meta.methods._bondID().call();
    let tmpInfo = await this.meta.methods.bondInfo(bondID).call();
    //Display the info on html after submitting
    let b0 = document.getElementById("mk").appendChild(document.createElement("div"));
    $(b0).css({
      margin: "10px 10px 10px 35px"
    });
    let b1 = b0.appendChild(document.createElement("div"));
    $(b1).addClass("card text-center text-white bg-secondary mb-3");
    let b2 = b1.appendChild(document.createElement("div"));
    $(b2).addClass("card-header");
    b2.innerHTML = "Bond ID: " + tmpInfo[0];
    let b3 = b1.appendChild(document.createElement("div"));
    $(b3).addClass("card-body");
    let cardref = "card-body" + tmpInfo[0];
    b3.setAttribute("id", cardref);
    let b4 = b3.appendChild(document.createElement("h4"));
    b4.innerHTML = "Name: " + tmpInfo[1];
    let b5 = b3.appendChild(document.createElement("h4"));
    b5.innerHTML = "Years to Maturity: " + tmpInfo[2];
    let b6 = b3.appendChild(document.createElement("h4"));
    b6.innerHTML = "Targeted Capital: " + tmpInfo[3];
    let b8 = b3.appendChild(document.createElement("p"));
    b8.innerHTML = "Owner: " + tmpInfo[4];
    let b7 = b3.appendChild(document.createElement("span"));
    let state_1 = tmpInfo[6];
    if (parseInt(state_1) == 0) {
      $(b7).addClass("badge badge-pill badge-danger");
      b7.setAttribute("id", "badge" + tmpInfo[0]);
      b7.innerHTML = "Closed";
    } else if (parseInt(state_1) == 1) {
      $(mk.b7).addClass("badge badge-pill badge-success");
      b7.innerHTML = "Open";
      // let b8 = b3.appendChild(document.createElement("button"))
      // b8.onclick = function()
    } else {
      $(b7).addClass("badge badge-pill badge-info");
      b7.innerHTML = "Completed";
    }

  },

  bondInfo: async function () {
    let id = document.getElementById("id").value;
    const { bondInfo } = this.meta.methods;
    const bond_information = (await bondInfo(id).call());
    console.log(bond_information[3]);
    //insert data into a modal
  },

  convertDate: function () {
    var myDate = new Date; // Your timezone!
    myDate = document.getElementById("inputDate").value;
    var tmpdate = Date.parse(myDate);
    var tmpdiff = tmpdate - Date.now();
    console.log(tmpdiff);
    document.getElementById("outputDate").innerHTML = tmpdate;
  }, //this is in dev phase and more thoughts are needed to handle time.

  createAuction: async function () {
    const { createAuction } = this.meta.methods;
    let curr = Date.now();
    let id = document.getElementById("CA_BondID").value;
    let startTime = document.getElementById("ST").value; 
    let endTime = document.getElementById("ET").value;
    let start = Date.parse(startTime);
    let end = Date.parse(endTime);
    if (start <= curr && end >= curr) {
    App.fees(id);
    await createAuction(id, start, end).send({ from: this.account });
    
      let badgeref = "badge" + id.toString();
      let cardID = "card-body" + id.toString();
      $('#' + badgeref).removeClass("badge badge-pill badge-danger");
      $('#' + badgeref).addClass("badge badge-pill badge-success")
      document.getElementById(badgeref).innerHTML = "Open"
      let b10 = document.getElementById(cardID).appendChild(document.createElement("br"));
      let b11 = document.getElementById(cardID).appendChild(document.createElement("button"));
      b11.setAttribute("id", "bid" + id);
      let bidref = b11.getAttribute("id");
      let modref = "modal" + id;  
      b11.innerHTML = "Bid"
      $(b11).addClass("btn btn-dark")
      App.createModal(id);
      $("#" + bidref).click(function(){
        App.openModal(modref);
      })
    } else { alert("Please check start time is before now and end time is after now.") }

  },

  fees: async function (ID) {
    let transactionFees = 10000000000000000;
    await this.escrow.methods.fees(ID).send({ from: this.account, value: transactionFees })
  },

  endAuction: async function (bondID) {
    const { endAuction } = this.meta.methods;
    await endAuction(bondID).send({from: this.account})
    return "Auction Ended"; //INSERT TIME CHECKING LOGIC FOR ELSE
  },

  winningBidCodes: async function (ID) {
    let bondID = ID;
    let arrayBidCodes = await App.mapBids(bondID); //1D array of bid codes for bondID: ID
    let arrayforBond = arrayBidCodes[bondID - 1];
    let excessData = await App.excess(bondID);
    let tmparray = await App.getMaxBid_codes(arrayforBond);//a 2d array with first array being array of max bids and the second array being array of remaining bids
    let maxbidarray = tmparray[0]; //1D array of bid codes with bid of max returns
    let remainingbidarray = tmparray[1]; //1D array of bid codes with bid of different returns and not max
    let total = await App.getTotalqty(maxbidarray);
    let tmparrayNew = [];
    var lostbids = []; //lostbids[0] is an empty array
    var winningbids =[];
    let allbidcodes = arrayforBond; //this is used to track winning bids
    let changedQuantity = 0;
    let changedbidcodes = 0;

    //if there is no excess, we just end the auction and pays the offeror
    if(excessData == 0 ){
      let tmpInfo = await this.meta.methods.bondInfo(ID).call();
      let owneraddress = tmpInfo[4];
      let TC = tmpInfo[3];
      console.log("start");
      // App.send_Funds(bondID, owneraddress, TC);
      App.endAuction(bondID);
      let _couponRates = await App.getMaxRetn(arrayforBond);
      for (index=0; index<=arrayforBond.length-1; index++){
        let tmpI = await this.meta.methods.Bid_information(arrayforBond[index]).call();
        let quantity = parseInt(tmpI[2]);
        let owner = tmpI[3]
        for (ref = 0; ref < quantity; ref++){
          winningbids.push(owner);
        }
      }
      console.log(winningbids);
      console.log(_couponRates);
      App.mintTokenizedBonds(winningbids,bondID,_couponRates);
    } else {
    // there are 3 events to take not of: 
    // 1. Total quantity of bids with max coupon rate is fewer than excess
    // 2. Total quantity of bids with second max and beyond are fewer than excess 
    // 3. Total quantity of bids with nth max is more than excess 
      do {
        console.log("here00");
        lostbids = lostbids.concat(maxbidarray);
        console.log(lostbids);
        console.log(excessData);
        // First event (second event might also enter here):

        if (total < excessData) {
          console.log("First Event") //all these bids are losing bids 
          excessData -= total;
          for (var i = lostbids.length - 1; i >= 0; i--) {
            let tmpqtyInfo = await this.meta.methods.Bid_information(lostbids[i]).call();
            let qtyofBids = parseInt(tmpqtyInfo[2]);
            let refundaddr = tmpqtyInfo[3];
            App.refund_Bids(refundaddr,qtyofBids,lostbids[i],bondID);
            //refunding the losing bids
            for (var ref = 0; ref < allbidcodes.length; ref++) {
              if (allbidcodes[ref] == lostbids[i]) {
                allbidcodes.splice(ref, 1);
              }
            }
            lostbids.pop();
            console.log(allbidcodes);
          }
          tmparrayNew = await App.getMaxBid_codes(remainingbidarray);
          maxbidarray = tmparrayNew[0]; //set a new max function
          total = await App.getTotalqty(maxbidarray);
          console.log(total);
          console.log(excessData);
          console.log(lostbids);

          // Third event after first event
        } else if (total >= excessData && tmparrayNew.length != 0) {
          console.log("here"); //some of these bids are winning bids
          // lostbids.pop(maxbidarray);
          let tmpMaxbidarray = tmparrayNew[0];
          for (var index = (tmpMaxbidarray.length - 1); (index >= 0) && (excessData > 0); index--) {
            let tmpqtyInfo = await this.meta.methods.Bid_information(tmpMaxbidarray[index]).call();
            let qtyofBids = parseInt(tmpqtyInfo[2]);
            let refundAddr = tmpqtyInfo[3];
            if (qtyofBids > excessData) {
              changedbidcodes = tmpMaxbidarray[index];
              changedQuantity = qtyofBids - excessData;
              App.changebidqty(tmpMaxbidarray[index], excessData, bondID);
              App.refund_Bids(refundAddr, excessData,tmpMaxbidarray[index], bondID);
              excessData -= qtyofBids;
              console.log(lostbids); //lost bid is an array with max bids
            } else if (qtyofBids <= excessData) {
              console.log("here1")//the bid corresponding to the bidcode is not a winning bid
              // let tmpbidqty = []
              // tmpbidqty.push(tmpMaxbidarray[index])
              App.refund_Bids(refundAddr, qtyofBids,tmpMaxbidarray[index],bondID);
              for (var ref = 0; ref < allbidcodes.length; ref++) {
                if (allbidcodes[ref] == tmpMaxbidarray[index]) {
                  allbidcodes.splice(ref, 1);
                }
              }
              lostbids.pop();
              excessData -= qtyofBids;
              console.log(allbidcodes);

            }
          }
          // Third event, bids with max coupon rate more than excess
        } else if (total >= excessData) {
          console.log("Third event");
          for (var index = (maxbidarray.length - 1); (index >= 0) && (excessData > 0); index--) {
            let tmpqtyInfo = await this.meta.methods.Bid_information(maxbidarray[index]).call();
            let qtyofBids = parseInt(tmpqtyInfo[2]);
            if (qtyofBids > excessData) {
              console.log("Third event, found winning bids")
              changedbidcodes = maxbidarray[index];
              changedQuantity = qtyofBids - excessData;
              App.changebidqty(maxbidarray[index], excessData, bondID); //change in the blockchain but winning address does not take into account
              let refundaddr = tmpqtyInfo[3];
              App.refund_Bids(refundaddr, excessData,maxbidarray[index],bondID);
              excessData -= qtyofBids;
              console.log(excessData);
              

            } else if (qtyofBids <= excessData) {
              console.log("Third event, eliminating losing bids");
              let refundaddr = tmpqtyInfo[3];
              App.refund_Bids(refundaddr, qtyofBids,maxbidarray[index],bondID);
              excessData -= qtyofBids;
              for (var ref = 0; ref < allbidcodes.length; ref++) {
                if (allbidcodes[ref] == maxbidarray[index]) {
                  allbidcodes.splice(ref, 1);
                }
              }
              console.log(allbidcodes);
            }
          }
        }
        if (excessData <= 0) {
          console.log("Done") //paying issuer money and creating an array of winning bids
          let bondtmpInfo = await this.meta.methods.bondInfo(bondID).call({ from: this.address });
          let TC = parseInt(bondtmpInfo[3]);
          let owneraddress = bondtmpInfo[4];
          // App.send_Funds(bondID,owneraddress, TC);
          console.log(allbidcodes);
          let finalbidcodes_win = allbidcodes;
          let _couponRates = await App.getMaxRetn(finalbidcodes_win);
          for (var index = 0; index < finalbidcodes_win.length; index++) {
            let tmpqtyInfo = await this.meta.methods.Bid_information(finalbidcodes_win[index]).call();
            if (finalbidcodes_win[index] == changedbidcodes){
              let quantity = parseInt(changedQuantity)
              let owner = tmpqtyInfo[3];
              for (var j = 0; j<quantity; j++){
                winningbids.push(owner);
              }
            } else {
            let quantity = parseInt(tmpqtyInfo[2]);
            let owner = tmpqtyInfo[3]
            for (var i = 0; i < quantity; i++) {
              winningbids.push(owner);
              }
            }
          }
          console.log(_couponRates);
          console.log(winningbids);
          App.endAuction(bondID);
          App.mintTokenizedBonds(winningbids, bondID, _couponRates);
          // App.mintOrder(bondID, _couponRates);
        }
      } while (excessData > 0);
    }
  },


  changebidqty: function(code, excess, ID) {
        // let codeData = await this.meta.methods.Bid_information(code).call();
        // let addr = codeData[3];
        // console.log(addr);
        const { changebidqty } = this.meta.methods;
        changebidqty(code, excess, ID).send({ from: this.account })
      },

  send_Funds: async function(ID, addr, amt) {
      const { send_Funds } = this.escrow.methods;
      await send_Funds(ID, addr, amt).send({ from: this.account });
    },
  
  refund_Bids: async function (addr, amt, bidCodes, ID) {
    const { refund_Bids } = this.escrow.methods;
    await refund_Bids (addr, amt, bidCodes, ID).send({ from: this.account });
  },
  
  openModal: function(modalID) {
      $("#" + modalID).modal('show');
    },

  createModal: async function(i) {
      let modalref = "modal" + i;
      let m0 = document.getElementById("mkModal").appendChild(document.createElement("div"));
      $(m0).addClass("modal fade");
      m0.setAttribute("id", modalref);
      let m1 = m0.appendChild(document.createElement("div"));
      $(m1).addClass("modal-dialog");
      let m2 = m1.appendChild(document.createElement("div"));
      $(m2).addClass("modal-content");
      let m3 = m2.appendChild(document.createElement("div"));
      $(m3).addClass("modal-header");
      let m4 = m3.appendChild(document.createElement("h5"));
      $(m4).addClass("modal-title");
      m4.innerHTML = "Bidding for Bond ID: " + i;
      let m5 = m3.appendChild(document.createElement("button"));
      $(m5).addClass("close");
      let m6 = m2.appendChild(document.createElement("div"));
      $(m6).addClass("modal-body");
      let m7_1 = m6.appendChild(document.createElement("div"));
      let m7 = m7_1.appendChild(document.createElement("Label"));
      m7.innerHTML = "Quantity: ";
      let br0 = m7.appendChild(document.createElement("p"));
      let m8 = m7.appendChild(document.createElement("input"));
      m8.setAttribute("id", "quantity" + i)
      m8.setAttribute("placeholder", "Quantity to bid");
      m8.setAttribute("type", "number");
      let br1 = m8.appendChild(document.createElement("p"));
      let m9 = m6.appendChild(document.createElement("label"));
      m9.innerHTML = "Rate of Returns: ";
      let br2 = m9.appendChild(document.createElement("p"));
      let m10 = m9.appendChild(document.createElement("input"));
      m10.setAttribute("id", "retn" + i);
      m10.setAttribute("placeholder", "Enter coupon rate");
      m10.setAttribute("type", "number");
      let m11 = m6.appendChild(document.createElement("p"));
      let m12 = m11.appendChild(document.createElement("h5"));
      let tmpBondinfo = await this.meta.methods.bondInfo(parseInt(i)).call();
      m12.innerHTML = "Bond ID: " + tmpBondinfo[0];
      let m13 = m2.appendChild(document.createElement("div"));
      $(m13).addClass("modal-footer");
      let m14 = m13.appendChild(document.createElement("button"));
      $(m14).addClass("btn btn-primary");
      m14.setAttribute("type", "button");
      m14.innerHTML = "Submit Bid";
      $(m14).click(function () {
        App.transferBids(i) // doesn't have checkEnd function - when user pay, the newbid will fail.
        App.newBid(i);
      });

    },
  createIssueModal: async function (i) {
      let modalref = "tokenModal" + i;
      let tmpBondinfo = await this.meta.methods.bondInfo(i).call();
      let addr = tmpBondinfo[4];
      let amt = tmpBondinfo[3]
      let batchArray = await this.meta.methods.getBatch(i).call();
      let tokenInfo = await this.meta.methods.tokenInformation(batchArray[0]).call();
      let tm0 = document.getElementById("mkModal").appendChild(document.createElement("div"));
      $(tm0).addClass("modal fade");
      tm0.setAttribute("id", modalref);
      let tm1 = tm0.appendChild(document.createElement("div"));
      $(tm1).addClass("modal-dialog");
      let tm2 = tm1.appendChild(document.createElement("div"));
      $(tm2).addClass("modal-content");
      let tm3 = tm2.appendChild(document.createElement("div"));
      $(tm3).addClass("modal-header");
      let tm4 = tm3.appendChild(document.createElement("h5"));
      $(tm4).addClass("modal-title");
      // let tm5 = tm3.appendChild(document.createElement("button"));
      // $(tm5).addClass("close");
      // tm5.innerHTML = "Close";
      let tm6 = tm2.appendChild(document.createElement("div"));
      $(tm6).addClass("modal-body");
      let tm7 = tm6.appendChild(document.createElement("div"));
      let tm8 = tm7.appendChild(document.createElement("h5"));
      tm8.innerHTML = "Bond ID: " + i;
      let tm9 = tm7.appendChild(document.createElement("h5"));
      tm9.innerHTML = "Coupon Rate: " + tokenInfo[3];
      let tm10 = tm2.appendChild(document.createElement("div"));
      $(tm10).addClass("modal-footer");
      let tm11 = tm10.appendChild(document.createElement("button"));
      $(tm11).addClass("btn btn-primary");
      tm11.setAttribute("type", "button");
      tm11.innerHTML = "Accept Issuance";
      $(tm11).click(function (){
        App.send_Funds(i,addr, amt);
        App.mintOrder(i, tokenInfo[3]);
      })
  },
  
  newBid: async function(i) {
      const { newBid } = this.meta.methods;
      let bondID = i;
      let qty = document.getElementById("quantity" + i).value;
      let retn = document.getElementById("retn" + i).value;
      await newBid(bondID, retn, qty).send({ from: this.account});

    },

  transferBids: async function(ID){
      let bidcodes = await this.meta.methods.getbidIDs(ID).call();
      let bidquantity = await App.getTotalqty(bidcodes);
      console.log(bidquantity)
      let bondinformation = await this.meta.methods.bondInfo(ID).call();
      let target = parseInt(bondinformation[3]);
      if (bidquantity < target ){
      let qty = document.getElementById("quantity" + ID).value;
      let qtyinEther = qty * 1010000000000000000;
      const {transferBids} = this.escrow.methods;
      transferBids(ID).send({from: this.account, value: qtyinEther});
      } else { console.log ("It has enough bids.")}
    },

    // pass in the bid code array and get the total quantity
  getTotalqty: async function(arrayRef) {
      let totalqty = 0;
      for (var index = 0; index <= arrayRef.length - 1; index++) {
        let retn = await this.meta.methods.Bid_information(arrayRef[index]).call();
        totalqty += parseInt(retn[2]);
      }
      let total = totalqty;
      return total;
    },

  maxRetnBid: async function (ID) {

      let bidInfoArray = []; //this will be a 2d array with the first array element being bids for bondID = 1
      for (var i = 1; i <= ID; i++) {
        let code = await this.meta.methods.getbidIDs(ID).call();
        bidInfoArray.push(code);
      }
      let ref = bidInfoArray[ID - 1]; //array of bids of bond 1
      console.log(ref.length);
      let retnArray = [];
      for (var j = 0; j <= ref.length - 1; j++) {
        let retn = await this.meta.methods.Bid_information((ref[j])).call();
        retnArray.push(retn[1]);
      }
      let maxRetn = retnArray.reduce(function (a, b) {
        return Math.max(a, b);
      });
      return maxRetn;
    },


  excess: async function (ID) {
      let bidInfoArray = []; //this will be a 2d array with the first array element being bids for bondID = 1
      for (var i = 1; i <= ID; i++) {
        let code = await this.meta.methods.getbidIDs(ID).call();
        bidInfoArray.push(code);
      }
      let ref = bidInfoArray[ID - 1]; //array of bids of bond 1
      console.log(ref.length); //array length for the codes
      let sum = 0;
      for (var j = 0; j <= ref.length - 1; j++) {
        let retn = await this.meta.methods.Bid_information(ref[j]).call();
        sum += parseInt(retn[2]);
        console.log(sum);
      }
      let info = await this.meta.methods.bondInfo(ID).call();
      let target = info[3];
      let excessAmt = sum - target;
      return excessAmt;
    },

  maxcodeArray: async function () {
      let ID = parseInt(document.getElementById("Input1").value);
      let arrayData = [];
      let remainbids = [];
      let bidInfoArray = []; //this will be a 2d array with the first array element being bids for bondID = 1
      for (var i = 1; i <= ID; i++) {
        let code = await this.meta.methods.getbidIDs(ID).call();
        bidInfoArray.push(code);
      }
      let ref = bidInfoArray[ID - 1]; //array of bids of bond of ID
      console.log(ref.length);
      let max = await App.maxRetnBid(ID);
      let maxbids = [];
      for (var j = 0; j <= ref.length - 1; j++) {
        let retn = await this.meta.methods.Bid_information(ref[j]).call();
        let tmpRetn = retn[1];
        if (tmpRetn == max) {
          maxbids.push(bidInfoArray[ID - 1][j]);
        } else { remainbids.push(bidInfoArray[ID - 1][j]); }

      }
      arrayData.push(maxbids);
      arrayData.push(remainbids);
      return arrayData;
    },

  mapBids: async function(ID) {
      let bidInfoArray = []; //this will be a 2d array with the first array element being bids for bondID = 1
      for (var i = 1; i <= ID; i++) {
        let code = await this.meta.methods.getbidIDs(ID).call();
        bidInfoArray.push(code);
      };
      return bidInfoArray;
    },
    //this fn takes in an array of bid codes and return an array of bid codes with the max
  getMaxBid_codes: async function(arrayRef) {
      let arrayData = [];
      //takes in arrayRef and return codes equal to the max return
      let maxbids = [];
      let remainbids = [];
      let max = await App.getMaxRetn(arrayRef);
      let max_int = parseInt(max);
      for (var j = 0; j <= arrayRef.length - 1; j++) {
        let retn = await this.meta.methods.Bid_information(parseInt(arrayRef[j])).call();
        let tmpRetn = retn[1];
        let retn_int = parseInt(tmpRetn)
        if (retn_int == max_int) {
          maxbids.push(arrayRef[j]);
        } else { remainbids.push(arrayRef[j]); }
      }
      arrayData.push(maxbids);
      arrayData.push(remainbids);
      return arrayData;

    },

    //this function takes in an array of bid codes and return the max returns of the bids
  getMaxRetn: async function(arrayofCodes) {
      let Max_retnArray = [];
      for (var j = 0; j <= arrayofCodes.length - 1; j++) {
        let retn = await this.meta.methods.Bid_information(arrayofCodes[j]).call();
        Max_retnArray.push(retn[1]);
      }
      let maxRetn = Max_retnArray.reduce(function (a, b) {
        return Math.max(a, b);
      });
      let maxRetnInt = parseInt(maxRetn);
      return maxRetnInt;
    },

  Unsuccesful_auctions_refund: async function (arrayofCodes) {
    for (var ref = 0; ref < arrayofCodes.length; ref++){
      let code = parseInt(arrayofCodes[ref]);
      let tmpBidInfo = await this.meta.methods.Bid_information(code).call();
      let ID = tmpBidInfo[0];
      let quantityRefund = tmpBidInfo[2];
      let refundAddr = tmpBidInfo[3];
      await this.escrow.methods.refund_Bids(refundAddr, quantityRefund, code, ID).send({ from: this.account });
      App.changeAuctionState(ID, ID);
    }
  },

  changeAuctionState: async function (aucID) {
    const { changeAuctionState } = this.meta.methods;
    await changeAuctionState (aucID, aucID).send( {from: this.account });
  },

  getBidCodes: async function (ID) {
    let codes = await this.meta.methods.getbidIDs(ID).call();
    return codes;
  },

 

  mintTokenizedBonds: async function(refArray, ID, _couponRate){
      const { mintTokenizedBonds } = this.meta.methods;
      let _year = new Date().getFullYear();
      let tmpInfo = await this.meta.methods.bondInfo(ID).call();
      let _name = tmpInfo[1];
      let _ytm = tmpInfo[2];
      await mintTokenizedBonds(refArray, ID, _name, _ytm, _couponRate,_year).send({from:this.account});

    },

  mintOrder: async function (ID, _couponRate) {
    const { mintOrder } = this.meta.methods;
    let _year = new Date().getFullYear();
    let tmpInfo = await this.meta.methods.bondInfo(ID).call();
    let _name = tmpInfo[1];
    let _ytm = tmpInfo[2];
    let _debt = parseInt(tmpInfo[3]);
    await mintOrder(ID, _name, _ytm, _couponRate, _year, _debt).send({from: this.account});
  },
  issueCoupons: async function (ID) {
    // tokenICNarray stores the array of token ICN corresponding to the bond ID
    let tokenOwnerArray = [];
    let tokenICNarray = await this.meta.methods.getBatch(ID).call(); 
    for (var j=0; j<tokenICNarray.length; j++){
      let tokenInfo = await this.meta.methods.tokenInformation(tokenICNarray[j]).call();
      let tokenOwner = tokenInfo[4]
      tokenOwnerArray.push(tokenOwner);
    }
    console.log(tokenOwnerArray);
    const { issueCoupons } = this.escrow.methods;
    let tokenCAmt = await this.meta.methods.getCouponAmt(ID).call();
    let totalamt = await this.meta.methods.getTotalCouponAmount(ID).call();
    console.log(totalamt);
    console.log(tokenCAmt);
    await issueCoupons (ID, tokenOwnerArray).send ({from: this.account, value: totalamt});
  },

  sendPrincipal: async function (ID) {
    let tokenOwnerArray = [];
    let tokenICNarray = await this.meta.methods.getBatch(ID).call();
    for (var index = 0; index < tokenICNarray.length; index++) {
      let tokenInfo = await this.meta.methods.tokenInformation(tokenICNarray[index]).call();
      let tokenOwner = tokenInfo[4];
      tokenOwnerArray.push(tokenOwner);
    }
    let debtAmt = await this.meta.methods.getDebt(ID).call();
    const { sendPrincipal } = this.escrow.methods;
    await sendPrincipal (ID, tokenOwnerArray).send ({ from: this.account, value: debtAmt })
  },

  sendCollateral: async function (ID) {
    const { sendCollateral } = this.escrow.methods;
    await sendCollateral (ID).send ({ from: this.account });
  },

  default_call: async function (ICN, ID) {
    const { default_call } = this.escrow.methods;
    await default_call (ICN, ID).send({ from: this.account });
  },

  retrieveCollateral:async function (ICN, ID) {
    const { retrieveCollateral } = this.escrow.methods;
    await retrieveCollateral (ICN, ID).send({ from: this.account });
  }



  };

  window.App = App;

  window.addEventListener("load", function () {
    if (window.ethereum) {
      // use MetaMask's provider
      App.web3 = new Web3(window.ethereum);
      window.ethereum.enable(); // get permission to access accounts
    } else {
      console.warn(
        "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
      );
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      App.web3 = new Web3(
        new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
      );
    }


    App.start();


  });
