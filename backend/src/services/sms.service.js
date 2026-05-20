const http = require('http');
const https = require('https');
const config = require('../config/env');
const Logger = require('../utils/logger');

const postJson = (url, headers, payload) =>
  new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const req = client.request(
      parsedUrl,
      {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let responseBody = '';

        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            body: responseBody,
          });
        });
      }
    );

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy(new Error('SMS provider request timed out'));
    });
    req.write(body);
    req.end();
  });

class SmsService {
  async send(to, message) {
    if (!to) {
      return {
        status: 'SKIPPED',
        failureReason: 'Customer phone number is missing',
      };
    }

    if (!config.sms.enabled || !config.sms.apiUrl) {
      Logger.info('SMS reminder prepared but SMS provider is not enabled', { to, message });
      return {
        status: 'SKIPPED',
        failureReason: 'SMS provider is not enabled',
      };
    }

    const headers = { 'Content-Type': 'application/json' };
    if (config.sms.apiKey) {
      headers.Authorization = `Bearer ${config.sms.apiKey}`;
    }

    const response = await postJson(config.sms.apiUrl, headers, {
      to,
      message,
      senderId: config.sms.senderId,
    });

    if (!response.ok) {
      throw new Error(`SMS provider responded with ${response.statusCode}: ${response.body}`);
    }

    return {
      status: 'SENT',
      providerResponse: response.body,
    };
  }
}

module.exports = new SmsService();
