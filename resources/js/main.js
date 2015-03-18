// variables needed for the window hashchange event
var hashHistory = ['step-1'];
var windowBack = true;

$(document).ready(function() {

//DROP DOWN MENU
$('.dropdown-text').click(function() {
  $('.dropdown-content').toggleClass('dropdown-show');
});

$('.dropdown-text').on('tap', function() {
  $('.dropdown-content').toggleClass('dropdown-show');
});



//Payment forms history
$("#checkout-page").on('click', '.data-ajax-url', function(e) {
    //Prevent the hashchange event from firing
    windowBack = false;

    //Set the window location equal to the data-hash attribute
    window.location.hash = $(this).attr("data-hash");
    e.preventDefault();
    hashHistory.push($(this).attr('data-hash'));

    if (window.innerWidth < 991) {
      if($(this).attr('data-hash') == 'step-2'){
        $("html, body").scrollTop(50);  
      }
    }
    

    // Allow the window to go back on hashchange 
    setTimeout(function(){
      windowBack = true;
    }, 50);
});

$(window).on("hashchange", window, function(e) {
  if(hashHistory[hashHistory.length - 2] == 'step-1' && windowBack == true){
    $(document).sendRequest('shop:checkout', {
      update: {
        '#checkout-page': 'shop-checkout'
      },
      extraFields: {
        'nextStep': 'billing_info'
      }
    });
    hashHistory.splice(-2);
    hashHistory.push('step-1');
  }
  else if(hashHistory[hashHistory.length - 2] == 'step-2' && windowBack == true){
    $(document).sendRequest('shop:checkout', {
      update: {
        '#checkout-page': 'shop-checkout'
      },
      extraFields: {
        'nextStep': 'shipping_method'
      }
    });
    hashHistory.splice(-2);
    hashHistory.push('step-2');
  }
  else if(hashHistory[hashHistory.length - 2] == 'step-3' && windowBack == true){
    $(document).sendRequest('shop:checkout', {
      update: {
        '#checkout-page': 'shop-checkout'
      },
      extraFields: {
        'nextStep': 'pay'
      }
    });
    hashHistory.splice(-2);
    hashHistory.push('step-3');
  }
});



//PAY
//Payment forms LEMONSTAND
  $(document).on('change', '#payment_method input', function() {
      $('#payment_form').html('<i class="fa fa-refresh fa-spin"/>');
      $(this).sendRequest('shop:onUpdatePaymentMethod', {              
          update: {
              '#payment_form': 'shop-paymentform'
          }        
      });
  });

//Shipping method update the price
  $(document).on('change', '#shipping-methods input', function() {
    $(this).sendRequest('shop:checkout', {
      update:{
        '#checkout-totals': 'shop-checkout-totals'
      }
    });
  });


//ADDRESS
    $(document).on('click', '.btn-form-mirror', function() {
      if ($(this).data('toggle-mirror') == 'on') {
        $(this).data('toggle-mirror', 'off').find('.fa-check').css('visibility', 'hidden');
        sessionStorage.toggleMirror = 'off';

        $('#shipping-info').each(function (i, div){
          $(div).find('input, select').each(function (j, element){
            $(element).removeClass('disabled');
          });
        });

      } else if ($(this).data('toggle-mirror') == 'off') {
        $(this).data('toggle-mirror', 'on').find('.fa').css('visibility', 'visible');
        sessionStorage.toggleMirror = 'on';
        mirrorAll();

        $('#shipping-info').each(function (i, div){
          $(div).find('input, select').each(function (j, element){
            $(element).addClass('disabled');
          });
        });
      }
    });
    
    // mirror toggle button
    $(window).on('onAjaxAfterUpdate', function() {
      if ($('.btn-form-mirror').length && sessionStorage.toggleMirror == 'off') {
        $('.btn-form-mirror').data('toggle-mirror', 'off').find('.fa').css('visibility', 'hidden');
        $('#shipping-info').addClass('in');
      }
    });
    
    //mirror source and destination fields
    function mirrorFields($mirrorSource, $mirrorTarget, event) {
      $($mirrorSource).each(function(idx) {
        $(this).on(event, function() {  
            var mirrorVal = $(this).val();
            if ($('.btn-form-mirror').data('toggle-mirror') == 'on') {
            $($mirrorTarget + ':eq('+idx+')').val(mirrorVal);     
            }
        });     
      }); 
    }
    
    mirrorFields('#billing-info [data-mirror]', '#shipping-info [data-mirror]', 'keyup keypress blur change');
    //mirrorFields('#billing-info select[data-mirror]', '#shipping-info select[data-mirror]', 'change');
    
    //mirror all fields
    function mirrorAll() {
      $('#billing-info [data-mirror]').each(function(idx) {
          var mirrorVal = $(this).val();
        $('#shipping-info [data-mirror]:eq('+idx+')').val(mirrorVal);     
      }); 
      //trigger change to update the state list
      $('#shipping_country[data-mirror]').trigger('change');
    }
    $(window).load(function() {
      if ($('.btn-form-mirror').data('toggle-mirror') == 'on') {
        mirrorAll();
      }
    });
    
    //country select
    var tracker = false;
    
    $('#billing_country[data-mirror]').on('change', function() {
      if ($('.btn-form-mirror').data('toggle-mirror') == 'on') {
         tracker = true;
        }
    });
    //update shipping only once
    $(window).on('onAfterAjaxUpdate', function(){
      if (tracker == true) {
        $('#shipping_country[data-mirror]').change();
        console.log('ajax done');
        tracker = false;
      }
      
      //force the shiping state to update if it's value is different ie. after a page refresh
      if ($('#shipping_state[data-mirror]').val() != $('#billing_state[data-mirror]').val()) {
        $('#shipping_state[data-mirror]').val($('#billing_state[data-mirror]').val());
      }
    });

//Mobile shipping address functionality
if (window.innerWidth < 991) {
  $('#checkout-page #shipping-info').hide();
  $('.btn-form-mirror').on('click', function() {
    if($('.btn-form-mirror').data('toggle-mirror') == 'off') {
      $('#shipping-info').hide();
    } else if ($('.btn-form-mirror').data('toggle-mirror') == 'on'){
      $('#shipping-info').show();
    }
  });
}

//SEARCH ITEM
  $(document).on('click', '#search-item', function() {
      $('.search-bar').toggleClass("active-search");  
  });
  $(document).on('click', '#normal-carts', function() {
    if( $('.search-bar').hasClass("active-search") ){
      $('.search-bar').removeClass("active-search");
    }else{
      return;
    }
  });

//===============
//! AJAX / Cart    
//===============
var cartFlag = new $.Deferred();

$(document).on('click', '.btn-add-cart', function() {
  cartFlag.resolve();
  
  $(this).prepend('<i class="fa fa-refresh fa-spin"/>');
});

$(document).ajaxComplete(function() {
  $('.btn-add-cart').find('.fa-refresh').remove();
  $.when(cartFlag).then(function() {
    $('#normal-cart').addClass('added');
    setTimeout(function() {
      $('#normal-cart').removeClass('added');
      cartFlag = new $.Deferred();
    }, 500);  
  });
});

$('body').on('click', '.remove-item', function() {
  cartFlag.resolve();
  
  $(this).find('.fa').removeClass('fa-times').addClass('fa-refresh fa-spin');
});

$('body').on('click', '#remove-cart-item', function() {
  cartFlag.resolve();
  
  $(this).find('.fa').removeClass('fa-times').addClass('fa-refresh fa-spin');
});


//CC Validation
$(document).ajaxComplete(function() {
if ('#checkout-page') {

       if ($('.credit-card-input').length) {
              $('.credit-card-input').validateCreditCard(function(result) {
                  if (result.length_valid === true) {
                      $('.credit-card-input').next('label')
                        .html(result.card_type.name).append(' <i class="fa fa-check-circle" />')
                        .parent().removeClass('invalid').addClass('valid');
            } else {
                $('.credit-card-input').keyup(function() {
                    var card = $('.credit-card-input').val();
                    var Numbers = card.substr(0,4);
                    switch(Numbers) {
                      case '': $('.credit-card-input').addClass('defaultPosition').removeClass('va ma mb d a');
                        break;
                      case '4': $('.credit-card-input').addClass('va').removeClass('ma mb d a');
                        break;
                      case '3': $('.credit-card-input').addClass('a').removeClass('ma mb d va');
                        break;
                      case '51':
                      case '52':
                      case '53': 
                      case '54': 
                      case '55': 
                        $('.credit-card-input').addClass('ma').removeClass('va mb d a');
                        break;
                      case '5018': 
                      case '5020': 
                      case '5038': 
                      case '6304': 
                      case '6759': 
                      case '6761': 
                      case '6762': 
                      case '6763': 
                        $('.credit-card-input').addClass('mb').removeClass('va ma d a');
                        break;
                      case '6': $('.credit-card-input').addClass('d').removeClass('va ma mb a');
                        break;
                    }
                }).keyup;
            }
        });
        if ($('.credit-card-input').val() === '') {
           $('.credit-card-input').parent().removeClass('valid invalid');
        }
    }
  
  // $('.fa-question').on({
  //   'mouseenter': function() {
  //     $(this).popover('show');
  //   },
  //   'mouseleave': function() {
  //     $(this).popover('hide');
  //   }
  // });
  var popoverimg = "<img src='//d1ikx7rs2s8wko.cloudfront.net/store-slate-543ef23235dfb/themes/asdfasdf/resources/img/cvn.jpg?1424897548' style='width:100px'>";
  var popbreak = "</br>";
  $('.fa-question').popover({
            trigger: "hover",
            placement: top,
            html: true,
            content: "For MasterCard, Visa, and Discover, the CSC is the last three digits in the signature area on the back of your card. For American Express, it's the four digits on the front of the card." + popbreak + popbreak + popoverimg
  });
}
});
});
