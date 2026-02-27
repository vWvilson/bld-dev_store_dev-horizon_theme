//Version 2
var ScJQuery_QO = null;

var sc_gqorder_app_global = {};

sc_gqorder_app_global.app_options = {};
sc_gqorder_app_global.app_options.JQueryVersion = '1.11.2';//'1.12.2';
sc_gqorder_app_global.app_options.AppBaseURL = '/apps/quick-shop/';
sc_gqorder_app_global.app_options.AppScriptPath = sc_gqorder_app_global.app_options.AppBaseURL + 'scripts/';
sc_gqorder_app_global.app_options.AppFrontPath = sc_gqorder_app_global.app_options.AppBaseURL + 'app-front/';

var MSG_TYPE_NOTICE = 'notice';
var MSG_TYPE_ERROR = 'error';

//**************************mobile detection************************************************************************************/
var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};
/**********************************************************************************************************************************/
/*sc_gqorder_app_global.app_options.other_scripts = [
         , '//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js'
         , sc_gqorder_app_global.app_options.AppScriptPath + 'js/jquery.custombox.js'
         , sc_gqorder_app_global.app_options.AppScriptPath + 'js/s.min.js'
         , sc_gqorder_app_global.app_options.AppScriptPath + 'js/sc-qs-underscore.js'
];*/

//sc_gqorder_app_global.app_options=app_options;

sc_gqorder_app_global.sc_debug = true;
sc_gqorder_app_global.ScQsItems = null;
sc_gqorder_app_global.sc_qs_is_ws_customer=false;



sc_gqorder_app_global.elm_id_last_focus='';
sc_gqorder_app_global.pid_last_sn=-1;
sc_gqorder_app_global.pid_prefix='sc_bof_product_';
sc_gqorder_app_global.vid_prefix='sc_bof_variant_id_';

sc_gqorder_app_global.sp_qs_collection_changed = true;
sc_gqorder_app_global.sp_qs_max_qty = 50;
sc_gqorder_app_global.imgtodrag;

sc_gqorder_app_global.price_with_current_currency = function (price) {
    if (price != '') {
        if (typeof Currency != 'undefined') { //currency exist
            if (Currency.hasOwnProperty('cookie')) {
                var __current_currency = Currency.cookie.read();
                if (__current_currency != null && __current_currency != '' && typeof __current_currency != 'undefined') {
                    if (Currency.format != 'undefined') {
                        var _shop_currency_format = Currency.format;
                        var __currency__format = SC_moneyFormats[__current_currency].money_format;
                        if (Currency.format == 'money_with_currency_format') {
                            __currency__format = SC_moneyFormats[__current_currency].money_with_currency_format;
                        }
                        //price = price * 100;
                        price = Currency.convert(price, store_default_currency, __current_currency);
                        return SC_Shopify.formatMoney(price, __currency__format);
                    }
                }
            }

        }
        return SC_Shopify.formatMoney(price,store_money_format);
    }
    return '';
};

sc_gqorder_app_global.bof_init_elements_events=function(){
    ScJQuery_QO('.container.sc-qs').on('focus','[scinputtype="sc-qs-bof-product"]',function(){
        sc_gqorder_app_global.bof_product_input_on_focus(this);
    });
    ScJQuery_QO('#btn-add-row').click(function(){
        sc_gqorder_app_global.add_bof_row();
    });
    ScJQuery_QO('#sc-qs-bof-btn-go-to-cart').click(function(){
        sc_gqorder_app_global.bof_on_go_to_cart(this);
    });
    ScJQuery_QO('#sc-qs-bof-btn-clear-cart').click(function(){
        sc_gqorder_app_global.bof_on_clear_cart(this);
    });
    ScJQuery_QO('#sc-qs-bof-btn-reset-form').click(function(){
        sc_gqorder_app_global.bof_on_reset_form(this);
    });
    ScJQuery_QO('#sc-qs-bof-btn-add-to-cart').click(function(){
        sc_gqorder_app_global.bof_on_add_to_cart(this);
    });
    
    ScJQuery_QO('.container.sc-qs').on('blur','[scinputtype="sc-qs-bof-qty"]',function(){
        sc_gqorder_app_global.bof_qty_input_on_blur(this);
    });
    ScJQuery_QO('.container.sc-qs').on('input','[scinputtype="sc-qs-bof-qty"]',function(){
        sc_gqorder_app_global.bof_qty_input_on_input(this);
    });

    ScJQuery_QO('.container.sc-qs').on('click','[scinputtype="sc-qs-bof-remove"]',function(evt){
        evt.preventDefault();
        sc_gqorder_app_global.bof_row_on_remove(this);
    });
};

sc_gqorder_app_global.bof_product_input_on_focus=function(evt_elm){
    console.log(ScJQuery_QO(evt_elm).attr('id'));
        sc_gqorder_app_global.elm_id_last_focus=ScJQuery_QO(evt_elm).attr('id');
};
sc_gqorder_app_global.bof_on_go_to_cart=function(evt_elm){
    window.location='/cart';
};
sc_gqorder_app_global.bof_on_clear_cart=function(evt_elm){
    SC_Shopify.clear();
};
sc_gqorder_app_global.bof_on_reset_form=function(evt_elm){
    ScJQuery_QO('[scinputtype="sc-qs-bof-qty"]').each(function(){
        var sn=ScJQuery_QO(this).attr('scbofrowindex');
        sc_gqorder_app_global.clear_bof_row(sn,true);
    });
    sc_gqorder_app_global.change_total_qty();
    sc_gqorder_app_global.change_total_price();
};

sc_gqorder_app_global.bof_on_add_to_cart=function(evt_elm){
    var counter=0;
    var delay=1000;


    var items_add_to_cart=[];
    ScJQuery_QO('[scinputtype="sc-qs-bof-qty"]').each(function(){
        var sn=ScJQuery_QO(this).attr('scbofrowindex');
        var variant_id=ScJQuery_QO('[scbofrowindex="'+sn+'"] [scinputtype="sc-qs-bof-product"]').attr('variantid');
        var qty=ScJQuery_QO('[scbofrowindex="'+sn+'"] [scinputtype="sc-qs-bof-qty"]').val();
        if(variant_id!='' && qty!=''){
            items_add_to_cart.push({variant_id:variant_id,qty:qty});
        }
    });

    ScJQuery_QO.each(items_add_to_cart,function(i,item){
        setTimeout(function(){
            SC_Shopify.addItem(item.variant_id,item.qty,function(){
                counter+=1;
                if(counter==items_add_to_cart.length){
                    window.location='/cart';
                }       
            });
        },delay);
        delay+=1000;
    });
};

sc_gqorder_app_global.bof_qty_input_on_blur=function(evt_elm){
    var sn=ScJQuery_QO(evt_elm).attr('scbofrowindex');
    var qty=ScJQuery_QO(evt_elm).val();
    if(qty!='' && ScJQuery_QO.isNumeric(qty)){
        qty=parseInt(qty);
        var price=parseFloat(ScJQuery_QO('[scinputtype="sc-qs-bof-ws"][scbofrowindex="'+sn+'"]').val());
        ScJQuery_QO('[scinputtype="sc-qs-bof-total"][scbofrowindex="'+sn+'"]').val((qty*price).toFixed(2));
    }
    sc_gqorder_app_global.change_total_qty();
    sc_gqorder_app_global.change_total_price();
    //alert(sn);
};

sc_gqorder_app_global.bof_qty_input_on_input=function(evt_elm){
    var sn=ScJQuery_QO(evt_elm).attr('scbofrowindex');
    var qty=ScJQuery_QO(evt_elm).val();
    var stock=ScJQuery_QO(evt_elm).attr('available');
    if(stock!=''){
        if(qty!=''){
            if(!ScJQuery_QO.isNumeric(qty)){
                alert("Invalid Quantity Input");
                ScJQuery_QO(evt_elm).val(1);
                sc_gqorder_app_global.change_total_qty();
                return;
            }
            qty=parseInt(qty);
            stock=parseInt(ScJQuery_QO(evt_elm).attr('available'));
            if(qty > stock){
                alert("Available Quantity: "+stock);
                ScJQuery_QO(evt_elm).val(stock);
                sc_gqorder_app_global.change_total_qty();
                return;
            }
        }
    }

    //alert(sn);
};

sc_gqorder_app_global.bof_row_on_remove=function(evt_elm){
    var sn=ScJQuery_QO(evt_elm).attr('scbofrowindex');
    ScJQuery_QO('div.row[scbofrowindex="'+sn+'"').remove();
    sc_gqorder_app_global.change_total_qty();
    sc_gqorder_app_global.change_total_price();
};


sc_gqorder_app_global.add_bof_row=function(removable){
    if('undefined'==typeof removable){
        removable=true;
    }
    
    var tpl = __sc__.template($('#tpl-bof-row').html());
    sc_gqorder_app_global.pid_last_sn+=1;
    ScJQuery_QO('.container.sc-qs .row.container-btn-add-row').before(tpl({sn:(sc_gqorder_app_global.pid_last_sn),removable:removable}));
    sc_gqorder_app_global.init_bof_autocompleter(sc_gqorder_app_global.pid_last_sn);
};

sc_gqorder_app_global.clear_bof_row=function(sn,clear_all){
    if(clear_all===true){
        ScJQuery_QO('[scbofrowindex="'+sn+'"] [scinputtype="sc-qs-bof-product"]').val('');    
        ScJQuery_QO('[scbofrowindex="'+sn+'"] [scinputtype="sc-qs-bof-product"]').attr('variantid','');    
    }
    ScJQuery_QO('[scbofrowindex="'+sn+'"] [scinputtype="sc-qs-bof-lbl-stock"]').html('');
    ScJQuery_QO('[scbofrowindex="'+sn+'"] [scinputtype="sc-qs-bof-qty"]').attr('disabled','disabled');
    ScJQuery_QO('[scbofrowindex="'+sn+'"] [scinputtype="sc-qs-bof-qty"]').val('');    
    ScJQuery_QO('[scbofrowindex="'+sn+'"] [scinputtype="sc-qs-bof-qty"]').attr('available','');
    
    ScJQuery_QO('[scbofrowindex="'+sn+'"] [scinputtype="sc-qs-bof-ws"]').val('');
    ScJQuery_QO('[scbofrowindex="'+sn+'"] [scinputtype="sc-qs-bof-total"]').val('');
};
sc_gqorder_app_global.change_total_qty=function(){
    var total_qty=0;
    ScJQuery_QO('[scinputtype="sc-qs-bof-qty"]').each(function(){
        var qty=ScJQuery_QO(this).val();
        if(ScJQuery_QO.isNumeric(qty)){
            qty=parseInt(qty);
            total_qty+=qty;
        }
    });
    ScJQuery_QO('#sc-qs-bof-total-qty').html(total_qty);
};
sc_gqorder_app_global.change_total_price=function(){
    var total_price=0;
    ScJQuery_QO('[scinputtype="sc-qs-bof-total"]').each(function(){
        var price=ScJQuery_QO(this).val();
        if(ScJQuery_QO.isNumeric(price)){
            price=parseFloat(price);
            total_price+=price;
        }
    });
    ScJQuery_QO('#sc-qs-bof-grand-total-price').html(total_price.toFixed(2));
};
sc_gqorder_app_global.init_bof_autocompleter=function(elm_sn){
    var options = {
    url: function(phrase) {
        return "/search?type=product&view=sc-qs-bof-5198&q="+phrase;
    },
    listLocation: "items",
    getValue: "variant_title",
    requestDelay: 3000,
    list: {

        onChooseEvent: function() {
            //console.log(this);
            var item=ScJQuery_QO('#'+sc_gqorder_app_global.elm_id_last_focus).getSelectedItemData();
            var variant_id = item.variant_id;
            ScJQuery_QO('#'+sc_gqorder_app_global.elm_id_last_focus).attr('variantid',variant_id);
            var sn=sc_gqorder_app_global.elm_id_last_focus.replace(sc_gqorder_app_global.pid_prefix,'');
            sc_gqorder_app_global.clear_bof_row(sn);
            var available_text='Available: '+item.stock;
            var is_unlimited_stock=false;
            if(item.inventory_policy=='continue' || item.inventory_management!='shopify'){
                is_unlimited_stock=true;
            }
            if(is_unlimited_stock){
                available_text='Available: Unlimited';
            }
            ScJQuery_QO('[scbofrowindex="'+sn+'"] [scinputtype="sc-qs-bof-lbl-stock"]').html(available_text);
            if(item.is_available){
                ScJQuery_QO('[scbofrowindex="'+sn+'"] [scinputtype="sc-qs-bof-qty"]').val(1);
                ScJQuery_QO('[scbofrowindex="'+sn+'"] [scinputtype="sc-qs-bof-qty"]').removeAttr('disabled');
                if(!is_unlimited_stock){
                    //ScJQuery_QO('[scbofrowindex="'+sn+'"] [scinputtype="sc-qs-bof-qty"]').val(item.stock);
                    ScJQuery_QO('[scbofrowindex="'+sn+'"] [scinputtype="sc-qs-bof-qty"]').attr('available',item.stock);
                }
                
                //console.log(variant_id);
                
                
                
                if (sc_gqorder_app_global.sc_qs_is_ws_customer) {
                    var sc_ws_selected_product=item.product;
                    sc_ws_selected_product.collections=item.collections;
                    sc_gws_app_global.get_discount_rules(function(discount_rules){
                        var discount_rule=sc_gws_app_global.get_discount_rule(sc_ws_selected_product,variant_id);
                        console.log(discount_rule);
                        
                        var d_variant=sc_gws_app_global.get_discounted_price(discount_rule,item.variant);
                        console.log('discount Price: '+JSON.stringify(d_variant));
                        ScJQuery_QO('[scbofrowindex="'+sn+'"] [scinputtype="sc-qs-bof-ws"]').val((d_variant.ws_price/100).toFixed(2));
                        
                        var qty=parseInt(ScJQuery_QO('[scbofrowindex="'+sn+'"] [scinputtype="sc-qs-bof-qty"]').val());
                        ScJQuery_QO('[scbofrowindex="'+sn+'"] [scinputtype="sc-qs-bof-total"]').val(((qty*d_variant.ws_price)/100).toFixed(2));
                        

                    });
                }
                else{
                    ScJQuery_QO('[scbofrowindex="'+sn+'"] [scinputtype="sc-qs-bof-ws"]').val((item.product.price/100).toFixed(2));
                    
                    var qty=parseInt(ScJQuery_QO('[scbofrowindex="'+sn+'"] [scinputtype="sc-qs-bof-qty"]').val());
                    ScJQuery_QO('[scbofrowindex="'+sn+'"] [scinputtype="sc-qs-bof-total"]').val(((qty*item.product.price)/100).toFixed(2));
                    
                    
                }
                
            }
            else{
                ScJQuery_QO('[scbofrowindex="'+sn+'"] [scinputtype="sc-qs-bof-qty"]').attr('available',0);
            }
            
            ScJQuery_QO('[scbofrowindex="'+sn+'"] [scinputtype="sc-qs-bof-sku"]').val(item.sku);
            
            sc_gqorder_app_global.change_total_qty();
            sc_gqorder_app_global.change_total_price();
        }
    },
    template: {
		type: "iconLeft",
		fields: {
			iconSrc: "thumbnail_url"
		}
	}
};

//ScJQuery_QO('[scinputtype="sc-qs-bof-product"]').easyAutocomplete(options);
ScJQuery_QO('#sc_bof_product_'+elm_sn).easyAutocomplete(options);
};

//init_bof_autocompleter(0);
//init_bof_autocompleter(1);


sc_gqorder_app_global.qs_page_table_on_sort=function(this_obj){
    var sort = ScJQuery_QO(this_obj).attr('data-sort');
    var sorting = ScJQuery_QO(this_obj).attr('data-sorting');
    switch(sort) {
            case "name":
                    sc_gqorder_app_global.ScQsItems.sort(function(itemA, itemB) {
                            var nameA = itemA.title.toUpperCase(); // ignore upper and lowercase
                            var nameB = itemB.title.toUpperCase(); // ignore upper and lowercase
                            if(nameA < nameB) {
                                    if(sorting == "up") {
                                            return -1;
                                    }
                                    else {
                                            return 1;
                                    }
                            }
                            if(nameA > nameB) {
                                    if(sorting == 'up') {
                                            return 1;
                                    }
                                    else {
                                            return -1;
                                    }
                            }
                            // names must be equal
                            return 0;
                    });

                    break;
            case "price":
                    sc_gqorder_app_global.ScQsItems.sort(function(itemA, itemB) {
                            if(itemA.price < itemB.price) {
                                    if(sorting == "up") {
                                            return -1;
                                    }
                                    else {
                                            return 1;
                                    }
                            }
                            if(itemA.price > itemB.price) {
                                    if(sorting == 'up') {
                                            return 1;
                                    }
                                    else {
                                            return -1;
                                    }
                            }
                            // names must be equal
                            return 0;
                    });
                    break;
    }
    ;
    if(sorting == 'up') {
            ScJQuery_QO(this_obj).attr('data-sorting', 'down');
    }
    else {
            ScJQuery_QO(this_obj).attr('data-sorting', 'up');
    }
    ScJQuery_QO(".sc-shopify-qs-item-row").remove();
    sc_gqorder_app_global.LoadProducts(Object.assign([], sc_gqorder_app_global.ScQsItems));
    sc_gqorder_app_global.bind_dynamic_control_events();
};

sc_gqorder_app_global.qs_page_ddl_collection_on_change=function(evt_elm){
    if(sc_gqorder_app_global.sp_qs_collection_changed) {
            if(ScJQuery_QO('#sc_qs_ddl_collection').val() != "-1")
                    ScJQuery_QO('#qs-search').val('');
                
            /*ScJQuery_QO('#sc_custom_pagination').html('');
            ScJQuery_QO('#sc_custom_pagination_footer').html('');*/
            
            sc_gqorder_app_global.ShowSearchResult(1, sc_gqorder_app_global.InitializeAllPaginations);
    }
};

sc_gqorder_app_global.qs_page_btn_search_on_click=function(evt_elm){
    ///ScJQuery_QO('#qs-search').autocomplete('close');//Tvr-ac;
    sc_gqorder_app_global.sp_qs_collection_changed = false;
    ScJQuery_QO('#sc_qs_ddl_collection').val('-1');
    
    /*ScJQuery_QO('#sc_custom_pagination').html('');
    ScJQuery_QO('#sc_custom_pagination_footer').html('');*/
            
    sc_gqorder_app_global.ShowSearchResult(1, sc_gqorder_app_global.InitializeAllPaginations);
    return false;
};
/*sc_gqorder_app_global.qs_page_search_input_on_keypress=function(evt_elm){
    if(e.which == 13)
        ScJQuery_QO('#btnSearch').click();
};*/

sc_gqorder_app_global.qs_page_qty_on_plus_minus=function(this_btn){    
    var qty_container = ScJQuery_QO(this_btn).parent('.sc-qs-quantity-container');
    var qty_input = ScJQuery_QO(qty_container).find('.sc-qs-quantity');
    var curr_qty = parseInt(ScJQuery_QO(qty_input).val());
    if(ScJQuery_QO(this_btn).hasClass('sc-qs-minus')) {
            if(curr_qty < 2) {
                    ScJQuery_QO(qty_input).val(1);
            }
            else {
                    ScJQuery_QO(qty_input).val(--curr_qty);
            }
    }
    if(ScJQuery_QO(this_btn).hasClass('sc-qs-plus')) {
            ScJQuery_QO(qty_input).val(++curr_qty);
    }
};

sc_gqorder_app_global.bind_dynamic_control_events=function() {
        if(sc_gqorder_app_global.sc_debug)
                console.log('ScQS: sc_gqorder_app_global.bind_dynamic_control_events();');
        ScJQuery_QO(".sc-shopify-qs-p-details").on('click', function() {
                sc_gqorder_app_global.LoadProductDetails(this);
        });

        ScJQuery_QO(".sc-shopify-qs-show-variant").on('click', function(e) {
                e.preventDefault();
                sc_gqorder_app_global.ShowVariantPopup(this);
        });

        ScJQuery_QO(".sc-shopify-qs-add-to-cart-list").on('click', function() {
                sc_gqorder_app_global.AddToCartList(this);
        });
}

sc_gqorder_app_global.AnimateAddToCart=function() {
        if(sc_gqorder_app_global.sc_debug)
                console.log('ScQS: sc_gqorder_app_global.AnimateAddToCart();');

        var cart = ScJQuery_QO('.sc_qs_cart_amount');
        if(sc_gqorder_app_global.imgtodrag) {
                if(typeof sc_gqorder_app_global.imgtodrag.clone == 'function') {
                        var imgclone = sc_gqorder_app_global.imgtodrag.clone()
                         .offset({
                                 top: sc_gqorder_app_global.imgtodrag.offset().top,
                                 left: sc_gqorder_app_global.imgtodrag.offset().left
                         })
                         .css({
                                 opacity: '1',
                                 position: 'absolute',
                                 height: '100px',
                                 width: '100px',
                                 'z-index': '99999'
                         })
                         .appendTo(ScJQuery_QO('body'))
                         .animate({
                                 top: cart.offset().top,
                                 left: cart.offset().left,
                                 width: 75,
                                 height: 75
                         },
                                600,
                                'linear', //'easeInOutExpo',
                                function() {
                                        sc_gqorder_app_global.imgtodrag = null;
                                        $(this).remove();
                                }
                         );
                }

                if(typeof cart.effect == 'function') {
                        setTimeout(function() {
                                cart.effect("shake", {times: 2}, 200);
                        }, 1500);
                }
        }
};

sc_gqorder_app_global.AddToCartList=function(obj) {
    if(sc_gqorder_app_global.sc_debug)
            console.log('ScQS: sc_gqorder_app_global.AddToCartList();');

    var varID = ScJQuery_QO(obj).data("varid");
    
    
    //var qty = isMobile.any() ? ScJQuery_QO(obj).parent().parent().find(".sc-qs-mobile-quantity").val() : ScJQuery_QO(obj).closest(".sc-shopify-qs-item-row").find(".sc-qs-quantity").val();
    //sc_gqorder_app_global.imgtodrag = isMobile.any() ? ScJQuery_QO(obj).parent().parent().parent().parent().find("img").eq(0) : ScJQuery_QO(obj).closest(".sc-shopify-qs-item-row").find("img").eq(0);
        
    /*var qty=1;
    if(ScJQuery_QO(obj).parent().parent().find(".sc-qs-mobile-quantity:visible").length > 0){
        qty=ScJQuery_QO(obj).parent().parent().find(".sc-qs-mobile-quantity:visible").val();
    }
    else{
        qty=ScJQuery_QO(obj).closest(".sc-shopify-qs-item-row").find(".sc-qs-quantity:visible").val();
    }*/
    
    var qty=1;
    if(ScJQuery_QO(obj).hasClass('qs-mobile-action-button')){
        qty=ScJQuery_QO(obj).parent().parent().find(".sc-qs-mobile-quantity").val();
    }
    else{
        qty=ScJQuery_QO(obj).parent().parent().find(".sc-qs-quantity").val();
    }
    
    if(ScJQuery_QO(obj).parent().parent().parent().parent().find("img").eq(0).length > 0){
        sc_gqorder_app_global.imgtodrag=ScJQuery_QO(obj).parent().parent().parent().parent().find("img").eq(0);
    }
    else{
        sc_gqorder_app_global.imgtodrag=ScJQuery_QO(obj).closest(".sc-shopify-qs-item-row").find("img").eq(0);
    }
        
    ScJQuery_QO(obj).attr('disabled', 'disabled');
    ScJQuery_QO(obj).removeClass('sc-qs-item-added').addClass("sc-qs-item-adding");
    sc_gqorder_app_global.AddToCart(varID, qty);
};

sc_gqorder_app_global.AddToCartPopup=function(obj) {
    if(sc_gqorder_app_global.sc_debug)
            console.log('ScQS: sc_gqorder_app_global.AddToCartPopup();');

    var varID = ScJQuery_QO(obj).data("varid");
    var qty = ScJQuery_QO("#ddlPopQty").val();

    //ScJQuery_QO.fn.custombox('close');
    var jQuery_CustomBox = get_jquery_instance_of_custombox_plugin();
    jQuery_CustomBox.fn.custombox('close');

    sc_gqorder_app_global.imgtodrag = ScJQuery_QO(".sc-shopify-qs-item-row[data-id=" + ScJQuery_QO(obj).data("id") + "]").find("img").eq(0);
    sc_gqorder_app_global.AddToCart(varID, qty);
};
sc_gqorder_app_global.AddToCart=function(varID, qty) {
    if(sc_gqorder_app_global.sc_debug)
            console.log('ScQS: sc_gqorder_app_global.AddToCart();');

    SC_Shopify.addItem(varID, qty, sc_gqorder_app_global.CartItemAdded);
};
sc_gqorder_app_global.CartItemAdded=function(line_item) {
    if(sc_gqorder_app_global.sc_debug)
            console.log('ScQS: sc_gqorder_app_global.CartItemAdded();');
    var variant_id = line_item.id;
    ScJQuery_QO('.sc-shopify-qs-add-to-cart-list[data-varid=' + variant_id + ']').removeClass('sc-qs-item-adding');
    ScJQuery_QO('.sc-shopify-qs-add-to-cart-list[data-varid=' + variant_id + ']').addClass("sc-qs-item-added");
    ScJQuery_QO('.sc-shopify-qs-add-to-cart-list[data-varid=' + variant_id + ']').removeAttr('disabled');
    sc_gqorder_app_global.AnimateAddToCart();
    SC_Shopify.getCart(sc_gqorder_app_global.GetCartObject);
};

sc_gqorder_app_global.GetCartObject=function(cart) {
        if(sc_gqorder_app_global.sc_debug)
                console.log('ScQS: sc_gqorder_app_global.GetCartObject();');

        if(sc_gqorder_app_global.sc_qs_is_ws_customer){
            sc_gws_app_global.get_discount_rules(function(discount_rules){
                sc_gws_app_global.get_cart_prices(function(ws_cart){
                    console.log(ws_cart);
                    ScJQuery_QO("#sc_qs_cart_price").html(cart.item_count + " Items<br/>" + sc_gqorder_app_global.price_with_current_currency(ws_cart.ws_subtotal));
                });
            });
        }
        else{
            var total_price = 0.0;
            ScJQuery_QO.each(cart.items, function(index, item) {
                total_price = total_price + item.line_price;
            });
            ScJQuery_QO("#sc_qs_cart_price").html(cart.item_count + " Items<br/>" + sc_gqorder_app_global.price_with_current_currency(total_price));
        }
};

sc_gqorder_app_global.LoadProductDetails=function(clickedItem) {
        if(sc_gqorder_app_global.sc_debug)
                console.log('ScQS: sc_gqorder_app_global.LoadProductDetails();');

        ScJQuery_QO(".res-modal-header h4").html("Product Details Loading... <img src=\"" + sc_gqorder_app_global.app_options.AppScriptPath + "images/loading-2.gif\" style=\"width:25px;height:25px;\" />");
        ScJQuery_QO(".res-modal-body").html("");

        var item = ScJQuery_QO(clickedItem).closest(".sc-shopify-qs-res-row");

        var jQuery_CustomBox = get_jquery_instance_of_custombox_plugin();
        //ScJQuery_QO.fn.custombox(clickedItem, {
        jQuery_CustomBox.fn.custombox(clickedItem, {
                escKey: true,
                complete: function() {
                        ScJQuery_QO.ajax({
                                type: 'POST',
                                url: sc_gqorder_app_global.app_options.AppFrontPath + 'quick_order/get_product_details/',
                                data: {product_id: ScJQuery_QO(item).data("id")},
                                dataType: 'html',
                                success: function(data) {
                                        ScJQuery_QO(".res-modal-body").html(data);
                                        ScJQuery_QO(".res-modal-header h4").html(p_title);
                                        ScJQuery_QO(".sc-shopify-qs-res-thumb").on('click', function() {
                                                sc_gqorder_app_global.ShowProdImage(this);
                                        });
                                }
                        });

                        ScJQuery_QO(".sc-shopify-qs-close").on('click', function() {
                                //ScJQuery_QO.fn.custombox('close');
                                var jQuery_CustomBox = get_jquery_instance_of_custombox_plugin();
                                jQuery_CustomBox.fn.custombox('close');
                        });
                }
        });
        //e.preventDefault();
};
sc_gqorder_app_global.ShowProdImage=function(clickedImg) {
        if(sc_gqorder_app_global.sc_debug)
                console.log('ScQS: sc_gqorder_app_global.ShowProdImage();');

        ScJQuery_QO(".sc-shopify-qs-res-img-lg").attr("src", ScJQuery_QO(clickedImg).attr("src"));
        ScJQuery_QO(".sc-shopify-qs-res-dv-thumb ul li").removeClass("active");
        ScJQuery_QO(clickedImg).closest("li").addClass("active");
};

/*sc_gqorder_app_global.ShowVariantPopup=function(clickedItem) {

        if(sc_gqorder_app_global.sc_debug)
                console.log('ScQS: sc_gqorder_app_global.ShowVariantPopup();');

        ScJQuery_QO('.res-modal-header h4').html("Product Details Loading... <img src=\"" + sc_gqorder_app_global.app_options.AppScriptPath + "images/loading-2.gif\" style=\"width:25px;height:25px;\" />");
        ScJQuery_QO(".res-modal-body").html('');

        //var item = ScJQuery_QO(clickedItem).closest('.sc-shopify-qs-item-row');

        var jQuery_CustomBox = get_jquery_instance_of_custombox_plugin();
        //ScJQuery_QO.fn.custombox(clickedItem, {
        jQuery_CustomBox.fn.custombox(clickedItem, {
                escKey: true,
                complete: function() {
                        var product_id = ScJQuery_QO(clickedItem).data("pid");
                        var product = null;
                        ScJQuery_QO(sc_gqorder_app_global.ScQsItems).each(function(index, item) {
                                if(item.id == product_id) {
                                        product = item;
                                }
                        });
                        if(product != null) {
                                
								//ops
								var template_name = isMobile.any() ? "#sc-qs-tmpl-popup-mobile" : "#sc-qs-tmpl-popup";
								
								var popup_body_template = __sc__.template($(template_name).text());
                                console.log(product);
                                var popup_body = popup_body_template(product);
                                ScJQuery_QO('#s_shopify_qs_dvProductDetails .res-modal-header h4').html(product.title);
                                ScJQuery_QO("#s_shopify_qs_dvProductDetails .res-modal-body").empty().html(popup_body);
                                ScJQuery_QO(".sc-shopify-qs-res-table-body .sc-shopify-qs-add-to-cart-list").on('click', function() {
                                        sc_gqorder_app_global.AddToCartList(this);
                                });
                                console.log(popup_body);
                        }

                        ScJQuery_QO('.sc-shopify-qs-close').on('click', function() {
                                //ScJQuery_QO.fn.custombox('close');
                                var jQuery_CustomBox = get_jquery_instance_of_custombox_plugin();
                                jQuery_CustomBox.fn.custombox('close');
                        });
                }
        });
};*/

sc_gqorder_app_global.ShowVariantPopup=function(clickedItem) {

        if(sc_gqorder_app_global.sc_debug)
                console.log('ScQS: sc_gqorder_app_global.ShowVariantPopup();');

        ScJQuery_QO('.res-modal-header h4').html("Product Details Loading... <img src=\"" + sc_gqorder_app_global.app_options.AppScriptPath + "images/loading-2.gif\" style=\"width:25px;height:25px;\" />");
        ScJQuery_QO(".res-modal-body").html('');

        //var item = ScJQuery_QO(clickedItem).closest('.sc-shopify-qs-item-row');

        var jQuery_CustomBox = get_jquery_instance_of_custombox_plugin();
        //ScJQuery_QO.fn.custombox(clickedItem, {
        jQuery_CustomBox.fn.custombox(clickedItem, {
                escKey: true,
                complete: function() {
                        var product_id = ScJQuery_QO(clickedItem).data("pid");
                        var product = null;
                        ScJQuery_QO(sc_gqorder_app_global.ScQsItems).each(function(index, item) {
                                if(item.id == product_id) {
                                        product = item;
                                }
                        });
                        if(product != null) {                          
                          var popup_body_template = __sc__.template($("#sc-qs-tmpl-popup").text());
                          var popup_body_template_mobile = __sc__.template($("#sc-qs-tmpl-popup-mobile").text());
                          
                          var popup_body = popup_body_template(product);
                          var popup_body_mobile = popup_body_template_mobile(product);
                          
                          
                                ScJQuery_QO('#s_shopify_qs_dvProductDetails .res-modal-header h4').html(product.title);
                          
                          
                                ScJQuery_QO("#s_shopify_qs_dvProductDetails .res-modal-body.desktop_view").empty().html(popup_body);
                          		ScJQuery_QO("#s_shopify_qs_dvProductDetails .res-modal-body.mobile_view").empty().html(popup_body_mobile);
                          
                          
                                ScJQuery_QO(".sc-shopify-qs-res-table-body .sc-shopify-qs-add-to-cart-list").on('click', function() {
                                        sc_gqorder_app_global.AddToCartList(this);
                                });
                                console.log(popup_body);
                        }

                        ScJQuery_QO('.sc-shopify-qs-close').on('click', function() {
                                //ScJQuery_QO.fn.custombox('close');
                                var jQuery_CustomBox = get_jquery_instance_of_custombox_plugin();
                                jQuery_CustomBox.fn.custombox('close');
                        });
                }
        });
};

sc_gqorder_app_global.GetSearchURL=function(page) {
        if(sc_gqorder_app_global.sc_debug)
                console.log('ScQS: sc_gqorder_app_global.GetSearchURL();');

        //Alt: Search by JS
        var collect_id = ScJQuery_QO('#sc_qs_ddl_collection').val();
        var search_url = '';
        var searchString = ScJQuery_QO.trim(ScJQuery_QO('#qs-search').val()).replace('Enter search terms', '').replace(' ', '+');
        var sort_by=ScJQuery_QO('#sc_qs_ddl_collection_sort_by').val();
        if(sort_by==''){
          sort_by=sc_qo_default_sort_by;
        }
        
        ScJQuery_QO('#div_sc_qs_ddl_collection_sort_by').hide();
        
        if(collect_id=='-1' && searchString==''){
            search_url = "/collections/all?view=sc-qs-5198&sort_by="+sort_by+"&page=" + page;
            ScJQuery_QO('#div_sc_qs_ddl_collection_sort_by').show();
            return search_url;
        }

        if(collect_id != "-1"){
            search_url = "/collections/" + collect_id + "?view=sc-qs-5198&sort_by="+sort_by+"&page=" + page;
            ScJQuery_QO('#div_sc_qs_ddl_collection_sort_by').show();
        }                
        else {
                //var searchString = ScJQuery_QO.trim(ScJQuery_QO('#qs-search').val()).replace('Enter search terms', '').replace(' ', '+');
                var searchWithField = "";
                if(ScJQuery_QO("#sc-qs-specific-fields").length > 0 && ScJQuery_QO("#sc-qs-specific-fields").val() != -1) {
                        searchWithField = ScJQuery_QO("#sc-qs-specific-fields").val() + ":";
                }
                searchString = (searchString != '') ? ('*' + searchString + '*') : '*';

                search_url = '/search?q=' + searchWithField + searchString + '&type=product&view=sc-qs-5198&page=' + +page;
				
        }
        return search_url;
};

