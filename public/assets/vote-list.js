$(document).ready(function(){

  $('#getList').on('click', function(){

  });

  $('#addOption').on('click', function(){

    $('.choices').append('<input type="text" class="form-control" id="fieldOpts" name="opts">');

  });

  $('.delete').on('click', function(){
    console.log($(this).text());
    var item = $(this).parent().text().slice(0,-1).replace(/\s/g, "-").replace('?', '%3F');
    console.log(item);


    $.ajax({
      type: 'DELETE',
      url: '/user/polled/' + item,
      success: function(data){
        location.reload();
      }
    });
      });

    $('.bar-inner[data-percent]').each(function(){
      var progress = $(this);
      var percentage = Math.ceil($(this).attr('data-percent'))*10;

      progress.css('width', percentage);
    });

});
