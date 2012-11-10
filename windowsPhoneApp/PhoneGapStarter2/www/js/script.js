(function(){


$("#i-love").typeahead({	
		items: "10"
	  , source: function (typeahead, query) {
    var term = $.trim(query.split(',').pop());
    if (term === '') {
      return [];
    }
	$.post('../search_product.php', {product_name: term}, function(data){
      typeahead.process(data.result);
      for(var i = 0; i < data.result.length; i++) {
        jQuery.data(document.body, data.result[i], data[i]);
      }
    }, "json");
  }
  , onselect: function(item, previous_items) {
      $("#i-love").val('');
      var id = window.location.search.split('=')[1];
      var data = {
        title: item,
        info: jQuery.data(document.body, item),
        id: id,
		userid: <?php $_SESSION['userID'] ?>,
      };

      ////Save it to the database
      $.post('../save_product.php', data, function(data){
      }, 'json');
  }
  // Matcher always returns true since there are multiple comma-seperated terms in the input box and the server ensures only matching terms are returned
  , matcher: function() { return true; }
  // Autoselect is disabled so that users can enter new tags
  , autoselect: false
});




})();