sc_gqorder_app_global.PaginateButtonAction=function(currentPage) {
	var total = ScJQuery_QO("#s_shopify_qs_hdnTotalProducts").val();
	var per_page = ScJQuery_QO('#s_shopify_qs_hdnPageSize').val();
        //console.log("HELLO HELLO: "+total);
	if(parseInt(total) > 0){
		var total_no_of_page = Math.ceil(total / per_page);
		if(parseInt(total_no_of_page) > 1){
			if(parseInt(currentPage) > 1) {
				if(parseInt(currentPage) == parseInt(total_no_of_page)){
					setTimeout(function(){ 
						ScJQuery_QO("#sc_custom_pagination > li").last().addClass("sc-disabled");
						ScJQuery_QO("#sc_custom_pagination_footer > li").last().addClass("sc-disabled");
					}, 1000)
					
				}
			} else {
				setTimeout(function(){ 
						ScJQuery_QO("#sc_custom_pagination > li").first().addClass("sc-disabled");
						ScJQuery_QO("#sc_custom_pagination_footer > li").first().addClass("sc-disabled");
				}, 1000)
			}	
		} else {
                    console.log("HELLO HELLO");
			setTimeout(function(){ 
				ScJQuery_QO(".sc_custom_pagination").hide();
			}, 1000);
		}
	}
};

/*sc_gqorder_app_global.LoadProducts=function(result, callback) {
    if(sc_gqorder_app_global.sc_debug)
            console.log('ScQS: sc_gqorder_app_global.LoadProducts();');

    //ScJQuery_QO('.sc-shopify-qs-prod-search').show(); // TH

    var cur_product = null;
    if(result != null && result.length > 0) {
            cur_product = result[0];
            result.splice(0, 1)
    }
    if(cur_product != null) {
        //console.log(cur_product);


        if (sc_gqorder_app_global.sc_qs_is_ws_customer) {
            //console.log('sc_gqorder_app_global.sc_qs_is_ws_customer: '+sc_gqorder_app_global.sc_qs_is_ws_customer);
            //var sc_ws_selected_product=cur_product;
            //sc_ws_selected_product.collections=cur_product.collections;
            sc_gws_app_global.get_discount_rules(function(discount_rules){

                for(i=0;i<cur_product.variants.length;i++){
                    //console.log('ID: '+cur_product.variants.id);
                    var discount_rule=sc_gws_app_global.get_discount_rule(cur_product,cur_product.variants[i].id);
                    //console.log(discount_rule);

                    var d_variant=sc_gws_app_global.get_discounted_price(discount_rule,cur_product.variants[i]);
                    //console.log('discount Price: '+JSON.stringify(d_variant));

                    cur_product.variants[i].ws_price=d_variant.ws_price;
                    cur_product.variants[i].display_price=d_variant.ws_price;
                    //cur_product.variants[i].org_price=cur_product.variants[i].price;
                    //cur_product.variants[i].price=d_variant.ws_price;
                }

                if(cur_product.variants.length==1 && cur_product.variants[0].title=='Default Title'){
                    cur_product.ws_price=cur_product.variants[0].ws_price;
                    cur_product.display_price=cur_product.variants[0].ws_price;
                    //cur_product.org_price=cur_product.variants[0].org_price;
                    //cur_product.price=cur_product.variants[0].ws_price;
                }

                //console.log(cur_product);
                render_products();



            });
        }
        else{
            for(i=0;i<cur_product.variants.length;i++){
                cur_product.variants[i].display_price=cur_product.variants[i].price;
            }
            if(cur_product.variants.length==1 && cur_product.variants[0].title=='Default Title'){                                    
                cur_product.display_price=cur_product.variants[0].price;
            }
            render_products();
        }

    }
    else{
        ScJQuery_QO(".sc-shopify-qs-loader").hide();
    }


    function render_products(){
            //var pr_row = sc_gqorder_app_global.CreateProductRow(cur_product); //TH
            var template_name = isMobile.any() ? '#sc-qs-mobile-tmpl-item' : '#sc-qs-tmpl-item';
			var append_box = isMobile.any() ? '.qs-sc-mobile-view-holder' : '.sc-shopify-qs-res-table-body';
			//
			var pr_row_template = __sc__.template($(template_name).text());
            var pr_row = pr_row_template(cur_product);
            //if (pr_row != null) ScJQuery_QO('.sc-shopify-qs-res-table').append(pr_row); //TH
            if(pr_row != null)
                    ScJQuery_QO(append_box).append(pr_row);
            if(result != null && result.length > 0)
                    sc_gqorder_app_global.LoadProducts(result, callback)
            else {
                    ScJQuery_QO(".sc_custom_pagination").show();
                    ScJQuery_QO(".sc-shopify-qs-loader").hide();
                    if(callback)
                            callback();
            }
        }
};*/
sc_gqorder_app_global.LoadProducts=function(result, callback) {
    if(sc_gqorder_app_global.sc_debug)
            console.log('ScQS: sc_gqorder_app_global.LoadProducts();');

    //ScJQuery_QO('.sc-shopify-qs-prod-search').show(); // TH

    var cur_product = null;
    if(result != null && result.length > 0) {
            cur_product = result[0];
            result.splice(0, 1)
    }
    if(cur_product != null) {
        //console.log(cur_product);


        if (sc_gqorder_app_global.sc_qs_is_ws_customer) {
            //console.log('sc_gqorder_app_global.sc_qs_is_ws_customer: '+sc_gqorder_app_global.sc_qs_is_ws_customer);
            //var sc_ws_selected_product=cur_product;
            //sc_ws_selected_product.collections=cur_product.collections;
            sc_gws_app_global.get_discount_rules(function(discount_rules){

                for(i=0;i<cur_product.variants.length;i++){
                    //console.log('ID: '+cur_product.variants.id);
                    var discount_rule=sc_gws_app_global.get_discount_rule(cur_product,cur_product.variants[i].id);
                    //console.log(discount_rule);

                    var d_variant=sc_gws_app_global.get_discounted_price(discount_rule,cur_product.variants[i]);
                    //console.log('discount Price: '+JSON.stringify(d_variant));

                    cur_product.variants[i].ws_price=d_variant.ws_price;
                    cur_product.variants[i].display_price=d_variant.ws_price;
                    //cur_product.variants[i].org_price=cur_product.variants[i].price;
                    //cur_product.variants[i].price=d_variant.ws_price;
                }

                if(cur_product.variants.length==1 && cur_product.variants[0].title=='Default Title'){
                    cur_product.ws_price=cur_product.variants[0].ws_price;
                    cur_product.display_price=cur_product.variants[0].ws_price;
                    //cur_product.org_price=cur_product.variants[0].org_price;
                    //cur_product.price=cur_product.variants[0].ws_price;
                }

                //console.log(cur_product);
                render_products();



            });
        }
        else{
            for(i=0;i<cur_product.variants.length;i++){
                cur_product.variants[i].display_price=cur_product.variants[i].price;
            }
            if(cur_product.variants.length==1 && cur_product.variants[0].title=='Default Title'){                                    
                cur_product.display_price=cur_product.variants[0].price;
            }
            render_products();
        }

    }
    else{
        ScJQuery_QO(".sc-shopify-qs-loader").hide();
    }


    function render_products(){
      //-----------------------
      var tpl_row_mobile=__sc__.template($('#sc-qs-mobile-tmpl-item').text());
      var tpl_row_desktop=__sc__.template($('#sc-qs-tmpl-item').text());
      
      var pr_mobile_row = tpl_row_mobile(cur_product);
      var pr_desktop_row = tpl_row_desktop(cur_product);
      
      if(pr_mobile_row != null){
        ScJQuery_QO('.qs-sc-mobile-view-holder').append(pr_mobile_row);
      }
      if(pr_desktop_row != null){
        ScJQuery_QO('.sc-shopify-qs-res-table-body').append(pr_desktop_row);
      }             
      //-----------------------
      
      
      if(result != null && result.length > 0){
                    sc_gqorder_app_global.LoadProducts(result, callback)
      }
            else {
                    ScJQuery_QO(".sc_custom_pagination").show();
                    ScJQuery_QO(".sc-shopify-qs-loader").hide();
                    if(callback)
                            callback();
            }
        }
};

sc_gqorder_app_global.ShowSearchResult=function(page, callback) {
    if(sc_gqorder_app_global.sc_debug)
            console.log('ScQS: sc_gqorder_app_global.ShowSearchResult();');

    ScJQuery_QO("#sc_shopify_qs_pagination_container_footer").hide();

    ScJQuery_QO(".sc-shopify-qs-loader").show();
    ScJQuery_QO(".sc_custom_pagination").hide();
    ScJQuery_QO(".sc-shopify-qs-item-row").remove();
	if(ScJQuery_QO(".qs-mobile-box").length > 0){
		ScJQuery_QO(".qs-mobile-box").remove();
	}

    //Alt: Search by JS
    var search_url = sc_gqorder_app_global.GetSearchURL(page);
    if(search_url != '') {
            ScJQuery_QO.get(search_url, function(qs_data) {
                SC_Shopify.getCart(sc_gqorder_app_global.GetCartObject);
                sc_gqorder_app_global.sp_qs_collection_changed = true;

                qs_data = ScJQuery_QO.parseJSON(qs_data);
                ScJQuery_QO('#s_shopify_qs_hdnPageSize').val(qs_data.Limit);
                ScJQuery_QO("#s_shopify_qs_hdnTotalProducts").val(qs_data.TotalProduct);
                sc_gqorder_app_global.ScQsItems = Object.assign([], qs_data.Items);
                sc_gqorder_app_global.LoadProducts(qs_data.Items, function() {
                        sc_gqorder_app_global.bind_dynamic_control_events();
                        if(callback)
                                callback(page);
                });

            });
    }
};

// *** [sc_pagination: jquery page navigation] *** //
sc_gqorder_app_global.sc_get_pagination_object = function(init_data) {
        var sc_custom_pagination = {
                code: '',
                // --- Utility ----- //

                // converting initialize data
                Extend: function(data) {
                        data = data || {};
                        sc_custom_pagination.size = data.size || 0;
                        sc_custom_pagination.page = data.page || 1;
                        sc_custom_pagination.step = data.step || 3;
                        sc_custom_pagination.scjQuery = ScJQuery_QO;//data.scjQuery;
                        sc_custom_pagination.ShowSearchResult = data.ShowSearchResult;
                        sc_custom_pagination.InitializeAllPaginations = data.InitializeAllPaginations;
                        sc_custom_pagination.ContainerID = data.ContainerID;
                },
                // add pages by number (from [s] to [f])
                Add: function(s, f) {
                        for(var i = s; i < f; i++) {
                                sc_custom_pagination.code += '<li><a href="#" >' + i + '</a></li>';
                        }
                },
                // add last page with separator
                Last: function() {
                        sc_custom_pagination.code += '<li><a class="skip">...</a></li><li><a href="#">' + sc_custom_pagination.size + '</a></li>';
                },
                // add first page with separator
                First: function() {
                        sc_custom_pagination.code += '<li><a href="#">1</a></li><li><a class="skip">...</a></li>';
                },
                // --------------------
                // Handlers
                // --------------------

                // change page
                Click: function(e) {
                        e.preventDefault();
                        sc_custom_pagination.page = +this.innerHTML;
                        sc_custom_pagination.Start();
                        //Altaf
                        sc_custom_pagination.ShowSearchResult(sc_custom_pagination.page, sc_custom_pagination.InitializeAllPaginations);
                },
                // previous page
                Prev: function(e) {
                        e.preventDefault();
                        sc_custom_pagination.page--;
                        if(sc_custom_pagination.page < 1) {
                                sc_custom_pagination.page = 1;
                        }
//            sc_custom_pagination.Start();
                        //Altaf
                        sc_custom_pagination.ShowSearchResult(sc_custom_pagination.page, sc_custom_pagination.InitializeAllPaginations);
                },
                // next page
                Next: function(e) {
                        e.preventDefault();
                        sc_custom_pagination.page++;
                        if(sc_custom_pagination.page > sc_custom_pagination.size) {
                                sc_custom_pagination.page = sc_custom_pagination.size;
                        }
//            sc_custom_pagination.Start();
                        //Altaf
                        sc_custom_pagination.ShowSearchResult(sc_custom_pagination.page, sc_custom_pagination.InitializeAllPaginations);
                },
                // --------------------
                // Script
                // --------------------

                // binding pages
                Bind: function() {
                        var a = ScJQuery_QO('#' + init_data.ContainerID).find("a").not(":first").not(":last");
                        ScJQuery_QO.each(a, function(index, anchor) {
                                if(parseInt(ScJQuery_QO(anchor).text()) === sc_custom_pagination.page) {
                                        ScJQuery_QO(anchor).parent('li').addClass("active");
                                }
                                if(!ScJQuery_QO(anchor).hasClass("skip"))
                                        ScJQuery_QO(anchor).on("click", sc_custom_pagination.Click);
                        });
                },
                // write sc_custom_pagination
                Finish: function() {
                        ScJQuery_QO('#' + init_data.ContainerID).find("li:first-child").after(sc_custom_pagination.code);
                        sc_custom_pagination.code = '';
                        //Altaf
                        if(sc_custom_pagination.scjQuery("#" + sc_custom_pagination.ContainerID + " li").length <= 2)
                                sc_custom_pagination.scjQuery("#" + sc_custom_pagination.ContainerID).hide();
                        else
                                sc_custom_pagination.scjQuery("#" + sc_custom_pagination.ContainerID).show();

                        sc_custom_pagination.Bind();
                },
                // find sc_custom_pagination type
                Start: function() {
                        if(sc_custom_pagination.size < sc_custom_pagination.step * 2 + 6) {
                                sc_custom_pagination.Add(1, sc_custom_pagination.size + 1);
                        }
                        else if(sc_custom_pagination.page < sc_custom_pagination.step * 2 + 1) {
                                sc_custom_pagination.Add(1, sc_custom_pagination.step * 2 + 4);
                                sc_custom_pagination.Last();
                        }
                        else if(sc_custom_pagination.page > sc_custom_pagination.size - sc_custom_pagination.step * 2) {
                                sc_custom_pagination.First();
                                sc_custom_pagination.Add(sc_custom_pagination.size - sc_custom_pagination.step * 2 - 2, sc_custom_pagination.size + 1);
                        }
                        else {
                                sc_custom_pagination.First();
                                sc_custom_pagination.Add(sc_custom_pagination.page - sc_custom_pagination.step, sc_custom_pagination.page + sc_custom_pagination.step + 1);
                                sc_custom_pagination.Last();
                        }
                        sc_custom_pagination.Finish();
                },
                // --------------------
                // Initialization
                // --------------------

                // binding buttons
                Buttons: function(container) {
                        var nav = ScJQuery_QO(container).find('a');
                        ScJQuery_QO(nav).first().on('click', sc_custom_pagination.Prev);
                        ScJQuery_QO(nav).last().on('click', sc_custom_pagination.Next);
                },
                // create skeleton
                Create: function(container) {

                        var html = [
                                '<li><a href="#" >&#60;&#60;</a></li>', // previous button
                                '<li><a  href="#" >&#62;&#62;</a></li>'  // next button
                        ];

                        
						ScJQuery_QO(container).html(html.join(''));
                        //sc_custom_pagination.container = e.getElementsByTagName('span')[0];
                        sc_custom_pagination.Buttons(container);
                },
                // init
                Init: function(container, data) {
						if(parseInt(ScJQuery_QO("#s_shopify_qs_hdnTotalProducts").val()) > parseInt(ScJQuery_QO('#s_shopify_qs_hdnPageSize').val())){
							//only generate pagination if total more than paging size
							sc_custom_pagination.Extend(data);
                        	sc_custom_pagination.Create(container);
						}
				// sc_custom_pagination.Start();
                }
        };

        sc_custom_pagination.Init(ScJQuery_QO('#' + init_data.ContainerID), init_data);
        return sc_custom_pagination;
};

sc_gqorder_app_global.InitializeAllPaginations=function(page) {
        if(sc_gqorder_app_global.sc_debug)
                console.log('ScQS: sc_gqorder_app_global.InitializeAllPaginations();');

        ScJQuery_QO('#sc_shopify_qs_pagination_container_footer').show();
        sc_gqorder_app_global.Init_SC_Custom_Pagination_Top(page);
        sc_gqorder_app_global.Init_SC_Custom_Pagination_Bottom(page);
};

sc_gqorder_app_global.Init_SC_Custom_Pagination_Top = function(page) {
    if(sc_gqorder_app_global.sc_debug)
            console.log('ScQS: sc_gqorder_app_global.Init_SC_Custom_Pagination_Top();');

    //sc_custom_pagination.Init(document.getElementById('sc_custom_pagination'), {
    sc_gqorder_app_global.sc_get_pagination_object({
            size: Math.ceil(parseInt(ScJQuery_QO('#s_shopify_qs_hdnTotalProducts').val()) / parseInt(ScJQuery_QO('#s_shopify_qs_hdnPageSize').val())), // pages size
            page: page, // selected page
            step: 3, // pages before and after current
            scjQuery: ScJQuery_QO,
            ShowSearchResult: sc_gqorder_app_global.ShowSearchResult,
            InitializeAllPaginations: sc_gqorder_app_global.InitializeAllPaginations,
            ContainerID: 'sc_custom_pagination'
    });
	
	sc_gqorder_app_global.PaginateButtonAction(page);
};
sc_gqorder_app_global.Init_SC_Custom_Pagination_Bottom = function(page) {
    if(sc_gqorder_app_global.sc_debug)
            console.log('ScQS: sc_gqorder_app_global.Init_SC_Custom_Pagination_Bottom();');

    //sc_custom_pagination.Init(document.getElementById('sc_custom_pagination'), {
    sc_gqorder_app_global.sc_get_pagination_object({
            size: Math.ceil(parseInt(ScJQuery_QO('#s_shopify_qs_hdnTotalProducts').val()) / parseInt(ScJQuery_QO('#s_shopify_qs_hdnPageSize').val())), // pages size
            page: page, // selected page
            step: 3, // pages before and after current
            ScJQuery_QO: ScJQuery_QO,
            ShowSearchResult: sc_gqorder_app_global.ShowSearchResult,
            InitializeAllPaginations: sc_gqorder_app_global.InitializeAllPaginations,
            ContainerID: 'sc_custom_pagination_footer'
    });
};
// *** End: sc_pagination: javascript page navigation *** //

/*function tryParseJSON(jsonString) {
    try {
            var o = JSON.parse(jsonString);
            if(o && typeof o === "object" && o !== null)
                    return o;
    }
    catch(e) {
    }

    return false;
}*/

function get_jquery_instance_of_custombox_plugin() {
    if(typeof ScJQuery_QO.fn.custombox == 'function')
            return ScJQuery_QO;
    else if(typeof jQuery.fn.custombox == 'function')
            return jQuery;
    else if(typeof $.fn.custombox == 'function')
            return $;
    else
            return ScJQuery_QO;
}

