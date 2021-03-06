if ("undefined" == typeof(AGBShortURLChrome)) {
  var AGBShortURLChrome = {};
};

AGBShortURLChrome.Core = function(){
}

AGBShortURLChrome.Core.prototype = {

  shortenURL : function(longURL, key, onSuccess, onFailure) {
    var url = encodeURIComponent(longURL);
    var ioService=Components.classes["@mozilla.org/network/io-service;1"]
        .getService(Components.interfaces.nsIIOService);
    var scriptableStream = Components
        .classes["@mozilla.org/scriptableinputstream;1"]
        .getService(Components.interfaces.nsIScriptableInputStream);
    var bitlyURL = 'https://api-ssl.bitly.com/v3/shorten?access_token='+key+'&longUrl='+url+'&format=json';
    var channel=ioService.newChannel(bitlyURL,null,null);

    function ServiceListener(dataCallback) {
        this.dataCallback = dataCallback;
    }

    ServiceListener.prototype = {
        serviceData : "",

        onStartRequest: function(request, ctx) {
        },

        onDataAvailable : function(request, context, inputStream, offset, count) {
            scriptableStream.init(inputStream);
            this.serviceData += scriptableStream.read(count);
        },

        onStopRequest: function(request, ctx, status) {
            this.dataCallback(JSON.parse(this.serviceData));
        },

    };

    var listener = new ServiceListener(function(result) {
        if (result.status_code == 200)
            onSuccess(result.data.long_url, result.data.url);
        else if (result.status_code == 500)
            if(onFailure)
                onFailure(longURL);
    });
    channel.asyncOpen(listener, null);

  }

};
