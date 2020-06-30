pragma solidity ^0.6.9;
pragma experimental ABIEncoderV2;

/*


    *************************************************************
    All source code created by gmae199boy;
    *************************************************************


 */
contract Jelly {
    /**************************************************************
		Structs
	**************************************************************/

    /*

        개인정보에 관한 내용은 추후 결정.
        현 단계에선 모두 서버와 블록체인에 담는다.

    */
    struct Event {
        uint256 No; // 이벤트 넘버 (primary key)
        string Name; // 이벤트 이름
        string Type; // 이벤트 타입 (기부 : 성금, 물품 등)
        uint256 Amount; // 이벤트의 달성 총액
        uint256 StartDate; // 이벤트의 시작 시간
        uint256 EndDate; // 이벤트의 종료 시간
        string Desc; // 이벤트 설명
        string Status; //이벤트의 상태 (시작 전, 모금 중, 이벤트 종료)
        //EventDetail[] EventDetails;
    }
    /*
    struct EventDetail {
        string Name;
        uint256 Amount;
        uint256 Time;
    }
	*/

    struct Donor {
        uint256 No; // 기부자 식별 넘버 (primary key)
        string Email; // 기부자 이메일
        string Password; // 기부자 아이디의 비밀번호
        string Name; // 기부자 아이디의 닉네임 or 이름
        string PhoneNumber; // 기부자의 전화번호
        string Address; // 기부자의 주소
        uint256[] MyEvents; // 기부자가 기부했던 이벤트의 넘버 배열
    }

    struct Recipient {
        uint256 No; // 수혜자 식별 넘버
        string Email; // 수혜자 이메일
        string Password; // 수혜자 아이디의 비밀번호
        string Name; // 수혜자 아이디의 닉네임 or 이름
        string PhoneNumber; // 수혜자 전화번호
        string Address; // 수혜자 자수
        uint256 MyProducts; // ?
    }

    struct Product {
        uint256 No; // 제품의 식별 번호 (primary key)
        string Name; // 제품의 이름
        uint256 Price; // 제품의 가격
        string ImgAddress; // 제품 이미지가 있는 주소
        string Desc; // 제품 설명
        string Seller; // 파는 사람 이름
    }

    /**************************************************************
        변수 선언
    **************************************************************/

    address owner; // 접근 제어자

    Event[] events; // 모든 이벤트가 담겨있는 배열
    /*
        // 회원 탈퇴를 생각했을 때, 적절하지 않은 처지. 웹 서버에만 놓을지를 고려해야한다
        // 기본적으로 이더리움은 데이터 삭제가 없고 소유권만 이전되기 때문에
        // 회원 탈퇴를 구현할 수 없다.   요 주의
    */
    Donor[] donors; // 모든 기부자가 담겨있는 배열
    mapping(address => uint256) donorByAddress;
    mapping(address => uint256) balanceOf;
    uint256 token;

    /**************************************************************
		Functions
	**************************************************************/

    //constructor
    constructor() public {
        owner = msg.sender;
        token = 10000;
    }

    // onlyOwner : 함수 접근 제어자
    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    /**************************************************************
        Event Function //
    **************************************************************/

    // addEvent : 이벤트 게시글 등록
    /*
        string  _name       : 이벤트 이름
        string  _type       : 이벤트 타입 (기부 : 성금, 물품 등)
        uint256 _amount     : 이벤트 달성 금액
        uint256 _startdate  : 이벤트 시작 시간
        uint256 _enddate    : 이벤트 종료 시간
        string _desc        : 이벤트 설명
        string _status      : 이벤트 상태 (모금 시작 전, 모금 중, 모금 종료 등)

        return bool         : 이벤트 등록 성공 여부
    */
    function addEvent(
        string memory _name,
        string memory _type,
        uint256 _amount,
        uint256 _startdate,
        uint256 _enddate,
        string memory _desc,
        string memory _status
    ) public onlyOwner returns (bool) {
        uint256 len = events.length;
        events.push(
            Event(
                events.length,
                _name,
                _type,
                _amount,
                _startdate,
                _enddate,
                _desc,
                _status
            )
        );
        if (len == events.length) return false;
        return true;
    }

    // getEventList : 이벤트 게시글을 페이지에 맞게 불러온다.
    /*
        uint256 _pages  : 이벤트 목록의 쪽수 ( 한 페이지에 20개 씩)

        return Event[]  : 쪽수에 맞는 이벤트 배열
     */
    function getEventList(uint256 _pages) public view returns (Event[] memory) {
        Event[] memory result = new Event[](20);
        uint256 count = 0;
        for (uint256 i = (_pages - 1) * 20; i < _pages * 20; i++) {
            if (i > events.length) {
                break;
            }
            result[count++] = events[i];
        }
        return result;
    }

    // getEventsLen : 전체 이벤트의 길이를 반환하는 함수
    /*
        return uint256  : 전체 이벤트의 갯수
    */
    function getEventsLen() public view returns (uint256) {
        return events.length;
    }

    // getEvent : 이벤트 목록 등에서 특정 이벤트를 불러왔을 때 이벤트 반환
    /* 
        uint256 _index  : 불러올 이벤트의 인덱스

        return Event    : 특정 이벤트
    */
    function getEvent(uint256 _index) public view returns (Event memory) {
        return events[_index];
    }

    /*
        User Function//
    */

    // createDonor : 기부자(개인?)를 생성하는 함수
    /*
        string _email       : 기부자의 이메일 주소
        string _password    : 기부자 아이디의 비밀번호
        string _name        : 기부자 아이디의 닉네임
        string _phoneNumber : 기부자의 핸드폰 번호
        string _address     : 기부자의 주소

        return bool         : 기부자 등록의 성공 여부
    */
    function createDonor(
        string memory _email,
        string memory _password,
        string memory _name,
        string memory _phoneNumber,
        string memory _address
    ) public returns (bool) {
        uint256[] memory arr = new uint256[](0);
        uint256 len = donors.length;
        donors.push(
            Donor(
                donors.length,
                _email,
                _password,
                _name,
                _phoneNumber,
                _address,
                arr
            )
        );
        if (len == donors.length) return false;
        return true;
    }
}
