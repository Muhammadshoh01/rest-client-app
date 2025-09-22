import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateCode,
  encodeBase64,
  decodeBase64,
  prettifyJson,
  copyToClipboard,
} from '../../utils/functions';

import type { RequestData } from '@/types/rest-client';

const baseRequest: RequestData = {
  method: 'GET',
  url: 'https://api.example.com',
  headers: [],
  body: '',
};

describe('encode/decode Base64', () => {
  it('encodes and decodes correctly', () => {
    const text = 'Hello World!';
    const encoded = encodeBase64(text);
    expect(decodeBase64(encoded)).toBe(text);
  });

  it('returns empty string on invalid decode', () => {
    expect(decodeBase64('%%%')).toBe('');
  });
});

describe('prettifyJson', () => {
  it('pretty prints valid JSON', () => {
    const ugly = '{"name":"John","age":30}';
    const pretty = prettifyJson(ugly);
    expect(pretty).toContain('"name": "John"');
    expect(pretty).toContain('"age": 30');
  });

  it('returns original string if not JSON', () => {
    expect(prettifyJson('not-json')).toBe('not-json');
  });
});

describe('generateCode', () => {
  it('returns message if no URL', () => {
    const code = generateCode({ ...baseRequest, url: '' }, 'curl');
    expect(code).toContain('Please enter a URL');
  });

  it('generates curl snippet', () => {
    const request: RequestData = {
      ...baseRequest,
      method: 'POST',
      headers: [
        {
          key: 'Content-Type',
          value: 'application/json',
          enabled: true,
          id: 'test',
        },
      ],
      body: '{"foo":"bar"}',
    };
    const code = generateCode(request, 'curl');
    expect(code).toContain('curl -X POST');
    expect(code).toContain('-H "Content-Type: application/json"');
    expect(code).toContain('-d \'{"foo":"bar"}\'');
  });

  it('generates fetch snippet', () => {
    const request: RequestData = {
      ...baseRequest,
      method: 'GET',
      headers: [
        { key: 'Accept', value: 'application/json', enabled: true, id: 'test' },
      ],
    };
    const code = generateCode(request, 'fetch');
    expect(code).toContain("fetch('https://api.example.com'");
    expect(code).toContain("'Accept': 'application/json'");
  });

  it('generates xhr snippet', () => {
    const request: RequestData = {
      ...baseRequest,
      method: 'POST',
      headers: [{ key: 'X-Test', value: '123', enabled: true, id: 'test' }],
      body: '{"foo":"bar"}',
    };
    const code = generateCode(request, 'xhr');
    expect(code).toContain('new XMLHttpRequest()');
    expect(code).toContain("xhr.setRequestHeader('X-Test', '123');");
    expect(code).toContain('xhr.send("{\\"foo\\":\\"bar\\"}");');
  });

  it('generates nodejs snippet', () => {
    const request: RequestData = {
      ...baseRequest,
      method: 'PUT',
      headers: [{ key: 'Auth', value: 'token', enabled: true, id: 'test' }],
      body: '{"foo":"bar"}',
    };
    const code = generateCode(request, 'nodejs');
    expect(code).toContain("require('https')");
    expect(code).toContain('headers:');
    expect(code).toContain('req.write("{\\"foo\\":\\"bar\\"}");');
  });

  it('generates python snippet', () => {
    const request: RequestData = {
      ...baseRequest,
      method: 'PATCH',
      headers: [{ key: 'Auth', value: 'token', enabled: true, id: 'test' }],
      body: '{"foo":"bar"}',
    };
    const code = generateCode(request, 'python');
    expect(code).toContain('import requests');
    expect(code).toContain('headers = {');
    expect(code).toContain('data="{\\"foo\\":\\"bar\\"}"');
  });

  it('generates java snippet', () => {
    const request: RequestData = {
      ...baseRequest,
      method: 'POST',
      headers: [{ key: 'Auth', value: 'token', enabled: true, id: 'test' }],
      body: '{"foo":"bar"}',
    };
    const code = generateCode(request, 'java');
    expect(code).toContain('HttpClient.newHttpClient()');
    expect(code).toContain('request.header("Auth", "token");');
    expect(code).toContain('ofString("{\\"foo\\":\\"bar\\"}")');
  });

  it('generates csharp snippet', () => {
    const request: RequestData = {
      ...baseRequest,
      method: 'POST',
      headers: [{ key: 'Auth', value: 'token', enabled: true, id: 'test' }],
      body: '{"foo":"bar"}',
    };
    const code = generateCode(request, 'csharp');
    expect(code).toContain('HttpClient');
    expect(code).toContain('DefaultRequestHeaders.Add("Auth", "token");');
    expect(code).toContain('PostAsync');
  });

  it('generates go snippet', () => {
    const request: RequestData = {
      ...baseRequest,
      method: 'POST',
      headers: [{ key: 'Auth', value: 'token', enabled: true, id: 'test' }],
      body: '{"foo":"bar"}',
    };
    const code = generateCode(request, 'go');
    expect(code).toContain('package main');
    expect(code).toContain('req.Header.Set("Auth", "token")');
    expect(code).toContain('strings.NewReader');
  });

  it('returns fallback for unknown language', () => {
    const code = generateCode(baseRequest, 'ruby');
    expect(code).toContain('not implemented yet');
  });
});

describe('copyToClipboard', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('calls clipboard.writeText', async () => {
    await copyToClipboard('hello');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello');
  });
});
