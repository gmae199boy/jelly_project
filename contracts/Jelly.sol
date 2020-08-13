//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.9;

contract Jelly {



    /*
    Ownerble
    safeMath
    등 라이브러리는 나중에 추가
     */



    string name;
    string symbol;
    uint8 decimals;
    uint totalSupply;
    mapping(address => uint) balances;
    address owner;
    // 펀딩 된 모든 젤리는 이곳에 모이고
    // 분배 될 때, 여기서 꺼내 수혜자에게 나눠준다.
    address beneficiary;

    // 펀딩 리스트를 저장하기 위해 추가
    // struct FundingList {
    //     uint64 fundId;
    //     uint64 amount;
    //     //펀딩한 시간 추가
    // }

    struct Fund {
        uint donatedAmount;  //모금금액
        uint fundingGoal;   //펀드 목표 금액
        // uint recieveAmount;  //각 Recipient가 받는 금액
        address[] Recipients;  //수혜받는 수혜자 리스트는 이미 정해져 있다고 가정
        // 이걸 맵핑으로 해버리면 address를 알고 있지 않는이상 값을 볼 수가 없다.
        // 그리고 FundingList와 유사해 낭비를 하는 느낌이 든다
        // 어떻게 개선..?
        // DonerList[] doners; // 기부자들 // mapping을 배열로 수정
        mapping (address => uint) doners; // 배열 안되 제길..
    }

    // 기부자 리스트를 저장하기 위해 추가
    struct DonerList {
        address donerAddr;
        uint64 amount;
        //펀딩 시간 추가
    }

    // 수혜자가 구매한 구매물품 정보
    struct PurchaseList{
        uint32 productId;   //상품 id
        uint32 totalPrice;  //구매할 때 지불한 비용
        uint32 quantity;    //구매한 수량
        //구매 일자 추가
    }

    // funds, products 를 public 으로 수정
    Fund[] public funds;
    // Product[] public products;
    // 수혜자 구매목록 추가
    mapping (address => PurchaseList[]) public purchaseList;
    // mapping (address => FundingList[]) public fundingList;

    constructor() public {
        name = "JELLY";
        symbol = "JLY";
        decimals = 2;
        totalSupply = 1000000;
        owner = msg.sender;
        balances[owner] = totalSupply;
    }


    //view
    // 인자를 다른 사람도 볼 수 있게 모든사람의 어드레스를 받게끔 변경
    function balanceOf(address _addr) public view returns (uint){
        return balances[_addr];
    }

    function transfer(address _from, address _to, uint _value) public returns (bool success){
        // require(balances[_from] >= _value, "you got no money bro");
        balances[_from] -= _value;
        balances[_to] += _value;
        // emit Transfer(_from, _to, _value);
        return true;
    }

    // event Transfer(address _from, address _to, uint _value);

    // node server connect complete
    function newFund(uint _fundingGoal, address[] memory _recipients) public returns (bool){
        // Doner[] 배열로 변경해서 마지막 Doner를 new Doer[](0)으로 추가
        funds.push(Fund(0, _fundingGoal, _recipients));
        return true;
    }


    function funding(uint _fundId, uint _sendAmount) public returns (bool) {
        Fund storage f = funds[_fundId];
        require(f.donatedAmount + _sendAmount <= f.fundingGoal, "overflow funding price");
        // transfer를 앞에 쓰는 이유는 추진력을 얻기 위함
        // require가 transfer에 있기 때문에 먼저 하는것이 좋다
        transfer(msg.sender, beneficiary, _sendAmount);
        f.doners[msg.sender] += _sendAmount;
        // f.doners[f.doners.length] = DonerList(msg.sender, _sendAmount);
        f.donatedAmount += _sendAmount;

        // funds[_fundId] = f;

        // 기부자에 펀딩 리스트 추가
        // FundingList memory list = FundingList(_fundId, _sendAmount);
        // fundingList[msg.sender].push(list);

        // 펀딩 금액이 목표금액에 달성하면 수혜자들에게 배분한다.
        // 이렇게 짜면 마지막에 기부한 사람이 가스비를 많이 내게 된다.
        // 나중에 독립적으로 실행하게 변경
        // if(f.donatedAmount == f.fundingGoal) receiveJelly(_fundId);

        // emit Transfer(msg.sender, beneficiary, _sendAmount);
        return true;
    }

    // 펀딩 목표금액에 달성하면 수혜자들에게 돈을 나눠주는 로직을 실행하기 위한 함수 추가
    function receiveJelly(uint _fundId) public {
        Fund memory f = funds[_fundId];
        // require(f.donatedAmount == f.fundingGoal, "fundingGoal should be accomplished");
        require(f.donatedAmount <= balances[beneficiary], "um...we don't have enough jelly to give T.T");
        uint receiveAmount = f.donatedAmount / f.Recipients.length;
        for (uint i = 0; i < f.Recipients.length; i++ ){
            transfer(beneficiary, f.Recipients[i], receiveAmount);
        }
    }

    function buyProduct(uint32 _productId, uint32 _totalPrice, uint32 _quantity) public returns (bool) {
        require(_totalPrice < balanceOf(msg.sender), "");
        transfer(msg.sender, owner, _totalPrice);
        purchaseList[msg.sender].push(PurchaseList(_productId, _totalPrice, _quantity));
        // emit Transfer(msg.sender, owner, c.price*_quantity);
        return true;
    }
}
