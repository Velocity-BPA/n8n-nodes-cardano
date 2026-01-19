/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IPollFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IDataObject,
} from 'n8n-workflow';

export interface ICardanoCredentials {
	network: string;
	apiProvider: string;
	apiKey?: string;
	customEndpoint?: string;
	networkMagic?: number;
	timeout?: number;
}

export const NETWORK_CONFIGS: Record<string, { blockfrost: string; koios: string; networkId: number }> = {
	mainnet: {
		blockfrost: 'https://cardano-mainnet.blockfrost.io/api/v0',
		koios: 'https://api.koios.rest/api/v1',
		networkId: 1,
	},
	preprod: {
		blockfrost: 'https://cardano-preprod.blockfrost.io/api/v0',
		koios: 'https://preprod.koios.rest/api/v1',
		networkId: 0,
	},
	preview: {
		blockfrost: 'https://cardano-preview.blockfrost.io/api/v0',
		koios: 'https://preview.koios.rest/api/v1',
		networkId: 0,
	},
};

export function getBaseUrl(credentials: ICardanoCredentials): string {
	const { network, apiProvider, customEndpoint } = credentials;

	if (apiProvider === 'custom' || apiProvider === 'ogmios' || apiProvider === 'graphql') {
		return customEndpoint || '';
	}

	const networkConfig = NETWORK_CONFIGS[network] || NETWORK_CONFIGS.mainnet;

	if (apiProvider === 'blockfrost') {
		return networkConfig.blockfrost;
	}

	if (apiProvider === 'koios') {
		return networkConfig.koios;
	}

	return networkConfig.blockfrost;
}

export async function cardanoApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
	uri?: string,
): Promise<IDataObject | IDataObject[]> {
	const credentials = (await this.getCredentials('cardanoNetworkApi')) as ICardanoCredentials;
	const baseUrl = uri || getBaseUrl(credentials);

	const options: IHttpRequestOptions = {
		method,
		url: uri ? uri : `${baseUrl}${endpoint}`,
		json: true,
		timeout: credentials.timeout || 30000,
	};

	if (credentials.apiProvider === 'blockfrost' && credentials.apiKey) {
		options.headers = {
			project_id: credentials.apiKey,
		};
	}

	if (Object.keys(body).length > 0) {
		options.body = body;
	}

	if (Object.keys(query).length > 0) {
		options.qs = query;
	}

	try {
		const response = await this.helpers.httpRequest(options);
		return response as IDataObject | IDataObject[];
	} catch (error: unknown) {
		const err = error as { response?: { body?: { message?: string; error?: string } } };
		if (err.response?.body) {
			const message =
				err.response.body.message || err.response.body.error || JSON.stringify(err.response.body);
			throw new Error(`Cardano API error: ${message}`);
		}
		throw error;
	}
}

export async function cardanoApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
	propertyName?: string,
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let page = 1;
	const count = 100;
	let responseData: IDataObject[];

	do {
		const queryWithPagination = { ...query, page, count };
		const response = await cardanoApiRequest.call(this, method, endpoint, body, queryWithPagination);

		if (propertyName) {
			responseData = (response as IDataObject)[propertyName] as IDataObject[];
		} else {
			responseData = Array.isArray(response) ? response : [response];
		}

		returnData.push(...responseData);
		page++;
	} while (responseData.length === count);

	return returnData;
}

// Address validation utilities
export function isValidCardanoAddress(address: string): boolean {
	if (!address) return false;

	// Bech32 addresses (Shelley era)
	if (address.startsWith('addr1') || address.startsWith('addr_test1')) {
		return address.length >= 58 && address.length <= 108;
	}

	// Stake addresses
	if (address.startsWith('stake1') || address.startsWith('stake_test1')) {
		return address.length >= 54 && address.length <= 64;
	}

	// Byron-era addresses (base58)
	if (address.startsWith('Ae2') || address.startsWith('DdzFF')) {
		return address.length >= 50 && address.length <= 120;
	}

	return false;
}

export function getAddressType(address: string): string {
	if (address.startsWith('addr1') || address.startsWith('addr_test1')) {
		const thirdChar = address.charAt(address.indexOf('1') + 1);
		switch (thirdChar) {
			case 'q':
				return 'base';
			case 'v':
				return 'enterprise';
			case 'r':
				return 'pointer';
			case 'z':
				return 'reward';
			default:
				return 'shelley';
		}
	}
	if (address.startsWith('stake1') || address.startsWith('stake_test1')) {
		return 'reward';
	}
	if (address.startsWith('Ae2') || address.startsWith('DdzFF')) {
		return 'byron';
	}
	return 'unknown';
}

export function isMainnetAddress(address: string): boolean {
	return address.startsWith('addr1') || address.startsWith('stake1') || address.startsWith('Ae2');
}

// Lovelace/ADA conversion utilities
export const LOVELACE_PER_ADA = 1000000;

export function lovelaceToAda(lovelace: string | number): number {
	const lovelaceNum = typeof lovelace === 'string' ? parseInt(lovelace, 10) : lovelace;
	return lovelaceNum / LOVELACE_PER_ADA;
}

export function adaToLovelace(ada: number): string {
	return Math.floor(ada * LOVELACE_PER_ADA).toString();
}

// Validation utilities
export function isValidPolicyId(policyId: string): boolean {
	return /^[a-fA-F0-9]{56}$/.test(policyId);
}

export function isValidTxHash(txHash: string): boolean {
	return /^[a-fA-F0-9]{64}$/.test(txHash);
}

export function isValidPoolId(poolId: string): boolean {
	return poolId.startsWith('pool1') && poolId.length === 56;
}
