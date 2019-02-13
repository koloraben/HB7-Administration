import edit_button from '../edit_button.html';
import hb7television from './hb7television.html';

export default function (nga, admin) {
    return admin.getEntity('hb7television').listView()
        .fields([
            nga.field('id', 'string')
                .isDetailLink(true)
                .label('ID'),
        ])
        .template(hb7television);


}
