pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

/*


    *************************************************************
    All source code created by gmae199boy;
    *************************************************************


 */
contract Jelly {
    struct Event {
        DonateTransaction[] DonateProgress;
    }
    struct DonateTransaction {
        string Name;
        string Amount;
    }

    Event[] events;

    function addDonateTransaction(
        string memory _name,
        string memory _amount,
        uint256 _eventNum) public returns (bool) {
            // 
            if(events.length != _eventNum) return false;
            events.push(
                events[events.length].DonateProgress.push(
                    DonateTransaction(
                        _name,
                        _amount
                    )
                )
            );
    }

    function getTotalDonateAmount(uint256 _eventNum) public view returns (uint256){
        int256 i = 0;
        int256 totalAmount = 0;
        while(events[_eventNum].DonateProgress[i].Amount != 0) {
            totalAmount += events[_eventNum].DonateProgress[i].Amount;
            ++i;
        }
        return totalAmount;
    }
}
