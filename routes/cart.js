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
/*	this.removeItem = function() {
		
	}*/

};