import { ChainName } from '@certusone/wormhole-sdk/lib/esm/utils/consts';
import * as dotenv from 'dotenv';

dotenv.config();

const getEnvVar = (varName: string): string | undefined => process.env[varName];

export type Connection = {
  rpc: string | undefined;
  key: string | undefined;
};

export type ChainConnections = {
  [chain in ChainName]: Connection;
};

const MAINNET = {
  unset: {
    rpc: undefined,
    key: undefined,
  },
  aptos: {
    rpc: 'https://fullnode.mainnet.aptoslabs.com/v1',
    key: getEnvVar('APTOS_MAINNET'),
  },
};

const TESTNET = {
  unset: {
    rpc: undefined,
    key: undefined,
  },
  aptos: {
    rpc: 'https://fullnode.testnet.aptoslabs.com/v1',
    key: getEnvVar('APTOS_TESTNET'),
  },
};

const DEVNET = {
  unset: {
    rpc: undefined,
    key: undefined,
  },

  aptos: {
    rpc: 'https://fullnode.devnet.aptoslabs.com/v1',
    key: getEnvVar('APTOS_DEVNET'),
  },
};

export const NETWORKS = { MAINNET, TESTNET, DEVNET };
