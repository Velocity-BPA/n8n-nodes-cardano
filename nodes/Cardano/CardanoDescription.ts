/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';

export const resourceOptions: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	default: 'account',
	options: [
		{ name: 'Account/Address', value: 'account' },
		{ name: 'Block', value: 'block' },
		{ name: 'Epoch', value: 'epoch' },
		{ name: 'Governance', value: 'governance' },
		{ name: 'Metadata', value: 'metadata' },
		{ name: 'Native Token', value: 'nativeToken' },
		{ name: 'NFT', value: 'nft' },
		{ name: 'Smart Contract', value: 'smartContract' },
		{ name: 'Stake Pool', value: 'stakePool' },
		{ name: 'Staking', value: 'staking' },
		{ name: 'Transaction', value: 'transaction' },
		{ name: 'UTXO', value: 'utxo' },
		{ name: 'Utility', value: 'utility' },
	],
};

// Account operations
export const accountOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['account'] } },
	default: 'getInfo',
	options: [
		{ name: 'Check Type', value: 'checkType', description: 'Determine address type', action: 'Check address type' },
		{ name: 'Get Assets', value: 'getAssets', description: 'Get native tokens at address', action: 'Get address assets' },
		{ name: 'Get Balance', value: 'getBalance', description: 'Get ADA and token balances', action: 'Get address balance' },
		{ name: 'Get Info', value: 'getInfo', description: 'Get address information', action: 'Get address info' },
		{ name: 'Get Stake Address', value: 'getStakeAddress', description: 'Get associated stake address', action: 'Get stake address' },
		{ name: 'Get Transactions', value: 'getTransactions', description: 'Get transaction history', action: 'Get address transactions' },
		{ name: 'Get UTXOs', value: 'getUtxos', description: 'Get all UTXOs at address', action: 'Get address UTXOs' },
		{ name: 'Validate', value: 'validate', description: 'Validate address format', action: 'Validate address' },
	],
};

// Transaction operations
export const transactionOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['transaction'] } },
	default: 'get',
	options: [
		{ name: 'Estimate Fee', value: 'estimateFee', description: 'Estimate transaction fee', action: 'Estimate transaction fee' },
		{ name: 'Get', value: 'get', description: 'Get transaction by hash', action: 'Get transaction' },
		{ name: 'Get Metadata', value: 'getMetadata', description: 'Get transaction metadata', action: 'Get transaction metadata' },
		{ name: 'Get Redeemers', value: 'getRedeemers', description: 'Get Plutus script redeemers', action: 'Get transaction redeemers' },
		{ name: 'Get Status', value: 'getStatus', description: 'Get confirmation status', action: 'Get transaction status' },
		{ name: 'Get UTXOs', value: 'getUtxos', description: 'Get transaction inputs/outputs', action: 'Get transaction UTXOs' },
	],
};

// UTXO operations
export const utxoOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['utxo'] } },
	default: 'get',
	options: [
		{ name: 'Check Spent', value: 'checkSpent', description: 'Check if UTXO is spent', action: 'Check if UTXO is spent' },
		{ name: 'Get', value: 'get', description: 'Get UTXOs for address', action: 'Get UTXOs' },
		{ name: 'Get By Reference', value: 'getByRef', description: 'Get UTXO by tx hash and index', action: 'Get UTXO by reference' },
		{ name: 'Get Collateral', value: 'getCollateral', description: 'Find suitable collateral UTXOs', action: 'Get collateral UTXOs' },
		{ name: 'Get Datum', value: 'getDatum', description: 'Get datum by hash', action: 'Get datum' },
		{ name: 'Select', value: 'select', description: 'Select UTXOs for transaction', action: 'Select UTXOs' },
	],
};

