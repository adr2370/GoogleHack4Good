/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // `load`, `deviceready`, `offline`, and `online`.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of `this` is the event. In order to call the `receivedEvent`
    // function, we must explicity call `app.receivedEvent(...);`
onDeviceReady: function() {
        //-------------------------------------------------------------------
        var BarcodeScanner = function() {
        }
        
        //-------------------------------------------------------------------
        BarcodeScanner.Encode = {
        TEXT_TYPE:     "TEXT_TYPE",
        EMAIL_TYPE:    "EMAIL_TYPE",
        PHONE_TYPE:    "PHONE_TYPE",
        SMS_TYPE:      "SMS_TYPE",
        CONTACT_TYPE:  "CONTACT_TYPE",
        LOCATION_TYPE: "LOCATION_TYPE"
        }
        
        //-------------------------------------------------------------------
        BarcodeScanner.prototype.scan = function(success, fail, options) {
            
            function successWrapper(result) {
                result.cancelled = (result.cancelled == 1);
                success.call(null, result);
            }
            
            if (!fail) { fail = function() {}}
            
            if (typeof fail != "function")  {
                console.log("BarcodeScanner.scan failure: failure parameter not a function");
                return;
            }
            
            if (typeof success != "function") {
                fail("success callback parameter must be a function");
                return;
            }
            
            if ( null == options )
                options = [];
                
                return Cordova.exec(successWrapper, fail, "BarcodeScanner", "scan", options);
                }
        
        //-------------------------------------------------------------------
        BarcodeScanner.prototype.encode = function(type, data, success, fail, options) {
            if (!fail) { fail = function() {}}
            
            if (typeof fail != "function")  {
                console.log("BarcodeScanner.scan failure: failure parameter not a function");
                return;
            }
            
            if (typeof success != "function") {
                fail("success callback parameter must be a function");
                return;
            }
            
            return Cordova.exec(success, fail, "BarcodeScanner", "encode", [{type: type, data: data, options: options}]);
        }
    
        BarcodeScanner.prototype.setup = function(types) {
            return Cordova.exec("BarcodeScanner.setup", types);
        };
    
        //Keep at bottom but remove the addConstructor for Cordova 2+
        if(!window.plugins) window.plugins = {};
        window.plugins.barcodeScanner = new BarcodeScanner();
        
        scanButton = document.getElementById("scan-button");
        resultSpan = document.getElementById("scan-result");
        scanButton.addEventListener("click", clickScan, false);
        createButton.addEventListener("click", clickCreate, false);
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};
