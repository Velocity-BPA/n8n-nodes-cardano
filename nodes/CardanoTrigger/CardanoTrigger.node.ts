/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IPollFunctions,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	INodeExecutionData,
} from 'n8n-workflow';

import { cardanoApiRequest, lovelaceToAda, LOVELACE_PER_ADA } from '../../transport';

export class CardanoTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Cardano Trigger',
		name: 'cardanoTrigger',
		icon: 'file:cardano.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["triggerType"]}}',
		description: 'Trigger on Cardano blockchain events (BSL 1.1 - velobpa.com/licensing)',
		defaults: {
			name: 'Cardano Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'cardanoNetworkApi',
				required: true,
			},
		],
		polling: true,
		properties: [
			{
				displayName: 'Trigger Type',
				name: 'triggerType',
				type: 'options',
				default: 'newBlock',
				options: [
					{ name: 'Address Transaction', value: 'addressTransaction' },
					{ name: 'Balance Change', value: 'balanceChange' },
					{ name: 'Delegation Changed', value: 'delegationChanged' },
					{ name: 'Large Transaction', value: 'largeTransaction' },
					{ name: 'New Block', value: 'newBlock' },
					{ name: 'NFT Transfer', value: 'nftTransfer' },
					{ name: 'Pool Retirement', value: 'poolRetirement' },
					{ name: 'Rewards Available', value: 'rewardsAvailable' },
					{ name: 'Script Execution', value: 'scriptExecution' },
					{ name: 'Token Minted', value: 'tokenMinted' },
					{ name: 'Token Transfer', value: 'tokenTransfer' },
				],
				description: 'The type of event to trigger on',
			},
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'addr1...',
				displayOptions: {
					show: {
						triggerType: ['addressTransaction', 'balanceChange', 'nftTransfer'],
					},
				},
				description: 'Cardano address to monitor',
			},
			{
				displayName: 'Stake Address',
				name: 'stakeAddress',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'stake1...',
				displayOptions: {
					show: {
						triggerType: ['delegationChanged', 'rewardsAvailable'],
					},
				},
				description: 'Stake address to monitor',
			},
			{
				displayName: 'Policy ID',
				name: 'policyId',
				type: 'string',
				default: '',
				required: true,
				placeholder: '56 hex characters...',
				displayOptions: {
					show: {
						triggerType: ['tokenTransfer', 'tokenMinted', 'nftTransfer'],
					},
				},
				description: 'Token policy ID to monitor',
			},
			{
				displayName: 'Asset Name',
				name: 'assetName',
				type: 'string',
				default: '',
				placeholder: 'Asset name (hex)',
				displayOptions: {
					show: {
						triggerType: ['tokenTransfer'],
					},
				},
				description: 'Specific asset name to monitor (optional)',
			},
			{
				displayName: 'Script Hash',
				name: 'scriptHash',
				type: 'string',
				default: '',
				required: true,
				placeholder: '56 hex characters...',
				displayOptions: {
					show: {
						triggerType: ['scriptExecution'],
					},
				},
				description: 'Script hash to monitor',
			},
			{
				displayName: 'Threshold (ADA)',
				name: 'threshold',
				type: 'number',
				default: 1000,
				displayOptions: {
					show: {
						triggerType: ['largeTransaction', 'balanceChange'],
					},
				},
				description: 'Minimum ADA amount to trigger',
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const triggerType = this.getNodeParameter('triggerType') as string;
		const workflowStaticData = this.getWorkflowStaticData('node');

		let responseData: IDataObject[] = [];

		try {
			switch (triggerType) {
				case 'newBlock':
					responseData = await handleNewBlock.call(this, workflowStaticData);
					break;
				case 'addressTransaction':
					responseData = await handleAddressTransaction.call(this, workflowStaticData);
					break;
				case 'balanceChange':
					responseData = await handleBalanceChange.call(this, workflowStaticData);
					break;
				case 'largeTransaction':
					responseData = await handleLargeTransaction.call(this, workflowStaticData);
					break;
				case 'tokenTransfer':
					responseData = await handleTokenTransfer.call(this, workflowStaticData);
					break;
				case 'tokenMinted':
					responseData = await handleTokenMinted.call(this, workflowStaticData);
					break;
				case 'nftTransfer':
					responseData = await handleNftTransfer.call(this, workflowStaticData);
					break;
				case 'delegationChanged':
					responseData = await handleDelegationChanged.call(this, workflowStaticData);
					break;
				case 'rewardsAvailable':
					responseData = await handleRewardsAvailable.call(this, workflowStaticData);
					break;
				case 'scriptExecution':
					responseData = await handleScriptExecution.call(this, workflowStaticData);
					break;
				case 'poolRetirement':
					responseData = await handlePoolRetirement.call(this, workflowStaticData);
					break;
			}
		} catch (error) {
			throw error;
		}

		if (responseData.length === 0) {
			return null;
		}

		return [responseData.map((item) => ({ json: item }))];
	}
}

