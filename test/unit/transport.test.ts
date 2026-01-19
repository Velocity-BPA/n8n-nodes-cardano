/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	isValidCardanoAddress,
	getAddressType,
	isMainnetAddress,
	lovelaceToAda,
	adaToLovelace,
	isValidPolicyId,
	isValidTxHash,
	isValidPoolId,
	LOVELACE_PER_ADA,
	NETWORK_CONFIGS,
	getBaseUrl,
} from '../../transport';

describe('Transport Utilities', () => {
	describe('Address Validation', () => {
		describe('isValidCardanoAddress', () => {
			it('should validate mainnet Shelley addresses', () => {
				const validAddress = 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp';
				expect(isValidCardanoAddress(validAddress)).toBe(true);
			});

			it('should validate testnet addresses', () => {
				const testnetAddress = 'addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq95j4qf';
				expect(isValidCardanoAddress(testnetAddress)).toBe(true);
			});

			it('should validate stake addresses', () => {
				const stakeAddress = 'stake1uxpdrerp9wrxunfh6ukyv5267j70fzxgw0fr3z8zeac5vyqhf9jhy';
				expect(isValidCardanoAddress(stakeAddress)).toBe(true);
			});

			it('should reject invalid addresses', () => {
				expect(isValidCardanoAddress('')).toBe(false);
				expect(isValidCardanoAddress('invalid')).toBe(false);
				expect(isValidCardanoAddress('addr1short')).toBe(false);
			});
		});

		describe('getAddressType', () => {
			it('should identify base addresses', () => {
				const baseAddress = 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp';
				expect(getAddressType(baseAddress)).toBe('base');
			});

			it('should identify stake/reward addresses', () => {
				const stakeAddress = 'stake1uxpdrerp9wrxunfh6ukyv5267j70fzxgw0fr3z8zeac5vyqhf9jhy';
				expect(getAddressType(stakeAddress)).toBe('reward');
			});

			it('should return unknown for invalid addresses', () => {
				expect(getAddressType('invalid')).toBe('unknown');
			});
		});

		describe('isMainnetAddress', () => {
			it('should identify mainnet addresses', () => {
				const mainnetAddress = 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp';
				expect(isMainnetAddress(mainnetAddress)).toBe(true);
			});

			it('should identify testnet addresses', () => {
				const testnetAddress = 'addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq95j4qf';
				expect(isMainnetAddress(testnetAddress)).toBe(false);
			});
		});
	});

	describe('Lovelace/ADA Conversion', () => {
		it('should convert lovelace to ADA', () => {
			expect(lovelaceToAda(1000000)).toBe(1);
			expect(lovelaceToAda('2500000')).toBe(2.5);
			expect(lovelaceToAda(0)).toBe(0);
		});

		it('should convert ADA to lovelace', () => {
			expect(adaToLovelace(1)).toBe('1000000');
			expect(adaToLovelace(2.5)).toBe('2500000');
			expect(adaToLovelace(0)).toBe('0');
		});

		it('should have correct LOVELACE_PER_ADA constant', () => {
			expect(LOVELACE_PER_ADA).toBe(1000000);
		});
	});

	describe('Validation Utilities', () => {
		describe('isValidPolicyId', () => {
			it('should validate 56-character hex policy IDs', () => {
				const validPolicyId = 'a'.repeat(56);
				expect(isValidPolicyId(validPolicyId)).toBe(true);
			});

			it('should reject invalid policy IDs', () => {
				expect(isValidPolicyId('')).toBe(false);
				expect(isValidPolicyId('short')).toBe(false);
				expect(isValidPolicyId('g'.repeat(56))).toBe(false); // invalid hex
			});
		});

		describe('isValidTxHash', () => {
			it('should validate 64-character hex tx hashes', () => {
				const validTxHash = 'a'.repeat(64);
				expect(isValidTxHash(validTxHash)).toBe(true);
			});

			it('should reject invalid tx hashes', () => {
				expect(isValidTxHash('')).toBe(false);
				expect(isValidTxHash('short')).toBe(false);
			});
		});

		describe('isValidPoolId', () => {
			it('should validate pool IDs starting with pool1', () => {
				const validPoolId = 'pool1' + 'a'.repeat(51);
				expect(isValidPoolId(validPoolId)).toBe(true);
			});

			it('should reject invalid pool IDs', () => {
				expect(isValidPoolId('')).toBe(false);
				expect(isValidPoolId('pool2short')).toBe(false);
			});
		});
	});

	describe('Network Configuration', () => {
		it('should have mainnet configuration', () => {
			expect(NETWORK_CONFIGS.mainnet).toBeDefined();
			expect(NETWORK_CONFIGS.mainnet.networkId).toBe(1);
			expect(NETWORK_CONFIGS.mainnet.blockfrost).toContain('mainnet');
		});

		it('should have preprod configuration', () => {
			expect(NETWORK_CONFIGS.preprod).toBeDefined();
			expect(NETWORK_CONFIGS.preprod.networkId).toBe(0);
		});

		it('should have preview configuration', () => {
			expect(NETWORK_CONFIGS.preview).toBeDefined();
			expect(NETWORK_CONFIGS.preview.networkId).toBe(0);
		});

		describe('getBaseUrl', () => {
			it('should return blockfrost URL for blockfrost provider', () => {
				const credentials = { network: 'mainnet', apiProvider: 'blockfrost' };
				const url = getBaseUrl(credentials);
				expect(url).toBe(NETWORK_CONFIGS.mainnet.blockfrost);
			});

			it('should return koios URL for koios provider', () => {
				const credentials = { network: 'mainnet', apiProvider: 'koios' };
				const url = getBaseUrl(credentials);
				expect(url).toBe(NETWORK_CONFIGS.mainnet.koios);
			});

			it('should return custom endpoint for custom provider', () => {
				const customUrl = 'https://custom.api.com';
				const credentials = { network: 'mainnet', apiProvider: 'custom', customEndpoint: customUrl };
				const url = getBaseUrl(credentials);
				expect(url).toBe(customUrl);
			});
		});
	});
});
