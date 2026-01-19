/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';

import { cardanoFields } from './CardanoDescription';
import {
	cardanoApiRequest,
	isValidCardanoAddress,
	getAddressType,
	isMainnetAddress,
	lovelaceToAda,
	adaToLovelace,
	LOVELACE_PER_ADA,
} from '../../transport';
import {
	formatExecutionData,
	selectUtxosLargestFirst,
	selectUtxosRandomImprove,
	calculateMinUtxoAda,
	parseCIP25Metadata,
	parseCIP68Metadata,
} from '../../utils/helpers';

// Runtime licensing notice - logged once per node load
const LICENSING_NOTICE_LOGGED = Symbol.for('cardano.licensing.logged');
if (!(globalThis as Record<symbol, boolean>)[LICENSING_NOTICE_LOGGED]) {
	console.warn(`[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);
	(globalThis as Record<symbol, boolean>)[LICENSING_NOTICE_LOGGED] = true;
}

export class Cardano implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Cardano',
		name: 'cardano',
		icon: 'file:cardano.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Cardano blockchain (BSL 1.1 - velobpa.com/licensing)',
		defaults: {
			name: 'Cardano',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'cardanoNetworkApi',
				required: true,
			},
			{
				name: 'cardanoWalletApi',
				required: false,
			},
		],
		properties: cardanoFields,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[] = {};

				// Account/Address operations
				if (resource === 'account') {
					responseData = await handleAccountOperations.call(this, operation, i);
				}
				// Transaction operations
				else if (resource === 'transaction') {
					responseData = await handleTransactionOperations.call(this, operation, i);
				}
				// UTXO operations
				else if (resource === 'utxo') {
					responseData = await handleUtxoOperations.call(this, operation, i);
				}
				// Native Token operations
				else if (resource === 'nativeToken') {
					responseData = await handleNativeTokenOperations.call(this, operation, i);
				}
				// NFT operations
				else if (resource === 'nft') {
					responseData = await handleNftOperations.call(this, operation, i);
				}
				// Stake Pool operations
				else if (resource === 'stakePool') {
					responseData = await handleStakePoolOperations.call(this, operation, i);
				}
				// Staking operations
				else if (resource === 'staking') {
					responseData = await handleStakingOperations.call(this, operation, i);
				}
				// Epoch operations
				else if (resource === 'epoch') {
					responseData = await handleEpochOperations.call(this, operation, i);
				}
				// Block operations
				else if (resource === 'block') {
					responseData = await handleBlockOperations.call(this, operation, i);
				}
				// Smart Contract operations
				else if (resource === 'smartContract') {
					responseData = await handleSmartContractOperations.call(this, operation, i);
				}
				// Governance operations
				else if (resource === 'governance') {
					responseData = await handleGovernanceOperations.call(this, operation, i);
				}
				// Metadata operations
				else if (resource === 'metadata') {
					responseData = await handleMetadataOperations.call(this, operation, i);
				}
				// Utility operations
				else if (resource === 'utility') {
					responseData = await handleUtilityOperations.call(this, operation, i);
				}

				const executionData = formatExecutionData(responseData);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

// Handler functions
async function handleAccountOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	const address = this.getNodeParameter('address', itemIndex, '') as string;

	switch (operation) {
		case 'getInfo': {
			const response = await cardanoApiRequest.call(this, 'GET', `/addresses/${address}`);
			return response as IDataObject;
		}
		case 'getBalance': {
			const response = (await cardanoApiRequest.call(
				this,
				'GET',
				`/addresses/${address}`,
			)) as IDataObject;
			const amounts = response.amount as Array<{ unit: string; quantity: string }>;
			const lovelace = amounts?.find((a) => a.unit === 'lovelace')?.quantity || '0';
			return {
				address,
				lovelace,
				ada: lovelaceToAda(lovelace),
				tokens: amounts?.filter((a) => a.unit !== 'lovelace') || [],
			};
		}
		case 'getUtxos': {
			const response = await cardanoApiRequest.call(this, 'GET', `/addresses/${address}/utxos`);
			return response as IDataObject[];
		}
		case 'getTransactions': {
			const response = await cardanoApiRequest.call(
				this,
				'GET',
				`/addresses/${address}/transactions`,
			);
			return response as IDataObject[];
		}
		case 'getAssets': {
			const response = (await cardanoApiRequest.call(
				this,
				'GET',
				`/addresses/${address}`,
			)) as IDataObject;
			const amounts = response.amount as Array<{ unit: string; quantity: string }>;
			return (amounts?.filter((a) => a.unit !== 'lovelace') || []) as unknown as IDataObject[];
		}
		case 'validate': {
			const isValid = isValidCardanoAddress(address);
			const addressType = isValid ? getAddressType(address) : 'invalid';
			const isMainnet = isValid ? isMainnetAddress(address) : false;
			return { address, isValid, addressType, isMainnet };
		}
		case 'checkType': {
			return {
				address,
				type: getAddressType(address),
				isMainnet: isMainnetAddress(address),
			};
		}
		case 'getStakeAddress': {
			const response = (await cardanoApiRequest.call(
				this,
				'GET',
				`/addresses/${address}`,
			)) as IDataObject;
			return {
				address,
				stakeAddress: response.stake_address || null,
			};
		}
		default:
			throw new Error(`Operation ${operation} not supported for account resource`);
	}
}

async function handleTransactionOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	const txHash = this.getNodeParameter('txHash', itemIndex, '') as string;

	switch (operation) {
		case 'get': {
			const response = await cardanoApiRequest.call(this, 'GET', `/txs/${txHash}`);
			return response as IDataObject;
		}
		case 'getUtxos': {
			const response = await cardanoApiRequest.call(this, 'GET', `/txs/${txHash}/utxos`);
			return response as IDataObject;
		}
		case 'getMetadata': {
			const response = await cardanoApiRequest.call(this, 'GET', `/txs/${txHash}/metadata`);
			return response as IDataObject[];
		}
		case 'getRedeemers': {
			const response = await cardanoApiRequest.call(this, 'GET', `/txs/${txHash}/redeemers`);
			return response as IDataObject[];
		}
		case 'getStatus': {
			const response = (await cardanoApiRequest.call(
				this,
				'GET',
				`/txs/${txHash}`,
			)) as IDataObject;
			const tip = (await cardanoApiRequest.call(this, 'GET', '/blocks/latest')) as IDataObject;
			const confirmations =
				(tip.height as number) - ((response.block_height as number) || 0) + 1;
			return {
				txHash,
				blockHash: response.block,
				blockHeight: response.block_height,
				slot: response.slot,
				confirmations,
				confirmed: confirmations > 0,
			};
		}
		case 'estimateFee': {
			const params = (await cardanoApiRequest.call(
				this,
				'GET',
				'/epochs/latest/parameters',
			)) as IDataObject;
			const minFeeA = parseInt(params.min_fee_a as string, 10);
			const minFeeB = parseInt(params.min_fee_b as string, 10);
			const estimatedSize = 300;
			const estimatedFee = minFeeA * estimatedSize + minFeeB;
			return {
				estimatedFee: estimatedFee.toString(),
				estimatedFeeAda: lovelaceToAda(estimatedFee),
				minFeeA,
				minFeeB,
				assumedTxSize: estimatedSize,
			};
		}
		default:
			throw new Error(`Operation ${operation} not supported for transaction resource`);
	}
}

async function handleUtxoOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'get': {
			const address = this.getNodeParameter('address', itemIndex) as string;
			const response = await cardanoApiRequest.call(this, 'GET', `/addresses/${address}/utxos`);
			return response as IDataObject[];
		}
		case 'getByRef': {
			const txHash = this.getNodeParameter('utxoTxHash', itemIndex) as string;
			const outputIndex = this.getNodeParameter('outputIndex', itemIndex) as number;
			const response = (await cardanoApiRequest.call(
				this,
				'GET',
				`/txs/${txHash}/utxos`,
			)) as IDataObject;
			const outputs = response.outputs as IDataObject[];
			const utxo = outputs?.[outputIndex];
			if (!utxo) {
				throw new Error(`UTXO not found at index ${outputIndex}`);
			}
			return { ...utxo, txHash, outputIndex };
		}
		case 'checkSpent': {
			const txHash = this.getNodeParameter('utxoTxHash', itemIndex) as string;
			const outputIndex = this.getNodeParameter('outputIndex', itemIndex) as number;
			try {
				const response = (await cardanoApiRequest.call(
					this,
					'GET',
					`/txs/${txHash}/utxos`,
				)) as IDataObject;
				const outputs = response.outputs as IDataObject[];
				const utxo = outputs?.[outputIndex];
				return {
					txHash,
					outputIndex,
					spent: !utxo,
					exists: !!utxo,
				};
			} catch {
				return { txHash, outputIndex, spent: true, exists: false };
			}
		}
		case 'select': {
			const address = this.getNodeParameter('selectionAddress', itemIndex) as string;
			const targetAmount = this.getNodeParameter('targetAmount', itemIndex) as string;
			const algorithm = this.getNodeParameter('selectionAlgorithm', itemIndex) as string;

			const utxosRaw = (await cardanoApiRequest.call(
				this,
				'GET',
				`/addresses/${address}/utxos`,
			)) as IDataObject[];

			const utxos = utxosRaw.map((u) => ({
				txHash: u.tx_hash as string,
				outputIndex: u.output_index as number,
				amount: u.amount as Array<{ unit: string; quantity: string }>,
			}));

			const requiredLovelace = BigInt(targetAmount);
			const selected =
				algorithm === 'randomImprove'
					? selectUtxosRandomImprove(utxos, requiredLovelace)
					: selectUtxosLargestFirst(utxos, requiredLovelace);

			let totalLovelace = BigInt(0);
			for (const utxo of selected) {
				const lovelace = utxo.amount.find((a) => a.unit === 'lovelace')?.quantity || '0';
				totalLovelace += BigInt(lovelace);
			}

			return {
				selected: selected as unknown as IDataObject[],
				count: selected.length,
				totalLovelace: totalLovelace.toString(),
				totalAda: Number(totalLovelace) / LOVELACE_PER_ADA,
				change: (totalLovelace - requiredLovelace).toString(),
			};
		}
		case 'getCollateral': {
			const address = this.getNodeParameter('address', itemIndex) as string;
			const utxos = (await cardanoApiRequest.call(
				this,
				'GET',
				`/addresses/${address}/utxos`,
			)) as IDataObject[];

			const collateralUtxos = utxos.filter((u) => {
				const amounts = u.amount as Array<{ unit: string; quantity: string }>;
				const hasOnlyAda = amounts.length === 1 && amounts[0].unit === 'lovelace';
				const noDatum = !u.data_hash && !u.inline_datum;
				const noScript = !u.reference_script_hash;
				const sufficientAda = parseInt(amounts[0]?.quantity || '0', 10) >= 5000000;
				return hasOnlyAda && noDatum && noScript && sufficientAda;
			});

			return collateralUtxos;
		}
		case 'getDatum': {
			const datumHash = this.getNodeParameter('datumHash', itemIndex) as string;
			const response = await cardanoApiRequest.call(
				this,
				'GET',
				`/scripts/datum/${datumHash}`,
			);
			return response as IDataObject;
		}
		default:
			throw new Error(`Operation ${operation} not supported for utxo resource`);
	}
}

async function handleNativeTokenOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	const policyId = this.getNodeParameter('policyId', itemIndex, '') as string;
	const assetName = this.getNodeParameter('assetName', itemIndex, '') as string;
	const asset = assetName ? `${policyId}${assetName}` : policyId;

	switch (operation) {
		case 'getInfo': {
			const response = await cardanoApiRequest.call(this, 'GET', `/assets/${asset}`);
			return response as IDataObject;
		}
		case 'getHistory': {
			const response = await cardanoApiRequest.call(this, 'GET', `/assets/${asset}/history`);
			return response as IDataObject[];
		}
		case 'getTransactions': {
			const response = await cardanoApiRequest.call(
				this,
				'GET',
				`/assets/${asset}/transactions`,
			);
			return response as IDataObject[];
		}
		case 'getAddresses': {
			const response = await cardanoApiRequest.call(this, 'GET', `/assets/${asset}/addresses`);
			return response as IDataObject[];
		}
		case 'getMetadata': {
			const response = (await cardanoApiRequest.call(
				this,
				'GET',
				`/assets/${asset}`,
			)) as IDataObject;
			return {
				policyId,
				assetName,
				onchainMetadata: response.onchain_metadata || null,
				metadata: response.metadata || null,
			};
		}
		case 'getPolicyAssets': {
			const response = await cardanoApiRequest.call(this, 'GET', `/assets/policy/${policyId}`);
			return response as IDataObject[];
		}
		case 'getSupply': {
			const response = (await cardanoApiRequest.call(
				this,
				'GET',
				`/assets/${asset}`,
			)) as IDataObject;
			return {
				policyId,
				assetName,
				quantity: response.quantity,
				mintCount: response.mint_or_burn_count,
				initialMintTxHash: response.initial_mint_tx_hash,
			};
		}
		default:
			throw new Error(`Operation ${operation} not supported for nativeToken resource`);
	}
}

async function handleNftOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'getMetadata': {
			const policyId = this.getNodeParameter('policyId', itemIndex) as string;
			const assetName = this.getNodeParameter('assetName', itemIndex, '') as string;
			const asset = `${policyId}${assetName}`;
			const response = (await cardanoApiRequest.call(
				this,
				'GET',
				`/assets/${asset}`,
			)) as IDataObject;
			return {
				policyId,
				assetName,
				fingerprint: response.fingerprint,
				onchainMetadata: response.onchain_metadata,
				metadata: response.metadata,
				standard: response.onchain_metadata ? 'CIP-25' : 'unknown',
			};
		}
		case 'getByOwner': {
			const address = this.getNodeParameter('ownerAddress', itemIndex) as string;
			const response = (await cardanoApiRequest.call(
				this,
				'GET',
				`/addresses/${address}`,
			)) as IDataObject;
			const amounts = response.amount as Array<{ unit: string; quantity: string }>;
			const nfts = amounts?.filter((a) => a.unit !== 'lovelace' && a.quantity === '1') || [];
			return nfts as unknown as IDataObject[];
		}
		case 'getCollection': {
			const policyId = this.getNodeParameter('policyId', itemIndex) as string;
			const response = await cardanoApiRequest.call(this, 'GET', `/assets/policy/${policyId}`);
			return response as IDataObject[];
		}
		case 'getImageUrl': {
			const policyId = this.getNodeParameter('policyId', itemIndex) as string;
			const assetName = this.getNodeParameter('assetName', itemIndex, '') as string;
			const asset = `${policyId}${assetName}`;
			const response = (await cardanoApiRequest.call(
				this,
				'GET',
				`/assets/${asset}`,
			)) as IDataObject;
			const metadata = response.onchain_metadata as IDataObject;
			let imageUrl = (metadata?.image as string) || null;
			if (imageUrl?.startsWith('ipfs://')) {
				imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
			}
			return { policyId, assetName, imageUrl, rawImage: metadata?.image };
		}
		case 'verifyStandard': {
			const policyId = this.getNodeParameter('policyId', itemIndex) as string;
			const assetName = this.getNodeParameter('assetName', itemIndex, '') as string;
			const asset = `${policyId}${assetName}`;
			const response = (await cardanoApiRequest.call(
				this,
				'GET',
				`/assets/${asset}`,
			)) as IDataObject;
			const metadata = response.onchain_metadata as IDataObject;
			const isCip25 = !!(metadata?.name && metadata?.image);
			return {
				policyId,
				assetName,
				cip25Compliant: isCip25,
				hasName: !!metadata?.name,
				hasImage: !!metadata?.image,
				hasMediaType: !!metadata?.mediaType,
			};
		}
		default:
			throw new Error(`Operation ${operation} not supported for nft resource`);
	}
}

async function handleStakePoolOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	const poolId = this.getNodeParameter('poolId', itemIndex, '') as string;

	switch (operation) {
		case 'list': {
			const response = await cardanoApiRequest.call(this, 'GET', '/pools');
			return response as IDataObject[];
		}
		case 'getInfo': {
			const response = await cardanoApiRequest.call(this, 'GET', `/pools/${poolId}`);
			return response as IDataObject;
		}
		case 'getMetadata': {
			const response = await cardanoApiRequest.call(this, 'GET', `/pools/${poolId}/metadata`);
			return response as IDataObject;
		}
		case 'getDelegators': {
			const response = await cardanoApiRequest.call(this, 'GET', `/pools/${poolId}/delegators`);
			return response as IDataObject[];
		}
		case 'getHistory': {
			const response = await cardanoApiRequest.call(this, 'GET', `/pools/${poolId}/history`);
			return response as IDataObject[];
		}
		case 'getBlocks': {
			const response = await cardanoApiRequest.call(this, 'GET', `/pools/${poolId}/blocks`);
			return response as IDataObject[];
		}
		case 'getRelays': {
			const response = await cardanoApiRequest.call(this, 'GET', `/pools/${poolId}/relays`);
			return response as IDataObject[];
		}
		case 'getRetiring': {
			const response = await cardanoApiRequest.call(this, 'GET', '/pools/retiring');
			return response as IDataObject[];
		}
		case 'calculateApy': {
			const history = (await cardanoApiRequest.call(
				this,
				'GET',
				`/pools/${poolId}/history`,
			)) as IDataObject[];
			const recent = history.slice(0, 10);
			if (recent.length === 0) {
				return { poolId, apy: 0, message: 'No history available' };
			}
			let totalRewards = BigInt(0);
			let totalStake = BigInt(0);
			for (const epoch of recent) {
				totalRewards += BigInt((epoch.rewards as string) || '0');
				totalStake += BigInt((epoch.active_stake as string) || '0');
			}
			const avgStake = totalStake / BigInt(recent.length);
			const avgRewards = totalRewards / BigInt(recent.length);
			const epochsPerYear = 73;
			const apy =
				avgStake > 0
					? (Number(avgRewards) * epochsPerYear * 100) / Number(avgStake)
					: 0;
			return { poolId, apy: apy.toFixed(2), epochsAnalyzed: recent.length };
		}
		default:
			throw new Error(`Operation ${operation} not supported for stakePool resource`);
	}
}

async function handleStakingOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	const stakeAddress = this.getNodeParameter('stakeAddress', itemIndex) as string;

	switch (operation) {
		case 'getStakeInfo': {
			const response = await cardanoApiRequest.call(this, 'GET', `/accounts/${stakeAddress}`);
			return response as IDataObject;
		}
		case 'getDelegationHistory': {
			const response = await cardanoApiRequest.call(
				this,
				'GET',
				`/accounts/${stakeAddress}/delegations`,
			);
			return response as IDataObject[];
		}
		case 'getRewardsHistory': {
			const response = await cardanoApiRequest.call(
				this,
				'GET',
				`/accounts/${stakeAddress}/rewards`,
			);
			return response as IDataObject[];
		}
		case 'getAvailableRewards': {
			const response = (await cardanoApiRequest.call(
				this,
				'GET',
				`/accounts/${stakeAddress}`,
			)) as IDataObject;
			return {
				stakeAddress,
				withdrawableRewards: response.withdrawable_amount,
				withdrawableAda: lovelaceToAda(response.withdrawable_amount as string),
			};
		}
		case 'calculateRewards': {
			const accountInfo = (await cardanoApiRequest.call(
				this,
				'GET',
				`/accounts/${stakeAddress}`,
			)) as IDataObject;
			const controlledAmount = BigInt((accountInfo.controlled_amount as string) || '0');
			const annualRate = 0.045;
			const estimatedAnnualRewards = Number(controlledAmount) * annualRate;
			return {
				stakeAddress,
				controlledAmount: controlledAmount.toString(),
				controlledAda: Number(controlledAmount) / LOVELACE_PER_ADA,
				estimatedAnnualRewards: Math.floor(estimatedAnnualRewards).toString(),
				estimatedAnnualAda: estimatedAnnualRewards / LOVELACE_PER_ADA,
				assumedApy: '4.5%',
			};
		}
		default:
			throw new Error(`Operation ${operation} not supported for staking resource`);
	}
}

async function handleEpochOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'getCurrent': {
			const response = await cardanoApiRequest.call(this, 'GET', '/epochs/latest');
			return response as IDataObject;
		}
		case 'getInfo': {
			const epochNumber = this.getNodeParameter('epochNumber', itemIndex) as number;
			const response = await cardanoApiRequest.call(this, 'GET', `/epochs/${epochNumber}`);
			return response as IDataObject;
		}
		case 'getParameters': {
			const epochNumber = this.getNodeParameter('epochNumber', itemIndex) as number;
			const response = await cardanoApiRequest.call(
				this,
				'GET',
				`/epochs/${epochNumber}/parameters`,
			);
			return response as IDataObject;
		}
		case 'getLatestParams': {
			const response = await cardanoApiRequest.call(this, 'GET', '/epochs/latest/parameters');
			return response as IDataObject;
		}
		case 'getBlocks': {
			const epochNumber = this.getNodeParameter('epochNumber', itemIndex) as number;
			const response = await cardanoApiRequest.call(this, 'GET', `/epochs/${epochNumber}/blocks`);
			return response as IDataObject[];
		}
		case 'getSupply': {
			const response = await cardanoApiRequest.call(this, 'GET', '/network');
			return response as IDataObject;
		}
		case 'getTip': {
			const response = await cardanoApiRequest.call(this, 'GET', '/blocks/latest');
			return response as IDataObject;
		}
		default:
			throw new Error(`Operation ${operation} not supported for epoch resource`);
	}
}

async function handleBlockOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'get': {
			const blockId = this.getNodeParameter('blockId', itemIndex) as string;
			const response = await cardanoApiRequest.call(this, 'GET', `/blocks/${blockId}`);
			return response as IDataObject;
		}
		case 'getLatest': {
			const response = await cardanoApiRequest.call(this, 'GET', '/blocks/latest');
			return response as IDataObject;
		}
		case 'getTransactions': {
			const blockId = this.getNodeParameter('blockId', itemIndex) as string;
			const response = await cardanoApiRequest.call(this, 'GET', `/blocks/${blockId}/txs`);
			return response as IDataObject[];
		}
		case 'getNext': {
			const blockId = this.getNodeParameter('blockId', itemIndex) as string;
			const response = await cardanoApiRequest.call(this, 'GET', `/blocks/${blockId}/next`);
			return response as IDataObject[];
		}
		case 'getPrevious': {
			const blockId = this.getNodeParameter('blockId', itemIndex) as string;
			const response = await cardanoApiRequest.call(this, 'GET', `/blocks/${blockId}/previous`);
			return response as IDataObject[];
		}
		default:
			throw new Error(`Operation ${operation} not supported for block resource`);
	}
}

async function handleSmartContractOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	const scriptHash = this.getNodeParameter('scriptHash', itemIndex, '') as string;

	switch (operation) {
		case 'getInfo': {
			const response = await cardanoApiRequest.call(this, 'GET', `/scripts/${scriptHash}`);
			return response as IDataObject;
		}
		case 'getCbor': {
			const response = await cardanoApiRequest.call(this, 'GET', `/scripts/${scriptHash}/cbor`);
			return response as IDataObject;
		}
		case 'getJson': {
			const response = await cardanoApiRequest.call(this, 'GET', `/scripts/${scriptHash}/json`);
			return response as IDataObject;
		}
		case 'getRedeemers': {
			const response = await cardanoApiRequest.call(
				this,
				'GET',
				`/scripts/${scriptHash}/redeemers`,
			);
			return response as IDataObject[];
		}
		case 'getDatum': {
			const response = await cardanoApiRequest.call(this, 'GET', `/scripts/${scriptHash}/datum`);
			return response as IDataObject;
		}
		case 'getDatumByHash': {
			const datumHash = this.getNodeParameter('datumHash', itemIndex) as string;
			const response = await cardanoApiRequest.call(
				this,
				'GET',
				`/scripts/datum/${datumHash}`,
			);
			return response as IDataObject;
		}
		case 'getUtxos': {
			const response = await cardanoApiRequest.call(
				this,
				'GET',
				`/scripts/${scriptHash}/utxos`,
			);
			return response as IDataObject[];
		}
		default:
			throw new Error(`Operation ${operation} not supported for smartContract resource`);
	}
}

async function handleGovernanceOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'getDReps': {
			const response = await cardanoApiRequest.call(this, 'GET', '/governance/dreps');
			return response as IDataObject[];
		}
		case 'getDRepInfo': {
			const drepId = this.getNodeParameter('drepId', itemIndex) as string;
			const response = await cardanoApiRequest.call(this, 'GET', `/governance/dreps/${drepId}`);
			return response as IDataObject;
		}
		case 'getDRepDelegators': {
			const drepId = this.getNodeParameter('drepId', itemIndex) as string;
			const response = await cardanoApiRequest.call(
				this,
				'GET',
				`/governance/dreps/${drepId}/delegators`,
			);
			return response as IDataObject[];
		}
		case 'getActions': {
			const response = await cardanoApiRequest.call(this, 'GET', '/governance/proposals');
			return response as IDataObject[];
		}
		case 'getVotes': {
			const actionId = this.getNodeParameter('actionId', itemIndex) as string;
			const response = await cardanoApiRequest.call(
				this,
				'GET',
				`/governance/proposals/${actionId}/votes`,
			);
			return response as IDataObject[];
		}
		case 'getConstitution': {
			const response = await cardanoApiRequest.call(this, 'GET', '/governance/constitution');
			return response as IDataObject;
		}
		case 'getCommittee': {
			const response = await cardanoApiRequest.call(this, 'GET', '/governance/committee');
			return response as IDataObject;
		}
		default:
			throw new Error(`Operation ${operation} not supported for governance resource`);
	}
}

async function handleMetadataOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'getByTxHash': {
			const txHash = this.getNodeParameter('txHash', itemIndex) as string;
			const response = await cardanoApiRequest.call(this, 'GET', `/txs/${txHash}/metadata`);
			return response as IDataObject[];
		}
		case 'getByLabel': {
			const label = this.getNodeParameter('metadataLabel', itemIndex) as number;
			const response = await cardanoApiRequest.call(this, 'GET', `/metadata/txs/labels/${label}`);
			return response as IDataObject[];
		}
		case 'parseCip25': {
			const txHash = this.getNodeParameter('txHash', itemIndex) as string;
			const response = (await cardanoApiRequest.call(
				this,
				'GET',
				`/txs/${txHash}/metadata`,
			)) as IDataObject[];
			const label721 = response.find((m) => m.label === '721');
			if (!label721) {
				return { error: 'No CIP-25 metadata found (label 721)' };
			}
			return parseCIP25Metadata({ '721': label721.json_metadata });
		}
		case 'parseCip68': {
			const txHash = this.getNodeParameter('txHash', itemIndex) as string;
			const response = (await cardanoApiRequest.call(
				this,
				'GET',
				`/txs/${txHash}/metadata`,
			)) as IDataObject[];
			const datumMetadata = response.find((m) => m.label === '100' || m.label === '500');
			if (!datumMetadata) {
				return { error: 'No CIP-68 metadata found' };
			}
			return parseCIP68Metadata(datumMetadata.json_metadata as IDataObject);
		}
		default:
			throw new Error(`Operation ${operation} not supported for metadata resource`);
	}
}

async function handleUtilityOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'lovelaceToAda': {
			const lovelace = this.getNodeParameter('lovelaceAmount', itemIndex) as string;
			const ada = lovelaceToAda(lovelace);
			return { lovelace, ada };
		}
		case 'adaToLovelace': {
			const ada = this.getNodeParameter('adaAmount', itemIndex) as number;
			const lovelace = adaToLovelace(ada);
			return { ada, lovelace };
		}
		case 'calcMinUtxo': {
			const minAda = calculateMinUtxoAda(0, 0, 0, false, 0);
			return {
				minLovelace: minAda,
				minAda: lovelaceToAda(minAda),
				note: 'Base calculation for pure ADA UTXO',
			};
		}
		case 'calcFingerprint': {
			const policyId = this.getNodeParameter('fingerprintPolicyId', itemIndex) as string;
			const assetName = this.getNodeParameter('fingerprintAssetName', itemIndex, '') as string;
			return {
				policyId,
				assetName,
				note: 'CIP-14 fingerprint calculation requires blake2b-160 hashing',
				algorithm: 'blake2b-160(policyId + assetName)',
			};
		}
		default:
			throw new Error(`Operation ${operation} not supported for utility resource`);
	}
}
