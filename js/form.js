$(function(){

    var formUrl = 'https://docs.google.com/a/developmentseed.org/spreadsheet/formResponse?formkey=dGdwaW1VUW5uY0FSMjF0RVZBVldLTUE6MQ';

    // Set up map
    var m = mapbox.map('map').addLayer(mapbox.layer().id('nigeriaoil.map-vbd0fpwq,nigeriaoil.nigeria-lga'));
    m.addLayer(mapbox.layer().id('nigeriaoil.nigeria-lga'));

    // Set up map ui features with point selector
    var ui = mapbox.ui().map(m).auto().pointselector(function(d) {
        // Remove all points except the most recent
        for (var i = 0; i < d.length - 1; i++) {
            var locs = ui['_pointselector'].locations();
            ui['_pointselector'].deleteLocation(locs[i]);
        }
        saveLatLon(d[0]);
    });

    // Get LGA data and set up LGA typeahead
    mapbox.converters.googledocs('0AoiGgH1LJtE0dGdwaW1VUW5uY0FSMjF0RVZBVldLTUE', 'od4', typeAhead);

    // Set up date pickers
    var now = new Date();
    now = now.getMonth() + '/' + now.getDate() + '/' + now.getFullYear();
    $('#entry_4, #entry_8').val(now).datepicker();

    // Handle form submission
    $('form').submit(function(e) {
        var button = $('input[type=submit]', this),
            data = $(this).serialize();

        e.preventDefault();
        if (validate($(this))) {
            button.button('loading');
            $.ajax({
                type: 'POST',
                url: formUrl,
                data: data,
                complete: function() {
                    button.button('reset');
                    window.location = 'index.html#new';
                }
            });
        }

        function validate(form) {
            $('.control-group').removeClass('error');
            $('input, textarea', form).each(function() {
                var tag = $(this)[0].tagName.toLowerCase(),
                    type = $(this).attr('type');

                // Validate radio buttons
                if (tag === 'input' && type === 'radio') {
                    var name = $(this).attr('name');
                    if ($('[name="' + name + '"]:checked').length < 1) {
                        $(this).parent().parent().parent().addClass('error');
                    }
                }

                // Validate text fields
                if ((tag === 'input' && type === 'text') || tag === 'textarea') {
                    if ($(this).val() === '' && !$(this).parent().hasClass('radio')) {
                        $(this).parent().parent().addClass('error');
                    }
                }
            });

            if ($('.control-group.error').length < 1) return true;
            $('.control-group.error').length
            
            $('html, body').animate({
                scrollTop: $('.control-group.error').offset().top - 20
            }, 500);

            return false;
        }
    });

    function typeAhead(features) {
        var lgas = [];

        // Pluck `LGA, state` values
        for (var i = 0; i < features.length; i++) {
            lgas.push(features[i].properties.lgastate);
        }

        $('#entry_0').typeahead({source: lgas}).change(function() {
            var position = $.inArray($(this).val(), lgas);
            if (position >= 0) {
                var coords = features[position].geometry.coordinates,
                    loc = { lon: coords[0], lat: coords[1] };

                saveLatLon(loc);
                m.center(loc).zoom(7);
                $('#map-control').show();
            }
        });
    }

    function saveLatLon(loc) {
        $('#entry_1').val(loc.lon);
        $('#entry_2').val(loc.lat);
    }
});