(function() {
    
    //     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
(function(){function n(n){function t(t,r,e,u,i,o){for(;i>=0&&o>i;i+=n){var a=u?u[i]:i;e=r(e,t[a],a,t)}return e}return function(r,e,u,i){e=b(e,i,4);var o=!k(r)&&m.keys(r),a=(o||r).length,c=n>0?0:a-1;return arguments.length<3&&(u=r[o?o[c]:c],c+=n),t(r,e,u,o,c,a)}}function t(n){return function(t,r,e){r=x(r,e);for(var u=O(t),i=n>0?0:u-1;i>=0&&u>i;i+=n)if(r(t[i],i,t))return i;return-1}}function r(n,t,r){return function(e,u,i){var o=0,a=O(e);if("number"==typeof i)n>0?o=i>=0?i:Math.max(i+a,o):a=i>=0?Math.min(i+1,a):i+a+1;else if(r&&i&&a)return i=r(e,u),e[i]===u?i:-1;if(u!==u)return i=t(l.call(e,o,a),m.isNaN),i>=0?i+o:-1;for(i=n>0?o:a-1;i>=0&&a>i;i+=n)if(e[i]===u)return i;return-1}}function e(n,t){var r=I.length,e=n.constructor,u=m.isFunction(e)&&e.prototype||a,i="constructor";for(m.has(n,i)&&!m.contains(t,i)&&t.push(i);r--;)i=I[r],i in n&&n[i]!==u[i]&&!m.contains(t,i)&&t.push(i)}var u=this,i=u.__sc__,o=Array.prototype,a=Object.prototype,c=Function.prototype,f=o.push,l=o.slice,s=a.toString,p=a.hasOwnProperty,h=Array.isArray,v=Object.keys,g=c.bind,y=Object.create,d=function(){},m=function(n){return n instanceof m?n:this instanceof m?void(this.__sc__wrapped=n):new m(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=m),exports.__sc__=m):u.__sc__=m,m.VERSION="1.8.3";var b=function(n,t,r){if(t===void 0)return n;switch(null==r?3:r){case 1:return function(r){return n.call(t,r)};case 2:return function(r,e){return n.call(t,r,e)};case 3:return function(r,e,u){return n.call(t,r,e,u)};case 4:return function(r,e,u,i){return n.call(t,r,e,u,i)}}return function(){return n.apply(t,arguments)}},x=function(n,t,r){return null==n?m.identity:m.isFunction(n)?b(n,t,r):m.isObject(n)?m.matcher(n):m.property(n)};m.iteratee=function(n,t){return x(n,t,1/0)};var __sc__=function(n,t){return function(r){var e=arguments.length;if(2>e||null==r)return r;for(var u=1;e>u;u++)for(var i=arguments[u],o=n(i),a=o.length,c=0;a>c;c++){var f=o[c];t&&r[f]!==void 0||(r[f]=i[f])}return r}},j=function(n){if(!m.isObject(n))return{};if(y)return y(n);d.prototype=n;var t=new d;return d.prototype=null,t},w=function(n){return function(t){return null==t?void 0:t[n]}},A=Math.pow(2,53)-1,O=w("length"),k=function(n){var t=O(n);return"number"==typeof t&&t>=0&&A>=t};m.each=m.forEach=function(n,t,r){t=b(t,r);var e,u;if(k(n))for(e=0,u=n.length;u>e;e++)t(n[e],e,n);else{var i=m.keys(n);for(e=0,u=i.length;u>e;e++)t(n[i[e]],i[e],n)}return n},m.map=m.collect=function(n,t,r){t=x(t,r);for(var e=!k(n)&&m.keys(n),u=(e||n).length,i=Array(u),o=0;u>o;o++){var a=e?e[o]:o;i[o]=t(n[a],a,n)}return i},m.reduce=m.foldl=m.inject=n(1),m.reduceRight=m.foldr=n(-1),m.find=m.detect=function(n,t,r){var e;return e=k(n)?m.findIndex(n,t,r):m.findKey(n,t,r),e!==void 0&&e!==-1?n[e]:void 0},m.filter=m.select=function(n,t,r){var e=[];return t=x(t,r),m.each(n,function(n,r,u){t(n,r,u)&&e.push(n)}),e},m.reject=function(n,t,r){return m.filter(n,m.negate(x(t)),r)},m.every=m.all=function(n,t,r){t=x(t,r);for(var e=!k(n)&&m.keys(n),u=(e||n).length,i=0;u>i;i++){var o=e?e[i]:i;if(!t(n[o],o,n))return!1}return!0},m.some=m.any=function(n,t,r){t=x(t,r);for(var e=!k(n)&&m.keys(n),u=(e||n).length,i=0;u>i;i++){var o=e?e[i]:i;if(t(n[o],o,n))return!0}return!1},m.contains=m.includes=m.include=function(n,t,r,e){return k(n)||(n=m.values(n)),("number"!=typeof r||e)&&(r=0),m.indexOf(n,t,r)>=0},m.invoke=function(n,t){var r=l.call(arguments,2),e=m.isFunction(t);return m.map(n,function(n){var u=e?t:n[t];return null==u?u:u.apply(n,r)})},m.pluck=function(n,t){return m.map(n,m.property(t))},m.where=function(n,t){return m.filter(n,m.matcher(t))},m.findWhere=function(n,t){return m.find(n,m.matcher(t))},m.max=function(n,t,r){var e,u,i=-1/0,o=-1/0;if(null==t&&null!=n){n=k(n)?n:m.values(n);for(var a=0,c=n.length;c>a;a++)e=n[a],e>i&&(i=e)}else t=x(t,r),m.each(n,function(n,r,e){u=t(n,r,e),(u>o||u===-1/0&&i===-1/0)&&(i=n,o=u)});return i},m.min=function(n,t,r){var e,u,i=1/0,o=1/0;if(null==t&&null!=n){n=k(n)?n:m.values(n);for(var a=0,c=n.length;c>a;a++)e=n[a],i>e&&(i=e)}else t=x(t,r),m.each(n,function(n,r,e){u=t(n,r,e),(o>u||1/0===u&&1/0===i)&&(i=n,o=u)});return i},m.shuffle=function(n){for(var t,r=k(n)?n:m.values(n),e=r.length,u=Array(e),i=0;e>i;i++)t=m.random(0,i),t!==i&&(u[i]=u[t]),u[t]=r[i];return u},m.sample=function(n,t,r){return null==t||r?(k(n)||(n=m.values(n)),n[m.random(n.length-1)]):m.shuffle(n).slice(0,Math.max(0,t))},m.sortBy=function(n,t,r){return t=x(t,r),m.pluck(m.map(n,function(n,r,e){return{value:n,index:r,criteria:t(n,r,e)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index-t.index}),"value")};var F=function(n){return function(t,r,e){var u={};return r=x(r,e),m.each(t,function(e,i){var o=r(e,i,t);n(u,e,o)}),u}};m.groupBy=F(function(n,t,r){m.has(n,r)?n[r].push(t):n[r]=[t]}),m.indexBy=F(function(n,t,r){n[r]=t}),m.countBy=F(function(n,t,r){m.has(n,r)?n[r]++:n[r]=1}),m.toArray=function(n){return n?m.isArray(n)?l.call(n):k(n)?m.map(n,m.identity):m.values(n):[]},m.size=function(n){return null==n?0:k(n)?n.length:m.keys(n).length},m.partition=function(n,t,r){t=x(t,r);var e=[],u=[];return m.each(n,function(n,r,i){(t(n,r,i)?e:u).push(n)}),[e,u]},m.first=m.head=m.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:m.initial(n,n.length-t)},m.initial=function(n,t,r){return l.call(n,0,Math.max(0,n.length-(null==t||r?1:t)))},m.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:m.rest(n,Math.max(0,n.length-t))},m.rest=m.tail=m.drop=function(n,t,r){return l.call(n,null==t||r?1:t)},m.compact=function(n){return m.filter(n,m.identity)};var S=function(n,t,r,e){for(var u=[],i=0,o=e||0,a=O(n);a>o;o++){var c=n[o];if(k(c)&&(m.isArray(c)||m.isArguments(c))){t||(c=S(c,t,r));var f=0,l=c.length;for(u.length+=l;l>f;)u[i++]=c[f++]}else r||(u[i++]=c)}return u};m.flatten=function(n,t){return S(n,t,!1)},m.without=function(n){return m.difference(n,l.call(arguments,1))},m.uniq=m.unique=function(n,t,r,e){m.isBoolean(t)||(e=r,r=t,t=!1),null!=r&&(r=x(r,e));for(var u=[],i=[],o=0,a=O(n);a>o;o++){var c=n[o],f=r?r(c,o,n):c;t?(o&&i===f||u.push(c),i=f):r?m.contains(i,f)||(i.push(f),u.push(c)):m.contains(u,c)||u.push(c)}return u},m.union=function(){return m.uniq(S(arguments,!0,!0))},m.intersection=function(n){for(var t=[],r=arguments.length,e=0,u=O(n);u>e;e++){var i=n[e];if(!m.contains(t,i)){for(var o=1;r>o&&m.contains(arguments[o],i);o++);o===r&&t.push(i)}}return t},m.difference=function(n){var t=S(arguments,!0,!0,1);return m.filter(n,function(n){return!m.contains(t,n)})},m.zip=function(){return m.unzip(arguments)},m.unzip=function(n){for(var t=n&&m.max(n,O).length||0,r=Array(t),e=0;t>e;e++)r[e]=m.pluck(n,e);return r},m.object=function(n,t){for(var r={},e=0,u=O(n);u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},m.findIndex=t(1),m.findLastIndex=t(-1),m.sortedIndex=function(n,t,r,e){r=x(r,e,1);for(var u=r(t),i=0,o=O(n);o>i;){var a=Math.floor((i+o)/2);r(n[a])<u?i=a+1:o=a}return i},m.indexOf=r(1,m.findIndex,m.sortedIndex),m.lastIndexOf=r(-1,m.findLastIndex),m.range=function(n,t,r){null==t&&(t=n||0,n=0),r=r||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=Array(e),i=0;e>i;i++,n+=r)u[i]=n;return u};var E=function(n,t,r,e,u){if(!(e instanceof t))return n.apply(r,u);var i=j(n.prototype),o=n.apply(i,u);return m.isObject(o)?o:i};m.bind=function(n,t){if(g&&n.bind===g)return g.apply(n,l.call(arguments,1));if(!m.isFunction(n))throw new TypeError("Bind must be called on a function");var r=l.call(arguments,2),e=function(){return E(n,e,t,this,r.concat(l.call(arguments)))};return e},m.partial=function(n){var t=l.call(arguments,1),r=function(){for(var e=0,u=t.length,i=Array(u),o=0;u>o;o++)i[o]=t[o]===m?arguments[e++]:t[o];for(;e<arguments.length;)i.push(arguments[e++]);return E(n,r,this,this,i)};return r},m.bindAll=function(n){var t,r,e=arguments.length;if(1>=e)throw new Error("bindAll must be passed function names");for(t=1;e>t;t++)r=arguments[t],n[r]=m.bind(n[r],n);return n},m.memoize=function(n,t){var r=function(e){var u=r.cache,i=""+(t?t.apply(this,arguments):e);return m.has(u,i)||(u[i]=n.apply(this,arguments)),u[i]};return r.cache={},r},m.delay=function(n,t){var r=l.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},m.defer=m.partial(m.delay,m,1),m.throttle=function(n,t,r){var e,u,i,o=null,a=0;r||(r={});var c=function(){a=r.leading===!1?0:m.now(),o=null,i=n.apply(e,u),o||(e=u=null)};return function(){var f=m.now();a||r.leading!==!1||(a=f);var l=t-(f-a);return e=this,u=arguments,0>=l||l>t?(o&&(clearTimeout(o),o=null),a=f,i=n.apply(e,u),o||(e=u=null)):o||r.trailing===!1||(o=setTimeout(c,l)),i}},m.debounce=function(n,t,r){var e,u,i,o,a,c=function(){var f=m.now()-o;t>f&&f>=0?e=setTimeout(c,t-f):(e=null,r||(a=n.apply(i,u),e||(i=u=null)))};return function(){i=this,u=arguments,o=m.now();var f=r&&!e;return e||(e=setTimeout(c,t)),f&&(a=n.apply(i,u),i=u=null),a}},m.wrap=function(n,t){return m.partial(t,n)},m.negate=function(n){return function(){return!n.apply(this,arguments)}},m.compose=function(){var n=arguments,t=n.length-1;return function(){for(var r=t,e=n[t].apply(this,arguments);r--;)e=n[r].call(this,e);return e}},m.after=function(n,t){return function(){return--n<1?t.apply(this,arguments):void 0}},m.before=function(n,t){var r;return function(){return--n>0&&(r=t.apply(this,arguments)),1>=n&&(t=null),r}},m.once=m.partial(m.before,2);var M=!{toString:null}.propertyIsEnumerable("toString"),I=["valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"];m.keys=function(n){if(!m.isObject(n))return[];if(v)return v(n);var t=[];for(var r in n)m.has(n,r)&&t.push(r);return M&&e(n,t),t},m.allKeys=function(n){if(!m.isObject(n))return[];var t=[];for(var r in n)t.push(r);return M&&e(n,t),t},m.values=function(n){for(var t=m.keys(n),r=t.length,e=Array(r),u=0;r>u;u++)e[u]=n[t[u]];return e},m.mapObject=function(n,t,r){t=x(t,r);for(var e,u=m.keys(n),i=u.length,o={},a=0;i>a;a++)e=u[a],o[e]=t(n[e],e,n);return o},m.pairs=function(n){for(var t=m.keys(n),r=t.length,e=Array(r),u=0;r>u;u++)e[u]=[t[u],n[t[u]]];return e},m.invert=function(n){for(var t={},r=m.keys(n),e=0,u=r.length;u>e;e++)t[n[r[e]]]=r[e];return t},m.functions=m.methods=function(n){var t=[];for(var r in n)m.isFunction(n[r])&&t.push(r);return t.sort()},m.extend=__sc__(m.allKeys),m.extendOwn=m.assign=__sc__(m.keys),m.findKey=function(n,t,r){t=x(t,r);for(var e,u=m.keys(n),i=0,o=u.length;o>i;i++)if(e=u[i],t(n[e],e,n))return e},m.pick=function(n,t,r){var e,u,i={},o=n;if(null==o)return i;m.isFunction(t)?(u=m.allKeys(o),e=b(t,r)):(u=S(arguments,!1,!1,1),e=function(n,t,r){return t in r},o=Object(o));for(var a=0,c=u.length;c>a;a++){var f=u[a],l=o[f];e(l,f,o)&&(i[f]=l)}return i},m.omit=function(n,t,r){if(m.isFunction(t))t=m.negate(t);else{var e=m.map(S(arguments,!1,!1,1),String);t=function(n,t){return!m.contains(e,t)}}return m.pick(n,t,r)},m.defaults=__sc__(m.allKeys,!0),m.create=function(n,t){var r=j(n);return t&&m.extendOwn(r,t),r},m.clone=function(n){return m.isObject(n)?m.isArray(n)?n.slice():m.extend({},n):n},m.tap=function(n,t){return t(n),n},m.isMatch=function(n,t){var r=m.keys(t),e=r.length;if(null==n)return!e;for(var u=Object(n),i=0;e>i;i++){var o=r[i];if(t[o]!==u[o]||!(o in u))return!1}return!0};var N=function(n,t,r,e){if(n===t)return 0!==n||1/n===1/t;if(null==n||null==t)return n===t;n instanceof m&&(n=n.__sc__wrapped),t instanceof m&&(t=t.__sc__wrapped);var u=s.call(n);if(u!==s.call(t))return!1;switch(u){case"[object RegExp]":case"[object String]":return""+n==""+t;case"[object Number]":return+n!==+n?+t!==+t:0===+n?1/+n===1/t:+n===+t;case"[object Date]":case"[object Boolean]":return+n===+t}var i="[object Array]"===u;if(!i){if("object"!=typeof n||"object"!=typeof t)return!1;var o=n.constructor,a=t.constructor;if(o!==a&&!(m.isFunction(o)&&o instanceof o&&m.isFunction(a)&&a instanceof a)&&"constructor"in n&&"constructor"in t)return!1}r=r||[],e=e||[];for(var c=r.length;c--;)if(r[c]===n)return e[c]===t;if(r.push(n),e.push(t),i){if(c=n.length,c!==t.length)return!1;for(;c--;)if(!N(n[c],t[c],r,e))return!1}else{var f,l=m.keys(n);if(c=l.length,m.keys(t).length!==c)return!1;for(;c--;)if(f=l[c],!m.has(t,f)||!N(n[f],t[f],r,e))return!1}return r.pop(),e.pop(),!0};m.isEqual=function(n,t){return N(n,t)},m.isEmpty=function(n){return null==n?!0:k(n)&&(m.isArray(n)||m.isString(n)||m.isArguments(n))?0===n.length:0===m.keys(n).length},m.isElement=function(n){return!(!n||1!==n.nodeType)},m.isArray=h||function(n){return"[object Array]"===s.call(n)},m.isObject=function(n){var t=typeof n;return"function"===t||"object"===t&&!!n},m.each(["Arguments","Function","String","Number","Date","RegExp","Error"],function(n){m["is"+n]=function(t){return s.call(t)==="[object "+n+"]"}}),m.isArguments(arguments)||(m.isArguments=function(n){return m.has(n,"callee")}),"function"!=typeof/./&&"object"!=typeof Int8Array&&(m.isFunction=function(n){return"function"==typeof n||!1}),m.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},m.isNaN=function(n){return m.isNumber(n)&&n!==+n},m.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"===s.call(n)},m.isNull=function(n){return null===n},m.isUndefined=function(n){return n===void 0},m.has=function(n,t){return null!=n&&p.call(n,t)},m.noConflict=function(){return u.__sc__=i,this},m.identity=function(n){return n},m.constant=function(n){return function(){return n}},m.noop=function(){},m.property=w,m.propertyOf=function(n){return null==n?function(){}:function(t){return n[t]}},m.matcher=m.matches=function(n){return n=m.extendOwn({},n),function(t){return m.isMatch(t,n)}},m.times=function(n,t,r){var e=Array(Math.max(0,n));t=b(t,r,1);for(var u=0;n>u;u++)e[u]=t(u);return e},m.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))},m.now=Date.now||function(){return(new Date).getTime()};var B={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},T=m.invert(B),R=function(n){var t=function(t){return n[t]},r="(?:"+m.keys(n).join("|")+")",e=RegExp(r),u=RegExp(r,"g");return function(n){return n=null==n?"":""+n,e.test(n)?n.replace(u,t):n}};m.escape=R(B),m.unescape=R(T),m.result=function(n,t,r){var e=null==n?void 0:n[t];return e===void 0&&(e=r),m.isFunction(e)?e.call(n):e};var q=0;m.uniqueId=function(n){var t=++q+"";return n?n+t:t},m.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var K=/(.)^/,z={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},D=/\\|'|\r|\n|\u2028|\u2029/g,L=function(n){return"\\"+z[n]};m.template=function(n,t,r){!t&&r&&(t=r),t=m.defaults({},t,m.templateSettings);var e=RegExp([(t.escape||K).source,(t.interpolate||K).source,(t.evaluate||K).source].join("|")+"|$","g"),u=0,i="__sc__p+='";n.replace(e,function(t,r,e,o,a){return i+=n.slice(u,a).replace(D,L),u=a+t.length,r?i+="'+\n((__sc__t=("+r+"))==null?'':__sc__.escape(__sc__t))+\n'":e?i+="'+\n((__sc__t=("+e+"))==null?'':__sc__t)+\n'":o&&(i+="';\n"+o+"\n__sc__p+='"),t}),i+="';\n",t.variable||(i="with(obj||{}){\n"+i+"}\n"),i="var __sc__t,__sc__p='',__sc__j=Array.prototype.join,"+"print=function(){__sc__p+=__sc__j.call(arguments,'');};\n"+i+"return __sc__p;\n";try{var o=new Function(t.variable||"obj","__sc__",i)}catch(a){throw a.source=i,a}var c=function(n){return o.call(this,n,m)},f=t.variable||"obj";return c.source="function("+f+"){\n"+i+"}",c},m.chain=function(n){var t=m(n);return t.__sc__chain=!0,t};var P=function(n,t){return n.__sc__chain?m(t).chain():t};m.mixin=function(n){m.each(m.functions(n),function(t){var r=m[t]=n[t];m.prototype[t]=function(){var n=[this.__sc__wrapped];return f.apply(n,arguments),P(this,r.apply(m,n))}})},m.mixin(m),m.each(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=o[n];m.prototype[n]=function(){var r=this.__sc__wrapped;return t.apply(r,arguments),"shift"!==n&&"splice"!==n||0!==r.length||delete r[0],P(this,r)}}),m.each(["concat","join","slice"],function(n){var t=o[n];m.prototype[n]=function(){return P(this,t.apply(this.__sc__wrapped,arguments))}}),m.prototype.value=function(){return this.__sc__wrapped},m.prototype.valueOf=m.prototype.toJSON=m.prototype.value,m.prototype.toString=function(){return""+this.__sc__wrapped},"function"==typeof define&&define.amd&&define("underscore",[],function(){return m})}).call(this);
//# sourceMappingURL=underscore-min.map

/*! jQuery v3.3.1 | (c) JS Foundation and other contributors | jquery.org/license */
!function(e,t){"use strict";"object"==typeof module&&"object"==typeof module.exports?module.exports=e.document?t(e,!0):function(e){if(!e.document)throw new Error("ScJQuery_QO requires a window with a document");return t(e)}:t(e)}("undefined"!=typeof window?window:this,function(e,t){"use strict";var n=[],r=e.document,i=Object.getPrototypeOf,o=n.slice,a=n.concat,s=n.push,u=n.indexOf,l={},c=l.toString,f=l.hasOwnProperty,p=f.toString,d=p.call(Object),h={},g=function e(t){return"function"==typeof t&&"number"!=typeof t.nodeType},y=function e(t){return null!=t&&t===t.window},v={type:!0,src:!0,noModule:!0};function m(e,t,n){var i,o=(t=t||r).createElement("script");if(o.text=e,n)for(i in v)n[i]&&(o[i]=n[i]);t.head.appendChild(o).parentNode.removeChild(o)}function x(e){return null==e?e+"":"object"==typeof e||"function"==typeof e?l[c.call(e)]||"object":typeof e}var b="3.3.1",w=function(e,t){return new w.fn.init(e,t)},T=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;w.fn=w.prototype={jquery:"3.3.1",constructor:w,length:0,toArray:function(){return o.call(this)},get:function(e){return null==e?o.call(this):e<0?this[e+this.length]:this[e]},pushStack:function(e){var t=w.merge(this.constructor(),e);return t.prevObject=this,t},each:function(e){return w.each(this,e)},map:function(e){return this.pushStack(w.map(this,function(t,n){return e.call(t,n,t)}))},slice:function(){return this.pushStack(o.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(e){var t=this.length,n=+e+(e<0?t:0);return this.pushStack(n>=0&&n<t?[this[n]]:[])},end:function(){return this.prevObject||this.constructor()},push:s,sort:n.sort,splice:n.splice},w.extend=w.fn.extend=function(){var e,t,n,r,i,o,a=arguments[0]||{},s=1,u=arguments.length,l=!1;for("boolean"==typeof a&&(l=a,a=arguments[s]||{},s++),"object"==typeof a||g(a)||(a={}),s===u&&(a=this,s--);s<u;s++)if(null!=(e=arguments[s]))for(t in e)n=a[t],a!==(r=e[t])&&(l&&r&&(w.isPlainObject(r)||(i=Array.isArray(r)))?(i?(i=!1,o=n&&Array.isArray(n)?n:[]):o=n&&w.isPlainObject(n)?n:{},a[t]=w.extend(l,o,r)):void 0!==r&&(a[t]=r));return a},w.extend({expando:"ScJQuery_QO"+("3.3.1"+Math.random()).replace(/\D/g,""),isReady:!0,error:function(e){throw new Error(e)},noop:function(){},isPlainObject:function(e){var t,n;return!(!e||"[object Object]"!==c.call(e))&&(!(t=i(e))||"function"==typeof(n=f.call(t,"constructor")&&t.constructor)&&p.call(n)===d)},isEmptyObject:function(e){var t;for(t in e)return!1;return!0},globalEval:function(e){m(e)},each:function(e,t){var n,r=0;if(C(e)){for(n=e.length;r<n;r++)if(!1===t.call(e[r],r,e[r]))break}else for(r in e)if(!1===t.call(e[r],r,e[r]))break;return e},trim:function(e){return null==e?"":(e+"").replace(T,"")},makeArray:function(e,t){var n=t||[];return null!=e&&(C(Object(e))?w.merge(n,"string"==typeof e?[e]:e):s.call(n,e)),n},inArray:function(e,t,n){return null==t?-1:u.call(t,e,n)},merge:function(e,t){for(var n=+t.length,r=0,i=e.length;r<n;r++)e[i++]=t[r];return e.length=i,e},grep:function(e,t,n){for(var r,i=[],o=0,a=e.length,s=!n;o<a;o++)(r=!t(e[o],o))!==s&&i.push(e[o]);return i},map:function(e,t,n){var r,i,o=0,s=[];if(C(e))for(r=e.length;o<r;o++)null!=(i=t(e[o],o,n))&&s.push(i);else for(o in e)null!=(i=t(e[o],o,n))&&s.push(i);return a.apply([],s)},guid:1,support:h}),"function"==typeof Symbol&&(w.fn[Symbol.iterator]=n[Symbol.iterator]),w.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(e,t){l["[object "+t+"]"]=t.toLowerCase()});function C(e){var t=!!e&&"length"in e&&e.length,n=x(e);return!g(e)&&!y(e)&&("array"===n||0===t||"number"==typeof t&&t>0&&t-1 in e)}var E=function(e){var t,n,r,i,o,a,s,u,l,c,f,p,d,h,g,y,v,m,x,b="sizzle"+1*new Date,w=e.document,T=0,C=0,E=ae(),k=ae(),S=ae(),D=function(e,t){return e===t&&(f=!0),0},N={}.hasOwnProperty,A=[],j=A.pop,q=A.push,L=A.push,H=A.slice,O=function(e,t){for(var n=0,r=e.length;n<r;n++)if(e[n]===t)return n;return-1},P="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",M="[\\x20\\t\\r\\n\\f]",R="(?:\\\\.|[\\w-]|[^\0-\\xa0])+",I="\\["+M+"*("+R+")(?:"+M+"*([*^$|!~]?=)"+M+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+R+"))|)"+M+"*\\]",W=":("+R+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+I+")*)|.*)\\)|)",$=new RegExp(M+"+","g"),B=new RegExp("^"+M+"+|((?:^|[^\\\\])(?:\\\\.)*)"+M+"+$","g"),F=new RegExp("^"+M+"*,"+M+"*"),_=new RegExp("^"+M+"*([>+~]|"+M+")"+M+"*"),z=new RegExp("="+M+"*([^\\]'\"]*?)"+M+"*\\]","g"),X=new RegExp(W),U=new RegExp("^"+R+"$"),V={ID:new RegExp("^#("+R+")"),CLASS:new RegExp("^\\.("+R+")"),TAG:new RegExp("^("+R+"|[*])"),ATTR:new RegExp("^"+I),PSEUDO:new RegExp("^"+W),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+M+"*(even|odd|(([+-]|)(\\d*)n|)"+M+"*(?:([+-]|)"+M+"*(\\d+)|))"+M+"*\\)|)","i"),bool:new RegExp("^(?:"+P+")$","i"),needsContext:new RegExp("^"+M+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+M+"*((?:-\\d)?\\d*)"+M+"*\\)|)(?=[^-]|$)","i")},G=/^(?:input|select|textarea|button)$/i,Y=/^h\d$/i,Q=/^[^{]+\{\s*\[native \w/,J=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,K=/[+~]/,Z=new RegExp("\\\\([\\da-f]{1,6}"+M+"?|("+M+")|.)","ig"),ee=function(e,t,n){var r="0x"+t-65536;return r!==r||n?t:r<0?String.fromCharCode(r+65536):String.fromCharCode(r>>10|55296,1023&r|56320)},te=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,ne=function(e,t){return t?"\0"===e?"\ufffd":e.slice(0,-1)+"\\"+e.charCodeAt(e.length-1).toString(16)+" ":"\\"+e},re=function(){p()},ie=me(function(e){return!0===e.disabled&&("form"in e||"label"in e)},{dir:"parentNode",next:"legend"});try{L.apply(A=H.call(w.childNodes),w.childNodes),A[w.childNodes.length].nodeType}catch(e){L={apply:A.length?function(e,t){q.apply(e,H.call(t))}:function(e,t){var n=e.length,r=0;while(e[n++]=t[r++]);e.length=n-1}}}function oe(e,t,r,i){var o,s,l,c,f,h,v,m=t&&t.ownerDocument,T=t?t.nodeType:9;if(r=r||[],"string"!=typeof e||!e||1!==T&&9!==T&&11!==T)return r;if(!i&&((t?t.ownerDocument||t:w)!==d&&p(t),t=t||d,g)){if(11!==T&&(f=J.exec(e)))if(o=f[1]){if(9===T){if(!(l=t.getElementById(o)))return r;if(l.id===o)return r.push(l),r}else if(m&&(l=m.getElementById(o))&&x(t,l)&&l.id===o)return r.push(l),r}else{if(f[2])return L.apply(r,t.getElementsByTagName(e)),r;if((o=f[3])&&n.getElementsByClassName&&t.getElementsByClassName)return L.apply(r,t.getElementsByClassName(o)),r}if(n.qsa&&!S[e+" "]&&(!y||!y.test(e))){if(1!==T)m=t,v=e;else if("object"!==t.nodeName.toLowerCase()){(c=t.getAttribute("id"))?c=c.replace(te,ne):t.setAttribute("id",c=b),s=(h=a(e)).length;while(s--)h[s]="#"+c+" "+ve(h[s]);v=h.join(","),m=K.test(e)&&ge(t.parentNode)||t}if(v)try{return L.apply(r,m.querySelectorAll(v)),r}catch(e){}finally{c===b&&t.removeAttribute("id")}}}return u(e.replace(B,"$1"),t,r,i)}function ae(){var e=[];function t(n,i){return e.push(n+" ")>r.cacheLength&&delete t[e.shift()],t[n+" "]=i}return t}function se(e){return e[b]=!0,e}function ue(e){var t=d.createElement("fieldset");try{return!!e(t)}catch(e){return!1}finally{t.parentNode&&t.parentNode.removeChild(t),t=null}}function le(e,t){var n=e.split("|"),i=n.length;while(i--)r.attrHandle[n[i]]=t}function ce(e,t){var n=t&&e,r=n&&1===e.nodeType&&1===t.nodeType&&e.sourceIndex-t.sourceIndex;if(r)return r;if(n)while(n=n.nextSibling)if(n===t)return-1;return e?1:-1}function fe(e){return function(t){return"input"===t.nodeName.toLowerCase()&&t.type===e}}function pe(e){return function(t){var n=t.nodeName.toLowerCase();return("input"===n||"button"===n)&&t.type===e}}function de(e){return function(t){return"form"in t?t.parentNode&&!1===t.disabled?"label"in t?"label"in t.parentNode?t.parentNode.disabled===e:t.disabled===e:t.isDisabled===e||t.isDisabled!==!e&&ie(t)===e:t.disabled===e:"label"in t&&t.disabled===e}}function he(e){return se(function(t){return t=+t,se(function(n,r){var i,o=e([],n.length,t),a=o.length;while(a--)n[i=o[a]]&&(n[i]=!(r[i]=n[i]))})})}function ge(e){return e&&"undefined"!=typeof e.getElementsByTagName&&e}n=oe.support={},o=oe.isXML=function(e){var t=e&&(e.ownerDocument||e).documentElement;return!!t&&"HTML"!==t.nodeName},p=oe.setDocument=function(e){var t,i,a=e?e.ownerDocument||e:w;return a!==d&&9===a.nodeType&&a.documentElement?(d=a,h=d.documentElement,g=!o(d),w!==d&&(i=d.defaultView)&&i.top!==i&&(i.addEventListener?i.addEventListener("unload",re,!1):i.attachEvent&&i.attachEvent("onunload",re)),n.attributes=ue(function(e){return e.className="i",!e.getAttribute("className")}),n.getElementsByTagName=ue(function(e){return e.appendChild(d.createComment("")),!e.getElementsByTagName("*").length}),n.getElementsByClassName=Q.test(d.getElementsByClassName),n.getById=ue(function(e){return h.appendChild(e).id=b,!d.getElementsByName||!d.getElementsByName(b).length}),n.getById?(r.filter.ID=function(e){var t=e.replace(Z,ee);return function(e){return e.getAttribute("id")===t}},r.find.ID=function(e,t){if("undefined"!=typeof t.getElementById&&g){var n=t.getElementById(e);return n?[n]:[]}}):(r.filter.ID=function(e){var t=e.replace(Z,ee);return function(e){var n="undefined"!=typeof e.getAttributeNode&&e.getAttributeNode("id");return n&&n.value===t}},r.find.ID=function(e,t){if("undefined"!=typeof t.getElementById&&g){var n,r,i,o=t.getElementById(e);if(o){if((n=o.getAttributeNode("id"))&&n.value===e)return[o];i=t.getElementsByName(e),r=0;while(o=i[r++])if((n=o.getAttributeNode("id"))&&n.value===e)return[o]}return[]}}),r.find.TAG=n.getElementsByTagName?function(e,t){return"undefined"!=typeof t.getElementsByTagName?t.getElementsByTagName(e):n.qsa?t.querySelectorAll(e):void 0}:function(e,t){var n,r=[],i=0,o=t.getElementsByTagName(e);if("*"===e){while(n=o[i++])1===n.nodeType&&r.push(n);return r}return o},r.find.CLASS=n.getElementsByClassName&&function(e,t){if("undefined"!=typeof t.getElementsByClassName&&g)return t.getElementsByClassName(e)},v=[],y=[],(n.qsa=Q.test(d.querySelectorAll))&&(ue(function(e){h.appendChild(e).innerHTML="<a id='"+b+"'></a><select id='"+b+"-\r\\' msallowcapture=''><option selected=''></option></select>",e.querySelectorAll("[msallowcapture^='']").length&&y.push("[*^$]="+M+"*(?:''|\"\")"),e.querySelectorAll("[selected]").length||y.push("\\["+M+"*(?:value|"+P+")"),e.querySelectorAll("[id~="+b+"-]").length||y.push("~="),e.querySelectorAll(":checked").length||y.push(":checked"),e.querySelectorAll("a#"+b+"+*").length||y.push(".#.+[+~]")}),ue(function(e){e.innerHTML="<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";var t=d.createElement("input");t.setAttribute("type","hidden"),e.appendChild(t).setAttribute("name","D"),e.querySelectorAll("[name=d]").length&&y.push("name"+M+"*[*^$|!~]?="),2!==e.querySelectorAll(":enabled").length&&y.push(":enabled",":disabled"),h.appendChild(e).disabled=!0,2!==e.querySelectorAll(":disabled").length&&y.push(":enabled",":disabled"),e.querySelectorAll("*,:x"),y.push(",.*:")})),(n.matchesSelector=Q.test(m=h.matches||h.webkitMatchesSelector||h.mozMatchesSelector||h.oMatchesSelector||h.msMatchesSelector))&&ue(function(e){n.disconnectedMatch=m.call(e,"*"),m.call(e,"[s!='']:x"),v.push("!=",W)}),y=y.length&&new RegExp(y.join("|")),v=v.length&&new RegExp(v.join("|")),t=Q.test(h.compareDocumentPosition),x=t||Q.test(h.contains)?function(e,t){var n=9===e.nodeType?e.documentElement:e,r=t&&t.parentNode;return e===r||!(!r||1!==r.nodeType||!(n.contains?n.contains(r):e.compareDocumentPosition&&16&e.compareDocumentPosition(r)))}:function(e,t){if(t)while(t=t.parentNode)if(t===e)return!0;return!1},D=t?function(e,t){if(e===t)return f=!0,0;var r=!e.compareDocumentPosition-!t.compareDocumentPosition;return r||(1&(r=(e.ownerDocument||e)===(t.ownerDocument||t)?e.compareDocumentPosition(t):1)||!n.sortDetached&&t.compareDocumentPosition(e)===r?e===d||e.ownerDocument===w&&x(w,e)?-1:t===d||t.ownerDocument===w&&x(w,t)?1:c?O(c,e)-O(c,t):0:4&r?-1:1)}:function(e,t){if(e===t)return f=!0,0;var n,r=0,i=e.parentNode,o=t.parentNode,a=[e],s=[t];if(!i||!o)return e===d?-1:t===d?1:i?-1:o?1:c?O(c,e)-O(c,t):0;if(i===o)return ce(e,t);n=e;while(n=n.parentNode)a.unshift(n);n=t;while(n=n.parentNode)s.unshift(n);while(a[r]===s[r])r++;return r?ce(a[r],s[r]):a[r]===w?-1:s[r]===w?1:0},d):d},oe.matches=function(e,t){return oe(e,null,null,t)},oe.matchesSelector=function(e,t){if((e.ownerDocument||e)!==d&&p(e),t=t.replace(z,"='$1']"),n.matchesSelector&&g&&!S[t+" "]&&(!v||!v.test(t))&&(!y||!y.test(t)))try{var r=m.call(e,t);if(r||n.disconnectedMatch||e.document&&11!==e.document.nodeType)return r}catch(e){}return oe(t,d,null,[e]).length>0},oe.contains=function(e,t){return(e.ownerDocument||e)!==d&&p(e),x(e,t)},oe.attr=function(e,t){(e.ownerDocument||e)!==d&&p(e);var i=r.attrHandle[t.toLowerCase()],o=i&&N.call(r.attrHandle,t.toLowerCase())?i(e,t,!g):void 0;return void 0!==o?o:n.attributes||!g?e.getAttribute(t):(o=e.getAttributeNode(t))&&o.specified?o.value:null},oe.escape=function(e){return(e+"").replace(te,ne)},oe.error=function(e){throw new Error("Syntax error, unrecognized expression: "+e)},oe.uniqueSort=function(e){var t,r=[],i=0,o=0;if(f=!n.detectDuplicates,c=!n.sortStable&&e.slice(0),e.sort(D),f){while(t=e[o++])t===e[o]&&(i=r.push(o));while(i--)e.splice(r[i],1)}return c=null,e},i=oe.getText=function(e){var t,n="",r=0,o=e.nodeType;if(o){if(1===o||9===o||11===o){if("string"==typeof e.textContent)return e.textContent;for(e=e.firstChild;e;e=e.nextSibling)n+=i(e)}else if(3===o||4===o)return e.nodeValue}else while(t=e[r++])n+=i(t);return n},(r=oe.selectors={cacheLength:50,createPseudo:se,match:V,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace(Z,ee),e[3]=(e[3]||e[4]||e[5]||"").replace(Z,ee),"~="===e[2]&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),"nth"===e[1].slice(0,3)?(e[3]||oe.error(e[0]),e[4]=+(e[4]?e[5]+(e[6]||1):2*("even"===e[3]||"odd"===e[3])),e[5]=+(e[7]+e[8]||"odd"===e[3])):e[3]&&oe.error(e[0]),e},PSEUDO:function(e){var t,n=!e[6]&&e[2];return V.CHILD.test(e[0])?null:(e[3]?e[2]=e[4]||e[5]||"":n&&X.test(n)&&(t=a(n,!0))&&(t=n.indexOf(")",n.length-t)-n.length)&&(e[0]=e[0].slice(0,t),e[2]=n.slice(0,t)),e.slice(0,3))}},filter:{TAG:function(e){var t=e.replace(Z,ee).toLowerCase();return"*"===e?function(){return!0}:function(e){return e.nodeName&&e.nodeName.toLowerCase()===t}},CLASS:function(e){var t=E[e+" "];return t||(t=new RegExp("(^|"+M+")"+e+"("+M+"|$)"))&&E(e,function(e){return t.test("string"==typeof e.className&&e.className||"undefined"!=typeof e.getAttribute&&e.getAttribute("class")||"")})},ATTR:function(e,t,n){return function(r){var i=oe.attr(r,e);return null==i?"!="===t:!t||(i+="","="===t?i===n:"!="===t?i!==n:"^="===t?n&&0===i.indexOf(n):"*="===t?n&&i.indexOf(n)>-1:"$="===t?n&&i.slice(-n.length)===n:"~="===t?(" "+i.replace($," ")+" ").indexOf(n)>-1:"|="===t&&(i===n||i.slice(0,n.length+1)===n+"-"))}},CHILD:function(e,t,n,r,i){var o="nth"!==e.slice(0,3),a="last"!==e.slice(-4),s="of-type"===t;return 1===r&&0===i?function(e){return!!e.parentNode}:function(t,n,u){var l,c,f,p,d,h,g=o!==a?"nextSibling":"previousSibling",y=t.parentNode,v=s&&t.nodeName.toLowerCase(),m=!u&&!s,x=!1;if(y){if(o){while(g){p=t;while(p=p[g])if(s?p.nodeName.toLowerCase()===v:1===p.nodeType)return!1;h=g="only"===e&&!h&&"nextSibling"}return!0}if(h=[a?y.firstChild:y.lastChild],a&&m){x=(d=(l=(c=(f=(p=y)[b]||(p[b]={}))[p.uniqueID]||(f[p.uniqueID]={}))[e]||[])[0]===T&&l[1])&&l[2],p=d&&y.childNodes[d];while(p=++d&&p&&p[g]||(x=d=0)||h.pop())if(1===p.nodeType&&++x&&p===t){c[e]=[T,d,x];break}}else if(m&&(x=d=(l=(c=(f=(p=t)[b]||(p[b]={}))[p.uniqueID]||(f[p.uniqueID]={}))[e]||[])[0]===T&&l[1]),!1===x)while(p=++d&&p&&p[g]||(x=d=0)||h.pop())if((s?p.nodeName.toLowerCase()===v:1===p.nodeType)&&++x&&(m&&((c=(f=p[b]||(p[b]={}))[p.uniqueID]||(f[p.uniqueID]={}))[e]=[T,x]),p===t))break;return(x-=i)===r||x%r==0&&x/r>=0}}},PSEUDO:function(e,t){var n,i=r.pseudos[e]||r.setFilters[e.toLowerCase()]||oe.error("unsupported pseudo: "+e);return i[b]?i(t):i.length>1?(n=[e,e,"",t],r.setFilters.hasOwnProperty(e.toLowerCase())?se(function(e,n){var r,o=i(e,t),a=o.length;while(a--)e[r=O(e,o[a])]=!(n[r]=o[a])}):function(e){return i(e,0,n)}):i}},pseudos:{not:se(function(e){var t=[],n=[],r=s(e.replace(B,"$1"));return r[b]?se(function(e,t,n,i){var o,a=r(e,null,i,[]),s=e.length;while(s--)(o=a[s])&&(e[s]=!(t[s]=o))}):function(e,i,o){return t[0]=e,r(t,null,o,n),t[0]=null,!n.pop()}}),has:se(function(e){return function(t){return oe(e,t).length>0}}),contains:se(function(e){return e=e.replace(Z,ee),function(t){return(t.textContent||t.innerText||i(t)).indexOf(e)>-1}}),lang:se(function(e){return U.test(e||"")||oe.error("unsupported lang: "+e),e=e.replace(Z,ee).toLowerCase(),function(t){var n;do{if(n=g?t.lang:t.getAttribute("xml:lang")||t.getAttribute("lang"))return(n=n.toLowerCase())===e||0===n.indexOf(e+"-")}while((t=t.parentNode)&&1===t.nodeType);return!1}}),target:function(t){var n=e.location&&e.location.hash;return n&&n.slice(1)===t.id},root:function(e){return e===h},focus:function(e){return e===d.activeElement&&(!d.hasFocus||d.hasFocus())&&!!(e.type||e.href||~e.tabIndex)},enabled:de(!1),disabled:de(!0),checked:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&!!e.checked||"option"===t&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,!0===e.selected},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling)if(e.nodeType<6)return!1;return!0},parent:function(e){return!r.pseudos.empty(e)},header:function(e){return Y.test(e.nodeName)},input:function(e){return G.test(e.nodeName)},button:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&"button"===e.type||"button"===t},text:function(e){var t;return"input"===e.nodeName.toLowerCase()&&"text"===e.type&&(null==(t=e.getAttribute("type"))||"text"===t.toLowerCase())},first:he(function(){return[0]}),last:he(function(e,t){return[t-1]}),eq:he(function(e,t,n){return[n<0?n+t:n]}),even:he(function(e,t){for(var n=0;n<t;n+=2)e.push(n);return e}),odd:he(function(e,t){for(var n=1;n<t;n+=2)e.push(n);return e}),lt:he(function(e,t,n){for(var r=n<0?n+t:n;--r>=0;)e.push(r);return e}),gt:he(function(e,t,n){for(var r=n<0?n+t:n;++r<t;)e.push(r);return e})}}).pseudos.nth=r.pseudos.eq;for(t in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})r.pseudos[t]=fe(t);for(t in{submit:!0,reset:!0})r.pseudos[t]=pe(t);function ye(){}ye.prototype=r.filters=r.pseudos,r.setFilters=new ye,a=oe.tokenize=function(e,t){var n,i,o,a,s,u,l,c=k[e+" "];if(c)return t?0:c.slice(0);s=e,u=[],l=r.preFilter;while(s){n&&!(i=F.exec(s))||(i&&(s=s.slice(i[0].length)||s),u.push(o=[])),n=!1,(i=_.exec(s))&&(n=i.shift(),o.push({value:n,type:i[0].replace(B," ")}),s=s.slice(n.length));for(a in r.filter)!(i=V[a].exec(s))||l[a]&&!(i=l[a](i))||(n=i.shift(),o.push({value:n,type:a,matches:i}),s=s.slice(n.length));if(!n)break}return t?s.length:s?oe.error(e):k(e,u).slice(0)};function ve(e){for(var t=0,n=e.length,r="";t<n;t++)r+=e[t].value;return r}function me(e,t,n){var r=t.dir,i=t.next,o=i||r,a=n&&"parentNode"===o,s=C++;return t.first?function(t,n,i){while(t=t[r])if(1===t.nodeType||a)return e(t,n,i);return!1}:function(t,n,u){var l,c,f,p=[T,s];if(u){while(t=t[r])if((1===t.nodeType||a)&&e(t,n,u))return!0}else while(t=t[r])if(1===t.nodeType||a)if(f=t[b]||(t[b]={}),c=f[t.uniqueID]||(f[t.uniqueID]={}),i&&i===t.nodeName.toLowerCase())t=t[r]||t;else{if((l=c[o])&&l[0]===T&&l[1]===s)return p[2]=l[2];if(c[o]=p,p[2]=e(t,n,u))return!0}return!1}}function xe(e){return e.length>1?function(t,n,r){var i=e.length;while(i--)if(!e[i](t,n,r))return!1;return!0}:e[0]}function be(e,t,n){for(var r=0,i=t.length;r<i;r++)oe(e,t[r],n);return n}function we(e,t,n,r,i){for(var o,a=[],s=0,u=e.length,l=null!=t;s<u;s++)(o=e[s])&&(n&&!n(o,r,i)||(a.push(o),l&&t.push(s)));return a}function Te(e,t,n,r,i,o){return r&&!r[b]&&(r=Te(r)),i&&!i[b]&&(i=Te(i,o)),se(function(o,a,s,u){var l,c,f,p=[],d=[],h=a.length,g=o||be(t||"*",s.nodeType?[s]:s,[]),y=!e||!o&&t?g:we(g,p,e,s,u),v=n?i||(o?e:h||r)?[]:a:y;if(n&&n(y,v,s,u),r){l=we(v,d),r(l,[],s,u),c=l.length;while(c--)(f=l[c])&&(v[d[c]]=!(y[d[c]]=f))}if(o){if(i||e){if(i){l=[],c=v.length;while(c--)(f=v[c])&&l.push(y[c]=f);i(null,v=[],l,u)}c=v.length;while(c--)(f=v[c])&&(l=i?O(o,f):p[c])>-1&&(o[l]=!(a[l]=f))}}else v=we(v===a?v.splice(h,v.length):v),i?i(null,a,v,u):L.apply(a,v)})}function Ce(e){for(var t,n,i,o=e.length,a=r.relative[e[0].type],s=a||r.relative[" "],u=a?1:0,c=me(function(e){return e===t},s,!0),f=me(function(e){return O(t,e)>-1},s,!0),p=[function(e,n,r){var i=!a&&(r||n!==l)||((t=n).nodeType?c(e,n,r):f(e,n,r));return t=null,i}];u<o;u++)if(n=r.relative[e[u].type])p=[me(xe(p),n)];else{if((n=r.filter[e[u].type].apply(null,e[u].matches))[b]){for(i=++u;i<o;i++)if(r.relative[e[i].type])break;return Te(u>1&&xe(p),u>1&&ve(e.slice(0,u-1).concat({value:" "===e[u-2].type?"*":""})).replace(B,"$1"),n,u<i&&Ce(e.slice(u,i)),i<o&&Ce(e=e.slice(i)),i<o&&ve(e))}p.push(n)}return xe(p)}function Ee(e,t){var n=t.length>0,i=e.length>0,o=function(o,a,s,u,c){var f,h,y,v=0,m="0",x=o&&[],b=[],w=l,C=o||i&&r.find.TAG("*",c),E=T+=null==w?1:Math.random()||.1,k=C.length;for(c&&(l=a===d||a||c);m!==k&&null!=(f=C[m]);m++){if(i&&f){h=0,a||f.ownerDocument===d||(p(f),s=!g);while(y=e[h++])if(y(f,a||d,s)){u.push(f);break}c&&(T=E)}n&&((f=!y&&f)&&v--,o&&x.push(f))}if(v+=m,n&&m!==v){h=0;while(y=t[h++])y(x,b,a,s);if(o){if(v>0)while(m--)x[m]||b[m]||(b[m]=j.call(u));b=we(b)}L.apply(u,b),c&&!o&&b.length>0&&v+t.length>1&&oe.uniqueSort(u)}return c&&(T=E,l=w),x};return n?se(o):o}return s=oe.compile=function(e,t){var n,r=[],i=[],o=S[e+" "];if(!o){t||(t=a(e)),n=t.length;while(n--)(o=Ce(t[n]))[b]?r.push(o):i.push(o);(o=S(e,Ee(i,r))).selector=e}return o},u=oe.select=function(e,t,n,i){var o,u,l,c,f,p="function"==typeof e&&e,d=!i&&a(e=p.selector||e);if(n=n||[],1===d.length){if((u=d[0]=d[0].slice(0)).length>2&&"ID"===(l=u[0]).type&&9===t.nodeType&&g&&r.relative[u[1].type]){if(!(t=(r.find.ID(l.matches[0].replace(Z,ee),t)||[])[0]))return n;p&&(t=t.parentNode),e=e.slice(u.shift().value.length)}o=V.needsContext.test(e)?0:u.length;while(o--){if(l=u[o],r.relative[c=l.type])break;if((f=r.find[c])&&(i=f(l.matches[0].replace(Z,ee),K.test(u[0].type)&&ge(t.parentNode)||t))){if(u.splice(o,1),!(e=i.length&&ve(u)))return L.apply(n,i),n;break}}}return(p||s(e,d))(i,t,!g,n,!t||K.test(e)&&ge(t.parentNode)||t),n},n.sortStable=b.split("").sort(D).join("")===b,n.detectDuplicates=!!f,p(),n.sortDetached=ue(function(e){return 1&e.compareDocumentPosition(d.createElement("fieldset"))}),ue(function(e){return e.innerHTML="<a href='#'></a>","#"===e.firstChild.getAttribute("href")})||le("type|href|height|width",function(e,t,n){if(!n)return e.getAttribute(t,"type"===t.toLowerCase()?1:2)}),n.attributes&&ue(function(e){return e.innerHTML="<input/>",e.firstChild.setAttribute("value",""),""===e.firstChild.getAttribute("value")})||le("value",function(e,t,n){if(!n&&"input"===e.nodeName.toLowerCase())return e.defaultValue}),ue(function(e){return null==e.getAttribute("disabled")})||le(P,function(e,t,n){var r;if(!n)return!0===e[t]?t.toLowerCase():(r=e.getAttributeNode(t))&&r.specified?r.value:null}),oe}(e);w.find=E,w.expr=E.selectors,w.expr[":"]=w.expr.pseudos,w.uniqueSort=w.unique=E.uniqueSort,w.text=E.getText,w.isXMLDoc=E.isXML,w.contains=E.contains,w.escapeSelector=E.escape;var k=function(e,t,n){var r=[],i=void 0!==n;while((e=e[t])&&9!==e.nodeType)if(1===e.nodeType){if(i&&w(e).is(n))break;r.push(e)}return r},S=function(e,t){for(var n=[];e;e=e.nextSibling)1===e.nodeType&&e!==t&&n.push(e);return n},D=w.expr.match.needsContext;function N(e,t){return e.nodeName&&e.nodeName.toLowerCase()===t.toLowerCase()}var A=/^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;function j(e,t,n){return g(t)?w.grep(e,function(e,r){return!!t.call(e,r,e)!==n}):t.nodeType?w.grep(e,function(e){return e===t!==n}):"string"!=typeof t?w.grep(e,function(e){return u.call(t,e)>-1!==n}):w.filter(t,e,n)}w.filter=function(e,t,n){var r=t[0];return n&&(e=":not("+e+")"),1===t.length&&1===r.nodeType?w.find.matchesSelector(r,e)?[r]:[]:w.find.matches(e,w.grep(t,function(e){return 1===e.nodeType}))},w.fn.extend({find:function(e){var t,n,r=this.length,i=this;if("string"!=typeof e)return this.pushStack(w(e).filter(function(){for(t=0;t<r;t++)if(w.contains(i[t],this))return!0}));for(n=this.pushStack([]),t=0;t<r;t++)w.find(e,i[t],n);return r>1?w.uniqueSort(n):n},filter:function(e){return this.pushStack(j(this,e||[],!1))},not:function(e){return this.pushStack(j(this,e||[],!0))},is:function(e){return!!j(this,"string"==typeof e&&D.test(e)?w(e):e||[],!1).length}});var q,L=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;(w.fn.init=function(e,t,n){var i,o;if(!e)return this;if(n=n||q,"string"==typeof e){if(!(i="<"===e[0]&&">"===e[e.length-1]&&e.length>=3?[null,e,null]:L.exec(e))||!i[1]&&t)return!t||t.jquery?(t||n).find(e):this.constructor(t).find(e);if(i[1]){if(t=t instanceof w?t[0]:t,w.merge(this,w.parseHTML(i[1],t&&t.nodeType?t.ownerDocument||t:r,!0)),A.test(i[1])&&w.isPlainObject(t))for(i in t)g(this[i])?this[i](t[i]):this.attr(i,t[i]);return this}return(o=r.getElementById(i[2]))&&(this[0]=o,this.length=1),this}return e.nodeType?(this[0]=e,this.length=1,this):g(e)?void 0!==n.ready?n.ready(e):e(w):w.makeArray(e,this)}).prototype=w.fn,q=w(r);var H=/^(?:parents|prev(?:Until|All))/,O={children:!0,contents:!0,next:!0,prev:!0};w.fn.extend({has:function(e){var t=w(e,this),n=t.length;return this.filter(function(){for(var e=0;e<n;e++)if(w.contains(this,t[e]))return!0})},closest:function(e,t){var n,r=0,i=this.length,o=[],a="string"!=typeof e&&w(e);if(!D.test(e))for(;r<i;r++)for(n=this[r];n&&n!==t;n=n.parentNode)if(n.nodeType<11&&(a?a.index(n)>-1:1===n.nodeType&&w.find.matchesSelector(n,e))){o.push(n);break}return this.pushStack(o.length>1?w.uniqueSort(o):o)},index:function(e){return e?"string"==typeof e?u.call(w(e),this[0]):u.call(this,e.jquery?e[0]:e):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(e,t){return this.pushStack(w.uniqueSort(w.merge(this.get(),w(e,t))))},addBack:function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}});function P(e,t){while((e=e[t])&&1!==e.nodeType);return e}w.each({parent:function(e){var t=e.parentNode;return t&&11!==t.nodeType?t:null},parents:function(e){return k(e,"parentNode")},parentsUntil:function(e,t,n){return k(e,"parentNode",n)},next:function(e){return P(e,"nextSibling")},prev:function(e){return P(e,"previousSibling")},nextAll:function(e){return k(e,"nextSibling")},prevAll:function(e){return k(e,"previousSibling")},nextUntil:function(e,t,n){return k(e,"nextSibling",n)},prevUntil:function(e,t,n){return k(e,"previousSibling",n)},siblings:function(e){return S((e.parentNode||{}).firstChild,e)},children:function(e){return S(e.firstChild)},contents:function(e){return N(e,"iframe")?e.contentDocument:(N(e,"template")&&(e=e.content||e),w.merge([],e.childNodes))}},function(e,t){w.fn[e]=function(n,r){var i=w.map(this,t,n);return"Until"!==e.slice(-5)&&(r=n),r&&"string"==typeof r&&(i=w.filter(r,i)),this.length>1&&(O[e]||w.uniqueSort(i),H.test(e)&&i.reverse()),this.pushStack(i)}});var M=/[^\x20\t\r\n\f]+/g;function R(e){var t={};return w.each(e.match(M)||[],function(e,n){t[n]=!0}),t}w.Callbacks=function(e){e="string"==typeof e?R(e):w.extend({},e);var t,n,r,i,o=[],a=[],s=-1,u=function(){for(i=i||e.once,r=t=!0;a.length;s=-1){n=a.shift();while(++s<o.length)!1===o[s].apply(n[0],n[1])&&e.stopOnFalse&&(s=o.length,n=!1)}e.memory||(n=!1),t=!1,i&&(o=n?[]:"")},l={add:function(){return o&&(n&&!t&&(s=o.length-1,a.push(n)),function t(n){w.each(n,function(n,r){g(r)?e.unique&&l.has(r)||o.push(r):r&&r.length&&"string"!==x(r)&&t(r)})}(arguments),n&&!t&&u()),this},remove:function(){return w.each(arguments,function(e,t){var n;while((n=w.inArray(t,o,n))>-1)o.splice(n,1),n<=s&&s--}),this},has:function(e){return e?w.inArray(e,o)>-1:o.length>0},empty:function(){return o&&(o=[]),this},disable:function(){return i=a=[],o=n="",this},disabled:function(){return!o},lock:function(){return i=a=[],n||t||(o=n=""),this},locked:function(){return!!i},fireWith:function(e,n){return i||(n=[e,(n=n||[]).slice?n.slice():n],a.push(n),t||u()),this},fire:function(){return l.fireWith(this,arguments),this},fired:function(){return!!r}};return l};function I(e){return e}function W(e){throw e}function $(e,t,n,r){var i;try{e&&g(i=e.promise)?i.call(e).done(t).fail(n):e&&g(i=e.then)?i.call(e,t,n):t.apply(void 0,[e].slice(r))}catch(e){n.apply(void 0,[e])}}w.extend({Deferred:function(t){var n=[["notify","progress",w.Callbacks("memory"),w.Callbacks("memory"),2],["resolve","done",w.Callbacks("once memory"),w.Callbacks("once memory"),0,"resolved"],["reject","fail",w.Callbacks("once memory"),w.Callbacks("once memory"),1,"rejected"]],r="pending",i={state:function(){return r},always:function(){return o.done(arguments).fail(arguments),this},"catch":function(e){return i.then(null,e)},pipe:function(){var e=arguments;return w.Deferred(function(t){w.each(n,function(n,r){var i=g(e[r[4]])&&e[r[4]];o[r[1]](function(){var e=i&&i.apply(this,arguments);e&&g(e.promise)?e.promise().progress(t.notify).done(t.resolve).fail(t.reject):t[r[0]+"With"](this,i?[e]:arguments)})}),e=null}).promise()},then:function(t,r,i){var o=0;function a(t,n,r,i){return function(){var s=this,u=arguments,l=function(){var e,l;if(!(t<o)){if((e=r.apply(s,u))===n.promise())throw new TypeError("Thenable self-resolution");l=e&&("object"==typeof e||"function"==typeof e)&&e.then,g(l)?i?l.call(e,a(o,n,I,i),a(o,n,W,i)):(o++,l.call(e,a(o,n,I,i),a(o,n,W,i),a(o,n,I,n.notifyWith))):(r!==I&&(s=void 0,u=[e]),(i||n.resolveWith)(s,u))}},c=i?l:function(){try{l()}catch(e){w.Deferred.exceptionHook&&w.Deferred.exceptionHook(e,c.stackTrace),t+1>=o&&(r!==W&&(s=void 0,u=[e]),n.rejectWith(s,u))}};t?c():(w.Deferred.getStackHook&&(c.stackTrace=w.Deferred.getStackHook()),e.setTimeout(c))}}return w.Deferred(function(e){n[0][3].add(a(0,e,g(i)?i:I,e.notifyWith)),n[1][3].add(a(0,e,g(t)?t:I)),n[2][3].add(a(0,e,g(r)?r:W))}).promise()},promise:function(e){return null!=e?w.extend(e,i):i}},o={};return w.each(n,function(e,t){var a=t[2],s=t[5];i[t[1]]=a.add,s&&a.add(function(){r=s},n[3-e][2].disable,n[3-e][3].disable,n[0][2].lock,n[0][3].lock),a.add(t[3].fire),o[t[0]]=function(){return o[t[0]+"With"](this===o?void 0:this,arguments),this},o[t[0]+"With"]=a.fireWith}),i.promise(o),t&&t.call(o,o),o},when:function(e){var t=arguments.length,n=t,r=Array(n),i=o.call(arguments),a=w.Deferred(),s=function(e){return function(n){r[e]=this,i[e]=arguments.length>1?o.call(arguments):n,--t||a.resolveWith(r,i)}};if(t<=1&&($(e,a.done(s(n)).resolve,a.reject,!t),"pending"===a.state()||g(i[n]&&i[n].then)))return a.then();while(n--)$(i[n],s(n),a.reject);return a.promise()}});var B=/^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;w.Deferred.exceptionHook=function(t,n){e.console&&e.console.warn&&t&&B.test(t.name)&&e.console.warn("ScJQuery_QO.Deferred exception: "+t.message,t.stack,n)},w.readyException=function(t){e.setTimeout(function(){throw t})};var F=w.Deferred();w.fn.ready=function(e){return F.then(e)["catch"](function(e){w.readyException(e)}),this},w.extend({isReady:!1,readyWait:1,ready:function(e){(!0===e?--w.readyWait:w.isReady)||(w.isReady=!0,!0!==e&&--w.readyWait>0||F.resolveWith(r,[w]))}}),w.ready.then=F.then;function _(){r.removeEventListener("DOMContentLoaded",_),e.removeEventListener("load",_),w.ready()}"complete"===r.readyState||"loading"!==r.readyState&&!r.documentElement.doScroll?e.setTimeout(w.ready):(r.addEventListener("DOMContentLoaded",_),e.addEventListener("load",_));var z=function(e,t,n,r,i,o,a){var s=0,u=e.length,l=null==n;if("object"===x(n)){i=!0;for(s in n)z(e,t,s,n[s],!0,o,a)}else if(void 0!==r&&(i=!0,g(r)||(a=!0),l&&(a?(t.call(e,r),t=null):(l=t,t=function(e,t,n){return l.call(w(e),n)})),t))for(;s<u;s++)t(e[s],n,a?r:r.call(e[s],s,t(e[s],n)));return i?e:l?t.call(e):u?t(e[0],n):o},X=/^-ms-/,U=/-([a-z])/g;function V(e,t){return t.toUpperCase()}function G(e){return e.replace(X,"ms-").replace(U,V)}var Y=function(e){return 1===e.nodeType||9===e.nodeType||!+e.nodeType};function Q(){this.expando=w.expando+Q.uid++}Q.uid=1,Q.prototype={cache:function(e){var t=e[this.expando];return t||(t={},Y(e)&&(e.nodeType?e[this.expando]=t:Object.defineProperty(e,this.expando,{value:t,configurable:!0}))),t},set:function(e,t,n){var r,i=this.cache(e);if("string"==typeof t)i[G(t)]=n;else for(r in t)i[G(r)]=t[r];return i},get:function(e,t){return void 0===t?this.cache(e):e[this.expando]&&e[this.expando][G(t)]},access:function(e,t,n){return void 0===t||t&&"string"==typeof t&&void 0===n?this.get(e,t):(this.set(e,t,n),void 0!==n?n:t)},remove:function(e,t){var n,r=e[this.expando];if(void 0!==r){if(void 0!==t){n=(t=Array.isArray(t)?t.map(G):(t=G(t))in r?[t]:t.match(M)||[]).length;while(n--)delete r[t[n]]}(void 0===t||w.isEmptyObject(r))&&(e.nodeType?e[this.expando]=void 0:delete e[this.expando])}},hasData:function(e){var t=e[this.expando];return void 0!==t&&!w.isEmptyObject(t)}};var J=new Q,K=new Q,Z=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,ee=/[A-Z]/g;function te(e){return"true"===e||"false"!==e&&("null"===e?null:e===+e+""?+e:Z.test(e)?JSON.parse(e):e)}function ne(e,t,n){var r;if(void 0===n&&1===e.nodeType)if(r="data-"+t.replace(ee,"-$&").toLowerCase(),"string"==typeof(n=e.getAttribute(r))){try{n=te(n)}catch(e){}K.set(e,t,n)}else n=void 0;return n}w.extend({hasData:function(e){return K.hasData(e)||J.hasData(e)},data:function(e,t,n){return K.access(e,t,n)},removeData:function(e,t){K.remove(e,t)},_data:function(e,t,n){return J.access(e,t,n)},_removeData:function(e,t){J.remove(e,t)}}),w.fn.extend({data:function(e,t){var n,r,i,o=this[0],a=o&&o.attributes;if(void 0===e){if(this.length&&(i=K.get(o),1===o.nodeType&&!J.get(o,"hasDataAttrs"))){n=a.length;while(n--)a[n]&&0===(r=a[n].name).indexOf("data-")&&(r=G(r.slice(5)),ne(o,r,i[r]));J.set(o,"hasDataAttrs",!0)}return i}return"object"==typeof e?this.each(function(){K.set(this,e)}):z(this,function(t){var n;if(o&&void 0===t){if(void 0!==(n=K.get(o,e)))return n;if(void 0!==(n=ne(o,e)))return n}else this.each(function(){K.set(this,e,t)})},null,t,arguments.length>1,null,!0)},removeData:function(e){return this.each(function(){K.remove(this,e)})}}),w.extend({queue:function(e,t,n){var r;if(e)return t=(t||"fx")+"queue",r=J.get(e,t),n&&(!r||Array.isArray(n)?r=J.access(e,t,w.makeArray(n)):r.push(n)),r||[]},dequeue:function(e,t){t=t||"fx";var n=w.queue(e,t),r=n.length,i=n.shift(),o=w._queueHooks(e,t),a=function(){w.dequeue(e,t)};"inprogress"===i&&(i=n.shift(),r--),i&&("fx"===t&&n.unshift("inprogress"),delete o.stop,i.call(e,a,o)),!r&&o&&o.empty.fire()},_queueHooks:function(e,t){var n=t+"queueHooks";return J.get(e,n)||J.access(e,n,{empty:w.Callbacks("once memory").add(function(){J.remove(e,[t+"queue",n])})})}}),w.fn.extend({queue:function(e,t){var n=2;return"string"!=typeof e&&(t=e,e="fx",n--),arguments.length<n?w.queue(this[0],e):void 0===t?this:this.each(function(){var n=w.queue(this,e,t);w._queueHooks(this,e),"fx"===e&&"inprogress"!==n[0]&&w.dequeue(this,e)})},dequeue:function(e){return this.each(function(){w.dequeue(this,e)})},clearQueue:function(e){return this.queue(e||"fx",[])},promise:function(e,t){var n,r=1,i=w.Deferred(),o=this,a=this.length,s=function(){--r||i.resolveWith(o,[o])};"string"!=typeof e&&(t=e,e=void 0),e=e||"fx";while(a--)(n=J.get(o[a],e+"queueHooks"))&&n.empty&&(r++,n.empty.add(s));return s(),i.promise(t)}});var re=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,ie=new RegExp("^(?:([+-])=|)("+re+")([a-z%]*)$","i"),oe=["Top","Right","Bottom","Left"],ae=function(e,t){return"none"===(e=t||e).style.display||""===e.style.display&&w.contains(e.ownerDocument,e)&&"none"===w.css(e,"display")},se=function(e,t,n,r){var i,o,a={};for(o in t)a[o]=e.style[o],e.style[o]=t[o];i=n.apply(e,r||[]);for(o in t)e.style[o]=a[o];return i};function ue(e,t,n,r){var i,o,a=20,s=r?function(){return r.cur()}:function(){return w.css(e,t,"")},u=s(),l=n&&n[3]||(w.cssNumber[t]?"":"px"),c=(w.cssNumber[t]||"px"!==l&&+u)&&ie.exec(w.css(e,t));if(c&&c[3]!==l){u/=2,l=l||c[3],c=+u||1;while(a--)w.style(e,t,c+l),(1-o)*(1-(o=s()/u||.5))<=0&&(a=0),c/=o;c*=2,w.style(e,t,c+l),n=n||[]}return n&&(c=+c||+u||0,i=n[1]?c+(n[1]+1)*n[2]:+n[2],r&&(r.unit=l,r.start=c,r.end=i)),i}var le={};function ce(e){var t,n=e.ownerDocument,r=e.nodeName,i=le[r];return i||(t=n.body.appendChild(n.createElement(r)),i=w.css(t,"display"),t.parentNode.removeChild(t),"none"===i&&(i="block"),le[r]=i,i)}function fe(e,t){for(var n,r,i=[],o=0,a=e.length;o<a;o++)(r=e[o]).style&&(n=r.style.display,t?("none"===n&&(i[o]=J.get(r,"display")||null,i[o]||(r.style.display="")),""===r.style.display&&ae(r)&&(i[o]=ce(r))):"none"!==n&&(i[o]="none",J.set(r,"display",n)));for(o=0;o<a;o++)null!=i[o]&&(e[o].style.display=i[o]);return e}w.fn.extend({show:function(){return fe(this,!0)},hide:function(){return fe(this)},toggle:function(e){return"boolean"==typeof e?e?this.show():this.hide():this.each(function(){ae(this)?w(this).show():w(this).hide()})}});var pe=/^(?:checkbox|radio)$/i,de=/<([a-z][^\/\0>\x20\t\r\n\f]+)/i,he=/^$|^module$|\/(?:java|ecma)script/i,ge={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};ge.optgroup=ge.option,ge.tbody=ge.tfoot=ge.colgroup=ge.caption=ge.thead,ge.th=ge.td;function ye(e,t){var n;return n="undefined"!=typeof e.getElementsByTagName?e.getElementsByTagName(t||"*"):"undefined"!=typeof e.querySelectorAll?e.querySelectorAll(t||"*"):[],void 0===t||t&&N(e,t)?w.merge([e],n):n}function ve(e,t){for(var n=0,r=e.length;n<r;n++)J.set(e[n],"globalEval",!t||J.get(t[n],"globalEval"))}var me=/<|&#?\w+;/;function xe(e,t,n,r,i){for(var o,a,s,u,l,c,f=t.createDocumentFragment(),p=[],d=0,h=e.length;d<h;d++)if((o=e[d])||0===o)if("object"===x(o))w.merge(p,o.nodeType?[o]:o);else if(me.test(o)){a=a||f.appendChild(t.createElement("div")),s=(de.exec(o)||["",""])[1].toLowerCase(),u=ge[s]||ge._default,a.innerHTML=u[1]+w.htmlPrefilter(o)+u[2],c=u[0];while(c--)a=a.lastChild;w.merge(p,a.childNodes),(a=f.firstChild).textContent=""}else p.push(t.createTextNode(o));f.textContent="",d=0;while(o=p[d++])if(r&&w.inArray(o,r)>-1)i&&i.push(o);else if(l=w.contains(o.ownerDocument,o),a=ye(f.appendChild(o),"script"),l&&ve(a),n){c=0;while(o=a[c++])he.test(o.type||"")&&n.push(o)}return f}!function(){var e=r.createDocumentFragment().appendChild(r.createElement("div")),t=r.createElement("input");t.setAttribute("type","radio"),t.setAttribute("checked","checked"),t.setAttribute("name","t"),e.appendChild(t),h.checkClone=e.cloneNode(!0).cloneNode(!0).lastChild.checked,e.innerHTML="<textarea>x</textarea>",h.noCloneChecked=!!e.cloneNode(!0).lastChild.defaultValue}();var be=r.documentElement,we=/^key/,Te=/^(?:mouse|pointer|contextmenu|drag|drop)|click/,Ce=/^([^.]*)(?:\.(.+)|)/;function Ee(){return!0}function ke(){return!1}function Se(){try{return r.activeElement}catch(e){}}function De(e,t,n,r,i,o){var a,s;if("object"==typeof t){"string"!=typeof n&&(r=r||n,n=void 0);for(s in t)De(e,s,n,r,t[s],o);return e}if(null==r&&null==i?(i=n,r=n=void 0):null==i&&("string"==typeof n?(i=r,r=void 0):(i=r,r=n,n=void 0)),!1===i)i=ke;else if(!i)return e;return 1===o&&(a=i,(i=function(e){return w().off(e),a.apply(this,arguments)}).guid=a.guid||(a.guid=w.guid++)),e.each(function(){w.event.add(this,t,i,r,n)})}w.event={global:{},add:function(e,t,n,r,i){var o,a,s,u,l,c,f,p,d,h,g,y=J.get(e);if(y){n.handler&&(n=(o=n).handler,i=o.selector),i&&w.find.matchesSelector(be,i),n.guid||(n.guid=w.guid++),(u=y.events)||(u=y.events={}),(a=y.handle)||(a=y.handle=function(t){return"undefined"!=typeof w&&w.event.triggered!==t.type?w.event.dispatch.apply(e,arguments):void 0}),l=(t=(t||"").match(M)||[""]).length;while(l--)d=g=(s=Ce.exec(t[l])||[])[1],h=(s[2]||"").split(".").sort(),d&&(f=w.event.special[d]||{},d=(i?f.delegateType:f.bindType)||d,f=w.event.special[d]||{},c=w.extend({type:d,origType:g,data:r,handler:n,guid:n.guid,selector:i,needsContext:i&&w.expr.match.needsContext.test(i),namespace:h.join(".")},o),(p=u[d])||((p=u[d]=[]).delegateCount=0,f.setup&&!1!==f.setup.call(e,r,h,a)||e.addEventListener&&e.addEventListener(d,a)),f.add&&(f.add.call(e,c),c.handler.guid||(c.handler.guid=n.guid)),i?p.splice(p.delegateCount++,0,c):p.push(c),w.event.global[d]=!0)}},remove:function(e,t,n,r,i){var o,a,s,u,l,c,f,p,d,h,g,y=J.hasData(e)&&J.get(e);if(y&&(u=y.events)){l=(t=(t||"").match(M)||[""]).length;while(l--)if(s=Ce.exec(t[l])||[],d=g=s[1],h=(s[2]||"").split(".").sort(),d){f=w.event.special[d]||{},p=u[d=(r?f.delegateType:f.bindType)||d]||[],s=s[2]&&new RegExp("(^|\\.)"+h.join("\\.(?:.*\\.|)")+"(\\.|$)"),a=o=p.length;while(o--)c=p[o],!i&&g!==c.origType||n&&n.guid!==c.guid||s&&!s.test(c.namespace)||r&&r!==c.selector&&("**"!==r||!c.selector)||(p.splice(o,1),c.selector&&p.delegateCount--,f.remove&&f.remove.call(e,c));a&&!p.length&&(f.teardown&&!1!==f.teardown.call(e,h,y.handle)||w.removeEvent(e,d,y.handle),delete u[d])}else for(d in u)w.event.remove(e,d+t[l],n,r,!0);w.isEmptyObject(u)&&J.remove(e,"handle events")}},dispatch:function(e){var t=w.event.fix(e),n,r,i,o,a,s,u=new Array(arguments.length),l=(J.get(this,"events")||{})[t.type]||[],c=w.event.special[t.type]||{};for(u[0]=t,n=1;n<arguments.length;n++)u[n]=arguments[n];if(t.delegateTarget=this,!c.preDispatch||!1!==c.preDispatch.call(this,t)){s=w.event.handlers.call(this,t,l),n=0;while((o=s[n++])&&!t.isPropagationStopped()){t.currentTarget=o.elem,r=0;while((a=o.handlers[r++])&&!t.isImmediatePropagationStopped())t.rnamespace&&!t.rnamespace.test(a.namespace)||(t.handleObj=a,t.data=a.data,void 0!==(i=((w.event.special[a.origType]||{}).handle||a.handler).apply(o.elem,u))&&!1===(t.result=i)&&(t.preventDefault(),t.stopPropagation()))}return c.postDispatch&&c.postDispatch.call(this,t),t.result}},handlers:function(e,t){var n,r,i,o,a,s=[],u=t.delegateCount,l=e.target;if(u&&l.nodeType&&!("click"===e.type&&e.button>=1))for(;l!==this;l=l.parentNode||this)if(1===l.nodeType&&("click"!==e.type||!0!==l.disabled)){for(o=[],a={},n=0;n<u;n++)void 0===a[i=(r=t[n]).selector+" "]&&(a[i]=r.needsContext?w(i,this).index(l)>-1:w.find(i,this,null,[l]).length),a[i]&&o.push(r);o.length&&s.push({elem:l,handlers:o})}return l=this,u<t.length&&s.push({elem:l,handlers:t.slice(u)}),s},addProp:function(e,t){Object.defineProperty(w.Event.prototype,e,{enumerable:!0,configurable:!0,get:g(t)?function(){if(this.originalEvent)return t(this.originalEvent)}:function(){if(this.originalEvent)return this.originalEvent[e]},set:function(t){Object.defineProperty(this,e,{enumerable:!0,configurable:!0,writable:!0,value:t})}})},fix:function(e){return e[w.expando]?e:new w.Event(e)},special:{load:{noBubble:!0},focus:{trigger:function(){if(this!==Se()&&this.focus)return this.focus(),!1},delegateType:"focusin"},blur:{trigger:function(){if(this===Se()&&this.blur)return this.blur(),!1},delegateType:"focusout"},click:{trigger:function(){if("checkbox"===this.type&&this.click&&N(this,"input"))return this.click(),!1},_default:function(e){return N(e.target,"a")}},beforeunload:{postDispatch:function(e){void 0!==e.result&&e.originalEvent&&(e.originalEvent.returnValue=e.result)}}}},w.removeEvent=function(e,t,n){e.removeEventListener&&e.removeEventListener(t,n)},w.Event=function(e,t){if(!(this instanceof w.Event))return new w.Event(e,t);e&&e.type?(this.originalEvent=e,this.type=e.type,this.isDefaultPrevented=e.defaultPrevented||void 0===e.defaultPrevented&&!1===e.returnValue?Ee:ke,this.target=e.target&&3===e.target.nodeType?e.target.parentNode:e.target,this.currentTarget=e.currentTarget,this.relatedTarget=e.relatedTarget):this.type=e,t&&w.extend(this,t),this.timeStamp=e&&e.timeStamp||Date.now(),this[w.expando]=!0},w.Event.prototype={constructor:w.Event,isDefaultPrevented:ke,isPropagationStopped:ke,isImmediatePropagationStopped:ke,isSimulated:!1,preventDefault:function(){var e=this.originalEvent;this.isDefaultPrevented=Ee,e&&!this.isSimulated&&e.preventDefault()},stopPropagation:function(){var e=this.originalEvent;this.isPropagationStopped=Ee,e&&!this.isSimulated&&e.stopPropagation()},stopImmediatePropagation:function(){var e=this.originalEvent;this.isImmediatePropagationStopped=Ee,e&&!this.isSimulated&&e.stopImmediatePropagation(),this.stopPropagation()}},w.each({altKey:!0,bubbles:!0,cancelable:!0,changedTouches:!0,ctrlKey:!0,detail:!0,eventPhase:!0,metaKey:!0,pageX:!0,pageY:!0,shiftKey:!0,view:!0,"char":!0,charCode:!0,key:!0,keyCode:!0,button:!0,buttons:!0,clientX:!0,clientY:!0,offsetX:!0,offsetY:!0,pointerId:!0,pointerType:!0,screenX:!0,screenY:!0,targetTouches:!0,toElement:!0,touches:!0,which:function(e){var t=e.button;return null==e.which&&we.test(e.type)?null!=e.charCode?e.charCode:e.keyCode:!e.which&&void 0!==t&&Te.test(e.type)?1&t?1:2&t?3:4&t?2:0:e.which}},w.event.addProp),w.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(e,t){w.event.special[e]={delegateType:t,bindType:t,handle:function(e){var n,r=this,i=e.relatedTarget,o=e.handleObj;return i&&(i===r||w.contains(r,i))||(e.type=o.origType,n=o.handler.apply(this,arguments),e.type=t),n}}}),w.fn.extend({on:function(e,t,n,r){return De(this,e,t,n,r)},one:function(e,t,n,r){return De(this,e,t,n,r,1)},off:function(e,t,n){var r,i;if(e&&e.preventDefault&&e.handleObj)return r=e.handleObj,w(e.delegateTarget).off(r.namespace?r.origType+"."+r.namespace:r.origType,r.selector,r.handler),this;if("object"==typeof e){for(i in e)this.off(i,t,e[i]);return this}return!1!==t&&"function"!=typeof t||(n=t,t=void 0),!1===n&&(n=ke),this.each(function(){w.event.remove(this,e,n,t)})}});var Ne=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,Ae=/<script|<style|<link/i,je=/checked\s*(?:[^=]|=\s*.checked.)/i,qe=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;function Le(e,t){return N(e,"table")&&N(11!==t.nodeType?t:t.firstChild,"tr")?w(e).children("tbody")[0]||e:e}function He(e){return e.type=(null!==e.getAttribute("type"))+"/"+e.type,e}function Oe(e){return"true/"===(e.type||"").slice(0,5)?e.type=e.type.slice(5):e.removeAttribute("type"),e}function Pe(e,t){var n,r,i,o,a,s,u,l;if(1===t.nodeType){if(J.hasData(e)&&(o=J.access(e),a=J.set(t,o),l=o.events)){delete a.handle,a.events={};for(i in l)for(n=0,r=l[i].length;n<r;n++)w.event.add(t,i,l[i][n])}K.hasData(e)&&(s=K.access(e),u=w.extend({},s),K.set(t,u))}}function Me(e,t){var n=t.nodeName.toLowerCase();"input"===n&&pe.test(e.type)?t.checked=e.checked:"input"!==n&&"textarea"!==n||(t.defaultValue=e.defaultValue)}function Re(e,t,n,r){t=a.apply([],t);var i,o,s,u,l,c,f=0,p=e.length,d=p-1,y=t[0],v=g(y);if(v||p>1&&"string"==typeof y&&!h.checkClone&&je.test(y))return e.each(function(i){var o=e.eq(i);v&&(t[0]=y.call(this,i,o.html())),Re(o,t,n,r)});if(p&&(i=xe(t,e[0].ownerDocument,!1,e,r),o=i.firstChild,1===i.childNodes.length&&(i=o),o||r)){for(u=(s=w.map(ye(i,"script"),He)).length;f<p;f++)l=i,f!==d&&(l=w.clone(l,!0,!0),u&&w.merge(s,ye(l,"script"))),n.call(e[f],l,f);if(u)for(c=s[s.length-1].ownerDocument,w.map(s,Oe),f=0;f<u;f++)l=s[f],he.test(l.type||"")&&!J.access(l,"globalEval")&&w.contains(c,l)&&(l.src&&"module"!==(l.type||"").toLowerCase()?w._evalUrl&&w._evalUrl(l.src):m(l.textContent.replace(qe,""),c,l))}return e}function Ie(e,t,n){for(var r,i=t?w.filter(t,e):e,o=0;null!=(r=i[o]);o++)n||1!==r.nodeType||w.cleanData(ye(r)),r.parentNode&&(n&&w.contains(r.ownerDocument,r)&&ve(ye(r,"script")),r.parentNode.removeChild(r));return e}w.extend({htmlPrefilter:function(e){return e.replace(Ne,"<$1></$2>")},clone:function(e,t,n){var r,i,o,a,s=e.cloneNode(!0),u=w.contains(e.ownerDocument,e);if(!(h.noCloneChecked||1!==e.nodeType&&11!==e.nodeType||w.isXMLDoc(e)))for(a=ye(s),r=0,i=(o=ye(e)).length;r<i;r++)Me(o[r],a[r]);if(t)if(n)for(o=o||ye(e),a=a||ye(s),r=0,i=o.length;r<i;r++)Pe(o[r],a[r]);else Pe(e,s);return(a=ye(s,"script")).length>0&&ve(a,!u&&ye(e,"script")),s},cleanData:function(e){for(var t,n,r,i=w.event.special,o=0;void 0!==(n=e[o]);o++)if(Y(n)){if(t=n[J.expando]){if(t.events)for(r in t.events)i[r]?w.event.remove(n,r):w.removeEvent(n,r,t.handle);n[J.expando]=void 0}n[K.expando]&&(n[K.expando]=void 0)}}}),w.fn.extend({detach:function(e){return Ie(this,e,!0)},remove:function(e){return Ie(this,e)},text:function(e){return z(this,function(e){return void 0===e?w.text(this):this.empty().each(function(){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||(this.textContent=e)})},null,e,arguments.length)},append:function(){return Re(this,arguments,function(e){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||Le(this,e).appendChild(e)})},prepend:function(){return Re(this,arguments,function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=Le(this,e);t.insertBefore(e,t.firstChild)}})},before:function(){return Re(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this)})},after:function(){return Re(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this.nextSibling)})},empty:function(){for(var e,t=0;null!=(e=this[t]);t++)1===e.nodeType&&(w.cleanData(ye(e,!1)),e.textContent="");return this},clone:function(e,t){return e=null!=e&&e,t=null==t?e:t,this.map(function(){return w.clone(this,e,t)})},html:function(e){return z(this,function(e){var t=this[0]||{},n=0,r=this.length;if(void 0===e&&1===t.nodeType)return t.innerHTML;if("string"==typeof e&&!Ae.test(e)&&!ge[(de.exec(e)||["",""])[1].toLowerCase()]){e=w.htmlPrefilter(e);try{for(;n<r;n++)1===(t=this[n]||{}).nodeType&&(w.cleanData(ye(t,!1)),t.innerHTML=e);t=0}catch(e){}}t&&this.empty().append(e)},null,e,arguments.length)},replaceWith:function(){var e=[];return Re(this,arguments,function(t){var n=this.parentNode;w.inArray(this,e)<0&&(w.cleanData(ye(this)),n&&n.replaceChild(t,this))},e)}}),w.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(e,t){w.fn[e]=function(e){for(var n,r=[],i=w(e),o=i.length-1,a=0;a<=o;a++)n=a===o?this:this.clone(!0),w(i[a])[t](n),s.apply(r,n.get());return this.pushStack(r)}});var We=new RegExp("^("+re+")(?!px)[a-z%]+$","i"),$e=function(t){var n=t.ownerDocument.defaultView;return n&&n.opener||(n=e),n.getComputedStyle(t)},Be=new RegExp(oe.join("|"),"i");!function(){function t(){if(c){l.style.cssText="position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0",c.style.cssText="position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%",be.appendChild(l).appendChild(c);var t=e.getComputedStyle(c);i="1%"!==t.top,u=12===n(t.marginLeft),c.style.right="60%",s=36===n(t.right),o=36===n(t.width),c.style.position="absolute",a=36===c.offsetWidth||"absolute",be.removeChild(l),c=null}}function n(e){return Math.round(parseFloat(e))}var i,o,a,s,u,l=r.createElement("div"),c=r.createElement("div");c.style&&(c.style.backgroundClip="content-box",c.cloneNode(!0).style.backgroundClip="",h.clearCloneStyle="content-box"===c.style.backgroundClip,w.extend(h,{boxSizingReliable:function(){return t(),o},pixelBoxStyles:function(){return t(),s},pixelPosition:function(){return t(),i},reliableMarginLeft:function(){return t(),u},scrollboxSize:function(){return t(),a}}))}();function Fe(e,t,n){var r,i,o,a,s=e.style;return(n=n||$e(e))&&(""!==(a=n.getPropertyValue(t)||n[t])||w.contains(e.ownerDocument,e)||(a=w.style(e,t)),!h.pixelBoxStyles()&&We.test(a)&&Be.test(t)&&(r=s.width,i=s.minWidth,o=s.maxWidth,s.minWidth=s.maxWidth=s.width=a,a=n.width,s.width=r,s.minWidth=i,s.maxWidth=o)),void 0!==a?a+"":a}function _e(e,t){return{get:function(){if(!e())return(this.get=t).apply(this,arguments);delete this.get}}}var ze=/^(none|table(?!-c[ea]).+)/,Xe=/^--/,Ue={position:"absolute",visibility:"hidden",display:"block"},Ve={letterSpacing:"0",fontWeight:"400"},Ge=["Webkit","Moz","ms"],Ye=r.createElement("div").style;function Qe(e){if(e in Ye)return e;var t=e[0].toUpperCase()+e.slice(1),n=Ge.length;while(n--)if((e=Ge[n]+t)in Ye)return e}function Je(e){var t=w.cssProps[e];return t||(t=w.cssProps[e]=Qe(e)||e),t}function Ke(e,t,n){var r=ie.exec(t);return r?Math.max(0,r[2]-(n||0))+(r[3]||"px"):t}function Ze(e,t,n,r,i,o){var a="width"===t?1:0,s=0,u=0;if(n===(r?"border":"content"))return 0;for(;a<4;a+=2)"margin"===n&&(u+=w.css(e,n+oe[a],!0,i)),r?("content"===n&&(u-=w.css(e,"padding"+oe[a],!0,i)),"margin"!==n&&(u-=w.css(e,"border"+oe[a]+"Width",!0,i))):(u+=w.css(e,"padding"+oe[a],!0,i),"padding"!==n?u+=w.css(e,"border"+oe[a]+"Width",!0,i):s+=w.css(e,"border"+oe[a]+"Width",!0,i));return!r&&o>=0&&(u+=Math.max(0,Math.ceil(e["offset"+t[0].toUpperCase()+t.slice(1)]-o-u-s-.5))),u}function et(e,t,n){var r=$e(e),i=Fe(e,t,r),o="border-box"===w.css(e,"boxSizing",!1,r),a=o;if(We.test(i)){if(!n)return i;i="auto"}return a=a&&(h.boxSizingReliable()||i===e.style[t]),("auto"===i||!parseFloat(i)&&"inline"===w.css(e,"display",!1,r))&&(i=e["offset"+t[0].toUpperCase()+t.slice(1)],a=!0),(i=parseFloat(i)||0)+Ze(e,t,n||(o?"border":"content"),a,r,i)+"px"}w.extend({cssHooks:{opacity:{get:function(e,t){if(t){var n=Fe(e,"opacity");return""===n?"1":n}}}},cssNumber:{animationIterationCount:!0,columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{},style:function(e,t,n,r){if(e&&3!==e.nodeType&&8!==e.nodeType&&e.style){var i,o,a,s=G(t),u=Xe.test(t),l=e.style;if(u||(t=Je(s)),a=w.cssHooks[t]||w.cssHooks[s],void 0===n)return a&&"get"in a&&void 0!==(i=a.get(e,!1,r))?i:l[t];"string"==(o=typeof n)&&(i=ie.exec(n))&&i[1]&&(n=ue(e,t,i),o="number"),null!=n&&n===n&&("number"===o&&(n+=i&&i[3]||(w.cssNumber[s]?"":"px")),h.clearCloneStyle||""!==n||0!==t.indexOf("background")||(l[t]="inherit"),a&&"set"in a&&void 0===(n=a.set(e,n,r))||(u?l.setProperty(t,n):l[t]=n))}},css:function(e,t,n,r){var i,o,a,s=G(t);return Xe.test(t)||(t=Je(s)),(a=w.cssHooks[t]||w.cssHooks[s])&&"get"in a&&(i=a.get(e,!0,n)),void 0===i&&(i=Fe(e,t,r)),"normal"===i&&t in Ve&&(i=Ve[t]),""===n||n?(o=parseFloat(i),!0===n||isFinite(o)?o||0:i):i}}),w.each(["height","width"],function(e,t){w.cssHooks[t]={get:function(e,n,r){if(n)return!ze.test(w.css(e,"display"))||e.getClientRects().length&&e.getBoundingClientRect().width?et(e,t,r):se(e,Ue,function(){return et(e,t,r)})},set:function(e,n,r){var i,o=$e(e),a="border-box"===w.css(e,"boxSizing",!1,o),s=r&&Ze(e,t,r,a,o);return a&&h.scrollboxSize()===o.position&&(s-=Math.ceil(e["offset"+t[0].toUpperCase()+t.slice(1)]-parseFloat(o[t])-Ze(e,t,"border",!1,o)-.5)),s&&(i=ie.exec(n))&&"px"!==(i[3]||"px")&&(e.style[t]=n,n=w.css(e,t)),Ke(e,n,s)}}}),w.cssHooks.marginLeft=_e(h.reliableMarginLeft,function(e,t){if(t)return(parseFloat(Fe(e,"marginLeft"))||e.getBoundingClientRect().left-se(e,{marginLeft:0},function(){return e.getBoundingClientRect().left}))+"px"}),w.each({margin:"",padding:"",border:"Width"},function(e,t){w.cssHooks[e+t]={expand:function(n){for(var r=0,i={},o="string"==typeof n?n.split(" "):[n];r<4;r++)i[e+oe[r]+t]=o[r]||o[r-2]||o[0];return i}},"margin"!==e&&(w.cssHooks[e+t].set=Ke)}),w.fn.extend({css:function(e,t){return z(this,function(e,t,n){var r,i,o={},a=0;if(Array.isArray(t)){for(r=$e(e),i=t.length;a<i;a++)o[t[a]]=w.css(e,t[a],!1,r);return o}return void 0!==n?w.style(e,t,n):w.css(e,t)},e,t,arguments.length>1)}});function tt(e,t,n,r,i){return new tt.prototype.init(e,t,n,r,i)}w.Tween=tt,tt.prototype={constructor:tt,init:function(e,t,n,r,i,o){this.elem=e,this.prop=n,this.easing=i||w.easing._default,this.options=t,this.start=this.now=this.cur(),this.end=r,this.unit=o||(w.cssNumber[n]?"":"px")},cur:function(){var e=tt.propHooks[this.prop];return e&&e.get?e.get(this):tt.propHooks._default.get(this)},run:function(e){var t,n=tt.propHooks[this.prop];return this.options.duration?this.pos=t=w.easing[this.easing](e,this.options.duration*e,0,1,this.options.duration):this.pos=t=e,this.now=(this.end-this.start)*t+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),n&&n.set?n.set(this):tt.propHooks._default.set(this),this}},tt.prototype.init.prototype=tt.prototype,tt.propHooks={_default:{get:function(e){var t;return 1!==e.elem.nodeType||null!=e.elem[e.prop]&&null==e.elem.style[e.prop]?e.elem[e.prop]:(t=w.css(e.elem,e.prop,""))&&"auto"!==t?t:0},set:function(e){w.fx.step[e.prop]?w.fx.step[e.prop](e):1!==e.elem.nodeType||null==e.elem.style[w.cssProps[e.prop]]&&!w.cssHooks[e.prop]?e.elem[e.prop]=e.now:w.style(e.elem,e.prop,e.now+e.unit)}}},tt.propHooks.scrollTop=tt.propHooks.scrollLeft={set:function(e){e.elem.nodeType&&e.elem.parentNode&&(e.elem[e.prop]=e.now)}},w.easing={linear:function(e){return e},swing:function(e){return.5-Math.cos(e*Math.PI)/2},_default:"swing"},w.fx=tt.prototype.init,w.fx.step={};var nt,rt,it=/^(?:toggle|show|hide)$/,ot=/queueHooks$/;function at(){rt&&(!1===r.hidden&&e.requestAnimationFrame?e.requestAnimationFrame(at):e.setTimeout(at,w.fx.interval),w.fx.tick())}function st(){return e.setTimeout(function(){nt=void 0}),nt=Date.now()}function ut(e,t){var n,r=0,i={height:e};for(t=t?1:0;r<4;r+=2-t)i["margin"+(n=oe[r])]=i["padding"+n]=e;return t&&(i.opacity=i.width=e),i}function lt(e,t,n){for(var r,i=(pt.tweeners[t]||[]).concat(pt.tweeners["*"]),o=0,a=i.length;o<a;o++)if(r=i[o].call(n,t,e))return r}function ct(e,t,n){var r,i,o,a,s,u,l,c,f="width"in t||"height"in t,p=this,d={},h=e.style,g=e.nodeType&&ae(e),y=J.get(e,"fxshow");n.queue||(null==(a=w._queueHooks(e,"fx")).unqueued&&(a.unqueued=0,s=a.empty.fire,a.empty.fire=function(){a.unqueued||s()}),a.unqueued++,p.always(function(){p.always(function(){a.unqueued--,w.queue(e,"fx").length||a.empty.fire()})}));for(r in t)if(i=t[r],it.test(i)){if(delete t[r],o=o||"toggle"===i,i===(g?"hide":"show")){if("show"!==i||!y||void 0===y[r])continue;g=!0}d[r]=y&&y[r]||w.style(e,r)}if((u=!w.isEmptyObject(t))||!w.isEmptyObject(d)){f&&1===e.nodeType&&(n.overflow=[h.overflow,h.overflowX,h.overflowY],null==(l=y&&y.display)&&(l=J.get(e,"display")),"none"===(c=w.css(e,"display"))&&(l?c=l:(fe([e],!0),l=e.style.display||l,c=w.css(e,"display"),fe([e]))),("inline"===c||"inline-block"===c&&null!=l)&&"none"===w.css(e,"float")&&(u||(p.done(function(){h.display=l}),null==l&&(c=h.display,l="none"===c?"":c)),h.display="inline-block")),n.overflow&&(h.overflow="hidden",p.always(function(){h.overflow=n.overflow[0],h.overflowX=n.overflow[1],h.overflowY=n.overflow[2]})),u=!1;for(r in d)u||(y?"hidden"in y&&(g=y.hidden):y=J.access(e,"fxshow",{display:l}),o&&(y.hidden=!g),g&&fe([e],!0),p.done(function(){g||fe([e]),J.remove(e,"fxshow");for(r in d)w.style(e,r,d[r])})),u=lt(g?y[r]:0,r,p),r in y||(y[r]=u.start,g&&(u.end=u.start,u.start=0))}}function ft(e,t){var n,r,i,o,a;for(n in e)if(r=G(n),i=t[r],o=e[n],Array.isArray(o)&&(i=o[1],o=e[n]=o[0]),n!==r&&(e[r]=o,delete e[n]),(a=w.cssHooks[r])&&"expand"in a){o=a.expand(o),delete e[r];for(n in o)n in e||(e[n]=o[n],t[n]=i)}else t[r]=i}function pt(e,t,n){var r,i,o=0,a=pt.prefilters.length,s=w.Deferred().always(function(){delete u.elem}),u=function(){if(i)return!1;for(var t=nt||st(),n=Math.max(0,l.startTime+l.duration-t),r=1-(n/l.duration||0),o=0,a=l.tweens.length;o<a;o++)l.tweens[o].run(r);return s.notifyWith(e,[l,r,n]),r<1&&a?n:(a||s.notifyWith(e,[l,1,0]),s.resolveWith(e,[l]),!1)},l=s.promise({elem:e,props:w.extend({},t),opts:w.extend(!0,{specialEasing:{},easing:w.easing._default},n),originalProperties:t,originalOptions:n,startTime:nt||st(),duration:n.duration,tweens:[],createTween:function(t,n){var r=w.Tween(e,l.opts,t,n,l.opts.specialEasing[t]||l.opts.easing);return l.tweens.push(r),r},stop:function(t){var n=0,r=t?l.tweens.length:0;if(i)return this;for(i=!0;n<r;n++)l.tweens[n].run(1);return t?(s.notifyWith(e,[l,1,0]),s.resolveWith(e,[l,t])):s.rejectWith(e,[l,t]),this}}),c=l.props;for(ft(c,l.opts.specialEasing);o<a;o++)if(r=pt.prefilters[o].call(l,e,c,l.opts))return g(r.stop)&&(w._queueHooks(l.elem,l.opts.queue).stop=r.stop.bind(r)),r;return w.map(c,lt,l),g(l.opts.start)&&l.opts.start.call(e,l),l.progress(l.opts.progress).done(l.opts.done,l.opts.complete).fail(l.opts.fail).always(l.opts.always),w.fx.timer(w.extend(u,{elem:e,anim:l,queue:l.opts.queue})),l}w.Animation=w.extend(pt,{tweeners:{"*":[function(e,t){var n=this.createTween(e,t);return ue(n.elem,e,ie.exec(t),n),n}]},tweener:function(e,t){g(e)?(t=e,e=["*"]):e=e.match(M);for(var n,r=0,i=e.length;r<i;r++)n=e[r],pt.tweeners[n]=pt.tweeners[n]||[],pt.tweeners[n].unshift(t)},prefilters:[ct],prefilter:function(e,t){t?pt.prefilters.unshift(e):pt.prefilters.push(e)}}),w.speed=function(e,t,n){var r=e&&"object"==typeof e?w.extend({},e):{complete:n||!n&&t||g(e)&&e,duration:e,easing:n&&t||t&&!g(t)&&t};return w.fx.off?r.duration=0:"number"!=typeof r.duration&&(r.duration in w.fx.speeds?r.duration=w.fx.speeds[r.duration]:r.duration=w.fx.speeds._default),null!=r.queue&&!0!==r.queue||(r.queue="fx"),r.old=r.complete,r.complete=function(){g(r.old)&&r.old.call(this),r.queue&&w.dequeue(this,r.queue)},r},w.fn.extend({fadeTo:function(e,t,n,r){return this.filter(ae).css("opacity",0).show().end().animate({opacity:t},e,n,r)},animate:function(e,t,n,r){var i=w.isEmptyObject(e),o=w.speed(t,n,r),a=function(){var t=pt(this,w.extend({},e),o);(i||J.get(this,"finish"))&&t.stop(!0)};return a.finish=a,i||!1===o.queue?this.each(a):this.queue(o.queue,a)},stop:function(e,t,n){var r=function(e){var t=e.stop;delete e.stop,t(n)};return"string"!=typeof e&&(n=t,t=e,e=void 0),t&&!1!==e&&this.queue(e||"fx",[]),this.each(function(){var t=!0,i=null!=e&&e+"queueHooks",o=w.timers,a=J.get(this);if(i)a[i]&&a[i].stop&&r(a[i]);else for(i in a)a[i]&&a[i].stop&&ot.test(i)&&r(a[i]);for(i=o.length;i--;)o[i].elem!==this||null!=e&&o[i].queue!==e||(o[i].anim.stop(n),t=!1,o.splice(i,1));!t&&n||w.dequeue(this,e)})},finish:function(e){return!1!==e&&(e=e||"fx"),this.each(function(){var t,n=J.get(this),r=n[e+"queue"],i=n[e+"queueHooks"],o=w.timers,a=r?r.length:0;for(n.finish=!0,w.queue(this,e,[]),i&&i.stop&&i.stop.call(this,!0),t=o.length;t--;)o[t].elem===this&&o[t].queue===e&&(o[t].anim.stop(!0),o.splice(t,1));for(t=0;t<a;t++)r[t]&&r[t].finish&&r[t].finish.call(this);delete n.finish})}}),w.each(["toggle","show","hide"],function(e,t){var n=w.fn[t];w.fn[t]=function(e,r,i){return null==e||"boolean"==typeof e?n.apply(this,arguments):this.animate(ut(t,!0),e,r,i)}}),w.each({slideDown:ut("show"),slideUp:ut("hide"),slideToggle:ut("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(e,t){w.fn[e]=function(e,n,r){return this.animate(t,e,n,r)}}),w.timers=[],w.fx.tick=function(){var e,t=0,n=w.timers;for(nt=Date.now();t<n.length;t++)(e=n[t])()||n[t]!==e||n.splice(t--,1);n.length||w.fx.stop(),nt=void 0},w.fx.timer=function(e){w.timers.push(e),w.fx.start()},w.fx.interval=13,w.fx.start=function(){rt||(rt=!0,at())},w.fx.stop=function(){rt=null},w.fx.speeds={slow:600,fast:200,_default:400},w.fn.delay=function(t,n){return t=w.fx?w.fx.speeds[t]||t:t,n=n||"fx",this.queue(n,function(n,r){var i=e.setTimeout(n,t);r.stop=function(){e.clearTimeout(i)}})},function(){var e=r.createElement("input"),t=r.createElement("select").appendChild(r.createElement("option"));e.type="checkbox",h.checkOn=""!==e.value,h.optSelected=t.selected,(e=r.createElement("input")).value="t",e.type="radio",h.radioValue="t"===e.value}();var dt,ht=w.expr.attrHandle;w.fn.extend({attr:function(e,t){return z(this,w.attr,e,t,arguments.length>1)},removeAttr:function(e){return this.each(function(){w.removeAttr(this,e)})}}),w.extend({attr:function(e,t,n){var r,i,o=e.nodeType;if(3!==o&&8!==o&&2!==o)return"undefined"==typeof e.getAttribute?w.prop(e,t,n):(1===o&&w.isXMLDoc(e)||(i=w.attrHooks[t.toLowerCase()]||(w.expr.match.bool.test(t)?dt:void 0)),void 0!==n?null===n?void w.removeAttr(e,t):i&&"set"in i&&void 0!==(r=i.set(e,n,t))?r:(e.setAttribute(t,n+""),n):i&&"get"in i&&null!==(r=i.get(e,t))?r:null==(r=w.find.attr(e,t))?void 0:r)},attrHooks:{type:{set:function(e,t){if(!h.radioValue&&"radio"===t&&N(e,"input")){var n=e.value;return e.setAttribute("type",t),n&&(e.value=n),t}}}},removeAttr:function(e,t){var n,r=0,i=t&&t.match(M);if(i&&1===e.nodeType)while(n=i[r++])e.removeAttribute(n)}}),dt={set:function(e,t,n){return!1===t?w.removeAttr(e,n):e.setAttribute(n,n),n}},w.each(w.expr.match.bool.source.match(/\w+/g),function(e,t){var n=ht[t]||w.find.attr;ht[t]=function(e,t,r){var i,o,a=t.toLowerCase();return r||(o=ht[a],ht[a]=i,i=null!=n(e,t,r)?a:null,ht[a]=o),i}});var gt=/^(?:input|select|textarea|button)$/i,yt=/^(?:a|area)$/i;w.fn.extend({prop:function(e,t){return z(this,w.prop,e,t,arguments.length>1)},removeProp:function(e){return this.each(function(){delete this[w.propFix[e]||e]})}}),w.extend({prop:function(e,t,n){var r,i,o=e.nodeType;if(3!==o&&8!==o&&2!==o)return 1===o&&w.isXMLDoc(e)||(t=w.propFix[t]||t,i=w.propHooks[t]),void 0!==n?i&&"set"in i&&void 0!==(r=i.set(e,n,t))?r:e[t]=n:i&&"get"in i&&null!==(r=i.get(e,t))?r:e[t]},propHooks:{tabIndex:{get:function(e){var t=w.find.attr(e,"tabindex");return t?parseInt(t,10):gt.test(e.nodeName)||yt.test(e.nodeName)&&e.href?0:-1}}},propFix:{"for":"htmlFor","class":"className"}}),h.optSelected||(w.propHooks.selected={get:function(e){var t=e.parentNode;return t&&t.parentNode&&t.parentNode.selectedIndex,null},set:function(e){var t=e.parentNode;t&&(t.selectedIndex,t.parentNode&&t.parentNode.selectedIndex)}}),w.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){w.propFix[this.toLowerCase()]=this});function vt(e){return(e.match(M)||[]).join(" ")}function mt(e){return e.getAttribute&&e.getAttribute("class")||""}function xt(e){return Array.isArray(e)?e:"string"==typeof e?e.match(M)||[]:[]}w.fn.extend({addClass:function(e){var t,n,r,i,o,a,s,u=0;if(g(e))return this.each(function(t){w(this).addClass(e.call(this,t,mt(this)))});if((t=xt(e)).length)while(n=this[u++])if(i=mt(n),r=1===n.nodeType&&" "+vt(i)+" "){a=0;while(o=t[a++])r.indexOf(" "+o+" ")<0&&(r+=o+" ");i!==(s=vt(r))&&n.setAttribute("class",s)}return this},removeClass:function(e){var t,n,r,i,o,a,s,u=0;if(g(e))return this.each(function(t){w(this).removeClass(e.call(this,t,mt(this)))});if(!arguments.length)return this.attr("class","");if((t=xt(e)).length)while(n=this[u++])if(i=mt(n),r=1===n.nodeType&&" "+vt(i)+" "){a=0;while(o=t[a++])while(r.indexOf(" "+o+" ")>-1)r=r.replace(" "+o+" "," ");i!==(s=vt(r))&&n.setAttribute("class",s)}return this},toggleClass:function(e,t){var n=typeof e,r="string"===n||Array.isArray(e);return"boolean"==typeof t&&r?t?this.addClass(e):this.removeClass(e):g(e)?this.each(function(n){w(this).toggleClass(e.call(this,n,mt(this),t),t)}):this.each(function(){var t,i,o,a;if(r){i=0,o=w(this),a=xt(e);while(t=a[i++])o.hasClass(t)?o.removeClass(t):o.addClass(t)}else void 0!==e&&"boolean"!==n||((t=mt(this))&&J.set(this,"__className__",t),this.setAttribute&&this.setAttribute("class",t||!1===e?"":J.get(this,"__className__")||""))})},hasClass:function(e){var t,n,r=0;t=" "+e+" ";while(n=this[r++])if(1===n.nodeType&&(" "+vt(mt(n))+" ").indexOf(t)>-1)return!0;return!1}});var bt=/\r/g;w.fn.extend({val:function(e){var t,n,r,i=this[0];{if(arguments.length)return r=g(e),this.each(function(n){var i;1===this.nodeType&&(null==(i=r?e.call(this,n,w(this).val()):e)?i="":"number"==typeof i?i+="":Array.isArray(i)&&(i=w.map(i,function(e){return null==e?"":e+""})),(t=w.valHooks[this.type]||w.valHooks[this.nodeName.toLowerCase()])&&"set"in t&&void 0!==t.set(this,i,"value")||(this.value=i))});if(i)return(t=w.valHooks[i.type]||w.valHooks[i.nodeName.toLowerCase()])&&"get"in t&&void 0!==(n=t.get(i,"value"))?n:"string"==typeof(n=i.value)?n.replace(bt,""):null==n?"":n}}}),w.extend({valHooks:{option:{get:function(e){var t=w.find.attr(e,"value");return null!=t?t:vt(w.text(e))}},select:{get:function(e){var t,n,r,i=e.options,o=e.selectedIndex,a="select-one"===e.type,s=a?null:[],u=a?o+1:i.length;for(r=o<0?u:a?o:0;r<u;r++)if(((n=i[r]).selected||r===o)&&!n.disabled&&(!n.parentNode.disabled||!N(n.parentNode,"optgroup"))){if(t=w(n).val(),a)return t;s.push(t)}return s},set:function(e,t){var n,r,i=e.options,o=w.makeArray(t),a=i.length;while(a--)((r=i[a]).selected=w.inArray(w.valHooks.option.get(r),o)>-1)&&(n=!0);return n||(e.selectedIndex=-1),o}}}}),w.each(["radio","checkbox"],function(){w.valHooks[this]={set:function(e,t){if(Array.isArray(t))return e.checked=w.inArray(w(e).val(),t)>-1}},h.checkOn||(w.valHooks[this].get=function(e){return null===e.getAttribute("value")?"on":e.value})}),h.focusin="onfocusin"in e;var wt=/^(?:focusinfocus|focusoutblur)$/,Tt=function(e){e.stopPropagation()};w.extend(w.event,{trigger:function(t,n,i,o){var a,s,u,l,c,p,d,h,v=[i||r],m=f.call(t,"type")?t.type:t,x=f.call(t,"namespace")?t.namespace.split("."):[];if(s=h=u=i=i||r,3!==i.nodeType&&8!==i.nodeType&&!wt.test(m+w.event.triggered)&&(m.indexOf(".")>-1&&(m=(x=m.split(".")).shift(),x.sort()),c=m.indexOf(":")<0&&"on"+m,t=t[w.expando]?t:new w.Event(m,"object"==typeof t&&t),t.isTrigger=o?2:3,t.namespace=x.join("."),t.rnamespace=t.namespace?new RegExp("(^|\\.)"+x.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,t.result=void 0,t.target||(t.target=i),n=null==n?[t]:w.makeArray(n,[t]),d=w.event.special[m]||{},o||!d.trigger||!1!==d.trigger.apply(i,n))){if(!o&&!d.noBubble&&!y(i)){for(l=d.delegateType||m,wt.test(l+m)||(s=s.parentNode);s;s=s.parentNode)v.push(s),u=s;u===(i.ownerDocument||r)&&v.push(u.defaultView||u.parentWindow||e)}a=0;while((s=v[a++])&&!t.isPropagationStopped())h=s,t.type=a>1?l:d.bindType||m,(p=(J.get(s,"events")||{})[t.type]&&J.get(s,"handle"))&&p.apply(s,n),(p=c&&s[c])&&p.apply&&Y(s)&&(t.result=p.apply(s,n),!1===t.result&&t.preventDefault());return t.type=m,o||t.isDefaultPrevented()||d._default&&!1!==d._default.apply(v.pop(),n)||!Y(i)||c&&g(i[m])&&!y(i)&&((u=i[c])&&(i[c]=null),w.event.triggered=m,t.isPropagationStopped()&&h.addEventListener(m,Tt),i[m](),t.isPropagationStopped()&&h.removeEventListener(m,Tt),w.event.triggered=void 0,u&&(i[c]=u)),t.result}},simulate:function(e,t,n){var r=w.extend(new w.Event,n,{type:e,isSimulated:!0});w.event.trigger(r,null,t)}}),w.fn.extend({trigger:function(e,t){return this.each(function(){w.event.trigger(e,t,this)})},triggerHandler:function(e,t){var n=this[0];if(n)return w.event.trigger(e,t,n,!0)}}),h.focusin||w.each({focus:"focusin",blur:"focusout"},function(e,t){var n=function(e){w.event.simulate(t,e.target,w.event.fix(e))};w.event.special[t]={setup:function(){var r=this.ownerDocument||this,i=J.access(r,t);i||r.addEventListener(e,n,!0),J.access(r,t,(i||0)+1)},teardown:function(){var r=this.ownerDocument||this,i=J.access(r,t)-1;i?J.access(r,t,i):(r.removeEventListener(e,n,!0),J.remove(r,t))}}});var Ct=e.location,Et=Date.now(),kt=/\?/;w.parseXML=function(t){var n;if(!t||"string"!=typeof t)return null;try{n=(new e.DOMParser).parseFromString(t,"text/xml")}catch(e){n=void 0}return n&&!n.getElementsByTagName("parsererror").length||w.error("Invalid XML: "+t),n};var St=/\[\]$/,Dt=/\r?\n/g,Nt=/^(?:submit|button|image|reset|file)$/i,At=/^(?:input|select|textarea|keygen)/i;function jt(e,t,n,r){var i;if(Array.isArray(t))w.each(t,function(t,i){n||St.test(e)?r(e,i):jt(e+"["+("object"==typeof i&&null!=i?t:"")+"]",i,n,r)});else if(n||"object"!==x(t))r(e,t);else for(i in t)jt(e+"["+i+"]",t[i],n,r)}w.param=function(e,t){var n,r=[],i=function(e,t){var n=g(t)?t():t;r[r.length]=encodeURIComponent(e)+"="+encodeURIComponent(null==n?"":n)};if(Array.isArray(e)||e.jquery&&!w.isPlainObject(e))w.each(e,function(){i(this.name,this.value)});else for(n in e)jt(n,e[n],t,i);return r.join("&")},w.fn.extend({serialize:function(){return w.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var e=w.prop(this,"elements");return e?w.makeArray(e):this}).filter(function(){var e=this.type;return this.name&&!w(this).is(":disabled")&&At.test(this.nodeName)&&!Nt.test(e)&&(this.checked||!pe.test(e))}).map(function(e,t){var n=w(this).val();return null==n?null:Array.isArray(n)?w.map(n,function(e){return{name:t.name,value:e.replace(Dt,"\r\n")}}):{name:t.name,value:n.replace(Dt,"\r\n")}}).get()}});var qt=/%20/g,Lt=/#.*$/,Ht=/([?&])_=[^&]*/,Ot=/^(.*?):[ \t]*([^\r\n]*)$/gm,Pt=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,Mt=/^(?:GET|HEAD)$/,Rt=/^\/\//,It={},Wt={},$t="*/".concat("*"),Bt=r.createElement("a");Bt.href=Ct.href;function Ft(e){return function(t,n){"string"!=typeof t&&(n=t,t="*");var r,i=0,o=t.toLowerCase().match(M)||[];if(g(n))while(r=o[i++])"+"===r[0]?(r=r.slice(1)||"*",(e[r]=e[r]||[]).unshift(n)):(e[r]=e[r]||[]).push(n)}}function _t(e,t,n,r){var i={},o=e===Wt;function a(s){var u;return i[s]=!0,w.each(e[s]||[],function(e,s){var l=s(t,n,r);return"string"!=typeof l||o||i[l]?o?!(u=l):void 0:(t.dataTypes.unshift(l),a(l),!1)}),u}return a(t.dataTypes[0])||!i["*"]&&a("*")}function zt(e,t){var n,r,i=w.ajaxSettings.flatOptions||{};for(n in t)void 0!==t[n]&&((i[n]?e:r||(r={}))[n]=t[n]);return r&&w.extend(!0,e,r),e}function Xt(e,t,n){var r,i,o,a,s=e.contents,u=e.dataTypes;while("*"===u[0])u.shift(),void 0===r&&(r=e.mimeType||t.getResponseHeader("Content-Type"));if(r)for(i in s)if(s[i]&&s[i].test(r)){u.unshift(i);break}if(u[0]in n)o=u[0];else{for(i in n){if(!u[0]||e.converters[i+" "+u[0]]){o=i;break}a||(a=i)}o=o||a}if(o)return o!==u[0]&&u.unshift(o),n[o]}function Ut(e,t,n,r){var i,o,a,s,u,l={},c=e.dataTypes.slice();if(c[1])for(a in e.converters)l[a.toLowerCase()]=e.converters[a];o=c.shift();while(o)if(e.responseFields[o]&&(n[e.responseFields[o]]=t),!u&&r&&e.dataFilter&&(t=e.dataFilter(t,e.dataType)),u=o,o=c.shift())if("*"===o)o=u;else if("*"!==u&&u!==o){if(!(a=l[u+" "+o]||l["* "+o]))for(i in l)if((s=i.split(" "))[1]===o&&(a=l[u+" "+s[0]]||l["* "+s[0]])){!0===a?a=l[i]:!0!==l[i]&&(o=s[0],c.unshift(s[1]));break}if(!0!==a)if(a&&e["throws"])t=a(t);else try{t=a(t)}catch(e){return{state:"parsererror",error:a?e:"No conversion from "+u+" to "+o}}}return{state:"success",data:t}}w.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:Ct.href,type:"GET",isLocal:Pt.test(Ct.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":$t,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":JSON.parse,"text xml":w.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(e,t){return t?zt(zt(e,w.ajaxSettings),t):zt(w.ajaxSettings,e)},ajaxPrefilter:Ft(It),ajaxTransport:Ft(Wt),ajax:function(t,n){"object"==typeof t&&(n=t,t=void 0),n=n||{};var i,o,a,s,u,l,c,f,p,d,h=w.ajaxSetup({},n),g=h.context||h,y=h.context&&(g.nodeType||g.jquery)?w(g):w.event,v=w.Deferred(),m=w.Callbacks("once memory"),x=h.statusCode||{},b={},T={},C="canceled",E={readyState:0,getResponseHeader:function(e){var t;if(c){if(!s){s={};while(t=Ot.exec(a))s[t[1].toLowerCase()]=t[2]}t=s[e.toLowerCase()]}return null==t?null:t},getAllResponseHeaders:function(){return c?a:null},setRequestHeader:function(e,t){return null==c&&(e=T[e.toLowerCase()]=T[e.toLowerCase()]||e,b[e]=t),this},overrideMimeType:function(e){return null==c&&(h.mimeType=e),this},statusCode:function(e){var t;if(e)if(c)E.always(e[E.status]);else for(t in e)x[t]=[x[t],e[t]];return this},abort:function(e){var t=e||C;return i&&i.abort(t),k(0,t),this}};if(v.promise(E),h.url=((t||h.url||Ct.href)+"").replace(Rt,Ct.protocol+"//"),h.type=n.method||n.type||h.method||h.type,h.dataTypes=(h.dataType||"*").toLowerCase().match(M)||[""],null==h.crossDomain){l=r.createElement("a");try{l.href=h.url,l.href=l.href,h.crossDomain=Bt.protocol+"//"+Bt.host!=l.protocol+"//"+l.host}catch(e){h.crossDomain=!0}}if(h.data&&h.processData&&"string"!=typeof h.data&&(h.data=w.param(h.data,h.traditional)),_t(It,h,n,E),c)return E;(f=w.event&&h.global)&&0==w.active++&&w.event.trigger("ajaxStart"),h.type=h.type.toUpperCase(),h.hasContent=!Mt.test(h.type),o=h.url.replace(Lt,""),h.hasContent?h.data&&h.processData&&0===(h.contentType||"").indexOf("application/x-www-form-urlencoded")&&(h.data=h.data.replace(qt,"+")):(d=h.url.slice(o.length),h.data&&(h.processData||"string"==typeof h.data)&&(o+=(kt.test(o)?"&":"?")+h.data,delete h.data),!1===h.cache&&(o=o.replace(Ht,"$1"),d=(kt.test(o)?"&":"?")+"_="+Et+++d),h.url=o+d),h.ifModified&&(w.lastModified[o]&&E.setRequestHeader("If-Modified-Since",w.lastModified[o]),w.etag[o]&&E.setRequestHeader("If-None-Match",w.etag[o])),(h.data&&h.hasContent&&!1!==h.contentType||n.contentType)&&E.setRequestHeader("Content-Type",h.contentType),E.setRequestHeader("Accept",h.dataTypes[0]&&h.accepts[h.dataTypes[0]]?h.accepts[h.dataTypes[0]]+("*"!==h.dataTypes[0]?", "+$t+"; q=0.01":""):h.accepts["*"]);for(p in h.headers)E.setRequestHeader(p,h.headers[p]);if(h.beforeSend&&(!1===h.beforeSend.call(g,E,h)||c))return E.abort();if(C="abort",m.add(h.complete),E.done(h.success),E.fail(h.error),i=_t(Wt,h,n,E)){if(E.readyState=1,f&&y.trigger("ajaxSend",[E,h]),c)return E;h.async&&h.timeout>0&&(u=e.setTimeout(function(){E.abort("timeout")},h.timeout));try{c=!1,i.send(b,k)}catch(e){if(c)throw e;k(-1,e)}}else k(-1,"No Transport");function k(t,n,r,s){var l,p,d,b,T,C=n;c||(c=!0,u&&e.clearTimeout(u),i=void 0,a=s||"",E.readyState=t>0?4:0,l=t>=200&&t<300||304===t,r&&(b=Xt(h,E,r)),b=Ut(h,b,E,l),l?(h.ifModified&&((T=E.getResponseHeader("Last-Modified"))&&(w.lastModified[o]=T),(T=E.getResponseHeader("etag"))&&(w.etag[o]=T)),204===t||"HEAD"===h.type?C="nocontent":304===t?C="notmodified":(C=b.state,p=b.data,l=!(d=b.error))):(d=C,!t&&C||(C="error",t<0&&(t=0))),E.status=t,E.statusText=(n||C)+"",l?v.resolveWith(g,[p,C,E]):v.rejectWith(g,[E,C,d]),E.statusCode(x),x=void 0,f&&y.trigger(l?"ajaxSuccess":"ajaxError",[E,h,l?p:d]),m.fireWith(g,[E,C]),f&&(y.trigger("ajaxComplete",[E,h]),--w.active||w.event.trigger("ajaxStop")))}return E},getJSON:function(e,t,n){return w.get(e,t,n,"json")},getScript:function(e,t){return w.get(e,void 0,t,"script")}}),w.each(["get","post"],function(e,t){w[t]=function(e,n,r,i){return g(n)&&(i=i||r,r=n,n=void 0),w.ajax(w.extend({url:e,type:t,dataType:i,data:n,success:r},w.isPlainObject(e)&&e))}}),w._evalUrl=function(e){return w.ajax({url:e,type:"GET",dataType:"script",cache:!0,async:!1,global:!1,"throws":!0})},w.fn.extend({wrapAll:function(e){var t;return this[0]&&(g(e)&&(e=e.call(this[0])),t=w(e,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&t.insertBefore(this[0]),t.map(function(){var e=this;while(e.firstElementChild)e=e.firstElementChild;return e}).append(this)),this},wrapInner:function(e){return g(e)?this.each(function(t){w(this).wrapInner(e.call(this,t))}):this.each(function(){var t=w(this),n=t.contents();n.length?n.wrapAll(e):t.append(e)})},wrap:function(e){var t=g(e);return this.each(function(n){w(this).wrapAll(t?e.call(this,n):e)})},unwrap:function(e){return this.parent(e).not("body").each(function(){w(this).replaceWith(this.childNodes)}),this}}),w.expr.pseudos.hidden=function(e){return!w.expr.pseudos.visible(e)},w.expr.pseudos.visible=function(e){return!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)},w.ajaxSettings.xhr=function(){try{return new e.XMLHttpRequest}catch(e){}};var Vt={0:200,1223:204},Gt=w.ajaxSettings.xhr();h.cors=!!Gt&&"withCredentials"in Gt,h.ajax=Gt=!!Gt,w.ajaxTransport(function(t){var n,r;if(h.cors||Gt&&!t.crossDomain)return{send:function(i,o){var a,s=t.xhr();if(s.open(t.type,t.url,t.async,t.username,t.password),t.xhrFields)for(a in t.xhrFields)s[a]=t.xhrFields[a];t.mimeType&&s.overrideMimeType&&s.overrideMimeType(t.mimeType),t.crossDomain||i["X-Requested-With"]||(i["X-Requested-With"]="XMLHttpRequest");for(a in i)s.setRequestHeader(a,i[a]);n=function(e){return function(){n&&(n=r=s.onload=s.onerror=s.onabort=s.ontimeout=s.onreadystatechange=null,"abort"===e?s.abort():"error"===e?"number"!=typeof s.status?o(0,"error"):o(s.status,s.statusText):o(Vt[s.status]||s.status,s.statusText,"text"!==(s.responseType||"text")||"string"!=typeof s.responseText?{binary:s.response}:{text:s.responseText},s.getAllResponseHeaders()))}},s.onload=n(),r=s.onerror=s.ontimeout=n("error"),void 0!==s.onabort?s.onabort=r:s.onreadystatechange=function(){4===s.readyState&&e.setTimeout(function(){n&&r()})},n=n("abort");try{s.send(t.hasContent&&t.data||null)}catch(e){if(n)throw e}},abort:function(){n&&n()}}}),w.ajaxPrefilter(function(e){e.crossDomain&&(e.contents.script=!1)}),w.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(e){return w.globalEval(e),e}}}),w.ajaxPrefilter("script",function(e){void 0===e.cache&&(e.cache=!1),e.crossDomain&&(e.type="GET")}),w.ajaxTransport("script",function(e){if(e.crossDomain){var t,n;return{send:function(i,o){t=w("<script>").prop({charset:e.scriptCharset,src:e.url}).on("load error",n=function(e){t.remove(),n=null,e&&o("error"===e.type?404:200,e.type)}),r.head.appendChild(t[0])},abort:function(){n&&n()}}}});var Yt=[],Qt=/(=)\?(?=&|$)|\?\?/;w.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var e=Yt.pop()||w.expando+"_"+Et++;return this[e]=!0,e}}),w.ajaxPrefilter("json jsonp",function(t,n,r){var i,o,a,s=!1!==t.jsonp&&(Qt.test(t.url)?"url":"string"==typeof t.data&&0===(t.contentType||"").indexOf("application/x-www-form-urlencoded")&&Qt.test(t.data)&&"data");if(s||"jsonp"===t.dataTypes[0])return i=t.jsonpCallback=g(t.jsonpCallback)?t.jsonpCallback():t.jsonpCallback,s?t[s]=t[s].replace(Qt,"$1"+i):!1!==t.jsonp&&(t.url+=(kt.test(t.url)?"&":"?")+t.jsonp+"="+i),t.converters["script json"]=function(){return a||w.error(i+" was not called"),a[0]},t.dataTypes[0]="json",o=e[i],e[i]=function(){a=arguments},r.always(function(){void 0===o?w(e).removeProp(i):e[i]=o,t[i]&&(t.jsonpCallback=n.jsonpCallback,Yt.push(i)),a&&g(o)&&o(a[0]),a=o=void 0}),"script"}),h.createHTMLDocument=function(){var e=r.implementation.createHTMLDocument("").body;return e.innerHTML="<form></form><form></form>",2===e.childNodes.length}(),w.parseHTML=function(e,t,n){if("string"!=typeof e)return[];"boolean"==typeof t&&(n=t,t=!1);var i,o,a;return t||(h.createHTMLDocument?((i=(t=r.implementation.createHTMLDocument("")).createElement("base")).href=r.location.href,t.head.appendChild(i)):t=r),o=A.exec(e),a=!n&&[],o?[t.createElement(o[1])]:(o=xe([e],t,a),a&&a.length&&w(a).remove(),w.merge([],o.childNodes))},w.fn.load=function(e,t,n){var r,i,o,a=this,s=e.indexOf(" ");return s>-1&&(r=vt(e.slice(s)),e=e.slice(0,s)),g(t)?(n=t,t=void 0):t&&"object"==typeof t&&(i="POST"),a.length>0&&w.ajax({url:e,type:i||"GET",dataType:"html",data:t}).done(function(e){o=arguments,a.html(r?w("<div>").append(w.parseHTML(e)).find(r):e)}).always(n&&function(e,t){a.each(function(){n.apply(this,o||[e.responseText,t,e])})}),this},w.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(e,t){w.fn[t]=function(e){return this.on(t,e)}}),w.expr.pseudos.animated=function(e){return w.grep(w.timers,function(t){return e===t.elem}).length},w.offset={setOffset:function(e,t,n){var r,i,o,a,s,u,l,c=w.css(e,"position"),f=w(e),p={};"static"===c&&(e.style.position="relative"),s=f.offset(),o=w.css(e,"top"),u=w.css(e,"left"),(l=("absolute"===c||"fixed"===c)&&(o+u).indexOf("auto")>-1)?(a=(r=f.position()).top,i=r.left):(a=parseFloat(o)||0,i=parseFloat(u)||0),g(t)&&(t=t.call(e,n,w.extend({},s))),null!=t.top&&(p.top=t.top-s.top+a),null!=t.left&&(p.left=t.left-s.left+i),"using"in t?t.using.call(e,p):f.css(p)}},w.fn.extend({offset:function(e){if(arguments.length)return void 0===e?this:this.each(function(t){w.offset.setOffset(this,e,t)});var t,n,r=this[0];if(r)return r.getClientRects().length?(t=r.getBoundingClientRect(),n=r.ownerDocument.defaultView,{top:t.top+n.pageYOffset,left:t.left+n.pageXOffset}):{top:0,left:0}},position:function(){if(this[0]){var e,t,n,r=this[0],i={top:0,left:0};if("fixed"===w.css(r,"position"))t=r.getBoundingClientRect();else{t=this.offset(),n=r.ownerDocument,e=r.offsetParent||n.documentElement;while(e&&(e===n.body||e===n.documentElement)&&"static"===w.css(e,"position"))e=e.parentNode;e&&e!==r&&1===e.nodeType&&((i=w(e).offset()).top+=w.css(e,"borderTopWidth",!0),i.left+=w.css(e,"borderLeftWidth",!0))}return{top:t.top-i.top-w.css(r,"marginTop",!0),left:t.left-i.left-w.css(r,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var e=this.offsetParent;while(e&&"static"===w.css(e,"position"))e=e.offsetParent;return e||be})}}),w.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(e,t){var n="pageYOffset"===t;w.fn[e]=function(r){return z(this,function(e,r,i){var o;if(y(e)?o=e:9===e.nodeType&&(o=e.defaultView),void 0===i)return o?o[t]:e[r];o?o.scrollTo(n?o.pageXOffset:i,n?i:o.pageYOffset):e[r]=i},e,r,arguments.length)}}),w.each(["top","left"],function(e,t){w.cssHooks[t]=_e(h.pixelPosition,function(e,n){if(n)return n=Fe(e,t),We.test(n)?w(e).position()[t]+"px":n})}),w.each({Height:"height",Width:"width"},function(e,t){w.each({padding:"inner"+e,content:t,"":"outer"+e},function(n,r){w.fn[r]=function(i,o){var a=arguments.length&&(n||"boolean"!=typeof i),s=n||(!0===i||!0===o?"margin":"border");return z(this,function(t,n,i){var o;return y(t)?0===r.indexOf("outer")?t["inner"+e]:t.document.documentElement["client"+e]:9===t.nodeType?(o=t.documentElement,Math.max(t.body["scroll"+e],o["scroll"+e],t.body["offset"+e],o["offset"+e],o["client"+e])):void 0===i?w.css(t,n,s):w.style(t,n,i,s)},t,a?i:void 0,a)}})}),w.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "),function(e,t){w.fn[t]=function(e,n){return arguments.length>0?this.on(t,null,e,n):this.trigger(t)}}),w.fn.extend({hover:function(e,t){return this.mouseenter(e).mouseleave(t||e)}}),w.fn.extend({bind:function(e,t,n){return this.on(e,null,t,n)},unbind:function(e,t){return this.off(e,null,t)},delegate:function(e,t,n,r){return this.on(t,e,n,r)},undelegate:function(e,t,n){return 1===arguments.length?this.off(e,"**"):this.off(t,e||"**",n)}}),w.proxy=function(e,t){var n,r,i;if("string"==typeof t&&(n=e[t],t=e,e=n),g(e))return r=o.call(arguments,2),i=function(){return e.apply(t||this,r.concat(o.call(arguments)))},i.guid=e.guid=e.guid||w.guid++,i},w.holdReady=function(e){e?w.readyWait++:w.ready(!0)},w.isArray=Array.isArray,w.parseJSON=JSON.parse,w.nodeName=N,w.isFunction=g,w.isWindow=y,w.camelCase=G,w.type=x,w.now=Date.now,w.isNumeric=function(e){var t=w.type(e);return("number"===t||"string"===t)&&!isNaN(e-parseFloat(e))},"function"==typeof define&&define.amd&&define("jquery",[],function(){return w});var Jt=e.ScJQuery_QO,Kt=e.$;return w.noConflict=function(t){return e.$===w&&(e.$=Kt),t&&e.ScJQuery_QO===w&&(e.ScJQuery_QO=Jt),w},t||(e.ScJQuery_QO=e.$=w),w});
if (typeof jQuery !== 'undefined' && jQuery!=null) $ = jQuery.noConflict();

