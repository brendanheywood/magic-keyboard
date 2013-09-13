;(function($,doc){

    if (!$.magicKeyboard) {
        $.magicKeyboard = {};
    };
    var mk = $.magicKeyboard;

    var $d = $(document);

    $.showHelp = function(){
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
        <div class="modal-footer">\
          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\
        </div>\
      </div><!-- /.modal-content -->\
    </div><!-- /.modal-dialog -->\
  </div><!-- /.modal -->\
');
            var help = '';
            $.each(mk.shortcuts, function(i,e){
                help += '<tr>'
                      + '<td><kbd>'+e.key+'</kbd></td>'
                      + '<td>'+e.help+'</td>'
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
                key: $e.data('mk-'+evt),
                evt: evt,
                list: !!$e.data('mk-list'),
                help: $e.text()
                   || $e.attr('title') 
                   || $('[for='+$e.attr('id')+']').text()
            };
            if (!reg.list)
                mk.shortcuts.push(reg);

            if (reg.evt == 'click'){
                // jQuery click events aren't quite real
                $e.on(reg.evt, function(e){
                    document.location = $(e.target).attr ( 'href' );
                });
            }
            Mousetrap.bind(reg.key, function(e){
                // grab event and simulate it
                $e.trigger(reg.evt);
                return false;
            });
       });
    }
    mk.register('focus');
    mk.register('click');



    Mousetrap.bind('?', function(e){

        // If modal is open then cancel
        if( $.magicKeyboard.helpEl && $.magicKeyboard.helpEl.css('display') == 'block'){
            return;
        }

        $.showHelp();
        return false;

    });


}(jQuery,document));
