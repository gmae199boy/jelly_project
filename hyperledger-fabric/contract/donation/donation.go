package main

import (
	"encoding/json"
	"fmt"
	// "strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// SmartContract example simple Chaincode implementation
type SmartContract struct {
}

/*
type PNJson struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	Birthday     string `json:"birthday"`
	Address      string `json:"address"`
	PhoneNumber  string `json:"phoneNumber"`
	RegistTime   string `json:"registtime"`
	RegistNumber string `json:"registnumber"`
}
*/

type Donor struct {
	ObjectType string `json:"docType"` //donor
	Email string `json:"email"`//필드태그
}

type DonorPrivateDetails struct {
	ObjectType string `json:"docType"`	//donor
	Name string `json:"name"`
	Email string `json:"email"`//필드태그
	Password string `json:"password"`
	PhoneNumber string `json:"phoneNumber"`
	Address string	`json:"address"`
	MyEvents MyEvent[] `json:"myEvents"`
}

type MyEvent struct {
	EventNo	int `json:"eventNo"`
	Amount int	`jso:"amount"`
}

// Init initializes chaincode
// ===========================
func (s *SmartContract) Init(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}

// Invoke - Our entry point for Invocations
// ========================================
func (s *SmartContract) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	fmt.Println("invoke is running " + function)
	// Handle different functions
	switch function {
	case "addPN":
		return s.addPN(stub, args)
	case "readPN":
		return s.readPN(stub, args)
	case "initMarble":
		//create a new marble
		return s.initMarble(stub, args)
	case "readMarble":
		//read a marble
		return s.readMarble(stub, args)
	case "readMarblePrivateDetails":
		//read a marble private details
		return s.readMarblePrivateDetails(stub, args)
	case "transferMarble":
		//change owner of a specific marble
		return s.transferMarble(stub, args)
	default:
		//error
		fmt.Println("invoke did not find func: " + function)
		return shim.Error("Received unknown function invocation")
	}
}