//jquery.custombox
!function(e,t,s,i){"use strict";var n="custombox",o={url:null,cache:!1,escKey:!0,eClose:null,zIndex:9999,overlay:!0,overlayColor:"#000",overlayOpacity:.8,overlayClose:!0,overlaySpeed:200,customClass:null,width:null,height:null,effect:"fadein",position:null,speed:600,open:null,complete:null,close:null,responsive:!0,scrollbar:!1,error:"Error 404!"};function l(e,t){this.element=e,"object"==typeof this.element&&"object"==typeof t&&isNaN(t.zIndex)&&"auto"===t.zIndex&&(t.zIndex=this._isIE()?o.zIndex:this._zIndex()),this.settings=this._extend({},o,t),"object"==typeof this.element?this._box.init(this):this[this.element]()}l.prototype={_overlay:function(){var e=this._hexToRgb(this.settings.overlayColor),t={};-1!=navigator.appVersion.indexOf("MSIE 8.")?(t.backgroundColor=this.settings.overlayColor,t.zIndex=parseFloat(this.settings.zIndex)+1,t.filter="alpha(opacity="+100*this.settings.overlayOpacity+")"):(t["background-color"]="rgba("+e.r+","+e.g+", "+e.b+","+this.settings.overlayOpacity+")",t["z-index"]=parseFloat(this.settings.zIndex)+1,t.transition="all "+this.settings.overlaySpeed/1e3+"s"),s.getElementsByTagName("body")[0].appendChild(this._create({id:"overlay",eClass:"overlay"},t))},_box:{init:function(e){e.settings.open&&"function"==typeof e.settings.open&&e.settings.open(void 0!==arguments[0]?arguments[0]:""),null===e.settings.url&&null!==e.element&&(e.settings.url=e.element.getAttribute("href")),"string"==typeof e.settings.url?"#"===e.settings.url.charAt(0)||"."===e.settings.url.charAt(0)?s.querySelector(e.settings.url)?e._box.build(e,s.querySelector(e.settings.url).cloneNode(!0)):e._box.build(e,null):this.ajax(e):e._box.build(e,null)},create:function(e){var t={};e._isIE()?t.zIndex=parseFloat(e.settings.zIndex)+2:t["z-index"]=parseFloat(e.settings.zIndex)+2;var i=e._create({id:"modal",eClass:"modal "+e._box.effect(e)+(e.settings.customClass?" "+e.settings.customClass:"")},t),n=e._create({id:"modal-content",eClass:"modal-content"},{"transition-duration":e.settings.speed+"ms"});return i.appendChild(n),s.body.insertBefore(i,s.body.firstChild),e.settings.overlay&&e._overlay(),[i,n]},effect:function(e){var t=["slide","flip","rotate"],i=["letmein","makeway","slip","blur"],o=n+"-"+e.settings.effect,l="";null!==e.settings.position&&-1!==e.settings.position.indexOf(",")&&(e.settings.position=e.settings.position.split(","),e.settings.position.length>1&&(l=" "+n+"-"+e.settings.effect+"-"+e.settings.position[0].replace(/^\s+|\s+$/g,"")+"-"+e.settings.position[1].replace(/^\s+|\s+$/g,"")));for(var r=0,a=t.length;r<a;r++)t[r]===e.settings.effect&&(o=n+"-"+e.settings.effect+"-"+(""!==l?e.settings.position[0]:e.settings.position)+l);for(var d=0,c=i.length;d<c;d++)if(i[d]===e.settings.effect){"blur"!==e.settings.effect&&e._addClass(s.getElementsByTagName("html")[0],"perspective");var g=s.createElement("div");for(g.className=n+"-container";s.body.firstChild;)g.appendChild(s.body.firstChild);s.body.appendChild(g)}return o},build:function(e,i){var o=s.body,l=s.documentElement,r=l&&l.scrollTop||o&&o.scrollTop||0;if(!1!==e.settings.error&&"string"==typeof e.settings.error){null===i&&(i=s.createElement("div"),e._addClass(i,"error"),i.innerHTML=e.settings.error);var a=e._box.create(e);a[1].appendChild(i),i.style.display="block",a[0].setAttribute("data-"+n+"-scroll",r);var d={width:parseInt(e.settings.width,0),height:parseInt(e.settings.height,0)};isNaN(d.width)||d.width!==e.settings.width||d.width.toString()!==e.settings.width.toString()||null===d.width||(i.style.width=d.width+"px"),isNaN(d.height)||d.height!==e.settings.height||d.height.toString()!==e.settings.height.toString()||null===d.height||(i.style.height=d.height+"px");var c=i.offsetWidth,g={"margin-left":-c/2+"px",width:c+"px"};if(e._isIE()){var h=i.offsetHeight;g["margin-top"]=-h/2+"px",g.height=h+"px"}null!==e.settings.position&&-1!==e.settings.position.indexOf("top")&&(g.transform="none"),e._create({},g,a[0]);var f={width:"innerWidth"in t?t.innerWidth:s.documentElement.offsetWidth,height:"innerHeight"in t?t.innerHeight:s.documentElement.offsetHeight};if(e.settings.scrollbar)e._scrollbar(a[0]);else if(i.offsetHeight<f.height&&o.offsetHeight>f.height){var u=e._create({},{visibility:"hidden",width:"100px"});o.appendChild(u);var p=u.offsetWidth;u.style.overflow="scroll";var m=e._create({},{width:"100%"});u.appendChild(m);var v=m.offsetWidth;u.parentNode.removeChild(u),o.style.marginRight=p-v+"px",e._addClass(s.getElementsByTagName("html")[0],"hide-scrollbar")}else e._scrollbar(a[0]);e.settings.responsive&&e._box.responsive(e,a,i,f),setTimeout(function(){e._listeners(r),a[0].className+=" "+n+"-show";for(var s=a[1].getElementsByTagName("script"),i=0,o=s.length;i<o;i++)new Function(s[i].text)();if(t.attachEvent)setTimeout(function(){e.settings.complete&&"function"==typeof e.settings.complete&&e.settings.complete(void 0!==arguments[0]?arguments[0]:"")},e.settings.speed);else{var l=!0;a[0].addEventListener(e._crossBrowser(),function(){l&&(l=!1,e.settings.complete&&"function"==typeof e.settings.complete&&e.settings.complete(void 0!==arguments[0]?arguments[0]:""))},!1)}},e.settings.overlay?e.settings.overlaySpeed:200)}},responsive:function(e,s,i,o){i.setAttribute("data-"+n+"-width",i.offsetWidth),e._create({},{width:"auto"},i),o.width<i.offsetWidth&&e._create({},{width:o.width-40+"px","margin-left":"20px","margin-right":"20px",left:0},s[0]);var l="onorientationchange"in t?"orientationchange":"resize";t.attachEvent?t.attachEvent(l,function(){r(this)},!1):t.addEventListener(l,function(){r(this)},!1);var r=function(o){if(void 0===t.orientation){if(null!==i.getAttribute("data-"+n+"-width")){var l=i.getAttribute("data-"+n+"-width");l>o.innerWidth?e._create({},{width:o.innerWidth-40+"px","margin-left":"20px","margin-right":"20px",left:0},s[0]):e._create({},{width:l+"px","margin-left":-l/2+"px",left:"50%"},s[0])}}else e._create(null,{width:o.innerWidth-40+"px","margin-left":"20px","margin-right":"20px",left:0},s[0])}},ajax:function(e){var t=new XMLHttpRequest;t.onreadystatechange=function(){if(4===t.readyState)if(200===t.status){var i=s.createElement("div");i.innerHTML=t.responseText,e._box.build(e,i)}else e._box.build(e,null)},t.open("GET",e.settings.url+(e.settings.cache?"":"?_="+(new Date).getTime()),!0),t.setRequestHeader("X-Requested-With","XMLHttpRequest"),t.send(null)}},_close:function(){var e=this;setTimeout(function(){e._removeClass(s.getElementsByTagName("html")[0],n+"-hide-scrollbar"),s.getElementsByTagName("body")[0].style.marginRight=0;var i=e._isIE()?s.querySelectorAll("."+n+"-modal")[0]:s.getElementsByClassName(n+"-modal")[0];if(e._remove(i),e.settings.overlay&&e._remove(e._isIE()?s.querySelectorAll("."+n+"-overlay")[0]:s.getElementsByClassName(n+"-overlay")[0]),e.settings.close&&"function"==typeof e.settings.close)e.settings.close(void 0!==arguments[0]?arguments[0]:"");else if(void 0!==i&&null!==i.getAttribute("data-"+n)){var o=i.getAttribute("data-"+n);new Function("onClose","return "+o)(o)()}t.top.scroll(0,i.getAttribute("data-"+n+"-scroll"))},e.settings.speed),e._addClass(e._isIE()?s.querySelectorAll("."+n+"-modal")[0]:s.getElementsByClassName(n+"-modal")[0],"close"),e._removeClass(e._isIE()?s.querySelectorAll("."+n+"-modal")[0]:s.getElementsByClassName(n+"-modal")[0],n+"-show"),e._removeClass(s.getElementsByTagName("html")[0],n+"-perspective")},_listeners:function(){var e=this;if(e._isIE()?void 0!==s.querySelectorAll("."+n+"-overlay")[0]&&e.settings.overlayClose&&s.querySelectorAll("."+n+"-overlay")[0].attachEvent("onclick",function(){e._close()}):void 0!==s.getElementsByClassName(n+"-overlay")[0]&&e.settings.overlayClose&&s.getElementsByClassName(n+"-overlay")[0].addEventListener("click",function(){e._close()},!1),e.settings.escKey&&(s.onkeydown=function(s){27===(s=s||t.event).keyCode&&e._close()}),null!==e.settings.eClose&&"string"==typeof e.settings.eClose&&"#"===e.settings.eClose.charAt(0)||"string"==typeof e.settings.eClose&&"."===e.settings.eClose.charAt(0)&&s.querySelector(e.settings.eClose)){var i=s.querySelector(e.settings.eClose);e._isIE()?i.attachEvent("onclick",function(){e._close()},!1):i.addEventListener("click",function(){e._close()},!1)}if(e.settings.close&&"function"==typeof e.settings.close){var o=e.settings.close;(e._isIE()?s.querySelectorAll("."+n+"-modal")[0]:s.getElementsByClassName(n+"-modal")[0]).setAttribute("data-"+n,o)}},_extend:function(){for(var e=1,t=arguments.length;e<t;e++)for(var s in arguments[e])arguments[e].hasOwnProperty(s)&&(arguments[0][s]=arguments[e][s]);return arguments[0]},_create:function(e,t,i){var o=null==i?s.createElement("div"):i;if(Object.keys=Object.keys||function(e){var t=[];for(var s in e)e.hasOwnProperty(s)&&t.push(s);return t},null!==e&&0!==Object.keys(e).length&&(null!==e.id&&(o.id=n+"-"+e.id),null!==e.eClass&&this._addClass(o,e.eClass)),null!==t)for(var l in t)if(t.hasOwnProperty(l)){if(this._isIE()){var r=l.split("-");r.length>1&&(r=r[0]+r[1].replace(/(?:^|\s)\w/g,function(e){return e.toUpperCase()})),o.style[r]=t[l]}else o.style.setProperty(l,t[l],null);if((-1!==l.indexOf("transition")||"transform"===l!==-1)&&!this._isIE())for(var a=["-webkit-","-ms-"],d=0,c=a.length;d<c;d++)o.style.setProperty(a[d]+l,t[l],null)}return o},_hexToRgb:function(e){e=e.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,function(e,t,s,i){return t+t+s+s+i+i});var t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t?{r:parseInt(t[1],16),g:parseInt(t[2],16),b:parseInt(t[3],16)}:null},_addClass:function(e,t){this._hasClass(e,t)||(e.className=e.className.length&&" "!==e.className?e.className+" "+n+"-"+t:n+"-"+t)},_removeClass:function(e,t){if(this._hasClass(e,t)){var s=new RegExp("(\\s|^)"+t+"(\\s|$)");e.className=e.className.replace(s," ")}},_hasClass:function(e,t){return void 0!==e&&e.className.match(new RegExp("(\\s|^)"+t+"(\\s|$)"))},_remove:function(e){void 0!==e&&e.parentNode.removeChild(e)},_zIndex:function(){for(var e=s,t=e.getElementsByTagName("*"),i=0,n=0,o=t.length;n<o;n++){var l=e.defaultView.getComputedStyle(t[n],null).getPropertyValue("z-index");l>i&&"auto"!==l&&(i=l)}return i},_isIE:function(){return-1!=navigator.appVersion.indexOf("MSIE 9.")||-1!=navigator.appVersion.indexOf("MSIE 8.")},_crossBrowser:function(){var e,t=s.createElement("fakeelement"),i={transition:"transitionend",WebkitTransition:"webkitTransitionEnd"};for(var n in i)i.hasOwnProperty(n)&&void 0!==t.style[n]&&(e=i[n]);return e},_scrollbar:function(e){setTimeout(function(){t.scrollTo(0,0)},this.settings.overlay?this.settings.overlaySpeed:200);var s={position:"absolute"};null!==this.settings.position&&-1!==this.settings.position.indexOf("top")&&(s.top=0,s["margin-top"]="20px"),this._create({},s,e)},close:function(){this._close()}},e.fn[n]=function(t){var s=arguments,i="object"==typeof HTMLElement?t instanceof HTMLElement:t&&"object"==typeof t&&null!==t&&1===t.nodeType&&"string"==typeof t.nodeName;if(void 0===t||"object"==typeof t)if(i){if("Microsoft Internet Explorer"===navigator.appName)if(null!=new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})").exec(navigator.userAgent))var o=parseInt(RegExp.$1);if(void 0===o||o>=10){if(null!==t.getAttribute("data-"+n)&&parseInt(t.getAttribute("data-"+n))+1>Math.round((new Date).getTime()/1e3))return;t.setAttribute("data-"+n,Math.round((new Date).getTime()/1e3))}e(t).each(function(){e.data(this,n,new l(this,s[1]))})}else new l(null,s[0]);else"string"==typeof t&&"close"===t&&e.data(this,n,new l(s[0],s[1]))}}(ScJQuery_QO,window,document);

/*!
 * Bootstrap v3.2.0 (http://getbootstrap.com)
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
if("undefined"==typeof ScJQuery_QO)throw new Error("Bootstrap's JavaScript requires ScJQuery_QO");+function(a){"use strict";function b(){var a=document.createElement("bootstrap"),b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var c in b)if(void 0!==a.style[c])return{end:b[c]};return!1}a.fn.emulateTransitionEnd=function(b){var c=!1,d=this;a(this).one("bsTransitionEnd",function(){c=!0});var e=function(){c||a(d).trigger(a.support.transition.end)};return setTimeout(e,b),this},a(function(){a.support.transition=b(),a.support.transition&&(a.event.special.bsTransitionEnd={bindType:a.support.transition.end,delegateType:a.support.transition.end,handle:function(b){return a(b.target).is(this)?b.handleObj.handler.apply(this,arguments):void 0}})})}(ScJQuery_QO),+function(a){"use strict";function b(b){return this.each(function(){var c=a(this),e=c.data("bs.alert");e||c.data("bs.alert",e=new d(this)),"string"==typeof b&&e[b].call(c)})}var c='[data-dismiss="alert"]',d=function(b){a(b).on("click",c,this.close)};d.VERSION="3.2.0",d.prototype.close=function(b){function c(){f.detach().trigger("closed.bs.alert").remove()}var d=a(this),e=d.attr("data-target");e||(e=d.attr("href"),e=e&&e.replace(/.*(?=#[^\s]*$)/,""));var f=a(e);b&&b.preventDefault(),f.length||(f=d.hasClass("alert")?d:d.parent()),f.trigger(b=a.Event("close.bs.alert")),b.isDefaultPrevented()||(f.removeClass("in"),a.support.transition&&f.hasClass("fade")?f.one("bsTransitionEnd",c).emulateTransitionEnd(150):c())};var e=a.fn.alert;a.fn.alert=b,a.fn.alert.Constructor=d,a.fn.alert.noConflict=function(){return a.fn.alert=e,this},a(document).on("click.bs.alert.data-api",c,d.prototype.close)}(ScJQuery_QO),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.button"),f="object"==typeof b&&b;e||d.data("bs.button",e=new c(this,f)),"toggle"==b?e.toggle():b&&e.setState(b)})}var c=function(b,d){this.$element=a(b),this.options=a.extend({},c.DEFAULTS,d),this.isLoading=!1};c.VERSION="3.2.0",c.DEFAULTS={loadingText:"loading..."},c.prototype.setState=function(b){var c="disabled",d=this.$element,e=d.is("input")?"val":"html",f=d.data();b+="Text",null==f.resetText&&d.data("resetText",d[e]()),d[e](null==f[b]?this.options[b]:f[b]),setTimeout(a.proxy(function(){"loadingText"==b?(this.isLoading=!0,d.addClass(c).attr(c,c)):this.isLoading&&(this.isLoading=!1,d.removeClass(c).removeAttr(c))},this),0)},c.prototype.toggle=function(){var a=!0,b=this.$element.closest('[data-toggle="buttons"]');if(b.length){var c=this.$element.find("input");"radio"==c.prop("type")&&(c.prop("checked")&&this.$element.hasClass("active")?a=!1:b.find(".active").removeClass("active")),a&&c.prop("checked",!this.$element.hasClass("active")).trigger("change")}a&&this.$element.toggleClass("active")};var d=a.fn.button;a.fn.button=b,a.fn.button.Constructor=c,a.fn.button.noConflict=function(){return a.fn.button=d,this},a(document).on("click.bs.button.data-api",'[data-toggle^="button"]',function(c){var d=a(c.target);d.hasClass("btn")||(d=d.closest(".btn")),b.call(d,"toggle"),c.preventDefault()})}(ScJQuery_QO),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.carousel"),f=a.extend({},c.DEFAULTS,d.data(),"object"==typeof b&&b),g="string"==typeof b?b:f.slide;e||d.data("bs.carousel",e=new c(this,f)),"number"==typeof b?e.to(b):g?e[g]():f.interval&&e.pause().cycle()})}var c=function(b,c){this.$element=a(b).on("keydown.bs.carousel",a.proxy(this.keydown,this)),this.$indicators=this.$element.find(".carousel-indicators"),this.options=c,this.paused=this.sliding=this.interval=this.$active=this.$items=null,"hover"==this.options.pause&&this.$element.on("mouseenter.bs.carousel",a.proxy(this.pause,this)).on("mouseleave.bs.carousel",a.proxy(this.cycle,this))};c.VERSION="3.2.0",c.DEFAULTS={interval:5e3,pause:"hover",wrap:!0},c.prototype.keydown=function(a){switch(a.which){case 37:this.prev();break;case 39:this.next();break;default:return}a.preventDefault()},c.prototype.cycle=function(b){return b||(this.paused=!1),this.interval&&clearInterval(this.interval),this.options.interval&&!this.paused&&(this.interval=setInterval(a.proxy(this.next,this),this.options.interval)),this},c.prototype.getItemIndex=function(a){return this.$items=a.parent().children(".item"),this.$items.index(a||this.$active)},c.prototype.to=function(b){var c=this,d=this.getItemIndex(this.$active=this.$element.find(".item.active"));return b>this.$items.length-1||0>b?void 0:this.sliding?this.$element.one("slid.bs.carousel",function(){c.to(b)}):d==b?this.pause().cycle():this.slide(b>d?"next":"prev",a(this.$items[b]))},c.prototype.pause=function(b){return b||(this.paused=!0),this.$element.find(".next, .prev").length&&a.support.transition&&(this.$element.trigger(a.support.transition.end),this.cycle(!0)),this.interval=clearInterval(this.interval),this},c.prototype.next=function(){return this.sliding?void 0:this.slide("next")},c.prototype.prev=function(){return this.sliding?void 0:this.slide("prev")},c.prototype.slide=function(b,c){var d=this.$element.find(".item.active"),e=c||d[b](),f=this.interval,g="next"==b?"left":"right",h="next"==b?"first":"last",i=this;if(!e.length){if(!this.options.wrap)return;e=this.$element.find(".item")[h]()}if(e.hasClass("active"))return this.sliding=!1;var j=e[0],k=a.Event("slide.bs.carousel",{relatedTarget:j,direction:g});if(this.$element.trigger(k),!k.isDefaultPrevented()){if(this.sliding=!0,f&&this.pause(),this.$indicators.length){this.$indicators.find(".active").removeClass("active");var l=a(this.$indicators.children()[this.getItemIndex(e)]);l&&l.addClass("active")}var m=a.Event("slid.bs.carousel",{relatedTarget:j,direction:g});return a.support.transition&&this.$element.hasClass("slide")?(e.addClass(b),e[0].offsetWidth,d.addClass(g),e.addClass(g),d.one("bsTransitionEnd",function(){e.removeClass([b,g].join(" ")).addClass("active"),d.removeClass(["active",g].join(" ")),i.sliding=!1,setTimeout(function(){i.$element.trigger(m)},0)}).emulateTransitionEnd(1e3*d.css("transition-duration").slice(0,-1))):(d.removeClass("active"),e.addClass("active"),this.sliding=!1,this.$element.trigger(m)),f&&this.cycle(),this}};var d=a.fn.carousel;a.fn.carousel=b,a.fn.carousel.Constructor=c,a.fn.carousel.noConflict=function(){return a.fn.carousel=d,this},a(document).on("click.bs.carousel.data-api","[data-slide], [data-slide-to]",function(c){var d,e=a(this),f=a(e.attr("data-target")||(d=e.attr("href"))&&d.replace(/.*(?=#[^\s]+$)/,""));if(f.hasClass("carousel")){var g=a.extend({},f.data(),e.data()),h=e.attr("data-slide-to");h&&(g.interval=!1),b.call(f,g),h&&f.data("bs.carousel").to(h),c.preventDefault()}}),a(window).on("load",function(){a('[data-ride="carousel"]').each(function(){var c=a(this);b.call(c,c.data())})})}(ScJQuery_QO),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.collapse"),f=a.extend({},c.DEFAULTS,d.data(),"object"==typeof b&&b);!e&&f.toggle&&"show"==b&&(b=!b),e||d.data("bs.collapse",e=new c(this,f)),"string"==typeof b&&e[b]()})}var c=function(b,d){this.$element=a(b),this.options=a.extend({},c.DEFAULTS,d),this.transitioning=null,this.options.parent&&(this.$parent=a(this.options.parent)),this.options.toggle&&this.toggle()};c.VERSION="3.2.0",c.DEFAULTS={toggle:!0},c.prototype.dimension=function(){var a=this.$element.hasClass("width");return a?"width":"height"},c.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("in")){var c=a.Event("show.bs.collapse");if(this.$element.trigger(c),!c.isDefaultPrevented()){var d=this.$parent&&this.$parent.find("> .panel > .in");if(d&&d.length){var e=d.data("bs.collapse");if(e&&e.transitioning)return;b.call(d,"hide"),e||d.data("bs.collapse",null)}var f=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[f](0),this.transitioning=1;var g=function(){this.$element.removeClass("collapsing").addClass("collapse in")[f](""),this.transitioning=0,this.$element.trigger("shown.bs.collapse")};if(!a.support.transition)return g.call(this);var h=a.camelCase(["scroll",f].join("-"));this.$element.one("bsTransitionEnd",a.proxy(g,this)).emulateTransitionEnd(350)[f](this.$element[0][h])}}},c.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("in")){var b=a.Event("hide.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.dimension();this.$element[c](this.$element[c]())[0].offsetHeight,this.$element.addClass("collapsing").removeClass("collapse").removeClass("in"),this.transitioning=1;var d=function(){this.transitioning=0,this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse")};return a.support.transition?void this.$element[c](0).one("bsTransitionEnd",a.proxy(d,this)).emulateTransitionEnd(350):d.call(this)}}},c.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()};var d=a.fn.collapse;a.fn.collapse=b,a.fn.collapse.Constructor=c,a.fn.collapse.noConflict=function(){return a.fn.collapse=d,this},a(document).on("click.bs.collapse.data-api",'[data-toggle="collapse"]',function(c){var d,e=a(this),f=e.attr("data-target")||c.preventDefault()||(d=e.attr("href"))&&d.replace(/.*(?=#[^\s]+$)/,""),g=a(f),h=g.data("bs.collapse"),i=h?"toggle":e.data(),j=e.attr("data-parent"),k=j&&a(j);h&&h.transitioning||(k&&k.find('[data-toggle="collapse"][data-parent="'+j+'"]').not(e).addClass("collapsed"),e[g.hasClass("in")?"addClass":"removeClass"]("collapsed")),b.call(g,i)})}(ScJQuery_QO),+function(a){"use strict";function b(b){b&&3===b.which||(a(e).remove(),a(f).each(function(){var d=c(a(this)),e={relatedTarget:this};d.hasClass("open")&&(d.trigger(b=a.Event("hide.bs.dropdown",e)),b.isDefaultPrevented()||d.removeClass("open").trigger("hidden.bs.dropdown",e))}))}function c(b){var c=b.attr("data-target");c||(c=b.attr("href"),c=c&&/#[A-Za-z]/.test(c)&&c.replace(/.*(?=#[^\s]*$)/,""));var d=c&&a(c);return d&&d.length?d:b.parent()}function d(b){return this.each(function(){var c=a(this),d=c.data("bs.dropdown");d||c.data("bs.dropdown",d=new g(this)),"string"==typeof b&&d[b].call(c)})}var e=".dropdown-backdrop",f='[data-toggle="dropdown"]',g=function(b){a(b).on("click.bs.dropdown",this.toggle)};g.VERSION="3.2.0",g.prototype.toggle=function(d){var e=a(this);if(!e.is(".disabled, :disabled")){var f=c(e),g=f.hasClass("open");if(b(),!g){"ontouchstart"in document.documentElement&&!f.closest(".navbar-nav").length&&a('<div class="dropdown-backdrop"/>').insertAfter(a(this)).on("click",b);var h={relatedTarget:this};if(f.trigger(d=a.Event("show.bs.dropdown",h)),d.isDefaultPrevented())return;e.trigger("focus"),f.toggleClass("open").trigger("shown.bs.dropdown",h)}return!1}},g.prototype.keydown=function(b){if(/(38|40|27)/.test(b.keyCode)){var d=a(this);if(b.preventDefault(),b.stopPropagation(),!d.is(".disabled, :disabled")){var e=c(d),g=e.hasClass("open");if(!g||g&&27==b.keyCode)return 27==b.which&&e.find(f).trigger("focus"),d.trigger("click");var h=" li:not(.divider):visible a",i=e.find('[role="menu"]'+h+', [role="listbox"]'+h);if(i.length){var j=i.index(i.filter(":focus"));38==b.keyCode&&j>0&&j--,40==b.keyCode&&j<i.length-1&&j++,~j||(j=0),i.eq(j).trigger("focus")}}}};var h=a.fn.dropdown;a.fn.dropdown=d,a.fn.dropdown.Constructor=g,a.fn.dropdown.noConflict=function(){return a.fn.dropdown=h,this},a(document).on("click.bs.dropdown.data-api",b).on("click.bs.dropdown.data-api",".dropdown form",function(a){a.stopPropagation()}).on("click.bs.dropdown.data-api",f,g.prototype.toggle).on("keydown.bs.dropdown.data-api",f+', [role="menu"], [role="listbox"]',g.prototype.keydown)}(ScJQuery_QO),+function(a){"use strict";function b(b,d){return this.each(function(){var e=a(this),f=e.data("bs.modal"),g=a.extend({},c.DEFAULTS,e.data(),"object"==typeof b&&b);f||e.data("bs.modal",f=new c(this,g)),"string"==typeof b?f[b](d):g.show&&f.show(d)})}var c=function(b,c){this.options=c,this.$body=a(document.body),this.$element=a(b),this.$backdrop=this.isShown=null,this.scrollbarWidth=0,this.options.remote&&this.$element.find(".modal-content").load(this.options.remote,a.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))};c.VERSION="3.2.0",c.DEFAULTS={backdrop:!0,keyboard:!0,show:!0},c.prototype.toggle=function(a){return this.isShown?this.hide():this.show(a)},c.prototype.show=function(b){var c=this,d=a.Event("show.bs.modal",{relatedTarget:b});this.$element.trigger(d),this.isShown||d.isDefaultPrevented()||(this.isShown=!0,this.checkScrollbar(),this.$body.addClass("modal-open"),this.setScrollbar(),this.escape(),this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',a.proxy(this.hide,this)),this.backdrop(function(){var d=a.support.transition&&c.$element.hasClass("fade");c.$element.parent().length||c.$element.appendTo(c.$body),c.$element.show().scrollTop(0),d&&c.$element[0].offsetWidth,c.$element.addClass("in").attr("aria-hidden",!1),c.enforceFocus();var e=a.Event("shown.bs.modal",{relatedTarget:b});d?c.$element.find(".modal-dialog").one("bsTransitionEnd",function(){c.$element.trigger("focus").trigger(e)}).emulateTransitionEnd(300):c.$element.trigger("focus").trigger(e)}))},c.prototype.hide=function(b){b&&b.preventDefault(),b=a.Event("hide.bs.modal"),this.$element.trigger(b),this.isShown&&!b.isDefaultPrevented()&&(this.isShown=!1,this.$body.removeClass("modal-open"),this.resetScrollbar(),this.escape(),a(document).off("focusin.bs.modal"),this.$element.removeClass("in").attr("aria-hidden",!0).off("click.dismiss.bs.modal"),a.support.transition&&this.$element.hasClass("fade")?this.$element.one("bsTransitionEnd",a.proxy(this.hideModal,this)).emulateTransitionEnd(300):this.hideModal())},c.prototype.enforceFocus=function(){a(document).off("focusin.bs.modal").on("focusin.bs.modal",a.proxy(function(a){this.$element[0]===a.target||this.$element.has(a.target).length||this.$element.trigger("focus")},this))},c.prototype.escape=function(){this.isShown&&this.options.keyboard?this.$element.on("keyup.dismiss.bs.modal",a.proxy(function(a){27==a.which&&this.hide()},this)):this.isShown||this.$element.off("keyup.dismiss.bs.modal")},c.prototype.hideModal=function(){var a=this;this.$element.hide(),this.backdrop(function(){a.$element.trigger("hidden.bs.modal")})},c.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},c.prototype.backdrop=function(b){var c=this,d=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var e=a.support.transition&&d;if(this.$backdrop=a('<div class="modal-backdrop '+d+'" />').appendTo(this.$body),this.$element.on("click.dismiss.bs.modal",a.proxy(function(a){a.target===a.currentTarget&&("static"==this.options.backdrop?this.$element[0].focus.call(this.$element[0]):this.hide.call(this))},this)),e&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),!b)return;e?this.$backdrop.one("bsTransitionEnd",b).emulateTransitionEnd(150):b()}else if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass("in");var f=function(){c.removeBackdrop(),b&&b()};a.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one("bsTransitionEnd",f).emulateTransitionEnd(150):f()}else b&&b()},c.prototype.checkScrollbar=function(){document.body.clientWidth>=window.innerWidth||(this.scrollbarWidth=this.scrollbarWidth||this.measureScrollbar())},c.prototype.setScrollbar=function(){var a=parseInt(this.$body.css("padding-right")||0,10);this.scrollbarWidth&&this.$body.css("padding-right",a+this.scrollbarWidth)},c.prototype.resetScrollbar=function(){this.$body.css("padding-right","")},c.prototype.measureScrollbar=function(){var a=document.createElement("div");a.className="modal-scrollbar-measure",this.$body.append(a);var b=a.offsetWidth-a.clientWidth;return this.$body[0].removeChild(a),b};var d=a.fn.modal;a.fn.modal=b,a.fn.modal.Constructor=c,a.fn.modal.noConflict=function(){return a.fn.modal=d,this},a(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(c){var d=a(this),e=d.attr("href"),f=a(d.attr("data-target")||e&&e.replace(/.*(?=#[^\s]+$)/,"")),g=f.data("bs.modal")?"toggle":a.extend({remote:!/#/.test(e)&&e},f.data(),d.data());d.is("a")&&c.preventDefault(),f.one("show.bs.modal",function(a){a.isDefaultPrevented()||f.one("hidden.bs.modal",function(){d.is(":visible")&&d.trigger("focus")})}),b.call(f,g,this)})}(ScJQuery_QO),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tooltip"),f="object"==typeof b&&b;(e||"destroy"!=b)&&(e||d.data("bs.tooltip",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.type=this.options=this.enabled=this.timeout=this.hoverState=this.$element=null,this.init("tooltip",a,b)};c.VERSION="3.2.0",c.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1,viewport:{selector:"body",padding:0}},c.prototype.init=function(b,c,d){this.enabled=!0,this.type=b,this.$element=a(c),this.options=this.getOptions(d),this.$viewport=this.options.viewport&&a(this.options.viewport.selector||this.options.viewport);for(var e=this.options.trigger.split(" "),f=e.length;f--;){var g=e[f];if("click"==g)this.$element.on("click."+this.type,this.options.selector,a.proxy(this.toggle,this));else if("manual"!=g){var h="hover"==g?"mouseenter":"focusin",i="hover"==g?"mouseleave":"focusout";this.$element.on(h+"."+this.type,this.options.selector,a.proxy(this.enter,this)),this.$element.on(i+"."+this.type,this.options.selector,a.proxy(this.leave,this))}}this.options.selector?this._options=a.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.getOptions=function(b){return b=a.extend({},this.getDefaults(),this.$element.data(),b),b.delay&&"number"==typeof b.delay&&(b.delay={show:b.delay,hide:b.delay}),b},c.prototype.getDelegateOptions=function(){var b={},c=this.getDefaults();return this._options&&a.each(this._options,function(a,d){c[a]!=d&&(b[a]=d)}),b},c.prototype.enter=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),clearTimeout(c.timeout),c.hoverState="in",c.options.delay&&c.options.delay.show?void(c.timeout=setTimeout(function(){"in"==c.hoverState&&c.show()},c.options.delay.show)):c.show()},c.prototype.leave=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),clearTimeout(c.timeout),c.hoverState="out",c.options.delay&&c.options.delay.hide?void(c.timeout=setTimeout(function(){"out"==c.hoverState&&c.hide()},c.options.delay.hide)):c.hide()},c.prototype.show=function(){var b=a.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(b);var c=a.contains(document.documentElement,this.$element[0]);if(b.isDefaultPrevented()||!c)return;var d=this,e=this.tip(),f=this.getUID(this.type);this.setContent(),e.attr("id",f),this.$element.attr("aria-describedby",f),this.options.animation&&e.addClass("fade");var g="function"==typeof this.options.placement?this.options.placement.call(this,e[0],this.$element[0]):this.options.placement,h=/\s?auto?\s?/i,i=h.test(g);i&&(g=g.replace(h,"")||"top"),e.detach().css({top:0,left:0,display:"block"}).addClass(g).data("bs."+this.type,this),this.options.container?e.appendTo(this.options.container):e.insertAfter(this.$element);var j=this.getPosition(),k=e[0].offsetWidth,l=e[0].offsetHeight;if(i){var m=g,n=this.$element.parent(),o=this.getPosition(n);g="bottom"==g&&j.top+j.height+l-o.scroll>o.height?"top":"top"==g&&j.top-o.scroll-l<0?"bottom":"right"==g&&j.right+k>o.width?"left":"left"==g&&j.left-k<o.left?"right":g,e.removeClass(m).addClass(g)}var p=this.getCalculatedOffset(g,j,k,l);this.applyPlacement(p,g);var q=function(){d.$element.trigger("shown.bs."+d.type),d.hoverState=null};a.support.transition&&this.$tip.hasClass("fade")?e.one("bsTransitionEnd",q).emulateTransitionEnd(150):q()}},c.prototype.applyPlacement=function(b,c){var d=this.tip(),e=d[0].offsetWidth,f=d[0].offsetHeight,g=parseInt(d.css("margin-top"),10),h=parseInt(d.css("margin-left"),10);isNaN(g)&&(g=0),isNaN(h)&&(h=0),b.top=b.top+g,b.left=b.left+h,a.offset.setOffset(d[0],a.extend({using:function(a){d.css({top:Math.round(a.top),left:Math.round(a.left)})}},b),0),d.addClass("in");var i=d[0].offsetWidth,j=d[0].offsetHeight;"top"==c&&j!=f&&(b.top=b.top+f-j);var k=this.getViewportAdjustedDelta(c,b,i,j);k.left?b.left+=k.left:b.top+=k.top;var l=k.left?2*k.left-e+i:2*k.top-f+j,m=k.left?"left":"top",n=k.left?"offsetWidth":"offsetHeight";d.offset(b),this.replaceArrow(l,d[0][n],m)},c.prototype.replaceArrow=function(a,b,c){this.arrow().css(c,a?50*(1-a/b)+"%":"")},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b),a.removeClass("fade in top bottom left right")},c.prototype.hide=function(){function b(){"in"!=c.hoverState&&d.detach(),c.$element.trigger("hidden.bs."+c.type)}var c=this,d=this.tip(),e=a.Event("hide.bs."+this.type);return this.$element.removeAttr("aria-describedby"),this.$element.trigger(e),e.isDefaultPrevented()?void 0:(d.removeClass("in"),a.support.transition&&this.$tip.hasClass("fade")?d.one("bsTransitionEnd",b).emulateTransitionEnd(150):b(),this.hoverState=null,this)},c.prototype.fixTitle=function(){var a=this.$element;(a.attr("title")||"string"!=typeof a.attr("data-original-title"))&&a.attr("data-original-title",a.attr("title")||"").attr("title","")},c.prototype.hasContent=function(){return this.getTitle()},c.prototype.getPosition=function(b){b=b||this.$element;var c=b[0],d="BODY"==c.tagName;return a.extend({},"function"==typeof c.getBoundingClientRect?c.getBoundingClientRect():null,{scroll:d?document.documentElement.scrollTop||document.body.scrollTop:b.scrollTop(),width:d?a(window).width():b.outerWidth(),height:d?a(window).height():b.outerHeight()},d?{top:0,left:0}:b.offset())},c.prototype.getCalculatedOffset=function(a,b,c,d){return"bottom"==a?{top:b.top+b.height,left:b.left+b.width/2-c/2}:"top"==a?{top:b.top-d,left:b.left+b.width/2-c/2}:"left"==a?{top:b.top+b.height/2-d/2,left:b.left-c}:{top:b.top+b.height/2-d/2,left:b.left+b.width}},c.prototype.getViewportAdjustedDelta=function(a,b,c,d){var e={top:0,left:0};if(!this.$viewport)return e;var f=this.options.viewport&&this.options.viewport.padding||0,g=this.getPosition(this.$viewport);if(/right|left/.test(a)){var h=b.top-f-g.scroll,i=b.top+f-g.scroll+d;h<g.top?e.top=g.top-h:i>g.top+g.height&&(e.top=g.top+g.height-i)}else{var j=b.left-f,k=b.left+f+c;j<g.left?e.left=g.left-j:k>g.width&&(e.left=g.left+g.width-k)}return e},c.prototype.getTitle=function(){var a,b=this.$element,c=this.options;return a=b.attr("data-original-title")||("function"==typeof c.title?c.title.call(b[0]):c.title)},c.prototype.getUID=function(a){do a+=~~(1e6*Math.random());while(document.getElementById(a));return a},c.prototype.tip=function(){return this.$tip=this.$tip||a(this.options.template)},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},c.prototype.validate=function(){this.$element[0].parentNode||(this.hide(),this.$element=null,this.options=null)},c.prototype.enable=function(){this.enabled=!0},c.prototype.disable=function(){this.enabled=!1},c.prototype.toggleEnabled=function(){this.enabled=!this.enabled},c.prototype.toggle=function(b){var c=this;b&&(c=a(b.currentTarget).data("bs."+this.type),c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c))),c.tip().hasClass("in")?c.leave(c):c.enter(c)},c.prototype.destroy=function(){clearTimeout(this.timeout),this.hide().$element.off("."+this.type).removeData("bs."+this.type)};var d=a.fn.tooltip;a.fn.tooltip=b,a.fn.tooltip.Constructor=c,a.fn.tooltip.noConflict=function(){return a.fn.tooltip=d,this}}(ScJQuery_QO),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.popover"),f="object"==typeof b&&b;(e||"destroy"!=b)&&(e||d.data("bs.popover",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.init("popover",a,b)};if(!a.fn.tooltip)throw new Error("Popover requires tooltip.js");c.VERSION="3.2.0",c.DEFAULTS=a.extend({},a.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),c.prototype=a.extend({},a.fn.tooltip.Constructor.prototype),c.prototype.constructor=c,c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle(),c=this.getContent();a.find(".popover-title")[this.options.html?"html":"text"](b),a.find(".popover-content").empty()[this.options.html?"string"==typeof c?"html":"append":"text"](c),a.removeClass("fade top bottom left right in"),a.find(".popover-title").html()||a.find(".popover-title").hide()},c.prototype.hasContent=function(){return this.getTitle()||this.getContent()},c.prototype.getContent=function(){var a=this.$element,b=this.options;return a.attr("data-content")||("function"==typeof b.content?b.content.call(a[0]):b.content)},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")},c.prototype.tip=function(){return this.$tip||(this.$tip=a(this.options.template)),this.$tip};var d=a.fn.popover;a.fn.popover=b,a.fn.popover.Constructor=c,a.fn.popover.noConflict=function(){return a.fn.popover=d,this}}(ScJQuery_QO),+function(a){"use strict";function b(c,d){var e=a.proxy(this.process,this);this.$body=a("body"),this.$scrollElement=a(a(c).is("body")?window:c),this.options=a.extend({},b.DEFAULTS,d),this.selector=(this.options.target||"")+" .nav li > a",this.offsets=[],this.targets=[],this.activeTarget=null,this.scrollHeight=0,this.$scrollElement.on("scroll.bs.scrollspy",e),this.refresh(),this.process()}function c(c){return this.each(function(){var d=a(this),e=d.data("bs.scrollspy"),f="object"==typeof c&&c;e||d.data("bs.scrollspy",e=new b(this,f)),"string"==typeof c&&e[c]()})}b.VERSION="3.2.0",b.DEFAULTS={offset:10},b.prototype.getScrollHeight=function(){return this.$scrollElement[0].scrollHeight||Math.max(this.$body[0].scrollHeight,document.documentElement.scrollHeight)},b.prototype.refresh=function(){var b="offset",c=0;a.isWindow(this.$scrollElement[0])||(b="position",c=this.$scrollElement.scrollTop()),this.offsets=[],this.targets=[],this.scrollHeight=this.getScrollHeight();var d=this;this.$body.find(this.selector).map(function(){var d=a(this),e=d.data("target")||d.attr("href"),f=/^#./.test(e)&&a(e);return f&&f.length&&f.is(":visible")&&[[f[b]().top+c,e]]||null}).sort(function(a,b){return a[0]-b[0]}).each(function(){d.offsets.push(this[0]),d.targets.push(this[1])})},b.prototype.process=function(){var a,b=this.$scrollElement.scrollTop()+this.options.offset,c=this.getScrollHeight(),d=this.options.offset+c-this.$scrollElement.height(),e=this.offsets,f=this.targets,g=this.activeTarget;if(this.scrollHeight!=c&&this.refresh(),b>=d)return g!=(a=f[f.length-1])&&this.activate(a);if(g&&b<=e[0])return g!=(a=f[0])&&this.activate(a);for(a=e.length;a--;)g!=f[a]&&b>=e[a]&&(!e[a+1]||b<=e[a+1])&&this.activate(f[a])},b.prototype.activate=function(b){this.activeTarget=b,a(this.selector).parentsUntil(this.options.target,".active").removeClass("active");var c=this.selector+'[data-target="'+b+'"],'+this.selector+'[href="'+b+'"]',d=a(c).parents("li").addClass("active");d.parent(".dropdown-menu").length&&(d=d.closest("li.dropdown").addClass("active")),d.trigger("activate.bs.scrollspy")};var d=a.fn.scrollspy;a.fn.scrollspy=c,a.fn.scrollspy.Constructor=b,a.fn.scrollspy.noConflict=function(){return a.fn.scrollspy=d,this},a(window).on("load.bs.scrollspy.data-api",function(){a('[data-spy="scroll"]').each(function(){var b=a(this);c.call(b,b.data())})})}(ScJQuery_QO),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tab");e||d.data("bs.tab",e=new c(this)),"string"==typeof b&&e[b]()})}var c=function(b){this.element=a(b)};c.VERSION="3.2.0",c.prototype.show=function(){var b=this.element,c=b.closest("ul:not(.dropdown-menu)"),d=b.data("target");if(d||(d=b.attr("href"),d=d&&d.replace(/.*(?=#[^\s]*$)/,"")),!b.parent("li").hasClass("active")){var e=c.find(".active:last a")[0],f=a.Event("show.bs.tab",{relatedTarget:e});if(b.trigger(f),!f.isDefaultPrevented()){var g=a(d);this.activate(b.closest("li"),c),this.activate(g,g.parent(),function(){b.trigger({type:"shown.bs.tab",relatedTarget:e})})}}},c.prototype.activate=function(b,c,d){function e(){f.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"),b.addClass("active"),g?(b[0].offsetWidth,b.addClass("in")):b.removeClass("fade"),b.parent(".dropdown-menu")&&b.closest("li.dropdown").addClass("active"),d&&d()}var f=c.find("> .active"),g=d&&a.support.transition&&f.hasClass("fade");g?f.one("bsTransitionEnd",e).emulateTransitionEnd(150):e(),f.removeClass("in")};var d=a.fn.tab;a.fn.tab=b,a.fn.tab.Constructor=c,a.fn.tab.noConflict=function(){return a.fn.tab=d,this},a(document).on("click.bs.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"]',function(c){c.preventDefault(),b.call(a(this),"show")})}(ScJQuery_QO),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.affix"),f="object"==typeof b&&b;e||d.data("bs.affix",e=new c(this,f)),"string"==typeof b&&e[b]()})}var c=function(b,d){this.options=a.extend({},c.DEFAULTS,d),this.$target=a(this.options.target).on("scroll.bs.affix.data-api",a.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",a.proxy(this.checkPositionWithEventLoop,this)),this.$element=a(b),this.affixed=this.unpin=this.pinnedOffset=null,this.checkPosition()};c.VERSION="3.2.0",c.RESET="affix affix-top affix-bottom",c.DEFAULTS={offset:0,target:window},c.prototype.getPinnedOffset=function(){if(this.pinnedOffset)return this.pinnedOffset;this.$element.removeClass(c.RESET).addClass("affix");var a=this.$target.scrollTop(),b=this.$element.offset();return this.pinnedOffset=b.top-a},c.prototype.checkPositionWithEventLoop=function(){setTimeout(a.proxy(this.checkPosition,this),1)},c.prototype.checkPosition=function(){if(this.$element.is(":visible")){var b=a(document).height(),d=this.$target.scrollTop(),e=this.$element.offset(),f=this.options.offset,g=f.top,h=f.bottom;"object"!=typeof f&&(h=g=f),"function"==typeof g&&(g=f.top(this.$element)),"function"==typeof h&&(h=f.bottom(this.$element));var i=null!=this.unpin&&d+this.unpin<=e.top?!1:null!=h&&e.top+this.$element.height()>=b-h?"bottom":null!=g&&g>=d?"top":!1;if(this.affixed!==i){null!=this.unpin&&this.$element.css("top","");var j="affix"+(i?"-"+i:""),k=a.Event(j+".bs.affix");this.$element.trigger(k),k.isDefaultPrevented()||(this.affixed=i,this.unpin="bottom"==i?this.getPinnedOffset():null,this.$element.removeClass(c.RESET).addClass(j).trigger(a.Event(j.replace("affix","affixed"))),"bottom"==i&&this.$element.offset({top:b-this.$element.height()-h}))}}};var d=a.fn.affix;a.fn.affix=b,a.fn.affix.Constructor=c,a.fn.affix.noConflict=function(){return a.fn.affix=d,this},a(window).on("load",function(){a('[data-spy="affix"]').each(function(){var c=a(this),d=c.data();d.offset=d.offset||{},d.offsetBottom&&(d.offset.bottom=d.offsetBottom),d.offsetTop&&(d.offset.top=d.offsetTop),b.call(c,d)})})}(ScJQuery_QO);
 
//Shopify cart js
function floatToString(e,t){var n=e.toFixed(t).toString();if(n.match(/^\.\d+/)){return"0"+n}else{return n}}function attributeToString(e){if(typeof e!=="string"){e+="";if(e==="undefined"){e=""}}return ScJQuery_QO.trim(e)}if(typeof SC_Shopify==="undefined"){SC_Shopify={}}SC_Shopify.money_format="${{amount}}";SC_Shopify.onError=function(XMLHttpRequest,textStatus){var data=eval("("+XMLHttpRequest.responseText+")");if(!!data.message){alert(data.description)}else{alert(SC_Shopify.fullMessagesFromErrors(data).join("; ")+".")}};SC_Shopify.fullMessagesFromErrors=function(e){var t=[];ScJQuery_QO.each(e,function(e,n){ScJQuery_QO.each(n,function(n,r){t.push(e+" "+r)})});return t};SC_Shopify.onCartUpdate=function(e){alert("There are now "+e.item_count+" items in the cart.")};SC_Shopify.onCartShippingRatesUpdate=function(e,t){var n="";if(t.zip)n+=t.zip+", ";if(t.province)n+=t.province+", ";n+=t.country;alert("There are "+e.length+" shipping rates available for "+n+", starting at "+SC_Shopify.formatMoney(e[0].price)+".")};SC_Shopify.onItemAdded=function(e){alert(e.title+" was added to your shopping cart.")};SC_Shopify.onProduct=function(e){alert("Received everything we ever wanted to know about "+e.title)};SC_Shopify.formatMoney=function(e,t){function s(e,t){return typeof e=="undefined"?t:e}function o(e,t,n,r){t=s(t,2);n=s(n,",");r=s(r,".");if(isNaN(e)||e==null){return 0}e=(e/100).toFixed(t);var i=e.split("."),o=i[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g,"$1"+n),u=i[1]?r+i[1]:"";return o+u}if(typeof e=="string"){e=e.replace(".","")}var n="";var r=/\{\{\s*(\w+)\s*\}\}/;var i=t||this.money_format;switch(i.match(r)[1]){case"amount":n=o(e,2);break;case"amount_no_decimals":n=o(e,0);break;case"amount_with_comma_separator":n=o(e,2,".",",");break;case"amount_no_decimals_with_comma_separator":n=o(e,0,".",",");break}return i.replace(r,n)};SC_Shopify.resizeImage=function(e,t){try{if(t=="original"){return e}else{var n=e.match(/(.*\/[\w\-\_\.]+)\.(\w{2,4})/);return n[1]+"_"+t+"."+n[2]}}catch(r){return e}};SC_Shopify.addItem=function(e,t,n){var t=t||1;var r={type:"POST",url:"/cart/add.js",data:"quantity="+t+"&id="+e,dataType:"json",success:function(e){if(typeof n==="function"){n(e)}else{SC_Shopify.onItemAdded(e)}},error:function(e,t){SC_Shopify.onError(e,t)}};ScJQuery_QO.ajax(r)};SC_Shopify.addItemFromForm=function(e,t){var n={type:"POST",url:"/cart/add.js",data:ScJQuery_QO("#"+e).serialize(),dataType:"json",success:function(e){if(typeof t==="function"){t(e)}else{SC_Shopify.onItemAdded(e)}},error:function(e,t){SC_Shopify.onError(e,t)}};ScJQuery_QO.ajax(n)};SC_Shopify.getCart=function(e){ScJQuery_QO.getJSON("/cart.js",function(t,n){if(typeof e==="function"){e(t)}else{SC_Shopify.onCartUpdate(t)}})};SC_Shopify.getCartShippingRatesForDestination=function(e,t){var n={type:"GET",url:"/cart/shipping_rates.json",data:SC_Shopify.param({shipping_address:e}),dataType:"json",success:function(n){rates=n.shipping_rates;if(typeof t==="function"){t(rates,e)}else{SC_Shopify.onCartShippingRatesUpdate(rates,e)}},error:function(e,t){SC_Shopify.onError(e,t)}};ScJQuery_QO.ajax(n)};SC_Shopify.getProduct=function(e,t){ScJQuery_QO.getJSON("/products/"+e+".js",function(e,n){if(typeof t==="function"){t(e)}else{SC_Shopify.onProduct(e)}})};SC_Shopify.changeItem=function(e,t,n){var r={type:"POST",url:"/cart/change.js",data:"quantity="+t+"&id="+e,dataType:"json",success:function(e){if(typeof n==="function"){n(e)}else{SC_Shopify.onCartUpdate(e)}},error:function(e,t){SC_Shopify.onError(e,t)}};ScJQuery_QO.ajax(r)};SC_Shopify.removeItem=function(e,t){var n={type:"POST",url:"/cart/change.js",data:"quantity=0&id="+e,dataType:"json",success:function(e){if(typeof t==="function"){t(e)}else{SC_Shopify.onCartUpdate(e)}},error:function(e,t){SC_Shopify.onError(e,t)}};ScJQuery_QO.ajax(n)};SC_Shopify.clear=function(e){var t={type:"POST",url:"/cart/clear.js",data:"",dataType:"json",success:function(t){if(typeof e==="function"){e(t)}else{SC_Shopify.onCartUpdate(t)}},error:function(e,t){SC_Shopify.onError(e,t)}};ScJQuery_QO.ajax(t)};SC_Shopify.updateCartFromForm=function(e,t){var n={type:"POST",url:"/cart/update.js",data:ScJQuery_QO("#"+e).serialize(),dataType:"json",success:function(e){if(typeof t==="function"){t(e)}else{SC_Shopify.onCartUpdate(e)}},error:function(e,t){SC_Shopify.onError(e,t)}};ScJQuery_QO.ajax(n)};SC_Shopify.updateCartAttributes=function(e,t){var n="";if(ScJQuery_QO.isArray(e)){ScJQuery_QO.each(e,function(e,t){var r=attributeToString(t.key);if(r!==""){n+="attributes["+r+"]="+attributeToString(t.value)+"&"}})}else if(typeof e==="object"&&e!==null){ScJQuery_QO.each(e,function(e,t){n+="attributes["+attributeToString(e)+"]="+attributeToString(t)+"&"})}var r={type:"POST",url:"/cart/update.js",data:n,dataType:"json",success:function(e){if(typeof t==="function"){t(e)}else{SC_Shopify.onCartUpdate(e)}},error:function(e,t){SC_Shopify.onError(e,t)}};ScJQuery_QO.ajax(r)};SC_Shopify.updateCartNote=function(e,t){var n={type:"POST",url:"/cart/update.js",data:"note="+attributeToString(e),dataType:"json",success:function(e){if(typeof t==="function"){t(e)}else{SC_Shopify.onCartUpdate(e)}},error:function(e,t){SC_Shopify.onError(e,t)}};ScJQuery_QO.ajax(n)};if(ScJQuery_QO.fn.jquery>="1.4"){SC_Shopify.param=ScJQuery_QO.param}else{SC_Shopify.param=function(e){var t=[],n=function(e,n){n=ScJQuery_QO.isFunction(n)?n():n;t[t.length]=encodeURIComponent(e)+"="+encodeURIComponent(n)};if(ScJQuery_QO.isArray(e)||e.jquery){ScJQuery_QO.each(e,function(){n(this.name,this.value)})}else{for(var r in e){SC_Shopify.buildParams(r,e[r],n)}}return t.join("&").replace(/%20/g,"+")};SC_Shopify.buildParams=function(e,t,n){if(ScJQuery_QO.isArray(t)&&t.length){ScJQuery_QO.each(t,function(t,r){if(rbracket.test(e)){n(e,r)}else{SC_Shopify.buildParams(e+"["+(typeof r==="object"||ScJQuery_QO.isArray(r)?t:"")+"]",r,n)}})}else if(t!=null&&typeof t==="object"){if(SC_Shopify.isEmptyObject(t)){n(e,"")}else{ScJQuery_QO.each(t,function(t,r){SC_Shopify.buildParams(e+"["+t+"]",r,n)})}}else{n(e,t)}};SC_Shopify.isEmptyObject=function(e){for(var t in e){return false}return true}}
                
/*
 * easy-autocomplete
 * jQuery plugin for autocompletion
 * 
 * @author Łukasz Pawełczak (http://github.com/pawelczak)
 * @version 1.3.5
 * Copyright  License: 
 */
var EasyAutocomplete=function(a){return a.Configuration=function(a){function b(){if("xml"===a.dataType&&(a.getValue||(a.getValue=function(a){return $(a).text()}),a.list||(a.list={}),a.list.sort||(a.list.sort={}),a.list.sort.method=function(b,c){return b=a.getValue(b),c=a.getValue(c),c>b?-1:b>c?1:0},a.list.match||(a.list.match={}),a.list.match.method=function(a,b){return a.search(b)>-1}),void 0!==a.categories&&a.categories instanceof Array){for(var b=[],c=0,d=a.categories.length;d>c;c+=1){var e=a.categories[c];for(var f in h.categories[0])void 0===e[f]&&(e[f]=h.categories[0][f]);b.push(e)}a.categories=b}}function c(){function b(a,c){var d=a||{};for(var e in a)void 0!==c[e]&&null!==c[e]&&("object"!=typeof c[e]||c[e]instanceof Array?d[e]=c[e]:b(a[e],c[e]));return void 0!==c.data&&null!==c.data&&"object"==typeof c.data&&(d.data=c.data),d}h=b(h,a)}function d(){if("list-required"!==h.url&&"function"!=typeof h.url){var b=h.url;h.url=function(){return b}}if(void 0!==h.ajaxSettings.url&&"function"!=typeof h.ajaxSettings.url){var b=h.ajaxSettings.url;h.ajaxSettings.url=function(){return b}}if("string"==typeof h.listLocation){var c=h.listLocation;"XML"===h.dataType.toUpperCase()?h.listLocation=function(a){return $(a).find(c)}:h.listLocation=function(a){return a[c]}}if("string"==typeof h.getValue){var d=h.getValue;h.getValue=function(a){return a[d]}}void 0!==a.categories&&(h.categoriesAssigned=!0)}function e(){void 0!==a.ajaxSettings&&"object"==typeof a.ajaxSettings?h.ajaxSettings=a.ajaxSettings:h.ajaxSettings={}}function f(a){return void 0!==h[a]&&null!==h[a]}function g(a,b){function c(b,d){for(var e in d)void 0===b[e]&&a.log("Property '"+e+"' does not exist in EasyAutocomplete options API."),"object"==typeof b[e]&&-1===$.inArray(e,i)&&c(b[e],d[e])}c(h,b)}var h={data:"list-required",url:"list-required",dataType:"json",listLocation:function(a){return a},xmlElementName:"",getValue:function(a){return a},autocompleteOff:!0,placeholder:!1,ajaxCallback:function(){},matchResponseProperty:!1,list:{sort:{enabled:!1,method:function(a,b){return a=h.getValue(a),b=h.getValue(b),b>a?-1:a>b?1:0}},maxNumberOfElements:6,hideOnEmptyPhrase:!0,match:{enabled:!1,caseSensitive:!1,method:function(a,b){return a.search(b)>-1}},showAnimation:{type:"normal",time:400,callback:function(){}},hideAnimation:{type:"normal",time:400,callback:function(){}},onClickEvent:function(){},onSelectItemEvent:function(){},onLoadEvent:function(){},onChooseEvent:function(){},onKeyEnterEvent:function(){},onMouseOverEvent:function(){},onMouseOutEvent:function(){},onShowListEvent:function(){},onHideListEvent:function(){}},highlightPhrase:!0,theme:"",cssClasses:"",minCharNumber:0,requestDelay:0,adjustWidth:!0,ajaxSettings:{},preparePostData:function(a,b){return a},loggerEnabled:!0,template:"",categoriesAssigned:!1,categories:[{maxNumberOfElements:4}]},i=["ajaxSettings","template"];this.get=function(a){return h[a]},this.equals=function(a,b){return!(!f(a)||h[a]!==b)},this.checkDataUrlProperties=function(){return"list-required"!==h.url||"list-required"!==h.data},this.checkRequiredProperties=function(){for(var a in h)if("required"===h[a])return logger.error("Option "+a+" must be defined"),!1;return!0},this.printPropertiesThatDoesntExist=function(a,b){g(a,b)},b(),c(),h.loggerEnabled===!0&&g(console,a),e(),d()},a}(EasyAutocomplete||{}),EasyAutocomplete=function(a){return a.Logger=function(){this.error=function(a){console.log("ERROR: "+a)},this.warning=function(a){console.log("WARNING: "+a)}},a}(EasyAutocomplete||{}),EasyAutocomplete=function(a){return a.Constans=function(){var a={CONTAINER_CLASS:"easy-autocomplete-container",CONTAINER_ID:"eac-container-",WRAPPER_CSS_CLASS:"easy-autocomplete"};this.getValue=function(b){return a[b]}},a}(EasyAutocomplete||{}),EasyAutocomplete=function(a){return a.ListBuilderService=function(a,b){function c(b,c){function d(){var d,e={};return void 0!==b.xmlElementName&&(e.xmlElementName=b.xmlElementName),void 0!==b.listLocation?d=b.listLocation:void 0!==a.get("listLocation")&&(d=a.get("listLocation")),void 0!==d?"string"==typeof d?e.data=$(c).find(d):"function"==typeof d&&(e.data=d(c)):e.data=c,e}function e(){var a={};return void 0!==b.listLocation?"string"==typeof b.listLocation?a.data=c[b.listLocation]:"function"==typeof b.listLocation&&(a.data=b.listLocation(c)):a.data=c,a}var f={};if(f="XML"===a.get("dataType").toUpperCase()?d():e(),void 0!==b.header&&(f.header=b.header),void 0!==b.maxNumberOfElements&&(f.maxNumberOfElements=b.maxNumberOfElements),void 0!==a.get("list").maxNumberOfElements&&(f.maxListSize=a.get("list").maxNumberOfElements),void 0!==b.getValue)if("string"==typeof b.getValue){var g=b.getValue;f.getValue=function(a){return a[g]}}else"function"==typeof b.getValue&&(f.getValue=b.getValue);else f.getValue=a.get("getValue");return f}function d(b){var c=[];return void 0===b.xmlElementName&&(b.xmlElementName=a.get("xmlElementName")),$(b.data).find(b.xmlElementName).each(function(){c.push(this)}),c}this.init=function(b){var c=[],d={};return d.data=a.get("listLocation")(b),d.getValue=a.get("getValue"),d.maxListSize=a.get("list").maxNumberOfElements,c.push(d),c},this.updateCategories=function(b,d){if(a.get("categoriesAssigned")){b=[];for(var e=0;e<a.get("categories").length;e+=1){var f=c(a.get("categories")[e],d);b.push(f)}}return b},this.convertXml=function(b){if("XML"===a.get("dataType").toUpperCase())for(var c=0;c<b.length;c+=1)b[c].data=d(b[c]);return b},this.processData=function(c,d){for(var e=0,f=c.length;f>e;e+=1)c[e].data=b(a,c[e],d);return c},this.checkIfDataExists=function(a){for(var b=0,c=a.length;c>b;b+=1)if(void 0!==a[b].data&&a[b].data instanceof Array&&a[b].data.length>0)return!0;return!1}},a}(EasyAutocomplete||{}),EasyAutocomplete=function(a){return a.proccess=function(b,c,d){function e(a,c){var d=[],e="";if(b.get("list").match.enabled)for(var g=0,h=a.length;h>g;g+=1)e=b.get("getValue")(a[g]),f(e,c)&&d.push(a[g]);else d=a;return d}function f(a,c){return b.get("list").match.caseSensitive||("string"==typeof a&&(a=a.toLowerCase()),c=c.toLowerCase()),!!b.get("list").match.method(a,c)}function g(a){return void 0!==c.maxNumberOfElements&&a.length>c.maxNumberOfElements&&(a=a.slice(0,c.maxNumberOfElements)),a}function h(a){return b.get("list").sort.enabled&&a.sort(b.get("list").sort.method),a}a.proccess.match=f;var i=c.data,j=d;return i=e(i,j),i=g(i),i=h(i)},a}(EasyAutocomplete||{}),EasyAutocomplete=function(a){return a.Template=function(a){var b={basic:{type:"basic",method:function(a){return a},cssClass:""},description:{type:"description",fields:{description:"description"},method:function(a){return a+" - description"},cssClass:"eac-description"},iconLeft:{type:"iconLeft",fields:{icon:""},method:function(a){return a},cssClass:"eac-icon-left"},iconRight:{type:"iconRight",fields:{iconSrc:""},method:function(a){return a},cssClass:"eac-icon-right"},links:{type:"links",fields:{link:""},method:function(a){return a},cssClass:""},custom:{type:"custom",method:function(){},cssClass:""}},c=function(a){var c,d=a.fields;return"description"===a.type?(c=b.description.method,"string"==typeof d.description?c=function(a,b){return a+" - <span>"+b[d.description]+"</span>"}:"function"==typeof d.description&&(c=function(a,b){return a+" - <span>"+d.description(b)+"</span>"}),c):"iconRight"===a.type?("string"==typeof d.iconSrc?c=function(a,b){return a+"<img class='eac-icon' src='"+b[d.iconSrc]+"' />"}:"function"==typeof d.iconSrc&&(c=function(a,b){return a+"<img class='eac-icon' src='"+d.iconSrc(b)+"' />"}),c):"iconLeft"===a.type?("string"==typeof d.iconSrc?c=function(a,b){return"<img class='eac-icon' src='"+b[d.iconSrc]+"' />"+a}:"function"==typeof d.iconSrc&&(c=function(a,b){return"<img class='eac-icon' src='"+d.iconSrc(b)+"' />"+a}),c):"links"===a.type?("string"==typeof d.link?c=function(a,b){return"<a href='"+b[d.link]+"' >"+a+"</a>"}:"function"==typeof d.link&&(c=function(a,b){return"<a href='"+d.link(b)+"' >"+a+"</a>"}),c):"custom"===a.type?a.method:b.basic.method},d=function(a){return a&&a.type&&a.type&&b[a.type]?c(a):b.basic.method},e=function(a){var c=function(){return""};return a&&a.type&&a.type&&b[a.type]?function(){var c=b[a.type].cssClass;return function(){return c}}():c};this.getTemplateClass=e(a),this.build=d(a)},a}(EasyAutocomplete||{}),EasyAutocomplete=function(a){return a.main=function(b,c){function d(){return 0===t.length?void p.error("Input field doesn't exist."):o.checkDataUrlProperties()?o.checkRequiredProperties()?(e(),void g()):void p.error("Will not work without mentioned properties."):void p.error("One of options variables 'data' or 'url' must be defined.")}function e(){function a(){var a=$("<div>"),c=n.getValue("WRAPPER_CSS_CLASS");o.get("theme")&&""!==o.get("theme")&&(c+=" eac-"+o.get("theme")),o.get("cssClasses")&&""!==o.get("cssClasses")&&(c+=" "+o.get("cssClasses")),""!==q.getTemplateClass()&&(c+=" "+q.getTemplateClass()),a.addClass(c),t.wrap(a),o.get("adjustWidth")===!0&&b()}function b(){var a=t.outerWidth();t.parent().css("width",a)}function c(){t.unwrap()}function d(){var a=$("<div>").addClass(n.getValue("CONTAINER_CLASS"));a.attr("id",f()).prepend($("<ul>")),function(){a.on("show.eac",function(){switch(o.get("list").showAnimation.type){case"slide":var b=o.get("list").showAnimation.time,c=o.get("list").showAnimation.callback;a.find("ul").slideDown(b,c);break;case"fade":var b=o.get("list").showAnimation.time,c=o.get("list").showAnimation.callback;a.find("ul").fadeIn(b),c;break;default:a.find("ul").show()}o.get("list").onShowListEvent()}).on("hide.eac",function(){switch(o.get("list").hideAnimation.type){case"slide":var b=o.get("list").hideAnimation.time,c=o.get("list").hideAnimation.callback;a.find("ul").slideUp(b,c);break;case"fade":var b=o.get("list").hideAnimation.time,c=o.get("list").hideAnimation.callback;a.find("ul").fadeOut(b,c);break;default:a.find("ul").hide()}o.get("list").onHideListEvent()}).on("selectElement.eac",function(){a.find("ul li").removeClass("selected"),a.find("ul li").eq(w).addClass("selected"),o.get("list").onSelectItemEvent()}).on("loadElements.eac",function(b,c,d){var e="",f=a.find("ul");f.empty().detach(),v=[];for(var h=0,i=0,k=c.length;k>i;i+=1){var l=c[i].data;if(0!==l.length){void 0!==c[i].header&&c[i].header.length>0&&f.append("<div class='eac-category' >"+c[i].header+"</div>");for(var m=0,n=l.length;n>m&&h<c[i].maxListSize;m+=1)e=$("<li><div class='eac-item'></div></li>"),function(){var a=m,b=h,f=c[i].getValue(l[a]);e.find(" > div").on("click",function(){t.val(f).trigger("change"),w=b,j(b),o.get("list").onClickEvent(),o.get("list").onChooseEvent()}).mouseover(function(){w=b,j(b),o.get("list").onMouseOverEvent()}).mouseout(function(){o.get("list").onMouseOutEvent()}).html(q.build(g(f,d),l[a]))}(),f.append(e),v.push(l[m]),h+=1}}a.append(f),o.get("list").onLoadEvent()})}(),t.after(a)}function e(){t.next("."+n.getValue("CONTAINER_CLASS")).remove()}function g(a,b){return o.get("highlightPhrase")&&""!==b?i(a,b):a}function h(a){return a.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&")}function i(a,b){var c=h(b);return(a+"").replace(new RegExp("("+c+")","gi"),"<b>$1</b>")}t.parent().hasClass(n.getValue("WRAPPER_CSS_CLASS"))&&(e(),c()),a(),d(),u=$("#"+f()),o.get("placeholder")&&t.attr("placeholder",o.get("placeholder"))}function f(){var a=t.attr("id");return a=n.getValue("CONTAINER_ID")+a}function g(){function a(){s("autocompleteOff",!0)&&n(),b(),c(),d(),e(),f(),g()}function b(){t.focusout(function(){var a,b=t.val();o.get("list").match.caseSensitive||(b=b.toLowerCase());for(var c=0,d=v.length;d>c;c+=1)if(a=o.get("getValue")(v[c]),o.get("list").match.caseSensitive||(a=a.toLowerCase()),a===b)return w=c,void j(w)})}function c(){t.off("keyup").keyup(function(a){function b(a){function b(){var a={},b=o.get("ajaxSettings")||{};for(var c in b)a[c]=b[c];return a}function c(a,b){return o.get("matchResponseProperty")!==!1?"string"==typeof o.get("matchResponseProperty")?b[o.get("matchResponseProperty")]===a:"function"==typeof o.get("matchResponseProperty")?o.get("matchResponseProperty")(b)===a:!0:!0}if(!(a.length<o.get("minCharNumber"))){if("list-required"!==o.get("data")){var d=o.get("data"),e=r.init(d);e=r.updateCategories(e,d),e=r.processData(e,a),k(e,a),t.parent().find("li").length>0?h():i()}var f=b();void 0!==f.url&&""!==f.url||(f.url=o.get("url")),void 0!==f.dataType&&""!==f.dataType||(f.dataType=o.get("dataType")),void 0!==f.url&&"list-required"!==f.url&&(f.url=f.url(a),f.data=o.get("preparePostData")(f.data,a),$.ajax(f).done(function(b){var d=r.init(b);d=r.updateCategories(d,b),d=r.convertXml(d),c(a,b)&&(d=r.processData(d,a),k(d,a)),r.checkIfDataExists(d)&&t.parent().find("li").length>0?h():i(),o.get("ajaxCallback")()}).fail(function(){p.warning("Fail to load response data")}).always(function(){}))}}switch(a.keyCode){case 27:i(),l();break;case 38:a.preventDefault(),v.length>0&&w>0&&(w-=1,t.val(o.get("getValue")(v[w])),j(w));break;case 40:a.preventDefault(),v.length>0&&w<v.length-1&&(w+=1,t.val(o.get("getValue")(v[w])),j(w));break;default:if(a.keyCode>40||8===a.keyCode){var c=t.val();o.get("list").hideOnEmptyPhrase!==!0||8!==a.keyCode||""!==c?o.get("requestDelay")>0?(void 0!==m&&clearTimeout(m),m=setTimeout(function(){b(c)},o.get("requestDelay"))):b(c):i()}}})}function d(){t.on("keydown",function(a){a=a||window.event;var b=a.keyCode;return 38===b?(suppressKeypress=!0,!1):void 0}).keydown(function(a){13===a.keyCode&&w>-1&&(t.val(o.get("getValue")(v[w])),o.get("list").onKeyEnterEvent(),o.get("list").onChooseEvent(),w=-1,i(),a.preventDefault())})}function e(){t.off("keypress")}function f(){t.focus(function(){""!==t.val()&&v.length>0&&(w=-1,h())})}function g(){t.blur(function(){setTimeout(function(){w=-1,i()},250)})}function n(){t.attr("autocomplete","off")}a()}function h(){u.trigger("show.eac")}function i(){u.trigger("hide.eac")}function j(a){u.trigger("selectElement.eac",a)}function k(a,b){u.trigger("loadElements.eac",[a,b])}function l(){t.trigger("blur")}var m,n=new a.Constans,o=new a.Configuration(c),p=new a.Logger,q=new a.Template(c.template),r=new a.ListBuilderService(o,a.proccess),s=o.equals,t=b,u="",v=[],w=-1;a.consts=n,this.getConstants=function(){return n},this.getConfiguration=function(){return o},this.getContainer=function(){return u},this.getSelectedItemIndex=function(){return w},this.getItems=function(){return v},this.getItemData=function(a){return v.length<a||void 0===v[a]?-1:v[a]},this.getSelectedItemData=function(){return this.getItemData(w)},this.build=function(){e()},this.init=function(){d()}},a.eacHandles=[],a.getHandle=function(b){return a.eacHandles[b]},a.inputHasId=function(a){return void 0!==$(a).attr("id")&&$(a).attr("id").length>0},a.assignRandomId=function(b){var c="";do c="eac-"+Math.floor(1e4*Math.random());while(0!==$("#"+c).length);elementId=a.consts.getValue("CONTAINER_ID")+c,$(b).attr("id",c)},a.setHandle=function(b,c){a.eacHandles[c]=b},a}(EasyAutocomplete||{});!function(a){a.fn.easyAutocomplete=function(b){return this.each(function(){var c=a(this),d=new EasyAutocomplete.main(c,b);EasyAutocomplete.inputHasId(c)||EasyAutocomplete.assignRandomId(c),d.init(),EasyAutocomplete.setHandle(d,c.attr("id"))})},a.fn.getSelectedItemIndex=function(){var b=a(this).attr("id");return void 0!==b?EasyAutocomplete.getHandle(b).getSelectedItemIndex():-1},a.fn.getItems=function(){var b=a(this).attr("id");return void 0!==b?EasyAutocomplete.getHandle(b).getItems():-1},a.fn.getItemData=function(b){var c=a(this).attr("id");return void 0!==c&&b>-1?EasyAutocomplete.getHandle(c).getItemData(b):-1},a.fn.getSelectedItemData=function(){var b=a(this).attr("id");return void 0!==b?EasyAutocomplete.getHandle(b).getSelectedItemData():-1}}(ScJQuery_QO);
                
            
	
	

	function app_process(app_options, callback) {
            ScJQuery_QO(document).ready(function(){
                if(typeof sc_js_loader_ready == 'function'){
                    sc_js_loader_ready();
                }
                
		
                
                
                if('undefined'!=typeof sc_gws_app_global){
                    if(sc_gws_app_global.hasOwnProperty('customer_tags')){
                        if (sc_gws_app_global.customer_tags != null) {
                            sc_gqorder_app_global.sc_qs_is_ws_customer=true;
                        }
                    }
                }
                
                if(ScJQuery_QO('.container.sc-qs.sc-qs-bof-container').length > 0){
                    var sc_qs_bof_num_init_rows=5;
                    for(k=0;k<sc_qs_bof_num_init_rows;k++){
                        sc_gqorder_app_global.add_bof_row(false);
                    }
                }
                sc_gqorder_app_global.bof_init_elements_events();
      
      
		///ScJQuery_QO("#sc_qs_ddl_collection").selectpicker();//Tvr;

		ScJQuery_QO('.sc-qs-product-table th').click(function() {
                    //sc_gqorder_app_global.qs_page_table_on_sort(this);
		});

		ScJQuery_QO('#sc_qs_ddl_collection,#sc_qs_ddl_collection_sort_by').change(function() {                    
                    sc_gqorder_app_global.qs_page_ddl_collection_on_change(this);
		});
                
                SC_Shopify.money_format = store_money_format;
                SC_Shopify.domain = store_sc_qo_shop_domain;
                sc_gqorder_app_global.ShowSearchResult(1, sc_gqorder_app_global.InitializeAllPaginations);
                

		ScJQuery_QO('#btnSearch').on('click', function() {
                    sc_gqorder_app_global.qs_page_btn_search_on_click(this);
		});
		ScJQuery_QO('#qs-search').keypress(function(e) {
                    //sc_gqorder_app_global.qs_page_search_input_on_keypress(this);
                    if(e.which == 13)
                        ScJQuery_QO('#btnSearch').click();
		});

		ScJQuery_QO('body').on("click", ".sc-qs-qty-adjust", function() {
                    sc_gqorder_app_global.qs_page_qty_on_plus_minus(this);
		});
		
                
                //-----Start: Fixing for Old version page-----
                if(ScJQuery_QO("#s_shopify_qs_dvProductDetails .res-modal-body").length == 1){
                    if(ScJQuery_QO("#s_shopify_qs_dvProductDetails .res-modal-body.desktop_view").length == 0){
                        ScJQuery_QO("#s_shopify_qs_dvProductDetails .res-modal-body").addClass('desktop_view');
                    }
                    ScJQuery_QO("#s_shopify_qs_dvProductDetails .res-modal-body.desktop_view").after('<div class="container-fluid res-modal-body mobile_view" style="overflow-y:auto;"></div>');
                }
                //-----End: Fixing for Old version page-----

		// ***** [Initialization] ***** //

		
		

		if(typeof callback == 'function')
			callback();
                
            });
	}

	
        app_process(sc_gqorder_app_global.app_options, function(){});

	

})();

var SC_moneyFormats={USD:{money_format:"${{amount}}",money_with_currency_format:"${{amount}} USD"},EUR:{money_format:"&euro;{{amount}}",money_with_currency_format:"&euro;{{amount}} EUR"},GBP:{money_format:"&pound;{{amount}}",money_with_currency_format:"&pound;{{amount}} GBP"},CAD:{money_format:"${{amount}}",money_with_currency_format:"${{amount}} CAD"},ALL:{money_format:"Lek {{amount}}",money_with_currency_format:"Lek {{amount}} ALL"},DZD:{money_format:"DA {{amount}}",money_with_currency_format:"DA {{amount}} DZD"},AOA:{money_format:"Kz{{amount}}",money_with_currency_format:"Kz{{amount}} AOA"},ARS:{money_format:"${{amount_with_comma_separator}}",money_with_currency_format:"${{amount_with_comma_separator}} ARS"},AMD:{money_format:"{{amount}} AMD",money_with_currency_format:"{{amount}} AMD"},AWG:{money_format:"Afl{{amount}}",money_with_currency_format:"Afl{{amount}} AWG"},AUD:{money_format:"${{amount}}",money_with_currency_format:"${{amount}} AUD"},BBD:{money_format:"${{amount}}",money_with_currency_format:"${{amount}} Bds"},AZN:{money_format:"m.{{amount}}",money_with_currency_format:"m.{{amount}} AZN"},BDT:{money_format:"Tk {{amount}}",money_with_currency_format:"Tk {{amount}} BDT"},BSD:{money_format:"BS${{amount}}",money_with_currency_format:"BS${{amount}} BSD"},BHD:{money_format:"{{amount}}0 BD",money_with_currency_format:"{{amount}}0 BHD"},BYR:{money_format:"Br {{amount}}",money_with_currency_format:"Br {{amount}} BYR"},BZD:{money_format:"BZ${{amount}}",money_with_currency_format:"BZ${{amount}} BZD"},BTN:{money_format:"Nu {{amount}}",money_with_currency_format:"Nu {{amount}} BTN"},BAM:{money_format:"KM {{amount_with_comma_separator}}",money_with_currency_format:"KM {{amount_with_comma_separator}} BAM"},BRL:{money_format:"R$ {{amount_with_comma_separator}}",money_with_currency_format:"R$ {{amount_with_comma_separator}} BRL"},BOB:{money_format:"Bs{{amount_with_comma_separator}}",money_with_currency_format:"Bs{{amount_with_comma_separator}} BOB"},BWP:{money_format:"P{{amount}}",money_with_currency_format:"P{{amount}} BWP"},BND:{money_format:"${{amount}}",money_with_currency_format:"${{amount}} BND"},BGN:{money_format:"{{amount}} ??",money_with_currency_format:"{{amount}} ?? BGN"},MMK:{money_format:"K{{amount}}",money_with_currency_format:"K{{amount}} MMK"},KHR:{money_format:"KHR{{amount}}",money_with_currency_format:"KHR{{amount}}"},KYD:{money_format:"${{amount}}",money_with_currency_format:"${{amount}} KYD"},XAF:{money_format:"FCFA{{amount}}",money_with_currency_format:"FCFA{{amount}} XAF"},CLP:{money_format:"${{amount_no_decimals}}",money_with_currency_format:"${{amount_no_decimals}} CLP"},CNY:{money_format:"&#165;{{amount}}",money_with_currency_format:"&#165;{{amount}} CNY"},COP:{money_format:"${{amount_with_comma_separator}}",money_with_currency_format:"${{amount_with_comma_separator}} COP"},CRC:{money_format:"&#8353; {{amount_with_comma_separator}}",money_with_currency_format:"&#8353; {{amount_with_comma_separator}} CRC"},HRK:{money_format:"{{amount_with_comma_separator}} kn",money_with_currency_format:"{{amount_with_comma_separator}} kn HRK"},CZK:{money_format:"{{amount_with_comma_separator}} K&#269;",money_with_currency_format:"{{amount_with_comma_separator}} K&#269;"},DKK:{money_format:"{{amount_with_comma_separator}}",money_with_currency_format:"kr.{{amount_with_comma_separator}}"},DOP:{money_format:"RD$ {{amount}}",money_with_currency_format:"RD$ {{amount}}"},XCD:{money_format:"${{amount}}",money_with_currency_format:"EC${{amount}}"},EGP:{money_format:"LE {{amount}}",money_with_currency_format:"LE {{amount}} EGP"},ETB:{money_format:"Br{{amount}}",money_with_currency_format:"Br{{amount}} ETB"},XPF:{money_format:"{{amount_no_decimals_with_comma_separator}} XPF",money_with_currency_format:"{{amount_no_decimals_with_comma_separator}} XPF"},FJD:{money_format:"${{amount}}",money_with_currency_format:"FJ${{amount}}"},GMD:{money_format:"D {{amount}}",money_with_currency_format:"D {{amount}} GMD"},GHS:{money_format:"GH&#8373;{{amount}}",money_with_currency_format:"GH&#8373;{{amount}}"},GTQ:{money_format:"Q{{amount}}",money_with_currency_format:"{{amount}} GTQ"},GYD:{money_format:"G${{amount}}",money_with_currency_format:"${{amount}} GYD"},GEL:{money_format:"{{amount}} GEL",money_with_currency_format:"{{amount}} GEL"},HNL:{money_format:"L {{amount}}",money_with_currency_format:"L {{amount}} HNL"},HKD:{money_format:"${{amount}}",money_with_currency_format:"HK${{amount}}"},HUF:{money_format:"{{amount_no_decimals_with_comma_separator}}",money_with_currency_format:"{{amount_no_decimals_with_comma_separator}} Ft"},ISK:{money_format:"{{amount_no_decimals}} kr",money_with_currency_format:"{{amount_no_decimals}} kr ISK"},INR:{money_format:"Rs. {{amount}}",money_with_currency_format:"Rs. {{amount}}"},IDR:{money_format:"{{amount_with_comma_separator}}",money_with_currency_format:"Rp {{amount_with_comma_separator}}"},ILS:{money_format:"{{amount}} NIS",money_with_currency_format:"{{amount}} NIS"},JMD:{money_format:"${{amount}}",money_with_currency_format:"${{amount}} JMD"},JPY:{money_format:"&#165;{{amount_no_decimals}}",money_with_currency_format:"&#165;{{amount_no_decimals}} JPY"},JEP:{money_format:"&pound;{{amount}}",money_with_currency_format:"&pound;{{amount}} JEP"},JOD:{money_format:"{{amount}}0 JD",money_with_currency_format:"{{amount}}0 JOD"},KZT:{money_format:"{{amount}} KZT",money_with_currency_format:"{{amount}} KZT"},KES:{money_format:"KSh{{amount}}",money_with_currency_format:"KSh{{amount}}"},KWD:{money_format:"{{amount}}0 KD",money_with_currency_format:"{{amount}}0 KWD"},KGS:{money_format:"??{{amount}}",money_with_currency_format:"??{{amount}}"},LVL:{money_format:"Ls {{amount}}",money_with_currency_format:"Ls {{amount}} LVL"},LBP:{money_format:"L&pound;{{amount}}",money_with_currency_format:"L&pound;{{amount}} LBP"},LTL:{money_format:"{{amount}} Lt",money_with_currency_format:"{{amount}} Lt"},MGA:{money_format:"Ar {{amount}}",money_with_currency_format:"Ar {{amount}} MGA"},MKD:{money_format:"??? {{amount}}",money_with_currency_format:"??? {{amount}} MKD"},MOP:{money_format:"MOP${{amount}}",money_with_currency_format:"MOP${{amount}}"},MVR:{money_format:"Rf{{amount}}",money_with_currency_format:"Rf{{amount}} MRf"},MXN:{money_format:"$ {{amount}}",money_with_currency_format:"$ {{amount}} MXN"},MYR:{money_format:"RM{{amount}} MYR",money_with_currency_format:"RM{{amount}} MYR"},MUR:{money_format:"Rs {{amount}}",money_with_currency_format:"Rs {{amount}} MUR"},MDL:{money_format:"{{amount}} MDL",money_with_currency_format:"{{amount}} MDL"},MAD:{money_format:"{{amount}} dh",money_with_currency_format:"Dh {{amount}} MAD"},MNT:{money_format:"{{amount_no_decimals}} &#8366",money_with_currency_format:"{{amount_no_decimals}} MNT"},MZN:{money_format:"{{amount}} Mt",money_with_currency_format:"Mt {{amount}} MZN"},NAD:{money_format:"N${{amount}}",money_with_currency_format:"N${{amount}} NAD"},NPR:{money_format:"Rs{{amount}}",money_with_currency_format:"Rs{{amount}} NPR"},ANG:{money_format:"&fnof;{{amount}}",money_with_currency_format:"{{amount}} NA&fnof;"},NZD:{money_format:"${{amount}}",money_with_currency_format:"${{amount}} NZD"},NIO:{money_format:"C${{amount}}",money_with_currency_format:"C${{amount}} NIO"},NGN:{money_format:"&#8358;{{amount}}",money_with_currency_format:"&#8358;{{amount}} NGN"},NOK:{money_format:"kr {{amount_with_comma_separator}}",money_with_currency_format:"kr {{amount_with_comma_separator}} NOK"},OMR:{money_format:"{{amount_with_comma_separator}} OMR",money_with_currency_format:"{{amount_with_comma_separator}} OMR"},PKR:{money_format:"Rs.{{amount}}",money_with_currency_format:"Rs.{{amount}} PKR"},PGK:{money_format:"K {{amount}}",money_with_currency_format:"K {{amount}} PGK"},PYG:{money_format:"Gs. {{amount_no_decimals_with_comma_separator}}",money_with_currency_format:"Gs. {{amount_no_decimals_with_comma_separator}} PYG"},PEN:{money_format:"S/. {{amount}}",money_with_currency_format:"S/. {{amount}} PEN"},PHP:{money_format:"&#8369;{{amount}}",money_with_currency_format:"&#8369;{{amount}} PHP"},PLN:{money_format:"{{amount_with_comma_separator}} zl",money_with_currency_format:"{{amount_with_comma_separator}} zl PLN"},QAR:{money_format:"QAR {{amount_with_comma_separator}}",money_with_currency_format:"QAR {{amount_with_comma_separator}}"},RON:{money_format:"{{amount_with_comma_separator}} lei",money_with_currency_format:"{{amount_with_comma_separator}} lei RON"},RUB:{money_format:"&#1088;&#1091;&#1073;{{amount_with_comma_separator}}",money_with_currency_format:"&#1088;&#1091;&#1073;{{amount_with_comma_separator}} RUB"},RWF:{money_format:"{{amount_no_decimals}} RF",money_with_currency_format:"{{amount_no_decimals}} RWF"},WST:{money_format:"WS$ {{amount}}",money_with_currency_format:"WS$ {{amount}} WST"},SAR:{money_format:"{{amount}} SR",money_with_currency_format:"{{amount}} SAR"},STD:{money_format:"Db {{amount}}",money_with_currency_format:"Db {{amount}} STD"},RSD:{money_format:"{{amount}} RSD",money_with_currency_format:"{{amount}} RSD"},SCR:{money_format:"Rs {{amount}}",money_with_currency_format:"Rs {{amount}} SCR"},SGD:{money_format:"${{amount}}",money_with_currency_format:"${{amount}} SGD"},SYP:{money_format:"S&pound;{{amount}}",money_with_currency_format:"S&pound;{{amount}} SYP"},ZAR:{money_format:"R {{amount}}",money_with_currency_format:"R {{amount}} ZAR"},KRW:{money_format:"&#8361;{{amount_no_decimals}}",money_with_currency_format:"&#8361;{{amount_no_decimals}} KRW"},LKR:{money_format:"Rs {{amount}}",money_with_currency_format:"Rs {{amount}} LKR"},SEK:{money_format:"{{amount_no_decimals}} kr",money_with_currency_format:"{{amount_no_decimals}} kr SEK"},CHF:{money_format:"SFr. {{amount}}",money_with_currency_format:"SFr. {{amount}} CHF"},TWD:{money_format:"${{amount}}",money_with_currency_format:"${{amount}} TWD"},THB:{money_format:"{{amount}} &#xe3f;",money_with_currency_format:"{{amount}} &#xe3f; THB"},TZS:{money_format:"{{amount}} TZS",money_with_currency_format:"{{amount}} TZS"},TTD:{money_format:"${{amount}}",money_with_currency_format:"${{amount}} TTD"},TND:{money_format:"{{amount}}",money_with_currency_format:"{{amount}} DT"},TRY:{money_format:"{{amount}}TL",money_with_currency_format:"{{amount}}TL"},UGX:{money_format:"Ush {{amount_no_decimals}}",money_with_currency_format:"Ush {{amount_no_decimals}} UGX"},UAH:{money_format:"?{{amount}}",money_with_currency_format:"?{{amount}} UAH"},AED:{money_format:"Dhs. {{amount}}",money_with_currency_format:"Dhs. {{amount}} AED"},UYU:{money_format:"${{amount_with_comma_separator}}",money_with_currency_format:"${{amount_with_comma_separator}} UYU"},VUV:{money_format:"${{amount}}",money_with_currency_format:"${{amount}}VT"},VEF:{money_format:"Bs. {{amount_with_comma_separator}}",money_with_currency_format:"Bs. {{amount_with_comma_separator}} VEF"},VND:{money_format:"{{amount_no_decimals_with_comma_separator}}&#8363;",money_with_currency_format:"{{amount_no_decimals_with_comma_separator}} VND"},XBT:{money_format:"{{amount_no_decimals}} BTC",money_with_currency_format:"{{amount_no_decimals}} BTC"},XOF:{money_format:"CFA{{amount}}",money_with_currency_format:"CFA{{amount}} XOF"},ZMW:{money_format:"K{{amount_no_decimals_with_comma_separator}}",money_with_currency_format:"ZMW{{amount_no_decimals_with_comma_separator}}"}};
