#!/usr/bin/env bash
set +e
yarn audit
result=$?
set -e

if [ "$result" != 0 ]; then
  if [ -f yarn-audit-known-issues ]; then
    set +e
    yarn audit --json | grep auditAdvisory > yarn-audit-issues
    set -e

    if diff -q yarn-audit-known-issues yarn-audit-issues > /dev/null 2>&1; then
      echo
      echo Ignorning known vulnerabilities
      exit 0
    fi
  fi

  echo
  echo Security vulnerabilities were found that were not ignored
  echo
  echo Check to see if these vulnerabilities apply to production
  echo and/or if they have fixes available. If they do not have
  echo fixes and they do not apply to production, you may ignore them
  echo
  echo To ignore these vulnerabilities, run:
  echo
  echo "yarn audit --json | grep auditAdvisory > yarn-audit-known-issues"
  echo
  echo and commit the yarn-audit-known-issues file

  exit "$result"
fi