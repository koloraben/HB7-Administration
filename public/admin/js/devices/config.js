import edit_button from '../edit_button.html';

export default function (nga, admin) {
    var devices = admin.getEntity('Devices')
    devices.listView()
        .title('<h4>Devices <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .batchActions([
            '<sendpush type="softwareupdate" selection="selection"></sendpush>',
            '<sendpush type="deletedata" selection="selection"></sendpush>',
            '<sendpush type="deletesharedpreferences" selection="selection"></sendpush>'
        ])
        .actions(['batch', 'export', 'filter','create'])
        .fields([

            nga.field('device_id', 'string')
                .label('Device ID'),
            nga.field('device_mac_address', 'string')
                .label('Mac Address'),
            nga.field('device_brand')
                .label('Device Brand'),
            nga.field('device_active', 'boolean')
                .label('Device Active'),
            nga.field('createdAt', 'datetime')
                .label('First Login'),
            nga.field('updatedAt', 'datetime')
                .label('Last Login'),
        ])
        .filters([
            nga.field('q')
                .label('')
                .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')
                .pinned(true),
            nga.field('device_active', 'boolean')
                .filterChoices([
                    { value: true, label: 'Active' },
                    { value: false, label: 'Not Active' }
                ])
                .label('Device Active'),
            nga.field('device_mac_address')
                .attributes({ placeholder: 'Device Mac Address' })
                .label('Device Mac Address'),
            nga.field('device_id')
                .attributes({ placeholder: 'Device ID' })
                .label('Device ID'),
            nga.field('device_brand')
                .attributes({ placeholder: 'Device Brand' })
                .label('Device Brand'),
        ])
        .listActions(['edit'])
        .exportFields([
            devices.listView().fields(),
        ]);


    devices.creationView()
        .title('<h4>Devices <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Device</h4>')
        .onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
            progression.done();
            $state.go($state.get('edit'), { entity: entity.name(), id: entry._identifierValue });
            return false;
        }])
        .fields([

            nga.field('device_active', 'boolean')
                .validation({ required: true })
                .label('Device Active'),
            nga.field('device_mac_address', 'string')
                .attributes({ placeholder: 'Device Mac Address' })
                .validation({ required: true })
                .editable(true)
                .label('Device Mac Address'),
            nga.field('device_id', 'string')
                .attributes({ placeholder: 'Device ID' })
                .validation({ required: true })
                .editable(true)
                .label('Device ID'),
            nga.field('firmware', 'string')
                .editable(true)
                .label('Firmware'),
            nga.field('os')
                .editable(true)
                .label('Os'),
            nga.field('device_brand')
                .editable(true)
                .label('Device Brand'),
            nga.field('template')
                .label('')
                .template(edit_button),
        ])

    devices.editionView()
        .title('<h4>Devices <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.username }}</h4>')
        .actions(['list'])
        .fields([
            devices.creationView().fields(),
        ]);


    return devices;

}