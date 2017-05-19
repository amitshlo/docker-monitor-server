import * as request from 'request';
import {hosts} from '../assets/config';
let fetch = require('node-fetch');

export class ContainerStatsBusinessLogic {

    static getDataFromAllHosts(): Promise<HostData[]> {
        let hostsDataPromises: Promise<HostData>[] = hosts.map(host => ContainerStatsBusinessLogic.getAllContainersData(host));
        return Promise.all(hostsDataPromises);
    }

    static async getAllContainersData(host): Promise<HostData> {
        let containers = await fetch(`http://${host}/containers/json?all=1`).then(res => res.json());
        let data = await this.buildContainersData(containers, host);
        return {
            host: host,
            data: data
        };
    }

    private static async buildContainersData(containers, host): Promise<ContainerData[]> {
        let containerDataPromises: Promise<ContainerData>[] = containers.map(container => ContainerStatsBusinessLogic.buildContainerData(container, host));
        return Promise.all(containerDataPromises);
    }

    static async buildContainerData(container: any, host: string): Promise<ContainerData> {
        let stats = await ContainerStatsBusinessLogic.getContainerStats(container.Id, host);
        return {
            id: container.Id,
            name: container.Names[0],
            state: container.State,
            status: container.Status,
            stats: stats
        };
    }

    static async getContainerStats(id: string, host: string): Promise<ContainerUsageStats> {
        let data = await fetch(`http://${host}/containers/${id}/stats?stream=false`).then(res => res.json());
        return {
            memory: ContainerStatsBusinessLogic.calculateMemoryPercent(data.memory_stats),
            cpu: ContainerStatsBusinessLogic.calculateCpuPercent(data.precpu_stats, data.cpu_stats)
        }
    }

    private static calculateMemoryPercent(memory_stats: any): number {
        return (memory_stats.usage / memory_stats.limit) * 100;
    }

    private static calculateCpuPercent(precpu_stats: any, cpu_stats: any): number {
        let cpuDelta = cpu_stats.cpu_usage.total_usage - precpu_stats.cpu_usage.total_usage;
        let systemDelta = cpu_stats.system_cpu_usage - precpu_stats.system_cpu_usage;
        return (cpuDelta / systemDelta) * 100;
    }
}

interface ContainerUsageStats {
    memory: number;
    cpu: number;
}

interface ContainerData {
    id: string;
    name: string;
    state: string;
    status: string;
    stats: ContainerUsageStats;
}

interface HostData {
    host: string;
    data: ContainerData[];
}
