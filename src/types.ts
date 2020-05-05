export interface APIresponse {
    code: 200|400|403|401|429;
    message?: string;
}

export interface getBot {
    code: 200|429;
    data?: Bot[];
    totalPage?: number;
    currentPage?: number;
    message?: string;
}

export interface getByID {
    code: 200|429;
    data?: BotDetail;
    message?: string
}

export interface Bot {
    id: string;
    name: string;
    servers: number;
    votes: number;
    intro: string;
    avatar: string;
    url: string;
    category: Category[];
    tag: string;
    state: "ok"|"archived"|"private"
}

export interface BotDetail {
    id: string;
    date: number;
    owners: User[]
    name: string;
    prefix: string;
    servers: number;
    votes: number;
    intro: string;
    desc: string;
    web: string;
    git: string;
    avatar: string;
    url: string;
    status: "online"|"offline"|"idle"|"dnd"|"streaming";
    verified: 0|1;
    trusted: 0|1;
    discord: string;
    category: Category[];
    tag: string;
    state: "ok"|"archived"|"private"
}

export interface User {
    id: string;
    username: string;
    tag: string;
    avatar: string;
    bots: string[]
}
export enum Category {
    '관리',
    '뮤직',
    '전적',
    '웹 대시보드',
     '로깅',
    '도박',
    '게임',
    '밈',
    '레벨링',
    '유틸리티',
    '번역',
    '대화',
    'NSFW',
    '검색'
}

export enum Librarys {
    'discord.js',
    'Eris',
    'discord.py',
    'discordcr',
    'Nyxx',
    'Discord.Net',
    'DSharpPlus',
    'Nostrum',
    'coxir',
    'DiscordGo',
    'Discord4J',
    'Javacord',
    'JDA',
    'Discordia',
    'RestCord',
    'Yasmin',
    'disco',
    'discordrb',
    'serenity',
    'SwiftDiscord',
    'Sword',
    '기타',
    '비공개'
}