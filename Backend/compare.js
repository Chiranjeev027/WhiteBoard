const http = require('http');

const server = http.createServer((req, res) => {
   if(req.url === '/'){
        res.write('hello world');
        res.end();
   }else if(req.url === '/home'){
        res.write('welcome to home page');
        res.end();
   }else if(req.url === '/about'){
    res.write('welcome to about page');
    res.end();
   }else{
        res.write('page Not Found');
        res.end();
   }   
});

server.listen(3030, () => {
    console.log("server is listening on Port 3030");
}); 