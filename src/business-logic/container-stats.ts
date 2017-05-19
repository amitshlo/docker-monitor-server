import * as request from 'request';
import {hosts} from '../assets/config';

export class ContainerStatsBusinessLogic {

    static getDataFromAllHosts():Promise<Object> {
        return new Promise((resolve:any, reject:any) => {
            let hostsDataArr: Promise<Object>[] = [];
            for (let host of hosts) {
                hostsDataArr.push(ContainerStatsBusinessLogic.getAllContainersData(host));
            }
            resolve(Promise.all(hostsDataArr));
        });
    }

    static getAllContainersData(host):Promise<Object> {
        return new Promise((resolve:any, reject:any) => {
            request.get({url: `http://${host}/containers/json?all=1`, json: true}, (err, _, containers) => {
                if (err) {
                    // TODO - Use error!
                    console.log('error');
                } else {
                    let containersPro:Promise<Object>[] = [];
                    for (let container of containers) {
                        containersPro.push(ContainerStatsBusinessLogic.buildContainerData(container, host));
                    }
                    Promise.all(containersPro).then((data) => {
                       resolve({
                           host: host,
                           data: data
                       });
                    });
                }
            })
        });
    }

    static buildContainerData(container:any, host:string):Promise<Object> {
        return new Promise((resolve:any, reject:any) => {
            ContainerStatsBusinessLogic.getContainerStats(container.Id, host).then((stats) => {
                resolve({
                    id: container.Id,
                    name: container.Names[0],
                    state: container.State,
                    stats: stats
                })
            });
        });
    }

    static getContainerStats(id:string, host:string):Promise<Object> {
        return new Promise((resolve:any, reject:any) => {
            request.get({url: `http://${host}/containers/${id}/stats?stream=false`, json: true}, (err, _, data) => {
                if (err) {
                    // TODO - Use error!
                    console.log('error');
                } else {
                    resolve(ContainerStatsBusinessLogic.convertStatsToUsefulData(data));
                }
            })
        });
    }

    private static convertStatsToUsefulData(data:any):Object {
        return {
            memoryPercent: ContainerStatsBusinessLogic.calculateMemoryPercent(data.memory_stats),
            cpuPercent: ContainerStatsBusinessLogic.calculateCpuPercent(data.precpu_stats, data.cpu_stats)
        }
    }

    private static calculateMemoryPercent(memory_stats:any):number {
        return (memory_stats.usage/memory_stats.limit)*100;
    }

    private static calculateCpuPercent(precpu_stats:any, cpu_stats:any):number {
        let cpuDelta = cpu_stats.cpu_usage.total_usage - precpu_stats.cpu_usage.total_usage;
        let systemDelta = cpu_stats.system_cpu_usage - precpu_stats.system_cpu_usage
        return (cpuDelta/systemDelta)*100;
    }
}
