$(document).ready( function() {
  var massage = function(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  $("div#json").each(function(index) {
    var dataset = $(this).prop('dataset');
    var url     = dataset.url;
    var target  = $(this);
    var request = { url: dataset.url, format: $.CSV_format.JSON };
    $.getCSV(request)
      .done( function(csv_data) {
        // console.log(csv_data);
        target.append("<pre>" + massage(csv_data.data) + "</pre>"); 
        $("div#meta").append("<pre>" + JSON.stringify(csv_data.meta,null,2) + "</pre>")
      })
      .fail( function(status,error) {
          console.log(status + " " + error);
      });
  });
  $("div#turtle").each(function(index) {
    var dataset = $(this).prop('dataset');
    var url     = dataset.url;
    var target  = $(this);
    var request = { url: dataset.url, format: "turtle"};
    $.getCSV(request)
      .done( function(csv_data) {
        // console.log(csv_data);
        target.append("<pre>" + massage(csv_data.data) + "</pre>");       
      })
      .fail( function(status,error) {
          console.log(status + " " + error);
      });
  });
});