// Native Token operations
export const nativeTokenOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['nativeToken'] } },
	default: 'getInfo',
	options: [
		{ name: 'Get Addresses', value: 'getAddresses', description: 'Get token holder addresses', action: 'Get token addresses' },
		{ name: 'Get History', value: 'getHistory', description: 'Get mint/burn history', action: 'Get token history' },
		{ name: 'Get Info', value: 'getInfo', description: 'Get asset information', action: 'Get token info' },
		{ name: 'Get Metadata', value: 'getMetadata', description: 'Get token metadata', action: 'Get token metadata' },
		{ name: 'Get Policy Assets', value: 'getPolicyAssets', description: 'Get all assets under policy', action: 'Get policy assets' },
		{ name: 'Get Supply', value: 'getSupply', description: 'Get token supply', action: 'Get token supply' },
		{ name: 'Get Transactions', value: 'getTransactions', description: 'Get token transactions', action: 'Get token transactions' },
	],
};

// NFT operations
export const nftOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['nft'] } },
	default: 'getMetadata',
	options: [
		{ name: 'Get By Owner', value: 'getByOwner', description: 'Get NFTs owned by address', action: 'Get NFTs by owner' },
		{ name: 'Get Collection', value: 'getCollection', description: 'Get all NFTs under policy', action: 'Get NFT collection' },
		{ name: 'Get Image URL', value: 'getImageUrl', description: 'Extract NFT image URL', action: 'Get NFT image URL' },
		{ name: 'Get Metadata', value: 'getMetadata', description: 'Get NFT metadata', action: 'Get NFT metadata' },
		{ name: 'Verify Standard', value: 'verifyStandard', description: 'Verify CIP-25/CIP-68 compliance', action: 'Verify NFT standard' },
	],
};

// Stake Pool operations
export const stakePoolOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['stakePool'] } },
	default: 'list',
	options: [
		{ name: 'Calculate APY', value: 'calculateApy', description: 'Calculate estimated APY', action: 'Calculate pool APY' },
		{ name: 'Get Blocks', value: 'getBlocks', description: 'Get blocks minted by pool', action: 'Get pool blocks' },
		{ name: 'Get Delegators', value: 'getDelegators', description: 'Get pool delegators', action: 'Get pool delegators' },
		{ name: 'Get History', value: 'getHistory', description: 'Get pool rewards history', action: 'Get pool history' },
		{ name: 'Get Info', value: 'getInfo', description: 'Get pool information', action: 'Get pool info' },
		{ name: 'Get Metadata', value: 'getMetadata', description: 'Get pool metadata', action: 'Get pool metadata' },
		{ name: 'Get Relays', value: 'getRelays', description: 'Get pool relay information', action: 'Get pool relays' },
		{ name: 'Get Retiring', value: 'getRetiring', description: 'Get pools scheduled for retirement', action: 'Get retiring pools' },
		{ name: 'List', value: 'list', description: 'List all stake pools', action: 'List stake pools' },
	],
};

// Staking operations
export const stakingOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['staking'] } },
	default: 'getStakeInfo',
	options: [
		{ name: 'Calculate Rewards', value: 'calculateRewards', description: 'Calculate expected rewards', action: 'Calculate staking rewards' },
		{ name: 'Get Available Rewards', value: 'getAvailableRewards', description: 'Get withdrawable rewards', action: 'Get available rewards' },
		{ name: 'Get Delegation History', value: 'getDelegationHistory', description: 'Get delegation history', action: 'Get delegation history' },
		{ name: 'Get Rewards History', value: 'getRewardsHistory', description: 'Get rewards by epoch', action: 'Get rewards history' },
		{ name: 'Get Stake Info', value: 'getStakeInfo', description: 'Get stake account info', action: 'Get stake info' },
	],
};

// Epoch operations
export const epochOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['epoch'] } },
	default: 'getCurrent',
	options: [
		{ name: 'Get Blocks', value: 'getBlocks', description: 'Get blocks in epoch', action: 'Get epoch blocks' },
		{ name: 'Get Current', value: 'getCurrent', description: 'Get current epoch info', action: 'Get current epoch' },
		{ name: 'Get Info', value: 'getInfo', description: 'Get epoch by number', action: 'Get epoch info' },
		{ name: 'Get Latest Parameters', value: 'getLatestParams', description: 'Get current protocol parameters', action: 'Get latest parameters' },
		{ name: 'Get Network Supply', value: 'getSupply', description: 'Get ADA supply information', action: 'Get network supply' },
		{ name: 'Get Network Tip', value: 'getTip', description: 'Get latest block', action: 'Get network tip' },
		{ name: 'Get Parameters', value: 'getParameters', description: 'Get epoch protocol parameters', action: 'Get epoch parameters' },
	],
};

