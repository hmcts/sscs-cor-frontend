#!/bin/bash
#echo "${SECURITYCONTEXT}" > /zap/security.context
export LC_ALL=C.UTF-8
export LANG=C.UTF-8

zap-x.sh -daemon -host 0.0.0.0 -port 1030 -config api.disablekey=true -config scanner.attackOnStart=true -config view.mode=attack -config connection.dnsTtlSuccessfulQueries=-1 -config api.addrs.addr.name=.* -config api.addrs.addr.regex=true /dev/null 2>&1 &
i=0
while !(curl -s http://0.0.0.0:1030) > /dev/null
  do
    i=$(( (i+1) %4 ))
    sleep .1
  done
  echo "ZAP has successfully started"
  zap-cli --zap-url http://0.0.0.0 -p 1030 status -t 120
  zap-cli --zap-url http://0.0.0.0 -p 1030 open-url "${TEST_URL}"
  zap-cli --zap-url http://0.0.0.0 -p 1030 spider ${TEST_URL}
  zap-cli --zap-url http://0.0.0.0 -p 1030 active-scan --scanners all --recursive "${TEST_URL}"
  zap-cli --zap-url http://0.0.0.0 -p 1030 report -o activescan.html -f html
  echo 'Changing owner from $(id -u):$(id -g) to $(id -u):$(id -u)'
  chown -R $(id -u):$(id -u) activescan.html
  curl --fail http://0.0.0.0:1030/OTHER/core/other/jsonreport/?formMethod=GET --output report.json
  cp *.html functional-output/
  zap-cli --zap-url http://0.0.0.0 -p 1030 alerts -l Medium --exit-code False

