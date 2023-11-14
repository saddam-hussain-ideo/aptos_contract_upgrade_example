import { spawnSync } from 'child_process';
import fs from 'fs';
import { BCS } from 'aptos';
import sha3 from 'js-sha3';
import path from 'path';

interface Package {
  meta_file: string;
  mv_files: string[];
}

interface PackageBCS {
  meta: Uint8Array;
  bytecodes: Uint8Array;
  codeHash: Uint8Array;
}

export const buildPackage = (dir: string, addrs?: string): Package => {
  const named_addresses = addrs ? ['--named-addresses', addrs] : [];
  const aptos = spawnSync('aptos', [
    'move',
    'compile',
    '--save-metadata',
    '--included-artifacts',
    'none',
    '--package-dir',
    dir,
    ...named_addresses,
  ]);
  if (aptos.status !== 0) {
    console.error(aptos.stderr.toString('utf8'));
    console.error(aptos.stdout.toString('utf8'));
    process.exit(1);
  }

  const result: any = JSON.parse(aptos.stdout.toString('utf8'));
  const buildDirs = fs
    .readdirSync(`${dir}/build`, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
  if (buildDirs.length !== 1) {
    console.error(
      `Unexpected directory structure in ${dir}/build: expected a single directory`,
    );
    process.exit(1);
  }
  const buildDir = `${dir}/build/${buildDirs[0]}`;
  return {
    meta_file: `${buildDir}/package-metadata.bcs`,
    mv_files: result['Result'].map(
      (mod: string) => `${buildDir}/bytecode_modules/${mod.split('::')[1]}.mv`,
    ),
  };
};

export const serializePackage = (p: Package): PackageBCS => {
  const metaBytes = fs.readFileSync(p.meta_file);
  const packageMetadataSerializer = new BCS.Serializer();
  packageMetadataSerializer.serializeBytes(metaBytes);
  const serializedPackageMetadata = packageMetadataSerializer.getBytes();

  const modules = p.mv_files.map((file) => fs.readFileSync(file));
  const serializer = new BCS.Serializer();
  serializer.serializeU32AsUleb128(modules.length);
  modules.forEach((module) => serializer.serializeBytes(module));
  const serializedModules = serializer.getBytes();

  const hashes = [metaBytes]
    .concat(modules)
    .map((x) => Buffer.from(sha3.keccak256(x), 'hex'));
  const codeHash = Buffer.from(sha3.keccak256(Buffer.concat(hashes)), 'hex');

  return {
    meta: serializedPackageMetadata,
    bytecodes: serializedModules,
    codeHash,
  };
};

export function getContractDirectory(): string {
  const res = process.cwd().split(path.sep);
  return `${res.slice(0, res.length - 1).join('/')}/reminder_contract`;
}