// Block operations
export const blockOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['block'] } },
	default: 'getLatest',
	options: [
		{ name: 'Get', value: 'get', description: 'Get block by hash/slot/height', action: 'Get block' },
		{ name: 'Get Latest', value: 'getLatest', description: 'Get latest block', action: 'Get latest block' },
		{ name: 'Get Next', value: 'getNext', description: 'Get next blocks', action: 'Get next blocks' },
		{ name: 'Get Previous', value: 'getPrevious', description: 'Get previous blocks', action: 'Get previous blocks' },
		{ name: 'Get Transactions', value: 'getTransactions', description: 'Get block transactions', action: 'Get block transactions' },
	],
};

// Smart Contract operations
export const smartContractOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['smartContract'] } },
	default: 'getInfo',
	options: [
		{ name: 'Get CBOR', value: 'getCbor', description: 'Get script in CBOR format', action: 'Get script CBOR' },
		{ name: 'Get Datum', value: 'getDatum', description: 'Get datum at script', action: 'Get script datum' },
		{ name: 'Get Datum By Hash', value: 'getDatumByHash', description: 'Get datum by hash', action: 'Get datum by hash' },
		{ name: 'Get Info', value: 'getInfo', description: 'Get script information', action: 'Get script info' },
		{ name: 'Get JSON', value: 'getJson', description: 'Get script in JSON format', action: 'Get script JSON' },
		{ name: 'Get Redeemers', value: 'getRedeemers', description: 'Get script redeemers', action: 'Get script redeemers' },
		{ name: 'Get UTXOs', value: 'getUtxos', description: 'Get UTXOs at script address', action: 'Get script UTXOs' },
	],
};

// Governance operations
export const governanceOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['governance'] } },
	default: 'getDReps',
	options: [
		{ name: 'Get Actions', value: 'getActions', description: 'Get governance proposals', action: 'Get governance actions' },
		{ name: 'Get Committee', value: 'getCommittee', description: 'Get constitutional committee', action: 'Get committee' },
		{ name: 'Get Constitution', value: 'getConstitution', description: 'Get current constitution', action: 'Get constitution' },
		{ name: 'Get DRep Delegators', value: 'getDRepDelegators', description: 'Get DRep delegators', action: 'Get DRep delegators' },
		{ name: 'Get DRep Info', value: 'getDRepInfo', description: 'Get DRep information', action: 'Get DRep info' },
		{ name: 'Get DReps', value: 'getDReps', description: 'List delegated representatives', action: 'Get DReps' },
		{ name: 'Get Votes', value: 'getVotes', description: 'Get votes on action', action: 'Get votes' },
	],
};

// Metadata operations
export const metadataOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['metadata'] } },
	default: 'getByTxHash',
	options: [
		{ name: 'Get By Label', value: 'getByLabel', description: 'Get metadata by label', action: 'Get metadata by label' },
		{ name: 'Get By Tx Hash', value: 'getByTxHash', description: 'Get transaction metadata', action: 'Get metadata by tx hash' },
		{ name: 'Parse CIP-25', value: 'parseCip25', description: 'Parse CIP-25 NFT metadata', action: 'Parse CIP-25 metadata' },
		{ name: 'Parse CIP-68', value: 'parseCip68', description: 'Parse CIP-68 metadata', action: 'Parse CIP-68 metadata' },
	],
};

