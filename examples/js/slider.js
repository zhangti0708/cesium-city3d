if((/ Chrome\/([\.0-9]+)/).exec(navigator.userAgent)){
    $.fn.slider = function(cfg){
        this.sliderCfg = {
            min: cfg && !isNaN(parseFloat(cfg.min)) ? Number(cfg.min) : null,
            max: cfg && !isNaN(parseFloat(cfg.max)) ? Number(cfg.max) : null,
            step: cfg && Number(cfg.step) ? cfg.step : 1,
            callback: cfg && cfg.callback ? cfg.callback : null
        };

        var $input = $(this);
        var min = this.sliderCfg.min;
        var max = this.sliderCfg.max;
        var step = this.sliderCfg.step;
        var callback = this.sliderCfg.callback;

        /*$input.attr('min', min)
            .attr('max', max)
            .attr('step', step);*/

        $input.bind("input", function(e){
            $(this).attr('value', this.value);
            var min = $(this).attr('min');
            var max = $(this).attr('max');
            var percent = this.value / max*100;
            $(this).css( 'background', 'linear-gradient(to right, #059CFA, white ' + percent + '%, white)' );
            if ($.isFunction(callback)) {
                callback(this);
            }
        });
    };
    $(document).ready(function(){
        $('input[type="range"]').slider();
    });
}

