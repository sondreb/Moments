/*
 Flickr Downloadr
 Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 License: MIT
*/

/// <reference path="../Scripts/angular.js" />
/// <reference path="../Scripts/jquery-2.0.3.js" />
/// <reference path="../Scripts/jquery.signalR-2.0.0.js" />

// Used to see if we're running inside Chrome Packaged App.
var _packaged = (typeof chrome != 'undefined' && typeof chrome.runtime != 'undefined');

// Create the app module.
var downloadr = angular.module('downloadr', []);







//angular.module('invoice2', ['finance2'])
//  .controller('InvoiceController', ['currencyConverter', function (currencyConverter) {
//      this.qty = 1;
//      this.cost = 2;
//      this.inCurr = 'EUR';
//      this.currencies = currencyConverter.currencies;

//      this.total = function total(outCurr) {
//          return currencyConverter.convert(this.qty * this.cost, this.inCurr, outCurr);
//      };
//      this.pay = function pay() {
//          window.alert("Thanks!");
//      };
//  }]);

//var downloadr = angular.module('downloadr', []);

//downloadr.controller('SettingsViewModel', function SettingsViewModel($scope) {

//    $scope.language = 'en-US';
//    $scope.save = function () { console.log("SAVE!!"); };

//});


//downloadr.directive('hello', function () {
//    return {
//        restrict: 'E',
//        template: '<div>WHY ISNT THIS WORKING</div>',
//        replace: true,
//    };
//})

function TodoCtrl($scope) {
    $scope.todos = [
      { text: 'learn angular', done: true },
      { text: 'build an angular Chrome packaged app', done: false }];

    $scope.addTodo = function () {
        $scope.todos.push({ text: $scope.todoText, done: false });
        $scope.todoText = '';
    };

    $scope.remaining = function () {
        var count = 0;
        angular.forEach($scope.todos, function (todo) {
            count += todo.done ? 0 : 1;
        });
        return count;
    };

    $scope.archive = function () {
        var oldTodos = $scope.todos;
        $scope.todos = [];
        angular.forEach(oldTodos, function (todo) {
            if (!todo.done) $scope.todos.push(todo);
        });
    };
}



    console.log("TEST!!");




function rename(currDir, srcEntry, newName) {   
  currDir.getFile(srcEntry, {}, function(fileEntry) {     
    fileEntry.moveTo(currDir, newName);   
  }, errorHandler); 
}
 
rename(fs.root, 'test.txt', 'text.txt');


    var fs = chrome.fileSystem;

    fs.root.getDirectory('Documents', {}, function(dirEntry){
      var dirReader = dirEntry.createReader();
      dirReader.readEntries(function(entries) {
        for(var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          if (entry.isDirectory){
            console.log('Directory: ' + entry.fullPath);
          }
          else if (entry.isFile){
            console.log('File: ' + entry.fullPath);
          }
        }
     
      }, errorHandler);
    }, errorHandler);



$(document).ready(function () {







      function handleFileSelect(evt) {
        var files = evt.target.files; // FileList object

        // Loop through the FileList and render image files as thumbnails.
        for (var i = 0, f; f = files[i]; i++) {

          // Only process image files.
          if (!f.type.match('image.*')) {
            continue;
          }

          var reader = new FileReader();

          // Closure to capture the file information.
          reader.onload = (function(theFile) {
            return function(e) {
              // Render thumbnail.
              var span = document.createElement('span');
              span.innerHTML = ['<img class="thumb" src="', e.target.result,
                                '" title="', escape(theFile.name), '"/>'].join('');
              document.getElementById('list').insertBefore(span, null);
            };
          })(f);

          // Read in the image file as a data URL.
          reader.readAsDataURL(f);
        }
      }


    document.getElementById('files').addEventListener('change', handleFileSelect, false);




    // This will read oauth_token from local storage if it exists, if not, it will
    // connect to the WebSocket service and notify a request for authentication URL.
    // After the URL is generated, we'll show it to the user. When returned, it will
    // return to the WebSocket service, which in return will return the answers.
    Flickr.Authenticate();

    //Flickr.privilegedMethod();
    //var url = Flickr.Authentication.AuthenticationUrl();
    //console.log(url);

    // Event that is raised when authentication is fully complete and secure oauth calls
    // can be done against the Flickr API.
    //Flickr.OnAuthenticated = function (token) {

    //    console.log("Flickr:OnAuthenticated");
    //    console.log("Token: " + token.Token);
    //    console.log("Secret: " + token.Secret);

    //    var webview = document.querySelector('webview');
    //    $(webview).hide();

    //}

    //// Event that is raised which should load URL to get users permission.
    //Flickr.OnAuthenticating = function (url) {
    //    console.log("Flickr:OnAuthenticating: " + url);

    //    $('#loginUrlView').html(url);

    //    if (_packaged) {

    //        var webview = document.querySelector('webview');
    //        webview.src = url;

    //        //$('#myModal').modal({ show: true })
    //    }
    //    else {
    //        //window.open(url, '_blank');
    //    }
    //}

    //Flickr.addListener("OnAuthenticated", function () { console.log("Flickr:OnAuthenticated"); });
    //Flickr.addListener("OnAuthenticating", function () { console.log("Flickr:OnAuthenticated"); });



    //Flickr.StartAuthentication();
    //Flickr.GetToken(function () { console.log("Flickr:GetToken"); });

});


function RequestToken() {
    /*
    http://www.flickr.com/services/oauth/request_token
        ?oauth_nonce=95613465
        &oauth_timestamp=1305586162
        &oauth_consumer_key=653e7a6ecc1d528c516cc8f92cf98611
        &oauth_signature_method=HMAC-SHA1
        &oauth_version=1.0
        &oauth_signature=7w18YS2bONDPL%2FzgyzP5XTr5af4%3D
        &oauth_callback=http%3A%2F%2Fwww.example.com
        */

    var url = "http://www.flickr.com/services/oauth/request_token?oauth_nonce=95613465&oauth_timestamp=1305586162&oauth_consumer_key=653e7a6ecc1d528c516cc8f92cf98611&oauth_signature_method=HMAC-SHA1&oauth_version=1.0&oauth_signature=7w18YS2bONDPL%2FzgyzP5XTr5af4%3D&oauth_callback=http%3A%2F%2Fwww.example.com";

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    //xhr.responseType = 'blob';

    xhr.onreadystatechange = function () {
        if (xhr.readyState >= 3) {

            alert('ReadyState ' + xhr.readyState + ' - - Status ' + xhr.status);

            if (xhr.status == 200)
                document.getElementById("result").innerHTML = xhr.responseText;
            else
                document.getElementById("result").innerHTML = 'Error';
        }
    }

    //xhr.onload = function (e) {

    //    //console.log(this.response);
    //    //alert(this.response);

    //    //var img = document.createElement('img');
    //    //img.src = window.webkitURL.createObjectURL(this.response);
    //    //var img = document.createElement('div');
    //    //img.innerText = this.response;
    //    //document.body.appendChild(img);
    //};

    xhr.send();


}


//$(document).ready(function () {
//    console.log("document ready occurred!");
//    console.log("test....");
//});

//$(window).load(function () {
//    console.log("window load occurred!");
//});