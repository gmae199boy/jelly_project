pragma solidity ^0.5.8;
//I'm not sure about the version

contract Jelly {
    string name;
    string symbol;
    uint8 decimals;
    uint totalSupply;
    mapping(address => uint) balances;

    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint _totalSupply) public {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply;
        balances[msg.sender] = _totalSupply;
        emit Transfer(address(0), msg.sender, _totalSupply);
    }

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
}




// pragma solidity ^0.5.16;
// //pragma experimental ABIEncoderV2;

// /*


//     *************************************************************
//     All source code created by gmae199boy;
//     *************************************************************


//  */
// contract Jelly {
//     struct Event {
//         mapping (address => DonateTransaction) DonateProgress;
//     }
//     struct DonateTransaction {
//         //string email;
//         uint256 Amount;
//     }

//     Event[] events;
//     address owner;
//     uint256 token;

//     constructor() public {
//         owner = msg.sender;
//         token = 10000;
//     }

//     function addEvent(uint256 _eventNum) public returns (bool) {
//         if(events.length != _eventNum - 1) return false;
//         events[_eventNum] = Event();
//         return true;
//     }

//     function addDonateTransaction(
//         //string memory _email,
//         uint256 _amount,
//         uint256 _eventNum
//         ) public returns (bool) {
//             // 나중에 웹과 이더에서 이벤트 길이가 다를때 로직 변경
//             if(events.length != _eventNum) return false;
//             events[_eventNum].DonateProgress[msg.sender] =
//                 DonateTransaction(_amount);
//                 return true;
//     }

//     // function getTotalDonateAmount(uint256 _eventNum) public view returns (uint256){
//     //     uint256 i = 0;
//     //     uint256 totalAmount = 0;
//     //     while(events[_eventNum].DonateProgress[i].Amount != 0) {
//     //         totalAmount += events[_eventNum].DonateProgress[i].Amount;
//     //         ++i;
//     //     }
//     //     return totalAmount;
//     // }
// }