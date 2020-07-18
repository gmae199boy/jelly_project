# jelly_project

젤리 프로젝트!

# 이더리움 기반 기부 플랫폼
- Web Server -> https://github.com/saarc/teamate/web_templete
- 개발 일지 -> https://nopublisher.dev/archives/category/blockchain/ethereum

- DB -> Mongodb  
왜 몽고디비인가? -> 수정이 편해서

# 노드 실행
``` bash
cd jelly_project/src/server
npm install
npm install -g truffle truffle-contract --unsafe-perm


(이건 옵션)
npm install -g ganache-cli --unsafe-perm   -> ganache를 cli환경에서 실행시켜 주는 개꿀템

node server

http://localhost:8080
```


# 특이사항
### 노드 실행 쉘 스크립트
``` bash
/jelly_project/hyperledger-fabric/network/start.sh
```
start.sh 쉘 스크립트 안 15줄에 sed -i 명령어가 있는데, 우분투에선 그냥 sed -i로 써도 되지만  
맥에서는 sed -i.bak 으로 써야 동작함.


### 노드 설정 configtx.yaml
configtx.yaml
```bash
    Policies:
        Readers:
            Type: ImplicitMeta
            Rule: "ANY Readers"
        Writers:
            Type: ImplicitMeta
            Rule: "ANY Writers"
        Admins:
            Type: ImplicitMeta
            Rule: "MAJORITY Admins"
```
각 피어마다 폴리시를 정하지 아느면 워닝을 뿜뿜한다.