// Utility operations
export const utilityOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['utility'] } },
	default: 'lovelaceToAda',
	options: [
		{ name: 'ADA to Lovelace', value: 'adaToLovelace', description: 'Convert ADA to lovelace', action: 'Convert ADA to lovelace' },
		{ name: 'Calculate Fingerprint', value: 'calcFingerprint', description: 'Calculate CIP-14 asset fingerprint', action: 'Calculate asset fingerprint' },
		{ name: 'Calculate Min UTXO', value: 'calcMinUtxo', description: 'Calculate minimum UTXO value', action: 'Calculate min UTXO' },
		{ name: 'Lovelace to ADA', value: 'lovelaceToAda', description: 'Convert lovelace to ADA', action: 'Convert lovelace to ADA' },
	],
};

// Common field definitions
export const addressField: INodeProperties = {
	displayName: 'Address',
	name: 'address',
	type: 'string',
	default: '',
	required: true,
	placeholder: 'addr1...',
	description: 'Cardano address (Bech32 format)',
	displayOptions: {
		show: {
			resource: ['account', 'utxo'],
			operation: ['getInfo', 'getBalance', 'getUtxos', 'getTransactions', 'getAssets', 'validate', 'checkType', 'getStakeAddress', 'get', 'getCollateral'],
		},
	},
};

export const txHashField: INodeProperties = {
	displayName: 'Transaction Hash',
	name: 'txHash',
	type: 'string',
	default: '',
	required: true,
	placeholder: '0x...',
	description: 'Transaction hash (64 hex characters)',
	displayOptions: {
		show: {
			resource: ['transaction', 'metadata'],
			operation: ['get', 'getUtxos', 'getMetadata', 'getRedeemers', 'getStatus', 'getByTxHash'],
		},
	},
};

export const policyIdField: INodeProperties = {
	displayName: 'Policy ID',
	name: 'policyId',
	type: 'string',
	default: '',
	required: true,
	placeholder: '56 hex characters...',
	description: 'Minting policy ID (56 hex characters)',
	displayOptions: {
		show: {
			resource: ['nativeToken', 'nft'],
			operation: ['getInfo', 'getHistory', 'getTransactions', 'getAddresses', 'getMetadata', 'getPolicyAssets', 'getSupply', 'getCollection', 'verifyStandard'],
		},
	},
};

export const assetNameField: INodeProperties = {
	displayName: 'Asset Name',
	name: 'assetName',
	type: 'string',
	default: '',
	placeholder: 'Asset name (hex or UTF-8)',
	description: 'Asset name within the policy',
	displayOptions: {
		show: {
			resource: ['nativeToken', 'nft'],
			operation: ['getInfo', 'getHistory', 'getTransactions', 'getAddresses', 'getMetadata', 'getSupply', 'getImageUrl', 'verifyStandard'],
		},
	},
};

export const poolIdField: INodeProperties = {
	displayName: 'Pool ID',
	name: 'poolId',
	type: 'string',
	default: '',
	required: true,
	placeholder: 'pool1...',
	description: 'Stake pool ID (Bech32 format)',
	displayOptions: {
		show: {
			resource: ['stakePool'],
			operation: ['getInfo', 'getMetadata', 'getDelegators', 'getHistory', 'getBlocks', 'getRelays', 'calculateApy'],
		},
	},
};

export const stakeAddressField: INodeProperties = {
	displayName: 'Stake Address',
	name: 'stakeAddress',
	type: 'string',
	default: '',
	required: true,
	placeholder: 'stake1...',
	description: 'Stake/reward address (Bech32 format)',
	displayOptions: {
		show: {
			resource: ['staking'],
			operation: ['getStakeInfo', 'getDelegationHistory', 'getRewardsHistory', 'getAvailableRewards', 'calculateRewards'],
		},
	},
};

export const epochNumberField: INodeProperties = {
	displayName: 'Epoch Number',
	name: 'epochNumber',
	type: 'number',
	default: 0,
	description: 'Epoch number',
	displayOptions: {
		show: {
			resource: ['epoch'],
			operation: ['getInfo', 'getParameters', 'getBlocks'],
		},
	},
};

