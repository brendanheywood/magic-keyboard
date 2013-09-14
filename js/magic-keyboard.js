;(function($,doc){

    if (!$.magicKeyboard) {
        $.magicKeyboard = {};
    };
    var mk = $.magicKeyboard;

    var $d = $(document);

    mk.showHelp = function(){
        if (!mk.helpEl){
            mk.helpEl = $('\
<div class="modal fade" id="magic-kb-help" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">\
    <div class="modal-dialog">\
      <div class="modal-content">\
        <div class="modal-header">\
          <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\
          <h4 class="modal-title">Keyboard Shortcuts <kbd>?</kbd></h4>\
        </div>\
        <div class="modal-body">\
        </div>\
      </div><!-- /.modal-content -->\
    </div><!-- /.modal-dialog -->\
  </div><!-- /.modal -->\
');
            var help = '';
            $.each(mk.shortcuts, function(i,e){
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
                      + (e.list || '')
                      + '</td>'
                      + '</tr>'
            });
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

    mk.register = function(evt){
       $('[data-mk-'+evt+']').each(function(){
            var $e = $(this);
            var e = $e.data('mk-'+evt);
            var reg = {
                key: e == '/' ? ['/'] : e.split('/'),
                evt: evt,
                list: $e.data('mk-list'),
                help: $e.text()
                   || $e.attr('title') 
                   || $('[for='+$e.attr('id')+']').text()
            };
            if (!reg.list){
                mk.shortcuts.push(reg);
            } else {
                mk.lists[reg.list] = 1;
            }

            if (reg.evt == 'click' && $e.attr('href') ){
                // jQuery click events aren't quite real
                $e.on(reg.evt, function(e){
                    document.location = $(e.target).attr ( 'href' );
                });
            }
            for (var i=0; i < reg.key.length; i++) {
                Mousetrap.bind(reg.key[i], function(e){
                    if (mk.helpEl){
                        mk.helpEl.modal('hide');
                    }
                    // grab event and simulate it
                    $e.trigger(reg.evt);
                    return false;
                });
            }
       });
    }
    mk.shortcuts.push({
        key: ['escape'],
        help: 'Back out / close / zoom out'
    });
    mk.register('focus');
    mk.register('click');
    mk.register('disabled');
    mk.register('noop');

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
        $new.addClass('mk-focus');
    };


    if (mk.lists.length != 0){
        // do this for each list!
        mk.shortcuts.push({
            key: ['j'],
            help: 'Move down'
        });
        mk.shortcuts.push({
            key: ['k'],
            help: 'Move up'
        });
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


}(jQuery,document));
