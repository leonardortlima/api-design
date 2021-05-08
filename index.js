const express = require('express');
const app = express();

app.use(express.json());

let orders = Array.from({length: 1000}, (v,k) => { 
    return {
        'id': k + 1,
        'title': 'Hello ' + k
    };
});
 
let orderServices = [
    {
        'id': 1,
        'order_id': 1,
        'title': 'Troca de pneu'
    },
    {
        'id': 2,
        'order_id': 1,
        'title': 'Troca de calotas'
    },
];

app.get('/orders', (req, res) => {
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    let startIndex = (page - 1) * limit;
    let slice = orders.sort((a,b) => a.id - b.id)
            .slice(startIndex, startIndex + limit);

    let count = orders.length;

    let response = {
        _metadata: {
            pagination: {
                page,
                limit,
                count,
            }
        },
        data: slice
    };

    res.set('Pagination-Count', count)
        .set('Pagination-Page', page)
        .set('Pagination-Limit', limit)
        .send(response);
});

app.post('/orders', (req, res) => {
    let newOrder = req.body;
    newOrder.id = orders.length + 1;
    orders.push(newOrder);
    res.status(201)
        .header('Location', '/orders/' + newOrder.id)
        .send(newOrder);
});
 
app.get('/orders/:id', (req, res) => {
    let order = orders.find(order => order.id == req.params.id); 
    if (!order) {
        res.status(404).send({
            error: 'entity not found',
        });
        return;
    }
    res.send(order);
});
 
app.put('/orders/:id', (req, res) => {
    const order = orders.find(p => p.id == req.params.id); 
    if (!order) {
        res.status(404).send(); 
        return;
    }

    order.description = req.body.description; 
    res.status(200).send(order);
});
 
app.get('/orders/:id/services', (req, res) => {
    let order = orders.find(order => order.id == req.params.id); 
    if (!order) {
        res.status(404).send();
        return; 
    }
    let services = orderServices.filter(service => service.order_id == req.params.id);
    res.status(200).send(services); 
});
 
app.put('/orders/:id/services', (req, res) => {
    let length = orderServices.length + 1;
    orderServices = orderServices.filter(service => service.order_id != req.params.id); 
    let newServices = req.body;
    for (const service of newServices) {
        service.id = ++length; 
    }
    orderServices.push(...newServices);
    res.status(200).send(); 
});
 
app.delete('/orders/:id', (req, res) => {
    let order = orders.find(order => order.id == req.params.id); 
    if (!order) {
        res.status(404).send();
        return; 
    }
    orders = orders.filter(order => order.id != req.params.id);
    res.status(204).send(); 
});
 
let tasks = [];

app.post('/quotes', (req, res) => { 
    let task = {
        id: tasks.length + 1,
        status: 'InProgress'
    };
    tasks.push(task);
    setTimeout(() => {
        if (task.status == 'InProgress') {
            task.status = 'Finished';
        }
    }, 600000);
    res.status(202)
        .set('Location', '/quotes/status/' + task.id)
        .send();
});

app.get('/quotes/status/:id', (req, res) => {
    let task = tasks.find(t => t.id == req.params.id); 
    if (!task) {
        res.status(404).send();
        return; 
    }
    res.send({
        status: task.status, 
        link: {
            rel: 'cancel',
            method: 'delete',
            href: 'quotes/status/' + task.id
        }
    });
});

app.delete('/quotes/status/:id', (req, res) => {
    let task = tasks.find(t => t.id == req.params.id); 
    if (!task) {
        res.status(404).send();
        return; 
    }
    if (task.status == 'Finished') {
        res.status(406).send();
        return;
    }

    task.status = 'Cancelled';
    res.status(200).send();
});

app.listen(3000, () => console.log('Listening on port 3000'));