(function(app) {
	var m;
	var layers = document.getElementById('layers');
	var markers;
	var features;
	var map = mapbox.map('map');
   	map.addLayer(mapbox.layer().id('nigeriaoil.map-5ustxk97',getData));
   	map.centerzoom({ lat: 5.550, lon: 6.375 }, 8);
   	map.ui.zoomer.add();
    map.ui.zoombox.add();
    map.ui.attribution.add()
        .content('<a href="http://mapbox.com/about/maps">Terms &amp; Feedback</a>');
  

	//map-5ustxk97
	//map-b5b1r7sg
	//m.addLayer(mapbox.layer().id('nigeriaoil.nigeria-lga'));
	
	// Get data
	function getData(map) {
		m = map;
		mmg_google_docs('0AoiGgH1LJtE0dGdwaW1VUW5uY0FSMjF0RVZBVldLTUE', mapData);
	}

	// Build map
	function mapData(f){ 
		
		var markers = mapbox.markers.layer().features(f);       
		console.log(features)     
		map.addLayer(markers);
		// Set a custom formatter for tooltips
		// Provide a function that returns html to be used in tooltip
		var interaction = mapbox.markers.interaction(markers);
		interaction.formatter(function(feature) {
			if (feature.properties.verified == 'yes') {
				var verifyClass = 'check-plus';
				var verifyText = 'Verified by NOSDRA';
			} else { 
				var verifyClass = 'check-minus';
				var verifyText = 'Not verified by NOSDRA';
			}
			console.log(feature.properties.verified)	
			var o = '<a target="_blank" href="https://docs.google.com/spreadsheet/ccc?key=0AoiGgH1LJtE0dGdwaW1VUW5uY0FSMjF0RVZBVldLTUE">'
				+ '<div class="marker-title">' + feature.properties.title + '</div>' 
				+ '<div class="marker-description-top">Area Name: ' + feature.properties.area + '</div>'
				+ '<div class="marker-description-bottom"><span class="check ' + verifyClass + '"></span><span class="verify-text">' + verifyText + '</span></div></a>';
			return o;
			console.log(o)
		});			
		newMarker();
	}

	function newMarker() {
    	if (window.location.hash === '#new') {
    		$('#new').fadeIn('slow');
    		window.location.hash = '';
    		window.setTimeout(function() {
        		$('#new').fadeOut('slow');
    		}, 4000)
    	}
    }

	// google_docs.js
	function mmg_google_docs(id, callback) {
	    if (typeof reqwest === 'undefined') {
	        throw 'CSV: reqwest required for mmg_csv_url';
	    }

	    function response(x) {
	        var features = [],
	            latfield = '',
	            lonfield = '';
	        if (!x || !x.feed) return features;

	        for (var f in x.feed.entry[0]) {
	            if (f.match(/\$Lat/i)) latfield = f;
	            if (f.match(/\$Lon/i)) lonfield = f;
	        }

	        for (var i = 0; i < x.feed.entry.length; i++) {
	            var entry = x.feed.entry[i];
	            var feature = {
	                geometry: {
	                    type: 'Point',
	                    coordinates: []
	                },
	                properties: {
						'marker-color':'#840A0A',
						'title': 'Incident: ' + entry['gsx$obsdate'].$t,
						'area': entry['gsx$localname'].$t, 
						'verified': entry['gsx$verified'].$t
					}
	            };
	            for (var y in entry) {
	                if (y === latfield) feature.geometry.coordinates[1] = parseFloat(entry[y].$t);
	                else if (y === lonfield) feature.geometry.coordinates[0] = parseFloat(entry[y].$t);
	                else if (y.indexOf('gsx$') === 0) {
	                    feature.properties[y.replace('gsx$', '')] = entry[y].$t;
	                }
	            }
	            if (feature.geometry.coordinates.length == 2) features.push(feature);
	        }
	        return callback(features);
	    }

	    var url = 'https://spreadsheets.google.com/feeds/list/' + id +
	        '/od6/public/values?alt=json-in-script&callback=callback';

	    reqwest({
	        url: url,
	        type: 'jsonp',
	        jsonpCallback: 'callback',
	        success: response,
	        error: response
	    });
	}
}({}));    