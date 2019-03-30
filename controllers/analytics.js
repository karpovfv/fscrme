const moment = require('moment');
const Order = require('../models/Order');
const errorHandler = require('../utils/errorHandler');

module.exports.overview = async function (req, res) {
    try {
        const allOrders = await Order.find({user: req.user.id}).sort({date: 1});
        const ordersMap = getOrdersMap(allOrders);
        const yesterdayOrders = ordersMap[moment().add(-1, 'd').format('DD.MM.YYYY')] || [];

        // orders count
        const totalOrdersNumber = allOrders.length;

        // yesterday orders count
        const yesterdayOrdersNumber = yesterdayOrders.length;

        // days count
        const daysNumber = Object.keys(ordersMap).length;

        // orders per day
        const ordersPerDay = (totalOrdersNumber / daysNumber).toFixed(0);

        // percent of orders count
        // ((yesterday orders / orders per day) - 1) * 100
        const ordersPercent = (((yesterdayOrdersNumber / ordersPerDay) - 1) * 100).toFixed(2);

        // total earning
        const totalGain = calculatePrice(allOrders);

        // earning per day
        const gainPerDay = totalGain / daysNumber;

        // yesterday earning
        const yesterdayGain = calculatePrice(yesterdayOrders);

        // percent earning
        const gainPercent = (((yesterdayGain / gainPerDay) - 1) * 100).toFixed(2);

        // compare earnings
        const compareGain = (yesterdayGain - gainPerDay).toFixed(2);

        // compare orders count
        const compareNumber = (yesterdayOrdersNumber - ordersPerDay).toFixed(2);

        res.status(200).json({
            gain: {
                percent: Math.abs(+gainPercent),
                compare: Math.abs(+compareGain),
                yesterday: +yesterdayGain,
                isHigher: +gainPercent > 0
            },
            orders: {
                percent: Math.abs(+ordersPercent),
                compare: Math.abs(+compareNumber),
                yesterday: +yesterdayOrdersNumber,
                isHigher: +ordersPercent > 0
            },
        });
    } catch (e) {
        errorHandler(res, e)
    }
};

module.exports.analytics = async function (req, res) {
    try {
        const allOrders = await Order.find({user: req.user.id}).sort({date: 1});
        const ordersMap = getOrdersMap(allOrders);
        const average = +(calculatePrice(allOrders) / Object.keys(ordersMap).length).toFixed(2);
        const chart = Object.keys(ordersMap).map(label => {
            // label == 05.05.2019
            const gain = calculatePrice(ordersMap[label]);
            const order = ordersMap[label].length;
            return {
                label,
                order,
                gain,
            }
        });
        res.status(200).json({average, chart});
    } catch (e) {
        errorHandler(res, e);
    }
};

function getOrdersMap(orders = []) {
    const daysOrders = {};
    orders.forEach(order => {
        const date = moment(order.date).format('DD.MM.YYYY');
        if (date === moment().format('DD.MM.YYYY')) {
            return;
        }
        if (!daysOrders[date]) {
            daysOrders[date] = []
        }
        daysOrders[date].push(order);
    });
    return daysOrders;
}

function calculatePrice(orders = []) {
    return orders.reduce((total, order) => {
        const orderPrice = order.list.reduce((orderTotal, item) => {
            return orderTotal += item.cost * item.quantity;
        }, 0);
        return total += orderPrice;
    }, 0)
}