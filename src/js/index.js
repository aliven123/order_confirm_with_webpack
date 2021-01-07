// import QRCode from '../assets/qrcode.js';
import {ajaxfn,queryToObj,IsPC,dataNow} from '../assets/utils.js';
import '../css/index.less';
import '../assets/iconfont/iconfont.css';
var vm = new Vue({
	el: '#main_ctn',
	data: {
		host: '',
		IsPC,
		orders:{period:12},//{非空对象},说明是正常下单状态；否则,是一键代发状态
		qrcode_ctn: {
			hishow: false,
			data: {}
		},
		date_now: dataNow,
		need_state: {
			def: 'not_delivery',
			menus: {
				not_delivery: {
					txt: '不需要配送',
					val: '不需要配送'
				},
				need_delivery: {
					txt: '需要配送',
					val: ''
				}
			}
		},
		gold: { //金币
			available: 10000, //可用金币
			use_volumn: 0, //使用金币的数量
			transfer: 100,
			use_switch: false
		},
		coupon: { //优惠券
			volumn: 1, //张数
			use_volumn: 0, //使用的张数
			price: 100, //优惠券面值
			limit: 1000, //满多少可用
			use_switch: false
		},
		message: '', //给商家留言
		good_head:{
			des:{
				txt:'品名'
			},
			price:{
				txt:'价格'
			},
			volumn:{
				txt:'周期'
			},
			pic:{
				txt:'收益图'
			}
		},
		goods: [
			//商品列表
			/* {
				pic: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1608285375145&di=f2ea0757f094aea4b8e71059d4aa9d84&imgtype=0&src=http%3A%2F%2Fattach.bbs.miui.com%2Fforum%2F201303%2F16%2F075154gfxiljfvfidzfcvt.jpg',
				des: '豪华企业网站标准版豪华企业网站标准版',
				price: '465',
				volumn: '1'
			},
			{
				pic: 'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1025999189,4268722616&fm=26&gp=0.jpg',
				des: '豪华企业网站标准版豪华企业标准版',
				price: '564',
				volumn: '3'
			},
			{
				pic: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1608285375145&di=f2ea0757f094aea4b8e71059d4aa9d84&imgtype=0&src=http%3A%2F%2Fattach.bbs.miui.com%2Fforum%2F201303%2F16%2F075154gfxiljfvfidzfcvt.jpg',
				des: '豪华企业网站标准版豪华企业网站标准版',
				price: '1111',
				volumn: '1'
			} */
		],
		invoice: {
			rate: 0,
			use_switch: false,
			head: '',
			tax_id: '',
			msg: ''
		},
		bills: {
			gold: {
				txt: '金币',
				c_mode: '-',
				val: '-'
			},
			coupon: {
				txt: '优惠券',
				c_mode: '-',
				val: '-'
			},
			service_fee: {
				txt: '手续费',
				c_mode: '+',
				val: 0
			},
			freight_fee: {
				txt: '运费',
				c_mode: '+',
				val: 0
			},
			tax_fee: {
				txt: '税金',
				c_mode: '+',
				val: 0
			}
		},
		payment: {
			def: 'wx',
			wx: {
				api: 'weixin_pay'
			},
			zfb: {
				api: 'ali_pay'
			}
		}
	},
	computed: {
		order_price(){
			this.initOrders();
			const {discount_price,indic_price}=this.orders;
			const obj={des:'',val:'',dis_val:'false'};
			// dis_val不为'false'时显示，引导用户
			console.log(indic_price);
			if(indic_price!==undefined){
				console.log(indic_price);
				obj.val=indic_price;
				if(discount_price==='false'){
					// 没有折扣
					obj.des='单价（元/月）:';
					obj.dis_val=indic_price*0.9.toFixed(2);
				}else{
					obj.des='会员折扣单价（元/月）：';
					obj.val=discount_price;
				}
			};
			console.log(this.orders);
			console.log(obj);
			return obj;
		},
		total_obj() {
			if(this.orders.indic_name!==undefined){
				// 正常下单的商品数量和总计
				return {
					price: this.order_price.val*this.orders.period,
					volumn: this.orders.period
				}
			}else{
				// 代发的商品数量和总计
				return this.goods.reduce((obj, item) => {
					return {
						price: obj.price + item.price * item.volumn,
						volumn: obj.volumn + Number.parseInt(item.volumn)
					}
				}, {
					price: 0,
					volumn: 0
				})
			}
		},
		Golddeduct() {
			//金币抵扣
			var gold = this.gold;
			if (Number.isNaN(Number.parseFloat(gold.use_volumn))) {
				return 0
			};
			if (gold.use_switch === true) {
				var use_volumn = Number.parseFloat(gold.use_volumn);

				if (use_volumn > gold.available) {
					return Number.parseFloat(gold.available) / gold.transfer
				};
				return use_volumn / gold.transfer
			} else {
				return 0
			};
		},
		coupon_deduct() {
			//优惠券抵扣
			var coupon = this.coupon;
			if (Number.isNaN(Number.parseFloat(coupon.use_volumn))) {
				return 0
			};
			if (coupon.use_switch === true) {
				var use_volumn = Number.parseFloat(coupon.use_volumn);
				// 根据商品应付，计算的优惠券使用张数上限
				var count_volumn = Math.floor(this.total_obj.price / this.coupon.limit);
				// 优惠券使用数量上限，取优惠券数量和count_volumn两者中的最小值；
				var upper_limit = Math.min(count_volumn, coupon.volumn);
				if (use_volumn > upper_limit) {
					return upper_limit * coupon.price
				};
				return use_volumn * coupon.price
			} else {
				return 0
			};
		}
	},
	watch: {
		invoice:{
			deep:true,
			handler(newval){
				console.log(newval);
				if(newval.use_switch===true){
					this.bills.tax_fee.val=this.total_obj.price*newval.rate/100;
				}else{
					this.bills.tax_fee.val=0;
				}
			}
		},
		Golddeduct: {
			immediate: true,
			handler(newval) {
				this.bills.gold.val = newval;
				this.needPayment();
			}
		},
		coupon_deduct: {
			immediate: true,
			handler(newval) {
				this.bills.coupon.val = newval;
				this.needPayment();
			}
		}
	},
	filters: {
		RMB_symbol(value) {
			// console.log(value);
			const black_arr=[undefined,'-',''];
			if(black_arr.includes(value)){
				return value
			}else{
				return '¥ ' + Math.round(value*100)/100;
			}
		}
	},
	methods: {
		needPayment() {
			// 实付计算
			var price = this.total_obj.price;
			var bills = this.bills;
			// const {use_switch,rate}=this.invoice;
			// console.log(rate);
			for (var key in bills) {
				if (typeof bills[key].val === 'number') {
					if (bills[key].c_mode === '-') {
						price -= bills[key].val;
					} else if (bills[key].c_mode === '+') {
						price += bills[key].val;
					}
				}
			};
			/* if(use_switch===true){
				price+=price*rate/100;
			}; */
			if (price < 0) {
				price = 0
			};
			return price;
		},
		handleNeedstate(val) {
			this.need_state.def = val;
		},
		getQrcode() {
			setTimeout(() => {
				const qrcode = document.querySelector('#qrcode_ctn #qrcode');
				var code_url = this.qrcode_ctn.data.code_url;
				const QRCode= require('../assets/qrcode.js');
				new QRCode(qrcode, {
				  text: code_url,
				  width: 168, //图像宽度
				  height: 168, //图像高度
				});
			}, 0)
		},
		closeQrcode() {
			this.qrcode_ctn.hishow = false;
		},
		mergeOrderData(data){
			// 普通下单需要数据和接口
			const {SecurityID,indic_name,indic_type,period,p_single_code}=this.orders;
			
			//代发的接口
			let url=this.host + '/order/daifa_pay/';
			if(indic_name){
				Object.assign(data,{
					code:SecurityID,
					indicname:indic_name,
					indic_type,
					buy_time:period,
					api:0,//下单时api是0
					p_single_code
				});
				
				//正常下单的接口
				url=`${this.host}/payment/pay/`;
			};
			return url;
		},
		handlePayment() {
			// if(this.needPayment()===0){return};
			if (this.qrcode_ctn.hishow) {
				this.qrcode_ctn = {
					hishow: false,
					data: {}
				}
				return;
			}
			var def = this.payment.def;
			var api = this.payment[def].api;
			var url;
			let {orderids,username,from_url} = queryToObj();
			console.log(from_url);
			if(from_url && from_url.includes('e_t_r')){
				from_url=from_url.replace(/\[a_t_r\]/g,'&');
				from_url=from_url.replace(/\[e_t_r\]/g,'=');
			};
			console.log(from_url);
			if (orderids.indexOf('_') !== -1) {
				orderids = orderids.split("_")
			} else {
				orderids = [orderids]
			};
			if (location.href.indexOf('127.0.0.1') !== -1) {
				username = 'lcs11'
			};
			const order_info={
				gold:this.gold,
				coupon:this.coupon,
				goods:this.goods,
				invoice:this.invoice,
				api:1//代发api是1
			};
			var data = {
				pay_by: api,
				username: username,
				orders: JSON.stringify(orderids),
				order_info:JSON.stringify(order_info),
				message:this.message
			};
			url=this.mergeOrderData(data);
			if(def==='zfb'){Object.assign(data,{from_url})};
			ajaxfn(url, 'POST', 'JSON', data, (res) => {
				console.log(res);
				let {result,url,code_url,trade_no,mweb_url,reason}=res;
				trade_no=trade_no===undefined?res.out_trade_no:trade_no;
				var data = null;
				if (result === 'ok') {
					if (mweb_url||url) {
						// 支付宝跳转外链
						location.href = mweb_url||url;
						return;
					};
					if (def === 'wx') {
						this.qrcode_ctn = {
							hishow: true,
							data: {
								pay_by: api,
								code_url: code_url,
								pay_tag: 'agent_delivery',
								out_trade_no:trade_no
							}
						}
						this.getQrcode();
						this.getPaymentResult(api,trade_no,from_url);
					}
				}else{
					alert(reason)
				}
			})
		},
		getPaymentResult(pay_by, out_trade_no,from_url) {
			// 查询微信支付状态的回调函数
			let data = {
				out_trade_no
			};
			var src = '/order/daifa_callback/' + pay_by + '/';
			if(this.orders.indic_name){
				// 普通支付的url
				src=`/weixin_pay/callback/`
			};
			ajaxfn(this.host + src, 'POST', 'json', data, (res) => {
				if (res.result === 'success' || this.qrcode_ctn.hishow !== true) {
					this.qrcode_ctn = {
						data: {},
						hishow: false
					};
					if(res.result === 'success' && from_url){
						window.open(from_url,'_self');
					}
					return
				};
				setTimeout(() => {
					this.getPaymentResult(pay_by, out_trade_no,from_url);
				}, 2000);
			})
		},
		handleGoBack(){
			let {from_url} = queryToObj();
			console.log(from_url);
			if(from_url && from_url.includes('e_t_r')){
				from_url=from_url.replace(/\[a_t_r\]/g,'&');
				from_url=from_url.replace(/\[e_t_r\]/g,'=');
			};
			window.open(from_url,'_self');
		},
		initOrders(){
			var {
				orderids,
				username,
				SecurityID,
				indic_name,
				indic_type,
				indic_price,
				discount_price,
				p_single_code
			} = queryToObj();
			if(orderids==='false'){
				// orderids==='false',说明是普通下单的情况
				Object.assign(this.orders,{
					SecurityID:decodeURI(SecurityID),
					indic_name:decodeURI(indic_name),
					indic_type:decodeURI(indic_type),
					indic_price,
					discount_price,
					p_single_code
				})
			};
			return {username,orderids}
		},
		initDatas() {
			const {orderids,username}=this.initOrders();
			var url = this.host + '/payment/get_order_infos/';
			var data = {
				orders: orderids,
				username
			};
			console.log(this.orders)
			ajaxfn(url, 'POST', 'JSON', data, (res) => {
				console.log(res);
				if (res.result === 'success') {
					let {goods,gold,coupon,tax_rate} = res.data;
					console.log(this.gold);
					// this.gold.available=data.goldcoin;
					var good_arr = [];

					goods.forEach((item) => {
						good_arr.push({
							pic: 'https://362965b2f6.picp.vip' + item.img,
							des: item.title,
							price: item.price,
							volumn: item.num,
							unit: item.unit
						})
					})
					// 生产环境,goods注释行打开
					this.goods = good_arr;
					
					/* this.gold.available = 1000;
					this.gold.transfer = 1;

					this.coupon.volumn = 5;
					this.coupon.price = 10;
					this.coupon.limit = 1000; */
					this.gold.available=gold.available;
					this.gold.transfer=gold.transfer;
					
					this.coupon.volumn = coupon.volumn;
					this.coupon.price = coupon.price;
					this.coupon.limit = coupon.limit;
					
					this.invoice.rate=tax_rate*100;
					if (goods.length === 0&&orderids!=='false') {
						alert('没有需要支付的订单！')
					}
				}
			});
		}
	},
	created() {
		if (location.href.includes('localhost') || location.href.includes('127.0.0.1')) {
			this.host = 'http://10.88.71.83:8008'
		} else {
			this.host = 'https://data.aupool.cn'
		};
		this.initDatas();
	},
	mounted() {
		// console.log('测试更新')
	}
})
