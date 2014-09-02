/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'knockback'
], function (_, Backbone, Knockback) {
    var prefixId = smConstants.IMAGE_PREFIX_ID;

    var ImageEditView = Backbone.View.extend({

        render: function (options) {
            var modalId = 'configure-' + prefixId,
                editTemplate = contrail.getTemplate4Id("sm-edit-layout-template"),
                editLayout = editTemplate(editLayoutConfig);

            var that = this;

            smUtils.createModal({'modalId': modalId, 'className': 'modal-700', 'title': options['title'], 'body': editLayout, 'onSave': function () {
                that.model.configure(modalId); // TODO: Release binding on successful configure
            }, 'onCancel': function () {
                Knockback.release(that.model, document.getElementById(modalId));
                smValidation.unbind(that);
                $("#" + modalId).modal('hide');
            }});

            smUtils.generateEditFormHTML(modalId, this.model, editLayoutConfig);

            Knockback.applyBindings(this.model, document.getElementById(modalId));
            smValidation.bind(this);
        }
    });

    var editLayoutConfig = {
        prefixId: prefixId,
        groups: [
            {
                rows: [
                    {
                        elements: [
                            {id: 'type', path: "type", dataBindValue: "type", class: "span6", view: "FormInputView"},
                            {id: 'version', path: 'version', dataBindValue: "version", class: "span6", view: "FormInputView"}
                        ]
                    },
                    {
                        elements: [
                            {id: 'path', path: "path", dataBindValue: "path", class: "span12", view: "FormInputView"}
                        ]
                    }
                ]
            }
        ]
    };

    return ImageEditView;
});