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