// Handler functions
async function handleNewBlock(
	this: IPollFunctions,
	staticData: IDataObject,
): Promise<IDataObject[]> {
	const latestBlock = (await cardanoApiRequest.call(
		this,
		'GET',
		'/blocks/latest',
	)) as IDataObject;
	const currentHeight = latestBlock.height as number;
	const lastHeight = (staticData.lastBlockHeight as number) || 0;

	if (currentHeight > lastHeight) {
		staticData.lastBlockHeight = currentHeight;
		return [
			{
				...latestBlock,
				triggerType: 'newBlock',
				isNew: lastHeight > 0,
			},
		];
	}

	return [];
}

async function handleAddressTransaction(
	this: IPollFunctions,
	staticData: IDataObject,
): Promise<IDataObject[]> {
	const address = this.getNodeParameter('address') as string;
	const transactions = (await cardanoApiRequest.call(
		this,
		'GET',
		`/addresses/${address}/transactions`,
		{},
		{ count: 10, order: 'desc' },
	)) as IDataObject[];

	const lastTxHash = staticData.lastTxHash as string;
	const newTransactions: IDataObject[] = [];

	for (const tx of transactions) {
		if (tx.tx_hash === lastTxHash) break;
		newTransactions.push({
			...tx,
			address,
			triggerType: 'addressTransaction',
		});
	}

	if (transactions.length > 0) {
		staticData.lastTxHash = transactions[0].tx_hash;
	}

	return lastTxHash ? newTransactions : [];
}

async function handleBalanceChange(
	this: IPollFunctions,
	staticData: IDataObject,
): Promise<IDataObject[]> {
	const address = this.getNodeParameter('address') as string;
	const threshold = this.getNodeParameter('threshold', 0) as number;
	const thresholdLovelace = threshold * LOVELACE_PER_ADA;

	const addressInfo = (await cardanoApiRequest.call(
		this,
		'GET',
		`/addresses/${address}`,
	)) as IDataObject;
	const amounts = addressInfo.amount as Array<{ unit: string; quantity: string }>;
	const currentBalance = BigInt(
		amounts?.find((a) => a.unit === 'lovelace')?.quantity || '0',
	);
	const previousBalance = BigInt((staticData.previousBalance as string) || '0');

	staticData.previousBalance = currentBalance.toString();

	if (previousBalance > 0) {
		const change = currentBalance - previousBalance;
		const absChange = change < 0 ? -change : change;

		if (absChange >= BigInt(thresholdLovelace)) {
			return [
				{
					address,
					previousBalance: previousBalance.toString(),
					currentBalance: currentBalance.toString(),
					change: change.toString(),
					changeAda: Number(change) / LOVELACE_PER_ADA,
					triggerType: 'balanceChange',
				},
			];
		}
	}

	return [];
}

