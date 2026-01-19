/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CardanoNetworkApi implements ICredentialType {
	name = 'cardanoNetworkApi';
	displayName = 'Cardano Network API';
	documentationUrl = 'https://docs.blockfrost.io/';
	icon = { light: 'file:cardano.svg', dark: 'file:cardano.svg' } as const;

	properties: INodeProperties[] = [
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			default: 'mainnet',
			options: [
				{ name: 'Mainnet', value: 'mainnet' },
				{ name: 'Preprod (Testnet)', value: 'preprod' },
				{ name: 'Preview (Testnet)', value: 'preview' },
				{ name: 'Custom', value: 'custom' },
			],
			description: 'The Cardano network to connect to',
		},
		{
			displayName: 'API Provider',
			name: 'apiProvider',
			type: 'options',
			default: 'blockfrost',
			options: [
				{ name: 'Blockfrost', value: 'blockfrost' },
				{ name: 'Koios (Free)', value: 'koios' },
				{ name: 'Cardano GraphQL', value: 'graphql' },
				{ name: 'Ogmios (Self-Hosted)', value: 'ogmios' },
				{ name: 'Custom Endpoint', value: 'custom' },
			],
			description: 'The API provider to use for blockchain data',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			displayOptions: {
				show: { apiProvider: ['blockfrost'] },
			},
			description: 'Your Blockfrost API key (project ID)',
		},
		{
			displayName: 'Custom Endpoint URL',
			name: 'customEndpoint',
			type: 'string',
			default: '',
			placeholder: 'https://your-endpoint.com/api',
			displayOptions: {
				show: { apiProvider: ['custom', 'ogmios', 'graphql'] },
			},
			description: 'The custom API endpoint URL',
		},
		{
			displayName: 'Custom Network Magic',
			name: 'networkMagic',
			type: 'number',
			default: 764824073,
			displayOptions: {
				show: { network: ['custom'] },
			},
			description: 'The network magic number for custom networks',
		},
		{
			displayName: 'Connection Timeout',
			name: 'timeout',
			type: 'number',
			default: 30000,
			description: 'Request timeout in milliseconds',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				project_id: '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.apiProvider === "blockfrost" ? ($credentials.network === "mainnet" ? "https://cardano-mainnet.blockfrost.io/api/v0" : $credentials.network === "preprod" ? "https://cardano-preprod.blockfrost.io/api/v0" : $credentials.network === "preview" ? "https://cardano-preview.blockfrost.io/api/v0" : $credentials.customEndpoint) : ($credentials.apiProvider === "koios" ? ($credentials.network === "mainnet" ? "https://api.koios.rest/api/v1" : $credentials.network === "preprod" ? "https://preprod.koios.rest/api/v1" : "https://preview.koios.rest/api/v1") : $credentials.customEndpoint)}}',
			url: '={{$credentials.apiProvider === "blockfrost" ? "/" : "/tip"}}',
		},
	};
}
