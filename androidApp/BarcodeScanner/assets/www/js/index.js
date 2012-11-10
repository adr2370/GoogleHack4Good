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
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    onDeviceReady: function() {
        console.log("We got to device ready");
    },
    // Scan a barcode
    //
    scan: function() {
        window.plugins.barcodeScanner.scan( function(result) {
			errorCode.innerText = "Waiting for server...";
                var url = "http://ashabarcode.appspot.com/submitBarcode.html?barcode="+result.text.replace(/\s/g,""),
                result;
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.open("GET",url,true);
                xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
                xmlhttp.onreadystatechange = function(){
                    if(xmlhttp.readyState == 4 && xmlhttp.status == 200)
                    {
                        result = xmlhttp.responseText;
                        console.log(result);
                        if(result=="<html><body>0</body></html>") {
                            var soFar=parseInt(window.localStorage.getItem("numAdmited"));
                            if(window.localStorage.getItem("numAdmited")===null) {
                                window.localStorage.setItem("numAdmited",1);
                                document.getElementById("numPeople").innerText=1;
                            } else {
                                window.localStorage.setItem("numAdmited",soFar+1);
                                document.getElementById("numPeople").innerText=soFar+1;
                            }
                            errorCode.innerText="VALID, ADMIT ONE";
                        } else if(result=="<html><body>1</body></html>") {
                            errorCode.innerText="TICKET INVALID. TICKET DOES NOT EXIST IN DATABASE";
                        } else {
                        	var timeCode=result.replace("<html><body>","");
                        	timeCode=timeCode.replace("</body></html>","");
                        	timeCode=timeCode.split("\.")[0];
                        	var splitTimes=timeCode.split(" ");
                            errorCode.innerText="TICKET INVALID. TICKET HAS BEEN USED ON "+splitTimes[0]+" AT "+splitTimes[1];
                        }
                    }
                };
                xmlhttp.send();
                var xmlHttpTimeout=setTimeout(ajaxTimeout,10000);
                function ajaxTimeout() {
                    xmlhttp.abort();
                    errorCode.innerText="Could not reach the server.";
                }
        }, function(error) {
        });
    },
    // Encode text into QR code
    //
    encode: function() {
        window.plugins.barcodeScanner.encode(BarcodeScanner.Encode.TEXT_TYPE, "http://www.nytimes.com", function(success) {
            alert("encode success: " + success);
        }, function(fail) {
            alert("encoding failed: " + fail);
        }); 
    }
};
