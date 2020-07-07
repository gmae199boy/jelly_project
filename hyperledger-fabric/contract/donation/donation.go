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

type PNJson struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	Birthday     string `json:"birthday"`
	Address      string `json:"address"`
	PhoneNumber  string `json:"phoneNumber"`
	RegistTime   string `json:"registtime"`
	RegistNumber string `json:"registnumber"`
}

// PNInfo PN infomations
type PNInfo struct {
	ID           int    `json:"id"`
	RegistTime   string `json:"registtime"`
	RegistNumber string `json:"registnumber"`
}

// PNP PN person
type PNP struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	Birthday     string `json:"birthday"`
	Address      string `json:"address"`
	PhoneNumber  string `json:"phoneNumber"`
	PNInfomation PNInfo `json:"pninfo"`
}

type marble struct {
	ObjectType string `json:"docType"` //docType is used to distinguish the various types of objects in state database
	Name       string `json:"name"`    //the fieldtags are needed to keep case from bouncing around
	Color      string `json:"color"`
	Size       int    `json:"size"`
	Owner      string `json:"owner"`
}

type marblePrivateDetails struct {
	ObjectType string `json:"docType"` //docType is used to distinguish the various types of objects in state database
	Name       string `json:"name"`    //the fieldtags are needed to keep case from bouncing around
	Price      int    `json:"price"`
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

func (s *SmartContract) addPN(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) == 0 {
		return shim.Error("fail!")
	}
	
	var PNFile PNJson
	json.Unmarshal([]byte(args[0]), &PNFile)
	// iid, _ := strconv.Atoi(PNFile.)
	// iop, _ := strconv.Atoi(args[0])
	// var Info = PNInfo{
	// 	ID: 1, RegistTime: args[6], RegistNumber: args[7],
	// }
	// var PN = PNP{
	// 	ID:           1,
	// 	Name:         args[1],
	// 	Birthday:     args[2],
	// 	Address:      args[3],
	// 	PhoneNumber:  args[4],
	// 	PNInfomation: Info,
	// }
	var Info = PNInfo{
		ID: 1,
		RegistTime: PNFile.RegistTime,
		RegistNumber: PNFile.RegistNumber,
	}
	var PN = &PNP{
		ID: 1,
		Name: PNFile.Name,
		Birthday: PNFile.Birthday,
		Address: PNFile.Address,
		PhoneNumber: PNFile.PhoneNumber,
		PNInfomation: Info,
	}
	// var PN = &PNP{
	// 	ID: 1,
	// 	Name: args.name,
	// 	Birthday: args.birthday,
	// 	Address: args.address,
	// 	PhoneNumber: args.phoneNumber,
	// 	PNInfomation: args.pninfo,
	// }
	PNAsBytes, _ := json.Marshal(PN)
	stub.PutState(PNFile.Name, PNAsBytes)

	return shim.Success(nil)
}

func (s *SmartContract) readPN(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	PNAsBytes, _ := stub.GetState(args[0])

	return shim.Success(PNAsBytes)
}

// ============================================================
// initMarble - create a new marble, store into chaincode state
// ============================================================
func (s *SmartContract) initMarble(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error

	type marbleTransientInput struct {
		Name  string `json:"name"` //the fieldtags are needed to keep case from bouncing around
		Color string `json:"color"`
		Size  int    `json:"size"`
		Owner string `json:"owner"`
		Price int    `json:"price"`
	}
	// ==== Input sanitation ====
	fmt.Println("- start init marble")
	if len(args) != 0 {
		return shim.Error("Incorrect number of arguments. Private marble data must be passed in transient map.")
	}
	transMap, err := stub.GetTransient()
	if err != nil {
		return shim.Error("Error getting transient: " + err.Error())
	}
	if _, ok := transMap["marble"]; !ok {
		return shim.Error("marble must be a key in the transient map")
	}
	if len(transMap["marble"]) == 0 {
		return shim.Error("marble value in the transient map must be a non-empty JSON string")
	}
	var marbleInput marbleTransientInput
	err = json.Unmarshal(transMap["marble"], &marbleInput)
	if err != nil {
		return shim.Error("Failed to decode JSON of: " + string(transMap["marble"]))
	}

	if len(marbleInput.Name) == 0 {
		return shim.Error("name field must be a non-empty string")
	}
	if len(marbleInput.Color) == 0 {
		return shim.Error("color field must be a non-empty string")
	}
	if marbleInput.Size <= 0 {
		return shim.Error("size field must be a positive integer")
	}
	if len(marbleInput.Owner) == 0 {
		return shim.Error("owner field must be a non-empty string")
	}
	if marbleInput.Price <= 0 {
		return shim.Error("price field must be a positive integer")
	}

	// ==== Check if marble already exists ====
	marbleAsBytes, err := stub.GetPrivateData("collectionMarbles", marbleInput.Name)
	if err != nil {
		return shim.Error("Failed to get marble: " + err.Error())
	} else if marbleAsBytes != nil {
		fmt.Println("This marble already exists: " + marbleInput.Name)
		return shim.Error("This marble already exists: " + marbleInput.Name)
	}

	// ==== Create marble object, marshal to JSON, and save to state ====
	marble := &marble{
		ObjectType: "marble",
		Name:       marbleInput.Name,
		Color:      marbleInput.Color,
		Size:       marbleInput.Size,
		Owner:      marbleInput.Owner,
	}
	marbleJSONasBytes, err := json.Marshal(marble)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("new marble name " + marbleInput.Name)

	// === Save marble to state ===
	err = stub.PutPrivateData("collectionMarbles", marbleInput.Name, marbleJSONasBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	// ==== Create marble private details object with price, marshal to JSON, and save to state ====
	marblePrivateDetails := &marblePrivateDetails{
		ObjectType: "marblePrivateDetails",
		Name:       marbleInput.Name,
		Price:      marbleInput.Price,
	}
	marblePrivateDetailsBytes, err := json.Marshal(marblePrivateDetails)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = stub.PutPrivateData("collectionMarblePrivateDetails", marbleInput.Name, marblePrivateDetailsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	// ==== Marble saved and indexed. Return success ====
	fmt.Println("- end init marble")
	return shim.Success(nil)
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
