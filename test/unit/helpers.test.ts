/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	formatExecutionData,
	selectUtxosLargestFirst,
	selectUtxosRandomImprove,
	calculateMinUtxoAda,
	parseCIP25Metadata,
	validateTransactionMetadata,
	GOVERNANCE_ACTION_TYPES,
	DREP_TYPES,
} from '../../utils/helpers';

describe('Utility Helpers', () => {
	describe('formatExecutionData', () => {
		it('should format single object to execution data array', () => {
			const input = { key: 'value' };
			const result = formatExecutionData(input);
			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(input);
		});

		it('should format array to execution data array', () => {
			const input = [{ key: 'value1' }, { key: 'value2' }];
			const result = formatExecutionData(input);
			expect(result).toHaveLength(2);
			expect(result[0].json).toEqual(input[0]);
			expect(result[1].json).toEqual(input[1]);
		});
	});

	describe('selectUtxosLargestFirst', () => {
		const utxos = [
			{ txHash: 'tx1', outputIndex: 0, amount: [{ unit: 'lovelace', quantity: '1000000' }] },
			{ txHash: 'tx2', outputIndex: 0, amount: [{ unit: 'lovelace', quantity: '5000000' }] },
			{ txHash: 'tx3', outputIndex: 0, amount: [{ unit: 'lovelace', quantity: '2000000' }] },
		];

		it('should select UTXOs starting with largest', () => {
			const selected = selectUtxosLargestFirst(utxos, BigInt(3000000));
			expect(selected.length).toBeGreaterThan(0);
			expect(selected[0].txHash).toBe('tx2'); // Largest first
		});

		it('should select minimum UTXOs needed', () => {
			const selected = selectUtxosLargestFirst(utxos, BigInt(5000000));
			expect(selected).toHaveLength(1);
		});

		it('should select multiple UTXOs if needed', () => {
			const selected = selectUtxosLargestFirst(utxos, BigInt(6000000));
			expect(selected.length).toBeGreaterThanOrEqual(2);
		});
	});

	describe('selectUtxosRandomImprove', () => {
		const utxos = [
			{ txHash: 'tx1', outputIndex: 0, amount: [{ unit: 'lovelace', quantity: '1000000' }] },
			{ txHash: 'tx2', outputIndex: 0, amount: [{ unit: 'lovelace', quantity: '5000000' }] },
			{ txHash: 'tx3', outputIndex: 0, amount: [{ unit: 'lovelace', quantity: '2000000' }] },
		];

		it('should return at least the minimum required', () => {
			const selected = selectUtxosRandomImprove(utxos, BigInt(3000000));
			let total = BigInt(0);
			for (const utxo of selected) {
				total += BigInt(utxo.amount[0].quantity);
			}
			expect(total >= BigInt(3000000)).toBe(true);
		});
	});

	describe('calculateMinUtxoAda', () => {
		it('should calculate minimum for pure ADA UTXO', () => {
			const minAda = calculateMinUtxoAda(0, 0, 0, false, 0);
			expect(parseInt(minAda)).toBeGreaterThanOrEqual(1000000);
		});

		it('should calculate higher minimum for UTXOs with assets', () => {
			const minAdaWithAssets = calculateMinUtxoAda(2, 20, 1, false, 0);
			const minAdaPure = calculateMinUtxoAda(0, 0, 0, false, 0);
			expect(parseInt(minAdaWithAssets)).toBeGreaterThan(parseInt(minAdaPure));
		});
	});

	describe('parseCIP25Metadata', () => {
		it('should parse CIP-25 NFT metadata', () => {
			const metadata = {
				'721': {
					'abc123': {
						'MyNFT': {
							name: 'My NFT',
							image: 'ipfs://Qm...',
						},
					},
				},
			};
			const result = parseCIP25Metadata(metadata);
			expect(result.standard).toBe('CIP-25');
			expect(result.assets).toBeDefined();
		});

		it('should return empty for non-CIP-25 metadata', () => {
			const metadata = { '123': { data: 'test' } };
			const result = parseCIP25Metadata(metadata);
			expect(result).toEqual({});
		});
	});

	describe('validateTransactionMetadata', () => {
		it('should validate correct metadata', () => {
			const metadata = {
				'721': { policyId: { assetName: { name: 'Test' } } },
			};
			const result = validateTransactionMetadata(metadata);
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should reject invalid metadata keys', () => {
			const metadata = {
				'invalid-key': { data: 'test' },
			};
			const result = validateTransactionMetadata(metadata);
			expect(result.valid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
		});

		it('should reject strings longer than 64 bytes', () => {
			const longString = 'a'.repeat(100);
			const metadata = {
				'1': { data: longString },
			};
			const result = validateTransactionMetadata(metadata);
			expect(result.valid).toBe(false);
		});
	});

	describe('Constants', () => {
		it('should have correct governance action types', () => {
			expect(GOVERNANCE_ACTION_TYPES.ParameterChange).toBe(0);
			expect(GOVERNANCE_ACTION_TYPES.InfoAction).toBe(6);
		});

		it('should have correct DRep types', () => {
			expect(DREP_TYPES.KeyHash).toBe(0);
			expect(DREP_TYPES.AlwaysNoConfidence).toBe(3);
		});
	});
});
