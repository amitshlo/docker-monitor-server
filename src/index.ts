import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import {ContainerStatsAPI} from './api/container-stats';
import {ContainerActionsAPI} from './api/container-actions';

// TODO - move to config
const APPLICATION_PORT = 1111;

const app:express.Application = express();
app.use(cors());
app.use(bodyParser.json());
ContainerStatsAPI.init(app);
ContainerActionsAPI.init(app);
app.listen(APPLICATION_PORT, () => {
 console.log(`App is running on port ${APPLICATION_PORT}. Have Fun!`);
});


