import channel_video from "../channel_video/channel_video.html";

export default function (nga, admin) {
    return admin.getEntity('channel_video').listView()
        .fields([
            nga.field('id', 'string')
                .isDetailLink(true)
                .label('ID'),
        ])
        .template(channel_video);


}