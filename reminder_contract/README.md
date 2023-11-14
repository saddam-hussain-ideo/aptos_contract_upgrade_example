# Reminder Contract
An example smart contract

## Usage

1. Initialize your aptos account
```shell
$ aptos init --netwrok testnet
```
you will get a `.aptos` folder in your current folder.
```yaml
profiles:
  default:
     private_key: "0x0d3a37c1021ae58ee11c145f0370da21222d79405bcc8ec32aa06fbc791e5b3b"
     public_key: "0x0c9cf44d8fdc78cba3ab0974540f169b8f0faf3714d10587be9d55ac00f21adb"
     account: e0a163002dbd1fe2689e94d93aa86c854e823ae5549e645420f2ef361fe63c11 #your_original_account
     rest_url: "https://fullnode.testnet.aptoslabs.com"
     faucet_url: "https://faucet.testnet.aptoslabs.com"
```

2. Get some test APTs
```shell
$ aptos account fund-with-faucet --account YOUR_ACCOUNT --amount 1000000000000
```



3. Create a resource account for `liquidity_pool_contract`
```shell
$ aptos move run --function-id '0x1::resource_account::create_resource_account_and_fund' --args 'string:reminder' 'hex:your_original_account' 'u64:10000000'
```

4. Find the address of the resource account
```shell
$ aptos account list --query resources
```

```txt
{
   "0x1::resource_account::Container": {
     "store": {
       "data": [
          {
            "key": "0x7ecfcb185ed80bfc562227324ebf064466e8700b5939b18aaad1af8ed5f1d1a6",
            "value": {
               "account": "0x7ecfcb185ed80bfc562227324ebf064466e8700b5939b18aaad1af8ed5f1d1a6" # this is it, pad zeros to the left if it's shorter than 64 hex chars
          }
        }
      ]
    }
  }
}
```

Or find it on explorer: `https://explorer.aptoslabs.com/account/YOUR_ACCOUNT/resources?network=testnet`

5. Add the resource account in `config.yaml`
```yaml
profiles:
  default:
    private_key: "0x0d3a37c1021ae58ee11c145f0370da21222d79405bcc8ec32aa06fbc791e5b3b"
    public_key: "0x0c9cf44d8fdc78cba3ab0974540f169b8f0faf3714d10587be9d55ac00f21adb"
    account: e0a163002dbd1fe2689e94d93aa86c854e823ae5549e645420f2ef361fe63c11 #your_original_account
    rest_url: "https://fullnode.testnet.aptoslabs.com"
    faucet_url: "https://faucet.testnet.aptoslabs.com"
  reminder:
    private_key: "0x0d3a37c1021ae58ee11c145f0370da21222d79405bcc8ec32aa06fbc791e5b3b"
    public_key: "0x0c9cf44d8fdc78cba3ab0974540f169b8f0faf3714d10587be9d55ac00f21adb"
    account: # add resource account here
    rest_url: "https://fullnode.testnet.aptoslabs.com"
    faucet_url: "https://faucet.testnet.aptoslabs.com"
```

6. Edit `Move.toml`
  ```toml
[package]
name = "reminder_contract"
version = "0.0.1"

# .......
# .......
# .......

[addresses]
reminder_address = "7ecfcb185ed80bfc562227324ebf064466e8700b5939b18aaad1af8ed5f1d1a6" # replace with the resource account
reminder_default_admin = "e0a163002dbd1fe2689e94d93aa86c854e823ae5549e645420f2ef361fe63c11" # replace with your account
reminder_dev = "e0a163002dbd1fe2689e94d93aa86c854e823ae5549e645420f2ef361fe63c11" # replace with your account
```

7. Compile
```shell
$ aptos move compile
```

8. Publish
```shell
$ aptos move publish --profile reminder
```

9. Use this package as a lp contract to bridge token from aptos to evm