export const blockIdentifierField: INodeProperties = {
	displayName: 'Block Identifier',
	name: 'blockId',
	type: 'string',
	default: '',
	required: true,
	placeholder: 'Hash, slot, or height',
	description: 'Block hash, slot number, or block height',
	displayOptions: {
		show: {
			resource: ['block'],
			operation: ['get', 'getTransactions', 'getNext', 'getPrevious'],
		},
	},
};

export const scriptHashField: INodeProperties = {
	displayName: 'Script Hash',
	name: 'scriptHash',
	type: 'string',
	default: '',
	required: true,
	placeholder: '56 hex characters...',
	description: 'Script hash (56 hex characters)',
	displayOptions: {
		show: {
			resource: ['smartContract'],
			operation: ['getInfo', 'getCbor', 'getJson', 'getRedeemers', 'getDatum', 'getUtxos'],
		},
	},
};

export const datumHashField: INodeProperties = {
	displayName: 'Datum Hash',
	name: 'datumHash',
	type: 'string',
	default: '',
	required: true,
	placeholder: '64 hex characters...',
	description: 'Datum hash (64 hex characters)',
	displayOptions: {
		show: {
			resource: ['smartContract', 'utxo'],
			operation: ['getDatumByHash', 'getDatum'],
		},
	},
};

export const drepIdField: INodeProperties = {
	displayName: 'DRep ID',
	name: 'drepId',
	type: 'string',
	default: '',
	required: true,
	placeholder: 'drep1...',
	description: 'Delegated Representative ID',
	displayOptions: {
		show: {
			resource: ['governance'],
			operation: ['getDRepInfo', 'getDRepDelegators'],
		},
	},
};

export const governanceActionIdField: INodeProperties = {
	displayName: 'Governance Action ID',
	name: 'actionId',
	type: 'string',
	default: '',
	required: true,
	description: 'Governance action/proposal ID',
	displayOptions: {
		show: {
			resource: ['governance'],
			operation: ['getVotes'],
		},
	},
};

export const metadataLabelField: INodeProperties = {
	displayName: 'Metadata Label',
	name: 'metadataLabel',
	type: 'number',
	default: 721,
	description: 'Metadata label (e.g., 721 for NFTs)',
	displayOptions: {
		show: {
			resource: ['metadata'],
			operation: ['getByLabel'],
		},
	},
};

export const lovelaceAmountField: INodeProperties = {
	displayName: 'Lovelace Amount',
	name: 'lovelaceAmount',
	type: 'string',
	default: '',
	required: true,
	placeholder: '1000000',
	description: 'Amount in lovelace (1 ADA = 1,000,000 lovelace)',
	displayOptions: {
		show: {
			resource: ['utility'],
			operation: ['lovelaceToAda'],
		},
	},
};

export const adaAmountField: INodeProperties = {
	displayName: 'ADA Amount',
	name: 'adaAmount',
	type: 'number',
	default: 1,
	required: true,
	description: 'Amount in ADA',
	displayOptions: {
		show: {
			resource: ['utility'],
			operation: ['adaToLovelace'],
		},
	},
};

export const utxoRefTxHashField: INodeProperties = {
	displayName: 'Transaction Hash',
	name: 'utxoTxHash',
	type: 'string',
	default: '',
	required: true,
	placeholder: '64 hex characters...',
	description: 'UTXO transaction hash',
	displayOptions: {
		show: {
			resource: ['utxo'],
			operation: ['getByRef', 'checkSpent'],
		},
	},
};

export const utxoOutputIndexField: INodeProperties = {
	displayName: 'Output Index',
	name: 'outputIndex',
	type: 'number',
	default: 0,
	required: true,
	description: 'UTXO output index',
	displayOptions: {
		show: {
			resource: ['utxo'],
			operation: ['getByRef', 'checkSpent'],
		},
	},
};

export const coinSelectionAddressField: INodeProperties = {
	displayName: 'Address',
	name: 'selectionAddress',
	type: 'string',
	default: '',
	required: true,
	placeholder: 'addr1...',
	description: 'Address to select UTXOs from',
	displayOptions: {
		show: {
			resource: ['utxo'],
			operation: ['select'],
		},
	},
};

