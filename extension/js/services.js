﻿'use strict';

angular.module('deadboltPasswordGeneratorApp.services', [])
    .factory('settingsRepository', function () {
        return {
            getSettings: function (callback) {
                chrome.storage.sync.get('deadboltSettings', function (r) {
                    var savedSettings = r.deadboltSettings;
                    if (!savedSettings) {
                        savedSettings = createDefaultDeadboltSettings();
                    }
                    callback(savedSettings);
                });
            },
            saveSettings: function (deadboltSettings, callback) {
                deadboltSettings.simpleProfileList.sort(function (a, b) { return a.name.localeCompare(b.name); });
                chrome.storage.sync.set({ 'deadboltSettings': deadboltSettings }, function () {
                    if (callback != null) {
                        callback();
                    }
                });
            }
        };
    })
    .factory('analyticsService', function () {
        return {
            generateEventLabel: function (p) {
                return 'Symbols:' + p.includeSymbols +
                    '|Length:' + p.passwordLength +
                    '|CaseSensitive:' + p.caseSensitive +
                    '|UsePin:' + p.usePinNumber;
            },
            postEvent: function (method, selectedProfile) {
                var eventLabel = this.generateEventLabel(selectedProfile);
                _gaq.push(['_trackEvent', 'Password Generated', method, eventLabel]);
            }
        }
    })
    .factory('deadboltSettingsFactory', function () {
        return {
            createDefaultDeadboltSettings: function () {
                var simpleProfileList = new Array();
                var defaultSimpleProfile = new simpleProfile('Default', true, true, false, '0', '0', '0', '0', 15);
                simpleProfileList.push(defaultSimpleProfile);
                var settings = new deadboltSettings('Default', simpleProfileList);
                saveDeadboltSettings(settings);
                return settings;
            },
            deadboltSettings: function (defaultProfileName, simpleProfileList) {
                this.defaultProfileName = defaultProfileName;
                this.simpleProfileList = simpleProfileList;
            },
            simpleProfile: function (name, includeSymbols, caseSensitive, usePinNumber, pin1, pin2, pin3, pin4, passwordLength) {
                this.name = name;
                this.includeSymbols = includeSymbols;
                this.caseSensitive = caseSensitive;
                this.usePinNumber = usePinNumber;
                this.pin1 = pin1;
                this.pin2 = pin2;
                this.pin3 = pin3;
                this.pin4 = pin4;
                this.passwordLength = passwordLength;
            },
            findMatchingProfileByName: function (profiles, name) {
                for (var i = 0; i < profiles.length; i++) {
                    if (profiles[i].name == name) {
                        return profiles[i]
                    }
                }
                return profiles[0];
            }
        };
    });
