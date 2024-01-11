module reminder_address::reminder_contract {
    use std::signer;

    use aptos_framework::account;
    use aptos_framework::code;
    use aptos_framework::resource_account;
    use std::string::String;
    use aptos_std::smart_table::SmartTable;
    use aptos_framework::event::{EventHandle, emit_event};
    use aptos_std::smart_table;

    const DEFAULT_ADMIN: address = @reminder_default_admin;
    const RESOURCE_ACCOUNT: address = @reminder_address;
    const DEV: address = @reminder_dev;

    // errors
    const ERROR_ONLY_ADMIN: u64 = 0;
    const ERROR_POOL_EXIST: u64 = 1;
    const ERROR_COIN_NOT_EXIST: u64 = 2;
    const ERROR_POOL_NOT_EXIST: u64 = 3;
    const ERROR_NOT_ENOUGH_LIQUIDITY: u64 = 4;
    const ERROR_LP_COIN_ALREADY_EXIST: u64 = 5;
    const ERROR_VAA_EMITTER_INVALID: u64 = 6;
    const ERROR_VAA_CONSUMED: u64 = 7;

    struct ContractData has key {
        signer_cap: account::SignerCapability,
        admin: address,

        // smart table to store everyone's reminders
        reminders: SmartTable<address, String>,

        //events to emit on every action
        reminder_created_event: EventHandle<CreateReminderEvent>,
        reminder_deleted_event: EventHandle<DeleteReminderEvent>,

    }

    struct CreateReminderEvent has drop, store {
        sender: address,
        reminder: String,
    }

    struct DeleteReminderEvent has drop, store {
        sender: address,
    }

    #[test_only]
    public fun initialize(sender: &signer) {
        init_module(sender);
    }

    fun init_module(sender: &signer) {
        let signer_cap = resource_account::retrieve_resource_account_cap(sender, DEV);
        let resource_signer = account::create_signer_with_capability(&signer_cap);

        move_to(&resource_signer, ContractData {
            signer_cap,
            admin: DEFAULT_ADMIN,

            reminders: smart_table::new<address, String>(),
            reminder_created_event: account::new_event_handle<CreateReminderEvent>(sender),
            reminder_deleted_event: account::new_event_handle<DeleteReminderEvent>(sender),

        });
    }

    public entry fun upgrade_contract(sender: &signer, metadata_serialized: vector<u8>, code: vector<vector<u8>>) acquires ContractData {
        let sender_addr = signer::address_of(sender);
        let metadata = borrow_global<ContractData>(RESOURCE_ACCOUNT);
        assert!(sender_addr == metadata.admin, ERROR_ONLY_ADMIN);
        let resource_signer = account::create_signer_with_capability(&metadata.signer_cap);
        code::publish_package_txn(&resource_signer, metadata_serialized, code);
    }

    public entry fun set_admin(sender: &signer, new_admin: address) acquires ContractData {
        let sender_addr = signer::address_of(sender);
        let metadata = borrow_global_mut<ContractData>(RESOURCE_ACCOUNT);

        //only admin can assign new admin
        assert!(sender_addr == metadata.admin, ERROR_ONLY_ADMIN);
        metadata.admin = new_admin;
    }

    public entry fun add_reminder(user: &signer, reminder:String) acquires ContractData {
        let sender_addres = signer::address_of(user);
        let metadata = borrow_global_mut<ContractData>(RESOURCE_ACCOUNT);

        smart_table::add(&mut metadata.reminders, sender_addres, reminder);

        emit_event<CreateReminderEvent>(
            &mut metadata.reminder_created_event,
            CreateReminderEvent {
                sender: sender_addres,
                reminder
            }
        );
    }

    public entry fun delete_reminder(user: &signer) acquires ContractData {
        let sender_addres = signer::address_of(user);
        let metadata = borrow_global_mut<ContractData>(RESOURCE_ACCOUNT);

        smart_table::remove(&mut metadata.reminders, sender_addres);

        emit_event<DeleteReminderEvent>(
            &mut metadata.reminder_deleted_event,
            DeleteReminderEvent {
                sender: sender_addres,
            }
        );
    }
}
