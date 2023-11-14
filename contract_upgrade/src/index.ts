import { callEntryFunc } from './helper/aptos';
import {
  buildPackage,
  getContractDirectory,
  serializePackage,
} from './helper/buildPackage';
import { CONTRACTS } from './const';

const network = 'TESTNET';

const contract = CONTRACTS[network]['address'];

(async () => {
  try {
    const packageBuild = buildPackage(getContractDirectory());
    console.log('Build:', packageBuild.mv_files);
    const serialized = serializePackage(packageBuild);
    const hash = await callEntryFunc(
      network,
      `${contract}::reminder_contract`,
      'upgrade_contract',
      [],
      [serialized.meta, serialized.bytecodes],
    );
    console.log('Deployed:', packageBuild.mv_files);
    console.log(hash);
  } catch (e) {
    console.log(e);
  }
})();
