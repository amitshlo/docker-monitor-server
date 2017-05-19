import * as express from 'express';
import {ContainerStatsBusinessLogic} from '../business-logic/container-stats';

export class ContainerStatsAPI {
    static init(app: express.Application) {
        app.get('/stats/getDataFromAllHosts', ContainerStatsAPI.getDataFromAllHosts);
    }

    static async getDataFromAllHosts(req: express.Request, res: express.Response): Promise<any> {
        let data = await ContainerStatsBusinessLogic.getDataFromAllHosts();
        res.send(data);
    }
}

