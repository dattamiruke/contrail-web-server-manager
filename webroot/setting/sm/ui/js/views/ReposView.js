/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'setting/sm/ui/js/models/RepoModel',
    'setting/sm/ui/js/views/RepoEditView'
], function (_, Backbone, RepoModel, RepoEditView) {
    var prefixId = smConstants.REPO_PREFIX_ID,
        repoEditView = new RepoEditView();

    var ImagesView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var directoryTemplate = contrail.getTemplate4Id(smConstants.SM_PREFIX_ID + "-template"),
                gridElId = '#' + prefixId + '-results';

            this.$el.html(directoryTemplate({name: prefixId}));

            var gridConfig = {
                header: {
                    title: {
                        text: smLabels.TITLE_REPOS
                    },
                    advanceControls: headerActionConfig
                },
                columnHeader: {
                    columns: smGridConfig.REPO_COLUMNS
                },
                body: {
                    options: {
                        actionCell: rowActionConfig,
                        checkboxSelectable: {
                            onNothingChecked: function(e){
                                $('#btnDeleteRepos').addClass('disabled-link');
                            },
                            onSomethingChecked: function(e){
                                $('#btnDeleteRepos').removeClass('disabled-link');
                            }
                        },
                        detail: {
                            template: $('#sm-grid-2-row-group-detail-template').html(),
                            templateConfig: detailTemplateConfig
                        }
                    },
                    dataSource: {
                        remote: {
                            ajaxConfig: {
                                url: smUtils.getObjectDetailUrl("image")
                            }
                        }
                    }
                }
            };

            smUtils.renderGrid(gridElId, gridConfig);
        }
    });

    var rowActionConfig = [
        smGridConfig.getConfigureAction(function (rowIndex) {
            var dataItem = $('#' + prefixId + '-results').data('contrailGrid')._dataView.getItem(rowIndex),
                repoModel = new RepoModel(dataItem);

            repoEditView.model = repoModel;
            repoEditView.render({"title": smLabels.TITLE_EDIT_CONFIG});
        })
    ];

    var headerActionConfig = [
        {
            "type": "link",
            linkElementId: 'btnDeleteRepos',
            disabledLink: true,
            "title": smLabels.TITLE_DELETE,
            "iconClass": "icon-trash",
            "onClick": function () {}
        },
        {
            "type": "link",
            "title": smLabels.TITLE_ADD_REPO,
            "iconClass": "icon-plus",
            "onClick": function () {
                var repoModel = new RepoModel();

                repoEditView.model = repoModel;
                repoEditView.render({"title": smLabels.TITLE_ADD_REPO});
            }
        }
    ];

    var detailTemplateConfig = [
        [
            {
                title: smLabels.TITLE_DETAILS,
                keys: ['id', 'type', 'version', 'path']
            }
        ]
    ];

    return ImagesView;
});