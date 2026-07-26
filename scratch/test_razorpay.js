const Razorpay = require('razorpay');
console.log('Razorpay type:', typeof Razorpay);
console.log('Razorpay keys:', Object.keys(Razorpay));
console.log('Razorpay prototype:', Object.getOwnPropertyNames(Razorpay.prototype || {}));
