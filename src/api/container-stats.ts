import * as express from 'express';
import {ContainerStatsBusinessLogic} from '../business-logic/container-stats';

export class ContainerStatsAPI {
    static init(app:express.Application) {
        app.get('/stats/getDataFromAllHosts', ContainerStatsAPI.getDataFromAllHosts);
    }

    static getDataFromAllHosts(req:express.Request, res:express.Response):void {
        ContainerStatsBusinessLogic.getDataFromAllHosts()
            .then((data) => {
                    res.send(JSON.stringify(data));
                }
            ).catch((error) => {
                console.log(error);
            }
        );
    }
}

