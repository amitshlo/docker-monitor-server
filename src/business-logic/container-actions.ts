import * as request from 'request';

export class ContainerActionsBusinessLogic {

    static doAction(action, host, id):Promise<Object> {
        return new Promise((resolve:any, reject:any) => {
            request.post({url: `http://${host}/containers/${id}/${action}`, json: true}, (err, _, res) => {
                if (err) {
                    // TODO - Use error!
                    console.log('error');
                } else {
                    resolve(res);
                }
            })
        });
    }
}
