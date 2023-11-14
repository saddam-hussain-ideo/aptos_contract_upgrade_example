import { NETWORKS } from '../const';
import { AptosAccount, AptosClient, BCS, TxnBuilderTypes } from 'aptos';

export async function callEntryFunc(
  network: 'MAINNET' | 'TESTNET' | 'DEVNET',
  module: string,
  func: string,
  ty_args: BCS.Seq<TxnBuilderTypes.TypeTag>,
  args: BCS.Seq<BCS.Bytes>,
): Promise<string> {
  let key: string | undefined = NETWORKS[network]['aptos'].key;
  if (key === undefined) {
    throw new Error('No key for aptos');
  }

  let rpc: string | undefined = NETWORKS[network]['aptos'].rpc;
  if (rpc === undefined) {
    throw new Error('No rpc for aptos');
  }

  const accountFrom = new AptosAccount(new Uint8Array(Buffer.from(key, 'hex')));
  let client: AptosClient = new AptosClient(rpc);

  const [{ sequence_number: sequenceNumber }, chainId] = await Promise.all([
    client.getAccount(accountFrom.address()),
    client.getChainId(),
  ]);

  const txPayload = new TxnBuilderTypes.TransactionPayloadEntryFunction(
    TxnBuilderTypes.EntryFunction.natural(module, func, ty_args, args),
  );

  const rawTxn = new TxnBuilderTypes.RawTransaction(
    TxnBuilderTypes.AccountAddress.fromHex(accountFrom.address()),
    BigInt(sequenceNumber),
    txPayload,
    BigInt(100000), //max gas to be used. TODO(csongor): we could compute this from the simulation below...
    BigInt(100), //price per unit gas TODO(csongor): we should get this dynamically
    BigInt(Math.floor(Date.now() / 1000) + 10),
    new TxnBuilderTypes.ChainId(chainId),
  );

  // simulate transaction before submitting
  const sim = await client.simulateTransaction(accountFrom, rawTxn);
  sim.forEach((tx) => {
    if (!tx.success) {
      console.error(JSON.stringify(tx, null, 2));
      throw new Error(`Transaction failed: ${tx.vm_status}`);
    }
  });

  // simulation successful... let's do it
  const bcsTxn = AptosClient.generateBCSTransaction(accountFrom, rawTxn);
  const transactionRes = await client.submitSignedBCSTransaction(bcsTxn);

  await client.waitForTransaction(transactionRes.hash);
  return transactionRes.hash;
}
