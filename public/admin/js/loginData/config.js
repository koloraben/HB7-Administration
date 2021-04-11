import edit_button from '../edit_button.html';

export default function (nga, admin) {
    var logindata = admin.getEntity('LoginData');
    logindata.listView()
        .title('<h4>Login Accounts <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .batchActions([])
        .fields([
            nga.field('customer_id','reference')
                .targetEntity(admin.getEntity('CustomerData'))
                .targetField(
                        nga.field('firstname')
                        .map(function (value, entry) {
                            return entry.firstname + ' ' + entry.lastname;
                        })
                )
                .cssClasses('hidden-xs')
                .label('Customer'),
            nga.field('device_id','reference')
                .targetEntity(admin.getEntity('Devices'))
                .targetField(
                        nga.field('device_id')
                )
                .cssClasses('hidden-xs')
                .label('Device'),
            nga.field('code')
                .label('Code'),
            nga.field('account_lock','boolean')
                .cssClasses('hidden-xs')
                .label('Account Locked')
        ])
        .filters([
            nga.field('q')
                .label('')
                .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')
                .pinned(true)])
        .listActions(['edit'])


    logindata.creationView()
        .title('<h4>Login Accounts <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Login Account</h4>')
        .onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
            progression.done();
            $state.go($state.get('edit'), { entity: entity.name(), id: entry._identifierValue });
            return false;
        }])
        .fields([
            nga.field('customer_id', 'reference')
                .targetEntity(admin.getEntity('CustomerData'))
                .targetField(nga.field('firstname')
                    .map((v, e) => e.firstname + ' ' + e.lastname))
        .remoteComplete(true, {
            refreshDelay: 300,
            // populate choices from the response of GET
            searchQuery: function(search) { return { q: search }; }
        })
        .perPage(5) // limit the number of results to 5
        .attributes({ placeholder: 'Select Customer' })
        .label('Customer *')
        .validation({validator: function(value) {
                if(value === null || value === ''){
                    throw new Error('Please Select Customer');
                }
            }
        }),
            nga.field('device_id', 'reference')
                .targetEntity(admin.getEntity('Devices'))
                .targetField(nga.field('device_id')
                    .map((v, e) => "id: " + e.device_id))
        .remoteComplete(true, {
            refreshDelay: 300,
            // populate choices from the response of GET
            searchQuery: function(search) { return { q: search }; }
        })
        .perPage(5) // limit the number of results to 5
        .attributes({ placeholder: 'Select Device' })
        .label('Device *')
        .validation({validator: function(value) {
                if(value === null || value === ''){
                    throw new Error('Please Select Customer');
                }
            }
        }),
        nga.field('code')
                .attributes({ placeholder: 'Code' })
                .validation({ required: true })
                .editable(true)
                .label('Code'),
        nga.field('account_lock','choice')
            .defaultValue(false)
            .choices([
                { value: false, label: 'Disabled' },
                { value: true, label: 'Enabled' }
            ])
            .attributes({ placeholder: 'Choose from dropdown list' })
            .label('Account Locked')
            .validation({ required: true}),

        nga.field('template')
            .label('')
            .template(edit_button)
]);

    logindata.editionView()
        .title('<h4>Login Accounts <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.username }}</h4>')
        .actions(['list'])
        .fields([
        	nga.field('customer_id', 'reference')
                .targetEntity(admin.getEntity('CustomerData'))
                .targetField(nga.field('firstname', 'template')
                        .map((v, e) => e.firstname + ' ' + e.lastname))
        .attributes({ placeholder: 'Select Customer' })
        .label('Customer *')
        .perPage(1000)
        .validation({validator: function(value) {
                if(value === null || value === ''){
                    throw new Error('Please Select Customer');
                }
            }
        }),
        	nga.field('device_id', 'reference')
                .targetEntity(admin.getEntity('Devices'))
                .targetField(nga.field('device_id', 'template')
                        .map((v, e) => "id: " + e.device_id))
        .attributes({ placeholder: 'Select Device' })
        .label('Device *')
        .perPage(10)
        .validation({validator: function(value) {
                if(value === null || value === ''){
                    throw new Error('Please Select Device');
                }
            }
        }),
        nga.field('code')
            .attributes({ placeholder: 'Code' })
            .validation({ required: true })
            .editable(true)
            .label('Code'),
        nga.field('account_lock','choice')
            .choices([
                { value: false, label: 'Disabled' },
                { value: true, label: 'Enabled' }
            ])
            .attributes({ placeholder: 'Choose from dropdown list' })
            .label('Account Locked')
            .validation({ required: true}),
        nga.field('template')
            .label('')
            .template(edit_button),
        //./hidden field
        ]);

    return logindata;
}