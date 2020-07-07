package main

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct {
}

type PNInfo struct {
	ID           int    `json:"id"`
	RegistTime   string `json:"registtime"`
	RegistNumber string `json:"registnumbder"`
}

type PNP struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	Birthday     string `json:"birthday"`
	Address      string `json:"address"`
	PhoneNumber  string `json:"phoneNumber"`
	PNInfomation PNInfo `json:"pninfo"`
}

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	function, args := APIstub.GetFunctionAndParameters()

	if function == "addPN" {
		return s.addPN(APIstub, args)
	}
	return shim.Error("Invalid Smart Contract function name.")
}

func (s *SmartContract) addPN(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 8 {
		return shim.Error("fail!")
	}
	iid, _ := strconv.Atoi(args[5])
	iop, _ := strconv.Atoi(args[0])
	var Info = PNInfo{
		ID: iid, RegistTime: args[6], RegistNumber: args[7],
	}
	var PN = PNP{
		ID:           iop,
		Name:         args[1],
		Birthday:     args[2],
		Address:      args[3],
		PhoneNumber:  args[4],
		PNInfomation: Info,
	}
	PNAsBytes, _ := json.Marshal(PN)
	APIstub.PutState(args[0], PNAsBytes)

	return shim.Success(nil)
}

// func (s *SmartContract) addRating(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
// 	if len(args) != 3 {
// 		return shim.Error("Incorrect number of arguments. Expecting 3")
// 	}
// 	// getState User
// 	userAsBytes, err := APIstub.GetState(args[0])
// 	if err != nil{
// 		jsonResp := "\"Error\":\"Failed to get state for "+ args[0]+"\"}"
// 		return shim.Error(jsonResp)
// 	} else if userAsBytes == nil{ // no State! error
// 		jsonResp := "\"Error\":\"User does not exist: "+ args[0]+"\"}"
// 		return shim.Error(jsonResp)
// 	}
// 	// state ok
// 	user := UserRating{}
// 	err = json.Unmarshal(userAsBytes, &user)
// 	if err != nil {
// 		return shim.Error(err.Error())
// 	}
// 	// create rate structure
// 	newRate, _ := strconv.ParseFloat(args[2],64)
// 	var Rate = Rate{ProjectTitle: args[1], Score: newRate}

// 	rateCount := float64(len(user.Rates))

// 	user.Rates=append(user.Rates,Rate)

// 	user.Average = (rateCount*user.Average+newRate)/(rateCount+1)
// 	// update to User World state
// 	userAsBytes, err = json.Marshal(user);

// 	APIstub.PutState(args[0], userAsBytes)

// 	return shim.Success([]byte("rating is updated"))
// }

// func (s *SmartContract) readRating(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

// 	if len(args) != 1 {
// 		return shim.Error("Incorrect number of arguments. Expecting 1")
// 	}

// 	UserAsBytes, _ := APIstub.GetState(args[0])
// 	return shim.Success(UserAsBytes)
// }

func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
