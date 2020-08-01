pragma solidity ^0.5.8;

contract Jelly {
    string name;
    string symbol;
    uint8 decimals;
    uint totalSupply;
    mapping(address => uint) balances;
    address owner;
    address beneficiary;

    struct Doner{
        address addr;
        uint amount;
    }

    struct Fund {
        uint donatedAmount;  //모금금액
        uint fundingGoal;
        uint numDoners;
        uint recieveAmount;  //각 Recipient가 받는 금액
        address[] Recipients;
        mapping (uint => Doner) doners;
    }

    struct Product{
        uint price;
        uint quantity;
    }

    uint numFunds;
    mapping (uint => Fund) funds;
    uint numProducts;
    mapping (uint => Product) products;

    constructor() public {
        name = "JELLY";
        symbol = "JLY";
        decimals = 2;
        totalSupply = 1000000;
        owner = msg.sender;
        balances[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }


    //view
    function balanceOf(address _owner) public view returns (uint balance){
        return balances[_owner];
    }

    function transfer(address _from, address _to, uint _value) public returns (bool success){
        require(balances[_from] >= _value, "you got no money bro");
        require(balances[_to] + _value > balances[_to], "we got some problem...");  //...Is is necessary??
        balances[_from] -= _value;
        balances[_to] += _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    event Transfer(address _from, address _to, uint _value);

    function newFund(uint _fundingGoal, uint _recieveAmount, address[] memory _recipients) public returns (uint fundId){
        fundId = numFunds++;
        funds[fundId] = Fund(0, _fundingGoal, 0, _recieveAmount, _recipients);
    }
    function donate(uint _fundId, uint _sendAmount) public returns (bool success) {
        Fund storage c = funds[_fundId];
        require(c.doantedAmount < c.fundingGoal, "fundingGoal completed");
        c.doners[c.numDoners++] = Doner({addr: msg.sender, amount: _sendAmount});
        c.doantedAmount += _sendAmount;
        transfer(msg.sender, beneficiary, _sendAmount);
        emit Transfer(msg.sender, beneficiary, _sendAmount);
        return true;
    }
    function recieve(uint _fundId) public returns (bool success) {
        Fund storage c = funds[_fundId];
        require(c.doantedAmount == c.fundingGoal, "fundingGoal should be accomplished");
        require(c.doantedAmount <= balances[beneficiary], "um...we don't have enough jelly to give T.T");
        for (uint i = 0; i < c.Recipients.length; i++ ){
            balances[c.Recipients[i]] += c.recieveAmount;
        }
        balances[beneficiary] -= c.doantedAmount;
        return true;
    }
    function newProduct(uint _price, uint _quantity) public returns (uint productId){
        productId = numProducts++;
        products[productId] = Product(_price, _quantity);
    }
    function buyProduct(uint _productId, uint _quantity) public returns (bool success){
        Product storage c = products[_productId];
        require(c.quantity > 0, "soldout");
        c.quantity -= _quantity;
        transfer(msg.sender, owner, c.price * _quantity);
        emit Transfer(msg.sender, owner, c.price*_quantity);
        return true;
    }
}