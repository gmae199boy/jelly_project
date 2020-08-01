# jelly_project

젤리 프로젝트!

# 이더리움 기반 기부 플랫폼
- Web Server 템플릿 -> https://github.com/saarc/teamate/web_templete  
- 개발 일지 -> https://nopublisher.dev/archives/category/blockchain/ethereum  
- notion -> https://notion.so/jellyproject

- DB -> Mongodb  
왜 몽고디비인가? -> 수정이 편해서

# 팀원
- gmae199boy -> 백엔드 담당  
- acc-jiu -> 체인코드 담당  
- seu678 -> 프론트 담당
- JJAKGUI -> 프론트 담당

# 서버 실행
``` bash
# 실행 전에 ganache를 동작시켜야 한다.
# ganache 네트워크는 8545 포드이다
cd jelly_project/server
npm install
npm install -g truffle truffle-contract #--unsafe-perm
truffle compile
truffle migrate  # --reset
node server


# (이건 옵션)
npm install -g ganache-cli #--unsafe-perm   -> ganache를 cli환경에서 실행시켜 주는 개꿀템
ganache-cli -d -m jelly

node server

# http://localhost:8080
```


# 특이사항
## hyperledger fabric은 팀프로젝트에서 다루지 않는다 주의
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