async function handleLargeTransaction(
	this: IPollFunctions,
	staticData: IDataObject,
): Promise<IDataObject[]> {
	const threshold = this.getNodeParameter('threshold', 1000) as number;
	const thresholdLovelace = BigInt(threshold * LOVELACE_PER_ADA);

	const latestBlock = (await cardanoApiRequest.call(
		this,
		'GET',
		'/blocks/latest',
	)) as IDataObject;
	const blockHash = latestBlock.hash as string;
	const lastBlockHash = staticData.lastBlockHash as string;

	if (blockHash === lastBlockHash) {
		return [];
	}

	staticData.lastBlockHash = blockHash;

	const txHashesRaw = (await cardanoApiRequest.call(
		this,
		'GET',
		`/blocks/${blockHash}/txs`,
	)) as IDataObject[] | string[];

	// Handle both array of strings and array of objects
	const txHashes: string[] = txHashesRaw.map((item) =>
		typeof item === 'string' ? item : (item as IDataObject).tx_hash as string
	);

	const largeTxs: IDataObject[] = [];

	for (const txHash of txHashes.slice(0, 20)) {
		try {
			const txUtxos = (await cardanoApiRequest.call(
				this,
				'GET',
				`/txs/${txHash}/utxos`,
			)) as IDataObject;
			const outputs = txUtxos.outputs as IDataObject[];

			let totalOutput = BigInt(0);
			for (const output of outputs || []) {
				const amounts = output.amount as Array<{ unit: string; quantity: string }>;
				const lovelace = amounts?.find((a) => a.unit === 'lovelace')?.quantity || '0';
				totalOutput += BigInt(lovelace);
			}

			if (totalOutput >= thresholdLovelace) {
				largeTxs.push({
					txHash,
					totalOutput: totalOutput.toString(),
					totalOutputAda: Number(totalOutput) / LOVELACE_PER_ADA,
					blockHash,
					triggerType: 'largeTransaction',
				});
			}
		} catch {
			// Skip failed tx lookups
		}
	}

	return largeTxs;
}

async function handleTokenTransfer(
	this: IPollFunctions,
	staticData: IDataObject,
): Promise<IDataObject[]> {
	const policyId = this.getNodeParameter('policyId') as string;
	const assetName = this.getNodeParameter('assetName', '') as string;
	const asset = assetName ? `${policyId}${assetName}` : policyId;

	const transactions = (await cardanoApiRequest.call(
		this,
		'GET',
		`/assets/${asset}/transactions`,
		{},
		{ count: 10, order: 'desc' },
	)) as IDataObject[];

	const lastTxHash = staticData.lastTokenTxHash as string;
	const newTransfers: IDataObject[] = [];

	for (const tx of transactions) {
		if (tx.tx_hash === lastTxHash) break;
		newTransfers.push({
			...tx,
			policyId,
			assetName,
			triggerType: 'tokenTransfer',
		});
	}

	if (transactions.length > 0) {
		staticData.lastTokenTxHash = transactions[0].tx_hash;
	}

	return lastTxHash ? newTransfers : [];
}

async function handleTokenMinted(
	this: IPollFunctions,
	staticData: IDataObject,
): Promise<IDataObject[]> {
	const policyId = this.getNodeParameter('policyId') as string;

	const history = (await cardanoApiRequest.call(
		this,
		'GET',
		`/assets/policy/${policyId}`,
		{},
		{ count: 20, order: 'desc' },
	)) as IDataObject[];

	const lastAssetCount = (staticData.lastAssetCount as number) || 0;
	const currentCount = history.length;

	if (currentCount > lastAssetCount && lastAssetCount > 0) {
		staticData.lastAssetCount = currentCount;
		const newAssets = history.slice(0, currentCount - lastAssetCount);
		return newAssets.map((asset) => ({
			...asset,
			policyId,
			triggerType: 'tokenMinted',
		}));
	}

	staticData.lastAssetCount = currentCount;
	return [];
}

async function handleNftTransfer(
	this: IPollFunctions,
	staticData: IDataObject,
): Promise<IDataObject[]> {
	const address = this.getNodeParameter('address') as string;
	const policyId = this.getNodeParameter('policyId') as string;

	const addressInfo = (await cardanoApiRequest.call(
		this,
		'GET',
		`/addresses/${address}`,
	)) as IDataObject;
	const amounts = addressInfo.amount as Array<{ unit: string; quantity: string }>;

	const nfts =
		amounts?.filter(
			(a) => a.unit.startsWith(policyId) && a.quantity === '1',
		) || [];

	const previousNfts = (staticData.previousNfts as string[]) || [];
	const currentNftUnits = nfts.map((n) => n.unit);

	const newNfts = currentNftUnits.filter((unit) => !previousNfts.includes(unit));
	const removedNfts = previousNfts.filter((unit) => !currentNftUnits.includes(unit));

	staticData.previousNfts = currentNftUnits;

	const changes: IDataObject[] = [];

	for (const unit of newNfts) {
		changes.push({
			address,
			policyId,
			unit,
			action: 'received',
			triggerType: 'nftTransfer',
		});
	}

	for (const unit of removedNfts) {
		changes.push({
			address,
			policyId,
			unit,
			action: 'sent',
			triggerType: 'nftTransfer',
		});
	}

	return previousNfts.length > 0 ? changes : [];
}