export const coinSelectionTargetField: INodeProperties = {
	displayName: 'Target Amount (Lovelace)',
	name: 'targetAmount',
	type: 'string',
	default: '1000000',
	required: true,
	description: 'Target amount to select in lovelace',
	displayOptions: {
		show: {
			resource: ['utxo'],
			operation: ['select'],
		},
	},
};

export const coinSelectionAlgorithmField: INodeProperties = {
	displayName: 'Selection Algorithm',
	name: 'selectionAlgorithm',
	type: 'options',
	default: 'largestFirst',
	options: [
		{ name: 'Largest First', value: 'largestFirst' },
		{ name: 'Random Improve', value: 'randomImprove' },
	],
	description: 'Coin selection algorithm to use',
	displayOptions: {
		show: {
			resource: ['utxo'],
			operation: ['select'],
		},
	},
};

export const nftOwnerAddressField: INodeProperties = {
	displayName: 'Owner Address',
	name: 'ownerAddress',
	type: 'string',
	default: '',
	required: true,
	placeholder: 'addr1...',
	description: 'NFT owner address',
	displayOptions: {
		show: {
			resource: ['nft'],
			operation: ['getByOwner'],
		},
	},
};

export const fingerprintPolicyIdField: INodeProperties = {
	displayName: 'Policy ID',
	name: 'fingerprintPolicyId',
	type: 'string',
	default: '',
	required: true,
	placeholder: '56 hex characters...',
	description: 'Asset policy ID',
	displayOptions: {
		show: {
			resource: ['utility'],
			operation: ['calcFingerprint'],
		},
	},
};

export const fingerprintAssetNameField: INodeProperties = {
	displayName: 'Asset Name',
	name: 'fingerprintAssetName',
	type: 'string',
	default: '',
	placeholder: 'Asset name (hex)',
	description: 'Asset name in hex format',
	displayOptions: {
		show: {
			resource: ['utility'],
			operation: ['calcFingerprint'],
		},
	},
};

// Additional options
export const additionalOptions: INodeProperties = {
	displayName: 'Additional Options',
	name: 'additionalOptions',
	type: 'collection',
	placeholder: 'Add Option',
	default: {},
	options: [
		{
			displayName: 'Include Assets',
			name: 'includeAssets',
			type: 'boolean',
			default: true,
			description: 'Whether to include native token information',
		},
		{
			displayName: 'Include Metadata',
			name: 'includeMetadata',
			type: 'boolean',
			default: false,
			description: 'Whether to include metadata',
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			default: 100,
			description: 'Maximum number of results to return',
		},
		{
			displayName: 'Page',
			name: 'page',
			type: 'number',
			default: 1,
			description: 'Page number for pagination',
		},
		{
			displayName: 'Order',
			name: 'order',
			type: 'options',
			default: 'desc',
			options: [
				{ name: 'Ascending', value: 'asc' },
				{ name: 'Descending', value: 'desc' },
			],
			description: 'Sort order for results',
		},
	],
};

// Export all fields
export const cardanoFields: INodeProperties[] = [
	resourceOptions,
	accountOperations,
	transactionOperations,
	utxoOperations,
	nativeTokenOperations,
	nftOperations,
	stakePoolOperations,
	stakingOperations,
	epochOperations,
	blockOperations,
	smartContractOperations,
	governanceOperations,
	metadataOperations,
	utilityOperations,
	addressField,
	txHashField,
	policyIdField,
	assetNameField,
	poolIdField,
	stakeAddressField,
	epochNumberField,
	blockIdentifierField,
	scriptHashField,
	datumHashField,
	drepIdField,
	governanceActionIdField,
	metadataLabelField,
	lovelaceAmountField,
	adaAmountField,
	utxoRefTxHashField,
	utxoOutputIndexField,
	coinSelectionAddressField,
	coinSelectionTargetField,
	coinSelectionAlgorithmField,
	nftOwnerAddressField,
	fingerprintPolicyIdField,
	fingerprintAssetNameField,
	additionalOptions,
];
