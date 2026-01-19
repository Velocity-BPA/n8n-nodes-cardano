/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, INodeExecutionData } from 'n8n-workflow';

// Format execution data for n8n output
export function formatExecutionData(data: IDataObject | IDataObject[]): INodeExecutionData[] {
	const items = Array.isArray(data) ? data : [data];
	return items.map((item) => ({
		json: item,
		pairedItem: { item: 0 },
	}));
}

// UTXO interfaces
export interface IUtxo {
	txHash: string;
	outputIndex: number;
	amount: { unit: string; quantity: string }[];
	dataHash?: string;
	inlineDatum?: IDataObject;
	referenceScriptHash?: string;
}

// Coin selection - Largest First algorithm
export function selectUtxosLargestFirst(
	utxos: IUtxo[],
	requiredLovelace: bigint,
	requiredAssets: { unit: string; quantity: bigint }[] = [],
): IUtxo[] {
	const selected: IUtxo[] = [];
	let totalLovelace = BigInt(0);
	const collectedAssets: Map<string, bigint> = new Map();

	// Sort by lovelace amount descending
	const sortedUtxos = [...utxos].sort((a, b) => {
		const aLovelace = BigInt(a.amount.find((x) => x.unit === 'lovelace')?.quantity || '0');
		const bLovelace = BigInt(b.amount.find((x) => x.unit === 'lovelace')?.quantity || '0');
		return Number(bLovelace - aLovelace);
	});

	for (const utxo of sortedUtxos) {
		selected.push(utxo);

		for (const amt of utxo.amount) {
			if (amt.unit === 'lovelace') {
				totalLovelace += BigInt(amt.quantity);
			} else {
				const current = collectedAssets.get(amt.unit) || BigInt(0);
				collectedAssets.set(amt.unit, current + BigInt(amt.quantity));
			}
		}

		// Check if we have enough
		let satisfied = totalLovelace >= requiredLovelace;
		for (const req of requiredAssets) {
			const collected = collectedAssets.get(req.unit) || BigInt(0);
			if (collected < req.quantity) {
				satisfied = false;
				break;
			}
		}

		if (satisfied) break;
	}

	return selected;
}

// Coin selection - Random Improve algorithm
export function selectUtxosRandomImprove(
	utxos: IUtxo[],
	requiredLovelace: bigint,
	requiredAssets: { unit: string; quantity: bigint }[] = [],
): IUtxo[] {
	// First, get minimum set using largest-first
	const minSet = selectUtxosLargestFirst(utxos, requiredLovelace, requiredAssets);

	// Calculate target (2x required) for improved random selection
	const targetLovelace = requiredLovelace * BigInt(2);

	// Calculate current total
	let currentLovelace = BigInt(0);
	for (const utxo of minSet) {
		const lovelace = utxo.amount.find((x) => x.unit === 'lovelace')?.quantity || '0';
		currentLovelace += BigInt(lovelace);
	}

	// If we're already close to target, return minimum set
	if (currentLovelace >= (targetLovelace * BigInt(80)) / BigInt(100)) {
		return minSet;
	}

	// Try to add more UTXOs to get closer to target
	const remaining = utxos.filter(
		(u) => !minSet.some((s) => s.txHash === u.txHash && s.outputIndex === u.outputIndex),
	);

	// Shuffle remaining
	const shuffled = [...remaining].sort(() => Math.random() - 0.5);

	const improved = [...minSet];
	for (const utxo of shuffled) {
		if (currentLovelace >= targetLovelace) break;

		const lovelace = utxo.amount.find((x) => x.unit === 'lovelace')?.quantity || '0';
		improved.push(utxo);
		currentLovelace += BigInt(lovelace);
	}

	return improved;
}

// Calculate minimum UTXO ADA
export function calculateMinUtxoAda(
	numAssets: number,
	totalAssetNameLength: number,
	numPolicyIds: number,
	hasInlineDatum: boolean = false,
	datumSize: number = 0,
): string {
	const coinsPerUtxoByte = 4310;
	const utxoEntrySizeWithoutVal = 27;

	let size = utxoEntrySizeWithoutVal;

	if (numAssets > 0) {
		size += 6;
		size += numPolicyIds * 28;
		size += totalAssetNameLength;
		size += numAssets * 12;
	}

	if (hasInlineDatum) {
		size += datumSize + 2;
	}

	const minAda = Math.max(1000000, coinsPerUtxoByte * (160 + size));
	return minAda.toString();
}

// Parse CIP-25 metadata
export function parseCIP25Metadata(metadata: IDataObject): IDataObject {
	const cip25Data = metadata['721'] as IDataObject;
	if (!cip25Data) return {};

	const result: IDataObject = {
		standard: 'CIP-25',
		assets: [] as IDataObject[],
	};

	for (const [policyId, policyAssets] of Object.entries(cip25Data)) {
		if (policyId === 'version') {
			result.version = policyAssets;
			continue;
		}

		if (typeof policyAssets === 'object' && policyAssets !== null) {
			for (const [assetName, assetMetadata] of Object.entries(policyAssets as IDataObject)) {
				(result.assets as IDataObject[]).push({
					policyId,
					assetName,
					...(assetMetadata as IDataObject),
				});
			}
		}
	}

	return result;
}

// Parse CIP-68 metadata
export function parseCIP68Metadata(datum: IDataObject): IDataObject {
	const fields = datum.fields as IDataObject[] | undefined;
	const result: IDataObject = {
		standard: 'CIP-68',
		metadata: fields?.[0] || datum.map || datum,
		version: fields?.[1] || 1,
		extra: fields?.[2] || null,
	};

	return result;
}

// Validate transaction metadata
export function validateTransactionMetadata(
	metadata: IDataObject,
): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	for (const [key, value] of Object.entries(metadata)) {
		if (!/^\d+$/.test(key)) {
			errors.push(`Metadata key "${key}" must be an integer`);
		}

		const keyNum = parseInt(key, 10);
		if (keyNum < 0 || keyNum > Number.MAX_SAFE_INTEGER) {
			errors.push(`Metadata key "${key}" out of valid range`);
		}

		const valueErrors = validateMetadataValue(value, `metadata[${key}]`);
		errors.push(...valueErrors);
	}

	return { valid: errors.length === 0, errors };
}

function validateMetadataValue(value: unknown, path: string): string[] {
	const errors: string[] = [];

	if (typeof value === 'string') {
		if (value.length > 64) {
			errors.push(`${path}: String too long (max 64 bytes)`);
		}
	} else if (typeof value === 'number') {
		if (!Number.isInteger(value)) {
			errors.push(`${path}: Numbers must be integers`);
		}
	} else if (Array.isArray(value)) {
		value.forEach((item, index) => {
			errors.push(...validateMetadataValue(item, `${path}[${index}]`));
		});
	} else if (typeof value === 'object' && value !== null) {
		for (const [k, v] of Object.entries(value)) {
			errors.push(...validateMetadataValue(v, `${path}.${k}`));
		}
	}

	return errors;
}

// Governance action types (CIP-1694)
export const GOVERNANCE_ACTION_TYPES = {
	ParameterChange: 0,
	HardForkInitiation: 1,
	TreasuryWithdrawals: 2,
	NoConfidence: 3,
	UpdateCommittee: 4,
	NewConstitution: 5,
	InfoAction: 6,
} as const;

// DRep types
export const DREP_TYPES = {
	KeyHash: 0,
	ScriptHash: 1,
	AlwaysAbstain: 2,
	AlwaysNoConfidence: 3,
} as const;
