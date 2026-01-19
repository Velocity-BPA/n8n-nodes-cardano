/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class CardanoWalletApi implements ICredentialType {
	name = 'cardanoWalletApi';
	displayName = 'Cardano Wallet';
	documentationUrl = 'https://cips.cardano.org/cips/cip3/';
	icon = { light: 'file:cardano.svg', dark: 'file:cardano.svg' } as const;

	properties: INodeProperties[] = [
		{
			displayName: 'Authentication Method',
			name: 'authMethod',
			type: 'options',
			default: 'mnemonic',
			options: [
				{ name: 'Mnemonic Phrase', value: 'mnemonic' },
				{ name: 'Extended Signing Key', value: 'extendedKey' },
				{ name: 'Payment + Stake Keys', value: 'separateKeys' },
				{ name: 'Read-Only (No Signing)', value: 'readOnly' },
			],
			description: 'How to authenticate with the wallet',
		},
		{
			displayName: 'Mnemonic Phrase',
			name: 'mnemonic',
			type: 'string',
			typeOptions: {
				password: true,
				rows: 3,
			},
			default: '',
			displayOptions: {
				show: { authMethod: ['mnemonic'] },
			},
			description: 'Your 15 or 24-word BIP39/CIP-3 mnemonic phrase (space-separated)',
		},
		{
			displayName: 'Account Index',
			name: 'accountIndex',
			type: 'number',
			default: 0,
			displayOptions: {
				show: { authMethod: ['mnemonic'] },
			},
			description: 'The account derivation index (typically 0)',
		},
		{
			displayName: 'Address Index',
			name: 'addressIndex',
			type: 'number',
			default: 0,
			displayOptions: {
				show: { authMethod: ['mnemonic'] },
			},
			description: 'The address derivation index (typically 0)',
		},
		{
			displayName: 'Extended Signing Key',
			name: 'extendedSigningKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'xsk1...',
			displayOptions: {
				show: { authMethod: ['extendedKey'] },
			},
			description: 'Extended signing key in Bech32 format (xsk...)',
		},
		{
			displayName: 'Payment Signing Key',
			name: 'paymentSigningKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'ed25519_sk...',
			displayOptions: {
				show: { authMethod: ['separateKeys'] },
			},
			description: 'Payment signing key in Bech32 or hex format',
		},
		{
			displayName: 'Stake Signing Key',
			name: 'stakeSigningKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'ed25519_sk...',
			displayOptions: {
				show: { authMethod: ['separateKeys'] },
			},
			description: 'Stake signing key in Bech32 or hex format (optional)',
		},
		{
			displayName: 'Payment Address',
			name: 'paymentAddress',
			type: 'string',
			default: '',
			placeholder: 'addr1...',
			displayOptions: {
				show: { authMethod: ['readOnly'] },
			},
			description: 'Your Cardano payment address (Bech32)',
		},
		{
			displayName: 'Stake Address',
			name: 'stakeAddress',
			type: 'string',
			default: '',
			placeholder: 'stake1...',
			displayOptions: {
				show: { authMethod: ['readOnly'] },
			},
			description: 'Your Cardano stake address (Bech32, optional)',
		},
		{
			displayName: 'Passphrase',
			name: 'passphrase',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			displayOptions: {
				show: { authMethod: ['mnemonic'] },
			},
			description: 'Optional BIP39 passphrase for additional security',
		},
	];
}
