;(function($,doc){

    if (!$.magicKeyboard) {
        $.magicKeyboard = {};
    };
    var mk = $.magicKeyboard;

    var $d = $(document);

    mk.showHelp = function(){
        if (!mk.helpEl){
            mk.helpEl = $('<div class="modal fade" id="magic-kb-help" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="modal-header">\
<button type=button class=close data-dismiss=modal aria-hidden=true>&times;</button>\
<h4 class="modal-title">Keyboard shortcuts <kbd>?</kbd></h4>\
</div><div class="modal-body"></div></div></div></div>');
            var help = '';

            var groups = [];
            for (var g in mk.groups) {
               groups.push(g);
            }

            for (var g=0; g < groups.length; g++){
                if (groups[g] != 'null'){
                    help += '<tr><th><th>'+groups[g];
                }
                $.each(mk.shortcuts, function(i,e){
                    if ((''+e.group) != groups[g]) return;
                    help += '<tr>'
                          + '<td>';
                    for (var i=0; i < e.key.length; i++) {
                        if (i != 0){ help += ' or '; }
                        help += '<kbd>' + e.key[i].replace(/( |\+)/g,'</kbd> $1 <kbd>') + '</kbd>';
                    }
                    help += '</td>'
                          + '<td>'
                          +  (e.evt == 'disabled' ? '<span class="disabled">' : '')
                          + e.help
                          +  (e.evt == 'disabled' ? '</span>' : '')
                          + '</td>'
                          + '</tr>'
                });
            }


            mk.helpEl.find('.modal-body').append('<table class="help">'+help+'</table>');
            mk.helpEl.on('hidden.bs.modal', function () {
                $('#your-modal-id').modal('hide');
                $('body').removeClass('modal-open');
                $('.modal-backdrop').remove();
            })
        }

        mk.helpEl.modal();

    };

    mk.shortcuts = [];
    mk.lists = {};
    mk.groups = {};

    mk.register = function(evt){

       var selector = '[data-mk-'+mk.events.join('],[data-mk-')+']';
       $(selector).each(function(){
            var $e = $(this);
            $.each(mk.events, function(i){
                var evt = mk.events[i];
                var e = $e.data('mk-'+evt);
                if (!e) return;
                var reg = {
                    key: e == '/' ? ['/'] : e.split('/'),
                    evt: evt,
                    target: $e.data('mk-target'),
                    help: $e.text()
                       || $e.attr('title')
                       || $('[for='+$e.attr('id')+']').text()
                };
                var $g = $e.closest('[data-mk-group]');
                if ($g){
                    reg.group = $g.data('mk-group');
                    mk.groups[reg.group] = 1;
                }
                if (!reg.list){
                    mk.shortcuts.push(reg);
                } else {
                    mk.lists[reg.list] = 1;
                }

                for (var i=0; i < reg.key.length; i++) {
                    Mousetrap.bind(reg.key[i], function(e){
                        if (mk.helpEl){
                            mk.helpEl.modal('hide');
                        }
                        // grab event and simulate it
                        if (reg.target){
                            var $list = $e.prevAll('[data-mk-list]');
                            var $item = $list.find('.mk-focus');
                            if ($item.length == 0){
                                mk.move(1);
                                $item = $list.find('.mk-focus');
                            }
                            if ($item.length != 0){
                                var $target = $item.find(reg.target);
                                if (reg.evt == 'click' && $target.attr('href') ){
                                    // jQuery click events aren't quite real
                                    document.location = $target.attr('href');
                                } else {
                                    $target.trigger(reg.evt);
                                }
                            }
                        } else {
                            if (reg.evt == 'click' && $e.attr('href') ){
                                document.location = $e.attr('href');
                            } else {
                                $e.trigger(reg.evt);
                            }
                        }
                        return false;
                    });
                }
            });
       });
    }
    mk.shortcuts.push({
        key: ['escape'],
        help: 'Back out / close / zoom out',
        group: null
    });

    // What types of events are we going to handler?
    mk.events = [
        'focus',
        'click',
        'disabled',
        'noop'
    ];
    mk.register();

    mk.move = function(delta){

        var $old = $('.mk-focus');
        var $new;

        if ($old.length == 0){
            if (delta > 0){
                $new = $('[data-mk-list]:first > *:first');
            } else {
                $new = $('[data-mk-list]:last > *:last');
            }
        } else {
            if (delta > 0){
                $new = $old.next();
            } else {
                $new = $old.prev();
            }
        }

        $old.removeClass('mk-focus');
        if ($new.length != 0){
            $new.addClass('mk-focus');
            var $w = $(window);
            var off = $new.offset();
            // Is the new item off screen below?
            var below = $w.height() + $w.scrollTop() - off.top;
            if (below < 0){
                window.scrollBy(0, $w.height()/2 - below );
            }
            var above = off.top - $w.scrollTop(); 
            if (above < 0){
                window.scrollBy(0, above - $w.height()/2 );
            }
        }
    };


    if (mk.lists.length != 0){
        // do this for each list!
        $('[data-mk-list]').each(function(i,e){

            var $g = $(e).closest('[data-mk-group]');
            var group;
            if ($g){
                group = $g.data('mk-group');
            }
            mk.shortcuts.push({
                key: ['j'],
                help: 'Move down',
                group: group
            });
            mk.shortcuts.push({
                key: ['k'],
                help: 'Move up',
                group: group
            });
        })
        Mousetrap.bind('j', function(e){
            mk.move(1);
        });
        Mousetrap.bind('k', function(e){
            mk.move(-1);
        });
    }

    Mousetrap.bind('?', function(e){
        // If modal is open then cancel
        if( mk.helpEl && mk.helpEl.css('display') == 'block'){
            return;
        }
        mk.showHelp();
        return false;
    });
    Mousetrap.bindGlobal('escape', function(e){
        var $e = $(e.target);
        var tag = $e.prop("tagName");
        // if we're in an input
        if (tag === 'INPUT' || tag === 'TEXTAREA'){
            $e.blur();
            return false;
        }
    });
    $(document).on('focusin',function(e){
        var $e = $(e.target);
        var $item = $e.closest('[data-mk-list] > *');
        if ($item.length != 0){
            $('.mk-focus').removeClass('mk-focus');
            $item.addClass('mk-focus');
        }
    });

}(jQuery,document));
