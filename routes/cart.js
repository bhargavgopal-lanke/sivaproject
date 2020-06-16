module.exports = function Cart(oldCart) {
	this.items = oldCart.items || {};
	this.totalQty = oldCart.totalQty || 0;
	this.totalPrice = oldCart.totalPrice || 0;

	this.add = function(item, id) {
		var storedItem = this.items[id];
	/*	console.log("storedItem");
		console.log(id);
		console.log(item);
		console.log(item[0].productprice);*/
		if(!storedItem)	{
			storedItem = this.items[id] = { productId : item[0].product_id, productimageurl: item[0].productimageurl,title: item[0].title, qty : 0,prod_description: item[0].prod_description,  price: item[0].productprice, productprice: item[0].productprice };
		 }
		 storedItem.qty++;
		/* console.log(storedItem.price);*/
		 storedItem.price = storedItem.price * storedItem.qty;
		 this.totalQty++;
		/* console.log("storedItem.price.....");
		 console.log(storedItem.qty);*/
		 this.totalPrice += storedItem.price;
	}

	this.generateArray = function() {
		var arr = [];
		for (var id in this.items) {
			arr.push(this.items[id]);
		}
		return arr;
	};
	this.removecartItem = function(cart, eachItemId) {
		var getId = eachItemId.productId;
		/*console.log("eachItemId................");
		console.log(getId);*/
		var cart = cart;
	/*	console.log("eachItemId................Cart >>>>>>>>>>>>>>>>");
		console.log(cart);*/
		var count = Object.keys(cart).length;
		 var getQty = cart.items[getId].qty;
		 /*console.log("eachItemId................Cart >>>>>>>>>>>>>>>>");
		console.log(getQty);*/

		for(var id in this.items){
			if(getId == this.items[id].productId) {
				console.log("ProductId testing.............>>>>>>>>>>");
				console.log(this.items[id].productId);
				this.totalQty;
				this.totalPrice -= this.items[id].price;
				this.items[id].productprice -= this.items[id].price;
			}
		}
	}

};