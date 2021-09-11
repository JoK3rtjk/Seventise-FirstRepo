# Idea-Submission
MVP submission for Polygon track for Next Top Blockchain Startup
# Setup

Clone the git repository 

```
git clone https://github.com/JoK3rtjk/Seventise-FirstRepo.git
```

Download dependencies in the root and app folders

```
npm i --save-dev
```

Launch ganache and set it to port 7545

https://www.trufflesuite.com/ganache

Install truffle 

```
npm i -g truffle
```

Building the contract and deploying it on ganache blockchain

```
truffle compile
truffle migrate --reset 
```

Next, go to the directory and open the folder with IDE 
Go into app folders and use the script below in the terminal of the IDE
```
npm run dev
```
The web application is serve in http://localhost:8080/

Or use the web application deployed on Polygon testnet 
https://seventise.netlify.app/

# Issuing bond in a primary market with blockchain

Demo of bond issuance on primary market on polygon with uniform pricing auction.

## Issuer 

### Registering the bond 

Issuer will register the bond to be issued, this allows time for issuer to market their issuance as well as allowing potential investors to know about the company or project. 

### Starting Auction 

Issuer will choose the time to start auction (note: start time must be before now) and end the auction. Once the auction has began, investors who are interested can place their bids. 

### Ending Auction 

Auction will end when duration runs out or total quantity bidded is greater or equal to the target. 

### Getting capital

There will be a collateral held once auction is successfully completed. 30% of the targeted amount will be locked. In order to unlock this collateral, issuer has to fulfill the minimum criteria of coupon payments based on the issued bonds.

### Issuance order 

Issuer will receive a token that shows the issuance order. This provides the detail of the issuance, such as the resultant coupon rate. 

### Coupon payments

Issuer will use the token to issue coupon automatically to the tokenholders. 

### Receive Collateral

Issuer will use the token to receive collateral whenever fulfillment is met. 

### Repay the principal amount

Issuer will use the token to repay the principal to the tokenholders. 

## Investor

### Bidding 

Investors will start bidding with the coupon rates they want for the bonds. 

### Winning mechanism 

The auction ends when the total quantity of bids (each investor can bid more than one bond) is greater or equal to the targeted amount set by issuer. Winners are decided based on the coupon rate they bidded, and the resultant coupon rate of the bond issued is the highest coupon rate amongst the bidders up to the bid that meet the targeted amount. 

### Example 

Suppose there are 10 available units of bonds and three bidders. Bidder A bids 7 units with a coupon rate of 8%;  Bidder B bids 5 units with a coupon rate of 5%. Finally, Bidder C wants 5 units with a coupon rate of 4%.
The winners are Bidder B and C, and the resultant coupon rate is 5%. 

Since there are only 10 available units, the auction will firstly accept Bidder C's bids as they are the highest, followed by Bidder B's bids as they are higher than Bidder A's bids, and this makes up the 10 units available for bidding. 

### Refunding

Investors will deposit the amount they bid to a pot. Upon completion of auction, any unsuccessful bids will first be refunded before tokens are minted for the successful bids and capital is transferred to the issuer. 

### Mint Token 

Each successful bid will receive a token with the details of the issued bonds, such as year issued, issuer's address and coupon rate. 

### Receiving coupon payments

The token will show the number of coupon payments received. Coupon payments are automatically received into the wallet.  

### Defaulting mechanism 

A defaulting function will also be available whenever the conditions are met. This happens when issuer fails to issue coupon payment. Tokenholders can choose to call default and receive the collateral of the issuer. 

### Receiving collateral

Collateral is 30% of the principal value. Once defaulted, tokenholders can receive this collateral back to mitigate their loss. 


