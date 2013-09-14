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

    mk.register = function(evt){
       $('[data-mk-'+evt+']').each(function(){
            var $e = $(this);
            var reg = {
                key: $e.data('mk-'+evt).split(','),
                evt: evt,
                list: !!$e.data('mk-list'),
                help: $e.text()
                   || $e.attr('title') 
                   || $('[for='+$e.attr('id')+']').text()
            };
            if (!reg.list)
                mk.shortcuts.push(reg);

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
            // if where in an input and it's empty then blur it
            if ($e.val() ==''){
                $e.blur();
            // or reset it (default browser behaviour)
            } else {
                $e.val('');
            }
        }
    });


}(jQuery,document));
