/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'setting/sm/ui/js/models/ServerModel',
    'setting/sm/ui/js/views/ServerEditView'
], function (_, Backbone, ServerModel, ServerEditView) {
    var prefixId = smConstants.SERVER_PREFIX_ID;

    var ServersView = Backbone.View.extend({
        el: $(contentContainer),

        render: function (viewConfig) {
            var smTemplate = contrail.getTemplate4Id(smConstants.SM_PREFIX_ID + "-template"),
                gridElId = '#' + prefixId + '-results';

            var queryString = getQueryString4ServersUrl(viewConfig['hashParams']);

            this.$el.html(smTemplate({name: prefixId}));

            var gridConfig = {
                header: {
                    title: {
                        text: smLabels.TITLE_SERVERS
                    },
                    advanceControls: getHeaderControlConfig(viewConfig)
                },
                columnHeader: {
                    columns: smGridConfig.SERVER_COLUMNS
                },
                body: {
                    options: {
                        actionCell: gridActionCellConfig,
                        detail: {
                            template: $('#sm-grid-2-row-group-detail-template').html(),
                            templateConfig: gridTemplateConfig
                        }
                    },
                    dataSource: {
                        remote: {
                            ajaxConfig: {
                                url: smUtils.getObjectDetailUrl(prefixId, prefixId) + queryString
                            }
                        }
                    }
                }
            };

            smUtils.renderGrid(gridElId, gridConfig);
        }
    });

    var gridActionCellConfig = [
        smGridConfig.getConfigureAction(function (rowIndex) {
            var dataItem = $('#' + prefixId + '-results').data('contrailGrid')._dataView.getItem(rowIndex),
                serverModel = new ServerModel(dataItem),
                serverEditView = new ServerEditView({'model': serverModel});

            serverEditView.renderConfigure({"title": smLabels.TITLE_CONFIGURE + ' ' + smLabels.TITLE_SERVER});
        }),
        smGridConfig.getProvisionAction(function (rowIndex) {
            var dataItem = $('#' + prefixId + '-results').data('contrailGrid')._dataView.getItem(rowIndex),
                serverModel = new ServerModel(dataItem),
                serverEditView = new ServerEditView({'model': serverModel});

            serverEditView.renderProvisionServers({"title": smLabels.TITLE_PROVISION + ' ' + smLabels.TITLE_SERVER});
        }),
        smGridConfig.getTagAction(function (rowIndex) {
            var dataItem = $('#' + prefixId + '-results').data('contrailGrid')._dataView.getItem(rowIndex),
                serverModel = new ServerModel(dataItem),
                serverEditView = new ServerEditView({'model': serverModel});

            serverEditView.renderTagServers({"title": smLabels.TITLE_ADD + ' ' + smLabels.TITLE_TAGS});
        }),
        smGridConfig.getRoleAction(function (rowIndex) {
            var dataItem = $('#' + prefixId + '-results').data('contrailGrid')._dataView.getItem(rowIndex),
                serverModel = new ServerModel(dataItem),
                serverEditView = new ServerEditView({'model': serverModel});

            serverEditView.renderEditRoles({"title": smLabels.TITLE_EDIT + ' ' + smLabels.TITLE_ROLES});
        }),
        smGridConfig.getDeleteAction(function (rowIndex) {
            console.log(rowIndex);
        })
    ];

    var gridTemplateConfig = [
        [
            {
                title: smLabels.TITLE_DETAILS,
                keys: ['id', 'cluster_id', 'host_name', 'email']
            },
            {
                title: smLabels.TITLE_SYSTEM,
                keys: ['domain', 'ip_address', 'ipmi_address', 'gateway', 'subnet_mask', 'mac_address', 'parameters.interface_name']
            },
            {
                title: smLabels.TITLE_TAGS,
                keys: ['tag.datacenter', 'tag.floor', 'tag.hall', 'tag.rack', 'tag.user_tag']
            }
        ],
        [
            {
                title: smLabels.TITLE_STATUS,
                keys: ['status', 'last_update']
            },
            {
                title: smLabels.TITLE_ROLES,
                keys: ['roles']
            },
            {
                title: smLabels.TITLE_CONFIGURATIONS,
                keys: ['base_image_id', 'package_image_id', 'static_ip', 'parameters.compute_non_mgmt_ip', 'parameters.compute_non_mgmt_gway']
            }
        ]
    ];

    return ServersView;

    function getFilterServerData(viewconfig) {
        var filterServerDataMap = {}, filterServerData = [
            {
                id: 'datacenter',
                text: 'Data Center',
                children: [
                    {id: 'dc1', text: 'dc1'},
                    {id: 'dc2223', text: 'dc2223'},
                ]
            },
            {
                id: 'hall',
                text: 'Hall',
                children: [
                    {id: 'hall1', text: 'hall1'},
                    {id: 'hall2', text: 'hall2'}
                ]
            },
            {
                id: 'user_tag',
                text: 'User Tag',
                children: [
                    {id: 'b1s1', text: 'b1s1'},
                    {id: 'b1s2', text: 'b1s2'},
                    {id: 'b1s3', text: 'b1s3'},
                    {id: 'b1s4', text: 'b1s4'},
                    {id: 'b1s5', text: 'b1s5'},
                    {id: 'b1s6', text: 'b1s6'},
                    {id: 'b1s7', text: 'b1s7'},
                    {id: 'b1s8', text: 'b1s8'},
                    {id: 'b1s9', text: 'b1s9'},
                    {id: 'b2s1', text: 'b2s1'},
                    {id: 'a3s15', text: 'a3s15'}
                ]
            }
        ];

        if (contrail.checkIfExist(viewconfig.hashParams) && contrail.checkIfExist(viewconfig.hashParams.tag) && !$.isEmptyObject(viewconfig.hashParams)) {
            $.each(filterServerData, function (filterServerDataKey, filterServerDataValue) {
                var filterServerDataMapValue = {key: filterServerDataKey, children: {}},
                    filterServerDataMapChildrenValue = {};

                $.each(filterServerData[filterServerDataKey].children, function (filterServerDataChildrenKey, filterServerDataChildrenValue) {
                    filterServerDataMapChildrenValue[filterServerDataChildrenValue.id] = {key: filterServerDataChildrenKey};
                });

                filterServerDataMapValue.children = filterServerDataMapChildrenValue;
                filterServerDataMap[filterServerDataValue.id] = filterServerDataMapValue;
            });

            $.each(viewconfig.hashParams.tag, function (hashParamKey, hashParamValue) {
                var parentKey = filterServerDataMap[hashParamKey].key,
                    childrenKey = filterServerDataMap[hashParamKey].children[hashParamValue].key;

                filterServerData[parentKey].children[childrenKey]['selected'] = true;
            });
        }

        return filterServerData;
    };

    function getHeaderControlConfig(viewconfig) {
        return [
            {
                "type": "dropdown",
                "iconClass": "icon-cog",
                "actions": [
                    {
                        "iconClass": "icon-cogs",
                        "title": smLabels.TITLE_CONFIGURE,
                        "onClick": function () {
                            var serverModel = new ServerModel(),
                                serverEditView = new ServerEditView({'model': serverModel});
                            serverEditView.renderConfigureServers({"title": "Configure Servers"});
                        }
                    },
                    {
                        "iconClass": "icon-cloud-upload",
                        "title": smLabels.TITLE_PROVISION,
                        "onClick": function () {
                            var serverModel = new ServerModel(),
                                serverEditView = new ServerEditView({'model': serverModel});
                            serverEditView.renderProvisionServers({"title": "Provision Servers"});
                        }
                    },
                    {
                        "iconClass": "icon-tags",
                        "title": 'Edit ' + smLabels.TITLE_TAGS,
                        "onClick": function () {
                            var serverModel = new ServerModel(),
                                serverEditView = new ServerEditView({'model': serverModel});
                            serverEditView.renderTagServers({"title": "Add Tags"});
                        }
                    },
                    {
                        "iconClass": "icon-check",
                        "title": 'Edit ' + smLabels.TITLE_ROLES,
                        "onClick": function () {
                            var serverModel = new ServerModel(),
                                serverEditView = new ServerEditView({'model': serverModel});
                            serverEditView.renderEditRoles({"title": "Edit Roles"});
                        }
                    },
                    {
                        "iconClass": "icon-trash",
                        "title": smLabels.TITLE_DELETE
                    }
                ]
            },
            {
                "type": "checked-multiselect",
                "iconClass": "icon-filter",
                placeholder: 'Filter Servers',
                elementConfig: {
                    dataTextField: 'text',
                    dataValueField: 'id',
                    minWidth: 150,
                    control: {
                        apply: {
                            click: function (self, checkedRows) {
                                var q = {'tag': {}};
                                $.each(checkedRows, function (checkedRowKey, checkedRowValue) {
                                    var checkedRowValueObj = $.parseJSON(unescape($(checkedRowValue).val()));
                                    q.tag[checkedRowValueObj.parent] = checkedRowValueObj.value;
                                });
                                loadFeature({p: 'setting_sm_servers', q: q});
                            }
                        },
                        cancel: {
                            click: function (self, checkedRows) {
                                var preChecked = self.data('contrailCheckedMultiselect').getPreChecked();
                                self.data('contrailCheckedMultiselect').setChecked(preChecked);
                            }
                        }
                    },
                    data: getFilterServerData(viewconfig)
                }
            }
        ];
    };

    function getQueryString4ServersUrl(hashParams) {
        var queryString = '', tagKey, tagQueryArray = [];
        ;
        if (hashParams['cluster_id'] != null) {
            queryString += '&cluster_id=' + hashParams['cluster_id'];
        }

        if (hashParams['tag'] != null) {
            for (tagKey in hashParams['tag']) {
                tagQueryArray.push(tagKey + "=" + hashParams['tag'][tagKey]);
            }
            queryString += '&tag=' + tagQueryArray.join(',');
        }
        return queryString;
    };

//    function getServerTitleSuffix(hashParams) {
//        var titleSuffixArray = [], tagKey;
//        if (hashParams['cluster_id'] != null) {
//            titleSuffixArray.push(smLabels.TITLE_CLUSTER + ': ' + hashParams['cluster_id']);
//        }
//
//        if (hashParams['tag'] != null) {
//            for (tagKey in hashParams['tag']) {
//                titleSuffixArray.push(smLabels.get(tagKey) + ": " + hashParams['tag'][tagKey]);
//            }
//        }
//        return (titleSuffixArray.length > 0) ? (' (' + titleSuffixArray.join(',') + ') ') : '';
//    };
});