func (s *SmartContract) addDonor(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) != 0 {
		return shim.Error("Incorrect number of arguments. Private donor data must be passed in transient map.")
	}
	type DonorTransientInput struct {
		Name  string `json:"name"` //the fieldtags are needed to keep case from bouncing around
		Email string `json:"email"`
		Password  string    `json:"password"`
		PhoneNumber string `json:"phoneNumber"`
		Address string    `json:"address"`
	}

	// ==== Input sanitation ====
	fmt.Println("- start init marble")
	transMap, err := stub.GetTransient()
	if err != nil {
		return shim.Error("Error getting transient: " + err.Error())
	}
	if _, ok := transMap["donor"]; !ok {
		return shim.Error("donor must be a key in the transient map")
	}
	if len(transMap["donor"]) == 0 {
		return shim.Error("donor value in the transient map must be a non-empty JSON string")
	}

	var donorInput DonorTransientInput
	err = json.Unmarshal(transMap["donor"], &donorInput)
	if err != nil {
		return shim.Error("Failed to decode JSON of: " + string(transMap["donor"]))
	}

	if len(donorInput.Name) == 0 {
		return shim.Error("name field must be a non-empty string")
	}
	if len(donorInput.Email) == 0 {
		return shim.Error("Email field must be a non-empty string")
	}
	if len(donorInput.Password) == 0 {
		return shim.Error("Password field must be a positive integer")
	}
	if len(donorInput.PhoneNumber) == 0 {
		return shim.Error("PhoneNumber field must be a non-empty string")
	}
	if len(donorInput.Address) == 0 {
		return shim.Error("Address field must be a positive integer")
	}

	// ==== Check if donor already exists ====
	donorAsBytes, err := stub.GetPrivateData("collectionDonors", donorInput.Email)
	if err != nil {
		return shim.Error("Failed to get donor: " + err.Error())
	} else if donorAsBytes != nil {
		fmt.Println("This marble already exists: " + donorInput.Email)
		return shim.Error("This donor already exists: " + donorInput.Email)
	}

	// ==== Create donor object, marshal to JSON, and save to state ====
	donor := &Donor{
		ObjectType: "donor",
		Email:       donorInput.Email,
	}
	donorJSONasBytes, err := json.Marshal(donor)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("new donor email " + donorInput.Email)

	// === Save marble to state ===
	err = stub.PutPrivateData("collectionDonors", donorInput.Email, donorJSONasBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	// ==== Create donor private details object with price, marshal to JSON, and save to state ====
	donorPrivateDetails := &DonorPrivateDetails{
		ObjectType: "donorPrivateDetails",
		Email:       donorInput.Email,
		Name:      donorInput.Name,
		Password: donorInput.Password,
		PhoneNumber: donorInput.PhoneNumber,
		Address: donorInput.Address,
	}
	donorPrivateDetailsBytes, err := json.Marshal(donorPrivateDetails)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = stub.PutPrivateData("collectionDonorPrivateDetails", donorInput.Email, donorPrivateDetailsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	// ==== donor saved and indexed. Return success ====
	fmt.Println("- end add donor")

	return shim.Success(nil)
}

func (s *SmartContract) readPN(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	PNAsBytes, _ := stub.GetState(args[0])

	return shim.Success(PNAsBytes)
}

// ===============================================
// readMarble - read a marble from chaincode state
// ===============================================
func (s *SmartContract) readMarble(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var name, jsonResp string
	var err error

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting name of the marble to query")
	}

	name = args[0]
	valAsbytes, err := stub.GetPrivateData("collectionMarbles", name) //get the marble from chaincode state
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get state for " + name + "\"}"
		return shim.Error(jsonResp)
	} else if valAsbytes == nil {
		jsonResp = "{\"Error\":\"Marble does not exist: " + name + "\"}"
		return shim.Error(jsonResp)
	}

	return shim.Success(valAsbytes)
}

// ===============================================
// readMarblereadMarblePrivateDetails - read a marble private details from chaincode state
// ===============================================
func (s *SmartContract) readMarblePrivateDetails(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var name, jsonResp string
	var err error

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting name of the marble to query")
	}

	name = args[0]
	valAsbytes, err := stub.GetPrivateData("collectionMarblePrivateDetails", name) //get the marble private details from chaincode state
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get private details for " + name + ": " + err.Error() + "\"}"
		return shim.Error(jsonResp)
	} else if valAsbytes == nil {
		jsonResp = "{\"Error\":\"Marble private details does not exist: " + name + "\"}"
		return shim.Error(jsonResp)
	}

	return shim.Success(valAsbytes)
}

// ===========================================================
// transfer a marble by setting a new owner name on the marble
// ===========================================================
func (s *SmartContract) transferMarble(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	fmt.Println("- start transfer marble")

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Private marble data must be passed in transient map.")
	}
	Name := args[0]

	marbleAsBytes, err := stub.GetPrivateData("collectionMarbles", Name)
	if err != nil {
		return shim.Error("Failed to get marble:" + err.Error())
	} else if marbleAsBytes == nil {
		return shim.Error("Marble does not exist: " + Name)
	}

	marbleToTransfer := marble{}
	err = json.Unmarshal(marbleAsBytes, &marbleToTransfer) //unmarshal it aka JSON.parse()
	if err != nil {
		return shim.Error(err.Error())
	}
	Owner := args[1]
	marbleToTransfer.Owner = Owner //change the owner

	marbleJSONasBytes, _ := json.Marshal(marbleToTransfer)
	err = stub.PutPrivateData("collectionMarbles", marbleToTransfer.Name, marbleJSONasBytes) //rewrite the marble
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("- end transferMarble (success)")
	return shim.Success(nil)
}

// ===================================================================================
// Main
// ===================================================================================
func main() {
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}
