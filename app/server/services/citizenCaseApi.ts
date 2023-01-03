import { Request } from 'express';
import fetch, { RequestInit, Response as fetchResponse } from 'node-fetch';
import config from 'config';

const apiUrl: URL = new URL(config.get('api.url'));

function getAuthorization(req: Request): string {
  return `Bearer ${req.session.accessToken}`;
}

export function getCases(req: Request): Promise<fetchResponse> {
  const url: URL = new URL(apiUrl);
  const tya: string = req.session.tya;
  url.pathname = `/api/citizen/${tya ? tya : ''}`;

  const requestInit: RequestInit = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(req),
    },
  };

  return fetch(url.toString(), requestInit);
}

export function getActiveCases(req: Request): Promise<fetchResponse> {
  const url: URL = new URL(apiUrl);
  url.pathname = `/api/citizen/active`;

  const requestInit: RequestInit = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(req),
    },
  };
  return fetch(url.toString(), requestInit);
}

export function getDormantCases(req: Request): Promise<fetchResponse> {
  const url: URL = new URL(apiUrl);
  url.pathname = `/api/citizen/dormant`;

  const requestInit: RequestInit = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(req),
    },
  };
  return fetch(url.toString(), requestInit);
}

export function addUserToCase(req: Request): Promise<fetchResponse> {
  const url: URL = new URL(apiUrl);
  const tya: string = req.session.tya;
  url.pathname = `/api/citizen/${tya}`;
  const email = req.session.idamEmail;
  const postcode = req.body.postcode as string;
  const params = new URLSearchParams({
    email,
    postcode,
  });
  const requestInit: RequestInit = {
    method: 'POST',
    headers: {
      Authorization: getAuthorization(req),
    },
    body: params,
  };
  return fetch(url.toString(), requestInit);
}
