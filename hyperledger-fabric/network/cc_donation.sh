#!/bin/bash
#instruction=$1
#version=$2

set -ev

#chaincode install
docker exec cli peer chaincode install -n donation -v 2 -p github.com/donation
#chaincode instatiate
docker exec cli peer chaincode instantiate -n donation -v 2 -C mychannel -c '{"Args":[]}' -P 'OR ("Org1MSP.member", "Org2MSP.member","Org3MSP.member")'
sleep 5
#chaincode invoke user1
#docker exec cli peer chaincode invoke -n donation -C mychannel -c '{"Args":["addPN","1","kim","19910503","seoul","01022222222","1","1212","asfas"]}'
sleep 5
#chaincode query user1
#docker exec cli peer chaincode query -n donation -C mychannel -c '{"Args":["readPN","kim"]}'

#chaincode invoke add rating
#docker exec cli peer chaincode invoke -n donation -C mychannel -c '{"Args":["addRating","user1","p1","5.0"]}'
#sleep 5

echo '-------------------------------------END-------------------------------------'