async function handleDelegationChanged(
	this: IPollFunctions,
	staticData: IDataObject,
): Promise<IDataObject[]> {
	const stakeAddress = this.getNodeParameter('stakeAddress') as string;

	const accountInfo = (await cardanoApiRequest.call(
		this,
		'GET',
		`/accounts/${stakeAddress}`,
	)) as IDataObject;

	const currentPool = accountInfo.pool_id as string;
	const previousPool = staticData.previousPool as string;

	if (previousPool && currentPool !== previousPool) {
		staticData.previousPool = currentPool;
		return [
			{
				stakeAddress,
				previousPool,
				currentPool,
				triggerType: 'delegationChanged',
			},
		];
	}

	staticData.previousPool = currentPool;
	return [];
}

async function handleRewardsAvailable(
	this: IPollFunctions,
	staticData: IDataObject,
): Promise<IDataObject[]> {
	const stakeAddress = this.getNodeParameter('stakeAddress') as string;

	const accountInfo = (await cardanoApiRequest.call(
		this,
		'GET',
		`/accounts/${stakeAddress}`,
	)) as IDataObject;

	const currentRewards = BigInt((accountInfo.withdrawable_amount as string) || '0');
	const previousRewards = BigInt((staticData.previousRewards as string) || '0');

	if (currentRewards > previousRewards && previousRewards > 0) {
		staticData.previousRewards = currentRewards.toString();
		const newRewards = currentRewards - previousRewards;
		return [
			{
				stakeAddress,
				totalRewards: currentRewards.toString(),
				totalRewardsAda: lovelaceToAda(currentRewards.toString()),
				newRewards: newRewards.toString(),
				newRewardsAda: lovelaceToAda(newRewards.toString()),
				triggerType: 'rewardsAvailable',
			},
		];
	}

	staticData.previousRewards = currentRewards.toString();
	return [];
}

async function handleScriptExecution(
	this: IPollFunctions,
	staticData: IDataObject,
): Promise<IDataObject[]> {
	const scriptHash = this.getNodeParameter('scriptHash') as string;

	const redeemers = (await cardanoApiRequest.call(
		this,
		'GET',
		`/scripts/${scriptHash}/redeemers`,
		{},
		{ count: 10, order: 'desc' },
	)) as IDataObject[];

	const lastTxHash = staticData.lastScriptTxHash as string;
	const newExecutions: IDataObject[] = [];

	for (const redeemer of redeemers) {
		if (redeemer.tx_hash === lastTxHash) break;
		newExecutions.push({
			...redeemer,
			scriptHash,
			triggerType: 'scriptExecution',
		});
	}

	if (redeemers.length > 0) {
		staticData.lastScriptTxHash = redeemers[0].tx_hash;
	}

	return lastTxHash ? newExecutions : [];
}

async function handlePoolRetirement(
	this: IPollFunctions,
	staticData: IDataObject,
): Promise<IDataObject[]> {
	const retiringPools = (await cardanoApiRequest.call(
		this,
		'GET',
		'/pools/retiring',
	)) as IDataObject[];

	const previousPoolIds = (staticData.previousRetiringPools as string[]) || [];
	const currentPoolIds = retiringPools.map((p) => p.pool_id as string);

	const newRetirements = retiringPools.filter(
		(p) => !previousPoolIds.includes(p.pool_id as string),
	);

	staticData.previousRetiringPools = currentPoolIds;

	return previousPoolIds.length > 0
		? newRetirements.map((p) => ({ ...p, triggerType: 'poolRetirement' }))
		: [];
}
