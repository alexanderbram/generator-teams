import * as Express from 'express';
import * as http from 'http';
import * as path from 'path';
import * as morgan from 'morgan';
import { MsTeamsApiRouter, MsTeamsPageRouter } from 'express-msteams-host';
import * as allComponents from './TeamsAppsComponents';

// Initialize dotenv, to use .env file settings if existing
require('dotenv').config();

// Create the Express webserver
let express = Express();
let port = process.env.port || process.env.PORT || 3007;

// Inject the raw request body onto the request object
express.use(Express.json({
    verify: (req, res, buf: Buffer, encoding: string):void => {
        (<any>req).rawBody = buf.toString();
    }
}));
express.use(Express.urlencoded({ extended: true }));

 // Express configuration
express.set('view engine', 'ejs');  
express.set('views', path.join(__dirname, '/'));

// Add simple logging
express.use(morgan('tiny'));

// Add /scripts and /assets as static folders
express.use('/scripts', Express.static(path.join(__dirname, 'web/scripts')));
express.use('/assets', Express.static(path.join(__dirname, 'web/assets')));


// routing for bots, connectors and incoming web hooks - based on the decorators
// For more information see: TODO
express.use(MsTeamsApiRouter(allComponents));

// routing for pages for tabs and connector configuration
// For more information see: TODO
express.use(MsTeamsPageRouter({
    root: path.join(__dirname, 'web/')
}));

// Fallback
express.use(function (req: any, res: any, next: any) {
    res.removeHeader("Content-Security-Policy")
    res.removeHeader("X-Frame-Options"); // IE11
    return next();
});

// Set default web page
express.use('/', Express.static(path.join(__dirname, 'web/'), {
    index: 'index.html'
}));

// Set the port
express.set('port', port);

// Start the webserver
http.createServer(express).listen(port, (err: any) => {
    if (err) {
        return console.error(err);
    }
    console.log(`Server running on ${port}`);

})
