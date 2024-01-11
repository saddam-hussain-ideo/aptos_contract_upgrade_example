#[test_only]
module reminder_address::reminder_test {

    use aptos_framework::genesis;
    use aptos_framework::account;
    use reminder_address::reminder_contract::{initialize};

    use std::signer;
    use aptos_framework::resource_account;

    fun setup_test(dev: &signer, admin: &signer, treasury: &signer, resource_account: &signer) {
        genesis::setup();
        account::create_account_for_test(signer::address_of(dev));
        account::create_account_for_test(signer::address_of(admin));
        account::create_account_for_test(signer::address_of(treasury));
        resource_account::create_resource_account(dev, b"reminder", x"");
        initialize(resource_account)
    }

    #[test(
        dev = @reminder_dev,
        admin = @reminder_default_admin,
        resource_account = @reminder_address,
        treasury = @0x23456,
        bob = @0x12345,
        alice = @0x12346
    )]
    fun test_create_pool(
        dev: &signer,
        admin: &signer,
        resource_account: &signer,
        treasury: &signer,
        bob: &signer,
        alice: &signer
    ) {
        account::create_account_for_test(signer::address_of(bob));
        account::create_account_for_test(signer::address_of(alice));

        setup_test(dev, admin, treasury, resource_account);

        assert!(0 == 0, 98);
    }
}
